/* METADATA
{
    "name": "toolkit_index",
    "version": "1.0",
    "display_name": {
        "zh": "工具包索引",
        "en": "Toolkit Index"
    },
    "description": {
        "zh": "工具包智能索引系统。自动扫描 examples 目录下所有工具包，构建结构化索引与语义向量缓存。提供：1) 语义搜索——根据自然语言意图精准匹配最佳工具包和工具函数；2) 全量概览——一次性列出所有可用工具包的功能摘要；3) 详情查询——获取指定工具包的完整调用指南（参数、格式、示例）；4) 格式检查——检验所有工具包的 METADATA 规范合规性。本工具包默认常驻启用，是 AI 理解和调用其他工具包的核心基础设施。",
        "en": "Toolkit Smart Index System. Auto-scans all toolkits in the examples directory, builds structured index and semantic vector cache. Provides: 1) Semantic search; 2) Full overview; 3) Detail query; 4) Format validation - checks METADATA compliance for all toolkits. Always enabled by default as core AI infrastructure."
    },
    "enabledByDefault": true,
    "env": [
        {
            "name": "SILICONFLOW_API_KEY",
            "description": {
                "zh": "硅基流动 API 密钥，用于调用嵌入模型生成语义向量。获取地址：https://siliconflow.cn",
                "en": "SiliconFlow API key for embedding model. Get it at: https://siliconflow.cn"
            },
            "required": true
        },
        {
            "name": "SILICONFLOW_EMBED_MODEL",
            "description": {
                "zh": "嵌入模型名称，默认 BAAI/bge-m3（支持中英双语，1024维）",
                "en": "Embedding model name. Default: BAAI/bge-m3 (bilingual, 1024-dim)"
            },
            "required": false
        },
        {
            "name": "SILICONFLOW_BASE_URL",
            "description": {
                "zh": "硅基流动 API 基础地址，默认 https://api.siliconflow.cn/v1",
                "en": "SiliconFlow API base URL. Default: https://api.siliconflow.cn/v1"
            },
            "required": false
        },
        {
            "name": "TOOLKIT_EXAMPLES_DIR",
            "description": {
                "zh": "工具包所在目录，默认 /storage/emulated/0/Download/Operit/examples/",
                "en": "Toolkit directory path. Default: /storage/emulated/0/Download/Operit/examples/"
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "query",
            "description": {
                "zh": "语义智能搜索。根据自然语言描述的任务意图，通过向量相似度匹配最合适的工具包和具体工具函数。返回匹配结果包含：工具包名称、匹配的工具函数、完整的调用参数说明、相似度评分。这是 AI 寻找正确工具的首选方式。",
                "en": "Semantic smart search. Match the best toolkit and tool function by natural language task intent via vector similarity. Returns: toolkit name, matched tool, full parameter spec, similarity score."
            },
            "parameters": [
                {
                    "name": "intent",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "任务意图的自然语言描述。例如：'搜索网页信息'、'导航到某地'、'运行Python代码'。建议使用具体的动作描述而非模糊词汇。",
                        "en": "Natural language description of task intent. e.g., 'search the web', 'navigate to a place', 'run Python code'."
                    }
                },
                {
                    "name": "top_k",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "返回最相关的前 N 个结果，默认 3，范围 1-10",
                        "en": "Return top N most relevant results. Default: 3, range: 1-10"
                    }
                }
            ]
        },
        {
            "name": "list_all",
            "description": {
                "zh": "列出所有已索引的工具包概览。返回每个工具包的名称、功能摘要、包含的工具函数列表及所需环境变量。适用于 AI 需要全局了解可用能力时调用。输出经过精简优化，不会消耗过多 token。",
                "en": "List overview of all indexed toolkits. Returns name, summary, tool list, and required env vars for each. Optimized for minimal token usage."
            },
            "parameters": [
                {
                    "name": "category",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按分类筛选，如 NETWORK / SEARCH / DEVELOPMENT / SYSTEM / MEDIA 等，留空返回全部",
                        "en": "Filter by category (NETWORK/SEARCH/DEVELOPMENT/SYSTEM/MEDIA). Empty for all."
                    }
                }
            ]
        },
        {
            "name": "get_toolkit_detail",
            "description": {
                "zh": "获取指定工具包的完整调用指南。返回详细信息包括：所有工具函数的名称与功能描述、每个参数的名称/类型/是否必填/默认值/说明、所需环境变量配置、标准调用格式示例。这是 AI 在确定使用某个工具包后、准备发起实际调用前必查的详情接口。",
                "en": "Get complete calling guide for a specific toolkit. Returns: all tool functions with descriptions, parameter specs (name/type/required/default/description), env vars, and calling format examples."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "工具包名称（即 METADATA 中的 name 字段，如 tavily_search、code_runner、baidumap_navigation）",
                        "en": "Toolkit package name (the 'name' field in METADATA, e.g., tavily_search, code_runner)"
                    }
                }
            ]
        },
        {
            "name": "rebuild_index",
            "description": {
                "zh": "强制重建索引。当工具包文件发生新增、删除或修改后，调用此接口刷新索引缓存和语义向量。通常无需手动调用——query 和 list_all 会自动检测变更并增量更新。仅在索引异常时使用。",
                "en": "Force rebuild the index. Call when toolkit files are added/removed/modified. Usually auto-detected — only use when index seems corrupted."
            },
            "parameters": []
        },
        {
            "name": "validate_format",
            "description": {
                "zh": "检查所有工具包的 METADATA 格式规范性。逐一扫描 examples 目录下每个 .js/.ts 文件，验证其 METADATA 块的完整性与合规性：必填字段是否存在、双语描述是否完整、参数类型是否合法、exports 导出是否与声明一致、是否存在硬编码密钥等安全风险。输出结构化报告，包含每个文件的通过/警告/错误状态，并提供具体修复建议。",
                "en": "Validate METADATA format compliance for all toolkits. Scans each .js/.ts file in the examples directory and checks: required fields presence, bilingual description completeness, parameter type validity, exports consistency with declarations, and hardcoded secret detection. Outputs a structured report with pass/warn/error status and fix suggestions for each file."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "指定单个工具包名称（文件名不含扩展名）进行检查。留空则检查全部工具包。",
                        "en": "Specify a single toolkit name (filename without extension) to check. Leave empty to check all toolkits."
                    }
                },
                {
                    "name": "level",
                    "type": "string",
                    "required": false,
                    "default": "all",
                    "description": {
                        "zh": "报告级别过滤：all（全部）/ error（仅错误）/ warn（错误+警告）",
                        "en": "Report level filter: all / error (errors only) / warn (errors + warnings)"
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试工具包索引服务连通性。验证硅基流动 Embedding API 密钥（SILICONFLOW_API_KEY）的有效性和网络可达性，返回配置状态诊断报告。适用于首次配置后的验证与故障排查。无需传入任何参数。",
                "en": "Test toolkit index service connectivity. Validates SiliconFlow Embedding API key (SILICONFLOW_API_KEY) validity and network reachability. Returns configuration status diagnostic report. No parameters needed."
            },
            "parameters": []
        }
    ]
}
*/

const TOOLKIT_INDEX = (function () {

    // ==========================================================================
    // 第一部分：配置常量
    // ==========================================================================

    const CONFIG = {
        DEFAULT_EXAMPLES_DIR: '/storage/emulated/0/Download/Operit/examples/',
        CACHE_DIR: '/storage/emulated/0/Download/Operit/examples/.toolkit_index_cache/',
        INDEX_FILE: 'index.json',
        VECTORS_FILE: 'vectors.json',
        FINGERPRINT_FILE: 'fingerprint.json',
        DEFAULT_BASE_URL: 'https://api.siliconflow.cn/v1',
        DEFAULT_EMBED_MODEL: 'BAAI/bge-m3',
        EMBED_BATCH_SIZE: 16,
        SIMILARITY_THRESHOLD: 0.35,
        SELF_NAME: 'toolkit_index',
        VALID_PARAM_TYPES: ['string', 'number', 'boolean', 'object', 'array'],
        VALID_CATEGORIES: ['AUTOMATIC', 'DRAW', 'CHAT', 'DEVELOPMENT', 'FILE', 'LIFE', 'MEDIA', 'MEMORY', 'NETWORK', 'SEARCH', 'SYSTEM', 'UTILITY', 'WORKFLOW', 'ADMIN'],
        SECRET_PATTERNS: [
            /sk-[a-zA-Z0-9]{20,}/,
            /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*['"][a-zA-Z0-9\-_]{16,}/,
            /[Tt]oken\s*[:=]\s*['"][a-zA-Z0-9\-_\.]{20,}/,
            /Bearer\s+[a-zA-Z0-9\-_\.]{30,}/
        ]
    };

    const httpClient = OkHttp.newClient();

    // ==========================================================================
    // 第二部分：环境变量与路径工具
    // ==========================================================================

    function getExamplesDir() {
        let dir = getEnv('TOOLKIT_EXAMPLES_DIR') || CONFIG.DEFAULT_EXAMPLES_DIR;
        if (!dir.endsWith('/')) dir += '/';
        return dir;
    }

    function getCacheDir() {
        return CONFIG.CACHE_DIR;
    }

    function getApiKey() {
        const key = getEnv('SILICONFLOW_API_KEY');
        if (!key || key.trim() === '') {
            throw new Error(
                '环境变量 SILICONFLOW_API_KEY 未配置。\n' +
                '请在 Operit 设置 → 环境变量 中添加硅基流动 API 密钥。\n' +
                '获取地址：https://siliconflow.cn'
            );
        }
        return key.trim();
    }

    function getEmbedModel() {
        return (getEnv('SILICONFLOW_EMBED_MODEL') || CONFIG.DEFAULT_EMBED_MODEL).trim();
    }

    function getBaseUrl() {
        let url = (getEnv('SILICONFLOW_BASE_URL') || CONFIG.DEFAULT_BASE_URL).trim();
        return url.replace(/\/+$/, '');
    }

    // ==========================================================================
    // 第三部分：文件系统操作封装
    // ==========================================================================

    async function ensureDir(dirPath) {
        try {
            const exists = await Tools.Files.exists(dirPath, 'android');
            if (!exists || !exists.exists) {
                await Tools.Files.mkdir(dirPath, true, 'android');
            }
        } catch (e) {
            try { await Tools.Files.mkdir(dirPath, true, 'android'); } catch (_) { }
        }
    }

    async function readJsonCache(fileName) {
        try {
            const filePath = getCacheDir() + fileName;
            const exists = await Tools.Files.exists(filePath, 'android');
            if (!exists || !exists.exists) return null;
            const content = await Tools.Files.read(filePath, 'android');
            if (!content || !content.content) return null;
            return JSON.parse(content.content);
        } catch (e) {
            console.error(`[ToolkitIndex] 读取缓存失败 ${fileName}: ${e.message}`);
            return null;
        }
    }

    async function writeJsonCache(fileName, data) {
        try {
            await ensureDir(getCacheDir());
            const filePath = getCacheDir() + fileName;
            await Tools.Files.write(filePath, JSON.stringify(data), false, 'android');
        } catch (e) {
            console.error(`[ToolkitIndex] 写入缓存失败 ${fileName}: ${e.message}`);
        }
    }

    // ==========================================================================
    // 第四部分：METADATA 解析引擎
    // ==========================================================================

    function extractMetadata(content) {
        const metaRegex = /\/\*\s*METADATA\s*\n([\s\S]*?)\*\//;
        const match = content.match(metaRegex);
        if (!match || !match[1]) return null;

        let rawMeta = match[1].trim();

        try {
            return JSON.parse(rawMeta);
        } catch (e) { }

        try {
            let normalized = rawMeta;
            normalized = normalized.replace(/^\s*\/\/.*$/gm, '');
            normalized = normalized.replace(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm, '"$1":');
            normalized = normalized.replace(/:\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/gm, function (match, val) {
                if (val === 'true' || val === 'false' || val === 'null') return match;
                return ': "' + val + '"';
            });
            normalized = normalized.replace(/,\s*([\]}])/g, '$1');
            return JSON.parse(normalized);
        } catch (e2) {
            console.error(`[ToolkitIndex] HJSON 解析失败: ${e2.message}`);
            return null;
        }
    }

    function getDesc(descObj) {
        if (!descObj) return '';
        if (typeof descObj === 'string') return descObj;
        return descObj.zh || descObj.en || '';
    }

    function normalizeMetadata(meta, fileName) {
        const entry = {
            name: meta.name || fileName.replace(/\.js$/, ''),
            fileName: fileName,
            version: meta.version || '1.0',
            description: getDesc(meta.description),
            description_en: (meta.description && meta.description.en) || '',
            category: meta.category || 'UTILITY',
            enabledByDefault: meta.enabledByDefault || false,
            author: meta.author || '',
            env: [],
            tools: []
        };

        if (Array.isArray(meta.env)) {
            entry.env = meta.env.map(function (e) {
                if (typeof e === 'string') {
                    return { name: e, description: '', required: false };
                }
                return {
                    name: e.name,
                    description: getDesc(e.description),
                    required: e.required || false
                };
            });
        }

        if (Array.isArray(meta.tools)) {
            entry.tools = meta.tools.map(function (tool) {
                const t = {
                    name: tool.name,
                    description: getDesc(tool.description),
                    description_en: (tool.description && tool.description.en) || '',
                    parameters: []
                };

                if (Array.isArray(tool.parameters)) {
                    t.parameters = tool.parameters.map(function (p) {
                        return {
                            name: p.name,
                            type: p.type || 'string',
                            required: p.required || false,
                            default: p.default !== undefined ? p.default : undefined,
                            description: getDesc(p.description)
                        };
                    });
                }

                return t;
            });
        }

        return entry;
    }

    // ==========================================================================
    // 第五部分：文件指纹与变更检测
    // ==========================================================================

    async function generateFingerprints() {
        const dir = getExamplesDir();
        const listing = await Tools.Files.list(dir, 'android');
        if (!listing || !Array.isArray(listing.entries)) {
            return {};
        }

        const fingerprints = {};
        listing.entries.forEach(function (entry) {
            if (entry.isDirectory) return;
            const name = entry.name;
            if (!name.endsWith('.js') && !name.endsWith('.ts')) return;
            if (name === 'toolkit_index.js' || name === 'toolkit_index.ts') return;
            if (name.startsWith('.') || name.startsWith('_')) return;
            fingerprints[name] = name + '|' + (entry.size || 0) + '|' + (entry.lastModified || '');
        });

        return fingerprints;
    }

    async function detectChanges(newFingerprints) {
        const oldFingerprints = await readJsonCache(CONFIG.FINGERPRINT_FILE) || {};

        const changes = { added: [], modified: [], removed: [], unchanged: [] };

        Object.keys(newFingerprints).forEach(function (name) {
            if (!oldFingerprints[name]) {
                changes.added.push(name);
            } else if (oldFingerprints[name] !== newFingerprints[name]) {
                changes.modified.push(name);
            } else {
                changes.unchanged.push(name);
            }
        });

        Object.keys(oldFingerprints).forEach(function (name) {
            if (!newFingerprints[name]) {
                changes.removed.push(name);
            }
        });

        return changes;
    }

    // ==========================================================================
    // 第六部分：嵌入向量引擎
    // ==========================================================================

    function buildEmbeddingText(toolkitEntry, tool) {
        const parts = [];
        parts.push('工具包:' + toolkitEntry.name);
        if (toolkitEntry.description) parts.push('包功能:' + toolkitEntry.description);
        if (toolkitEntry.category) parts.push('分类:' + toolkitEntry.category);
        parts.push('工具:' + tool.name);
        if (tool.description) parts.push('功能:' + tool.description);

        if (tool.parameters && tool.parameters.length > 0) {
            const paramDescs = tool.parameters.map(function (p) {
                return p.name + '(' + (p.description || p.type) + ')';
            });
            parts.push('参数:' + paramDescs.join(','));
        }

        if (tool.description_en) parts.push(tool.description_en);
        return parts.join(' | ');
    }

    async function callEmbeddingApi(texts) {
        if (!texts || texts.length === 0) return [];

        const apiKey = getApiKey();
        const model = getEmbedModel();
        const baseUrl = getBaseUrl();
        const allEmbeddings = [];

        for (let i = 0; i < texts.length; i += CONFIG.EMBED_BATCH_SIZE) {
            const batch = texts.slice(i, i + CONFIG.EMBED_BATCH_SIZE);
            const requestBody = {
                model: model,
                input: batch,
                encoding_format: 'float'
            };

            const response = await httpClient
                .newRequest()
                .url(baseUrl + '/embeddings')
                .method('POST')
                .headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                })
                .body(JSON.stringify(requestBody), 'json')
                .build()
                .execute();

            if (!response.isSuccessful()) {
                throw new Error(
                    '嵌入 API 请求失败 (HTTP ' + response.statusCode + '): ' +
                    (response.content || '').substring(0, 300)
                );
            }

            const data = JSON.parse(response.content);
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('嵌入 API 返回格式异常: ' + (response.content || '').substring(0, 200));
            }

            const sorted = data.data.sort(function (a, b) { return a.index - b.index; });
            sorted.forEach(function (item) { allEmbeddings.push(item.embedding); });
        }

        return allEmbeddings;
    }

    function cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        if (denominator === 0) return 0;
        return dotProduct / denominator;
    }

    // ==========================================================================
    // 第七部分：索引构建与更新核心
    // ==========================================================================

    async function buildIndex(forceRebuild) {
        const dir = getExamplesDir();
        const newFingerprints = await generateFingerprints();
        const fileNames = Object.keys(newFingerprints);

        if (fileNames.length === 0) {
            return { index: {}, vectors: { entries: [], embeddings: [] }, stats: { total: 0, scanned: 0, cached: 0 } };
        }

        let changes;
        if (forceRebuild) {
            changes = { added: fileNames, modified: [], removed: [], unchanged: [] };
        } else {
            changes = await detectChanges(newFingerprints);
        }

        const hasChanges = changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0;

        if (!hasChanges) {
            const cachedIndex = await readJsonCache(CONFIG.INDEX_FILE);
            const cachedVectors = await readJsonCache(CONFIG.VECTORS_FILE);
            if (cachedIndex && cachedVectors) {
                return {
                    index: cachedIndex,
                    vectors: cachedVectors,
                    stats: { total: Object.keys(cachedIndex).length, scanned: 0, cached: Object.keys(cachedIndex).length, fromCache: true }
                };
            }
            changes.added = fileNames;
            changes.unchanged = [];
        }

        let existingIndex = {};
        let existingVectors = { entries: [], embeddings: [] };
        if (!forceRebuild) {
            existingIndex = await readJsonCache(CONFIG.INDEX_FILE) || {};
            existingVectors = await readJsonCache(CONFIG.VECTORS_FILE) || { entries: [], embeddings: [] };
        }

        changes.removed.forEach(function (fileName) {
            const pkgName = fileName.replace(/\.(js|ts)$/, '');
            delete existingIndex[pkgName];
        });

        const removedAndModified = changes.removed.concat(changes.modified);
        if (removedAndModified.length > 0 && existingVectors.entries) {
            const keepIndices = [];
            existingVectors.entries.forEach(function (entry, idx) {
                const shouldRemove = removedAndModified.some(function (fn) { return entry.fileName === fn; });
                if (!shouldRemove) keepIndices.push(idx);
            });
            existingVectors.entries = keepIndices.map(function (i) { return existingVectors.entries[i]; });
            existingVectors.embeddings = keepIndices.map(function (i) { return existingVectors.embeddings[i]; });
        }

        const filesToProcess = changes.added.concat(changes.modified);
        const newVectorEntries = [];
        const newVectorTexts = [];

        for (let i = 0; i < filesToProcess.length; i++) {
            const fileName = filesToProcess[i];
            try {
                const fileContent = await Tools.Files.read(dir + fileName, 'android');
                if (!fileContent || !fileContent.content) continue;

                const meta = extractMetadata(fileContent.content);
                if (!meta || !meta.name) continue;
                if (meta.name === CONFIG.SELF_NAME) continue;

                const entry = normalizeMetadata(meta, fileName);
                existingIndex[entry.name] = entry;

                entry.tools.forEach(function (tool) {
                    const embedText = buildEmbeddingText(entry, tool);
                    newVectorEntries.push({ toolkitName: entry.name, toolName: tool.name, fileName: fileName, text: embedText });
                    newVectorTexts.push(embedText);
                });
            } catch (e) {
                console.error('[ToolkitIndex] 解析文件失败 ' + fileName + ': ' + e.message);
            }
        }

        let newEmbeddings = [];
        if (newVectorTexts.length > 0) {
            try {
                newEmbeddings = await callEmbeddingApi(newVectorTexts);
            } catch (e) {
                console.error('[ToolkitIndex] 嵌入 API 调用失败: ' + e.message);
                newEmbeddings = newVectorTexts.map(function () { return null; });
            }
        }

        const finalVectors = {
            entries: existingVectors.entries.concat(newVectorEntries),
            embeddings: existingVectors.embeddings.concat(newEmbeddings)
        };

        await writeJsonCache(CONFIG.INDEX_FILE, existingIndex);
        await writeJsonCache(CONFIG.VECTORS_FILE, finalVectors);
        await writeJsonCache(CONFIG.FINGERPRINT_FILE, newFingerprints);

        return {
            index: existingIndex,
            vectors: finalVectors,
            stats: {
                total: Object.keys(existingIndex).length,
                scanned: filesToProcess.length,
                cached: changes.unchanged.length,
                added: changes.added.length,
                modified: changes.modified.length,
                removed: changes.removed.length
            }
        };
    }

    // ==========================================================================
    // 第八部分：关键词降级搜索
    // ==========================================================================

    function keywordSearch(intent, index, topK) {
        const keywords = intent.toLowerCase().split(/[\s,，。、；;：:！!？?]+/).filter(function (w) { return w.length > 0; });
        const scores = [];

        Object.keys(index).forEach(function (pkgName) {
            const pkg = index[pkgName];
            pkg.tools.forEach(function (tool) {
                let score = 0;
                const searchText = (
                    pkg.name + ' ' + pkg.description + ' ' + pkg.description_en + ' ' +
                    pkg.category + ' ' + tool.name + ' ' + tool.description + ' ' +
                    tool.description_en + ' ' +
                    tool.parameters.map(function (p) { return p.name + ' ' + p.description; }).join(' ')
                ).toLowerCase();

                keywords.forEach(function (kw) {
                    if (searchText.indexOf(kw) !== -1) {
                        score += 1;
                        if (pkg.name.toLowerCase().indexOf(kw) !== -1) score += 2;
                        if (tool.name.toLowerCase().indexOf(kw) !== -1) score += 2;
                    }
                });

                if (score > 0) {
                    scores.push({ toolkitName: pkg.name, toolName: tool.name, score: score / keywords.length, matchType: 'keyword' });
                }
            });
        });

        scores.sort(function (a, b) { return b.score - a.score; });
        return scores.slice(0, topK);
    }

    // ==========================================================================
    // 第九部分：结果格式化器
    // ==========================================================================

    function formatToolCallingGuide(toolkitEntry, tool) {
        const lines = [];
        lines.push('## ' + toolkitEntry.name + '.' + tool.name);
        lines.push('');
        lines.push('**功能**: ' + tool.description);
        lines.push('**所属工具包**: ' + toolkitEntry.name + ' (v' + toolkitEntry.version + ')');

        if (toolkitEntry.env.length > 0) {
            const requiredEnvs = toolkitEntry.env.filter(function (e) { return e.required; });
            if (requiredEnvs.length > 0) {
                lines.push('**需要环境变量**: ' + requiredEnvs.map(function (e) { return e.name; }).join(', '));
            }
        }

        if (!toolkitEntry.enabledByDefault) {
            lines.push('**启用方式**: 需先调用 `use_package("' + toolkitEntry.name + '")` 启用');
        } else {
            lines.push('**启用方式**: 默认启用，无需 use_package');
        }

        lines.push('');
        lines.push('### 调用参数');
        lines.push('');

        if (tool.parameters.length === 0) {
            lines.push('无参数，直接调用即可。');
        } else {
            tool.parameters.forEach(function (p) {
                let paramLine = '- **' + p.name + '** (`' + p.type + '`';
                paramLine += p.required ? ', 必填' : ', 可选';
                if (p.default !== undefined) paramLine += ', 默认: `' + JSON.stringify(p.default) + '`';
                paramLine += '): ' + p.description;
                lines.push(paramLine);
            });
        }

        lines.push('');
        lines.push('### 调用示例');
        lines.push('```');
        lines.push('工具名: ' + tool.name);

        if (tool.parameters.length > 0) {
            lines.push('参数: {');
            tool.parameters.forEach(function (p, idx) {
                let exampleValue = '';
                if (p.default !== undefined) {
                    exampleValue = JSON.stringify(p.default);
                } else if (p.type === 'string') {
                    exampleValue = '"<' + p.name + '>"';
                } else if (p.type === 'number') {
                    exampleValue = '10';
                } else if (p.type === 'boolean') {
                    exampleValue = 'true';
                } else {
                    exampleValue = '"<' + p.name + '>"';
                }
                const comma = idx < tool.parameters.length - 1 ? ',' : '';
                const tag = p.required ? '  // 必填' : '  // 可选';
                lines.push('  "' + p.name + '": ' + exampleValue + comma + tag);
            });
            lines.push('}');
        }
        lines.push('```');

        return lines.join('\n');
    }

    function formatToolkitOverview(toolkitEntry) {
        const toolNames = toolkitEntry.tools.map(function (t) { return t.name; }).join(', ');
        const envInfo = toolkitEntry.env.length > 0
            ? ' [需要: ' + toolkitEntry.env.filter(function (e) { return e.required; }).map(function (e) { return e.name; }).join(',') + ']'
            : '';
        const autoEnabled = toolkitEntry.enabledByDefault ? ' ⚡' : '';

        return '**' + toolkitEntry.name + '**' + autoEnabled + envInfo +
            '\n  ' + toolkitEntry.description.substring(0, 80) +
            (toolkitEntry.description.length > 80 ? '...' : '') +
            '\n  工具: ' + toolNames;
    }

    function formatToolkitDetail(toolkitEntry) {
        const lines = [];
        lines.push('# 工具包详情: ' + toolkitEntry.name);
        lines.push('');
        lines.push('**版本**: ' + toolkitEntry.version);
        lines.push('**分类**: ' + toolkitEntry.category);
        lines.push('**描述**: ' + toolkitEntry.description);
        if (toolkitEntry.author) lines.push('**作者**: ' + toolkitEntry.author);
        lines.push('**默认启用**: ' + (toolkitEntry.enabledByDefault ? '是' : '否（需 use_package 启用）'));
        lines.push('**文件**: ' + toolkitEntry.fileName);

        if (toolkitEntry.env.length > 0) {
            lines.push('');
            lines.push('## 环境变量配置');
            toolkitEntry.env.forEach(function (e) {
                lines.push('- **' + e.name + '**' + (e.required ? ' (必填)' : ' (可选)') + ': ' + e.description);
            });
        }

        lines.push('');
        lines.push('## 工具函数 (' + toolkitEntry.tools.length + ' 个)');

        toolkitEntry.tools.forEach(function (tool) {
            lines.push('');
            lines.push('---');
            lines.push('');
            lines.push(formatToolCallingGuide(toolkitEntry, tool));
        });

        return lines.join('\n');
    }

    // ==========================================================================
    // 第十部分：对外公开接口实现
    // ==========================================================================

    async function queryHandler(params) {
        const intent = params.intent;
        if (!intent || intent.trim() === '') {
            throw new Error("参数 'intent' 不能为空。请描述您想要完成的任务。");
        }

        const topK = Math.min(Math.max(parseInt(String(params.top_k || 3), 10) || 3, 1), 10);
        const { index, vectors, stats } = await buildIndex(false);

        if (Object.keys(index).length === 0) {
            return {
                success: true,
                message: '索引为空，未找到任何工具包。请确认工具包目录路径是否正确。',
                data: { results: [], stats: stats }
            };
        }

        let results = [];
        let searchMethod = 'keyword';

        if (vectors.embeddings && vectors.embeddings.length > 0 && vectors.embeddings[0] !== null) {
            try {
                const queryEmbeddings = await callEmbeddingApi([intent]);
                if (queryEmbeddings.length > 0) {
                    const queryVec = queryEmbeddings[0];
                    const similarities = [];

                    vectors.entries.forEach(function (entry, idx) {
                        const embedding = vectors.embeddings[idx];
                        if (!embedding) return;
                        const sim = cosineSimilarity(queryVec, embedding);
                        if (sim >= CONFIG.SIMILARITY_THRESHOLD) {
                            similarities.push({ toolkitName: entry.toolkitName, toolName: entry.toolName, score: Math.round(sim * 1000) / 1000, matchType: 'semantic' });
                        }
                    });

                    similarities.sort(function (a, b) { return b.score - a.score; });
                    results = similarities.slice(0, topK);
                    searchMethod = 'semantic';
                }
            } catch (e) {
                console.error('[ToolkitIndex] 语义搜索失败，降级为关键词搜索: ' + e.message);
            }
        }

        if (results.length === 0) {
            results = keywordSearch(intent, index, topK);
            searchMethod = results.length > 0 ? 'keyword' : 'none';
        }

        const enrichedResults = results.map(function (r) {
            const pkg = index[r.toolkitName];
            if (!pkg) return r;
            const tool = pkg.tools.find(function (t) { return t.name === r.toolName; });
            if (!tool) return r;

            return {
                toolkit: r.toolkitName,
                tool: r.toolName,
                score: r.score,
                matchType: r.matchType,
                needsActivation: !pkg.enabledByDefault,
                activationCommand: pkg.enabledByDefault ? null : 'use_package("' + pkg.name + '")',
                callingGuide: formatToolCallingGuide(pkg, tool)
            };
        });

        return {
            success: true,
            message: '找到 ' + enrichedResults.length + ' 个匹配结果 (搜索方式: ' + searchMethod + ')',
            data: { results: enrichedResults, searchMethod: searchMethod, stats: stats }
        };
    }

    async function listAllHandler(params) {
        const { index, stats } = await buildIndex(false);
        const category = params.category ? params.category.toUpperCase().trim() : '';

        const entries = Object.keys(index).map(function (name) { return index[name]; });
        const filtered = category
            ? entries.filter(function (e) { return e.category.toUpperCase() === category; })
            : entries;

        const groups = {};
        filtered.forEach(function (entry) {
            const cat = entry.category || 'UTILITY';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(entry);
        });

        const lines = [];
        lines.push('# 工具包索引 (共 ' + filtered.length + ' 个' + (category ? ', 分类: ' + category : '') + ')');
        lines.push('');
        lines.push('> ⚡ = 默认启用 | 其他需先 use_package 启用');
        lines.push('');

        const categoryOrder = Object.keys(groups).sort();
        categoryOrder.forEach(function (cat) {
            lines.push('## ' + cat);
            lines.push('');
            groups[cat].forEach(function (entry) {
                lines.push(formatToolkitOverview(entry));
                lines.push('');
            });
        });

        const totalTools = filtered.reduce(function (sum, e) { return sum + e.tools.length; }, 0);
        lines.push('---');
        lines.push('共 ' + filtered.length + ' 个工具包, ' + totalTools + ' 个工具函数');

        return {
            success: true,
            message: '已列出 ' + filtered.length + ' 个工具包',
            data: lines.join('\n')
        };
    }

    async function getToolkitDetailHandler(params) {
        const name = params.toolkit_name;
        if (!name || name.trim() === '') {
            throw new Error("参数 'toolkit_name' 不能为空。请提供工具包名称，如 'tavily_search'。");
        }

        const { index } = await buildIndex(false);
        const entry = index[name.trim()];

        if (!entry) {
            const allNames = Object.keys(index);
            const suggestions = allNames.filter(function (n) {
                return n.indexOf(name.trim().toLowerCase()) !== -1 || name.trim().toLowerCase().indexOf(n) !== -1;
            });

            let msg = '未找到工具包: ' + name;
            if (suggestions.length > 0) {
                msg += '\n\n你是否在找: ' + suggestions.join(', ') + ' ?';
            } else {
                msg += '\n\n可用的工具包: ' + allNames.join(', ');
            }
            throw new Error(msg);
        }

        return {
            success: true,
            message: '已获取工具包 ' + name + ' 的详细信息',
            data: formatToolkitDetail(entry)
        };
    }

    async function rebuildIndexHandler(params) {
        const { index, stats } = await buildIndex(true);

        const toolkitCount = Object.keys(index).length;
        const toolCount = Object.keys(index).reduce(function (sum, name) {
            return sum + index[name].tools.length;
        }, 0);

        return {
            success: true,
            message: '索引重建完成',
            data: {
                summary: '已索引 ' + toolkitCount + ' 个工具包, ' + toolCount + ' 个工具函数',
                details: stats,
                toolkits: Object.keys(index)
            }
        };
    }

    // ==========================================================================
    // 第十一部分：格式验证引擎
    // ==========================================================================

    function validateMetadataFields(meta, fileContent, fileName) {
        const issues = [];
        const baseName = fileName.replace(/\.(js|ts)$/, '');

        function addIssue(level, field, message, suggestion) {
            issues.push({ level: level, field: field, message: message, suggestion: suggestion || '' });
        }

        // --- 顶层必填字段 ---
        if (!meta.name) {
            addIssue('error', 'name', '缺少必填字段 name', '添加 "name": "' + baseName + '"');
        } else {
            if (!/^[a-z][a-z0-9_]*$/.test(meta.name)) {
                addIssue('warn', 'name', 'name 命名不规范（应为小写字母+下划线）', '改为: "' + meta.name.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '"');
            }
            if (meta.name !== baseName) {
                addIssue('warn', 'name', 'name "' + meta.name + '" 与文件名 "' + baseName + '" 不一致', '建议保持 name 与文件名一致');
            }
        }

        if (!meta.description) {
            addIssue('error', 'description', '缺少必填字段 description', '添加中英双语描述对象 {"zh": "...", "en": "..."}');
        } else if (typeof meta.description === 'object') {
            if (!meta.description.zh) addIssue('warn', 'description.zh', '缺少中文描述', '添加 "zh" 字段');
            if (!meta.description.en) addIssue('warn', 'description.en', '缺少英文描述', '添加 "en" 字段');
        }

        if (!meta.tools || !Array.isArray(meta.tools)) {
            addIssue('error', 'tools', '缺少必填字段 tools（工具列表）', '添加 "tools": [] 数组');
        } else if (meta.tools.length === 0) {
            addIssue('warn', 'tools', 'tools 数组为空，该工具包没有任何工具函数', '至少声明一个工具');
        }

        // --- 顶层建议字段 ---
        if (!meta.version) {
            addIssue('info', 'version', '未声明 version 字段', '添加 "version": "1.0"');
        } else if (!/^\d+(\.\d+)*$/.test(String(meta.version))) {
            addIssue('warn', 'version', 'version 格式不标准（应为 "1.0" 或 "1.2.3"）', '改为纯数字版本号');
        }

        if (!meta.author) {
            addIssue('info', 'author', '未声明 author 字段', '添加 "author": "Your Name"');
        }

        if (!meta.category) {
            addIssue('info', 'category', '未声明 category 字段，将使用默认值 UTILITY', '添加 "category": "NETWORK" / "SEARCH" / "DEVELOPMENT" 等分类');
        } else if (CONFIG.VALID_CATEGORIES.indexOf(meta.category.toUpperCase()) === -1) {
            addIssue('warn', 'category', 'category "' + meta.category + '" 不在已知分类列表中', '推荐分类: ' + CONFIG.VALID_CATEGORIES.join(' / '));
        }

        if (meta.display_name && typeof meta.display_name === 'object') {
            if (!meta.display_name.zh) addIssue('info', 'display_name.zh', 'display_name 缺少中文', '添加 "zh" 字段');
            if (!meta.display_name.en) addIssue('info', 'display_name.en', 'display_name 缺少英文', '添加 "en" 字段');
        }

        // --- env 字段检查 ---
        if (Array.isArray(meta.env)) {
            meta.env.forEach(function (envItem, idx) {
                const prefix = 'env[' + idx + ']';
                if (typeof envItem === 'string') return;

                if (!envItem.name) {
                    addIssue('error', prefix + '.name', '环境变量条目缺少 name 字段', '添加 "name": "YOUR_ENV_VAR"');
                } else {
                    if (!/^[A-Z][A-Z0-9_]*$/.test(envItem.name)) {
                        addIssue('warn', prefix + '.name', '环境变量名 "' + envItem.name + '" 应为 UPPER_CASE 格式', '改为: "' + envItem.name.toUpperCase() + '"');
                    }
                }

                if (envItem.required === undefined || envItem.required === null) {
                    addIssue('warn', prefix + '.required', '环境变量未声明 required 字段', '添加 "required": true 或 false');
                }

                if (!envItem.description) {
                    addIssue('info', prefix + '.description', '环境变量缺少描述', '添加 description 说明用途');
                } else if (typeof envItem.description === 'object') {
                    if (!envItem.description.zh) addIssue('info', prefix + '.description.zh', '环境变量描述缺少中文', '添加 "zh" 字段');
                    if (!envItem.description.en) addIssue('info', prefix + '.description.en', '环境变量描述缺少英文', '添加 "en" 字段');
                }
            });
        }

        // --- tools 工具列表深度检查 ---
        if (Array.isArray(meta.tools)) {
            const toolNames = [];

            meta.tools.forEach(function (tool, tIdx) {
                const tPrefix = 'tools[' + tIdx + ']';

                if (!tool.name) {
                    addIssue('error', tPrefix + '.name', '工具缺少 name 字段', '添加 "name": "tool_function_name"');
                } else {
                    if (!/^[a-z][a-z0-9_]*$/.test(tool.name)) {
                        addIssue('warn', tPrefix + '.name', '工具名 "' + tool.name + '" 应为小写字母+下划线格式', '改为: ' + tool.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                    }
                    if (toolNames.indexOf(tool.name) !== -1) {
                        addIssue('error', tPrefix + '.name', '工具名 "' + tool.name + '" 重复声明', '每个工具名必须唯一');
                    }
                    toolNames.push(tool.name || '');
                }

                if (!tool.description) {
                    addIssue('error', tPrefix + '.description', '工具 "' + (tool.name || tIdx) + '" 缺少 description', '添加双语描述对象');
                } else if (typeof tool.description === 'object') {
                    if (!tool.description.zh) addIssue('warn', tPrefix + '.description.zh', '工具 "' + tool.name + '" 缺少中文描述', '添加 "zh" 字段');
                    if (!tool.description.en) addIssue('warn', tPrefix + '.description.en', '工具 "' + tool.name + '" 缺少英文描述', '添加 "en" 字段');
                }

                if (!tool.parameters) {
                    addIssue('error', tPrefix + '.parameters', '工具 "' + (tool.name || tIdx) + '" 缺少 parameters 字段', '无参数时设为空数组 []');
                } else if (!Array.isArray(tool.parameters)) {
                    addIssue('error', tPrefix + '.parameters', '工具 "' + (tool.name || tIdx) + '" 的 parameters 不是数组', '改为数组格式 []');
                } else {
                    tool.parameters.forEach(function (param, pIdx) {
                        const pPrefix = tPrefix + '.parameters[' + pIdx + ']';

                        if (!param.name) {
                            addIssue('error', pPrefix + '.name', '参数缺少 name 字段', '添加 "name": "param_name"');
                        }

                        if (!param.type) {
                            addIssue('warn', pPrefix + '.type', '参数 "' + (param.name || pIdx) + '" 缺少 type 字段', '添加 "type": "string"（可选值: string/number/boolean/object/array）');
                        } else if (CONFIG.VALID_PARAM_TYPES.indexOf(param.type.toLowerCase()) === -1) {
                            addIssue('warn', pPrefix + '.type', '参数 "' + param.name + '" 的 type "' + param.type + '" 不合法', '合法类型: ' + CONFIG.VALID_PARAM_TYPES.join(' / '));
                        }

                        if (param.required === undefined || param.required === null) {
                            addIssue('warn', pPrefix + '.required', '参数 "' + (param.name || pIdx) + '" 未声明 required 字段', '添加 "required": true 或 false');
                        }

                        if (!param.description) {
                            addIssue('warn', pPrefix + '.description', '参数 "' + (param.name || pIdx) + '" 缺少 description', '添加参数用途说明');
                        } else if (typeof param.description === 'object') {
                            if (!param.description.zh) addIssue('info', pPrefix + '.description.zh', '参数描述缺少中文', '添加 "zh" 字段');
                            if (!param.description.en) addIssue('info', pPrefix + '.description.en', '参数描述缺少英文', '添加 "en" 字段');
                        }
                    });
                }

                // 检查 exports 声明（非 advice 工具必须有对应 export）
                if (!tool.advice && tool.name) {
                    const exportPattern = new RegExp('exports\\s*\\.\\s*' + tool.name + '\\s*=|exports\\s*\\[\\s*[\'"]' + tool.name + '[\'"]\\s*\\]\\s*=');
                    if (!exportPattern.test(fileContent)) {
                        addIssue('error', tPrefix + '.exports', '工具 "' + tool.name + '" 在 METADATA 中声明但未找到 exports.' + tool.name + ' 导出', '在文件末尾添加: exports.' + tool.name + ' = ' + tool.name + 'Handler;');
                    }
                }
            });
        }

        // --- 安全检查：硬编码密钥检测 ---
        CONFIG.SECRET_PATTERNS.forEach(function (pattern) {
            if (pattern.test(fileContent)) {
                addIssue('error', 'security', '疑似存在硬编码密钥/Token', '将敏感信息移至环境变量，通过 getEnv("YOUR_KEY") 获取');
            }
        });

        return issues;
    }

    async function validateFormatHandler(params) {
        const targetName = params.toolkit_name ? params.toolkit_name.trim() : '';
        const level = (params.level || 'all').toLowerCase();
        const validLevels = ['all', 'error', 'warn'];
        const filterLevel = validLevels.indexOf(level) !== -1 ? level : 'all';

        const dir = getExamplesDir();

        // 获取文件列表
        let listing;
        try {
            listing = await Tools.Files.list(dir, 'android');
        } catch (e) {
            throw new Error('无法读取工具包目录 "' + dir + '": ' + e.message);
        }

        if (!listing || !Array.isArray(listing.entries)) {
            throw new Error('工具包目录为空或不可访问: ' + dir);
        }

        // 筛选目标文件
        let targetFiles = listing.entries.filter(function (entry) {
            if (entry.isDirectory) return false;
            const name = entry.name;
            if (!name.endsWith('.js') && !name.endsWith('.ts')) return false;
            if (name.startsWith('.') || name.startsWith('_')) return false;
            if (name === 'toolkit_index.js' || name === 'toolkit_index.ts') return false;
            if (targetName) {
                const baseName = name.replace(/\.(js|ts)$/, '');
                return baseName === targetName;
            }
            return true;
        });

        if (targetName && targetFiles.length === 0) {
            throw new Error('未找到工具包文件: ' + targetName + '（在目录 ' + dir + ' 中）');
        }

        // 逐文件检查
        const fileResults = [];
        let totalErrors = 0;
        let totalWarns = 0;
        let totalPass = 0;

        for (let i = 0; i < targetFiles.length; i++) {
            const fileEntry = targetFiles[i];
            const fileName = fileEntry.name;
            const fileResult = {
                file: fileName,
                status: 'pass',
                meta_parseable: false,
                error_count: 0,
                warn_count: 0,
                info_count: 0,
                issues: []
            };

            try {
                const fileContent = await Tools.Files.read(dir + fileName, 'android');
                if (!fileContent || !fileContent.content) {
                    fileResult.status = 'error';
                    fileResult.issues.push({ level: 'error', field: 'file', message: '文件内容为空或无法读取', suggestion: '检查文件是否存在且有读取权限' });
                    fileResults.push(fileResult);
                    totalErrors++;
                    continue;
                }

                const content = fileContent.content;

                // 检查 METADATA 块是否存在
                const metaBlockRegex = /\/\*\s*METADATA\s*\n([\s\S]*?)\*\//;
                if (!metaBlockRegex.test(content)) {
                    fileResult.status = 'error';
                    fileResult.issues.push({ level: 'error', field: 'METADATA', message: '文件顶部未找到 /* METADATA ... */ 声明块', suggestion: '在文件第一行添加标准 METADATA 声明块' });
                    fileResults.push(fileResult);
                    totalErrors++;
                    continue;
                }

                // 尝试解析 METADATA
                const meta = extractMetadata(content);
                if (!meta) {
                    fileResult.status = 'error';
                    fileResult.issues.push({ level: 'error', field: 'METADATA', message: 'METADATA 解析失败，JSON 格式错误', suggestion: '检查 METADATA 中是否有语法错误，可使用 JSON 验证工具检查' });
                    fileResults.push(fileResult);
                    totalErrors++;
                    continue;
                }

                fileResult.meta_parseable = true;

                // 深度字段验证
                const issues = validateMetadataFields(meta, content, fileName);
                fileResult.issues = issues;
                fileResult.error_count = issues.filter(function (i) { return i.level === 'error'; }).length;
                fileResult.warn_count = issues.filter(function (i) { return i.level === 'warn'; }).length;
                fileResult.info_count = issues.filter(function (i) { return i.level === 'info'; }).length;

                if (fileResult.error_count > 0) {
                    fileResult.status = 'error';
                    totalErrors++;
                } else if (fileResult.warn_count > 0) {
                    fileResult.status = 'warn';
                    totalWarns++;
                } else {
                    fileResult.status = 'pass';
                    totalPass++;
                }

            } catch (e) {
                fileResult.status = 'error';
                fileResult.issues.push({ level: 'error', field: 'file', message: '读取文件时发生异常: ' + e.message, suggestion: '检查文件权限和路径' });
                totalErrors++;
            }

            fileResults.push(fileResult);
        }

        // 按状态排序：error → warn → pass
        const statusOrder = { error: 0, warn: 1, pass: 2 };
        fileResults.sort(function (a, b) { return statusOrder[a.status] - statusOrder[b.status]; });

        // 生成 Markdown 报告
        const lines = [];
        const totalFiles = fileResults.length;
        const passRate = totalFiles > 0 ? Math.round((totalPass / totalFiles) * 100) : 0;

        lines.push('# 🔍 工具包格式检查报告');
        lines.push('');
        lines.push('> 检查时间: ' + new Date().toLocaleString('zh-CN', { hour12: false }));
        lines.push('> 目录: `' + dir + '`');
        lines.push('');
        lines.push('## 📊 汇总');
        lines.push('');
        lines.push('| 指标 | 数值 |');
        lines.push('| :--- | ---: |');
        lines.push('| 检查文件总数 | ' + totalFiles + ' |');
        lines.push('| ✅ 通过 | ' + totalPass + ' |');
        lines.push('| ⚠️ 警告 | ' + totalWarns + ' |');
        lines.push('| ❌ 错误 | ' + totalErrors + ' |');
        lines.push('| 通过率 | ' + passRate + '% |');
        lines.push('');

        if (filterLevel === 'all' || filterLevel === 'error' || filterLevel === 'warn') {
            lines.push('## 📋 检查明细');
            lines.push('');

            fileResults.forEach(function (result) {
                // 级别过滤
                if (filterLevel === 'error' && result.status !== 'error') return;
                if (filterLevel === 'warn' && result.status === 'pass') return;

                const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
                lines.push('### ' + statusIcon + ' `' + result.file + '`');
                lines.push('');

                if (result.status === 'pass') {
                    lines.push('格式规范，无需修改。');
                    lines.push('');
                    return;
                }

                if (result.issues.length > 0) {
                    lines.push('| 级别 | 字段 | 问题 | 修复建议 |');
                    lines.push('| :---: | :--- | :--- | :--- |');

                    result.issues.forEach(function (issue) {
                        if (filterLevel === 'error' && issue.level !== 'error') return;
                        if (filterLevel === 'warn' && issue.level === 'info') return;

                        const icon = issue.level === 'error' ? '❌' : issue.level === 'warn' ? '⚠️' : 'ℹ️';
                        const msg = issue.message.replace(/\|/g, '\\|');
                        const sug = (issue.suggestion || '-').replace(/\|/g, '\\|');
                        const field = (issue.field || '-').replace(/\|/g, '\\|');
                        lines.push('| ' + icon + ' | `' + field + '` | ' + msg + ' | ' + sug + ' |');
                    });
                }

                lines.push('');
            });
        }

        // 优秀工具包展示
        if (totalPass > 0 && filterLevel === 'all') {
            const passFiles = fileResults.filter(function (r) { return r.status === 'pass'; });
            lines.push('## 🏆 格式规范的工具包');
            lines.push('');
            lines.push(passFiles.map(function (r) { return '`' + r.file.replace(/\.(js|ts)$/, '') + '`'; }).join('  '));
            lines.push('');
        }

        lines.push('---');
        lines.push('*由 toolkit_index v1.0 格式验证引擎生成*');

        return {
            success: true,
            message: '格式检查完成：' + totalFiles + ' 个文件，通过 ' + totalPass + '，警告 ' + totalWarns + '，错误 ' + totalErrors,
            data: lines.join('\n'),
            meta: {
                total: totalFiles,
                pass: totalPass,
                warn: totalWarns,
                error: totalErrors,
                pass_rate: passRate
            }
        };
    }

    // ==========================================================================
    // 第十二部分：连通性测试
    // ==========================================================================

    async function testHandler(params) {
        const apiKey = getEnv('SILICONFLOW_API_KEY');
        const keyConfigured = !!(apiKey && apiKey.trim() !== '');
        const baseUrl = getBaseUrl();
        const baseUrlEnv = getEnv('SILICONFLOW_BASE_URL');
        const baseUrlConfigured = !!(baseUrlEnv && baseUrlEnv.trim() !== '');
        const model = getEmbedModel();
        const modelEnv = getEnv('SILICONFLOW_EMBED_MODEL');
        const modelConfigured = !!(modelEnv && modelEnv.trim() !== '');

        const report = [];
        report.push('## 🔧 工具包索引服务连通性诊断\n');
        report.push('> 测试时间: ' + new Date().toLocaleString('zh-CN', { hour12: false }) + '\n');
        report.push('| 配置项 | 状态 | 值 |');
        report.push('| :--- | :--- | :--- |');
        report.push('| API 密钥 | ' + (keyConfigured ? '✅ 已配置' : '❌ 未配置') + ' | ' +
            (keyConfigured ? apiKey.trim().substring(0, 8) + '***' : '未配置') + ' |');
        report.push('| 基础地址 | ' + (baseUrlConfigured ? '✅ 已配置' : '⚪ 使用默认') + ' | ' + baseUrl + ' |');
        report.push('| 嵌入模型 | ' + (modelConfigured ? '✅ 已配置' : '⚪ 使用默认') + ' | ' + model + ' |');

        if (!keyConfigured) {
            report.push('');
            report.push('> ⚠️ **SILICONFLOW_API_KEY 未配置**，语义搜索将降级为关键词匹配模式。');
            report.push('> 请在「设置 → 环境变量」中添加硅基流动 API 密钥（获取地址：https://siliconflow.cn）');
            return {
                success: false,
                message: 'SILICONFLOW_API_KEY 未配置，语义搜索功能不可用',
                data: report.join('\n')
            };
        }

        const startTime = Date.now();
        try {
            const response = await httpClient
                .newRequest()
                .url(baseUrl + '/embeddings')
                .method('POST')
                .headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey.trim()
                })
                .body(JSON.stringify({
                    model: model,
                    input: 'connectivity test',
                    encoding_format: 'float'
                }), 'json')
                .build()
                .execute();

            const latency = Date.now() - startTime;
            const statusCode = response.statusCode;

            if (response.isSuccessful()) {
                report.push('| API 连通性 | ✅ 正常 | HTTP ' + statusCode + ' |');
                report.push('| 响应延迟 | ✅ ' + latency + ' ms | - |');
                return {
                    success: true,
                    message: '连通性测试通过，延迟 ' + latency + ' ms',
                    data: report.join('\n'),
                    meta: { latency_ms: latency }
                };
            } else {
                let errorMsg = 'HTTP ' + statusCode;
                try {
                    const errBody = JSON.parse(response.content || '{}');
                    errorMsg += ': ' + (errBody.message || errBody.error || errBody.detail || '');
                } catch (_) { }
                report.push('| API 连通性 | ❌ 失败 | ' + errorMsg + ' |');
                report.push('| 响应延迟 | - | ' + latency + ' ms |');
                return {
                    success: false,
                    message: 'API 连通性测试失败: ' + errorMsg,
                    data: report.join('\n')
                };
            }
        } catch (netErr) {
            const latency = Date.now() - startTime;
            report.push('| API 连通性 | ❌ 网络错误 | ' + netErr.message + ' |');
            report.push('| 响应延迟 | - | ' + latency + ' ms |');
            report.push('');
            report.push('> 💡 如在国内网络环境，建议配置 `SILICONFLOW_BASE_URL` 使用可访问的代理地址');
            return {
                success: false,
                message: '网络连接失败: ' + netErr.message,
                data: report.join('\n')
            };
        }
    }

    // ==========================================================================
    // 第十三部分：统一错误处理包装器
    // ==========================================================================

    async function wrapToolExecution(func, params, actionName) {
        try {
            const result = await func(params || {});
            complete(result);
        } catch (error) {
            console.error('[ToolkitIndex] ' + actionName + ' 失败: ' + error.message);
            complete({
                success: false,
                message: actionName + ' 失败: ' + error.message,
                error_stack: error.stack
            });
        }
    }

    // ==========================================================================
    // 暴露公开接口
    // ==========================================================================

    return {
        query: function (params) {
            return wrapToolExecution(queryHandler, params, '工具包语义搜索');
        },
        list_all: function (params) {
            return wrapToolExecution(listAllHandler, params, '工具包列表');
        },
        get_toolkit_detail: function (params) {
            return wrapToolExecution(getToolkitDetailHandler, params, '工具包详情查询');
        },
        rebuild_index: function (params) {
            return wrapToolExecution(rebuildIndexHandler, params, '索引重建');
        },
        validate_format: function (params) {
            return wrapToolExecution(validateFormatHandler, params, '格式检查');
        },
        test: function (params) {
            return wrapToolExecution(testHandler, params, '连通性测试');
        }
    };

})();

// ==============================================================================
// 模块导出（严格匹配 METADATA 中的工具名称）
// ==============================================================================
exports.query = TOOLKIT_INDEX.query;
exports.list_all = TOOLKIT_INDEX.list_all;
exports.get_toolkit_detail = TOOLKIT_INDEX.get_toolkit_detail;
exports.rebuild_index = TOOLKIT_INDEX.rebuild_index;
exports.validate_format = TOOLKIT_INDEX.validate_format;
exports.test = TOOLKIT_INDEX.test;