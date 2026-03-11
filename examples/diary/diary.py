#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日记本搜索引擎 v1.0 (diary.py)

适配 diary.js 的日记向量缓存格式：
  <diary_root>/.diary/vectors/<hash>.vec   — 每文件向量 JSON 数组
  <diary_root>/.diary/chunks/<hash>.chk    — 每文件分块 JSON 数组
  <diary_root>/.diary/meta.json            — 元数据
  <diary_root>/.diary/vectors.npy          — 二进制优化索引（自动生成）
  <diary_root>/.diary/optimized_chunks.json — 优化后的分块索引

日记 ID 格式：YYYYMMDDHHmmss（14 位纯数字，精确到秒）

核心优化：
1. 预归一化向量：余弦相似度退化为点积，搜索提速 3-5x
2. mmap 零内存拷贝加载：千级日记秒开
3. numpy argpartition Top-K：O(N) 而非 O(N log N)
4. 自动检测/重建二进制索引（对比 meta.json 修改时间）
5. CJK + 日文假名 + 韩文 n-gram 分词（关键词搜索）
6. 按月份过滤支持
7. 大参数文件传递支持（@filepath 语法）

调用架构：diary.js 通过持久化终端会话（diary_engine）复用同一终端执行所有命令，
避免终端窗口堆积。每次 CLI 调用仍为独立 Python 进程；进程内引擎缓存 _engine_cache
在同一次调用中生效（optimize 后即可 search，无需重建）。

CLI 接口：
  python3 diary.py optimize       <diary_root>
  python3 diary.py search         <diary_root> <query_vec_json|@file> <top_k> <threshold> [month]
  python3 diary.py keyword_search <diary_root> <query_str> <top_k> [month]
  python3 diary.py status         <diary_root>
  python3 diary.py clean          <diary_root>
"""

import json
import sys
import os
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Set

try:
    import numpy as np
    _NUMPY_OK = True
except ImportError:
    _NUMPY_OK = False

PY_ENGINE_VERSION = "1.0"

# 可选：orjson 比标准 json 快 3-5x
try:
    import orjson as _orjson
    def _json_loads(s):
        return _orjson.loads(s.encode('utf-8') if isinstance(s, str) else s)
    def _json_dumps(obj):
        return _orjson.dumps(obj).decode('utf-8')
except ImportError:
    def _json_loads(s):
        return json.loads(s)
    def _json_dumps(obj):
        return json.dumps(obj, ensure_ascii=False)


def read_arg(arg: str) -> str:
    """读取参数值：如果以 @ 开头则从文件读取内容"""
    if arg.startswith('@'):
        filepath = arg[1:].strip("'\"")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception as e:
            print(f"[!] 无法读取参数文件 {filepath}: {e}", file=sys.stderr)
            return arg
    return arg


class DiarySearchEngine:
    """日记极速搜索引擎核心类"""

    CACHE_DIR_NAME = '.diary'

    def __init__(self, diary_root: str):
        if not _NUMPY_OK:
            raise ImportError("numpy 未安装。请运行: pip install numpy")

        self.diary_root = Path(diary_root).resolve()
        self.cache_dir = self.diary_root / self.CACHE_DIR_NAME
        self.bin_vec_path = self.cache_dir / 'vectors.npy'
        self.bin_chunk_path = self.cache_dir / 'optimized_chunks.json'

        self.vectors: Optional['np.ndarray'] = None
        self.chunks: Optional[List[Dict]] = None
        self._chunks_loaded = False
        self._vectors_loaded = False
        self._texts_lower: Optional[List[str]] = None

    # -------------------------------------------------------------------------
    # 索引优化（重建二进制索引）
    # -------------------------------------------------------------------------
    def optimize(self) -> int:
        """将 JSON 碎片重建为归一化的二进制索引"""
        print(f"[*] 正在优化日记索引: {self.diary_root}", file=sys.stderr)

        if not self.cache_dir.exists():
            raise ValueError(f"日记缓存目录不存在: {self.cache_dir}")

        vec_dir = self.cache_dir / 'vectors'
        chunk_dir = self.cache_dir / 'chunks'

        vec_files = sorted(vec_dir.glob("*.vec")) if vec_dir.exists() else []
        if not vec_files:
            # 所有日记已删除：清理二进制索引
            if self.bin_vec_path.exists():
                self.bin_vec_path.unlink()
            if self.bin_chunk_path.exists():
                self.bin_chunk_path.unlink()
            self.vectors = None
            self.chunks = None
            self._chunks_loaded = False
            self._vectors_loaded = False
            self._texts_lower = None
            return 0

        all_vecs: List[List[float]] = []
        all_chunks: List[Dict] = []
        skipped = 0

        # 收集所有文件数据，按文件名排序保证 chunk_id 一致
        file_data: Dict[str, Tuple[List, List]] = {}
        for v_file in vec_files:
            try:
                raw = v_file.read_text(encoding='utf-8').strip()
                if not raw:
                    skipped += 1
                    continue
                file_vecs = _json_loads(raw)
                if not file_vecs:
                    skipped += 1
                    continue

                stem = v_file.stem
                c_file = chunk_dir / f"{stem}.chk"
                file_chunks: List[Dict] = []
                if c_file.exists():
                    chunk_raw = c_file.read_text(encoding='utf-8').strip()
                    if chunk_raw:
                        file_chunks = _json_loads(chunk_raw)
                else:
                    print(f"[!] 分块文件缺失 {stem}.chk", file=sys.stderr)

                orig_name = file_chunks[0].get('fileName', stem) if file_chunks else stem
                file_data[orig_name] = (file_vecs, file_chunks)
            except Exception as e:
                print(f"[!] 跳过损坏文件 {v_file.name}: {e}", file=sys.stderr)
                skipped += 1

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
                chunk_info.setdefault('text', '')
                all_chunks.append(chunk_info)

        if not all_vecs:
            # 所有向量无效：清理二进制索引
            if self.bin_vec_path.exists():
                self.bin_vec_path.unlink()
            if self.bin_chunk_path.exists():
                self.bin_chunk_path.unlink()
            self.vectors = None
            self.chunks = None
            self._chunks_loaded = False
            self._vectors_loaded = False
            self._texts_lower = None
            return 0

        # 对齐长度
        min_len = min(len(all_vecs), len(all_chunks))
        all_vecs = all_vecs[:min_len]
        all_chunks = all_chunks[:min_len]

        # 检查向量维度一致性
        dim = len(all_vecs[0])
        valid_vecs, valid_chunks = [], []
        for i, vec in enumerate(all_vecs):
            if len(vec) == dim:
                valid_vecs.append(vec)
                valid_chunks.append(all_chunks[i])
            else:
                skipped += 1

        if not valid_vecs:
            if self.bin_vec_path.exists():
                self.bin_vec_path.unlink()
            if self.bin_chunk_path.exists():
                self.bin_chunk_path.unlink()
            self.vectors = None
            self.chunks = None
            self._chunks_loaded = False
            self._vectors_loaded = False
            self._texts_lower = None
            return 0

        # 预归一化 + float32 存储（余弦相似度 → 点积）
        vec_array = np.array(valid_vecs, dtype=np.float32)
        norms = np.linalg.norm(vec_array, axis=1, keepdims=True)
        safe_norms = np.where(norms > 1e-10, norms, 1.0)
        vec_array = vec_array / safe_norms

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        np.save(str(self.bin_vec_path), vec_array)
        self.bin_chunk_path.write_text(_json_dumps(valid_chunks), encoding='utf-8')

        # 重置内存缓存
        self.vectors = None
        self.chunks = None
        self._chunks_loaded = False
        self._vectors_loaded = False
        self._texts_lower = None

        msg = f"成功优化 {len(valid_chunks)} 个分块（维度: {vec_array.shape[1]}）"
        if skipped > 0:
            msg += f"，跳过 {skipped} 个无效条目"
        print(f"[+] {msg}", file=sys.stderr)
        return len(valid_chunks)

    # -------------------------------------------------------------------------
    # 自动检测是否需要重新优化
    # -------------------------------------------------------------------------
    def needs_reoptimize(self) -> bool:
        if not self.cache_dir.exists():
            return False
        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            vec_dir = self.cache_dir / 'vectors'
            return vec_dir.exists() and len(list(vec_dir.glob("*.vec"))) > 0

        try:
            bin_mtime = self.bin_vec_path.stat().st_mtime
        except OSError:
            return True

        # 检查 meta.json 是否更新
        meta_path = self.cache_dir / 'meta.json'
        if meta_path.exists():
            try:
                if meta_path.stat().st_mtime > bin_mtime:
                    return True
            except OSError:
                pass

        # 检查 fingerprints.json 是否更新（删除操作会修改指纹）
        fp_path = self.cache_dir / 'fingerprints.json'
        if fp_path.exists():
            try:
                if fp_path.stat().st_mtime > bin_mtime:
                    return True
            except OSError:
                pass

        # 检查向量文件数量是否与二进制索引一致（检测删除/新增）
        vec_dir = self.cache_dir / 'vectors'
        if vec_dir.exists():
            try:
                vec_count = len(list(vec_dir.glob("*.vec")))
                bin_chunks = _json_loads(self.bin_chunk_path.read_text(encoding='utf-8'))
                bin_files = set(c.get('fileName', '') for c in bin_chunks)
                if vec_count != len(bin_files):
                    return True
            except Exception:
                pass

        # 检查是否有新的向量文件
        if vec_dir.exists():
            try:
                for vf in vec_dir.glob("*.vec"):
                    if vf.stat().st_mtime > bin_mtime:
                        return True
            except OSError:
                pass

        return False

    # -------------------------------------------------------------------------
    # 加载索引到内存（mmap 懒加载）
    # -------------------------------------------------------------------------
    def _ensure_loaded_chunks(self):
        """仅加载 chunks（关键词搜索不需要向量矩阵）"""
        if self._chunks_loaded:
            return
        # 优先从二进制索引加载
        if self.bin_chunk_path.exists():
            if self.needs_reoptimize():
                try:
                    self.optimize()
                except Exception:
                    pass
            if self.bin_chunk_path.exists():
                raw_chunks = self.bin_chunk_path.read_text(encoding='utf-8')
                self.chunks = _json_loads(raw_chunks)
                if self.bin_vec_path.exists():
                    self.vectors = np.load(str(self.bin_vec_path), mmap_mode='r')
                    if len(self.chunks) != self.vectors.shape[0]:
                        min_len = min(len(self.chunks), self.vectors.shape[0])
                        self.chunks = self.chunks[:min_len]
                    self._vectors_loaded = True
                self._chunks_loaded = True
                self._texts_lower = None
                return
        # 降级：从原始 chunk 文件加载
        chunk_dir = self.cache_dir / 'chunks'
        if chunk_dir.exists():
            all_chunks: List[Dict] = []
            for cf in sorted(chunk_dir.glob("*.chk")):
                try:
                    raw = cf.read_text(encoding='utf-8').strip()
                    if raw:
                        all_chunks.extend(_json_loads(raw))
                except Exception:
                    continue
            if all_chunks:
                self.chunks = all_chunks
                self._chunks_loaded = True
                self._texts_lower = None
                return
        self.chunks = []
        self._chunks_loaded = True
        self._texts_lower = None

    def _ensure_loaded(self):
        if self._chunks_loaded and self._vectors_loaded:
            return

        if self.needs_reoptimize():
            print("[*] 检测到索引变更，自动重新优化...", file=sys.stderr)
            count = self.optimize()
            if count == 0:
                # 所有日记已删除，设置空状态
                self.vectors = None
                self.chunks = []
                self._chunks_loaded = True
                self._vectors_loaded = True
                self._texts_lower = None
                return

        if not self.bin_vec_path.exists() or not self.bin_chunk_path.exists():
            vec_dir = self.cache_dir / 'vectors'
            if vec_dir.exists() and len(list(vec_dir.glob("*.vec"))) > 0:
                count = self.optimize()
                if count == 0:
                    self.vectors = None
                    self.chunks = []
                    self._chunks_loaded = True
                    self._vectors_loaded = True
                    self._texts_lower = None
                    return
            else:
                raise ValueError("日记向量索引不存在。请先保存日记或运行 rebuild_index。")

        # mmap 零内存拷贝加载
        self.vectors = np.load(str(self.bin_vec_path), mmap_mode='r')
        raw_chunks = self.bin_chunk_path.read_text(encoding='utf-8')
        self.chunks = _json_loads(raw_chunks)

        # 对齐长度（容错）
        if len(self.chunks) != self.vectors.shape[0]:
            min_len = min(len(self.chunks), self.vectors.shape[0])
            self.chunks = self.chunks[:min_len]
            print(f"[!] 向量与分块数量不一致，已截断至 {min_len}", file=sys.stderr)

        self._chunks_loaded = True
        self._vectors_loaded = True
        self._texts_lower = None

    # -------------------------------------------------------------------------
    # 语义搜索
    # -------------------------------------------------------------------------
    def search(self, query_vec: List[float], top_k: int = 5,
               threshold: float = 0.2, month: Optional[str] = None) -> List[Dict]:
        self._ensure_loaded()
        if self.vectors is None or not self.chunks:
            return []

        q = np.array(query_vec, dtype=np.float32)
        norm = np.linalg.norm(q)
        if norm > 1e-10:
            q = q / norm

        n = min(len(self.chunks), self.vectors.shape[0])
        scores = self.vectors[:n].dot(q)

        # 月份过滤
        if month:
            mask = np.array([
                self.chunks[i].get('date', '').startswith(month) or
                self.chunks[i].get('fileName', '').startswith(month)
                for i in range(n)
            ], dtype=bool)
            scores = np.where(mask, scores, -1.0)

        # Top-K（argpartition O(N)）
        actual_k = min(top_k * 3, n)
        if actual_k >= n:
            top_indices = np.argsort(-scores)[:actual_k]
        else:
            part_idx = np.argpartition(-scores, actual_k)[:actual_k]
            sorted_sub = np.argsort(-scores[part_idx])
            top_indices = part_idx[sorted_sub]

        results = []
        seen_files: Set[str] = set()
        for idx in top_indices:
            idx = int(idx)
            s = float(scores[idx])
            if s < threshold:
                continue

            chunk = self.chunks[idx]
            fn = chunk.get('fileName', '')

            if fn in seen_files:
                continue
            seen_files.add(fn)

            results.append({
                'score': round(s, 4),
                'chunk_id': idx,
                'text': chunk.get('text', '')[:500],
                'id': chunk.get('id', ''),
                'fileName': fn,
                'date': chunk.get('date', ''),
                'title': chunk.get('title', ''),
                'tags': chunk.get('tags', []),
                'mood': chunk.get('mood', '')
            })

            if len(results) >= top_k:
                break

        return results

    # -------------------------------------------------------------------------
    # 关键词搜索
    # -------------------------------------------------------------------------
    def keyword_search(self, query: str, top_k: int = 5,
                       month: Optional[str] = None) -> List[Dict]:
        self._ensure_loaded_chunks()
        if not self.chunks:
            return []

        tokens = self._tokenize(query)
        if not tokens:
            return []

        # 构建文本缓存（懒加载）
        if self._texts_lower is None:
            self._texts_lower = [c.get('text', '').lower() for c in self.chunks]

        n = len(self.chunks)
        scores: List[Tuple[int, float]] = []

        for i in range(n):
            chunk = self.chunks[i]

            if month:
                if not (chunk.get('date', '').startswith(month) or
                        chunk.get('fileName', '').startswith(month)):
                    continue

            text_lower = self._texts_lower[i]
            if not text_lower:
                continue

            match_count = sum(1 for t in tokens if t in text_lower)
            if match_count > 0:
                scores.append((i, match_count / len(tokens)))

        scores.sort(key=lambda x: -x[1])

        results = []
        seen_files: Set[str] = set()
        for idx, score in scores[:top_k * 3]:
            chunk = self.chunks[idx]
            fn = chunk.get('fileName', '')
            if fn in seen_files:
                continue
            seen_files.add(fn)

            text = chunk.get('text', '')
            text_lower = self._texts_lower[idx]
            snippet = text[:300]
            for t in tokens:
                pos = text_lower.find(t)
                if pos >= 0:
                    start = max(0, pos - 50)
                    end = min(len(text), pos + len(t) + 150)
                    snippet = '...' + text[start:end].replace('\n', ' ') + '...'
                    break

            results.append({
                'score': round(score, 4),
                'chunk_id': idx,
                'text': snippet,
                'id': chunk.get('id', ''),
                'fileName': fn,
                'date': chunk.get('date', ''),
                'title': chunk.get('title', ''),
                'tags': chunk.get('tags', []),
                'mood': chunk.get('mood', '')
            })

            if len(results) >= top_k:
                break

        return results

    # -------------------------------------------------------------------------
    # 状态查询
    # -------------------------------------------------------------------------
    def status(self) -> Dict:
        info: Dict = {
            'diary_root': str(self.diary_root),
            'cache_dir': str(self.cache_dir),
            'cache_exists': self.cache_dir.exists(),
            'optimized': self.bin_vec_path.exists() and self.bin_chunk_path.exists(),
            'py_engine_version': PY_ENGINE_VERSION
        }

        if info['optimized']:
            info['needs_reoptimize'] = self.needs_reoptimize()
            try:
                vecs = np.load(str(self.bin_vec_path), mmap_mode='r')
                info['total_chunks'] = int(vecs.shape[0])
                info['vector_dim'] = int(vecs.shape[1])
                info['vectors_size_mb'] = round(
                    os.path.getsize(self.bin_vec_path) / (1024 * 1024), 2
                )
                chunks = _json_loads(self.bin_chunk_path.read_text(encoding='utf-8'))
                info['chunks_count'] = len(chunks)

                file_stats: Dict[str, int] = {}
                for c in chunks:
                    fn = c.get('fileName', '未知')
                    file_stats[fn] = file_stats.get(fn, 0) + 1
                info['files'] = [{'name': k, 'chunks': v} for k, v in sorted(file_stats.items())]
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
            info['needs_reoptimize'] = self.needs_reoptimize()

        return info

    # -------------------------------------------------------------------------
    # 分词工具（CJK n-gram）
    # -------------------------------------------------------------------------
    @staticmethod
    def _tokenize(query: str) -> List[str]:
        query_lower = query.lower().strip()
        if not query_lower:
            return []

        tokens = []

        # 英文/数字单词
        en_words = re.findall(r'[a-z0-9_]+', query_lower)
        tokens.extend(w for w in en_words if len(w) > 1)

        # CJK n-gram（中日韩）
        cjk_segs = re.findall(
            r'[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+',
            query_lower
        )
        for seg in cjk_segs:
            if len(seg) <= 4:
                tokens.append(seg)
            else:
                cap = min(len(seg), 20)
                for n in (2, 3):
                    for i in range(cap - n + 1):
                        tokens.append(seg[i:i + n])
                tokens.append(seg[:cap])

        # 去重保序
        seen: Set[str] = set()
        unique = []
        for t in tokens:
            if t not in seen:
                seen.add(t)
                unique.append(t)

        return unique if unique else query_lower.split()


# =============================================================================
# 全局引擎缓存（同进程内复用）
# =============================================================================
_engine_cache: Dict[str, DiarySearchEngine] = {}


def get_engine(diary_root: str) -> DiarySearchEngine:
    resolved = str(Path(diary_root).resolve())
    if resolved not in _engine_cache:
        _engine_cache[resolved] = DiarySearchEngine(diary_root)
    return _engine_cache[resolved]


# =============================================================================
# CLI 入口
# =============================================================================
def main():
    if len(sys.argv) < 3:
        print(_json_dumps({
            "success": False,
            "message": "Usage: <cmd> <diary_root> [args...]\nCommands: optimize, search, keyword_search, status, clean",
            "py_engine_version": PY_ENGINE_VERSION
        }))
        return

    cmd = sys.argv[1]
    diary_root = sys.argv[2]

    try:
        engine = get_engine(diary_root)

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
                raise ValueError("search 需要参数: <query_vec_json|@file> <top_k> <threshold> [month]")
            query_vec = _json_loads(read_arg(sys.argv[3]))
            top_k = int(sys.argv[4])
            threshold = float(sys.argv[5])
            month = sys.argv[6] if len(sys.argv) > 6 else None
            data = engine.search(query_vec, top_k, threshold, month)
            result = {
                "success": True,
                "data": data,
                "total_chunks": len(engine.chunks) if engine.chunks else 0,
                "py_engine_version": PY_ENGINE_VERSION
            }

        elif cmd == "keyword_search":
            if len(sys.argv) < 5:
                raise ValueError("keyword_search 需要参数: <query> <top_k> [month]")
            query_str = sys.argv[3]
            top_k = int(sys.argv[4])
            month = sys.argv[5] if len(sys.argv) > 5 else None
            data = engine.keyword_search(query_str, top_k, month)
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

        elif cmd == "clean":
            # 清理二进制索引（配合 diary.js force rebuild）
            removed = []
            if engine.bin_vec_path.exists():
                engine.bin_vec_path.unlink()
                removed.append('vectors.npy')
            if engine.bin_chunk_path.exists():
                engine.bin_chunk_path.unlink()
                removed.append('optimized_chunks.json')
            engine.vectors = None
            engine.chunks = None
            engine._chunks_loaded = False
            engine._vectors_loaded = False
            engine._texts_lower = None
            # 移除引擎缓存，确保下次调用完全重建
            resolved = str(Path(diary_root).resolve())
            _engine_cache.pop(resolved, None)
            result = {
                "success": True,
                "message": f"已清理: {', '.join(removed) if removed else '无需清理'}",
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

    sys.stderr.flush()
    # 确保 JSON 输出到 stdout，与 diary.js 的 stdout/stderr 分离方案配合
    print(_json_dumps(result), flush=True)


if __name__ == "__main__":
    main()
