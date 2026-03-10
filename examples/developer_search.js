/* METADATA
{
    "name": "developer_search",
    "version": "1.0",
    "display_name": {
        "zh": "开发者技术搜索",
        "en": "Developer Technical Search"
    },
    "description": {
        "zh": "国际开发者技术搜索工具包。整合 Stack Overflow 问答检索、Dev.to 技术博客搜索及 GitHub 代码仓库搜索三大数据源，为开发者提供一站式技术问题解决方案。支持按标签筛选、投票排序、分页浏览及文章详情提取。所有接口均为公开 API，无需 API Key。",
        "en": "International developer technical search toolkit. Integrates Stack Overflow Q&A search, Dev.to tech blog search, and GitHub repository search as three data sources, providing developers with a one-stop technical problem-solving solution. Supports tag filtering, vote sorting, pagination, and article detail extraction. All interfaces use public APIs with no API key required."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "search_stackoverflow",
            "description": {
                "zh": "在 Stack Overflow 上搜索技术问答。返回按投票数或活跃度排序的问题列表，包含标题、投票数、回答数、标签和链接。适合搜索具体的报错信息、代码实现问题和最佳实践。支持按标签筛选（如 python, javascript）。",
                "en": "Search technical Q&A on Stack Overflow. Returns questions sorted by votes or activity, including title, score, answer count, tags, and links. Ideal for searching error messages, code implementations, and best practices. Supports tag filtering."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词（如报错信息、技术问题描述）", "en": "Search keywords (e.g., error messages, technical problem descriptions)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "tagged",
                    "description": { "zh": "按标签筛选，多个标签用分号分隔（如 'python;django'），默认不筛选", "en": "Filter by tags, semicolon-separated (e.g., 'python;django'). Default: no filter" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "sort",
                    "description": { "zh": "排序方式：votes（投票数）、relevance（相关性）、activity（活跃度）、creation（创建时间）。默认 relevance", "en": "Sort by: votes, relevance, activity, creation. Default: relevance" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "pagesize",
                    "description": { "zh": "每页结果数（1-10），默认 5。为节省 token 建议保持较小值", "en": "Results per page (1-10). Default: 5. Keep small to save tokens" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "accepted",
                    "description": { "zh": "是否仅返回已有采纳答案的问题：true（仅采纳）、false（仅未采纳）、留空（全部）", "en": "Filter by accepted answer: true (only accepted), false (only not accepted), empty (all)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "get_stackoverflow_answers",
            "description": {
                "zh": "获取指定 Stack Overflow 问题的回答列表。返回按投票数排序的答案内容（Markdown 格式），包含投票数、是否被采纳等信息。配合 search_stackoverflow 使用，先搜索找到问题 ID，再获取答案详情。",
                "en": "Get answers for a specific Stack Overflow question. Returns answers sorted by votes in Markdown format, including score and acceptance status. Use with search_stackoverflow: first search to find question ID, then fetch answer details."
            },
            "parameters": [
                {
                    "name": "question_id",
                    "description": { "zh": "问题 ID（从搜索结果的 question_id 字段获取）", "en": "Question ID (from search results' question_id field)" },
                    "type": "number",
                    "required": true
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "pagesize",
                    "description": { "zh": "每页答案数（1-5），默认 3", "en": "Answers per page (1-5). Default: 3" },
                    "type": "number",
                    "required": false
                }
            ]
        },
        {
            "name": "search_devto",
            "description": {
                "zh": "在 Dev.to 上搜索技术博客文章。返回文章列表，包含标题、描述、标签、阅读时长、点赞数和链接。适合搜索技术教程、经验分享、工具介绍等长文内容。支持按标签和用户名筛选。",
                "en": "Search tech blog articles on Dev.to. Returns articles with title, description, tags, reading time, reactions, and links. Ideal for tutorials, experience sharing, and tool introductions. Supports tag and username filtering."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词", "en": "Search keywords" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "tag",
                    "description": { "zh": "按标签筛选（如 'react', 'python'），仅支持单个标签", "en": "Filter by tag (e.g., 'react', 'python'). Single tag only" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "per_page",
                    "description": { "zh": "每页结果数（1-10），默认 5", "en": "Results per page (1-10). Default: 5" },
                    "type": "number",
                    "required": false
                }
            ]
        },
        {
            "name": "get_devto_article",
            "description": {
                "zh": "获取 Dev.to 文章的完整正文内容（Markdown 格式）。配合 search_devto 使用，先搜索找到文章，再获取完整内容。自动截断超长内容以控制 token 消耗。",
                "en": "Get full content of a Dev.to article in Markdown format. Use with search_devto: first search to find the article, then fetch full content. Auto-truncates long content to control token usage."
            },
            "parameters": [
                {
                    "name": "article_id",
                    "description": { "zh": "文章 ID（从搜索结果的 id 字段获取）或文章 URL", "en": "Article ID (from search results' id field) or article URL" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "search_github",
            "description": {
                "zh": "在 GitHub 上搜索代码仓库。返回仓库列表，包含名称、描述、星标数、语言、最近更新时间和链接。适合寻找开源库、框架、工具和代码示例。",
                "en": "Search code repositories on GitHub. Returns repos with name, description, stars, language, last update, and links. Ideal for finding open-source libraries, frameworks, tools, and code examples."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词（支持 GitHub 搜索语法，如 'language:python sort:stars'）", "en": "Search keywords (supports GitHub search syntax, e.g., 'language:python sort:stars')" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "sort",
                    "description": { "zh": "排序方式：stars（星标数）、forks（fork 数）、updated（更新时间）。默认按相关性", "en": "Sort by: stars, forks, updated. Default: best match" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "order",
                    "description": { "zh": "排序顺序：desc（降序）、asc（升序）。默认 desc", "en": "Sort order: desc, asc. Default: desc" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false
                },
                {
                    "name": "per_page",
                    "description": { "zh": "每页结果数（1-10），默认 5", "en": "Results per page (1-10). Default: 5" },
                    "type": "number",
                    "required": false
                }
            ]
        },
        {
            "name": "unified_search",
            "description": {
                "zh": "跨平台统一搜索。同时在 Stack Overflow、Dev.to 和 GitHub 三个平台搜索，返回聚合后的结果摘要。适合快速了解某个技术问题的全貌——有哪些问答、教程和开源项目可供参考。每个来源返回前 3 条最相关结果。",
                "en": "Cross-platform unified search. Simultaneously searches Stack Overflow, Dev.to, and GitHub, returning aggregated results. Ideal for quickly understanding the full picture of a technical topic — Q&As, tutorials, and open-source projects. Returns top 3 most relevant results from each source."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词", "en": "Search keywords" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "sources",
                    "description": { "zh": "指定搜索来源，逗号分隔：stackoverflow,devto,github。默认全部搜索", "en": "Specify search sources, comma-separated: stackoverflow,devto,github. Default: all" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试开发者搜索 API 连通性。验证 Stack Overflow、Dev.to、GitHub 三个数据源的网络可达性。",
                "en": "Test developer search API connectivity. Validates network access to Stack Overflow, Dev.to, and GitHub."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：国际开发者技术搜索工具包 (Developer Search Toolkit)
 * ==============================================================================
 * 版本：v1.0
 *
 *   [CRITICAL] 移除 pako gzip 手动解压。OkHttp 自动处理 Content-Encoding: gzip，
 *              response.content 已是解压后的纯文本。v1.0 错误地二次解压导致 SO 全挂。
 *   [CRITICAL] 移除无效 Stack Exchange filter 参数 "!nNPvSNdWme"。
 *              匿名用户不能使用自定义 filter，改用默认返回字段。
 *   [FIX]      Dev.to 搜索策略重构：主用 /articles API + 客户端智能过滤，
 *              扩大取样页 (page=1,2) 以提高召回率，备用 /search/feed_content 增强稳定性。
 *   [FIX]      httpGetJson 重构为 wiki_search 标准模式：
 *              header() 逐个设置 + 重试循环 + 不触碰 Accept-Encoding (OkHttp 自动处理)。
 *   [FIX]      统一错误处理包装器改为返回 { success, message, data } 结构。
 *
 * 运行环境：Operit JavaScript 沙箱 | 网络：OkHttp (自动 gzip)
 * ==============================================================================
 */
const DeveloperSearchToolkit = (function () {

    // ==========================================================================
    // 第一部分：配置与初始化
    // ==========================================================================

    const client = OkHttp.newClient();
    const LOG_TAG = "[DeveloperSearch]";
    const MAX_BODY_LENGTH = 6000;
    const MAX_ANSWER_LENGTH = 3000;
    const RETRY_COUNT = 2;
    const RETRY_DELAY_MS = 2000;

    const UA_POOL = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0"
    ];

    // ==========================================================================
    // 第二部分：通用工具函数
    // ==========================================================================

    function getRandomUA() {
        return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
    }

    function decodeHtmlEntities(str) {
        if (!str) return "";
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/&#(\d+);/g, function (m, code) {
                return String.fromCharCode(parseInt(code, 10));
            });
    }

    /**
     * 增强版 HTML → Markdown 转换
     * 支持代码块、链接、加粗、斜体、标题、列表等。
     */
    function stripHtml(html) {
        if (!html) return "";
        var text = html;

        // 代码块 <pre><code> -> ```language\ncode```
        text = text.replace(/<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi, function (m, attrs, code) {
            var lang = "";
            var langMatch = attrs.match(/class="[^"]*language-([a-zA-Z0-9+#\-]+)/);
            if (langMatch) lang = langMatch[1];
            return "\n```" + lang + "\n" + decodeHtmlEntities(code.replace(/<[^>]+>/g, "")) + "\n```\n";
        });

        // 行内代码 <code> -> `code`
        text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, function (m, code) {
            return "`" + code.replace(/<[^>]+>/g, "") + "`";
        });

        // 链接 <a href="url">text</a> -> [text](url)
        text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, function (m, href, linkText) {
            var clean = linkText.replace(/<[^>]+>/g, "").trim();
            return "[" + clean + "](" + href + ")";
        });

        // 粗体 <strong>/<b> -> **text**
        text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, function (m, content) {
            return "**" + content.replace(/<[^>]+>/g, "") + "**";
        });

        // 斜体 <em>/<i> -> *text*
        text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, function (m, content) {
            return "*" + content.replace(/<[^>]+>/g, "") + "*";
        });

        // 标题 <h1-6> -> # heading
        text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, function (m, level, content) {
            var prefix = "";
            for (var i = 0; i < parseInt(level); i++) prefix += "#";
            return "\n" + prefix + " " + content.replace(/<[^>]+>/g, "").trim() + "\n";
        });

        // 列表项 <li> -> - item
        text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function (m, content) {
            return "- " + content.replace(/<[^>]+>/g, "").trim() + "\n";
        });

        // 换行符
        text = text.replace(/<br\s*\/?>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n\n");

        // 移除剩余 HTML 标签
        text = text.replace(/<[^>]+>/g, "");

        // 解码 HTML 实体
        text = decodeHtmlEntities(text);

        // 压缩多余空行
        text = text.replace(/\n{3,}/g, "\n\n");

        return text.trim();
    }

    function truncate(text, maxLen) {
        if (!text) return "";
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + "\n\n*(... 内容过长，已自动截断以节省 token)*";
    }

    function safeInt(val, defaultVal, minVal, maxVal) {
        var num = parseInt(String(val), 10);
        if (isNaN(num)) return defaultVal;
        if (minVal !== undefined && num < minVal) return minVal;
        if (maxVal !== undefined && num > maxVal) return maxVal;
        return num;
    }

    function formatRelativeTime(unixSeconds) {
        if (!unixSeconds) return "N/A";
        var now = Math.floor(Date.now() / 1000);
        var diff = now - unixSeconds;
        if (diff < 60) return "刚刚";
        if (diff < 3600) return Math.floor(diff / 60) + " 分钟前";
        if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
        if (diff < 2592000) return Math.floor(diff / 86400) + " 天前";
        if (diff < 31536000) return Math.floor(diff / 2592000) + " 个月前";
        return Math.floor(diff / 31536000) + " 年前";
    }

    function formatDate(isoStr) {
        if (!isoStr) return "N/A";
        return isoStr.split("T")[0];
    }

    // ==========================================================================
    // 第三部分：网络请求核心引擎 (重构：无 pako，重试+单个 header)
    // ==========================================================================

    async function httpGetJson(url, extraHeaders) {
        var lastError = null;

        for (var attempt = 0; attempt <= RETRY_COUNT; attempt++) {
            try {
                var reqBuilder = client.newRequest()
                    .url(url)
                    .method("GET");

                // 单个设置头部，避免批量覆盖问题
                reqBuilder.header("User-Agent", getRandomUA());
                reqBuilder.header("Accept", "application/json");
                reqBuilder.header("Accept-Language", "en-US,en;q=0.9");

                // 绝不手动设置 Accept-Encoding，OkHttp 会自动添加并解压

                if (extraHeaders) {
                    var keys = Object.keys(extraHeaders);
                    for (var i = 0; i < keys.length; i++) {
                        reqBuilder.header(keys[i], extraHeaders[keys[i]]);
                    }
                }

                var response = await reqBuilder.build().execute();

                // 429 限流处理
                if (response.statusCode === 429) {
                    console.warn(LOG_TAG + " 收到 429 限流，重试 " + (attempt + 1) + "/" + (RETRY_COUNT + 1));
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(RETRY_DELAY_MS * (attempt + 1));
                    }
                    lastError = new Error("API 限流 (429)");
                    continue;
                }

                // 5xx 服务器错误，重试
                if (response.statusCode >= 500) {
                    console.warn(LOG_TAG + " 服务器错误 " + response.statusCode);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(RETRY_DELAY_MS);
                    }
                    lastError = new Error("服务器错误 (" + response.statusCode + ")");
                    continue;
                }

                if (!response.isSuccessful()) {
                    throw new Error("HTTP " + response.statusCode + ": " + (response.statusMessage || "请求失败"));
                }

                var content = response.content;
                if (!content || content.trim() === "") {
                    throw new Error("服务器返回空响应");
                }

                // 直接解析 JSON（OkHttp 已自动解压）
                return JSON.parse(content);

            } catch (e) {
                lastError = e;
                if (attempt < RETRY_COUNT) {
                    console.warn(LOG_TAG + " 请求异常: " + e.message + "，重试...");
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(RETRY_DELAY_MS);
                    }
                }
            }
        }

        throw lastError || new Error("请求失败，重试耗尽");
    }

    // ==========================================================================
    // 第四部分：Stack Overflow 搜索模块
    // ==========================================================================

    const SE_BASE = "https://api.stackexchange.com/2.3";

    async function searchStackOverflowCore(params) {
        var query = params.query;
        if (!query || query.trim() === "") throw new Error("参数 'query' 不能为空");

        var sort = params.sort || "relevance";
        var page = safeInt(params.page, 1, 1, 25);
        var pagesize = safeInt(params.pagesize, 5, 1, 10);

        // 移除自定义 filter (匿名用户不可用)
        var url = SE_BASE + "/search/advanced"
            + "?order=desc"
            + "&sort=" + encodeURIComponent(sort)
            + "&q=" + encodeURIComponent(query.trim())
            + "&site=stackoverflow"
            + "&page=" + page
            + "&pagesize=" + pagesize;

        if (params.tagged && params.tagged.trim() !== "") {
            url += "&tagged=" + encodeURIComponent(params.tagged.trim());
        }
        if (params.accepted === "true") {
            url += "&accepted=True";
        } else if (params.accepted === "false") {
            url += "&accepted=False";
        }

        var data = await httpGetJson(url);

        if (!data || !data.items) {
            if (data && data.error_message) throw new Error("Stack Exchange API 错误: " + data.error_message);
            throw new Error("Stack Exchange API 返回格式异常");
        }

        var questions = [];
        var items = data.items || [];

        for (var i = 0; i < items.length; i++) {
            var q = items[i];
            questions.push({
                question_id: q.question_id,
                title: decodeHtmlEntities(q.title || ""),
                score: q.score || 0,
                answer_count: q.answer_count || 0,
                is_answered: q.is_answered || false,
                view_count: q.view_count || 0,
                tags: (q.tags || []).join(", "),
                url: q.link || ("https://stackoverflow.com/q/" + q.question_id),
                created: formatRelativeTime(q.creation_date),
                last_active: formatRelativeTime(q.last_activity_date)
            });
        }

        var buffer = [];
        buffer.push("## Stack Overflow 搜索结果\n");
        buffer.push("**关键词**: " + query + " | **排序**: " + sort + " | **页码**: " + page + "/" + Math.ceil((data.total || 0) / pagesize));
        buffer.push("**API 配额剩余**: " + (data.quota_remaining || "N/A") + "\n");

        if (questions.length === 0) {
            buffer.push("未找到相关问题。建议：\n- 尝试使用英文关键词\n- 简化搜索词\n- 使用 tagged 参数按标签筛选");
        } else {
            for (var j = 0; j < questions.length; j++) {
                var item = questions[j];
                var status = item.is_answered ? "✅ 已回答" : "❓ 待回答";
                buffer.push("### [" + (j + 1) + "] " + item.title);
                buffer.push("**投票**: " + item.score + " | **回答数**: " + item.answer_count + " | **状态**: " + status + " | **浏览**: " + item.view_count);
                buffer.push("**标签**: " + item.tags);
                buffer.push("**链接**: " + item.url);
                buffer.push("**提问时间**: " + item.created + " | **最后活跃**: " + item.last_active);
                buffer.push("**Question ID**: `" + item.question_id + "` (用于 get_stackoverflow_answers)");
                buffer.push("");
            }
        }

        return {
            has_more: data.has_more || false,
            quota_remaining: data.quota_remaining,
            questions: questions,
            markdown: buffer.join("\n")
        };
    }

    async function getStackOverflowAnswersCore(params) {
        var questionId = params.question_id;
        if (!questionId) throw new Error("参数 'question_id' 不能为空");

        var page = safeInt(params.page, 1, 1, 10);
        var pagesize = safeInt(params.pagesize, 3, 1, 5);

        var url = SE_BASE + "/questions/" + questionId + "/answers"
            + "?order=desc"
            + "&sort=votes"
            + "&site=stackoverflow"
            + "&page=" + page
            + "&pagesize=" + pagesize
            + "&filter=withbody";   // withbody 是预定义 filter，匿名可用

        var data = await httpGetJson(url);

        if (!data || !data.items) {
            if (data && data.error_message) throw new Error("Stack Exchange API 错误: " + data.error_message);
            throw new Error("未找到回答数据或响应异常");
        }

        var buffer = [];
        buffer.push("## Stack Overflow 问题 #" + questionId + " 的回答\n");

        var items = data.items || [];

        if (items.length === 0) {
            buffer.push("该问题暂无回答。");
        } else {
            for (var i = 0; i < items.length; i++) {
                var answer = items[i];
                var accepted = answer.is_accepted ? " ✅ 采纳答案" : "";
                buffer.push("### 回答 " + (i + 1) + " (投票: " + (answer.score || 0) + ")" + accepted);
                buffer.push("**回答者**: " + (answer.owner ? answer.owner.display_name : "匿名") + " | **回答时间**: " + formatRelativeTime(answer.creation_date));
                buffer.push("");
                var body = stripHtml(answer.body || "");
                buffer.push(truncate(body, MAX_ANSWER_LENGTH));
                buffer.push("\n---\n");
            }
        }

        return {
            question_id: questionId,
            answer_count: items.length,
            has_more: data.has_more || false,
            markdown: buffer.join("\n")
        };
    }

    // ==========================================================================
    // 第五部分：Dev.to 搜索模块 (重构：主用 /articles + 智能过滤)
    // ==========================================================================

    const DEVTO_BASE = "https://dev.to/api";

    async function searchDevtoCore(params) {
        var query = params.query;
        if (!query || query.trim() === "") throw new Error("参数 'query' 不能为空");

        var page = safeInt(params.page, 1, 1, 100);
        var perPage = safeInt(params.per_page, 5, 1, 10);
        var tag = params.tag && params.tag.trim() !== "" ? params.tag.trim().toLowerCase() : null;

        var articles = [];
        var source = "articles_api";
        var queryLower = query.trim().toLowerCase();
        var keywords = queryLower.split(/\s+/).filter(function(k) { return k.length > 0; });

        // 策略 A (主用): 通过 /articles API 获取多页数据，客户端过滤
        try {
            // 为了提高召回率，同时获取 page 和 page+1 的数据（如果允许）
            var fetchPages = [page];
            if (page === 1) fetchPages.push(2); // 默认拉取两页，增加命中率

            for (var pIdx = 0; pIdx < fetchPages.length; pIdx++) {
                var currentPage = fetchPages[pIdx];
                var url = DEVTO_BASE + "/articles"
                    + "?page=" + currentPage
                    + "&per_page=" + perPage
                    + "&state=all"; // 包含已发布的所有文章

                if (tag) {
                    url += "&tag=" + encodeURIComponent(tag);
                }

                var listData = await httpGetJson(url, { "User-Agent": getRandomUA() });

                if (Array.isArray(listData)) {
                    for (var j = 0; j < listData.length; j++) {
                        var a = listData[j];
                        var title = a.title || "";
                        var tags = Array.isArray(a.tag_list) ? a.tag_list.join(" ") : (a.tags || "");
                        var desc = a.description || "";

                        var combined = (title + " " + tags + " " + desc).toLowerCase();
                        var match = keywords.length === 0 ? true : false; // 如果关键词为空，不匹配（但query不能为空）
                        for (var k = 0; k < keywords.length; k++) {
                            if (combined.indexOf(keywords[k]) !== -1) {
                                match = true;
                                break;
                            }
                        }

                        if (match) {
                            // 避免重复
                            var exists = articles.some(function(ex) { return ex.id === a.id; });
                            if (!exists) {
                                articles.push({
                                    id: a.id,
                                    title: decodeHtmlEntities(title),
                                    url: a.url || a.canonical_url || "",
                                    user: a.user ? (a.user.name || a.user.username || "") : "",
                                    tags: Array.isArray(a.tag_list) ? a.tag_list.join(", ") : (a.tags || ""),
                                    reactions: a.public_reactions_count || a.positive_reactions_count || 0,
                                    comments: a.comments_count || 0,
                                    reading_time: a.reading_time_minutes || 0,
                                    published: a.readable_publish_date || formatDate(a.published_at || ""),
                                    description: a.description || ""
                                });
                            }
                        }
                    }
                }
            }
        } catch (listErr) {
            console.warn(LOG_TAG + " Dev.to /articles API 失败: " + listErr.message + "，尝试备用搜索 API");
        }

        // 策略 B (备用): 如果主策略结果太少 (< perPage/2)，尝试 /search/feed_content
        if (articles.length < Math.ceil(perPage / 2)) {
            try {
                var searchUrl = "https://dev.to/search/feed_content"
                    + "?per_page=" + perPage
                    + "&page=" + (page - 1) // 该端点从0开始
                    + "&search_fields=" + encodeURIComponent(query.trim())
                    + "&class_name=Article";

                var searchData = await httpGetJson(searchUrl, {
                    "User-Agent": getRandomUA(),
                    "Referer": "https://dev.to/search?q=" + encodeURIComponent(query)
                });

                if (searchData && searchData.result && searchData.result.length > 0) {
                    var results = searchData.result;
                    for (var i = 0; i < results.length; i++) {
                        var item = results[i];
                        var exists = articles.some(function(ex) { return ex.id === item.id; });
                        if (!exists) {
                            articles.push({
                                id: item.id,
                                title: decodeHtmlEntities(item.title || ""),
                                url: "https://dev.to" + (item.path || item.slug || ""),
                                user: item.user ? (item.user.name || item.user.username || "") : (item.user_name || ""),
                                tags: item.tag_list || item.tags || "",
                                reactions: item.public_reactions_count || item.positive_reactions_count || 0,
                                comments: item.comments_count || 0,
                                reading_time: item.reading_time_minutes || item.reading_time || 0,
                                published: item.readable_publish_date || formatDate(item.published_at || ""),
                                description: item.description || ""
                            });
                        }
                    }
                    source = "search_api (备用)";
                }
            } catch (searchErr) {
                console.warn(LOG_TAG + " Dev.to 备用搜索 API 也失败: " + searchErr.message);
            }
        }

        // 限制返回数量 = perPage
        articles = articles.slice(0, perPage);

        var buffer = [];
        buffer.push("## Dev.to 搜索结果\n");
        buffer.push("**关键词**: " + query + (tag ? " | **标签**: " + tag : "") + " | **数据源**: " + source + " | **页码**: " + page + "\n");

        if (articles.length === 0) {
            buffer.push("未找到相关文章。建议：\n- 尝试简化或更换关键词\n- 使用 tag 参数按标签筛选\n- 尝试英文关键词");
        } else {
            for (var m = 0; m < articles.length; m++) {
                var art = articles[m];
                buffer.push("### [" + (m + 1) + "] " + art.title);
                buffer.push("**作者**: " + art.user + " | **点赞**: " + art.reactions + " | **评论**: " + art.comments + " | **阅读时长**: " + art.reading_time + " min");
                buffer.push("**标签**: " + art.tags);
                buffer.push("**链接**: " + art.url);
                buffer.push("**发布日期**: " + art.published);
                if (art.description) {
                    buffer.push("**摘要**: " + art.description);
                }
                buffer.push("**Article ID**: `" + art.id + "` (用于 get_devto_article)");
                buffer.push("");
            }
        }

        return {
            articles: articles,
            markdown: buffer.join("\n")
        };
    }

    async function getDevtoArticleCore(params) {
        var articleInput = params.article_id;
        if (!articleInput || String(articleInput).trim() === "") {
            throw new Error("参数 'article_id' 不能为空");
        }

        var articleId = String(articleInput).trim();

        // 支持 URL 转 ID
        if (articleId.indexOf("dev.to") !== -1) {
            var pathMatch = articleId.match(/dev\.to\/(.+)/);
            if (pathMatch) {
                var path = "/" + pathMatch[1].replace(/^\/+/, "");
                var pathUrl = DEVTO_BASE + "/articles/by_path?url=" + encodeURIComponent(path);
                try {
                    var pathData = await httpGetJson(pathUrl, { "User-Agent": getRandomUA() });
                    if (pathData && pathData.id) {
                        articleId = String(pathData.id);
                    }
                } catch (pathErr) {
                    console.warn(LOG_TAG + " 路径解析失败: " + pathErr.message + "，尝试直接作为 ID");
                }
            }
        }

        var url = DEVTO_BASE + "/articles/" + articleId;
        var data = await httpGetJson(url, { "User-Agent": getRandomUA() });

        if (!data || !data.title) {
            throw new Error("未找到文章或响应格式异常 (ID: " + articleId + ")");
        }

        var buffer = [];
        buffer.push("# " + decodeHtmlEntities(data.title || ""));
        buffer.push("");
        buffer.push("**作者**: " + (data.user ? (data.user.name || data.user.username) : "未知"));
        buffer.push("**发布日期**: " + (data.readable_publish_date || formatDate(data.published_at || "")));
        buffer.push("**标签**: " + (Array.isArray(data.tag_list) ? data.tag_list.join(", ") : (data.tags || "")));
        buffer.push("**点赞**: " + (data.public_reactions_count || 0) + " | **评论**: " + (data.comments_count || 0) + " | **阅读时长**: " + (data.reading_time_minutes || 0) + " min");
        buffer.push("**原文链接**: " + (data.url || data.canonical_url || ""));
        buffer.push("\n---\n");

        var body = "";
        if (data.body_markdown) {
            body = data.body_markdown;
        } else if (data.body_html) {
            body = stripHtml(data.body_html);
        } else {
            body = data.description || "无法获取正文内容";
        }

        buffer.push(truncate(body, MAX_BODY_LENGTH));

        return {
            id: data.id,
            title: decodeHtmlEntities(data.title || ""),
            url: data.url || "",
            markdown: buffer.join("\n")
        };
    }

    // ==========================================================================
    // 第六部分：GitHub 搜索模块
    // ==========================================================================

    const GH_BASE = "https://api.github.com";

    async function searchGithubCore(params) {
        var query = params.query;
        if (!query || query.trim() === "") throw new Error("参数 'query' 不能为空");

        var page = safeInt(params.page, 1, 1, 34);
        var perPage = safeInt(params.per_page, 5, 1, 10);

        var url = GH_BASE + "/search/repositories"
            + "?q=" + encodeURIComponent(query.trim())
            + "&page=" + page
            + "&per_page=" + perPage;

        if (params.sort && params.sort.trim() !== "") {
            url += "&sort=" + encodeURIComponent(params.sort.trim());
        }
        var order = params.order || "desc";
        url += "&order=" + encodeURIComponent(order);

        var data = await httpGetJson(url, {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": getRandomUA()
        });

        if (!data || data.items === undefined) {
            if (data && data.message) throw new Error("GitHub API 错误: " + data.message);
            throw new Error("GitHub API 返回格式异常");
        }

        var repos = [];
        var items = data.items || [];

        for (var i = 0; i < items.length; i++) {
            var repo = items[i];
            repos.push({
                name: repo.full_name || "",
                description: truncate(decodeHtmlEntities(repo.description || ""), 200),
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                language: repo.language || "N/A",
                license: repo.license ? (repo.license.spdx_id || repo.license.name || "N/A") : "N/A",
                url: repo.html_url || "",
                updated: formatDate(repo.updated_at || ""),
                open_issues: repo.open_issues_count || 0,
                topics: (repo.topics || []).slice(0, 5).join(", ")
            });
        }

        var buffer = [];
        buffer.push("## GitHub 仓库搜索结果\n");
        buffer.push("**关键词**: " + query + " | **共匹配**: " + (data.total_count || 0) + " 个仓库 | **页码**: " + page + "\n");

        if (repos.length === 0) {
            buffer.push("未找到相关仓库。建议：\n- 尝试更通用的关键词\n- 使用 GitHub 搜索语法: `language:python`, `stars:>100`");
        } else {
            for (var j = 0; j < repos.length; j++) {
                var r = repos[j];
                buffer.push("### [" + (j + 1) + "] " + r.name);
                buffer.push("**描述**: " + r.description);
                buffer.push("**⭐ Stars**: " + r.stars + " | **🍴 Forks**: " + r.forks + " | **语言**: " + r.language + " | **License**: " + r.license);
                if (r.topics) {
                    buffer.push("**Topics**: " + r.topics);
                }
                buffer.push("**链接**: " + r.url);
                buffer.push("**最后更新**: " + r.updated + " | **Open Issues**: " + r.open_issues);
                buffer.push("");
            }
        }

        return {
            total_count: data.total_count || 0,
            repos: repos,
            markdown: buffer.join("\n")
        };
    }

    // ==========================================================================
    // 第七部分：统一搜索模块
    // ==========================================================================

    async function unifiedSearchCore(params) {
        var query = params.query;
        if (!query || query.trim() === "") throw new Error("参数 'query' 不能为空");

        var sourcesStr = params.sources || "stackoverflow,devto,github";
        var sources = sourcesStr.toLowerCase().split(",").map(function (s) { return s.trim(); });

        var results = {};
        var errors = [];

        // 并发请求，但为照顾限流使用 Promise.all 平缓发起
        var tasks = [];

        if (sources.indexOf("stackoverflow") !== -1) {
            tasks.push(searchStackOverflowCore({ query: query, sort: "relevance", pagesize: 3 })
                .then(function(r) { results.stackoverflow = r; })
                .catch(function(e) { errors.push("Stack Overflow: " + e.message); }));
        }

        if (sources.indexOf("devto") !== -1) {
            tasks.push(searchDevtoCore({ query: query, per_page: 3 })
                .then(function(r) { results.devto = r; })
                .catch(function(e) { errors.push("Dev.to: " + e.message); }));
        }

        if (sources.indexOf("github") !== -1) {
            tasks.push(searchGithubCore({ query: query, sort: "stars", per_page: 3 })
                .then(function(r) { results.github = r; })
                .catch(function(e) { errors.push("GitHub: " + e.message); }));
        }

        await Promise.all(tasks);

        var buffer = [];
        buffer.push("# 跨平台技术搜索报告\n");
        buffer.push("**搜索词**: " + query);
        buffer.push("**搜索范围**: " + sources.join(", ") + "\n");

        if (errors.length > 0) {
            buffer.push("⚠️ **部分平台检索失败**: " + errors.join(" | ") + "\n");
        }

        buffer.push("---\n");

        if (results.stackoverflow && results.stackoverflow.questions && results.stackoverflow.questions.length > 0) {
            buffer.push("## 📋 Stack Overflow 问答\n");
            var soQuestions = results.stackoverflow.questions;
            for (var i = 0; i < soQuestions.length; i++) {
                var sq = soQuestions[i];
                var status = sq.is_answered ? "✅" : "❓";
                buffer.push((i + 1) + ". " + status + " **" + sq.title + "**");
                buffer.push("   投票: " + sq.score + " | 回答: " + sq.answer_count + " | 标签: " + sq.tags);
                buffer.push("   " + sq.url);
                buffer.push("");
            }
        }

        if (results.devto && results.devto.articles && results.devto.articles.length > 0) {
            buffer.push("## 📝 Dev.to 技术博客\n");
            var devArticles = results.devto.articles;
            for (var j = 0; j < devArticles.length; j++) {
                var da = devArticles[j];
                buffer.push((j + 1) + ". **" + da.title + "** — " + da.user);
                buffer.push("   ❤️ " + da.reactions + " | 💬 " + da.comments + " | ⏱ " + da.reading_time + " min | " + da.published);
                buffer.push("   " + da.url);
                buffer.push("");
            }
        }

        if (results.github && results.github.repos && results.github.repos.length > 0) {
            buffer.push("## 🔧 GitHub 开源仓库\n");
            var ghRepos = results.github.repos;
            for (var k = 0; k < ghRepos.length; k++) {
                var gr = ghRepos[k];
                buffer.push((k + 1) + ". **" + gr.name + "** ⭐ " + gr.stars);
                buffer.push("   " + gr.description);
                buffer.push("   语言: " + gr.language + " | License: " + gr.license + " | 更新: " + gr.updated);
                buffer.push("   " + gr.url);
                buffer.push("");
            }
        }

        if ((!results.stackoverflow || !results.stackoverflow.questions || results.stackoverflow.questions.length === 0) &&
            (!results.devto || !results.devto.articles || results.devto.articles.length === 0) &&
            (!results.github || !results.github.repos || results.github.repos.length === 0)) {
            buffer.push("\n未在任何平台找到相关结果。建议使用英文关键词或简化搜索词后重试。");
        }

        return {
            sources_searched: sources,
            errors: errors,
            results: results,
            markdown: buffer.join("\n")
        };
    }

    // ==========================================================================
    // 第八部分：统一错误处理包装器
    // ==========================================================================

    async function wrapExecution(coreLogic, params, actionName) {
        try {
            var result = await coreLogic(params);
            complete({
                success: true,
                message: actionName + " 执行成功",
                data: result.markdown || result
            });
        } catch (error) {
            console.error(LOG_TAG + " " + actionName + " 失败: " + error.message);
            complete({
                success: false,
                message: actionName + " 失败: " + error.message,
                error_stack: error.stack
            });
        }
    }

    // ==========================================================================
    // 第九部分：公开接口暴露
    // ==========================================================================

    return {
        search_stackoverflow: function (p) {
            return wrapExecution(searchStackOverflowCore, p, "Stack Overflow 搜索");
        },
        get_stackoverflow_answers: function (p) {
            return wrapExecution(getStackOverflowAnswersCore, p, "Stack Overflow 答案获取");
        },
        search_devto: function (p) {
            return wrapExecution(searchDevtoCore, p, "Dev.to 搜索");
        },
        get_devto_article: function (p) {
            return wrapExecution(getDevtoArticleCore, p, "Dev.to 文章获取");
        },
        search_github: function (p) {
            return wrapExecution(searchGithubCore, p, "GitHub 仓库搜索");
        },
        unified_search: function (p) {
            return wrapExecution(unifiedSearchCore, p, "跨平台统一搜索");
        },

        /**
         * API 连通性测试入口
         * 验证 Stack Overflow、Dev.to、GitHub 三个数据源可达性
         * 调用方式：无需参数
         */
        test: function (p) {
            return wrapExecution(async function () {
                const endpoints = [
                    { name: 'Stack Overflow', url: 'https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=1' },
                    { name: 'Dev.to',          url: 'https://dev.to/api/articles?per_page=1' },
                    { name: 'GitHub',          url: 'https://api.github.com/search/repositories?q=test&per_page=1' }
                ];
                const results = [];
                for (const ep of endpoints) {
                    const startTime = Date.now();
                    try {
                        const resp = await OkHttp.newClient().newRequest()
                            .url(ep.url)
                            .method('GET')
                            .headers({
                                'User-Agent': 'Operit-DeveloperSearch/1.0',
                                'Accept': 'application/json'
                            })
                            .build()
                            .execute();
                        const latency = Date.now() - startTime;
                        results.push({ name: ep.name, ok: resp.isSuccessful(), status: resp.statusCode, latency });
                    } catch (e) {
                        results.push({ name: ep.name, ok: false, error: e.message, latency: Date.now() - startTime });
                    }
                }
                const lines = ['## 开发者搜索 API 连通性测试报告\n'];
                for (const r of results) {
                    const icon = r.ok ? '✅' : '❌';
                    lines.push(`- ${icon} **${r.name}**: ${r.ok ? `连通正常 (HTTP ${r.status}, ${r.latency}ms)` : `连通失败 (${r.error || 'HTTP ' + r.status}, ${r.latency}ms)`}`);
                }
                const successCount = results.filter(r => r.ok).length;
                lines.push(`\n**结果**: ${successCount}/${results.length} 个数据源可用`);
                return {
                    success: successCount > 0,
                    message: `连通性测试完成：${successCount}/${results.length} 个数据源可用`,
                    data: lines.join('\n')
                };
            }, p, "API 连通性测试");
        }
    };

})();

// ==============================================================================
// 导出工具接口（严格匹配 METADATA 中的 tools[].name）
// ==============================================================================

exports.search_stackoverflow      = DeveloperSearchToolkit.search_stackoverflow;
exports.get_stackoverflow_answers = DeveloperSearchToolkit.get_stackoverflow_answers;
exports.search_devto              = DeveloperSearchToolkit.search_devto;
exports.get_devto_article         = DeveloperSearchToolkit.get_devto_article;
exports.search_github             = DeveloperSearchToolkit.search_github;
exports.unified_search            = DeveloperSearchToolkit.unified_search;
exports.test                      = DeveloperSearchToolkit.test;