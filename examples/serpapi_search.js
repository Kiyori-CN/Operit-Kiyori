/* METADATA
{
    "name": "serpapi_search",
    "version": "1.0",
    "display_name": {
        "zh": "SerpApi 全能搜索",
        "en": "SerpApi Universal Search"
    },
    "description": {
        "zh": "SerpApi 全能搜索工具包。基于 SerpApi JSON REST API 提供九大核心搜索功能：Google 网页搜索（含知识图谱、精选回答、有机结果）、图片搜索、新闻搜索、学术论文搜索、购物比价搜索、视频搜索、地图/本地搜索、多关键词并发聚合搜索，以及 API 连通性诊断测试。支持多密钥轮询负载均衡（Fisher-Yates 洗牌随机调度 + 智能故障转移）、自定义反向代理域名（自动协议补充与路径规范化）、指数退避重试机制（429 限流 / 5xx 服务端错误自动恢复，退避上限 8 秒）、地区(gl)/语言(hl)/时间(tbs)多维过滤、搜索结果智能截断防 Token 溢出，以及结构化 Markdown 格式输出。所有参数均设有合理默认值，可零配置直接调用（最简调用仅需 query 字段）。",
        "en": "SerpApi Ultimate Search Toolkit. Built on SerpApi JSON REST API with nine core features: Google Web Search (Knowledge Graph, Answer Box, organic results), Image Search, News Search, Scholar Search, Shopping Search, Video Search, Maps/Local Search, Multi-keyword Concurrent Aggregated Search, and API Connectivity Diagnostics. Supports multi-key rotation with Fisher-Yates shuffle load balancing and intelligent failover, custom reverse proxy domain (auto protocol/path normalization), exponential backoff retry (auto-recovery for 429/5xx, max 8s backoff), gl/hl/tbs multi-dimensional filtering, smart result truncation to prevent token overflow, and structured Markdown output. All parameters have sensible defaults for zero-config usage (minimal call needs only query)."
    },
    "env": [
        {
            "name": "SERPAPI_API_KEYS",
            "description": {
                "zh": "SerpApi API 密钥列表，多个密钥用英文逗号分隔以实现负载均衡与配额轮换。至少需要一个有效密钥。获取地址：https://serpapi.com/manage-api-key",
                "en": "SerpApi API key(s), comma-separated for load balancing and quota rotation. At least one valid key required. Get yours at: https://serpapi.com/manage-api-key"
            },
            "required": true
        },
        {
            "name": "SERPAPI_PROXY_DOMAIN",
            "description": {
                "zh": "自定义反向代理域名（可选），用于替换默认的 serpapi.com。格式示例：https://my-proxy.example.com 或 my-proxy.example.com（自动补充 https://）。不填则直接访问官方 API",
                "en": "Custom reverse proxy domain (optional) to replace serpapi.com. Example: https://my-proxy.example.com or my-proxy.example.com (auto-prefixes https://). Leave empty for direct API access."
            },
            "required": false
        },
        {
            "name": "SERPAPI_DEFAULT_GL",
            "description": {
                "zh": "默认地区代码（可选），如 us、cn、jp、uk 等。不填默认 us。完整列表见 SerpApi 文档",
                "en": "Default country/region code (optional), e.g., us, cn, jp, uk. Default: us. See SerpApi docs for full list."
            },
            "required": false
        },
        {
            "name": "SERPAPI_DEFAULT_HL",
            "description": {
                "zh": "默认语言代码（可选），如 en、zh-cn、ja、ko 等。不填默认 en。完整列表见 SerpApi 文档",
                "en": "Default language code (optional), e.g., en, zh-cn, ja, ko. Default: en. See SerpApi docs for full list."
            },
            "required": false
        },
        {
            "name": "SERPAPI_MAX_RETRIES",
            "description": {
                "zh": "请求失败最大重试次数（可选），范围 0-5，默认 3。设为 0 禁用重试",
                "en": "Max retry attempts on failure (optional), range 0-5. Default: 3. Set 0 to disable retries."
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
                "zh": "Google 通用网页搜索。返回结构化 Markdown 报告，包含知识图谱卡片（Knowledge Graph）、精选回答（Answer Box）、有机搜索结果（含标题、链接、摘要、日期、富摘要扩展、站内快速链接）。支持地区/语言/时间范围多维过滤。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Web Search. Returns structured Markdown with Knowledge Graph, Answer Box, and organic results (title, link, snippet, date, rich extensions, sitelinks). Supports gl/hl/time multi-filter. All optional params have defaults — minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词，支持自然语言和关键词组合", "en": "Search query, supports natural language and keyword combinations" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回结果数量（1-20），默认 10。普通查询建议 5-10，深度研究建议 15-20", "en": "Number of results (1-20), default 10. Recommended: 5-10 general, 15-20 deep research." },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，如 us(美国)、cn(中国)、jp(日本)、uk(英国)、de(德国)。不填使用环境变量默认值或 us", "en": "Country code, e.g., us, cn, jp, uk, de. Default: env or us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，如 en(英文)、zh-cn(简体中文)、ja(日语)、ko(韩语)。不填使用环境变量默认值或 en", "en": "Language code, e.g., en, zh-cn, ja, ko. Default: env or en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "time_period",
                    "description": { "zh": "时间范围过滤：qdr:h(过去一小时)、qdr:d(过去一天)、qdr:w(过去一周)、qdr:m(过去一月)、qdr:y(过去一年)。不填则不限时间", "en": "Time range: qdr:h (hour), qdr:d (day), qdr:w (week), qdr:m (month), qdr:y (year). Empty for no limit." },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "start",
                    "description": { "zh": "结果偏移量/起始位置（用于翻页），默认 0 表示第一页。设为 10 表示从第 11 条开始", "en": "Result offset for pagination, default 0. Set to 10 to start from 11th result." },
                    "type": "number",
                    "required": false,
                    "default": 0
                }
            ]
        },
        {
            "name": "images",
            "description": {
                "zh": "Google 图片搜索。返回图片缩略图（Markdown 可直接渲染）、原图链接、来源页面、图片尺寸。支持地区与语言过滤。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Image Search. Returns thumbnails (Markdown renderable), original links, source pages, and dimensions. Supports gl/hl filter. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "图片搜索关键词", "en": "Image search query" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回图片数量（1-20），默认 10", "en": "Number of images (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，不填使用默认值 us", "en": "Country code, default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                }
            ]
        },
        {
            "name": "news",
            "description": {
                "zh": "Google 新闻搜索。获取带时间戳、来源媒体的最新资讯列表。支持时间范围精确过滤（小时/天/周/月/年级别）。适用于热点追踪、新闻速递、舆情监控等场景。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google News Search. Returns articles with timestamps, source media, and snippets. Supports precise time range filtering (hour/day/week/month/year). Ideal for trending topics and media monitoring. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "新闻搜索关键词", "en": "News search query" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回新闻条数（1-20），默认 10", "en": "Number of news results (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，不填使用默认值 us", "en": "Country code, default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "time_period",
                    "description": { "zh": "时间范围：qdr:h(一小时)、qdr:d(一天)、qdr:w(一周)、qdr:m(一月)、qdr:y(一年)。不填则不限时间", "en": "Time range: qdr:h/qdr:d/qdr:w/qdr:m/qdr:y. Empty for no limit." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "scholar",
            "description": {
                "zh": "Google 学术搜索。查找学术论文、引用次数、作者信息和 PDF 下载链接。适用于文献检索、学术调研、论文查找等场景。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Scholar Search. Find papers, citations, author info, and PDF links. Ideal for literature review and academic research. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "学术搜索关键词（论文标题、作者名、研究主题等）", "en": "Scholar query (paper title, author name, research topic)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回论文数量（1-20），默认 10", "en": "Number of results (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "as_ylo",
                    "description": { "zh": "起始年份过滤（可选），如 2020 表示只搜索 2020 年及之后发表的论文", "en": "Start year filter (optional), e.g., 2020 for papers from 2020 onwards" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "as_yhi",
                    "description": { "zh": "截止年份过滤（可选），如 2024 表示只搜索 2024 年及之前发表的论文", "en": "End year filter (optional), e.g., 2024 for papers up to 2024" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "shopping",
            "description": {
                "zh": "Google 购物搜索。比较商品价格、商家信息、用户评分与评论数。返回含价格、商家、评分、缩略图的结构化商品列表。适用于比价、选购决策等场景。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Shopping Search. Compare prices, merchants, ratings, and reviews. Returns structured product list with prices, merchants, ratings, and thumbnails. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "商品搜索关键词", "en": "Product search query" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回商品数量（1-20），默认 10", "en": "Number of results (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码（影响价格货币和商品可用性），不填使用默认值 us", "en": "Country code (affects currency and product availability), default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                }
            ]
        },
        {
            "name": "videos",
            "description": {
                "zh": "Google 视频搜索。查找视频内容，返回标题、来源平台、发布日期、时长、缩略图和摘要。支持时间范围过滤。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Video Search. Find videos with title, source platform, date, duration, thumbnail, and snippet. Supports time range filter. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "视频搜索关键词", "en": "Video search query" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num",
                    "description": { "zh": "返回视频数量（1-20），默认 10", "en": "Number of results (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，不填使用默认值 us", "en": "Country code, default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "time_period",
                    "description": { "zh": "时间范围：qdr:h(一小时)、qdr:d(一天)、qdr:w(一周)、qdr:m(一月)、qdr:y(一年)。不填则不限时间", "en": "Time range: qdr:h/qdr:d/qdr:w/qdr:m/qdr:y. Empty for no limit." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "maps",
            "description": {
                "zh": "Google 地图/本地搜索。查找地点、商户、餐厅等，返回名称、评分、评论数、地址、电话、GPS 坐标和缩略图。支持坐标定位搜索。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "Google Maps/Local Search. Find places, businesses, restaurants with name, rating, reviews, address, phone, GPS coordinates, and thumbnail. Supports coordinate-based search. Minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "地点搜索关键词（如：附近的咖啡馆、北京故宫、东京塔）", "en": "Place query (e.g., coffee shops nearby, Beijing Forbidden City, Tokyo Tower)" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "ll",
                    "description": { "zh": "中心坐标定位（可选），格式：@纬度,经度,缩放级别z，如 @40.7455096,-74.0083012,15.1z。不填则由 Google 自动定位", "en": "Center coordinates (optional), format: @lat,long,zoomz, e.g., @40.7455096,-74.0083012,15.1z. Empty for auto-location." },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "num",
                    "description": { "zh": "返回地点数量（1-20），默认 10", "en": "Number of results (1-20), default 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，不填使用默认值 us", "en": "Country code, default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                }
            ]
        },
        {
            "name": "multi_search",
            "description": {
                "zh": "多关键词并发聚合搜索。同时搜索多个查询词并汇总结果，适用于多角度调研、对比分析、主题研究等场景。每个查询词独立搜索后合并展示，大幅提高信息覆盖面和搜索效率。最简调用只需传入 queries（逗号分隔）。",
                "en": "Multi-keyword concurrent aggregated search. Searches multiple queries simultaneously and consolidates results. Ideal for multi-angle research and comparative analysis. Minimal call needs only queries (comma-separated)."
            },
            "parameters": [
                {
                    "name": "queries",
                    "description": { "zh": "搜索查询词列表，多个关键词用英文逗号分隔（最多 5 个）。例如：'AI大模型进展,GPT最新消息,Claude能力对比'", "en": "Comma-separated queries (max 5). Example: 'AI model progress,GPT news,Claude comparison'" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "num_per_query",
                    "description": { "zh": "每个查询词的结果数量（1-10），默认 5", "en": "Results per query (1-10), default 5" },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "gl",
                    "description": { "zh": "地区代码，不填使用默认值 us", "en": "Country code, default: us" },
                    "type": "string",
                    "required": false,
                    "default": "us"
                },
                {
                    "name": "hl",
                    "description": { "zh": "语言代码，不填使用默认值 en", "en": "Language code, default: en" },
                    "type": "string",
                    "required": false,
                    "default": "en"
                },
                {
                    "name": "time_period",
                    "description": { "zh": "统一时间范围：qdr:h/qdr:d/qdr:w/qdr:m/qdr:y。不填则不限时间", "en": "Shared time range: qdr:h/qdr:d/qdr:w/qdr:m/qdr:y. Empty for no limit." },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 SerpApi 连通性与密钥有效性。验证所有已配置的 API Key 是否可用、网络是否可达（含代理域名检测）、服务响应延迟。返回完整的诊断报告，包含每个密钥的状态、延迟和错误信息。适用于首次配置后的连通性验证、密钥有效性检查与网络故障排查。无需传入任何参数。",
                "en": "Test SerpApi connectivity and key validity. Validates all API keys, network reachability (including proxy), and response latency. Returns comprehensive diagnostic report. For setup verification and troubleshooting. No parameters needed."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==================================================================================
 * 模块名称：SerpApi 全能搜索工具包 (SerpApi Ultimate Search Toolkit)
 * ==================================================================================
 * 版本：v1.0
 * 架构：IIFE + Wrapper + 六层分层架构
 * 驱动：基于 SerpApi JSON REST API (https://serpapi.com/search-api)
 *
 * 功能矩阵：
 *   ┌──────────────────┬──────────────────────────────────────────────────────┐
 *   │ search           │ Google 网页搜索（知识图谱/精选回答/有机结果/富摘要） │
 *   │ images           │ Google 图片搜索（缩略图/原图/来源/尺寸）            │
 *   │ news             │ Google 新闻搜索（时间戳/来源媒体/摘要）             │
 *   │ scholar          │ Google 学术搜索（论文/引用/作者/PDF 链接/年份过滤） │
 *   │ shopping         │ Google 购物搜索（价格/商家/评分/评论/缩略图）       │
 *   │ videos           │ Google 视频搜索（来源/时长/日期/缩略图）            │
 *   │ maps             │ Google 地图搜索（评分/地址/电话/GPS 坐标/缩略图）   │
 *   │ multi_search     │ 多关键词并发聚合搜索（并行调度/容错合并/进度推送）  │
 *   │ test             │ API 连通性诊断测试（密钥验证/延迟检测/代理验证）    │
 *   └──────────────────┴──────────────────────────────────────────────────────┘
 *
 * 核心设计亮点：
 *   1.  多密钥负载均衡 — 支持逗号分隔的多 API Key，Fisher-Yates 洗牌随机调度
 *   2.  智能故障转移 — 单 Key 失败（401/403）自动切换下一个可用 Key
 *   3.  指数退避重试 — 429 限流/5xx 服务端错误自动重试（500ms → 1s → 2s → 4s → 8s）
 *   4.  自适应反向代理 — 支持自定义代理域名，自动补充协议头与路径规范化
 *   5.  参数沙盒化 — 所有参数处理均基于独立副本，拒绝污染原始输入对象
 *   6.  全参数默认值 — 所有可选参数均有合理默认值，支持零配置直接调用
 *   7.  多维过滤联动 — gl(地区) + hl(语言) + tbs(时间) 三维过滤组合
 *   8.  结果智能截断 — 强制 slice 防止 API 返回过多结果导致 Token 溢出
 *   9.  结构化 Markdown 输出 — 统一的格式化引擎，AI 友好的结果呈现
 *  10.  长内容安全截断 — 单条结果和总输出双层截断保护
 *  11.  多关键词并发 — Promise.allSettled 并行调度，单词失败不影响整体
 *  12.  完整错误分级 — 区分网络层/协议层/业务层/参数层四级异常
 *  13.  连通性诊断 — 一键检测所有 Key 有效性、网络延迟、代理状态
 *  14.  中间进度推送 — 多关键词搜索和连通性测试支持实时进度反馈
 *  15.  环境变量可配 — gl/hl/重试次数均可通过环境变量设置全局默认值
 *  16.  XML 参数类型安全 — 所有数值参数内置 String→Number 转换与范围约束
 *
 * 运行环境：Operit JavaScript 沙箱 (ES2017+)
 * 网络协议：HTTPS + OkHttp 客户端
 * ==================================================================================
 */
const serpApiToolkit = (function () {

    // ==========================================================================
    // 第一层：常量定义与配置中心
    // ==========================================================================

    /**
     * SerpApi 引擎名称映射表
     * 定义各搜索类型对应的 SerpApi engine 参数值
     */
    const ENGINES = {
        WEB: 'google',
        IMAGES: 'google_images',
        NEWS: 'google_news',
        SCHOLAR: 'google_scholar',
        SHOPPING: 'google_shopping',
        VIDEOS: 'google_videos',
        MAPS: 'google_maps'
    };

    /**
     * 默认行为配置
     * 所有可选参数的回退默认值集中管理
     */
    const DEFAULTS = {
        GATEWAY_DOMAIN: 'serpapi.com',           // 默认 API 网关域名
        SEARCH_PATH: '/search.json',             // SerpApi 统一搜索端点
        GL: 'us',                                // 默认地区代码
        HL: 'en',                                // 默认语言代码
        NUM: 10,                                 // 默认结果数量
        START: 0,                                // 默认结果偏移量
        MAX_RETRIES: 3,                          // 默认最大重试次数
        MULTI_NUM_PER_QUERY: 5                   // 多关键词每查询默认结果数
    };

    /**
     * 安全限制常量
     * 防止资源滥用和上下文溢出
     */
    const LIMITS = {
        REQUEST_TIMEOUT: 30000,                  // 请求超时：30 秒
        TEST_TIMEOUT: 15000,                     // 测试请求超时：15 秒
        MAX_NUM: 20,                             // 单次搜索结果数硬上限（防 Token 溢出）
        MIN_NUM: 1,                              // 单次搜索结果数下限
        MAX_RETRIES_CAP: 5,                      // 重试次数硬上限
        MAX_BACKOFF_MS: 8000,                    // 指数退避最大等待时间
        MAX_MULTI_QUERIES: 5,                    // 多关键词搜索上限
        MAX_MULTI_PER_QUERY: 10,                 // 多关键词每查询结果上限
        MAX_CONTENT_LENGTH: 10000,               // 单条结果最大字符数
        MAX_TOTAL_OUTPUT: 60000                  // 总输出最大字符数
    };

    /**
     * 合法时间范围枚举
     * 用于参数校验
     */
    const VALID_TIME_PERIODS = ['qdr:h', 'qdr:d', 'qdr:w', 'qdr:m', 'qdr:y'];

    /**
     * HTTP 客户端标识
     */
    const USER_AGENT = 'SerpApi-Toolkit/1.0 (Operit)';

    // ==========================================================================
    // 第二层：基础设施与工具函数
    // ==========================================================================

    /**
     * HTTP 客户端单例
     * 复用连接池以提升网络握手效率
     */
    const httpClient = OkHttp.newClient();

    /**
     * 环境变量读取与验证 - API 密钥
     * 功能：获取并校验 API 密钥列表，确保至少有一个可用密钥
     * @returns {string[]} 密钥数组（已去重去空）
     * @throws {Error} 未配置或格式错误时抛出异常
     */
    function loadApiKeys() {
        const rawKeys = getEnv('SERPAPI_API_KEYS');
        if (!rawKeys || rawKeys.trim() === '') {
            throw new Error(
                '环境变量 SERPAPI_API_KEYS 未配置。\n' +
                '请在「设置 → 环境变量」中添加至少一个 SerpApi 密钥。\n' +
                '获取密钥：https://serpapi.com/manage-api-key'
            );
        }

        const keys = rawKeys
            .split(',')
            .map(function (k) { return k.trim(); })
            .filter(function (k) { return k.length > 0; });

        // 去重
        const uniqueKeys = [];
        const seen = {};
        for (var i = 0; i < keys.length; i++) {
            if (!seen[keys[i]]) {
                seen[keys[i]] = true;
                uniqueKeys.push(keys[i]);
            }
        }

        if (uniqueKeys.length === 0) {
            throw new Error('SERPAPI_API_KEYS 格式错误：解析后未发现有效密钥。请确认逗号分隔格式正确。');
        }

        return uniqueKeys;
    }

    /**
     * 网关地址规范化处理
     * 功能：处理用户自定义代理域名，确保符合 URL 规范
     * @returns {string} 完整的网关地址（含协议头，无尾部斜杠）
     */
    function resolveGateway() {
        var gateway = (getEnv('SERPAPI_PROXY_DOMAIN') || DEFAULTS.GATEWAY_DOMAIN).trim();

        // 移除尾部可能误填的路径片段
        gateway = gateway.replace(/\/+(search\.json|search).*$/i, '');

        // 自动补充协议头
        if (!/^https?:\/\//i.test(gateway)) {
            gateway = 'https://' + gateway;
        }

        // 移除尾部斜杠
        return gateway.replace(/\/+$/, '');
    }

    /**
     * 获取默认地区代码
     * @returns {string} 地区代码
     */
    function getDefaultGl() {
        var envGl = getEnv('SERPAPI_DEFAULT_GL');
        if (envGl && envGl.trim().length > 0) {
            return envGl.trim().toLowerCase();
        }
        return DEFAULTS.GL;
    }

    /**
     * 获取默认语言代码
     * @returns {string} 语言代码
     */
    function getDefaultHl() {
        var envHl = getEnv('SERPAPI_DEFAULT_HL');
        if (envHl && envHl.trim().length > 0) {
            return envHl.trim().toLowerCase();
        }
        return DEFAULTS.HL;
    }

    /**
     * 获取最大重试次数配置
     * @returns {number} 重试次数
     */
    function getMaxRetries() {
        var envRetries = getEnv('SERPAPI_MAX_RETRIES');
        if (envRetries !== null && envRetries !== undefined && envRetries.trim() !== '') {
            var parsed = parseInt(envRetries.trim(), 10);
            if (!isNaN(parsed)) {
                return Math.max(0, Math.min(LIMITS.MAX_RETRIES_CAP, parsed));
            }
        }
        return DEFAULTS.MAX_RETRIES;
    }

    /**
     * 安全数值解析与范围约束
     * 解决 XML 传参始终为字符串的类型转换问题
     * @param {*} value - 待解析的值（可能为字符串/数字/undefined/null）
     * @param {number} defaultVal - 默认值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 约束后的数值
     */
    function safeNumber(value, defaultVal, min, max) {
        if (value === undefined || value === null || value === '') return defaultVal;
        var num = Number(value);
        if (isNaN(num)) return defaultVal;
        return Math.max(min, Math.min(max, Math.round(num)));
    }

    /**
     * 安全字符串解析
     * @param {*} value - 待解析的值
     * @param {string} defaultVal - 默认值
     * @returns {string} 解析后的字符串
     */
    function safeString(value, defaultVal) {
        if (value === undefined || value === null) return defaultVal;
        var str = String(value).trim();
        return str.length > 0 ? str : defaultVal;
    }

    /**
     * 时间范围参数校验
     * @param {*} value - 待校验的时间范围
     * @returns {string|undefined} 校验通过返回值，否则 undefined
     */
    function validateTimePeriod(value) {
        if (!value || typeof value !== 'string') return undefined;
        var trimmed = value.trim().toLowerCase();
        if (VALID_TIME_PERIODS.indexOf(trimmed) !== -1) {
            return trimmed;
        }
        // 兼容用户可能传入的简写形式（如 h, d, w, m, y）
        var shortMap = { 'h': 'qdr:h', 'd': 'qdr:d', 'w': 'qdr:w', 'm': 'qdr:m', 'y': 'qdr:y' };
        if (shortMap[trimmed]) {
            return shortMap[trimmed];
        }
        return undefined;
    }

    /**
     * 内容安全截断器
     * 防止单条结果过长导致上下文溢出
     * @param {string} content - 原始内容
     * @param {number} maxLen - 最大长度
     * @returns {string} 截断后的内容
     */
    function truncateContent(content, maxLen) {
        if (!content) return '';
        if (content.length <= maxLen) return content;
        return content.substring(0, maxLen) + '\n\n*(内容过长，已截断至 ' + maxLen + ' 字符)*';
    }

    /**
     * 获取当前时间戳字符串
     * @returns {string} 格式化的时间字符串
     */
    function getTimestamp() {
        return new Date().toLocaleString('zh-CN', { hour12: false });
    }

    /**
     * Fisher-Yates 洗牌算法
     * 用于随机化密钥顺序实现负载均衡
     * @param {Array} arr - 原始数组
     * @returns {Array} 洗牌后的新数组
     */
    function shuffleArray(arr) {
        var shuffled = arr.slice(); // 创建副本
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }

    // ==========================================================================
    // 第三层：网络请求引擎（核心）
    // ==========================================================================

    /**
     * 带智能故障转移和指数退避重试的 HTTP GET 请求调度器
     *
     * 策略说明：
     * - 从密钥池中随机抽取顺序（Fisher-Yates 洗牌）
     * - 如果遇到 401/403（Key 无效），标记该 Key 并尝试下一个
     * - 如果遇到 429（限流）或 5xx（服务端错误），执行指数退避重试
     * - 所有 Key 都失败则抛出最后一个错误
     *
     * @param {Object} apiParams - API 查询参数对象（不含 api_key）
     * @returns {Promise<Object>} 解析后的 JSON 响应数据
     * @throws {Error} 所有 Key/重试均失败时抛出异常
     */
    async function executeApiRequest(apiParams) {
        var apiKeys = loadApiKeys();
        var gateway = resolveGateway();
        var endpoint = gateway + DEFAULTS.SEARCH_PATH;
        var maxRetries = getMaxRetries();

        // 构建随机化的密钥队列
        var shuffledKeys = shuffleArray(apiKeys);

        var lastError = null;

        // 外层循环：遍历所有可用密钥
        for (var keyIdx = 0; keyIdx < shuffledKeys.length; keyIdx++) {
            var currentKey = shuffledKeys[keyIdx];

            // 内层循环：对当前密钥进行重试
            for (var attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    // 组合最终参数（注入 api_key 和来源标识）
                    var finalParams = {};
                    var paramKeys = Object.keys(apiParams);
                    for (var pi = 0; pi < paramKeys.length; pi++) {
                        finalParams[paramKeys[pi]] = apiParams[paramKeys[pi]];
                    }
                    finalParams.api_key = currentKey;
                    finalParams.output = 'json';

                    // 构建查询字符串（过滤掉 undefined/null/空值）
                    var queryParts = [];
                    var fpKeys = Object.keys(finalParams);
                    for (var qi = 0; qi < fpKeys.length; qi++) {
                        var k = fpKeys[qi];
                        var v = finalParams[k];
                        if (v !== undefined && v !== null && v !== '') {
                            queryParts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                        }
                    }
                    var url = endpoint + '?' + queryParts.join('&');

                    // 执行 HTTP GET 请求
                    var response = await httpClient
                        .newRequest()
                        .url(url)
                        .method('GET')
                        .headers({
                            'User-Agent': USER_AGENT,
                            'Accept': 'application/json'
                        })
                        .build()
                        .execute();

                    var rawContent = response.content || '{}';
                    var statusCode = response.statusCode;

                    // ---- 成功响应 ----
                    if (response.isSuccessful()) {
                        var jsonData;
                        try {
                            jsonData = JSON.parse(rawContent);
                        } catch (parseErr) {
                            throw new Error('响应 JSON 解析失败: ' + rawContent.substring(0, 200));
                        }

                        // 检查 SerpApi 业务级错误（有时返回 200 但包含 error 字段）
                        if (jsonData.error) {
                            throw new Error('SerpApi 业务错误: ' + jsonData.error);
                        }

                        return jsonData;
                    }

                    // ---- 401/403: Key 无效或额度耗尽 → 切换下一个 Key ----
                    if (statusCode === 401 || statusCode === 403) {
                        var keyHint = currentKey.substring(0, 6) + '***' + currentKey.substring(currentKey.length - 4);
                        lastError = new Error(
                            'API Key [' + keyHint + '] 无效或额度耗尽 (HTTP ' + statusCode + ')。' +
                            (keyIdx < shuffledKeys.length - 1 ? ' 正在尝试下一个 Key...' : ' 所有 Key 均不可用。')
                        );
                        console.log('[SerpApi] ' + lastError.message);
                        break; // 跳出重试循环，切换到下一个 Key
                    }

                    // ---- 429 限流 / 5xx 服务端错误 → 指数退避重试 ----
                    if (statusCode === 429 || statusCode >= 500) {
                        var waitTime = Math.min(500 * Math.pow(2, attempt), LIMITS.MAX_BACKOFF_MS);
                        lastError = new Error(
                            'SerpApi 暂时不可用 (HTTP ' + statusCode + ')' +
                            (attempt < maxRetries
                                ? '，' + waitTime + 'ms 后重试 (' + (attempt + 1) + '/' + maxRetries + ')...'
                                : '，重试已耗尽。')
                        );
                        console.log('[SerpApi] ' + lastError.message);

                        if (attempt < maxRetries) {
                            try {
                                if (typeof Tools !== 'undefined' && Tools.System && Tools.System.sleep) {
                                    await Tools.System.sleep(waitTime);
                                }
                            } catch (sleepErr) { /* sleep 不可用，继续 */ }
                            continue; // 重试当前 Key
                        }
                        break; // 重试耗尽，切换下一个 Key
                    }

                    // ---- 其他 HTTP 错误 ----
                    var errorDetail = rawContent;
                    try {
                        var errorPayload = JSON.parse(rawContent);
                        errorDetail = errorPayload.error || errorPayload.detail || errorPayload.message || rawContent;
                    } catch (e) { /* 使用原始内容 */ }

                    lastError = new Error('SerpApi 错误 [HTTP ' + statusCode + ']: ' + String(errorDetail).substring(0, 300));
                    break; // 非重试类错误，切换下一个 Key

                } catch (error) {
                    // 区分已处理的 API 错误和网络层错误
                    if (error.message.indexOf('SerpApi') !== -1 || error.message.indexOf('API Key') !== -1) {
                        lastError = error;
                    } else {
                        lastError = new Error('网络通信失败: ' + error.message);
                    }

                    // 网络错误：如果还有重试机会则重试
                    if (attempt < maxRetries) {
                        var netWait = Math.min(500 * Math.pow(2, attempt), LIMITS.MAX_BACKOFF_MS);
                        console.log('[SerpApi] 网络错误，' + netWait + 'ms 后重试...');
                        try {
                            if (typeof Tools !== 'undefined' && Tools.System && Tools.System.sleep) {
                                await Tools.System.sleep(netWait);
                            }
                        } catch (sleepErr) { /* ignore */ }
                        continue;
                    }
                    break; // 重试耗尽
                }
            }
        }

        // 所有 Key 和重试均失败
        throw lastError || new Error('所有 API Key 请求均失败，请检查密钥配置和网络连接。');
    }

    // ==========================================================================
    // 第四层：参数处理引擎
    // ==========================================================================

    /**
     * 通用搜索参数构建器
     * 将用户传入的原始参数（可能为字符串类型）转换为 SerpApi 标准参数
     * @param {Object} rawParams - 原始参数对象
     * @param {string} engine - SerpApi 引擎名称
     * @returns {Object} 标准化的 API 参数对象
     */
    function buildBaseParams(rawParams, engine) {
        var params = rawParams || {};
        var query = safeString(params.query, '');

        if (!query) {
            throw new Error('搜索查询词 (query) 不能为空。请提供要搜索的关键词。');
        }

        var result = {
            engine: engine,
            q: query,
            num: safeNumber(params.num, DEFAULTS.NUM, LIMITS.MIN_NUM, LIMITS.MAX_NUM)
        };

        // gl 和 hl 使用参数值 > 环境变量默认值 > 硬编码默认值 的优先级
        result.gl = safeString(params.gl, getDefaultGl());
        result.hl = safeString(params.hl, getDefaultHl());

        // 时间范围过滤
        var tbs = validateTimePeriod(params.time_period);
        if (tbs) {
            result.tbs = tbs;
        }

        // 结果偏移量
        var start = safeNumber(params.start, DEFAULTS.START, 0, 1000);
        if (start > 0) {
            result.start = start;
        }

        return result;
    }

    /**
     * 学术搜索参数构建器
     * 在通用参数基础上添加学术专用参数
     * @param {Object} rawParams - 原始参数
     * @returns {Object} 学术搜索标准化参数
     */
    function buildScholarParams(rawParams) {
        var params = rawParams || {};
        var query = safeString(params.query, '');

        if (!query) {
            throw new Error('学术搜索关键词 (query) 不能为空。请提供论文标题、作者名或研究主题。');
        }

        var result = {
            engine: ENGINES.SCHOLAR,
            q: query,
            num: safeNumber(params.num, DEFAULTS.NUM, LIMITS.MIN_NUM, LIMITS.MAX_NUM),
            hl: safeString(params.hl, getDefaultHl())
        };

        // 年份过滤
        var asYlo = safeString(params.as_ylo, '');
        if (asYlo && /^\d{4}$/.test(asYlo)) {
            result.as_ylo = asYlo;
        }

        var asYhi = safeString(params.as_yhi, '');
        if (asYhi && /^\d{4}$/.test(asYhi)) {
            result.as_yhi = asYhi;
        }

        return result;
    }

    /**
     * 地图搜索参数构建器
     * 在通用参数基础上添加地图专用参数
     * @param {Object} rawParams - 原始参数
     * @returns {Object} 地图搜索标准化参数
     */
    function buildMapsParams(rawParams) {
        var params = rawParams || {};
        var query = safeString(params.query, '');

        if (!query) {
            throw new Error('地点搜索关键词 (query) 不能为空。请提供地点名称或描述。');
        }

        var result = {
            engine: ENGINES.MAPS,
            q: query,
            type: 'search',
            gl: safeString(params.gl, getDefaultGl()),
            hl: safeString(params.hl, getDefaultHl())
            // 注：Google Maps API 不使用 num 参数，结果数量由 client-side limit 控制
        };

        // 坐标定位
        var ll = safeString(params.ll, '');
        if (ll) {
            result.ll = ll;
        }

        return result;
    }

    // ==========================================================================
    // 第五层：结果格式化引擎
    // ==========================================================================

    /**
     * 通用头部信息生成器
     * @param {Object} data - API 返回的数据
     * @param {string} icon - Emoji 图标
     * @param {string} title - 搜索类型标题
     * @returns {string} Markdown 头部
     */
    function formatHeader(data, icon, title) {
        var params = data.search_parameters || {};
        var meta = '## ' + icon + ' ' + title + ': ' + (params.q || '') + '\n';

        var infoParts = [];
        if (params.gl) infoParts.push('地区: ' + params.gl);
        if (params.hl) infoParts.push('语言: ' + params.hl);
        if (params.tbs) infoParts.push('时间: ' + params.tbs);
        if (params.as_ylo || params.as_yhi) {
            infoParts.push('年份: ' + (params.as_ylo || '不限') + ' - ' + (params.as_yhi || '至今'));
        }

        if (infoParts.length > 0) {
            meta += '> ' + infoParts.join(' | ') + '\n';
        }

        meta += '> 数据时间: ' + getTimestamp() + '\n\n';
        return meta;
    }

    /**
     * 结果格式化器对象
     * 将 API 原始响应转换为结构化 Markdown 文档
     */
    var Formatter = {

        /**
         * Google 网页搜索格式化
         * 处理：知识图谱 + 精选回答 + 有机结果（含富摘要、站内链接）
         */
        web: function (data, limit) {
            var out = formatHeader(data, '🌐', 'Google 网页搜索');

            // === 知识图谱 (Knowledge Graph) ===
            if (data.knowledge_graph) {
                var kg = data.knowledge_graph;
                out += '### 🧠 ' + (kg.title || '知识卡片') + '\n';
                if (kg.type) out += '*' + kg.type + '*\n\n';
                if (kg.description) out += '> ' + kg.description + '\n\n';

                // 提取结构化属性
                var excludeKgKeys = ['title', 'description', 'image', 'type', 'images', 'source',
                    'thumbnail', 'header_images', 'knowledge_graph_id'];
                var kgKeys = Object.keys(kg);
                for (var ki = 0; ki < kgKeys.length; ki++) {
                    var kk = kgKeys[ki];
                    if (typeof kg[kk] === 'string' && excludeKgKeys.indexOf(kk) === -1
                        && kk.indexOf('_link') === -1 && kk.indexOf('_stick') === -1) {
                        out += '- **' + kk + '**: ' + kg[kk] + '\n';
                    }
                }
                out += '\n---\n\n';
            }

            // === 精选回答 (Answer Box) ===
            if (data.answer_box) {
                var ab = data.answer_box;
                out += '### 💡 精选回答\n';
                if (ab.type) out += '*类型: ' + ab.type + '*\n\n';
                if (ab.title) out += '**' + ab.title + '**\n\n';
                if (ab.answer) out += '> **' + ab.answer + '**\n\n';
                if (ab.snippet) out += '> ' + ab.snippet + '\n\n';
                if (ab.snippet_highlighted_words && ab.snippet_highlighted_words.length > 0) {
                    out += '> 关键词: ' + ab.snippet_highlighted_words.join(', ') + '\n\n';
                }
                if (ab.list) {
                    for (var li = 0; li < ab.list.length; li++) {
                        out += '- ' + ab.list[li] + '\n';
                    }
                    out += '\n';
                }
                if (ab.link) out += '来源: [' + (ab.displayed_link || ab.link) + '](' + ab.link + ')\n';
                out += '\n---\n\n';
            }

            // === 有机搜索结果 (Organic Results) ===
            if (data.organic_results && data.organic_results.length > 0) {
                var organicSlice = data.organic_results.slice(0, limit);
                out += '### 🔍 搜索结果 (共 ' + organicSlice.length + ' 条)\n\n';

                for (var oi = 0; oi < organicSlice.length; oi++) {
                    var item = organicSlice[oi];
                    out += (oi + 1) + '. **[' + (item.title || '无标题') + '](' + (item.link || '#') + ')**\n';

                    // 日期 + 摘要
                    if (item.date) out += '   *' + item.date + '*\n';
                    if (item.snippet) out += '   ' + item.snippet + '\n';

                    // 富摘要扩展
                    if (item.rich_snippet && item.rich_snippet.top && item.rich_snippet.top.extensions) {
                        out += '   > ' + item.rich_snippet.top.extensions.join(' | ') + '\n';
                    }

                    // 站内快速链接 (Sitelinks)
                    if (item.sitelinks) {
                        var sitelinks = [];
                        if (item.sitelinks.inline) {
                            for (var si = 0; si < item.sitelinks.inline.length; si++) {
                                sitelinks.push(item.sitelinks.inline[si]);
                            }
                        }
                        if (item.sitelinks.expanded) {
                            for (var se = 0; se < item.sitelinks.expanded.length; se++) {
                                sitelinks.push(item.sitelinks.expanded[se]);
                            }
                        }
                        if (sitelinks.length > 0) {
                            var linkTexts = [];
                            var maxSitelinks = Math.min(sitelinks.length, 4);
                            for (var sl = 0; sl < maxSitelinks; sl++) {
                                linkTexts.push('[' + sitelinks[sl].title + '](' + sitelinks[sl].link + ')');
                            }
                            out += '   *快速链接: ' + linkTexts.join(' | ') + '*\n';
                        }
                    }

                    out += '\n';
                }
            } else {
                out += '未找到相关网页结果。建议：调整搜索关键词或放宽过滤条件。\n';
            }

            // === 相关搜索 (Related Searches) ===
            if (data.related_searches && data.related_searches.length > 0) {
                out += '---\n\n### 🔗 相关搜索\n';
                var maxRelated = Math.min(data.related_searches.length, 5);
                for (var ri = 0; ri < maxRelated; ri++) {
                    out += '- ' + data.related_searches[ri].query + '\n';
                }
                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 图片搜索格式化
         */
        images: function (data, limit) {
            var out = formatHeader(data, '🖼️', 'Google 图片搜索');

            if (!data.images_results || data.images_results.length === 0) {
                return out + '未找到相关图片。建议：调整搜索关键词或放宽过滤条件。\n';
            }

            var results = data.images_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var img = results[i];
                out += '### ' + (i + 1) + '. ' + (img.title || '无标题') + '\n';
                if (img.thumbnail) {
                    out += '![' + (img.title || 'img') + '](' + img.thumbnail + ')\n';
                }
                out += '- [查看原图](' + (img.original || '#') + ')';
                if (img.link) out += ' | [来源页面](' + img.link + ')';
                out += '\n';
                if (img.original_width && img.original_height) {
                    out += '- 尺寸: ' + img.original_width + 'x' + img.original_height + '\n';
                }
                if (img.source) out += '- 来源: ' + img.source + '\n';
                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 新闻搜索格式化
         */
        news: function (data, limit) {
            var out = formatHeader(data, '📰', 'Google 新闻搜索');

            if (!data.news_results || data.news_results.length === 0) {
                return out + '未找到相关新闻。建议：调整搜索关键词或放宽时间范围。\n';
            }

            var results = data.news_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var news = results[i];
                out += (i + 1) + '. **[' + (news.title || '无标题') + '](' + (news.link || '#') + ')**\n';

                var sourceName = '未知来源';
                if (news.source) {
                    sourceName = (typeof news.source === 'object') ? (news.source.title || news.source.name || '未知来源') : news.source;
                }
                var dateStr = news.date || '未知时间';
                out += '   - **来源**: ' + sourceName + ' (' + dateStr + ')\n';

                if (news.snippet) out += '   - ' + news.snippet + '\n';
                if (news.thumbnail) out += '   - ![thumb](' + news.thumbnail + ')\n';

                // 子故事/相关新闻
                if (news.stories && news.stories.length > 0) {
                    out += '   - 相关: ';
                    var storyTexts = [];
                    var maxStories = Math.min(news.stories.length, 3);
                    for (var si = 0; si < maxStories; si++) {
                        storyTexts.push('[' + (news.stories[si].title || '相关') + '](' + (news.stories[si].link || '#') + ')');
                    }
                    out += storyTexts.join(' | ') + '\n';
                }

                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 学术搜索格式化
         */
        scholar: function (data, limit) {
            var out = formatHeader(data, '🎓', 'Google 学术搜索');

            if (!data.organic_results || data.organic_results.length === 0) {
                return out + '未找到相关学术文献。建议：调整搜索关键词或放宽年份范围。\n';
            }

            var results = data.organic_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var paper = results[i];
                out += (i + 1) + '. **[' + (paper.title || '无标题') + '](' + (paper.link || '#') + ')**\n';

                // 作者与发表信息
                if (paper.publication_info && paper.publication_info.summary) {
                    out += '   - 📝 ' + paper.publication_info.summary + '\n';
                }

                // 摘要
                if (paper.snippet) out += '   - ' + paper.snippet + '\n';

                // 引用次数
                if (paper.inline_links) {
                    if (paper.inline_links.cited_by) {
                        out += '   - 📊 被引用: **' + (paper.inline_links.cited_by.total || 0) + '** 次';
                        if (paper.inline_links.cited_by.link) {
                            out += ' [查看引用](' + paper.inline_links.cited_by.link + ')';
                        }
                        out += '\n';
                    }
                    if (paper.inline_links.related_pages_link) {
                        out += '   - [相关论文](' + paper.inline_links.related_pages_link + ')\n';
                    }
                    if (paper.inline_links.versions) {
                        out += '   - 版本数: ' + (paper.inline_links.versions.total || 0) + '\n';
                    }
                }

                // PDF / 资源下载链接
                if (paper.resources && paper.resources.length > 0) {
                    for (var ri = 0; ri < paper.resources.length; ri++) {
                        var res = paper.resources[ri];
                        out += '   - 📄 [下载 ' + (res.file_format || '文件') + '](' + res.link + ')';
                        if (res.title) out += ' (' + res.title + ')';
                        out += '\n';
                    }
                }

                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 购物搜索格式化
         */
        shopping: function (data, limit) {
            var out = formatHeader(data, '🛍️', 'Google 购物搜索');

            if (!data.shopping_results || data.shopping_results.length === 0) {
                return out + '未找到相关商品。建议：调整搜索关键词或更换地区代码。\n';
            }

            var results = data.shopping_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var prod = results[i];
                out += (i + 1) + '. **[' + (prod.title || '无标题') + '](' + (prod.link || prod.product_link || '#') + ')**\n';
                out += '   - **价格**: ' + (prod.price || '未知');
                if (prod.extracted_price) out += ' (' + prod.extracted_price + ')';
                out += '\n';

                if (prod.source || prod.merchant) {
                    out += '   - **商家**: ' + (prod.source || prod.merchant || '未知') + '\n';
                }

                if (prod.rating) {
                    out += '   - ⭐ 评分: ' + prod.rating;
                    if (prod.reviews) out += ' (' + prod.reviews + ' 条评论)';
                    out += '\n';
                }

                if (prod.delivery) out += '   - 🚚 ' + prod.delivery + '\n';
                if (prod.thumbnail) out += '   - ![thumb](' + prod.thumbnail + ')\n';

                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 视频搜索格式化
         */
        videos: function (data, limit) {
            var out = formatHeader(data, '🎬', 'Google 视频搜索');

            if (!data.video_results || data.video_results.length === 0) {
                return out + '未找到相关视频。建议：调整搜索关键词或放宽时间范围。\n';
            }

            var results = data.video_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var vid = results[i];
                out += (i + 1) + '. **[' + (vid.title || '无标题') + '](' + (vid.link || '#') + ')**\n';
                out += '   - ';
                if (vid.source) out += vid.source;
                if (vid.date) out += ' | ' + vid.date;
                if (vid.duration) out += ' | 时长: ' + vid.duration;
                out += '\n';

                if (vid.snippet) out += '   - ' + vid.snippet + '\n';
                if (vid.channel) out += '   - 频道: ' + vid.channel + '\n';
                if (vid.thumbnail) out += '   - ![thumb](' + vid.thumbnail + ')\n';

                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * Google 地图搜索格式化
         */
        maps: function (data, limit) {
            var out = formatHeader(data, '📍', 'Google 地图搜索');

            if (!data.local_results || data.local_results.length === 0) {
                return out + '未找到相关地点。建议：调整搜索关键词或指定坐标 (ll 参数) 缩小范围。\n';
            }

            var results = data.local_results.slice(0, limit);

            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                out += (i + 1) + '. **' + (place.title || '未知地点') + '**\n';

                if (place.type) out += '   - 类型: ' + place.type + '\n';

                if (place.rating) {
                    out += '   - ⭐ 评分: ' + place.rating;
                    if (place.reviews) out += ' (' + place.reviews + ' 条评论)';
                    out += '\n';
                }

                if (place.address) out += '   - 📮 地址: ' + place.address + '\n';
                if (place.phone) out += '   - 📞 电话: ' + place.phone + '\n';

                if (place.operating_hours) {
                    if (place.operating_hours.state) {
                        out += '   - 🕐 状态: ' + place.operating_hours.state + '\n';
                    }
                }
                if (place.hours) out += '   - 🕐 营业: ' + place.hours + '\n';

                if (place.gps_coordinates) {
                    out += '   - 🗺️ GPS: ' + place.gps_coordinates.latitude + ', ' + place.gps_coordinates.longitude + '\n';
                }

                if (place.price) out += '   - 💰 价位: ' + place.price + '\n';
                if (place.website) out += '   - [官网](' + place.website + ')\n';
                if (place.thumbnail) out += '   - ![thumb](' + place.thumbnail + ')\n';

                out += '\n';
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * 多关键词聚合搜索结果格式化
         */
        multi: function (allResults) {
            var out = '## 🔀 多关键词聚合搜索结果\n';
            out += '> 数据时间: ' + getTimestamp() + '\n\n';

            for (var i = 0; i < allResults.length; i++) {
                var item = allResults[i];
                out += '---\n\n';
                out += '### 📌 查询 ' + (i + 1) + ': ' + item.query + '\n\n';

                if (item.error) {
                    out += '> ⚠️ 搜索失败: ' + item.error + '\n\n';
                    continue;
                }

                if (!item.results || item.results.length === 0) {
                    out += '> 未找到相关结果。\n\n';
                    continue;
                }

                for (var j = 0; j < item.results.length; j++) {
                    var r = item.results[j];
                    out += (j + 1) + '. **[' + (r.title || '无标题') + '](' + (r.link || '#') + ')**\n';
                    if (r.snippet) out += '   ' + r.snippet + '\n';
                    out += '\n';
                }
            }

            return truncateContent(out, LIMITS.MAX_TOTAL_OUTPUT);
        },

        /**
         * 连通性测试报告格式化
         */
        test: function (report) {
            var out = '## 🔧 SerpApi 连通性诊断报告\n\n';
            out += '> 测试时间: ' + getTimestamp() + '\n\n';

            // 网关信息
            out += '### 网关配置\n';
            out += '- **目标地址**: ' + report.gateway + '\n';
            out += '- **代理模式**: ' + (report.isProxy ? '✅ 是（自定义代理域名）' : '❌ 否（直连官方 API）') + '\n\n';

            // 密钥测试结果
            out += '### 密钥测试结果\n\n';
            out += '| # | 密钥 | 状态 | 延迟 | 详情 |\n';
            out += '|---|------|------|------|------|\n';

            var successCount = 0;
            var totalLatency = 0;

            for (var i = 0; i < report.results.length; i++) {
                var r = report.results[i];
                var status = r.success ? '✅ 正常' : '❌ 失败';
                var latencyStr = r.latency + 'ms';
                var detail = r.success ? 'HTTP ' + (r.statusCode || 200) : (r.error || '未知错误');

                out += '| ' + (i + 1) + ' | `' + r.keyHint + '` | ' + status + ' | ' + latencyStr + ' | ' + detail + ' |\n';

                if (r.success) {
                    successCount++;
                    totalLatency += r.latency;
                }
            }

            out += '\n';

            // 汇总信息
            out += '### 汇总\n';
            out += '- **密钥总数**: ' + report.results.length + '\n';
            out += '- **可用密钥**: ' + successCount + ' / ' + report.results.length + '\n';
            if (successCount > 0) {
                out += '- **平均延迟**: ' + Math.round(totalLatency / successCount) + 'ms\n';
            }

            if (successCount === 0) {
                out += '\n> ⚠️ **所有密钥均不可用！** 请检查：\n';
                out += '> 1. API Key 是否正确（https://serpapi.com/manage-api-key）\n';
                out += '> 2. API Key 是否有剩余配额\n';
                out += '> 3. 网络连接是否正常\n';
                if (report.isProxy) {
                    out += '> 4. 代理域名 ' + report.gateway + ' 是否可达\n';
                }
            } else if (successCount < report.results.length) {
                out += '\n> ⚠️ 部分密钥不可用，系统将使用可用密钥进行负载均衡。\n';
            } else {
                out += '\n> ✅ 所有密钥正常，系统将进行负载均衡调度。\n';
            }

            return out;
        }
    };

    // ==========================================================================
    // 第六层：统一执行引擎与公开接口
    // ==========================================================================

    /**
     * 统一工具执行包装器
     * 功能：参数构建 → API 请求 → 结果格式化 → complete 回调
     * 确保 complete() 在任何情况下都被调用且仅调用一次
     *
     * @param {string} toolName - 工具名称（用于日志）
     * @param {Object} apiParams - 已构建好的 API 参数
     * @param {Function} formatter - 结果格式化函数
     * @param {number} limit - 结果截断数量
     */
    async function wrapExecution(toolName, apiParams, formatter, limit) {
        try {
            // 执行 API 请求
            var json = await executeApiRequest(apiParams);

            // 格式化结果
            var output = formatter(json, limit);

            complete({
                success: true,
                message: toolName + ' 搜索成功',
                data: output
            });
        } catch (error) {
            console.error('[SerpApi] ' + toolName + ' 执行异常: ' + error.message);
            complete({
                success: false,
                message: toolName + ' 失败: ' + error.message
            });
        }
    }

    /**
     * 多关键词并发搜索核心逻辑
     * @param {Object} rawParams - 原始参数
     */
    async function multiSearchCore(rawParams) {
        try {
            var params = rawParams || {};
            var queriesStr = safeString(params.queries, '');

            if (!queriesStr) {
                throw new Error('搜索查询词列表 (queries) 不能为空。请提供逗号分隔的关键词。');
            }

            // 解析查询词列表
            var queryList = queriesStr
                .split(',')
                .map(function (q) { return q.trim(); })
                .filter(function (q) { return q.length > 0; });

            if (queryList.length === 0) {
                throw new Error('未检测到有效的查询词。请确认逗号分隔格式正确。');
            }

            // 截断至上限
            if (queryList.length > LIMITS.MAX_MULTI_QUERIES) {
                console.log('[SerpApi] 查询词数量超限，仅搜索前 ' + LIMITS.MAX_MULTI_QUERIES + ' 个');
                queryList = queryList.slice(0, LIMITS.MAX_MULTI_QUERIES);
            }

            var numPerQuery = safeNumber(params.num_per_query, DEFAULTS.MULTI_NUM_PER_QUERY, LIMITS.MIN_NUM, LIMITS.MAX_MULTI_PER_QUERY);
            var gl = safeString(params.gl, getDefaultGl());
            var hl = safeString(params.hl, getDefaultHl());
            var tbs = validateTimePeriod(params.time_period);

            // 推送开始消息
            console.log('[SerpApi] 启动多关键词搜索，共 ' + queryList.length + ' 个查询...');

            // 构建并发任务
            var tasks = queryList.map(function (query) {
                var apiParams = {
                    engine: ENGINES.WEB,
                    q: query,
                    num: numPerQuery,
                    gl: gl,
                    hl: hl
                };
                if (tbs) apiParams.tbs = tbs;

                return executeApiRequest(apiParams)
                    .then(function (data) {
                        console.log('[SerpApi] 查询完成: ' + query);
                        var results = [];
                        if (data.organic_results) {
                            var slice = data.organic_results.slice(0, numPerQuery);
                            for (var i = 0; i < slice.length; i++) {
                                results.push({
                                    title: slice[i].title,
                                    link: slice[i].link,
                                    snippet: slice[i].snippet
                                });
                            }
                        }
                        return { query: query, results: results, error: null };
                    })
                    .catch(function (err) {
                        console.log('[SerpApi] 查询失败: ' + query + ' - ' + err.message);
                        return { query: query, results: [], error: err.message };
                    });
            });

            // 并行执行所有任务
            var allResults = await Promise.all(tasks);

            // 格式化聚合结果
            var output = Formatter.multi(allResults);

            // 统计
            var successCount = 0;
            var totalResults = 0;
            for (var i = 0; i < allResults.length; i++) {
                if (!allResults[i].error) {
                    successCount++;
                    totalResults += allResults[i].results.length;
                }
            }

            complete({
                success: true,
                message: '多关键词搜索完成：' + successCount + '/' + allResults.length + ' 个查询成功，共 ' + totalResults + ' 条结果',
                data: output
            });

        } catch (error) {
            console.error('[SerpApi] 多关键词搜索异常: ' + error.message);
            complete({
                success: false,
                message: '多关键词搜索失败: ' + error.message
            });
        }
    }

    /**
     * API 连通性测试核心逻辑
     */
    async function testCore() {
        try {
            var apiKeys = loadApiKeys();
            var gateway = resolveGateway();
            var targetUrl = gateway + DEFAULTS.SEARCH_PATH;
            var isProxy = (gateway.indexOf(DEFAULTS.GATEWAY_DOMAIN) === -1);

            console.log('[SerpApi] 开始连通性测试...');
            console.log('[SerpApi] 网关: ' + gateway + (isProxy ? ' (自定义代理)' : ' (官方直连)'));
            console.log('[SerpApi] 待测密钥数: ' + apiKeys.length);

            var results = [];

            for (var i = 0; i < apiKeys.length; i++) {
                var key = apiKeys[i];
                var keyHint = key.substring(0, 6) + '***' + key.substring(key.length - 4);

                console.log('[SerpApi] 测试密钥 ' + (i + 1) + '/' + apiKeys.length + ': ' + keyHint);

                var startTime = Date.now();

                try {
                    // 使用最轻量的请求测试连通性
                    var testParams = 'engine=google&q=serpapi+connectivity+check&num=1&api_key=' + encodeURIComponent(key) + '&output=json';
                    var testUrl = targetUrl + '?' + testParams;

                    var response = await httpClient
                        .newRequest()
                        .url(testUrl)
                        .method('GET')
                        .headers({
                            'User-Agent': USER_AGENT,
                            'Accept': 'application/json'
                        })
                        .build()
                        .execute();

                    var latency = Date.now() - startTime;
                    var statusCode = response.statusCode;

                    if (response.isSuccessful()) {
                        // 额外检查业务级错误
                        var body = {};
                        try {
                            body = JSON.parse(response.content || '{}');
                        } catch (e) { /* ignore */ }

                        if (body.error) {
                            results.push({
                                keyHint: keyHint,
                                success: false,
                                latency: latency,
                                statusCode: statusCode,
                                error: '业务错误: ' + body.error
                            });
                        } else {
                            results.push({
                                keyHint: keyHint,
                                success: true,
                                latency: latency,
                                statusCode: statusCode
                            });
                        }
                    } else {
                        var errorMsg = 'HTTP ' + statusCode;
                        try {
                            var errBody = JSON.parse(response.content || '{}');
                            errorMsg += ': ' + (errBody.error || errBody.detail || errBody.message || '');
                        } catch (e) { /* ignore */ }

                        results.push({
                            keyHint: keyHint,
                            success: false,
                            latency: latency,
                            statusCode: statusCode,
                            error: errorMsg
                        });
                    }
                } catch (netErr) {
                    var errLatency = Date.now() - startTime;
                    results.push({
                        keyHint: keyHint,
                        success: false,
                        latency: errLatency,
                        error: '网络错误: ' + netErr.message + (errLatency > LIMITS.TEST_TIMEOUT ? ' (可能超时)' : '')
                    });
                }
            }

            // 格式化诊断报告
            var report = {
                gateway: gateway,
                isProxy: isProxy,
                results: results
            };

            var formattedOutput = Formatter.test(report);

            complete({
                success: true,
                message: 'API 连通性测试完成',
                data: formattedOutput
            });

        } catch (error) {
            console.error('[SerpApi] 连通性测试失败: ' + error.message);
            complete({
                success: false,
                message: '连通性测试失败: ' + error.message
            });
        }
    }

    // ==========================================================================
    // 公开接口暴露
    // ==========================================================================

    return {

        /**
         * Google 网页搜索入口
         * 最简调用：{ query: "搜索内容" }
         * @param {Object} params - 搜索参数
         */
        search: function (params) {
            var apiParams = buildBaseParams(params, ENGINES.WEB);
            var limit = apiParams.num;
            return wrapExecution('Google 网页搜索', apiParams, Formatter.web, limit);
        },

        /**
         * Google 图片搜索入口
         * 最简调用：{ query: "搜索内容" }
         * @param {Object} params - 搜索参数
         */
        images: function (params) {
            var apiParams = buildBaseParams(params, ENGINES.IMAGES);
            var limit = apiParams.num;
            return wrapExecution('Google 图片搜索', apiParams, Formatter.images, limit);
        },

        /**
         * Google 新闻搜索入口
         * 最简调用：{ query: "新闻关键词" }
         * @param {Object} params - 搜索参数
         */
        news: function (params) {
            var apiParams = buildBaseParams(params, ENGINES.NEWS);
            var limit = apiParams.num;
            return wrapExecution('Google 新闻搜索', apiParams, Formatter.news, limit);
        },

        /**
         * Google 学术搜索入口
         * 最简调用：{ query: "论文关键词" }
         * @param {Object} params - 搜索参数
         */
        scholar: function (params) {
            var apiParams = buildScholarParams(params);
            var limit = apiParams.num;
            return wrapExecution('Google 学术搜索', apiParams, Formatter.scholar, limit);
        },

        /**
         * Google 购物搜索入口
         * 最简调用：{ query: "商品关键词" }
         * @param {Object} params - 搜索参数
         */
        shopping: function (params) {
            var apiParams = buildBaseParams(params, ENGINES.SHOPPING);
            var limit = apiParams.num;
            return wrapExecution('Google 购物搜索', apiParams, Formatter.shopping, limit);
        },

        /**
         * Google 视频搜索入口
         * 最简调用：{ query: "视频关键词" }
         * @param {Object} params - 搜索参数
         */
        videos: function (params) {
            var apiParams = buildBaseParams(params, ENGINES.VIDEOS);
            var limit = apiParams.num;
            return wrapExecution('Google 视频搜索', apiParams, Formatter.videos, limit);
        },

        /**
         * Google 地图搜索入口
         * 最简调用：{ query: "地点关键词" }
         * @param {Object} params - 搜索参数
         */
        maps: function (params) {
            var apiParams = buildMapsParams(params);
            var limit = safeNumber(params.num, DEFAULTS.NUM, LIMITS.MIN_NUM, LIMITS.MAX_NUM);
            return wrapExecution('Google 地图搜索', apiParams, Formatter.maps, limit);
        },

        /**
         * 多关键词并发聚合搜索入口
         * 最简调用：{ queries: "关键词1,关键词2,关键词3" }
         * @param {Object} params - 多关键词搜索参数
         */
        multi_search: function (params) {
            return multiSearchCore(params);
        },

        /**
         * API 连通性测试入口
         * 调用方式：无需传入任何参数
         */
        test: function () {
            return testCore();
        }
    };

})();

// ============================================================================
// 导出工具接口（严格匹配 METADATA 中的 tools[].name）
// ============================================================================

exports.search = serpApiToolkit.search;
exports.images = serpApiToolkit.images;
exports.news = serpApiToolkit.news;
exports.scholar = serpApiToolkit.scholar;
exports.shopping = serpApiToolkit.shopping;
exports.videos = serpApiToolkit.videos;
exports.maps = serpApiToolkit.maps;
exports.multi_search = serpApiToolkit.multi_search;
exports.test = serpApiToolkit.test;