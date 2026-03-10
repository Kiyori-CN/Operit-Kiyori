#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IKBS 极速知识库搜索引擎 v1.0

适配 ikbs_search.js 的知识库缓存格式：
  <kb_path>/.ikbs_cache/vectors/<hash>.vec  — 每文件向量 JSON 数组
  <kb_path>/.ikbs_cache/chunks/<hash>.chk   — 每文件分块 JSON 数组
  <kb_path>/.ikbs_cache/meta.json           — 元数据
  <kb_path>/.ikbs_cache/vectors.npy         — 二进制优化索引（自动生成）
  <kb_path>/.ikbs_cache/optimized_chunks.json — 优化后的分块索引

核心优化：
1. 预归一化向量：余弦相似度退化为点积，搜索提速 3-5x
2. mmap 零内存拷贝加载：万级向量秒开
3. numpy argpartition Top-K：O(N) 而非 O(N log N)
4. 自动检测/重建二进制索引（对比 meta.json 修改时间）
5. 跨进程 IDF 缓存持久化（关键词搜索加速）
6. 多查询 RRF 融合搜索
7. CJK + 日文假名 + 韩文 n-gram 分词

CLI 接口（与 ikbs_search.js 的 runPyEngine 完全匹配）：
  python3 ikbs_search.py search         <kb_path> <query_vec_json|-> <top_k> <threshold> [expand_ctx]
  python3 ikbs_search.py keyword_search <kb_path> <query_str> <top_k> [expand_ctx]
  python3 ikbs_search.py multi_search   <kb_path> <query_vecs_json|-> <queries_json> <top_k> [threshold]
  python3 ikbs_search.py optimize       <kb_path>
  python3 ikbs_search.py status         <kb_path>

注：参数传 "-" 时从 stdin 读取（用于大向量 JSON 避免命令行长度限制）。
"""

import json
import sys
import os
import re
import math
from pathlib import Path
from typing import List, Dict, Optional, Tuple

try:
    import numpy as np
    _NUMPY_OK = True
except ImportError:
    _NUMPY_OK = False

PY_ENGINE_VERSION = "1.0"

# 可选：orjson 比标准 json 快 3-5x（有则用，无则降级）
try:
    import orjson as _json_lib
    def _json_loads(s): return _json_lib.loads(s)
    def _json_dumps(obj): return _json_lib.dumps(obj).decode('utf-8')
except ImportError:
    def _json_loads(s): return json.loads(s)
    def _json_dumps(obj): return json.dumps(obj, ensure_ascii=False)

# =============================================================================
# 全局引擎缓存：同一进程内复用，避免重复 I/O
# =============================================================================
_engine_cache: Dict[str, 'ExtremeSearchEngine'] = {}


def get_engine(kb_path: str) -> 'ExtremeSearchEngine':
    """获取或创建引擎实例（同路径复用）"""
    resolved = str(Path(kb_path).resolve())
    if resolved not in _engine_cache:
        _engine_cache[resolved] = ExtremeSearchEngine(kb_path)
    return _engine_cache[resolved]


class ExtremeSearchEngine:
    """IKBS 极端性能搜索引擎核心类"""

    def __init__(self, kb_path: str):
        if not _NUMPY_OK:
            raise ImportError("numpy 未安装。请运行: pip install numpy")

        self.kb_path = Path(kb_path).resolve()
        self.cache_dir = self.kb_path / '.ikbs_cache'
        self.bin_vec_path = self.cache_dir / 'vectors.npy'
        self.bin_chunk_path = self.cache_dir / 'optimized_chunks.json'

        self.vectors: Optional[np.ndarray] = None
        self.chunks: Optional[List[Dict]] = None
        self._loaded = False
        self._texts_lower: Optional[List[str]] = None
        self._idf_cache: Dict[str, float] = {}
        self._idf_loaded = False
        self._idf_dirty = False

    # -------------------------------------------------------------------------
    # 索引优化（重建）
    # -------------------------------------------------------------------------
    def optimize(self) -> int:
        """将 JSON 碎片重建为归一化的二进制索引"""
        print(f"[*] 正在优化知识库: {self.kb_path}", file=sys.stderr)

        if not self.cache_dir.exists():
            raise ValueError(f"知识库缓存目录不存在: {self.cache_dir}\n请先使用 build 命令构建知识库。")

        vec_dir = self.cache_dir / 'vectors'
        chunk_dir = self.cache_dir / 'chunks'

        vec_files = sorted(vec_dir.glob("*.vec")) if vec_dir.exists() else []
        if not vec_files:
            raise ValueError("未找到任何向量文件。请先构建知识库。")

        all_vecs: List[List[float]] = []
        all_chunks: List[Dict] = []
        skipped = 0

        # 第一步：收集所有文件数据，以原始文件名为 key 分组
        file_data: Dict[str, Tuple[List, List]] = {}
        for v_file in vec_files:
            try:
                with open(v_file, 'r', encoding='utf-8') as f:
                    file_vecs = _json_loads(f.read())
                if not file_vecs:
                    continue

                safe_name = v_file.stem
                c_file = chunk_dir / f"{safe_name}.chk"
                file_chunks: List[Dict] = []
                if c_file.exists():
                    with open(c_file, 'r', encoding='utf-8') as f:
                        file_chunks = _json_loads(f.read())
                else:
                    print(f"[!] 警告：分块文件缺失 {safe_name}.chk，对应块将无文本", file=sys.stderr)

                # 从分块数据中读取原始文件名，作为排序 key
                orig_name = file_chunks[0].get('fileName', safe_name) if file_chunks else safe_name
                file_data[orig_name] = (file_vecs, file_chunks)
            except Exception as e:
                print(f"[!] 跳过损坏文件 {v_file.name}: {e}", file=sys.stderr)
                skipped += 1

        # 第二步：按原始文件名字母序排列，与 JS 的 fileNames.sort() 严格一致
        # 这是保证 chunk_id 在 Python 引擎与 JS 引擎之间互通的关键
        for orig_name in sorted(file_data.keys()):
            file_vecs, file_chunks = file_data[orig_name]
            for i, vec in enumerate(file_vecs):
                if not vec or not isinstance(vec, list) or len(vec) == 0:
                    skipped += 1
                    continue
                if i >= len(file_chunks):
                    skipped += 1
                    continue
                all_vecs.append(vec)
                chunk_info = dict(file_chunks[i])
                if not chunk_info.get('fileName'):
                    chunk_info['fileName'] = orig_name
                if not chunk_info.get('text'):
                    chunk_info['text'] = ''
                all_chunks.append(chunk_info)

        if not all_vecs:
            raise ValueError("未发现有效向量数据。请确认知识库已成功构建。")

        if len(all_vecs) != len(all_chunks):
            print(f"[!] 警告：向量数({len(all_vecs)}) ≠ 分块数({len(all_chunks)})，截断至最小以保证对齐",
                  file=sys.stderr)
            min_len = min(len(all_vecs), len(all_chunks))
            all_vecs = all_vecs[:min_len]
            all_chunks = all_chunks[:min_len]

        # 核心优化：预归一化 + float32 存储
        vec_array = np.array(all_vecs, dtype=np.float32)
        norms = np.linalg.norm(vec_array, axis=1, keepdims=True)
        safe_norms = np.where(norms > 1e-10, norms, 1.0)
        vec_array = vec_array / safe_norms

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        np.save(str(self.bin_vec_path), vec_array)
        with open(self.bin_chunk_path, 'w', encoding='utf-8') as f:
            f.write(_json_dumps(all_chunks))

        # 清除过期 IDF 缓存文件（语料已变更，旧 IDF 值不再有效）
        _idf_path = self.cache_dir / 'idf_cache.json'
        if _idf_path.exists():
            try:
                _idf_path.unlink()
            except Exception:
                pass

        # 重置内存状态
        self.vectors = None
        self.chunks = None
        self._loaded = False
        self._texts_lower = None
        self._idf_cache = {}
        self._idf_loaded = False
        self._idf_dirty = False

        msg = f"成功优化 {len(all_chunks)} 个分块（维度: {vec_array.shape[1]}）"
        if skipped > 0:
            msg += f"，跳过 {skipped} 个无效条目"
        print(f"[+] {msg}", file=sys.stderr)
        return len(all_chunks)

    # -------------------------------------------------------------------------
    # 检测是否需要重新优化
    # -------------------------------------------------------------------------
    def needs_reoptimize(self) -> bool:
        """检测原始索引是否比二进制索引更新，需要重新优化"""
        if not self.cache_dir.exists():
            return False

        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            # 无二进制索引，检查是否有原始索引可优化
            vec_dir = self.cache_dir / 'vectors'
            return vec_dir.exists() and len(list(vec_dir.glob("*.vec"))) > 0

        bin_mtime = self.bin_vec_path.stat().st_mtime

        # 检查 meta.json 的修改时间
        meta_path = self.cache_dir / 'meta.json'
        if meta_path.exists() and meta_path.stat().st_mtime > bin_mtime:
            return True

        # 检查向量碎片目录的修改时间（先用目录 mtime 快速判断，避免逐文件 stat）
        vec_dir = self.cache_dir / 'vectors'
        if vec_dir.exists():
            try:
                if vec_dir.stat().st_mtime > bin_mtime:
                    return True
            except OSError:
                for v_file in vec_dir.glob("*.vec"):
                    if v_file.stat().st_mtime > bin_mtime:
                        return True

        return False

    # -------------------------------------------------------------------------
    # 自动优化（构建后自动调用或搜索前按需调用）
    # -------------------------------------------------------------------------
    def auto_optimize(self) -> bool:
        """如果需要优化则自动执行，返回是否执行了优化"""
        if self.needs_reoptimize():
            try:
                self.optimize()
                return True
            except Exception as e:
                print(f"[!] 自动优化失败: {e}", file=sys.stderr)
                return False
        return False

    # -------------------------------------------------------------------------
    # 数据加载
    # -------------------------------------------------------------------------
    def load(self) -> None:
        """极速加载模式：使用 mmap 零拷贝加载，按需自动优化"""
        if self._loaded and self.vectors is not None and self.chunks is not None:
            return

        if not self.cache_dir.exists():
            raise FileNotFoundError(
                f"知识库缓存目录不存在: {self.cache_dir}\n"
                "请先使用 build 命令构建知识库。"
            )

        # 按需自动优化
        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists() or self.needs_reoptimize():
            self.auto_optimize()

        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            raise FileNotFoundError(
                "未发现优化索引且自动优化失败。请确认知识库已构建。\n"
                f"期望路径: {self.bin_vec_path}"
            )

        self.vectors = np.load(str(self.bin_vec_path), mmap_mode='r')
        with open(self.bin_chunk_path, 'r', encoding='utf-8') as f:
            self.chunks = _json_loads(f.read())

        # 校验数据一致性
        if len(self.chunks) != self.vectors.shape[0]:
            print(f"[!] 警告：向量数 ({self.vectors.shape[0]}) 与分块数 ({len(self.chunks)}) 不一致",
                  file=sys.stderr)
            min_count = min(len(self.chunks), self.vectors.shape[0])
            self.chunks = self.chunks[:min_count]
            self.vectors = self.vectors[:min_count]

        self._loaded = True
        self._texts_lower = [c.get('text', '').lower() for c in self.chunks]

    # -------------------------------------------------------------------------
    # 重新加载（用于构建后刷新）
    # -------------------------------------------------------------------------
    def reload(self) -> None:
        """强制重新加载索引（构建后调用）"""
        self.vectors = None
        self.chunks = None
        self._texts_lower = None
        self._idf_cache = {}
        self._loaded = False
        self.load()

    # -------------------------------------------------------------------------
    # 语义搜索
    # -------------------------------------------------------------------------
    def search(self, query_vec: List[float], top_k: int = 5,
               threshold: float = 0.3, expand_context: bool = True) -> List[Dict]:
        """语义搜索，支持上下文扩展"""
        if self.vectors is None:
            self.load()

        q = np.array(query_vec, dtype=np.float32)
        norm_q = np.linalg.norm(q)
        if norm_q < 1e-10:
            return []
        q_normed = q / norm_q

        # 由于 self.vectors 已预归一化，点积即余弦相似度
        sims = np.dot(self.vectors, q_normed)

        # 阈值过滤
        idx = np.where(sims >= threshold)[0]
        if len(idx) == 0:
            return []

        # 取 Top-K
        if len(idx) <= top_k:
            top_indices = idx[np.argsort(-sims[idx])]
        else:
            partition_idx = np.argpartition(-sims[idx], top_k)[:top_k]
            top_indices = idx[partition_idx[np.argsort(-sims[idx[partition_idx]])]]

        results = []
        for i in top_indices:
            c = self.chunks[i].copy()
            c['score'] = round(float(sims[i]), 4)
            c['chunk_id'] = int(i)
            results.append(c)

        if expand_context and results:
            results = self._expand_context(results)

        return results

    # -------------------------------------------------------------------------
    # 关键词搜索（增强版）
    # -------------------------------------------------------------------------
    def keyword_search(self, query: str, top_k: int = 5,
                       expand_context: bool = True) -> List[Dict]:
        """增强关键词搜索：支持 CJK 分词、TF-IDF 加权、位置加权"""
        if self.chunks is None:
            self.load()

        # 懒加载持久化 IDF 缓存（只在首次关键词搜索时读一次磁盘）
        if not self._idf_loaded:
            _idf_disk = self.cache_dir / 'idf_cache.json'
            if _idf_disk.exists():
                try:
                    with open(_idf_disk, 'r', encoding='utf-8') as f:
                        self._idf_cache = _json_loads(f.read())
                except Exception:
                    pass
            self._idf_loaded = True

        q_parts = self._tokenize(query)
        if not q_parts:
            return []

        total_chunks = len(self.chunks)
        # 计算 IDF 权重
        idf_weights = {}
        chunk_texts_lower = self._texts_lower if self._texts_lower is not None else [c.get('text', '').lower() for c in self.chunks]
        for part in q_parts:
            if part not in self._idf_cache:
                doc_count = sum(1 for t in chunk_texts_lower if part in t)
                self._idf_cache[part] = math.log((total_chunks + 1) / (doc_count + 1)) + 1
                self._idf_dirty = True
            idf_weights[part] = self._idf_cache[part]

        scored = []
        for i, (c, text) in enumerate(zip(self.chunks, chunk_texts_lower)):
            if not text:
                continue

            score = 0.0
            match_count = 0

            for part in q_parts:
                count = text.count(part)
                if count > 0:
                    match_count += 1
                    tf = 1 + math.log(count)
                    score += tf * idf_weights.get(part, 1) * len(part)

                    first_pos = text.find(part)
                    if first_pos >= 0:
                        pos_boost = max(0, 1.0 - first_pos / max(len(text), 1))
                        score += pos_boost * 0.5

            if match_count > 0:
                coverage = match_count / len(q_parts)
                score *= (1 + coverage * 0.5)

                cc = c.copy()
                cc['score'] = round(score, 2)
                cc['chunk_id'] = i
                scored.append(cc)

        scored.sort(key=lambda x: x['score'], reverse=True)
        results = scored[:top_k]

        if expand_context and results:
            results = self._expand_context(results)

        # 仅在有新增 IDF 项时才持久化（避免无意义磁盘写入）
        if self._idf_dirty:
            try:
                self.cache_dir.mkdir(parents=True, exist_ok=True)
                with open(self.cache_dir / 'idf_cache.json', 'w', encoding='utf-8') as f:
                    f.write(_json_dumps(self._idf_cache))
                self._idf_dirty = False
            except Exception:
                pass

        return results

    # -------------------------------------------------------------------------
    # 多查询融合搜索 (RRF)
    # -------------------------------------------------------------------------
    def multi_search(self, query_vecs: List[List[float]], queries: List[str],
                     top_k: int = 8, threshold: float = 0.3) -> List[Dict]:
        """多查询 RRF 融合搜索"""
        if self.vectors is None:
            self.load()
        if len(query_vecs) != len(queries):
            raise ValueError(f"query_vecs 长度 ({len(query_vecs)}) 与 queries 长度 ({len(queries)}) 不一致")

        K = 60
        rrf_scores: Dict[int, Dict] = {}

        for qi, qvec in enumerate(query_vecs):
            results = self.search(qvec, top_k=top_k * 2, threshold=threshold,
                                  expand_context=False)
            for rank, r in enumerate(results):
                cid = r['chunk_id']
                if cid not in rrf_scores:

                    rrf_scores[cid] = {
                        'chunk_id': cid,
                        'rrf': 0.0,
                        'hits': 0,
                        'best_score': 0.0
                    }
                rrf_scores[cid]['rrf'] += 1.0 / (K + rank + 1)
                rrf_scores[cid]['hits'] += 1
                rrf_scores[cid]['best_score'] = max(
                    rrf_scores[cid]['best_score'], r['score']
                )


        if not rrf_scores:
            return []

        merged = sorted(rrf_scores.values(), key=lambda x: x['rrf'], reverse=True)
        top_results = merged[:top_k]

        results = []
        for item in top_results:
            cid = item['chunk_id']
            c = self.chunks[cid].copy()
            c['chunk_id'] = cid
            c['score'] = round(item['best_score'], 4)
            c['rrf_score'] = round(item['rrf'], 4)
            c['hit_count'] = item['hits']
            c['total_queries'] = len(query_vecs)
            results.append(c)

        if results:
            results = self._expand_context(results)

        return results

    # -------------------------------------------------------------------------
    # 知识库状态
    # -------------------------------------------------------------------------
    def status(self) -> Dict:
        """获取知识库优化索引状态"""
        info: Dict = {
            'kb_path': str(self.kb_path),
            'cache_dir': str(self.cache_dir),
            'optimized': False,
            'vectors_file': str(self.bin_vec_path),
            'chunks_file': str(self.bin_chunk_path),
        }

        if not self.cache_dir.exists():
            info['message'] = '知识库缓存目录不存在。请先构建知识库。'
            info['needs_reoptimize'] = False
            return info

        if self.bin_vec_path.exists() and self.bin_chunk_path.exists():
            info['optimized'] = True
            info['needs_reoptimize'] = self.needs_reoptimize()
            try:
                vecs = np.load(str(self.bin_vec_path), mmap_mode='r')
                info['total_chunks'] = int(vecs.shape[0])
                info['vector_dim'] = int(vecs.shape[1])
                info['vectors_size_mb'] = round(
                    os.path.getsize(self.bin_vec_path) / (1024 * 1024), 2
                )

                with open(self.bin_chunk_path, 'r', encoding='utf-8') as f:
                    chunks = _json_loads(f.read())
                info['chunks_count'] = len(chunks)

                file_stats: Dict[str, int] = {}
                for c in chunks:
                    fn = c.get('fileName', '未知')
                    file_stats[fn] = file_stats.get(fn, 0) + 1
                info['files'] = [{'name': k, 'chunks': v}
                                 for k, v in sorted(file_stats.items())]
                info['total_files'] = len(file_stats)
            except Exception as e:
                info['error'] = str(e)
        else:
            vec_dir = self.cache_dir / 'vectors'
            chunk_dir = self.cache_dir / 'chunks'
            if vec_dir.exists():
                info['raw_vec_files'] = len(list(vec_dir.glob("*.vec")))
            if chunk_dir.exists():
                info['raw_chunk_files'] = len(list(chunk_dir.glob("*.chk")))
            info['message'] = '原始索引存在但未优化。将在搜索时自动优化。'
            info['needs_reoptimize'] = self.needs_reoptimize()

        return info

    # -------------------------------------------------------------------------
    # 上下文扩展
    # -------------------------------------------------------------------------
    def _expand_context(self, results: List[Dict]) -> List[Dict]:
        """为检索结果附加前后文上下文"""
        if not self.chunks:
            return results

        total = len(self.chunks)
        expanded = []

        for r in results:
            cid = r.get('chunk_id', -1)
            if cid < 0 or cid >= total:
                expanded.append(r)
                continue

            current_file = r.get('fileName', '')
            er = r.copy()

            if cid > 0:
                prev = self.chunks[cid - 1]
                if prev.get('fileName', '') == current_file:
                    prev_text = prev.get('text', '')
                    if prev_text:
                        er['context_before'] = prev_text[:200]

            if cid < total - 1:
                nxt = self.chunks[cid + 1]
                if nxt.get('fileName', '') == current_file:
                    nxt_text = nxt.get('text', '')
                    if nxt_text:
                        er['context_after'] = nxt_text[:200]

            expanded.append(er)

        return expanded

    # -------------------------------------------------------------------------
    # 分词工具
    # -------------------------------------------------------------------------
    @staticmethod
    def _tokenize(query: str) -> List[str]:
        """智能分词：英文按空格分词，中文按字符 n-gram"""
        query_lower = query.lower().strip()
        if not query_lower:
            return []

        tokens = []

        en_words = re.findall(r'[a-z0-9_]+', query_lower)
        tokens.extend(w for w in en_words if len(w) > 1)

        cjk_ranges = re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+', query_lower)
        for seg in cjk_ranges:
            if len(seg) <= 4:
                tokens.append(seg)
            else:
                cap = min(len(seg), 20)
                for n in (2, 3):
                    for i in range(cap - n + 1):
                        tokens.append(seg[i:i + n])
                tokens.append(seg[:cap])

        seen = set()
        unique = []
        for t in tokens:
            if t not in seen:
                seen.add(t)
                unique.append(t)

        return unique if unique else query_lower.split()


# =============================================================================
# CLI 入口
# =============================================================================
def main():
    if len(sys.argv) < 3:
        print(_json_dumps({
            "success": False,
            "message": "Usage: <cmd> <path> [args...]\n"
                       "Commands: optimize, search, keyword_search, multi_search, status",
            "py_engine_version": PY_ENGINE_VERSION
        }))
        return

    cmd, path = sys.argv[1], sys.argv[2]

    try:
        engine = get_engine(path)

        if cmd == "optimize":
            count = engine.optimize()
            result = {
                "success": True,
                "message": f"成功优化 {count} 个分块。",
                "total_chunks": count,
                "py_engine_version": PY_ENGINE_VERSION
            }

        elif cmd == "search":
            if len(sys.argv) < 6:
                raise ValueError("search 需要参数: <query_vec_json> <top_k> <threshold> [expand_context]")
            raw_vec = sys.argv[3]
            if raw_vec == "-":
                raw_vec = sys.stdin.read().strip()
            query_vec = _json_loads(raw_vec)
            top_k = int(sys.argv[4])
            threshold = float(sys.argv[5])
            expand_ctx = True
            if len(sys.argv) > 6:
                expand_ctx = sys.argv[6].lower() not in ('false', '0', 'no')
            # 搜索前自动检测并优化
            data = engine.search(query_vec, top_k, threshold, expand_ctx)
            result = {
                "success": True,
                "data": data,
                "total_chunks": len(engine.chunks) if engine.chunks else 0,
                "py_engine_version": PY_ENGINE_VERSION
            }

        elif cmd == "keyword_search":
            if len(sys.argv) < 5:
                raise ValueError("keyword_search 需要参数: <query> <top_k> [expand_context]")
            query_str = sys.argv[3]
            top_k = int(sys.argv[4])
            expand_ctx = True
            if len(sys.argv) > 5:
                expand_ctx = sys.argv[5].lower() not in ('false', '0', 'no')
            data = engine.keyword_search(query_str, top_k, expand_ctx)
            result = {
                "success": True,
                "data": data,
                "total_chunks": len(engine.chunks) if engine.chunks else 0,
                "py_engine_version": PY_ENGINE_VERSION
            }

        elif cmd == "multi_search":
            if len(sys.argv) < 6:
                raise ValueError("multi_search 需要参数: <query_vecs_json> <queries_json> <top_k> [threshold=0.3]")
            raw_vecs = sys.argv[3]
            if raw_vecs == "-":
                raw_vecs = sys.stdin.read().strip()
            query_vecs = _json_loads(raw_vecs)
            queries = _json_loads(sys.argv[4])
            top_k = int(sys.argv[5])
            threshold = float(sys.argv[6]) if len(sys.argv) > 6 else 0.3
            data = engine.multi_search(query_vecs, queries, top_k, threshold)
            result = {
                "success": True,
                "data": data,
                "total_chunks": len(engine.chunks) if engine.chunks else 0,
                "py_engine_version": PY_ENGINE_VERSION
            }

        elif cmd == "status":
            data = engine.status()
            result = {
                "success": True,
                "data": data,
                "total_chunks": data.get("total_chunks", 0),
                "py_engine_version": PY_ENGINE_VERSION
            }

        else:
            result = {
                "success": False,
                "message": f"未知命令: {cmd}",
                "py_engine_version": PY_ENGINE_VERSION
            }

    except Exception as e:
        result = {
            "success": False,
            "message": str(e),
            "py_engine_version": PY_ENGINE_VERSION
        }

    # 先刷新 stderr，再独立行输出 JSON（防止粘连）
    sys.stderr.flush()
    print(_json_dumps(result), flush=True)


if __name__ == "__main__":
    main()
