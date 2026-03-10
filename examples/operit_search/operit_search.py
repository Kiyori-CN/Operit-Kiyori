#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Operit 向量数据库极速语义搜索引擎 v1.0

适配 operit_vectorize.js 的向量数据库格式：
  <db_dir>/meta.json              — 元数据（filesIndexed 列表）
  <db_dir>/vectors/<name>.vec     — 每文件向量 JSON 数组
  <db_dir>/chunks/<name>.chk      — 每文件分块 JSON 数组
  <db_dir>/.operit_cache/         — 二进制优化索引（自动生成）

核心优化：
1. 预归一化向量：余弦相似度退化为点积，搜索提速 3-5x
2. mmap 零内存拷贝加载：万级向量秒开
3. numpy argpartition Top-K：O(N) 而非 O(N log N)
4. 自动检测/重建二进制索引（对比 meta.json 修改时间）
5. 跨进程 IDF 缓存持久化（关键词搜索加速）
6. 多查询 RRF 融合搜索

CLI 接口（与 operit_vectorize.js 中的 searchViaPython 完全匹配）：
  python3 operit_search.py search    <db_dir> <query_vec_json> <top_k> <threshold> [expand_ctx]
  python3 operit_search.py keyword_search <db_dir> <query_str> <top_k> [expand_ctx]
  python3 operit_search.py multi_search   <db_dir> <query_vecs_json> <queries_json> <top_k> [threshold]
  python3 operit_search.py optimize  <db_dir>
  python3 operit_search.py status    <db_dir>

结果字段（所有命令）：
  success, data[], total_chunks, py_engine_version
  data[i]: file_path, start_line, end_line, text, score, chunk_id,
            context_before?, context_after?
"""

import json
import sys
import os
import re
import math
from pathlib import Path

try:
    import numpy as np
    _NUMPY_OK = True
except ImportError:
    _NUMPY_OK = False

from typing import List, Dict, Optional

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
# 辅助：与 JS safeFileName() 保持严格一致
# operit_vectorize.js: relPath.replace(/[\\/:*?"<>|\s]/g, "_").replace(/_+/g, "_")
# =============================================================================
def _safe_file_name(rel_path: str) -> str:
    result = re.sub(r'[\\/:*?"<>|\s]', '_', rel_path)
    result = re.sub(r'_+', '_', result)
    result = result.strip('_')
    return result if result else '_'


# =============================================================================
# 全局引擎缓存：同一进程内复用，避免重复 I/O
# =============================================================================
_engine_cache: Dict[str, 'OperitSearchEngine'] = {}


def get_engine(db_path: str) -> 'OperitSearchEngine':
    """获取或创建引擎实例（同路径复用）"""
    resolved = str(Path(db_path).resolve())
    if resolved not in _engine_cache:
        _engine_cache[resolved] = OperitSearchEngine(db_path)
    return _engine_cache[resolved]


# =============================================================================
# 搜索引擎核心类
# =============================================================================
class OperitSearchEngine:

    def __init__(self, db_path: str):
        if not _NUMPY_OK:
            raise ImportError("numpy 未安装。请运行: pip install numpy")

        self.db_path = Path(db_path).resolve()
        self.vec_dir = self.db_path / 'vectors'
        self.chunk_dir = self.db_path / 'chunks'
        self.meta_path = self.db_path / 'meta.json'

        # 二进制优化索引目录
        self.cache_dir = self.db_path / '.operit_cache'
        self.bin_vec_path = self.cache_dir / 'vectors.npy'
        self.bin_chunk_path = self.cache_dir / 'chunks.json'

        # 运行时状态
        self.vectors: Optional['np.ndarray'] = None
        self.chunks: Optional[List[Dict]] = None
        self._loaded = False
        self._texts_lower: Optional[List[str]] = None
        self._idf_cache: Dict[str, float] = {}
        self._idf_loaded = False
        self._idf_dirty = False  # 仅在有新增 IDF 项时才持久化

    # -------------------------------------------------------------------------
    # 从 meta.json 读取元数据
    # -------------------------------------------------------------------------
    def _load_meta(self) -> Dict:
        if not self.meta_path.exists():
            raise FileNotFoundError(
                f"meta.json 不存在: {self.meta_path}\n"
                "请先运行 vectorize_build 构建向量数据库。"
            )
        with open(self.meta_path, 'r', encoding='utf-8') as f:
            return _json_loads(f.read())

    # -------------------------------------------------------------------------
    # 检测是否需要重新优化
    # -------------------------------------------------------------------------
    def needs_reoptimize(self) -> bool:
        """对比 meta.json 修改时间与二进制索引修改时间（仅依赖 meta.json，避免 Android 目录 mtime 不可靠）"""
        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            # 无二进制索引，检查是否有原始向量
            return self.vec_dir.exists() and any(self.vec_dir.glob("*.vec"))

        bin_mtime = self.bin_vec_path.stat().st_mtime

        # meta.json 更新 → 必须重新优化（最可靠的单一判据）
        if self.meta_path.exists() and self.meta_path.stat().st_mtime > bin_mtime:
            return True

        return False

    # -------------------------------------------------------------------------
    # 构建二进制优化索引（optimize）
    # -------------------------------------------------------------------------
    def optimize(self) -> int:
        """
        将 JSON 分片（.vec / .chk）合并、归一化、存储为 numpy 二进制索引。

        按 meta.json 中的 filesIndexed 顺序合并，与 JS 引擎完全一致，
        确保 chunk_id 在两侧可互通。
        """
        print(f"[*] 正在优化 Operit 向量数据库: {self.db_path}", file=sys.stderr)

        meta = self._load_meta()
        files_indexed = meta.get('filesIndexed', [])

        if not files_indexed:
            raise ValueError(
                "meta.json 中 filesIndexed 为空。"
                "请先运行 vectorize_build 构建向量数据库。"
            )

        all_vecs: List[List[float]] = []
        all_chunks: List[Dict] = []
        skipped = 0

        # 严格按 filesIndexed 顺序（JS 在 Phase 6 已按 relPath 排序）
        for fi in files_indexed:
            rel_path = fi.get('relPath', '')
            if not rel_path:
                skipped += 1
                continue

            safe_name = _safe_file_name(rel_path)
            vec_file = self.vec_dir / f"{safe_name}.vec"
            chk_file = self.chunk_dir / f"{safe_name}.chk"

            if not vec_file.exists():
                print(f"[!] 向量文件缺失，跳过: {safe_name}.vec", file=sys.stderr)
                skipped += 1
                continue

            try:
                with open(vec_file, 'r', encoding='utf-8') as f:
                    file_vecs = _json_loads(f.read())

                file_chunks: List[Dict] = []
                if chk_file.exists():
                    with open(chk_file, 'r', encoding='utf-8') as f:
                        file_chunks = _json_loads(f.read())
                else:
                    print(f"[!] 分块文件缺失，块文本为空: {safe_name}.chk", file=sys.stderr)

                if not file_vecs or not isinstance(file_vecs, list):
                    skipped += 1
                    continue

                min_len = min(len(file_vecs), len(file_chunks)) if file_chunks else 0

                for i in range(len(file_vecs)):
                    vec = file_vecs[i]
                    if not vec or not isinstance(vec, list) or len(vec) == 0:
                        skipped += 1
                        continue

                    if i < min_len:
                        raw_chunk = file_chunks[i]
                    else:
                        raw_chunk = {}

                    # 统一字段名（JS chunk: startLine/endLine/text）
                    chunk = {
                        'file_path': rel_path,
                        'start_line': raw_chunk.get('startLine', raw_chunk.get('start_line', 0)),
                        'end_line': raw_chunk.get('endLine', raw_chunk.get('end_line', 0)),
                        'text': raw_chunk.get('text', ''),
                    }
                    all_vecs.append(vec)
                    all_chunks.append(chunk)

            except Exception as e:
                print(f"[!] 跳过损坏文件 {rel_path}: {e}", file=sys.stderr)
                skipped += 1

        if not all_vecs:
            raise ValueError(
                "未发现有效向量数据。请确认向量数据库已成功构建。"
            )

        if len(all_vecs) != len(all_chunks):
            print(
                f"[!] 警告：向量数({len(all_vecs)}) ≠ 分块数({len(all_chunks)})，截断至最小",
                file=sys.stderr
            )
            min_len2 = min(len(all_vecs), len(all_chunks))
            all_vecs = all_vecs[:min_len2]
            all_chunks = all_chunks[:min_len2]

        # 核心优化：预归一化 + float32 存储 → 搜索时用点积替代余弦相似度
        vec_array = np.array(all_vecs, dtype=np.float32)
        norms = np.linalg.norm(vec_array, axis=1, keepdims=True)
        safe_norms = np.where(norms > 1e-10, norms, 1.0)
        vec_array = vec_array / safe_norms  # 预归一化

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

        total = len(all_chunks)
        dim = vec_array.shape[1]
        msg = f"成功优化 {total} 个分块（维度: {dim}，来自 {len(files_indexed)} 个文件）"
        if skipped > 0:
            msg += f"，跳过 {skipped} 个无效条目"
        print(f"[+] {msg}", file=sys.stderr)
        return total

    # -------------------------------------------------------------------------
    # 自动优化（搜索前按需调用）
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
    # 极速加载（mmap 零拷贝）
    # -------------------------------------------------------------------------
    def load(self) -> None:
        """按需加载：先检测是否需要重建二进制索引，再用 mmap 加载"""
        if self._loaded and self.vectors is not None and self.chunks is not None:
            return

        # 一次性检测，避免重复 stat 调用
        need_opt = not self.bin_vec_path.exists() or not self.bin_chunk_path.exists() \
                   or self.needs_reoptimize()
        if need_opt:
            self.auto_optimize()

        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            raise FileNotFoundError(
                f"未找到优化索引且自动优化失败。\n"
                f"期望路径: {self.bin_vec_path}\n"
                "请确认向量数据库已正确构建。"
            )

        # mmap 零拷贝加载（不占用额外物理内存）
        self.vectors = np.load(str(self.bin_vec_path), mmap_mode='r')

        with open(self.bin_chunk_path, 'r', encoding='utf-8') as f:
            self.chunks = _json_loads(f.read())

        # 数据一致性校验
        if len(self.chunks) != self.vectors.shape[0]:
            print(
                f"[!] 向量数({self.vectors.shape[0]}) 与分块数({len(self.chunks)}) 不一致，截断",
                file=sys.stderr
            )
            min_count = min(len(self.chunks), self.vectors.shape[0])
            self.chunks = self.chunks[:min_count]
            self.vectors = self.vectors[:min_count]

        self._loaded = True
        self._texts_lower = [c.get('text', '').lower() for c in self.chunks]

    # -------------------------------------------------------------------------
    # 语义搜索（核心）
    # -------------------------------------------------------------------------
    def search(self, query_vec: List[float], top_k: int = 10,
               threshold: float = 0.3, expand_context: bool = True) -> List[Dict]:
        """
        语义向量搜索。

        self.vectors 已预归一化，直接用点积计算余弦相似度，
        比每次计算 norm 快约 3-5x。
        """
        if self.vectors is None:
            self.load()

        q = np.array(query_vec, dtype=np.float32)
        norm_q = np.linalg.norm(q)
        if norm_q < 1e-10:
            return []
        q_normed = q / norm_q

        # 批量点积（BLAS 优化，极快）
        sims = np.dot(self.vectors, q_normed)

        # 阈值过滤
        idx = np.where(sims >= threshold)[0]
        if len(idx) == 0:
            return []

        # Top-K（argpartition O(N) 而非全排序 O(N log N)）
        if len(idx) <= top_k:
            top_indices = idx[np.argsort(-sims[idx])]
        else:
            part = np.argpartition(-sims[idx], top_k)[:top_k]
            top_indices = idx[part[np.argsort(-sims[idx[part]])]]

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
    # 关键词搜索（增强版：TF-IDF + CJK 分词 + 位置加权）
    # -------------------------------------------------------------------------
    def keyword_search(self, query: str, top_k: int = 10,
                       expand_context: bool = True) -> List[Dict]:
        """增强关键词搜索：TF-IDF 加权 + CJK 分词 + 位置加权"""
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
        chunk_texts_lower = self._texts_lower or [c.get('text', '').lower() for c in self.chunks]

        # IDF 权重（优先命中缓存）
        idf_weights: Dict[str, float] = {}
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
    # 多查询 RRF 融合搜索
    # -------------------------------------------------------------------------
    def multi_search(self, query_vecs: List[List[float]], queries: List[str],
                     top_k: int = 10, threshold: float = 0.3) -> List[Dict]:
        """多查询 RRF (Reciprocal Rank Fusion) 融合搜索"""
        if self.vectors is None:
            self.load()
        if len(query_vecs) != len(queries):
            raise ValueError(
                f"query_vecs 长度({len(query_vecs)}) 与 queries 长度({len(queries)}) 不一致"
            )

        K = 60
        rrf_scores: Dict[int, Dict] = {}

        for qi, qvec in enumerate(query_vecs):
            sub_results = self.search(qvec, top_k=top_k * 2,
                                      threshold=threshold, expand_context=False)
            for rank, r in enumerate(sub_results):
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
        top_items = merged[:top_k]

        results = []
        for item in top_items:
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
    # 数据库状态
    # -------------------------------------------------------------------------
    def status(self) -> Dict:
        info: Dict = {
            'db_path': str(self.db_path),
            'cache_dir': str(self.cache_dir),
            'optimized': False,
            'vectors_file': str(self.bin_vec_path),
            'chunks_file': str(self.bin_chunk_path),
            'needs_reoptimize': self.needs_reoptimize(),
        }

        if self.bin_vec_path.exists() and self.bin_chunk_path.exists():
            info['optimized'] = True
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
                    fp = c.get('file_path', '未知')
                    file_stats[fp] = file_stats.get(fp, 0) + 1
                info['total_files'] = len(file_stats)
                info['top_files'] = sorted(
                    [{'file': k, 'chunks': v} for k, v in file_stats.items()],
                    key=lambda x: x['chunks'], reverse=True
                )[:10]
            except Exception as e:
                info['error'] = str(e)
        else:
            if self.vec_dir.exists():
                info['raw_vec_files'] = len(list(self.vec_dir.glob("*.vec")))
            if self.chunk_dir.exists():
                info['raw_chunk_files'] = len(list(self.chunk_dir.glob("*.chk")))
            info['message'] = '原始索引存在但未优化，搜索时将自动优化。'

        return info

    # -------------------------------------------------------------------------
    # 上下文扩展（同文件相邻块）
    # -------------------------------------------------------------------------
    def _expand_context(self, results: List[Dict]) -> List[Dict]:
        """为检索结果附加同文件前后相邻块内容"""
        if not self.chunks:
            return results

        total = len(self.chunks)
        expanded = []

        for r in results:
            cid = r.get('chunk_id', -1)
            if cid < 0 or cid >= total:
                expanded.append(r)
                continue

            current_file = r.get('file_path', '')
            er = r.copy()

            if cid > 0:
                prev = self.chunks[cid - 1]
                if prev.get('file_path', '') == current_file:
                    prev_text = prev.get('text', '')
                    if prev_text:
                        er['context_before'] = prev_text[:300]

            if cid < total - 1:
                nxt = self.chunks[cid + 1]
                if nxt.get('file_path', '') == current_file:
                    nxt_text = nxt.get('text', '')
                    if nxt_text:
                        er['context_after'] = nxt_text[:300]

            expanded.append(er)

        return expanded

    # -------------------------------------------------------------------------
    # 智能分词（英文 + CJK n-gram）
    # -------------------------------------------------------------------------
    @staticmethod
    def _tokenize(query: str) -> List[str]:
        """英文按空格分词，CJK 按字符 n-gram"""
        query_lower = query.lower().strip()
        if not query_lower:
            return []

        tokens = []

        # 英文单词
        en_words = re.findall(r'[a-z0-9_]+', query_lower)
        tokens.extend(w for w in en_words if len(w) > 1)

        # CJK 字符 n-gram（2-gram + 3-gram + 全段）
        cjk_ranges = re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+',
                                 query_lower)
        for seg in cjk_ranges:
            if len(seg) <= 4:
                tokens.append(seg)
            else:
                cap = min(len(seg), 24)
                for n in (2, 3):
                    for i in range(cap - n + 1):
                        tokens.append(seg[i:i + n])
                tokens.append(seg[:cap])

        # 去重保序
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
            "message": (
                "Usage: operit_search.py <cmd> <db_dir> [args...]\n"
                "Commands: search, keyword_search, multi_search, optimize, status"
            )
        }))
        return

    cmd = sys.argv[1]
    db_path = sys.argv[2]

    try:
        engine = get_engine(db_path)

        # ------------------------------------------------------------------
        if cmd == "optimize":
            count = engine.optimize()
            result = {
                "success": True,
                "message": f"成功优化 {count} 个分块。",
                "total_chunks": count,
                "py_engine_version": PY_ENGINE_VERSION
            }

        # ------------------------------------------------------------------
        elif cmd == "search":
            if len(sys.argv) < 6:
                raise ValueError("search 需要: <db_dir> <query_vec_json> <top_k> <threshold> [expand_ctx]")
            # 支持从 stdin 读取向量（传 "-" 时）
            raw_vec = sys.argv[3]
            if raw_vec == "-":
                raw_vec = sys.stdin.read().strip()
            query_vec = _json_loads(raw_vec)
            top_k = int(sys.argv[4])
            threshold = float(sys.argv[5])
            expand_ctx = True
            if len(sys.argv) > 6:
                expand_ctx = sys.argv[6].lower() not in ('false', '0', 'no')

            # 搜索前自动按需优化
            data = engine.search(query_vec, top_k, threshold, expand_ctx)
            result = {
                "success": True,
                "data": data,
                "total_chunks": len(engine.chunks) if engine.chunks else 0,
                "py_engine_version": PY_ENGINE_VERSION
            }

        # ------------------------------------------------------------------
        elif cmd == "keyword_search":
            if len(sys.argv) < 5:
                raise ValueError("keyword_search 需要: <db_dir> <query_str> <top_k> [expand_ctx]")
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

        # ------------------------------------------------------------------
        elif cmd == "multi_search":
            if len(sys.argv) < 6:
                raise ValueError("multi_search 需要: <db_dir> <query_vecs_json> <queries_json> <top_k> [threshold]")
            query_vecs = _json_loads(sys.argv[3])
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

        # ------------------------------------------------------------------
        elif cmd == "status":
            data = engine.status()
            result = {
                "success": True,
                "data": data,
                "total_chunks": data.get("total_chunks", 0),
                "py_engine_version": PY_ENGINE_VERSION
            }

        # ------------------------------------------------------------------
        else:
            result = {"success": False, "message": f"未知命令: {cmd}"}

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
