/* METADATA
{
    "name": "en_news_search",
    "version": "1.0",
    "display_name": {
        "zh": "外网新闻聚合",
        "en": "International News Aggregator"
    },
    "description": {
        "zh": "外网新闻聚合搜索工具包。整合 Google News RSS、BBC News RSS、Currents API、Bing News 及 WikiNews 五大新闻源，提供关键词搜索、分类浏览、热点头条、多源聚合等功能。支持多语言、多地区筛选及智能摘要截断，兼顾信息量与 Token 效率。",
        "en": "Multi-source aggregated news search toolkit. Integrates Google News RSS, BBC News RSS, Currents API, Bing News, and WikiNews. Provides keyword search, category browsing, trending headlines, and multi-source aggregation with smart truncation for token efficiency."
    },
    "env": [
        {
            "name": "CURRENTS_API_KEY",
            "description": {
                "zh": "Currents API 密钥（可选，免费注册获取：https://currentsapi.services/）。不配置时将跳过 Currents 源。",
                "en": "Currents API key (optional, free at https://currentsapi.services/). Skips Currents source if not set."
            },
            "required": false
        },
        {
            "name": "GOOGLE_NEWS_PROXY",
            "description": {
                "zh": "Google News 反向代理域名（可选，用于国内无代理访问）。格式：news-proxy.yourdomain.com",
                "en": "Google News reverse proxy domain (optional, for China access). Format: news-proxy.yourdomain.com"
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "search_news",
            "description": {
                "zh": "按关键词搜索新闻。自动聚合多个新闻源的搜索结果，返回去重后的精选新闻列表。支持语言和地区筛选。",
                "en": "Search news by keywords. Aggregates results from multiple sources with deduplication. Supports language and region filtering."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "description": { "zh": "搜索关键词", "en": "Search keyword" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量上限（默认 10，最大 30）", "en": "Max results to return (default 10, max 30)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "language",
                    "description": { "zh": "语言代码（如 zh、en、ja），默认 en", "en": "Language code (e.g. zh, en, ja), default en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "region",
                    "description": { "zh": "地区代码（如 CN、US、JP），默认 US", "en": "Region code (e.g. CN, US, JP), default US" },
                    "type": "string",
                    "required": false,
                    "default": "US"
                }
            ]
        },
        {
            "name": "get_headlines",
            "description": {
                "zh": "获取当前热门头条新闻。支持按分类和地区筛选，可从多个源获取最新头条。",
                "en": "Get current trending headlines. Supports category and region filtering from multiple sources."
            },
            "parameters": [
                {
                    "name": "category",
                    "description": { "zh": "新闻分类：general（综合）、business（商业）、technology（科技）、entertainment（娱乐）、health（健康）、science（科学）、sports（体育）", "en": "Category: general, business, technology, entertainment, health, science, sports" },
                    "type": "string",
                    "required": false,
                    "default": "general"
                },
                {
                    "name": "region",
                    "description": { "zh": "地区代码（如 CN、US、JP、GB），默认 US", "en": "Region code (e.g. CN, US, JP, GB), default US" },
                    "type": "string",
                    "required": false,
                    "default": "US"
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量（默认 10，最大 25）", "en": "Max results (default 10, max 25)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "get_topic_news",
            "description": {
                "zh": "获取 Google News 特定主题的新闻。主题包括：WORLD（国际）、NATION（国内）、BUSINESS（商业）、TECHNOLOGY（科技）、ENTERTAINMENT（娱乐）、SPORTS（体育）、SCIENCE（科学）、HEALTH（健康）。",
                "en": "Get Google News topic-specific news. Topics: WORLD, NATION, BUSINESS, TECHNOLOGY, ENTERTAINMENT, SPORTS, SCIENCE, HEALTH."
            },
            "parameters": [
                {
                    "name": "topic",
                    "description": { "zh": "主题标识：WORLD、NATION、BUSINESS、TECHNOLOGY、ENTERTAINMENT、SPORTS、SCIENCE、HEALTH", "en": "Topic: WORLD, NATION, BUSINESS, TECHNOLOGY, ENTERTAINMENT, SPORTS, SCIENCE, HEALTH" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "language",
                    "description": { "zh": "语言代码，默认 en", "en": "Language code, default en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "region",
                    "description": { "zh": "地区代码，默认 US", "en": "Region code, default US" },
                    "type": "string",
                    "required": false,
                    "default": "US"
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量（默认 10，最大 25）", "en": "Max results (default 10, max 25)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "aggregate_news",
            "description": {
                "zh": "多源深度聚合搜索。同时查询所有可用新闻源，合并去重并按时间排序，适合需要全面了解某一话题的场景。返回各源的命中情况统计。",
                "en": "Deep multi-source aggregation. Queries all available sources simultaneously, merges and deduplicates by time. Returns hit statistics per source."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "description": { "zh": "搜索关键词", "en": "Search keyword" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果总数上限（默认 15，最大 40）", "en": "Max total results (default 15, max 40)" },
                    "type": "number",
                    "required": false,
                    "default": 15
                },
                {
                    "name": "language",
                    "description": { "zh": "语言代码，默认 en", "en": "Language code, default en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试新闻源连通性。检测 Currents API 配置状态（其他源免费无需密钥）。验证环境变量配置。",
                "en": "Test news source connectivity. Check Currents API configuration status (other sources are free and require no key). Verify environment variables."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称：外网新闻聚合搜索 (EN News Search Aggregator)
 * ----------------------------------------------------------------------------
 * 架构说明：
 *
 * 本工具包采用 IIFE + Wrapper 生产级架构模式，实现五大新闻源的统一聚合：
 *
 *   1. Google News RSS  — 免费无需密钥，全球最大新闻聚合源
 *   2. BBC News RSS     — 免费无需密钥，BBC 官方 RSS 源，分类丰富、长期稳定
 *   3. Currents API     — 免费注册获取密钥，支持关键词搜索和实时新闻流
 *   4. Bing News RSS    — 免费无需密钥，微软 Bing 新闻 RSS 源
 *   5. WikiNews RSS     — 免费无需密钥，维基新闻 Atom 源
 *
 * 核心技术特性：
 *   - 多源并发调度：利用 Promise.allSettled 实现高容错并发请求
 *   - 智能去重引擎：基于标题 Jaccard 相似度的模糊匹配去重
 *   - Token 效率优化：摘要智能截断至 150 字符，标题截断至 100 字符
 *   - XML/RSS 解析器：纯正则实现，无需外部 XML 解析库
 *   - HTML 实体解码：覆盖常见 HTML 实体与数字编码
 *   - 三级降级策略：主源失败时自动切换备用源，保证结果可用性
 *
 * 版本：v1.0
 * 运行环境：Operit JavaScript 沙箱 (ES5+, OkHttp)
 * ============================================================================
 */
const newsSearchToolkit = (function () {

    // =========================================================================
    // 第一部分：基础配置与常量定义
    // =========================================================================

    /**
     * HTTP 客户端单例
     */
    const client = OkHttp.newClient();

    /**
     * 全局配置常量
     */
    const CONFIG = {
        // 摘要最大字符数（中文约 75 字，英文约 25 词）
        MAX_DESCRIPTION_LENGTH: 150,
        // 标题最大字符数
        MAX_TITLE_LENGTH: 100,
        // 单源请求超时（毫秒）
        REQUEST_TIMEOUT: 15000,
        // 去重相似度阈值（0-1，越大越严格）
        DEDUP_THRESHOLD: 0.45,
        // 默认 User-Agent
        USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        // Google News RSS 基础 URL（支持反代）
        GOOGLE_NEWS_RSS: (getEnv("GOOGLE_NEWS_PROXY") ? "https://" + getEnv("GOOGLE_NEWS_PROXY") : "https://news.google.com") + "/rss",
        // BBC News RSS（无需 Key，稳定可靠）
        BBC_NEWS_RSS: "https://feeds.bbci.co.uk/news",
        // Currents API 基础 URL
        CURRENTS_API: "https://api.currentsapi.services/v1",
        // WikiNews Atom Feed 基础 URL
        WIKINEWS_ATOM: "https://en.wikinews.org/w/index.php"
    };

    /**
     * Google News 主题映射表
     */
    const GOOGLE_TOPICS = {
        "WORLD":         "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB",
        "NATION":        "CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE",
        "BUSINESS":      "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
        "TECHNOLOGY":    "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB",
        "ENTERTAINMENT": "CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB",
        "SPORTS":        "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB",
        "SCIENCE":       "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB",
        "HEALTH":        "CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ"
    };

    /**
     * BBC News RSS 分类路径映射表
     */
    const BBC_CATEGORY_MAP = {
        "general":       "",
        "business":      "/business",
        "technology":    "/technology",
        "entertainment": "/entertainment_and_arts",
        "health":        "/health",
        "science":       "/science_and_environment",
        "sports":        "/sport"
    };

    // =========================================================================
    // 第二部分：通用工具函数
    // =========================================================================

    /**
     * HTML 实体解码器
     * 覆盖常见命名实体与数字编码（十进制和十六进制）
     * @param {string} str - 包含 HTML 实体的原始字符串
     * @returns {string} 解码后的纯文本字符串
     */
    function decodeHtmlEntities(str) {
        if (!str) return "";
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#10;/g, "\n")
            .replace(/&#13;/g, "\r")
            .replace(/&nbsp;/g, " ")
            .replace(/&mdash;/g, "—")
            .replace(/&ndash;/g, "–")
            .replace(/&hellip;/g, "…")
            .replace(/&laquo;/g, "«")
            .replace(/&raquo;/g, "»")
            .replace(/&#(\d+);/g, function (match, dec) {
                return String.fromCharCode(parseInt(dec, 10));
            })
            .replace(/&#x([0-9a-fA-F]+);/g, function (match, hex) {
                return String.fromCharCode(parseInt(hex, 16));
            });
    }

    /**
     * 文本清洗工具
     * 去除 HTML 标签、多余空白、换行符，并进行实体解码
     * @param {string} text - 原始文本
     * @returns {string} 清洗后的纯文本
     */
    function cleanText(text) {
        if (!text) return "";
        let cleaned = text
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")  // 解除 CDATA 包裹
            .replace(/<[^>]*>/g, "")                         // 移除所有 HTML 标签
            .replace(/\r\n|\r|\n/g, " ")                     // 换行转空格
            .replace(/\s+/g, " ")                            // 合并多余空白
            .trim();
        return decodeHtmlEntities(cleaned);
    }

    /**
     * 智能截断函数
     * 在最大长度内截断文本，尽量在自然断点（句号、逗号、空格）处断开
     * @param {string} text - 原始文本
     * @param {number} maxLen - 最大字符数
     * @returns {string} 截断后的文本
     */
    function smartTruncate(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        let truncated = text.substring(0, maxLen);
        // 尝试在句号、逗号或空格处自然断开
        const breakPoints = [
            truncated.lastIndexOf("。"),
            truncated.lastIndexOf(". "),
            truncated.lastIndexOf("，"),
            truncated.lastIndexOf(", "),
            truncated.lastIndexOf(" ")
        ];
        const bestBreak = Math.max.apply(null, breakPoints);
        if (bestBreak > maxLen * 0.6) {
            truncated = truncated.substring(0, bestBreak + 1);
        }
        return truncated.trim() + "…";
    }

    /**
     * XML 标签内容提取器
     * 支持带属性标签和 CDATA 内容
     * @param {string} xml - XML 文本块
     * @param {string} tag - 目标标签名
     * @returns {string} 提取并清洗后的文本内容
     */
    function extractXmlTag(xml, tag) {
        const regex = new RegExp(
            "<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i"
        );
        const match = xml.match(regex);
        if (!match) return "";
        return cleanText(match[1]);
    }

    /**
     * XML 标签原始内容提取器（不清洗，保留 HTML）
     * @param {string} xml - XML 文本块
     * @param {string} tag - 目标标签名
     * @returns {string} 原始文本内容
     */
    function extractXmlTagRaw(xml, tag) {
        const regex = new RegExp(
            "<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i"
        );
        const match = xml.match(regex);
        if (!match) return "";
        let content = match[1];
        // 解除 CDATA
        content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
        return content.trim();
    }

    /**
     * 基于 Jaccard 系数的标题相似度计算
     * 将标题拆分为 bigram 集合后计算交集与并集之比
     * @param {string} a - 标题 A
     * @param {string} b - 标题 B
     * @returns {number} 相似度（0-1）
     */
    function titleSimilarity(a, b) {
        if (!a || !b) return 0;
        const normalize = function (s) {
            return s.toLowerCase()
                .replace(/[^\w\u4e00-\u9fff]/g, "")  // 保留字母数字和中文
                .trim();
        };
        const na = normalize(a);
        const nb = normalize(b);
        if (na === nb) return 1;
        if (na.length < 4 || nb.length < 4) return 0;

        // 生成 bigram 集合
        const bigramsA = new Set();
        const bigramsB = new Set();
        for (let i = 0; i < na.length - 1; i++) bigramsA.add(na.substring(i, i + 2));
        for (let i = 0; i < nb.length - 1; i++) bigramsB.add(nb.substring(i, i + 2));

        // 计算交集大小
        let intersection = 0;
        bigramsA.forEach(function (bg) {
            if (bigramsB.has(bg)) intersection++;
        });

        const union = bigramsA.size + bigramsB.size - intersection;
        return union === 0 ? 0 : intersection / union;
    }

    /**
     * 新闻条目去重引擎
     * 基于标题 Jaccard 相似度过滤重复新闻
     * @param {Array} articles - 新闻条目数组
     * @returns {Array} 去重后的新闻数组
     */
    function deduplicateArticles(articles) {
        const unique = [];
        for (let i = 0; i < articles.length; i++) {
            let isDuplicate = false;
            for (let j = 0; j < unique.length; j++) {
                if (titleSimilarity(articles[i].title, unique[j].title) > CONFIG.DEDUP_THRESHOLD) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                unique.push(articles[i]);
            }
        }
        return unique;
    }

    /**
     * 日期标准化工具
     * 将各种日期格式统一为 YYYY-MM-DD HH:mm 格式
     * @param {string} dateStr - 原始日期字符串
     * @returns {string} 标准化后的日期字符串
     */
    function normalizeDate(dateStr) {
        if (!dateStr) return "未知时间";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr.substring(0, 19);
            const pad = function (n) { return n < 10 ? "0" + n : "" + n; };
            return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
                   " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
        } catch (e) {
            return dateStr.substring(0, 19);
        }
    }

    /**
     * 日期转时间戳工具（用于排序）
     * @param {string} dateStr - 日期字符串
     * @returns {number} Unix 时间戳（毫秒），解析失败返回 0
     */
    function dateToTimestamp(dateStr) {
        if (!dateStr) return 0;
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        } catch (e) {
            return 0;
        }
    }

    // =========================================================================
    // 第三部分：HTTP 请求封装
    // =========================================================================

    /**
     * 通用 HTTP GET 请求
     * @param {string} url - 请求地址
     * @param {Object} headers - 请求头（可选）
     * @returns {Promise<string|null>} 响应文本或 null
     */
    async function httpGet(url, headers) {
        try {
            const req = client.newRequest().url(url).method("GET");
            // 设置默认 User-Agent
            req.header("User-Agent", CONFIG.USER_AGENT);
            req.header("Accept", "*/*");
            req.header("Accept-Language", "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7");
            // 应用自定义请求头
            if (headers) {
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        req.header(key, headers[key]);
                    }
                }
            }
            const resp = await req.build().execute();
            if (resp.isSuccessful()) {
                return resp.content;
            }
            console.error("[NewsSearch] HTTP " + resp.statusCode + ": " + url);
            return null;
        } catch (e) {
            console.error("[NewsSearch] Request failed: " + url + " | " + e.message);
            return null;
        }
    }

    /**
     * 带 JSON 解析的 HTTP GET 请求
     * @param {string} url - 请求地址
     * @param {Object} headers - 请求头
     * @returns {Promise<Object|null>} 解析后的 JSON 对象或 null
     */
    async function httpGetJson(url, headers) {
        const raw = await httpGet(url, headers);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("[NewsSearch] JSON parse error: " + e.message);
            return null;
        }
    }

    // =========================================================================
    // 第四部分：新闻源适配器（Source Adapters）
    // =========================================================================

    /**
     * -----------------------------------------------------------------------
     * 适配器 1：Google News RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，支持关键词搜索、主题浏览、多语言多地区
     * 端点：https://news.google.com/rss/search?q=...&hl=...&gl=...&ceid=...
     * 返回格式：RSS 2.0 XML
     */
    const googleNewsAdapter = {

        /**
         * 关键词搜索
         * @param {string} keyword - 搜索关键词
         * @param {string} lang - 语言代码
         * @param {string} region - 地区代码
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        search: async function (keyword, lang, region, maxResults) {
            const hl = lang || "en";
            const gl = (region || "US").toUpperCase();
            const ceid = gl + ":" + hl;
            const url = CONFIG.GOOGLE_NEWS_RSS + "/search?q=" +
                encodeURIComponent(keyword) +
                "&hl=" + hl + "&gl=" + gl + "&ceid=" + encodeURIComponent(ceid);
            return await this._parseRss(url, maxResults, "Google News");
        },

        /**
         * 头条新闻
         * @param {string} lang - 语言代码
         * @param {string} region - 地区代码
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        headlines: async function (lang, region, maxResults) {
            const hl = lang || "en";
            const gl = (region || "US").toUpperCase();
            const ceid = gl + ":" + hl;
            const url = CONFIG.GOOGLE_NEWS_RSS + "?hl=" + hl +
                "&gl=" + gl + "&ceid=" + encodeURIComponent(ceid);
            return await this._parseRss(url, maxResults, "Google News");
        },

        /**
         * 主题新闻
         * @param {string} topicToken - 主题 Token（从 GOOGLE_TOPICS 映射表获取）
         * @param {string} lang - 语言代码
         * @param {string} region - 地区代码
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        topic: async function (topicToken, lang, region, maxResults) {
            const hl = lang || "en";
            const gl = (region || "US").toUpperCase();
            const ceid = gl + ":" + hl;
            const url = CONFIG.GOOGLE_NEWS_RSS + "/topics/" + topicToken +
                "?hl=" + hl + "&gl=" + gl + "&ceid=" + encodeURIComponent(ceid);
            return await this._parseRss(url, maxResults, "Google News");
        },

        /**
         * RSS XML 统一解析方法
         * @param {string} url - RSS 订阅地址
         * @param {number} maxResults - 最大结果数
         * @param {string} sourceName - 来源标识
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        _parseRss: async function (url, maxResults, sourceName) {
            const xml = await httpGet(url, {
                "Accept": "application/rss+xml, application/xml, text/xml"
            });
            if (!xml) return [];

            const articles = [];
            const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
            var match;
            while ((match = itemRegex.exec(xml)) !== null && articles.length < maxResults) {
                const block = match[1];
                const title = extractXmlTag(block, "title");
                const link = extractXmlTag(block, "link");
                const pubDate = extractXmlTag(block, "pubDate");
                const description = extractXmlTag(block, "description");

                // 提取真实来源（Google News 在 source 标签中标注原始媒体）
                const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
                const realSource = sourceMatch ? cleanText(sourceMatch[1]) : sourceName;

                if (title && link) {
                    articles.push({
                        title: smartTruncate(title, CONFIG.MAX_TITLE_LENGTH),
                        description: smartTruncate(description, CONFIG.MAX_DESCRIPTION_LENGTH),
                        url: link,
                        source: realSource,
                        publishedAt: pubDate || "",
                        _timestamp: dateToTimestamp(pubDate),
                        _origin: "google_news"
                    });
                }
            }
            return articles;
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 2：BBC News RSS
     * -----------------------------------------------------------------------
     * 特性：完全免费无需密钥，BBC 官方 RSS 源，内容稳定可靠
     * 端点：https://feeds.bbci.co.uk/news/{section}/rss.xml
     * 分类：general/business/technology/entertainment/health/science/sports
     */
    const bbcNewsAdapter = {

        /**
         * 获取 BBC 分类头条新闻
         * @param {string} category - 新闻分类（general/business/technology 等）
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        headlines: async function (category, maxResults) {
            const cat = (category || "general").toLowerCase();
            const sectionPath = BBC_CATEGORY_MAP.hasOwnProperty(cat)
                ? BBC_CATEGORY_MAP[cat]
                : "";
            const url = CONFIG.BBC_NEWS_RSS + sectionPath + "/rss.xml";
            const xml = await httpGet(url, { "Accept": "application/rss+xml, application/xml, text/xml" });
            if (!xml) return [];
            return parseRssXml(xml, maxResults, "BBC News", "bbc_news");
        },

        /**
         * 基于关键词的客户端筛选（从 BBC 综合频道获取后过滤）
         * @param {string} keyword - 搜索关键词
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 匹配的新闻条目数组
         */
        searchByKeyword: async function (keyword, maxResults) {
            const headlines = await this.headlines("general", 60);
            if (headlines.length === 0) return [];

            const kw = keyword.toLowerCase();
            const filtered = [];
            for (let i = 0; i < headlines.length && filtered.length < maxResults; i++) {
                const item = headlines[i];
                const searchText = (item.title + " " + (item.description || "")).toLowerCase();
                if (searchText.indexOf(kw) !== -1) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 3：Currents API
     * -----------------------------------------------------------------------
     * 特性：免费注册获取密钥，支持关键词搜索、实时新闻流、分类筛选
     * 端点：https://api.currentsapi.services/v1/search
     *       https://api.currentsapi.services/v1/latest-news
     * 限制：需要 API Key，免费额度 600 次/天
     */
    const currentsApiAdapter = {

        /**
         * 检查 Currents API 是否可用（即 Key 是否已配置）
         * @returns {boolean}
         */
        isAvailable: function () {
            const key = getEnv("CURRENTS_API_KEY");
            return !!(key && key.trim().length > 0);
        },

        /**
         * 获取 API 密钥
         * @returns {string}
         */
        _getKey: function () {
            return (getEnv("CURRENTS_API_KEY") || "").trim();
        },

        /**
         * 关键词搜索
         * @param {string} keyword - 搜索关键词
         * @param {string} lang - 语言代码
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        search: async function (keyword, lang, maxResults) {
            if (!this.isAvailable()) return [];

            const url = CONFIG.CURRENTS_API + "/search?keywords=" +
                encodeURIComponent(keyword) +
                "&language=" + (lang || "en") +
                "&page_size=" + Math.min(maxResults, 20) +
                "&apiKey=" + this._getKey();

            const data = await httpGetJson(url, {
                "Authorization": this._getKey()
            });

            return this._parseResponse(data);
        },

        /**
         * 获取最新新闻
         * @param {string} lang - 语言代码
         * @param {string} category - 分类
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        latest: async function (lang, category, maxResults) {
            if (!this.isAvailable()) return [];

            let url = CONFIG.CURRENTS_API + "/latest-news?language=" +
                (lang || "en") + "&apiKey=" + this._getKey();
            if (category && category !== "general") {
                url += "&category=" + encodeURIComponent(category);
            }

            const data = await httpGetJson(url, {
                "Authorization": this._getKey()
            });

            const articles = this._parseResponse(data);
            return articles.slice(0, maxResults);
        },

        /**
         * 统一响应解析
         * @param {Object} data - Currents API 响应 JSON
         * @returns {Array} 标准化新闻条目数组
         */
        _parseResponse: function (data) {
            if (!data || data.status !== "ok" || !data.news) return [];

            const articles = [];
            for (let i = 0; i < data.news.length; i++) {
                const item = data.news[i];
                if (!item.title) continue;
                articles.push({
                    title: smartTruncate(cleanText(item.title), CONFIG.MAX_TITLE_LENGTH),
                    description: smartTruncate(cleanText(item.description || ""), CONFIG.MAX_DESCRIPTION_LENGTH),
                    url: item.url || "",
                    source: item.author || "Currents",
                    publishedAt: item.published || "",
                    _timestamp: dateToTimestamp(item.published),
                    _origin: "currents_api"
                });
            }
            return articles;
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 4：Bing News RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，微软 Bing 新闻 RSS 源
     * 端点：https://www.bing.com/news/search?q=...&format=RSS
     * 返回格式：RSS 2.0 XML
     */
    const bingNewsAdapter = {

        /**
         * 关键词搜索
         * @param {string} keyword - 搜索关键词
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        search: async function (keyword, maxResults) {
            const url = "https://www.bing.com/news/search?q=" +
                encodeURIComponent(keyword) + "&format=RSS&count=" +
                Math.min(maxResults, 20);

            const xml = await httpGet(url, {
                "Accept": "application/rss+xml, application/xml, text/xml"
            });
            if (!xml) return [];

            const articles = [];
            const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
            var match;
            while ((match = itemRegex.exec(xml)) !== null && articles.length < maxResults) {
                const block = match[1];
                const title = extractXmlTag(block, "title");
                const link = extractXmlTag(block, "link");
                const pubDate = extractXmlTag(block, "pubDate");
                const description = extractXmlTag(block, "description");

                // 提取来源（Bing 可能在 News:Source 标签中）
                const sourceMatch = block.match(/<News:Source>([\s\S]*?)<\/News:Source>/i) ||
                                    block.match(/<news:source>([\s\S]*?)<\/news:source>/i);
                const source = sourceMatch ? cleanText(sourceMatch[1]) : "Bing News";

                if (title && link) {
                    articles.push({
                        title: smartTruncate(title, CONFIG.MAX_TITLE_LENGTH),
                        description: smartTruncate(description, CONFIG.MAX_DESCRIPTION_LENGTH),
                        url: link,
                        source: source,
                        publishedAt: pubDate || "",
                        _timestamp: dateToTimestamp(pubDate),
                        _origin: "bing_news"
                    });
                }
            }
            return articles;
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 5：WikiNews Atom Feed
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，维基新闻 Atom 源，公民新闻视角
     * 端点：https://en.wikinews.org/w/index.php?title=Special:NewsFeed&...
     * 返回格式：Atom XML
     */
    const wikiNewsAdapter = {

        /**
         * 获取最新维基新闻
         * @param {string} lang - 语言代码（影响 WikiNews 子域名）
         * @param {number} maxResults - 最大结果数
         * @returns {Promise<Array>} 标准化新闻条目数组
         */
        latest: async function (lang, maxResults) {
            // 支持 en, de, fr, es, pt, zh, ja 等语言
            const langCode = (lang || "en").toLowerCase();
            const baseUrl = "https://" + langCode + ".wikinews.org/w/index.php";
            const url = baseUrl + "?title=Special:NewsFeed&feed=atom&categories=Published" +
                "&notcategories=No%20publish%7CArchived%7CAutoArchived%7Cdisputed" +
                "&namespace=0&count=" + Math.min(maxResults, 15) + "&ordermethod=categoryadd" +
                "&stablepages=only";

            const xml = await httpGet(url, {
                "Accept": "application/atom+xml, application/xml"
            });
            if (!xml) return [];

            const articles = [];
            const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
            var match;
            while ((match = entryRegex.exec(xml)) !== null && articles.length < maxResults) {
                const block = match[1];
                const title = extractXmlTag(block, "title");
                const updated = extractXmlTag(block, "updated");
                const summary = extractXmlTag(block, "summary");

                // Atom 使用 <link href="..."/> 格式
                const linkMatch = block.match(/<link[^>]*href="([^"]*)"[^>]*\/>/i);
                const link = linkMatch ? decodeHtmlEntities(linkMatch[1]) : "";

                if (title && link) {
                    articles.push({
                        title: smartTruncate(title, CONFIG.MAX_TITLE_LENGTH),
                        description: smartTruncate(summary, CONFIG.MAX_DESCRIPTION_LENGTH),
                        url: link,
                        source: "WikiNews",
                        publishedAt: updated || "",
                        _timestamp: dateToTimestamp(updated),
                        _origin: "wikinews"
                    });
                }
            }
            return articles;
        }
    };

    // =========================================================================
    // 第五部分：结果格式化引擎
    // =========================================================================

    /**
     * 将标准化新闻条目数组格式化为 Markdown 报告
     * 设计目标：每条新闻控制在 3-4 行内，最大化信息密度同时控制 Token 消耗
     * @param {Array} articles - 标准化新闻条目数组
     * @param {string} reportTitle - 报告标题
     * @param {Object} meta - 元信息（可选）
     * @returns {string} Markdown 格式报告
     */
    function formatNewsReport(articles, reportTitle, meta) {
        const buffer = [];

        // 报告头部
        buffer.push("## " + reportTitle);
        buffer.push("---");

        if (meta) {
            const metaParts = [];
            if (meta.keyword) metaParts.push("关键词: **" + meta.keyword + "**");
            if (meta.total) metaParts.push("共 **" + meta.total + "** 条结果");
            if (meta.sources) metaParts.push("来源: " + meta.sources);
            if (metaParts.length > 0) {
                buffer.push(metaParts.join(" | "));
                buffer.push("");
            }
        }

        if (articles.length === 0) {
            buffer.push("未找到相关新闻。建议调整关键词或地区设置后重试。");
            return buffer.join("\n");
        }

        // 新闻条目列表
        for (let i = 0; i < articles.length; i++) {
            const item = articles[i];
            const idx = i + 1;

            // 标题行（含序号和来源标识）
            buffer.push("**" + idx + ". " + item.title + "**");

            // 摘要行（如有）
            if (item.description && item.description.length > 5) {
                buffer.push(item.description);
            }

            // 元信息行（来源 + 时间 + 链接）
            const infoParts = [];
            if (item.source) infoParts.push("📰 " + item.source);
            if (item.publishedAt) infoParts.push("🕐 " + normalizeDate(item.publishedAt));
            infoParts.push("🔗 " + item.url);
            buffer.push(infoParts.join(" | "));
            buffer.push(""); // 空行分隔
        }

        return buffer.join("\n");
    }

    /**
     * 聚合报告格式化器
     * 在标准报告基础上追加多源命中统计信息
     * @param {Array} articles - 去重后的新闻条目数组
     * @param {string} keyword - 搜索关键词
     * @param {Object} sourceStats - 各源命中统计 { sourceName: count }
     * @returns {string} Markdown 格式聚合报告
     */
    function formatAggregateReport(articles, keyword, sourceStats) {
        // 构建源统计摘要
        const statParts = [];
        for (var src in sourceStats) {
            if (sourceStats.hasOwnProperty(src) && sourceStats[src] > 0) {
                statParts.push(src + ": " + sourceStats[src] + "条");
            }
        }
        const sourceSummary = statParts.length > 0 ? statParts.join("、") : "无数据";

        const report = formatNewsReport(articles, "📡 多源聚合新闻搜索", {
            keyword: keyword,
            total: articles.length,
            sources: sourceSummary
        });

        return report;
    }

    // =========================================================================
    // 第六部分：核心业务逻辑
    // =========================================================================

    /**
     * 核心逻辑 1：关键词搜索新闻
     * 策略：并发查询 Google News + Bing News + Currents API，合并去重
     */
    async function searchNewsCore(params) {
        const keyword = params.keyword;
        if (!keyword || keyword.trim() === "") {
            throw new Error("参数 'keyword' 不能为空");
        }

        const maxResults = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 30);
        const lang = (params.language || "en").toLowerCase();
        const region = (params.region || "US").toUpperCase();

        // 并发请求多源（每源请求略多数量以备去重损耗）
        const perSource = Math.min(maxResults + 5, 20);
        const promises = [
            googleNewsAdapter.search(keyword, lang, region, perSource),
            bingNewsAdapter.search(keyword, perSource)
        ];

        // Currents API 仅在密钥可用时加入
        if (currentsApiAdapter.isAvailable()) {
            promises.push(currentsApiAdapter.search(keyword, lang, perSource));
        }

        // 容错并发
        const results = await Promise.allSettled(promises);
        let allArticles = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                allArticles = allArticles.concat(results[i].value);
            }
        }

        // 去重 + 按时间倒序排列
        let uniqueArticles = deduplicateArticles(allArticles);
        uniqueArticles.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });

        // 截取目标数量
        uniqueArticles = uniqueArticles.slice(0, maxResults);

        return formatNewsReport(uniqueArticles, "🔍 新闻搜索结果", {
            keyword: keyword,
            total: uniqueArticles.length
        });
    }

    /**
     * 核心逻辑 2：获取头条新闻
     * 策略：并发查询 Google News Headlines + NewsAPI Mirror + Currents Latest
     */
    async function getHeadlinesCore(params) {
        const category = (params.category || "general").toLowerCase();
        const region = (params.region || "US").toUpperCase();
        const maxResults = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 25);
        const perSource = Math.min(maxResults + 5, 20);

        const promises = [
            googleNewsAdapter.headlines("en", region, perSource),
            bbcNewsAdapter.headlines(category, perSource)
        ];

        if (currentsApiAdapter.isAvailable()) {
            promises.push(currentsApiAdapter.latest("en", category, perSource));
        }

        const results = await Promise.allSettled(promises);
        let allArticles = [];
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                allArticles = allArticles.concat(results[i].value);
            }
        }

        let uniqueArticles = deduplicateArticles(allArticles);
        uniqueArticles.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });
        uniqueArticles = uniqueArticles.slice(0, maxResults);

        const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
        return formatNewsReport(uniqueArticles, "📰 " + catLabel + " 头条新闻 (" + region + ")", {
            total: uniqueArticles.length
        });
    }

    /**
     * 核心逻辑 3：获取主题新闻
     * 策略：使用 Google News Topic RSS 获取特定主题新闻
     */
    async function getTopicNewsCore(params) {
        const topicKey = (params.topic || "").toUpperCase().trim();
        if (!topicKey) {
            throw new Error("参数 'topic' 不能为空");
        }

        const topicToken = GOOGLE_TOPICS[topicKey];
        if (!topicToken) {
            throw new Error(
                "不支持的主题: '" + topicKey + "'。支持的主题: " +
                Object.keys(GOOGLE_TOPICS).join(", ")
            );
        }

        const lang = (params.language || "en").toLowerCase();
        const region = (params.region || "US").toUpperCase();
        const maxResults = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 25);

        const articles = await googleNewsAdapter.topic(topicToken, lang, region, maxResults);

        const topicLabels = {
            "WORLD": "🌍 国际新闻", "NATION": "🏛️ 国内新闻",
            "BUSINESS": "💼 商业新闻", "TECHNOLOGY": "💻 科技新闻",
            "ENTERTAINMENT": "🎬 娱乐新闻", "SPORTS": "⚽ 体育新闻",
            "SCIENCE": "🔬 科学新闻", "HEALTH": "🏥 健康新闻"
        };

        return formatNewsReport(articles, topicLabels[topicKey] || "📰 " + topicKey + " 新闻", {
            total: articles.length
        });
    }

    /**
     * 核心逻辑 4：多源深度聚合搜索
     * 策略：同时查询全部五个新闻源，合并去重，附带各源命中统计
     */
    async function aggregateNewsCore(params) {
        const keyword = params.keyword;
        if (!keyword || keyword.trim() === "") {
            throw new Error("参数 'keyword' 不能为空");
        }

        const maxResults = Math.min(Math.max(parseInt(String(params.max_results || 15)), 1), 40);
        const lang = (params.language || "en").toLowerCase();
        const perSource = Math.min(maxResults + 3, 15);

        // 定义所有源的请求任务
        const taskDefs = [
            { name: "Google News", fn: googleNewsAdapter.search(keyword, lang, "US", perSource) },
            { name: "Bing News",   fn: bingNewsAdapter.search(keyword, perSource) },
            { name: "NewsAPI",     fn: newsApiMirrorAdapter.searchByKeyword(keyword, "us", perSource) },
            { name: "WikiNews",    fn: wikiNewsAdapter.latest(lang, perSource) }
        ];

        // Currents API 条件加入
        if (currentsApiAdapter.isAvailable()) {
            taskDefs.push({
                name: "Currents",
                fn: currentsApiAdapter.search(keyword, lang, perSource)
            });
        }

        // 发送中间状态通知
        if (typeof sendIntermediateResult === "function") {
            sendIntermediateResult({
                success: true,
                message: "正在查询 " + taskDefs.length + " 个新闻源，请稍候..."
            });
        }

        // 并发执行所有任务
        const promises = taskDefs.map(function (t) { return t.fn; });
        const results = await Promise.allSettled(promises);

        // 收集结果并统计各源命中
        let allArticles = [];
        const sourceStats = {};
        for (let i = 0; i < results.length; i++) {
            const srcName = taskDefs[i].name;
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                const items = results[i].value;
                sourceStats[srcName] = items.length;
                allArticles = allArticles.concat(items);
            } else {
                sourceStats[srcName] = 0;
            }
        }

        // 去重并排序
        let uniqueArticles = deduplicateArticles(allArticles);
        uniqueArticles.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });
        uniqueArticles = uniqueArticles.slice(0, maxResults);

        return formatAggregateReport(uniqueArticles, keyword, sourceStats);
    }

    // =========================================================================
    // 第七部分：统一错误处理包装器
    // =========================================================================

    /**
     * 通用 Wrapper 函数
     * 封装 try-catch + complete() 样板代码，统一处理成功与异常
     * @param {Function} coreFunc - 核心业务逻辑函数
     * @param {Object} params - 原始参数
     * @param {string} actionName - 操作名称（用于日志和错误提示）
     */
    async function wrapToolExecution(coreFunc, params, actionName) {
        try {
            const result = await coreFunc(params);
            complete({
                success: true,
                message: actionName + " 完成",
                data: result
            });
        } catch (error) {
            console.error("[NewsSearch] " + actionName + " 失败: " + error.message);
            complete({
                success: false,
                message: actionName + " 失败: " + error.message,
                error_stack: error.stack
            });
        }
    }

    // =========================================================================
    // 第八部分：公开接口暴露
    // =========================================================================

    /**
     * 格式化测试报告
     */
    /**
     * 测试新闻源连通性（实际请求验证）
     */
    async function testNewsAPIs() {
        const startTime = Date.now();

        // 测试 BBC News RSS
        let bbcOk = false, bbcLatency = 0, bbcError = "";
        try {
            const t = Date.now();
            const res = await httpClient.newRequest()
                .url(CONFIG.BBC_NEWS_RSS + "/rss.xml")
                .method("GET")
                .header("User-Agent", CONFIG.USER_AGENT)
                .header("Accept", "application/rss+xml, text/xml")
                .build().execute();
            bbcLatency = Date.now() - t;
            bbcOk = res.isSuccessful();
            if (!bbcOk) bbcError = "HTTP " + res.statusCode;
        } catch (e) {
            bbcLatency = Date.now() - startTime;
            bbcError = e.message.substring(0, 50);
        }

        // 测试 Bing News RSS
        let bingOk = false, bingLatency = 0, bingError = "";
        try {
            const t = Date.now();
            const res = await httpClient.newRequest()
                .url("https://www.bing.com/news/search?q=news&format=RSS")
                .method("GET")
                .header("User-Agent", CONFIG.USER_AGENT)
                .build().execute();
            bingLatency = Date.now() - t;
            bingOk = res.isSuccessful();
            if (!bingOk) bingError = "HTTP " + res.statusCode;
        } catch (e) {
            bingLatency = Date.now() - startTime;
            bingError = e.message.substring(0, 50);
        }

        const currentsKey = getEnv("CURRENTS_API_KEY");
        const currentsConfigured = !!(currentsKey && currentsKey.trim().length > 0);
        const hasGoogleProxy = !!(getEnv("GOOGLE_NEWS_PROXY") && getEnv("GOOGLE_NEWS_PROXY").trim());

        let report = '## 外网新闻源连通性测试\n\n';
        report += '| 新闻源 | 状态 | 延迟 | 说明 |\n';
        report += '| :--- | :--- | :--- | :--- |\n';
        report += `| Google News RSS | ${hasGoogleProxy ? "✅ 代理已配置" : "⚠️ 未配置代理"} | - | ${hasGoogleProxy ? getEnv("GOOGLE_NEWS_PROXY") : "国内需配置 GOOGLE_NEWS_PROXY"} |\n`;
        report += `| BBC News RSS | ${bbcOk ? "✅ 正常" : "❌ 失败"} | ${bbcLatency}ms | ${bbcOk ? "免费无需密钥" : bbcError} |\n`;
        report += `| Bing News RSS | ${bingOk ? "✅ 正常" : "❌ 失败"} | ${bingLatency}ms | ${bingOk ? "免费无需密钥" : bingError} |\n`;
        report += `| WikiNews Atom | ⚪ 未测试 | - | 免费无需密钥 |\n`;
        report += `| Currents API | ${currentsConfigured ? "✅ 已配置" : "❌ 未配置"} | - | ${currentsConfigured ? currentsKey.substring(0, 8) + "***" : "请配置 CURRENTS_API_KEY（免费注册）"} |\n`;

        const okCount = (bbcOk ? 1 : 0) + (bingOk ? 1 : 0);

        complete({
            success: okCount >= 1,
            message: `连通性测试完成：${okCount}/2 个已测源可达，Google/WikiNews 未实测`,
            data: report
        });
    }

    return {
        /**
         * 关键词搜索新闻
         */
        search_news: function (p) {
            return wrapToolExecution(searchNewsCore, p, "新闻搜索");
        },

        /**
         * 获取头条新闻
         */
        get_headlines: function (p) {
            return wrapToolExecution(getHeadlinesCore, p, "头条获取");
        },

        /**
         * 获取主题新闻
         */
        get_topic_news: function (p) {
            return wrapToolExecution(getTopicNewsCore, p, "主题新闻获取");
        },

        /**
         * 多源深度聚合搜索
         */
        aggregate_news: function (p) {
            return wrapToolExecution(aggregateNewsCore, p, "多源聚合搜索");
        },

        /**
         * 测试新闻源连通性
         */
        test: testNewsAPIs
    };

})();

// =============================================================================
// 导出工具接口（严格匹配 METADATA 中的工具名称）
// =============================================================================

exports.search_news    = newsSearchToolkit.search_news;
exports.get_headlines  = newsSearchToolkit.get_headlines;
exports.get_topic_news = newsSearchToolkit.get_topic_news;
exports.aggregate_news = newsSearchToolkit.aggregate_news;
exports.test           = newsSearchToolkit.test;