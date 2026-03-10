/* METADATA
{
    "name": "userscript_search",
    "version": "1.0",
    "display_name": {
        "zh": "油猴脚本多平台搜索",
        "en": "Userscript Multi-Platform Search"
    },
    "description": {
        "zh": "油猴脚本多平台搜索工具包。聚合 GreasyFork、OpenUserJS、Userscript.Zone、GitHub 等脚本平台，提供脚本搜索、详情查看、源码读取、版本历史、按站点匹配等功能。支持按安装量/评分/更新时间排序，帮助 AI 高效检索和分析用户脚本。",
        "en": "Multi-platform userscript search toolkit. Aggregates GreasyFork, OpenUserJS, Userscript.Zone, and GitHub to provide script search, detail viewing, source code reading, version history, and site-matching capabilities. Supports sorting by installs/rating/update time."
    },
    "enabledByDefault": false,
    "env": [
        {
            "name": "USERSCRIPT_PROXY_DOMAIN",
            "description": {
                "zh": "自定义反向代理域名（可选），用于替换默认的 greasyfork.org、openuserjs.org 等平台域名。格式示例：https://my-proxy.example.com 或 my-proxy.example.com（自动补充 https://）。不填则直接访问官方站点。注意：需要在 Cloudflare Workers 等反向代理服务中配置对应的域名映射规则",
                "en": "Custom reverse proxy domain (optional) to replace default platform domains (greasyfork.org, openuserjs.org, etc.). Example: https://my-proxy.example.com or my-proxy.example.com (auto-prefixes https://). Leave empty for direct access. Note: Requires proper domain mapping rules in Cloudflare Workers or similar reverse proxy services."
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "search_scripts",
            "description": {
                "zh": "在 GreasyFork 上搜索油猴脚本。返回匹配脚本的列表，包含名称、描述、安装量、评分、作者等关键信息。支持按网站域名筛选和排序。这是最主要的搜索入口，GreasyFork 拥有最完善的 JSON API 和最大的脚本库。",
                "en": "Search userscripts on GreasyFork. Returns matching scripts with name, description, installs, ratings, author. Supports site-specific filtering and sorting. Primary search entry with the largest script repository."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词（脚本名称或功能描述）", "en": "Search keyword (script name or feature description)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "page",
                    "description": { "zh": "结果页码，默认 1", "en": "Result page number. Default: 1" },
                    "type": "number",
                    "required": false,
                    "default": 1
                },
                {
                    "name": "sort",
                    "description": { "zh": "排序方式：daily_installs（日安装量）、total_installs（总安装量）、ratings（评分）、created（创建时间）、updated（更新时间）、name（名称）。默认按相关性", "en": "Sort: daily_installs, total_installs, ratings, created, updated, name. Default: relevance" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "language",
                    "description": { "zh": "脚本语言：js 或 css，留空返回全部", "en": "Script language: js or css. Empty for all." },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "site",
                    "description": { "zh": "按适用网站域名筛选（如 youtube.com、github.com），留空搜索全部", "en": "Filter by applicable site domain (e.g., youtube.com). Empty for all." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "get_script_detail",
            "description": {
                "zh": "获取 GreasyFork 上某个脚本的详细信息（JSON API）。返回完整的脚本元数据，包含名称、描述、版本、作者、许可证、安装量统计、评分、代码链接等。通过脚本 ID 精确查询。",
                "en": "Get detailed info for a GreasyFork script via JSON API. Returns full metadata including name, description, version, author, license, install stats, ratings, code URL. Query by script ID."
            },
            "parameters": [
                {
                    "name": "script_id",
                    "description": { "zh": "GreasyFork 脚本 ID（数字）", "en": "GreasyFork script ID (numeric)" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "get_script_code",
            "description": {
                "zh": "获取脚本的完整源代码。支持 GreasyFork 和 OpenUserJS 两个平台。返回脚本的 .user.js 完整内容，包含 metadata 头和全部逻辑代码。注意：超长脚本会自动截断以控制 token 消耗。",
                "en": "Get full script source code from GreasyFork or OpenUserJS. Returns complete .user.js content including metadata header and logic. Long scripts are auto-truncated to control token usage."
            },
            "parameters": [
                {
                    "name": "script_id",
                    "description": { "zh": "脚本 ID（GreasyFork 为数字 ID，OpenUserJS 格式为 '作者/脚本名'）", "en": "Script ID (numeric for GreasyFork, 'author/name' for OpenUserJS)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "source",
                    "description": { "zh": "来源平台：greasyfork（默认）或 openuserjs", "en": "Source platform: greasyfork (default) or openuserjs" },
                    "type": "string",
                    "required": false,
                    "default": "greasyfork"
                },
                {
                    "name": "max_length",
                    "description": { "zh": "返回源码的最大字符数（控制 token 消耗），默认 15000", "en": "Max characters to return (controls token usage). Default: 15000" },
                    "type": "number",
                    "required": false,
                    "default": 15000
                }
            ]
        },
        {
            "name": "get_script_versions",
            "description": {
                "zh": "获取 GreasyFork 脚本的版本更新历史记录。返回各版本号、发布时间、变更日志等信息，用于了解脚本的迭代演进和维护状态。",
                "en": "Get version history for a GreasyFork script. Returns version numbers, release dates, changelogs to understand script evolution and maintenance status."
            },
            "parameters": [
                {
                    "name": "script_id",
                    "description": { "zh": "GreasyFork 脚本 ID", "en": "GreasyFork script ID" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "search_by_site",
            "description": {
                "zh": "按目标网站搜索适用的油猴脚本。输入一个网址或域名，返回能在该网站上运行的脚本列表。聚合 GreasyFork 按站点筛选的结果，特别适合「为某个网站找增强脚本」的场景。",
                "en": "Search userscripts by target website. Enter a URL or domain to find scripts that run on that site. Aggregates GreasyFork by-site results. Ideal for 'find enhancement scripts for a website' scenarios."
            },
            "parameters": [
                {
                    "name": "domain",
                    "description": { "zh": "目标网站域名（如 youtube.com、twitter.com、zhihu.com）", "en": "Target site domain (e.g., youtube.com, twitter.com, zhihu.com)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "sort",
                    "description": { "zh": "排序方式：daily_installs、total_installs、ratings、created、updated。默认 daily_installs", "en": "Sort: daily_installs, total_installs, ratings, created, updated. Default: daily_installs" },
                    "type": "string",
                    "required": false,
                    "default": "daily_installs"
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false,
                    "default": 1
                }
            ]
        },
        {
            "name": "search_openuserjs",
            "description": {
                "zh": "在 OpenUserJS 上搜索油猴脚本。作为 GreasyFork 的补充来源，部分独占脚本仅在此平台发布。通过 HTML 解析获取搜索结果。",
                "en": "Search userscripts on OpenUserJS. A complementary source to GreasyFork, some exclusive scripts are only published here. Results obtained via HTML parsing."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词", "en": "Search keyword" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "page",
                    "description": { "zh": "页码，默认 1", "en": "Page number. Default: 1" },
                    "type": "number",
                    "required": false,
                    "default": 1
                }
            ]
        },
        {
            "name": "search_userscript_zone",
            "description": {
                "zh": "通过 Userscript.Zone 按 URL/域名/关键词搜索脚本。该站聚合多个脚本平台的数据（GreasyFork、OpenUserJS、GitHub 等），搜索覆盖面最广。",
                "en": "Search scripts via Userscript.Zone by URL/domain/keyword. This site aggregates data from multiple platforms (GreasyFork, OpenUserJS, GitHub) with the broadest coverage."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索内容（URL、域名或关键词）", "en": "Search content (URL, domain, or keyword)" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "get_user_scripts",
            "description": {
                "zh": "获取 GreasyFork 上某个作者发布的全部脚本列表。通过用户 ID 查询，返回该作者的所有脚本及统计数据。适合发现优质作者的系列作品。",
                "en": "Get all scripts published by a GreasyFork user. Query by user ID to find all scripts and stats from an author. Great for discovering prolific authors' works."
            },
            "parameters": [
                {
                    "name": "user_id",
                    "description": { "zh": "GreasyFork 用户 ID（数字）", "en": "GreasyFork user ID (numeric)" },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试脚本平台连通性。验证 GreasyFork、OpenUserJS 等平台的网络可达性，以及代理配置是否生效。",
                "en": "Test script platform connectivity. Validates network access to GreasyFork, OpenUserJS, and other platforms, and verifies proxy configuration."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：油猴脚本多平台搜索工具包 (Userscript Multi-Platform Search Toolkit)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本模块聚合了多个主流用户脚本托管平台的搜索和数据获取能力，
 * 为 AI 提供高效的脚本检索、分析和源码阅读功能。
 *
 * 支持平台：
 * 1. GreasyFork (greasyfork.org) — 主力平台，拥有原生 JSON API
 * 2. OpenUserJS (openuserjs.org) — 补充平台，通过 HTML 解析
 * 3. Userscript.Zone (userscript.zone) — 聚合搜索，覆盖面最广
 * 4. GitHub Raw — 直接获取脚本源码
 *
 * 核心设计理念（面向 AI 使用优化）：
 * - 信息密度优先：精选最有价值的字段展示，避免冗余
 * - Token 消耗控制：所有输出严格限制字数，长内容自动截断
 * - 结构化输出：统一 Markdown 格式，便于 AI 解析和引用
 * - 渐进式获取：先搜索概览 → 再查看详情 → 按需读取源码
 * - 多源互补：主搜 GreasyFork，辅以 OpenUserJS 和 Zone 扩展覆盖
 *
 * 技术细节：
 * - 基于 OkHttp 客户端，IIFE 封装
 * - 智能重试机制（429 限流 + 5xx 降级）
 * - HTML 标签清洗和实体解码
 * - Userscript Metadata Block 解析器
 *
 * 版本：v1.0
 * 运行环境：Operit JavaScript 沙箱
 * 外部依赖：无（无需 API Key）
 * ==============================================================================
 */
const UserscriptSearchToolkit = (function () {

    // ==========================================================================
    // 第一部分：全局配置与常量
    // ==========================================================================

    const client = OkHttp.newClient();
    const LOG_TAG = "[UserscriptSearch]";

    /**
     * 通用浏览器 User-Agent
     * 部分平台对非浏览器 UA 会拒绝访问或返回异常
     */
    const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    /**
     * 平台基础 URL 映射表（默认官方域名）
     */
    const DEFAULT_PLATFORMS = {
        GREASYFORK:      "https://greasyfork.org",
        GREASYFORK_CDN:  "https://update.greasyfork.org",
        OPENUSERJS:      "https://openuserjs.org",
        USERSCRIPT_ZONE: "https://www.userscript.zone"
    };

    /**
     * 输出控制常量 — 面向 AI 的 Token 消耗优化
     */
    const OUTPUT_LIMITS = {
        MAX_SEARCH_ITEMS: 15,          // 搜索结果最大展示条数
        MAX_CODE_LENGTH: 15000,        // 源码最大字符数
        MAX_DESCRIPTION_LENGTH: 200,   // 单条描述最大字符数
        MAX_VERSION_ITEMS: 20,         // 版本历史最大展示条数
        MAX_OPENUSERJS_ITEMS: 12,      // OpenUserJS 结果最大条数
        MAX_ZONE_ITEMS: 15,            // Zone 搜索最大条数
        RETRY_COUNT: 2,                // 网络请求重试次数
        RETRY_DELAY: 1500              // 重试间隔毫秒
    };

    /**
     * 反向代理域名规范化处理
     * 功能：处理用户自定义代理域名，确保符合 URL 规范
     * @returns {string|null} 完整的代理地址（含协议头，无尾部斜杠），未配置则返回 null
     */
    function resolveProxyDomain() {
        const envProxy = getEnv('USERSCRIPT_PROXY_DOMAIN');
        if (!envProxy || envProxy.trim() === '') {
            return null;
        }

        let proxy = envProxy.trim();

        // 移除尾部路径片段
        proxy = proxy.replace(/\/+(scripts|search|users).*$/i, '');

        // 自动补充协议头
        if (!/^https?:\/\//i.test(proxy)) {
            proxy = 'https://' + proxy;
        }

        // 移除尾部斜杠
        return proxy.replace(/\/+$/, '');
    }

    /**
     * URL 代理替换器
     * 功能：将官方域名替换为反向代理域名
     * @param {string} url - 原始 URL
     * @returns {string} 替换后的 URL
     */
    function applyProxy(url) {
        const proxyDomain = resolveProxyDomain();
        if (!proxyDomain) {
            return url; // 未配置代理，直接返回原 URL
        }

        // 替换所有已知平台域名为代理域名
        let proxiedUrl = url;
        for (const key in DEFAULT_PLATFORMS) {
            const officialDomain = DEFAULT_PLATFORMS[key];
            if (url.startsWith(officialDomain)) {
                proxiedUrl = url.replace(officialDomain, proxyDomain);
                console.log(`${LOG_TAG} 代理替换: ${officialDomain} → ${proxyDomain}`);
                break;
            }
        }

        return proxiedUrl;
    }

    /**
     * 获取当前生效的平台 URL 映射表
     * 如果配置了代理，所有平台 URL 都指向代理域名
     * @returns {Object} 平台 URL 映射表
     */
    function getPlatforms() {
        const proxyDomain = resolveProxyDomain();
        if (!proxyDomain) {
            return DEFAULT_PLATFORMS; // 未配置代理，使用默认官方域名
        }

        // 配置了代理，所有平台都指向代理域名
        console.log(`${LOG_TAG} 使用反向代理: ${proxyDomain}`);
        return {
            GREASYFORK:      proxyDomain,
            GREASYFORK_CDN:  proxyDomain,
            OPENUSERJS:      proxyDomain,
            USERSCRIPT_ZONE: proxyDomain
        };
    }

    // 动态获取平台 URL
    const PLATFORMS = getPlatforms();

    // ==========================================================================
    // 第二部分：基础工具函数
    // ==========================================================================

    /**
     * HTML 实体解码
     */
    function decodeHtmlEntities(text) {
        if (!text) return "";
        return text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(d); });
    }

    /**
     * 剥离 HTML 标签
     */
    function stripHtml(html) {
        if (!html) return "";
        return decodeHtmlEntities(
            html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
        );
    }

    /**
     * 安全截断文本
     * @param {string} text - 源文本
     * @param {number} maxLen - 最大长度
     * @param {string} suffix - 截断后缀
     */
    function truncate(text, maxLen, suffix) {
        if (!text) return "";
        suffix = suffix || "...";
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + suffix;
    }

    /**
     * 数值范围约束
     */
    function clamp(val, min, max, def) {
        if (val === undefined || val === null || isNaN(val)) return def;
        return Math.max(min, Math.min(max, Math.floor(Number(val))));
    }

    /**
     * 格式化数字为可读字符串（如 12345 → 12,345）
     */
    function formatNumber(num) {
        if (num === undefined || num === null) return "-";
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * 格式化日期为短格式
     */
    function formatDate(dateStr) {
        if (!dateStr) return "-";
        // 尝试提取 YYYY-MM-DD 部分
        const match = String(dateStr).match(/(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
        // 尝试 ISO 格式
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.getFullYear() + "-" +
                String(d.getMonth() + 1).padStart(2, "0") + "-" +
                String(d.getDate()).padStart(2, "0");
        }
        return String(dateStr).substring(0, 10);
    }

    /**
     * 从 Userscript 源码中提取 Metadata Block
     * 解析 ==UserScript== 头部为结构化对象
     * @param {string} code - 脚本源码
     * @returns {Object} 键值对对象（支持多值字段如 @match 返回数组）
     */
    function parseMetadataBlock(code) {
        if (!code) return {};
        const match = code.match(/\/\/\s*==UserScript==\s*\n([\s\S]*?)\/\/\s*==\/UserScript==/);
        if (!match) return {};

        const meta = {};
        const lines = match[1].split("\n");
        for (let i = 0; i < lines.length; i++) {
            const lineMatch = lines[i].match(/\/\/\s*@(\S+)\s+(.*)/);
            if (lineMatch) {
                const key = lineMatch[1].trim();
                const value = lineMatch[2].trim();
                // 某些字段可以有多个值（如 @match, @include, @grant）
                if (meta[key]) {
                    if (Array.isArray(meta[key])) {
                        meta[key].push(value);
                    } else {
                        meta[key] = [meta[key], value];
                    }
                } else {
                    meta[key] = value;
                }
            }
        }
        return meta;
    }

    // ==========================================================================
    // 第三部分：HTTP 请求引擎
    // ==========================================================================

    /**
     * 带重试的 HTTP GET 请求
     * @param {string} url - 请求 URL
     * @param {Object} headers - 额外请求头
     * @returns {Promise<string>} 原始响应内容
     */
    async function httpGet(url, headers) {
        const mergedHeaders = Object.assign({
            "User-Agent": BROWSER_UA,
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
        }, headers || {});

        let lastError = null;

        for (let attempt = 0; attempt <= OUTPUT_LIMITS.RETRY_COUNT; attempt++) {
            try {
                const reqBuilder = client.newRequest().url(url).method("GET");
                for (const k in mergedHeaders) {
                    reqBuilder.header(k, mergedHeaders[k]);
                }
                const resp = await reqBuilder.build().execute();

                // 限流重试
                if (resp.statusCode === 429) {
                    console.warn(`${LOG_TAG} 限流 429, 重试中... [${attempt + 1}]`);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(OUTPUT_LIMITS.RETRY_DELAY * (attempt + 1));
                    }
                    lastError = new Error("请求被限流 (429)，请稍后重试");
                    continue;
                }

                // 服务器错误重试
                if (resp.statusCode >= 500) {
                    console.warn(`${LOG_TAG} 服务器错误 ${resp.statusCode}, 重试中...`);
                    if (typeof Tools !== "undefined" && Tools.System && typeof Tools.System.sleep === "function") {
                        await Tools.System.sleep(OUTPUT_LIMITS.RETRY_DELAY);
                    }
                    lastError = new Error(`服务器错误 (${resp.statusCode})`);
                    continue;
                }

                if (!resp.isSuccessful()) {
                    throw new Error(`HTTP ${resp.statusCode}`);
                }

                return resp.content || "";

            } catch (e) {
                lastError = e;
                if (attempt < OUTPUT_LIMITS.RETRY_COUNT) {
                    console.warn(`${LOG_TAG} 请求异常: ${e.message}, 准备重试`);
                }
            }
        }

        throw lastError || new Error("请求失败");
    }

    /**
     * HTTP GET 并解析 JSON
     */
    async function httpGetJson(url, headers) {
        const raw = await httpGet(url, headers);
        if (!raw || raw.trim() === "") throw new Error("空响应");
        return JSON.parse(raw);
    }

    // ==========================================================================
    // 第四部分：GreasyFork 数据源实现
    // ==========================================================================

    /**
     * GreasyFork 搜索
     * API：在 URL 后追加 .json 即可获得 JSON 格式结果
     * 示例：https://greasyfork.org/zh-CN/scripts?q=dark+theme&page=1&sort=daily_installs
     */
    async function greasyforkSearch(query, page, sort, language, site) {
        if (!query || String(query).trim() === "") {
            throw new Error("搜索关键词不能为空");
        }

        page = clamp(page, 1, 100, 1);

        // 构建搜索 URL
        let url = `${PLATFORMS.GREASYFORK}/zh-CN/scripts.json?q=${encodeURIComponent(query)}&page=${page}`;

        if (sort) url += `&sort=${encodeURIComponent(sort)}`;
        if (language) url += `&language=${encodeURIComponent(language)}`;
        if (site) url += `&filter_locale=0`;

        const scripts = await httpGetJson(url);

        if (!Array.isArray(scripts)) {
            throw new Error("API 返回格式异常");
        }

        // 格式化输出
        const buf = [];
        buf.push("## GreasyFork 脚本搜索结果\n");
        buf.push(`**关键词**: ${query}`);
        if (sort) buf.push(`**排序**: ${sort}`);
        buf.push(`**页码**: ${page}`);
        buf.push(`**本页结果**: ${scripts.length} 条\n`);

        if (scripts.length === 0) {
            buf.push("未找到匹配的脚本。建议：");
            buf.push("- 尝试英文关键词");
            buf.push("- 使用 search_by_site 按域名搜索");
            buf.push("- 使用 search_userscript_zone 跨平台搜索");
            return buf.join("\n");
        }

        buf.push("---\n");

        const displayScripts = scripts.slice(0, OUTPUT_LIMITS.MAX_SEARCH_ITEMS);
        displayScripts.forEach(function (s, idx) {
            const desc = truncate(s.description || "", OUTPUT_LIMITS.MAX_DESCRIPTION_LENGTH);
            buf.push(`### ${idx + 1}. ${s.name}`);
            buf.push(`- **ID**: ${s.id} | **版本**: ${s.version || "-"}`);
            buf.push(`- **作者**: ${s.users ? s.users.map(function(u) { return u.name; }).join(", ") : "-"}`);
            buf.push(`- **日安装**: ${formatNumber(s.daily_installs)} | **总安装**: ${formatNumber(s.total_installs)}`);
            buf.push(`- **评分**: 👍${s.good_ratings || 0} 👌${s.ok_ratings || 0} 👎${s.bad_ratings || 0} | **评分指数**: ${s.fan_score || "-"}`);
            buf.push(`- **许可证**: ${s.license || "-"}`);
            buf.push(`- **更新**: ${formatDate(s.code_updated_at)} | **创建**: ${formatDate(s.created_at)}`);
            buf.push(`- **详情**: ${s.url || PLATFORMS.GREASYFORK + "/scripts/" + s.id}`);
            if (desc) buf.push(`- **描述**: ${desc}`);
            buf.push("");
        });

        if (scripts.length > OUTPUT_LIMITS.MAX_SEARCH_ITEMS) {
            buf.push(`\n> *(仅展示前 ${OUTPUT_LIMITS.MAX_SEARCH_ITEMS} 条，共 ${scripts.length} 条。翻页请增加 page 参数。)*`);
        }

        buf.push("\n> 💡 提示：使用 get_script_detail(script_id) 查看详情，get_script_code(script_id) 读取源码。");

        return buf.join("\n");
    }

    /**
     * GreasyFork 按站点搜索
     * URL 格式：https://greasyfork.org/zh-CN/scripts/by-site/{domain}.json
     */
    async function greasyforkSearchBySite(domain, sort, page) {
        if (!domain || String(domain).trim() === "") {
            throw new Error("域名不能为空");
        }

        // 清理域名格式
        domain = String(domain).trim()
            .replace(/^https?:\/\//i, "")
            .replace(/\/.*$/, "")
            .toLowerCase();

        page = clamp(page, 1, 100, 1);
        sort = sort || "daily_installs";

        const url = `${PLATFORMS.GREASYFORK}/zh-CN/scripts/by-site/${encodeURIComponent(domain)}.json?sort=${sort}&page=${page}`;

        let scripts;
        try {
            scripts = await httpGetJson(url);
        } catch (e) {
            // 降级：尝试通过搜索 + site 参数
            console.warn(`${LOG_TAG} by-site 接口异常，降级到搜索模式: ${e.message}`);
            const fallbackUrl = `${PLATFORMS.GREASYFORK}/zh-CN/scripts.json?q=${encodeURIComponent(domain)}&page=${page}&sort=${sort}`;
            scripts = await httpGetJson(fallbackUrl);
        }

        if (!Array.isArray(scripts)) {
            throw new Error("API 返回格式异常");
        }

        const buf = [];
        buf.push(`## 适用于 ${domain} 的油猴脚本\n`);
        buf.push(`**排序**: ${sort} | **页码**: ${page}`);
        buf.push(`**本页结果**: ${scripts.length} 条\n`);
        buf.push("---\n");

        if (scripts.length === 0) {
            buf.push(`未找到适用于 ${domain} 的脚本。`);
            return buf.join("\n");
        }

        const displayScripts = scripts.slice(0, OUTPUT_LIMITS.MAX_SEARCH_ITEMS);
        displayScripts.forEach(function (s, idx) {
            const desc = truncate(s.description || "", 150);
            buf.push(`**${idx + 1}. ${s.name}** (ID: ${s.id})`);
            buf.push(`   日安装 ${formatNumber(s.daily_installs)} | 总安装 ${formatNumber(s.total_installs)} | 👍${s.good_ratings || 0} | v${s.version || "?"} | ${formatDate(s.code_updated_at)}`);
            if (desc) buf.push(`   ${desc}`);
            buf.push("");
        });

        return buf.join("\n");
    }

    /**
     * GreasyFork 脚本详情
     * API：https://greasyfork.org/scripts/{id}.json
     */
    async function greasyforkGetDetail(scriptId) {
        if (!scriptId) throw new Error("脚本 ID 不能为空");
        scriptId = String(scriptId).trim();

        const url = `${PLATFORMS.GREASYFORK}/scripts/${scriptId}.json`;
        const s = await httpGetJson(url);

        if (!s || !s.id) {
            throw new Error(`脚本 ID ${scriptId} 不存在或已被删除`);
        }

        const buf = [];
        buf.push(`## 📜 ${s.name}\n`);
        buf.push(`**描述**: ${s.description || "无描述"}\n`);
        buf.push("### 基本信息");
        buf.push(`| 属性 | 值 |`);
        buf.push(`| :--- | :--- |`);
        buf.push(`| ID | ${s.id} |`);
        buf.push(`| 版本 | ${s.version || "-"} |`);
        buf.push(`| 作者 | ${s.users ? s.users.map(function(u) { return u.name; }).join(", ") : "-"} |`);
        buf.push(`| 许可证 | ${s.license || "未声明"} |`);
        buf.push(`| 命名空间 | ${s.namespace || "-"} |`);
        buf.push(`| 语言/区域 | ${s.locale || "-"} |`);
        buf.push(`| 创建时间 | ${formatDate(s.created_at)} |`);
        buf.push(`| 代码更新 | ${formatDate(s.code_updated_at)} |`);

        buf.push("\n### 统计数据");
        buf.push(`| 指标 | 数值 |`);
        buf.push(`| :--- | :--- |`);
        buf.push(`| 日安装量 | ${formatNumber(s.daily_installs)} |`);
        buf.push(`| 总安装量 | ${formatNumber(s.total_installs)} |`);
        buf.push(`| 好评 (👍) | ${s.good_ratings || 0} |`);
        buf.push(`| 中评 (👌) | ${s.ok_ratings || 0} |`);
        buf.push(`| 差评 (👎) | ${s.bad_ratings || 0} |`);
        buf.push(`| 粉丝指数 | ${s.fan_score || "-"} |`);

        buf.push("\n### 链接");
        buf.push(`- **详情页**: ${s.url || PLATFORMS.GREASYFORK + "/scripts/" + s.id}`);
        if (s.code_url) buf.push(`- **源码**: ${s.code_url}`);
        if (s.support_url) buf.push(`- **反馈**: ${s.support_url}`);
        if (s.contribution_url) buf.push(`- **捐赠**: ${s.contribution_url}`);

        buf.push("\n> 💡 使用 get_script_code('" + s.id + "') 读取完整源码，get_script_versions('" + s.id + "') 查看版本历史。");

        return buf.join("\n");
    }

    /**
     * GreasyFork 脚本源码获取
     * URL 格式：https://greasyfork.org/scripts/{id}/code/script.user.js
     * 或使用 code_url 字段
     */
    async function greasyforkGetCode(scriptId, maxLength) {
        if (!scriptId) throw new Error("脚本 ID 不能为空");
        scriptId = String(scriptId).trim();
        maxLength = clamp(maxLength, 1000, 60000, OUTPUT_LIMITS.MAX_CODE_LENGTH);

        // 先获取脚本元数据以得到 code_url
        let codeUrl;
        try {
            const meta = await httpGetJson(`${PLATFORMS.GREASYFORK}/scripts/${scriptId}.json`);
            codeUrl = meta.code_url;
        } catch (e) {
            console.warn(`${LOG_TAG} 获取元数据失败，使用默认 URL: ${e.message}`);
        }

        if (!codeUrl) {
            codeUrl = `${PLATFORMS.GREASYFORK}/scripts/${scriptId}/code/script.user.js`;
        }

        const code = await httpGet(codeUrl);

        if (!code || code.trim().length === 0) {
            throw new Error("源码获取失败，可能脚本已被删除");
        }

        // 解析 metadata
        const meta = parseMetadataBlock(code);

        const buf = [];
        buf.push(`## 📄 脚本源码 (GreasyFork #${scriptId})\n`);

        // 展示 metadata 摘要
        if (Object.keys(meta).length > 0) {
            buf.push("### Metadata 信息");
            if (meta.name) buf.push(`- **名称**: ${meta.name}`);
            if (meta.version) buf.push(`- **版本**: ${meta.version}`);
            if (meta.author) buf.push(`- **作者**: ${meta.author}`);
            if (meta.description) buf.push(`- **描述**: ${meta.description}`);
            if (meta.license) buf.push(`- **许可证**: ${meta.license}`);
            if (meta.match) {
                const matches = Array.isArray(meta.match) ? meta.match : [meta.match];
                buf.push(`- **匹配站点**: ${matches.slice(0, 10).join(", ")}${matches.length > 10 ? " ..." : ""}`);
            }
            if (meta.grant) {
                const grants = Array.isArray(meta.grant) ? meta.grant : [meta.grant];
                buf.push(`- **权限**: ${grants.join(", ")}`);
            }
            if (meta.require) {
                const reqs = Array.isArray(meta.require) ? meta.require : [meta.require];
                buf.push(`- **依赖**: ${reqs.length} 个外部库`);
            }
            buf.push("");
        }

        // 展示源码（截断控制）
        buf.push("### 源码内容\n");
        buf.push("```javascript");

        if (code.length > maxLength) {
            buf.push(code.substring(0, maxLength));
            buf.push("```\n");
            buf.push(`> ⚠️ 源码过长（共 ${formatNumber(code.length)} 字符），已截断至 ${formatNumber(maxLength)} 字符。增大 max_length 参数可获取更多。`);
        } else {
            buf.push(code);
            buf.push("```\n");
            buf.push(`> 完整源码，共 ${formatNumber(code.length)} 字符。`);
        }

        return buf.join("\n");
    }

    /**
     * GreasyFork 版本历史
     * API：https://greasyfork.org/scripts/{id}/versions.json
     */
    async function greasyforkGetVersions(scriptId) {
        if (!scriptId) throw new Error("脚本 ID 不能为空");
        scriptId = String(scriptId).trim();

        const url = `${PLATFORMS.GREASYFORK}/scripts/${scriptId}/versions.json`;
        const versions = await httpGetJson(url);

        if (!Array.isArray(versions)) {
            throw new Error("版本数据格式异常");
        }

        const buf = [];
        buf.push(`## 📋 脚本版本历史 (GreasyFork #${scriptId})\n`);
        buf.push(`**共 ${versions.length} 个版本**\n`);
        buf.push("---\n");

        if (versions.length === 0) {
            buf.push("*暂无版本记录。*");
            return buf.join("\n");
        }

        buf.push("| # | 版本号 | 发布日期 | 变更说明 |");
        buf.push("| :--- | :--- | :--- | :--- |");

        const displayVersions = versions.slice(0, OUTPUT_LIMITS.MAX_VERSION_ITEMS);
        displayVersions.forEach(function (v, idx) {
            const version = v.version || "-";
            const date = formatDate(v.created_at);
            const changelog = truncate(stripHtml(v.changelog || ""), 80) || "-";
            buf.push(`| ${idx + 1} | ${version} | ${date} | ${changelog} |`);
        });

        if (versions.length > OUTPUT_LIMITS.MAX_VERSION_ITEMS) {
            buf.push(`\n> *(仅展示最新 ${OUTPUT_LIMITS.MAX_VERSION_ITEMS} 个版本，共 ${versions.length} 个)*`);
        }

        return buf.join("\n");
    }

    /**
     * GreasyFork 用户脚本列表
     * API：https://greasyfork.org/users/{id}.json
     */
    async function greasyforkGetUserScripts(userId) {
        if (!userId) throw new Error("用户 ID 不能为空");
        userId = String(userId).trim();

        const url = `${PLATFORMS.GREASYFORK}/users/${userId}.json`;
        const userData = await httpGetJson(url);

        if (!userData) {
            throw new Error(`用户 ID ${userId} 不存在`);
        }

        const buf = [];
        buf.push(`## 👤 ${userData.name || "未知用户"} 的脚本列表\n`);
        buf.push(`**用户 ID**: ${userId}`);
        if (userData.url) buf.push(`**主页**: ${userData.url}`);

        const scripts = userData.scripts || [];
        buf.push(`**发布脚本数**: ${scripts.length}\n`);
        buf.push("---\n");

        if (scripts.length === 0) {
            buf.push("*该用户暂未发布脚本。*");
            return buf.join("\n");
        }

        // 按总安装量降序排列
        scripts.sort(function (a, b) { return (b.total_installs || 0) - (a.total_installs || 0); });

        scripts.forEach(function (s, idx) {
            const desc = truncate(s.description || "", 120);
            buf.push(`**${idx + 1}. ${s.name}** (ID: ${s.id})`);
            buf.push(`   v${s.version || "?"} | 日安装 ${formatNumber(s.daily_installs)} | 总安装 ${formatNumber(s.total_installs)} | 👍${s.good_ratings || 0}`);
            if (desc) buf.push(`   ${desc}`);
            buf.push("");
        });

        return buf.join("\n");
    }

    // ==========================================================================
    // 第五部分：OpenUserJS 数据源实现（HTML 解析）
    // ==========================================================================

    /**
     * OpenUserJS 搜索
     * 无官方 JSON API，通过 HTML 解析搜索结果页
     * URL：https://openuserjs.org/?q={query}&p={page}
     */
    async function openuserSearch(query, page) {
        if (!query || String(query).trim() === "") {
            throw new Error("搜索关键词不能为空");
        }

        page = clamp(page, 1, 50, 1);
        const url = `${PLATFORMS.OPENUSERJS}/?q=${encodeURIComponent(query)}&p=${page}`;

        const html = await httpGet(url);

        if (!html) {
            throw new Error("OpenUserJS 无响应");
        }

        // 解析搜索结果
        // OpenUserJS 页面中脚本列表位于 <div class="script-panel"> 或类似容器
        const results = [];

        // 使用正则提取脚本条目信息
        // 匹配模式：<a href="/scripts/author/scriptname">Title</a> 相关结构
        const scriptLinkRegex = /<a\s+href="\/scripts\/([^"]+)"[^>]*class="[^"]*script-link[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;

        while ((match = scriptLinkRegex.exec(html)) !== null && results.length < OUTPUT_LIMITS.MAX_OPENUSERJS_ITEMS) {
            const path = match[1];
            const title = stripHtml(match[2]);
            if (title && path) {
                results.push({
                    title: title,
                    path: path,
                    url: `${PLATFORMS.OPENUSERJS}/scripts/${path}`
                });
            }
        }

        // 备用提取：更宽泛的模式
        if (results.length === 0) {
            const altRegex = /<a\s+href="\/scripts\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = altRegex.exec(html)) !== null && results.length < OUTPUT_LIMITS.MAX_OPENUSERJS_ITEMS) {
                const path = match[1];
                const title = stripHtml(match[2]);
                // 过滤掉过短的标题和非脚本链接
                if (title && title.length > 3 && path.indexOf("/") !== -1 && !path.startsWith("lib/")) {
                    // 去重
                    const exists = results.some(function (r) { return r.path === path; });
                    if (!exists) {
                        results.push({
                            title: title,
                            path: path,
                            url: `${PLATFORMS.OPENUSERJS}/scripts/${path}`
                        });
                    }
                }
            }
        }

        // 尝试提取安装量等信息
        const installRegex = /installs[:\s]*<[^>]*>([\d,]+)/gi;
        const installs = [];
        while ((match = installRegex.exec(html)) !== null) {
            installs.push(match[1]);
        }

        const buf = [];
        buf.push("## OpenUserJS 搜索结果\n");
        buf.push(`**关键词**: ${query} | **页码**: ${page}`);
        buf.push(`**本页结果**: ${results.length} 条\n`);
        buf.push("---\n");

        if (results.length === 0) {
            buf.push("未找到匹配的脚本。OpenUserJS 搜索较为基础，建议同时使用 search_scripts（GreasyFork）获取更多结果。");
            return buf.join("\n");
        }

        results.forEach(function (r, idx) {
            buf.push(`**${idx + 1}. ${r.title}**`);
            buf.push(`   链接: ${r.url}`);
            buf.push(`   脚本路径: ${r.path}`);
            if (installs[idx]) buf.push(`   安装量: ${installs[idx]}`);
            buf.push("");
        });

        buf.push("\n> 💡 使用 get_script_code('" + (results[0] ? results[0].path : "author/name") + "', 'openuserjs') 读取源码。");

        return buf.join("\n");
    }

    /**
     * OpenUserJS 脚本源码获取
     * URL：https://openuserjs.org/src/scripts/{author}/{name}.user.js
     */
    async function openuserGetCode(scriptPath, maxLength) {
        if (!scriptPath) throw new Error("脚本路径不能为空（格式：author/name）");
        scriptPath = String(scriptPath).trim();
        maxLength = clamp(maxLength, 1000, 60000, OUTPUT_LIMITS.MAX_CODE_LENGTH);

        // 确保路径格式正确
        if (scriptPath.indexOf("/") === -1) {
            throw new Error("OpenUserJS 脚本路径格式应为 'author/name'");
        }

        // 尝试多种 URL 模式
        const urls = [
            `${PLATFORMS.OPENUSERJS}/src/scripts/${scriptPath}.user.js`,
            `${PLATFORMS.OPENUSERJS}/install/${scriptPath}.user.js`,
            `${PLATFORMS.OPENUSERJS}/meta/${scriptPath}.meta.js`
        ];

        let code = null;
        let usedUrl = "";

        for (let i = 0; i < urls.length; i++) {
            try {
                code = await httpGet(urls[i]);
                if (code && code.trim().length > 50) {
                    usedUrl = urls[i];
                    break;
                }
            } catch (e) {
                console.warn(`${LOG_TAG} OpenUserJS URL ${i + 1} 失败: ${e.message}`);
            }
        }

        if (!code || code.trim().length < 50) {
            throw new Error("无法获取脚本源码。请确认路径格式为 author/scriptname");
        }

        const meta = parseMetadataBlock(code);

        const buf = [];
        buf.push(`## 📄 脚本源码 (OpenUserJS: ${scriptPath})\n`);
        buf.push(`**来源**: ${usedUrl}\n`);

        if (Object.keys(meta).length > 0) {
            buf.push("### Metadata 信息");
            if (meta.name) buf.push(`- **名称**: ${meta.name}`);
            if (meta.version) buf.push(`- **版本**: ${meta.version}`);
            if (meta.author) buf.push(`- **作者**: ${meta.author}`);
            if (meta.description) buf.push(`- **描述**: ${meta.description}`);
            buf.push("");
        }

        buf.push("### 源码内容\n");
        buf.push("```javascript");
        if (code.length > maxLength) {
            buf.push(code.substring(0, maxLength));
            buf.push("```\n");
            buf.push(`> ⚠️ 源码已截断（共 ${formatNumber(code.length)} 字符，展示 ${formatNumber(maxLength)} 字符）`);
        } else {
            buf.push(code);
            buf.push("```\n");
            buf.push(`> 完整源码，共 ${formatNumber(code.length)} 字符。`);
        }

        return buf.join("\n");
    }

    // ==========================================================================
    // 第六部分：Userscript.Zone 数据源实现（HTML 解析）
    // ==========================================================================

    /**
     * Userscript.Zone 聚合搜索
     * 该平台聚合了 GreasyFork、OpenUserJS、GitHub 等多个源
     * URL：https://www.userscript.zone/search?q={query}
     */
    async function zoneSearch(query) {
        if (!query || String(query).trim() === "") {
            throw new Error("搜索内容不能为空");
        }

        const url = `${PLATFORMS.USERSCRIPT_ZONE}/search?q=${encodeURIComponent(query)}&l=zh`;
        const html = await httpGet(url);

        if (!html) {
            throw new Error("Userscript.Zone 无响应");
        }

        // 解析搜索结果
        // Zone 页面结构：<article> 包含脚本信息, <h2> 标题, <a> 链接, <p> 描述
        const results = [];

        // 提取脚本条目 — Zone 使用 card 式布局
        // 尝试提取 href 到外部脚本的链接
        const cardRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
        let match;

        while ((match = cardRegex.exec(html)) !== null && results.length < OUTPUT_LIMITS.MAX_ZONE_ITEMS) {
            const card = match[1];

            // 提取标题和链接
            const titleMatch = card.match(/<h[23][^>]*>[\s\S]*?<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
            const descMatch = card.match(/<p[^>]*class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                              card.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

            // 提取来源平台标识
            const sourceMatch = card.match(/(greasyfork|openuserjs|github|gist)/i);

            if (titleMatch) {
                results.push({
                    title: stripHtml(titleMatch[2]),
                    url: titleMatch[1],
                    description: descMatch ? truncate(stripHtml(descMatch[1]), 120) : "",
                    source: sourceMatch ? sourceMatch[1] : "unknown"
                });
            }
        }

        // 备用：更宽泛的链接提取
        if (results.length === 0) {
            // 尝试从常规链接提取
            const linkRegex = /<a[^>]+href="(https?:\/\/(?:greasyfork\.org|openuserjs\.org|github\.com)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = linkRegex.exec(html)) !== null && results.length < OUTPUT_LIMITS.MAX_ZONE_ITEMS) {
                const title = stripHtml(match[2]);
                if (title && title.length > 3) {
                    const exists = results.some(function (r) { return r.url === match[1]; });
                    if (!exists) {
                        let source = "unknown";
                        if (match[1].indexOf("greasyfork") !== -1) source = "greasyfork";
                        else if (match[1].indexOf("openuserjs") !== -1) source = "openuserjs";
                        else if (match[1].indexOf("github") !== -1) source = "github";

                        results.push({
                            title: title,
                            url: match[1],
                            description: "",
                            source: source
                        });
                    }
                }
            }
        }

        // 最终备用：提取任何有意义的脚本链接
        if (results.length === 0) {
            const anyLinkRegex = /<a[^>]+href="([^"]*(?:scripts|user\.js)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = anyLinkRegex.exec(html)) !== null && results.length < OUTPUT_LIMITS.MAX_ZONE_ITEMS) {
                const title = stripHtml(match[2]);
                if (title && title.length > 2) {
                    results.push({
                        title: title,
                        url: match[1].startsWith("http") ? match[1] : PLATFORMS.USERSCRIPT_ZONE + match[1],
                        description: "",
                        source: "zone"
                    });
                }
            }
        }

        const buf = [];
        buf.push("## Userscript.Zone 聚合搜索结果\n");
        buf.push(`**搜索内容**: ${query}`);
        buf.push(`**结果数**: ${results.length} 条`);
        buf.push(`**数据来源**: GreasyFork, OpenUserJS, GitHub 等多平台聚合\n`);
        buf.push("---\n");

        if (results.length === 0) {
            buf.push("未找到匹配的脚本。");
            buf.push("建议：");
            buf.push("- 如果输入的是 URL，确保格式以 https:// 开头");
            buf.push("- 如果输入的是域名（如 github.com），会匹配 @match 标签");
            buf.push("- 尝试更通用的英文关键词");
            return buf.join("\n");
        }

        results.forEach(function (r, idx) {
            const sourceTag = r.source !== "unknown" ? ` [${r.source}]` : "";
            buf.push(`**${idx + 1}. ${r.title}**${sourceTag}`);
            buf.push(`   ${r.url}`);
            if (r.description) buf.push(`   ${r.description}`);
            buf.push("");
        });

        return buf.join("\n");
    }

    // ==========================================================================
    // 第七部分：统一执行包装器
    // ==========================================================================

    /**
     * 工具执行包装器
     * 统一异步执行、结果交付、异常捕获
     */
    async function wrapExecution(coreLogic, params, actionLabel) {
        try {
            const result = await coreLogic(params);
            complete({
                success: true,
                message: `${actionLabel}执行成功`,
                data: result
            });
        } catch (error) {
            console.error(`${LOG_TAG} ${actionLabel}失败: ${error.message}`);
            complete({
                success: false,
                message: `${actionLabel}失败: ${error.message}`,
                error_stack: error.stack || ""
            });
        }
    }

    // ==========================================================================
    // 第八部分：核心业务逻辑路由
    // ==========================================================================

    /**
     * 脚本源码获取路由器
     * 根据 source 参数选择平台
     */
    async function getCodeRouter(params) {
        const source = (params.source || "greasyfork").toLowerCase();
        const scriptId = params.script_id;
        const maxLen = params.max_length;

        if (source === "openuserjs") {
            return await openuserGetCode(scriptId, maxLen);
        } else {
            return await greasyforkGetCode(scriptId, maxLen);
        }
    }

    // ==========================================================================
    // 第九部分：公开接口暴露
    // ==========================================================================

    return {
        /**
         * 搜索脚本（GreasyFork 主力搜索）
         */
        search_scripts: function (p) {
            return wrapExecution(function (params) {
                return greasyforkSearch(params.query, params.page, params.sort, params.language, params.site);
            }, p, "GreasyFork 脚本搜索");
        },

        /**
         * 获取脚本详情
         */
        get_script_detail: function (p) {
            return wrapExecution(function (params) {
                return greasyforkGetDetail(params.script_id);
            }, p, "脚本详情获取");
        },

        /**
         * 获取脚本源码
         */
        get_script_code: function (p) {
            return wrapExecution(getCodeRouter, p, "脚本源码获取");
        },

        /**
         * 获取版本历史
         */
        get_script_versions: function (p) {
            return wrapExecution(function (params) {
                return greasyforkGetVersions(params.script_id);
            }, p, "版本历史获取");
        },

        /**
         * 按站点搜索脚本
         */
        search_by_site: function (p) {
            return wrapExecution(function (params) {
                return greasyforkSearchBySite(params.domain, params.sort, params.page);
            }, p, "按站点搜索");
        },

        /**
         * OpenUserJS 搜索
         */
        search_openuserjs: function (p) {
            return wrapExecution(function (params) {
                return openuserSearch(params.query, params.page);
            }, p, "OpenUserJS 搜索");
        },

        /**
         * Userscript.Zone 聚合搜索
         */
        search_userscript_zone: function (p) {
            return wrapExecution(function (params) {
                return zoneSearch(params.query);
            }, p, "Userscript.Zone 聚合搜索");
        },

        /**
         * 获取用户发布的全部脚本
         */
        get_user_scripts: function (p) {
            return wrapExecution(function (params) {
                return greasyforkGetUserScripts(params.user_id);
            }, p, "用户脚本列表获取");
        },

        /**
         * 连通性测试入口
         * 验证 GreasyFork 及 OpenUserJS 可达性与代理配置
         * 调用方式：无需参数
         */
        test: function (p) {
            return wrapExecution(async function () {
                const proxyRaw = getEnv("USERSCRIPT_PROXY_DOMAIN") || "";
                let proxyDomain = proxyRaw.trim();
                if (proxyDomain && !proxyDomain.startsWith("http")) proxyDomain = "https://" + proxyDomain;
                proxyDomain = proxyDomain.replace(/\/$/, "");
                const isProxy = !!proxyDomain;

                // 测试端点列表
                const endpoints = [
                    {
                        name: 'GreasyFork API',
                        url: (isProxy ? proxyDomain.replace(/\/$/, '') : 'https://greasyfork.org') + '/en/scripts.json?page=1&per_page=1'
                    },
                    {
                        name: 'OpenUserJS API',
                        url: (isProxy ? proxyDomain.replace(/\/$/, '') : 'https://openuserjs.org') + '/api/user/scripts?Page=1&Limit=1'
                    }
                ];

                const httpClient = OkHttp.newClient();
                const results = [];
                for (const ep of endpoints) {
                    const startTime = Date.now();
                    try {
                        const resp = await httpClient.newRequest()
                            .url(ep.url)
                            .method('GET')
                            .headers({
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

                const lines = ['## 油猴脚本平台连通性测试报告\n'];
                lines.push(`- **访问模式**: ${isProxy ? `反向代理 (${proxyDomain})` : '直连官方平台'}`);
                lines.push('');
                for (const r of results) {
                    const icon = r.ok ? '✅' : '❌';
                    lines.push(`- ${icon} **${r.name}**: ${r.ok ? `连通正常 (HTTP ${r.status}, ${r.latency}ms)` : `连通失败 (${r.error || 'HTTP ' + r.status}, ${r.latency}ms)`}`);
                }
                const successCount = results.filter(r => r.ok).length;
                if (!isProxy && successCount < results.length) {
                    lines.push('\n> ⚠️ 国内网络可能无法直连 GreasyFork/OpenUserJS，建议配置 `USERSCRIPT_PROXY_DOMAIN` 环境变量使用反向代理。');
                }
                return {
                    success: successCount > 0,
                    message: `连通性测试完成：${successCount}/${results.length} 个平台可用`,
                    data: lines.join('\n')
                };
            }, p, "平台连通性测试");
        }
    };

})();

// ==============================================================================
// 导出工具接口（严格匹配 METADATA 中的 tools[].name）
// ==============================================================================

exports.search_scripts         = UserscriptSearchToolkit.search_scripts;
exports.get_script_detail      = UserscriptSearchToolkit.get_script_detail;
exports.get_script_code        = UserscriptSearchToolkit.get_script_code;
exports.get_script_versions    = UserscriptSearchToolkit.get_script_versions;
exports.search_by_site         = UserscriptSearchToolkit.search_by_site;
exports.search_openuserjs      = UserscriptSearchToolkit.search_openuserjs;
exports.search_userscript_zone = UserscriptSearchToolkit.search_userscript_zone;
exports.get_user_scripts       = UserscriptSearchToolkit.get_user_scripts;
exports.test                   = UserscriptSearchToolkit.test;