/* METADATA
{
        "name": "ikbs_search",
    "version": "1.0",
    "display_name": {
        "zh": "IKBS 智能知识库",
        "en": "IKBS Knowledge Base Search"
    },
    "description": {
        "zh": "IKBS 智能知识库搜索工具包（Intelligent Knowledge Base Search）。将本地指定目录下的文档文件（txt/md/html/json/csv 等）自动构建为语义向量知识库，支持通过自然语言进行高精度语义检索。默认使用 Python 引擎（mmap 内存映射 + numpy 加速）进行极速搜索，不可用时自动降级为 JS 引擎。支持自动分块、按题号精准拆分题库、断点续建、增量更新、多文件格式解析、匹配度评分及上下文扩展。构建完成后自动生成 Python 引擎二进制索引（.npy），也可通过 rebuild_index 手动重建。多知识库并行管理，按路径自动隔离缓存。",
        "en": "Intelligent Knowledge Base Search toolkit. Builds semantic vector knowledge bases from local documents (txt/md/html/json/csv). Defaults to Python engine (mmap + numpy) for extreme search speed, auto-fallback to JS engine. Supports auto-chunking, per-question exam splitting, resumable building, incremental updates, multi-format parsing, relevance scoring, and context expansion. Auto-generates Python binary index (.npy) after build, or use rebuild_index manually. Multi-KB management with path-based cache isolation."
    },
    "category": "Admin",
    "enabledByDefault": true,
    "env": [
        {
            "name": "IKBS_API_KEY",
            "description": {
                "zh": "嵌入模型 API 密钥（硅基流动或兼容 OpenAI 接口的平台）。获取地址：https://siliconflow.cn",
                "en": "Embedding model API key (SiliconFlow or OpenAI-compatible). Get at: https://siliconflow.cn"
            },
            "required": true
        },
        {
            "name": "IKBS_BASE_URL",
            "description": {
                "zh": "嵌入模型 API 基础地址。默认：https://api.siliconflow.cn/v1",
                "en": "Embedding API base URL. Default: https://api.siliconflow.cn/v1"
            },
            "required": false
        },
        {
            "name": "IKBS_EMBED_MODEL",
            "description": {
                "zh": "嵌入模型名称。默认：BAAI/bge-m3",
                "en": "Embedding model name. Default: BAAI/bge-m3"
            },
            "required": false
        },
        {
            "name": "IKBS_SCRIPT_PATH",
            "description": {
                "zh": "Python 搜索引擎脚本路径。默认：/storage/emulated/0/Download/Operit/examples/ikbs_search/ikbs_search.py",
                "en": "Python search engine script path. Default: /storage/emulated/0/Download/Operit/examples/ikbs_search/ikbs_search.py"
            },
            "required": false
        },
        {
            "name": "IKBS_PYTHON_BIN",
            "description": {
                "zh": "Python 解释器路径。默认：python3",
                "en": "Python interpreter path. Default: python3"
            },
            "required": false
        },
        {
            "name": "IKBS_CHUNK_SIZE",
            "description": {
                "zh": "分块大小（字符数），默认 512",
                "en": "Chunk size in chars, default 512"
            },
            "required": false
        },
        {
            "name": "IKBS_CHUNK_OVERLAP",
            "description": {
                "zh": "分块重叠字符数，默认 64",
                "en": "Chunk overlap in chars, default 64"
            },
            "required": false
        },
        {
            "name": "IKBS_BATCH_SIZE",
            "description": {
                "zh": "每批发送给嵌入 API 的文本数量，默认 20",
                "en": "Texts per embedding API batch, default 20"
            },
            "required": false
        },
        {
            "name": "IKBS_CONCURRENCY",
            "description": {
                "zh": "并发嵌入请求数（1-4），默认 2",
                "en": "Concurrent embedding requests (1-4), default 2"
            },
            "required": false
        },
        {
            "name": "IKBS_MAX_FILE_SIZE_MB",
            "description": {
                "zh": "单文件最大处理大小（MB），超出跳过，默认 50",
                "en": "Max file size in MB, default 50"
            },
            "required": false
        },
        {
            "name": "IKBS_FORCE_PYTHON",
            "description": {
                "zh": "强制使用 Python 引擎，禁用 JS 降级（true/false），默认 false",
                "en": "Force Python engine, disable JS fallback, default false"
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "tools": [
        {
            "name": "search",
            "description": {
                "zh": "语义搜索知识库。默认优先使用 Python 引擎（mmap 极速检索），失败时自动降级为 JS 引擎。首次调用自动构建知识库。必须指定 path 参数来确定搜索哪个知识库目录。",
                "en": "Semantic search the knowledge base. Defaults to Python engine (mmap fast retrieval), auto-fallback to JS engine. Auto-builds KB on first call. Must specify path to determine which KB directory to search."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "自然语言查询语句", "en": "Natural language query." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量，默认 5", "en": "Number of results. Default: 5." },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "threshold",
                    "description": { "zh": "最低相似度阈值（0-1），默认 0.3", "en": "Min similarity threshold. Default: 0.3." },
                    "type": "number",
                    "required": false,
                    "default": 0.3
                },
                {
                    "name": "expand_context",
                    "description": { "zh": "是否扩展上下文，默认 true", "en": "Expand context. Default: true." },
                    "type": "boolean",
                    "required": false,
                    "default": true
                }
            ]
        },
        {
            "name": "build",
            "description": {
                "zh": "手动构建/重建知识库。支持断点续建：如果上次构建中断，只要原文件未改动，会自动从中断处继续。必须指定 path。",
                "en": "Manually build/rebuild KB. Supports resumable building: if interrupted, resumes from breakpoint if source files unchanged. Must specify path."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "force_rebuild",
                    "description": { "zh": "是否强制全量重建（清除所有缓存）", "en": "Force full rebuild." },
                    "type": "boolean",
                    "required": false,
                    "default": false
                },
                {
                    "name": "chunk_size",
                    "description": { "zh": "分块大小（字符数），默认 512", "en": "Chunk size in chars. Default: 512." },
                    "type": "number",
                    "required": false,
                    "default": 512
                },
                {
                    "name": "chunk_overlap",
                    "description": { "zh": "分块重叠字符数，默认 64", "en": "Chunk overlap. Default: 64." },
                    "type": "number",
                    "required": false,
                    "default": 64
                },
                {
                    "name": "concurrency",
                    "description": { "zh": "并发嵌入请求数（1-4），默认 2。手机优先稳定，高性能设备可适当增大。", "en": "Concurrent embedding requests (1-4). Default: 2." },
                    "type": "number",
                    "required": false,
                    "default": 2
                }
            ]
        },
        {
            "name": "build_exam",
            "description": {
                "zh": "按题号拆分题库文件构建知识库。每道题目（含选项、答案、解析等）作为独立分块，自动过滤非题目内容。支持单选题、多选题、判断题、填空题、论述题等。必须指定 path。",
                "en": "Build KB by splitting exam files per question number. Each question (with options, answer, explanation) becomes one chunk. Auto-filters non-question content. Supports multiple question types."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "题库文档目录的绝对路径", "en": "Absolute path to the exam document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "force_rebuild",
                    "description": { "zh": "是否强制全量重建（清除所有缓存）", "en": "Force full rebuild." },
                    "type": "boolean",
                    "required": false,
                    "default": false
                },
                {
                    "name": "concurrency",
                    "description": { "zh": "并发嵌入请求数（1-4），默认 2", "en": "Concurrent embedding requests (1-4). Default: 2." },
                    "type": "number",
                    "required": false,
                    "default": 2
                }
            ]
        },
        {
            "name": "rebuild_index",
            "description": {
                "zh": "重建并优化 Python 搜索引擎索引。将 build 构建的 JSON 碎片合并为高效的二进制 .npy 向量文件和优化后的 JSON 索引，大幅提升搜索速度。构建知识库后自动触发，也可手动调用刷新。",
                "en": "Rebuild and optimize Python search engine index. Merges JSON fragments from build into binary .npy vectors and optimized JSON index for extreme speed. Auto-triggered after build, can also be called manually."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "status",
            "description": {
                "zh": "查看知识库状态。返回已索引文件、分块数、维度、构建进度等信息。",
                "en": "View KB status: indexed files, chunks, dimensions, build progress."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "list_files",
            "description": {
                "zh": "列出目录中所有已识别文件及其索引状态（已索引/未索引/已修改/向量化中断）。",
                "en": "List all recognized files with indexing status."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "get_chunk",
            "description": {
                "zh": "按编号获取文本分块及上下文。配合 search 返回的 chunk_id 使用。",
                "en": "Get chunk by ID with context. Use chunk_id from search results."
            },
            "parameters": [
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "chunk_id",
                    "description": { "zh": "分块编号", "en": "Chunk ID." },
                    "type": "number",
                    "required": true
                },
                {
                    "name": "context_range",
                    "description": { "zh": "上下文范围（前后各取几块），默认 1", "en": "Context range. Default: 1." },
                    "type": "number",
                    "required": false,
                    "default": 1
                }
            ]
        },
        {
            "name": "multi_search",
            "description": {
                "zh": "多查询融合搜索（RRF）。将多个不同角度的查询分别检索后融合排序，适用于复杂问题。",
                "en": "Multi-query fusion search with RRF ranking for complex questions."
            },
            "parameters": [
                {
                    "name": "queries",
                    "description": { "zh": "查询语句数组", "en": "Array of query strings." },
                    "type": "array",
                    "required": true
                },
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量，默认 8", "en": "Number of results. Default: 8." },
                    "type": "number",
                    "required": false,
                    "default": 8
                },
                {
                    "name": "threshold",
                    "description": { "zh": "最低相似度阈值，默认 0.3", "en": "Min similarity threshold. Default: 0.3." },
                    "type": "number",
                    "required": false,
                    "default": 0.3
                }
            ]
        },
        {
            "name": "keyword_search",
            "description": {
                "zh": "关键词快速搜索知识库。不调用API，纯本地关键词匹配，速度极快。需要知识库已构建。",
                "en": "Fast keyword search. No API calls, pure local matching. Requires KB built."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词", "en": "Search keywords." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "path",
                    "description": { "zh": "知识库文档目录的绝对路径", "en": "Absolute path to the KB document directory." },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量，默认 5", "en": "Number of results. Default: 5." },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "expand_context",
                    "description": { "zh": "是否扩展上下文，默认 true", "en": "Expand context. Default: true." },
                    "type": "boolean",
                    "required": false,
                    "default": true
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 IKBS API 连通性。检测嵌入模型 API 密钥配置状态、基础地址及模型名称。验证环境变量配置。",
                "en": "Test IKBS API connectivity. Check embedding model API key configuration, base URL, and model name. Verify environment variables."
            },
            "parameters": []
        }
    ]
}
*/

// =============================================================================
// IKBS - Intelligent Knowledge Base Search v1.0
// =============================================================================
var IKBS = (function () {

    // =========================================================================
    // 已知模型默认维度映射表
    // =========================================================================
    var MODEL_DEFAULT_DIMS = {
        'Qwen/Qwen3-Embedding-0.6B': 1024,
        'Qwen/Qwen3-Embedding-8B': 4096,
        'BAAI/bge-m3': 1024,
        'BAAI/bge-large-zh-v1.5': 1024,
        'BAAI/bge-large-en-v1.5': 1024,
        'BAAI/bge-base-zh-v1.5': 768,
        'BAAI/bge-base-en-v1.5': 768,
        'BAAI/bge-small-zh-v1.5': 512,
        'BAAI/bge-small-en-v1.5': 384,
        'jinaai/jina-embeddings-v2-base-zh': 768,
        'jinaai/jina-embeddings-v2-base-en': 768,
        'jinaai/jina-embeddings-v3': 1024,
        'nomic-ai/nomic-embed-text-v1.5': 768,
        'text-embedding-ada-002': 1536,
        'text-embedding-3-small': 1536,
        'text-embedding-3-large': 3072,
        'Pro/BAAI/bge-m3': 1024,
        'netease-youdao/bce-embedding-base_v1': 768
    };

    var CFG = {
        CACHE_DIR: '.ikbs_cache',
        F_META: 'meta.json',
        F_FP: 'fingerprints.json',
        F_PROGRESS: 'build_progress.json',
        F_FAST_INDEX: 'fast_index.json',
        F_ALL_CHUNKS: 'all_chunks.json',
        VEC_DIR: 'vectors',
        CHUNK_DIR: 'chunks',
        DEFAULT_BASE_URL: 'https://api.siliconflow.cn/v1',
        DEFAULT_MODEL: 'BAAI/bge-m3',
        DEFAULT_CHUNK_SIZE: 512,
        DEFAULT_OVERLAP: 64,
        BATCH_SIZE: 20,
        DEFAULT_THRESHOLD: 0.3,
        DEFAULT_CONCURRENCY: 2,
        SUPPORTED_EXT: ['.txt', '.md', '.markdown', '.html', '.htm', '.json', '.jsonl',
            '.csv', '.tsv', '.log', '.ini', '.cfg', '.xml', '.yaml', '.yml',
            '.rst', '.tex', '.srt', '.ass'],
        MAX_FILE_SIZE: 50 * 1024 * 1024,
        MAX_RETRIES: 5,
        RETRY_BASE_DELAY: 800,
        CHAPTER_RE: /^(?:第[一二三四五六七八九十百千万零\d]+[章节回卷集部篇]|Chapter\s+\d+|CHAPTER\s+\d+|卷[一二三四五六七八九十百千\d]+|序章|序言|尾声|楔子|引子|番外)[^\n]*/,
        QUESTION_RE: /^(?:\d{1,4}[.、)）]\s*|[A-Z][.、)）]\s*|题目[:：]\s*|问题[:：]\s*|Q[:：]\s*)/m,
        MIN_PARA_LEN: 30,
        MAX_TEXT_FOR_EMBED: 2000
    };

    var http = OkHttp.newClient();
    var _kbCache = {};
    var _queryCache = {};
    var _queryCacheKeys = [];
    var QUERY_CACHE_MAX = 50;

    // =========================================================================
    // Python 搜索引擎配置
    // =========================================================================
    var PY_DEFAULT_BIN = 'python3';
    var PY_DEFAULT_SCRIPT = '/storage/emulated/0/Download/Operit/examples/ikbs_search/ikbs_search.py';

    function getScriptPath() {
        return (getEnv('IKBS_SCRIPT_PATH') || PY_DEFAULT_SCRIPT).trim();
    }
    function getPyBin() {
        return (getEnv('IKBS_PYTHON_BIN') || PY_DEFAULT_BIN).trim();
    }

    function readEnvInt(name, fallback) {
        try {
            var val = getEnv(name);
            if (val !== undefined && val !== null && String(val).trim()) {
                var n = parseInt(String(val).trim(), 10);
                return Number.isFinite(n) && n > 0 ? n : fallback;
            }
        } catch (_) {}
        return fallback;
    }

    function getEnvConfig() {
        return {
            chunkSize: readEnvInt('IKBS_CHUNK_SIZE', CFG.DEFAULT_CHUNK_SIZE),
            chunkOverlap: readEnvInt('IKBS_CHUNK_OVERLAP', CFG.DEFAULT_OVERLAP),
            batchSize: Math.max(1, Math.min(50, readEnvInt('IKBS_BATCH_SIZE', CFG.BATCH_SIZE))),
            concurrency: Math.max(1, Math.min(4, readEnvInt('IKBS_CONCURRENCY', CFG.DEFAULT_CONCURRENCY))),
            maxFileSize: readEnvInt('IKBS_MAX_FILE_SIZE_MB', 50) * 1024 * 1024,
            forcePython: (function () {
                try { var v = getEnv('IKBS_FORCE_PYTHON'); return v === 'true' || v === '1'; } catch (_) { return false; }
            })()
        };
    }

    // =========================================================================
    // 环境与路径
    // =========================================================================
    function getApiKey() {
        var k = getEnv('IKBS_API_KEY');
        if (!k || !k.trim()) throw new Error('IKBS_API_KEY 未配置，请在环境变量中设置硅基流动 API Key');
        return k.trim();
    }
    function getBaseUrl() {
        return (getEnv('IKBS_BASE_URL') || CFG.DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
    }
    function getModel() {
        return (getEnv('IKBS_EMBED_MODEL') || CFG.DEFAULT_MODEL).trim();
    }
    function getModelDefaultDim() {
        var model = getModel();
        if (MODEL_DEFAULT_DIMS[model] !== undefined) return MODEL_DEFAULT_DIMS[model];
        var lo = model.toLowerCase();
        var keys = Object.keys(MODEL_DEFAULT_DIMS);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() === lo) return MODEL_DEFAULT_DIMS[keys[i]];
        }
        return 0;
    }

    // =========================================================================
    // Python 引擎调用（稳定版：固定会话 + 输出重定向 + 超时保护）
    // =========================================================================
    // 使用固定会话名 "ikbs_search_py"，避免高频调用泄漏会话
    async function execPythonCommand(command, timeout) {
        var session = await Tools.System.terminal.create('ikbs_search_py');
        return await Tools.System.terminal.exec(session.sessionId, command, timeout || 60000);
    }

    async function runPyEngine(cmd, kbPath, args) {
        var pyBin = getPyBin();
        var pyScript = getScriptPath();
        var fullKbPath = normPath(kbPath);

        // 使用单引号 shell 转义（比双引号更安全，避免 $、`、! 等特殊字符问题）
        var escapedPy = pyScript.replace(/'/g, "'\\''");
        var escapedPath = fullKbPath.replace(/'/g, "'\\''");

        // 构造命令参数
        var cmdParts = pyBin + " '" + escapedPy + "' '" + cmd + "' '" + escapedPath + "'";

        // 临时文件路径
        var tmpVecFile = null;
        var tmpOutFile = cachePath(fullKbPath) + '.tmp_pyout_' + Date.now() + '.json';
        var escapedOut = tmpOutFile.replace(/'/g, "'\\''");

        try {
            // 处理参数：大向量写入临时文件后用 stdin 重定向传给 Python
            var safeArgs = args || [];
            for (var ai = 0; ai < safeArgs.length; ai++) {
                var argStr = String(safeArgs[ai]);
                if (argStr.length > 16384) {
                    tmpVecFile = cachePath(fullKbPath) + '.tmp_qvec_' + Date.now() + '.json';
                    try {
                        await Tools.Files.write(tmpVecFile, argStr, false, 'android');
                        var escapedVec = tmpVecFile.replace(/'/g, "'\\''");
                        cmdParts += " - < '" + escapedVec + "'";
                    } catch (_we) {
                        tmpVecFile = null;
                        cmdParts += " '" + argStr.substring(0, 16000).replace(/'/g, "'\\''") + "'";
                    }
                } else {
                    cmdParts += " '" + argStr.replace(/'/g, "'\\''") + "'";
                }
            }

            // 输出重定向到临时文件，完全绕过终端输出缓冲区限制
            var shellCmd = cmdParts + " > '" + escapedOut + "' 2>&1";

            // 超时保护：optimize 可能耗时较长（180s），搜索 90s
            var timeout = cmd === 'optimize' ? 180000 : 90000;
            var execResult = await execPythonCommand(shellCmd, timeout);

            // 优先从文件读取完整输出
            var rawOut = '';
            try {
                var readRes = await Tools.Files.read(tmpOutFile, 'android');
                rawOut = (readRes && readRes.content) ? readRes.content.trim() : '';
            } catch (_re) {}

            // 兜底：若文件读取失败，退化到终端输出（可能被截断）
            if (!rawOut && execResult && execResult.output) {
                rawOut = (execResult.output || '').trim();
            }

            // exitCode 非 0 且无输出时才报错
            if (!rawOut && execResult && execResult.exitCode !== 0) {
                throw new Error('Python 引擎执行出错 (exit=' + (execResult.exitCode || 'null') + '): ' +
                    (execResult.output || '').substring(0, 500));
            }

            // 从末尾向上找第一个以 '{' 开头的合法 JSON
            var result = null;
            if (rawOut) {
                var outputLines = rawOut.split('\n');
                for (var j = outputLines.length - 1; j >= 0; j--) {
                    var line = outputLines[j].trim();
                    if (!line) continue;
                    if (line.charAt(0) === '{') {
                        try { result = JSON.parse(line); break; } catch (_) {}
                    }
                    // 备用：尝试从行内提取 JSON
                    var patterns = ['{"success"', '{"data"'];
                    for (var pi = 0; pi < patterns.length; pi++) {
                        var idx = line.lastIndexOf(patterns[pi]);
                        if (idx >= 0) {
                            try { result = JSON.parse(line.substring(idx)); break; } catch (_) {}
                        }
                    }
                    if (result) break;
                }
            }

            if (!result) {
                throw new Error('解析 Python 引擎输出失败。原始输出: ' + (rawOut || '').slice(-500));
            }
            if (!result.success) {
                throw new Error('Python 引擎逻辑异常: ' + (result.message || JSON.stringify(result)));
            }
            return result;
        } finally {
            // 清理临时文件
            if (tmpVecFile) { try { await Tools.Files.delete(tmpVecFile, false, 'android'); } catch (_) {} }
            try { await Tools.Files.delete(tmpOutFile, false, 'android'); } catch (_) {}
        }
    }

    async function isPyEngineAvailable() {
        try {
            var script = getScriptPath();
            var e = await Tools.Files.exists(script, 'android');
            return !!(e && e.exists);
        } catch (_) { return false; }
    }

    async function getQueryEmbedding(text) {
        var cached = getCachedQueryVec(text);
        if (cached) return cached;
        var vecs = await callEmbed([text]);
        if (vecs.length > 0 && vecs[0]) {
            setCachedQueryVec(text, vecs[0]);
            return vecs[0];
        }
        throw new Error('查询向量获取失败');
    }

    async function getQueryEmbeddings(texts) {
        var results = [];
        for (var i = 0; i < texts.length; i++) {
            results.push(await getQueryEmbedding(texts[i]));
        }
        return results;
    }

    function normPath(p) {
        if (!p || !p.trim()) throw new Error("参数 'path' 不能为空");
        var d = p.trim();
        if (!d.endsWith('/')) d += '/';
        return d;
    }
    function cachePath(dp) { return dp + CFG.CACHE_DIR + '/'; }
    function vecPath(dp) { return cachePath(dp) + CFG.VEC_DIR + '/'; }
    function chunkPath(dp) { return cachePath(dp) + CFG.CHUNK_DIR + '/'; }

    // =========================================================================
    // 文件系统工具
    // =========================================================================
    async function ensureDir(d) {
        try {
            var e = await Tools.Files.exists(d, 'android');
            if (!e || !e.exists) await Tools.Files.mkdir(d, true, 'android');
        } catch (_) {
            try { await Tools.Files.mkdir(d, true, 'android'); } catch (_2) { }
        }
    }

    async function readJson(basePath, name) {
        try {
            var fp = basePath + name;
            var e = await Tools.Files.exists(fp, 'android');
            if (e && e.exists) {
                var c = await Tools.Files.read(fp, 'android');
                if (c && c.content && c.content.trim()) {
                    var content = c.content.trim();
                    var firstChar = content.charAt(0);
                    if (firstChar !== '{' && firstChar !== '[') {
                        try { await Tools.Files.delete(fp, false, 'android'); } catch (_) {}
                    } else {
                        return JSON.parse(content);
                    }
                }
            }
            // 主文件缺失或损坏，尝试 .tmp 回退
            var tmpFp = fp + '.tmp';
            var te = await Tools.Files.exists(tmpFp, 'android');
            if (te && te.exists) {
                var tc = await Tools.Files.read(tmpFp, 'android');
                if (tc && tc.content && tc.content.trim()) {
                    var tmpContent = tc.content.trim();
                    var tmpFirst = tmpContent.charAt(0);
                    if (tmpFirst === '{' || tmpFirst === '[') {
                        var data = JSON.parse(tmpContent);
                        try { await Tools.Files.write(fp, tmpContent, false, 'android'); } catch (_) {}
                        return data;
                    }
                }
            }
            return null;
        } catch (_) { return null; }
    }

    async function writeJsonSafe(basePath, name, data) {
        await ensureDir(basePath);
        var tmpName = name + '.tmp';
        var content = JSON.stringify(data);
        try {
            await Tools.Files.write(basePath + tmpName, content, false, 'android');
            await Tools.Files.write(basePath + name, content, false, 'android');
            try { await Tools.Files.delete(basePath + tmpName, false, 'android'); } catch (_) { }
        } catch (e) {
            await Tools.Files.write(basePath + name, content, false, 'android');
        }
    }

    async function fileExists(fp) {
        try {
            var e = await Tools.Files.exists(fp, 'android');
            return !!(e && e.exists);
        } catch (_) { return false; }
    }

    async function deleteFile(fp) {
        try { await Tools.Files.delete(fp, false, 'android'); } catch (_) { }
    }

    function isSupported(name) {
        if (!name || name.charAt(0) === '.' || name.charAt(0) === '_') return false;
        var lo = name.toLowerCase();
        return CFG.SUPPORTED_EXT.some(function (ext) { return lo.endsWith(ext); });
    }

    function getExt(name) {
        var i = name.lastIndexOf('.');
        return i === -1 ? '' : name.substring(i).toLowerCase();
    }

    function safeName(name) {
        return CryptoJS.MD5(name).toString();
    }

    // =========================================================================
    // 按文件分片读写向量
    // =========================================================================
    function vecFileName(fn) { return safeName(fn) + '.vec'; }
    function chunkFileName(fn) { return safeName(fn) + '.chk'; }

    async function writeFileVectors(dp, fileName, vectors) {
        var vd = vecPath(dp);
        await ensureDir(vd);
        var content = JSON.stringify(vectors);
        var targetPath = vd + vecFileName(fileName);
        var tmpPath = targetPath + '.tmp';
        try {
            await Tools.Files.write(tmpPath, content, false, 'android');
            await Tools.Files.write(targetPath, content, false, 'android');
            try { await Tools.Files.delete(tmpPath, false, 'android'); } catch (_) {}
        } catch (e) {
            await Tools.Files.write(targetPath, content, false, 'android');
        }
    }

    async function readFileVectors(dp, fileName) {
        try {
            var fp = vecPath(dp) + vecFileName(fileName);
            if (!(await fileExists(fp))) return null;
            var c = await Tools.Files.read(fp, 'android');
            if (!c || !c.content) return null;
            return JSON.parse(c.content);
        } catch (_) { return null; }
    }

    async function hasFileVectors(dp, fileName) {
        return await fileExists(vecPath(dp) + vecFileName(fileName));
    }

    async function deleteFileData(dp, fileName) {
        await deleteFile(vecPath(dp) + vecFileName(fileName));
        await deleteFile(chunkPath(dp) + chunkFileName(fileName));
    }

    async function writeFileChunks(dp, fileName, chunks) {
        var cd = chunkPath(dp);
        await ensureDir(cd);
        var content = JSON.stringify(chunks);
        var targetPath = cd + chunkFileName(fileName);
        var tmpPath = targetPath + '.tmp';
        try {
            await Tools.Files.write(tmpPath, content, false, 'android');
            await Tools.Files.write(targetPath, content, false, 'android');
            try { await Tools.Files.delete(tmpPath, false, 'android'); } catch (_) {}
        } catch (e) {
            await Tools.Files.write(targetPath, content, false, 'android');
        }
    }

    async function readFileChunks(dp, fileName) {
        try {
            var fp = chunkPath(dp) + chunkFileName(fileName);
            if (!(await fileExists(fp))) return null;
            var c = await Tools.Files.read(fp, 'android');
            if (!c || !c.content) return null;
            return JSON.parse(c.content);
        } catch (_) { return null; }
    }

    async function hasFileChunks(dp, fileName) {
        return await fileExists(chunkPath(dp) + chunkFileName(fileName));
    }

    // =========================================================================
    // 文本提取引擎
    // =========================================================================
    async function extractText(filePath, fileName) {
        var raw = await Tools.Files.read(filePath, 'android');
        if (!raw || !raw.content) return '';
        var text = raw.content;
        switch (getExt(fileName)) {
            case '.md': case '.markdown': text = cleanMd(text); break;
            case '.html': case '.htm': text = cleanHtml(text); break;
            case '.json': text = flatJson(text); break;
            case '.jsonl': text = flatJsonl(text); break;
            case '.csv': case '.tsv': text = flatCsv(text, getExt(fileName) === '.tsv' ? '\t' : ','); break;
            case '.xml': text = cleanXml(text); break;
            case '.srt': text = cleanSrt(text); break;
            case '.ass': text = cleanAss(text); break;
            case '.tex': text = cleanTex(text); break;
        }
        return text.trim();
    }

    function cleanMd(t) {
        t = t.replace(/^(#{1,6})\s+(.+)$/gm, function (_, h, title) { return '\n【' + title.trim() + '】\n'; });
        t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
        t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
        t = t.replace(/`{1,3}([^`]*)`{1,3}/g, '$1');
        t = t.replace(/```[\w]*\n?/g, '');
        t = t.replace(/\*{1,3}([^*]*)\*{1,3}/g, '$1');
        t = t.replace(/_{1,3}([^_]*)_{1,3}/g, '$1');
        t = t.replace(/^>\s*/gm, '');
        t = t.replace(/^[-*_]{3,}\s*$/gm, '');
        t = t.replace(/^[\s]*[-*+]\s/gm, '');
        t = t.replace(/^[\s]*\d+\.\s/gm, '');
        return t.replace(/\n{3,}/g, '\n\n');
    }

    function cleanHtml(t) {
        t = t.replace(/<script[\s\S]*?<\/script>/gi, '');
        t = t.replace(/<style[\s\S]*?<\/style>/gi, '');
        t = t.replace(/<\/(p|div|li|tr|h[1-6]|br|hr|blockquote)>/gi, '\n');
        t = t.replace(/<br\s*\/?>/gi, '\n');
        t = t.replace(/<[^>]+>/g, '');
        t = htmlDec(t);
        return t.replace(/\n{3,}/g, '\n\n');
    }

    function htmlDec(t) {
        if (!t) return '';
        return t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
            .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(parseInt(n, 10)); });
    }

    function flatJson(t) {
        try { return flatObj(JSON.parse(t), ''); } catch (_) { return t; }
    }

    function flatJsonl(t) {
        return t.split('\n').filter(function (l) { return l.trim(); }).map(function (l, i) {
            try { return '--- 记录 ' + (i + 1) + ' ---\n' + flatObj(JSON.parse(l), ''); }
            catch (_) { return l; }
        }).join('\n');
    }

    function flatObj(o, p) {
        if (o === null || o === undefined) return p + ': (空)';
        if (typeof o !== 'object') return (p ? p + ': ' : '') + String(o);
        var lines = [];
        if (Array.isArray(o)) {
            o.forEach(function (v, i) { lines.push(flatObj(v, p + '[' + i + ']')); });
        } else {
            Object.keys(o).forEach(function (k) { lines.push(flatObj(o[k], p ? p + '.' + k : k)); });
        }
        return lines.join('\n');
    }

    function flatCsv(t, d) {
        var lines = t.split('\n').filter(function (l) { return l.trim(); });
        if (!lines.length) return t;
        var hdr = lines[0].split(d).map(function (h) { return h.trim().replace(/^"|"$/g, ''); });
        var out = [];
        for (var i = 1; i < lines.length; i++) {
            var vals = lines[i].split(d).map(function (v) { return v.trim().replace(/^"|"$/g, ''); });
            var row = [];
            hdr.forEach(function (h, j) { if (vals[j] && vals[j] !== '') row.push(h + ': ' + vals[j]); });
            if (row.length) out.push('--- 行 ' + i + ' ---\n' + row.join(', '));
        }
        return out.join('\n');
    }

    function cleanXml(t) {
        t = t.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
        t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        t = t.replace(/<[^>]+>/g, ' ');
        return htmlDec(t).replace(/\s+/g, ' ').trim();
    }

    function cleanSrt(t) {
        t = t.replace(/^\d+\s*$/gm, '').replace(/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->.*$/gm, '');
        t = t.replace(/<[^>]+>/g, '');
        return t.replace(/\n{2,}/g, '\n').trim();
    }

    function cleanAss(t) {
        var out = [];
        t.split('\n').forEach(function (line) {
            if (line.startsWith('Dialogue:')) {
                var parts = line.split(',');
                if (parts.length >= 10) {
                    var txt = parts.slice(9).join(',').replace(/\{[^}]*\}/g, '').replace(/\\[nN]/g, ' ').trim();
                    if (txt) out.push(txt);
                }
            }
        });
        return out.join('\n');
    }

    function cleanTex(t) {
        t = t.replace(/%.*$/gm, '');
        t = t.replace(/\\(?:textbf|textit|emph|underline|section|subsection|subsubsection|chapter|title|author)\{([^}]*)\}/g, '$1');
        t = t.replace(/\\(?:begin|end)\{[^}]*\}/g, '');
        t = t.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');
        return t;
    }

    // =========================================================================
    // 分块引擎（对题库场景优化）
    // =========================================================================
    function chunkText(text, fileName, size, overlap) {
        if (!text || text.trim().length === 0) return [];

        var isExamFile = detectExamFormat(text);
        if (isExamFile) return chunkExamText(text, fileName, size);

        var chunks = [], chapter = '';
        var paras = mergeTiny(splitParas(text), CFG.MIN_PARA_LEN);
        var buf = '';

        for (var pi = 0; pi < paras.length; pi++) {
            var para = paras[pi];
            var cm = para.match(CFG.CHAPTER_RE);
            if (cm) chapter = cm[0].trim();
            var mm = para.match(/^【(.+?)】$/m);
            if (mm) chapter = mm[1].trim();

            if (buf.length + para.length + 1 <= size) {
                buf += (buf ? '\n' : '') + para;
            } else {
                if (buf.length > 0) {
                    chunks.push({ text: buf, fileName: fileName, chapterHint: chapter });
                }
                if (overlap > 0 && buf.length > overlap) {
                    buf = buf.substring(buf.length - overlap) + '\n' + para;
                } else {
                    buf = para;
                }
                while (buf.length > size) {
                    var sp = findSplit(buf, size);
                    chunks.push({ text: buf.substring(0, sp), fileName: fileName, chapterHint: chapter });
                    buf = (overlap > 0 && sp > overlap) ? buf.substring(sp - overlap) : buf.substring(sp);
                }
            }
        }
        if (buf.trim().length > 0) {
            chunks.push({ text: buf, fileName: fileName, chapterHint: chapter });
        }
        return chunks;
    }

    function detectExamFormat(text) {
        var sample = text.substring(0, 5000);
        var questionCount = 0;
        var lines = sample.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (/^\d{1,4}[.、)）]/.test(lines[i].trim())) questionCount++;
        }
        return questionCount >= 3;
    }

    function chunkExamText(text, fileName, maxSize) {
        var chunks = [];
        var lines = text.split('\n');
        var buf = '', chapter = '', qCount = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var cm = line.match(CFG.CHAPTER_RE);
            if (cm) { chapter = cm[0].trim(); }

            var isQ = /^\d{1,4}[.、)）]/.test(line.trim());

            if (isQ && buf.length > 0) {
                if (buf.length + line.length > maxSize && buf.trim().length > 20) {
                    chunks.push({ text: buf.trim(), fileName: fileName, chapterHint: chapter });
                    buf = '';
                    qCount = 0;
                }
            }

            buf += (buf ? '\n' : '') + line;

            if (isQ) qCount++;

            if (buf.length >= maxSize) {
                var splitIdx = buf.lastIndexOf('\n');
                if (splitIdx > maxSize * 0.3) {
                    var testLine = buf.substring(splitIdx + 1);
                    if (/^\d{1,4}[.、)）]/.test(testLine.trim())) {
                        chunks.push({ text: buf.substring(0, splitIdx).trim(), fileName: fileName, chapterHint: chapter });
                        buf = testLine;
                        qCount = 1;
                        continue;
                    }
                }
                chunks.push({ text: buf.trim(), fileName: fileName, chapterHint: chapter });
                buf = '';
                qCount = 0;
            }
        }
        if (buf.trim().length > 20) {
            chunks.push({ text: buf.trim(), fileName: fileName, chapterHint: chapter });
        }
        return chunks;
    }

    function chunkExamByQuestion(text, fileName) {
        var chunks = [];
        var lines = text.split('\n');
        var currentChunk = '';
        var currentQNum = '';
        var qStartRe = /^(\d{1,4})\s*[\.\．。、\)\）]/;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();
            if (!trimmed) {
                if (currentQNum) currentChunk += '\n';
                continue;
            }
            var match = trimmed.match(qStartRe);
            if (match) {
                if (currentChunk.trim().length > 0 && currentQNum) {
                    chunks.push({
                        text: currentChunk.trim(),
                        fileName: fileName,
                        chapterHint: '第' + currentQNum + '题'
                    });
                }
                currentQNum = match[1];
                currentChunk = trimmed;
            } else if (currentQNum) {
                currentChunk += '\n' + trimmed;
            }
        }
        if (currentChunk.trim().length > 0 && currentQNum) {
            chunks.push({
                text: currentChunk.trim(),
                fileName: fileName,
                chapterHint: '第' + currentQNum + '题'
            });
        }
        return chunks.filter(function (c) {
            var t = c.text;
            var hasOption = /(?:^|\n)\s*[A-Ea-e]\s*[\.\．。、\)\）]/.test(t);
            var hasAnswer = /答案|解析|考点|正确答案/.test(t);
            var hasQType = /[\[【\(（][单多判填论简选择断述空综合分析计算名词解释问答材料案例].*?[\]】\)）]/.test(t);
            var isLongEnough = t.length > 15;
            return (hasOption || hasAnswer || hasQType) && isLongEnough;
        });
    }

    function splitParas(t) {
        var raw = t.split(/\n{2,}/), out = [];
        raw.forEach(function (p) {
            var tr = p.trim();
            if (!tr) return;
            if (tr.indexOf('\n') !== -1) {
                var sub = tr.split('\n');
                if (tr.length / sub.length < 60 && sub.length > 3) {
                    sub.forEach(function (l) { var tl = l.trim(); if (tl) out.push(tl); });
                    return;
                }
            }
            out.push(tr);
        });
        return out;
    }

    function mergeTiny(paras, minLen) {
        if (!paras.length) return [];
        var out = [], buf = '';
        paras.forEach(function (p) {
            if (CFG.CHAPTER_RE.test(p) || /^【.+?】$/.test(p)) {
                if (buf) { out.push(buf); buf = ''; }
                out.push(p);
                return;
            }
            if (buf.length > 0 && buf.length < minLen) {
                buf += '\n' + p;
            } else {
                if (buf) out.push(buf);
                buf = p;
            }
        });
        if (buf) out.push(buf);
        return out;
    }

    function findSplit(t, pos) {
        if (pos >= t.length) return t.length;
        var s0 = Math.floor(pos * 0.8), s1 = Math.min(t.length, Math.floor(pos * 1.1));
        var zone = t.substring(s0, s1);
        var rules = [
            { re: /[。！？…]+/g, p: 1 }, { re: /[.!?]+\s/g, p: 2 }, { re: /\n/g, p: 3 },
            { re: /[，；、：]+/g, p: 4 }, { re: /[,;:]\s/g, p: 5 }, { re: /\s/g, p: 6 }
        ];
        var best = -1, bp = 999;
        rules.forEach(function (r) {
            if (bp <= r.p) return;
            var m, last = -1;
            r.re.lastIndex = 0;
            while ((m = r.re.exec(zone)) !== null) last = m.index + m[0].length;
            if (last > 0) { best = s0 + last; bp = r.p; }
        });
        return best > 0 ? best : pos;
    }

    // =========================================================================
    // 嵌入 API 引擎
    // =========================================================================
    async function callEmbed(texts) {
        if (!texts || !texts.length) return [];
        var apiKey = getApiKey(), model = getModel(), baseUrl = getBaseUrl();
        var all = [];
        var batchSize = Math.min(getEnvConfig().batchSize, texts.length);

        for (var bs = 0; bs < texts.length; bs += batchSize) {
            var batch = texts.slice(bs, bs + batchSize);
            var trunc = batch.map(function (t) {
                return t.length > CFG.MAX_TEXT_FOR_EMBED ? t.substring(0, CFG.MAX_TEXT_FOR_EMBED) : t;
            });
            var body = { model: model, input: trunc, encoding_format: 'float' };

            var resp = null, lastErr = null;
            for (var att = 0; att < CFG.MAX_RETRIES; att++) {
                try {
                    resp = await http.newRequest()
                        .url(baseUrl + '/embeddings')
                        .method('POST')
                        .headers({
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + apiKey,
                            'Accept': 'application/json'
                        })
                        .body(JSON.stringify(body), 'json')
                        .build().execute();

                    if (resp.statusCode === 429) {
                        var w = CFG.RETRY_BASE_DELAY * Math.pow(2, att) + Math.floor(Math.random() * 500);
                        await Tools.System.sleep(Math.min(w, 15000));
                        lastErr = new Error('API 限流 (429)，第 ' + (att + 1) + ' 次重试');
                        continue;
                    }
                    // 服务端错误（可重试）
                    if (resp.statusCode >= 500) {
                        var errContent500 = '';
                        try { errContent500 = (resp.content || '').substring(0, 300); } catch (_) {}
                        lastErr = new Error('HTTP ' + resp.statusCode + ': ' + errContent500);
                        if (att < CFG.MAX_RETRIES - 1) {
                            await Tools.System.sleep(CFG.RETRY_BASE_DELAY * Math.pow(2, att));
                            continue;
                        }
                        break;
                    }
                    if (resp.isSuccessful()) break;

                    var errContent = '';
                    try { errContent = (resp.content || '').substring(0, 300); } catch (_) { }
                    lastErr = new Error('HTTP ' + resp.statusCode + ': ' + errContent);
                    // 客户端错误（非429），不重试
                    if (resp.statusCode >= 400 && resp.statusCode < 500) break;
                } catch (e) {
                    lastErr = e;
                    if (att < CFG.MAX_RETRIES - 1) {
                        var msg = e.message || '';
                        var isNetErr = msg.indexOf('timeout') >= 0 || msg.indexOf('Timeout') >= 0 ||
                            msg.indexOf('connect') >= 0 || msg.indexOf('Connect') >= 0 ||
                            msg.indexOf('reset') >= 0 || msg.indexOf('ECONNREFUSED') >= 0 ||
                            msg.indexOf('SocketException') >= 0 || msg.indexOf('EOFException') >= 0 ||
                            msg.indexOf('Broken pipe') >= 0 || msg.indexOf('stream') >= 0;
                        if (isNetErr) {
                            var delay = CFG.RETRY_BASE_DELAY * Math.pow(2, att) + Math.floor(Math.random() * 500);
                            await Tools.System.sleep(Math.min(delay, 15000));
                            continue;
                        }
                    }
                }
            }

            if (!resp || !resp.isSuccessful()) {
                throw new Error('嵌入 API 调用失败 (batch ' + Math.floor(bs / batchSize) + '): ' + (lastErr ? lastErr.message : '未知错误'));
            }

            var data;
            try {
                data = JSON.parse(resp.content);
            } catch (pe) {
                throw new Error('嵌入 API 返回非 JSON: ' + (resp.content || '').substring(0, 200));
            }

            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('嵌入 API 返回格式异常: 缺少 data 数组');
            }
            if (data.data.length !== batch.length) {
                throw new Error('嵌入返回数量不匹配: 期望 ' + batch.length + ', 得到 ' + data.data.length);
            }
            data.data.sort(function (a, b) { return a.index - b.index; });
            data.data.forEach(function (item) {
                if (!item.embedding || !Array.isArray(item.embedding)) {
                    throw new Error('嵌入数据缺失 embedding 字段');
                }
                all.push(item.embedding);
            });
        }
        return all;
    }

    function cosSim(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        var dot = 0, na = 0, nb = 0;
        for (var i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        var den = Math.sqrt(na) * Math.sqrt(nb);
        return den < 1e-10 ? 0 : dot / den;
    }

    // =========================================================================
    // 指纹与变更检测
    // =========================================================================
    async function genFingerprints(dp) {
        var listing = await Tools.Files.list(dp, 'android');
        if (!listing || !Array.isArray(listing.entries)) return {};
        var maxSize = getEnvConfig().maxFileSize;
        var fp = {};
        listing.entries.forEach(function (e) {
            if (e.isDirectory || !isSupported(e.name)) return;
            if (e.size && e.size > maxSize) return;
            fp[e.name] = e.name + '|' + (e.size || 0) + '|' + (e.lastModified || '');
        });
        return fp;
    }

    async function detectChanges(dp, newFp) {
        var oldFp = await readJson(cachePath(dp), CFG.F_FP) || {};
        var ch = { added: [], modified: [], removed: [], unchanged: [] };
        Object.keys(newFp).forEach(function (n) {
            if (!oldFp[n]) ch.added.push(n);
            else if (oldFp[n] !== newFp[n]) ch.modified.push(n);
            else ch.unchanged.push(n);
        });
        Object.keys(oldFp).forEach(function (n) { if (!newFp[n]) ch.removed.push(n); });
        return ch;
    }

    // =========================================================================
    // 构建进度管理（断点续建核心）
    // =========================================================================
    async function readProgress(dp) {
        return await readJson(cachePath(dp), CFG.F_PROGRESS);
    }

    async function writeProgress(dp, progress) {
        await writeJsonSafe(cachePath(dp), CFG.F_PROGRESS, progress);
    }

    async function clearProgress(dp) {
        await deleteFile(cachePath(dp) + CFG.F_PROGRESS);
        await deleteFile(cachePath(dp) + CFG.F_PROGRESS + '.tmp');
    }

    // =========================================================================
    // 并发控制器
    // =========================================================================
    async function parallelLimit(tasks, limit) {
        var results = new Array(tasks.length);
        var idx = 0;
        async function worker() {
            while (idx < tasks.length) {
                var i = idx++;
                try {
                    results[i] = { ok: true, value: await tasks[i]() };
                } catch (e) {
                    results[i] = { ok: false, error: e };
                }
            }
        }
        var workers = [];
        for (var w = 0; w < Math.min(limit, tasks.length); w++) workers.push(worker());
        await Promise.all(workers);
        return results;
    }

    // =========================================================================
    // 中间结果发送
    // =========================================================================
    function sendProgress(msg, data) {
        try {
            if (typeof sendIntermediateResult === 'function') {
                var payload = { success: true, message: msg };
                if (data) payload.data = data;
                sendIntermediateResult(payload);
            }
        } catch (e) {
            // 进度上报失败不影响主流程
        }
    }

    // =========================================================================
    // 知识库构建核心
    // =========================================================================
    async function buildKB(dp, forceRebuild, chunkSize, chunkOverlap, concurrency, _depth, examMode) {
        var rebuildDepth = _depth || 0;
        var envCfg = getEnvConfig();
        var cs = Math.max(100, Math.min(4000, chunkSize || envCfg.chunkSize));
        var co = Math.max(0, Math.min(Math.floor(cs / 2), chunkOverlap !== undefined && chunkOverlap !== null ? chunkOverlap : envCfg.chunkOverlap));
        var conc = Math.max(1, Math.min(4, concurrency || envCfg.concurrency));
        var startTime = Date.now();
        var currentModel = getModel();

        var newFp = await genFingerprints(dp);
        var fileNames = Object.keys(newFp).sort();
        if (!fileNames.length) throw new Error('目录中未找到支持的文件: ' + dp);

        if (forceRebuild) {
            await clearProgress(dp);
            delete _kbCache[dp];
            // 清理所有旧向量和分块文件，避免维度不一致的残留
            try {
                var oldVecDir = vecPath(dp);
                var oldChkDir = chunkPath(dp);
                var vExists = await fileExists(oldVecDir);
                if (vExists) {
                    var vListing = await Tools.Files.list(oldVecDir, 'android');
                    if (vListing && vListing.entries) {
                        for (var dvi = 0; dvi < vListing.entries.length; dvi++) {
                            if (!vListing.entries[dvi].isDirectory) await deleteFile(oldVecDir + vListing.entries[dvi].name);
                        }
                    }
                }
                var cExists = await fileExists(oldChkDir);
                if (cExists) {
                    var cListing = await Tools.Files.list(oldChkDir, 'android');
                    if (cListing && cListing.entries) {
                        for (var dci = 0; dci < cListing.entries.length; dci++) {
                            if (!cListing.entries[dci].isDirectory) await deleteFile(oldChkDir + cListing.entries[dci].name);
                        }
                    }
                }
                await deleteFile(cachePath(dp) + CFG.F_META);
                await deleteFile(cachePath(dp) + CFG.F_FP);
                await deleteFile(cachePath(dp) + CFG.F_FAST_INDEX);
                await deleteFile(cachePath(dp) + CFG.F_ALL_CHUNKS);
            } catch (_cleanErr) { }
        }

        var changes = forceRebuild
            ? { added: fileNames, modified: [], removed: [], unchanged: [] }
            : await detectChanges(dp, newFp);

        var hasChanges = changes.added.length + changes.modified.length + changes.removed.length > 0;

        // 检查未完成的构建
        if (!hasChanges && !forceRebuild) {
            var pendingProg = await readProgress(dp);
            if (pendingProg && pendingProg.pending && pendingProg.pending.length > 0) {
                hasChanges = true;
            }
        }

        // 快速路径：无变化且有缓存
        if (!hasChanges && !forceRebuild) {

            if (_kbCache[dp]) {
                if (_kbCache[dp].meta && _kbCache[dp].meta.embed_model !== currentModel) {
                    delete _kbCache[dp];
                } else if (_kbCache[dp].meta && _kbCache[dp].meta.build_complete && _kbCache[dp].chunks && _kbCache[dp].chunks.length > 0) {
                    var memMeta = _kbCache[dp].meta || {};
                    return { kb: _kbCache[dp], stats: { total_files: fileNames.length, total_chunks: _kbCache[dp].chunks.length, files_indexed: (memMeta.files_indexed || []).length, vector_dim: memMeta.vector_dim || 0, elapsed_sec: '0', from_cache: true } };
                } else {
                    delete _kbCache[dp];
                }
            }


                var fastKb = await loadFastIndexFromDisk(dp);
                if (fastKb) {
                    _kbCache[dp] = fastKb;
                    return { kb: fastKb, stats: { total_files: fileNames.length, total_chunks: fastKb.chunks.length, files_indexed: (fastKb.meta.files_indexed || []).length, vector_dim: fastKb.fastIndex.dim, elapsed_sec: '0', from_cache: true } };
                }
                var cachedMeta = await readJson(cachePath(dp), CFG.F_META);
                if (cachedMeta && cachedMeta.build_complete) {
                    if (cachedMeta.embed_model && cachedMeta.embed_model !== currentModel) {
                        sendProgress('⚠ 检测到嵌入模型已变更 (' + cachedMeta.embed_model + ' → ' + currentModel + ')，将强制重建知识库', {
                            phase: 'model_changed', old_model: cachedMeta.embed_model, new_model: currentModel
                        });
                        if (rebuildDepth >= 1) throw new Error('模型变更后重建仍冲突，请手动清理缓存: ' + cachePath(dp));
                        return await buildKB(dp, true, chunkSize, chunkOverlap, concurrency, rebuildDepth + 1, examMode);
                    }
                    var kb = await loadKBFromDisk(dp, cachedMeta);
                    if (kb) {
                        if (!kb.fastIndex && kb.vectors) {
                            kb.fastIndex = buildFastIndex(kb.vectors, kb.meta.vector_dim || 1024);
                        }
                        if (kb.fastIndex) { kb.vectors = null; }
                        _kbCache[dp] = kb;
                        return { kb: kb, stats: { total_files: fileNames.length, total_chunks: kb.chunks.length, files_indexed: (cachedMeta.files_indexed || []).length, vector_dim: cachedMeta.vector_dim || 0, elapsed_sec: '0', from_cache: true } };
                    }
                }

            changes = { added: fileNames, modified: [], removed: [], unchanged: [] };
        }

        // 删除变更文件的缓存
        var toDelete = changes.removed.concat(changes.modified);
        for (var di = 0; di < toDelete.length; di++) {
            await deleteFileData(dp, toDelete[di]);
        }

        var toProcess = changes.added.concat(changes.modified);

        // 如果没有文件变更但有未完成的构建，将 pending 文件加入处理列表
        if (toProcess.length === 0 && !forceRebuild) {
            var pendingCheck = await readProgress(dp);
            if (pendingCheck && pendingCheck.pending && pendingCheck.pending.length > 0) {
                toProcess = pendingCheck.pending.filter(function (f) { return !!newFp[f]; });
                if (toProcess.length > 0) {
                    sendProgress('📌 恢复 ' + toProcess.length + ' 个未完成文件', {
                        phase: 'resume_pending', count: toProcess.length
                    });
                }
            }
            // 如果没有进度文件但 meta 标记未完成，扫描缺少向量的文件
            if (toProcess.length === 0) {
                var incompleteMeta = await readJson(cachePath(dp), CFG.F_META);
                if (incompleteMeta && !incompleteMeta.build_complete) {
                    for (var mfi = 0; mfi < fileNames.length; mfi++) {
                        var mfn = fileNames[mfi];
                        if (await hasFileChunks(dp, mfn) && !(await hasFileVectors(dp, mfn))) {
                            toProcess.push(mfn);
                        }
                    }
                    if (toProcess.length > 0) {
                        sendProgress('📌 扫描发现 ' + toProcess.length + ' 个文件缺少向量', {
                            phase: 'scan_incomplete', count: toProcess.length
                        });
                    }
                }
            }
        }

        // ====================== 断点续建 ======================
        var progress = null;
        if (!forceRebuild && toProcess.length > 0) {
            progress = await readProgress(dp);
            if (progress && progress.fingerprints) {
                // 验证模型一致性：断点续建时模型必须一致
                if (progress.model && progress.model !== currentModel) {
                    sendProgress('⚠ 模型已变更，无法断点续建，将重新开始', {
                        phase: 'model_mismatch', old: progress.model, new_model: currentModel
                    });
                    progress = null;
                } else {
                var fpMatch = true;
                for (var fi = 0; fi < toProcess.length; fi++) {
                    if (progress.fingerprints[toProcess[fi]] !== newFp[toProcess[fi]]) {
                        fpMatch = false;
                        break;
                    }
                }
                if (fpMatch && progress.embedded && progress.embedded.length > 0) {
                    var embeddedSet = {};
                    progress.embedded.forEach(function (f) { embeddedSet[f] = true; });
                    var validEmbedded = [];
                    for (var vi = 0; vi < progress.embedded.length; vi++) {
                        var efn = progress.embedded[vi];
                        var hv = await hasFileVectors(dp, efn);
                        var hc = await hasFileChunks(dp, efn);
                        if (hv && hc) validEmbedded.push(efn);
                    }
                    if (validEmbedded.length > 0) {
                        var skipSet = {};
                        validEmbedded.forEach(function (f) { skipSet[f] = true; });
                        toProcess = toProcess.filter(function (f) { return !skipSet[f]; });
                        progress.embedded = validEmbedded;
                        sendProgress('📌 断点续建: 跳过 ' + validEmbedded.length + ' 个已完成, 剩余 ' + toProcess.length + ' 个', {
                            phase: 'resume', skipped: validEmbedded.length, remaining: toProcess.length
                        });
                    } else {
                        progress = null;
                    }
                } else if (fpMatch && progress.chunked && progress.chunked.length > 0) {
                    sendProgress('📌 断点续建: 分块阶段已有 ' + progress.chunked.length + ' 个文件完成', {
                        phase: 'resume_chunk', chunked: progress.chunked.length
                    });
                } else {
                    progress = null;
                }
                } // close model consistency else
            } else {
                progress = null;
            }
        }

        if (!progress) {
            progress = {
                version: '1.0',
                fingerprints: {},
                chunked: [],
                embedded: [],
                pending: [],
                chunk_size: cs,
                chunk_overlap: co,
                model: currentModel,
                started_at: new Date().toISOString()
            };
            var allToTrack = changes.added.concat(changes.modified);
            allToTrack.forEach(function (f) { progress.fingerprints[f] = newFp[f]; });
            progress.pending = toProcess.slice();
        }

        // ====================== Phase 1: 分块 ======================
        var totalNewChunks = 0, totalChars = 0, chunkSkipped = 0;
        var _bc = {}; // build chunk cache: fileName -> chunks[]

        if (toProcess.length > 0) {
            sendProgress('📦 Phase 1/2: 文本提取与分块 (' + toProcess.length + ' 个文件)', {
                phase: 'chunking', total: toProcess.length
            });

            var chunkedSet = {};
            if (progress.chunked) progress.chunked.forEach(function (f) { chunkedSet[f] = true; });

            for (var ci = 0; ci < toProcess.length; ci++) {
                var cfn = toProcess[ci];

                // 即使不在 progress.chunked 中，如果磁盘上已有分块文件也直接跳过
                if (await hasFileChunks(dp, cfn)) {
                    if (!chunkedSet[cfn]) {
                        progress.chunked.push(cfn);
                        chunkedSet[cfn] = true;
                    }
                    var existChunks = await readFileChunks(dp, cfn);
                    if (existChunks && existChunks.length > 0) {
                        _bc[cfn] = existChunks;
                        totalNewChunks += existChunks.length;
                        if ((ci + 1) % 10 === 0 || ci === toProcess.length - 1) {
                            sendProgress('📦 分块进度: ' + (ci + 1) + '/' + toProcess.length + ' (' + totalNewChunks + ' 块)', {
                                phase: 'chunking', done: ci + 1, total: toProcess.length, chunks: totalNewChunks
                            });
                        }
                        continue;
                    }
                }

                try {
                    var text = await extractText(dp + cfn, cfn);
                    if (!text || text.trim().length < 10) {
                        chunkSkipped++;
                        if (!chunkedSet[cfn]) {
                            progress.chunked.push(cfn);
                            chunkedSet[cfn] = true;
                        }
                        continue;
                    }
                    totalChars += text.length;
                    var fc = examMode ? chunkExamByQuestion(text, cfn) : chunkText(text, cfn, cs, co);
                    text = null; // 释放原始文本内存
                    if (fc.length > 0) {
                        await writeFileChunks(dp, cfn, fc);
                        _bc[cfn] = fc;
                        totalNewChunks += fc.length;
                    }
                    if (!chunkedSet[cfn]) {
                        progress.chunked.push(cfn);
                        chunkedSet[cfn] = true;
                    }

                    if ((ci + 1) % 5 === 0 || ci === toProcess.length - 1) {
                        progress.pending = toProcess.filter(function (f) { return !chunkedSet[f]; });
                        await writeProgress(dp, progress);
                        sendProgress('📦 分块进度: ' + (ci + 1) + '/' + toProcess.length + ' (' + totalNewChunks + ' 块)', {
                            phase: 'chunking', done: ci + 1, total: toProcess.length, chunks: totalNewChunks
                        });
                    }
                } catch (e) {
                    console.error('[IKBS] 分块失败 ' + cfn + ': ' + e.message);
                    chunkSkipped++;
                    if (!chunkedSet[cfn]) {
                        progress.chunked.push(cfn);
                        chunkedSet[cfn] = true;
                    }
                }
            }
            await writeProgress(dp, progress);
        }

        // ====================== Phase 2: 向量化 ======================
        var embeddedSet = {};
        if (progress.embedded) progress.embedded.forEach(function (f) { embeddedSet[f] = true; });

        var filesToEmbed = [];
        for (var ei = 0; ei < toProcess.length; ei++) {
            var fn = toProcess[ei];
            if (embeddedSet[fn]) continue;
            if (await hasFileVectors(dp, fn) && await hasFileChunks(dp, fn)) {
                progress.embedded.push(fn);
                embeddedSet[fn] = true;
                continue;
            }
            if (await hasFileChunks(dp, fn)) {
                filesToEmbed.push(fn);
            }
        }

        var embedErrors = 0;
        var detectedDim = 0;
        if (filesToEmbed.length > 0) {
            // 优先查表获取维度，仅未知模型才探测API
            detectedDim = getModelDefaultDim();
            if (detectedDim > 0) {
                sendProgress('🔍 模型维度: ' + detectedDim + ' (查表)', { phase: 'dim_probe', dimensions: detectedDim, model: currentModel });
            } else {
                try {
                    var probeVecs = await callEmbed(['维度探测']);
                    if (probeVecs.length > 0 && probeVecs[0]) {
                        detectedDim = probeVecs[0].length;
                        sendProgress('🔍 探测到嵌入维度: ' + detectedDim, { phase: 'dim_probe', dimensions: detectedDim, model: currentModel });
                    }
                } catch (probeErr) { console.error('[IKBS] 维度探测失败: ' + probeErr.message); }
            }
            // 如果已有向量，验证维度一致性
            if (detectedDim > 0) {
                var existingDim = 0;
                for (var edi = 0; edi < fileNames.length; edi++) {
                    var existVecs = await readFileVectors(dp, fileNames[edi]);
                    if (existVecs && existVecs.length > 0 && existVecs[0]) {
                        existingDim = existVecs[0].length;
                        break;
                    }
                }
                if (existingDim > 0 && existingDim !== detectedDim) {
                    sendProgress('⚠ 维度冲突: 已有 ' + existingDim + 'd ≠ 当前 ' + detectedDim + 'd，将强制重建', {
                        phase: 'dim_conflict', existing: existingDim, detected: detectedDim
                    });
                    if (rebuildDepth >= 1) throw new Error('维度冲突无法自动解决: 已有 ' + existingDim + 'd ≠ 当前 ' + detectedDim + 'd');
                    return await buildKB(dp, true, chunkSize, chunkOverlap, concurrency, rebuildDepth + 1, examMode);
                }
            }
            sendProgress('🧠 Phase 2/2: 向量化 (' + filesToEmbed.length + ' 个文件, 并发 ' + conc + ')', {
                phase: 'embedding', total: filesToEmbed.length, concurrency: conc
            });

            var previouslyEmbedded = fileNames.length - filesToEmbed.length;
            var embedDone = 0;
            embedErrors = 0;
            var fatalError = null;
            var maxRetries = 5;

            for (var retryRound = 0; retryRound < maxRetries; retryRound++) {
                filesToEmbed = filesToEmbed.filter(function (f) { return !embeddedSet[f]; });
                if (filesToEmbed.length === 0) break;

                if (retryRound > 0) {
                    // 等待一段时间再重试
                    await Tools.System.sleep(2000);
                    sendProgress('🔄 第 ' + (retryRound + 1) + ' 轮重试，剩余 ' + filesToEmbed.length + ' 个文件', {
                        phase: 'embedding_retry', round: retryRound + 1, remaining: filesToEmbed.length
                    });
                }

                var embedBefore = embedDone;
                embedErrors = 0;

                // 1. 收集所有待嵌入文件的块，扁平化
                var fileEmbedInfo = [];
                var flatTexts = [];
                var flatFileIdx = [];

                for (var efi = 0; efi < filesToEmbed.length; efi++) {
                    var efn2 = filesToEmbed[efi];
                    var fChunks = _bc[efn2] || (await readFileChunks(dp, efn2));
                    if (fChunks && !_bc[efn2]) _bc[efn2] = fChunks;
                    if (!fChunks || fChunks.length === 0) {
                        if (!embeddedSet[efn2]) { progress.embedded.push(efn2); embeddedSet[efn2] = true; embedDone++; }
                        continue;
                    }
                    var fidx = fileEmbedInfo.length;
                    fileEmbedInfo.push({ fileName: efn2, count: fChunks.length, startIdx: flatTexts.length, vecs: new Array(fChunks.length) });
                    for (var fci = 0; fci < fChunks.length; fci++) {
                        flatTexts.push(fChunks[fci].text);
                        flatFileIdx.push(fidx);
                    }
                }

                if (flatTexts.length === 0) break;

                var totalBatches = Math.ceil(flatTexts.length / CFG.BATCH_SIZE);
                var batchesDone = 0;

                sendProgress('🧠 向量化: ' + flatTexts.length + ' 块, ' + totalBatches + ' 批, 并发 ' + conc + (retryRound > 0 ? ' (重试第' + (retryRound+1) + '轮)' : ''), {
                    phase: 'embedding', total_chunks: flatTexts.length, total_batches: totalBatches, concurrency: conc
                });

                // 2. 构造 API 批次任务
                var batchTasks = [];
                for (var bi2 = 0; bi2 < flatTexts.length; bi2 += CFG.BATCH_SIZE) {
                    (function (bStart) {
                        var bEnd = Math.min(bStart + CFG.BATCH_SIZE, flatTexts.length);
                        batchTasks.push(async function () {
                            var bTexts = flatTexts.slice(bStart, bEnd);
                            var bVecs = await callEmbed(bTexts);
                            for (var bvi = 0; bvi < bVecs.length; bvi++) {
                                if (detectedDim > 0 && bVecs[bvi] && bVecs[bvi].length !== detectedDim) {
                                    throw new Error('维度不一致, 期望 ' + detectedDim + ' 得到 ' + bVecs[bvi].length);
                                }
                                var gIdx = bStart + bvi;
                                var fi2 = flatFileIdx[gIdx];
                                fileEmbedInfo[fi2].vecs[gIdx - fileEmbedInfo[fi2].startIdx] = bVecs[bvi];
                            }
                        });
                    })(bi2);
                }

                // 3. 分轮并发执行（每轮间微休眠保障稳定性）
                for (var rnd = 0; rnd < batchTasks.length; rnd += conc) {
                    var rndTasks = batchTasks.slice(rnd, Math.min(rnd + conc, batchTasks.length));
                    var rndResults = await parallelLimit(rndTasks, rndTasks.length);

                    for (var rri = 0; rri < rndResults.length; rri++) {
                        if (rndResults[rri].ok) batchesDone++;
                        else {
                            embedErrors++;
                            var errMsg = rndResults[rri].error.message;
                            console.error('[IKBS] 批次失败: ' + errMsg);
                            if (/HTTP\s+4\d\d/.test(errMsg) && !/429/.test(errMsg)) fatalError = rndResults[rri].error;
                        }
                    }
                    if (fatalError) break;

                    // 批间微休眠（降低 API 压力和手机负载）
                    if (rnd + conc < batchTasks.length) {
                        await Tools.System.sleep(100);
                    }

                    // 检查并保存已完成的文件
                    for (var cfi = 0; cfi < fileEmbedInfo.length; cfi++) {
                        var fInfo = fileEmbedInfo[cfi];
                        if (embeddedSet[fInfo.fileName]) continue;
                        var allReady = true;
                        for (var vci = 0; vci < fInfo.count; vci++) {
                            if (!fInfo.vecs[vci]) { allReady = false; break; }
                        }
                        if (allReady) {
                            await writeFileVectors(dp, fInfo.fileName, fInfo.vecs);
                            progress.embedded.push(fInfo.fileName);
                            embeddedSet[fInfo.fileName] = true;
                            embedDone++;
                            fInfo.vecs = null;
                        }
                    }

                    progress.pending = filesToEmbed.filter(function (f) { return !embeddedSet[f]; });
                    await writeProgress(dp, progress);

                    var pct2 = Math.round(batchesDone / totalBatches * 100);
                    var elapsed2 = ((Date.now() - startTime) / 1000).toFixed(0);
                    var totalFilesDone = previouslyEmbedded + embedDone;
                    sendProgress('🧠 向量化: ' + batchesDone + '/' + totalBatches + ' 批 (' + pct2 + '%), 文件 ' + totalFilesDone + '/' + fileNames.length + ' [' + elapsed2 + 's]', {
                        phase: 'embedding', done: batchesDone, total: totalBatches, files_done: totalFilesDone,
                        files_total: fileNames.length, percent: pct2, elapsed_sec: elapsed2
                    });
                }

                // 本轮无新进展 → 停止重试
                if (embedDone === embedBefore) {
                    sendProgress('⚠ 本轮无新文件完成，停止重试，' + filesToEmbed.filter(function(f){return !embeddedSet[f];}).length + ' 个文件未完成', {
                        phase: 'embedding_stalled'
                    });
                    break;
                }
                if (fatalError) {
                    sendProgress('❌ 致命错误，终止构建: ' + fatalError.message, { phase: 'fatal_error' });
                    break;
                }
            }
        }

        // ====================== Phase 3: 汇总 ======================
        sendProgress('📋 汇总元数据...', { phase: 'finalizing' });

        var allChunks = [];
        var filesIndexed = [];
        var filesIncomplete = [];
        // 构建已知有向量的文件集合（内存中已确认的 + unchanged中有记录的）
        var _knownVec = {};
        Object.keys(embeddedSet).forEach(function (f) { _knownVec[f] = true; });
        var oldMeta = await readJson(cachePath(dp), CFG.F_META);
        if (oldMeta && oldMeta.files_indexed) {
            oldMeta.files_indexed.forEach(function (f) {
                if (changes.unchanged.indexOf(f.name) !== -1) _knownVec[f.name] = true;
            });
        }
        for (var ai = 0; ai < fileNames.length; ai++) {
            var afn = fileNames[ai];
            var hasVec2 = _knownVec[afn] || (await hasFileVectors(dp, afn));
            var fc2 = _bc[afn] || (await readFileChunks(dp, afn));
            if (fc2 && fc2.length > 0 && hasVec2) {
                var baseId = allChunks.length;
                for (var ci2 = 0; ci2 < fc2.length; ci2++) {
                    fc2[ci2].chunk_id = baseId + ci2;
                    allChunks.push(fc2[ci2]);
                }
                filesIndexed.push({ name: afn, chunks: fc2.length });
            } else if (fc2 && fc2.length > 0 && !hasVec2) {
                filesIncomplete.push(afn);
            }
        }

        var isComplete = filesIncomplete.length === 0;

        var actualDim = detectedDim || 0;
        if (!actualDim) {
            for (var fdi = 0; fdi < filesIndexed.length; fdi++) {
                var testVecs = await readFileVectors(dp, filesIndexed[fdi].name);
                if (testVecs && testVecs.length > 0 && testVecs[0]) {
                    actualDim = testVecs[0].length;
                    break;
                }
            }
        }

        var meta = {
            version: '1.0',
            build_complete: isComplete,
            created_at: new Date().toISOString(),
            docs_path: dp,
            chunk_size: cs,
            chunk_overlap: co,
            embed_model: currentModel,
            total_files: fileNames.length,
            total_chunks: allChunks.length,
            vector_dim: actualDim,
            files_indexed: filesIndexed,
            files_incomplete: filesIncomplete.length,
            files_incomplete_list: filesIncomplete
        };

        await writeJsonSafe(cachePath(dp), CFG.F_META, meta);
        await writeJsonSafe(cachePath(dp), CFG.F_FP, newFp);

        // === 生成合并分块文本文件 ===
        if (isComplete && allChunks.length > 0) {
            sendProgress('📝 生成合并文本索引...', { phase: 'merge_chunks' });
            try {
                var allTexts = [];
                for (var ati = 0; ati < allChunks.length; ati++) {
                    allTexts.push(allChunks[ati].text || '');
                }
                await writeJsonSafe(cachePath(dp), CFG.F_ALL_CHUNKS, allTexts);
            } catch (mcErr) {
                console.error('[IKBS] 合并文本生成失败: ' + mcErr.message);
            }
        }

        if (isComplete) {
            await clearProgress(dp);
        } else if (progress) {
            // 保留进度文件，使下次调用能断点续建
            progress.pending = filesIncomplete;
            await writeProgress(dp, progress);
            sendProgress('⚠ 部分完成: ' + filesIndexed.length + '/' + fileNames.length + ' 文件, ' + filesIncomplete.length + ' 个待续建', {
                phase: 'partial', indexed: filesIndexed.length, incomplete: filesIncomplete.length
            });
        } else if (filesIncomplete.length > 0) {
            // progress 未初始化但有未完成文件，创建新进度文件
            var newProg = {
                version: '1.0', fingerprints: newFp, chunked: [], embedded: [],
                pending: filesIncomplete, model: currentModel, started_at: new Date().toISOString()
            };
            await writeProgress(dp, newProg);
            sendProgress('⚠ 部分完成: ' + filesIndexed.length + '/' + fileNames.length + ' 文件, ' + filesIncomplete.length + ' 个待续建', {
                phase: 'partial', indexed: filesIndexed.length, incomplete: filesIncomplete.length
            });
        }

        var allVecs = await loadAllVectors(dp, allChunks);
        var fastIdx = buildFastIndex(allVecs, actualDim || meta.vector_dim || 1024);
        _kbCache[dp] = { chunks: allChunks, vectors: fastIdx ? null : allVecs, meta: meta, fastIndex: fastIdx };

        if (isComplete && allChunks.length > 0 && allVecs.length > 0 && actualDim > 0) {
            sendProgress('⚡ 生成快速索引...', { phase: 'fast_index' });
            try {
                var qResult = quantizeVectors(allVecs, actualDim);
                var chunkMeta = allChunks.map(function (c) {
                    return { f: c.fileName, ch: c.chapterHint || '' };
                });
                var indexData = {
                    version: '2.0',
                    count: qResult.count,
                    dim: qResult.dim,
                    model: currentModel,
                    normalized: true,
                    quantized: 'int8',
                    fp_hash: CryptoJS.MD5(JSON.stringify(newFp)).toString(),
                    vectors_b64: typedArrayToB64(qResult.int8Data),
                    scales_b64: typedArrayToB64(qResult.scales),
                    chunk_meta: chunkMeta
                };
                await writeJsonSafe(cachePath(dp), CFG.F_FAST_INDEX, indexData);
                sendProgress('⚡ 快速索引已生成', { phase: 'fast_index_done' });
            } catch (fiErr) {
                console.error('[IKBS] 快速索引生成失败: ' + fiErr.message);
            }
        }

        var elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
        sendProgress('✅ 构建完成! ' + allChunks.length + ' 块, 维度 ' + actualDim + ', 耗时 ' + elapsedTotal + 's', {
            phase: 'complete', total_chunks: allChunks.length, dimensions: actualDim, elapsed_sec: elapsedTotal
        });

        return {
            kb: _kbCache[dp],
            stats: {
                total_files: fileNames.length,
                files_indexed: filesIndexed.length,
                files_embedded: Object.keys(embeddedSet).length,
                embed_errors: embedErrors,
                total_chunks: allChunks.length,
                new_chunks: totalNewChunks,
                total_chars: totalChars,
                vector_dim: actualDim,
                elapsed_sec: elapsedTotal,
                from_cache: false
            }
        };
    }

    // =========================================================================
    // 从磁盘加载完整知识库
    // =========================================================================
    async function loadKBFromDisk(dp, meta) {
        if (!meta || !meta.files_indexed) return null;
        var allChunks = [];
        for (var i = 0; i < meta.files_indexed.length; i++) {
            var fi = meta.files_indexed[i];
            var fc = await readFileChunks(dp, fi.name);
            if (fc && fc.length > 0) {
                for (var j = 0; j < fc.length; j++) {
                    allChunks.push({
                        chunk_id: allChunks.length,
                        fileName: fc[j].fileName,
                        chapterHint: fc[j].chapterHint || '',
                        _hasText: false
                    });
                }
            }
        }
        if (allChunks.length === 0) return null;
        var vecs = await loadAllVectors(dp, allChunks);
        var hasAnyVec = false;
        for (var k = 0; k < vecs.length; k++) {
            if (vecs[k]) { hasAnyVec = true; break; }
        }
        if (!hasAnyVec) return null;
        // 从实际向量推断维度并验证一致性
        var loadedDim = 0;
        for (var m = 0; m < vecs.length; m++) {
            if (vecs[m]) {
                if (loadedDim === 0) {
                    loadedDim = vecs[m].length;
                } else if (vecs[m].length !== loadedDim) {
                    // 向量维度不一致，缓存已损坏
                    return null;
                }
            }
        }
        if (loadedDim > 0) {
            if (meta.vector_dim && meta.vector_dim !== loadedDim) {
                // meta记录的维度与实际向量不一致，缓存不可信
                return null;
            }
            meta.vector_dim = loadedDim;
        }
        var fastIdx = buildFastIndex(vecs, loadedDim || (meta.vector_dim || 0));
        return { chunks: allChunks, vectors: vecs, meta: meta, fastIndex: fastIdx };
    }

    async function loadAllVectors(dp, chunks) {
        var fileOrder = [];
        var fileChunkCount = {};
        chunks.forEach(function (c) {
            if (!fileChunkCount[c.fileName]) {
                fileChunkCount[c.fileName] = 0;
                fileOrder.push(c.fileName);
            }
            fileChunkCount[c.fileName]++;
        });
        var result = [];
        for (var i = 0; i < fileOrder.length; i++) {
            var fn = fileOrder[i];
            var vecs = await readFileVectors(dp, fn);
            var count = fileChunkCount[fn];
            if (vecs && vecs.length === count) {
                for (var j = 0; j < vecs.length; j++) result.push(vecs[j]);
            } else {
                for (var j2 = 0; j2 < count; j2++) result.push(null);
            }
        }
        return result;
    }

    // =========================================================================
    // 高性能搜索引擎：预归一化 + 扁平Float32Array
    // =========================================================================
    function buildFastIndex(vectors, dim) {
        if (!vectors || !vectors.length || !dim) return null;
        var count = vectors.length;
        var flat = new Float32Array(count * dim);
        var validMask = new Uint8Array(count);
        for (var i = 0; i < count; i++) {
            var v = vectors[i];
            if (!v || v.length !== dim) continue;
            validMask[i] = 1;
            var offset = i * dim;
            var norm = 0;
            for (var j = 0; j < dim; j++) {
                var val = v[j];
                flat[offset + j] = val;
                norm += val * val;
            }
            norm = Math.sqrt(norm);
            if (norm > 0) {
                var invNorm = 1.0 / norm;
                for (var j2 = 0; j2 < dim; j2++) {
                    flat[offset + j2] *= invNorm;
                }
            }
        }
        return { flat: flat, validMask: validMask, dim: dim, count: count };
    }

    // =========================================================================
    // Int8 量化 + 快速索引持久化
    // =========================================================================
    function quantizeVectors(vectors, dim) {
        var count = vectors.length;
        var int8Data = new Int8Array(count * dim);
        var scales = new Float32Array(count);
        for (var i = 0; i < count; i++) {
            var v = vectors[i];
            if (!v || v.length !== dim) { scales[i] = 0; continue; }
            var norm = 0;
            for (var j = 0; j < dim; j++) norm += v[j] * v[j];
            norm = Math.sqrt(norm);
            if (norm === 0) { scales[i] = 0; continue; }
            var invNorm = 1.0 / norm;
            var maxAbs = 0;
            for (var j2 = 0; j2 < dim; j2++) {
                var nv = v[j2] * invNorm;
                var a = nv < 0 ? -nv : nv;
                if (a > maxAbs) maxAbs = a;
            }
            var scale = maxAbs > 0 ? 127.0 / maxAbs : 0;
            scales[i] = maxAbs > 0 ? maxAbs / 127.0 : 0;
            var offset = i * dim;
            for (var j3 = 0; j3 < dim; j3++) {
                int8Data[offset + j3] = Math.round(v[j3] * invNorm * scale);
            }
        }
        return { int8Data: int8Data, scales: scales, dim: dim, count: count };
    }

    function typedArrayToB64(arr) {
        var u8 = new Uint8Array(arr.buffer);
        var s = '';
        var CHUNK = 8192;
        for (var i = 0; i < u8.length; i += CHUNK) {
            var end = Math.min(i + CHUNK, u8.length);
            for (var j = i; j < end; j++) s += String.fromCharCode(u8[j]);
        }
        return b64Encode(s);
    }

    function b64ToInt8Array(b64, expectedLen) {
        var raw = b64Decode(b64);
        var u8 = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
        return new Int8Array(u8.buffer, 0, expectedLen);
    }

    function b64ToFloat32Array(b64, expectedLen) {
        var raw = b64Decode(b64);
        var u8 = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
        return new Float32Array(u8.buffer, 0, expectedLen);
    }

    function b64Encode(str) {
        if (typeof btoa === 'function') {
            try { return btoa(str); } catch (_) {}
        }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var out = '', i = 0;
        while (i < str.length) {
            var c1 = str.charCodeAt(i++);
            var c2 = i < str.length ? str.charCodeAt(i++) : NaN;
            var c3 = i < str.length ? str.charCodeAt(i++) : NaN;
            out += chars.charAt(c1 >> 2);
            out += chars.charAt(((c1 & 3) << 4) | ((isNaN(c2) ? 0 : c2) >> 4));
            out += isNaN(c2) ? '=' : chars.charAt(((c2 & 15) << 2) | ((isNaN(c3) ? 0 : c3) >> 6));
            out += isNaN(c3) ? '=' : chars.charAt(c3 & 63);
        }
        return out;
    }

    function b64Decode(str) {
        if (typeof atob === 'function') {
            try { return atob(str); } catch (_) {}
        }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var out = '';
        str = str.replace(/[^A-Za-z0-9+/]/g, '');
        for (var i = 0; i < str.length; i += 4) {
            var a = chars.indexOf(str.charAt(i));
            var b = chars.indexOf(str.charAt(i + 1));
            var c = chars.indexOf(str.charAt(i + 2));
            var d = chars.indexOf(str.charAt(i + 3));
            out += String.fromCharCode((a << 2) | (b >> 4));
            if (c !== -1 && c !== 64) out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
            if (d !== -1 && d !== 64) out += String.fromCharCode(((c & 3) << 6) | d);
        }
        return out;
    }

    async function loadFastIndexFromDisk(dp) {
        try {
            var fp = cachePath(dp) + CFG.F_FAST_INDEX;
            if (!(await fileExists(fp))) return null;
            var c = await Tools.Files.read(fp, 'android');
            if (!c || !c.content) return null;
            var data = JSON.parse(c.content);
            if (!data || data.version !== '2.0' || !data.vectors_b64) return null;
            if (data.model !== getModel()) return null;
            var curFp = await genFingerprints(dp);
            var curHash = CryptoJS.MD5(JSON.stringify(curFp)).toString();
            if (data.fp_hash !== curHash) return null;
            var int8Data = b64ToInt8Array(data.vectors_b64, data.count * data.dim);
            var scalesArr = b64ToFloat32Array(data.scales_b64, data.count);
            var chunks = data.chunk_meta.map(function (m, i) {
                return { chunk_id: i, fileName: m.f, chapterHint: m.ch, _hasText: false };
            });
            var filesIndexed = [];
            var fileChkCount = {};
            chunks.forEach(function (ck) {
                if (!fileChkCount[ck.fileName]) { fileChkCount[ck.fileName] = 0; filesIndexed.push({ name: ck.fileName, chunks: 0 }); }
                fileChkCount[ck.fileName]++;
            });
            filesIndexed.forEach(function (f) { f.chunks = fileChkCount[f.name]; });
            return {
                chunks: chunks,
                fastIndex: { int8Data: int8Data, scales: scalesArr, dim: data.dim, count: data.count, quantized: true },
                meta: { vector_dim: data.dim, embed_model: data.model, total_chunks: data.count,
                    build_complete: true, files_indexed: filesIndexed, total_files: filesIndexed.length },
                vectors: null
            };
        } catch (e) {
            console.error('[IKBS] 快速索引加载失败: ' + e.message);
            return null;
        }
    }

    async function loadChunkTexts(dp, chunkIds, allChunks) {
        var needLoad = false;
        for (var ni = 0; ni < chunkIds.length; ni++) {
            var nid = chunkIds[ni];
            if (nid >= 0 && nid < allChunks.length) {
                var nc = allChunks[nid];
                if (nc && (nc._hasText === false || !nc.text)) { needLoad = true; break; }
            }
        }
        if (!needLoad) return;

        // 优先尝试合并文件（单次 I/O）
        var mergedPath = cachePath(dp) + CFG.F_ALL_CHUNKS;
        if (await fileExists(mergedPath)) {
            try {
                var mc = await Tools.Files.read(mergedPath, 'android');
                if (mc && mc.content) {
                    var allTexts = JSON.parse(mc.content);
                    if (Array.isArray(allTexts) && allTexts.length === allChunks.length) {
                        for (var mi = 0; mi < chunkIds.length; mi++) {
                            var mid = chunkIds[mi];
                            if (mid >= 0 && mid < allChunks.length && allTexts[mid]) {
                                allChunks[mid].text = allTexts[mid];
                                allChunks[mid]._hasText = true;
                            }
                        }
                        return;
                    }
                }
            } catch (_mcErr) { }
        }

        // 回退：按文件分组加载
        var fileGroups = {};
        chunkIds.forEach(function (id) {
            if (id < 0 || id >= allChunks.length) return;
            var c = allChunks[id];
            if (!c || (c._hasText !== false && c.text)) return;
            if (!fileGroups[c.fileName]) fileGroups[c.fileName] = [];
            fileGroups[c.fileName].push(id);
        });
        var fnames = Object.keys(fileGroups);
        for (var i = 0; i < fnames.length; i++) {
            var fn = fnames[i];
            var fc = await readFileChunks(dp, fn);
            if (!fc) continue;
            var fileStartId = -1;
            for (var j = 0; j < allChunks.length; j++) {
                if (allChunks[j].fileName === fn) { fileStartId = j; break; }
            }
            if (fileStartId < 0) continue;
            fileGroups[fn].forEach(function (id) {
                var localIdx = id - fileStartId;
                if (localIdx >= 0 && localIdx < fc.length) {
                    allChunks[id].text = fc[localIdx].text;
                    allChunks[id]._hasText = true;
                }
            });
        }
    }

    function getCachedQueryVec(query) {
        var key = CryptoJS.MD5(query).toString();
        return _queryCache[key] || null;
    }

    function setCachedQueryVec(query, vec) {
        var key = CryptoJS.MD5(query).toString();
        if (!_queryCache[key]) {
            _queryCacheKeys.push(key);
            if (_queryCacheKeys.length > QUERY_CACHE_MAX) {
                var old = _queryCacheKeys.shift();
                delete _queryCache[old];
            }
        }
        _queryCache[key] = vec;
    }

    /**
     * 最小堆冒泡：将 heap[0] 下沉到正确位置
     * 比每次 sort 更高效（O(log n) vs O(n log n)）
     */
    function heapBubbleUp(heap) {
        var n = heap.length;
        var pos = 0;
        while (true) {
            var left = 2 * pos + 1;
            var right = 2 * pos + 2;
            var smallest = pos;
            if (left < n && heap[left].score < heap[smallest].score) smallest = left;
            if (right < n && heap[right].score < heap[smallest].score) smallest = right;
            if (smallest === pos) break;
            var tmp = heap[pos];
            heap[pos] = heap[smallest];
            heap[smallest] = tmp;
            pos = smallest;
        }
    }

    function fastDotSearch(queryVec, fastIdx, threshold, topK) {
        var dim = fastIdx.dim;
        var count = fastIdx.count;
        var qNorm = 0;
        for (var qi = 0; qi < dim; qi++) qNorm += queryVec[qi] * queryVec[qi];
        qNorm = Math.sqrt(qNorm);
        if (qNorm < 1e-10) return [];
        var inv = 1.0 / qNorm;
        var heap = [];
        var heapMin = threshold;

        if (fastIdx.quantized) {
            var int8Data = fastIdx.int8Data;
            var scales = fastIdx.scales;
            var qNormed = new Float32Array(dim);
            for (var qi2 = 0; qi2 < dim; qi2++) qNormed[qi2] = queryVec[qi2] * inv;
            var qMaxAbs = 0;
            for (var qi3 = 0; qi3 < dim; qi3++) {
                var a = qNormed[qi3] < 0 ? -qNormed[qi3] : qNormed[qi3];
                if (a > qMaxAbs) qMaxAbs = a;
            }
            var qScale = qMaxAbs > 0 ? 127.0 / qMaxAbs : 0;
            var qInt8 = new Int8Array(dim);
            for (var qi4 = 0; qi4 < dim; qi4++) qInt8[qi4] = Math.round(qNormed[qi4] * qScale);
            var qInvScale = qMaxAbs > 0 ? qMaxAbs / 127.0 : 0;
            for (var i = 0; i < count; i++) {
                if (scales[i] === 0) continue;
                var offset = i * dim;
                var dot = 0;
                var j = 0, limit = dim - 3;
                for (; j < limit; j += 4) {
                    dot += qInt8[j] * int8Data[offset + j]
                         + qInt8[j + 1] * int8Data[offset + j + 1]
                         + qInt8[j + 2] * int8Data[offset + j + 2]
                         + qInt8[j + 3] * int8Data[offset + j + 3];
                }
                for (; j < dim; j++) dot += qInt8[j] * int8Data[offset + j];
                var sim = dot * qInvScale * scales[i];
                if (sim < heapMin) continue;
                if (heap.length < topK) {
                    heap.push({ idx: i, score: sim });
                    if (heap.length === topK) {
                        heap.sort(function (a, b) { return a.score - b.score; });
                        heapMin = heap[0].score;
                    }
                } else if (sim > heap[0].score) {
                    heap[0] = { idx: i, score: sim };
                    heapBubbleUp(heap);
                    heapMin = heap[0].score;
                }
            }
        } else {
            var flat = fastIdx.flat;
            var mask = fastIdx.validMask;
            var qNormed2 = new Float32Array(dim);
            for (var qi5 = 0; qi5 < dim; qi5++) qNormed2[qi5] = queryVec[qi5] * inv;
            for (var i2 = 0; i2 < count; i2++) {
                if (!mask[i2]) continue;
                var offset2 = i2 * dim;
                var dot2 = 0;
                var j2 = 0, limit2 = dim - 3;
                for (; j2 < limit2; j2 += 4) {
                    dot2 += qNormed2[j2] * flat[offset2 + j2]
                          + qNormed2[j2 + 1] * flat[offset2 + j2 + 1]
                          + qNormed2[j2 + 2] * flat[offset2 + j2 + 2]
                          + qNormed2[j2 + 3] * flat[offset2 + j2 + 3];
                }
                for (; j2 < dim; j2++) dot2 += qNormed2[j2] * flat[offset2 + j2];
                if (dot2 < heapMin) continue;
                if (heap.length < topK) {
                    heap.push({ idx: i2, score: dot2 });
                    if (heap.length === topK) {
                        heap.sort(function (a, b) { return a.score - b.score; });
                        heapMin = heap[0].score;
                    }
                } else if (dot2 > heap[0].score) {
                    heap[0] = { idx: i2, score: dot2 };
                    heapBubbleUp(heap);
                    heapMin = heap[0].score;
                }
            }
        }

        heap.sort(function (a, b) { return b.score - a.score; });
        return heap;
    }    

    // =========================================================================
    // 搜索引擎
    // =========================================================================
    async function semanticSearch(dp, query, topK, threshold, expandCtx) {
        var r = await buildKB(dp, false);
        var kb = r.kb;
        if (!kb.chunks.length) return { results: [], searchMethod: 'none', message: '知识库为空' };

        var results = [], method = 'keyword';
        var hasVec = !!kb.fastIndex || (kb.vectors && kb.vectors.length > 0 && kb.vectors.some(function (v) { return v !== null; }));

        if (hasVec) {
            try {
                var cachedVec = getCachedQueryVec(query);
                var qv;
                if (cachedVec) {
                    qv = [cachedVec];
                } else {
                    qv = await callEmbed([query]);
                    if (qv.length > 0 && qv[0]) setCachedQueryVec(query, qv[0]);
                }
                if (qv.length > 0 && qv[0]) {
                    var queryDim = qv[0].length;
                    // 验证查询向量维度与知识库向量维度一致
                    var kbDim = 0;
                    if (kb.meta && kb.meta.vector_dim) {
                        kbDim = kb.meta.vector_dim;
                    } else {
                        for (var di = 0; di < kb.vectors.length; di++) {
                            if (kb.vectors[di]) { kbDim = kb.vectors[di].length; break; }
                        }
                    }
                    if (kbDim > 0 && queryDim !== kbDim) {
                        console.error('[IKBS] 维度不匹配: 查询 ' + queryDim + 'd, 知识库 ' + kbDim + 'd，自动重建');
                        // 维度不匹配，自动强制重建知识库
                        delete _kbCache[dp];
                        var rebuildResult = await buildKB(dp, true, undefined, undefined, undefined, 1);
                        kb = rebuildResult.kb;
                        hasVec = !!kb.fastIndex || (kb.vectors && kb.vectors.length > 0 && kb.vectors.some(function (v) { return v !== null; }));
                        if (hasVec) {
                            // 重建后重新搜索
                            var qv2 = await callEmbed([query]);
                            if (qv2.length > 0 && qv2[0]) {
                                if (kb.fastIndex) {
                                    var fastResults2 = fastDotSearch(qv2[0], kb.fastIndex, threshold, topK);
                                    results = fastResults2.map(function (r) {
                                        return {
                                            chunk_id: r.idx,
                                            score: Math.round(r.score * 10000) / 10000,
                                            chunk: kb.chunks[r.idx]
                                        };
                                    });
                                } else {
                                    var sims2 = [];
                                    for (var idx2 = 0; idx2 < kb.vectors.length; idx2++) {
                                        var v2 = kb.vectors[idx2];
                                        if (!v2) continue;
                                        var s2 = cosSim(qv2[0], v2);
                                        if (s2 >= threshold) {
                                            sims2.push({ chunk_id: idx2, score: Math.round(s2 * 10000) / 10000, chunk: kb.chunks[idx2] });
                                        }
                                    }
                                    sims2.sort(function (a, b) { return b.score - a.score; });
                                    results = sims2.slice(0, topK);
                                }
                                method = 'semantic';
                            }
                        }
                    } else {
                    // 优先使用快速索引
                    if (kb.fastIndex) {
                        var fastResults = fastDotSearch(qv[0], kb.fastIndex, threshold, topK);
                        results = fastResults.map(function (r) {
                            return {
                                chunk_id: r.idx,
                                score: Math.round(r.score * 10000) / 10000,
                                chunk: kb.chunks[r.idx]
                            };
                        });
                    } else {
                        var sims = [];
                        for (var idx = 0; idx < kb.vectors.length; idx++) {
                            var v = kb.vectors[idx];
                            if (!v) continue;
                            var s = cosSim(qv[0], v);
                            if (s >= threshold) {
                                sims.push({ chunk_id: idx, score: Math.round(s * 10000) / 10000, chunk: kb.chunks[idx] });
                            }
                        }
                        sims.sort(function (a, b) { return b.score - a.score; });
                        results = sims.slice(0, topK);
                    }
                    method = 'semantic';
                    }
                }
            } catch (e) {
                console.error('[IKBS] 语义搜索降级: ' + e.message);
            }
        }

        if (!results.length) {
            var needKwFullText = kb.chunks.length > 0 && (kb.chunks[0]._hasText === false || !kb.chunks[0].text);
            if (needKwFullText) {
                var allKwIds = [];
                for (var kwi = 0; kwi < kb.chunks.length; kwi++) allKwIds.push(kwi);
                await loadChunkTexts(dp, allKwIds, kb.chunks);
            }
            results = kwSearch(query, kb.chunks, topK, threshold);
            method = results.length ? 'keyword' : 'none';
        }

        if (results.length) {
            var needTextIds = [];
            results.forEach(function (r) {
                var id = r.chunk_id;
                needTextIds.push(id);
                if (expandCtx) {
                    if (id > 0) needTextIds.push(id - 1);
                    if (id < kb.chunks.length - 1) needTextIds.push(id + 1);
                }
            });
            await loadChunkTexts(dp, needTextIds, kb.chunks);
        }

        if (expandCtx && results.length) {
            results = expandContext(results, kb.chunks);
        }

        return {
            results: results.map(function (r) {
                var c = r.chunk || kb.chunks[r.chunk_id];
                if (!c) return null;
                var o = { chunk_id: r.chunk_id, score: r.score, file: c.fileName, chapter: c.chapterHint || '', content: c.text };
                if (r.context_before) o.context_before = r.context_before;
                if (r.context_after) o.context_after = r.context_after;
                return o;
            }).filter(function (x) { return x; }),
            searchMethod: method,
            totalChunks: kb.chunks.length,
            query: query
        };
    }

    function kwSearch(q, chunks, topK, threshold) {
        var kw = q.toLowerCase().split(/[\s,，。、；;：:！!？?""''（）()\-\—]+/)
            .filter(function (w) { return w.length > 1; });
        if (!kw.length) return [];
        var scores = [];
        chunks.forEach(function (c, idx) {
            var t = c.text.toLowerCase(), mc = 0, tw = 0;
            kw.forEach(function (k) {
                if (t.indexOf(k) !== -1) {
                    mc++;
                    var cnt = 0, pos = -1;
                    while ((pos = t.indexOf(k, pos + 1)) !== -1) cnt++;
                    tw += Math.min(cnt, 5);
                }
            });
            if (mc > 0) {
                var s = (mc / kw.length) * 0.7 + Math.min(tw / (kw.length * 3), 1) * 0.3;
                if (s >= threshold * 0.5) {
                    scores.push({ chunk_id: idx, score: Math.round(s * 10000) / 10000, chunk: c });
                }
            }
        });
        scores.sort(function (a, b) { return b.score - a.score; });
        return scores.slice(0, topK);
    }

    function expandContext(results, allChunks) {
        return results.map(function (r) {
            var id = r.chunk_id, c = r.chunk || allChunks[id];
            if (!c) return r;
            var exp = { chunk_id: id, score: r.score, chunk: c };
            if (id > 0 && allChunks[id - 1] && allChunks[id - 1].fileName === c.fileName) {
                exp.context_before = allChunks[id - 1].text;
            }
            if (id < allChunks.length - 1 && allChunks[id + 1] && allChunks[id + 1].fileName === c.fileName) {
                exp.context_after = allChunks[id + 1].text;
            }
            return exp;
        });
    }

    async function multiQuery(dp, queries, topK, threshold) {
        var r = await buildKB(dp, false);
        var kb = r.kb;
        if (!kb.chunks.length) return { results: [], message: '知识库为空' };

        var allRes = [], K = 60;
        for (var qi = 0; qi < queries.length; qi++) {
            var q = queries[qi];
            if (!q || typeof q !== 'string' || !q.trim()) continue;
            var sr = await semanticSearch(dp, q, topK * 2, threshold, false);
            allRes.push(sr.results);
        }

        var rrf = {};
        allRes.forEach(function (res) {
            res.forEach(function (r, rank) {
                var id = r.chunk_id;
                if (!rrf[id]) {
                    rrf[id] = { chunk_id: id, file: r.file, chapter: r.chapter, content: r.content, rrf: 0, hits: 0, best: 0 };
                }
                rrf[id].rrf += 1.0 / (K + rank + 1);
                rrf[id].hits++;
                rrf[id].best = Math.max(rrf[id].best, r.score);
            });
        });

        var merged = Object.keys(rrf).map(function (id) { return rrf[id]; });
        merged.sort(function (a, b) { return b.rrf - a.rrf; });
        var top = merged.slice(0, topK);

        var expandIds = [];
        top.forEach(function (r) {
            expandIds.push(r.chunk_id);
            if (r.chunk_id > 0) expandIds.push(r.chunk_id - 1);
            if (r.chunk_id < kb.chunks.length - 1) expandIds.push(r.chunk_id + 1);
        });
        await loadChunkTexts(dp, expandIds, kb.chunks);

        var expanded = expandContext(
            top.map(function (r) { return { chunk_id: r.chunk_id, score: r.best, chunk: kb.chunks[r.chunk_id] }; }),
            kb.chunks
        );

        return {
            results: expanded.map(function (r, i) {
                var ri = top[i];
                return {
                    chunk_id: r.chunk_id, score: ri.best,
                    rrf_score: Math.round(ri.rrf * 10000) / 10000,
                    hit_queries: ri.hits, file: ri.file,
                    chapter: ri.chapter, content: ri.content,
                    context_before: r.context_before || '',
                    context_after: r.context_after || ''
                };
            }),
            queries_executed: queries.length,
            fusion_method: 'RRF'
        };
    }

    // =========================================================================
    // 工具函数
    // =========================================================================
    function trunc(t, n) {
        return (!t || t.length <= n) ? (t || '') : t.substring(0, n) + '...';
    }

    function fmtSize(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
        return (b / 1048576).toFixed(1) + ' MB';
    }

    function fmtNum(n) {
        return n < 10000 ? String(n) : (n / 10000).toFixed(1) + ' 万';
    }

    // =========================================================================
    // Handler 实现
    // =========================================================================
    async function searchHandler(p) {
        var dp = normPath(p.path), q = p.query;
        if (!q || !q.trim()) throw new Error("参数 'query' 不能为空");
        var topK = Math.min(Math.max(parseInt(String(p.top_k !== undefined && p.top_k !== null ? p.top_k : 5), 10) || 5, 1), 30);
        var th = p.threshold !== undefined && p.threshold !== null ? parseFloat(String(p.threshold)) : CFG.DEFAULT_THRESHOLD;
        if (isNaN(th)) th = CFG.DEFAULT_THRESHOLD;
        var ec = p.expand_context !== false;

        // 确保知识库已构建
        var buildResult = await buildKB(dp, false);

        // 优先尝试 Python 引擎（mmap 极速检索）
        if (await isPyEngineAvailable()) {
            try {
                sendProgress('🐍 Python 引擎搜索...', { phase: 'py_search' });
                var vec = await getQueryEmbedding(q.trim());
                var pyRes = await runPyEngine('search', p.path, [
                    JSON.stringify(vec), topK, th, ec ? 'true' : 'false'
                ]);
                if (pyRes.data && pyRes.data.length > 0) {
                    var pyLines = ['## 搜索结果 (' + pyRes.data.length + ' 条, Python 语义搜索, 共 ' + (pyRes.total_chunks || buildResult.kb.chunks.length) + ' 块)', ''];
                    pyRes.data.forEach(function (x, i) {
                        var scoreDisplay = (x.score * 100).toFixed(1) + '%';
                        pyLines.push('### 结果 ' + (i + 1) + ' | 匹配: ' + scoreDisplay + ' | 文件: ' + (x.fileName || '未知') + (x.chapterHint ? ' | ' + x.chapterHint : ''));
                        pyLines.push('');
                        if (x.context_before) { pyLines.push('[前文] ' + trunc(x.context_before, 150)); pyLines.push(''); }
                        pyLines.push(x.text || '');
                        if (x.context_after) { pyLines.push(''); pyLines.push('[后文] ' + trunc(x.context_after, 150)); }
                        pyLines.push('');
                        pyLines.push('> chunk_id: ' + (x.chunk_id !== undefined ? x.chunk_id : '?'));
                        pyLines.push('---');
                    });
                    return { success: true, message: '找到 ' + pyRes.data.length + ' 条 (Python 语义搜索)', data: pyLines.join('\n') };
                }
                // Python 返回空结果，降级到 JS 关键词搜索
            } catch (pyErr) {
                console.error('[IKBS] Python 搜索降级: ' + pyErr.message);
                if (getEnvConfig().forcePython) {
                    throw new Error('Python 引擎必需但失败: ' + pyErr.message +
                        '\n请检查: Python 脚本路径 ' + getScriptPath() +
                        ', Python 解释器 ' + getPyBin() +
                        ', numpy 已安装');
                }
            }
        } else if (getEnvConfig().forcePython) {
            throw new Error('Python 引擎必需但不可用。请确认脚本路径: ' + getScriptPath());
        }

        // JS 引擎降级搜索
        var r = await semanticSearch(dp, q, topK, th, ec);
        if (!r.results.length) {
            return {
                success: true,
                message: '未找到相关结果 (方法: ' + r.searchMethod + ', 总块数: ' + r.totalChunks + ')',
                data: { query: q, results: [], searchMethod: r.searchMethod, totalChunks: r.totalChunks }
            };
        }

        var lines = ['## 搜索结果 (' + r.results.length + ' 条, ' + r.searchMethod + ', 共 ' + r.totalChunks + ' 块)', ''];
        r.results.forEach(function (x, i) {
            lines.push('### 结果 ' + (i + 1) + ' | 匹配: ' + x.score + ' | 文件: ' + x.file + (x.chapter ? ' | ' + x.chapter : ''));
            lines.push('');
            if (x.context_before) { lines.push('[前文] ' + trunc(x.context_before, 150)); lines.push(''); }
            lines.push(x.content);
            if (x.context_after) { lines.push(''); lines.push('[后文] ' + trunc(x.context_after, 150)); }
            lines.push('');
            lines.push('> chunk_id: ' + x.chunk_id);
            lines.push('---');
        });

        return { success: true, message: '找到 ' + r.results.length + ' 条 (' + r.searchMethod + ')', data: lines.join('\n') };
    }

    async function buildHandler(p) {
        var dp = normPath(p.path);
        var force = p.force_rebuild === true;
        var r = await buildKB(dp, force, p.chunk_size, p.chunk_overlap, p.concurrency);
        var s = r.stats;

        var isComplete = r.kb.meta.build_complete !== false;
        var incompleteCount = r.kb.meta.files_incomplete || 0;

        var lines = [
            isComplete ? '# 知识库构建完成' : '# 知识库部分构建', '',
            '- 目录: ' + dp,
            '- 总文件数: ' + s.total_files,
            '- 已索引: ' + s.files_indexed + ' 个文件',
        ];
        if (!isComplete) lines.push('- ⚠ 未完成: ' + incompleteCount + ' 个文件');
        lines.push('- 总分块: ' + s.total_chunks);
        lines.push('- 向量维度: ' + s.vector_dim);
        lines.push('- 嵌入模型: ' + getModel());
        lines.push('- 耗时: ' + s.elapsed_sec + 's');
        if (s.embed_errors > 0) lines.push('- ⚠ 向量化失败: ' + s.embed_errors + ' 个文件');
        if (s.total_chars > 0) lines.push('- 总字符: ' + fmtNum(s.total_chars));
        if (s.from_cache) lines.push('- 模式: 从缓存加载');

        if (r.kb.meta.files_indexed && r.kb.meta.files_indexed.length > 0) {
            lines.push('');
            lines.push('## 已索引文件 (' + r.kb.meta.files_indexed.length + ')');
            r.kb.meta.files_indexed.forEach(function (f) {
                lines.push('- ' + f.name + ' (' + f.chunks + ' 块)');
            });
        }

        if (!isComplete && r.kb.meta.files_incomplete_list && r.kb.meta.files_incomplete_list.length > 0) {
            lines.push('');
            lines.push('## ⚠ 未完成文件 (' + incompleteCount + ')');
            r.kb.meta.files_incomplete_list.forEach(function (fn) {
                lines.push('- ' + fn);
            });
            lines.push('');
            lines.push('> 再次调用 build 即可断点续建');
        }

        var msgText = isComplete
            ? '构建完成: ' + s.total_chunks + ' 块, 维度 ' + s.vector_dim
            : '部分完成: ' + s.files_indexed + '/' + s.total_files + ' 文件, ' + incompleteCount + ' 个待续建';

        // 构建完成后自动触发 Python 引擎索引优化
        if (isComplete && s.total_chunks > 0) {
            try {
                if (await isPyEngineAvailable()) {
                    sendProgress('🐍 自动优化 Python 引擎索引...', { phase: 'py_auto_optimize' });
                    var pyOptRes = await runPyEngine('optimize', p.path, []);
                    lines.push('');
                    lines.push('## Python 引擎索引');
                    lines.push('- 状态: ✅ 已自动优化');
                    lines.push('- ' + (pyOptRes.message || ''));
                }
            } catch (pyErr) {
                lines.push('');
                lines.push('## Python 引擎索引');
                lines.push('- 状态: ⚠ 自动优化失败 (' + pyErr.message + ')');
                lines.push('- 可手动调用 rebuild_index 重试');
            }
        }

        return { success: true, message: msgText, data: lines.join('\n') };
    }

    async function statusHandler(p) {
        var dp = normPath(p.path);
        var meta = await readJson(cachePath(dp), CFG.F_META);
        var progress = await readProgress(dp);

        if (!meta) {
            return {
                success: true,
                message: '知识库尚未创建，使用 build 或 search 自动创建。',
                data: { status: 'not_built', docs_path: dp }
            };
        }

        var lines = [
            '# 知识库状态', '',
            '- 状态: ' + (meta.build_complete ? '✅ 已就绪' : '⏳ 构建中/未完成'),
            '- 目录: ' + meta.docs_path,
            '- 创建时间: ' + meta.created_at,
            '- 文件数: ' + meta.total_files,
            '- 分块数: ' + meta.total_chunks,
            '- 向量维度: ' + meta.vector_dim,
            '- 分块大小: ' + meta.chunk_size,
            '- 重叠: ' + meta.chunk_overlap,
            '- 模型: ' + meta.embed_model
        ];

        var currentModel = getModel();
        if (meta.embed_model && meta.embed_model !== currentModel) {
            lines.push('');
            lines.push('## ⚠ 模型不匹配');
            lines.push('- 构建时使用: ' + meta.embed_model);
            lines.push('- 当前配置: ' + currentModel);
            lines.push('- 建议: 使用 build(force_rebuild=true) 重建知识库');
        }

        if (progress && progress.pending && progress.pending.length > 0) {
            lines.push('');
            lines.push('## ⚠ 未完成的构建');
            lines.push('- 已完成向量化: ' + (progress.embedded ? progress.embedded.length : 0));
            lines.push('- 已完成分块: ' + (progress.chunked ? progress.chunked.length : 0));
            lines.push('- 待处理: ' + progress.pending.length);
            lines.push('- 开始时间: ' + (progress.started_at || '未知'));
            lines.push('- 提示: 调用 build 会自动断点续建');
        }

        if (meta.files_indexed && meta.files_indexed.length) {
            lines.push('');
            lines.push('## 已索引文件 (' + meta.files_indexed.length + ')');
            meta.files_indexed.forEach(function (f) {
                lines.push('- ' + f.name + ': ' + f.chunks + ' 块');
            });
        }

        // Python 引擎索引状态
        if (await isPyEngineAvailable()) {
            try {
                var pyStatus = await runPyEngine('status', p.path, []);
                if (pyStatus.data) {
                    lines.push('');
                    lines.push('## Python 引擎索引');
                    lines.push('- 状态: ' + (pyStatus.data.optimized ? '✅ 已优化' : '⬜ 未优化'));
                    if (pyStatus.data.optimized) {
                        lines.push('- 分块数: ' + (pyStatus.data.total_chunks || 0));
                        lines.push('- 索引大小: ' + (pyStatus.data.vectors_size_mb || 0) + ' MB');
                        if (pyStatus.data.needs_reoptimize) lines.push('- ⚠ 需要重新优化（rebuild_index）');
                    } else {
                        lines.push('- 提示: 运行 rebuild_index 创建优化索引');
                    }
                }
            } catch (_) {
                lines.push('');
                lines.push('## Python 引擎索引');
                lines.push('- 状态: ⚠ 查询失败');
            }
        }

        try {
            var cur = await genFingerprints(dp);
            var ch = await detectChanges(dp, cur);
            if (ch.added.length || ch.modified.length || ch.removed.length) {
                lines.push('');
                lines.push('## 待更新');
                if (ch.added.length) lines.push('- 新增: ' + ch.added.length + ' 个');
                if (ch.modified.length) lines.push('- 已修改: ' + ch.modified.length + ' 个');
                if (ch.removed.length) lines.push('- 已删除: ' + ch.removed.length + ' 个');
            }
        } catch (_) { }

        return {
            success: true,
            message: '知识库' + (meta.build_complete ? '已就绪' : '未完成') + ', ' + meta.total_chunks + ' 块, 维度 ' + meta.vector_dim,
            data: lines.join('\n')
        };
    }

    async function listFilesHandler(p) {
        var dp = normPath(p.path);
        var listing = await Tools.Files.list(dp, 'android');
        if (!listing || !Array.isArray(listing.entries)) throw new Error('无法读取目录: ' + dp);

        var meta = await readJson(cachePath(dp), CFG.F_META);
        var indexed = {};
        if (meta && meta.files_indexed) {
            meta.files_indexed.forEach(function (f) { indexed[f.name] = f.chunks; });
        }

        var oldFp = await readJson(cachePath(dp), CFG.F_FP) || {};
        var curFp = await genFingerprints(dp);

        var lines = ['# 文件列表 - ' + dp, ''];
        var sc = 0, ic = 0, ts = 0;

        listing.entries.forEach(function (e) {
            if (e.isDirectory || e.name.charAt(0) === '.' || !isSupported(e.name)) return;
            sc++;
            ts += e.size || 0;
            var st = '⬜ 未索引';
            if (indexed[e.name] !== undefined) {
                if (oldFp[e.name] && curFp[e.name] && oldFp[e.name] !== curFp[e.name]) {
                    st = '🔄 已修改';
                } else {
                    st = '✅ 已索引 (' + indexed[e.name] + ' 块)';
                    ic++;
                }
            }
            lines.push('- ' + st + ' ' + e.name + ' (' + fmtSize(e.size || 0) + ')');
        });

        lines.push('');
        lines.push('---');
        lines.push('支持文件: ' + sc + ' | 已索引: ' + ic + ' | 总大小: ' + fmtSize(ts));
        if (meta) lines.push('向量维度: ' + (meta.vector_dim || '未知') + ' | 模型: ' + (meta.embed_model || '未知'));

        return { success: true, message: sc + ' 个文件, 已索引 ' + ic, data: lines.join('\n') };
    }

    async function getChunkHandler(p) {
        var dp = normPath(p.path);
        var cid = parseInt(String(p.chunk_id), 10);
        if (isNaN(cid) || cid < 0) throw new Error("chunk_id 必须是非负整数");
        var cr = Math.min(Math.max(parseInt(String(p.context_range || 1), 10) || 1, 0), 5);

        var r = await buildKB(dp, false);
        if (cid >= r.kb.chunks.length) {
            throw new Error('chunk_id ' + cid + ' 超出范围 (共 ' + r.kb.chunks.length + ' 块)');
        }

        var rangeStart = Math.max(0, cid - cr), rangeEnd = Math.min(r.kb.chunks.length - 1, cid + cr);
        var needIds = [];
        for (var ni = rangeStart; ni <= rangeEnd; ni++) needIds.push(ni);
        await loadChunkTexts(dp, needIds, r.kb.chunks);

        var tc = r.kb.chunks[cid], tf = tc.fileName;
        var lines = ['## 分块 #' + cid + ' | 文件: ' + tf + (tc.chapterHint ? ' | ' + tc.chapterHint : ''), ''];
        var s = rangeStart, e = rangeEnd;

        for (var i = s; i <= e; i++) {
            var c = r.kb.chunks[i];
            if (c.fileName !== tf) continue;
            if (i === cid) {
                lines.push('**>>> 目标分块 #' + i + ' <<<**');
                lines.push('');
                lines.push(c.text);
                lines.push('');
            } else {
                lines.push('--- 分块 #' + i + (i < cid ? ' (前文)' : ' (后文)') + ' ---');
                lines.push(c.text);
                lines.push('');
            }
        }

        return { success: true, message: '分块 #' + cid + ' 来自 ' + tf, data: lines.join('\n') };
    }

    async function multiSearchHandler(p) {
        var dp = normPath(p.path);
        var qs = p.queries;
        if (qs && typeof qs === 'string') {
            qs = qs.trim();
            if (qs.charAt(0) === '[') {
                try { qs = JSON.parse(qs); } catch (_) { qs = [qs]; }
            } else {
                qs = qs.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
            }
        }
        if (!qs || !Array.isArray(qs) || !qs.length) throw new Error("'queries' 必须是非空字符串数组");
        var validQueries = qs.filter(function (q) { return q && typeof q === 'string' && q.trim(); });
        if (!validQueries.length) throw new Error("'queries' 中无有效查询");
        var topK = Math.min(Math.max(parseInt(String(p.top_k !== undefined && p.top_k !== null ? p.top_k : 8), 10) || 8, 1), 30);
        var th = p.threshold !== undefined && p.threshold !== null ? parseFloat(String(p.threshold)) : CFG.DEFAULT_THRESHOLD;
        if (isNaN(th)) th = CFG.DEFAULT_THRESHOLD;

        // 确保知识库已构建
        await buildKB(dp, false);

        // 优先尝试 Python 引擎
        if (await isPyEngineAvailable()) {
            try {
                sendProgress('🐍 Python 融合搜索 (' + validQueries.length + ' 个查询)...', { phase: 'py_multi_search' });
                var vecs = await getQueryEmbeddings(validQueries.map(function (q) { return q.trim(); }));
                var pyRes = await runPyEngine('multi_search', p.path, [
                    JSON.stringify(vecs), JSON.stringify(validQueries), topK, th
                ]);
                if (pyRes.data && pyRes.data.length > 0) {
                    var pyLines = ['## 融合搜索结果 (' + pyRes.data.length + ' 条, Python RRF)', '> 查询: ' + validQueries.join(' | '), ''];
                    pyRes.data.forEach(function (x, i) {
                        var scoreStr = (x.score * 100).toFixed(1) + '% | RRF: ' + (x.rrf_score || 0) + ' | 命中: ' + (x.hit_count || 0) + '/' + validQueries.length;
                        pyLines.push('### 结果 ' + (i + 1) + ' | ' + scoreStr + ' | ' + (x.fileName || '未知') + (x.chapterHint ? ' | ' + x.chapterHint : ''));
                        pyLines.push('');
                        if (x.context_before) { pyLines.push('[前文] ' + trunc(x.context_before, 150)); pyLines.push(''); }
                        pyLines.push(x.text || '');
                        if (x.context_after) { pyLines.push(''); pyLines.push('[后文] ' + trunc(x.context_after, 150)); }
                        pyLines.push('');
                        pyLines.push('> chunk_id: ' + (x.chunk_id !== undefined ? x.chunk_id : '?'));
                        pyLines.push('---');
                    });
                    return { success: true, message: '融合搜索: ' + pyRes.data.length + ' 条 (Python RRF)', data: pyLines.join('\n') };
                }
            } catch (pyErr) {
                console.error('[IKBS] Python 融合搜索降级: ' + pyErr.message);
            }
        }

        // JS 引擎降级
        var r = await multiQuery(dp, validQueries, topK, th);
        if (!r.results.length) {
            return { success: true, message: '未找到结果', data: { queries: validQueries, results: [], fusion_method: 'RRF' } };
        }

        var lines = ['## 融合搜索结果 (' + r.results.length + ' 条, JS RRF)', '> 查询: ' + validQueries.join(' | '), '> 融合: RRF', ''];
        r.results.forEach(function (x, i) {
            lines.push('### 结果 ' + (i + 1) + ' | 匹配: ' + x.score + ' | RRF: ' + x.rrf_score + ' | 命中: ' + x.hit_queries + '/' + validQueries.length + ' | ' + x.file + (x.chapter ? ' | ' + x.chapter : ''));
            lines.push('');
            if (x.context_before) { lines.push('[前文] ' + trunc(x.context_before, 150)); lines.push(''); }
            lines.push(x.content);
            if (x.context_after) { lines.push(''); lines.push('[后文] ' + trunc(x.context_after, 150)); }
            lines.push('');
            lines.push('> chunk_id: ' + x.chunk_id);
            lines.push('---');
        });

        return { success: true, message: '融合搜索: ' + r.results.length + ' 条', data: lines.join('\n') };
    }

    // =========================================================================
    // 关键词搜索 Handler
    // =========================================================================
    async function keywordSearchHandler(p) {
        var dp = normPath(p.path), q = p.query;
        if (!q || !q.trim()) throw new Error("参数 'query' 不能为空");
        var topK = Math.min(Math.max(parseInt(String(p.top_k !== undefined && p.top_k !== null ? p.top_k : 5), 10) || 5, 1), 30);
        var ec = p.expand_context !== false;

        // 确保知识库已构建
        var r = await buildKB(dp, false);
        var kb = r.kb;
        if (!kb.chunks.length) return { success: true, message: '知识库为空', data: { query: q, results: [] } };

        // 优先尝试 Python 引擎关键词搜索（TF-IDF + CJK 分词）
        if (await isPyEngineAvailable()) {
            try {
                var pyRes = await runPyEngine('keyword_search', p.path, [
                    q.trim(), topK, ec ? 'true' : 'false'
                ]);
                if (pyRes.data && pyRes.data.length > 0) {
                    var pyLines = ['## 关键词搜索结果 (' + pyRes.data.length + ' 条, Python TF-IDF, 共 ' + (pyRes.total_chunks || kb.chunks.length) + ' 块)', ''];
                    pyRes.data.forEach(function (x, i) {
                        pyLines.push('### 结果 ' + (i + 1) + ' | 匹配: ' + x.score + ' | 文件: ' + (x.fileName || '未知') + (x.chapterHint ? ' | ' + x.chapterHint : ''));
                        pyLines.push('');
                        if (x.context_before) { pyLines.push('[前文] ' + trunc(x.context_before, 150)); pyLines.push(''); }
                        pyLines.push(x.text || '');
                        if (x.context_after) { pyLines.push(''); pyLines.push('[后文] ' + trunc(x.context_after, 150)); }
                        pyLines.push('');
                        pyLines.push('> chunk_id: ' + (x.chunk_id !== undefined ? x.chunk_id : '?'));
                        pyLines.push('---');
                    });
                    return { success: true, message: '关键词搜索: ' + pyRes.data.length + ' 条 (Python TF-IDF)', data: pyLines.join('\n') };
                }
            } catch (pyErr) {
                console.error('[IKBS] Python 关键词搜索降级: ' + pyErr.message);
            }
        }

        // JS 引擎降级
        if (kb.chunks.length > 0 && (kb.chunks[0]._hasText === false || !kb.chunks[0].text)) {
            var allIds = [];
            for (var li = 0; li < kb.chunks.length; li++) allIds.push(li);
            await loadChunkTexts(dp, allIds, kb.chunks);
        }

        var results = kwSearch(q, kb.chunks, topK, 0);
        if (ec && results.length) results = expandContext(results, kb.chunks);

        if (!results.length) {
            return { success: true, message: '未找到匹配结果 (关键词: ' + q + ')', data: { query: q, results: [] } };
        }

        var lines = ['## 关键词搜索结果 (' + results.length + ' 条, JS 引擎, 共 ' + kb.chunks.length + ' 块)', ''];
        results.forEach(function (x, i) {
            var c = x.chunk || kb.chunks[x.chunk_id];
            lines.push('### 结果 ' + (i + 1) + ' | 匹配: ' + x.score + ' | 文件: ' + c.fileName + (c.chapterHint ? ' | ' + c.chapterHint : ''));
            lines.push('');
            if (x.context_before) { lines.push('[前文] ' + trunc(x.context_before, 150)); lines.push(''); }
            lines.push(c.text);
            if (x.context_after) { lines.push(''); lines.push('[后文] ' + trunc(x.context_after, 150)); }
            lines.push('');
            lines.push('> chunk_id: ' + x.chunk_id);
            lines.push('---');
        });

        return { success: true, message: '关键词搜索: ' + results.length + ' 条', data: lines.join('\n') };
    }

    // =========================================================================
    // 题库构建 Handler
    // =========================================================================
    async function buildExamHandler(p) {
        var dp = normPath(p.path);
        var force = p.force_rebuild === true;
        var r = await buildKB(dp, force, 2000, 0, p.concurrency, undefined, true);
        var s = r.stats;

        var isComplete = r.kb.meta.build_complete !== false;
        var incompleteCount = r.kb.meta.files_incomplete || 0;

        var lines = [
            isComplete ? '# 题库知识库构建完成' : '# 题库知识库部分构建', '',
            '- 目录: ' + dp,
            '- 构建模式: 按题号拆分（每题一块）',
            '- 总文件数: ' + s.total_files,
            '- 已索引: ' + s.files_indexed + ' 个文件',
        ];
        if (!isComplete) lines.push('- ⚠ 未完成: ' + incompleteCount + ' 个文件');
        lines.push('- 总题目块数: ' + s.total_chunks);
        lines.push('- 向量维度: ' + s.vector_dim);
        lines.push('- 嵌入模型: ' + getModel());
        lines.push('- 耗时: ' + s.elapsed_sec + 's');
        if (s.embed_errors > 0) lines.push('- ⚠ 向量化失败: ' + s.embed_errors + ' 个文件');
        if (s.from_cache) lines.push('- 模式: 从缓存加载');

        if (r.kb.meta.files_indexed && r.kb.meta.files_indexed.length > 0) {
            lines.push('');
            lines.push('## 已索引文件 (' + r.kb.meta.files_indexed.length + ')');
            r.kb.meta.files_indexed.forEach(function (f) {
                lines.push('- ' + f.name + ' (' + f.chunks + ' 题)');
            });
        }

        if (!isComplete && r.kb.meta.files_incomplete_list && r.kb.meta.files_incomplete_list.length > 0) {
            lines.push('');
            lines.push('## ⚠ 未完成文件 (' + incompleteCount + ')');
            r.kb.meta.files_incomplete_list.forEach(function (fn) {
                lines.push('- ' + fn);
            });
            lines.push('');
            lines.push('> 再次调用 build_exam 即可断点续建');
        }

        var msgText = isComplete
            ? '题库构建完成: ' + s.total_chunks + ' 题, 维度 ' + s.vector_dim
            : '部分完成: ' + s.files_indexed + '/' + s.total_files + ' 文件, ' + incompleteCount + ' 个待续建';

        // 题库构建完成后自动触发 Python 引擎索引优化
        if (isComplete && s.total_chunks > 0) {
            try {
                if (await isPyEngineAvailable()) {
                    sendProgress('🐍 自动优化 Python 引擎索引...', { phase: 'py_auto_optimize' });
                    var pyOptRes = await runPyEngine('optimize', p.path, []);
                    lines.push('');
                    lines.push('## Python 引擎索引');
                    lines.push('- 状态: ✅ 已自动优化');
                    lines.push('- ' + (pyOptRes.message || ''));
                }
            } catch (pyErr) {
                lines.push('');
                lines.push('## Python 引擎索引');
                lines.push('- 状态: ⚠ 自动优化失败 (' + pyErr.message + ')');
                lines.push('- 可手动调用 rebuild_index 重试');
            }
        }

        return { success: true, message: msgText, data: lines.join('\n') };
    }

    // =========================================================================
    // 索引优化 Handler（重建 Python 引擎二进制索引）
    // =========================================================================
    async function rebuildIndexHandler(p) {
        var dp = normPath(p.path);

        // 验证知识库已构建
        var meta = await readJson(cachePath(dp), CFG.F_META);
        if (!meta || !meta.build_complete) {
            throw new Error('知识库尚未构建或未完成。请先使用 build 构建知识库。');
        }

        if (!(await isPyEngineAvailable())) {
            throw new Error('Python 搜索引擎脚本不存在: ' + getScriptPath() + '\n请确认脚本路径正确，或配置 IKBS_SCRIPT_PATH 环境变量。');
        }

        sendProgress('🐍 正在重建优化索引...', { phase: 'py_rebuild' });
        var pyRes = await runPyEngine('optimize', p.path, []);

        var lines = [
            '# Python 引擎索引优化完成', '',
            '- 目录: ' + dp,
            '- ' + (pyRes.message || '优化成功'),
            '- 嵌入模型: ' + getModel()
        ];

        // 查询优化后状态
        try {
            var statusRes = await runPyEngine('status', p.path, []);
            if (statusRes.data) {
                var sd = statusRes.data;
                if (sd.optimized) {
                    lines.push('- 总分块: ' + (sd.total_chunks || 0));
                    lines.push('- 向量维度: ' + (sd.vector_dim || 0));
                    lines.push('- 索引大小: ' + (sd.vectors_size_mb || 0) + ' MB');
                    lines.push('- 源文件数: ' + (sd.total_files || 0));
                }
            }
        } catch (_) { }

        return {
            success: true,
            message: '索引优化完成。' + (pyRes.message || ''),
            data: lines.join('\n')
        };
    }

// =========================================================================
    // 错误包装
    // =========================================================================
    async function wrap(fn, p, label) {
        try {
            var r = await fn(p || {});
            complete(r);
        } catch (e) {
            console.error('[IKBS] ' + label + ': ' + e.message);
            complete({
                success: false,
                message: label + ' 失败: ' + e.message,
                error_stack: e.stack
            });
        }
    }

    // =========================================================================
    // 连通性测试
    // =========================================================================
    function formatTestReport(result) {
        var report = '## IKBS 智能知识库 API 连通性测试\n\n';
        report += '| 配置项 | 状态 | 值 |\n';
        report += '| :--- | :--- | :--- |\n';
        report += '| API 密钥 | ' + (result.keyConfigured ? '✅ 已配置' : '❌ 未配置') + ' | ' + (result.keyPreview || '未配置') + ' |\n';
        report += '| 基础地址 | ' + (result.baseUrlConfigured ? '✅ 已配置' : '⚪ 使用默认') + ' | ' + result.baseUrl + ' |\n';
        report += '| 嵌入模型 | ' + (result.modelConfigured ? '✅ 已配置' : '⚪ 使用默认') + ' | ' + result.model + ' |\n';
        report += '| Python 引擎 | ' + (result.pyAvailable ? '✅ 可用' : '⚪ 不可用') + ' | ' + result.pyScript + ' |\n';
        report += '| Python 解释器 | - | ' + result.pyBin + ' |\n';
        return report;
    }

    async function testCore(p) {
        var apiKey = getEnv('IKBS_API_KEY');
        var keyConfigured = !!(apiKey && apiKey.trim());

        var baseUrl = getBaseUrl();
        var baseUrlEnv = getEnv('IKBS_BASE_URL');
        var baseUrlConfigured = !!(baseUrlEnv && baseUrlEnv.trim());

        var model = getModel();
        var modelEnv = getEnv('IKBS_EMBED_MODEL');
        var modelConfigured = !!(modelEnv && modelEnv.trim());

        var pyAvailable = await isPyEngineAvailable();

        var result = {
            keyConfigured: keyConfigured,
            keyPreview: keyConfigured ? (apiKey.substring(0, 8) + '***') : null,
            baseUrlConfigured: baseUrlConfigured,
            baseUrl: baseUrl,
            modelConfigured: modelConfigured,
            model: model,
            pyAvailable: pyAvailable,
            pyScript: getScriptPath(),
            pyBin: getPyBin()
        };

        var message = keyConfigured
            ? 'IKBS API 配置完整' + (pyAvailable ? '，Python 引擎可用' : '，Python 引擎不可用（将使用 JS 引擎）')
            : 'IKBS_API_KEY 未配置，请在 Operit 设置 → 环境变量中添加';

        return {
            success: keyConfigured,
            message: message,
            data: formatTestReport(result)
        };
    }

    return {
        search: function (p) { return wrap(searchHandler, p, '搜索'); },
        build: function (p) { return wrap(buildHandler, p, '构建'); },
        build_exam: function (p) { return wrap(buildExamHandler, p, '题库构建'); },
        rebuild_index: function (p) { return wrap(rebuildIndexHandler, p, '索引优化'); },
        status: function (p) { return wrap(statusHandler, p, '状态'); },
        list_files: function (p) { return wrap(listFilesHandler, p, '文件列表'); },
        get_chunk: function (p) { return wrap(getChunkHandler, p, '分块获取'); },
        multi_search: function (p) { return wrap(multiSearchHandler, p, '融合搜索'); },
        keyword_search: function (p) { return wrap(keywordSearchHandler, p, '关键词搜索'); },
        test: function (p) { return wrap(testCore, p, '连通性测试'); }
    };
})();

exports.search = IKBS.search;
exports.build = IKBS.build;
exports.build_exam = IKBS.build_exam;
exports.rebuild_index = IKBS.rebuild_index;
exports.status = IKBS.status;
exports.list_files = IKBS.list_files;
exports.get_chunk = IKBS.get_chunk;
exports.multi_search = IKBS.multi_search;
exports.keyword_search = IKBS.keyword_search;
exports.test = IKBS.test;
