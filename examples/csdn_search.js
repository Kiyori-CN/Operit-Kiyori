/* METADATA
{
    "name": "csdn_search",
    "version": "1.0",
    "display_name": {
        "zh": "CSDN 搜索与内容提取",
        "en": "CSDN Search & Content Extraction"
    },
    "description": {
        "zh": "CSDN搜索与内容提取工具包。具备全站内容搜索功能，支持博客与问答分类；具备文章正文深度解析功能，自动转换为 Markdown 格式；具备评论区数据递归获取功能；具备全站及分频道实时热榜查看功能；具备博主核心数据与画像分析功能。",
        "en": "CSDN search & content extraction toolkit. Features full-site content search with category support; Deep parses article bodies into Markdown; Recursively retrieves comment data; Views real-time hot rankings by channel; Analyzes blogger profiles and statistics."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "search",
            "description": { "zh": "执行 CSDN 全站内容搜索，支持分页与类型筛选。", "en": "Execute CSDN full-site content search with pagination and type filtering." },
            "parameters": [
                {
                    "name": "query",
                    "type": "string",
                    "description": { "zh": "搜索关键词", "en": "Search keyword" },
                    "required": true
                },
                {
                    "name": "page",
                    "type": "number",
                    "description": { "zh": "页码 (默认1)", "en": "Page number (default 1)" },
                    "required": false,
                    "default": 1
                },
                {
                    "name": "type",
                    "type": "string",
                    "description": { "zh": "搜索类型：all (全部), blog (博客), ask (问答)，默认 all", "en": "Search type: all, blog, ask. Default: all" },
                    "required": false,
                    "default": "all"
                }
            ]
        },
        {
            "name": "get_article",
            "description": { "zh": "提取 CSDN 文章详细内容，自动清理广告并转换为 Markdown。", "en": "Extract detailed CSDN article content, remove ads, and convert to Markdown." },
            "parameters": [
                {
                    "name": "url",
                    "type": "string",
                    "description": { "zh": "文章详情页 URL", "en": "Article detail URL" },
                    "required": true
                }
            ]
        },
        {
            "name": "get_comments",
            "description": { "zh": "拉取指定文章的评论列表数据。", "en": "Fetch comment list data for a specific article." },
            "parameters": [
                {
                    "name": "article_url_or_id",
                    "type": "string",
                    "description": { "zh": "文章 URL 或纯数字 ID", "en": "Article URL or numeric ID" },
                    "required": true
                },
                {
                    "name": "page",
                    "type": "number",
                    "description": { "zh": "评论页码 (默认1)", "en": "Comment page number (default 1)" },
                    "required": false,
                    "default": 1
                }
            ]
        },
        {
            "name": "get_hot_rank",
            "description": { "zh": "获取 CSDN 实时热榜数据列表。", "en": "Get CSDN real-time hot rank data list." },
            "parameters": [
                {
                    "name": "channel",
                    "type": "string",
                    "description": { "zh": "频道标识，留空为全站", "en": "Channel ID, empty for all-site" },
                    "required": false
                },
                {
                    "name": "page",
                    "type": "number",
                    "description": { "zh": "页码 (默认0)", "en": "Page number (default 0)" },
                    "required": false,
                    "default": 0
                }
            ]
        },
        {
            "name": "get_user_info",
            "description": { "zh": "查询指定博主的个人资料与统计数据。", "en": "Query profile and statistics of a specific blogger." },
            "parameters": [
                {
                    "name": "username",
                    "type": "string",
                    "description": { "zh": "博主用户名 (ID)", "en": "Blogger username (ID)" },
                    "required": true
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 CSDN 网络连通性。验证 csdn.net 可达性与响应状态。",
                "en": "Test CSDN network connectivity. Validates csdn.net reachability and response status."
            },
            "parameters": []
        }
    ]
}
*/

// ==========================================================================
// CSDN 搜索与数据提取核心模块
// ==========================================================================
const csdn_search = (function () {

    /**
     * 预定义的 User-Agent 列表，用于模拟不同操作系统下的浏览器请求。
     * 包含 Windows, Macintosh, Linux 环境。
     * 在每次网络请求时会随机选择其中之一，以降低服务端反爬虫机制的触发概率。
     */
    const UA_LIST = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    /**
     * 构建并返回用于网络请求的 HTTP 头信息对象。
     * 此函数负责生成随机的 User-Agent 以模拟真实用户行为。
     * * @returns {Object} 包含 User-Agent, Referer 的头信息对象
     */
    function getHeaders() {
        // 随机选择一个 UA 以模拟不同的用户设备
        const ua = UA_LIST[Math.floor(Math.random() * UA_LIST.length)];
        
        const headers = {
            'User-Agent': ua,
            'Referer': 'https://www.csdn.net/',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        };
        
        return headers;
    }

    /**
     * 从输入字符串中提取标准化的文章 ID。
     * 该函数具有容错性，能够处理纯数字 ID 输入以及包含 ID 的完整 URL 链接。
     * * @param {string} input - 输入的 URL 字符串或数字 ID 字符串
     * @returns {string|null} 成功提取到的 ID 字符串，如果无法匹配则返回 null
     */
    function extractArticleId(input) {
        if (!input) return null;
        
        // 如果输入全是数字，直接认定为 ID 并返回
        if (/^\d+$/.test(input)) {
            return input;
        }
        
        // 尝试从 CSDN 标准 URL 结构 (/article/details/{ID}) 中正则提取
        const match = input.match(/\/article\/details\/(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * 搜索功能主入口函数。
     * 采用“双轨制”数据获取策略，以确保在不同网络环境和反爬策略下的稳定性：
     * 1. 优先尝试调用内部搜索 API (api/v3/search/get)，获取结构化 JSON 数据，解析效率高且准确。
     * 2. 若 API 调用失败或数据解析异常，自动降级为网页爬取模式 (web_scrape)，模拟浏览器访问搜索结果页并解析 HTML。
     * * @param {Object|string} args - 参数对象或直接传入搜索关键词字符串
     * @param {string} args.query - 搜索关键词
     * @param {number} [args.page=1] - 页码，默认为第一页
     * @param {string} [args.type='all'] - 搜索类型：'all'(全部), 'blog'(博客), 'ask'(问答)
     * @returns {Promise<Object>} 包含搜索结果列表、摘要及状态信息的对象
     */
    async function search(args) {
        // 参数归一化处理，兼容位置参数调用
        let { query, page = 1, type = 'all' } = args || {};
        
        if (typeof args === 'string') {
            query = args;
            page = arguments[1] || 1;
            type = arguments[2] || 'all';
        }

        try {
            const encodedQuery = encodeURIComponent(query);
            
            // -----------------------------------------------------------
            // 策略 A: 尝试使用 API 获取结构化数据
            // -----------------------------------------------------------
            const apiUrl = `https://so.csdn.net/api/v3/search/get?q=${encodedQuery}&t=${type}&p=${page}`;
            
            let apiData = null;
            try {
                const apiResult = await Tools.Net.visit({ 
                    url: apiUrl, 
                    headers: getHeaders() 
                });

                // 增加空值检查，确保网络请求返回了有效内容
                if (apiResult && apiResult.content) {
                    // 数据清洗：仅移除可能包裹在 JSON 外层的 HTML 标签（如 <pre>）
                    // 保持内部 JSON 字符串结构的完整性，避免破坏转义字符
                    let jsonStr = apiResult.content;
                    if (typeof jsonStr === 'string') {
                         jsonStr = jsonStr.replace(/^<pre[^>]*>|<\/pre>$/gi, "").trim();
                    }
                    
                    const json = JSON.parse(jsonStr);
                    
                    // 校验 API 返回码 (200) 及数据载体 (result_vos) 是否存在
                    if (json.code === 200 && json.result_vos && json.result_vos.length > 0) {
                        apiData = json.result_vos;
                    }
                }
            } catch (ignore) {
                // API 请求异常或 JSON 解析失败时，静默忽略错误，继续尝试策略 B
            }

            // 如果 API 成功获取数据，直接格式化并返回结果
            if (apiData) {
                 return {
                   status: 'success',
                   source: 'api',
                   results: apiData.map((item, i) => {
                        // 清理标题中的高亮标签 (如 <em>) 以获得纯文本标题
                        const title = (item.title || "无标题")
                            .replace(/<\/?em>/g, "")
                            .replace(/<[^>]+>/g, "");
                        const url = item.url || item.url_location;
                        return `[${i + 1}] ${title} (${url})`;
                    }),
                    // 生成用于 AI 阅读的摘要文本，包含标题、URL 和简要描述
                    summary: apiData.map(item => {
                        const title = (item.title || "")
                            .replace(/<\/?em>/g, "")
                            .replace(/<[^>]+>/g, "");
                        const desc = (item.description || item.digest || "")
                            .replace(/<\/?em>/g, "")
                            .replace(/<[^>]+>/g, "");
                        return `### ${title}\nURL: ${item.url}\n摘要: ${desc}\n`;
                    }).join("\n")
                };
            }

            // -----------------------------------------------------------
            // 策略 B: 网页爬取回退方案 (HTML 解析)
            // -----------------------------------------------------------
            const url = `https://so.csdn.net/so/search?q=${encodedQuery}&t=${type}&p=${page}`;
            const result = await Tools.Net.visit({
                url: url,
                headers: getHeaders()
            });

            // 检查网络请求结果
            if (!result || !result.content) {
                return { 
                    status: 'error', 
                    message: '未能获取搜索结果，请检查网络连接或确认关键词是否触发了平台的反爬策略。' 
                };
            }

            // 从 visit 结果中提取链接列表
            // 过滤规则：仅保留包含 'article/details' 的文章详情页链接
            // 截断规则：限制返回前 15 条结果，避免上下文过大导致处理缓慢
            const links = result.links 
                ? result.links
                    .filter(l => l.url && l.url.includes('article/details'))
                    .slice(0, 15)
                    .map((l, i) => `[${i + 1}] ${l.text} (${l.url})`) 
                : [];

            return {
                status: 'success',
                source: 'web_scrape',
                visitKey: result.visitKey, 
                results: links,
                summary: result.content ? result.content.substring(0, 1000) + "... [内容已截断以防系统挂起]" : "无内容"
            };

        } catch (e) {
            return { 
                status: 'error', 
                message: `搜索执行过程中发生异常: ${e.message}` 
            };
        }
    }

    /**
     * CSDN 专用 HTML 解析器对象。
     * 该对象封装了一系列针对 CSDN 网页结构的清洗与转换规则。
     * 主要功能是将混乱、包含广告和冗余样式的 HTML 源码转换为结构清晰、易于阅读的 Markdown 格式。
     */
    const CsdnParser = {
        
        /**
         * HTML 实体反转义工具函数。
         * 将常见的 HTML 实体编码还原为对应的字符。
         * @param {string} str - 包含实体的字符串
         * @returns {string} 还原后的字符串
         */
        unescape: function(str) {
            return str.replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&amp;/g, '&')
                      .replace(/&quot;/g, '"')
                      .replace(/&nbsp;/g, ' ');
        },

        /**
         * 核心解析函数。
         * 执行完整的 HTML 到 Markdown 的转换流程，包括提取核心区、去噪、去广告、代码格式化等步骤。
         * @param {string} html - 原始 HTML 字符串
         * @returns {string} 转换后的 Markdown 文本
         */
        parse: function(html) {
            if (!html) return "";
            
            // -----------------------------------------------------------
            // 步骤 1: 提取文章核心内容区
            // -----------------------------------------------------------
            // 优先匹配 ID 为 content_views 的容器，这是 CSDN 文章的标准正文容器
            let mainMatch = html.match(/<div[^>]*id="content_views"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tree-person-box"|<\/article)/i);
            
            // 备用匹配方案：若未找到标准容器，尝试匹配 <article> 标签
            if (!mainMatch) {
                mainMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            }
            
            let text = mainMatch ? mainMatch[1] : html;

            // -----------------------------------------------------------
            // 步骤 2: 移除干扰性脚本、样式与注释
            // -----------------------------------------------------------
            // 移除 JavaScript 脚本块
            text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, "");
            // 移除 CSS 样式块
            text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, "");
            // 移除 HTML 注释内容，保持文档整洁
            text = text.replace(/<!--[\s\S]*?-->/g, "");

            // -----------------------------------------------------------
            // 步骤 3: 深度去广告与解锁 VIP 限制
            // -----------------------------------------------------------
            // 移除 "阅读全文" 遮罩层 (关键步骤：移除后配合后续解析即可获取被遮挡的内容)
            text = text.replace(new RegExp('<div[^>]*class="[^"]*hide-article-box[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            text = text.replace(new RegExp('<div[^>]*class="[^"]*login-mark[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            
            // 移除各类推荐栏、侧边栏、底部广告容器及引导关注块
            text = text.replace(new RegExp('<div[^>]*class="[^"]*recommend-box[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            text = text.replace(new RegExp('<div[^>]*id="[^"]*writeGuide[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            text = text.replace(new RegExp('<div[^>]*class="[^"]*blog-footer-bottom[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            text = text.replace(new RegExp('<div[^>]*class="[^"]*template-box[^"]*"[^>]*>[\\s\\S]*?<\\/div>', 'gi'), "");
            
            // 移除嵌入的广告 iframe 元素
            text = text.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gim, "");

            // -----------------------------------------------------------
            // 步骤 4: 清理 CSDN 特有的代码块装饰
            // -----------------------------------------------------------
            // 移除代码复制按钮
            text = text.replace(/<div class="hljs-button".*?>.*?<\/div>/g, "");
            // 移除行号列表 (pre-numbering)
            text = text.replace(/<ul class="pre-numbering">[\s\S]*?<\/ul>/g, "");

            // -----------------------------------------------------------
            // 步骤 5: 代码块格式化 (Pre + Code -> Markdown)
            // -----------------------------------------------------------
            // 将 HTML 的 pre/code 标签对转换为 Markdown 的 ``` 代码块
            text = text.replace(/<pre[^>]*>[\s\S]*?<code([^>]*)>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, (match, attrs, code) => {
                let lang = "";
                // 尝试从 class 属性中提取语言标识，如 "language-java"
                const langMatch = attrs.match(/language-([a-zA-Z0-9\+\-\#]+)/);
                if (langMatch) {
                    lang = langMatch[1];
                }
                
                // 代码内容解码：将 &lt; 等 HTML 实体还原为原始符号，确保代码逻辑正确
                code = code.replace(/&lt;/g, "<")
                           .replace(/&gt;/g, ">")
                           .replace(/&amp;/g, "&");
                
                return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
            });

            // -----------------------------------------------------------
            // 步骤 6: 图片标签转换
            // -----------------------------------------------------------
            // CSDN 图片通常在 data-original 属性中存储高分辨率原图，src 可能是缩略图或占位符
            text = text.replace(/<img[^>]+>/gi, (imgTag) => {
                const dataOriginal = imgTag.match(new RegExp('data-original\\s*=\\s*"([^"]+)"', 'i'));
                const src = imgTag.match(new RegExp('\\bsrc\\s*=\\s*"([^"]+)"', 'i'));
                
                // 优先使用 data-original，降级使用 src
                const url = (dataOriginal && dataOriginal[1]) ? dataOriginal[1] : (src ? src[1] : "");
                
                return url ? `\n![](${url})\n` : "";
            });

            // -----------------------------------------------------------
            // 步骤 7: 标题格式化 (H1 - H6)
            // -----------------------------------------------------------
            text = text.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (m, level, content) => {
                const cleanContent = content.replace(/<[^>]+>/g, "").trim();
                return `\n${"#".repeat(parseInt(level))} ${cleanContent}\n`;
            });

            // -----------------------------------------------------------
            // 步骤 8: 列表格式化 (UL/OL/LI)
            // -----------------------------------------------------------
            // 将列表容器转换为换行
            text = text.replace(/<\/?ul[^>]*>|<\/?ol[^>]*>/gi, "\n");
            // 将列表项转换为 Markdown 列表符 "- "
            text = text.replace(/<li[^>]*>/gi, "\n- ");
            text = text.replace(/<\/li>/gi, "");

            // -----------------------------------------------------------
            // 步骤 9: 文本样式与排版转换
            // -----------------------------------------------------------
            // 转换粗体 strong/b
            text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
            text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
            
            // 转换斜体 em
            text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
            
            // 处理换行 br 和段落 p
            text = text.replace(/<br\s*\/?>/gi, "\n");
            text = text.replace(/<p[^>]*>/gi, "\n");
            text = text.replace(/<\/p>/gi, "\n");

            // 链接转换 [text](url)
            text = text.replace(new RegExp('<a[^>]+href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>', 'gi'), " [$2]($1) ");

            // 引用块转换 blockquote
            text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, content) => {
                return `\n> ${content.trim().replace(/\n/g, "\n> ")}\n`;
            });

            // -----------------------------------------------------------
            // 步骤 10: 最终清理
            // -----------------------------------------------------------
            // 移除所有剩余的 HTML 标签，确保输出纯 Markdown
            text = text.replace(/<[^>]+>/g, "");
            // 解码剩余的空格实体
            text = text.replace(/&nbsp;/g, " ");
            // 压缩连续的多余空行，保持排版紧凑
            text = text.replace(/\n\s+\n/g, "\n\n");
            
            return text.trim();
        }
    };

    /**
     * 获取指定 URL 的文章详细内容。
     * 支持自动处理重定向和页面渲染，最终返回清洗后的 Markdown 文本。
     * * @param {Object|string} args - 参数对象或直接传入文章 URL
     * @param {string} args.url - 文章 URL
     * @returns {Promise<Object>} 包含文章标题、Markdown 内容、URL 等信息的对象
     */
    async function get_article(args) {
        const url = (args && args.url) ? args.url : args;
        
        // 参数有效性校验
        if (typeof url !== 'string') {
            return { status: 'error', message: '参数 url 无效，必须为非空字符串' };
        }

        try {
            // -----------------------------------------------------------
            // 请求阶段
            // -----------------------------------------------------------
            // 使用 httpGet 获取原始 HTML 源码。
            // 相比 visit 方法，httpGet 更适合获取未经处理的原始 DOM 结构，利于后续的精准解析。
            const response = await Tools.Net.httpGet(url, getHeaders());
            
            // 如果直连失败 (非 200 状态码)，尝试回退到 visit 模式 (模拟浏览器行为)
            // 这种降级策略可以应对部分需要 JS 渲染或复杂 Cookie 验证的页面
            if (response.statusCode !== 200) {
                const visitResult = await Tools.Net.visit({ 
                    url: url, 
                    headers: getHeaders() 
                });
                
                if (visitResult) {
                    return {
                        status: 'success',
                        title: visitResult.title,
                        url: visitResult.url,
                        content: visitResult.content, // 直接使用 visit 默认提取的文本作为降级结果
                        imageLinks: visitResult.imageLinks || [],
                        source: 'visit_fallback'
                    };
                }
                return { status: 'error', message: `请求页面失败: HTTP ${response.statusCode}` };
            }

            const html = response.content;
            
            // -----------------------------------------------------------
            // 解析阶段
            // -----------------------------------------------------------
            // 提取文章标题：优先查找 h1 标签，其次查找 title 标签
            let title = "无标题";
            const h1Match = html.match(new RegExp('<h1[^>]*title-article[^>]*>([\\s\\S]*?)<\\/h1>', 'i'));
            const titleTagMatch = html.match(new RegExp('<title>(.*?)<\\/title>', 'i'));
            
            if (h1Match) {
                title = h1Match[1].replace(/<[^>]+>/g, "").trim();
            } else if (titleTagMatch) {
                title = titleTagMatch[1].replace(/<[^>]+>/g, "").trim();
            }

            // 调用自定义解析器提取 Markdown 内容
            const markdown = CsdnParser.parse(html);

            return {
                status: 'success',
                title: title,
                url: url,
                content: markdown,
                length: markdown.length
            };
        } catch (e) {
            return { status: 'error', message: `获取文章内容失败: ${e.message}` };
        }
    }

    /**
     * 获取文章评论列表。
     * 调用 CSDN 评论 API 获取指定文章的评论数据，支持分页查看。
     * * @param {Object|string} args - 参数对象或文章 ID/URL
     * @param {string} args.article_url_or_id - 文章的唯一标识符
     * @param {number} args.page - 页码
     * @returns {Promise<Object>} 包含评论列表、总数等信息的对象
     */
    async function get_comments(args) {
        let { article_url_or_id, page = 1 } = args || {};
        
        // 兼容直接传入 ID 字符串的位置参数调用
        if (typeof args === 'string') {
             article_url_or_id = args;
             page = arguments[1] || 1;
        }

        try {
            // 解析并验证文章 ID
            const articleId = extractArticleId(article_url_or_id);
            if (!articleId) {
                return { status: 'error', message: '无法从输入中解析有效的文章 ID' };
            }

            // 构造评论 API 请求 URL
            const url = `https://blog.csdn.net/phoenix/web/v1/comment/list/${articleId}?page=${page}&size=20`;
            
            const result = await Tools.Net.visit({
                url: url,
                headers: getHeaders()
            });

            if (!result || !result.content) {
                return { status: 'error', message: '获取评论数据网络请求失败' };
            }

            // -----------------------------------------------------------
            // JSON 解析与数据清洗
            // -----------------------------------------------------------
            try {
                // 仅清洗可能存在的 pre 标签包裹，不破坏 JSON 内部的 HTML 转义字符
                const jsonText = result.content.replace(/^<pre[^>]*>|<\/pre>$/gi, "").trim(); 
                const data = JSON.parse(jsonText);
                
                if (data.code !== 200) {
                    return { status: 'error', message: data.message || '评论 API 返回非 200 错误码' };
                }

                // 将原始数据映射为标准格式，便于下游工具处理
                const comments = data.data.list.map(c => ({
                    id: c.info.commentId,
                    user: c.info.nickName,
                    content: c.info.content,
                    time: c.info.postTime,
                    replies: c.sub ? c.sub.length : 0 // 子评论数量
                }));

                return {
                    status: 'success',
                    articleId: articleId,
                    page: page,
                    total: data.data.count,
                    comments: comments
                };

            } catch (jsonErr) {
                // JSON 解析失败时的调试信息
                return { 
                    status: 'error', 
                    message: '解析评论 JSON 数据失败', 
                    raw: result.content.substring(0, 200) 
                };
            }

        } catch (e) {
            return { status: 'error', message: `获取评论过程异常: ${e.message}` };
        }
    }

    /**
     * 获取 CSDN 实时热榜数据。
     * * @param {Object|string} args - 参数对象或频道 ID
     * @param {string} [args.channel=''] - 频道 ID，为空表示全站热榜
     * @param {number} [args.page=0] - 页码
     * @returns {Promise<Object>} 包含热榜文章列表的对象
     */
    async function get_hot_rank(args) {
        let { channel = '', page = 0 } = args || {};
        
        // 兼容位置参数调用
        if (typeof args === 'string') {
            channel = args;
            page = arguments[1] || 0;
        }

        try {
            // -----------------------------------------------------------
            // 策略 A: 优先使用 API 获取数据 (通常需要 Cookie 支持)
            // -----------------------------------------------------------
            const apiUrl = `https://blog.csdn.net/phoenix/web/blog/hot-rank?page=${page}&pageSize=25${channel ? '&channel=' + channel : ''}`;
            
            const apiResult = await Tools.Net.visit({ 
                url: apiUrl, 
                headers: getHeaders() 
            });

            if (apiResult && apiResult.content) {
                try {
                    // 尝试清理并解析 JSON，移除可能的 HTML 包裹
                    const cleanContent = apiResult.content.replace(/<[^>]+>/g, "");
                    const json = JSON.parse(cleanContent);
                    
                    if (json.code === 200 && json.data && json.data.length > 0) {
                        return {
                            status: 'success',
                            source: 'api',
                            page: page,
                            list: json.data.map(item => ({
                                title: item.articleTitle,
                                url: item.articleDetailUrl,
                                views: item.viewCount,
                                comments: item.commentCount,
                                author: item.nickName
                            }))
                        };
                    }
                } catch (e) {
                    // JSON 解析失败，静默失败，进入策略 B
                }
            }

            // -----------------------------------------------------------
            // 策略 B: 网页爬取回退方案 (HTML 解析)
            // -----------------------------------------------------------
            const webUrl = `https://blog.csdn.net/rank/list${channel ? '/' + channel : ''}`;
            
            // 必须使用 httpGet 获取原始源码，因为 visit 可能会处理掉关键 DOM 结构
            const webResult = await Tools.Net.httpGet(webUrl, getHeaders());

            if (webResult.statusCode !== 200) {
                return { status: 'error', message: `无法获取热榜网页数据 (HTTP ${webResult.statusCode})` };
            }

            const html = webResult.content;
            const items = [];
            
            // 使用正则匹配每一个热榜项的容器
            // class="floor-rank-item" 是热榜项的标志性结构
            const regex = /<div class="floor-rank-item">([\s\S]*?)<\/div>/g;
            let match;
            
            while ((match = regex.exec(html)) !== null) {
                const itemHtml = match[1];
                
                // 修复语法错误：使用字符串构造正则以避免字面量解析歧义
                const titleMatch = itemHtml.match(new RegExp('<a href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>'));
                const viewMatch = itemHtml.match(new RegExp('<span class="view-num">.*?(\\d+).*?<\\/span>'));
                
                if (titleMatch) {
                    items.push({
                        title: titleMatch[2].replace(/<[^>]+>/g, "").trim(),
                        url: titleMatch[1],
                        views: viewMatch ? viewMatch[1] : "N/A"
                    });
                }
            }

            if (items.length === 0) {
                return { 
                    status: 'error', 
                    message: '解析热榜 HTML 失败，可能页面结构已变更或触发了验证码保护。' 
                };
            }

            return {
                status: 'success',
                source: 'web_scrape',
                list: items
            };

        } catch (e) {
            return { status: 'error', message: `获取热榜执行异常: ${e.message}` };
        }
    }

    /**
     * 获取指定用户（博主）的个人信息与统计数据。
     * 结合了 API 调用与网页爬取两种方式，以获取最完整的博主画像。
     * * @param {Object|string} args - 参数对象或用户名
     * @param {string} args.username - 用户名 (通常显示在 URL 中)
     * @returns {Promise<Object>} 用户信息及各项统计数据对象
     */
    async function get_user_info(args) {
        const username = (args && args.username) ? args.username : args;
        
        if (typeof username !== 'string') {
            return { status: 'error', message: '参数 username 无效，必须为字符串' };
        }

        try {
            // -----------------------------------------------------------
            // 策略 A: 尝试调用 API 获取部分统计信息
            // -----------------------------------------------------------
            // 尝试调用 tab-total 接口获取博客数、下载数等核心指标
            const apiUrl = `https://blog.csdn.net/community/home-api/v1/get-tab-total?username=${username}`;
            const apiResult = await Tools.Net.visit({
                url: apiUrl,
                headers: getHeaders()
            });
            
            let apiStats = null;
            if (apiResult && apiResult.content) {
                try {
                    const json = JSON.parse(apiResult.content.replace(/<[^>]+>/g, ""));
                    if (json.code === 200 && json.data) {
                        apiStats = json.data; // 数据示例: { blog: 111, download: 0, ... }
                    }
                } catch (e) {
                    // API 解析失败则忽略，后续步骤会尝试从 HTML 提取
                }
            }

            // -----------------------------------------------------------
            // 策略 B: 强制爬取 PC 端主页以获取完整画像
            // -----------------------------------------------------------
            const homeUrl = `https://blog.csdn.net/${username}`;
            
            // 构造 PC 端专用 User-Agent，覆盖默认的随机 UA
            // 固定的 PC UA 有助于确保服务端返回标准的 PC 网页结构，便于正则匹配
            const baseHeaders = getHeaders();
            const pcHeaders = { 
                ...baseHeaders, 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            };
            
            const webResult = await Tools.Net.httpGet(homeUrl, pcHeaders);

            if (webResult.statusCode !== 200) {
                return { status: 'error', message: `无法访问用户主页 (HTTP ${webResult.statusCode})` };
            }
            
            const html = webResult.content;
            
            // 提取用户昵称
            // 尝试匹配多种 DOM 结构：class="username" 或 id="uid"
            const nickMatch = html.match(new RegExp('class="username"[^>]*>([\\s\\S]*?)<\\/a>')) || 
                              html.match(new RegExp('id="uid"[^>]*>([\\s\\S]*?)<\\/a>'));
            
            const nickname = nickMatch ? nickMatch[1].replace(/<[^>]+>/g, "").trim() : username;
            
            // 辅助函数：处理带逗号的数字字符串，如 "1,234" -> 1234
            const parseNum = (str) => {
                if (!str) return -1;
                return parseInt(str.replace(/,/g, ''), 10);
            };

            // -----------------------------------------------------------
            // 统计数据正则提取
            // -----------------------------------------------------------
            
            // 1. 原创文章数 (优先使用 API 数据，降级使用 HTML 正则)
            const originalMatch = html.match(/<div class="user-profile-statistics-num">(\d+)<\/div>/);
            
            // 2. 粉丝数
            const fansMatch = html.match(/id="fanBox"[^>]*>[\s\S]*?<div class="user-profile-statistics-num">(\d+)<\/div>/);
            
            // 3. 互动数据：点赞、评论、访问、收藏 (基于 Title 属性匹配新版 UI 结构)
            const likeMatch = html.match(/title="获得\s*([\d,]+)\s*次点赞"/);
            const commentMatch = html.match(/title="获得\s*([\d,]+)\s*次评论"/);
            const visitMatch = html.match(/title="总访问量\s*([\d,]+)\s*"/);
            const collectMatch = html.match(/title="获得\s*([\d,]+)\s*次收藏"/);

            // 组装最终结果对象
            return {
                status: 'success',
                source: apiStats ? 'api_mixed' : 'web_scrape',
                username: username,
                nickname: nickname,
                level: 0, // 等级数据计算逻辑较复杂，当前版本暂保留为 0
                stats: {
                    // 如果 API 数据存在则优先使用，否则使用正则匹配结果
                    original: apiStats ? apiStats.blog : (originalMatch ? parseNum(originalMatch[1]) : -1),
                    fans: fansMatch ? parseNum(fansMatch[1]) : -1,
                    liked: likeMatch ? parseNum(likeMatch[1]) : -1,
                    comments: commentMatch ? parseNum(commentMatch[1]) : -1,
                    visits: visitMatch ? parseNum(visitMatch[1]) : -1,
                    collections: collectMatch ? parseNum(collectMatch[1]) : -1
                }
            };

        } catch (e) {
            return { status: 'error', message: `获取用户信息执行异常: ${e.message}` };
        }
    }

    /**
     * 连通性测试函数
     * 向 CSDN 首页发出探测请求，验证网络可达性
     * @returns {Promise<void>}
     */
    async function test() {
        try {
            const startTime = Date.now();
            const apiUrl = 'https://so.csdn.net/api/v3/search/get?q=test&t=all&p=1';
            const apiResult = await Tools.Net.visit({
                url: apiUrl,
                headers: getHeaders()
            });
            const latency = Date.now() - startTime;
            const isOk = !!(apiResult && apiResult.content && apiResult.content.length > 0);
            complete({
                success: isOk,
                message: isOk ? 'CSDN API 连通性测试通过' : 'CSDN API 响应内容为空',
                data: `## CSDN 连通性测试报告\n\n` +
                      `- **API 网关**: so.csdn.net\n` +
                      `- **状态**: ${isOk ? '✅ 连通正常' : '❌ 响应异常'}\n` +
                      `- **响应延迟**: ${latency}ms\n` +
                      `- **响应大小**: ${apiResult && apiResult.content ? apiResult.content.length : 0} 字符\n` +
                      `- **说明**: CSDN 无需 API Key，直接访问公开接口`
            });
        } catch (e) {
            complete({ success: false, message: `连通性测试失败: ${e.message}` });
        }
    }

    // 返回模块内部函数引用，暴露给外部接口
    return {
        search,
        get_article,
        get_comments,
        get_hot_rank,
        get_user_info,
        test
    };
})();

// ==========================================================================
// 模块导出定义
// ==========================================================================
// 将内部核心函数映射为外部可调用的标准接口
exports.search        = csdn_search.search;
exports.get_article   = csdn_search.get_article;
exports.get_comments  = csdn_search.get_comments;
exports.get_hot_rank  = csdn_search.get_hot_rank;
exports.get_user_info = csdn_search.get_user_info;
exports.test          = csdn_search.test;
