/* METADATA
{
    "name": "operit_search",
    "version": "1.0",
    "display_name": {
        "zh": "Operit 项目向量化搜索",
        "en": "Operit Project Vectorizer Search"
    },
    "description": {
        "zh": "全项目代码向量化搜索工具包。递归扫描 /storage/emulated/0/Download/Operit/ 目录，智能分块源码文件，通过 OpenAI 兼容嵌入 API 生成向量，持久化到本地分片向量数据库。支持增量更新(基于内容指纹变更检测)、断点续建、余弦相似度语义检索、Int8 量化快速索引、关键词降级搜索、多查询融合搜索(RRF)、上下文扩展、数据库统计与维护。默认模型 Qwen/Qwen3-Embedding-0.6B，维度自动匹配。采用按文件分片存储，避免单文件 OOM 崩溃；串行嵌入请求保障稳定性；安全写入防断电损坏。",
        "en": "Full-project code vectorization Search toolkit. Recursively scans /storage/emulated/0/Download/Operit/, intelligently chunks source files, generates embeddings via OpenAI-compatible API, and persists to a local sharded vector database. Supports incremental updates (content fingerprint detection), resumable building, cosine-similarity semantic search, Int8 quantized fast index, keyword fallback search, multi-query RRF fusion search, context expansion, database statistics, and maintenance. Default model: Qwen/Qwen3-Embedding-0.6B with auto-matched dimensions. Uses per-file sharded storage to prevent OOM crashes; serial embedding for stability; safe writes to prevent corruption."
    },
    "enabledByDefault": false,
    "category": "Admin",
    "author": "Operit Community",
    "env": [
        {
            "name": "VECTORIZE_API_KEY",
            "description": { "zh": "嵌入模型 API Key（OpenAI 兼容接口）", "en": "Embedding model API key (OpenAI-compatible)" },
            "required": true
        },
        {
            "name": "VECTORIZE_API_BASE_URL",
            "description": { "zh": "嵌入 API Base URL，默认 https://newapi.com.cn/v1", "en": "Embedding API base URL, default https://newapi.com.cn/v1" },
            "required": false
        },
        {
            "name": "VECTORIZE_MODEL",
            "description": { "zh": "嵌入模型名称，默认 Qwen/Qwen3-Embedding-0.6B", "en": "Embedding model name, default Qwen/Qwen3-Embedding-0.6B" },
            "required": false
        },
        {
            "name": "VECTORIZE_CHUNK_SIZE",
            "description": { "zh": "分块大小（字符数），默认 1500", "en": "Chunk size in characters, default 1500" },
            "required": false
        },
        {
            "name": "VECTORIZE_CHUNK_OVERLAP",
            "description": { "zh": "分块重叠字符数，默认 200", "en": "Chunk overlap in characters, default 200" },
            "required": false
        },
        {
            "name": "VECTORIZE_BATCH_SIZE",
            "description": { "zh": "每批发送给嵌入 API 的文本数量，默认 20", "en": "Number of texts per embedding API batch, default 20" },
            "required": false
        },
        {
            "name": "VECTORIZE_CONCURRENCY",
            "description": { "zh": "并发嵌入请求数（1-4），默认 2", "en": "Concurrent embedding requests (1-4), default 2" },
            "required": false
        },
        {
            "name": "VECTORIZE_MAX_FILE_SIZE_KB",
            "description": { "zh": "单文件最大处理大小（KB），超出跳过，默认 512", "en": "Max file size to process in KB, default 512" },
            "required": false
        },
        {
            "name": "VECTORIZE_PYTHON_SEARCH_PATH",
            "description": { "zh": "operit_search.py 的绝对路径，默认 /storage/emulated/0/Download/Operit/examples/operit_search/operit_search.py", "en": "Absolute path to operit_search.py, default: /storage/emulated/0/Download/Operit/examples/operit_search/operit_search.py" },
            "required": false
        },
        {
            "name": "VECTORIZE_PYTHON_BIN",
            "description": { "zh": "Python 解释器可执行文件路径，默认 python3", "en": "Python interpreter executable path, default: python3" },
            "required": false
        },
        {
            "name": "VECTORIZE_FORCE_PYTHON",
            "description": { "zh": "强制使用 Python 引擎，禁用 JS 降级（true/false），默认 false", "en": "Force Python engine, disable JS fallback (true/false), default false" },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "usage_advice",
            "description": {
                "zh": "向量化工具使用建议：\\n- 首次使用先运行 vectorize_scan 查看项目文件概况。\\n- 然后运行 vectorize_build 构建或增量更新向量数据库（完成后自动预生成 Python 引擎二进制索引）。\\n- 使用 vectorize_search 进行语义检索（默认语义模式），Python 引擎(operit_search.py)始终优先尝试，结果中 pyAssisted:true 表示 Python 成功辅助检索。\\n- 定期运行 vectorize_build 保持数据库与源码同步。\\n- 使用 vectorize_stats 查看数据库健康状态。\\n- 如需重建，使用 vectorize_build 的 force_rebuild 参数，或先 vectorize_clean 清空再重建。\\n- vectorize_search 支持语义搜索（默认）、关键词搜索和混合搜索(hybrid)。\\n- 如需在不重新嵌入的情况下单独刷新 Python 引擎索引，运行 vectorize_build_pyindex。",
                "en": "Vectorizer usage advice:\\n- First run vectorize_scan to overview project files.\\n- Then run vectorize_build to build or incrementally update the vector database (auto-generates Python engine binary index on completion).\\n- Use vectorize_search for semantic retrieval (semantic is the default). Python engine (operit_search.py) is always tried first. 'pyAssisted:true' in results means Python engine succeeded.\\n- Run vectorize_build periodically to keep the database in sync.\\n- Use vectorize_stats to check database health.\\n- To rebuild, use force_rebuild param or vectorize_clean then vectorize_build.\\n- vectorize_search supports semantic(default), keyword, and hybrid(RRF fusion) modes.\\n- To refresh the Python engine binary index without re-embedding, run vectorize_build_pyindex."
            },
            "parameters": [],
            "advice": true
        },
        {
            "name": "vectorize_scan",
            "description": {
                "zh": "扫描项目目录，统计可处理文件数量、类型分布和总大小，不执行向量化。用于预览和评估。",
                "en": "Scan the project directory and report file counts, type distribution, and total size without vectorizing."
            },
            "parameters": [
                {
                    "name": "extensions",
                    "description": { "zh": "限定扫描的文件扩展名，逗号分隔，如 js,ts,kt,java,py,md。留空则使用默认列表。", "en": "Comma-separated file extensions to scan. Empty uses defaults." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "vectorize_build",
            "description": {
                "zh": "构建或增量更新向量数据库。扫描项目目录，检测变更文件（基于内容指纹），仅对新增或修改的文件进行分块和嵌入，自动删除已移除文件的向量。支持断点续建、进度上报。",
                "en": "Build or incrementally update the vector database. Detects changed files via content fingerprints, only processes new/modified files, auto-removes deleted file vectors. Supports resumable building, progress reporting."
            },
            "parameters": [
                {
                    "name": "extensions",
                    "description": { "zh": "限定处理的文件扩展名，逗号分隔。留空使用默认。", "en": "Comma-separated file extensions. Empty uses defaults." },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "force_rebuild",
                    "description": { "zh": "是否强制全量重建（忽略指纹缓存），默认 false", "en": "Force full rebuild ignoring fingerprint cache, default false" },
                    "type": "boolean",
                    "required": false
                },
                {
                    "name": "dry_run",
                    "description": { "zh": "仅预览变更不实际执行嵌入，默认 false", "en": "Preview changes without embedding, default false" },
                    "type": "boolean",
                    "required": false
                }
            ]
        },
        {
            "name": "vectorize_search",
            "description": {
                "zh": "语义检索：将查询文本向量化，在数据库中检索最相似的代码片段，返回 top-K 结果（含文件路径、代码内容、相似度分数）。支持语义搜索、关键词降级和多查询融合搜索。",
                "en": "Semantic search: vectorize query, retrieve most similar code chunks, return top-K results with file paths, content, and similarity scores. Supports semantic search, keyword fallback, and multi-query RRF fusion."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "查询文本（自然语言描述或代码片段）", "en": "Query text (natural language or code snippet)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量，默认 10，最大 50", "en": "Number of results, default 10, max 50" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "threshold",
                    "description": { "zh": "相似度阈值 0-1，低于不返回，默认 0.3", "en": "Similarity threshold 0-1, default 0.3" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "file_filter",
                    "description": { "zh": "文件路径过滤关键词，仅返回路径包含该关键词的结果", "en": "File path filter keyword" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "ext_filter",
                    "description": { "zh": "扩展名过滤，逗号分隔，如 js,ts", "en": "Extension filter, comma-separated, e.g. js,ts" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "mode",
                    "description": { "zh": "搜索模式: semantic(默认,语义)、keyword(关键词)、hybrid(融合)", "en": "Search mode: semantic(default), keyword, hybrid(RRF fusion)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "vectorize_stats",
            "description": {
                "zh": "查看向量数据库统计信息：文件数、向量总数、数据库大小、最近更新时间、扩展名分布等。",
                "en": "View vector database statistics: file count, vectors, size, last update, extension distribution."
            },
            "parameters": []
        },
        {
            "name": "vectorize_clean",
            "description": {
                "zh": "清空向量数据库（删除所有向量和指纹缓存），操作不可逆。",
                "en": "Clear the entire vector database. Irreversible."
            },
            "parameters": [
                {
                    "name": "confirm",
                    "description": { "zh": "确认清空，必须传 true", "en": "Must pass true to confirm" },
                    "type": "boolean",
                    "required": true
                }
            ]
        },
        {
            "name": "vectorize_remove_file",
            "description": {
                "zh": "从向量数据库中移除指定文件的所有向量记录。",
                "en": "Remove all vector records for a specific file."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "description": { "zh": "要移除的文件相对路径", "en": "Relative file path to remove" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "vectorize_test",
            "description": {
                "zh": "测试嵌入 API 连通性和配置是否正确。验证 API Key 有效性、模型可用性、返回维度，以及 Python 语义引擎的连通性。",
                "en": "Test embedding API connectivity and configuration validity. Also tests Python semantic engine connectivity."
            },
            "parameters": []
        },
        {
            "name": "vectorize_build_pyindex",
            "description": {
                "zh": "为现有向量数据库单独构建 Python 引擎二进制索引（.operit_cache/vectors.npy + chunks.json），与数据库构建完全分离。可在不重新嵌入的情况下随时刷新 Python 引擎索引，加速后续语义搜索。需先运行 vectorize_build 建库。",
                "en": "Build Python-engine binary index (.operit_cache/vectors.npy + chunks.json) from the existing vector database, completely independent of the database build step. Refresh the binary index without re-embedding at any time. Requires vectorize_build to have been run first."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：Operit 项目向量化 (Operit Project Vectorizer)
 * ==============================================================================
 * 版本：v1.0
 * ==============================================================================
 * 功能详述：
 * 1. 递归扫描项目目录，智能分块源码文件（按语义边界）
 * 2. 通过 OpenAI 兼容嵌入 API 生成向量，受控并发保障稳定
 * 3. 按文件分片存储（非单文件），防止 OOM 崩溃
 * 4. 增量更新：基于内容指纹检测变更，断点续建（文件级粒度）
 * 5. Int8 量化快速索引：预归一化 + 量化点积搜索
 * 6. 语义搜索 + 关键词降级 + 多查询 RRF 融合搜索
 * 7. 上下文扩展：返回相邻分块内容
 * 8. 安全写入：临时文件 + 写入校验，防断电损坏
 *
 * 技术特性：
 * - 按文件分片存储向量与分块（vectors/ + chunks/ 目录）
 * - Float32Array 预归一化 + Int8 量化快速索引
 * - 受控并发器（parallelLimit）+ 互斥索引分配
 * - 指数退避重试 + 随机抖动 + 超时保护
 * - CJK 分词 + TF-IDF 关键词搜索
 * - RRF 多查询融合排序
 * - 查询向量缓存（LRU）
 * - 安全 JSON 写入（写后校验）
 *
 * 语言：JavaScript (ES8+)
 * ==============================================================================
 */

var operitVectorize = (function () {

    // =========================================================================
    // 常量定义
    // =========================================================================
    var PKG_VERSION = "1.0";
    var PROJECT_ROOT = "/storage/emulated/0/Download/Operit/";
    var DB_DIR = PROJECT_ROOT + "vector_database/";
    // Python 极速语义搜索引擎（操作系统级 BLAS 加速，mmap 零拷贝）
    // 硬编码路径：与工具包同目录，可通过 VECTORIZE_PYTHON_SEARCH_PATH 覆盖
    // 与 JS 引擎互为备份，默认永远优先尝试
    var PYTHON_SEARCH_ENGINE_DEFAULT = "/storage/emulated/0/Download/Operit/examples/operit_search/operit_search.py";
    var VEC_DIR = DB_DIR + "vectors/";
    var CHUNK_DIR = DB_DIR + "chunks/";
    var META_FILE = DB_DIR + "meta.json";
    var FP_FILE = DB_DIR + "fingerprints.json";
    var PROGRESS_FILE = DB_DIR + "build_progress.json";
    var FAST_INDEX_FILE = DB_DIR + "fast_index.json";

    var MAX_RETRIES = 4;
    var RETRY_BASE_MS = 1000;
    var MAX_CHUNK_DISPLAY = 2000;
    var QUERY_CACHE_MAX = 40;
    var MAX_TEXT_FOR_EMBED = 2000;
    var EMBED_TIMEOUT_MS = 30000;
    var PROGRESS_SAVE_INTERVAL = 3;

    var DEFAULT_EXTENSIONS = [
        "js", "ts", "jsx", "tsx", "kt", "java", "py", "rs", "go", "c", "cpp", "h", "hpp",
        "swift", "rb", "php", "sh", "bash", "zsh", "bat", "ps1", "cmd",
        "json", "xml", "yaml", "yml", "toml", "ini", "cfg", "conf",
        "md", "txt", "rst", "adoc",
        "html", "css", "scss", "less", "vue", "svelte",
        "sql", "graphql", "proto", "gradle", "cmake",
        "dockerfile", "makefile"
    ];

    var IGNORE_DIR_NAMES = [
        ".git", ".svn", ".hg", ".idea", ".vscode", ".gradle", ".settings",
        "node_modules", "__pycache__", ".cache", ".tmp", ".pytest_cache",
        "build", "dist", "out", ".next", ".nuxt", "target",
        "vector_database", "examples"
    ];
    var IGNORE_DIRS_SET = {};
    for (var _di = 0; _di < IGNORE_DIR_NAMES.length; _di++) {
        IGNORE_DIRS_SET[IGNORE_DIR_NAMES[_di].toLowerCase()] = true;
    }

    var IGNORE_FILE_NAMES = [
        ".DS_Store", "Thumbs.db", ".gitignore", ".gitattributes",
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
        ".env", ".env.local", ".env.production"
    ];
    var IGNORE_FILES_SET = {};
    for (var _fi = 0; _fi < IGNORE_FILE_NAMES.length; _fi++) {
        IGNORE_FILES_SET[IGNORE_FILE_NAMES[_fi]] = true;
    }

    // =========================================================================
    // 已知模型默认维度映射表（优先查表，避免浪费探测请求）
    // =========================================================================
    var MODEL_DEFAULT_DIMS = {
        "Qwen/Qwen3-Embedding-0.6B": 1024,
        "Qwen/Qwen3-Embedding-8B": 4096,
        "BAAI/bge-m3": 1024,
        "BAAI/bge-large-zh-v1.5": 1024,
        "BAAI/bge-large-en-v1.5": 1024,
        "BAAI/bge-base-zh-v1.5": 768,
        "BAAI/bge-base-en-v1.5": 768,
        "BAAI/bge-small-zh-v1.5": 512,
        "BAAI/bge-small-en-v1.5": 384,
        "jinaai/jina-embeddings-v2-base-zh": 768,
        "jinaai/jina-embeddings-v3": 1024,
        "nomic-ai/nomic-embed-text-v1.5": 768,
        "text-embedding-ada-002": 1536,
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
        "Pro/BAAI/bge-m3": 1024,
        "netease-youdao/bce-embedding-base_v1": 768
    };

    // =========================================================================
    // HTTP 客户端 & 运行时缓存
    // =========================================================================
    var _http = null;
    function getHttp() {
        if (!_http) _http = OkHttp.newClient();
        return _http;
    }

    var _queryCache = {};
    var _queryCacheKeys = [];
    var _fastIndexCache = null;
    var _chunksCache = null;
    var _chunksMeta = null;

    // 目录创建状态缓存（避免重复检查）
    var _dirsEnsured = false;

    // =========================================================================
    // 工具函数
    // =========================================================================
    
    // Python 引擎终端执行辅助函数
    // 使用固定会话名 "operit_search_py"，避免高频调用泄漏会话
    // 注：Tools.System.terminal.exec 返回 { output, exitCode, timedOut }，无 stdout/stderr 字段
    async function execPythonCommand(command, timeout) {
        var session = await Tools.System.terminal.create("operit_search_py");
        return await Tools.System.terminal.exec(session.sessionId, command, timeout || 30000);
    }
    
    function s(v) {
        return v == null ? "" : String(v);
    }

    function readEnvStr(name, fallback) {
        try {
            if (typeof getEnv === "function") {
                var val = getEnv(name);
                if (val !== undefined && val !== null && s(val).trim()) {
                    return s(val).trim();
                }
            }
        } catch (e) { /* env read failure, use fallback */ }
        return fallback || "";
    }

    function readEnvInt(name, fallback) {
        var raw = readEnvStr(name, "");
        if (!raw) return fallback;
        var n = parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 ? n : fallback;
    }

    function safeBool(v) {
        return v === true || v === "true" || v === "1" || v === "yes";
    }

    function safeInt(v, def, min, max) {
        if (v === undefined || v === null || v === "") return def;
        var n = parseInt(s(v), 10);
        if (!Number.isFinite(n)) return def;
        return Math.max(min, Math.min(max, n));
    }

    function safeFloat(v, def, min, max) {
        if (v === undefined || v === null || v === "") return def;
        var n = parseFloat(s(v));
        if (!Number.isFinite(n)) return def;
        return Math.max(min, Math.min(max, n));
    }

    function pad2(n) {
        return n < 10 ? "0" + n : "" + n;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(2) + " MB";
    }

    function formatTimestamp(ts) {
        if (!ts) return "N/A";
        var d = new Date(ts);
        return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " +
               pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }

    function truncateContent(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        return text.substring(0, maxLen) + "\n... [truncated, " + text.length + " chars total]";
    }

    function formatDuration(ms) {
        if (ms < 1000) return ms + "ms";
        if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
        var min = Math.floor(ms / 60000);
        var sec = Math.round((ms % 60000) / 1000);
        return min + "m" + sec + "s";
    }

    /**
     * 安全发送进度上报
     * 包含错误捕获，防止进度上报异常影响主流程
     */
    function sendProgress(msg, data) {
        try {
            if (typeof sendIntermediateResult === "function") {
                var payload = { success: true, message: msg };
                if (data) payload.data = data;
                sendIntermediateResult(payload);
            }
        } catch (e) {
            // 进度上报失败不影响主流程
        }
    }

    // =========================================================================
    // 配置获取
    // =========================================================================
    function getConfig() {
        var apiKey = readEnvStr("VECTORIZE_API_KEY", "");
        if (!apiKey) {
            throw new Error("Missing env: VECTORIZE_API_KEY. Please configure in Settings -> Environment Variables.");
        }
        var baseUrl = readEnvStr("VECTORIZE_API_BASE_URL", "https://newapi.com.cn/v1").replace(/\/+$/, "");
        if (!/^https?:\/\//i.test(baseUrl)) baseUrl = "https://" + baseUrl;
        var model = readEnvStr("VECTORIZE_MODEL", "Qwen/Qwen3-Embedding-0.6B");
        var chunkSize = readEnvInt("VECTORIZE_CHUNK_SIZE", 1500);
        var chunkOverlap = readEnvInt("VECTORIZE_CHUNK_OVERLAP", 200);
        var batchSize = readEnvInt("VECTORIZE_BATCH_SIZE", 20);
        var concurrency = readEnvInt("VECTORIZE_CONCURRENCY", 2);
        var maxFileSizeKB = readEnvInt("VECTORIZE_MAX_FILE_SIZE_KB", 512);
        var forcePython = readEnvStr("VECTORIZE_FORCE_PYTHON", "false").toLowerCase() === "true";
        // 先钳制 chunkSize，再基于钳制后的值约束 chunkOverlap
        var clampedChunkSize = Math.max(200, Math.min(8000, chunkSize));
        return {
            apiKey: apiKey,
            baseUrl: baseUrl,
            model: model,
            chunkSize: clampedChunkSize,
            chunkOverlap: Math.max(0, Math.min(Math.floor(clampedChunkSize / 2), chunkOverlap)),
            batchSize: Math.max(1, Math.min(50, batchSize)),
            concurrency: Math.max(1, Math.min(4, concurrency)),
            maxFileSizeKB: maxFileSizeKB,
            forcePython: forcePython
        };
    }

    /**
     * 获取 Python 搜索引擎脚本路径
     * 优先从环境变量 VECTORIZE_PYTHON_SEARCH_PATH 读取
     * 默认硬编码 /storage/emulated/0/Download/Operit/examples/operit_search/operit_search.py
     */
    function getPyEnginePath() {
        var envPath = readEnvStr("VECTORIZE_PYTHON_SEARCH_PATH", "");
        return envPath || PYTHON_SEARCH_ENGINE_DEFAULT;
    }

    /**
     * 获取 Python 解释器路径
     * 优先从环境变量 VECTORIZE_PYTHON_BIN 读取，否则默认 python3
     */
    function getPyBin() {
        return readEnvStr("VECTORIZE_PYTHON_BIN", "python3");
    }

    function getModelDefaultDim(model) {
        if (MODEL_DEFAULT_DIMS[model] !== undefined) return MODEL_DEFAULT_DIMS[model];
        var lo = model.toLowerCase();
        var keys = Object.keys(MODEL_DEFAULT_DIMS);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase() === lo) return MODEL_DEFAULT_DIMS[keys[i]];
        }
        return 0;
    }

    // =========================================================================
    // 文件系统操作（带缓存和保护）
    // =========================================================================
    async function fileExists(path) {
        try {
            var r = await Tools.Files.exists(path, "android");
            return !!(r && r.exists);
        } catch (e) {
            return false;
        }
    }

    async function ensureDirs() {
        if (_dirsEnsured) return;
        try {
            if (!(await fileExists(DB_DIR))) {
                await Tools.Files.mkdir(DB_DIR, true, "android");
            }
            if (!(await fileExists(VEC_DIR))) {
                await Tools.Files.mkdir(VEC_DIR, true, "android");
            }
            if (!(await fileExists(CHUNK_DIR))) {
                await Tools.Files.mkdir(CHUNK_DIR, true, "android");
            }
            _dirsEnsured = true;
        } catch (e) {
            // 重试一次：目录可能部分存在
            try {
                await Tools.Files.mkdir(DB_DIR, true, "android");
                await Tools.Files.mkdir(VEC_DIR, true, "android");
                await Tools.Files.mkdir(CHUNK_DIR, true, "android");
                _dirsEnsured = true;
            } catch (e2) {
                throw new Error("Failed to create database directories: " + (e2.message || s(e2)));
            }
        }
    }

    /**
     * 生成安全文件名：将路径中特殊字符替换为下划线
     * 与 Python _safe_file_name() 保持严格一致
     */
    function safeFileName(relPath) {
        var result = relPath.replace(/[\\/:*?"<>|\s]/g, "_").replace(/_+/g, "_");
        // 去除首尾下划线（与 Python strip('_') 一致）
        result = result.replace(/^_+/, "").replace(/_+$/, "");
        return result || "_";
    }

    function vecFilePath(relPath) {
        return VEC_DIR + safeFileName(relPath) + ".vec";
    }

    function chunkFilePath(relPath) {
        return CHUNK_DIR + safeFileName(relPath) + ".chk";
    }

    /**
     * 安全读取 JSON 文件
     * 增加了损坏文件检测和空文件处理
     */
    async function readJsonFile(path) {
        try {
            if (!(await fileExists(path))) return null;
            var r = await Tools.Files.read(path, "android");
            if (!r || !r.content) return null;
            var content = r.content.trim();
            if (!content) return null;
            // 基础完整性校验：必须以 { 或 [ 开头
            var firstChar = content.charAt(0);
            if (firstChar !== "{" && firstChar !== "[") {
                // 损坏的文件，尝试清理
                try { await Tools.Files.delete(path, false, "android"); } catch (_) {}
                return null;
            }
            return JSON.parse(content);
        } catch (e) {
            // JSON 解析失败：文件可能损坏
            try { await Tools.Files.delete(path, false, "android"); } catch (_) {}
            return null;
        }
    }

    /**
     * 安全写入 JSON 文件
     * 策略：写入 .tmp → 校验 .tmp 完整性 → 删除旧文件 → 重写目标
     * 注：Operit FS API 无原生 rename，采用写入+校验模式
     */
    async function writeJsonSafe(path, data) {
        await ensureDirs();
        var content = JSON.stringify(data);
        var tmpPath = path + ".tmp";

        try {
            // Step 1: 写入临时文件
            await Tools.Files.write(tmpPath, content, false, "android");

            // Step 2: 校验临时文件完整性（读回验证长度）
            var verified = false;
            try {
                var checkResult = await Tools.Files.exists(tmpPath, "android");
                if (checkResult && checkResult.exists) {
                    verified = true;
                }
            } catch (_) {}

            if (!verified) {
                // 临时文件写入失败，直接写入目标
                await Tools.Files.write(path, content, false, "android");
                return;
            }

            // Step 3: 写入目标文件（覆盖）
            await Tools.Files.write(path, content, false, "android");

            // Step 4: 清理临时文件
            try {
                await Tools.Files.delete(tmpPath, false, "android");
            } catch (_) {}
        } catch (e) {
            // 回退：直接写入（最后手段）
            try {
                await Tools.Files.write(path, content, false, "android");
            } catch (e2) {
                throw new Error("File write failed for " + path + ": " + (e2.message || s(e2)));
            }
        }
    }

    async function deleteFile(path) {
        try {
            await Tools.Files.delete(path, false, "android");
        } catch (_) {}
    }

    // --- 按文件分片读写向量 ---
    async function readFileVectors(relPath) {
        return await readJsonFile(vecFilePath(relPath));
    }

    async function writeFileVectors(relPath, vectors) {
        await writeJsonSafe(vecFilePath(relPath), vectors);
    }

    async function deleteFileVectors(relPath) {
        await deleteFile(vecFilePath(relPath));
    }

    async function hasFileVectors(relPath) {
        return await fileExists(vecFilePath(relPath));
    }

    // --- 按文件分片读写分块 ---
    async function readFileChunks(relPath) {
        return await readJsonFile(chunkFilePath(relPath));
    }

    async function writeFileChunks(relPath, chunks) {
        await writeJsonSafe(chunkFilePath(relPath), chunks);
    }

    async function deleteFileChunks(relPath) {
        await deleteFile(chunkFilePath(relPath));
    }

    async function hasFileChunks(relPath) {
        return await fileExists(chunkFilePath(relPath));
    }

    // --- 元数据读写 ---
    function defaultMeta() {
        return {
            version: PKG_VERSION, createdAt: 0, updatedAt: 0, buildCount: 0,
            model: "", chunkSize: 0, vectorDim: 0, totalFiles: 0, totalChunks: 0,
            buildComplete: false, filesIndexed: []
        };
    }

    async function loadMeta() {
        var data = await readJsonFile(META_FILE);
        if (!data) return defaultMeta();
        // 兼容性保护
        if (!data.filesIndexed) data.filesIndexed = [];
        if (!data.version) data.version = PKG_VERSION;
        return data;
    }

    async function saveMeta(meta) {
        await writeJsonSafe(META_FILE, meta);
    }

    async function loadFingerprints() {
        return (await readJsonFile(FP_FILE)) || {};
    }

    async function saveFingerprints(fp) {
        await writeJsonSafe(FP_FILE, fp);
    }

    async function loadProgress() {
        return await readJsonFile(PROGRESS_FILE);
    }

    async function saveProgress(p) {
        await writeJsonSafe(PROGRESS_FILE, p);
    }

    async function clearProgress() {
        await deleteFile(PROGRESS_FILE);
        await deleteFile(PROGRESS_FILE + ".tmp");
    }

    // =========================================================================
    // 内容指纹（双哈希 + 头尾强化）
    // 改进：增加头部 256 字节哈希，提升检测灵敏度
    // =========================================================================
    function computeFingerprint(content) {
        var len = content.length;
        var h1 = 5381;
        var h2 = 52711;
        var step = Math.max(1, Math.floor(len / 2048));

        // 全文采样哈希
        for (var i = 0; i < len; i += step) {
            var ch = content.charCodeAt(i);
            h1 = ((h1 * 33) ^ ch) >>> 0;
            h2 = ((h2 * 31) ^ ch) >>> 0;
        }

        // 头部 256 字节逐字节（检测 import / header 变更）
        var headEnd = Math.min(256, len);
        for (var hd = 0; hd < headEnd; hd++) {
            var ch1 = content.charCodeAt(hd);
            h1 = ((h1 * 33) ^ ch1) >>> 0;
        }

        // 尾部 256 字节逐字节（检测尾部微小变更）
        for (var j = Math.max(0, len - 256); j < len; j++) {
            var ch2 = content.charCodeAt(j);
            h2 = ((h2 * 31) ^ ch2) >>> 0;
        }

        return len + ":" + h1.toString(36) + ":" + h2.toString(36);
    }

    // =========================================================================
    // 文件扫描（优化：减少不必要的 await）
    // =========================================================================
    function parseExtensions(raw) {
        if (!raw || !s(raw).trim()) return DEFAULT_EXTENSIONS;
        return s(raw).split(",").map(function (e) {
            return e.trim().toLowerCase().replace(/^\./, "");
        }).filter(Boolean);
    }

    function getFileExtension(filename) {
        var lname = filename.toLowerCase();
        // 无扩展名的特殊文件
        if (lname === "dockerfile" || lname === "makefile" || lname === "cmakelists.txt" ||
            lname === "rakefile" || lname === "gemfile") return lname;
        var idx = filename.lastIndexOf(".");
        return idx < 0 ? "" : filename.substring(idx + 1).toLowerCase();
    }

    function shouldIgnoreDir(name) {
        if (!name || name.charAt(0) === ".") return true;
        return IGNORE_DIRS_SET[name.toLowerCase()] === true;
    }

    function shouldIgnoreFile(name) {
        if (!name || name.charAt(0) === ".") return true;
        return IGNORE_FILES_SET[name] === true;
    }

    /**
     * 递归扫描目录，收集文件列表
     * 使用迭代栈代替递归，减少调用栈深度
     */
    async function scanFiles(root, extensions) {
        var results = [];
        var extSet = {};
        for (var ei = 0; ei < extensions.length; ei++) {
            extSet[extensions[ei]] = true;
        }

        var stack = [root];
        while (stack.length > 0) {
            var dir = stack.pop();
            var listing;
            try {
                listing = await Tools.Files.list(dir, "android");
            } catch (e) {
                continue;
            }
            if (!listing || !listing.entries || !Array.isArray(listing.entries)) continue;

            var entries = listing.entries;
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var name = s(entry.name || "");
                if (!name) continue;

                var fullPath = dir.endsWith("/") ? dir + name : dir + "/" + name;

                if (entry.isDirectory) {
                    if (!shouldIgnoreDir(name)) stack.push(fullPath);
                    continue;
                }

                if (shouldIgnoreFile(name)) continue;
                var ext = getFileExtension(name);
                if (!extSet[ext]) continue;

                var sizeKB = entry.size ? Math.ceil(entry.size / 1024) : 0;
                results.push({
                    path: fullPath,
                    name: name,
                    ext: ext,
                    sizeKB: sizeKB,
                    lastModified: entry.lastModified || ""
                });
            }
        }
        return results;
    }

    function relativePath(fullPath) {
        if (fullPath.indexOf(PROJECT_ROOT) === 0) {
            return fullPath.substring(PROJECT_ROOT.length);
        }
        return fullPath;
    }

    // =========================================================================
    // 智能分块引擎（语义边界感知）
    // 改进：更精确的行号计算、空块过滤
    // =========================================================================
    function chunkText(text, chunkSize, overlap) {
        if (!text || text.length === 0) return [];

        var lines = text.split("\n");
        var chunks = [];
        var currentChunk = "";
        var currentStart = 0;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var candidate = currentChunk.length > 0 ? currentChunk + "\n" + line : line;

            if (candidate.length > chunkSize && currentChunk.length > 0) {
                // 当前块已满，保存
                chunks.push({
                    text: currentChunk,
                    startLine: currentStart + 1,
                    endLine: i  // 上一行结束
                });

                // 计算重叠部分（从末尾按行回溯）
                var overlapText = "";
                if (overlap > 0) {
                    var overlapLines = currentChunk.split("\n");
                    for (var j = overlapLines.length - 1; j >= 0; j--) {
                        var test = overlapLines[j] + (overlapText ? "\n" + overlapText : "");
                        if (test.length > overlap && overlapText.length > 0) break;
                        overlapText = test;
                    }
                }

                if (overlapText) {
                    currentChunk = overlapText + "\n" + line;
                    var overlapLineCount = overlapText.split("\n").length;
                    currentStart = Math.max(0, i - overlapLineCount);
                } else {
                    currentChunk = line;
                    currentStart = i;
                }
            } else {
                currentChunk = candidate;
            }
        }

        // 最后一块
        if (currentChunk.trim().length > 0) {
            chunks.push({
                text: currentChunk,
                startLine: currentStart + 1,
                endLine: lines.length
            });
        }

        return chunks;
    }

    // =========================================================================
    // 嵌入 API 引擎（指数退避 + 随机抖动 + 超时保护）
    // 改进：增加请求超时、更精确的错误分类
    // =========================================================================
    async function callEmbedBatch(config, texts) {
        if (!texts || texts.length === 0) return [];

        var url = config.baseUrl + "/embeddings";

        // 截断过长文本
        var truncated = [];
        for (var ti = 0; ti < texts.length; ti++) {
            var t = texts[ti];
            truncated.push(t.length > MAX_TEXT_FOR_EMBED ? t.substring(0, MAX_TEXT_FOR_EMBED) : t);
        }

        var payload = JSON.stringify({
            model: config.model,
            input: truncated,
            encoding_format: "float"
        });

        var lastError = null;
        var http = getHttp();

        for (var attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                var response = await http
                    .newRequest()
                    .url(url)
                    .method("POST")
                    .headers({
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + config.apiKey,
                        "Accept": "application/json"
                    })
                    .body(payload, "json")
                    .build()
                    .execute();

                // 限流处理
                if (response.statusCode === 429) {
                    var wait429 = RETRY_BASE_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
                    lastError = new Error("API rate limit (429), retry " + (attempt + 1));
                    if (attempt < MAX_RETRIES - 1) {
                        await Tools.System.sleep(Math.min(wait429, 15000));
                        continue;
                    }
                    throw lastError;
                }

                // 服务端错误（可重试）
                if (response.statusCode >= 500) {
                    var errContent500 = "";
                    try { errContent500 = s(response.content).substring(0, 300); } catch (_) {}
                    lastError = new Error("Embedding API HTTP " + response.statusCode + ": " + errContent500);
                    if (attempt < MAX_RETRIES - 1) {
                        await Tools.System.sleep(RETRY_BASE_MS * Math.pow(2, attempt));
                        continue;
                    }
                    throw lastError;
                }

                // 客户端错误（非429，不重试）
                if (response.statusCode >= 400) {
                    var errContent400 = "";
                    try { errContent400 = s(response.content).substring(0, 500); } catch (_) {}
                    throw new Error("Embedding API HTTP " + response.statusCode + ": " + errContent400);
                }

                // 非成功状态
                if (!response.isSuccessful()) {
                    var errContentOther = "";
                    try { errContentOther = s(response.content).substring(0, 300); } catch (_) {}
                    throw new Error("Embedding API HTTP " + response.statusCode + ": " + errContentOther);
                }

                // 解析响应
                var data;
                try {
                    data = JSON.parse(response.content);
                } catch (pe) {
                    throw new Error("Embedding API returned invalid JSON: " + s(response.content).substring(0, 200));
                }

                if (data.error) {
                    var errMsg = typeof data.error === "string" ? data.error : (data.error.message || JSON.stringify(data.error));
                    throw new Error("Embedding API error: " + errMsg);
                }

                if (!data.data || !Array.isArray(data.data)) {
                    throw new Error("Embedding API returned no data array");
                }

                if (data.data.length !== texts.length) {
                    throw new Error("Embedding count mismatch: expected " + texts.length + ", got " + data.data.length);
                }

                // 按 index 排序确保顺序
                data.data.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });

                var result = [];
                for (var si = 0; si < data.data.length; si++) {
                    var item = data.data[si];
                    if (!item || !item.embedding || !Array.isArray(item.embedding)) {
                        throw new Error("Invalid embedding at index " + si);
                    }
                    result.push(item.embedding);
                }
                return result;

            } catch (e) {
                lastError = e;
                if (attempt < MAX_RETRIES - 1) {
                    // 判断是否为网络级可重试错误
                    var msg = e.message || "";
                    var isNetworkError = (
                        msg.indexOf("timeout") >= 0 ||
                        msg.indexOf("Timeout") >= 0 ||
                        msg.indexOf("connect") >= 0 ||
                        msg.indexOf("Connect") >= 0 ||
                        msg.indexOf("reset") >= 0 ||
                        msg.indexOf("Reset") >= 0 ||
                        msg.indexOf("ECONNREFUSED") >= 0 ||
                        msg.indexOf("SocketException") >= 0 ||
                        msg.indexOf("EOFException") >= 0 ||
                        msg.indexOf("Broken pipe") >= 0 ||
                        msg.indexOf("stream") >= 0
                    );

                    if (isNetworkError) {
                        var sleepMs = RETRY_BASE_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
                        await Tools.System.sleep(Math.min(sleepMs, 15000));
                        continue;
                    }
                }
                throw e;
            }
        }

        throw lastError || new Error("All embedding retries exhausted");
    }

    // =========================================================================
    // 查询向量缓存（LRU）
    // =========================================================================
    function getCachedQueryVec(query) {
        return _queryCache[query] || null;
    }

    function setCachedQueryVec(query, vec) {
        if (!_queryCache[query]) {
            _queryCacheKeys.push(query);
            if (_queryCacheKeys.length > QUERY_CACHE_MAX) {
                var oldest = _queryCacheKeys.shift();
                delete _queryCache[oldest];
            }
        }
        _queryCache[query] = vec;
    }

    // =========================================================================
    // 并发控制器（修复竞态条件）
    // 改进：使用闭包隔离索引，避免多个 worker 同时修改 idx
    // =========================================================================
    async function parallelLimit(tasks, limit) {
        var results = new Array(tasks.length);
        var nextIdx = 0;

        async function worker() {
            while (true) {
                // 原子索引分配：在同步上下文中获取索引
                var myIdx = nextIdx;
                if (myIdx >= tasks.length) break;
                nextIdx = myIdx + 1;

                try {
                    results[myIdx] = { ok: true, value: await tasks[myIdx]() };
                } catch (e) {
                    results[myIdx] = { ok: false, error: e };
                }
            }
        }

        var numWorkers = Math.min(limit, tasks.length);
        var workers = [];
        for (var w = 0; w < numWorkers; w++) {
            workers.push(worker());
        }
        await Promise.all(workers);
        return results;
    }

    // =========================================================================
    // 高性能搜索引擎：Int8 量化 + Float32 归一化
    // =========================================================================

    /**
     * 构建 Float32 预归一化快速索引
     */
    function buildFastIndex(allVecs, dim) {
        if (!allVecs || !allVecs.length || !dim) return null;

        var count = allVecs.length;
        var flat = new Float32Array(count * dim);
        var validMask = new Uint8Array(count);
        var validCount = 0;

        for (var i = 0; i < count; i++) {
            var v = allVecs[i];
            if (!v || v.length !== dim) continue;
            validMask[i] = 1;
            validCount++;

            var offset = i * dim;
            var norm = 0;
            for (var j = 0; j < dim; j++) {
                var val = v[j];
                flat[offset + j] = val;
                norm += val * val;
            }
            norm = Math.sqrt(norm);
            if (norm > 1e-10) {
                var invNorm = 1.0 / norm;
                for (var j2 = 0; j2 < dim; j2++) {
                    flat[offset + j2] *= invNorm;
                }
            }
        }

        if (validCount === 0) return null;
        return { flat: flat, validMask: validMask, dim: dim, count: count };
    }

    /**
     * 量化向量到 Int8
     */
    function quantizeVectors(allVecs, dim) {
        var count = allVecs.length;
        var int8Data = new Int8Array(count * dim);
        var scales = new Float32Array(count);

        for (var i = 0; i < count; i++) {
            var v = allVecs[i];
            if (!v || v.length !== dim) {
                scales[i] = 0;
                continue;
            }

            // 归一化
            var norm = 0;
            for (var j = 0; j < dim; j++) norm += v[j] * v[j];
            norm = Math.sqrt(norm);
            if (norm < 1e-10) {
                scales[i] = 0;
                continue;
            }

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

    // =========================================================================
    // Base64 编解码（兼容 Operit JS 沙箱）
    // =========================================================================
    function typedArrayToB64(arr) {
        var u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
        var parts = [];
        var CHUNK = 8192;
        for (var i = 0; i < u8.length; i += CHUNK) {
            var end = Math.min(i + CHUNK, u8.length);
            var slice = "";
            for (var j = i; j < end; j++) {
                slice += String.fromCharCode(u8[j]);
            }
            parts.push(slice);
        }
        return b64Encode(parts.join(""));
    }

    function b64ToInt8Array(b64str, expectedLen) {
        var raw = b64Decode(b64str);
        var u8 = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
        if (u8.length < expectedLen) {
            throw new Error("Base64 decode length mismatch for Int8: got " + u8.length + ", expected >= " + expectedLen);
        }
        return new Int8Array(u8.buffer, 0, expectedLen);
    }

    function b64ToFloat32Array(b64str, expectedLen) {
        var raw = b64Decode(b64str);
        var u8 = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
        var expectedBytes = expectedLen * 4;
        if (u8.length < expectedBytes) {
            throw new Error("Base64 decode length mismatch for Float32: got " + u8.length + ", expected >= " + expectedBytes);
        }
        return new Float32Array(u8.buffer, 0, expectedLen);
    }

    function b64Encode(str) {
        if (typeof btoa === "function") {
            try { return btoa(str); } catch (_) {}
        }
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "";
        var i = 0;
        while (i < str.length) {
            var c1 = str.charCodeAt(i++);
            var c2 = i < str.length ? str.charCodeAt(i++) : NaN;
            var c3 = i < str.length ? str.charCodeAt(i++) : NaN;
            out += chars.charAt(c1 >> 2);
            out += chars.charAt(((c1 & 3) << 4) | ((isNaN(c2) ? 0 : c2) >> 4));
            out += isNaN(c2) ? "=" : chars.charAt(((c2 & 15) << 2) | ((isNaN(c3) ? 0 : c3) >> 6));
            out += isNaN(c3) ? "=" : chars.charAt(c3 & 63);
        }
        return out;
    }

    function b64Decode(str) {
        if (typeof atob === "function") {
            try { return atob(str); } catch (_) {}
        }
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "";
        str = str.replace(/[^A-Za-z0-9+/]/g, "");
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

    // =========================================================================
    // 快速点积搜索（Int8 量化 / Float32 归一化 双模式）
    // 改进：4x 循环展开 + 提前终止优化
    // =========================================================================
    function fastDotSearch(queryVec, fastIdx, threshold, topK) {
        var dim = fastIdx.dim;
        var count = fastIdx.count;

        // 归一化查询向量
        var norm = 0;
        for (var qi = 0; qi < queryVec.length; qi++) norm += queryVec[qi] * queryVec[qi];
        norm = Math.sqrt(norm);
        if (norm < 1e-10) return [];
        var inv = 1.0 / norm;

        var heap = [];
        var heapMin = threshold;

        if (fastIdx.quantized && fastIdx.int8Data) {
            // === Int8 量化搜索路径 ===
            var int8Data = fastIdx.int8Data;
            var scales = fastIdx.scales;

            // 量化查询向量
            var qNormed = new Float32Array(dim);
            var qMaxAbs = 0;
            for (var qi2 = 0; qi2 < dim; qi2++) {
                qNormed[qi2] = queryVec[qi2] * inv;
                var qa = qNormed[qi2] < 0 ? -qNormed[qi2] : qNormed[qi2];
                if (qa > qMaxAbs) qMaxAbs = qa;
            }
            var qScale = qMaxAbs > 0 ? 127.0 / qMaxAbs : 0;
            var qInvScale = qMaxAbs > 0 ? qMaxAbs / 127.0 : 0;
            var qInt8 = new Int8Array(dim);
            for (var qi3 = 0; qi3 < dim; qi3++) {
                qInt8[qi3] = Math.round(qNormed[qi3] * qScale);
            }

            for (var i = 0; i < count; i++) {
                if (scales[i] === 0) continue;
                var offset = i * dim;

                // 4x 展开循环加速
                var dot = 0;
                var jj = 0;
                var limit = dim - 3;
                for (; jj < limit; jj += 4) {
                    dot += qInt8[jj] * int8Data[offset + jj]
                         + qInt8[jj + 1] * int8Data[offset + jj + 1]
                         + qInt8[jj + 2] * int8Data[offset + jj + 2]
                         + qInt8[jj + 3] * int8Data[offset + jj + 3];
                }
                for (; jj < dim; jj++) {
                    dot += qInt8[jj] * int8Data[offset + jj];
                }

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
                    // 使用冒泡重排（比全排序快）
                    heapBubbleUp(heap);
                    heapMin = heap[0].score;
                }
            }
        } else if (fastIdx.flat) {
            // === Float32 归一化搜索路径 ===
            var flat = fastIdx.flat;
            var mask = fastIdx.validMask;
            var qNormed2 = new Float32Array(dim);
            for (var qi4 = 0; qi4 < dim; qi4++) {
                qNormed2[qi4] = queryVec[qi4] * inv;
            }

            for (var i2 = 0; i2 < count; i2++) {
                if (!mask[i2]) continue;
                var offset2 = i2 * dim;
                var dot2 = 0;
                var j2 = 0;
                var limit2 = dim - 3;
                for (; j2 < limit2; j2 += 4) {
                    dot2 += qNormed2[j2] * flat[offset2 + j2]
                          + qNormed2[j2 + 1] * flat[offset2 + j2 + 1]
                          + qNormed2[j2 + 2] * flat[offset2 + j2 + 2]
                          + qNormed2[j2 + 3] * flat[offset2 + j2 + 3];
                }
                for (; j2 < dim; j2++) {
                    dot2 += qNormed2[j2] * flat[offset2 + j2];
                }

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

    /**
     * 最小堆冒泡：将 heap[0] 下沉到正确位置
     * 比每次 sort 更高效
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

    // =========================================================================
    // 余弦相似度（回退用，无快速索引时）
    // =========================================================================
    function cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        var dot = 0, normA = 0, normB = 0;
        for (var i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        var denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom < 1e-10 ? 0 : dot / denom;
    }

    // =========================================================================
    // 关键词搜索（CJK 分词 + TF-IDF 加权）
    // =========================================================================
    function tokenize(query) {
        var lower = query.toLowerCase().trim();
        if (!lower) return [];

        var tokens = [];

        // 英文词
        var enWords = lower.match(/[a-z0-9_]+/g) || [];
        for (var i = 0; i < enWords.length; i++) {
            if (enWords[i].length > 1) tokens.push(enWords[i]);
        }

        // CJK n-gram（含日文假名 + 韩文，与 Python _tokenize 保持一致）
        var cjkRanges = lower.match(/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]+/g) || [];
        for (var ci = 0; ci < cjkRanges.length; ci++) {
            var seg = cjkRanges[ci];
            if (seg.length <= 4) {
                tokens.push(seg);
            } else {
                var cap = Math.min(seg.length, 20);
                for (var n = 2; n <= 3; n++) {
                    for (var si = 0; si <= cap - n; si++) {
                        tokens.push(seg.substring(si, si + n));
                    }
                }
                tokens.push(seg.substring(0, cap));
            }
        }

        // 去重保序
        var seen = {};
        var unique = [];
        for (var ui = 0; ui < tokens.length; ui++) {
            if (!seen[tokens[ui]]) {
                seen[tokens[ui]] = true;
                unique.push(tokens[ui]);
            }
        }

        return unique.length > 0 ? unique : lower.split(/\s+/).filter(Boolean);
    }

    function keywordSearch(query, allChunks, topK) {
        var parts = tokenize(query);
        if (!parts.length || !allChunks || !allChunks.length) return [];

        var totalChunks = allChunks.length;

        // IDF 权重
        var idfWeights = {};
        for (var pi = 0; pi < parts.length; pi++) {
            var part = parts[pi];
            var docCount = 0;
            for (var ci = 0; ci < allChunks.length; ci++) {
                var txt = (allChunks[ci].text || "").toLowerCase();
                if (txt.indexOf(part) >= 0) docCount++;
            }
            idfWeights[part] = Math.log((totalChunks + 1) / (docCount + 1)) + 1;
        }

        var scored = [];
        for (var i = 0; i < allChunks.length; i++) {
            var chunkLower = (allChunks[i].text || "").toLowerCase();
            if (!chunkLower) continue;

            var score = 0;
            var matchCount = 0;

            for (var pi2 = 0; pi2 < parts.length; pi2++) {
                var p = parts[pi2];
                var count = 0;
                var pos = 0;
                while ((pos = chunkLower.indexOf(p, pos)) >= 0) {
                    count++;
                    pos += p.length;
                }
                if (count > 0) {
                    matchCount++;
                    var tf = 1 + Math.log(count);
                    score += tf * (idfWeights[p] || 1) * p.length;

                    // 位置加权（出现越靠前越重要）
                    var firstPos = chunkLower.indexOf(p);
                    if (firstPos >= 0) {
                        score += Math.max(0, 1.0 - firstPos / Math.max(chunkLower.length, 1)) * 0.5;
                    }
                }
            }

            if (matchCount > 0) {
                var coverage = matchCount / parts.length;
                score *= (1 + coverage * 0.5);
                scored.push({
                    chunkIdx: i,
                    score: Math.round(score * 100) / 100
                });
            }
        }

        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.slice(0, topK);
    }

    // =========================================================================
    // 上下文扩展
    // =========================================================================
    function expandContext(results, allChunks) {
        if (!allChunks || !allChunks.length) return results;
        var total = allChunks.length;
        var expanded = [];

        for (var i = 0; i < results.length; i++) {
            var r = {};
            // 复制属性
            var keys = Object.keys(results[i]);
            for (var ki = 0; ki < keys.length; ki++) {
                r[keys[ki]] = results[i][keys[ki]];
            }

            var cid = r.chunkIdx !== undefined ? r.chunkIdx : -1;
            if (cid < 0 || cid >= total) {
                expanded.push(r);
                continue;
            }

            var currentFile = allChunks[cid].filePath || "";

            // 前文上下文
            if (cid > 0 && allChunks[cid - 1].filePath === currentFile) {
                r.contextBefore = truncateContent(allChunks[cid - 1].text || "", 200);
            }

            // 后文上下文
            if (cid < total - 1 && allChunks[cid + 1].filePath === currentFile) {
                r.contextAfter = truncateContent(allChunks[cid + 1].text || "", 200);
            }

            expanded.push(r);
        }

        return expanded;
    }

    // =========================================================================
    // RRF 多查询融合排序
    // =========================================================================
    function rrfFusion(semanticResults, keywordResults, topK) {
        var K = 60;
        var scores = {};

        for (var i = 0; i < semanticResults.length; i++) {
            var idx = semanticResults[i].chunkIdx;
            if (!scores[idx]) scores[idx] = { chunkIdx: idx, rrf: 0, bestScore: 0 };
            scores[idx].rrf += 1.0 / (K + i + 1);
            scores[idx].bestScore = Math.max(scores[idx].bestScore, semanticResults[i].score);
        }

        for (var j = 0; j < keywordResults.length; j++) {
            var idx2 = keywordResults[j].chunkIdx;
            if (!scores[idx2]) scores[idx2] = { chunkIdx: idx2, rrf: 0, bestScore: 0 };
            scores[idx2].rrf += 1.0 / (K + j + 1);
            scores[idx2].bestScore = Math.max(scores[idx2].bestScore, keywordResults[j].score);
        }

        var merged = Object.keys(scores).map(function (k) { return scores[k]; });
        merged.sort(function (a, b) { return b.rrf - a.rrf; });

        return merged.slice(0, topK).map(function (item) {
            return { chunkIdx: item.chunkIdx, score: Math.round(item.bestScore * 10000) / 10000 };
        });
    }

    // =========================================================================
    // 快速索引持久化（保存/加载）
    // =========================================================================
    async function saveFastIndex(config, allVecs, dim, allChunks, fpHash) {
        try {
            sendProgress("Generating fast index...", { phase: "fast_index" });

            var qResult = quantizeVectors(allVecs, dim);

            var chunkMeta = [];
            for (var i = 0; i < allChunks.length; i++) {
                chunkMeta.push({
                    f: allChunks[i].filePath || "",
                    sl: allChunks[i].startLine || 0,
                    el: allChunks[i].endLine || 0
                });
            }

            var indexData = {
                version: "2.0",
                count: qResult.count,
                dim: qResult.dim,
                model: config.model,
                normalized: true,
                quantized: "int8",
                fpHash: fpHash,
                vectorsB64: typedArrayToB64(qResult.int8Data),
                scalesB64: typedArrayToB64(qResult.scales),
                chunkMeta: chunkMeta
            };

            await writeJsonSafe(FAST_INDEX_FILE, indexData);
            sendProgress("Fast index saved (" + qResult.count + " vectors)", { phase: "fast_index_done" });

            return {
                int8Data: qResult.int8Data,
                scales: qResult.scales,
                dim: dim,
                count: qResult.count,
                quantized: true
            };
        } catch (e) {
            sendProgress("Fast index generation failed: " + (e.message || s(e)), { phase: "fast_index_error" });
            return null;
        }
    }

    async function loadFastIndex(config, fpHash) {
        try {
            if (!(await fileExists(FAST_INDEX_FILE))) return null;
            var raw = await Tools.Files.read(FAST_INDEX_FILE, "android");
            if (!raw || !raw.content) return null;

            var data = JSON.parse(raw.content);
            if (!data || data.version !== "2.0" || !data.vectorsB64) return null;
            if (data.model !== config.model) return null;
            if (data.fpHash !== fpHash) return null;

            var int8Data = b64ToInt8Array(data.vectorsB64, data.count * data.dim);
            var scalesArr = b64ToFloat32Array(data.scalesB64, data.count);
            var chunkMeta = data.chunkMeta || [];

            return {
                fastIndex: {
                    int8Data: int8Data,
                    scales: scalesArr,
                    dim: data.dim,
                    count: data.count,
                    quantized: true
                },
                chunkMeta: chunkMeta,
                dim: data.dim,
                count: data.count
            };
        } catch (e) {
            // 索引损坏，删除并返回 null
            await deleteFile(FAST_INDEX_FILE);
            return null;
        }
    }

    // =========================================================================
    // 加载全部向量与分块（从分片文件汇集）
    // 改进：按需加载、内存友好
    // =========================================================================
    async function loadAllVecsAndChunks(meta) {
        var filesIndexed = meta.filesIndexed || [];
        if (!filesIndexed.length) return { vecs: [], chunks: [] };

        var allVecs = [];
        var allChunks = [];
        var skippedFiles = 0;

        for (var i = 0; i < filesIndexed.length; i++) {
            var fi = filesIndexed[i];
            var relPath = fi.relPath;

            try {
                var vecs = await readFileVectors(relPath);
                var chunks = await readFileChunks(relPath);

                if (!vecs || !chunks) {
                    skippedFiles++;
                    continue;
                }

                var minLen = Math.min(vecs.length, chunks.length);
                for (var j = 0; j < minLen; j++) {
                    allVecs.push(vecs[j]);
                    allChunks.push({
                        filePath: relPath,
                        startLine: chunks[j].startLine || 0,
                        endLine: chunks[j].endLine || 0,
                        text: chunks[j].text || ""
                    });
                }
            } catch (e) {
                skippedFiles++;
                continue;
            }

            // 每 50 个文件释放一次（GC 友好）
            if (i > 0 && i % 50 === 0) {
                vecs = null;
                chunks = null;
            }
        }

        return { vecs: allVecs, chunks: allChunks, skippedFiles: skippedFiles };
    }

    /**
     * 指纹哈希（用于快速索引一致性校验）
     */
    function computeFpHash(fingerprints) {
        var keys = Object.keys(fingerprints).sort();
        var h = 0;
        for (var i = 0; i < keys.length; i++) {
            var str = keys[i] + "=" + fingerprints[keys[i]];
            for (var j = 0; j < str.length; j++) {
                h = ((h << 5) - h + str.charCodeAt(j)) | 0;
            }
        }
        return (h >>> 0).toString(36);
    }

    // =========================================================================
    // Python 引擎搜索（BLAS+mmap 极速，永远优先尝试，无需预加载 JS 向量数据）
    // =========================================================================
    async function searchViaPython(params, config, totalChunks, fileFilter, extFilterSet) {
        // 临时文件路径（用于向量输入和结果输出，规避终端输出大小限制）
        var tmpVecFile  = null;
        var tmpOutFile  = null;
        try {
            var pyEnginePath = getPyEnginePath();
            if (!(await fileExists(pyEnginePath))) {
                sendProgress("[WARN] Python 引擎脚本不存在: " + pyEnginePath);
                return null;
            }

            var query     = s(params.query).trim();
            var topK      = safeInt(params.top_k, 10, 1, 50);
            var threshold = safeFloat(params.threshold, 0.3, 0, 1);

            // 查询向量（LRU 缓存优先）
            var queryVec = getCachedQueryVec(query);
            if (!queryVec) {
                var queryEmbeddings = await callEmbedBatch(config, [query]);
                if (!queryEmbeddings || !queryEmbeddings[0]) return null;
                queryVec = queryEmbeddings[0];
                setCachedQueryVec(query, queryVec);
            }

            var queryVecJson = JSON.stringify(queryVec);
            var escapedDir   = DB_DIR.replace(/'/g, "'\\''");
            var escapedPy    = pyEnginePath.replace(/'/g, "'\\''");
            var pyBin        = getPyBin();

            // 多取 topK（过滤后再截断）
            var requestK = (fileFilter || extFilterSet) ? Math.min(topK * 5, 50) : topK;

            // ── 构造输入参数 ──────────────────────────────────────────────────
            // 向量 JSON 过大（> 16 KB）时写临时文件，用 shell stdin 重定向传给 Python
            var vecArg;
            if (queryVecJson.length > 16384) {
                tmpVecFile = DB_DIR + ".tmp_qvec_" + Date.now() + ".json";
                try {
                    await Tools.Files.write(tmpVecFile, queryVecJson, false, "android");
                    vecArg = "- < '" + tmpVecFile.replace(/'/g, "'\\''") + "'";
                } catch (_we) {
                    // 写入失败则截断后直接传参（仍可用，精度略有损失）
                    tmpVecFile = null;
                    vecArg = "'" + queryVecJson.substring(0, 16000).replace(/'/g, "'\\''") + "'";
                }
            } else {
                vecArg = "'" + queryVecJson.replace(/'/g, "'\\''") + "'";
            }

            // ── 结果输出重定向到临时文件，完全绕过终端输出大小限制 ─────────────
            // Python 的搜索结果 JSON 可达数十 KB（10 条 × 2000 字符内容），
            // terminal.exec 输出缓冲不足时会截断，导致 JSON.parse 失败。
            // 将 stdout+stderr 全部重定向到文件，由 JS 读文件获取完整结果。
            tmpOutFile = DB_DIR + ".tmp_pyout_" + Date.now() + ".json";
            var escapedOut = tmpOutFile.replace(/'/g, "'\\''");

            var cmd = pyBin + " '" + escapedPy + "'" +
                " search '" + escapedDir + "' " + vecArg +
                " " + requestK + " " + threshold + " true" +
                " > '" + escapedOut + "' 2>&1";

            sendProgress("Python 引擎搜索中...", { phase: "py_search_start" });

            // 超时 90 s：首次调用可能触发 auto_optimize（构建二进制索引）
            var execResult = await execPythonCommand(cmd, 90000);

            // exitCode 非 0 时也尝试读文件（里面含错误信息）
            var rawOut = "";
            try {
                var readRes = await Tools.Files.read(tmpOutFile, "android");
                rawOut = (readRes && readRes.content) ? readRes.content.trim() : "";
            } catch (_re) {}

            if (!rawOut && execResult && execResult.output) {
                // 兜底：若文件读取失败，退化到终端输出（可能被截断）
                rawOut = execResult.output.trim();
            }

            // 从最后一行向上找第一个以 '{' 开头的合法 JSON
            var pyResult = null;
            if (rawOut) {
                var outLines = rawOut.split("\n");
                for (var li = outLines.length - 1; li >= 0; li--) {
                    var ol = outLines[li].trim();
                    if (ol.charAt(0) === "{") {
                        try { pyResult = JSON.parse(ol); break; } catch (_) {}
                    }
                }
            }

            if (!pyResult || !pyResult.success) {
                var errDetail = pyResult
                    ? (pyResult.message || JSON.stringify(pyResult).substring(0, 300))
                    : (rawOut ? rawOut.substring(rawOut.length - 500) : "no output");
                sendProgress("Python 引擎搜索失败: " + errDetail, { phase: "py_search_fail" });
                return null;
            }

            sendProgress("Python 引擎搜索成功，返回 " + (pyResult.data ? pyResult.data.length : 0) + " 条结果",
                { phase: "py_search_done" });

            var data    = pyResult.data || [];
            var results = [];

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var fp   = item.file_path || item.fileName || item.file || "";

                if (fileFilter && fp.toLowerCase().indexOf(fileFilter) < 0) continue;
                if (extFilterSet) {
                    var dotIdx = fp.lastIndexOf(".");
                    var vecExt = dotIdx >= 0 ? fp.substring(dotIdx + 1).toLowerCase() : "";
                    if (!extFilterSet[vecExt]) continue;
                }

                results.push({
                    rank: results.length + 1,
                    score: Math.round((item.score || 0) * 10000) / 10000,
                    filePath: fp,
                    startLine: item.start_line || 0,
                    endLine: item.end_line || 0,
                    content: truncateContent(item.text || item.content || "", MAX_CHUNK_DISPLAY),
                    contextBefore: item.context_before || undefined,
                    contextAfter: item.context_after || undefined
                });

                if (results.length >= topK) break;
            }

            return {
                success: true, packageVersion: PKG_VERSION,
                query: query,
                searchMethod: "python_semantic",
                pyAssisted: true,
                pyEngineVersion: pyResult.py_engine_version || "unknown",
                totalVectorsSearched: pyResult.total_chunks || totalChunks,
                resultsFound: data.length,
                resultsReturned: results.length,
                results: results
            };

        } catch (e) {
            sendProgress("Python 引擎异常，降级到 JS 引擎: " + (e.message || s(e)),
                { phase: "py_search_error" });
            return null;
        } finally {
            // 清理临时文件
            if (tmpVecFile) { try { await Tools.Files.delete(tmpVecFile, false, "android"); } catch (_) {} }
            if (tmpOutFile) { try { await Tools.Files.delete(tmpOutFile, false, "android"); } catch (_) {} }
        }
    }

    // =========================================================================
    // vectorize_scan
    // 改进：不再读取每个文件内容（仅用 entry.size 估算）
    // =========================================================================
    async function vectorize_scan(params) {
        var extensions = parseExtensions(params && params.extensions);
        var files = await scanFiles(PROJECT_ROOT, extensions);

        var extCount = {};
        var totalSizeBytes = 0;
        var config;
        try { config = getConfig(); } catch (e) { config = { maxFileSizeKB: 512 }; }
        var maxSizeKB = config.maxFileSizeKB;
        var skippedCount = 0;

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var ext = f.ext || "unknown";
            extCount[ext] = (extCount[ext] || 0) + 1;
            totalSizeBytes += (f.sizeKB || 0) * 1024;
            if (f.sizeKB > maxSizeKB) skippedCount++;
        }

        var extSummary = [];
        var sortedExts = Object.keys(extCount).sort(function (a, b) { return extCount[b] - extCount[a]; });
        for (var j = 0; j < sortedExts.length; j++) {
            extSummary.push(sortedExts[j] + ": " + extCount[sortedExts[j]]);
        }

        return {
            success: true,
            packageVersion: PKG_VERSION,
            totalFiles: files.length,
            processableFiles: files.length - skippedCount,
            skippedFiles: skippedCount,
            totalSizeEstimate: formatBytes(totalSizeBytes),
            extensionDistribution: extSummary.join(", "),
            scannedExtensions: extensions.join(", "),
            projectRoot: PROJECT_ROOT,
            maxFileSizeKB: maxSizeKB
        };
    }

    // =========================================================================
    // vectorize_build（核心：增量构建 + 断点续建 + 稳定嵌入）
    // =========================================================================
    // 改进要点：
    // 1. 断点续建：每个文件嵌入后立即保存进度，崩溃后可精确恢复
    // 2. 进度显示：每个文件完成后上报，含 ETA 估算
    // 3. 速度优化：批量指纹比对、跳过已嵌入文件的分块写入
    // 4. 内存优化：及时释放文件内容、不缓存所有文件在内存
    // 5. 稳定性：降低默认并发、嵌入间插入微休眠、错误隔离
    // =========================================================================
    async function vectorize_build(params) {
        var config = getConfig();
        var extensions = parseExtensions(params && params.extensions);
        var forceRebuild = safeBool(params && params.force_rebuild);
        var dryRun = safeBool(params && params.dry_run);
        var maxBytes = config.maxFileSizeKB * 1024;
        var startTime = Date.now();

        await ensureDirs();

        // =====================================================================
        // Phase 0: 扫描文件
        // =====================================================================
        sendProgress("Scanning project files...", { phase: "scan" });
        var files = await scanFiles(PROJECT_ROOT, extensions);
        sendProgress("Found " + files.length + " files", { phase: "scan_done", total: files.length });

        // =====================================================================
        // Phase 1: 变更检测（批量指纹比对）
        // =====================================================================
        sendProgress("Detecting changes...", { phase: "fingerprint" });
        var oldFingerprints = forceRebuild ? {} : await loadFingerprints();
        var oldMeta = await loadMeta();

        var currentFilePaths = {};
        var newFiles = [];
        var modifiedFiles = [];
        var unchangedFiles = [];
        var skippedFiles = [];

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var relPath = relativePath(f.path);
            currentFilePaths[relPath] = true;

            // 快速跳过超大文件（不读取内容）
            if (f.sizeKB > config.maxFileSizeKB) {
                skippedFiles.push(relPath);
                continue;
            }

            var contentResult;
            try {
                contentResult = await Tools.Files.read(f.path, "android");
            } catch (e) {
                skippedFiles.push(relPath);
                continue;
            }

            var content = contentResult && contentResult.content ? contentResult.content : "";
            if (!content || content.trim().length === 0) {
                skippedFiles.push(relPath);
                continue;
            }

            if (content.length > maxBytes) {
                skippedFiles.push(relPath);
                content = null; // 释放内存
                continue;
            }

            var hash = computeFingerprint(content);

            if (oldFingerprints[relPath] && oldFingerprints[relPath] === hash) {
                unchangedFiles.push(relPath);
                content = null; // 释放内存
            } else if (oldFingerprints[relPath]) {
                modifiedFiles.push({ relPath: relPath, content: content, hash: hash });
            } else {
                newFiles.push({ relPath: relPath, content: content, hash: hash });
            }

            // 进度上报（每 20 个文件）
            if ((i + 1) % 20 === 0) {
                sendProgress("Scanning: " + (i + 1) + "/" + files.length, {
                    phase: "fingerprint", done: i + 1, total: files.length
                });
            }
        }

        // 检测已删除文件
        var deletedFiles = [];
        var oldPaths = Object.keys(oldFingerprints);
        for (var k = 0; k < oldPaths.length; k++) {
            if (!currentFilePaths[oldPaths[k]]) {
                deletedFiles.push(oldPaths[k]);
            }
        }

        var filesToProcess = newFiles.concat(modifiedFiles);

        sendProgress("Changes detected: " + newFiles.length + " new, " + modifiedFiles.length + " modified, " +
            unchangedFiles.length + " unchanged, " + deletedFiles.length + " deleted", {
            phase: "fingerprint_done",
            newFiles: newFiles.length,
            modifiedFiles: modifiedFiles.length,
            unchangedFiles: unchangedFiles.length,
            deletedFiles: deletedFiles.length
        });

        // Dry run 模式
        if (dryRun) {
            return {
                success: true, packageVersion: PKG_VERSION, dryRun: true,
                newFiles: newFiles.length, modifiedFiles: modifiedFiles.length,
                unchangedFiles: unchangedFiles.length, deletedFiles: deletedFiles.length,
                skippedFiles: skippedFiles.length, totalToProcess: filesToProcess.length,
                message: "Dry run complete. No changes applied."
            };
        }

        // =====================================================================
        // Phase 2: 清理已删除和已修改文件的旧数据
        // =====================================================================
        if (deletedFiles.length > 0 || modifiedFiles.length > 0) {
            sendProgress("Cleaning stale data...", { phase: "cleanup" });
            for (var d = 0; d < deletedFiles.length; d++) {
                await deleteFileVectors(deletedFiles[d]);
                await deleteFileChunks(deletedFiles[d]);
            }
            for (var m = 0; m < modifiedFiles.length; m++) {
                await deleteFileVectors(modifiedFiles[m].relPath);
                await deleteFileChunks(modifiedFiles[m].relPath);
            }
        }

        // 构建新指纹表（保留未变更的，删除已移除的）
        var newFingerprints = {};
        for (var fp in oldFingerprints) {
            if (Object.prototype.hasOwnProperty.call(oldFingerprints, fp)) {
                if (currentFilePaths[fp]) {
                    // 检查是否是被修改的文件
                    var isModified = false;
                    for (var mi = 0; mi < modifiedFiles.length; mi++) {
                        if (modifiedFiles[mi].relPath === fp) {
                            isModified = true;
                            break;
                        }
                    }
                    if (!isModified) {
                        newFingerprints[fp] = oldFingerprints[fp];
                    }
                }
            }
        }

        // 无需处理的情况
        if (filesToProcess.length === 0) {
            // 只需清理已删除文件的指纹
            if (deletedFiles.length > 0) {
                await saveFingerprints(newFingerprints);
                var meta = await loadMeta();
                meta.filesIndexed = (meta.filesIndexed || []).filter(function (fi) {
                    return currentFilePaths[fi.relPath];
                });
                meta.totalFiles = meta.filesIndexed.length;
                var tc = 0;
                for (var tci = 0; tci < meta.filesIndexed.length; tci++) tc += meta.filesIndexed[tci].chunks;
                meta.totalChunks = tc;
                meta.updatedAt = Date.now();
                await saveMeta(meta);

                // 快速索引需更新
                await deleteFile(FAST_INDEX_FILE);
                _fastIndexCache = null;
            }

            // 即使无文件需处理，也尝试优化 Python 引擎索引
            try {
                var pyEnginePath = getPyEnginePath();
                if (await fileExists(pyEnginePath)) {
                    var pyOptCmd = getPyBin() + " '" + pyEnginePath.replace(/'/g, "'\\''") + "'" +
                        " optimize '" + DB_DIR.replace(/'/g, "'\\''") + "'";
                    var pyOptResult = await execPythonCommand(pyOptCmd, 120000);
                    if (pyOptResult && pyOptResult.exitCode === 0) {
                        sendProgress("Python binary index built", { phase: "py_optimize_done" });
                    }
                }
            } catch (e) { /* Python 引擎不可用，忽略 */ }

            return {
                success: true, packageVersion: PKG_VERSION,
                newFiles: 0, modifiedFiles: 0,
                unchangedFiles: unchangedFiles.length,
                deletedFiles: deletedFiles.length,
                skippedFiles: skippedFiles.length,
                chunksProcessed: 0, chunksEmbedded: 0, embeddingErrors: 0,
                totalVectorsInDb: oldMeta.totalChunks || 0,
                totalFilesInDb: unchangedFiles.length,
                buildNumber: (oldMeta.buildCount || 0) + 1,
                model: config.model,
                vectorDim: oldMeta.vectorDim || 0,
                elapsedSec: ((Date.now() - startTime) / 1000).toFixed(1),
                message: "No files need processing."
            };
        }

        // =====================================================================
        // Phase 3: 断点续建检测
        // =====================================================================
        var progress = forceRebuild ? null : await loadProgress();
        var resumeEmbedded = {};

        if (progress && progress.model === config.model && progress.embedded && Array.isArray(progress.embedded)) {
            for (var ri = 0; ri < progress.embedded.length; ri++) {
                resumeEmbedded[progress.embedded[ri]] = true;
            }
            if (progress.embedded.length > 0) {
                sendProgress("Resuming from checkpoint: " + progress.embedded.length + " files already embedded", {
                    phase: "resume", skipped: progress.embedded.length
                });
            }
        } else {
            progress = null;
        }

        // =====================================================================
        // Phase 4: 分块
        // =====================================================================
        sendProgress("Phase 1/2: Chunking " + filesToProcess.length + " files...", {
            phase: "chunking", total: filesToProcess.length
        });

        var totalNewChunks = 0;
        var chunkedFiles = [];

        for (var p = 0; p < filesToProcess.length; p++) {
            var file = filesToProcess[p];

            try {
                // 如果已在断点续建中嵌入过，跳过分块写入（但仍记录）
                if (resumeEmbedded[file.relPath]) {
                    var existingChunks = await readFileChunks(file.relPath);
                    var existingCount = existingChunks ? existingChunks.length : 0;
                    if (existingCount > 0 && await hasFileVectors(file.relPath)) {
                        chunkedFiles.push({ relPath: file.relPath, chunkCount: existingCount });
                        totalNewChunks += existingCount;
                        newFingerprints[file.relPath] = file.hash;
                        continue;
                    }
                    // 分块文件不存在或向量不存在，需要重新处理
                    delete resumeEmbedded[file.relPath];
                }

                var chunks = chunkText(file.content, config.chunkSize, config.chunkOverlap);
                if (chunks.length > 0) {
                    await writeFileChunks(file.relPath, chunks);
                    totalNewChunks += chunks.length;
                    chunkedFiles.push({ relPath: file.relPath, chunkCount: chunks.length });
                }
                newFingerprints[file.relPath] = file.hash;

                // 释放文件内容（GC 友好）
                file.content = null;

                // 进度上报（每 5 个文件或最后一个）
                if ((p + 1) % 5 === 0 || p === filesToProcess.length - 1) {
                    sendProgress("Chunking: " + (p + 1) + "/" + filesToProcess.length + " (" + totalNewChunks + " chunks)", {
                        phase: "chunking", done: p + 1, total: filesToProcess.length, chunks: totalNewChunks
                    });
                }
            } catch (e) {
                skippedFiles.push(file.relPath);
                file.content = null;
                sendProgress("Chunk error: " + file.relPath + " - " + (e.message || s(e)), { phase: "chunk_error" });
            }
        }

        // 释放所有文件内容引用（保存计数，防止后续引用空指针）
        var newFilesCount = newFiles ? newFiles.length : 0;
        var modifiedFilesCount = modifiedFiles ? modifiedFiles.length : 0;
        filesToProcess = null;
        newFiles = null;
        modifiedFiles = null;

        // =====================================================================
        // Phase 5: 嵌入（核心，含断点续建）
        // =====================================================================
        var filesToEmbed = chunkedFiles.filter(function (cf) {
            return !resumeEmbedded[cf.relPath];
        });

        var embedErrors = 0;
        var embeddedCount = Object.keys(resumeEmbedded).length; // 已恢复的数量
        var detectedDim = 0;

        if (filesToEmbed.length > 0) {
            // 维度探测（优先查表）
            detectedDim = getModelDefaultDim(config.model);
            if (detectedDim > 0) {
                sendProgress("Model dimension: " + detectedDim + " (lookup)", {
                    phase: "dim_probe", dim: detectedDim
                });
            } else {
                try {
                    sendProgress("Probing embedding dimension...", { phase: "dim_probe" });
                    var probeVecs = await callEmbedBatch(config, ["dimension probe"]);
                    if (probeVecs.length > 0 && probeVecs[0]) {
                        detectedDim = probeVecs[0].length;
                        sendProgress("Detected dimension: " + detectedDim, {
                            phase: "dim_probe", dim: detectedDim
                        });
                    }
                } catch (probeErr) {
                    sendProgress("Dimension probe failed: " + probeErr.message, { phase: "dim_error" });
                }
            }

            // 维度一致性检查
            if (detectedDim > 0 && oldMeta.vectorDim > 0 && oldMeta.vectorDim !== detectedDim) {
                sendProgress("Dimension conflict: existing " + oldMeta.vectorDim + "d vs current " + detectedDim + "d → force rebuilding all", {
                    phase: "dim_conflict"
                });
                // 清理所有旧向量
                var oldIndexed = oldMeta.filesIndexed || [];
                for (var ci = 0; ci < oldIndexed.length; ci++) {
                    await deleteFileVectors(oldIndexed[ci].relPath);
                }
                resumeEmbedded = {};
                embeddedCount = 0;
                filesToEmbed = chunkedFiles.slice();
            }

            var totalToEmbed = filesToEmbed.length;
            sendProgress("Phase 2/2: Embedding " + totalToEmbed + " files (" + config.concurrency + " concurrent)", {
                phase: "embedding", total: totalToEmbed, concurrency: config.concurrency
            });

            // 初始化断点进度
            var newProgress = {
                version: PKG_VERSION,
                model: config.model,
                embedded: progress ? (progress.embedded || []).slice() : [],
                startedAt: new Date().toISOString(),
                totalFiles: totalToEmbed
            };

            // 嵌入处理：逐文件处理，受控并发
            var embedStartTime = Date.now();
            var fileEmbedCount = 0;
            var lastProgressSave = 0;

            // 创建嵌入任务
            var embedTasks = [];
            for (var eti = 0; eti < filesToEmbed.length; eti++) {
                (function (fileInfo, fileIndex) {
                    embedTasks.push(async function () {
                        var rp = fileInfo.relPath;
                        var fChunks = await readFileChunks(rp);
                        if (!fChunks || fChunks.length === 0) {
                            return { relPath: rp, ok: true, empty: true, count: 0 };
                        }

                        // 分批嵌入
                        var allEmbeddings = [];
                        var batchSize = config.batchSize;

                        for (var bs = 0; bs < fChunks.length; bs += batchSize) {
                            var batchEnd = Math.min(bs + batchSize, fChunks.length);
                            var batchTexts = [];
                            for (var bi = bs; bi < batchEnd; bi++) {
                                var prefix = "[File: " + rp + " | Lines: " +
                                    (fChunks[bi].startLine || 0) + "-" + (fChunks[bi].endLine || 0) + "]\n";
                                batchTexts.push(prefix + (fChunks[bi].text || ""));
                            }

                            var embeddings = await callEmbedBatch(config, batchTexts);
                            for (var ei = 0; ei < embeddings.length; ei++) {
                                allEmbeddings.push(embeddings[ei]);
                            }

                            // 批间微休眠（降低 API 压力和手机负载）
                            if (bs + batchSize < fChunks.length) {
                                await Tools.System.sleep(100);
                            }
                        }

                        // 写入向量文件
                        await writeFileVectors(rp, allEmbeddings);

                        return { relPath: rp, ok: true, count: allEmbeddings.length };
                    });
                })(filesToEmbed[eti], eti);
            }

            // 执行嵌入任务（受控并发）
            // 不直接用 parallelLimit 处理所有文件，而是分批处理+保存进度
            var batchConcurrency = config.concurrency;
            var taskIdx = 0;

            while (taskIdx < embedTasks.length) {
                // 取一批任务
                var batchEnd2 = Math.min(taskIdx + batchConcurrency, embedTasks.length);
                var batchTasks = embedTasks.slice(taskIdx, batchEnd2);
                var batchFileInfos = filesToEmbed.slice(taskIdx, batchEnd2);

                // 并发执行这一批
                var batchResults = await parallelLimit(batchTasks, batchConcurrency);

                // 处理结果
                for (var bri = 0; bri < batchResults.length; bri++) {
                    var result = batchResults[bri];
                    var bFileInfo = batchFileInfos[bri];

                    if (result.ok && result.value && result.value.ok) {
                        var embeddedPath = result.value.relPath;
                        resumeEmbedded[embeddedPath] = true;
                        newProgress.embedded.push(embeddedPath);
                        embeddedCount++;
                        fileEmbedCount++;
                    } else {
                        embedErrors++;
                        var errFile = bFileInfo ? bFileInfo.relPath : "unknown";
                        var errMsg = result.error ? (result.error.message || s(result.error)) : "unknown error";
                        sendProgress("Embed error: " + errFile + " - " + errMsg, { phase: "embed_error" });
                    }
                }

                taskIdx = batchEnd2;

                // 保存断点进度（每 PROGRESS_SAVE_INTERVAL 个文件或最后一批）
                lastProgressSave += batchResults.length;
                if (lastProgressSave >= PROGRESS_SAVE_INTERVAL || taskIdx >= embedTasks.length) {
                    await saveProgress(newProgress);
                    lastProgressSave = 0;
                }

                // 上报进度（含 ETA）
                var elapsed = Date.now() - embedStartTime;
                var avgPerFile = fileEmbedCount > 0 ? elapsed / fileEmbedCount : 0;
                var remaining = totalToEmbed - fileEmbedCount - embedErrors;
                var eta = avgPerFile > 0 ? formatDuration(Math.round(avgPerFile * remaining)) : "...";

                sendProgress(
                    "Embedding: " + fileEmbedCount + "/" + totalToEmbed +
                    (embedErrors > 0 ? " (" + embedErrors + " errors)" : "") +
                    " | ETA: " + eta, {
                    phase: "embedding_progress",
                    done: fileEmbedCount,
                    total: totalToEmbed,
                    errors: embedErrors,
                    eta: eta
                });

                // 批间微休眠（防止 Shizuku 过载）
                if (taskIdx < embedTasks.length) {
                    await Tools.System.sleep(50);
                }
            }

            // 重试失败的文件（最多 2 轮）
            for (var retryRound = 0; retryRound < 2; retryRound++) {
                var failedFiles = filesToEmbed.filter(function (fe) {
                    return !resumeEmbedded[fe.relPath];
                });

                if (failedFiles.length === 0) break;

                sendProgress("Retry round " + (retryRound + 1) + ": " + failedFiles.length + " files", {
                    phase: "embedding_retry", round: retryRound + 1, remaining: failedFiles.length
                });

                // 等待一段时间再重试
                await Tools.System.sleep(2000);

                for (var rfi = 0; rfi < failedFiles.length; rfi++) {
                    var retryFile = failedFiles[rfi];
                    try {
                        var rfChunks = await readFileChunks(retryFile.relPath);
                        if (!rfChunks || rfChunks.length === 0) continue;

                        var rfEmbeddings = [];
                        for (var rbs = 0; rbs < rfChunks.length; rbs += config.batchSize) {
                            var rBatchEnd = Math.min(rbs + config.batchSize, rfChunks.length);
                            var rBatchTexts = [];
                            for (var rbi = rbs; rbi < rBatchEnd; rbi++) {
                                var rPrefix = "[File: " + retryFile.relPath + " | Lines: " +
                                    (rfChunks[rbi].startLine || 0) + "-" + (rfChunks[rbi].endLine || 0) + "]\n";
                                rBatchTexts.push(rPrefix + (rfChunks[rbi].text || ""));
                            }
                            var rEmbResult = await callEmbedBatch(config, rBatchTexts);
                            for (var rei = 0; rei < rEmbResult.length; rei++) {
                                rfEmbeddings.push(rEmbResult[rei]);
                            }
                            await Tools.System.sleep(200);
                        }

                        await writeFileVectors(retryFile.relPath, rfEmbeddings);
                        resumeEmbedded[retryFile.relPath] = true;
                        newProgress.embedded.push(retryFile.relPath);
                        embeddedCount++;
                        embedErrors--;

                        await saveProgress(newProgress);
                        sendProgress("Retry success: " + retryFile.relPath, { phase: "retry_success" });
                    } catch (retryErr) {
                        sendProgress("Retry failed: " + retryFile.relPath + " - " + (retryErr.message || ""), {
                            phase: "retry_failed"
                        });
                    }
                }
            }

            // 嵌入完成后清除进度文件
            await clearProgress();
        }

        // =====================================================================
        // Phase 6: 构建元数据
        // =====================================================================
        sendProgress("Building metadata...", { phase: "metadata" });

        var filesIndexed = [];

        // 合并：未变更的旧文件 + 新嵌入的文件
        for (var ui = 0; ui < unchangedFiles.length; ui++) {
            var uf = unchangedFiles[ui];
            // 验证文件数据完整性
            var hasVec = await hasFileVectors(uf);
            var hasChk = await hasFileChunks(uf);
            if (hasVec && hasChk) {
                var ufChunks = await readFileChunks(uf);
                filesIndexed.push({
                    relPath: uf,
                    chunks: ufChunks ? ufChunks.length : 0
                });
            }
        }

        for (var ci2 = 0; ci2 < chunkedFiles.length; ci2++) {
            var cf = chunkedFiles[ci2];
            if (resumeEmbedded[cf.relPath]) {
                filesIndexed.push({
                    relPath: cf.relPath,
                    chunks: cf.chunkCount
                });
            }
        }

        // 排序保证顺序一致
        filesIndexed.sort(function (a, b) {
            return a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0;
        });

        var totalChunks = 0;
        for (var fc = 0; fc < filesIndexed.length; fc++) {
            totalChunks += filesIndexed[fc].chunks;
        }

        var meta = {
            version: PKG_VERSION,
            createdAt: oldMeta.createdAt || Date.now(),
            updatedAt: Date.now(),
            buildCount: (oldMeta.buildCount || 0) + 1,
            model: config.model,
            chunkSize: config.chunkSize,
            vectorDim: detectedDim || oldMeta.vectorDim || 0,
            totalFiles: filesIndexed.length,
            totalChunks: totalChunks,
            buildComplete: true,
            filesIndexed: filesIndexed
        };
        await saveMeta(meta);
        await saveFingerprints(newFingerprints);

        // =====================================================================
        // Phase 7: 生成快速索引
        // =====================================================================
        if (filesIndexed.length > 0 && meta.vectorDim > 0) {
            sendProgress("Building fast index...", { phase: "fast_index_build" });
            try {
                var fpHash = computeFpHash(newFingerprints);
                var vc = await loadAllVecsAndChunks(meta);
                if (vc.vecs.length > 0) {
                    var fastIdx = await saveFastIndex(config, vc.vecs, meta.vectorDim, vc.chunks, fpHash);
                    _fastIndexCache = fastIdx;
                    _chunksCache = vc.chunks;
                    _chunksMeta = meta;
                }
                // 释放内存
                vc.vecs = null;
            } catch (indexErr) {
                sendProgress("Fast index build failed (non-critical): " + (indexErr.message || ""), {
                    phase: "fast_index_error"
                });
            }
        }

        // =====================================================================
        // Phase 8: 触发 Python 引擎预优化（构建二进制索引，加速后续搜索）
        // 无论数据集大小，构建完成后始终预生成，确保下次搜索可立即用 Python 引擎
        // =====================================================================
        try {
            var pyEnginePath = getPyEnginePath();
            if (await fileExists(pyEnginePath)) {
                var pyOptCmd = getPyBin() + " '" + pyEnginePath.replace(/'/g, "'\\''") + "'" +
                    " optimize '" + DB_DIR.replace(/'/g, "'\\''") + "'";
                var pyOptResult = await execPythonCommand(pyOptCmd, 120000);
                if (pyOptResult && pyOptResult.exitCode === 0) {
                    sendProgress("Python binary index built (ready for fast semantic search)", { phase: "py_optimize_done" });
                } else {
                    sendProgress("Python binary index build skipped (engine not available)", { phase: "py_optimize_skip" });
                }
            }
        } catch (e) { /* Python 引擎不可用，忽略，JS 引擎兜底 */ }

        // =====================================================================
        // 完成
        // =====================================================================
        var elapsedMs = Date.now() - startTime;
        var elapsedSec = (elapsedMs / 1000).toFixed(1);

        sendProgress("Build complete! " + totalChunks + " chunks in " + filesIndexed.length + " files, " +
            "dim " + meta.vectorDim + ", " + elapsedSec + "s", {
            phase: "complete", chunks: totalChunks, dim: meta.vectorDim, elapsed: elapsedSec
        });

        return {
            success: true, packageVersion: PKG_VERSION,
            newFiles: forceRebuild ? chunkedFiles.length : newFilesCount,
            modifiedFiles: modifiedFilesCount,
            unchangedFiles: unchangedFiles.length,
            deletedFiles: deletedFiles.length,
            skippedFiles: skippedFiles.length,
            chunksProcessed: totalNewChunks,
            chunksEmbedded: embeddedCount,
            embeddingErrors: embedErrors,
            totalVectorsInDb: totalChunks,
            totalFilesInDb: filesIndexed.length,
            buildNumber: meta.buildCount,
            model: config.model,
            vectorDim: meta.vectorDim,
            elapsedSec: elapsedSec
        };
    }

    // =========================================================================
    // vectorize_search（语义 + 关键词 + 融合搜索）
    // 优先顺序：Python 引擎(最快) → JS Int8 快速索引 → JS 余弦搜索 → 关键词降级
    // =========================================================================
    async function vectorize_search(params) {
        if (!params || !params.query || !s(params.query).trim()) {
            throw new Error("Missing required parameter: query");
        }

        var config = getConfig();
        var query = s(params.query).trim();
        var topK = safeInt(params.top_k, 10, 1, 50);
        var threshold = safeFloat(params.threshold, 0.3, 0, 1);
        var fileFilter = s(params.file_filter || "").trim().toLowerCase();
        var extFilter = s(params.ext_filter || "").trim().toLowerCase();
        var mode = s(params.mode || "semantic").trim().toLowerCase();

        // 扩展名过滤集（预先构建，方便传给 py 和 JS 引擎）
        var extFilterSet = null;
        if (extFilter) {
            extFilterSet = {};
            var exts = extFilter.split(",");
            for (var efi = 0; efi < exts.length; efi++) {
                var ef = exts[efi].trim().replace(/^\./, "");
                if (ef) extFilterSet[ef] = true;
            }
        }

        var meta = await loadMeta();
        if (!meta.buildComplete || !meta.filesIndexed || meta.filesIndexed.length === 0) {
            return {
                success: false, packageVersion: PKG_VERSION,
                message: "Vector database is empty. Run vectorize_build first."
            };
        }

        // =====================================================================
        // 第一优先：Python 引擎（BLAS 加速，无需在 JS 内加载全量向量数据）
        // 在任何数据加载之前就尝试，这是最大的性能优化点
        // =====================================================================
        if (mode !== "keyword") {
            var pyResult = await searchViaPython(params, config, meta.totalChunks || 0, fileFilter, extFilterSet);
            if (!pyResult && config.forcePython) {
                throw new Error(
                    "Python 引擎必需但失败。请检查:\n" +
                    "1. Python 脚本路径: " + getPyEnginePath() + "\n" +
                    "2. Python 解释器: " + getPyBin() + "\n" +
                    "3. numpy 已安装: pip install numpy\n" +
                    "4. 数据库已优化: 运行 vectorize_build\n" +
                    "5. 查看上方 [DEBUG] 日志获取详细错误信息"
                );
            }
            if (pyResult) return pyResult;
        }

        // =====================================================================
        // Python 引擎不可用，回退到 JS 引擎
        // 加载数据（优先：内存缓存 → 磁盘快速索引 → 分片加载）
        // =====================================================================
        var allChunks = null;
        var fastIdx = null;
        var allVecs = null;

        // 1. 尝试内存缓存
        if (_fastIndexCache && _chunksCache && _chunksMeta &&
            _chunksMeta.model === config.model && _chunksMeta.updatedAt === meta.updatedAt) {
            fastIdx = _fastIndexCache;
            allChunks = _chunksCache;
        }

        // 2. 尝试磁盘快速索引
        if (!fastIdx) {
            try {
                var fpHash = computeFpHash(await loadFingerprints());
                var diskFastIdx = await loadFastIndex(config, fpHash);
                if (diskFastIdx) {
                    fastIdx = diskFastIdx.fastIndex;
                    var vc = await loadAllVecsAndChunks(meta);
                    allChunks = vc.chunks;
                    _fastIndexCache = fastIdx;
                    _chunksCache = allChunks;
                    _chunksMeta = meta;
                }
            } catch (e) {
                // 快速索引加载失败，降级
            }
        }

        // 3. 回退：从分片加载全量数据
        if (!allChunks) {
            var vc2 = await loadAllVecsAndChunks(meta);
            allVecs = vc2.vecs;
            allChunks = vc2.chunks;

            if (allVecs.length > 0 && meta.vectorDim > 0) {
                try {
                    fastIdx = buildFastIndex(allVecs, meta.vectorDim);
                    _fastIndexCache = fastIdx;
                    _chunksCache = allChunks;
                    _chunksMeta = meta;
                } catch (e) {
                    // 索引构建失败，使用 allVecs 回退
                }
            }
        }

        if (!allChunks || allChunks.length === 0) {
            return {
                success: false, packageVersion: PKG_VERSION,
                message: "No chunks found in database."
            };
        }

        // 应用文件/扩展名过滤（创建索引映射）
        var filteredIndices = null;
        if (fileFilter || extFilterSet) {
            filteredIndices = [];
            for (var fi2 = 0; fi2 < allChunks.length; fi2++) {
                var ck = allChunks[fi2];
                if (fileFilter && ck.filePath.toLowerCase().indexOf(fileFilter) < 0) continue;
                if (extFilterSet) {
                    var dotIdx = ck.filePath.lastIndexOf(".");
                    var vecExt = dotIdx >= 0 ? ck.filePath.substring(dotIdx + 1).toLowerCase() : "";
                    if (!extFilterSet[vecExt]) continue;
                }
                filteredIndices.push(fi2);
            }
        }

        var results = [];
        var searchMethod = "none";

        // ========== JS 语义搜索（Python 已失败才走这条路） ==========
        if (mode !== "keyword") {
            try {
                // 获取查询向量（优先 LRU 缓存）
                var cachedVec = getCachedQueryVec(query);
                var queryVec = cachedVec;

                if (!queryVec) {
                    var qvResult = await callEmbedBatch(config, [query]);
                    if (qvResult.length > 0 && qvResult[0]) {
                        queryVec = qvResult[0];
                        setCachedQueryVec(query, queryVec);
                    }
                }

                if (queryVec) {
                    // 维度校验
                    if (meta.vectorDim > 0 && queryVec.length !== meta.vectorDim) {
                        throw new Error("Dimension mismatch: query " + queryVec.length + "d vs db " + meta.vectorDim + "d. Rebuild required.");
                    }

                    if (fastIdx && !filteredIndices) {
                        // 快速索引搜索（全量，最快 JS 路径）
                        var fastResults = fastDotSearch(queryVec, fastIdx, threshold, topK);
                        results = fastResults.map(function (r) {
                            return {
                                chunkIdx: r.idx,
                                score: Math.round(r.score * 10000) / 10000
                            };
                        });
                        searchMethod = fastIdx.quantized ? "js_semantic_int8" : "js_semantic_float32";

                    } else if (filteredIndices) {
                        // 过滤模式：逐个比较
                        // 当通过快速索引路径加载时 allVecs 为 null，此处按需补加载原始向量
                        if (!allVecs) {
                            try {
                                var vcFilt = await loadAllVecsAndChunks(meta);
                                allVecs = vcFilt.vecs;
                            } catch (_filtLoadErr) {}
                        }
                        var scoredFiltered = [];
                        for (var fi3 = 0; fi3 < filteredIndices.length; fi3++) {
                            var idx = filteredIndices[fi3];
                            var vec = allVecs ? allVecs[idx] : null;

                            // 尝试从 flat 数组中提取
                            if (!vec && fastIdx && fastIdx.flat) {
                                vec = new Float32Array(meta.vectorDim);
                                var off = idx * meta.vectorDim;
                                for (var vi = 0; vi < meta.vectorDim; vi++) vec[vi] = fastIdx.flat[off + vi];
                            }

                            if (!vec) continue;
                            var sim = cosineSimilarity(queryVec, vec);
                            if (sim >= threshold) {
                                scoredFiltered.push({
                                    chunkIdx: idx,
                                    score: Math.round(sim * 10000) / 10000
                                });
                            }
                        }
                        scoredFiltered.sort(function (a, b) { return b.score - a.score; });
                        results = scoredFiltered.slice(0, topK);
                        searchMethod = "js_semantic_filtered";

                    } else if (allVecs) {
                        // 回退：逐个余弦相似度
                        var scored = [];
                        for (var vi2 = 0; vi2 < allVecs.length; vi2++) {
                            if (!allVecs[vi2]) continue;
                            var sim2 = cosineSimilarity(queryVec, allVecs[vi2]);
                            if (sim2 >= threshold) {
                                scored.push({
                                    chunkIdx: vi2,
                                    score: Math.round(sim2 * 10000) / 10000
                                });
                            }
                        }
                        scored.sort(function (a, b) { return b.score - a.score; });
                        results = scored.slice(0, topK);
                        searchMethod = "js_semantic_cosine";
                    }
                }
            } catch (e) {
                sendProgress("JS semantic search error, falling back to keyword: " + (e.message || ""), {
                    phase: "search_fallback"
                });
            }
        }

        // ========== 关键词降级/融合搜索 ==========
        if (mode === "keyword" || mode === "hybrid" || results.length === 0) {
            var kwResults = keywordSearch(query, allChunks, topK);

            if (kwResults.length > 0) {
                if (mode === "hybrid" && results.length > 0) {
                    // RRF 融合
                    results = rrfFusion(results, kwResults, topK);
                    searchMethod = "js_hybrid_rrf";
                } else {
                    // 纯关键词（或语义回退）
                    results = kwResults;
                    searchMethod = "js_keyword";
                }
            }
        }

        // 上下文扩展
        results = expandContext(results, allChunks);

        // 构建输出
        var outputResults = [];
        for (var oi = 0; oi < results.length; oi++) {
            var r = results[oi];
            var chunkIdx = r.chunkIdx;
            if (chunkIdx === undefined || chunkIdx < 0 || chunkIdx >= allChunks.length) continue;
            var chunk = allChunks[chunkIdx];
            if (!chunk) continue;

            var entry = {
                rank: oi + 1,
                score: r.score,
                filePath: chunk.filePath,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
                content: truncateContent(chunk.text, MAX_CHUNK_DISPLAY)
            };
            if (r.contextBefore) entry.contextBefore = r.contextBefore;
            if (r.contextAfter) entry.contextAfter = r.contextAfter;
            outputResults.push(entry);
        }

        return {
            success: true, packageVersion: PKG_VERSION,
            query: query, searchMethod: searchMethod,
            pyAssisted: false,                                            // ← Python 引擎本次未成功
            totalVectorsSearched: allChunks.length,
            resultsFound: outputResults.length,
            resultsReturned: outputResults.length,
            results: outputResults
        };
    }

    // =========================================================================
    // vectorize_stats
    // =========================================================================
    async function vectorize_stats(params) {
        var meta = await loadMeta();
        var fingerprints = await loadFingerprints();
        var fileCount = Object.keys(fingerprints).length;
        var filesIndexed = meta.filesIndexed || [];

        // 扩展名分布
        var extDist = {};
        for (var i = 0; i < filesIndexed.length; i++) {
            var rp = filesIndexed[i].relPath;
            var dotIdx = rp.lastIndexOf(".");
            var ext = dotIdx >= 0 ? rp.substring(dotIdx + 1).toLowerCase() : "unknown";
            extDist[ext] = (extDist[ext] || 0) + filesIndexed[i].chunks;
        }
        var sortedExts = Object.keys(extDist).sort(function (a, b) { return extDist[b] - extDist[a]; });
        var extSummary = sortedExts.map(function (e) { return e + ": " + extDist[e] + " chunks"; });

        // top 文件
        var topFiles = filesIndexed.slice().sort(function (a, b) { return b.chunks - a.chunks; }).slice(0, 10);
        var topFileSummary = topFiles.map(function (f) { return f.relPath + " (" + f.chunks + " chunks)"; });

        // 数据库大小估算
        var dbSizeBytes = 0;
        try {
            var dirs = [DB_DIR, VEC_DIR, CHUNK_DIR];
            for (var di = 0; di < dirs.length; di++) {
                try {
                    var listing = await Tools.Files.list(dirs[di], "android");
                    if (listing && listing.entries) {
                        for (var li = 0; li < listing.entries.length; li++) {
                            dbSizeBytes += listing.entries[li].size || 0;
                        }
                    }
                } catch (_) {}
            }
        } catch (e) {}

        // 快速索引状态
        var hasFastIndex = await fileExists(FAST_INDEX_FILE);

        // 断点进度检测
        var hasProgress = await fileExists(PROGRESS_FILE);
        var progressInfo = null;
        if (hasProgress) {
            var prog = await loadProgress();
            if (prog) {
                progressInfo = {
                    embeddedFiles: (prog.embedded || []).length,
                    startedAt: prog.startedAt || "N/A",
                    totalFiles: prog.totalFiles || 0
                };
            }
        }

        return {
            success: true, packageVersion: PKG_VERSION,
            databaseExists: meta.totalChunks > 0,
            buildComplete: meta.buildComplete || false,
            totalFiles: fileCount,
            totalFilesIndexed: filesIndexed.length,
            totalChunks: meta.totalChunks || 0,
            databaseSize: formatBytes(dbSizeBytes),
            model: meta.model || "N/A",
            vectorDimension: meta.vectorDim || 0,
            chunkSize: meta.chunkSize || "N/A",
            buildCount: meta.buildCount || 0,
            createdAt: formatTimestamp(meta.createdAt),
            lastUpdatedAt: formatTimestamp(meta.updatedAt),
            hasFastIndex: hasFastIndex,
            hasIncompleteProgress: hasProgress,
            progressInfo: progressInfo,
            extensionDistribution: extSummary.join(", "),
            topFilesByChunks: topFileSummary.join("; ")
        };
    }

    // =========================================================================
    // vectorize_clean
    // =========================================================================
    async function vectorize_clean(params) {
        if (!params || !safeBool(params.confirm)) {
            return {
                success: false, packageVersion: PKG_VERSION,
                message: "Confirm parameter must be true."
            };
        }

        var oldMeta = await loadMeta();
        var oldFp = await loadFingerprints();
        var deletedChunks = oldMeta.totalChunks || 0;
        var deletedFileCount = Object.keys(oldFp).length;

        // 删除向量和分块文件
        var dirsToClean = [VEC_DIR, CHUNK_DIR];
        for (var di = 0; di < dirsToClean.length; di++) {
            try {
                var listing = await Tools.Files.list(dirsToClean[di], "android");
                if (listing && listing.entries) {
                    for (var fi = 0; fi < listing.entries.length; fi++) {
                        if (!listing.entries[fi].isDirectory) {
                            await deleteFile(dirsToClean[di] + listing.entries[fi].name);
                        }
                    }
                }
            } catch (e) {}
        }

        // 删除元数据文件
        await deleteFile(META_FILE);
        await deleteFile(FP_FILE);
        await deleteFile(PROGRESS_FILE);
        await deleteFile(FAST_INDEX_FILE);
        await deleteFile(META_FILE + ".tmp");
        await deleteFile(FP_FILE + ".tmp");
        await deleteFile(PROGRESS_FILE + ".tmp");
        await deleteFile(FAST_INDEX_FILE + ".tmp");

        // 清空内存缓存
        _fastIndexCache = null;
        _chunksCache = null;
        _chunksMeta = null;
        _queryCache = {};
        _queryCacheKeys = [];
        _dirsEnsured = false;

        return {
            success: true, packageVersion: PKG_VERSION,
            deletedChunks: deletedChunks,
            deletedFileRecords: deletedFileCount,
            message: "Vector database cleared."
        };
    }

    // =========================================================================
    // vectorize_remove_file
    // =========================================================================
    async function vectorize_remove_file(params) {
        if (!params || !params.file_path || !s(params.file_path).trim()) {
            throw new Error("Missing: file_path");
        }
        var targetPath = s(params.file_path).trim();

        var hadVectors = await hasFileVectors(targetPath);
        var hadChunks = await hasFileChunks(targetPath);
        await deleteFileVectors(targetPath);
        await deleteFileChunks(targetPath);

        // 更新指纹
        var fingerprints = await loadFingerprints();
        var hadFingerprint = !!fingerprints[targetPath];
        delete fingerprints[targetPath];
        await saveFingerprints(fingerprints);

        // 更新元数据
        var meta = await loadMeta();
        meta.filesIndexed = (meta.filesIndexed || []).filter(function (fi) {
            return fi.relPath !== targetPath;
        });
        var totalChunks = 0;
        for (var i = 0; i < meta.filesIndexed.length; i++) {
            totalChunks += meta.filesIndexed[i].chunks;
        }
        meta.totalFiles = meta.filesIndexed.length;
        meta.totalChunks = totalChunks;
        meta.updatedAt = Date.now();
        await saveMeta(meta);

        // 清除快速索引（已过期）
        await deleteFile(FAST_INDEX_FILE);
        _fastIndexCache = null;
        _chunksCache = null;
        _chunksMeta = null;

        return {
            success: true, packageVersion: PKG_VERSION,
            filePath: targetPath,
            removedVectors: hadVectors,
            removedChunks: hadChunks,
            removedFingerprint: hadFingerprint,
            remainingFiles: meta.filesIndexed.length
        };
    }

    // =========================================================================
    // vectorize_test
    // =========================================================================
    async function vectorize_test(params) {
        var startMs = Date.now();
        try {
            var config = getConfig();
            var testText = "Hello, this is a connectivity test for the embedding API.";
            var embeddings = await callEmbedBatch(config, [testText]);
            var durationMs = Date.now() - startMs;

            if (!embeddings || embeddings.length !== 1 || !Array.isArray(embeddings[0])) {
                return {
                    success: false, packageVersion: PKG_VERSION,
                    error: "Unexpected embedding response"
                };
            }

            var dim = embeddings[0].length;
            var expectedDim = getModelDefaultDim(config.model);
            var dbExists = await fileExists(META_FILE);
            var stats = null;

            if (dbExists) {
                var meta = await loadMeta();
                stats = {
                    totalChunks: meta.totalChunks || 0,
                    totalFiles: meta.totalFiles || 0,
                    lastUpdated: formatTimestamp(meta.updatedAt),
                    hasFastIndex: await fileExists(FAST_INDEX_FILE),
                    buildComplete: meta.buildComplete || false
                };
            }

            // Python 引擎连通性检测（检查脚本存在性 + 可调用性）
            var pyEngineStatus = { available: false, scriptExists: false, executable: false, path: "" };
            try {
                var pyPath = getPyEnginePath();
                pyEngineStatus.path = pyPath;
                pyEngineStatus.scriptExists = await fileExists(pyPath);

                if (pyEngineStatus.scriptExists) {
                    // 实际调用 Python 脚本的 status 命令验证可执行性
                    var pyTestCmd = getPyBin() + " '" + pyPath.replace(/'/g, "'\\''") + "'" +
                        " status '" + DB_DIR.replace(/'/g, "'\\''") + "'";
                    var pyTestResult = await execPythonCommand(pyTestCmd, 15000);
                    if (pyTestResult && pyTestResult.exitCode === 0) {
                        pyEngineStatus.executable = true;
                        pyEngineStatus.available = true;
                        // 尝试解析版本
                        try {
                            var pyOut = (pyTestResult.output || "").trim();
                            var pyLines = pyOut.split("\n");
                            for (var pli = pyLines.length - 1; pli >= 0; pli--) {
                                if (pyLines[pli].trim().charAt(0) === "{") {
                                    var pyJson = JSON.parse(pyLines[pli].trim());
                                    pyEngineStatus.version = pyJson.py_engine_version || "unknown";
                                    break;
                                }
                            }
                        } catch (_) {}
                    } else {
                        pyEngineStatus.error = "exit code " + (pyTestResult ? pyTestResult.exitCode : "null");
                    }
                }
            } catch (pyErr) {
                pyEngineStatus.error = pyErr.message || s(pyErr);
            }

            return {
                success: true, packageVersion: PKG_VERSION,
                apiBaseUrl: config.baseUrl,
                model: config.model,
                embeddingDimension: dim,
                expectedDimension: expectedDim || "unknown",
                dimensionMatch: expectedDim > 0 ? dim === expectedDim : "N/A",
                durationMs: durationMs,
                chunkSize: config.chunkSize,
                chunkOverlap: config.chunkOverlap,
                batchSize: config.batchSize,
                concurrency: config.concurrency,
                maxFileSizeKB: config.maxFileSizeKB,
                databaseExists: dbExists,
                databaseStats: stats,
                pythonEngine: pyEngineStatus
            };
        } catch (e) {
            return {
                success: false, packageVersion: PKG_VERSION,
                durationMs: Date.now() - startMs,
                error: e.message || s(e)
            };
        }
    }

    // =========================================================================
    // vectorize_build_pyindex
    // 单独为已有向量数据库构建 Python 引擎二进制索引
    // 与 vectorize_build 完全分离，无需重新嵌入，无需 API Key 调用
    // 调用 operit_search.py optimize <DB_DIR> 生成:
    //   <DB_DIR>/.operit_cache/vectors.npy  (预归一化 float32 向量矩阵)
    //   <DB_DIR>/.operit_cache/chunks.json  (合并后的分块元数据)
    // =========================================================================
    async function vectorize_build_pyindex(params) {
        var startMs = Date.now();

        // 前置检查：数据库是否存在且已完成构建
        var dbMeta = await loadMeta();
        if (!dbMeta.buildComplete || !dbMeta.filesIndexed || dbMeta.filesIndexed.length === 0) {
            return {
                success: false, packageVersion: PKG_VERSION,
                error: "Vector database is empty or incomplete. Run vectorize_build first."
            };
        }

        // Python 脚本存在性检查
        var pyPath = getPyEnginePath();
        if (!(await fileExists(pyPath))) {
            return {
                success: false, packageVersion: PKG_VERSION,
                error: "Python engine script not found: " + pyPath +
                    "\nCheck VECTORIZE_PYTHON_SEARCH_PATH env variable or place operit_search.py at the default location."
            };
        }

        sendProgress(
            "Building Python binary index (" + (dbMeta.totalChunks || 0) + " chunks, " +
            dbMeta.filesIndexed.length + " files)...",
            { phase: "py_index_start", chunks: dbMeta.totalChunks, files: dbMeta.filesIndexed.length }
        );

        var pyBin = getPyBin();
        var escapedPy  = pyPath.replace(/'/g, "'\\''");
        var escapedDir = DB_DIR.replace(/'/g, "'\\''");
        var cmd = pyBin + " '" + escapedPy + "' optimize '" + escapedDir + "'";

        var execResult;
        try {
            execResult = await execPythonCommand(cmd, 180000);
        } catch (execErr) {
            return {
                success: false, packageVersion: PKG_VERSION,
                durationMs: Date.now() - startMs,
                error: "Terminal exec failed: " + (execErr.message || s(execErr))
            };
        }

        if (!execResult || execResult.exitCode !== 0) {
            return {
                success: false, packageVersion: PKG_VERSION,
                durationMs: Date.now() - startMs,
                exitCode: execResult ? execResult.exitCode : null,
                error: "Python optimize command exited with error",
                output: execResult && execResult.output ? execResult.output.substring(0, 800) : ""
            };
        }

        // 从末尾向上找第一行有效 JSON（与其他 Python 调用保持一致）
        var rawOut = (execResult.output || "").trim();
        var pyResult = null;
        if (rawOut) {
            var outLines = rawOut.split("\n");
            for (var pli = outLines.length - 1; pli >= 0; pli--) {
                var outLine = outLines[pli].trim();
                if (outLine.charAt(0) === "{") {
                    try { pyResult = JSON.parse(outLine); break; } catch (_) {}
                }
            }
        }

        if (!pyResult || !pyResult.success) {
            return {
                success: false, packageVersion: PKG_VERSION,
                durationMs: Date.now() - startMs,
                error: "Python optimize returned failure",
                detail: pyResult
                    ? (pyResult.message || JSON.stringify(pyResult).substring(0, 300))
                    : "No valid JSON in output",
                output: rawOut.substring(0, 500)
            };
        }

        var durationMs = Date.now() - startMs;
        var builtChunks = pyResult.total_chunks || dbMeta.totalChunks || 0;

        sendProgress(
            "Python binary index built: " + builtChunks + " chunks in " + (durationMs / 1000).toFixed(1) + "s",
            { phase: "py_index_done", chunks: builtChunks }
        );

        return {
            success: true, packageVersion: PKG_VERSION,
            durationMs: durationMs,
            totalChunks: builtChunks,
            totalFiles: dbMeta.filesIndexed.length,
            vectorDim: dbMeta.vectorDim || 0,
            model: dbMeta.model || "unknown",
            pyEngineVersion: pyResult.py_engine_version || "unknown",
            message: pyResult.message || ("Built binary index for " + builtChunks + " chunks"),
            indexDir: DB_DIR + ".operit_cache/"
        };
    }

    // =========================================================================
    // 错误包装器
    // =========================================================================
    async function wrapExec(fn, params, label) {
        try {
            var result = await fn(params);
            complete(result);
        } catch (error) {
            var errMsg = error && error.message ? error.message : s(error);
            console.error("[operit_vectorize] " + (label || "") + ": " + errMsg);
            complete({
                success: false,
                packageVersion: PKG_VERSION,
                error: errMsg,
                errorStack: error && error.stack ? error.stack.substring(0, 500) : undefined
            });
        }
    }

    // =========================================================================
    // 导出
    // =========================================================================
    return {
        usage_advice: function () {
            var locale = (typeof getLang === "function" ? getLang() : "") || "";
            var isZh = locale.toLowerCase().indexOf("zh") === 0;
            var adviceZh = "向量化工具使用建议：\n" +
                "- 首次使用先运行 vectorize_scan 查看项目文件概况。\n" +
                "- 然后运行 vectorize_build 构建或增量更新向量数据库（完成后自动预生成 Python 引擎二进制索引）。\n" +
                "- 使用 vectorize_search 进行语义检索（默认语义模式），Python 引擎(operit_search.py)始终优先尝试，结果中 pyAssisted:true 表示 Python 成功辅助检索。\n" +
                "- 定期运行 vectorize_build 保持数据库与源码同步。\n" +
                "- 使用 vectorize_stats 查看数据库健康状态。\n" +
                "- 如需重建，使用 vectorize_build 的 force_rebuild 参数，或先 vectorize_clean 清空再重建。\n" +
                "- vectorize_search 支持语义搜索（默认）、关键词搜索和混合搜索(hybrid)。\n" +
                "- 如需在不重新嵌入的情况下单独刷新 Python 引擎索引，运行 vectorize_build_pyindex。\n" +
                "- Python 引擎路径默认: " + PYTHON_SEARCH_ENGINE_DEFAULT + "（可通过 VECTORIZE_PYTHON_SEARCH_PATH 覆盖）。";
            var adviceEn = "Vectorizer usage advice:\n" +
                "- First run vectorize_scan to overview project files.\n" +
                "- Then run vectorize_build to build or incrementally update the vector database.\n" +
                "- Use vectorize_search for semantic retrieval. Python engine is always tried first; 'pyAssisted:true' means it succeeded.\n" +
                "- Run vectorize_build periodically to keep the database in sync.\n" +
                "- Use vectorize_stats to check database health.\n" +
                "- To rebuild, use force_rebuild param or vectorize_clean then vectorize_build.\n" +
                "- vectorize_search supports semantic(default), keyword, and hybrid(RRF) modes.\n" +
                "- To refresh Python engine binary index without re-embedding, run vectorize_build_pyindex.\n" +
                "- Default Python engine path: " + PYTHON_SEARCH_ENGINE_DEFAULT + " (override via VECTORIZE_PYTHON_SEARCH_PATH).";
            complete({
                success: true,
                packageVersion: PKG_VERSION,
                message: isZh ? adviceZh : adviceEn,
                data: { zh: adviceZh, en: adviceEn }
            });
        },
        vectorize_scan: function (p) { return wrapExec(vectorize_scan, p, "scan"); },
        vectorize_build: function (p) { return wrapExec(vectorize_build, p, "build"); },
        vectorize_search: function (p) { return wrapExec(vectorize_search, p, "search"); },
        vectorize_stats: function (p) { return wrapExec(vectorize_stats, p, "stats"); },
        vectorize_clean: function (p) { return wrapExec(vectorize_clean, p, "clean"); },
        vectorize_remove_file: function (p) { return wrapExec(vectorize_remove_file, p, "remove_file"); },
        vectorize_test: function (p) { return wrapExec(vectorize_test, p, "test"); },
        vectorize_build_pyindex: function (p) { return wrapExec(vectorize_build_pyindex, p, "build_pyindex"); }
    };
})();

exports.usage_advice = operitVectorize.usage_advice;
exports.vectorize_scan = operitVectorize.vectorize_scan;
exports.vectorize_build = operitVectorize.vectorize_build;
exports.vectorize_search = operitVectorize.vectorize_search;
exports.vectorize_stats = operitVectorize.vectorize_stats;
exports.vectorize_clean = operitVectorize.vectorize_clean;
exports.vectorize_remove_file = operitVectorize.vectorize_remove_file;
exports.vectorize_test = operitVectorize.vectorize_test;
exports.vectorize_build_pyindex = operitVectorize.vectorize_build_pyindex;
