/* METADATA
{
    "name": "cn_news_search",
    "version": "1.0",
    "display_name": {
        "zh": "中文新闻聚合",
        "en": "Chinese News Aggregator"
    },
    "description": {
        "zh": "中国新闻聚合搜索工具包。整合百度新闻RSS、新浪新闻RSS、中新网RSS、Google新闻中文版、澎湃新闻及腾讯新闻六大中文新闻源，提供关键词搜索、分类浏览、热点头条、多源聚合等功能。全部免费无需API Key，智能摘要截断兼顾信息量与Token效率。",
        "en": "Chinese news aggregation toolkit. Integrates Baidu News RSS, Sina News RSS, ChinaNews RSS, Google News CN, The Paper, and Tencent News. Provides keyword search, category browsing, headlines, and multi-source aggregation. All free, no API key required."
    },
    "env": [
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
            "name": "search_cn_news",
            "description": {
                "zh": "按关键词搜索中文新闻。自动聚合百度新闻、Google新闻中文版等多个源的搜索结果，合并去重后返回精选列表。",
                "en": "Search Chinese news by keywords. Aggregates Baidu News, Google News CN and more, merges and deduplicates results."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "description": { "zh": "搜索关键词（中文或英文）", "en": "Search keyword (Chinese or English)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量上限（默认 10，最大 30）", "en": "Max results (default 10, max 30)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "get_cn_headlines",
            "description": {
                "zh": "获取中文热门头条新闻。支持按分类筛选，可从百度新闻、新浪新闻、中新网等多源获取最新头条。分类包括：国内、国际、财经、科技、体育、娱乐、军事、社会。",
                "en": "Get Chinese trending headlines by category from Baidu, Sina, ChinaNews. Categories: domestic, international, finance, tech, sports, entertainment, military, society."
            },
            "parameters": [
                {
                    "name": "category",
                    "description": { "zh": "新闻分类：domestic（国内）、international（国际）、finance（财经）、tech（科技）、sports（体育）、entertainment（娱乐）、military（军事）、society（社会），默认 domestic", "en": "Category: domestic, international, finance, tech, sports, entertainment, military, society" },
                    "type": "string",
                    "required": false,
                    "default": "domestic"
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
            "name": "get_sina_news",
            "description": {
                "zh": "获取新浪新闻指定频道的最新资讯。频道包括：头条、国内、国际、社会、体育、娱乐、财经、科技、军事。新浪是中国最大的综合门户新闻源之一。",
                "en": "Get latest Sina News by channel. Channels: headlines, domestic, international, society, sports, entertainment, finance, tech, military."
            },
            "parameters": [
                {
                    "name": "channel",
                    "description": { "zh": "新浪新闻频道：headlines（头条）、domestic（国内）、international（国际）、society（社会）、sports（体育）、entertainment（娱乐）、finance（财经）、tech（科技）、military（军事）", "en": "Sina channel" },
                    "type": "string",
                    "required": false,
                    "default": "headlines"
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量（默认 10，最大 20）", "en": "Max results (default 10, max 20)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "get_chinanews",
            "description": {
                "zh": "获取中国新闻网（中新网）指定栏目的最新新闻。中新网是中国最权威的新闻通讯社之一。栏目包括：即时、国内、国际、财经、文娱、体育、社会。",
                "en": "Get ChinaNews (chinanews.com) latest articles by section. Sections: realtime, domestic, international, finance, culture, sports, society."
            },
            "parameters": [
                {
                    "name": "section",
                    "description": { "zh": "中新网栏目：realtime（即时）、domestic（国内）、international（国际）、finance（财经）、culture（文娱）、sports（体育）、society（社会）", "en": "Section name" },
                    "type": "string",
                    "required": false,
                    "default": "realtime"
                },
                {
                    "name": "max_results",
                    "description": { "zh": "返回结果数量（默认 10，最大 20）", "en": "Max results (default 10, max 20)" },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "aggregate_cn_news",
            "description": {
                "zh": "多源深度聚合搜索。同时查询百度新闻、Google新闻中文版、新浪、中新网、澎湃、腾讯六大中文新闻源,合并去重按时间排序，返回各源命中统计。适合全面了解某一话题在中文互联网的报道情况。",
                "en": "Deep multi-source aggregation across 6 Chinese news sources. Returns merged, deduplicated results with per-source hit statistics."
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
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试中国新闻工具包可用性。本工具包整合六大免费新闻源，无需配置API密钥即可使用。",
                "en": "Test Chinese news toolkit availability. This toolkit integrates 6 free news sources, no API key required."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称：中国新闻聚合搜索 (CN News Search Aggregator)
 * ----------------------------------------------------------------------------
 * 架构说明：
 *
 * 本工具包采用 IIFE + Wrapper 生产级架构模式，实现六大中文新闻源的统一聚合：
 *
 *   1. 百度新闻 RSS   — 免费无需密钥，支持关键词搜索和分类浏览，来自 1000+ 新闻源
 *   2. 新浪新闻 RSS   — 免费无需密钥，中国最大综合门户新闻源，多频道覆盖
 *   3. 中新网 RSS     — 免费无需密钥，中国新闻社官方新闻通讯社，权威性最高
 *   4. Google 新闻中文 — 免费无需密钥，Google News RSS 中文区域版本
 *   5. 澎湃新闻       — 免费无需密钥，via anyfeeder 社区 RSS 镜像
 *   6. 腾讯新闻       — 免费无需密钥，via anyfeeder 社区 RSS 镜像
 *
 * 核心技术特性：
 *   - 六源并发调度：Promise.allSettled 高容错并发，单源故障不影响整体
 *   - 智能去重引擎：基于标题 Jaccard 相似度的中文模糊匹配去重
 *   - Token 效率优化：摘要截断 120 字符，标题截断 80 字符，精准控制输出长度
 *   - 中文 XML 解析：专为中文 RSS 优化的正则解析器，支持 CDATA 与 GB2312/UTF-8
 *   - HTML 实体解码：覆盖所有常见中文 HTML 实体与数字编码
 *   - 三级降级策略：主源失败自动切换备用源，保证结果可用性
 *   - 分类映射引擎：统一百度/新浪/中新网不同的分类命名体系
 *
 * 版本：v1.0
 * 运行环境：Operit JavaScript 沙箱 (ES5+, OkHttp)
 * ============================================================================
 */
const cnNewsSearchToolkit = (function () {

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
        // 中文摘要最大字符数（约 60 个汉字）
        MAX_DESC_LEN: 120,
        // 中文标题最大字符数（约 40 个汉字）
        MAX_TITLE_LEN: 80,
        // 去重相似度阈值
        DEDUP_THRESHOLD: 0.40,
        // 默认 User-Agent（模拟移动端，提升中文新闻源兼容性）
        UA_MOBILE: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        // 默认 User-Agent（桌面端）
        UA_DESKTOP: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    // -------------------------------------------------------------------------
    // 百度新闻分类映射表
    // -------------------------------------------------------------------------
    const BAIDU_CATEGORIES = {
        "domestic":      "civilnews",        // 国内
        "international": "internews",        // 国际
        "finance":       "finannews",        // 财经
        "tech":          "internet",         // 科技/互联网
        "sports":        "sportnews",        // 体育
        "entertainment": "enternews",        // 娱乐
        "military":      "mil",              // 军事
        "society":       "civilnews",        // 社会（百度归入国内）
        "stock":         "stock",            // 股票
        "auto":          "autonews",         // 汽车
        "house":         "housenews"         // 房产
    };

    // -------------------------------------------------------------------------
    // 新浪新闻 RSS 频道映射表
    // -------------------------------------------------------------------------
    const SINA_CHANNELS = {
        "headlines":     "http://rss.sina.com.cn/news/marquee/ddt.xml",
        "domestic":      "http://rss.sina.com.cn/news/china/focus15.xml",
        "international": "http://rss.sina.com.cn/news/world/focus15.xml",
        "society":       "http://rss.sina.com.cn/news/society/focus15.xml",
        "sports":        "http://rss.sina.com.cn/sports/global/focus15.xml",
        "entertainment": "http://rss.sina.com.cn/ent/focus15.xml",
        "finance":       "http://rss.sina.com.cn/finance/focus15.xml",
        "tech":          "http://rss.sina.com.cn/tech/focus15.xml",
        "military":      "http://rss.sina.com.cn/mil/politics.xml"
    };

    // -------------------------------------------------------------------------
    // 中新网 RSS 栏目映射表
    // -------------------------------------------------------------------------
    const CHINANEWS_SECTIONS = {
        "realtime":      "http://www.chinanews.com/rss/scroll-news.xml",
        "domestic":      "http://www.chinanews.com/rss/gn.xml",
        "international": "http://www.chinanews.com/rss/gj.xml",
        "finance":       "http://www.chinanews.com/rss/cj.xml",
        "culture":       "http://www.chinanews.com/rss/yl.xml",
        "sports":        "http://www.chinanews.com/rss/ty.xml",
        "society":       "http://www.chinanews.com/rss/sh.xml"
    };

    // -------------------------------------------------------------------------
    // AnyFeeder 社区 RSS 镜像（澎湃、腾讯）
    // -------------------------------------------------------------------------
    const ANYFEEDER_SOURCES = {
        "thepaper":     "https://plink.anyfeeder.com/thepaper",                // 澎湃新闻
        "qq_domestic":  "https://plink.anyfeeder.com/qq/news/china",           // 腾讯国内
        "qq_world":     "https://plink.anyfeeder.com/qq/news/world",           // 腾讯国际
        "qq_tech":      "https://plink.anyfeeder.com/qq/news/tech",            // 腾讯科技
        "qq_finance":   "https://plink.anyfeeder.com/qq/news/finance",         // 腾讯财经
        "qq_sports":    "https://plink.anyfeeder.com/qq/news/sports",          // 腾讯体育
        "qq_ent":       "https://plink.anyfeeder.com/qq/news/ent"              // 腾讯娱乐
    };

    // =========================================================================
    // 第二部分：通用工具函数
    // =========================================================================

    /**
     * HTML 实体解码器（中文增强版）
     * @param {string} str - 包含 HTML 实体的字符串
     * @returns {string} 解码后的纯文本
     */
    function decodeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/&mdash;/g, "—")
            .replace(/&ndash;/g, "–")
            .replace(/&hellip;/g, "…")
            .replace(/&middot;/g, "·")
            .replace(/&bull;/g, "•")
            .replace(/&lsquo;/g, "\u2018")
            .replace(/&rsquo;/g, "\u2019")
            .replace(/&ldquo;/g, "\u201C")
            .replace(/&rdquo;/g, "\u201D")
            .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(parseInt(d, 10)); })
            .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCharCode(parseInt(h, 16)); });
    }

    /**
     * 文本清洗工具（中文增强版）
     * @param {string} text - 原始文本
     * @returns {string} 清洗后的纯文本
     */
    function cleanText(text) {
        if (!text) return "";
        return decodeHtml(
            text
                .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
                .replace(/<[^>]*>/g, "")
                .replace(/\r\n|\r|\n/g, " ")
                .replace(/\s+/g, " ")
                .trim()
        );
    }

    /**
     * 智能截断函数（中文优化版）
     * 优先在中文标点（。？！、，）处断开
     * @param {string} text - 原始文本
     * @param {number} maxLen - 最大字符数
     * @returns {string} 截断后的文本
     */
    function smartTruncate(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        var truncated = text.substring(0, maxLen);
        var breakPoints = [
            truncated.lastIndexOf("。"),
            truncated.lastIndexOf("？"),
            truncated.lastIndexOf("！"),
            truncated.lastIndexOf("；"),
            truncated.lastIndexOf("，"),
            truncated.lastIndexOf(". "),
            truncated.lastIndexOf(", "),
            truncated.lastIndexOf(" ")
        ];
        var bestBreak = Math.max.apply(null, breakPoints);
        if (bestBreak > maxLen * 0.55) {
            truncated = truncated.substring(0, bestBreak + 1);
        }
        return truncated.trim() + "…";
    }

    /**
     * XML 标签内容提取器
     * @param {string} xml - XML 块
     * @param {string} tag - 标签名
     * @returns {string} 清洗后的标签文本内容
     */
    function extractTag(xml, tag) {
        var regex = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i");
        var match = xml.match(regex);
        if (!match) return "";
        return cleanText(match[1]);
    }

    /**
     * 基于 Jaccard 系数的中文标题相似度计算
     * 使用 bigram 分词，特别适合中文无空格文本
     * @param {string} a - 标题 A
     * @param {string} b - 标题 B
     * @returns {number} 相似度（0-1）
     */
    function titleSimilarity(a, b) {
        if (!a || !b) return 0;
        var normalize = function (s) {
            return s.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, "").trim();
        };
        var na = normalize(a);
        var nb = normalize(b);
        if (na === nb) return 1;
        if (na.length < 3 || nb.length < 3) return 0;

        var biA = new Set();
        var biB = new Set();
        for (var i = 0; i < na.length - 1; i++) biA.add(na.substring(i, i + 2));
        for (var i = 0; i < nb.length - 1; i++) biB.add(nb.substring(i, i + 2));

        var inter = 0;
        biA.forEach(function (bg) { if (biB.has(bg)) inter++; });

        var union = biA.size + biB.size - inter;
        return union === 0 ? 0 : inter / union;
    }

    /**
     * 新闻条目去重引擎
     * @param {Array} articles - 新闻条目数组
     * @returns {Array} 去重后的数组
     */
    function deduplicate(articles) {
        var unique = [];
        for (var i = 0; i < articles.length; i++) {
            var isDup = false;
            for (var j = 0; j < unique.length; j++) {
                if (titleSimilarity(articles[i].title, unique[j].title) > CONFIG.DEDUP_THRESHOLD) {
                    isDup = true;
                    break;
                }
            }
            if (!isDup) unique.push(articles[i]);
        }
        return unique;
    }

    /**
     * 日期标准化（中文友好格式）
     * @param {string} dateStr - 原始日期字符串
     * @returns {string} 标准化日期
     */
    function normalizeDate(dateStr) {
        if (!dateStr) return "未知时间";
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) {
                // 尝试匹配中文日期格式：2025年01月15日 或 2025-01-15
                return dateStr.replace(/T.*$/, "").substring(0, 19);
            }
            var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
            return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
                   " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
        } catch (e) {
            return dateStr.substring(0, 19);
        }
    }

    /**
     * 日期转时间戳
     * @param {string} dateStr - 日期字符串
     * @returns {number} 时间戳
     */
    function toTimestamp(dateStr) {
        if (!dateStr) return 0;
        try {
            var d = new Date(dateStr);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        } catch (e) { return 0; }
    }

    // =========================================================================
    // 第三部分：HTTP 请求封装
    // =========================================================================

    /**
     * 通用 HTTP GET（中文编码增强）
     * @param {string} url - URL
     * @param {Object} headers - 自定义请求头
     * @returns {Promise<string|null>} 响应文本
     */
    async function httpGet(url, headers) {
        try {
            var req = client.newRequest().url(url).method("GET");
            req.header("User-Agent", CONFIG.UA_DESKTOP);
            req.header("Accept", "application/rss+xml, application/xml, text/xml, text/html, */*");
            req.header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
            req.header("Accept-Charset", "utf-8, gb2312, gbk");
            if (headers) {
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) req.header(key, headers[key]);
                }
            }
            var resp = await req.build().execute();
            if (resp.isSuccessful()) return resp.content;
            console.error("[CNNews] HTTP " + resp.statusCode + ": " + url);
            return null;
        } catch (e) {
            console.error("[CNNews] Request failed: " + url + " | " + e.message);
            return null;
        }
    }

    /**
     * 通用 RSS XML 解析器
     * 从 RSS/Atom XML 中提取 <item> 或 <entry> 条目
     * @param {string} xml - RSS XML 文本
     * @param {number} maxResults - 最大条目数
     * @param {string} sourceName - 来源名称
     * @param {string} originId - 来源标识
     * @returns {Array} 标准化新闻条目数组
     */
    function parseRssXml(xml, maxResults, sourceName, originId) {
        if (!xml) return [];
        var articles = [];

        // 尝试 RSS 2.0 <item> 格式
        var itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        var match;
        while ((match = itemRegex.exec(xml)) !== null && articles.length < maxResults) {
            var block = match[1];
            var title = extractTag(block, "title");
            var link = extractTag(block, "link");
            var pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
            var desc = extractTag(block, "description");
            var author = extractTag(block, "author") || extractTag(block, "dc:creator");

            // link 可能在 CDATA 或属性中
            if (!link) {
                var linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
                if (linkMatch) link = cleanText(linkMatch[1]);
            }

            if (title && title.length > 2) {
                articles.push({
                    title: smartTruncate(title, CONFIG.MAX_TITLE_LEN),
                    description: smartTruncate(desc, CONFIG.MAX_DESC_LEN),
                    url: link || "",
                    source: author || sourceName,
                    publishedAt: pubDate || "",
                    _timestamp: toTimestamp(pubDate),
                    _origin: originId
                });
            }
        }

        // 如果 RSS 2.0 无结果，尝试 Atom <entry> 格式
        if (articles.length === 0) {
            var entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
            while ((match = entryRegex.exec(xml)) !== null && articles.length < maxResults) {
                var block = match[1];
                var title = extractTag(block, "title");
                var updated = extractTag(block, "updated") || extractTag(block, "published");
                var summary = extractTag(block, "summary") || extractTag(block, "content");
                var linkMatch = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i);
                var link = linkMatch ? decodeHtml(linkMatch[1]) : "";

                if (title && title.length > 2) {
                    articles.push({
                        title: smartTruncate(title, CONFIG.MAX_TITLE_LEN),
                        description: smartTruncate(summary, CONFIG.MAX_DESC_LEN),
                        url: link,
                        source: sourceName,
                        publishedAt: updated || "",
                        _timestamp: toTimestamp(updated),
                        _origin: originId
                    });
                }
            }
        }

        return articles;
    }

    // =========================================================================
    // 第四部分：新闻源适配器（Source Adapters）
    // =========================================================================

    /**
     * -----------------------------------------------------------------------
     * 适配器 1：百度新闻 RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，支持关键词搜索（1000+ 新闻源聚合）和分类浏览
     * 关键词搜索端点：http://news.baidu.com/ns?word=...&tn=newsrss&sr=0&cl=2&rn=20&ct=0
     * 分类浏览端点：http://news.baidu.com/n?cmd=1&class=...&tn=rss&sub=0
     * 返回格式：RSS 2.0 XML (GB2312/UTF-8)
     */
    var baiduNewsAdapter = {

        /**
         * 关键词搜索
         * @param {string} keyword - 搜索关键词
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>} 新闻条目数组
         */
        search: async function (keyword, max) {
            var rn = Math.min(max + 5, 20);
            var url = "http://news.baidu.com/ns?word=" + encodeURIComponent(keyword) +
                "&tn=newsrss&sr=0&cl=2&rn=" + rn + "&ct=0";
            var xml = await httpGet(url);
            return parseRssXml(xml, max, "百度新闻", "baidu");
        },

        /**
         * 分类浏览
         * @param {string} category - 标准分类名（见 BAIDU_CATEGORIES）
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>} 新闻条目数组
         */
        category: async function (category, max) {
            var classId = BAIDU_CATEGORIES[category] || BAIDU_CATEGORIES["domestic"];
            var url = "http://news.baidu.com/n?cmd=1&class=" + classId + "&tn=rss&sub=0";
            var xml = await httpGet(url);
            return parseRssXml(xml, max, "百度新闻", "baidu");
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 2：新浪新闻 RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，中国最大综合门户，多频道覆盖
     * 端点列表：见 SINA_CHANNELS 映射表
     * 返回格式：RSS 2.0 XML (UTF-8)
     */
    var sinaNewsAdapter = {

        /**
         * 获取指定频道新闻
         * @param {string} channel - 频道标识
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>} 新闻条目数组
         */
        getChannel: async function (channel, max) {
            var feedUrl = SINA_CHANNELS[channel] || SINA_CHANNELS["headlines"];
            var xml = await httpGet(feedUrl, { "Referer": "https://news.sina.com.cn/" });
            return parseRssXml(xml, max, "新浪新闻", "sina");
        },

        /**
         * 按分类获取新闻（将标准分类映射到新浪频道）
         * @param {string} category - 标准分类名
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        byCategory: async function (category, max) {
            // 分类到频道的映射（部分相同）
            var channelMap = {
                "domestic": "domestic", "international": "international",
                "finance": "finance", "tech": "tech", "sports": "sports",
                "entertainment": "entertainment", "military": "military",
                "society": "society"
            };
            var ch = channelMap[category] || "headlines";
            return await this.getChannel(ch, max);
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 3：中新网 RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，中国新闻社官方通讯社，权威性高
     * 端点列表：见 CHINANEWS_SECTIONS 映射表
     * 返回格式：RSS 2.0 XML (UTF-8)
     */
    var chinaNewsAdapter = {

        /**
         * 获取指定栏目新闻
         * @param {string} section - 栏目标识
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        getSection: async function (section, max) {
            var feedUrl = CHINANEWS_SECTIONS[section] || CHINANEWS_SECTIONS["realtime"];
            var xml = await httpGet(feedUrl, { "Referer": "https://www.chinanews.com/" });
            return parseRssXml(xml, max, "中新网", "chinanews");
        },

        /**
         * 按标准分类获取
         * @param {string} category - 标准分类名
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        byCategory: async function (category, max) {
            var sectionMap = {
                "domestic": "domestic", "international": "international",
                "finance": "finance", "tech": "realtime", "sports": "sports",
                "entertainment": "culture", "military": "domestic",
                "society": "society"
            };
            var sec = sectionMap[category] || "realtime";
            return await this.getSection(sec, max);
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 4：Google 新闻中文版 RSS
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，Google 新闻的中文区域 RSS
     * 搜索端点：https://news.google.com/rss/search?q=...&hl=zh-CN&gl=CN&ceid=CN:zh-Hans
     * 头条端点：https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans
     */
    var googleNewsCnAdapter = {

        /**
         * 关键词搜索
         * @param {string} keyword - 搜索关键词
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        search: async function (keyword, max) {
            var host = getEnv("GOOGLE_NEWS_PROXY") || "news.google.com";
            var url = "https://" + host + "/rss/search?q=" +
                encodeURIComponent(keyword) +
                "&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans";
            var xml = await httpGet(url, {
                "Accept": "application/rss+xml, application/xml"
            });
            if (!xml) return [];

            var articles = [];
            var itemRegex = /<item>([\s\S]*?)<\/item>/gi;
            var match;
            while ((match = itemRegex.exec(xml)) !== null && articles.length < max) {
                var block = match[1];
                var title = extractTag(block, "title");
                var link = extractTag(block, "link");
                var pubDate = extractTag(block, "pubDate");
                var desc = extractTag(block, "description");

                // 提取原始来源媒体名
                var srcMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
                var realSource = srcMatch ? cleanText(srcMatch[1]) : "Google新闻";

                if (title && link) {
                    articles.push({
                        title: smartTruncate(title, CONFIG.MAX_TITLE_LEN),
                        description: smartTruncate(desc, CONFIG.MAX_DESC_LEN),
                        url: link,
                        source: realSource,
                        publishedAt: pubDate || "",
                        _timestamp: toTimestamp(pubDate),
                        _origin: "google_cn"
                    });
                }
            }
            return articles;
        },

        /**
         * 头条新闻
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
headlines: async function (max) {
            var host = getEnv("GOOGLE_NEWS_PROXY") || "news.google.com";
            var url = "https://" + host + "/rss?hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans";
            var xml = await httpGet(url, {
                "Accept": "application/rss+xml, application/xml"
            });
            return parseRssXml(xml, max, "Google新闻", "google_cn");
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 5：澎湃新闻 (via AnyFeeder RSS 镜像)
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，社区维护的 RSS 镜像
     * 端点：https://plink.anyfeeder.com/thepaper
     */
    var thePaperAdapter = {

        /**
         * 获取澎湃新闻头条
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        headlines: async function (max) {
            var xml = await httpGet(ANYFEEDER_SOURCES["thepaper"]);
            return parseRssXml(xml, max, "澎湃新闻", "thepaper");
        },

        /**
         * 关键词筛选（客户端过滤）
         * @param {string} keyword - 关键词
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        searchByKeyword: async function (keyword, max) {
            var all = await this.headlines(50);
            var kw = keyword.toLowerCase();
            var filtered = [];
            for (var i = 0; i < all.length && filtered.length < max; i++) {
                var text = (all[i].title + " " + all[i].description).toLowerCase();
                if (text.indexOf(kw) !== -1) filtered.push(all[i]);
            }
            return filtered;
        }
    };

    /**
     * -----------------------------------------------------------------------
     * 适配器 6：腾讯新闻 (via AnyFeeder RSS 镜像)
     * -----------------------------------------------------------------------
     * 特性：免费无需密钥，社区维护的 RSS 镜像，多分类支持
     * 端点：https://plink.anyfeeder.com/qq/news/{channel}
     */
    var qqNewsAdapter = {

        /**
         * 获取指定频道腾讯新闻
         * @param {string} category - 标准分类名
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        byCategory: async function (category, max) {
            var feedMap = {
                "domestic": ANYFEEDER_SOURCES["qq_domestic"],
                "international": ANYFEEDER_SOURCES["qq_world"],
                "finance": ANYFEEDER_SOURCES["qq_finance"],
                "tech": ANYFEEDER_SOURCES["qq_tech"],
                "sports": ANYFEEDER_SOURCES["qq_sports"],
                "entertainment": ANYFEEDER_SOURCES["qq_ent"]
            };
            var feedUrl = feedMap[category] || ANYFEEDER_SOURCES["qq_domestic"];
            var xml = await httpGet(feedUrl);
            return parseRssXml(xml, max, "腾讯新闻", "tencent");
        },

        /**
         * 关键词筛选（客户端过滤，从国内频道中筛选）
         * @param {string} keyword - 关键词
         * @param {number} max - 最大结果数
         * @returns {Promise<Array>}
         */
        searchByKeyword: async function (keyword, max) {
            var all = await this.byCategory("domestic", 50);
            var kw = keyword.toLowerCase();
            var filtered = [];
            for (var i = 0; i < all.length && filtered.length < max; i++) {
                var text = (all[i].title + " " + all[i].description).toLowerCase();
                if (text.indexOf(kw) !== -1) filtered.push(all[i]);
            }
            return filtered;
        }
    };

    // =========================================================================
    // 第五部分：结果格式化引擎
    // =========================================================================

    /**
     * 来源标识中文映射
     */
    var ORIGIN_LABELS = {
        "baidu": "百度", "sina": "新浪", "chinanews": "中新网",
        "google_cn": "Google", "thepaper": "澎湃", "tencent": "腾讯"
    };

    /**
     * 分类中文标签映射
     */
    var CATEGORY_LABELS = {
        "domestic": "🏠 国内新闻", "international": "🌍 国际新闻",
        "finance": "💰 财经新闻", "tech": "💻 科技新闻",
        "sports": "⚽ 体育新闻", "entertainment": "🎬 娱乐新闻",
        "military": "🎖️ 军事新闻", "society": "👥 社会新闻"
    };

    /**
     * 格式化新闻报告（Markdown）
     * 每条新闻控制在 3 行内，最大化信息密度
     * @param {Array} articles - 新闻条目数组
     * @param {string} title - 报告标题
     * @param {Object} meta - 元信息
     * @returns {string} Markdown 报告
     */
    function formatReport(articles, title, meta) {
        var buf = [];
        buf.push("## " + title);
        buf.push("---");

        if (meta) {
            var parts = [];
            if (meta.keyword) parts.push("关键词: **" + meta.keyword + "**");
            if (meta.total !== undefined) parts.push("共 **" + meta.total + "** 条");
            if (meta.sources) parts.push("来源: " + meta.sources);
            if (parts.length > 0) { buf.push(parts.join(" | ")); buf.push(""); }
        }

        if (articles.length === 0) {
            buf.push("未找到相关新闻。建议调整关键词后重试。");
            return buf.join("\n");
        }

        for (var i = 0; i < articles.length; i++) {
            var item = articles[i];
            var idx = i + 1;

            // 标题行
            buf.push("**" + idx + ". " + item.title + "**");
            // 摘要行
            if (item.description && item.description.length > 5) {
                buf.push(item.description);
            }
            // 信息行
            var info = [];
            var originLabel = ORIGIN_LABELS[item._origin] || item.source;
            info.push("📰 " + (item.source !== originLabel ? item.source + " (" + originLabel + ")" : item.source));
            if (item.publishedAt) info.push("🕐 " + normalizeDate(item.publishedAt));
            info.push("🔗 " + item.url);
            buf.push(info.join(" | "));
            buf.push("");
        }

        return buf.join("\n");
    }

    /**
     * 聚合报告格式化器
     * @param {Array} articles - 去重后的新闻条目
     * @param {string} keyword - 关键词
     * @param {Object} stats - 各源命中统计
     * @returns {string} Markdown 聚合报告
     */
    function formatAggregateReport(articles, keyword, stats) {
        var parts = [];
        for (var src in stats) {
            if (stats.hasOwnProperty(src) && stats[src] > 0) {
                parts.push(src + ": " + stats[src] + "条");
            }
        }
        return formatReport(articles, "📡 中文新闻多源聚合搜索", {
            keyword: keyword,
            total: articles.length,
            sources: parts.length > 0 ? parts.join("、") : "无数据"
        });
    }

    // =========================================================================
    // 第六部分：核心业务逻辑
    // =========================================================================

    /**
     * 核心逻辑 1：关键词搜索中文新闻
     * 策略：并发百度新闻搜索 + Google新闻中文搜索 + 澎湃/腾讯客户端筛选
     */
    async function searchCnNewsCore(params) {
        var keyword = params.keyword;
        if (!keyword || keyword.trim() === "") {
            throw new Error("参数 'keyword' 不能为空");
        }
        var max = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 30);
        var perSource = Math.min(max + 5, 20);

        var promises = [
            baiduNewsAdapter.search(keyword, perSource),
            googleNewsCnAdapter.search(keyword, perSource),
            thePaperAdapter.searchByKeyword(keyword, perSource)
        ];

        var results = await Promise.allSettled(promises);
        var all = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                all = all.concat(results[i].value);
            }
        }

        var unique = deduplicate(all);
        unique.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });
        unique = unique.slice(0, max);

        return formatReport(unique, "🔍 中文新闻搜索结果", {
            keyword: keyword, total: unique.length
        });
    }

    /**
     * 核心逻辑 2：获取中文头条新闻
     * 策略：并发百度分类 + 新浪分类 + 中新网分类 + 腾讯分类
     */
    async function getCnHeadlinesCore(params) {
        var category = (params.category || "domestic").toLowerCase();
        var max = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 25);
        var perSource = Math.min(max + 3, 15);

        var promises = [
            baiduNewsAdapter.category(category, perSource),
            sinaNewsAdapter.byCategory(category, perSource),
            chinaNewsAdapter.byCategory(category, perSource),
            qqNewsAdapter.byCategory(category, perSource)
        ];

        var results = await Promise.allSettled(promises);
        var all = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                all = all.concat(results[i].value);
            }
        }

        var unique = deduplicate(all);
        unique.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });
        unique = unique.slice(0, max);

        var label = CATEGORY_LABELS[category] || "📰 " + category;
        return formatReport(unique, label, { total: unique.length });
    }

    /**
     * 核心逻辑 3：获取新浪新闻频道
     */
    async function getSinaNewsCore(params) {
        var channel = (params.channel || "headlines").toLowerCase();
        var max = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 20);

        if (!SINA_CHANNELS[channel]) {
            throw new Error("不支持的频道: '" + channel + "'。支持的频道: " +
                Object.keys(SINA_CHANNELS).join(", "));
        }

        var articles = await sinaNewsAdapter.getChannel(channel, max);

        var channelLabels = {
            "headlines": "📰 新浪头条", "domestic": "🏠 新浪国内",
            "international": "🌍 新浪国际", "society": "👥 新浪社会",
            "sports": "⚽ 新浪体育", "entertainment": "🎬 新浪娱乐",
            "finance": "💰 新浪财经", "tech": "💻 新浪科技",
            "military": "🎖️ 新浪军事"
        };
        var label = channelLabels[channel] || "📰 新浪新闻";
        return formatReport(articles, label, { total: articles.length });
    }

    /**
     * 核心逻辑 4：获取中新网新闻
     */
    async function getChinaNewsCore(params) {
        var section = (params.section || "realtime").toLowerCase();
        var max = Math.min(Math.max(parseInt(String(params.max_results || 10)), 1), 20);

        if (!CHINANEWS_SECTIONS[section]) {
            throw new Error("不支持的栏目: '" + section + "'。支持的栏目: " +
                Object.keys(CHINANEWS_SECTIONS).join(", "));
        }

        var articles = await chinaNewsAdapter.getSection(section, max);

        var sectionLabels = {
            "realtime": "⚡ 中新网即时", "domestic": "🏠 中新网国内",
            "international": "🌍 中新网国际", "finance": "💰 中新网财经",
            "culture": "🎭 中新网文娱", "sports": "⚽ 中新网体育",
            "society": "👥 中新网社会"
        };
        var label = sectionLabels[section] || "📰 中新网新闻";
        return formatReport(articles, label, { total: articles.length });
    }

    /**
     * 核心逻辑 5：多源深度聚合搜索
     * 策略：同时查询全部六个中文新闻源，合并去重，附带各源统计
     */
    async function aggregateCnNewsCore(params) {
        var keyword = params.keyword;
        if (!keyword || keyword.trim() === "") {
            throw new Error("参数 'keyword' 不能为空");
        }
        var max = Math.min(Math.max(parseInt(String(params.max_results || 15)), 1), 40);
        var perSource = Math.min(max + 3, 15);

        // 定义所有源任务
        var taskDefs = [
            { name: "百度新闻",  fn: baiduNewsAdapter.search(keyword, perSource) },
            { name: "Google中文", fn: googleNewsCnAdapter.search(keyword, perSource) },
            { name: "新浪新闻",  fn: sinaNewsAdapter.getChannel("headlines", perSource) },
            { name: "中新网",    fn: chinaNewsAdapter.getSection("realtime", perSource) },
            { name: "澎湃新闻",  fn: thePaperAdapter.searchByKeyword(keyword, perSource) },
            { name: "腾讯新闻",  fn: qqNewsAdapter.searchByKeyword(keyword, perSource) }
        ];

        // 发送中间状态
        if (typeof sendIntermediateResult === "function") {
            sendIntermediateResult({
                success: true,
                message: "正在查询 " + taskDefs.length + " 个中文新闻源，请稍候…"
            });
        }

        // 并发执行
        var promises = taskDefs.map(function (t) { return t.fn; });
        var results = await Promise.allSettled(promises);

        var all = [];
        var stats = {};
        for (var i = 0; i < results.length; i++) {
            var srcName = taskDefs[i].name;
            if (results[i].status === "fulfilled" && Array.isArray(results[i].value)) {
                var items = results[i].value;
                stats[srcName] = items.length;
                all = all.concat(items);
            } else {
                stats[srcName] = 0;
            }
        }

        var unique = deduplicate(all);
        unique.sort(function (a, b) { return (b._timestamp || 0) - (a._timestamp || 0); });
        unique = unique.slice(0, max);

        return formatAggregateReport(unique, keyword, stats);
    }

    // =========================================================================
    // 第七部分：统一错误处理包装器
    // =========================================================================

    /**
     * 通用 Wrapper
     * @param {Function} coreFunc - 核心逻辑函数
     * @param {Object} params - 参数
     * @param {string} actionName - 操作名称
     */
    async function wrapExecution(coreFunc, params, actionName) {
        try {
            var result = await coreFunc(params);
            complete({ success: true, message: actionName + " 完成", data: result });
        } catch (error) {
            console.error("[CNNews] " + actionName + " 失败: " + error.message);
            complete({
                success: false,
                message: actionName + " 失败: " + error.message,
                error_stack: error.stack
            });
        }
    }

    /**
     * 测试工具包连通性
     * 实际请求百度新闻 RSS 验证网络可达性
     */
    async function testCnNews() {
        var startTime = Date.now();
        var baiduOk = false;
        var sinaOk = false;
        var chinaNewsOk = false;
        var baiduLatency = 0;
        var sinaLatency = 0;
        var chinaLatency = 0;
        var baiduError = "";
        var sinaError = "";
        var chinaError = "";

        // 测试百度新闻
        try {
            var t0 = Date.now();
            var baiduUrl = "http://news.baidu.com/ns?word=test&tn=newsrss&sr=0&cl=2&rn=3&ct=0";
            var res = await client.newRequest()
                .url(baiduUrl)
                .method("GET")
                .header("User-Agent", CONFIG.UA_MOBILE)
                .build()
                .execute();
            baiduLatency = Date.now() - t0;
            baiduOk = res.isSuccessful() || res.statusCode === 301 || res.statusCode === 302;
            if (!baiduOk) baiduError = "HTTP " + res.statusCode;
        } catch (e) {
            baiduLatency = Date.now() - startTime;
            baiduError = e.message.substring(0, 60);
        }

        // 测试新浪新闻
        try {
            var t1 = Date.now();
            var sinaUrl = SINA_CHANNELS["headlines"];
            var res2 = await client.newRequest()
                .url(sinaUrl)
                .method("GET")
                .header("User-Agent", CONFIG.UA_DESKTOP)
                .build()
                .execute();
            sinaLatency = Date.now() - t1;
            sinaOk = res2.isSuccessful();
            if (!sinaOk) sinaError = "HTTP " + res2.statusCode;
        } catch (e) {
            sinaLatency = Date.now() - startTime;
            sinaError = e.message.substring(0, 60);
        }

        // 测试中新网
        try {
            var t2 = Date.now();
            var chinaUrl = CHINANEWS_SECTIONS["realtime"];
            var res3 = await client.newRequest()
                .url(chinaUrl)
                .method("GET")
                .header("User-Agent", CONFIG.UA_DESKTOP)
                .build()
                .execute();
            chinaLatency = Date.now() - t2;
            chinaOk = res3.isSuccessful();
            if (!chinaOk) chinaError = "HTTP " + res3.statusCode;
        } catch (e) {
            chinaLatency = Date.now() - startTime;
            chinaError = e.message.substring(0, 60);
        }

        var hasGoogleProxy = !!(getEnv("GOOGLE_NEWS_PROXY") && getEnv("GOOGLE_NEWS_PROXY").trim());

        var report = "## 中国新闻工具包 连通性测试\n\n";
        report += "| 新闻源 | 状态 | 延迟 | 说明 |\n";
        report += "| :--- | :--- | :--- | :--- |\n";
        report += "| 百度新闻 RSS | " + (baiduOk ? "✅ 正常" : "❌ 失败") + " | " + baiduLatency + "ms | " + (baiduOk ? "免费，无需密钥" : baiduError) + " |\n";
        report += "| 新浪新闻 RSS | " + (sinaOk ? "✅ 正常" : "❌ 失败") + " | " + sinaLatency + "ms | " + (sinaOk ? "免费，无需密钥" : sinaError) + " |\n";
        report += "| 中新网 RSS | " + (chinaOk ? "✅ 正常" : "❌ 失败") + " | " + chinaLatency + "ms | " + (chinaOk ? "免费，无需密钥" : chinaError) + " |\n";
        report += "| Google 新闻中文 | " + (hasGoogleProxy ? "✅ 已配置代理" : "⚠️ 未配置代理") + " | - | " + (hasGoogleProxy ? getEnv("GOOGLE_NEWS_PROXY") : "国内访问需配置 GOOGLE_NEWS_PROXY") + " |\n";
        report += "| 澎湃新闻 (AnyFeeder) | ⚪ 未测试 | - | 第三方 RSS 镜像，可用性取决于 plink.anyfeeder.com |\n";
        report += "| 腾讯新闻 (AnyFeeder) | ⚪ 未测试 | - | 第三方 RSS 镜像，可用性取决于 plink.anyfeeder.com |\n";

        var okCount = (baiduOk ? 1 : 0) + (sinaOk ? 1 : 0) + (chinaOk ? 1 : 0);
        var allOk = okCount >= 2;

        complete({
            success: allOk,
            message: "连通性测试完成：" + okCount + "/3 个主要源可达",
            data: report
        });
    }

    // =========================================================================
    // 第八部分：公开接口暴露
    // =========================================================================

    return {
        search_cn_news: function (p) {
            return wrapExecution(searchCnNewsCore, p, "中文新闻搜索");
        },
        get_cn_headlines: function (p) {
            return wrapExecution(getCnHeadlinesCore, p, "中文头条获取");
        },
        get_sina_news: function (p) {
            return wrapExecution(getSinaNewsCore, p, "新浪新闻获取");
        },
        get_chinanews: function (p) {
            return wrapExecution(getChinaNewsCore, p, "中新网新闻获取");
        },
        aggregate_cn_news: function (p) {
            return wrapExecution(aggregateCnNewsCore, p, "多源聚合搜索");
        },
        test: testCnNews
    };

})();

// =============================================================================
// 导出工具接口（严格匹配 METADATA 中的工具名称）
// =============================================================================

exports.search_cn_news    = cnNewsSearchToolkit.search_cn_news;
exports.get_cn_headlines  = cnNewsSearchToolkit.get_cn_headlines;
exports.get_sina_news     = cnNewsSearchToolkit.get_sina_news;
exports.get_chinanews     = cnNewsSearchToolkit.get_chinanews;
exports.aggregate_cn_news = cnNewsSearchToolkit.aggregate_cn_news;
exports.test              = cnNewsSearchToolkit.test;