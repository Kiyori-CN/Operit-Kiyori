/* METADATA
{
    "name": "arxiv_assistant",
    "version": "1.0",
    "display_name": {
        "zh": "Arxiv 学术论文检索",
        "en": "Arxiv Academic Paper Search"
    },
    "description": {
        "zh": "Arxiv学术论文检索工具包。提供按关键词、作者、分类及日期范围搜索最新科研预印本的功能。支持分页、高级排序、自定义反向代理及指数退避抗风控检索。",
        "en": "Arxiv research paper search tool. Provides functions for searching latest preprints by keywords, authors, categories, and date ranges. Supports pagination, advanced sorting, custom reverse proxy, and exponential backoff retry."
    },
    "env": [
        {
            "name": "ARXIV_PROXY_DOMAIN",
            "description": {
                "zh": "自定义反向代理域名（可选），用于替换默认的 export.arxiv.org。格式示例：https://my-proxy.example.com 或 my-proxy.example.com（自动补充 https://）。不填则直接访问官方 API",
                "en": "Custom reverse proxy domain (optional) to replace export.arxiv.org. Example: https://my-proxy.example.com or my-proxy.example.com (auto-prefixes https://). Leave empty for direct access."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": true,
    "tools": [
        {
            "name": "search",
            "description": {
                "zh": "执行 arXiv 论文搜索。支持标准 arXiv 检索语法，并提供自定义排序机制。",
                "en": "Search papers on arXiv. Supports arXiv search syntax and sorting options."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "搜索查询字符串。支持限定符，如 'LLM' 或 'cat:cs.AI'。",
                        "en": "Search query string. Supports qualifiers like 'LLM' or 'cat:cs.AI'."
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "max_results",
                    "description": {
                        "zh": "返回结果的最大数量。缺省值为 10，单次上限为 100。",
                        "en": "Max results to return. Default: 10, max: 100."
                    },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "start_index",
                    "description": {
                        "zh": "搜索结果的起始索引（用于分页）。默认为 0。",
                        "en": "Start index for pagination. Defaults to 0."
                    },
                    "type": "number",
                    "required": false,
                    "default": 0
                },
                {
                    "name": "sort_by",
                    "description": {
                        "zh": "排序依据：relevance (相关性), lastUpdatedDate (更新日期), submittedDate (提交日期)。默认 relevance",
                        "en": "Sort criterion: relevance, lastUpdatedDate, submittedDate. Default: relevance"
                    },
                    "type": "string",
                    "required": false,
                    "default": "relevance"
                },
                {
                    "name": "sort_order",
                    "description": {
                        "zh": "排序顺序：ascending (升序), descending (降序)。默认 descending",
                        "en": "Sort order: ascending, descending. Default: descending"
                    },
                    "type": "string",
                    "required": false,
                    "default": "descending"
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 Arxiv API 连通性。验证网络可达性与代理配置是否正确。",
                "en": "Test Arxiv API connectivity. Validates network access and proxy configuration."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：Arxiv 学术助手 (ArxivAssistant)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本模块基于 Arxiv API 实现论文数据的自动化检索与结构化解析。
 * 具备 HTTPS 通讯、XML 标签提取、HTML 实体解码、文本清洗及抗风控重试机制。
 * * 版本：1.0
 * 语言：JavaScript (ES8+)
 * ==============================================================================
 */
const ArxivAssistant = (function () {
    // 初始化 OkHttp 客户端
    const client = OkHttp.newClient();

    // 支持自定义反向代理域名（用于国内网络加速）
    const _proxyDomain = (function () {
        let d = getEnv("ARXIV_PROXY_DOMAIN") || "";
        if (!d) return "https://export.arxiv.org";
        if (!d.startsWith("http")) d = "https://" + d;
        return d.replace(/\/$/, "");
    })();
    const BASE_URL = _proxyDomain + "/api/query";
    const IS_PROXY = _proxyDomain !== "https://export.arxiv.org";

    /**
     * HTML 实体解码函数
     */
    /**
     * HTML 实体解码函数
     * @param {string} html - 包含 HTML 实体的字符串
     * @returns {string} 解码后的字符串
     */
    function decodeHtml(html) {
        if (!html) return "";
        return html
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ");
    }

    /**
     * 文本清理函数
     */
    function cleanText(text) {
        if (!text) return "";
        // 先进行 HTML 实体解码，再清理空白字符
        const decoded = decodeHtml(text);
        return decoded.replace(/\r\n/g, "\n")
                   .replace(/\n/g, " ")
                   .replace(/\s+/g, " ")
                   .trim();
    }

    /**
     * XML 标签提取函数
     * 修复逻辑：支持带属性的标签及命名空间前缀
     */
    function extractTag(xml, tag) {
        // 匹配 <tag>...</tag> 或 <ns:tag attr="...">...</ns:tag>
        const regex = new RegExp("<(?:\\w+:)?\\b" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?\\b" + tag + ">", "i");
        const match = xml.match(regex);
        return match ? cleanText(match[1]) : "";
    }

    /**
     * 作者列表提取函数
     */
    function extractAuthors(entry) {
        const authors = [];
        const authorRegex = /<author[^>]*>\s*<name[^>]*>([\s\S]*?)<\/name>\s*<\/author>/gi;
        let match;
        while ((match = authorRegex.exec(entry)) !== null) {
            authors.push(cleanText(match[1]));
        }
        return authors.join(", ");
    }

    /**
     * 核心搜索执行函数
     */
    async function search(params) {
        try {
            // 参数提取与默认值设置
            const q = params.query;
            const maxResults = params.max_results || 10;
            const startIndex = params.start_index || 0;
            const sortBy = params.sort_by || "relevance";
            const sortOrder = params.sort_order || "descending";
            
            // 构造最终查询语句
            const finalQuery = q.includes(":") ? q : "all:" + q;
            const url = BASE_URL + "?search_query=" + encodeURIComponent(finalQuery) 
                    + "&max_results=" + maxResults
                    + "&start=" + startIndex
                    + "&sortBy=" + sortBy
                    + "&sortOrder=" + sortOrder;

            // 构建请求生成器（用于重试）
            const buildRequest = () => client.newRequest()
                .url(url)
                .method('GET')
                .headers({
                    // 伪装成标准浏览器
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/atom+xml, application/xml, text/xml, */*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": "https://arxiv.org/"
                })
                .build();

            // 初次执行请求
            let response = await buildRequest().execute();

            // 指数退避重试机制（支持 429 限流 / 5xx 服务端错误自动恢复）
            const MAX_RETRIES = 3;
            let retryCount = 0;
            while (retryCount < MAX_RETRIES && (response.statusCode === 429 || response.statusCode >= 500)) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
                console.log(`[ArxivAssistant] HTTP ${response.statusCode}，第 ${retryCount + 1} 次重试，等待 ${delay}ms...`);
                await Tools.System.sleep(delay);
                response = await buildRequest().execute();
                retryCount++;
            }

            // 响应状态校验
            if (!response.isSuccessful()) {
                complete({ 
                    success: false, 
                    message: `HTTP Error: ${response.statusCode}`,
                    error_stack: response.statusMessage || "Request failed even after retry"
                });
                return;
            }

            const xml = response.content;
            if (!xml) {
                complete({ success: false, message: "Arxiv API returned empty response" });
                return;
            }

            // 执行结果列表解析
            const papers = [];
            const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
            let match;

            while ((match = entryRegex.exec(xml)) !== null) {
                const block = match[1];
                const idRaw = extractTag(block, "id");
                const paperId = idRaw.split("/").pop(); // http://arxiv.org/abs/xxxx -> xxxx
                
                // 结构化存储论文元数据
                papers.push({
                    id: paperId,
                    title: extractTag(block, "title"),
                    summary: extractTag(block, "summary"),
                    authors: extractAuthors(block),
                    published: extractTag(block, "published").split("T")[0],
                    updated: extractTag(block, "updated").split("T")[0],
                    category: (block.match(/<arxiv:primary_category[^>]*term="([^"]*)"/i) || [])[1] || "N/A",
                    url: idRaw,
                    pdf_url: `https://arxiv.org/pdf/${paperId}.pdf`
                });
            }

            // 获取搜索结果总数
            const totalMatch = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/i);
            const totalResults = totalMatch ? parseInt(totalMatch[1]) : 0;

            // 返回结果
            complete({
                success: true,
                message: `Found ${papers.length} papers (from index ${startIndex}).`,
                data: {
                    count: papers.length,
                    start_index: startIndex,
                    total_results: totalResults,
                    papers: papers
                }
            });

        } catch (e) {
            complete({ 
                success: false, 
                message: e.message,
                error_stack: e.stack 
            });
        }
    }

    /**
     * 连通性测试核心函数
     * 发送最小化搜索请求，验证 API 可达性与代理配置
     */
    async function testCore() {
        try {
            const startTime = Date.now();
            const testUrl = BASE_URL + "?search_query=all:test&max_results=1";
            console.log(`[ArxivAssistant] 连通性测试，目标: ${testUrl}`);
            const response = await client.newRequest()
                .url(testUrl)
                .method('GET')
                .headers({
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/atom+xml, application/xml, */*"
                })
                .build()
                .execute();
            const latency = Date.now() - startTime;
            const ok = response.isSuccessful();
            complete({
                success: ok,
                message: ok ? 'Arxiv API 连通性测试通过' : `API 响应异常: HTTP ${response.statusCode}`,
                data: `## Arxiv API 连通性测试报告\n\n` +
                      `- **网关**: ${_proxyDomain}${IS_PROXY ? ' （反向代理）' : ' （官方）'}\n` +
                      `- **状态**: ${ok ? '✅ 连通正常' : '❌ 连通异常'}\n` +
                      `- **HTTP 状态码**: ${response.statusCode}\n` +
                      `- **响应延迟**: ${latency}ms`
            });
        } catch (e) {
            complete({ success: false, message: `连通性测试失败: ${e.message}` });
        }
    }

    // 公开模块接口
    return {
        /**
         * 论文搜索入口
         * 最简调用：{ query: "机器学习" }
         * @param {Object} p - 搜索参数
         */
        search: function (p) { return search(p); },

        /**
         * 连通性测试入口
         * 调用方式：无需参数
         */
        test: function () { return testCore(); }
    };
})();

// ==============================================================================
// 导出模块工具
// ==============================================================================
exports.search = ArxivAssistant.search;
exports.test   = ArxivAssistant.test;