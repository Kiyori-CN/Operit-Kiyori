/* METADATA
{
    "name": "diary",
    "version": "1.0",
    "display_name": {
        "zh": "日记本",
        "en": "Diary"
    },
    "description": {
        "zh": "日记本工具包。本地 Markdown 日记管理系统，支持保存、编辑、搜索、列表、阅读和删除日记。每篇日记自动生成 YYYYMMDDHHmmss 格式纯数字 ID，支持通过 ID/文件名/路径三种方式定位日记。采用 YAML Front Matter 元数据格式，按年月目录自动归档。内置语义向量检索引擎，支持自然语言搜索历史日记；同时提供纯本地关键词快速搜索。支持标签系统、情绪标记、对话摘要自动生成、日记统计分析。所有数据完全本地存储，隐私安全。目录结构：/sdcard/Download/Operit/diary/YYYY-MM/，缓存目录：diary/.diary/。不依赖其他工具包，向量数据库和索引完全内置。支持增量更新、断点续建、同步删除。",
        "en": "Diary toolkit. Local Markdown diary management with save, edit, search, list, read, and delete. Each diary auto-generates a YYYYMMDDHHmmss numeric ID, supporting lookup by ID/filename/path. Uses YAML Front Matter metadata, auto-archived by year-month directories. Built-in semantic vector search engine for natural language search across diary entries; also provides pure-local keyword fast search. Supports tagging, mood tracking, auto-generated conversation summaries, and diary statistics. All data stored locally for privacy. Directory: /sdcard/Download/Operit/diary/YYYY-MM/. Cache: diary/.diary/. Self-contained — no dependency on other toolkits. Supports incremental update, checkpoint rebuild, and sync deletion."
    },
    "enabledByDefault": true,
    "category": "Admin",
    "author": "Operit Community",
    "env": [
        {
            "name": "DIARY_API_KEY",
            "description": {
                "zh": "嵌入模型 API 密钥（OpenAI 兼容接口），用于语义搜索。不配置时语义搜索不可用，但关键词搜索仍可正常使用。",
                "en": "Embedding model API key (OpenAI-compatible) for semantic search. If not configured, semantic search is unavailable but keyword search still works."
            },
            "required": false
        },
        {
            "name": "DIARY_BASE_URL",
            "description": {
                "zh": "嵌入模型 API 基础地址。默认：https://newapi.com.cn/v1",
                "en": "Embedding API base URL. Default: https://newapi.com.cn/v1"
            },
            "required": false
        },
        {
            "name": "DIARY_EMBED_MODEL",
            "description": {
                "zh": "嵌入模型名称。默认：Qwen/Qwen3-Embedding-0.6B",
                "en": "Embedding model name. Default: Qwen/Qwen3-Embedding-0.6B"
            },
            "required": false
        },
        {
            "name": "DIARY_ROOT",
            "description": {
                "zh": "日记存储根目录。默认：/sdcard/Download/Operit/diary/",
                "en": "Diary root directory. Default: /sdcard/Download/Operit/diary/"
            },
            "required": false
        },
        {
            "name": "DIARY_PYTHON_BIN",
            "description": {
                "zh": "Python 解释器路径，默认 python3",
                "en": "Python interpreter path, default python3"
            },
            "required": false
        },
        {
            "name": "DIARY_SCRIPT_PATH",
            "description": {
                "zh": "diary.py 脚本路径。默认：/storage/emulated/0/Download/Operit/examples/diary/diary.py",
                "en": "diary.py script path. Default: /storage/emulated/0/Download/Operit/examples/diary/diary.py"
            },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "save_diary",
            "description": {
                "zh": "保存一篇新日记。自动生成 YYYYMMDDHHmmss 格式纯数字 ID（精确到秒）、日期、时间戳，按年月归档到对应目录。支持自定义标题、标签、情绪标记。保存后自动完成完整索引流水线（嵌入→指纹→Python 二进制索引优化），一条命令即完成写入与索引构建。同一天多篇日记自动编号（_2、_3…）。",
                "en": "Save a new diary entry. Auto-generates YYYYMMDDHHmmss numeric ID (second-precise), date/timestamp, archives by year-month. Supports custom title, tags, mood. Auto-runs full index pipeline after save (embed → fingerprint → Python binary index optimize) — single command completes write + index build. Multiple entries per day auto-numbered (_2, _3…)."
            },
            "parameters": [
                {
                    "name": "content",
                    "description": { "zh": "日记正文内容（必填）", "en": "Diary content (required)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "title",
                    "description": { "zh": "日记标题（可选，不填则从内容中自动提取）", "en": "Title (optional, auto-extracted from content if omitted)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "tags",
                    "description": { "zh": "标签列表，逗号分隔（可选）。例如：'AI对话,学习笔记'", "en": "Comma-separated tags (optional)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "mood",
                    "description": { "zh": "情绪标记（可选）。如：开心/平静/疲惫/焦虑/兴奋/难过", "en": "Mood tag (optional). E.g.: happy/calm/tired/anxious/excited/sad" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "summary",
                    "description": { "zh": "摘要（可选，不填则自动从内容截取前 150 字）", "en": "Summary (optional, auto-generated from first 150 chars if omitted)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "edit_diary",
            "description": {
                "zh": "编辑已有日记。可追加内容、修改标题/标签/情绪，或完全替换正文。编辑后自动完成完整索引流水线（嵌入→指纹→Python 二进制索引优化）。",
                "en": "Edit an existing diary entry. Append content, modify title/tags/mood, or replace body. Auto-runs full index pipeline after edit (embed → fingerprint → Python binary index optimize)."
            },
            "parameters": [
                {
                    "name": "filename",
                    "description": { "zh": "日记文件名（如 2026-03-11_工具包设计.md）、完整路径或 YYYYMMDDHHmmss ID", "en": "Diary filename (e.g. 2026-03-11_Tool_Design.md), full path, or YYYYMMDDHHmmss ID" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "append_content",
                    "description": { "zh": "追加到日记末尾的内容（可选）", "en": "Content to append (optional)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "new_content",
                    "description": { "zh": "替换整个正文内容（可选，与 append_content 二选一）", "en": "Replace entire body content (optional, mutually exclusive with append_content)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "title",
                    "description": { "zh": "新标题（可选）", "en": "New title (optional)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "tags",
                    "description": { "zh": "新标签列表，逗号分隔（可选）", "en": "New comma-separated tags (optional)" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "mood",
                    "description": { "zh": "新情绪标记（可选）", "en": "New mood tag (optional)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "search_diary",
            "description": {
                "zh": "搜索日记。支持两种模式：语义搜索（需配置 DIARY_API_KEY）和关键词搜索（纯本地）。默认优先语义搜索，API 不可用时自动降级为关键词搜索。Python 引擎优先。",
                "en": "Search diaries. Two modes: semantic search (requires DIARY_API_KEY) and keyword search (pure local). Defaults to semantic, auto-fallback to keyword if API unavailable. Python engine preferred."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索查询（必填）", "en": "Search query (required)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "mode",
                    "description": { "zh": "搜索模式：semantic（语义，默认）/ keyword（关键词）/ hybrid（混合）", "en": "Mode: semantic (default) / keyword / hybrid" },
                    "type": "string",
                    "required": false,
                    "default": "semantic"
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量，默认 5", "en": "Number of results, default 5" },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "month",
                    "description": { "zh": "限定月份（可选），格式 YYYY-MM", "en": "Filter by month (optional), format YYYY-MM" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "list_diary",
            "description": {
                "zh": "列出日记条目。按时间倒序显示，可按月份、标签筛选。",
                "en": "List diary entries in reverse chronological order. Filter by month or tag."
            },
            "parameters": [
                {
                    "name": "month",
                    "description": { "zh": "月份筛选（可选），格式 YYYY-MM", "en": "Month filter (optional), format YYYY-MM" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "limit",
                    "description": { "zh": "返回数量上限，默认 20", "en": "Max entries to return, default 20" },
                    "type": "number",
                    "required": false,
                    "default": 20
                },
                {
                    "name": "tag",
                    "description": { "zh": "按标签筛选（可选）", "en": "Filter by tag (optional)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "read_diary",
            "description": {
                "zh": "读取指定日记的完整内容。可通过文件名、完整路径或 YYYYMMDDHHmmss 格式 ID 定位。",
                "en": "Read full content of a specific diary entry. Locate by filename, full path, or YYYYMMDDHHmmss ID."
            },
            "parameters": [
                {
                    "name": "filename",
                    "description": { "zh": "日记文件名（如 2026-03-11_工具包设计.md）、完整路径或 YYYYMMDDHHmmss ID", "en": "Diary filename, full path, or YYYYMMDDHHmmss numeric ID" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "delete_diary",
            "description": {
                "zh": "删除指定日记。同时同步清理对应的向量索引缓存、指纹记录、ID 索引，并触发 Python 引擎重新优化二进制索引。",
                "en": "Delete a diary entry and synchronously clean its vector index cache, fingerprint, ID index, and trigger Python engine binary index re-optimization."
            },
            "parameters": [
                {
                    "name": "filename",
                    "description": { "zh": "日记文件名（如 2026-03-11_工具包设计.md）、完整路径或 YYYYMMDDHHmmss ID", "en": "Diary filename, full path, or YYYYMMDDHHmmss ID" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "confirm",
                    "description": { "zh": "确认删除（必须为 true 才会执行）", "en": "Confirm deletion (must be true)" },
                    "type": "boolean",
                    "required": true
                }
            ]
        },
        {
            "name": "stats",
            "description": {
                "zh": "日记统计分析。展示总篇数、月度分布、常用标签、情绪分布、向量索引状态等。",
                "en": "Diary statistics. Shows total entries, monthly distribution, common tags, mood distribution, vector index status."
            },
            "parameters": []
        },
        {
            "name": "rebuild_index",
            "description": {
                "zh": "重建向量搜索索引。扫描所有日记文件，增量更新嵌入向量。force=true 时强制全量重建（清除所有缓存）。支持断点续建：中断后再次执行会从上次完成处继续。",
                "en": "Rebuild vector search index. Incremental update by default. force=true for full rebuild. Checkpoint-safe: re-running continues from where it left off."
            },
            "parameters": [
                {
                    "name": "force",
                    "description": { "zh": "强制全量重建（清除所有缓存），默认 false（增量更新）", "en": "Force full rebuild (clear all cache), default false (incremental)" },
                    "type": "boolean",
                    "required": false,
                    "default": false
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试日记工具包连通性。检测存储目录、嵌入 API 配置、Python 引擎可用性。",
                "en": "Test diary toolkit connectivity. Check storage directory, embedding API config, Python engine availability."
            },
            "parameters": []
        }
    ]
}
*/

var Diary = (function () {

    // =========================================================================
    // 第一层：配置常量
    // =========================================================================
    var DEFAULT_ROOT = '/sdcard/Download/Operit/diary/';
    var CACHE_DIR_NAME = '.diary';
    var DEFAULT_BASE_URL = 'https://newapi.com.cn/v1';
    var DEFAULT_MODEL = 'Qwen/Qwen3-Embedding-0.6B';
    var DEFAULT_PY_BIN = 'python3';
    var DEFAULT_PY_SCRIPT = '/storage/emulated/0/Download/Operit/examples/diary/diary.py';

    var CFG = {
        MAX_TITLE_LEN: 40,
        MAX_SUMMARY_LEN: 150,
        MAX_OUTPUT_CHARS: 80000,
        MAX_SINGLE_OUTPUT: 15000,
        MAX_TEXT_FOR_EMBED: 2000,
        BATCH_SIZE: 32,
        MAX_RETRIES: 3,
        RETRY_BASE_DELAY: 500,
        VEC_DIR: 'vectors',
        CHUNK_DIR: 'chunks',
        F_META: 'meta.json',
        F_FINGERPRINTS: 'fingerprints.json',
        PY_SEARCH_TIMEOUT: 60000,
        PY_OPTIMIZE_TIMEOUT: 180000,
        F_ID_INDEX: 'id_index.json'
    };

    var _http = null;
    function getHttp() {
        if (!_http) _http = OkHttp.newClient();
        return _http;
    }

    // 全局持久化终端会话（所有 Python 调用共享同一个终端，避免终端窗口堆积）
    var _pySession = null;
    var _pySessionTs = 0;
    var PY_SESSION_NAME = 'diary_engine';
    var PY_SESSION_TTL = 3600000; // 1小时后重建，防止僵尸会话

    async function getOrCreatePySession() {
        var now = Date.now();
        if (_pySession && (now - _pySessionTs) < PY_SESSION_TTL) {
            try {
                // 心跳检测：发送 echo 确认会话存活
                var ping = await Tools.System.terminal.exec(_pySession, 'echo __ok__', 4000);
                if (ping !== null && ping !== undefined) return _pySession;
            } catch (_) {
                _pySession = null;
            }
        }
        // 创建/重建持久会话
        var s = await Tools.System.terminal.create(PY_SESSION_NAME);
        _pySession = s.sessionId;
        _pySessionTs = now;
        return _pySession;
    }

    // =========================================================================
    // 第二层：基础设施（环境/路径/工具函数）
    // =========================================================================
    function getDiaryRoot() {
        var r = (getEnv('DIARY_ROOT') || DEFAULT_ROOT).trim();
        if (!r.endsWith('/')) r += '/';
        return r;
    }
    function getCacheDir() { return getDiaryRoot() + CACHE_DIR_NAME + '/'; }
    function getVecDir()   { return getCacheDir() + CFG.VEC_DIR + '/'; }
    function getChunkDir() { return getCacheDir() + CFG.CHUNK_DIR + '/'; }

    function getApiKey() {
        var k = getEnv('DIARY_API_KEY');
        return (k && k.trim()) ? k.trim() : null;
    }
    function getBaseUrl() {
        var u = getEnv('DIARY_BASE_URL');
        return (u && u.trim()) ? u.trim().replace(/\/+$/, '') : DEFAULT_BASE_URL;
    }
    function getModel() {
        var m = getEnv('DIARY_EMBED_MODEL');
        return (m && m.trim()) ? m.trim() : DEFAULT_MODEL;
    }
    function getPyBin() {
        var b = getEnv('DIARY_PYTHON_BIN');
        return (b && b.trim()) ? b.trim() : DEFAULT_PY_BIN;
    }
    function getScriptPath() {
        var s = getEnv('DIARY_SCRIPT_PATH');
        return (s && s.trim()) ? s.trim() : DEFAULT_PY_SCRIPT;
    }

    function sendProgress(msg, meta) {
        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: msg, data: meta || null });
        }
    }

    function truncate(s, max) {
        if (!s) return '';
        max = max || CFG.MAX_OUTPUT_CHARS;
        if (s.length <= max) return s;
        return s.substring(0, max) + '\n\n*(已截断至 ' + max + ' 字符)*';
    }

    function safeNumber(val, def, min, max) {
        if (val === undefined || val === null || val === '') return def;
        var n = Number(val);
        return isNaN(n) ? def : Math.max(min, Math.min(max, Math.round(n)));
    }

    function safeFileName(s) {
        if (!s) return 'untitled';
        return s.replace(/[\\/:*?"<>|\n\r\t]/g, '_')
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '')
                .substring(0, CFG.MAX_TITLE_LEN) || 'untitled';
    }

    function md5(s) { return CryptoJS.MD5(s).toString(); }

    function nowTs() {
        var d = new Date();
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var Y = d.getFullYear(), M = pad(d.getMonth() + 1), D = pad(d.getDate());
        var h = pad(d.getHours()), m = pad(d.getMinutes()), s = pad(d.getSeconds());
        return {
            id: '' + Y + M + D + h + m + s,
            date: Y + '-' + M + '-' + D,
            time: h + ':' + m + ':' + s,
            yearMonth: Y + '-' + M,
            full: Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s
        };
    }

    // =========================================================================
    // 第三层：文件系统操作
    // =========================================================================
    async function fileExists(fp) {
        try {
            var e = await Tools.Files.exists(fp, 'android');
            return !!(e && e.exists);
        } catch (_) { return false; }
    }

    async function ensureDir(d) {
        try {
            await Tools.Files.mkdir(d, true, 'android');
        } catch (_) {}
    }

    async function readFile(fp) {
        try {
            var c = await Tools.Files.read(fp, 'android');
            return (c && c.content) ? c.content : null;
        } catch (_) { return null; }
    }

    async function writeFileSafe(fp, content) {
        var dir = fp.substring(0, fp.lastIndexOf('/') + 1);
        await ensureDir(dir);
        await Tools.Files.write(fp, content, false, 'android');
    }

    // 真实删除文件：通过 shell rm 实现（Tools.Files 无 delete 方法）
    async function deleteFilePath(fp) {
        var escapeSh = function (s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; };
        try {
            var result = await Tools.System.shell('rm -f ' + escapeSh(fp));
            return true;
        } catch (e) {
            // 降级：复用持久终端执行（不创建新终端）
            try {
                var rmSession = await getOrCreatePySession();
                await Tools.System.terminal.exec(rmSession, 'rm -f ' + escapeSh(fp), 10000);
                return true;
            } catch (_) {
                throw new Error('无法删除文件: ' + fp + ' (' + e.message + ')');
            }
        }
    }

    async function readJson(fp) {
        var raw = await readFile(fp);
        if (!raw) return null;
        try {
            var trimmed = raw.trim();
            if (trimmed.charAt(0) !== '{' && trimmed.charAt(0) !== '[') return null;
            return JSON.parse(trimmed);
        } catch (_) { return null; }
    }

    async function writeJson(fp, data) {
        await writeFileSafe(fp, JSON.stringify(data));
    }

    async function listDir(dp) {
        try {
            var listing = await Tools.Files.list(dp, 'android');
            return (listing && Array.isArray(listing.entries)) ? listing.entries : [];
        } catch (_) { return []; }
    }

    // =========================================================================
    // 第四层：日记文件格式引擎（YAML Front Matter + Markdown）
    // =========================================================================
    function composeDiary(meta, body) {
        var lines = ['---'];
        lines.push('id: ' + (meta.id || nowTs().id));
        lines.push('date: ' + meta.date);
        lines.push('time: ' + meta.time);
        lines.push('title: "' + (meta.title || '').replace(/"/g, '\\"') + '"');
        if (meta.tags && meta.tags.length > 0) {
            lines.push('tags: [' + meta.tags.map(function (t) {
                return '"' + t.replace(/"/g, '\\"') + '"';
            }).join(', ') + ']');
        }
        if (meta.mood) {
            lines.push('mood: "' + meta.mood.replace(/"/g, '\\"') + '"');
        }
        if (meta.summary) {
            lines.push('summary: "' + meta.summary.replace(/"/g, '\\"').replace(/\n/g, ' ') + '"');
        }
        lines.push('---');
        lines.push('');
        lines.push('# ' + (meta.title || '无题日记'));
        lines.push('');
        lines.push(body);
        lines.push('');
        lines.push('---');
        lines.push('*Generated at ' + meta.date + ' ' + meta.time + '*');
        return lines.join('\n');
    }

    // YAML Front Matter 解析，正确处理数组中含逗号的标签
    function parseDiary(raw) {
        if (!raw) return null;
        var result = { meta: {}, body: '' };

        var fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        if (fmMatch) {
            var yamlStr = fmMatch[1];
            result.body = raw.substring(fmMatch[0].length).trim();

            yamlStr.split('\n').forEach(function (line) {
                var kv = line.match(/^(\w+)\s*:\s*(.+)$/);
                if (!kv) return;
                var key = kv[1].trim();
                var val = kv[2].trim();

                // 数组 [...]：状态机逐字符解析，正确处理引号内的逗号
                if (val.charAt(0) === '[' && val.charAt(val.length - 1) === ']') {
                    var inner = val.substring(1, val.length - 1).trim();
                    if (!inner) { result.meta[key] = []; return; }
                    var items = [];
                    var cur = '';
                    var inQuote = false;
                    var quoteChar = '';
                    for (var ci = 0; ci < inner.length; ci++) {
                        var ch = inner.charAt(ci);
                        if (inQuote) {
                            if (ch === '\\' && ci + 1 < inner.length && inner.charAt(ci + 1) === quoteChar) {
                                cur += inner.charAt(ci + 1);
                                ci++;
                            } else if (ch === quoteChar) {
                                inQuote = false;
                            } else {
                                cur += ch;
                            }
                        } else if (ch === '"' || ch === "'") {
                            inQuote = true; quoteChar = ch;
                        } else if (ch === ',') {
                            var trimmed = cur.trim();
                            if (trimmed) items.push(trimmed);
                            cur = '';
                        } else {
                            cur += ch;
                        }
                    }
                    var last = cur.trim();
                    if (last) items.push(last);
                    result.meta[key] = items;
                    return;
                }

                // 去引号（单/双）并反转义
                if ((val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
                    (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")) {
                    val = val.substring(1, val.length - 1).replace(/\\"/g, '"');
                }
                result.meta[key] = val;
            });
        } else {
            result.body = raw;
        }

        return result;
    }

    // 去除日记末尾 Generated at 行（兼容无 /s flag 的环境）
    function stripFooter(body) {
        return (body || '').replace(/\n---\n\*Generated at [\s\S]*?\*\s*$/, '').trim();
    }

    // 去除 composeDiary 在 body 前添加的 # Title 标题行，避免编辑时重复
    function stripHeading(body) {
        return (body || '').replace(/^#\s+.+\n*/, '').trim();
    }

    // 生成日记文件路径（自动处理同日多篇，接受外部时间戳保证一致性）
    async function generateDiaryPath(title, ts) {
        var t = ts || nowTs();
        var monthDir = getDiaryRoot() + t.yearMonth + '/';
        await ensureDir(monthDir);

        var safeName = safeFileName(title);
        var baseName = t.date + '_' + safeName;
        var filePath = monthDir + baseName + '.md';

        if (!(await fileExists(filePath))) return filePath;

        for (var i = 2; i <= 99; i++) {
            var candidate = monthDir + baseName + '_' + i + '.md';
            if (!(await fileExists(candidate))) return candidate;
        }
        return monthDir + baseName + '_' + nowTs().id + '.md';
    }

    // 从文件名或路径解析出完整文件路径
    async function resolveDiaryPath(filename) {
        if (!filename || !filename.trim()) throw new Error('文件名不能为空');
        var fn = filename.trim();

        // 纯数字 ID：14位(YYYYMMDDHHmmss) 或 13位(旧版ms时间戳)
        if (/^\d{13,14}$/.test(fn)) {
            var idPath = await resolveById(fn);
            if (idPath) return idPath;
            throw new Error('找不到 ID 为 ' + fn + ' 的日记');
        }

        if (fn.indexOf('/') !== -1) {
            if (await fileExists(fn)) return fn;
            throw new Error('找不到日记文件: ' + fn);
        }

        if (!fn.endsWith('.md')) fn += '.md';

        var dateMatch = fn.match(/^(\d{4})-(\d{2})/);
        if (dateMatch) {
            var monthDir = getDiaryRoot() + dateMatch[1] + '-' + dateMatch[2] + '/';
            var fullPath = monthDir + fn;
            if (await fileExists(fullPath)) return fullPath;
        }

        var root = getDiaryRoot();
        var months = await listDir(root);
        for (var i = 0; i < months.length; i++) {
            if (!months[i].isDirectory) continue;
            var tryPath = root + months[i].name + '/' + fn;
            if (await fileExists(tryPath)) return tryPath;
        }

        throw new Error('找不到日记文件: ' + filename);
    }

    // 扫描所有日记文件
    async function scanAllDiaries() {
        var root = getDiaryRoot();
        await ensureDir(root);
        var months = await listDir(root);
        var all = [];
        for (var mi = 0; mi < months.length; mi++) {
            var m = months[mi];
            if (!m.isDirectory || m.name.charAt(0) === '.') continue;
            if (!/^\d{4}-\d{2}$/.test(m.name)) continue;
            var files = await listDir(root + m.name + '/');
            for (var fi = 0; fi < files.length; fi++) {
                var f = files[fi];
                if (f.isDirectory || !f.name.endsWith('.md')) continue;
                all.push({
                    path: root + m.name + '/' + f.name,
                    name: f.name,
                    monthDir: m.name,
                    size: f.size || 0,
                    lastModified: f.lastModified || ''
                });
            }
        }
        return all;
    }

    // =========================================================================
    // 第五层：嵌入 API 引擎
    // =========================================================================
    async function callEmbed(texts) {
        if (!texts || !texts.length) return [];
        var apiKey = getApiKey();
        if (!apiKey) throw new Error('DIARY_API_KEY 未配置，语义搜索不可用。');
        var model = getModel();
        var baseUrl = getBaseUrl();
        var http = getHttp();
        var all = [];

        for (var bs = 0; bs < texts.length; bs += CFG.BATCH_SIZE) {
            var batch = texts.slice(bs, bs + CFG.BATCH_SIZE);
            var trunc = batch.map(function (t) {
                return (t && t.length > CFG.MAX_TEXT_FOR_EMBED)
                    ? t.substring(0, CFG.MAX_TEXT_FOR_EMBED) : (t || '');
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

                    if (resp.statusCode === 429 || resp.statusCode >= 500) {
                        var w = Math.min(CFG.RETRY_BASE_DELAY * Math.pow(2, att) + Math.floor(Math.random() * 300), 10000);
                        lastErr = new Error('HTTP ' + resp.statusCode);
                        if (att < CFG.MAX_RETRIES - 1) { await Tools.System.sleep(w); continue; }
                        break;
                    }
                    if (resp.isSuccessful()) break;
                    lastErr = new Error('HTTP ' + resp.statusCode + ': ' + (resp.content || '').substring(0, 200));
                    if (resp.statusCode >= 400 && resp.statusCode < 500) break;
                } catch (e) {
                    lastErr = e;
                    if (att < CFG.MAX_RETRIES - 1) {
                        await Tools.System.sleep(CFG.RETRY_BASE_DELAY * Math.pow(2, att));
                        continue;
                    }
                }
            }

            if (!resp || !resp.isSuccessful()) {
                throw new Error('嵌入 API 调用失败: ' + (lastErr ? lastErr.message : '未知错误'));
            }

            var data;
            try { data = JSON.parse(resp.content); } catch (pe) {
                throw new Error('嵌入 API 返回非 JSON: ' + (resp.content || '').substring(0, 200));
            }
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('嵌入 API 返回格式异常: 缺少 data 数组');
            }
            data.data.sort(function (a, b) { return a.index - b.index; });
            for (var di = 0; di < data.data.length; di++) {
                var item = data.data[di];
                if (!item.embedding || !Array.isArray(item.embedding)) {
                    throw new Error('嵌入数据缺失 embedding 字段');
                }
                all.push(item.embedding);
            }
        }
        return all;
    }

    // 余弦相似度（JS 降级搜索）
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
    // 第六层：向量索引管理（按文件分片，增量更新）
    // =========================================================================
    function vecFileName(fn) { return md5(fn) + '.vec'; }
    function chunkFileName(fn) { return md5(fn) + '.chk'; }

    async function writeFileVectors(fileName, vectors) {
        await ensureDir(getVecDir());
        await writeFileSafe(getVecDir() + vecFileName(fileName), JSON.stringify(vectors));
    }

    async function readFileVectors(fileName) {
        try {
            var fp = getVecDir() + vecFileName(fileName);
            if (!(await fileExists(fp))) return null;
            var raw = await readFile(fp);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    }

    async function writeFileChunks(fileName, chunks) {
        await ensureDir(getChunkDir());
        await writeFileSafe(getChunkDir() + chunkFileName(fileName), JSON.stringify(chunks));
    }

    async function readFileChunks(fileName) {
        try {
            var fp = getChunkDir() + chunkFileName(fileName);
            if (!(await fileExists(fp))) return null;
            var raw = await readFile(fp);
            return raw ? JSON.parse(raw) : null;
        } catch (_) { return null; }
    }

    // 同步删除单个文件的所有向量索引文件
    async function deleteFileIndex(fileName) {
        var vecPath = getVecDir() + vecFileName(fileName);
        var chkPath = getChunkDir() + chunkFileName(fileName);
        var errs = [];
        if (await fileExists(vecPath)) {
            try { await deleteFilePath(vecPath); } catch (e) { errs.push('vec: ' + e.message); }
        }
        if (await fileExists(chkPath)) {
            try { await deleteFilePath(chkPath); } catch (e) { errs.push('chk: ' + e.message); }
        }
        if (errs.length > 0) throw new Error(errs.join('; '));
    }

    function fingerprint(entry) {
        return entry.name + '|' + (entry.size || 0) + '|' + (entry.lastModified || '');
    }

    // 获取文件的真实指纹（从文件系统读取，确保与 scanAllDiaries 一致）
    async function getFileFingerprint(filePath, fileName) {
        var dir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        var entries = await listDir(dir);
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].name === fileName) return fingerprint(entries[i]);
        }
        return fileName + '|0|';
    }

    async function readFingerprints() {
        return (await readJson(getCacheDir() + CFG.F_FINGERPRINTS)) || {};
    }

    async function writeFingerprints(fp) {
        await ensureDir(getCacheDir());
        await writeJson(getCacheDir() + CFG.F_FINGERPRINTS, fp);
    }

    // ID 索引：纯数字时间戳 → 文件名映射
    async function readIdIndex() {
        return (await readJson(getCacheDir() + CFG.F_ID_INDEX)) || {};
    }

    async function writeIdIndex(idx) {
        await ensureDir(getCacheDir());
        await writeJson(getCacheDir() + CFG.F_ID_INDEX, idx);
    }

    async function registerIdEntry(id, fileName, filePath) {
        var idx = await readIdIndex();
        idx[String(id)] = { fileName: fileName, path: filePath };
        await writeIdIndex(idx);
    }

    async function removeIdEntry(fileName, filePath) {
        var idx = await readIdIndex();
        var changed = false;
        Object.keys(idx).forEach(function (k) {
            var e = idx[k];
            if (e.fileName === fileName || (filePath && e.path === filePath)) {
                delete idx[k]; changed = true;
            }
        });
        if (changed) await writeIdIndex(idx);
    }

    async function resolveById(id) {
        var idx = await readIdIndex();
        var entry = idx[String(id)];
        if (entry && entry.path && (await fileExists(entry.path))) return entry.path;
        // 降级：扫描所有日记查找 ID
        var all = await scanAllDiaries();
        for (var i = 0; i < all.length; i++) {
            var raw = await readFile(all[i].path);
            if (!raw) continue;
            var m = raw.match(/^id:\s*(\d{13,14})\s*$/m);
            if (m && m[1] === String(id)) {
                // 修复索引
                idx[String(id)] = { fileName: all[i].name, path: all[i].path };
                await writeIdIndex(idx);
                return all[i].path;
            }
        }
        return null;
    }

    // 更新 meta.json 状态（同步索引计数，触发 Python 引擎 needs_reoptimize 检测）
    async function updateMeta(patch) {
        try {
            await ensureDir(getCacheDir());
            var old = (await readJson(getCacheDir() + CFG.F_META)) || {};
            if (patch) { Object.keys(patch).forEach(function (k) { old[k] = patch[k]; }); }
            old.last_build = nowTs().full;
            old.model = getModel();
            await writeJson(getCacheDir() + CFG.F_META, old);
        } catch (_) {}
    }

    // =========================================================================
    // 第七层：Python 搜索引擎调用
    // =========================================================================
    var _pyAvailableCache = null;
    var _pyCheckTime = 0;
    var PY_CACHE_TTL = 60000; // 1分钟缓存，允许脚本热部署后刷新

    async function isPyEngineAvailable() {
        var now = Date.now();
        if (_pyAvailableCache !== null && (now - _pyCheckTime) < PY_CACHE_TTL) {
            return _pyAvailableCache;
        }
        try {
            _pyAvailableCache = await fileExists(getScriptPath());
        } catch (_) {
            _pyAvailableCache = false;
        }
        _pyCheckTime = now;
        return _pyAvailableCache;
    }

    // 调用 Python 引擎（stdout/stderr 分离，避免 JSON 解析污染）
    async function runPyEngine(cmd, args) {
        var pyBin = getPyBin();
        var pyScript = getScriptPath();
        var diaryRoot = getDiaryRoot();
        var cacheDir = getCacheDir();
        await ensureDir(cacheDir);

        var escapeSh = function (s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; };

        var uid = Date.now() + '_' + Math.floor(Math.random() * 100000);
        var tmpOutFile = cacheDir + '.tmp_stdout_' + uid + '.json';
        var tmpErrFile = cacheDir + '.tmp_stderr_' + uid + '.log';
        var tmpVecFile = null;

        try {
            var cmdParts = pyBin + ' ' + escapeSh(pyScript) + ' ' + escapeSh(cmd) + ' ' + escapeSh(diaryRoot);

            var safeArgs = args || [];
            for (var ai = 0; ai < safeArgs.length; ai++) {
                var argStr = String(safeArgs[ai]);
                if (argStr.length > 16000) {
                    tmpVecFile = cacheDir + '.tmp_qvec_' + uid + '.json';
                    try {
                        await Tools.Files.write(tmpVecFile, argStr, false, 'android');
                        cmdParts += ' @' + escapeSh(tmpVecFile);
                    } catch (_) {
                        tmpVecFile = null;
                        cmdParts += ' ' + escapeSh(argStr.substring(0, 16000));
                    }
                } else {
                    cmdParts += ' ' + escapeSh(argStr);
                }
            }

            // stdout 和 stderr 分离，避免 Python 日志污染 JSON
            var shellCmd = cmdParts + ' > ' + escapeSh(tmpOutFile) + ' 2> ' + escapeSh(tmpErrFile);
            var timeout = cmd === 'optimize' ? CFG.PY_OPTIMIZE_TIMEOUT : CFG.PY_SEARCH_TIMEOUT;

            // 复用持久化终端会话，避免每次调用创建新终端（核心优化）
            var sessionId = await getOrCreatePySession();
            var execResult;
            try {
                execResult = await Tools.System.terminal.exec(sessionId, shellCmd, timeout);
            } catch (se) {
                // 会话失效时自动重建并重试一次
                _pySession = null;
                sessionId = await getOrCreatePySession();
                execResult = await Tools.System.terminal.exec(sessionId, shellCmd, timeout);
            }

            var rawOut = '';
            try {
                var readRes = await Tools.Files.read(tmpOutFile, 'android');
                rawOut = (readRes && readRes.content) ? readRes.content.trim() : '';
            } catch (_) {}

            // 若输出文件为空则回退到 terminal.output（某些环境重定向可能不生效）
            if (!rawOut && execResult && execResult.output) {
                rawOut = (execResult.output || '').trim();
            }

            if (!rawOut) {
                var exitCode = (execResult && execResult.exitCode !== undefined) ? execResult.exitCode : 'null';
                var errOut = '';
                try {
                    var errRead = await Tools.Files.read(tmpErrFile, 'android');
                    errOut = (errRead && errRead.content) ? errRead.content.trim().slice(-500) : '';
                } catch (_) {}
                throw new Error('Python 引擎无输出 (exit=' + exitCode + ')' + (errOut ? '\n' + errOut : ''));
            }

            // 从纯 stdout 输出中解析 JSON（最后一个 JSON 行）
            var result = null;
            var outputLines = rawOut.split('\n');
            for (var j = outputLines.length - 1; j >= 0; j--) {
                var line = outputLines[j].trim();
                if (!line || line.charAt(0) !== '{') continue;
                try { result = JSON.parse(line); break; } catch (_) {}
            }

            if (!result) {
                throw new Error('解析 Python 输出失败: ' + rawOut.slice(-300));
            }
            if (!result.success) {
                throw new Error('Python: ' + (result.message || JSON.stringify(result)));
            }
            return result;
        } finally {
            if (tmpVecFile) { try { await deleteFilePath(tmpVecFile); } catch (_) {} }
            try { await deleteFilePath(tmpOutFile); } catch (_) {}
            try { await deleteFilePath(tmpErrFile); } catch (_) {}
        }
    }

    // =========================================================================
    // 第八层：索引构建引擎（增量/全量，支持断点续建）
    // =========================================================================

    // 为单个日记文件建立向量索引
    async function indexSingleDiary(diaryFile) {
        var raw = await readFile(diaryFile.path);
        if (!raw) return null;

        var parsed = parseDiary(raw);
        if (!parsed) return null;

        var meta = parsed.meta;
        var prefix = '';
        if (meta.title) prefix += meta.title + '。';
        if (meta.tags && Array.isArray(meta.tags) && meta.tags.length > 0) {
            prefix += '标签：' + meta.tags.join('、') + '。';
        }
        if (meta.mood) prefix += '情绪：' + meta.mood + '。';

        var body = stripHeading(stripFooter(parsed.body));
        if (!body.trim()) return null;

        var embedTexts = [];

        if ((prefix + body).length <= CFG.MAX_TEXT_FOR_EMBED) {
            embedTexts.push(prefix + body);
        } else {
            var chunkSize = 800, overlap = 100, pos = 0;
            while (pos < body.length) {
                var end = Math.min(pos + chunkSize, body.length);
                embedTexts.push(prefix + body.substring(pos, end));
                if (end >= body.length) break;
                pos = end - overlap;
            }
        }

        var vectors = await callEmbed(embedTexts);
        if (!vectors || vectors.length === 0) return null;

        var chunks = embedTexts.map(function (t) {
            return {
                text: t,
                id: meta.id || '',
                fileName: diaryFile.name,
                filePath: diaryFile.path,
                date: meta.date || '',
                title: meta.title || '',
                tags: meta.tags || [],
                mood: meta.mood || ''
            };
        });

        await writeFileVectors(diaryFile.name, vectors);
        await writeFileChunks(diaryFile.name, chunks);

        return { vectors: vectors.length, chunks: chunks.length };
    }

    // 单文件完整索引流水线：嵌入→指纹→元数据→Python优化
    async function updateSingleIndex(filePath, fileName, monthDir) {
        var apiKey = getApiKey();
        if (!apiKey) return '未配置 API Key，跳过向量索引';

        await ensureDir(getCacheDir());
        await ensureDir(getVecDir());
        await ensureDir(getChunkDir());

        var result;
        try {
            result = await indexSingleDiary({ path: filePath, name: fileName, monthDir: monthDir });
        } catch (e) {
            return '向量嵌入失败: ' + e.message;
        }
        if (!result) return '文件内容为空或解析失败，跳过索引';

        // 用文件系统真实数据写指纹，保证与 buildIndex 一致
        try {
            var fps = await readFingerprints();
            fps[fileName] = await getFileFingerprint(filePath, fileName);
            await writeFingerprints(fps);
            await updateMeta({ files_indexed: Object.keys(fps).length, total_files: Object.keys(fps).length, build_complete: true });
        } catch (_) {
            await updateMeta({ build_complete: true });
        }

        // 触发 Python 引擎合并二进制索引
        try {
            if (await isPyEngineAvailable()) {
                await runPyEngine('optimize', []);
            }
        } catch (_) {}

        return null; // null = 成功
    }

    // 增量构建向量索引（断点续建：重新执行会跳过已完成的文件）
    async function buildIndex(force) {
        var apiKey = getApiKey();
        if (!apiKey) {
            return { success: false, message: '无可用 API Key，无法构建向量索引。关键词搜索仍可使用。' };
        }

        await ensureDir(getCacheDir());
        await ensureDir(getVecDir());
        await ensureDir(getChunkDir());

        // 强制重建：清除所有缓存文件（含孤立索引和 Python 二进制索引）
        if (force) {
            sendProgress('🗑 强制重建：清除全部缓存...');
            try {
                if (await isPyEngineAvailable()) {
                    await runPyEngine('clean', []);
                }
            } catch (_) {}
            var escapeSh = function (s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; };
            // 整目录清理比逐文件删除快 10x+
            try { await Tools.System.shell('rm -rf ' + escapeSh(getVecDir())); } catch (_) {}
            try { await Tools.System.shell('rm -rf ' + escapeSh(getChunkDir())); } catch (_) {}
            try { await deleteFilePath(getCacheDir() + 'vectors.npy'); } catch (_) {}
            try { await deleteFilePath(getCacheDir() + 'optimized_chunks.json'); } catch (_) {}
            try { await deleteFilePath(getCacheDir() + CFG.F_ID_INDEX); } catch (_) {}
            try { await deleteFilePath(getCacheDir() + CFG.F_META); } catch (_) {}
            try { await deleteFilePath(getCacheDir() + CFG.F_FINGERPRINTS); } catch (_) {}
        }

        var allDiaries = await scanAllDiaries();
        if (allDiaries.length === 0) {
            return { success: true, message: '暂无日记文件', data: '未找到任何 .md 日记文件。' };
        }

        // 计算当前所有文件的指纹
        var newFp = {};
        allDiaries.forEach(function (d) { newFp[d.name] = fingerprint(d); });

        var oldFp = force ? {} : await readFingerprints();
        var added = [], modified = [], unchanged = [], removed = [];

        Object.keys(newFp).forEach(function (n) {
            if (!oldFp[n]) added.push(n);
            else if (oldFp[n] !== newFp[n]) modified.push(n);
            else unchanged.push(n);
        });
        Object.keys(oldFp).forEach(function (n) {
            if (!newFp[n]) removed.push(n);
        });

        // 同步删除已移除文件的索引，并立即更新指纹（删一条更新一次，防止中断导致的幽灵记录）
        for (var ri = 0; ri < removed.length; ri++) {
            await deleteFileIndex(removed[ri]);
            delete oldFp[removed[ri]];
            await writeFingerprints(oldFp);
        }

        // 构建待处理集合（O(1) 查找）
        var needsIndex = {};
        added.forEach(function (n) { needsIndex[n] = true; });
        modified.forEach(function (n) { needsIndex[n] = true; });

        var toProcess = allDiaries.filter(function (d) { return needsIndex[d.name]; });

        if (toProcess.length === 0 && removed.length === 0) {
            return { success: true, message: '索引已是最新（' + unchanged.length + ' 篇日记）', data: '' };
        }

        sendProgress('📝 正在构建索引: ' + toProcess.length + ' 篇需处理...', { total: toProcess.length });

        var indexed = 0, errors = 0;
        // 读取最新指纹（删除操作已更新过）
        var curFp = await readFingerprints();

        for (var pi = 0; pi < toProcess.length; pi++) {
            var df = toProcess[pi];
            try {
                sendProgress('📝 [' + (pi + 1) + '/' + toProcess.length + '] ' + df.name);
                await indexSingleDiary(df);
                indexed++;
                // 每索引成功一篇立即更新指纹（断点续建关键）
                curFp[df.name] = newFp[df.name];
                await writeFingerprints(curFp);
            } catch (e) {
                console.error('[Diary] 索引失败: ' + df.name + ' - ' + e.message);
                errors++;
            }
        }

        // 写入元数据
        await updateMeta({
            build_complete: errors === 0,
            total_files: allDiaries.length,
            files_indexed: indexed + unchanged.length
        });

        // 重建 ID 索引（从 front matter 快速提取，无需读全文）
        try {
            var idIdx = {};
            for (var ii = 0; ii < allDiaries.length; ii++) {
                var diRaw = await readFile(allDiaries[ii].path);
                if (!diRaw) continue;
                // 仅扫描前 500 字符的 front matter 区域
                var header = diRaw.substring(0, 500);
                var idMatch = header.match(/^id:\s*(\d{13,14})\s*$/m);
                if (idMatch) {
                    idIdx[idMatch[1]] = { fileName: allDiaries[ii].name, path: allDiaries[ii].path };
                }
            }
            await writeIdIndex(idIdx);
        } catch (_) {}

        // 尝试优化 Python 引擎索引
        var pyMsg = '';
        if (indexed > 0 || removed.length > 0) {
            try {
                if (await isPyEngineAvailable()) {
                    sendProgress('🐍 正在优化 Python 引擎索引...');
                    var pyRes = await runPyEngine('optimize', []);
                    pyMsg = '\n✅ Python 引擎索引已优化: ' + (pyRes.message || '');
                }
            } catch (pyErr) {
                pyMsg = '\n⚠ Python 引擎索引优化失败: ' + pyErr.message;
            }
        }

        var msg = '索引构建完成: 新增/更新 ' + indexed + ' 篇' +
                  (removed.length > 0 ? '，清理 ' + removed.length + ' 篇' : '') +
                  (errors > 0 ? '，失败 ' + errors + ' 篇（可重新执行继续）' : '') +
                  '，总计 ' + (indexed + unchanged.length) + ' 篇已索引' + pyMsg;

        return { success: true, message: msg };
    }

    // =========================================================================
    // 第九层：搜索引擎（语义/关键词/混合）
    // =========================================================================

    // 语义搜索（Python 引擎优先，JS 降级）
    async function semanticSearch(query, topK, month) {
        // 预检：无索引时跳过 API 调用
        var fps = await readFingerprints();
        if (Object.keys(fps).length === 0) {
            return { results: [], engine: 'javascript' };
        }

        var queryVec = (await callEmbed([query]))[0];
        if (!queryVec) throw new Error('无法获取查询向量');

        if (await isPyEngineAvailable()) {
            try {
                var args = [JSON.stringify(queryVec), String(topK), '0.2'];
                if (month) args.push(month);
                var pyRes = await runPyEngine('search', args);
                if (pyRes && pyRes.data && Array.isArray(pyRes.data)) {
                    return { results: pyRes.data, engine: 'python' };
                }
            } catch (pyErr) {
                console.warn('[Diary] Python 搜索失败，降级到 JS: ' + pyErr.message);
            }
        }

        // JS 降级搜索
        var allDiaries = await scanAllDiaries();
        var candidates = [];

        for (var di = 0; di < allDiaries.length; di++) {
            var d = allDiaries[di];
            if (month && d.monthDir !== month) continue;

            var vecs = await readFileVectors(d.name);
            var chunks = await readFileChunks(d.name);
            if (!vecs || !chunks) continue;

            for (var vi = 0; vi < vecs.length && vi < chunks.length; vi++) {
                var score = cosSim(queryVec, vecs[vi]);
                if (score >= 0.2) {
                    candidates.push({
                        score: Math.round(score * 10000) / 10000,
                        text: (chunks[vi].text || '').substring(0, 500),
                        id: chunks[vi].id || '',
                        fileName: chunks[vi].fileName || d.name,
                        date: chunks[vi].date || '',
                        title: chunks[vi].title || '',
                        tags: chunks[vi].tags || [],
                        mood: chunks[vi].mood || ''
                    });
                }
            }
        }

        candidates.sort(function (a, b) { return b.score - a.score; });

        // 同文件去重，保留最高分
        var seen = {}, deduped = [];
        for (var ci = 0; ci < candidates.length; ci++) {
            var fn = candidates[ci].fileName;
            if (seen[fn]) continue;
            seen[fn] = true;
            deduped.push(candidates[ci]);
        }

        return { results: deduped.slice(0, topK), engine: 'javascript' };
    }

    // 关键词搜索（纯本地，无需 API）
    async function keywordSearch(query, topK, month) {
        if (await isPyEngineAvailable()) {
            try {
                var args = [query, String(topK)];
                if (month) args.push(month);
                var pyRes = await runPyEngine('keyword_search', args);
                if (pyRes && pyRes.data && Array.isArray(pyRes.data)) {
                    return { results: pyRes.data, engine: 'python' };
                }
            } catch (_) {}
        }

        // JS 降级关键词搜索
        var keywords = query.toLowerCase().split(/[\s,，;；]+/).filter(function (k) { return k.length > 0; });
        if (keywords.length === 0) return { results: [], engine: 'javascript' };

        var allDiaries = await scanAllDiaries();
        var candidates = [];

        for (var di = 0; di < allDiaries.length; di++) {
            var d = allDiaries[di];
            if (month && d.monthDir !== month) continue;

            var raw = await readFile(d.path);
            if (!raw) continue;
            var parsed = parseDiary(raw);
            if (!parsed) continue;

            var lower = raw.toLowerCase();
            var matchCount = 0;
            keywords.forEach(function (kw) { if (lower.indexOf(kw) !== -1) matchCount++; });

            if (matchCount > 0) {
                var snippet = '';
                for (var ki = 0; ki < keywords.length; ki++) {
                    var idx = lower.indexOf(keywords[ki]);
                    if (idx !== -1) {
                        var start = Math.max(0, idx - 50);
                        var end = Math.min(raw.length, idx + keywords[ki].length + 100);
                        snippet = '...' + raw.substring(start, end).replace(/\n/g, ' ') + '...';
                        break;
                    }
                }

                candidates.push({
                    score: Math.round(matchCount / keywords.length * 10000) / 10000,
                    text: snippet || (parsed.body || '').substring(0, 200),
                    id: parsed.meta.id || '',
                    fileName: d.name,
                    date: parsed.meta.date || '',
                    title: parsed.meta.title || '',
                    tags: parsed.meta.tags || [],
                    mood: parsed.meta.mood || ''
                });
            }
        }

        candidates.sort(function (a, b) { return b.score - a.score; });
        return { results: candidates.slice(0, topK), engine: 'javascript' };
    }

    // =========================================================================
    // 第十层：业务逻辑 Handler
    // =========================================================================

    async function saveDiaryHandler(p) {
        var content = String(p.content || '').trim();
        if (!content) throw new Error('日记内容 (content) 不能为空');

        var t = nowTs();
        var title = (p.title || '').trim();
        if (!title) {
            var firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
            title = firstLine.substring(0, CFG.MAX_TITLE_LEN) || '日记_' + t.date;
        }

        var tags = [];
        if (p.tags) {
            tags = String(p.tags).split(/[,，;；]/)
                .map(function (s) { return s.trim(); })
                .filter(function (s) { return s.length > 0; });
        }

        var mood = (p.mood || '').trim();
        var summary = (p.summary || '').trim() ||
            content.replace(/\n/g, ' ').substring(0, CFG.MAX_SUMMARY_LEN);

        var meta = { id: t.id, date: t.date, time: t.time, title: title, tags: tags, mood: mood, summary: summary };
        var filePath = await generateDiaryPath(title, t);
        var markdown = composeDiary(meta, content);
        await writeFileSafe(filePath, markdown);

        var fn = filePath.substring(filePath.lastIndexOf('/') + 1);

        // 注册 ID 索引
        await registerIdEntry(t.id, fn, filePath);

        // 完整索引流水线：嵌入→指纹→Python优化
        var idxErr = await updateSingleIndex(filePath, fn, t.yearMonth);
        var indexMsg = idxErr ? ('，' + idxErr) : '，向量索引已更新';

        var lines = [
            '# 📝 日记已保存',
            '',
            '- **ID**: ' + t.id,
            '- **标题**: ' + title,
            '- **日期**: ' + t.date + ' ' + t.time,
            '- **文件**: ' + fn,
            '- **路径**: ' + filePath
        ];
        if (tags.length > 0) lines.push('- **标签**: ' + tags.join(', '));
        if (mood) lines.push('- **情绪**: ' + mood);

        return { success: true, message: '日记已保存: ' + title + ' (ID: ' + t.id + ')' + indexMsg, data: lines.join('\n') };
    }

    async function editDiaryHandler(p) {
        if (!p.filename) throw new Error('filename 参数不能为空');
        if (!p.append_content && !p.new_content && !p.title && p.tags === undefined && p.mood === undefined) {
            throw new Error('至少提供一个修改参数（append_content/new_content/title/tags/mood）');
        }
        var filePath = await resolveDiaryPath(p.filename);
        var raw = await readFile(filePath);
        if (!raw) throw new Error('无法读取日记文件');

        var parsed = parseDiary(raw);
        if (!parsed) throw new Error('日记格式解析失败');

        var meta = parsed.meta;
        var body = stripHeading(stripFooter(parsed.body));

        if (p.title && p.title.trim()) meta.title = p.title.trim();
        if (p.tags !== undefined && p.tags !== null) {
            var rawTags = String(p.tags).trim();
            meta.tags = rawTags ? rawTags.split(/[,，;；]/)
                .map(function (s) { return s.trim(); })
                .filter(function (s) { return s.length > 0; }) : [];
        }
        if (p.mood !== undefined && p.mood !== null) meta.mood = (p.mood || '').trim();

        if (p.new_content && p.new_content.trim()) {
            body = p.new_content.trim();
        } else if (p.append_content && p.append_content.trim()) {
            body += '\n\n---\n\n' + p.append_content.trim();
        }

        meta.summary = body.replace(/^#+\s+.+\n*/, '').replace(/\n/g, ' ').substring(0, CFG.MAX_SUMMARY_LEN);
        // 保留原始 ID，无则补充
        if (!meta.id) meta.id = nowTs().id;
        var markdown = composeDiary(meta, body);
        await writeFileSafe(filePath, markdown);

        var fn = filePath.substring(filePath.lastIndexOf('/') + 1);
        // 更新 ID 索引
        await registerIdEntry(meta.id, fn, filePath);

        // 完整索引流水线：嵌入→指纹→Python优化
        var idxErr = await updateSingleIndex(filePath, fn, meta.date ? meta.date.substring(0, 7) : '');
        var indexMsg = idxErr ? ('，' + idxErr) : '，向量索引已更新';

        return { success: true, message: '日记已更新: ' + (meta.title || fn) + indexMsg };
    }

    async function searchDiaryHandler(p) {
        var query = String(p.query || '').trim();
        if (!query) throw new Error('搜索查询 (query) 不能为空');

        var mode = (p.mode || 'semantic').trim().toLowerCase();
        var topK = safeNumber(p.top_k, 5, 1, 20);
        var month = (p.month || '').trim() || null;

        var searchResult;

        if (mode === 'keyword') {
            searchResult = await keywordSearch(query, topK, month);
        } else if (mode === 'hybrid') {
            // 混合搜索：语义 + 关键词，RRF 融合
            var semRes = null, kwRes = null;
            var semErr = null;
            try { semRes = await semanticSearch(query, topK * 2, month); } catch (e) { semErr = e; }
            try { kwRes = await keywordSearch(query, topK * 2, month); } catch (_) {}

            // 两者都失败时抛出语义搜索错误
            if (!semRes && !kwRes) {
                throw semErr || new Error('语义搜索和关键词搜索均失败');
            }

            var scoreMap = {}, infoMap = {};
            var k = 60; // RRF 常数

            if (semRes && semRes.results) {
                semRes.results.forEach(function (r, i) {
                    var key = r.fileName;
                    scoreMap[key] = (scoreMap[key] || 0) + 1.0 / (k + i + 1);
                    infoMap[key] = r;
                });
            }
            if (kwRes && kwRes.results) {
                kwRes.results.forEach(function (r, i) {
                    var key = r.fileName;
                    scoreMap[key] = (scoreMap[key] || 0) + 1.0 / (k + i + 1);
                    if (!infoMap[key]) infoMap[key] = r;
                });
            }

            var merged = Object.keys(scoreMap).map(function (key) {
                var info = infoMap[key];
                info.score = Math.round(scoreMap[key] * 10000) / 10000;
                return info;
            });
            merged.sort(function (a, b) { return b.score - a.score; });
            searchResult = { results: merged.slice(0, topK), engine: 'hybrid' };
        } else {
            // 默认语义搜索，API 不可用时降级
            if (getApiKey()) {
                try {
                    searchResult = await semanticSearch(query, topK, month);
                } catch (semErr) {
                    console.warn('[Diary] 语义搜索失败，降级到关键词: ' + semErr.message);
                    searchResult = await keywordSearch(query, topK, month);
                }
            } else {
                searchResult = await keywordSearch(query, topK, month);
            }
        }

        if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
            return { success: true, message: '未找到相关日记', data: '查询: ' + query + '\n模式: ' + mode + '\n结果: 0 条' };
        }

        var lines = [
            '## 🔍 日记搜索结果', '',
            '> **查询**: ' + query + '  ',
            '> **模式**: ' + mode + ' (' + searchResult.engine + ' 引擎)  ',
            '> **结果**: ' + searchResult.results.length + ' 条', ''
        ];

        searchResult.results.forEach(function (r, idx) {
            lines.push('### [' + (idx + 1) + '] ' + (r.title || r.fileName));
            lines.push('**日期**: ' + (r.date || '未知') +
                       (r.id ? ' | **ID**: ' + r.id : '') +
                       (r.mood ? ' | **情绪**: ' + r.mood : '') +
                       ' | **相似度**: ' + (r.score || 0));
            if (r.tags && r.tags.length > 0) {
                lines.push('**标签**: ' + (Array.isArray(r.tags) ? r.tags.join(', ') : r.tags));
            }
            lines.push('**文件**: ' + (r.fileName || ''));
            if (r.text) { lines.push(''); lines.push(truncate(r.text, 300)); }
            lines.push('');
        });

        return {
            success: true,
            message: '找到 ' + searchResult.results.length + ' 条结果 (' + searchResult.engine + ')',
            data: truncate(lines.join('\n'), CFG.MAX_OUTPUT_CHARS)
        };
    }

    async function listDiaryHandler(p) {
        var month = (p.month || '').trim() || null;
        var limit = safeNumber(p.limit, 20, 1, 100);
        var tagFilter = (p.tag || '').trim().toLowerCase() || null;

        var allDiaries = await scanAllDiaries();
        if (month) {
            allDiaries = allDiaries.filter(function (d) { return d.monthDir === month; });
        }
        allDiaries.sort(function (a, b) { return b.name.localeCompare(a.name); });

        var entries = [];

        for (var i = 0; i < allDiaries.length && entries.length < limit; i++) {
            var d = allDiaries[i];
            var raw = await readFile(d.path);
            if (!raw) continue;
            var parsed = parseDiary(raw);
            if (!parsed) continue;

            var meta = parsed.meta;
            var tags = meta.tags || [];

            if (tagFilter) {
                var hasTag = Array.isArray(tags) &&
                    tags.some(function (t) { return t.toLowerCase().indexOf(tagFilter) !== -1; });
                if (!hasTag) continue;
            }

            entries.push({
                id: meta.id || '',
                fileName: d.name,
                date: meta.date || '',
                time: meta.time || '',
                title: meta.title || d.name.replace(/\.md$/, ''),
                tags: tags,
                mood: meta.mood || '',
                summary: (meta.summary || '').substring(0, 100)
            });
        }

        if (entries.length === 0) {
            return {
                success: true,
                message: '暂无日记' + (month ? ' (' + month + ')' : '') + (tagFilter ? ' [标签: ' + tagFilter + ']' : ''),
                data: ''
            };
        }

        var lines = [
            '## 📒 日记列表' + (month ? ' (' + month + ')' : '') + (tagFilter ? ' [标签: ' + tagFilter + ']' : ''),
            '',
            '共 ' + entries.length + ' 篇' + (allDiaries.length > entries.length ? '（共 ' + allDiaries.length + ' 篇）' : ''),
            ''
        ];

        entries.forEach(function (e, idx) {
            lines.push('### ' + (idx + 1) + '. ' + e.title);
            var info = '📅 ' + e.date;
            if (e.id) info += ' | 🆔 ' + e.id;
            if (e.mood) info += ' | 💭 ' + e.mood;
            if (e.tags && e.tags.length > 0) info += ' | 🏷 ' + (Array.isArray(e.tags) ? e.tags.join(', ') : e.tags);
            lines.push(info);
            if (e.summary) lines.push('> ' + e.summary);
            lines.push('`' + e.fileName + '`');
            lines.push('');
        });

        return {
            success: true,
            message: '共 ' + entries.length + ' 篇日记',
            data: truncate(lines.join('\n'), CFG.MAX_OUTPUT_CHARS)
        };
    }

    async function readDiaryHandler(p) {
        if (!p.filename) throw new Error('filename 参数不能为空');
        var filePath = await resolveDiaryPath(p.filename);
        var raw = await readFile(filePath);
        if (!raw) throw new Error('无法读取日记文件');

        var parsed = parseDiary(raw);
        var diaryId = (parsed && parsed.meta && parsed.meta.id) ? parsed.meta.id : '';
        var fn = filePath.substring(filePath.lastIndexOf('/') + 1);

        return {
            success: true,
            message: '日记读取成功: ' + fn + (diaryId ? ' (ID: ' + diaryId + ')' : ''),
            data: truncate(raw, CFG.MAX_SINGLE_OUTPUT)
        };
    }

    async function deleteDiaryHandler(p) {
        var confirmed = p.confirm === true || p.confirm === 'true';
        if (!confirmed) {
            return { success: false, message: '删除操作需要 confirm=true 确认。' };
        }
        if (!p.filename) throw new Error('filename 参数不能为空');

        var filePath = await resolveDiaryPath(p.filename);
        var fn = filePath.substring(filePath.lastIndexOf('/') + 1);

        // 先同步清理索引和指纹，再删除文件
        // 顺序：索引 → 指纹 → ID索引 → 文件 → Python优化
        var cleanMsgs = [];

        try {
            await deleteFileIndex(fn);
            cleanMsgs.push('索引已清理');
        } catch (ie) {
            cleanMsgs.push('索引清理失败: ' + ie.message);
        }

        try {
            var fps = await readFingerprints();
            if (fps[fn]) {
                delete fps[fn];
                await writeFingerprints(fps);
                cleanMsgs.push('指纹已移除');
            }
        } catch (fe) {
            cleanMsgs.push('指纹更新失败: ' + fe.message);
        }

        try {
            await removeIdEntry(fn, filePath);
            cleanMsgs.push('ID 索引已移除');
        } catch (_) {}

        // 删除日记文件
        await deleteFilePath(filePath);

        // 验证删除结果
        if (await fileExists(filePath)) {
            throw new Error('文件删除失败（文件仍存在）: ' + fn);
        }

        // 清理空月份目录
        try {
            var monthDir = filePath.substring(0, filePath.lastIndexOf('/'));
            var remaining = await listDir(monthDir + '/');
            var mdFiles = remaining.filter(function (f) { return !f.isDirectory && f.name.endsWith('.md'); });
            if (mdFiles.length === 0) {
                var escapeSh2 = function (s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; };
                await Tools.System.shell('rmdir ' + escapeSh2(monthDir));
            }
        } catch (_) {}

        // 更新 meta.json，同步文件计数
        try {
            var curFps = await readFingerprints();
            var fpCount = Object.keys(curFps).length;
            await updateMeta({ files_indexed: fpCount, total_files: fpCount });
        } catch (_) {
            await updateMeta({});
        }

        // 立即触发 Python 引擎重新优化（清理二进制索引中的残留数据）
        try {
            if (await isPyEngineAvailable()) {
                await runPyEngine('optimize', []);
                cleanMsgs.push('Python 索引已同步');
            }
        } catch (_) {}

        return {
            success: true,
            message: '日记已删除: ' + fn + ' (' + cleanMsgs.join('，') + ')'
        };
    }

    async function statsHandler() {
        var allDiaries = await scanAllDiaries();

        if (allDiaries.length === 0) {
            return { success: true, message: '暂无日记数据', data: '日记目录为空。' };
        }

        var monthCount = {}, tagCount = {}, moodCount = {}, totalSize = 0;

        for (var i = 0; i < allDiaries.length; i++) {
            var d = allDiaries[i];
            monthCount[d.monthDir] = (monthCount[d.monthDir] || 0) + 1;
            totalSize += d.size || 0;

            var raw = await readFile(d.path);
            if (!raw) continue;
            var parsed = parseDiary(raw);
            if (!parsed) continue;

            var meta = parsed.meta;
            if (meta.tags && Array.isArray(meta.tags)) {
                meta.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; });
            }
            if (meta.mood) {
                moodCount[meta.mood] = (moodCount[meta.mood] || 0) + 1;
            }
        }

        var indexMeta = await readJson(getCacheDir() + CFG.F_META);
        var pyAvailable = await isPyEngineAvailable();
        var idIdx = await readIdIndex();

        var lines = [
            '## 📊 日记统计', '',
            '### 基本信息',
            '- 总篇数: **' + allDiaries.length + '**',
            '- 总大小: ' + (totalSize / 1024).toFixed(1) + ' KB',
            '- 存储目录: ' + getDiaryRoot(), ''
        ];

        var months = Object.keys(monthCount).sort().reverse();
        lines.push('### 月度分布');
        months.forEach(function (m) { lines.push('- ' + m + ': ' + monthCount[m] + ' 篇'); });
        lines.push('');

        var topTags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 10);
        if (topTags.length > 0) {
            lines.push('### 常用标签 (Top 10)');
            topTags.forEach(function (t) { lines.push('- ' + t + ': ' + tagCount[t] + ' 次'); });
            lines.push('');
        }

        var moods = Object.keys(moodCount).sort(function (a, b) { return moodCount[b] - moodCount[a]; });
        if (moods.length > 0) {
            lines.push('### 情绪分布');
            moods.forEach(function (m) { lines.push('- ' + m + ': ' + moodCount[m] + ' 次'); });
            lines.push('');
        }

        lines.push('### 向量索引状态');
        if (indexMeta) {
            var fpCount = Object.keys(await readFingerprints()).length;
            lines.push('- 已索引: ' + fpCount + ' / ' + allDiaries.length + ' 篇');
            lines.push('- 最后构建: ' + (indexMeta.last_build || '未知'));
            lines.push('- 构建完整: ' + (indexMeta.build_complete ? '✅' : '⚠ 部分失败'));
            lines.push('- 嵌入模型: ' + (indexMeta.model || '未配置'));
        } else {
            lines.push('- 状态: 未构建（使用 rebuild_index 初始化）');
        }
        lines.push('- Python 引擎: ' + (pyAvailable ? '✅ 可用' : '⚪ 不可用'));
        lines.push('- ID 索引: ' + Object.keys(idIdx).length + ' 条');
        lines.push('- API Key: ' + (getApiKey() ? '✅ 已配置' : '⚪ 未配置（仅关键词搜索）'));

        return { success: true, message: '共 ' + allDiaries.length + ' 篇日记', data: lines.join('\n') };
    }

    async function rebuildIndexHandler(p) {
        var force = !!(p && p.force);
        return await buildIndex(force);
    }

    async function testHandler() {
        var apiKey = getApiKey();
        var pyAvailable = await isPyEngineAvailable();
        var rootExists = await fileExists(getDiaryRoot());

        var report = [
            '## 🔧 日记工具包连通性诊断', '',
            '| 配置项 | 状态 | 值 |',
            '| :--- | :--- | :--- |'
        ];

        report.push('| 存储目录 | ' + (rootExists ? '✅ 存在' : '⚠ 不存在（将自动创建）') + ' | ' + getDiaryRoot() + ' |');
        report.push('| 嵌入 API Key | ' + (apiKey ? '✅ 已配置 (' + apiKey.substring(0, 8) + '***)' : '⚪ 未配置（关键词搜索仍可用）') + ' | - |');
        report.push('| 嵌入 API 地址 | - | ' + getBaseUrl() + ' |');
        report.push('| 嵌入模型 | - | ' + getModel() + ' |');
        report.push('| Python 引擎 | ' + (pyAvailable ? '✅ 可用' : '⚪ 不可用（JS 引擎降级）') + ' | ' + getScriptPath() + ' |');
        report.push('| Python 解释器 | - | ' + getPyBin() + ' |');
        report.push('| 终端会话 | ' + (_pySession ? '♻️ 已复用 (ID: ' + _pySession.substring(0, 8) + '...)' : '⚪ 待初始化') + ' | 单会话复用模式 |');

        var indexMeta = await readJson(getCacheDir() + CFG.F_META);
        report.push('| 向量索引 | ' + (indexMeta && indexMeta.files_indexed > 0 ? '✅ 已构建 (' + indexMeta.files_indexed + ' 篇)' : '⚪ 未构建') + ' | - |');

        var allDiaries = await scanAllDiaries();
        report.push('| 日记数量 | ' + allDiaries.length + ' 篇 | - |');
        var idIdx = await readIdIndex();
        report.push('| ID 索引 | ' + Object.keys(idIdx).length + ' 条 | - |');

        // 测试 Python 引擎实际可用性
        if (pyAvailable) {
            try {
                var pyStart = Date.now();
                var pyStatus = await runPyEngine('status', []);
                var pyTime = Date.now() - pyStart;
                report.push('| Python 执行测试 | ✅ 正常 (' + pyTime + 'ms) | v' + (pyStatus.py_engine_version || '?') + ' |');
            } catch (pe) {
                report.push('| Python 执行测试 | ❌ ' + pe.message.substring(0, 80) + ' | - |');
            }
        }

        // 测试 API 连通性
        if (apiKey) {
            try {
                var startTime = Date.now();
                await callEmbed(['connectivity test']);
                report.push('| API 连通性 | ✅ 正常 (' + (Date.now() - startTime) + 'ms) | - |');
            } catch (e) {
                report.push('| API 连通性 | ❌ ' + e.message.substring(0, 80) + ' | - |');
            }
        }

        var msg = '日记工具包就绪';
        if (!apiKey) msg += '（语义搜索需配置 DIARY_API_KEY）';

        return { success: true, message: msg, data: report.join('\n') };
    }

    // =========================================================================
    // 统一错误包装与模块导出
    // =========================================================================
    async function wrap(fn, p, label) {
        try {
            var r = await fn(p || {});
            complete(r);
        } catch (e) {
            console.error('[Diary] ' + label + ': ' + e.message);
            complete({ success: false, message: label + ' 失败: ' + e.message, error_stack: e.stack });
        }
    }

    async function main() {
        complete({
            success: true,
            message: '智能日记本工具包 v1.0 加载完成',
            data: {
                version: '1.0',
                tools: ['save_diary', 'edit_diary', 'search_diary', 'list_diary',
                        'read_diary', 'delete_diary', 'stats', 'rebuild_index', 'test'],
                api_base: getBaseUrl(),
                embed_model: getModel(),
                diary_root: getDiaryRoot()
            }
        });
    }

    return {
        save_diary:    function (p) { return wrap(saveDiaryHandler, p, '保存日记'); },
        edit_diary:    function (p) { return wrap(editDiaryHandler, p, '编辑日记'); },
        search_diary:  function (p) { return wrap(searchDiaryHandler, p, '搜索日记'); },
        list_diary:    function (p) { return wrap(listDiaryHandler, p, '列出日记'); },
        read_diary:    function (p) { return wrap(readDiaryHandler, p, '读取日记'); },
        delete_diary:  function (p) { return wrap(deleteDiaryHandler, p, '删除日记'); },
        stats:         function (p) { return wrap(statsHandler, p, '日记统计'); },
        rebuild_index: function (p) { return wrap(rebuildIndexHandler, p, '重建索引'); },
        test:          function (p) { return wrap(testHandler, p, '连通性测试'); },
        main: main
    };
})();

exports.save_diary    = Diary.save_diary;
exports.edit_diary    = Diary.edit_diary;
exports.search_diary  = Diary.search_diary;
exports.list_diary    = Diary.list_diary;
exports.read_diary    = Diary.read_diary;
exports.delete_diary  = Diary.delete_diary;
exports.stats         = Diary.stats;
exports.rebuild_index = Diary.rebuild_index;
exports.test          = Diary.test;
exports.main          = Diary.main;
