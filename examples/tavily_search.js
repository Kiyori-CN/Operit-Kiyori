/* METADATA
{
    "name": "tavily_search",
    "version": "1.0",
    "display_name": {
        "zh": "Tavily AI 搜索",
        "en": "Tavily AI Search"
    },
    "description": {
        "zh": "Tavily AI 全能搜索工具包。基于 Tavily REST API 提供六大核心功能：AI 智能搜索（基础/深度）、网页内容提取、站点结构化爬取、站点地图生成、多关键词并发聚合搜索，以及 API 连通性诊断测试。支持多密钥轮询负载均衡与智能故障转移、自定义反向代理域名、指数退避重试（429/5xx 自动恢复）、主题分类与时效性筛选联动、域名包含/排除精准过滤、AI 智能总结开关、内容详略控制（仅搜索/含原始内容）、结果长度安全截断，以及结构化 Markdown 格式输出。所有参数均设有合理默认值，可零配置直接调用。",
        "en": "Tavily AI all-in-one search toolkit. Built on Tavily REST API with six core features: AI-powered search (basic/advanced), web content extraction, structured site crawling, sitemap generation, multi-keyword concurrent aggregated search, and API connectivity diagnostics. Supports multi-key rotation with intelligent failover, custom reverse proxy domain, exponential backoff retry (auto-recovery for 429/5xx), topic-based time filtering, domain include/exclude filtering, AI summary toggle, content depth control, result length safety truncation, and structured Markdown output. All parameters have sensible defaults for zero-config usage."
    },
    "env": [
        {
            "name": "TAVILY_API_KEYS",
            "description": {
                "zh": "Tavily API 密钥列表，多个密钥用英文逗号分隔以实现负载均衡与配额轮换。至少需要一个有效密钥。获取地址：https://tavily.com",
                "en": "Tavily API key(s), comma-separated for load balancing and quota rotation. At least one valid key required. Get yours at: https://tavily.com"
            },
            "required": true
        },
        {
            "name": "TAVILY_PROXY_DOMAIN",
            "description": {
                "zh": "自定义反向代理域名（可选），用于替换默认的 api.tavily.com。格式示例：https://my-proxy.example.com 或 my-proxy.example.com（自动补充 https://）。不填则直接访问官方 API",
                "en": "Custom reverse proxy domain (optional) to replace api.tavily.com. Example: https://my-proxy.example.com or my-proxy.example.com (auto-prefixes https://). Leave empty for direct API access."
            },
            "required": false
        },
        {
            "name": "TAVILY_DEFAULT_DEPTH",
            "description": {
                "zh": "默认搜索深度（可选）：basic（快速检索，省配额）/ advanced（深度检索，结果更全面）。不填默认 basic",
                "en": "Default search depth (optional): basic (fast, saves quota) / advanced (thorough, better results). Default: basic"
            },
            "required": false
        },
        {
            "name": "TAVILY_MAX_RETRIES",
            "description": {
                "zh": "请求失败最大重试次数（可选），范围 0-5，默认 3。设为 0 禁用重试",
                "en": "Max retry attempts on failure (optional), range 0-5. Default: 3. Set 0 to disable."
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
                "zh": "执行 AI 驱动的智能网页搜索。支持基础快速检索（basic）与深度增强检索（advanced），可按主题分类（通用/新闻/金融）并联动时效性区间筛选，支持域名包含/排除精准过滤、AI 智能总结开关、原始内容附带选项。返回结构化 Markdown 格式报告，含 AI 总结、来源链接、发布时间及内容摘要。所有可选参数均有默认值，最简调用只需传入 query。",
                "en": "AI-powered web search. Supports basic (fast) and advanced (thorough) depth, topic classification (general/news/finance) with time filtering, domain include/exclude, AI summary toggle, and raw content option. Returns structured Markdown with AI summary, source links, dates, and snippets. All optional params have defaults — minimal call needs only query."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": {
                        "zh": "搜索查询词，描述你要检索的内容。支持自然语言和关键词组合",
                        "en": "Search query. Supports natural language and keyword combinations."
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "search_depth",
                    "description": {
                        "zh": "搜索深度：basic（快速检索，省配额，适合简单查询）/ advanced（深度检索，结果更全面，适合复杂分析）。默认 basic",
                        "en": "Search depth: basic (fast, saves quota) / advanced (thorough, comprehensive). Default: basic"
                    },
                    "type": "string",
                    "required": false,
                    "default": "basic"
                },
                {
                    "name": "topic",
                    "description": {
                        "zh": "搜索主题分类：general（通用内容，默认）/ news（新闻资讯，启用时效性 days 筛选）/ finance（金融财经）。选择 news 时 days 参数自动生效",
                        "en": "Topic: general (default) / news (enables days filter) / finance. Days param auto-activates with news topic."
                    },
                    "type": "string",
                    "required": false,
                    "default": "general"
                },
                {
                    "name": "days",
                    "description": {
                        "zh": "时效窗口：搜索过去 N 天内的结果（仅当 topic 为 news 时生效，范围 1-365）。默认 3 天。设为 1 搜索最近24小时，设为 7 搜索最近一周",
                        "en": "Time window: results from last N days (only when topic=news, range 1-365). Default: 3. Set 1 for last 24h, 7 for past week."
                    },
                    "type": "number",
                    "required": false,
                    "default": 3
                },
                {
                    "name": "max_results",
                    "description": {
                        "zh": "返回结果数量上限（1-20），默认 5。普通查询建议 3-5，深度研究建议 8-15",
                        "en": "Max results (1-20), default 5. Recommended: 3-5 for general, 8-15 for deep research."
                    },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "include_answer",
                    "description": {
                        "zh": "是否包含 AI 智能总结：true（返回基于搜索结果的 AI 摘要，默认）/ false（仅返回原始搜索结果）/ advanced（返回更详细的 AI 深度总结）",
                        "en": "Include AI summary: true (default, AI summary) / false (raw results only) / advanced (detailed AI summary)"
                    },
                    "type": "string",
                    "required": false,
                    "default": "true"
                },
                {
                    "name": "include_raw_content",
                    "description": {
                        "zh": "是否附带网页原始正文内容：true（附带完整正文，内容更详细但消耗更多 Token）/ false（仅返回摘要，默认）",
                        "en": "Include raw page content: true (full content, more tokens) / false (snippet only, default)"
                    },
                    "type": "boolean",
                    "required": false,
                    "default": false
                },
                {
                    "name": "include_domains",
                    "description": {
                        "zh": "限定搜索域名白名单（可选），多个域名用英文逗号分隔。例如：'github.com,stackoverflow.com'。仅返回来自这些域名的结果",
                        "en": "Domain whitelist (optional), comma-separated. Example: 'github.com,stackoverflow.com'. Only results from these domains."
                    },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "exclude_domains",
                    "description": {
                        "zh": "排除搜索域名黑名单（可选），多个域名用英文逗号分隔。例如：'pinterest.com,quora.com'。过滤掉来自这些域名的结果",
                        "en": "Domain blacklist (optional), comma-separated. Example: 'pinterest.com,quora.com'. Excludes results from these domains."
                    },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "news",
            "description": {
                "zh": "搜索最新新闻资讯。专为新闻场景优化：自动设置 topic=news、默认搜索过去 3 天内容、使用深度检索模式。适用于热点追踪、新闻速递、舆情监控等场景。返回带发布时间、来源和 AI 总结的结构化新闻报告。",
                "en": "Search latest news. Optimized for news: auto topic=news, default last 3 days, advanced depth. Ideal for trending topics, news briefs, and media monitoring. Returns structured news report with dates, sources, and AI summary."
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
                    "name": "days",
                    "description": {
                        "zh": "搜索过去 N 天内的新闻（1-365），默认 3。设为 1 获取最近24小时新闻",
                        "en": "News from last N days (1-365), default 3. Set 1 for last 24 hours."
                    },
                    "type": "number",
                    "required": false,
                    "default": 3
                },
                {
                    "name": "max_results",
                    "description": {
                        "zh": "返回新闻条数（1-20），默认 8",
                        "en": "Number of news results (1-20), default 8"
                    },
                    "type": "number",
                    "required": false,
                    "default": 8
                }
            ]
        },
        {
            "name": "extract",
            "description": {
                "zh": "从指定 URL 提取网页核心正文内容。自动过滤广告、导航栏、侧边栏等干扰元素，返回纯净的结构化文本。支持单个 URL 或多个 URL（逗号分隔，最多 5 个）。适用于文章阅读、资料收集、内容归档等场景。",
                "en": "Extract main content from URL(s). Auto-filters ads, navigation, sidebars. Supports single URL or multiple URLs (comma-separated, max 5). Ideal for article reading, data collection, and content archiving."
            },
            "parameters": [
                {
                    "name": "urls",
                    "description": {
                        "zh": "目标 URL，支持单个 URL 或多个 URL 用英文逗号分隔（最多 5 个）。必须为完整的 HTTP/HTTPS 地址",
                        "en": "Target URL(s). Single URL or comma-separated (max 5). Must be complete HTTP/HTTPS addresses."
                    },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "crawl",
            "description": {
                "zh": "从起始 URL 开始对网站进行结构化爬取。自动发现并抓取内部链接页面，提取每个页面的标题和正文内容。适用于站点内容索引、全站数据采集、文档归档等场景。注意：受目标站点 robots.txt 和反爬策略影响；建议 limit 不超过 20 以避免超时。",
                "en": "Structured website crawling from a root URL. Auto-discovers and fetches internal links with titles and content. Ideal for site indexing, full-site data collection, and documentation archiving. Subject to target site's robots.txt and anti-crawl policies."
            },
            "parameters": [
                {
                    "name": "url",
                    "description": {
                        "zh": "爬取起始根地址，必须为完整的 HTTP/HTTPS URL。例如：https://docs.example.com",
                        "en": "Root URL to start crawling (must be a complete HTTP/HTTPS URL). Example: https://docs.example.com"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "limit",
                    "description": {
                        "zh": "单次任务抓取的页面数量上限（1-50），默认 10。建议不超过 30 以避免超时",
                        "en": "Max pages to crawl (1-50), default 10. Recommended max 30 to avoid timeout."
                    },
                    "type": "number",
                    "required": false,
                    "default": 10
                }
            ]
        },
        {
            "name": "map",
            "description": {
                "zh": "生成目标网站的完整 URL 映射地图。快速扫描站点的所有可访问页面列表，用于了解网站结构和内容分布。比 crawl 速度更快但不提取页面内容。",
                "en": "Generate a complete URL map of the target website. Quickly scans all accessible pages for site structure overview. Faster than crawl but without page content extraction."
            },
            "parameters": [
                {
                    "name": "url",
                    "description": {
                        "zh": "目标网站根域名地址，必须为完整的 HTTP/HTTPS URL。例如：https://example.com",
                        "en": "Root domain URL (must be complete HTTP/HTTPS). Example: https://example.com"
                    },
                    "type": "string",
                    "required": true
                }
            ]
        },
        {
            "name": "multi_search",
            "description": {
                "zh": "多关键词并发聚合搜索。同时搜索多个查询词并汇总结果，适用于多角度调研、对比分析、主题研究等场景。每个查询词独立搜索后合并展示，大幅提高信息覆盖面和搜索效率。",
                "en": "Multi-keyword concurrent aggregated search. Searches multiple queries simultaneously and consolidates results. Ideal for multi-angle research, comparative analysis, and topic studies."
            },
            "parameters": [
                {
                    "name": "queries",
                    "description": {
                        "zh": "搜索查询词列表，多个关键词用英文逗号分隔。例如：'AI大模型最新进展,GPT-5发布日期,Claude对比GPT'。最多支持 5 个查询词",
                        "en": "Comma-separated queries (max 5). Example: 'latest AI models,GPT-5 release,Claude vs GPT'"
                    },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "max_results_per_query",
                    "description": {
                        "zh": "每个查询词的结果数量（1-10），默认 3",
                        "en": "Results per query (1-10), default 3"
                    },
                    "type": "number",
                    "required": false,
                    "default": 3
                },
                {
                    "name": "search_depth",
                    "description": {
                        "zh": "搜索深度：basic（快速，默认）/ advanced（深度）",
                        "en": "Search depth: basic (fast, default) / advanced (thorough)"
                    },
                    "type": "string",
                    "required": false,
                    "default": "basic"
                },
                {
                    "name": "include_answer",
                    "description": {
                        "zh": "是否包含每个查询的 AI 智能总结：true（默认）/ false",
                        "en": "Include AI summary per query: true (default) / false"
                    },
                    "type": "string",
                    "required": false,
                    "default": "true"
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 Tavily API 连通性。验证所有 API Key 的有效性、网络可达性（含代理域名）及服务响应延迟，返回完整的诊断报告。适用于首次配置后的连通性验证、密钥有效性检查与网络故障排查。无需传入任何参数。",
                "en": "Test Tavily API connectivity. Validates all API keys, network reachability (including proxy), and response latency. Returns comprehensive diagnostic report. For setup verification and troubleshooting. No parameters needed."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==================================================================================
 * 模块名称：Tavily 全能搜索工具包 (Tavily All-in-One Search Toolkit)
 * ==================================================================================
 * 版本：v1.0
 * 架构：IIFE + Wrapper + 分层架构（六层设计）
 * 驱动：基于 Tavily REST API (https://docs.tavily.com)
 *
 * 功能矩阵：
 *   ┌──────────────────┬──────────────────────────────────────────────────────┐
 *   │ search           │ AI 智能搜索（基础/深度/主题分类/时效/域名过滤）       │
 *   │ news             │ 新闻专项搜索（自动 topic=news/深度模式/时效筛选）     │
 *   │ extract          │ 网页内容提取（单/多 URL/自动去噪/纯净正文）           │
 *   │ crawl            │ 站点结构化爬取（自动发现链接/标题+正文提取）           │
 *   │ map              │ 站点地图生成（快速 URL 索引/结构概览）                │
 *   │ multi_search     │ 多关键词并发聚合搜索（并行调度/合并展示）             │
 *   │ test             │ API 连通性诊断测试（密钥验证/延迟检测/代理验证）      │
 *   └──────────────────┴──────────────────────────────────────────────────────┘
 *
 * 核心设计亮点：
 *   1.  多密钥负载均衡 — 支持逗号分隔的多 API Key，随机调度 + 故障转移
 *   2.  智能故障转移 — 单 Key 失败自动切换下一个可用 Key，全部失败才报错
 *   3.  指数退避重试 — 429 限流/5xx 服务端错误自动重试（0.5s → 1s → 2s → 4s）
 *   4.  自适应反向代理 — 支持自定义代理域名，自动补充协议头与路径规范化
 *   5.  参数沙盒化 — 独立副本处理参数，拒绝污染原始输入对象
 *   6.  全参数默认值 — 所有可选参数均有合理默认值，支持零配置直接调用
 *   7.  主题-时效联动 — topic 与 days 智能联动，非 news 模式自动清除 days
 *   8.  域名精准过滤 — 支持 include_domains / exclude_domains 白名单/黑名单
 *   9.  结构化 Markdown 输出 — 统一的格式化引擎，AI 友好的结果呈现
 *  10.  长内容安全截断 — 防止超长响应导致 AI 上下文溢出
 *  11.  多关键词并发 — Promise.allSettled 并行调度，容错合并
 *  12.  完整错误分级 — 区分网络层/协议层/业务层/参数层四级异常
 *  13.  连通性诊断 — 一键检测所有 Key 有效性、网络延迟、代理状态
 *  14.  中间进度推送 — 长任务执行进度实时反馈（多关键词搜索/测试）
 *
 * 运行环境：Operit JavaScript 沙箱 (ES2017+)
 * 网络协议：HTTPS + OkHttp 客户端
 * ==================================================================================
 */
const tavilySearchToolkit = (function () {

  // ==========================================================================
  // 第一层：常量定义与配置中心
  // ==========================================================================

  /**
   * API 端点路由映射表
   * 定义所有核心功能对应的 Tavily API 路径
   */
  const API_ENDPOINTS = {
    SEARCH: '/search',     // 智能搜索（含新闻）
    EXTRACT: '/extract',    // 内容提取
    CRAWL: '/crawl',      // 站点爬取
    MAP: '/map'         // 地图生成
  };

  /**
   * 默认行为配置
   * 所有可选参数的回退默认值集中管理
   */
  const DEFAULTS = {
    GATEWAY_DOMAIN: 'api.tavily.com',           // 默认网关域名
    SEARCH_DEPTH: 'basic',                       // 默认搜索深度
    TOPIC: 'general',                            // 默认搜索主题
    DAYS: 3,                                     // 默认新闻时效（天）
    MAX_RESULTS: 5,                              // 默认搜索结果数
    NEWS_MAX_RESULTS: 8,                         // 新闻默认结果数
    INCLUDE_ANSWER: true,                        // 默认包含 AI 总结
    INCLUDE_RAW_CONTENT: false,                  // 默认不附带原始内容
    CRAWL_LIMIT: 10,                             // 默认爬取页面数
    MULTI_MAX_PER_QUERY: 3,                      // 多关键词每查询默认结果数
    MAX_RETRIES: 3                               // 默认最大重试次数
  };

  /**
   * 安全限制常量
   * 防止资源滥用和上下文溢出
   */
  const LIMITS = {
    REQUEST_TIMEOUT: 60000,                      // 请求超时：60 秒
    MAX_RESULTS_CAP: 20,                         // 搜索结果数硬上限
    MIN_RESULTS: 1,                              // 搜索结果数下限
    MAX_DAYS: 365,                               // 时效天数上限
    MIN_DAYS: 1,                                 // 时效天数下限
    MAX_CONTENT_LENGTH: 15000,                   // 单条结果最大字符数
    MAX_TOTAL_OUTPUT: 80000,                     // 总输出最大字符数
    MAX_CRAWL_LIMIT: 50,                         // 爬取页面数上限
    MIN_CRAWL_LIMIT: 1,                          // 爬取页面数下限
    MAX_EXTRACT_URLS: 5,                         // 批量提取 URL 上限
    MAX_MULTI_QUERIES: 5,                        // 多关键词搜索上限
    MAX_MULTI_PER_QUERY: 10,                     // 多关键词每查询结果上限
    MAX_RETRIES_CAP: 5,                          // 重试次数硬上限
    TEST_TIMEOUT: 15000                          // 测试请求超时：15 秒
  };

  /**
   * 合法参数枚举
   * 用于参数校验
   */
  const VALID_DEPTHS = ['basic', 'advanced'];
  const VALID_TOPICS = ['general', 'news', 'finance'];
  const VALID_ANSWER_VALUES = ['true', 'false', 'advanced'];

  /**
   * HTTP 客户端标识
   */
  const USER_AGENT = 'Tavily-Toolkit/1.0 (Operit)';

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
    const rawKeys = getEnv('TAVILY_API_KEYS');
    if (!rawKeys || rawKeys.trim() === '') {
      throw new Error(
        '环境变量 TAVILY_API_KEYS 未配置。\n' +
        '请在「设置 → 环境变量」中添加至少一个 Tavily API 密钥。\n' +
        '获取密钥：https://tavily.com'
      );
    }

    const keys = rawKeys
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // 去重
    const uniqueKeys = [...new Set(keys)];

    if (uniqueKeys.length === 0) {
      throw new Error('TAVILY_API_KEYS 格式错误：解析后未发现有效密钥。请确认逗号分隔格式正确。');
    }

    return uniqueKeys;
  }

  /**
   * 网关地址规范化处理
   * 功能：处理用户自定义代理域名，确保符合 URL 规范
   * @returns {string} 完整的网关地址（含协议头，无尾部斜杠）
   */
  function resolveGateway() {
    let gateway = (getEnv('TAVILY_PROXY_DOMAIN') || DEFAULTS.GATEWAY_DOMAIN).trim();

    // 移除尾部路径片段（用户可能误填 /search 等）
    gateway = gateway.replace(/\/+(search|extract|crawl|map).*$/i, '');

    // 自动补充协议头
    if (!/^https?:\/\//i.test(gateway)) {
      gateway = 'https://' + gateway;
    }

    // 移除尾部斜杠
    return gateway.replace(/\/+$/, '');
  }

  /**
   * 获取最大重试次数配置
   * @returns {number} 重试次数
   */
  function getMaxRetries() {
    const envRetries = getEnv('TAVILY_MAX_RETRIES');
    if (envRetries !== null && envRetries !== undefined && envRetries.trim() !== '') {
      const parsed = parseInt(envRetries.trim(), 10);
      if (!isNaN(parsed)) {
        return Math.max(0, Math.min(LIMITS.MAX_RETRIES_CAP, parsed));
      }
    }
    return DEFAULTS.MAX_RETRIES;
  }

  /**
   * 获取默认搜索深度配置
   * @returns {string} 搜索深度
   */
  function getDefaultDepth() {
    const envDepth = getEnv('TAVILY_DEFAULT_DEPTH');
    if (envDepth && VALID_DEPTHS.includes(envDepth.trim().toLowerCase())) {
      return envDepth.trim().toLowerCase();
    }
    return DEFAULTS.SEARCH_DEPTH;
  }

  /**
   * 安全数值解析与范围约束
   * @param {*} value - 待解析的值
   * @param {number} defaultVal - 默认值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 约束后的数值
   */
  function safeNumber(value, defaultVal, min, max) {
    if (value === undefined || value === null || value === '') return defaultVal;
    const num = Number(value);
    if (isNaN(num)) return defaultVal;
    return Math.max(min, Math.min(max, Math.round(num)));
  }

  /**
   * 安全布尔值解析
   * @param {*} value - 待解析的值
   * @param {boolean} defaultVal - 默认值
   * @returns {boolean} 解析后的布尔值
   */
  function safeBool(value, defaultVal) {
    if (value === undefined || value === null || value === '') return defaultVal;
    if (typeof value === 'boolean') return value;
    const str = String(value).trim().toLowerCase();
    if (str === 'true' || str === '1' || str === 'yes') return true;
    if (str === 'false' || str === '0' || str === 'no') return false;
    return defaultVal;
  }

  /**
   * 域名列表解析
   * 将逗号分隔的域名字符串解析为数组
   * @param {string} domainStr - 逗号分隔的域名字符串
   * @returns {string[]|undefined} 域名数组或 undefined
   */
  function parseDomains(domainStr) {
    if (!domainStr || typeof domainStr !== 'string' || domainStr.trim() === '') {
      return undefined;
    }
    const domains = domainStr
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0 && d.includes('.'));

    return domains.length > 0 ? domains : undefined;
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
    return content.substring(0, maxLen) + '\n\n*(内容过长，已自动截断至 ' + maxLen + ' 字符)*';
  }

  /**
   * 获取当前时间戳字符串
   * @returns {string} 格式化的时间字符串
   */
  function getTimestamp() {
    return new Date().toLocaleString('zh-CN', { hour12: false });
  }

  // ==========================================================================
  // 第三层：网络请求引擎（核心）
  // ==========================================================================

  /**
   * 带智能故障转移和指数退避重试的 HTTP 请求调度器
   * 
   * 策略说明：
   * - 从密钥池中随机选取一个 Key 发起请求
   * - 如果遇到 401/403（Key 无效），标记该 Key 并尝试下一个
   * - 如果遇到 429（限流）或 5xx（服务端错误），执行指数退避重试
   * - 所有 Key 都失败则抛出最后一个错误
   * 
   * @param {string} endpoint - API 端点路径
   * @param {Object} payload - 请求负载（JSON 对象）
   * @param {number} [timeoutOverride] - 可选的超时覆盖值
   * @returns {Promise<Object>} 解析后的响应数据
   * @throws {Error} 所有 Key/重试均失败时抛出异常
   */
  async function executeApiRequest(endpoint, payload, timeoutOverride) {
    const apiKeys = loadApiKeys();
    const gateway = resolveGateway();
    const targetUrl = gateway + endpoint;
    const maxRetries = getMaxRetries();
    const timeout = timeoutOverride || LIMITS.REQUEST_TIMEOUT;

    // 构建随机化的密钥队列（Fisher-Yates 洗牌）
    const shuffledKeys = [...apiKeys];
    for (let i = shuffledKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledKeys[i], shuffledKeys[j]] = [shuffledKeys[j], shuffledKeys[i]];
    }

    let lastError = null;

    // 外层循环：遍历所有可用密钥
    for (let keyIdx = 0; keyIdx < shuffledKeys.length; keyIdx++) {
      const currentKey = shuffledKeys[keyIdx];

      // 内层循环：对当前密钥进行重试
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // 注入 API Key 到请求负载
          const requestBody = {
            ...payload,
            api_key: currentKey
          };

          // 构建并执行 HTTP 请求
          const response = await httpClient
            .newRequest()
            .url(targetUrl)
            .method('POST')
            .headers({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': USER_AGENT
            })
            .body(JSON.stringify(requestBody), 'json')
            .build()
            .execute();

          const rawContent = response.content || '{}';
          const statusCode = response.statusCode;

          // ---- 成功响应 ----
          if (response.isSuccessful()) {
            let jsonData;
            try {
              jsonData = JSON.parse(rawContent);
            } catch (parseErr) {
              throw new Error('响应 JSON 解析失败: ' + rawContent.substring(0, 200));
            }
            return jsonData;
          }

          // ---- 401/403: Key 无效或过期 → 切换下一个 Key ----
          if (statusCode === 401 || statusCode === 403) {
            const keyHint = currentKey.substring(0, 8) + '***';
            lastError = new Error(
              'API Key [' + keyHint + '] 无效或额度耗尽 (HTTP ' + statusCode + ')。' +
              (keyIdx < shuffledKeys.length - 1 ? ' 正在尝试下一个 Key...' : ' 所有 Key 均不可用。')
            );
            console.log('[TavilySearch] ' + lastError.message);
            break; // 跳出重试循环，切换到下一个 Key
          }

          // ---- 429 限流 / 5xx 服务端错误 → 指数退避重试 ----
          if (statusCode === 429 || statusCode >= 500) {
            const waitTime = Math.min(500 * Math.pow(2, attempt), 8000);
            lastError = new Error(
              'Tavily API 暂时不可用 (HTTP ' + statusCode + ')' +
              (attempt < maxRetries ? '，' + waitTime + 'ms 后重试 (' + (attempt + 1) + '/' + maxRetries + ')...' : '，重试已耗尽。')
            );
            console.log('[TavilySearch] ' + lastError.message);

            if (attempt < maxRetries) {
              // 执行等待（使用 Tools.System.sleep 如果可用）
              try {
                if (typeof Tools !== 'undefined' && Tools.System && Tools.System.sleep) {
                  await Tools.System.sleep(waitTime);
                }
              } catch (sleepErr) {
                // sleep 不可用，继续执行
              }
              continue; // 重试当前 Key
            }
            break; // 重试耗尽，切换下一个 Key
          }

          // ---- 其他 HTTP 错误 ----
          let errorDetail = rawContent;
          try {
            const errorPayload = JSON.parse(rawContent);
            errorDetail = errorPayload.detail || errorPayload.message || errorPayload.error || rawContent;
          } catch (e) { /* 使用原始内容 */ }

          lastError = new Error('Tavily API 错误 [HTTP ' + statusCode + ']: ' + String(errorDetail).substring(0, 300));
          break; // 非重试类错误，切换下一个 Key

        } catch (error) {
          // 区分已处理的 API 错误和网络层错误
          if (error.message.includes('Tavily API') || error.message.includes('API Key') || error.message.includes('暂时不可用')) {
            lastError = error;
          } else {
            lastError = new Error('网络通信失败: ' + error.message);
          }

          // 网络错误：如果还有重试机会则重试
          if (attempt < maxRetries) {
            const waitTime = Math.min(500 * Math.pow(2, attempt), 8000);
            console.log('[TavilySearch] 网络错误，' + waitTime + 'ms 后重试...');
            try {
              if (typeof Tools !== 'undefined' && Tools.System && Tools.System.sleep) {
                await Tools.System.sleep(waitTime);
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
   * 搜索参数沙盒化处理器
   * 功能：创建参数副本，应用默认值、约束和业务规则
   * @param {Object} rawParams - 原始参数对象
   * @returns {Object} 处理后的标准化参数对象
   */
  function buildSearchPayload(rawParams) {
    const defaultDepth = getDefaultDepth();

    // 基础参数
    const payload = {
      query: String(rawParams.query || '').trim(),
      search_depth: VALID_DEPTHS.includes(String(rawParams.search_depth || '').toLowerCase())
        ? String(rawParams.search_depth).toLowerCase()
        : defaultDepth,
      topic: VALID_TOPICS.includes(String(rawParams.topic || '').toLowerCase())
        ? String(rawParams.topic).toLowerCase()
        : DEFAULTS.TOPIC,
      max_results: safeNumber(rawParams.max_results, DEFAULTS.MAX_RESULTS, LIMITS.MIN_RESULTS, LIMITS.MAX_RESULTS_CAP),
      include_raw_content: safeBool(rawParams.include_raw_content, DEFAULTS.INCLUDE_RAW_CONTENT)
    };

    // query 非空校验
    if (!payload.query) {
      throw new Error('搜索查询词 (query) 不能为空。请提供要搜索的关键词。');
    }

    // include_answer 特殊处理（支持 true/false/advanced 三值）
    const answerVal = String(rawParams.include_answer !== undefined ? rawParams.include_answer : 'true').toLowerCase();
    if (answerVal === 'advanced') {
      payload.include_answer = 'advanced';
    } else {
      payload.include_answer = safeBool(answerVal, DEFAULTS.INCLUDE_ANSWER);
    }

    // days 参数联动：仅 news 主题下生效
    if (payload.topic === 'news') {
      payload.days = safeNumber(rawParams.days, DEFAULTS.DAYS, LIMITS.MIN_DAYS, LIMITS.MAX_DAYS);
    }
    // 非 news 主题下不传 days 参数（由对象字面量的缺失来实现）

    // 域名过滤
    const includeDomains = parseDomains(rawParams.include_domains);
    if (includeDomains) payload.include_domains = includeDomains;

    const excludeDomains = parseDomains(rawParams.exclude_domains);
    if (excludeDomains) payload.exclude_domains = excludeDomains;

    return payload;
  }

  /**
   * 新闻搜索参数构建器
   * 自动设置 news 优化参数
   * @param {Object} rawParams - 原始参数
   * @returns {Object} 新闻搜索标准化参数
   */
  function buildNewsPayload(rawParams) {
    return buildSearchPayload({
      query: rawParams.query,
      search_depth: 'advanced',
      topic: 'news',
      days: rawParams.days || DEFAULTS.DAYS,
      max_results: rawParams.max_results || DEFAULTS.NEWS_MAX_RESULTS,
      include_answer: 'true',
      include_raw_content: false
    });
  }

  /**
   * 内容提取参数构建器
   * @param {Object} rawParams - 原始参数
   * @returns {Object} 提取请求标准化参数
   */
  function buildExtractPayload(rawParams) {
    const urlStr = String(rawParams.urls || '').trim();
    if (!urlStr) {
      throw new Error('目标 URL (urls) 不能为空。请提供要提取内容的网页地址。');
    }

    // 解析 URL 列表
    const urls = urlStr
      .split(',')
      .map(u => u.trim())
      .filter(u => /^https?:\/\/.+/i.test(u));

    if (urls.length === 0) {
      throw new Error('未检测到有效的 URL。请确保地址以 http:// 或 https:// 开头。');
    }

    if (urls.length > LIMITS.MAX_EXTRACT_URLS) {
      console.log('[TavilySearch] URL 数量超限，仅提取前 ' + LIMITS.MAX_EXTRACT_URLS + ' 个');
    }

    return {
      urls: urls.slice(0, LIMITS.MAX_EXTRACT_URLS)
    };
  }

  /**
   * 站点爬取参数构建器
   * @param {Object} rawParams - 原始参数
   * @returns {Object} 爬取请求标准化参数
   */
  function buildCrawlPayload(rawParams) {
    const url = String(rawParams.url || '').trim();
    if (!url || !/^https?:\/\/.+/i.test(url)) {
      throw new Error('爬取起始地址 (url) 无效。请提供以 http:// 或 https:// 开头的完整 URL。');
    }

    return {
      url: url,
      limit: safeNumber(rawParams.limit, DEFAULTS.CRAWL_LIMIT, LIMITS.MIN_CRAWL_LIMIT, LIMITS.MAX_CRAWL_LIMIT)
    };
  }

  /**
   * 站点地图参数构建器
   * @param {Object} rawParams - 原始参数
   * @returns {Object} 地图请求标准化参数
   */
  function buildMapPayload(rawParams) {
    const url = String(rawParams.url || '').trim();
    if (!url || !/^https?:\/\/.+/i.test(url)) {
      throw new Error('目标网站地址 (url) 无效。请提供以 http:// 或 https:// 开头的完整 URL。');
    }

    return { url: url };
  }

  // ==========================================================================
  // 第五层：结果格式化引擎
  // ==========================================================================

  /**
   * 结果呈现器对象
   * 功能：将 API 原始响应转换为结构化的 Markdown 格式文档
   */
  const Formatter = {

    /**
     * 搜索结果格式化
     * @param {Object} data - API 响应数据
     * @param {Object} params - 原始请求参数（用于展示查询元信息）
     * @returns {string} Markdown 格式的搜索报告
     */
    search: function (data, params) {
      const buffer = [];

      // 报告头
      buffer.push('## 🔍 Tavily 搜索结果\n');
      buffer.push('> **查询**: ' + (params.query || '') + '  ');
      buffer.push('> **深度**: ' + (params.search_depth || 'basic') + ' | **主题**: ' + (params.topic || 'general'));
      if (params.topic === 'news' && params.days) {
        buffer.push(' | **时效**: 近 ' + params.days + ' 天');
      }
      buffer.push('\n');

      // AI 智能总结
      if (data.answer) {
        buffer.push('### 📝 AI 智能总结\n');
        buffer.push(data.answer);
        buffer.push('\n---\n');
      }

      // 搜索结果列表
      const results = data.results || [];
      buffer.push('### 📋 搜索结果 (共 ' + results.length + ' 项)\n');

      if (results.length === 0) {
        buffer.push('未找到相关内容。建议：调整搜索关键词、切换搜索深度为 advanced、或扩大时效范围。');
      } else {
        results.forEach(function (item, index) {
          buffer.push('#### [' + (index + 1) + '] ' + (item.title || '无标题'));
          buffer.push('**来源**: ' + (item.url || ''));

          if (item.published_date) {
            buffer.push('**发布时间**: ' + item.published_date);
          }
          if (item.score !== undefined) {
            buffer.push('**相关度**: ' + (item.score * 100).toFixed(1) + '%');
          }

          buffer.push('');
          if (item.content) {
            buffer.push(truncateContent(item.content, LIMITS.MAX_CONTENT_LENGTH));
          }

          // 原始内容（如果请求了）
          if (item.raw_content) {
            buffer.push('\n<details><summary>📄 查看完整正文</summary>\n');
            buffer.push(truncateContent(item.raw_content, LIMITS.MAX_CONTENT_LENGTH));
            buffer.push('\n</details>');
          }

          buffer.push('');
        });
      }

      // 图片结果（如果有）
      if (data.images && data.images.length > 0) {
        buffer.push('### 🖼️ 相关图片\n');
        data.images.slice(0, 5).forEach(function (img, idx) {
          if (typeof img === 'string') {
            buffer.push((idx + 1) + '. ' + img);
          } else if (img.url) {
            buffer.push((idx + 1) + '. ' + (img.description || '图片') + ': ' + img.url);
          }
        });
        buffer.push('');
      }

      return truncateContent(buffer.join('\n'), LIMITS.MAX_TOTAL_OUTPUT);
    },

    /**
     * 内容提取结果格式化
     * @param {Object} data - API 响应数据
     * @returns {string} Markdown 格式的提取报告
     */
    extract: function (data) {
      const results = data.results || [];

      if (results.length === 0) {
        return '## 📄 内容提取结果\n\n提取失败：指定的 URL 无法解析或不包含有效正文。\n\n**可能原因**：\n- URL 地址无效或已失效\n- 网站设有反爬保护\n- 页面为纯 JavaScript 渲染（SPA）\n- 网站要求登录验证';
      }

      const buffer = [];
      buffer.push('## 📄 内容提取结果 (共 ' + results.length + ' 个页面)\n');

      results.forEach(function (item, index) {
        buffer.push('### [' + (index + 1) + '] ' + (item.url || '未知来源') + '\n');

        if (item.raw_content && item.raw_content.trim()) {
          buffer.push(truncateContent(item.raw_content.trim(), LIMITS.MAX_CONTENT_LENGTH));
        } else if (item.content && item.content.trim()) {
          buffer.push(truncateContent(item.content.trim(), LIMITS.MAX_CONTENT_LENGTH));
        } else {
          buffer.push('*(未提取到有效文本内容)*');
        }

        buffer.push('\n---\n');
      });

      // 失败的 URL
      if (data.failed_results && data.failed_results.length > 0) {
        buffer.push('### ⚠️ 提取失败的 URL\n');
        data.failed_results.forEach(function (item) {
          buffer.push('- ' + (item.url || '未知') + ': ' + (item.error || '未知错误'));
        });
        buffer.push('');
      }

      return truncateContent(buffer.join('\n'), LIMITS.MAX_TOTAL_OUTPUT);
    },

    /**
     * 爬取结果格式化
     * @param {Object} data - API 响应数据
     * @returns {string} Markdown 格式的爬取报告
     */
    crawl: function (data) {
      const buffer = [];
      buffer.push('## 🕸️ 站点爬取报告\n');
      buffer.push('**根地址**: ' + (data.base_url || '未知') + '\n');

      const results = data.results || [];
      buffer.push('### 已发现的页面 (共 ' + results.length + ' 个)\n');

      if (results.length === 0) {
        buffer.push('*(未发现有效内部链接。可能原因：单页应用(SPA)、robots.txt 禁止爬取、站点反爬保护)*');
      } else {
        results.forEach(function (item, index) {
          const title = item.title || '无标题';
          buffer.push('#### [' + (index + 1) + '] ' + title);
          buffer.push('**URL**: ' + (item.url || ''));

          if (item.content) {
            // 爬取结果仅展示摘要
            const snippet = item.content.length > 500
              ? item.content.substring(0, 500) + '...'
              : item.content;
            buffer.push('\n' + snippet);
          }

          if (item.raw_content) {
            buffer.push('\n<details><summary>查看完整内容</summary>\n');
            buffer.push(truncateContent(item.raw_content, LIMITS.MAX_CONTENT_LENGTH));
            buffer.push('\n</details>');
          }

          buffer.push('');
        });
      }

      return truncateContent(buffer.join('\n'), LIMITS.MAX_TOTAL_OUTPUT);
    },

    /**
     * 地图生成结果格式化
     * @param {Object} data - API 响应数据
     * @returns {string} Markdown 格式的站点地图
     */
    map: function (data) {
      const buffer = [];
      buffer.push('## 🗺️ 站点地图\n');
      buffer.push('**目标网域**: ' + (data.base_url || '未知') + '\n');

      const results = data.results || [];
      buffer.push('### URL 索引清单 (共 ' + results.length + ' 个页面)\n');

      if (results.length === 0) {
        buffer.push('*(地图生成失败。可能原因：站点禁止索引、robots.txt 限制、无有效页面)*');
      } else {
        results.forEach(function (url, index) {
          buffer.push((index + 1) + '. ' + url);
        });
      }

      return truncateContent(buffer.join('\n'), LIMITS.MAX_TOTAL_OUTPUT);
    },

    /**
     * 多关键词搜索聚合结果格式化
     * @param {Array} allResults - 各查询的结果数组
     * @param {string[]} queries - 查询词列表
     * @returns {string} Markdown 格式的聚合报告
     */
    multiSearch: function (allResults, queries) {
      const buffer = [];
      buffer.push('## 🔎 多关键词聚合搜索报告\n');
      buffer.push('> **查询词数**: ' + queries.length + ' | **执行时间**: ' + getTimestamp());
      buffer.push('\n');

      allResults.forEach(function (result, idx) {
        buffer.push('---\n');
        buffer.push('### 📌 查询 ' + (idx + 1) + ': ' + queries[idx] + '\n');

        if (result.error) {
          buffer.push('⚠️ 搜索失败: ' + result.error + '\n');
          return;
        }

        const data = result.data;

        // AI 总结
        if (data.answer) {
          buffer.push('**AI 总结**: ' + data.answer + '\n');
        }

        // 搜索结果
        const items = data.results || [];
        if (items.length === 0) {
          buffer.push('未找到相关结果。\n');
        } else {
          items.forEach(function (item, i) {
            buffer.push((i + 1) + '. **[' + (item.title || '无标题') + '](' + (item.url || '#') + ')**');
            if (item.content) {
              const snippet = item.content.length > 300
                ? item.content.substring(0, 300) + '...'
                : item.content;
              buffer.push('   ' + snippet);
            }
            buffer.push('');
          });
        }
      });

      return truncateContent(buffer.join('\n'), LIMITS.MAX_TOTAL_OUTPUT);
    },

    /**
     * 连通性测试报告格式化
     * @param {Object} report - 诊断报告数据
     * @returns {string} Markdown 格式的诊断报告
     */
    test: function (report) {
      const buffer = [];
      buffer.push('## 🩺 Tavily API 连通性诊断报告\n');
      buffer.push('> **测试时间**: ' + getTimestamp());
      buffer.push('> **网关地址**: ' + report.gateway);
      if (report.isProxy) {
        buffer.push('> **代理模式**: ✅ 已启用自定义代理');
      }
      buffer.push('\n');

      // 总体状态
      const allOk = report.results.every(function (r) { return r.success; });
      const okCount = report.results.filter(function (r) { return r.success; }).length;
      buffer.push('### 总体状态: ' + (allOk ? '✅ 全部正常' : '⚠️ 部分异常 (' + okCount + '/' + report.results.length + ' 通过)') + '\n');

      // 逐 Key 结果
      buffer.push('### 密钥检测详情\n');
      report.results.forEach(function (r, idx) {
        const keyHint = r.keyHint;
        if (r.success) {
          buffer.push((idx + 1) + '. ✅ **' + keyHint + '** — 连通正常 (延迟: ' + r.latency + 'ms)');
        } else {
          buffer.push((idx + 1) + '. ❌ **' + keyHint + '** — ' + r.error);
        }
      });

      buffer.push('\n');

      // 建议
      if (!allOk) {
        buffer.push('### 💡 故障排查建议\n');
        const hasAuthError = report.results.some(function (r) { return r.error && (r.error.includes('401') || r.error.includes('403')); });
        const hasNetError = report.results.some(function (r) { return r.error && r.error.includes('网络'); });
        const hasTimeoutError = report.results.some(function (r) { return r.error && r.error.includes('超时'); });

        if (hasAuthError) {
          buffer.push('- **密钥问题**: 请检查 TAVILY_API_KEYS 中的无效密钥，登录 https://tavily.com 确认密钥状态和配额');
        }
        if (hasNetError) {
          buffer.push('- **网络问题**: 请检查网络连接，或配置 TAVILY_PROXY_DOMAIN 使用代理域名');
        }
        if (hasTimeoutError) {
          buffer.push('- **超时问题**: 服务响应缓慢，尝试配置更快的代理域名或稍后重试');
        }
      }

      return buffer.join('\n');
    }
  };

  // ==========================================================================
  // 第六层：业务逻辑与公开接口
  // ==========================================================================

  /**
   * 统一工具执行包装器
   * 功能：统一处理异步执行、参数构建、API 调用、结果格式化及异常捕获
   * @param {string} actionName - 操作名称（用于日志和错误消息）
   * @param {Function} paramBuilder - 参数构建函数
   * @param {string} endpoint - API 端点
   * @param {Function} formatter - 结果格式化函数
   * @param {Object} rawParams - 原始参数对象
   */
  async function wrapExecution(actionName, paramBuilder, endpoint, formatter, rawParams) {
    try {
      // 1. 参数沙盒化
      const payload = paramBuilder(rawParams || {});

      // 2. 执行 API 请求
      const apiResponse = await executeApiRequest(endpoint, payload);

      // 3. 格式化输出
      const formattedOutput = formatter(apiResponse, payload);

      // 4. 成功回调
      complete({
        success: true,
        message: actionName + ' 操作执行成功',
        data: formattedOutput
      });

    } catch (error) {
      console.error('[TavilySearch] ' + actionName + ' 失败: ' + error.message);

      complete({
        success: false,
        message: actionName + ' 操作失败: ' + error.message
      });
    }
  }

  /**
   * 多关键词并发搜索核心逻辑
   * @param {Object} rawParams - 原始参数
   */
  async function multiSearchCore(rawParams) {
    try {
      // 解析查询词列表
      const queriesStr = String(rawParams.queries || '').trim();
      if (!queriesStr) {
        throw new Error('搜索查询词列表 (queries) 不能为空。请使用英文逗号分隔多个关键词。');
      }

      const queries = queriesStr
        .split(',')
        .map(function (q) { return q.trim(); })
        .filter(function (q) { return q.length > 0; });

      if (queries.length === 0) {
        throw new Error('未解析到有效的查询词。请确认格式：关键词1,关键词2,关键词3');
      }

      if (queries.length > LIMITS.MAX_MULTI_QUERIES) {
        console.log('[TavilySearch] 查询词超过上限 ' + LIMITS.MAX_MULTI_QUERIES + '，仅处理前 ' + LIMITS.MAX_MULTI_QUERIES + ' 个');
      }

      const effectiveQueries = queries.slice(0, LIMITS.MAX_MULTI_QUERIES);
      const maxPerQuery = safeNumber(rawParams.max_results_per_query, DEFAULTS.MULTI_MAX_PER_QUERY, 1, LIMITS.MAX_MULTI_PER_QUERY);
      const depth = VALID_DEPTHS.includes(String(rawParams.search_depth || '').toLowerCase())
        ? String(rawParams.search_depth).toLowerCase()
        : getDefaultDepth();
      const includeAnswer = safeBool(rawParams.include_answer, true);

      // 推送进度：开始并发搜索
      console.log('[TavilySearch] 多关键词搜索启动: ' + effectiveQueries.length + ' 个查询词并发执行...');

      // 并发执行所有查询
      const promises = effectiveQueries.map(function (query) {
        const payload = {
          query: query,
          search_depth: depth,
          topic: 'general',
          max_results: maxPerQuery,
          include_answer: includeAnswer
        };

        return executeApiRequest(API_ENDPOINTS.SEARCH, payload)
          .then(function (data) { return { data: data, error: null }; })
          .catch(function (err) { return { data: null, error: err.message }; });
      });

      // 等待所有查询完成（容错模式）
      const allResults = await Promise.all(promises);

      // 统计
      const successCount = allResults.filter(function (r) { return !r.error; }).length;
      console.log('[TavilySearch] 多关键词搜索完成: ' + successCount + '/' + effectiveQueries.length + ' 成功');

      // 格式化聚合结果
      const formattedOutput = Formatter.multiSearch(allResults, effectiveQueries);

      complete({
        success: true,
        message: '多关键词聚合搜索完成 (' + successCount + '/' + effectiveQueries.length + ' 成功)',
        data: formattedOutput
      });

    } catch (error) {
      console.error('[TavilySearch] 多关键词搜索失败: ' + error.message);
      complete({
        success: false,
        message: '多关键词搜索失败: ' + error.message
      });
    }
  }

  /**
   * API 连通性测试核心逻辑
   * 遍历所有配置的 API Key，逐一测试连通性和延迟
   */
  async function testCore() {
    try {
      const apiKeys = loadApiKeys();
      const gateway = resolveGateway();
      const targetUrl = gateway + API_ENDPOINTS.SEARCH;
      const isProxy = (getEnv('TAVILY_PROXY_DOMAIN') || '').trim() !== '';

      console.log('[TavilySearch] 开始连通性测试: ' + apiKeys.length + ' 个密钥, 网关: ' + gateway);

      const results = [];

      // 逐 Key 测试（串行，避免同时大量请求）
      for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        const keyHint = key.substring(0, 6) + '***' + key.substring(key.length - 4);

        console.log('[TavilySearch] 测试密钥 ' + (i + 1) + '/' + apiKeys.length + ': ' + keyHint);

        const startTime = Date.now();

        try {
          // 使用最简请求测试连通性
          const testPayload = {
            api_key: key,
            query: 'tavily connectivity check',
            search_depth: 'basic',
            max_results: 1,
            include_answer: false,
            include_raw_content: false
          };

          const response = await httpClient
            .newRequest()
            .url(targetUrl)
            .method('POST')
            .headers({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': USER_AGENT
            })
            .body(JSON.stringify(testPayload), 'json')
            .build()
            .execute();

          const latency = Date.now() - startTime;
          const statusCode = response.statusCode;

          if (response.isSuccessful()) {
            results.push({
              keyHint: keyHint,
              success: true,
              latency: latency,
              statusCode: statusCode
            });
          } else {
            let errorMsg = 'HTTP ' + statusCode;
            try {
              const body = JSON.parse(response.content || '{}');
              errorMsg += ': ' + (body.detail || body.message || body.error || '');
            } catch (e) { /* ignore */ }

            results.push({
              keyHint: keyHint,
              success: false,
              latency: latency,
              error: errorMsg
            });
          }
        } catch (netErr) {
          const latency = Date.now() - startTime;
          results.push({
            keyHint: keyHint,
            success: false,
            latency: latency,
            error: '网络错误: ' + netErr.message + (latency > LIMITS.TEST_TIMEOUT ? ' (可能超时)' : '')
          });
        }
      }

      // 格式化诊断报告
      const report = {
        gateway: gateway,
        isProxy: isProxy,
        results: results
      };

      const formattedOutput = Formatter.test(report);

      complete({
        success: true,
        message: 'API 连通性测试完成',
        data: formattedOutput
      });

    } catch (error) {
      console.error('[TavilySearch] 连通性测试失败: ' + error.message);
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
     * 搜索工具入口
     * 功能：执行 AI 驱动的智能网页搜索
     * 最简调用：{ query: "搜索内容" }
     * @param {Object} params - 搜索参数
     */
    search: function (params) {
      return wrapExecution(
        'search',
        buildSearchPayload,
        API_ENDPOINTS.SEARCH,
        Formatter.search,
        params
      );
    },

    /**
     * 新闻搜索工具入口
     * 功能：搜索最新新闻资讯（自动优化参数）
     * 最简调用：{ query: "新闻关键词" }
     * @param {Object} params - 新闻搜索参数
     */
    news: function (params) {
      return wrapExecution(
        'news',
        buildNewsPayload,
        API_ENDPOINTS.SEARCH,
        Formatter.search,
        params
      );
    },

    /**
     * 内容提取工具入口
     * 功能：从指定 URL 提取核心正文内容
     * 最简调用：{ urls: "https://example.com" }
     * @param {Object} params - 提取参数
     */
    extract: function (params) {
      return wrapExecution(
        'extract',
        buildExtractPayload,
        API_ENDPOINTS.EXTRACT,
        Formatter.extract,
        params
      );
    },

    /**
     * 站点爬取工具入口
     * 功能：对网站进行结构化爬取
     * 最简调用：{ url: "https://example.com" }
     * @param {Object} params - 爬取参数
     */
    crawl: function (params) {
      return wrapExecution(
        'crawl',
        buildCrawlPayload,
        API_ENDPOINTS.CRAWL,
        Formatter.crawl,
        params
      );
    },

    /**
     * 站点地图工具入口
     * 功能：生成目标网站完整 URL 地图
     * 最简调用：{ url: "https://example.com" }
     * @param {Object} params - 地图参数
     */
    map: function (params) {
      return wrapExecution(
        'map',
        buildMapPayload,
        API_ENDPOINTS.MAP,
        Formatter.map,
        params
      );
    },

    /**
     * 多关键词并发搜索入口
     * 功能：同时搜索多个查询词并聚合结果
     * 最简调用：{ queries: "关键词1,关键词2,关键词3" }
     * @param {Object} params - 多关键词搜索参数
     */
    multi_search: function (params) {
      return multiSearchCore(params);
    },

    /**
     * API 连通性测试入口
     * 功能：诊断所有密钥和网络连通性
     * 调用方式：无需参数
     */
    test: function () {
      return testCore();
    }
  };

})();

// ============================================================================
// 导出工具接口（严格匹配 METADATA 中的工具名称）
// ============================================================================

exports.search = tavilySearchToolkit.search;
exports.news = tavilySearchToolkit.news;
exports.extract = tavilySearchToolkit.extract;
exports.crawl = tavilySearchToolkit.crawl;
exports.map = tavilySearchToolkit.map;
exports.multi_search = tavilySearchToolkit.multi_search;
exports.test = tavilySearchToolkit.test;