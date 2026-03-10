/* METADATA
{
    "name": "wiki_search",
    "version": "1.0",
    "display_name": {
        "zh": "维基百科搜索",
        "en": "Wikipedia Search"
    },
    "description": {
        "zh": "维基百科多语言搜索工具包。提供条目搜索、词条摘要获取、全文内容提取、分类浏览、随机条目发现、今日事件及跨语言链接查询等功能。支持中文、英文、日文等多语言维基百科，无需 API Key。",
        "en": "Wikipedia multi-language search toolkit. Provides article search, summary extraction, full content retrieval, category browsing, random article discovery, current events, and cross-language link queries. Supports Chinese, English, Japanese and other Wikipedia languages. No API key required."
    },
    "env": [
    {
        "name": "WIKI_PROXY_URL",
        "description": {
            "zh": "维基百科反向代理基础地址（可选）。格式：https://wiki.example.com（不含末尾斜杠）。工具包会自动在后面附加 /{lang}/w/api.php 路径。不填则直连 wikipedia.org（国内可能无法访问）",
            "en": "Wikipedia reverse proxy base URL (optional). Format: https://wiki.example.com (no trailing slash). The toolkit auto-appends /{lang}/w/api.php path. Leave empty to access wikipedia.org directly."
        },
        "required": false
    }
],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "search_articles",
            "description": {
                "zh": "在维基百科中搜索条目。返回匹配的页面列表，包含标题、摘要片段和页面基本信息。支持按相关性排序和分页。",
                "en": "Search Wikipedia articles. Returns matching pages with titles, snippets, and basic info. Supports relevance sorting and pagination."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索查询词", "en": "Search query string" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码（如 zh、en、ja、fr、de、es 等），默认 zh", "en": "Wikipedia language code (e.g., zh, en, ja, fr, de, es). Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "limit",
                    "description": { "zh": "返回结果数量上限（1-20），默认 5", "en": "Max results (1-20). Default: 5" },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "offset",
                    "description": { "zh": "结果偏移量，用于分页，默认 0", "en": "Result offset for pagination. Default: 0" },
                    "type": "number",
                    "required": false,
                    "default": 0
                }
            ]
        },
        {
            "name": "get_summary",
            "description": {
                "zh": "获取维基百科条目的摘要信息。返回条目标题、首段摘要（纯文本）、缩略图、页面链接及基本属性。适合快速了解某个主题的概况。",
                "en": "Get a Wikipedia article summary. Returns title, introductory extract (plain text), thumbnail, page URL, and basic metadata. Ideal for quick topic overviews."
            },
            "parameters": [
                {
                    "name": "title",
                    "description": { "zh": "条目标题（精确匹配，支持重定向）", "en": "Article title (exact match, supports redirects)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "sentences",
                    "description": { "zh": "摘要句数上限（1-10），默认 5", "en": "Max sentences in extract (1-10). Default: 5" },
                    "type": "number",
                    "required": false,
                    "default": 5
                }
            ]
        },
        {
            "name": "get_full_content",
            "description": {
                "zh": "获取维基百科条目的完整正文内容（纯文本格式）。适合深入阅读和内容分析。自动跟随重定向，返回完整文章及章节结构。",
                "en": "Get full article content in plain text. Ideal for in-depth reading and content analysis. Follows redirects and returns full text with section structure."
            },
            "parameters": [
                {
                    "name": "title",
                    "description": { "zh": "条目标题", "en": "Article title" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "section_index",
                    "description": { "zh": "指定章节索引号以只获取该章节内容（0 为引言），默认获取全文", "en": "Section index to fetch only that section (0 = intro). Default: full article" },
                    "type": "number",
                    "required": false
                }
            ]
        },
        {
            "name": "get_sections",
            "description": {
                "zh": "获取维基百科条目的目录结构（章节标题列表及层级关系）。适合了解长文章的结构后再有针对性地获取特定章节。",
                "en": "Get article table of contents (section headings and hierarchy). Useful for understanding article structure before fetching specific sections."
            },
            "parameters": [
                {
                    "name": "title",
                    "description": { "zh": "条目标题", "en": "Article title" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                }
            ]
        },
        {
            "name": "get_categories",
            "description": {
                "zh": "获取某个维基百科条目所属的全部分类列表。也可浏览某个分类下包含的子页面和子分类。",
                "en": "Get categories of an article, or list pages and subcategories within a given category."
            },
            "parameters": [
                {
                    "name": "title",
                    "description": { "zh": "条目或分类标题（如 'Category:物理学'）", "en": "Article or category title (e.g., 'Category:Physics')" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "mode",
                    "description": { "zh": "模式：'of' 获取条目所属分类，'members' 获取分类下的成员页面。默认 'of'", "en": "Mode: 'of' for article's categories, 'members' for pages in a category. Default: 'of'" },
                    "type": "string",
                    "required": false,
                    "default": "of"
                },
                {
                    "name": "limit",
                    "description": { "zh": "返回数量上限，默认 20", "en": "Max results. Default: 20" },
                    "type": "number",
                    "required": false,
                    "default": 20
                }
            ]
        },
        {
            "name": "get_langlinks",
            "description": {
                "zh": "获取某个维基百科条目在其他语言版本中的对应链接。用于跨语言信息关联和多语言内容发现。",
                "en": "Get interlanguage links for an article. Useful for cross-language information correlation and multilingual content discovery."
            },
            "parameters": [
                {
                    "name": "title",
                    "description": { "zh": "条目标题", "en": "Article title" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "lang",
                    "description": { "zh": "源语言维基百科代码，默认 zh", "en": "Source Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "target_langs",
                    "description": { "zh": "目标语言过滤（逗号分隔，如 'en,ja,fr'），留空返回全部", "en": "Target language filter (comma-separated, e.g., 'en,ja,fr'). Empty for all." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "get_random",
            "description": {
                "zh": "从维基百科随机获取条目，并返回摘要信息。适合探索性阅读和内容发现。",
                "en": "Get random Wikipedia articles with summaries. Great for exploratory reading and content discovery."
            },
            "parameters": [
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "count",
                    "description": { "zh": "随机条目数量（1-10），默认 3", "en": "Number of random articles (1-10). Default: 3" },
                    "type": "number",
                    "required": false,
                    "default": 3
                }
            ]
        },
        {
            "name": "get_current_events",
            "description": {
                "zh": "获取维基百科「新闻动态」或「历史上的今天」页面内容，了解当日热点事件及历史纪念日。",
                "en": "Get Wikipedia 'Current Events' or 'On This Day' content for today's news and historical anniversaries."
            },
            "parameters": [
                {
                    "name": "lang",
                    "description": { "zh": "维基百科语言代码，默认 zh", "en": "Wikipedia language code. Default: zh" },
                    "type": "string",
                    "required": false,
                    "default": "zh"
                },
                {
                    "name": "type",
                    "description": { "zh": "内容类型：'news' 新闻动态，'onthisday' 历史上的今天。默认 'news'", "en": "Content type: 'news' for current events, 'onthisday' for on this day. Default: 'news'" },
                    "type": "string",
                    "required": false,
                    "default": "news"
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试维基百科 API 连通性。验证代理域名（WIKI_PROXY_URL）或直连 wikipedia.org 的网络可达性及响应延迟，返回完整诊断报告。无需传入任何参数。适用于首次配置代理后的连通性验证与故障排查。",
                "en": "Test Wikipedia API connectivity. Validates proxy (WIKI_PROXY_URL) or direct wikipedia.org reachability and response latency. Returns diagnostic report. No parameters needed. For setup verification and troubleshooting."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：维基百科多语言搜索工具包 (Wikipedia Multi-Language Search Toolkit)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本模块基于 MediaWiki Action API 和 REST API 实现对维基百科的全面访问。
 * 涵盖条目搜索、摘要提取、全文获取、目录解析、分类浏览、跨语言链接、
 * 随机发现及新闻动态等八大核心功能。
 *
 * 技术架构：
 * 1. 基于 OkHttp 的 HTTP 客户端，支持自定义 User-Agent 以符合维基百科政策
 * 2. 双 API 策略：Action API（搜索/分类/语言链接）+ REST API（摘要/内容）
 * 3. 多语言动态路由，通过语言代码自动构建对应维基百科的端点
 * 4. 内置 HTML 清洗器，自动剥离标签和转义实体，输出纯净文本
 * 5. 智能重试与降级机制，应对限流和网络波动
 * 6. 统一 Markdown 格式化输出，适配 AI 对话场景
 *
 * 版本：v1.0
 * 运行环境：Operit JavaScript 沙箱
 * 网络协议：HTTPS
 * 外部依赖：无（无需 API Key）
 * 反向代理：支持，通过 WIKI_PROXY_URL 环境变量配置，格式为 https://your-proxy.com
 *           代理路径约定：{proxy}/{lang}/w/api.php（Action API）
 *                        {proxy}/{lang}/w/rest.php/v1（REST API）
 * ==============================================================================
 */
const WikiSearchToolkit = (function () {

    // ==========================================================================
    // 第一部分：全局配置与常量定义
    // ==========================================================================

    /**
     * OkHttp 客户端单例
     * 复用连接池以减少 TLS 握手开销
     */
    const client = OkHttp.newClient();

    /**
     * 模块标识前缀，用于日志输出
     */
    const LOG_TAG = "[WikiSearch]";

    /**
     * User-Agent 标识
     * 维基百科 API 政策要求所有请求携带有意义的 User-Agent
     * 参考：https://meta.wikimedia.org/wiki/User-Agent_policy
     */
    const USER_AGENT = "WikiSearchToolkit/1.0 (Operit AI Assistant; https://github.com/nichuanfang/operit)";

    /**
     * 默认请求头集合
     */
    const DEFAULT_HEADERS = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json; charset=utf-8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
    };

    /**
     * 安全限制常量
     */
    const LIMITS = {
        MAX_SEARCH_RESULTS: 20,         // 单次搜索最大返回条数
        MAX_EXTRACT_CHARS: 30000,       // 全文提取最大字符数
        MAX_SUMMARY_SENTENCES: 10,      // 摘要最大句数
        MAX_RANDOM_COUNT: 10,           // 随机条目最大数量
        MAX_CATEGORY_MEMBERS: 50,       // 分类成员最大返回数
        REQUEST_RETRY_COUNT: 2,         // 请求重试次数
        RETRY_DELAY_MS: 1500            // 重试间隔（毫秒）
    };

    /**
     * 支持的维基百科语言代码白名单（常见语种）
     * 用于输入校验，防止构造恶意 URL
     */
    const VALID_LANGS = new Set([
        "zh", "en", "ja", "ko", "fr", "de", "es", "pt", "ru", "it",
        "ar", "nl", "pl", "sv", "vi", "uk", "he", "id", "th", "tr",
        "cs", "fi", "da", "no", "hu", "ro", "ca", "el", "bg", "hr",
        "ms", "sk", "sr", "lt", "sl", "et", "lv", "hi", "bn", "ta",
        "te", "ml", "ur", "fa", "sw", "af", "eu", "gl", "cy", "sq",
        "simple", "zh-classical", "zh-min-nan", "zh-yue", "wuu"
    ]);

    /**
     * 获取反向代理基础地址（不含末尾斜杠）
     * @returns {string|null} 代理地址或 null
     */
    function getProxyBase() {
        const proxyUrl = (typeof getEnv === "function") ? getEnv("WIKI_PROXY_URL") : undefined;
        if (proxyUrl && proxyUrl.trim() !== "") {
            return proxyUrl.trim().replace(/\/+$/, "");
        }
        return null;
    }    

    // ==========================================================================
    // 第二部分：基础工具函数
    // ==========================================================================

    /**
     * 语言代码校验与规范化
     * @param {string} lang - 用户输入的语言代码
     * @returns {string} 规范化后的语言代码
     */
    function normalizeLang(lang) {
        if (!lang || typeof lang !== "string") return "zh";
        const cleaned = lang.trim().toLowerCase();
        // 对于不在白名单中的语言代码，也允许通过（维基百科有 300+ 语种）
        // 但做基本格式检查，只允许字母、数字和连字符
        if (!/^[a-z][a-z0-9\-]{0,19}$/.test(cleaned)) return "zh";
        return cleaned;
    }

    /**
     * 构建 MediaWiki Action API 基础 URL
     * @param {string} lang - 语言代码
     * @returns {string} 完整的 API 端点地址
     */
    function buildActionApiUrl(lang) {
        const proxy = getProxyBase();
        if (proxy) {
            return `${proxy}/${lang}/w/api.php`;
        }
        return `https://${lang}.wikipedia.org/w/api.php`;
    }

    /**
     * 构建 MediaWiki REST API 基础 URL
     * @param {string} lang - 语言代码
     * @returns {string} 完整的 REST API 端点地址
     */
    function buildRestApiUrl(lang) {
        const proxy = getProxyBase();
        if (proxy) {
            return `${proxy}/${lang}/w/rest.php/v1`;
        }
        return `https://${lang}.wikipedia.org/w/rest.php/v1`;
    }

    /**
     * 构建维基百科条目页面 URL
     * @param {string} lang - 语言代码
     * @param {string} title - 条目标题
     * @returns {string} 完整的页面浏览地址
     */

    function buildPageUrl(lang, title) {
        const proxy = getProxyBase();
        const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
        if (proxy) {
            return `${proxy}/${lang}/wiki/${encodedTitle}`;
        }
        return `https://${lang}.wikipedia.org/wiki/${encodedTitle}`;
    }

    /**
     * HTML 标签清除器
     * 功能：递归移除所有 HTML/XML 标签，保留纯文本内容
     * @param {string} html - 含有 HTML 标签的原始字符串
     * @returns {string} 清洗后的纯文本
     */
    function stripHtmlTags(html) {
        if (!html) return "";
        return html
            // 移除所有 HTML 标签（包括自闭合标签）
            .replace(/<[^>]+>/g, "")
            // 解码常见 HTML 实体
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/&#(\d+);/g, function (match, dec) {
                return String.fromCharCode(dec);
            })
            // 规范化空白字符
            .replace(/\r\n/g, "\n")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    /**
     * 维基文本轻量清洗器
     * 功能：移除常见的维基标记语法，提取可读文本
     * @param {string} wikitext - 原始维基文本
     * @returns {string} 清洗后的文本
     */
    function cleanWikitext(wikitext) {
        if (!wikitext) return "";
        return wikitext
            // 移除模板调用 {{...}}（支持嵌套最多 3 层）
            .replace(/\{\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\}/g, "")
            // 移除文件/图片引用 [[File:...]] [[文件:...]]
            .replace(/\[\[(?:File|Image|文件|图像|圖像):[^\]]*\]\]/gi, "")
            // 转换内部链接 [[显示文本|链接]] 为 显示文本
            .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
            // 转换外部链接 [url 文本] 为 文本
            .replace(/\[https?:\/\/[^\s\]]*\s+([^\]]*)\]/g, "$1")
            // 移除纯 URL 外部链接 [url]
            .replace(/\[https?:\/\/[^\]]*\]/g, "")
            // 移除引用标签 <ref>...</ref> 和 <ref ... />
            .replace(/<ref[^>]*\/>/gi, "")
            .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
            // 移除注释 <!-- ... -->
            .replace(/<!--[\s\S]*?-->/g, "")
            // 移除 HTML 标签
            .replace(/<[^>]+>/g, "")
            // 转换粗体/斜体
            .replace(/'{2,3}(.*?)'{2,3}/g, "$1")
            // 规范化空白
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    /**
     * 数值范围约束工具
     * @param {number} value - 输入值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {number} defaultVal - 默认值
     * @returns {number} 约束后的值
     */
    function clamp(value, min, max, defaultVal) {
        if (value === undefined || value === null || isNaN(value)) return defaultVal;
        const num = Math.floor(Number(value));
        return Math.max(min, Math.min(max, num));
    }

    // ==========================================================================
    // 第三部分：HTTP 请求引擎
    // ==========================================================================

    /**
     * 带重试机制的 HTTP GET 请求
     * 功能：执行请求并在遇到限流（429）或服务器错误（5xx）时自动重试
     * @param {string} url - 请求地址
     * @param {Object} headers - 请求头（可选，与默认头合并）
     * @returns {Promise<Object>} 解析后的 JSON 响应
     * @throws {Error} 所有重试均失败时抛出
     */
    async function httpGetJson(url, headers) {
        const mergedHeaders = Object.assign({}, DEFAULT_HEADERS, headers || {});
        let lastError = null;

        for (let attempt = 0; attempt <= LIMITS.REQUEST_RETRY_COUNT; attempt++) {
            try {
                // 构建请求
                const reqBuilder = client.newRequest().url(url).method("GET");
                for (const key in mergedHeaders) {
                    reqBuilder.header(key, mergedHeaders[key]);
                }
                const response = await reqBuilder.build().execute();

                // 限流检测：429 Too Many Requests
                if (response.statusCode === 429) {
                    console.warn(`${LOG_TAG} 请求被限流 (429)，等待后重试... [attempt ${attempt + 1}]`);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(LIMITS.RETRY_DELAY_MS * (attempt + 1));
                    }
                    lastError = new Error("维基百科 API 限流 (HTTP 429)，请稍后再试");
                    continue;
                }

                // 服务器错误重试：5xx
                if (response.statusCode >= 500) {
                    console.warn(`${LOG_TAG} 服务器错误 (${response.statusCode})，等待后重试...`);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(LIMITS.RETRY_DELAY_MS);
                    }
                    lastError = new Error(`维基百科服务器错误 (HTTP ${response.statusCode})`);
                    continue;
                }

                // 其他非成功状态码直接报错
                if (!response.isSuccessful()) {
                    throw new Error(`HTTP 请求失败: ${response.statusCode}`);
                }

                // 解析 JSON 响应
                const content = response.content;
                if (!content || content.trim() === "") {
                    throw new Error("API 返回空响应");
                }

                return JSON.parse(content);

            } catch (e) {
                lastError = e;
                if (attempt < LIMITS.REQUEST_RETRY_COUNT) {
                    console.warn(`${LOG_TAG} 请求异常: ${e.message}，准备重试...`);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(LIMITS.RETRY_DELAY_MS);
                    }
                } else {
                    break;
                }
            }
        }

        throw lastError || new Error("请求失败，已耗尽所有重试次数");
    }

    /**
     * MediaWiki Action API 请求便捷封装
     * 自动拼接公共参数（format=json, formatversion=2, origin=*）
     * @param {string} lang - 语言代码
     * @param {Object} params - API 查询参数
     * @returns {Promise<Object>} API 响应数据
     */
    async function queryActionApi(lang, params) {
        const baseUrl = buildActionApiUrl(lang);
        const queryParts = ["format=json", "formatversion=2", "origin=*"];

        for (const key in params) {
            if (params[key] !== undefined && params[key] !== null) {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        }

        const fullUrl = baseUrl + "?" + queryParts.join("&");
        return await httpGetJson(fullUrl);
    }

    /**
     * MediaWiki REST API 请求便捷封装
     * @param {string} lang - 语言代码
     * @param {string} path - REST 路径（如 /search/page）
     * @param {Object} params - 查询参数（可选）
     * @returns {Promise<Object>} API 响应数据
     */
    async function queryRestApi(lang, path, params) {
        const baseUrl = buildRestApiUrl(lang);
        let fullUrl = baseUrl + path;

        if (params && Object.keys(params).length > 0) {
            const queryParts = [];
            for (const key in params) {
                if (params[key] !== undefined && params[key] !== null) {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
                }
            }
            if (queryParts.length > 0) {
                fullUrl += "?" + queryParts.join("&");
            }
        }

        return await httpGetJson(fullUrl);
    }

    // ==========================================================================
    // 第四部分：结果格式化引擎
    // ==========================================================================

    /**
     * 格式化器对象
     * 负责将 API 原始数据转换为结构化 Markdown 文档
     */
    const Formatter = {

        /**
         * 格式化搜索结果列表
         * @param {Array} pages - 搜索结果页面数组
         * @param {string} query - 原始查询词
         * @param {string} lang - 语言代码
         * @param {number} totalHits - 总命中数
         * @returns {string} Markdown 格式化文本
         */
        searchResults: function (pages, query, lang, totalHits) {
            const buf = [];
            buf.push(`## 维基百科搜索结果\n`);
            buf.push(`**查询词**: ${query}`);
            buf.push(`**语言**: ${lang}.wikipedia.org`);
            buf.push(`**总计命中**: ${totalHits || "未知"} 条\n`);

            if (!pages || pages.length === 0) {
                buf.push("未找到匹配的条目。建议：");
                buf.push("- 检查拼写是否正确");
                buf.push("- 尝试使用更通用的关键词");
                buf.push("- 切换到其他语言（如 lang='en'）");
                return buf.join("\n");
            }

            buf.push(`**返回**: ${pages.length} 条结果\n`);
            buf.push("---\n");

            pages.forEach(function (page, index) {
                const title = page.title || "无标题";
                const snippet = stripHtmlTags(page.snippet || page.description || "");
                const pageUrl = buildPageUrl(lang, title);
                const wordCount = page.wordcount || 0;
                const lastEdit = page.timestamp ? page.timestamp.split("T")[0] : "";

                buf.push(`### ${index + 1}. ${title}`);
                buf.push(`**链接**: ${pageUrl}`);
                if (wordCount > 0) buf.push(`**字数**: ${wordCount}`);
                if (lastEdit) buf.push(`**最后编辑**: ${lastEdit}`);
                if (snippet) buf.push(`**摘要**: ${snippet}`);
                buf.push(""); // 空行分隔
            });

            return buf.join("\n");
        },

        /**
         * 格式化条目摘要
         * @param {Object} pageData - 页面数据对象
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        summary: function (pageData, lang) {
            const buf = [];
            const title = pageData.title || pageData.titles && pageData.titles.canonical || "未知标题";
            const extract = pageData.extract || "";
            const description = pageData.description || "";
            const thumbnail = pageData.thumbnail;
            const pageUrl = buildPageUrl(lang, title);

            buf.push(`## ${title}\n`);
            if (description) buf.push(`> ${description}\n`);
            buf.push(`**链接**: ${pageUrl}`);

            if (pageData.pageid) buf.push(`**页面 ID**: ${pageData.pageid}`);

            if (thumbnail && thumbnail.source) {
                buf.push(`**缩略图**: ${thumbnail.source}`);
            }

            buf.push("\n---\n");

            if (extract) {
                buf.push("### 摘要\n");
                buf.push(stripHtmlTags(extract));
            } else {
                buf.push("*该条目暂无可用摘要。*");
            }

            return buf.join("\n");
        },

        /**
         * 格式化全文内容
         * @param {string} title - 条目标题
         * @param {string} content - 正文内容
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        fullContent: function (title, content, lang) {
            const buf = [];
            const pageUrl = buildPageUrl(lang, title);

            buf.push(`## ${title}（全文）\n`);
            buf.push(`**来源**: ${pageUrl}\n`);
            buf.push("---\n");

            if (!content || content.trim().length === 0) {
                buf.push("*该条目暂无正文内容，可能是重定向页或消歧义页。*");
            } else {
                // 自动截断超长内容
                let text = cleanWikitext(content);
                if (text.length > LIMITS.MAX_EXTRACT_CHARS) {
                    text = text.substring(0, LIMITS.MAX_EXTRACT_CHARS);
                    text += "\n\n---\n*(内容过长，已自动截断。可指定 section_index 参数获取特定章节。)*";
                }
                buf.push(text);
            }

            return buf.join("\n");
        },

        /**
         * 格式化目录章节结构
         * @param {Array} sections - 章节列表
         * @param {string} title - 条目标题
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        sections: function (sections, title, lang) {
            const buf = [];
            const pageUrl = buildPageUrl(lang, title);

            buf.push(`## ${title} — 目录结构\n`);
            buf.push(`**来源**: ${pageUrl}\n`);
            buf.push("---\n");

            if (!sections || sections.length === 0) {
                buf.push("*该条目没有章节划分。*");
                return buf.join("\n");
            }

            buf.push("| 索引 | 层级 | 章节标题 |");
            buf.push("| :--- | :--- | :--- |");

            sections.forEach(function (sec) {
                const indent = sec.toclevel ? "　".repeat(Math.max(0, sec.toclevel - 1)) : "";
                const levelTag = sec.level ? `H${sec.level}` : "";
                buf.push(`| ${sec.index} | ${levelTag} | ${indent}${stripHtmlTags(sec.line || "")} |`);
            });

            buf.push(`\n**共 ${sections.length} 个章节**`);
            buf.push("\n> 提示：使用 get_full_content 的 section_index 参数可获取指定章节内容（索引 0 为引言部分）。");

            return buf.join("\n");
        },

        /**
         * 格式化分类信息
         * @param {Array} items - 分类或成员项目列表
         * @param {string} title - 条目/分类标题
         * @param {string} mode - 模式标识
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        categories: function (items, title, mode, lang) {
            const buf = [];

            if (mode === "members") {
                buf.push(`## ${title} — 分类成员\n`);
            } else {
                buf.push(`## ${title} — 所属分类\n`);
            }

            buf.push(`**来源**: ${buildPageUrl(lang, title)}\n`);
            buf.push("---\n");

            if (!items || items.length === 0) {
                buf.push(mode === "members" ? "*该分类下暂无成员页面。*" : "*该条目未归属任何分类。*");
                return buf.join("\n");
            }

            items.forEach(function (item, index) {
                const itemTitle = item.title || item;
                const ns = item.ns;
                let typeLabel = "";
                if (ns === 14) typeLabel = " 📂 [子分类]";
                else if (ns === 6) typeLabel = " 🖼 [文件]";
                else typeLabel = "";

                buf.push(`${index + 1}. **${stripHtmlTags(itemTitle)}**${typeLabel}`);
            });

            buf.push(`\n**共 ${items.length} 项**`);
            return buf.join("\n");
        },

        /**
         * 格式化跨语言链接
         * @param {Array} links - 语言链接列表
         * @param {string} title - 源条目标题
         * @param {string} lang - 源语言代码
         * @returns {string} Markdown 格式化文本
         */
        langlinks: function (links, title, lang) {
            const buf = [];

            buf.push(`## ${title} — 跨语言链接\n`);
            buf.push(`**源页面**: ${buildPageUrl(lang, title)}\n`);
            buf.push("---\n");

            if (!links || links.length === 0) {
                buf.push("*该条目没有其他语言版本。*");
                return buf.join("\n");
            }

            buf.push("| 语言代码 | 对应标题 | 链接 |");
            buf.push("| :--- | :--- | :--- |");

            links.forEach(function (link) {
                const linkLang = link.lang || "";
                const linkTitle = link.title || link["*"] || "";
                const linkUrl = buildPageUrl(linkLang, linkTitle);
                buf.push(`| ${linkLang} | ${linkTitle} | ${linkUrl} |`);
            });

            buf.push(`\n**共 ${links.length} 个语言版本**`);
            return buf.join("\n");
        },

        /**
         * 格式化随机条目列表
         * @param {Array} articles - 随机条目数组
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        randomArticles: function (articles, lang) {
            const buf = [];

            buf.push(`## 维基百科随机条目 (${lang})\n`);
            buf.push("---\n");

            if (!articles || articles.length === 0) {
                buf.push("*未能获取随机条目。*");
                return buf.join("\n");
            }

            articles.forEach(function (article, index) {
                const title = article.title || "无标题";
                const extract = article.extract ? stripHtmlTags(article.extract) : "";
                const pageUrl = buildPageUrl(lang, title);
                const thumbnail = article.thumbnail;

                buf.push(`### ${index + 1}. ${title}`);
                buf.push(`**链接**: ${pageUrl}`);
                if (thumbnail && thumbnail.source) {
                    buf.push(`**缩略图**: ${thumbnail.source}`);
                }
                if (extract) {
                    // 截取前 300 个字符作为预览
                    const preview = extract.length > 300 ? extract.substring(0, 300) + "..." : extract;
                    buf.push(`\n${preview}`);
                }
                buf.push(""); // 空行分隔
            });

            return buf.join("\n");
        },

        /**
         * 格式化新闻动态/历史上的今天
         * @param {string} content - 页面内容文本
         * @param {string} type - 内容类型
         * @param {string} lang - 语言代码
         * @returns {string} Markdown 格式化文本
         */
        currentEvents: function (content, type, lang) {
            const buf = [];
            const typeLabel = type === "onthisday" ? "历史上的今天" : "新闻动态";

            buf.push(`## 维基百科${typeLabel} (${lang})\n`);
            buf.push("---\n");

            if (!content || content.trim().length === 0) {
                buf.push(`*暂无${typeLabel}内容。*`);
                return buf.join("\n");
            }

            buf.push(content);
            return buf.join("\n");
        }
    };

    // ==========================================================================
    // 第五部分：统一错误处理包装器
    // ==========================================================================

    /**
     * 工具执行包装器
     * 统一处理异步执行、参数校验、结果交付及异常捕获
     * @param {Function} coreLogic - 核心业务逻辑函数
     * @param {Object} params - 原始输入参数
     * @param {string} actionLabel - 操作标签（用于日志和错误消息）
     */
    async function wrapExecution(coreLogic, params, actionLabel) {
        try {
            const result = await coreLogic(params);
            complete({
                success: true,
                message: `${actionLabel} 执行成功`,
                data: result
            });
        } catch (error) {
            console.error(`${LOG_TAG} ${actionLabel} 失败: ${error.message}`);
            complete({
                success: false,
                message: `${actionLabel} 失败: ${error.message}`,
                error_stack: error.stack || ""
            });
        }
    }

    // ==========================================================================
    // 第六部分：核心业务逻辑实现
    // ==========================================================================

    /**
     * 工具 1：搜索条目
     * API：action=query, list=search
     * 使用 CirrusSearch 全文搜索引擎
     */
    async function searchArticlesCore(params) {
        const query = params.query;
        if (!query || String(query).trim() === "") {
            throw new Error("搜索查询词 (query) 不能为空");
        }

        const lang = normalizeLang(params.lang);
        const limit = clamp(params.limit, 1, LIMITS.MAX_SEARCH_RESULTS, 5);
        const offset = clamp(params.offset, 0, 10000, 0);

        const data = await queryActionApi(lang, {
            action: "query",
            list: "search",
            srsearch: query,
            srlimit: limit,
            sroffset: offset,
            srprop: "snippet|titlesnippet|wordcount|timestamp|sectionsnippet",
            srsort: "relevance"
        });

        if (!data || !data.query || !data.query.search) {
            throw new Error("API 返回数据结构异常");
        }

        const totalHits = data.query.searchinfo ? data.query.searchinfo.totalhits : 0;
        return Formatter.searchResults(data.query.search, query, lang, totalHits);
    }

    /**
     * 工具 2：获取条目摘要
     * API 策略：优先使用 REST API（/page/summary），降级到 Action API
     * REST API 返回结构化数据，包含描述、缩略图等元信息
     */
    async function getSummaryCore(params) {
        const title = params.title;
        if (!title || String(title).trim() === "") {
            throw new Error("条目标题 (title) 不能为空");
        }

        const lang = normalizeLang(params.lang);
        const sentences = clamp(params.sentences, 1, LIMITS.MAX_SUMMARY_SENTENCES, 5);

        // 策略一：尝试 REST API (Wikimedia REST API /page/summary)
        try {
            const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
            const proxyBase = getProxyBase();
            const restUrl = proxyBase
                ? `${proxyBase}/${lang}/api/rest_v1/page/summary/${encodedTitle}`
                : `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
            const restData = await httpGetJson(restUrl);

            if (restData && restData.type !== "not_found" && restData.extract) {
                // REST API 成功，返回丰富数据
                return Formatter.summary(restData, lang);
            }
        } catch (restErr) {
            console.warn(`${LOG_TAG} REST API 摘要降级: ${restErr.message}`);
        }

        // 策略二：降级到 Action API (action=query, prop=extracts|pageimages|info)
        const data = await queryActionApi(lang, {
            action: "query",
            titles: title,
            prop: "extracts|pageimages|info|description",
            exintro: "1",
            explaintext: "1",
            exsentences: sentences,
            piprop: "thumbnail",
            pithumbsize: 400,
            inprop: "url",
            redirects: "1"
        });

        if (!data || !data.query || !data.query.pages) {
            throw new Error("API 返回数据结构异常");
        }

        const pages = data.query.pages;
        // formatversion=2 下 pages 是数组
        const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];

        if (!page || page.missing === true || page.missing === "") {
            throw new Error(`条目「${title}」不存在。请检查标题拼写，或尝试使用 search_articles 搜索。`);
        }

        return Formatter.summary(page, lang);
    }

    /**
     * 工具 3：获取全文内容
     * API：action=query, prop=revisions (rvprop=content) 或 action=parse
     * 使用 action=parse 获取纯文本更高效
     */
    async function getFullContentCore(params) {
        const title = params.title;
        if (!title || String(title).trim() === "") {
            throw new Error("条目标题 (title) 不能为空");
        }

        const lang = normalizeLang(params.lang);
        const sectionIndex = params.section_index;

        // 构建请求参数
        const apiParams = {
            action: "parse",
            page: title,
            prop: "wikitext",
            redirects: "1"
        };

        // 如果指定了章节索引
        if (sectionIndex !== undefined && sectionIndex !== null && !isNaN(sectionIndex)) {
            apiParams.section = Math.max(0, Math.floor(Number(sectionIndex)));
        }

        const data = await queryActionApi(lang, apiParams);

        if (!data || !data.parse) {
            // 可能是页面不存在
            if (data && data.error) {
                throw new Error(`API 错误: ${data.error.info || data.error.code || "未知错误"}`);
            }
            throw new Error(`条目「${title}」不存在或无法解析。`);
        }

        const parsedTitle = data.parse.title || title;
        const wikitext = data.parse.wikitext;

        // formatversion=2 下 wikitext 是字符串; 否则是 { "*": "..." }
        const content = typeof wikitext === "string" ? wikitext : (wikitext && wikitext["*"]) || "";

        return Formatter.fullContent(parsedTitle, content, lang);
    }

    /**
     * 工具 4：获取目录结构
     * API：action=parse, prop=sections
     */
    async function getSectionsCore(params) {
        const title = params.title;
        if (!title || String(title).trim() === "") {
            throw new Error("条目标题 (title) 不能为空");
        }

        const lang = normalizeLang(params.lang);

        const data = await queryActionApi(lang, {
            action: "parse",
            page: title,
            prop: "sections",
            redirects: "1"
        });

        if (!data || !data.parse) {
            if (data && data.error) {
                throw new Error(`API 错误: ${data.error.info || data.error.code}`);
            }
            throw new Error(`条目「${title}」不存在或无法解析。`);
        }

        const parsedTitle = data.parse.title || title;
        const sections = data.parse.sections || [];

        return Formatter.sections(sections, parsedTitle, lang);
    }

    /**
     * 工具 5：获取分类信息
     * API：
     *   mode='of'      → action=query, prop=categories (条目所属分类)
     *   mode='members'  → action=query, list=categorymembers (分类下的成员)
     */
    async function getCategoriesCore(params) {
        const title = params.title;
        if (!title || String(title).trim() === "") {
            throw new Error("标题 (title) 不能为空");
        }

        const lang = normalizeLang(params.lang);
        const mode = (params.mode || "of").toLowerCase();
        const limit = clamp(params.limit, 1, LIMITS.MAX_CATEGORY_MEMBERS, 20);

        if (mode === "members") {
            // 获取分类下的成员页面
            const cmTitle = title.indexOf(":") === -1 ? "Category:" + title : title;

            const data = await queryActionApi(lang, {
                action: "query",
                list: "categorymembers",
                cmtitle: cmTitle,
                cmlimit: limit,
                cmprop: "title|type|timestamp",
                cmtype: "page|subcat|file"
            });

            if (!data || !data.query || !data.query.categorymembers) {
                if (data && data.error) {
                    throw new Error(`API 错误: ${data.error.info || data.error.code}`);
                }
                throw new Error(`分类「${cmTitle}」不存在或无法访问。`);
            }

            return Formatter.categories(data.query.categorymembers, cmTitle, mode, lang);

        } else {
            // 获取条目所属的分类
            const data = await queryActionApi(lang, {
                action: "query",
                titles: title,
                prop: "categories",
                cllimit: limit,
                clshow: "!hidden",
                redirects: "1"
            });

            if (!data || !data.query || !data.query.pages) {
                throw new Error("API 返回数据结构异常");
            }

            const pages = data.query.pages;
            const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];

            if (!page || page.missing === true) {
                throw new Error(`条目「${title}」不存在。`);
            }

            const categories = page.categories || [];
            return Formatter.categories(categories, page.title || title, mode, lang);
        }
    }

    /**
     * 工具 6：获取跨语言链接
     * API：action=query, prop=langlinks
     */
    async function getLanglinksCore(params) {
        const title = params.title;
        if (!title || String(title).trim() === "") {
            throw new Error("条目标题 (title) 不能为空");
        }

        const lang = normalizeLang(params.lang);
        const targetLangs = params.target_langs;

        const apiParams = {
            action: "query",
            titles: title,
            prop: "langlinks",
            lllimit: "max",
            llprop: "autonym|langname",
            redirects: "1"
        };

        // 如果指定了目标语言过滤
        if (targetLangs && String(targetLangs).trim() !== "") {
            apiParams.lllang = String(targetLangs).split(",").map(function (s) { return s.trim(); }).join("|");
        }

        const data = await queryActionApi(lang, apiParams);

        if (!data || !data.query || !data.query.pages) {
            throw new Error("API 返回数据结构异常");
        }

        const pages = data.query.pages;
        const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];

        if (!page || page.missing === true) {
            throw new Error(`条目「${title}」不存在。`);
        }

        const langlinks = page.langlinks || [];
        return Formatter.langlinks(langlinks, page.title || title, lang);
    }

    /**
     * 工具 7：获取随机条目
     * API：action=query, generator=random + prop=extracts|pageimages
     * 使用 generator 模式一次性获取随机条目及其摘要
     */
    async function getRandomCore(params) {
        const lang = normalizeLang(params.lang);
        const count = clamp(params.count, 1, LIMITS.MAX_RANDOM_COUNT, 3);

        const data = await queryActionApi(lang, {
            action: "query",
            generator: "random",
            grnnamespace: 0,
            grnlimit: count,
            prop: "extracts|pageimages|info",
            exintro: "1",
            explaintext: "1",
            exlimit: "max",
            exsentences: 3,
            piprop: "thumbnail",
            pithumbsize: 300,
            inprop: "url"
        });

        if (!data || !data.query || !data.query.pages) {
            throw new Error("API 返回数据结构异常");
        }

        const pages = data.query.pages;
        const articles = Array.isArray(pages) ? pages : Object.values(pages);

        return Formatter.randomArticles(articles, lang);
    }

    /**
     * 工具 8：获取新闻动态/历史上的今天
     * 
     * 策略：
     * - 中文维基：解析 Portal:新闻动态 或 Wikipedia:历史上的今天/<月>月<日>日
     * - 英文维基：解析 Portal:Current_events 或使用 Wikimedia feed API
     * 
     * 优先使用 Wikimedia REST feed API（更结构化），降级到 Action API parse
     */
    async function getCurrentEventsCore(params) {
        const lang = normalizeLang(params.lang);
        const type = (params.type || "news").toLowerCase();

        // 策略一：尝试 Wikimedia REST feed API（英文维基有丰富的 feed 接口）
        if (type === "onthisday") {
            try {
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                const proxyBase = getProxyBase();
                const feedUrl = proxyBase
                    ? `${proxyBase}/${lang}/api/rest_v1/feed/onthisday/events/${month}/${day}`
                    : `https://${lang}.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
                const feedData = await httpGetJson(feedUrl);

                if (feedData && feedData.events && feedData.events.length > 0) {
                    const buf = [];
                    const displayEvents = feedData.events.slice(0, 15); // 最多显示 15 条

                    displayEvents.forEach(function (evt) {
                        const year = evt.year || "";
                        const text = evt.text || "";
                        const pages = evt.pages || [];
                        const relatedTitle = pages.length > 0 ? pages[0].title || "" : "";

                        let line = `- **${year}年**：${text}`;
                        if (relatedTitle) {
                            line += ` → [${relatedTitle}](${buildPageUrl(lang, relatedTitle)})`;
                        }
                        buf.push(line);
                    });

                    return Formatter.currentEvents(buf.join("\n"), type, lang);
                }
            } catch (feedErr) {
                console.warn(`${LOG_TAG} Feed API 降级: ${feedErr.message}`);
            }
        }

        // 策略二：降级到 Action API，直接解析对应的维基百科页面
        let pageTitle = "";

        if (type === "onthisday") {
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();

            if (lang === "zh") {
                pageTitle = `Wikipedia:历史上的今天/${month}月${day}日`;
            } else if (lang === "en") {
                const months = ["", "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
                pageTitle = `Wikipedia:Selected anniversaries/${months[month]} ${day}`;
            } else {
                // 通用降级：尝试解析首页的 On This Day 板块
                pageTitle = lang === "ja" ? `Wikipedia:今日は何の日 ${month}月` :
                            `Wikipedia:On this day/${month}/${day}`;
            }
        } else {
            // 新闻动态
            if (lang === "zh") {
                pageTitle = "Portal:新聞動態";
            } else if (lang === "en") {
                pageTitle = "Portal:Current_events";
            } else if (lang === "ja") {
                pageTitle = "Portal:最近の出来事";
            } else if (lang === "fr") {
                pageTitle = "Portail:Actualités";
            } else if (lang === "de") {
                pageTitle = "Portal:Aktuelle Ereignisse";
            } else if (lang === "es") {
                pageTitle = "Portal:Actualidad";
            } else {
                pageTitle = "Portal:Current_events";
            }
        }

        // 使用 action=parse 获取页面渲染后的文本
        const data = await queryActionApi(lang, {
            action: "parse",
            page: pageTitle,
            prop: "wikitext",
            redirects: "1"
        });

        if (!data || !data.parse) {
            if (data && data.error) {
                throw new Error(`页面「${pageTitle}」不存在: ${data.error.info || "未知错误"}`);
            }
            throw new Error(`无法获取页面「${pageTitle}」的内容。`);
        }

        const wikitext = data.parse.wikitext;
        const raw = typeof wikitext === "string" ? wikitext : (wikitext && wikitext["*"]) || "";

        // 清洗维基文本为可读格式
        let cleaned = cleanWikitext(raw);

        // 自动截断
        if (cleaned.length > 5000) {
            cleaned = cleaned.substring(0, 5000) + "\n\n*(内容过长，已自动截断)*";
        }

        return Formatter.currentEvents(cleaned, type, lang);
    }

    /**
     * 工具 9：API 连通性测试
     * 验证代理配置或直连 wikipedia.org 的网络可达性
     */
    async function testCore(params) {
        const lang = "en"; // 使用英文维基作为测试目标（最稳定）
        const proxyBase = getProxyBase();
        const apiUrl = buildActionApiUrl(lang);
        const testUrl = apiUrl + "?action=query&list=search&srsearch=Wikipedia&srlimit=1&format=json&formatversion=2&origin=*";
        const startTime = Date.now();

        let connected = false;
        let latency = 0;
        let errorMsg = null;

        try {
            const data = await httpGetJson(testUrl);
            latency = Date.now() - startTime;
            connected = !!(data && data.query);
        } catch (e) {
            latency = Date.now() - startTime;
            errorMsg = e.message;
        }

        let report = "## 🔧 维基百科 API 连通性诊断报告\n\n";
        report += "> 测试时间: " + new Date().toLocaleString("zh-CN", { hour12: false }) + "\n\n";
        report += "| 项目 | 状态 |\n";
        report += "| :--- | :--- |\n";
        report += "| API 连通性 | " + (connected ? "✅ 正常" : "❌ 失败") + " |\n";
        report += "| 响应延迟 | " + latency + " ms |\n";
        report += "| 代理模式 | " + (proxyBase ? "✅ 自定义代理已启用" : "⚠️ 直连模式（国内可能无法访问）") + " |\n";
        report += "| 代理地址 | " + (proxyBase || "未配置，直连 wikipedia.org") + " |\n";
        report += "| 测试端点 | " + apiUrl + " |\n";
        if (errorMsg) {
            report += "| 错误信息 | " + errorMsg + " |\n";
        }

        if (!connected) {
            report += "\n### 💡 故障排查建议\n\n";
            if (!proxyBase) {
                report += "- 国内网络通常无法直连 wikipedia.org，请配置 `WIKI_PROXY_URL` 环境变量指向反向代理\n";
                report += "- 代理格式示例：`https://wiki.example.com`（不含末尾斜杠）\n";
                report += "- 代理路径约定：`{proxy}/{lang}/w/api.php`\n";
            } else {
                report += "- 检查代理地址 `" + proxyBase + "` 是否可正常访问\n";
                report += "- 确认代理路径约定：`{proxy}/{lang}/w/api.php`\n";
                report += "- 检查代理服务器是否正确转发维基百科 API 请求\n";
            }
        }

        complete({
            success: connected,
            message: connected
                ? "维基百科 API 连通性测试通过，延迟 " + latency + " ms"
                : "维基百科 API 连通性测试失败" + (errorMsg ? ": " + errorMsg : ""),
            data: report,
            meta: { latency_ms: latency }
        });
    }

    // ==========================================================================
    // 第七部分：公开接口暴露
    // ==========================================================================

    return {
        /**
         * 搜索条目入口
         */
        search_articles: function (p) {
            return wrapExecution(searchArticlesCore, p, "条目搜索");
        },

        /**
         * 获取摘要入口
         */
        get_summary: function (p) {
            return wrapExecution(getSummaryCore, p, "摘要获取");
        },

        /**
         * 获取全文入口
         */
        get_full_content: function (p) {
            return wrapExecution(getFullContentCore, p, "全文获取");
        },

        /**
         * 获取目录结构入口
         */
        get_sections: function (p) {
            return wrapExecution(getSectionsCore, p, "目录解析");
        },

        /**
         * 获取分类信息入口
         */
        get_categories: function (p) {
            return wrapExecution(getCategoriesCore, p, "分类查询");
        },

        /**
         * 获取跨语言链接入口
         */
        get_langlinks: function (p) {
            return wrapExecution(getLanglinksCore, p, "跨语言链接查询");
        },

        /**
         * 获取随机条目入口
         */
        get_random: function (p) {
            return wrapExecution(getRandomCore, p, "随机条目获取");
        },

        /**
         * 获取新闻动态入口
         */
        get_current_events: function (p) {
            return wrapExecution(getCurrentEventsCore, p, "新闻动态获取");
        },

        /**
         * API 连通性测试入口
         * 调用方式：无需传入任何参数
         */
        test: function (p) {
            testCore(p).catch(function (e) {
                console.error(LOG_TAG + " 连通性测试异常: " + e.message);
                complete({ success: false, message: "连通性测试异常: " + e.message });
            });
        }
    };

})();

// ==============================================================================
// 导出工具接口（严格匹配 METADATA 中的 tools[].name）
// ==============================================================================

exports.search_articles    = WikiSearchToolkit.search_articles;
exports.get_summary        = WikiSearchToolkit.get_summary;
exports.get_full_content   = WikiSearchToolkit.get_full_content;
exports.get_sections       = WikiSearchToolkit.get_sections;
exports.get_categories     = WikiSearchToolkit.get_categories;
exports.get_langlinks      = WikiSearchToolkit.get_langlinks;
exports.get_random         = WikiSearchToolkit.get_random;
exports.get_current_events = WikiSearchToolkit.get_current_events;
exports.test               = WikiSearchToolkit.test;