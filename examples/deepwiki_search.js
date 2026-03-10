/* METADATA
{
    "name": "deepwiki_search",
    "version": "1.0",
    "display_name": {
        "zh": "DeepWiki 仓库文档智能助手",
        "en": "DeepWiki Repository Docs Assistant"
    },
    "description": {
        "zh": "DeepWiki 仓库文档智能助手工具包。基于 DeepWiki (deepwiki.com) 提供对 GitHub / GitLab / Bitbucket 仓库的 AI 生成文档进行检索、导航与交互式问答。核心功能包括：仓库 Wiki 概览获取、目录结构解析与章节导航、指定页面内容抓取与源码引用提取、基于 RAG 的流式对话问答、多仓库并发批量检索、深度研究模式、仓库结构树获取，以及 API 连通性诊断测试。支持自定义 DeepWiki 实例域名、可配置请求超时与重试策略、智能内容截断保护、结构化 Markdown 格式输出。所有参数均设有合理默认值，零配置即可对接公共实例。适用于开源项目学习、代码架构分析、技术文档速查、仓库 QA 等场景。",
        "en": "DeepWiki repository documentation assistant toolkit. Leverages DeepWiki (deepwiki.com) to retrieve, navigate, and interactively query AI-generated documentation for GitHub/GitLab/Bitbucket repositories. Core features include: repository wiki overview retrieval, table-of-contents parsing and section navigation, specific page content fetching with source reference extraction, RAG-based streaming conversational Q&A (full multi-turn context support), multi-repo concurrent batch retrieval, deep research mode (multi-iteration investigation), repository file tree fetching, and API connectivity diagnostics. Supports custom DeepWiki instance domains (compatible with self-hosted deepwiki-open), configurable request timeout and retry strategies (exponential backoff auto-recovery), intelligent content truncation protection, and structured Markdown formatted output. All parameters have sensible defaults for zero-config usage against the public deepwiki.com instance. Ideal for open-source project learning, code architecture analysis, technical documentation quick reference, and repository Q&A scenarios."
    },
    "env": [
        {
            "name": "DEEPWIKI_BASE_URL",
            "description": {
                "zh": "DeepWiki 实例基础 URL（可选）。默认使用公共实例 https://deepwiki.com。若部署了私有 deepwiki-open 实例，填写其地址，例如 http://localhost:3000 或 https://my-deepwiki.example.com。不需要末尾斜杠",
                "en": "DeepWiki instance base URL (optional). Defaults to public instance https://deepwiki.com. For self-hosted deepwiki-open, enter its address, e.g. http://localhost:3000 or https://my-deepwiki.example.com. No trailing slash."
            },
            "required": false
        },
        {
            "name": "DEEPWIKI_API_URL",
            "description": {
                "zh": "DeepWiki 后端 API 地址（可选）。仅在 API 与前端分离部署时需要配置，例如 http://localhost:8001。默认自动从 DEEPWIKI_BASE_URL 推断",
                "en": "DeepWiki backend API URL (optional). Only needed when API and frontend are deployed separately, e.g. http://localhost:8001. Defaults to auto-inferred from DEEPWIKI_BASE_URL."
            },
            "required": false
        },
        {
            "name": "DEEPWIKI_MAX_RETRIES",
            "description": {
                "zh": "请求失败最大重试次数（可选），范围 0-5，默认 3。设为 0 禁用重试",
                "en": "Max retry attempts on failure (optional), range 0-5. Default: 3. Set 0 to disable."
            },
            "required": false
        },
        {
            "name": "DEEPWIKI_TIMEOUT",
            "description": {
                "zh": "单次请求超时时间（可选），单位毫秒，默认 30000（30秒）。对话类请求自动使用 2 倍超时",
                "en": "Request timeout in milliseconds (optional), default 30000 (30s). Chat requests automatically use 2x timeout."
            },
            "required": false
        },
        {
            "name": "DEEPWIKI_LANGUAGE",
            "description": {
                "zh": "偏好语言（可选）：zh / en / auto。影响提示词和输出语言，默认 auto 根据系统语言自动选择",
                "en": "Preferred language (optional): zh / en / auto. Affects prompts and output language, default auto detects from system."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "get_wiki",
            "description": {
                "zh": "获取指定仓库的 DeepWiki 概览页面。自动解析仓库 URL 或 owner/repo 格式，返回仓库概述、核心架构、功能特性等 Wiki 首页内容，并附带完整目录结构供后续导航。适合快速了解一个项目的全貌。",
                "en": "Get the DeepWiki overview page for a repository. Auto-parses repo URL or owner/repo format. Returns wiki homepage content including overview, architecture, features, plus the full table of contents for navigation. Ideal for quickly understanding a project."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识，支持三种格式：1) owner/repo（如 facebook/react）2) 完整 GitHub URL（如 https://github.com/facebook/react）3) DeepWiki URL（如 https://deepwiki.com/facebook/react）",
                        "en": "Repository identifier. Three formats: 1) owner/repo (e.g. facebook/react) 2) Full GitHub URL 3) DeepWiki URL"
                    }
                },
                {
                    "name": "include_links",
                    "type": "boolean",
                    "required": false,
                    "default": true,
                    "description": {
                        "zh": "是否在结果中包含页面内可导航链接列表，默认 true",
                        "en": "Whether to include navigable link list in results, default true"
                    }
                }
            ]
        },
        {
            "name": "get_page",
            "description": {
                "zh": "获取 DeepWiki 指定章节页面的完整内容。可通过页面路径（如 '3.1-chat-completions-endpoint'）或从 get_wiki / list_pages 返回的链接索引进行导航。返回该章节的正文内容、源码引用以及可继续深入的子链接。",
                "en": "Get full content of a specific DeepWiki section page. Navigate by page path (e.g. '3.1-chat-completions-endpoint') or link index from get_wiki/list_pages results. Returns section body, source references, and further navigable links."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识（owner/repo 格式或 URL）",
                        "en": "Repository identifier (owner/repo format or URL)"
                    }
                },
                {
                    "name": "page_path",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "页面路径标识。格式如 '3-wiki-generation-process' 或 '3.1-chat-completions-endpoint'。可从 get_wiki 或 list_pages 返回的目录中获取",
                        "en": "Page path identifier, e.g. '3-wiki-generation-process'. Available from get_wiki or list_pages table of contents."
                    }
                },
                {
                    "name": "include_links",
                    "type": "boolean",
                    "required": false,
                    "default": true,
                    "description": {
                        "zh": "是否包含页面内链接列表",
                        "en": "Whether to include page links"
                    }
                }
            ]
        },
        {
            "name": "list_pages",
            "description": {
                "zh": "列出仓库 Wiki 的完整目录结构。返回所有章节标题和对应的页面路径，方便精准定位所需信息。通常在 get_wiki 之后使用，用于决定接下来应该读取哪些章节。",
                "en": "List the complete table of contents for a repo wiki. Returns all section titles and page paths for precise navigation. Typically used after get_wiki to decide which sections to read next."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识（owner/repo 格式或 URL）",
                        "en": "Repository identifier (owner/repo format or URL)"
                    }
                }
            ]
        },
        {
            "name": "chat",
            "description": {
                "zh": "与 DeepWiki 的 RAG 系统进行对话，基于仓库代码和文档回答问题。支持流式响应和多轮对话上下文。DeepWiki 会自动检索相关代码片段和文档作为回答依据，相当于与一个精通该仓库的 AI 专家对话。适合提出关于代码实现细节、架构设计决策、API 用法等具体技术问题。",
                "en": "Chat with DeepWiki's RAG system to answer questions based on repository code and docs. Supports streaming responses and multi-turn conversation context. DeepWiki auto-retrieves relevant code snippets and documentation. Like talking to an AI expert who knows the entire codebase. Ideal for questions about implementation details, architecture decisions, API usage, etc."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识（owner/repo 格式或 URL）",
                        "en": "Repository identifier (owner/repo format or URL)"
                    }
                },
                {
                    "name": "question",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "要询问的问题，使用自然语言描述。建议问题具体明确，例如：'这个项目的认证系统是如何实现的？' 或 'ToolExecutionManager 类的职责是什么？'",
                        "en": "Question to ask in natural language. Be specific, e.g. 'How is the auth system implemented?' or 'What are the responsibilities of ToolExecutionManager?'"
                    }
                },
                {
                    "name": "history",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "多轮对话历史（可选），JSON 格式的消息数组。格式：[{\"role\":\"user\",\"content\":\"...\"},{\"role\":\"assistant\",\"content\":\"...\"}]。用于维持对话上下文连续性",
                        "en": "Conversation history (optional), JSON array of messages. Format: [{\"role\":\"user\",\"content\":\"...\"},{\"role\":\"assistant\",\"content\":\"...\"}]. For maintaining dialogue context."
                    }
                },
                {
                    "name": "file_path",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "可选的文件路径聚焦（如 'src/api/server.py'），让 DeepWiki 重点关注该文件相关内容进行回答",
                        "en": "Optional file path focus (e.g. 'src/api/server.py') to make DeepWiki focus on that file's context."
                    }
                }
            ]
        },
        {
            "name": "ask",
            "description": {
                "zh": "智能问答工具，融合页面抓取与 RAG 对话的混合策略。先从 Wiki 页面中检索相关章节内容作为上下文，再结合用户问题给出精准回答。比纯 chat 模式拥有更丰富的文档上下文。适合需要综合多个章节信息回答的复杂问题。",
                "en": "Smart Q&A tool combining page scraping and RAG chat. First retrieves relevant wiki sections as context, then answers with enriched documentation. Better than pure chat for complex questions needing cross-section information."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识（owner/repo 格式或 URL）",
                        "en": "Repository identifier (owner/repo format or URL)"
                    }
                },
                {
                    "name": "question",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "要询问的问题",
                        "en": "Question to ask"
                    }
                },
                {
                    "name": "max_sections",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "最多抓取的相关章节数（1-8），默认 3。越多上下文越丰富但响应越慢",
                        "en": "Max relevant sections to fetch (1-8), default 3. More sections = richer context but slower."
                    }
                }
            ]
        },
        {
            "name": "extract_sources",
            "description": {
                "zh": "从 DeepWiki 页面中提取源码文件引用列表。返回该章节涉及的所有源码文件路径、行号范围和引用上下文。适合快速定位代码实现位置。",
                "en": "Extract source file references from a DeepWiki page. Returns all referenced source file paths, line ranges, and contexts. Ideal for quickly locating code implementations."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识",
                        "en": "Repository identifier"
                    }
                },
                {
                    "name": "page_path",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "页面路径（可选），不填则从概览页提取",
                        "en": "Page path (optional), defaults to overview page"
                    }
                }
            ]
        },
        {
            "name": "get_repo_structure",
            "description": {
                "zh": "获取仓库的文件目录结构树。通过 DeepWiki 解析仓库的完整文件树，返回项目目录层级结构。适合了解项目文件组织方式。",
                "en": "Get repository file directory tree. Parses the full file tree via DeepWiki. Ideal for understanding project file organization."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识",
                        "en": "Repository identifier"
                    }
                }
            ]
        },
        {
            "name": "batch_get",
            "description": {
                "zh": "批量获取多个仓库的 Wiki 概览或同一仓库的多个章节。支持并发请求，高效率一次性收集多源信息。输入为逗号分隔的目标列表。",
                "en": "Batch fetch wiki overviews for multiple repos or multiple sections of one repo. Concurrent requests for efficient multi-source collection. Input is comma-separated target list."
            },
            "parameters": [
                {
                    "name": "targets",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "批量目标列表，逗号分隔。支持两种模式：1) 多仓库概览：'facebook/react,vuejs/vue,angular/angular' 2) 单仓库多页面：'owner/repo:page1,owner/repo:page2'",
                        "en": "Batch target list, comma-separated. Two modes: 1) Multi-repo overview: 'facebook/react,vuejs/vue' 2) Single-repo multi-page: 'owner/repo:page1,owner/repo:page2'"
                    }
                },
                {
                    "name": "concurrency",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "并发请求数（1-5），默认 3",
                        "en": "Concurrent request count (1-5), default 3"
                    }
                }
            ]
        },
        {
            "name": "deep_research",
            "description": {
                "zh": "深度研究模式。对仓库的某个主题进行多轮迭代调研，自动规划研究路径、逐步收集信息并最终汇总为结构化研究报告。适合复杂的技术分析任务，例如：'分析该项目的插件系统设计模式' 或 '梳理数据流从前端到后端的完整链路'。",
                "en": "Deep research mode. Multi-iteration investigation on a repo topic. Auto-plans research path, progressively collects info, and produces a structured research report. Ideal for complex technical analysis like 'Analyze the plugin system design patterns' or 'Trace the complete data flow from frontend to backend'."
            },
            "parameters": [
                {
                    "name": "repo",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "仓库标识",
                        "en": "Repository identifier"
                    }
                },
                {
                    "name": "topic",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "研究主题，描述你想要深入了解的内容",
                        "en": "Research topic describing what you want to investigate"
                    }
                },
                {
                    "name": "max_iterations",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "最大研究迭代次数（1-5），默认 3。每次迭代会抓取新的相关页面扩展上下文",
                        "en": "Max research iterations (1-5), default 3. Each iteration fetches new relevant pages."
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 DeepWiki 实例的连通性和可用性。检测网页访问、API 端点响应、延迟等指标，输出诊断报告。",
                "en": "Test DeepWiki instance connectivity and availability. Checks page access, API endpoint response, latency. Outputs diagnostic report."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：DeepWiki 仓库文档智能助手 (DeepWiki Repository Docs Assistant)
 * ------------------------------------------------------------------------------
 * 功能详述：
 * 1. Wiki 页面访问与解析：抓取 DeepWiki 生成的仓库文档，提取正文与结构
 * 2. 目录导航系统：解析多级目录树，支持章节级精准跳转
 * 3. RAG 对话引擎：通过 DeepWiki 的 chat API 实现基于代码库的智能问答
 * 4. 源码引用提取：从文档页面中识别并结构化所有源码文件引用
 * 5. 批量检索引擎：并发获取多仓库或多章节内容
 * 6. 深度研究模式：多轮迭代调研，自动扩展上下文
 * 7. 仓库结构分析：获取文件目录树
 *
 * 技术特性：
 * - 指数退避重试（网络异常自动恢复）
 * - 智能内容截断保护（防止超长输出）
 * - SSE 流式响应解析（对话模式）
 * - 并发控制（批量请求限流）
 * - 结构化 Markdown 输出
 * - 支持自定义 DeepWiki 实例（兼容 deepwiki-open 私有部署）
 *
 * 版本：v1.0
 * 语言：JavaScript (ES8+)
 * ==============================================================================
 */

const deepwikiSearchToolkit = (function () {

  // ==========================================================================
  // 常量定义
  // ==========================================================================

  const VERSION = '1.0';
  const TOOLKIT_TAG = '[DeepWiki]';

  const DEFAULT_BASE_URL = 'https://deepwiki.com';
  const DEFAULT_TIMEOUT = 30000;
  const DEFAULT_MAX_RETRIES = 3;
  const DEFAULT_LANGUAGE = 'auto';

  const MAX_CONTENT_LENGTH = 24000;
  const MAX_SECTION_CONTENT = 8000;
  const MAX_CHAT_RESPONSE = 16000;
  const MAX_BATCH_CONCURRENCY = 5;
  const MAX_RESEARCH_ITERATIONS = 5;
  const MAX_RESEARCH_SECTIONS = 8;

  const RETRY_BASE_DELAY = 1000;
  const RETRY_MAX_DELAY = 16000;
  const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

  const USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Operit) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 DeepWikiToolkit/' + VERSION;

  const REPO_URL_PATTERNS = {
    DEEPWIKI: /^https?:\/\/(?:www\.)?deepwiki\.com\/([^/]+\/[^/]+)/i,
    GITHUB: /^https?:\/\/(?:www\.)?github\.com\/([^/]+\/[^/]+)/i,
    GITLAB: /^https?:\/\/(?:www\.)?gitlab\.com\/([^/]+\/[^/]+)/i,
    BITBUCKET: /^https?:\/\/(?:www\.)?bitbucket\.org\/([^/]+\/[^/]+)/i,
    OWNER_REPO: /^([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/
  };

  const SOURCE_REF_PATTERNS = [
    /Sources?:\s*([^\n]+)/gi,
    /(?:File|文件)(?:Ref)?[^:]*:\s*([^\n]+)/gi,
    /([a-zA-Z0-9_/.-]+\.[a-zA-Z]{1,6})(?::(\d+)(?:-(\d+))?)?/g
  ];

  // ==========================================================================
  // 配置管理器
  // ==========================================================================

  const Config = {
    _cache: null,

    load: function () {
      if (this._cache) return this._cache;

      const rawBaseUrl = getEnv('DEEPWIKI_BASE_URL');
      const rawApiUrl = getEnv('DEEPWIKI_API_URL');
      const rawRetries = getEnv('DEEPWIKI_MAX_RETRIES');
      const rawTimeout = getEnv('DEEPWIKI_TIMEOUT');
      const rawLanguage = getEnv('DEEPWIKI_LANGUAGE');

      let baseUrl = DEFAULT_BASE_URL;
      if (rawBaseUrl && rawBaseUrl.trim()) {
        baseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
        if (!/^https?:\/\//i.test(baseUrl)) {
          baseUrl = 'https://' + baseUrl;
        }
      }

      let apiUrl = rawApiUrl ? rawApiUrl.trim().replace(/\/+$/, '') : null;
      if (apiUrl && !/^https?:\/\//i.test(apiUrl)) {
        apiUrl = 'https://' + apiUrl;
      }

      let maxRetries = DEFAULT_MAX_RETRIES;
      if (rawRetries !== null && rawRetries !== undefined) {
        const parsed = parseInt(rawRetries, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
          maxRetries = parsed;
        }
      }

      let timeout = DEFAULT_TIMEOUT;
      if (rawTimeout !== null && rawTimeout !== undefined) {
        const parsed = parseInt(rawTimeout, 10);
        if (!isNaN(parsed) && parsed >= 5000 && parsed <= 120000) {
          timeout = parsed;
        }
      }

      let language = DEFAULT_LANGUAGE;
      if (rawLanguage && ['zh', 'en', 'auto'].indexOf(rawLanguage.trim().toLowerCase()) !== -1) {
        language = rawLanguage.trim().toLowerCase();
      }

      this._cache = {
        baseUrl: baseUrl,
        apiUrl: apiUrl,
        maxRetries: maxRetries,
        timeout: timeout,
        language: language
      };

      return this._cache;
    },

    getBaseUrl: function () {
      return this.load().baseUrl;
    },

    getApiUrl: function () {
      var cfg = this.load();
      return cfg.apiUrl || cfg.baseUrl;
    },

    getMaxRetries: function () {
      return this.load().maxRetries;
    },

    getTimeout: function () {
      return this.load().timeout;
    },

    getLang: function () {
      var cfg = this.load();
      if (cfg.language === 'auto') {
        var sysLang = '';
        try { sysLang = (getLang() || '').toLowerCase(); } catch (e) { /* ignore */ }
        return sysLang.startsWith('zh') ? 'zh' : 'en';
      }
      return cfg.language;
    },

    isPublicInstance: function () {
      return this.getBaseUrl() === DEFAULT_BASE_URL;
    }
  };

  // ==========================================================================
  // 工具函数层
  // ==========================================================================

  var Utils = {
    parseRepoIdentifier: function (input) {
      if (!input || typeof input !== 'string') return null;
      var trimmed = input.trim().replace(/\/+$/, '');

      for (var key in REPO_URL_PATTERNS) {
        var match = trimmed.match(REPO_URL_PATTERNS[key]);
        if (match && match[1]) {
          var slug = match[1].replace(/\.git$/, '');
          var parts = slug.split('/');
          if (parts.length >= 2) {
            return {
              owner: parts[0],
              repo: parts[1],
              slug: parts[0] + '/' + parts[1]
            };
          }
        }
      }
      return null;
    },

    buildWikiUrl: function (repoSlug, pagePath) {
      var base = Config.getBaseUrl();
      var url = base + '/' + repoSlug;
      if (pagePath) {
        url += '/' + pagePath.replace(/^\/+/, '');
      }
      return url;
    },

    buildChatEndpoints: function () {
      var baseUrl = Config.getBaseUrl();
      var apiUrl = Config.getApiUrl();
      var endpoints = [];

      if (Config.isPublicInstance()) {
        endpoints.push(baseUrl + '/api/chat/stream');
        endpoints.push(baseUrl + '/chat/completions/stream');
      } else {
        if (apiUrl !== baseUrl) {
          endpoints.push(apiUrl + '/chat/completions/stream');
        }
        endpoints.push(baseUrl + '/chat/completions/stream');
        endpoints.push(baseUrl + '/api/chat/stream');
      }

      return endpoints;
    },

    buildRepoApiUrl: function (endpoint) {
      var apiBase = Config.getApiUrl();
      return apiBase + '/api/' + endpoint;
    },

    truncateContent: function (content, maxLen) {
      if (!content) return '';
      maxLen = maxLen || MAX_CONTENT_LENGTH;
      if (content.length <= maxLen) return content;

      var halfLen = Math.floor(maxLen / 2) - 50;
      var head = content.substring(0, halfLen);
      var tail = content.substring(content.length - halfLen);
      var truncatedCount = content.length - halfLen * 2;

      return head + '\n\n... [已截断 ' + truncatedCount + ' 个字符 / ' + truncatedCount + ' chars truncated] ...\n\n' + tail;
    },

    sanitizeContent: function (raw) {
      if (!raw) return '';
      return raw
        .replace(/\x00/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]+$/gm, '')
        .trim();
    },

    unHtml: function (s) {
      if (!s) return '';
      return s
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&#10;/g, '\n')
        .replace(/&#13;/g, '\r')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    },

    extractPageLinks: function (content, links) {
      var sections = [];
      if (!links || !Array.isArray(links)) return sections;

      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (!link || !link.text) continue;

        var text = (link.text || '').trim();
        var href = (link.url || link.href || '').trim();

        if (!text || text.length < 2) continue;
        if (/^(sign|log|menu|nav|foot|head|skip|toggle|cancel|submit|dismiss)/i.test(text)) continue;
        if (/\.(png|jpg|gif|svg|css|js)$/i.test(href)) continue;

        sections.push({
          title: text,
          url: href,
          path: this.extractPagePath(href)
        });
      }

      return sections;
    },

    extractPagePath: function (url) {
      if (!url) return '';
      var match = url.match(/deepwiki\.com\/[^/]+\/[^/]+\/(.+)/i);
      if (match) return match[1].replace(/^\/+|\/+$/g, '');

      var deepMatch = url.match(/\/([^/]+\/[^/]+)\/(.+)/);
      if (deepMatch) return deepMatch[2].replace(/^\/+|\/+$/g, '');

      return '';
    },

    extractSourceReferences: function (content) {
      if (!content) return [];
      var refs = [];
      var seen = {};

      var sourceBlockRegex = /Sources?:\s*([^\n]+)/gi;
      var match;
      while ((match = sourceBlockRegex.exec(content)) !== null) {
        var line = match[1];
        var fileRegex = /([a-zA-Z0-9_/.-]+\.[a-zA-Z]{1,6})(?::?(\d+))?(?:-(\d+))?/g;
        var fileMatch;
        while ((fileMatch = fileRegex.exec(line)) !== null) {
          var filePath = fileMatch[1];
          var startLine = fileMatch[2] ? parseInt(fileMatch[2], 10) : null;
          var endLine = fileMatch[3] ? parseInt(fileMatch[3], 10) : null;

          if (/^(http|www|ftp|mailto)/i.test(filePath)) continue;
          if (/\.(com|org|net|io|dev)$/i.test(filePath)) continue;

          var key = filePath + ':' + (startLine || 0) + '-' + (endLine || 0);
          if (seen[key]) continue;
          seen[key] = true;

          refs.push({
            file: filePath,
            startLine: startLine,
            endLine: endLine,
            range: startLine ? (endLine ? startLine + '-' + endLine : '' + startLine) : null
          });
        }
      }

      return refs;
    },

    extractTocFromContent: function (content) {
      if (!content) return [];
      var toc = [];
      var lines = content.split('\n');
      var inTocBlock = false;

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        if (/^(#{1,4})\s+(.+)/.test(line)) {
          var headMatch = line.match(/^(#{1,4})\s+(.+)/);
          if (headMatch) {
            toc.push({
              level: headMatch[1].length,
              title: headMatch[2].trim(),
              index: toc.length
            });
          }
        }

        if (/overview|table of contents|目录|menu/i.test(line)) {
          inTocBlock = true;
          continue;
        }

        if (inTocBlock) {
          var linkMatch = line.match(/[-*·•]\s*\[?([^\]]+)\]?\s*(?:\(([^)]+)\))?/);
          if (linkMatch) {
            toc.push({
              level: 2,
              title: linkMatch[1].trim(),
              path: linkMatch[2] ? this.extractPagePath(linkMatch[2]) : '',
              index: toc.length
            });
          }
          if (line === '' && toc.length > 3) {
            inTocBlock = false;
          }
        }
      }

      return toc;
    },

    buildRepoUrl: function (slug) {
      return 'https://github.com/' + slug;
    },

    sleep: function (ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    },

    calcRetryDelay: function (attempt) {
      var delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
      delay = Math.min(delay, RETRY_MAX_DELAY);
      var jitter = Math.random() * delay * 0.3;
      return Math.floor(delay + jitter);
    },

    safeJsonParse: function (raw) {
      if (!raw) return null;
      try {
        var s = raw.trim();
        if (/^[a-zA-Z_$][\w$]*\s*\(/.test(s)) {
          s = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')'));
        }
        return JSON.parse(s);
      } catch (e) {
        return null;
      }
    },

    parseHistoryMessages: function (raw) {
      if (!raw) return [];
      if (typeof raw === 'string') {
        var parsed = this.safeJsonParse(raw);
        if (Array.isArray(parsed)) return parsed;
        return [];
      }
      if (Array.isArray(raw)) return raw;
      return [];
    },

    maskSensitive: function (str) {
      if (!str || str.length < 8) return '***';
      return str.substring(0, 4) + '***' + str.substring(str.length - 4);
    },

    matchSectionsToQuery: function (sections, query) {
      if (!sections || !sections.length || !query) return sections || [];

      var queryLower = query.toLowerCase();
      var keywords = queryLower.split(/[\s,;，；、]+/).filter(function (w) { return w.length > 1; });

      var scored = sections.map(function (sec) {
        var titleLower = (sec.title || '').toLowerCase();
        var pathLower = (sec.path || '').toLowerCase();
        var score = 0;

        for (var i = 0; i < keywords.length; i++) {
          var kw = keywords[i];
          if (titleLower.indexOf(kw) !== -1) score += 3;
          if (pathLower.indexOf(kw) !== -1) score += 2;
        }

        if (/overview|概览|总览|architecture|架构/i.test(titleLower)) score += 1;

        return { section: sec, score: score };
      });

      scored.sort(function (a, b) { return b.score - a.score; });

      return scored.map(function (item) { return item.section; });
    },

    formatTimestamp: function () {
      var d = new Date();
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    }
  };

  // ==========================================================================
  // HTTP 客户端层
  // ==========================================================================

  var HttpClient = {
    _client: null,

    getClient: function () {
      if (!this._client) {
        this._client = OkHttp.newClient();
      }
      return this._client;
    },

    fetchPage: async function (url, options) {
      options = options || {};
      var maxRetries = options.retries !== undefined ? options.retries : Config.getMaxRetries();
      var timeout = options.timeout || Config.getTimeout();
      var lastError = null;

      for (var attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          var delay = Utils.calcRetryDelay(attempt - 1);
          console.log(TOOLKIT_TAG + ' 重试 ' + attempt + '/' + maxRetries + '，等待 ' + delay + 'ms');
          await Utils.sleep(delay);
        }

        try {
          var result = await Tools.Net.visit({
            url: url,
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
          });

          if (!result) {
            lastError = new Error('Tools.Net.visit 返回空结果');
            continue;
          }

          var content = '';
          var links = [];
          var title = '';
          var visitKey = null;

          if (typeof result === 'string') {
            content = result;
          } else if (typeof result === 'object') {
            content = result.content || result.text || '';
            links = result.links || [];
            title = result.title || '';
            visitKey = result.visitKey || result.visit_key || null;
          }

          content = Utils.sanitizeContent(content);

          if (content.length < 50 && attempt < maxRetries) {
            lastError = new Error('页面内容过短（' + content.length + ' 字符），可能加载不完整');
            continue;
          }

          return {
            success: true,
            url: url,
            title: title,
            content: content,
            links: links,
            visitKey: visitKey
          };

        } catch (err) {
          lastError = err;
          console.error(TOOLKIT_TAG + ' 请求失败 [' + attempt + ']: ' + err.message);

          if (err.message && /timeout|ETIMEDOUT/i.test(err.message) && attempt < maxRetries) {
            continue;
          }
          if (attempt >= maxRetries) break;
        }
      }

      return {
        success: false,
        url: url,
        error: lastError ? lastError.message : '未知错误',
        content: '',
        links: [],
        title: ''
      };
    },

    postJson: async function (url, payload, options) {
      options = options || {};
      var maxRetries = options.retries !== undefined ? options.retries : Config.getMaxRetries();
      var timeout = options.timeout || Config.getTimeout();
      var lastError = null;

      for (var attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          var delay = Utils.calcRetryDelay(attempt - 1);
          console.log(TOOLKIT_TAG + ' API 重试 ' + attempt + '/' + maxRetries);
          await Utils.sleep(delay);
        }

        try {
          var response = await this.getClient()
            .newRequest()
            .url(url)
            .method('POST')
            .headers({
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream, application/json, text/plain, */*',
              'User-Agent': USER_AGENT,
              'Origin': Config.getBaseUrl(),
              'Referer': Config.getBaseUrl() + '/'
            })
            .body(JSON.stringify(payload), 'json')
            .build()
            .execute();

          var statusCode = response.statusCode;
          var body = response.content || '';

          var isOk = typeof response.isSuccessful === 'function'
            ? response.isSuccessful()
            : (statusCode >= 200 && statusCode < 300);

          if (isOk) {
            var contentType = '';
            if (response.headers) {
              contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
            }

            return {
              success: true,
              statusCode: statusCode,
              body: body,
              contentType: contentType,
              isStream: contentType.indexOf('text/event-stream') !== -1
                || contentType.indexOf('text/plain') !== -1
                || contentType.indexOf('application/octet-stream') !== -1
            };
          }

          if (RETRYABLE_STATUS_CODES.indexOf(statusCode) !== -1 && attempt < maxRetries) {
            lastError = new Error('HTTP ' + statusCode);
            continue;
          }

          return {
            success: false,
            statusCode: statusCode,
            error: 'HTTP ' + statusCode + ': ' + body.substring(0, 500)
          };

        } catch (err) {
          lastError = err;
          console.error(TOOLKIT_TAG + ' POST 失败 [' + attempt + ']: ' + err.message);
          if (attempt >= maxRetries) break;
        }
      }

      return {
        success: false,
        error: lastError ? lastError.message : '未知错误'
      };
    },

    getJson: async function (url, options) {
      options = options || {};
      var maxRetries = options.retries !== undefined ? options.retries : Config.getMaxRetries();
      var lastError = null;

      for (var attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          var delay = Utils.calcRetryDelay(attempt - 1);
          await Utils.sleep(delay);
        }

        try {
          var response = await this.getClient()
            .newRequest()
            .url(url)
            .method('GET')
            .headers({
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': USER_AGENT
            })
            .build()
            .execute();

          var isOk = typeof response.isSuccessful === 'function'
            ? response.isSuccessful()
            : (response.statusCode >= 200 && response.statusCode < 300);

          if (isOk) {
            return {
              success: true,
              statusCode: response.statusCode,
              data: Utils.safeJsonParse(response.content || '{}')
            };
          }

          if (RETRYABLE_STATUS_CODES.indexOf(response.statusCode) !== -1 && attempt < maxRetries) {
            lastError = new Error('HTTP ' + response.statusCode);
            continue;
          }

          return {
            success: false,
            statusCode: response.statusCode,
            error: 'HTTP ' + response.statusCode
          };

        } catch (err) {
          lastError = err;
          if (attempt >= maxRetries) break;
        }
      }

      return { success: false, error: lastError ? lastError.message : '未知错误' };
    }
  };

  // ==========================================================================
  // SSE 流式响应解析器
  // ==========================================================================

  var StreamParser = {
    parseResponse: function (body, contentType) {
      if (!body) return '';

      if (body.indexOf('data: ') !== -1) {
        return this.parseSSEResponse(body);
      }

      var jsonBody = Utils.safeJsonParse(body);
      if (jsonBody) {
        var extracted = this.extractTextFromChunk(jsonBody);
        if (extracted && extracted.length > 5) return extracted;
      }

      return Utils.sanitizeContent(body);
    },

    parseSSEResponse: function (body) {
      if (!body) return '';
      var lines = body.split('\n');
      var chunks = [];

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        if (line.startsWith('data: ')) {
          var data = line.substring(6);

          if (data === '[DONE]') break;

          var parsed = Utils.safeJsonParse(data);
          if (parsed) {
            var text = this.extractTextFromChunk(parsed);
            if (text) chunks.push(text);
          } else {
            if (data.length > 0 && data !== 'undefined' && data !== 'null') {
              chunks.push(data);
            }
          }
        } else if (line.length > 0 && !line.startsWith('event:') && !line.startsWith('id:') && !line.startsWith(':')) {
          var plainParsed = Utils.safeJsonParse(line);
          if (plainParsed) {
            var plainText = this.extractTextFromChunk(plainParsed);
            if (plainText) chunks.push(plainText);
          } else if (line.length > 2) {
            chunks.push(line);
          }
        }
      }

      return chunks.join('');
    },

    extractTextFromChunk: function (chunk) {
      if (!chunk) return '';

      if (chunk.choices && chunk.choices[0]) {
        var choice = chunk.choices[0];
        if (choice.delta && choice.delta.content) {
          return choice.delta.content;
        }
        if (choice.message && choice.message.content) {
          return choice.message.content;
        }
        if (choice.text) {
          return choice.text;
        }
      }

      if (chunk.content) {
        if (typeof chunk.content === 'string') return chunk.content;
        if (Array.isArray(chunk.content)) {
          return chunk.content
            .filter(function (c) { return c.type === 'text'; })
            .map(function (c) { return c.text || ''; })
            .join('');
        }
      }

      if (chunk.text) return chunk.text;
      if (chunk.response) return chunk.response;
      if (chunk.answer) return chunk.answer;
      if (chunk.message && typeof chunk.message === 'string') return chunk.message;

      return '';
    }
  };

  // ==========================================================================
  // Chat API 客户端 — 多端点策略
  // ==========================================================================

  var ChatClient = {
    callChatApi: async function (repoSlug, messages, filePath) {
      var repoUrl = Utils.buildRepoUrl(repoSlug);
      var endpoints = Utils.buildChatEndpoints();

      var payload = {
        repo_url: repoUrl,
        messages: messages
      };

      if (filePath) {
        payload.filePath = filePath;
      }

      var lastError = null;

      for (var i = 0; i < endpoints.length; i++) {
        var endpoint = endpoints[i];
        console.log(TOOLKIT_TAG + ' [chat] 尝试端点 [' + (i + 1) + '/' + endpoints.length + ']: ' + endpoint);

        try {
          var response = await HttpClient.postJson(endpoint, payload, {
            timeout: Config.getTimeout() * 2,
            retries: 1
          });

          if (!response.success) {
            console.log(TOOLKIT_TAG + ' [chat] 端点失败: HTTP ' + (response.statusCode || '?'));
            lastError = new Error('HTTP ' + (response.statusCode || '?') + ' from ' + endpoint);
            continue;
          }

          var answer = StreamParser.parseResponse(response.body, response.contentType || '');

          if (answer && answer.length >= 10) {
            answer = Utils.sanitizeContent(answer);
            console.log(TOOLKIT_TAG + ' [chat] 成功! 响应长度: ' + answer.length);
            return {
              success: true,
              answer: answer,
              endpoint: endpoint
            };
          }

          console.log(TOOLKIT_TAG + ' [chat] 端点返回内容过短 (' + (answer || '').length + ' 字符)');
          lastError = new Error('响应内容不足');

        } catch (err) {
          console.error(TOOLKIT_TAG + ' [chat] 端点异常: ' + err.message);
          lastError = err;
        }
      }

      return {
        success: false,
        error: lastError ? lastError.message : '所有 Chat API 端点均不可用'
      };
    }
  };

  // ==========================================================================
  // 格式化输出器
  // ==========================================================================

  var Formatter = {
    wikiOverview: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'DeepWiki 仓库概览' : 'DeepWiki Repository Overview'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('**' + (lang === 'zh' ? '来源' : 'Source') + '**: ' + data.url);

      if (data.title) {
        lines.push('**' + (lang === 'zh' ? '标题' : 'Title') + '**: ' + data.title);
      }

      lines.push('');

      if (data.toc && data.toc.length > 0) {
        lines.push('### ' + (lang === 'zh' ? '目录结构' : 'Table of Contents'));
        lines.push('');
        for (var i = 0; i < data.toc.length; i++) {
          var entry = data.toc[i];
          var indent = '  '.repeat(Math.max(0, (entry.level || 1) - 1));
          var pathHint = entry.path ? ' (`' + entry.path + '`)' : '';
          lines.push(indent + (i + 1) + '. ' + entry.title + pathHint);
        }
        lines.push('');
      }

      if (data.sections && data.sections.length > 0) {
        lines.push('### ' + (lang === 'zh' ? '可导航章节' : 'Navigable Sections'));
        lines.push('');
        for (var j = 0; j < Math.min(data.sections.length, 30); j++) {
          var sec = data.sections[j];
          lines.push('[' + (j + 1) + '] ' + sec.title + (sec.path ? ' → `' + sec.path + '`' : ''));
        }
        lines.push('');
      }

      if (data.content) {
        lines.push('### ' + (lang === 'zh' ? '页面内容' : 'Page Content'));
        lines.push('');
        lines.push(Utils.truncateContent(data.content, MAX_CONTENT_LENGTH));
      }

      return lines.join('\n');
    },

    pageContent: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? '章节内容' : 'Section Content'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('**' + (lang === 'zh' ? '页面' : 'Page') + '**: `' + data.pagePath + '`');
      lines.push('**URL**: ' + data.url);
      lines.push('');

      if (data.sourceRefs && data.sourceRefs.length > 0) {
        lines.push('### ' + (lang === 'zh' ? '源码引用' : 'Source References'));
        lines.push('');
        for (var i = 0; i < data.sourceRefs.length; i++) {
          var ref = data.sourceRefs[i];
          lines.push('- `' + ref.file + '`' + (ref.range ? ' (L' + ref.range + ')' : ''));
        }
        lines.push('');
      }

      if (data.sections && data.sections.length > 0) {
        lines.push('### ' + (lang === 'zh' ? '子章节链接' : 'Sub-section Links'));
        lines.push('');
        for (var j = 0; j < data.sections.length; j++) {
          var sec = data.sections[j];
          lines.push('[' + (j + 1) + '] ' + sec.title + (sec.path ? ' → `' + sec.path + '`' : ''));
        }
        lines.push('');
      }

      if (data.content) {
        lines.push('### ' + (lang === 'zh' ? '正文' : 'Body'));
        lines.push('');
        lines.push(Utils.truncateContent(data.content, MAX_CONTENT_LENGTH));
      }

      return lines.join('\n');
    },

    tocList: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'Wiki 目录结构' : 'Wiki Table of Contents'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('');

      if (data.sections && data.sections.length > 0) {
        for (var i = 0; i < data.sections.length; i++) {
          var sec = data.sections[i];
          var idx = String(i + 1).padStart(2, ' ');
          lines.push(idx + '. **' + sec.title + '**');
          if (sec.path) {
            lines.push('    ' + (lang === 'zh' ? '路径' : 'Path') + ': `' + sec.path + '`');
          }
          if (sec.url) {
            lines.push('    URL: ' + sec.url);
          }
        }
      } else {
        lines.push('_' + (lang === 'zh' ? '未找到目录信息，请尝试使用 get_wiki 获取概览' : 'No TOC found, try get_wiki for overview') + '_');
      }

      return lines.join('\n');
    },

    chatResponse: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'DeepWiki 问答' : 'DeepWiki Q&A'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('**' + (lang === 'zh' ? '问题' : 'Question') + '**: ' + data.question);
      if (data.mode) {
        lines.push('**' + (lang === 'zh' ? '模式' : 'Mode') + '**: ' + data.mode);
      }
      lines.push('');

      if (data.answer) {
        lines.push('### ' + (lang === 'zh' ? '回答' : 'Answer'));
        lines.push('');
        lines.push(Utils.truncateContent(data.answer, MAX_CHAT_RESPONSE));
      } else if (data.error) {
        lines.push('### ' + (lang === 'zh' ? '错误' : 'Error'));
        lines.push('');
        lines.push(data.error);
      }

      if (data.sourceRefs && data.sourceRefs.length > 0) {
        lines.push('');
        lines.push('### ' + (lang === 'zh' ? '引用源码' : 'Referenced Sources'));
        for (var i = 0; i < data.sourceRefs.length; i++) {
          var ref = data.sourceRefs[i];
          lines.push('- `' + ref.file + '`' + (ref.range ? ' (L' + ref.range + ')' : ''));
        }
      }

      return lines.join('\n');
    },

    askResponse: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'DeepWiki 智能问答' : 'DeepWiki Smart Q&A'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repo') + '**: `' + data.repoSlug + '`');
      lines.push('**' + (lang === 'zh' ? '问题' : 'Question') + '**: ' + data.question);
      lines.push('');

      if (data.consultedSections && data.consultedSections.length > 0) {
        lines.push('### ' + (lang === 'zh' ? '参考章节' : 'Referenced Sections'));
        for (var i = 0; i < data.consultedSections.length; i++) {
          lines.push('- ' + data.consultedSections[i]);
        }
        lines.push('');
      }

      if (data.chatAnswer) {
        lines.push('### ' + (lang === 'zh' ? '基于 RAG 的回答' : 'RAG-based Answer'));
        lines.push('');
        lines.push(Utils.truncateContent(data.chatAnswer, MAX_CHAT_RESPONSE));
        lines.push('');
      }

      if (data.contextSummary) {
        lines.push('### ' + (lang === 'zh' ? '文档上下文摘要' : 'Documentation Context Summary'));
        lines.push('');
        lines.push(Utils.truncateContent(data.contextSummary, MAX_SECTION_CONTENT));
      }

      if (data.allSourceRefs && data.allSourceRefs.length > 0) {
        lines.push('');
        lines.push('### ' + (lang === 'zh' ? '涉及的源码文件' : 'Related Source Files'));
        var shown = {};
        for (var j = 0; j < data.allSourceRefs.length; j++) {
          var ref = data.allSourceRefs[j];
          if (!shown[ref.file]) {
            lines.push('- `' + ref.file + '`' + (ref.range ? ' (L' + ref.range + ')' : ''));
            shown[ref.file] = true;
          }
        }
      }

      return lines.join('\n');
    },

    sourceList: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? '源码引用列表' : 'Source References'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      if (data.pagePath) {
        lines.push('**' + (lang === 'zh' ? '页面' : 'Page') + '**: `' + data.pagePath + '`');
      }
      lines.push('');

      if (data.refs && data.refs.length > 0) {
        var grouped = {};
        for (var i = 0; i < data.refs.length; i++) {
          var ref = data.refs[i];
          if (!grouped[ref.file]) grouped[ref.file] = [];
          if (ref.range) grouped[ref.file].push('L' + ref.range);
        }

        var files = Object.keys(grouped);
        lines.push(lang === 'zh' ? '共引用 **' + files.length + '** 个文件：' : '**' + files.length + '** files referenced:');
        lines.push('');

        for (var j = 0; j < files.length; j++) {
          var file = files[j];
          var ranges = grouped[file];
          lines.push('- `' + file + '`' + (ranges.length > 0 ? '  →  ' + ranges.join(', ') : ''));
        }
      } else {
        lines.push('_' + (lang === 'zh' ? '未发现源码引用' : 'No source references found') + '_');
      }

      return lines.join('\n');
    },

    batchResult: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? '批量检索结果' : 'Batch Retrieval Results'));
      lines.push('');
      lines.push((lang === 'zh' ? '共 ' : 'Total ') + data.total + (lang === 'zh' ? ' 个目标，成功 ' : ' targets, ') + data.succeeded + (lang === 'zh' ? ' 个，失败 ' : ' succeeded, ') + data.failed + (lang === 'zh' ? ' 个' : ' failed'));
      lines.push('');

      for (var i = 0; i < data.results.length; i++) {
        var item = data.results[i];
        lines.push('---');
        lines.push('### [' + (i + 1) + '] ' + item.target);
        lines.push('');

        if (item.success) {
          lines.push(Utils.truncateContent(item.content, Math.floor(MAX_CONTENT_LENGTH / Math.max(data.total, 1))));
        } else {
          lines.push('**' + (lang === 'zh' ? '错误' : 'Error') + '**: ' + item.error);
        }
        lines.push('');
      }

      return lines.join('\n');
    },

    deepResearch: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'DeepWiki 深度研究报告' : 'DeepWiki Deep Research Report'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('**' + (lang === 'zh' ? '研究主题' : 'Research Topic') + '**: ' + data.topic);
      lines.push('**' + (lang === 'zh' ? '迭代次数' : 'Iterations') + '**: ' + data.iterations);
      lines.push('**' + (lang === 'zh' ? '检索页面数' : 'Pages Fetched') + '**: ' + data.pagesFetched);
      lines.push('');

      if (data.phases && data.phases.length > 0) {
        for (var i = 0; i < data.phases.length; i++) {
          var phase = data.phases[i];
          lines.push('### ' + (lang === 'zh' ? '阶段 ' : 'Phase ') + (i + 1) + ': ' + phase.title);
          lines.push('');
          if (phase.sections && phase.sections.length > 0) {
            lines.push((lang === 'zh' ? '查阅章节：' : 'Consulted sections: ') + phase.sections.join(', '));
            lines.push('');
          }
          if (phase.findings) {
            lines.push(Utils.truncateContent(phase.findings, MAX_SECTION_CONTENT));
            lines.push('');
          }
        }
      }

      if (data.conclusion) {
        lines.push('### ' + (lang === 'zh' ? '研究结论' : 'Research Conclusion'));
        lines.push('');
        lines.push(Utils.truncateContent(data.conclusion, MAX_CHAT_RESPONSE));
      }

      if (data.allSources && data.allSources.length > 0) {
        lines.push('');
        lines.push('### ' + (lang === 'zh' ? '涉及的源码文件总览' : 'All Referenced Source Files'));
        var shown = {};
        for (var j = 0; j < data.allSources.length; j++) {
          var ref = data.allSources[j];
          if (!shown[ref.file]) {
            lines.push('- `' + ref.file + '`');
            shown[ref.file] = true;
          }
        }
      }

      return lines.join('\n');
    },

    repoStructure: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? '仓库目录结构' : 'Repository File Structure'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '仓库' : 'Repository') + '**: `' + data.repoSlug + '`');
      lines.push('');

      if (data.tree) {
        lines.push('```');
        lines.push(Utils.truncateContent(data.tree, MAX_CONTENT_LENGTH));
        lines.push('```');
      } else {
        lines.push('_' + (lang === 'zh' ? '无法获取目录结构' : 'Unable to retrieve structure') + '_');
      }

      return lines.join('\n');
    },

    testReport: function (data) {
      var lang = Config.getLang();
      var lines = [];

      lines.push('## ' + (lang === 'zh' ? 'DeepWiki 连通性测试报告' : 'DeepWiki Connectivity Test Report'));
      lines.push('');
      lines.push('**' + (lang === 'zh' ? '时间' : 'Time') + '**: ' + Utils.formatTimestamp());
      lines.push('**' + (lang === 'zh' ? '实例' : 'Instance') + '**: ' + data.baseUrl);
      lines.push('**' + (lang === 'zh' ? 'API 地址' : 'API URL') + '**: ' + data.apiUrl);
      lines.push('');

      for (var i = 0; i < data.checks.length; i++) {
        var check = data.checks[i];
        var icon = check.success ? '✅' : '❌';
        lines.push(icon + ' **' + check.name + '**');
        lines.push('   ' + (lang === 'zh' ? '延迟' : 'Latency') + ': ' + check.latency + 'ms');
        if (check.detail) {
          lines.push('   ' + (lang === 'zh' ? '详情' : 'Detail') + ': ' + check.detail);
        }
        lines.push('');
      }

      return lines.join('\n');
    }
  };

  // ==========================================================================
  // 核心业务逻辑层
  // ==========================================================================

  async function getWikiCore(params) {
    if (!params || !params.repo) {
      throw new Error('repo 参数必填');
    }

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) {
      throw new Error('无法解析仓库标识: ' + params.repo + '。支持格式: owner/repo, GitHub URL, DeepWiki URL');
    }

    var url = Utils.buildWikiUrl(parsed.slug);
    console.log(TOOLKIT_TAG + ' [get_wiki] 获取 Wiki 概览: ' + url);

    var result = await HttpClient.fetchPage(url);
    if (!result.success) {
      throw new Error('页面访问失败: ' + result.error);
    }

    var sections = Utils.extractPageLinks(result.content, result.links);
    var toc = Utils.extractTocFromContent(result.content);
    var includeLinks = params.include_links !== false;

    var outputData = {
      repoSlug: parsed.slug,
      url: url,
      title: result.title,
      content: result.content,
      toc: toc,
      sections: includeLinks ? sections : []
    };

    return {
      success: true,
      message: 'Wiki 概览获取成功',
      data: Formatter.wikiOverview(outputData)
    };
  }

  async function getPageCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');
    if (!params.page_path) throw new Error('page_path 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var pagePath = params.page_path.replace(/^\/+|\/+$/g, '');
    var url = Utils.buildWikiUrl(parsed.slug, pagePath);
    console.log(TOOLKIT_TAG + ' [get_page] 获取页面: ' + url);

    var result = await HttpClient.fetchPage(url);
    if (!result.success) {
      throw new Error('页面访问失败: ' + result.error);
    }

    var sections = Utils.extractPageLinks(result.content, result.links);
    var sourceRefs = Utils.extractSourceReferences(result.content);
    var includeLinks = params.include_links !== false;

    var outputData = {
      repoSlug: parsed.slug,
      pagePath: pagePath,
      url: url,
      title: result.title,
      content: result.content,
      sections: includeLinks ? sections : [],
      sourceRefs: sourceRefs
    };

    return {
      success: true,
      message: '页面内容获取成功',
      data: Formatter.pageContent(outputData)
    };
  }

  async function listPagesCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var url = Utils.buildWikiUrl(parsed.slug);
    console.log(TOOLKIT_TAG + ' [list_pages] 获取目录: ' + url);

    var result = await HttpClient.fetchPage(url);
    if (!result.success) {
      throw new Error('页面访问失败: ' + result.error);
    }

    var sections = Utils.extractPageLinks(result.content, result.links);
    var filtered = sections.filter(function (s) {
      return s.path && s.path.length > 0;
    });

    return {
      success: true,
      message: '目录获取成功，共 ' + filtered.length + ' 个章节',
      data: Formatter.tocList({
        repoSlug: parsed.slug,
        sections: filtered
      })
    };
  }

  async function chatCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');
    if (!params.question) throw new Error('question 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var history = Utils.parseHistoryMessages(params.history);
    var messages = history.slice();
    messages.push({ role: 'user', content: params.question });

    console.log(TOOLKIT_TAG + ' [chat] 仓库: ' + parsed.slug + ', 问题长度: ' + params.question.length);

    var chatResult = await ChatClient.callChatApi(parsed.slug, messages, params.file_path || null);

    if (chatResult.success) {
      var sourceRefs = Utils.extractSourceReferences(chatResult.answer);
      return {
        success: true,
        message: '对话完成',
        data: Formatter.chatResponse({
          repoSlug: parsed.slug,
          question: params.question,
          answer: chatResult.answer,
          mode: 'RAG Chat API',
          sourceRefs: sourceRefs
        })
      };
    }

    console.log(TOOLKIT_TAG + ' [chat] Chat API 不可用，使用页面降级策略');
    var fallbackResult = await chatFallbackViaPage(parsed, params.question);
    if (fallbackResult) return fallbackResult;

    throw new Error('对话失败: ' + chatResult.error);
  }

  async function chatFallbackViaPage(parsed, question) {
    console.log(TOOLKIT_TAG + ' [chat] 尝试页面抓取降级策略');

    try {
      var url = Utils.buildWikiUrl(parsed.slug);
      var result = await HttpClient.fetchPage(url, { retries: 1 });
      if (!result.success || result.content.length < 100) return null;

      var sections = Utils.extractPageLinks(result.content, result.links);
      var ranked = Utils.matchSectionsToQuery(
        sections.filter(function (s) { return s.path && s.path.length > 0; }),
        question
      );

      var allContent = Utils.truncateContent(result.content, MAX_SECTION_CONTENT);
      var extraRefs = Utils.extractSourceReferences(result.content);

      if (ranked.length > 0) {
        var topSections = ranked.slice(0, 2);
        for (var i = 0; i < topSections.length; i++) {
          try {
            var secUrl = Utils.buildWikiUrl(parsed.slug, topSections[i].path);
            var secResult = await HttpClient.fetchPage(secUrl, { retries: 0, timeout: 15000 });
            if (secResult.success && secResult.content.length > 100) {
              allContent += '\n\n=== ' + topSections[i].title + ' ===\n' + Utils.truncateContent(secResult.content, Math.floor(MAX_SECTION_CONTENT / 2));
              var secRefs = Utils.extractSourceReferences(secResult.content);
              extraRefs = extraRefs.concat(secRefs);
            }
          } catch (e) { /* skip */ }
        }
      }

      var lang = Config.getLang();
      var fallbackAnswer = lang === 'zh'
        ? '（注：DeepWiki Chat API 暂不可用，以下基于 Wiki 页面内容检索得到的参考信息）\n\n'
        : '(Note: DeepWiki Chat API unavailable, below is retrieved from Wiki page content)\n\n';
      fallbackAnswer += allContent;

      return {
        success: true,
        message: lang === 'zh' ? 'Chat API 不可用，已降级为页面检索模式' : 'Chat API unavailable, fell back to page retrieval',
        data: Formatter.chatResponse({
          repoSlug: parsed.slug,
          question: question,
          answer: fallbackAnswer,
          mode: lang === 'zh' ? '页面检索降级' : 'Page Retrieval Fallback',
          sourceRefs: extraRefs
        })
      };
    } catch (e) {
      console.error(TOOLKIT_TAG + ' [chat] 降级策略也失败: ' + e.message);
      return null;
    }
  }

  async function askCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');
    if (!params.question) throw new Error('question 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var maxSections = Math.min(Math.max(params.max_sections || 3, 1), MAX_RESEARCH_SECTIONS);
    var lang = Config.getLang();

    sendIntermediateResult({
      success: true,
      message: lang === 'zh' ? '正在获取 Wiki 目录...' : 'Fetching Wiki TOC...'
    });

    var overviewUrl = Utils.buildWikiUrl(parsed.slug);
    var overviewResult = await HttpClient.fetchPage(overviewUrl);

    if (!overviewResult.success) {
      throw new Error('Wiki 概览页面访问失败: ' + overviewResult.error);
    }

    var sections = Utils.extractPageLinks(overviewResult.content, overviewResult.links);
    var wikiRefs = Utils.extractSourceReferences(overviewResult.content);

    var ranked = Utils.matchSectionsToQuery(
      sections.filter(function (s) { return s.path && s.path.length > 0; }),
      params.question
    );

    var toFetch = ranked.slice(0, maxSections);
    var consultedNames = [];
    var allContent = [];
    var allRefs = wikiRefs.slice();

    if (toFetch.length > 0) {
      sendIntermediateResult({
        success: true,
        message: (lang === 'zh' ? '正在检索 ' : 'Fetching ') + toFetch.length + (lang === 'zh' ? ' 个相关章节...' : ' relevant sections...')
      });

      for (var i = 0; i < toFetch.length; i++) {
        var sec = toFetch[i];
        try {
          var secUrl = Utils.buildWikiUrl(parsed.slug, sec.path);
          var secResult = await HttpClient.fetchPage(secUrl, { retries: 1, timeout: 15000 });
          if (secResult.success && secResult.content.length > 50) {
            allContent.push('=== ' + sec.title + ' ===\n' + Utils.truncateContent(secResult.content, Math.floor(MAX_SECTION_CONTENT / maxSections)));
            consultedNames.push(sec.title);
            var secRefs = Utils.extractSourceReferences(secResult.content);
            allRefs = allRefs.concat(secRefs);
          }
        } catch (e) {
          console.log(TOOLKIT_TAG + ' 章节抓取跳过: ' + sec.title + ' - ' + e.message);
        }
      }
    }

    var contextSummary = allContent.join('\n\n');

    var chatAnswer = null;
    try {
      sendIntermediateResult({
        success: true,
        message: lang === 'zh' ? '正在调用 RAG 问答...' : 'Calling RAG Q&A...'
      });

      var chatResult = await ChatClient.callChatApi(
        parsed.slug,
        [{ role: 'user', content: params.question }],
        null
      );

      if (chatResult.success && chatResult.answer.length >= 10) {
        chatAnswer = chatResult.answer;
        var chatRefs = Utils.extractSourceReferences(chatAnswer);
        allRefs = allRefs.concat(chatRefs);
      }
    } catch (chatErr) {
      console.log(TOOLKIT_TAG + ' [ask] RAG 对话跳过: ' + chatErr.message);
    }

    return {
      success: true,
      message: '智能问答完成',
      data: Formatter.askResponse({
        repoSlug: parsed.slug,
        question: params.question,
        consultedSections: consultedNames,
        chatAnswer: chatAnswer,
        contextSummary: contextSummary,
        allSourceRefs: allRefs
      })
    };
  }

  async function extractSourcesCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var pagePath = params.page_path || '';
    var url = Utils.buildWikiUrl(parsed.slug, pagePath);

    var result = await HttpClient.fetchPage(url);
    if (!result.success) {
      throw new Error('页面访问失败: ' + result.error);
    }

    var refs = Utils.extractSourceReferences(result.content);

    return {
      success: true,
      message: '源码引用提取完成，共 ' + refs.length + ' 条',
      data: Formatter.sourceList({
        repoSlug: parsed.slug,
        pagePath: pagePath || '(overview)',
        refs: refs
      })
    };
  }

  async function getRepoStructureCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var url = Utils.buildWikiUrl(parsed.slug);
    var result = await HttpClient.fetchPage(url);

    var tree = '';

    if (result.success) {
      var content = result.content;
      var treeMatch = content.match(/(?:```(?:text|tree|plaintext)?\n)([\s\S]*?)(?:```)/);
      if (treeMatch) {
        tree = treeMatch[1].trim();
      }

      if (!tree) {
        var structureSection = content.match(/(?:(?:Project|File|Directory|Repository)\s+Structure|项目结构|文件结构|目录结构)[^\n]*\n([\s\S]{50,2000}?)(?:\n#{1,3}\s|\n\n\n)/i);
        if (structureSection) {
          tree = structureSection[1].trim();
        }
      }

      if (!tree) {
        var fileLines = content.match(/(?:├──|└──|│\s+├──|│\s+└──)[^\n]+/g);
        if (fileLines && fileLines.length > 3) {
          tree = fileLines.join('\n');
        }
      }
    }

    if (!tree) {
      try {
        var structUrl = Utils.buildWikiUrl(parsed.slug, '1-system-architecture');
        var structResult = await HttpClient.fetchPage(structUrl, { retries: 1 });
        if (structResult.success) {
          var sTreeMatch = structResult.content.match(/(?:```(?:text|tree|plaintext)?\n)([\s\S]*?)(?:```)/);
          if (sTreeMatch) {
            tree = sTreeMatch[1].trim();
          }
        }
      } catch (e) {
        console.log(TOOLKIT_TAG + ' 架构页面也未找到目录树');
      }
    }

    return {
      success: true,
      message: tree ? '仓库结构获取成功' : '未能自动提取目录树结构，建议直接查看 Wiki 概览',
      data: Formatter.repoStructure({
        repoSlug: parsed.slug,
        tree: tree
      })
    };
  }

  async function batchGetCore(params) {
    if (!params || !params.targets) throw new Error('targets 参数必填');

    var rawTargets = params.targets.split(',').map(function (t) { return t.trim(); }).filter(function (t) { return t.length > 0; });

    if (rawTargets.length === 0) throw new Error('targets 列表为空');
    if (rawTargets.length > 10) throw new Error('targets 数量不能超过 10');

    var concurrency = Math.min(Math.max(params.concurrency || 3, 1), MAX_BATCH_CONCURRENCY);
    var results = [];
    var succeeded = 0;
    var failed = 0;

    var isPageMode = rawTargets[0].indexOf(':') !== -1;

    for (var batchStart = 0; batchStart < rawTargets.length; batchStart += concurrency) {
      var batch = rawTargets.slice(batchStart, batchStart + concurrency);
      var promises = batch.map(function (target) {
        return (async function (t) {
          try {
            var url, label;

            if (isPageMode) {
              var colonIdx = t.indexOf(':');
              var repoStr = t.substring(0, colonIdx);
              var page = t.substring(colonIdx + 1);
              var p = Utils.parseRepoIdentifier(repoStr);
              if (!p) throw new Error('无法解析: ' + repoStr);
              url = Utils.buildWikiUrl(p.slug, page);
              label = p.slug + '/' + page;
            } else {
              var p2 = Utils.parseRepoIdentifier(t);
              if (!p2) throw new Error('无法解析: ' + t);
              url = Utils.buildWikiUrl(p2.slug);
              label = p2.slug;
            }

            var result = await HttpClient.fetchPage(url, { retries: 1, timeout: 15000 });
            if (result.success) {
              succeeded++;
              return { target: label, success: true, content: result.content };
            } else {
              failed++;
              return { target: label, success: false, error: result.error };
            }
          } catch (e) {
            failed++;
            return { target: t, success: false, error: e.message };
          }
        })(target);
      });

      var batchResults = await Promise.all(promises);
      results = results.concat(batchResults);

      if (batchStart + concurrency < rawTargets.length) {
        sendIntermediateResult({
          success: true,
          message: '已完成 ' + results.length + '/' + rawTargets.length + ' 个目标'
        });
      }
    }

    return {
      success: true,
      message: '批量检索完成: ' + succeeded + ' 成功, ' + failed + ' 失败',
      data: Formatter.batchResult({
        total: rawTargets.length,
        succeeded: succeeded,
        failed: failed,
        results: results
      })
    };
  }

  async function deepResearchCore(params) {
    if (!params || !params.repo) throw new Error('repo 参数必填');
    if (!params.topic) throw new Error('topic 参数必填');

    var parsed = Utils.parseRepoIdentifier(params.repo);
    if (!parsed) throw new Error('无法解析仓库标识: ' + params.repo);

    var maxIter = Math.min(Math.max(params.max_iterations || 3, 1), MAX_RESEARCH_ITERATIONS);
    var lang = Config.getLang();

    sendIntermediateResult({
      success: true,
      message: lang === 'zh' ? '开始深度研究: ' + params.topic : 'Starting deep research: ' + params.topic
    });

    var overviewUrl = Utils.buildWikiUrl(parsed.slug);
    var overviewResult = await HttpClient.fetchPage(overviewUrl);

    if (!overviewResult.success) {
      throw new Error('Wiki 概览页面访问失败: ' + overviewResult.error);
    }

    var allSections = Utils.extractPageLinks(overviewResult.content, overviewResult.links)
      .filter(function (s) { return s.path && s.path.length > 0; });

    var phases = [];
    var allSources = [];
    var visitedPaths = {};
    var accumulatedContext = '';

    for (var iter = 0; iter < maxIter; iter++) {
      sendIntermediateResult({
        success: true,
        message: (lang === 'zh' ? '研究阶段 ' : 'Research phase ') + (iter + 1) + '/' + maxIter
      });

      var queryForRanking = iter === 0 ? params.topic : params.topic + ' ' + (phases.length > 0 ? phases[phases.length - 1].title : '');
      var ranked = Utils.matchSectionsToQuery(allSections, queryForRanking);

      var toFetch = [];
      for (var r = 0; r < ranked.length && toFetch.length < 2; r++) {
        if (!visitedPaths[ranked[r].path]) {
          toFetch.push(ranked[r]);
          visitedPaths[ranked[r].path] = true;
        }
      }

      if (toFetch.length === 0 && iter > 0) break;

      var phaseSections = [];
      var phaseContent = '';

      for (var f = 0; f < toFetch.length; f++) {
        try {
          var secUrl = Utils.buildWikiUrl(parsed.slug, toFetch[f].path);
          var secResult = await HttpClient.fetchPage(secUrl, { retries: 1, timeout: 15000 });
          if (secResult.success && secResult.content.length > 50) {
            phaseSections.push(toFetch[f].title);
            phaseContent += '\n\n=== ' + toFetch[f].title + ' ===\n' + Utils.truncateContent(secResult.content, Math.floor(MAX_SECTION_CONTENT / 2));
            var refs = Utils.extractSourceReferences(secResult.content);
            allSources = allSources.concat(refs);
          }
        } catch (e) {
          console.log(TOOLKIT_TAG + ' 深度研究跳过: ' + toFetch[f].title);
        }
      }

      accumulatedContext += phaseContent;

      var phaseTitle = '';
      if (iter === 0) {
        phaseTitle = lang === 'zh' ? '初始探索 — 概览与核心架构' : 'Initial Exploration — Overview & Core Architecture';
      } else if (iter === maxIter - 1) {
        phaseTitle = lang === 'zh' ? '深度挖掘 — 细节与实现' : 'Deep Dive — Details & Implementation';
      } else {
        phaseTitle = lang === 'zh' ? '扩展调研 — 关联模块' : 'Expansion — Related Modules';
      }

      phases.push({
        title: phaseTitle,
        sections: phaseSections,
        findings: phaseContent
      });
    }

    var conclusion = '';
    try {
      var conclusionResult = await ChatClient.callChatApi(
        parsed.slug,
        [{ role: 'user', content: params.topic }],
        null
      );

      if (conclusionResult.success && conclusionResult.answer.length >= 20) {
        conclusion = conclusionResult.answer;
        var conclusionRefs = Utils.extractSourceReferences(conclusion);
        allSources = allSources.concat(conclusionRefs);
      }
    } catch (e) {
      console.log(TOOLKIT_TAG + ' [deep_research] RAG 结论生成跳过: ' + e.message);
    }

    if (!conclusion || conclusion.length < 20) {
      conclusion = lang === 'zh'
        ? '（RAG 对话不可用，以下为文档内容汇总）\n\n' + Utils.truncateContent(accumulatedContext, MAX_CHAT_RESPONSE)
        : '(RAG chat unavailable, below is documentation summary)\n\n' + Utils.truncateContent(accumulatedContext, MAX_CHAT_RESPONSE);
    }

    return {
      success: true,
      message: lang === 'zh' ? '深度研究完成' : 'Deep research completed',
      data: Formatter.deepResearch({
        repoSlug: parsed.slug,
        topic: params.topic,
        iterations: phases.length,
        pagesFetched: Object.keys(visitedPaths).length,
        phases: phases,
        conclusion: conclusion,
        allSources: allSources
      })
    };
  }

  async function testCore() {
    var baseUrl = Config.getBaseUrl();
    var apiUrl = Config.getApiUrl();
    var checks = [];

    var pageStart = Date.now();
    try {
      var pageResult = await HttpClient.fetchPage(baseUrl + '/AsyncFuncAI/deepwiki-open', {
        retries: 0,
        timeout: 15000
      });
      var pageLatency = Date.now() - pageStart;

      checks.push({
        name: 'Wiki 页面访问',
        success: pageResult.success && pageResult.content.length > 100,
        latency: pageLatency,
        detail: pageResult.success
          ? '内容长度 ' + pageResult.content.length + ' 字符'
          : '错误: ' + (pageResult.error || '未知')
      });
    } catch (e) {
      checks.push({
        name: 'Wiki 页面访问',
        success: false,
        latency: Date.now() - pageStart,
        detail: '异常: ' + e.message
      });
    }

    var endpoints = Utils.buildChatEndpoints();
    for (var ei = 0; ei < endpoints.length; ei++) {
      var chatEndpoint = endpoints[ei];
      var chatStart = Date.now();
      try {
        var testPayload = {
          repo_url: 'https://github.com/AsyncFuncAI/deepwiki-open',
          messages: [{ role: 'user', content: 'What is this project?' }]
        };

        var chatResult = await HttpClient.postJson(chatEndpoint, testPayload, {
          retries: 0,
          timeout: 30000
        });
        var chatLatency = Date.now() - chatStart;

        if (chatResult.success) {
          var answer = StreamParser.parseResponse(chatResult.body, chatResult.contentType || '');
          checks.push({
            name: 'Chat API (' + chatEndpoint.replace(baseUrl, '') + ')',
            success: answer.length > 20,
            latency: chatLatency,
            detail: '响应长度 ' + answer.length + ' 字符'
          });
          if (answer.length > 20) break;
        } else {
          checks.push({
            name: 'Chat API (' + chatEndpoint.replace(baseUrl, '') + ')',
            success: false,
            latency: chatLatency,
            detail: 'HTTP ' + (chatResult.statusCode || '?') + ': ' + (chatResult.error || '').substring(0, 200)
          });
        }
      } catch (e) {
        checks.push({
          name: 'Chat API (' + chatEndpoint.replace(baseUrl, '') + ')',
          success: false,
          latency: Date.now() - chatStart,
          detail: '异常: ' + e.message
        });
      }
    }

    var healthStart = Date.now();
    try {
      var healthUrl = apiUrl + '/health';
      var healthResult = await HttpClient.getJson(healthUrl, { retries: 0 });
      var healthLatency = Date.now() - healthStart;

      checks.push({
        name: 'Health Endpoint',
        success: healthResult.success,
        latency: healthLatency,
        detail: healthResult.success ? 'OK' : 'HTTP ' + (healthResult.statusCode || '?')
      });
    } catch (e) {
      checks.push({
        name: 'Health Endpoint',
        success: false,
        latency: Date.now() - healthStart,
        detail: '异常: ' + e.message
      });
    }

    return {
      success: checks.some(function (c) { return c.success; }),
      message: '连通性测试完成',
      data: Formatter.testReport({
        baseUrl: baseUrl,
        apiUrl: apiUrl,
        checks: checks
      })
    };
  }

  // ==========================================================================
  // 通用执行包装器
  // ==========================================================================

  async function wrapExecution(toolName, coreFn, params) {
    try {
      var result = await coreFn(params);
      complete(result);
    } catch (error) {
      console.error(TOOLKIT_TAG + ' [' + toolName + '] 执行异常: ' + (error.stack || error.message));
      complete({
        success: false,
        message: toolName + ' 执行失败: ' + error.message
      });
    }
  }

  // ==========================================================================
  // 公开接口暴露
  // ==========================================================================

  return {

    get_wiki: function (params) {
      return wrapExecution('get_wiki', getWikiCore, params);
    },

    get_page: function (params) {
      return wrapExecution('get_page', getPageCore, params);
    },

    list_pages: function (params) {
      return wrapExecution('list_pages', listPagesCore, params);
    },

    chat: function (params) {
      return wrapExecution('chat', chatCore, params);
    },

    ask: function (params) {
      return wrapExecution('ask', askCore, params);
    },

    extract_sources: function (params) {
      return wrapExecution('extract_sources', extractSourcesCore, params);
    },

    get_repo_structure: function (params) {
      return wrapExecution('get_repo_structure', getRepoStructureCore, params);
    },

    batch_get: function (params) {
      return wrapExecution('batch_get', batchGetCore, params);
    },

    deep_research: function (params) {
      return wrapExecution('deep_research', deepResearchCore, params);
    },

    test: function () {
      return wrapExecution('test', testCore, {});
    }
  };

})();

// ============================================================================
// 导出工具接口（严格匹配 METADATA 中的工具名称）
// ============================================================================

exports.get_wiki = deepwikiSearchToolkit.get_wiki;
exports.get_page = deepwikiSearchToolkit.get_page;
exports.list_pages = deepwikiSearchToolkit.list_pages;
exports.chat = deepwikiSearchToolkit.chat;
exports.ask = deepwikiSearchToolkit.ask;
exports.extract_sources = deepwikiSearchToolkit.extract_sources;
exports.get_repo_structure = deepwikiSearchToolkit.get_repo_structure;
exports.batch_get = deepwikiSearchToolkit.batch_get;
exports.deep_research = deepwikiSearchToolkit.deep_research;
exports.test = deepwikiSearchToolkit.test;
