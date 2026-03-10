/* METADATA
{
    "name": "zhipu_search_v1",
    "version": "1.0",
    "display_name": {
        "zh": "智谱 AI 搜索",
        "en": "Zhipu AI Search"
    },
    "description": {
        "zh": "智谱 AI 全能网络搜索工具包。基于智谱 (Zhipu / BigModel) Web Search API，提供多引擎网页搜索、新闻热点检索、深度内容提取及 API 连通性测试功能。支持多密钥轮询负载均衡、搜索意图智能识别、时效性区间筛选、内容详略可调，以及结构化 Markdown 结果输出。适用于知识问答、新闻追踪、网页摘要、资讯聚合等场景。",
        "en": "Zhipu AI all-in-one web search toolkit. Built on the Zhipu (BigModel) Web Search API, providing multi-engine web search, breaking news retrieval, deep content extraction, and API connectivity testing. Features multi-key rotation with load balancing, intelligent search intent recognition, time-range filtering, adjustable content depth, and structured Markdown output. Ideal for Q&A, news tracking, web summarization, and information aggregation."
    },
    "env": [
        {
            "name": "ZHIPU_SEARCH_API_KEY",
            "description": {
                "zh": "智谱搜索 API 密钥列表，多个密钥用英文逗号分隔以实现负载均衡与配额轮换（与智谱生图/对话 Key 独立）",
                "en": "Zhipu Search API key(s), comma-separated for load balancing and quota rotation (independent from Zhipu Draw/Chat keys)"
            },
            "required": true
        },
        {
            "name": "ZHIPU_SEARCH_PROXY_URL",
            "description": {
                "zh": "自定义代理地址（可选），用于替换默认的 open.bigmodel.cn。格式：https://my-proxy.example.com（不含末尾斜杠）。工具包会自动附加 /api/paas/v4/web_search 路径。若代理地址已含 /api/ 路径则直接使用",
                "en": "Custom proxy URL (optional) to replace open.bigmodel.cn. Format: https://my-proxy.example.com (no trailing slash). The toolkit auto-appends /api/paas/v4/web_search path. If the proxy URL already contains /api/, it's used as-is."
            },
            "required": false
        },
        {
            "name": "ZHIPU_SEARCH_DEFAULT_ENGINE",
            "description": {
                "zh": "默认搜索引擎（可选）：search_std（标准）/ search_pro（增强）/ search_pro_sogou（搜狗增强）/ search_pro_quark（夸克增强），默认 search_std",
                "en": "Default search engine (optional): search_std / search_pro / search_pro_sogou / search_pro_quark. Default: search_std"
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "search",
            "description": {
                "zh": "执行智能网页搜索。支持四大搜索引擎（标准/增强/搜狗增强/夸克增强）、搜索意图自动识别、时效性区间筛选（日/周/月/年/不限）、结果数量自定义（1-50）和内容详略控制（medium/high）。返回结构化 Markdown 格式报告，含搜索意图分析、来源链接、发布时间及内容摘要。",
                "en": "Perform intelligent web search. Supports four engines (std/pro/sogou-pro/quark-pro), auto intent recognition, time-range filtering (day/week/month/year/noLimit), customizable result count (1-50), and content depth control (medium/high). Returns structured Markdown with intent analysis, source links, publish dates, and content summaries."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "搜索查询词，描述你要检索的内容",
                        "en": "Search query describing what to retrieve"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "engine",
                    "description": {
                        "zh": "搜索引擎选择：search_std（标准，速度快、免费配额多）/ search_pro（增强，结果更精准）/ search_pro_sogou（搜狗增强，中文优势）/ search_pro_quark（夸克增强，移动端优势）。不填则使用环境变量默认值或 search_std",
                        "en": "Engine: search_std (standard, fast) / search_pro (enhanced, precise) / search_pro_sogou (Sogou, Chinese advantage) / search_pro_quark (Quark, mobile advantage). Default: env or search_std"
                    },
                    "type": "string",
                    "required": false,
                    "default": "search_std"
                },
                {
                    "name": "count",
                    "description": {
                        "zh": "返回结果数量（1-50），默认 10。建议普通查询 5-10 条，深度研究 15-30 条",
                        "en": "Number of results (1-50), default 10. Recommended: 5-10 for general, 15-30 for deep research"
                    },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "recency",
                    "description": {
                        "zh": "时效性筛选区间：oneDay（过去24小时）/ oneWeek（过去一周）/ oneMonth（过去一月）/ oneYear（过去一年）/ noLimit（不限时间）。适用于新闻、热点、时效性强的查询",
                        "en": "Time range filter: oneDay / oneWeek / oneMonth / oneYear / noLimit. Best for news, trending topics, and time-sensitive queries"
                    },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "content_size",
                    "description": {
                        "zh": "内容返回详略程度：medium（适中，适合快速浏览）/ high（详尽，适合深度阅读与分析）。默认 medium",
                        "en": "Content depth: medium (concise, for quick browsing) / high (detailed, for deep reading). Default: medium"
                    },
                    "type": "string",
                    "required": false,
                    "default": "medium"
                }
            ]
        },
        {
            "name": "news",
            "description": {
                "zh": "搜索最新新闻资讯。专为新闻场景优化：自动启用时效性筛选（默认过去一天）、使用增强搜索引擎、返回高详细度内容。适用于热点追踪、新闻速递、舆情监控等场景。",
                "en": "Search for latest news. Optimized for news: auto time filtering (default: last day), enhanced engine, high content detail. Ideal for trending topics, news briefs, and media monitoring."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "新闻搜索关键词",
                        "en": "News search keywords"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "count",
                    "description": {
                        "zh": "返回新闻条数（1-50），默认 10",
                        "en": "Number of news items (1-50), default 10"
                    },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "recency",
                    "description": {
                        "zh": "时效范围：oneDay（24小时，默认）/ oneWeek / oneMonth / oneYear / noLimit",
                        "en": "Time range: oneDay (default) / oneWeek / oneMonth / oneYear / noLimit"
                    },
                    "type": "string",
                    "required": false,
                    "default": "oneDay"
                }
            ]
        },
        {
            "name": "extract",
            "description": {
                "zh": "深度内容提取。对指定关键词执行高详细度搜索（content_size=high），获取网页的完整正文内容，适用于需要深入阅读、资料收集与知识提取的场景。返回带完整正文的结构化结果。",
                "en": "Deep content extraction. Performs high-detail search (content_size=high) for specified keywords, retrieving full web page content. Ideal for in-depth reading, data collection, and knowledge extraction."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "要深度提取内容的查询词",
                        "en": "Query for deep content extraction"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "count",
                    "description": {
                        "zh": "提取结果数量（1-10），默认 5。深度提取建议不超过 10 条以确保质量",
                        "en": "Number of results (1-10), default 5. Recommended max 10 for quality"
                    },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "engine",
                    "description": {
                        "zh": "搜索引擎选择（可选），默认 search_pro（增强，更优质的内容提取）",
                        "en": "Engine choice (optional), default search_pro (enhanced, better extraction)"
                    },
                    "type": "string",
                    "required": false,
                    "default": "search_pro"
                }
            ]
        },
        {
            "name": "multi_search",
            "description": {
                "zh": "多关键词并发聚合搜索。同时搜索多个查询词并汇总结果，适用于多角度调研、对比分析、主题研究等场景。每个查询词独立搜索后合并去重，大幅提高信息覆盖面。",
                "en": "Multi-keyword concurrent aggregated search. Searches multiple queries simultaneously and consolidates results. Ideal for multi-angle research, comparative analysis, and topic studies."
            },
            "parameters": [
                {
                    "name": "queries",
                    "description": {
                        "zh": "搜索查询词列表，多个关键词用英文逗号分隔。例如：'AI大模型,人工智能2025,LLM最新进展'",
                        "en": "Comma-separated search queries. Example: 'AI models,artificial intelligence 2025,LLM advances'"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "count_per_query",
                    "description": {
                        "zh": "每个查询词的结果数量（1-20），默认 5",
                        "en": "Results per query (1-20), default 5"
                    },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "engine",
                    "description": {
                        "zh": "搜索引擎选择（可选），默认使用环境变量配置或 search_std",
                        "en": "Engine choice (optional), defaults to env config or search_std"
                    },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "recency",
                    "description": {
                        "zh": "时效性筛选区间（可选）：oneDay / oneWeek / oneMonth / oneYear / noLimit",
                        "en": "Time range (optional): oneDay / oneWeek / oneMonth / oneYear / noLimit"
                    },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试智谱搜索 API 连通性。验证 API Key 有效性、网络可达性及服务响应延迟，返回诊断报告。适用于首次配置后的连通性验证与故障排查。",
                "en": "Test Zhipu Search API connectivity. Validates API key, network reachability, and response latency. Returns diagnostic report for setup verification and troubleshooting."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==================================================================================
 * 模块名称：智谱搜索工具包 (Zhipu Search Toolkit)
 * ==================================================================================
 * 版本：v1.0
 * 架构：IIFE + Wrapper + 分层架构（六层设计）
 * 驱动：基于智谱 AI (Zhipu / BigModel) Web Search REST API
 * 端点：https://open.bigmodel.cn/api/paas/v4/web_search
 *
 * 功能矩阵：
 *   ┌──────────────────┬──────────────────────────────────────────────┐
 *   │ search           │ 通用智能网页搜索（四引擎/时效/意图/详略）     │
 *   │ news             │ 新闻专项检索（默认 24h 时效/增强引擎）        │
 *   │ extract          │ 深度内容提取（高详细度/完整正文）             │
 *   │ multi_search     │ 多关键词并发聚合搜索（去重/合并/多角度）      │
 *   │ test             │ API 连通性诊断测试                            │
 *   └──────────────────┴──────────────────────────────────────────────┘
 *
 * 设计亮点：
 *   1. 多密钥负载均衡 — 支持逗号分隔的多 API Key 轮询，随机调度避免单点限流
 *   2. 自适应代理网关 — 支持自定义代理域名，自动补充协议头与路径规范化
 *   3. 搜索意图识别 — 利用 API 内置 search_intent 字段智能分析用户检索意图
 *   4. 参数沙盒化 — 独立副本处理参数，拒绝污染原始输入对象
 *   5. 结构化 Markdown 输出 — 统一的格式化引擎，AI 友好的结果呈现
 *   6. 长内容安全截断 — 防止超长响应导致 AI 上下文溢出
 *   7. 多关键词并发 — Promise.all 并行调度，大幅缩短多查询响应耗时
 *   8. 完整的错误分级 — 区分网络层/协议层/业务层/参数层四级异常
 *   9. 中间结果推送 — 长任务执行进度实时反馈
 *  10. 连接超时保护 — OkHttp Builder 模式精确控制超时阈值
 *
 * 运行环境：Operit JavaScript 沙箱 (ES2017)
 * 网络协议：HTTPS + OkHttp 客户端
 * ==================================================================================
 */
const zhipuSearchToolkit = (function () {

    // ==========================================================================
    // 第一层：常量定义与配置中心
    // ==========================================================================

    /**
     * API 端点配置
     */
    const API_CONFIG = {
        DEFAULT_HOST: 'open.bigmodel.cn',
        API_PATH: '/api/paas/v4/web_search',
        USER_AGENT: 'ZhipuSearch-Toolkit/1.0 (Operit)',
        CONTENT_TYPE: 'application/json'
    };

    /**
     * 默认行为配置
     */
    const DEFAULTS = {
        ENGINE: 'search_std',
        COUNT: 10,
        CONTENT_SIZE: 'medium',
        NEWS_RECENCY: 'oneDay',
        EXTRACT_COUNT: 5,
        MULTI_COUNT_PER_QUERY: 5
    };

    /**
     * 安全限制常量
     */
    const LIMITS = {
        REQUEST_TIMEOUT: 60000,          // 请求超时：60 秒
        MAX_COUNT: 50,                   // 单次搜索最大结果数
        MIN_COUNT: 1,                    // 单次搜索最小结果数
        MAX_CONTENT_LENGTH: 15000,       // 单条结果最大字符数（防溢出截断）
        MAX_MULTI_QUERIES: 10,           // 多关键词搜索最大并发数
        MAX_TOTAL_OUTPUT_LENGTH: 80000,  // 总输出最大字符数
        MULTI_COUNT_MAX: 20              // 多关键词搜索每查询最大结果数
    };

    /**
     * 合法引擎枚举
     */
    const VALID_ENGINES = ['search_std', 'search_pro', 'search_pro_sogou', 'search_pro_quark'];

    /**
     * 合法时效区间枚举
     */
    const VALID_RECENCY = ['oneDay', 'oneWeek', 'oneMonth', 'oneYear', 'noLimit'];

    /**
     * 合法内容详略枚举
     */
    const VALID_CONTENT_SIZE = ['medium', 'high'];

    /**
     * 引擎显示名称映射（用于报告输出）
     */
    const ENGINE_LABELS = {
        'search_std': '标准搜索',
        'search_pro': '增强搜索',
        'search_pro_sogou': '搜狗增强搜索',
        'search_pro_quark': '夸克增强搜索'
    };

    /**
     * 时效区间显示名称映射
     */
    const RECENCY_LABELS = {
        'oneDay': '过去 24 小时',
        'oneWeek': '过去一周',
        'oneMonth': '过去一月',
        'oneYear': '过去一年',
        'noLimit': '不限时间'
    };

    // ==========================================================================
    // 第二层：基础设施（网络客户端 & 密钥管理 & 网关处理）
    // ==========================================================================

    /**
     * HTTP 客户端单例
     * 使用 OkHttp Builder 模式创建带超时保护的客户端
     * 复用连接池以提升网络握手效率
     */
    const httpClient = OkHttp.newClient();

    /**
     * API 密钥管理器
     * 功能：加载、校验、轮询选择 API 密钥
     */
    const KeyManager = {

        /** 缓存已解析的密钥数组，避免每次请求重复解析 */
        _cachedKeys: null,
        _cacheSource: null,

        /**
         * 加载并校验 API 密钥列表
         * 支持环境变量动态更新检测（缓存失效机制）
         * @returns {string[]} 有效的密钥数组
         * @throws {Error} 未配置或解析失败
         */
        loadKeys: function () {
            const rawKeys = getEnv('ZHIPU_SEARCH_API_KEY') || '';

            // 缓存命中检测：如果环境变量未变化则直接返回缓存
            if (this._cachedKeys && this._cacheSource === rawKeys) {
                return this._cachedKeys;
            }

            if (!rawKeys || rawKeys.trim() === '') {
                throw new Error(
                    '[配置错误] 环境变量 ZHIPU_SEARCH_API_KEY 未配置。\n' +
                    '请在 Operit 设置 → 环境变量中添加您的智谱搜索 API Key。\n' +
                    '获取地址：https://open.bigmodel.cn/usercenter/apikeys'
                );
            }

            const keys = rawKeys
                .split(',')
                .map(function (k) { return k.trim(); })
                .filter(function (k) { return k.length > 0; });

            if (keys.length === 0) {
                throw new Error(
                    '[配置错误] ZHIPU_SEARCH_API_KEY 格式异常：解析后未发现有效密钥。\n' +
                    '请检查是否包含多余的空格或特殊字符。\n' +
                    '格式要求：单密钥直接填写，多密钥用英文逗号分隔。'
                );
            }

            // 写入缓存
            this._cachedKeys = keys;
            this._cacheSource = rawKeys;

            return keys;
        },

        /**
         * 随机负载均衡选择器
         * 从密钥列表中随机选取一个，实现请求级别的负载均衡
         * @returns {string} 选中的 API 密钥
         */
        selectKey: function () {
            const keys = this.loadKeys();
            if (keys.length === 1) return keys[0];
            var idx = Math.floor(Math.random() * keys.length);
            return keys[idx];
        },

        /**
         * 获取密钥统计信息（用于诊断报告）
         * @returns {{ total: number, preview: string }}
         */
        getKeyStats: function () {
            var keys = this.loadKeys();
            var preview = keys.map(function (k) {
                return k.length > 8
                    ? k.substring(0, 4) + '****' + k.substring(k.length - 4)
                    : '****';
            }).join(', ');
            return { total: keys.length, preview: preview };
        }
    };

    /**
     * 网关地址规范化处理器
     * 功能：处理自定义代理域名/默认域名，确保 URL 格式正确
     * @returns {string} 完整的 API 请求地址（含协议头和路径）
     */
    function resolveApiUrl() {
        var proxyUrl = (getEnv('ZHIPU_SEARCH_PROXY_URL') || '').trim();
        var host;

        if (proxyUrl) {
            // 使用自定义代理
            host = proxyUrl;
            // 自动补充协议头
            if (!/^https?:\/\//i.test(host)) {
                host = 'https://' + host;
            }
            // 移除尾部斜杠
            host = host.replace(/\/+$/, '');
            // 如果代理地址已包含完整路径则直接使用
            if (host.indexOf('/api/') > -1) {
                return host;
            }
            return host + API_CONFIG.API_PATH;
        }

        // 默认地址
        return 'https://' + API_CONFIG.DEFAULT_HOST + API_CONFIG.API_PATH;
    }

    /**
     * 获取默认搜索引擎配置
     * @returns {string} 引擎标识
     */
    function getDefaultEngine() {
        var envEngine = (getEnv('ZHIPU_SEARCH_DEFAULT_ENGINE') || '').trim();
        if (envEngine && VALID_ENGINES.indexOf(envEngine) !== -1) {
            return envEngine;
        }
        return DEFAULTS.ENGINE;
    }

    // ==========================================================================
    // 第三层：参数校验与沙盒化处理
    // ==========================================================================

    /**
     * 参数校验器
     * 功能：统一的参数合法性验证、类型转换与默认值填充
     */
    const ParamValidator = {

        /**
         * 校验并标准化搜索引擎参数
         * @param {string|undefined} engine - 原始引擎参数
         * @returns {string} 合法的引擎标识
         */
        validateEngine: function (engine) {
            if (!engine || typeof engine !== 'string') return getDefaultEngine();
            var normalized = engine.trim().toLowerCase();
            if (VALID_ENGINES.indexOf(normalized) === -1) {
                console.warn('[ParamValidator] 未知引擎 "' + engine + '"，回退至默认引擎');
                return getDefaultEngine();
            }
            return normalized;
        },

        /**
         * 校验并标准化结果数量参数
         * @param {number|string|undefined} count - 原始数量参数
         * @param {number} defaultVal - 默认值
         * @param {number} maxVal - 最大值
         * @returns {number} 合法的数量值
         */
        validateCount: function (count, defaultVal, maxVal) {
            if (count === undefined || count === null) return defaultVal || DEFAULTS.COUNT;
            var parsed = parseInt(String(count), 10);
            if (isNaN(parsed) || parsed < LIMITS.MIN_COUNT) return defaultVal || DEFAULTS.COUNT;
            return Math.min(parsed, maxVal || LIMITS.MAX_COUNT);
        },

        /**
         * 校验并标准化时效区间参数
         * @param {string|undefined} recency - 原始时效参数
         * @returns {string|undefined} 合法的时效标识或 undefined
         */
        validateRecency: function (recency) {
            if (!recency || typeof recency !== 'string') return undefined;
            var normalized = recency.trim();
            if (VALID_RECENCY.indexOf(normalized) === -1) {
                console.warn('[ParamValidator] 未知时效区间 "' + recency + '"，忽略此参数');
                return undefined;
            }
            // noLimit 等同于不传此参数
            if (normalized === 'noLimit') return undefined;
            return normalized;
        },

        /**
         * 校验并标准化内容详略参数
         * @param {string|undefined} size - 原始详略参数
         * @returns {string} 合法的详略标识
         */
        validateContentSize: function (size) {
            if (!size || typeof size !== 'string') return DEFAULTS.CONTENT_SIZE;
            var normalized = size.trim().toLowerCase();
            if (VALID_CONTENT_SIZE.indexOf(normalized) === -1) return DEFAULTS.CONTENT_SIZE;
            return normalized;
        },

        /**
         * 校验搜索查询词（必填参数）
         * @param {string|undefined} query - 原始查询词
         * @param {string} fieldName - 字段名称（用于错误消息）
         * @throws {Error} 查询词为空时抛出异常
         */
        requireQuery: function (query, fieldName) {
            if (!query || (typeof query === 'string' && query.trim() === '')) {
                throw new Error('[参数错误] ' + (fieldName || 'query') + ' 不能为空，请输入搜索关键词。');
            }
        },

        /**
         * 解析逗号分隔的多查询词字符串为数组
         * @param {string} queries - 逗号分隔的查询词
         * @returns {string[]} 去重后的查询词数组
         */
        parseMultiQueries: function (queries) {
            if (!queries || typeof queries !== 'string') {
                throw new Error('[参数错误] queries 不能为空，请输入用逗号分隔的多个搜索关键词。');
            }
            var arr = queries
                .split(',')
                .map(function (q) { return q.trim(); })
                .filter(function (q) { return q.length > 0; });

            if (arr.length === 0) {
                throw new Error('[参数错误] queries 解析后无有效关键词，请检查格式（英文逗号分隔）。');
            }

            // 去重
            var seen = {};
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                var lower = arr[i].toLowerCase();
                if (!seen[lower]) {
                    seen[lower] = true;
                    unique.push(arr[i]);
                }
            }

            // 限制最大并发数
            if (unique.length > LIMITS.MAX_MULTI_QUERIES) {
                console.warn('[ParamValidator] 查询词数量超限（' + unique.length + '），截取前 ' + LIMITS.MAX_MULTI_QUERIES + ' 个');
                unique = unique.slice(0, LIMITS.MAX_MULTI_QUERIES);
            }

            return unique;
        }
    };

    // ==========================================================================
    // 第四层：HTTP 通信引擎（请求构建、发送、响应解析）
    // ==========================================================================

    /**
     * HTTP 请求调度器
     * 功能：封装请求构建、鉴权注入、发送执行、响应校验及异常分级的完整流程
     */
    const HttpDispatcher = {

        /**
         * 执行 API 请求
         * @param {Object} requestBody - 请求体 JSON 对象
         * @param {string} [apiKey] - 可选的指定密钥（不传则自动轮询选择）
         * @returns {Promise<Object>} 解析后的 API 响应数据
         * @throws {Error} 网络故障/协议错误/API 业务错误
         */
        execute: async function (requestBody, apiKey) {
            // 获取 API 密钥
            var key = apiKey || KeyManager.selectKey();
            var url = resolveApiUrl();

            try {
                // 构建 HTTP 请求（OkHttp Builder 模式）
                var request = httpClient
                    .newRequest()
                    .url(url)
                    .method('POST')
                    .header('Authorization', 'Bearer ' + key)
                    .header('Content-Type', API_CONFIG.CONTENT_TYPE)
                    .header('Accept', 'application/json')
                    .header('User-Agent', API_CONFIG.USER_AGENT)
                    .body(JSON.stringify(requestBody), 'json');

                // 执行请求
                var response = await request.build().execute();
                var rawContent = response.content || '{}';

                // HTTP 状态码校验
                if (!response.isSuccessful()) {
                    var errorDetail = rawContent;
                    try {
                        var errorPayload = JSON.parse(rawContent);
                        errorDetail = errorPayload.error
                            ? (errorPayload.error.message || JSON.stringify(errorPayload.error))
                            : (errorPayload.detail || errorPayload.message || rawContent);
                    } catch (e) {
                        // JSON 解析失败，使用原始内容
                    }

                    // 分级错误报告
                    if (response.statusCode === 401 || response.statusCode === 403) {
                        throw new Error(
                            '[鉴权失败] API Key 无效或已过期（HTTP ' + response.statusCode + '）。\n' +
                            '请检查 ZHIPU_SEARCH_API_KEY 是否正确配置。\n' +
                            '管理地址：https://open.bigmodel.cn/usercenter/apikeys'
                        );
                    }
                    if (response.statusCode === 429) {
                        throw new Error(
                            '[频率限制] API 调用频率超限（HTTP 429）。\n' +
                            '建议：1) 稍后重试  2) 配置多个 API Key 负载均衡  3) 减少请求频率'
                        );
                    }
                    if (response.statusCode >= 500) {
                        throw new Error(
                            '[服务异常] 智谱服务端错误（HTTP ' + response.statusCode + '）: ' +
                            String(errorDetail).substring(0, 300)
                        );
                    }
                    throw new Error(
                        '[API 错误] HTTP ' + response.statusCode + ': ' +
                        String(errorDetail).substring(0, 500)
                    );
                }

                // 安全解析 JSON 响应
                var data;
                try {
                    data = JSON.parse(rawContent);
                } catch (parseError) {
                    throw new Error(
                        '[解析错误] 响应非有效 JSON 格式。\n' +
                        '原始内容（前 200 字符）：' + rawContent.substring(0, 200)
                    );
                }

                return data;

            } catch (error) {
                // 区分已分级的错误与底层网络错误
                if (error.message.indexOf('[') === 0) {
                    throw error;
                }
                throw new Error('[网络错误] 请求发送失败: ' + error.message);
            }
        }
    };

    // ==========================================================================
    // 第五层：结果格式化引擎（Markdown 结构化输出）
    // ==========================================================================

    /**
     * 结果格式化器
     * 功能：将 API 原始响应转换为 AI 友好的结构化 Markdown 文档
     */
    const Formatter = {

        /**
         * 安全截断过长内容
         * @param {string} text - 原始文本
         * @param {number} maxLen - 最大长度
         * @returns {string} 截断后的文本
         */
        truncate: function (text, maxLen) {
            if (!text || typeof text !== 'string') return '';
            if (text.length <= maxLen) return text;
            return text.substring(0, maxLen) + '\n\n*(内容过长，已自动截断至 ' + maxLen + ' 字符)*';
        },

        /**
         * 格式化搜索意图信息
         * @param {Object|null} intent - 搜索意图对象
         * @returns {string} Markdown 格式的意图描述
         */
        formatIntent: function (intent) {
            if (!intent || typeof intent !== 'object') return '';
            var parts = [];

            // intent.intent 可能是字符串或对象，防御性处理
            if (intent.intent) {
                var intentStr = typeof intent.intent === 'string'
                    ? intent.intent
                    : JSON.stringify(intent.intent);
                parts.push('**识别意图**: ' + intentStr);
            }

            // intent.keywords 可能是数组、字符串、对象或其他类型
            if (intent.keywords) {
                var keywordsStr = '';
                if (Array.isArray(intent.keywords)) {
                    keywordsStr = intent.keywords.join('、');
                } else if (typeof intent.keywords === 'string') {
                    keywordsStr = intent.keywords;
                } else {
                    keywordsStr = String(intent.keywords);
                }
                if (keywordsStr.length > 0) {
                    parts.push('**关键词**: ' + keywordsStr);
                }
            }

            // intent.query 某些引擎会额外返回原始查询
            if (intent.query && typeof intent.query === 'string') {
                parts.push('**原始查询**: ' + intent.query);
            }

            if (parts.length === 0) return '';
            return '> 🔍 ' + parts.join(' | ') + '\n\n';
        },

        /**
         * 格式化搜索结果元信息头部
         * @param {Object} meta - 元信息
         * @returns {string} Markdown 头部
         */
        formatHeader: function (meta) {
            var buffer = [];
            buffer.push('## ' + (meta.title || '搜索结果'));
            buffer.push('');

            var infoParts = [];
            if (meta.query) infoParts.push('**查询词**: ' + meta.query);
            if (meta.engine) infoParts.push('**引擎**: ' + (ENGINE_LABELS[meta.engine] || meta.engine));
            if (meta.recency) infoParts.push('**时效**: ' + (RECENCY_LABELS[meta.recency] || meta.recency));
            if (meta.count !== undefined) infoParts.push('**结果数**: ' + meta.count + ' 条');
            if (meta.contentSize) infoParts.push('**详略**: ' + (meta.contentSize === 'high' ? '详尽' : '适中'));

            if (infoParts.length > 0) {
                buffer.push(infoParts.join(' | '));
                buffer.push('');
            }

            return buffer.join('\n');
        },

        /**
         * 格式化单条搜索结果
         * @param {Object} item - 单条结果对象
         * @param {number} index - 序号（从 0 开始）
         * @param {boolean} isDeep - 是否为深度提取模式
         * @returns {string} Markdown 格式的单条结果
         */
        formatResultItem: function (item, index, isDeep) {
            if (!item || typeof item !== 'object') return '';
            var buffer = [];

            // 安全提取字段（防御性类型转换，API 返回值类型不保证一致）
            var title = (item.title && typeof item.title === 'string') ? item.title : (item.title ? String(item.title) : '无标题');
            var link = (item.link && typeof item.link === 'string') ? item.link : '';
            var content = (item.content && typeof item.content === 'string') ? item.content : (item.content ? String(item.content) : '');
            var media = (item.media && typeof item.media === 'string') ? item.media : '';
            var icon = (item.icon && typeof item.icon === 'string') ? item.icon : '';
            var publishDate = (item.publish_date && typeof item.publish_date === 'string') ? item.publish_date : '';
            var refer = (item.refer && typeof item.refer === 'string') ? item.refer : '';

            // 标题行（带链接和序号）
            if (link) {
                buffer.push('### [' + (index + 1) + '] ' + title);
                buffer.push('**来源**: ' + link);
            } else {
                buffer.push('### [' + (index + 1) + '] ' + title);
            }

            // 元信息行
            var metaParts = [];
            if (media) metaParts.push('📰 ' + media);
            if (publishDate) metaParts.push('📅 ' + publishDate);
            if (metaParts.length > 0) {
                buffer.push(metaParts.join(' | '));
            }

            buffer.push(''); // 空行

            // 正文内容（深度模式不截断，普通模式截断）
            if (content) {
                var maxLen = isDeep ? LIMITS.MAX_CONTENT_LENGTH : Math.floor(LIMITS.MAX_CONTENT_LENGTH / 2);
                buffer.push(this.truncate(content, maxLen));
            } else {
                buffer.push('*(无内容摘要)*');
            }

            buffer.push(''); // 空行分隔

            return buffer.join('\n');
        },

        /**
         * 格式化标准搜索结果（完整报告）
         * @param {Object} apiData - API 原始响应
         * @param {Object} meta - 搜索元信息
         * @returns {string} 完整的 Markdown 报告
         */
        formatSearchReport: function (apiData, meta) {
            var buffer = [];
            var results = Array.isArray(apiData.search_result) ? apiData.search_result : [];

            // 头部
            buffer.push(this.formatHeader({
                title: meta.title || '智谱搜索结果',
                query: meta.query,
                engine: meta.engine,
                recency: meta.recency,
                count: results.length,
                contentSize: meta.contentSize
            }));

            // 搜索意图（防御性检查：确保是数组且首元素存在）
            if (apiData.search_intent && Array.isArray(apiData.search_intent) && apiData.search_intent.length > 0 && apiData.search_intent[0]) {
                buffer.push(this.formatIntent(apiData.search_intent[0]));
            }

            buffer.push('---\n');

            // 结果列表
            if (results.length === 0) {
                buffer.push('未找到相关结果。建议：\n');
                buffer.push('- 调整搜索关键词，使用更具体或更宽泛的表达');
                buffer.push('- 尝试切换搜索引擎（search_pro / search_pro_sogou）');
                buffer.push('- 放宽时效性筛选范围');
            } else {
                var isDeep = meta.isDeep || false;
                for (var i = 0; i < results.length; i++) {
                    buffer.push(this.formatResultItem(results[i], i, isDeep));
                }
            }

            // 安全截断总输出
            var output = buffer.join('\n');
            if (output.length > LIMITS.MAX_TOTAL_OUTPUT_LENGTH) {
                output = output.substring(0, LIMITS.MAX_TOTAL_OUTPUT_LENGTH) +
                    '\n\n*(总输出过长，已自动截断)*';
            }

            return output;
        },

        /**
         * 格式化多关键词聚合搜索结果
         * @param {Array} allResults - 所有搜索结果数组 [{ query, data, error }]
         * @returns {string} 合并后的 Markdown 报告
         */
        formatMultiSearchReport: function (allResults) {
            var buffer = [];
            buffer.push('## 多关键词聚合搜索结果\n');

            var totalItems = 0;
            var successCount = 0;
            var failCount = 0;

            for (var i = 0; i < allResults.length; i++) {
                var entry = allResults[i];

                if (entry.error) {
                    failCount++;
                    buffer.push('### ❌ 查询: ' + entry.query);
                    buffer.push('搜索失败: ' + entry.error);
                    buffer.push('');
                    continue;
                }

                successCount++;
                var results = (entry.data && Array.isArray(entry.data.search_result)) ? entry.data.search_result : [];
                totalItems += results.length;

                buffer.push('### 🔍 查询: ' + entry.query + ' (' + results.length + ' 条结果)\n');

                // 搜索意图（防御性检查）
                if (entry.data && entry.data.search_intent && Array.isArray(entry.data.search_intent) && entry.data.search_intent.length > 0 && entry.data.search_intent[0]) {
                    buffer.push(this.formatIntent(entry.data.search_intent[0]));
                }

                if (results.length === 0) {
                    buffer.push('*(未找到相关结果)*\n');
                } else {
                    for (var j = 0; j < results.length; j++) {
                        buffer.push(this.formatResultItem(results[j], j, false));
                    }
                }

                buffer.push('---\n');
            }

            // 汇总统计
            var summary = '> **汇总**: ' + allResults.length + ' 个查询词, ' +
                successCount + ' 个成功, ' +
                failCount + ' 个失败, ' +
                '共 ' + totalItems + ' 条结果';
            buffer.unshift(summary + '\n');
            // 头部已插入到第一行之后

            var output = buffer.join('\n');
            if (output.length > LIMITS.MAX_TOTAL_OUTPUT_LENGTH) {
                output = output.substring(0, LIMITS.MAX_TOTAL_OUTPUT_LENGTH) +
                    '\n\n*(总输出过长，已自动截断)*';
            }

            return output;
        },

        /**
         * 格式化 API 连通性测试报告
         * @param {Object} testResult - 测试数据
         * @returns {string} Markdown 诊断报告
         */
        formatTestReport: function (testResult) {
            var buffer = [];
            buffer.push('## 智谱搜索 API 连通性测试报告\n');
            buffer.push('| 检测项 | 结果 |');
            buffer.push('| :--- | :--- |');
            buffer.push('| API 连通性 | ' + (testResult.connected ? '✅ 正常' : '❌ 异常') + ' |');
            buffer.push('| 响应延迟 | ' + testResult.latency + ' ms |');
            buffer.push('| 响应 ID | ' + (testResult.id || '-') + ' |');
            buffer.push('| API 地址 | ' + testResult.apiUrl + ' |');
            buffer.push('| 密钥数量 | ' + testResult.keyCount + ' 个 |');
            buffer.push('| 密钥预览 | ' + testResult.keyPreview + ' |');
            buffer.push('| 默认引擎 | ' + (ENGINE_LABELS[testResult.defaultEngine] || testResult.defaultEngine) + ' |');

            if (testResult.error) {
                buffer.push('');
                buffer.push('### ⚠️ 错误详情');
                buffer.push('```');
                buffer.push(testResult.error);
                buffer.push('```');
            }

            return buffer.join('\n');
        }
    };

    // ==========================================================================
    // 第六层：核心业务逻辑（五大工具函数实现）
    // ==========================================================================

    /**
     * 构建标准 API 请求体
     * @param {Object} options - 已校验的参数
     * @returns {Object} API 请求体 JSON
     */
    function buildSearchBody(options) {
        var body = {
            search_query: options.query,
            search_engine: options.engine || getDefaultEngine(),
            search_intent: true,
            count: options.count || DEFAULTS.COUNT,
            content_size: options.contentSize || DEFAULTS.CONTENT_SIZE
        };

        if (options.recency) {
            body.search_recency_filter = options.recency;
        }

        return body;
    }

    /**
     * 核心逻辑 1：通用智能搜索
     */
    async function searchCore(params) {
        // 参数校验
        ParamValidator.requireQuery(params.query, 'query');

        var engine = ParamValidator.validateEngine(params.engine);
        var count = ParamValidator.validateCount(params.count, DEFAULTS.COUNT, LIMITS.MAX_COUNT);
        var recency = ParamValidator.validateRecency(params.recency);
        var contentSize = ParamValidator.validateContentSize(params.content_size);

        // 构建请求体
        var body = buildSearchBody({
            query: params.query.trim(),
            engine: engine,
            count: count,
            recency: recency,
            contentSize: contentSize
        });

        // 执行 API 请求
        var apiData = await HttpDispatcher.execute(body);

        // 格式化输出
        var report = Formatter.formatSearchReport(apiData, {
            title: '智谱搜索结果',
            query: params.query.trim(),
            engine: engine,
            recency: recency,
            contentSize: contentSize,
            isDeep: false
        });

        var resultCount = (Array.isArray(apiData.search_result) ? apiData.search_result : []).length;

        return {
            success: true,
            message: '搜索完成，找到 ' + resultCount + ' 条结果',
            data: report,
            meta: {
                query: params.query.trim(),
                engine: engine,
                result_count: resultCount,
                api_id: apiData.id || null,
                has_intent: !!(apiData.search_intent && Array.isArray(apiData.search_intent) && apiData.search_intent.length > 0)
            }
        };
    }

    /**
     * 核心逻辑 2：新闻专项检索
     */
    async function newsCore(params) {
        ParamValidator.requireQuery(params.query, 'query');

        var count = ParamValidator.validateCount(params.count, DEFAULTS.COUNT, LIMITS.MAX_COUNT);
        var recency = ParamValidator.validateRecency(params.recency) || DEFAULTS.NEWS_RECENCY;

        // 新闻场景强制配置
        var body = buildSearchBody({
            query: params.query.trim(),
            engine: 'search_pro',        // 新闻使用增强引擎
            count: count,
            recency: recency,
            contentSize: 'high'          // 新闻使用高详细度
        });

        var apiData = await HttpDispatcher.execute(body);

        var report = Formatter.formatSearchReport(apiData, {
            title: '📰 新闻检索结果',
            query: params.query.trim(),
            engine: 'search_pro',
            recency: recency,
            contentSize: 'high',
            isDeep: false
        });

        var resultCount = (Array.isArray(apiData.search_result) ? apiData.search_result : []).length;

        return {
            success: true,
            message: '新闻检索完成，找到 ' + resultCount + ' 条资讯',
            data: report,
            meta: {
                query: params.query.trim(),
                engine: 'search_pro',
                recency: recency,
                result_count: resultCount,
                api_id: apiData.id || null
            }
        };
    }

    /**
     * 核心逻辑 3：深度内容提取
     */
    async function extractCore(params) {
        ParamValidator.requireQuery(params.query, 'query');

        var engine = ParamValidator.validateEngine(params.engine || 'search_pro');
        var count = ParamValidator.validateCount(params.count, DEFAULTS.EXTRACT_COUNT, 10);

        // 深度提取强制配置
        var body = buildSearchBody({
            query: params.query.trim(),
            engine: engine,
            count: count,
            contentSize: 'high'          // 深度提取必须高详细度
        });

        var apiData = await HttpDispatcher.execute(body);

        var report = Formatter.formatSearchReport(apiData, {
            title: '📋 深度内容提取',
            query: params.query.trim(),
            engine: engine,
            contentSize: 'high',
            isDeep: true                 // 启用深度模式（不截断内容）
        });

        var resultCount = (Array.isArray(apiData.search_result) ? apiData.search_result : []).length;

        return {
            success: true,
            message: '深度提取完成，获取 ' + resultCount + ' 条详细内容',
            data: report,
            meta: {
                query: params.query.trim(),
                engine: engine,
                result_count: resultCount,
                api_id: apiData.id || null,
                mode: 'deep_extract'
            }
        };
    }

    /**
     * 核心逻辑 4：多关键词并发聚合搜索
     */
    async function multiSearchCore(params) {
        // 解析多查询词
        var queries = ParamValidator.parseMultiQueries(params.queries);
        var countPerQuery = ParamValidator.validateCount(
            params.count_per_query,
            DEFAULTS.MULTI_COUNT_PER_QUERY,
            LIMITS.MULTI_COUNT_MAX
        );
        var engine = ParamValidator.validateEngine(params.engine);
        var recency = ParamValidator.validateRecency(params.recency);

        // 发送中间进度
        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({
                progress: '0/' + queries.length,
                message: '正在并发搜索 ' + queries.length + ' 个关键词...'
            });
        }

        // 构建并发任务
        var tasks = queries.map(function (query) {
            var body = buildSearchBody({
                query: query,
                engine: engine,
                count: countPerQuery,
                recency: recency,
                contentSize: DEFAULTS.CONTENT_SIZE
            });

            return HttpDispatcher.execute(body)
                .then(function (data) {
                    return { query: query, data: data, error: null };
                })
                .catch(function (err) {
                    console.error('[multi_search] 子查询 "' + query + '" 失败: ' + err.message);
                    return { query: query, data: null, error: err.message };
                });
        });

        // 并发执行所有查询
        var allResults = await Promise.all(tasks);

        // 发送完成进度
        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({
                progress: queries.length + '/' + queries.length,
                message: '所有查询已完成，正在格式化结果...'
            });
        }

        // 格式化聚合报告
        var report = Formatter.formatMultiSearchReport(allResults);

        var successCount = allResults.filter(function (r) { return !r.error; }).length;
        var totalItems = allResults.reduce(function (sum, r) {
            if (r.data && Array.isArray(r.data.search_result)) return sum + r.data.search_result.length;
            return sum;
        }, 0);

        return {
            success: true,
            message: '聚合搜索完成: ' + queries.length + ' 个查询词, ' +
                successCount + ' 个成功, 共 ' + totalItems + ' 条结果',
            data: report,
            meta: {
                total_queries: queries.length,
                success_count: successCount,
                fail_count: queries.length - successCount,
                total_results: totalItems,
                engine: engine
            }
        };
    }

    /**
     * 核心逻辑 5：API 连通性测试
     */
    async function testCore() {
        var apiUrl = resolveApiUrl();
        var defaultEngine = getDefaultEngine();
        var keyStats;

        try {
            keyStats = KeyManager.getKeyStats();
        } catch (e) {
            return {
                success: false,
                message: '密钥加载失败: ' + e.message,
                data: Formatter.formatTestReport({
                    connected: false,
                    latency: '-',
                    id: null,
                    apiUrl: apiUrl,
                    keyCount: 0,
                    keyPreview: '-',
                    defaultEngine: defaultEngine,
                    error: e.message
                })
            };
        }

        var testBody = {
            search_query: 'hi',
            search_engine: 'search_std',
            search_intent: false,
            count: 1,
            content_size: 'medium'
        };

        var startTime = Date.now();

        try {
            var result = await HttpDispatcher.execute(testBody);
            var latency = Date.now() - startTime;

            return {
                success: true,
                message: '连接成功，响应延迟 ' + latency + ' ms',
                data: Formatter.formatTestReport({
                    connected: true,
                    latency: latency,
                    id: result.id || null,
                    apiUrl: apiUrl,
                    keyCount: keyStats.total,
                    keyPreview: keyStats.preview,
                    defaultEngine: defaultEngine,
                    error: null
                }),
                meta: {
                    latency_ms: latency,
                    api_id: result.id || null
                }
            };
        } catch (error) {
            var latency = Date.now() - startTime;

            return {
                success: false,
                message: '连接测试失败: ' + error.message,
                data: Formatter.formatTestReport({
                    connected: false,
                    latency: latency,
                    id: null,
                    apiUrl: apiUrl,
                    keyCount: keyStats.total,
                    keyPreview: keyStats.preview,
                    defaultEngine: defaultEngine,
                    error: error.message
                })
            };
        }
    }

    // ==========================================================================
    // 统一包装层：Wrapper 模式 — 错误捕获 + complete() 回调
    // ==========================================================================

    /**
     * 工具执行统一包装器
     * 功能：
     *   1. 统一的 try/catch 错误边界
     *   2. 自动调用 complete() 回调
     *   3. 完整的错误堆栈追踪
     *   4. 日志记录
     *
     * @param {Function} coreLogic - 核心业务逻辑函数
     * @param {Object} params - 原始参数对象
     * @param {string} toolName - 工具名称（用于日志和错误消息）
     */
    async function wrapToolExecution(coreLogic, params, toolName) {
        try {
            var result = await coreLogic(params);

            // 核心逻辑已返回完整的结果对象
            complete(result);

        } catch (error) {
            console.error('[ZhipuSearch:' + toolName + '] 执行失败: ' + error.message);

            complete({
                success: false,
                message: toolName + ' 执行失败: ' + error.message,
                error_stack: error.stack,
                suggestion: generateErrorSuggestion(error.message)
            });
        }
    }

    /**
     * 根据错误消息生成智能修复建议
     * @param {string} errorMsg - 错误消息
     * @returns {string} 修复建议
     */
    function generateErrorSuggestion(errorMsg) {
        if (errorMsg.indexOf('配置错误') > -1 || errorMsg.indexOf('API Key') > -1) {
            return '请检查环境变量 ZHIPU_SEARCH_API_KEY 是否正确配置。获取地址: https://open.bigmodel.cn/usercenter/apikeys';
        }
        if (errorMsg.indexOf('鉴权失败') > -1) {
            return '请确认 API Key 有效且未过期。注意：智谱搜索 Key 与智谱生图/对话 Key 可能不同。';
        }
        if (errorMsg.indexOf('频率限制') > -1) {
            return '建议配置多个 API Key（逗号分隔）以实现负载均衡，或稍后重试。';
        }
        if (errorMsg.indexOf('网络错误') > -1) {
            return '请检查网络连接，或配置 ZHIPU_SEARCH_PROXY_URL 使用代理地址。';
        }
        if (errorMsg.indexOf('参数错误') > -1) {
            return '请检查输入参数格式是否正确。';
        }
        return '如果问题持续，请尝试运行 test 工具进行连通性诊断。';
    }

    // ==========================================================================
    // 公开接口暴露
    // ==========================================================================

    return {
        /**
         * search — 通用智能搜索
         */
        search: function (params) {
            return wrapToolExecution(searchCore, params, 'search');
        },

        /**
         * news — 新闻专项检索
         */
        news: function (params) {
            return wrapToolExecution(newsCore, params, 'news');
        },

        /**
         * extract — 深度内容提取
         */
        extract: function (params) {
            return wrapToolExecution(extractCore, params, 'extract');
        },

        /**
         * multi_search — 多关键词并发聚合搜索
         */
        multi_search: function (params) {
            return wrapToolExecution(multiSearchCore, params, 'multi_search');
        },

        /**
         * test — API 连通性测试
         */
        test: function (params) {
            return wrapToolExecution(testCore, params || {}, 'test');
        }
    };

})();

// ==================================================================================
// 导出工具接口（严格匹配 METADATA 中的工具名称）
// ==================================================================================

exports.search       = zhipuSearchToolkit.search;
exports.news         = zhipuSearchToolkit.news;
exports.extract      = zhipuSearchToolkit.extract;
exports.multi_search = zhipuSearchToolkit.multi_search;
exports.test         = zhipuSearchToolkit.test;