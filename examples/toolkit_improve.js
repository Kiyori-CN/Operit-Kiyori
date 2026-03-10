/* METADATA
{
    "name": "toolkit_improve",
    "version": "1.0",
    "display_name": {
        "zh": "工具包自递归优化器",
        "en": "Toolkit Self-Recursive Optimizer"
    },
    "description": {
        "zh": "工具包自递归优化引擎。深度审查 JS 工具包代码质量，跨工具包比较学习与精准代码替换，支持语法检测、METADATA 规范校验、安全扫描、风格审查、函数复杂度分析、重复代码检测、智能补丁生成与批量应用。核心能力：inspect_toolkit 深度审查、compare_toolkits 架构对比、patch_code 精准替换、batch_patch 原子化批量补丁、lint_check 全面质量检查、learn_patterns 设计模式提取、evolve 自递归进化闭环、snapshot 状态快照与恢复与差异对比、read_toolkit 源码读取、list_toolkits 工具包扫描列表、create_toolkit 新工具包脚手架生成。自递归闭环：审查→学习→对比→补丁→验证→快照。",
        "en": "Toolkit self-recursive optimization engine. Deep-inspects JS toolkit code quality, enables cross-toolkit comparative learning and precision code patching with fuzzy matching. Features: naming consistency detection (return-object / exports / METADATA three-way validation), post-patch auto naming check, full-source read_all mode with optional range selection, insert_line mode for line-based insertion, syntax detection, METADATA compliance, security scanning (shell injection / path traversal), style auditing, complexity analysis, duplicate detection, smart patch generation and batch application, snapshot diff comparison. Self-recursive loop: inspect → learn → compare → patch → verify → snapshot."
    },
    "enabledByDefault": true,
    "category": "Admin",
    "author": "Operit Community",
    "env": [
        {
            "name": "TOOLKIT_EXAMPLES_DIR",
            "description": {
                "zh": "工具包目录路径，默认 /storage/emulated/0/Download/Operit/examples/",
                "en": "Toolkit directory path. Default: /storage/emulated/0/Download/Operit/examples/"
            },
            "required": false
        },
        {
            "name": "TOOLKIT_IMPROVE_BACKUP",
            "description": {
                "zh": "patch 前自动备份开关（true/false），默认 true",
                "en": "Auto-backup before patching (true/false). Default: true"
            },
            "required": false
        },
        {
            "name": "TOOLKIT_IMPROVE_DEBUG",
            "description": {
                "zh": "调试模式（true/false），启用后输出详细日志",
                "en": "Debug mode (true/false). Enables verbose logging."
            },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "inspect_toolkit",
            "description": {
                "zh": "深度审查工具包。分析代码结构、METADATA 合规性、语法、安全、风格、错误处理覆盖率、导出一致性、函数复杂度。支持 2000+ 行大文件。",
                "en": "Deep audit a toolkit. Analyzes structure, METADATA compliance, syntax, security, style, error handling, exports, function complexity."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "工具包名称（不含 .js）",
                        "en": "Toolkit name (without .js)"
                    }
                },
                {
                    "name": "depth",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "审查深度：quick（METADATA + 导出）/ standard（含语法风格）/ deep（含安全审计）。默认 standard",
                        "en": "Audit depth: quick / standard / deep. Default: standard"
                    }
                }
            ]
        },
        {
            "name": "compare_toolkits",
            "description": {
                "zh": "对比两个工具包的架构与质量。分析 IIFE、错误处理、参数校验、截断保护、缓存、重试等维度差异，生成改进建议和可执行补丁。",
                "en": "Compare architecture and quality between two toolkits. Analyzes differences and generates actionable patches."
            },
            "parameters": [
                {
                    "name": "source_toolkit",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "范本工具包名称",
                        "en": "Source (exemplary) toolkit name"
                    }
                },
                {
                    "name": "target_toolkit",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标工具包名称（待改进）",
                        "en": "Target toolkit name (to improve)"
                    }
                },
                {
                    "name": "aspects",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "对比维度（逗号分隔）：structure/error_handling/security/style/performance/all。默认 all",
                        "en": "Aspects: structure/error_handling/security/style/performance/all. Default: all"
                    }
                }
            ]
        },
        {
            "name": "patch_code",
            "description": {
                "zh": "精准代码替换。四种定位模式：exact（精确匹配）、regex（正则）、anchor（锚点定位）、fuzzy（模糊匹配，容忍空白差异）。替换前自动备份，替换后语法验证。",
                "en": "Precision code patching. Modes: exact, regex, anchor, fuzzy. Auto-backup and post-patch syntax verification."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标工具包名称",
                        "en": "Target toolkit name"
                    }
                },
                {
                    "name": "old_code",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "要替换的原始代码",
                        "en": "Original code to replace"
                    }
                },
                {
                    "name": "new_code",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "替换后的新代码",
                        "en": "Replacement code"
                    }
                },
                {
                    "name": "mode",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "定位模式：exact（默认）/ regex / anchor / fuzzy / insert_line（行号插入，occurrence 为行号）/ append（追加到文件末尾）",
                        "en": "Match mode: exact (default) / regex / anchor / fuzzy / insert_line (insert at line number via occurrence) / append (append to end)"
                    }
                },
                {
                    "name": "anchor_before",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "anchor 模式前锚点",
                        "en": "Anchor mode: preceding text"
                    }
                },
                {
                    "name": "anchor_after",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "anchor 模式后锚点",
                        "en": "Anchor mode: following text"
                    }
                },
                {
                    "name": "occurrence",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "替换第 N 个匹配（从 1 开始），0 替换全部。默认 1",
                        "en": "Which occurrence (1-based). 0 = all. Default: 1"
                    }
                },
                {
                    "name": "dry_run",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "试运行，仅预览不写入。默认 false",
                        "en": "Preview only. Default: false"
                    }
                }
            ]
        },
        {
            "name": "batch_patch",
            "description": {
                "zh": "批量代码补丁。一次执行多个替换，原子性保证（任一失败全部回滚）。",
                "en": "Batch patching with atomic rollback on failure."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标工具包名称",
                        "en": "Target toolkit name"
                    }
                },
                {
                    "name": "patches",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "补丁 JSON 数组：[{\"old_code\":\"...\",\"new_code\":\"...\",\"mode\":\"exact\"}, ...]",
                        "en": "JSON array: [{\"old_code\":\"...\",\"new_code\":\"...\",\"mode\":\"exact\"}, ...]"
                    }
                },
                {
                    "name": "dry_run",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "试运行。默认 false",
                        "en": "Dry run. Default: false"
                    }
                }
            ]
        },
        {
            "name": "lint_check",
            "description": {
                "zh": "全面代码质量检查。语法验证、格式规范、反模式检测、复杂度评估。支持单个或批量检查。",
                "en": "Comprehensive lint check with syntax, format, anti-pattern, and complexity analysis."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "工具包名称，留空检查全部",
                        "en": "Toolkit name. Empty = check all."
                    }
                },
                {
                    "name": "rules",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "检查规则（逗号分隔）：syntax/format/security/complexity/naming/all。默认 all",
                        "en": "Rules: syntax/format/security/complexity/naming/all. Default: all"
                    }
                },
                {
                    "name": "fix_suggestions",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "输出修复建议。默认 true",
                        "en": "Include fix suggestions. Default: true"
                    }
                }
            ]
        },
        {
            "name": "learn_patterns",
            "description": {
                "zh": "从工具包中提取设计模式。分析架构、错误处理、HTTP 封装、缓存、重试、输出格式化等，生成可复用模式摘要。",
                "en": "Extract reusable design patterns from a toolkit for cross-toolkit knowledge transfer."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "要分析的工具包名称",
                        "en": "Toolkit name to analyze"
                    }
                },
                {
                    "name": "focus",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "聚焦类型：architecture/error_handling/http/cache/retry/validation/output/all。默认 all",
                        "en": "Focus: architecture/error_handling/http/cache/retry/validation/output/all. Default: all"
                    }
                }
            ]
        },
        {
            "name": "evolve",
            "description": {
                "zh": "自递归进化。执行「审查→对比→补丁生成→验证」完整闭环。自动生成可执行补丁（截断保护、参数校验、调试模式、IIFE 封装、错误处理等），支持自动应用或报告模式。",
                "en": "Self-recursive evolution with auto-generated executable patches. Supports auto-apply or report-only mode."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标工具包名称",
                        "en": "Target toolkit name"
                    }
                },
                {
                    "name": "reference_toolkit",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "参考范本名称，留空自动选择评分最高的",
                        "en": "Reference toolkit. Empty = auto-select."
                    }
                },
                {
                    "name": "max_patches",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "最多生成补丁数，默认 10（1-50）",
                        "en": "Max patches. Default: 10, range: 1-50"
                    }
                },
                {
                    "name": "auto_apply",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "自动应用补丁。默认 false（仅生成报告）",
                        "en": "Auto-apply patches. Default: false"
                    }
                }
            ]
        },
        {
            "name": "read_toolkit",
            "description": {
                "zh": "分段读取工具包源码或搜索关键字。支持全量读取（read_all）可选择区间（start_line/end_line），返回源码、总行数和读取范围。搜索模式支持正则。",
                "en": "Read toolkit source by line range, keyword search, or full read with optional range selection. Supports regex search."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "工具包名称",
                        "en": "Toolkit name"
                    }
                },
                {
                    "name": "start_line",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "起始行号（从 1），默认 1",
                        "en": "Start line (1-based). Default: 1"
                    }
                },
                {
                    "name": "end_line",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "结束行号，默认 EOF，建议单次 ≤500 行",
                        "en": "End line. Default: EOF. Recommended: ≤500"
                    }
                },
                {
                    "name": "search_text",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "搜索文本，返回匹配行及上下文。与行范围参数互斥。搜索时 start_line 用作上下文行数（默认 5，范围 0-30）",
                        "en": "Search text with context. Mutually exclusive with line range. When searching, start_line sets context lines (default 5, range 0-30)."
                    }
                },
                {
                    "name": "read_all",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "全量读取：true 时返回完整源码（受 MAX_INLINE_OUTPUT 截断保护）。可搭配 start_line / end_line 指定读取区间，不指定则读取全部。",
                        "en": "Full read: when true, returns source code with line numbers (subject to truncation). Can combine with start_line / end_line for range selection."
                    }
                }
            ]
        },
        {
            "name": "list_toolkits",
            "description": {
                "zh": "列出所有工具包及基本信息：名称、行数、大小、工具数、分类、版本、质量评分。",
                "en": "List all toolkits with name, lines, size, tools, category, version, quality score."
            },
            "parameters": [
                {
                    "name": "sort_by",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "排序：name/size/lines/modified/score。默认 name",
                        "en": "Sort by: name/size/lines/modified/score. Default: name"
                    }
                },
                {
                    "name": "filter",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按名称/分类/作者过滤（模糊匹配）",
                        "en": "Filter by name/category/author (fuzzy)"
                    }
                }
            ]
        },
        {
            "name": "snapshot",
            "description": {
                "zh": "工具包快照管理。save 保存、restore 恢复、list 列出快照、diff 差异对比、delete 删除快照。",
                "en": "Snapshot management: save, restore, list, diff, delete."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "工具包名称",
                        "en": "Toolkit name"
                    }
                },
                {
                    "name": "action",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "操作：save / restore / list / diff / delete",
                        "en": "Action: save / restore / list / diff / delete"
                    }
                },
                {
                    "name": "snapshot_id",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "restore 时指定快照 ID，留空恢复最新",
                        "en": "Snapshot ID for restore. Empty = latest."
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "自检。验证目录可访问性、读写权限、备份目录、分析引擎功能。",
                "en": "Self-test. Verifies directory access, permissions, backup, analysis engine."
            },
            "parameters": []
        },
        {
            "name": "create_toolkit",
            "description": {
                "zh": "生成新工具包脚手架。根据工具定义自动生成规范的 JS 工具包，包含 METADATA、IIFE、错误处理、参数校验、截断保护等最佳实践。",
                "en": "Generate a new toolkit scaffold with METADATA, IIFE, error handling, validation and truncation."
            },
            "parameters": [
                {
                    "name": "toolkit_name",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "工具包名称（小写+下划线，/^[a-z][a-z0-9_]*$/）",
                        "en": "Toolkit name (lowercase + underscore)"
                    }
                },
                {
                    "name": "description_zh",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "中文描述", "en": "Chinese description" }
                },
                {
                    "name": "description_en",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "英文描述", "en": "English description" }
                },
                {
                    "name": "category",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "分类，默认 UTILITY", "en": "Category. Default: UTILITY" }
                },
                {
                    "name": "tools",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "工具定义 JSON 数组: [{\"name\":\"fn\",\"desc_zh\":\"...\",\"params\":[{\"name\":\"p\",\"type\":\"string\",\"required\":true,\"desc_zh\":\"...\"}]}]。留空生成仅含 test 的最小模板",
                        "en": "Tool definitions JSON array. Empty = minimal template with test tool."
                    }
                },
                {
                    "name": "features",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "特性（逗号分隔）：config/debug/truncation/validation/retry/cache/proxy/all。默认 config,debug,truncation,validation",
                        "en": "Features: config/debug/truncation/validation/retry/cache/proxy/all. Default: config,debug,truncation,validation"
                    }
                },
                {
                    "name": "display_name_zh",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "中文显示名", "en": "Chinese display name" }
                },
                {
                    "name": "display_name_en",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "英文显示名", "en": "English display name" }
                },
                {
                    "name": "overwrite",
                    "type": "boolean",
                    "required": false,
                    "description": { "zh": "覆盖已有文件，默认 false", "en": "Overwrite existing file. Default: false" }
                },
                {
                    "name": "author",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "作者名，默认 Operit Community", "en": "Author name. Default: Operit Community" }
                },
                {
                    "name": "enabled_by_default",
                    "type": "boolean",
                    "required": false,
                    "description": { "zh": "默认启用，默认 false", "en": "Enabled by default. Default: false" }
                }
            ]
        }
    ]
}
*/

/**
 * ==============================================================================
 * 工具包自递归优化器 (Toolkit Self-Recursive Optimizer) v1.0
 * 命名一致性检测、补丁后自动校验、read_all 全量/区间读取
 * 模糊匹配补丁、快照差异对比、Shell 注入 / 路径遍历安全检测
 * ==============================================================================
 */
var TOOLKIT_IMPROVE = (function () {

    // ═══════════════════════════════════════════════════════════════════════════
    // §1  配置常量
    // ═══════════════════════════════════════════════════════════════════════════

    var CONFIG = {
        DEFAULT_EXAMPLES_DIR: '/storage/emulated/0/Download/Operit/examples/',
        BACKUP_SUFFIX: '.bak',
        BACKUP_DIR_NAME: '.toolkit_improve_backups',
        SNAPSHOT_DIR_NAME: '.toolkit_improve_snapshots',
        MAX_INLINE_OUTPUT: 60000,
        MAX_SINGLE_RESULT: 15000,
        MAX_SEGMENT_LINES: 500,
        SELF_NAME: 'toolkit_improve',
        VERSION: '1.0',
        DUPLICATE_BLOCK_SIZE: 5,
        DUPLICATE_MIN_CHARS: 40,
        MAX_DISPLAY_ISSUES: 50,
        MAX_DISPLAY_LINT: 30,
        MAX_SEARCH_RESULTS: 20,
        COMPLEXITY_WARN_THRESHOLD: 20,
        COMPLEXITY_INFO_THRESHOLD: 15,
        FUNC_LENGTH_WARN: 150,
        NESTING_WARN: 8,
        NESTING_INFO: 6,
        CONSOLE_LOG_WARN: 15,
        EVOLVE_SCAN_LIMIT: 20,
        FUZZY_MIN_SIMILARITY: 0.75,
        SEMICOLON_MIX_MIN: 0.1,
        SEMICOLON_MIX_MAX: 0.9,
        DESC_MIN_LENGTH: 20,
        PATCH_MAX_OLD_CODE: 100000,
        VALID_CATEGORIES: [
            'AUTOMATIC', 'DRAW', 'CHAT', 'DEVELOPMENT', 'FILE', 'LIFE',
            'MEDIA', 'MEMORY', 'NETWORK', 'SEARCH', 'SYSTEM', 'UTILITY',
            'WORKFLOW', 'ADMIN'
        ],
        VALID_PARAM_TYPES: ['string', 'number', 'boolean', 'object', 'array'],
        SECRET_PATTERNS: [
            /['"][A-Za-z0-9+/]{40,}['"]/,
            /sk-[a-zA-Z0-9]{20,}/,
            /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*['"][a-zA-Z0-9\-_]{16,}/,
            /[Tt]oken\s*[:=]\s*['"][a-zA-Z0-9\-_\.]{20,}/,
            /Bearer\s+[a-zA-Z0-9\-_\.]{30,}/
        ],
        SECRET_WHITELIST: /getEnv|process\.env|params\.|CONFIG\.|placeholder|example|test|mock|dummy/i,
        NAMING_PATTERN: /^[a-z][a-z0-9_]*$/,
        FILE_NAMING_PATTERN: /^[a-z][a-z0-9_]*\.(js|ts)$/,
        QUALITY_WEIGHTS: {
            hasIIFE: 12,
            hasConfig: 6,
            hasWrapPattern: 12,
            hasComplete: 10,
            hasExports: 5,
            hasTryCatch: 10,
            hasAsyncAwait: 4,
            hasEnvRead: 5,
            hasTruncation: 8,
            hasTestTool: 10,
            hasParamValidation: 10,
            hasRetry: 5,
            hasDebugMode: 4,
            hasCache: 4,
            hasSendIntermediate: 3,
            hasProxy: 2
        },
        ARCH_FEATURES: [
            ['IIFE 封装', 'hasIIFE', true],
            ['CONFIG 常量', 'hasConfig', false],
            ['wrap 包装器', 'hasWrapPattern', false],
            ['complete() 调用', 'hasComplete', true],
            ['try-catch 错误处理', 'hasTryCatch', true],
            ['参数校验', 'hasParamValidation', true],
            ['截断保护', 'hasTruncation', true],
            ['test 工具', 'hasTestTool', true],
            ['环境变量读取', 'hasEnvRead', false],
            ['重试机制', 'hasRetry', false],
            ['缓存机制', 'hasCache', false],
            ['调试模式', 'hasDebugMode', false],
            ['反向代理', 'hasProxy', false],
            ['中间进度', 'hasSendIntermediate', false]
        ],
        COMPARE_DIMENSIONS: [
            ['缺少 IIFE 封装', 'hasIIFE', '全局命名空间污染风险', '使用了 IIFE 封装', 'wrap module in IIFE'],
            ['缺少统一错误处理', 'hasWrapPattern', '错误处理不一致', '使用了 wrap 包装器', 'add wrapExecution()'],
            ['缺少截断保护', 'hasTruncation', '输出可能溢出 AI 上下文', '实现了截断函数', 'add truncateContent()'],
            ['缺少参数校验', 'hasParamValidation', '缺少必填参数验证', '进行了参数校验', 'add param validation'],
            ['缺少 test 工具', 'hasTestTool', '无法验证配置和连通性', '包含 test 自检', 'add test tool'],
            ['缺少 CONFIG 常量', 'hasConfig', '魔法值分散在代码中', '使用了 CONFIG 对象', 'extract to CONFIG'],
            ['缺少调试模式', 'hasDebugMode', '调试困难', '使用了 DEBUG 模式', 'add DEBUG via getEnv()'],
            ['缺少重试机制', 'hasRetry', '网络请求不稳定', '实现了重试逻辑', 'add retry with backoff']
        ]
    };

    var DEBUG = (function () {
        try {
            return (typeof getEnv === 'function' && getEnv('TOOLKIT_IMPROVE_DEBUG') === 'true');
        } catch (_) {
            return false;
        }
    })();

    function debugLog(msg, data) {
        if (!DEBUG) return;
        console.log('[ToolkitImprove] ' + msg);
        if (data !== undefined) {
            try { console.log(JSON.stringify(data, null, 2)); } catch (_) { console.log(String(data)); }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §2  基础工具函数
    // ═══════════════════════════════════════════════════════════════════════════

    function getExamplesDir() {
        var dir = '';
        try {
            dir = (typeof getEnv === 'function' ? getEnv('TOOLKIT_EXAMPLES_DIR') : '') || '';
        } catch (_) { }
        if (!dir || dir.trim() === '') dir = CONFIG.DEFAULT_EXAMPLES_DIR;
        if (!dir.endsWith('/')) dir += '/';
        return dir;
    }

    function getBackupDir() {
        return getExamplesDir() + CONFIG.BACKUP_DIR_NAME + '/';
    }

    function getSnapshotDir() {
        return getExamplesDir() + CONFIG.SNAPSHOT_DIR_NAME + '/';
    }

    function shouldBackup() {
        try {
            var val = (typeof getEnv === 'function') ? getEnv('TOOLKIT_IMPROVE_BACKUP') : null;
            if (val === 'false') return false;
        } catch (_) { }
        return true;
    }

    function getToolkitPath(name) {
        var n = name.trim();
        if (n.endsWith('.js') || n.endsWith('.ts')) {
            return getExamplesDir() + n;
        }
        return getExamplesDir() + n + '.js';
    }

    function getToolkitFileName(name) {
        var n = name.trim();
        if (!n.endsWith('.js') && !n.endsWith('.ts')) n += '.js';
        return n;
    }

    function truncateContent(content, maxLen) {
        if (!content) return '';
        var limit = maxLen || CONFIG.MAX_INLINE_OUTPUT;
        if (content.length <= limit) return content;
        return content.substring(0, limit) + '\n\n*(内容过长，已截断至 ' + limit + ' 字符)*';
    }

    function safeNumber(value, defaultVal, min, max) {
        if (value === undefined || value === null || value === '') return defaultVal;
        var num = Number(value);
        if (isNaN(num)) return defaultVal;
        return Math.max(min, Math.min(max, Math.round(num)));
    }

    function safeBool(value, defaultVal) {
        if (value === undefined || value === null || value === '') return defaultVal;
        if (typeof value === 'boolean') return value;
        var str = String(value).trim().toLowerCase();
        if (str === 'true' || str === '1' || str === 'yes') return true;
        if (str === 'false' || str === '0' || str === 'no') return false;
        return defaultVal;
    }

    function safeStr(value, defaultVal) {
        if (value === undefined || value === null) return defaultVal || '';
        return String(value).trim();
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function nowTimestamp() {
        return new Date().toLocaleString('zh-CN', { hour12: false });
    }

    function formatBytes(bytes) {
        if (!bytes || bytes < 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    function getDesc(descObj) {
        if (!descObj) return '';
        if (typeof descObj === 'string') return descObj;
        return descObj.zh || descObj.en || '';
    }

    function escapeTableCell(str) {
        if (!str) return '-';
        return String(str).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    function countOccurrences(str, target) {
        var count = 0;
        var pos = 0;
        while ((pos = str.indexOf(target, pos)) !== -1) {
            count++;
            pos += target.length;
        }
        return count;
    }

    function issuesByLevel(issues, level) {
        return issues.filter(function (i) { return i.level === level; });
    }

    function countByLevel(issues) {
        return {
            errors: issuesByLevel(issues, 'error').length,
            warns: issuesByLevel(issues, 'warn').length,
            infos: issuesByLevel(issues, 'info').length
        };
    }

    function levelIcon(level) {
        if (level === 'error') return '❌';
        if (level === 'warn') return '⚠️';
        return 'ℹ️';
    }

    function statusIcon(errorCount, warnCount) {
        if (errorCount > 0) return '❌';
        if (warnCount > 0) return '⚠️';
        return '✅';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §3  文件系统操作
    // ═══════════════════════════════════════════════════════════════════════════

    async function ensureDir(dirPath) {
        try {
            var exists = await Tools.Files.exists(dirPath, 'android');
            if (!exists || !exists.exists) {
                await Tools.Files.mkdir(dirPath, true, 'android');
            }
        } catch (e) {
            try { await Tools.Files.mkdir(dirPath, true, 'android'); } catch (_) { }
        }
    }

    async function readFile(filePath) {
        var result = await Tools.Files.read(filePath, 'android');
        if (!result || !result.content) {
            throw new Error('无法读取文件: ' + filePath);
        }
        return result.content;
    }

    async function writeFile(filePath, content) {
        await Tools.Files.write(filePath, content, false, 'android');
    }

    async function fileExists(filePath) {
        try {
            var result = await Tools.Files.exists(filePath, 'android');
            return !!(result && result.exists);
        } catch (_) {
            return false;
        }
    }

    async function listDir(dirPath) {
        var result = await Tools.Files.list(dirPath, 'android');
        if (!result || !Array.isArray(result.entries)) {
            return [];
        }
        return result.entries;
    }

    async function deleteFile(filePath) {
        try {
            if (typeof Tools.Files.delete === 'function') {
                await Tools.Files.delete(filePath, 'android');
                return true;
            }
        } catch (_) { }
        try {
            if (typeof Tools.System === 'object' && typeof Tools.System.shell === 'function') {
                var safePath = filePath.replace(/'/g, "'\\''");
                await Tools.System.shell('rm -f \'' + safePath + '\'');
                return true;
            }
        } catch (_) { }
        return false;
    }

    async function readToolkitSource(name) {
        var cleanName = name.trim().replace(/\.\./g, '').replace(/[\/\\:*?"<>|]/g, '');
        if (!cleanName) throw new Error('工具包名称无效');
        var baseName = cleanName.replace(/\.(js|ts)$/, '');
        if (!baseName || /^\./.test(baseName)) throw new Error('工具包名称无效: ' + name);
        var jsPath = getExamplesDir() + baseName + '.js';
        if (await fileExists(jsPath)) return await readFile(jsPath);
        var tsPath = getExamplesDir() + baseName + '.ts';
        if (await fileExists(tsPath)) return await readFile(tsPath);
        throw new Error('工具包文件不存在: ' + baseName + '（已检查 .js 和 .ts）');
    }

    async function createBackup(toolkitName) {
        if (!shouldBackup()) return null;
        var backupDir = getBackupDir();
        await ensureDir(backupDir);
        var fileName = getToolkitFileName(toolkitName);
        var timestamp = Date.now();
        var backupPath = backupDir + fileName + '.' + timestamp + CONFIG.BACKUP_SUFFIX;
        var sourcePath = getToolkitPath(toolkitName);
        var content = await readFile(sourcePath);
        await writeFile(backupPath, content);
        debugLog('备份已创建: ' + backupPath);
        return backupPath;
    }

    async function restoreBackup(backupPath, toolkitName) {
        if (!backupPath) return false;
        try {
            var content = await readFile(backupPath);
            var targetPath = getToolkitPath(toolkitName);
            await writeFile(targetPath, content);
            debugLog('已从备份恢复: ' + backupPath);
            return true;
        } catch (e) {
            console.error('[ToolkitImprove] 恢复备份失败: ' + e.message);
            return false;
        }
    }

    function listToolkitFiles(entries) {
        var files = [];
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.isDirectory) continue;
            if (!entry.name.endsWith('.js') && !entry.name.endsWith('.ts')) continue;
            if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
            files.push(entry);
        }
        return files;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §4  METADATA 解析引擎
    // ═══════════════════════════════════════════════════════════════════════════

    function extractMetadata(content) {
        var cleaned = content.replace(/^\uFEFF/, '');
        var metaRegex = /\/\*\s*METADATA\s*\n([\s\S]*?)\*\//;
        var match = cleaned.match(metaRegex);
        if (!match || !match[1]) return null;
        var rawMeta = match[1].trim();

        try {
            return JSON.parse(rawMeta);
        } catch (e) { }

        try {
            var normalized = rawMeta;
            normalized = normalized.replace(/^\s*\/\/.*$/gm, '');
            normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
            normalized = normalized.replace(/'''([\s\S]*?)'''/g, function (_, c) {
                return '"' + c.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
            });
            normalized = normalized.replace(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm, '"$1":');
            normalized = normalized.replace(/,\s*([\]}])/g, '$1');
            normalized = normalized.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, function (_, val) {
                return ': "' + val.replace(/"/g, '\\"') + '"';
            });
            return JSON.parse(normalized);
        } catch (e2) {
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §5  词法分析引擎
    // ═══════════════════════════════════════════════════════════════════════════

    function createLexerState() {
        return {
            inSingleQuote: false,
            inDoubleQuote: false,
            inTemplateLiteral: false,
            inLineComment: false,
            inBlockComment: false,
            inRegex: false,
            templateBraceDepth: [],
            escapeNext: false
        };
    }

    function isEscaped(code, pos) {
        var backslashCount = 0;
        var i = pos - 1;
        while (i >= 0 && code[i] === '\\') {
            backslashCount++;
            i--;
        }
        return backslashCount % 2 === 1;
    }

    function isRegexStart(code, pos) {
        var i = pos - 1;
        while (i >= 0 && (code[i] === ' ' || code[i] === '\t')) i--;
        if (i < 0) return true;
        var ch = code[i];
        if (/[a-zA-Z0-9_$)\]]/.test(ch)) return false;
        return true;
    }

    function checkBracketBalance(code) {
        var issues = [];
        var stack = [];
        var pairs = { '(': ')', '[': ']', '{': '}' };
        var closerToOpener = { ')': '(', ']': '[', '}': '{' };

        var line = 1;
        var col = 0;
        var len = code.length;
        var state = createLexerState();

        for (var i = 0; i < len; i++) {
            var c = code[i];
            var next = (i + 1 < len) ? code[i + 1] : '';
            col++;

            if (c === '\n') {
                line++;
                col = 0;
                if (state.inLineComment) state.inLineComment = false;
                continue;
            }

            if (state.inLineComment) continue;

            if (state.inBlockComment) {
                if (c === '*' && next === '/') {
                    state.inBlockComment = false;
                    i++;
                    col++;
                }
                continue;
            }

            if (state.inSingleQuote) {
                if (c === "'" && !isEscaped(code, i)) {
                    state.inSingleQuote = false;
                }
                continue;
            }

            if (state.inDoubleQuote) {
                if (c === '"' && !isEscaped(code, i)) {
                    state.inDoubleQuote = false;
                }
                continue;
            }

            if (state.inTemplateLiteral) {
                if (c === '`' && !isEscaped(code, i)) {
                    state.inTemplateLiteral = false;
                    continue;
                }
                if (c === '$' && next === '{' && !isEscaped(code, i)) {
                    state.inTemplateLiteral = false;
                    state.templateBraceDepth.push(1);
                    stack.push({ char: '{', line: line, col: col + 1, isTemplateBrace: true });
                    i++;
                    col++;
                    continue;
                }
                continue;
            }

            if (state.inRegex) {
                if (c === '/' && !isEscaped(code, i)) {
                    state.inRegex = false;
                    while (i + 1 < len && /[gimsuy]/.test(code[i + 1])) { i++; col++; }
                }
                continue;
            }

            if (c === '/' && next === '/') {
                state.inLineComment = true;
                i++;
                col++;
                continue;
            }
            if (c === '/' && next === '*') {
                state.inBlockComment = true;
                i++;
                col++;
                continue;
            }
            if (c === "'") {
                state.inSingleQuote = true;
                continue;
            }
            if (c === '"') {
                state.inDoubleQuote = true;
                continue;
            }
            if (c === '`') {
                state.inTemplateLiteral = true;
                continue;
            }
            if (c === '/' && isRegexStart(code, i)) {
                state.inRegex = true;
                continue;
            }

            if (c === '(' || c === '[' || c === '{') {
                stack.push({ char: c, line: line, col: col });
                if (state.templateBraceDepth.length > 0 && c === '{') {
                    state.templateBraceDepth[state.templateBraceDepth.length - 1]++;
                }
            } else if (c === ')' || c === ']' || c === '}') {
                if (c === '}' && state.templateBraceDepth.length > 0) {
                    var depth = state.templateBraceDepth[state.templateBraceDepth.length - 1];
                    depth--;
                    if (depth === 0) {
                        state.templateBraceDepth.pop();
                        state.inTemplateLiteral = true;
                        if (stack.length > 0 && stack[stack.length - 1].isTemplateBrace) {
                            stack.pop();
                        }
                        continue;
                    }
                    state.templateBraceDepth[state.templateBraceDepth.length - 1] = depth;
                }

                if (stack.length === 0) {
                    issues.push({
                        level: 'error',
                        line: line,
                        message: '多余的闭合符号 "' + c + '"',
                        suggestion: '删除多余的 "' + c + '" 或在前方添加匹配的 "' + closerToOpener[c] + '"'
                    });
                } else {
                    var top = stack[stack.length - 1];
                    if (pairs[top.char] !== c) {
                        issues.push({
                            level: 'error',
                            line: line,
                            message: '括号不匹配：期望 "' + pairs[top.char] + '" 但遇到 "' + c + '"（对应第 ' + top.line + ' 行）',
                            suggestion: '检查第 ' + top.line + ' 行的 "' + top.char + '" 与第 ' + line + ' 行的 "' + c + '"'
                        });
                    }
                    stack.pop();
                }
            }
        }

        while (stack.length > 0) {
            var unclosed = stack.pop();
            if (!unclosed.isTemplateBrace) {
                issues.push({
                    level: 'error',
                    line: unclosed.line,
                    message: '未闭合的 "' + unclosed.char + '"',
                    suggestion: '在适当位置添加 "' + pairs[unclosed.char] + '"'
                });
            }
        }

        if (state.inSingleQuote || state.inDoubleQuote) {
            issues.push({ level: 'error', line: line, message: '字符串未正确闭合', suggestion: '检查文件末尾是否有未闭合的引号' });
        }
        if (state.inBlockComment) {
            issues.push({ level: 'error', line: line, message: '块注释未闭合', suggestion: '添加 */ 闭合块注释' });
        }

        return issues;
    }

    // ── §6  代码风格检查器 ────────────────────────────────────────────────

    function checkSemicolons(code) {
        var issues = [];
        var lines = code.split('\n');
        var missCount = 0;
        var hasCount = 0;
        var inBlockComment = false;
        var inTemplateLiteral = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            if (inBlockComment) {
                var endIdx = line.indexOf('*/');
                if (endIdx !== -1) {
                    inBlockComment = false;
                    line = line.substring(endIdx + 2);
                    trimmed = line.trim();
                } else {
                    continue;
                }
            }

            if (inTemplateLiteral) {
                for (var ti = 0; ti < line.length; ti++) {
                    if (line[ti] === '`' && !isEscaped(line, ti)) {
                        inTemplateLiteral = false;
                        break;
                    }
                }
                if (inTemplateLiteral) continue;
                continue;
            }

            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
            if (trimmed.startsWith('/*') && trimmed.indexOf('*/') === -1) { inBlockComment = true; continue; }
            if (trimmed.startsWith('/*') && trimmed.indexOf('*/') !== -1) continue;

            var hasUnclosedTemplate = false;
            var tmpInStr = false, tmpStrCh = '';
            for (var ci = 0; ci < line.length; ci++) {
                var ch = line[ci];
                if (tmpInStr) {
                    if (ch === tmpStrCh && !isEscaped(line, ci)) tmpInStr = false;
                    continue;
                }
                if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '/') break;
                if (ch === "'" || ch === '"') { tmpInStr = true; tmpStrCh = ch; continue; }
                if (ch === '`' && !isEscaped(line, ci)) { hasUnclosedTemplate = !hasUnclosedTemplate; }
            }
            if (hasUnclosedTemplate) { inTemplateLiteral = true; continue; }

            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
            if (trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed.endsWith('(') ||
                trimmed.endsWith(',') || trimmed.endsWith(':') || trimmed.endsWith('*/') ||
                trimmed.endsWith('\\') || trimmed.endsWith('=>')) continue;
            if (trimmed.endsWith('&&') || trimmed.endsWith('||') || trimmed.endsWith('??') ||
                trimmed.endsWith('+') || trimmed.endsWith('|') || trimmed.endsWith('&')) continue;
            if (/^(if|else|for|while|switch|case|default|try|catch|finally|break|continue)\b/.test(trimmed)) continue;
            if (/^(return|throw)\s*$/.test(trimmed)) continue;
            if (/^(function|async\s+function|class|const|let|var)\s/.test(trimmed) && trimmed.endsWith('{')) continue;
            if (/^\}/.test(trimmed)) continue;
            if (/^(import|export)\b/.test(trimmed)) continue;
            if (/^\*/.test(trimmed)) continue;
            if (/^[.?&|+\-]/.test(trimmed)) continue;
            if (/^['"`]/.test(trimmed) && !/;$/.test(trimmed)) continue;

            if (trimmed.endsWith(';')) {
                hasCount++;
            } else if (/[a-zA-Z0-9_)\]'"]$/.test(trimmed)) {
                missCount++;
            }
        }

        if (hasCount > 0 && missCount > 0) {
            var ratio = missCount / (missCount + hasCount);
            if (ratio > CONFIG.SEMICOLON_MIX_MIN && ratio < CONFIG.SEMICOLON_MIX_MAX) {
                issues.push({
                    level: 'warn',
                    line: 0,
                    message: '分号使用不一致：' + hasCount + ' 行有分号，' + missCount + ' 行缺少',
                    suggestion: '统一分号风格。混合率 ' + (ratio * 100).toFixed(0) + '%'
                });
            }
        }

        return issues;
    }

    function analyzeNesting(code) {
        var issues = [];
        var lines = code.split('\n');
        var maxNesting = 0;
        var currentNesting = 0;
        var maxNestingLine = 0;
        var inString = false;
        var strChar = '';
        var inBlockComment = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            for (var ci = 0; ci < line.length; ci++) {
                var ch = line[ci];
                if (inBlockComment) {
                    if (ch === '*' && ci + 1 < line.length && line[ci + 1] === '/') {
                        inBlockComment = false;
                        ci++;
                    }
                    continue;
                }
                if (inString) {
                    if (ch === strChar && !isEscaped(line, ci)) inString = false;
                    continue;
                }
                if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '/') break;
                if (ch === '/' && ci + 1 < line.length && line[ci + 1] === '*') { inBlockComment = true; ci++; continue; }
                if (ch === "'" || ch === '"' || ch === '`') { inString = true; strChar = ch; continue; }
                if (ch === '{') currentNesting++;
                else if (ch === '}') currentNesting--;
            }
            if (currentNesting > maxNesting) {
                maxNesting = currentNesting;
                maxNestingLine = i + 1;
            }
        }

        if (maxNesting > CONFIG.NESTING_WARN) {
            issues.push({
                level: 'warn',
                line: maxNestingLine,
                message: '嵌套深度过深：最大 ' + maxNesting + ' 层',
                suggestion: '使用提前返回、提取子函数或扁平化逻辑来降低嵌套'
            });
        } else if (maxNesting > CONFIG.NESTING_INFO) {
            issues.push({
                level: 'info',
                line: maxNestingLine,
                message: '嵌套深度较深：最大 ' + maxNesting + ' 层',
                suggestion: '可考虑适当重构'
            });
        }

        return issues;
    }

    function checkNamingConventions(code) {
        var issues = [];
        var declRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
        var camelCount = 0;
        var snakeCount = 0;
        var match;

        while ((match = declRegex.exec(code)) !== null) {
            var name = match[1];
            if (name === name.toUpperCase()) continue;
            if (/_/.test(name) && name !== name.toLowerCase()) continue;
            if (/_/.test(name)) snakeCount++;
            else if (/[A-Z]/.test(name)) camelCount++;
        }

        if (camelCount > 5 && snakeCount > 5) {
            issues.push({
                level: 'info',
                line: 0,
                message: '变量命名风格混用：约 ' + camelCount + ' 处 camelCase，' + snakeCount + ' 处 snake_case',
                suggestion: '推荐 camelCase 用于变量/函数，UPPER_CASE 用于常量'
            });
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §7  安全检查器
    // ═══════════════════════════════════════════════════════════════════════════

    function checkSecurityIssues(code) {
        var issues = [];
        var lines = code.split('\n');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

            var isInDetector = /\.test\s*\(|\/eval|'eval'|"eval"|check.*eval|detect.*eval/i.test(trimmed);

            for (var p = 0; p < CONFIG.SECRET_PATTERNS.length; p++) {
                if (CONFIG.SECRET_PATTERNS[p].test(line)) {
                    if (CONFIG.SECRET_WHITELIST.test(line)) continue;
                    issues.push({
                        level: 'error',
                        line: i + 1,
                        message: '疑似硬编码密钥或令牌',
                        suggestion: '使用 getEnv() 从环境变量中读取密钥'
                    });
                    break;
                }
            }

            if (/eval\s*\(/.test(trimmed) && !isInDetector) {
                issues.push({
                    level: 'error',
                    line: i + 1,
                    message: '使用了 eval()，存在代码注入风险',
                    suggestion: '使用 JSON.parse() 或其他安全替代方案'
                });
            }

            if (/new\s+Function\s*\(/.test(trimmed) && !isInDetector) {
                issues.push({
                    level: 'warn',
                    line: i + 1,
                    message: '使用了 new Function()，可能存在安全风险',
                    suggestion: '评估是否可用更安全的替代方案'
                });
            }

            if (/Tools\.System\.shell\s*\(/.test(trimmed) && /params\.\w+/.test(trimmed) && !/escape|sanitize|replace/.test(trimmed)) {
                issues.push({
                    level: 'warn',
                    line: i + 1,
                    message: 'Shell 命令可能包含未转义的用户输入',
                    suggestion: '对 params 参数进行转义后再拼入 shell 命令'
                });
            }

            if (/Tools\.System\.terminal\.\s*exec\s*\(/.test(trimmed) && /params\.\w+/.test(trimmed) && !/escape|sanitize|replace/.test(trimmed)) {
                issues.push({
                    level: 'warn',
                    line: i + 1,
                    message: '终端命令可能包含未转义的用户输入',
                    suggestion: '对 params 参数进行转义后再拼入终端命令'
                });
            }

            if (/\.\.\/|\.\.\\/.test(trimmed) && /params\.\w+/.test(trimmed) && !/replace|filter|sanitize|reject/.test(trimmed)) {
                issues.push({
                    level: 'warn',
                    line: i + 1,
                    message: '可能存在路径遍历风险',
                    suggestion: '校验文件路径参数，过滤 ".." 序列'
                });
            }

            if (/Tools\.Files\.\w+\s*\(/.test(trimmed) && /params\.\w+/.test(trimmed) && !/replace|sanitize|clean/.test(trimmed)) {
                if (!/getToolkitPath|getExamplesDir|safePath/.test(trimmed)) {
                    issues.push({
                        level: 'info',
                        line: i + 1,
                        message: '文件操作使用了用户参数，建议校验路径',
                        suggestion: '过滤 params 中的 ".." 和绝对路径前缀'
                    });
                }
            }
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §8  complete() 覆盖率检查
    // ═══════════════════════════════════════════════════════════════════════════

    function checkCompleteCallCoverage(code) {
        var issues = [];
        var hasComplete = /\bcomplete\s*\(/.test(code);
        if (!hasComplete) {
            issues.push({
                level: 'error',
                line: 0,
                message: '代码中未找到 complete() 调用',
                suggestion: '确保所有工具函数最终调用 complete()'
            });
            return issues;
        }

        var wrapRegex = /(?:function\s+)?wrap(?:ToolExecution|Execution)?\s*\(/;
        var hasWrapPattern = wrapRegex.test(code);

        if (!hasWrapPattern) {
            var tryCatchCount = (code.match(/try\s*\{/g) || []).length;
            var completeInCatchCount = (code.match(/catch\s*\([^)]*\)\s*\{[\s\S]*?complete\s*\(/g) || []).length;

            if (tryCatchCount > 0 && completeInCatchCount < tryCatchCount * 0.5) {
                issues.push({
                    level: 'warn',
                    line: 0,
                    message: 'catch 块中 complete() 覆盖率不足：' + completeInCatchCount + '/' + tryCatchCount,
                    suggestion: '确保所有 catch 块调用 complete({ success: false, ... })'
                });
            }
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §9  杂项检查器
    // ═══════════════════════════════════════════════════════════════════════════

    function checkTodoFixme(code) {
        var issues = [];
        var lines = code.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var upper = lines[i].toUpperCase();
            if (upper.indexOf('TODO') !== -1 || upper.indexOf('FIXME') !== -1 ||
                upper.indexOf('HACK') !== -1 || upper.indexOf('XXX') !== -1) {
                issues.push({
                    level: 'info',
                    line: i + 1,
                    message: '待处理标记: ' + lines[i].trim().substring(0, 80),
                    suggestion: '处理或清理此标记'
                });
            }
        }
        return issues;
    }

    function checkConsoleUsage(code) {
        var issues = [];
        var consoleLogCount = (code.match(/console\.log\s*\(/g) || []).length;
        if (consoleLogCount > CONFIG.CONSOLE_LOG_WARN) {
            issues.push({
                level: 'info',
                line: 0,
                message: 'console.log 调用较多（' + consoleLogCount + ' 处）',
                suggestion: '使用调试开关（DEBUG）控制日志输出'
            });
        }
        return issues;
    }

    function checkTruncation(code) {
        var issues = [];
        var hasComplete = /\bcomplete\s*\(/.test(code);
        if (!hasComplete) return issues;

        var hasTruncate = /truncat/i.test(code);
        var hasMaxOutput = /MAX_(?:OUTPUT|INLINE|CONTENT|CHARS)/i.test(code);
        var hasSubstring = /\.substring\s*\(\s*0\s*,/.test(code);

        if (!hasTruncate && !hasMaxOutput && !hasSubstring) {
            var hasDataString = /data:\s*(?:output|result|buffer|content|report|lines)/i.test(code);
            if (hasDataString) {
                issues.push({
                    level: 'warn',
                    line: 0,
                    message: '未发现输出截断保护',
                    suggestion: '添加 truncateContent() 防止超长输出溢出上下文'
                });
            }
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §10  函数复杂度分析
    // ═══════════════════════════════════════════════════════════════════════════

    function analyzeFunctionComplexity(code) {
        var issues = [];
        var funcRegex = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
        var arrowRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{/g;
        var functions = [];
        var match;

        while ((match = funcRegex.exec(code)) !== null) {
            functions.push({ name: match[1], startIndex: match.index });
        }
        while ((match = arrowRegex.exec(code)) !== null) {
            functions.push({ name: match[1], startIndex: match.index });
        }

        functions.sort(function (a, b) { return a.startIndex - b.startIndex; });

        for (var f = 0; f < functions.length; f++) {
            var startIdx = functions[f].startIndex;
            var funcName = functions[f].name;
            var braceCount = 0;
            var started = false;
            var endIdx = startIdx;
            var funcLines = 0;
            var cyclomaticComplexity = 1;

            var inStr = false, sChar = '', inLC = false, inBC = false;
            for (var j = startIdx; j < code.length; j++) {
                var cc = code[j];
                if (cc === '\n') { funcLines++; inLC = false; continue; }
                if (inLC) continue;
                if (inBC) { if (cc === '/' && j > 0 && code[j - 1] === '*') inBC = false; continue; }
                if (inStr) { if (cc === sChar && !isEscaped(code, j)) inStr = false; continue; }
                if (cc === '/' && j + 1 < code.length && code[j + 1] === '/') { inLC = true; continue; }
                if (cc === '/' && j + 1 < code.length && code[j + 1] === '*') { inBC = true; j++; continue; }
                if (cc === "'" || cc === '"' || cc === '`') { inStr = true; sChar = cc; continue; }
                if (cc === '{') { braceCount++; started = true; }
                else if (cc === '}') { braceCount--; }
                if (started && braceCount === 0) { endIdx = j; break; }
            }

            var funcBody = code.substring(startIdx, endIdx + 1);
            cyclomaticComplexity += (funcBody.match(/\bif\s*\(/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/\bwhile\s*\(/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/\bfor\s*\(/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/\bcase\s+/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/\bcatch\s*\(/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/\?[^?:]*:/g) || []).length;
            cyclomaticComplexity += (funcBody.match(/&&|\|\|/g) || []).length;

            var lineNum = code.substring(0, startIdx).split('\n').length;

            if (funcLines > CONFIG.FUNC_LENGTH_WARN) {
                issues.push({
                    level: 'warn',
                    line: lineNum,
                    message: '函数 "' + funcName + '" 过长（' + funcLines + ' 行）',
                    suggestion: '拆分为多个子函数，建议单函数 ≤100 行'
                });
            }

            if (cyclomaticComplexity > CONFIG.COMPLEXITY_WARN_THRESHOLD) {
                issues.push({
                    level: 'warn',
                    line: lineNum,
                    message: '函数 "' + funcName + '" 圈复杂度过高（' + cyclomaticComplexity + '）',
                    suggestion: '建议 ≤15，请重构分支逻辑'
                });
            } else if (cyclomaticComplexity > CONFIG.COMPLEXITY_INFO_THRESHOLD) {
                issues.push({
                    level: 'info',
                    line: lineNum,
                    message: '函数 "' + funcName + '" 圈复杂度较高（' + cyclomaticComplexity + '）',
                    suggestion: '可考虑简化条件逻辑'
                });
            }
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §11  重复代码检测
    // ═══════════════════════════════════════════════════════════════════════════

    function detectDuplicateBlocks(code) {
        var issues = [];
        var lines = code.split('\n');
        var blockSize = CONFIG.DUPLICATE_BLOCK_SIZE;
        var seen = Object.create(null);

        if (lines.length < blockSize * 2) return issues;

        for (var i = 0; i <= lines.length - blockSize; i++) {
            var block = [];
            var allEmpty = true;
            for (var j = 0; j < blockSize; j++) {
                var trimmed = lines[i + j].trim();
                block.push(trimmed);
                if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') &&
                    trimmed !== '{' && trimmed !== '}' && trimmed !== '});' && trimmed !== '})();') {
                    allEmpty = false;
                }
            }
            if (allEmpty) continue;

            var key = block.join('\n');
            if (key.length < CONFIG.DUPLICATE_MIN_CHARS) continue;

            if (seen[key]) {
                if (seen[key].count === 1) {
                    issues.push({
                        level: 'info',
                        line: seen[key].firstLine,
                        message: '重复代码块（' + blockSize + ' 行）：第 ' + seen[key].firstLine + ' 行与第 ' + (i + 1) + ' 行',
                        suggestion: '考虑提取为共用函数'
                    });
                }
                seen[key].count++;
            } else {
                seen[key] = { firstLine: i + 1, count: 1 };
            }
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §12  METADATA 校验引擎
    // ═══════════════════════════════════════════════════════════════════════════

    function validateMetadata(meta, code, fileName) {
        var issues = [];
        if (!meta) {
            issues.push({
                level: 'error', field: 'METADATA', line: 0,
                message: 'METADATA 解析失败或不存在',
                suggestion: '确保文件顶部有正确的 /* METADATA {...} */ 块'
            });
            return issues;
        }

        if (!meta.name) {
            issues.push({ level: 'error', field: 'name', line: 0, message: '缺少 name 字段', suggestion: '添加 name 字段' });
        } else {
            if (!CONFIG.NAMING_PATTERN.test(meta.name)) {
                issues.push({ level: 'error', field: 'name', line: 0, message: 'name 不符合命名规范: ' + meta.name, suggestion: '格式: /^[a-z][a-z0-9_]*$/' });
            }
            var expectedName = fileName.replace(/\.(js|ts)$/, '');
            if (meta.name !== expectedName) {
                issues.push({ level: 'error', field: 'name', line: 0, message: 'name 与文件名不一致: "' + meta.name + '" vs "' + expectedName + '"', suggestion: '改为 "' + expectedName + '"' });
            }
        }

        if (!meta.description) {
            issues.push({ level: 'error', field: 'description', line: 0, message: '缺少 description', suggestion: '添加 { zh: "...", en: "..." }' });
        } else if (typeof meta.description === 'string') {
            issues.push({ level: 'warn', field: 'description', line: 0, message: 'description 为纯字符串，建议改为双语对象', suggestion: '改为 { zh: "...", en: "..." }' });
            if (meta.description.length < CONFIG.DESC_MIN_LENGTH) {
                issues.push({ level: 'warn', field: 'description', line: 0, message: '描述过短（' + meta.description.length + ' 字符）', suggestion: '扩充至 50+ 字符' });
            }
        } else if (typeof meta.description === 'object') {
            if (!meta.description.zh) {
                issues.push({ level: 'warn', field: 'description.zh', line: 0, message: '缺少中文描述', suggestion: '添加中文描述' });
            }
            if (!meta.description.en) {
                issues.push({ level: 'warn', field: 'description.en', line: 0, message: '缺少英文描述', suggestion: '添加英文描述' });
            }
            var zhDesc = getDesc(meta.description);
            if (zhDesc && zhDesc.length < CONFIG.DESC_MIN_LENGTH) {
                issues.push({ level: 'warn', field: 'description', line: 0, message: '描述过短（' + zhDesc.length + ' 字符）', suggestion: '扩充至 50+ 字符' });
            }
        }

        if (meta.category) {
            if (CONFIG.VALID_CATEGORIES.indexOf(meta.category.toUpperCase()) === -1) {
                issues.push({ level: 'error', field: 'category', line: 0, message: '无效 category: "' + meta.category + '"', suggestion: '有效值: ' + CONFIG.VALID_CATEGORIES.join(', ') });
            }
        } else {
            issues.push({ level: 'info', field: 'category', line: 0, message: '未指定 category', suggestion: '建议添加' });
        }

        if (!meta.display_name) {
            issues.push({ level: 'info', field: 'display_name', line: 0, message: '缺少 display_name', suggestion: '建议添加 { zh: "...", en: "..." }' });
        }

        if (!meta.version) {
            issues.push({ level: 'info', field: 'version', line: 0, message: '未指定 version', suggestion: '建议添加 version' });
        }

        if (!Array.isArray(meta.tools) || meta.tools.length === 0) {
            issues.push({ level: 'error', field: 'tools', line: 0, message: 'tools 为空或缺失', suggestion: '至少声明一个工具' });
        } else {
            var toolNames = {};
            meta.tools.forEach(function (tool, idx) {
                if (!tool.name) {
                    issues.push({ level: 'error', field: 'tools[' + idx + '].name', line: 0, message: '工具缺少 name', suggestion: '添加 name' });
                    return;
                }
                if (!CONFIG.NAMING_PATTERN.test(tool.name)) {
                    issues.push({ level: 'error', field: 'tools[' + idx + '].name', line: 0, message: '工具名不合规: "' + tool.name + '"', suggestion: '格式: /^[a-z][a-z0-9_]*$/' });
                }
                if (toolNames[tool.name]) {
                    issues.push({ level: 'error', field: 'tools[' + idx + '].name', line: 0, message: '工具名重复: "' + tool.name + '"', suggestion: '重命名' });
                }
                toolNames[tool.name] = true;

                if (!tool.description) {
                    issues.push({ level: 'warn', field: 'tools[' + idx + '].description', line: 0, message: '工具 "' + tool.name + '" 缺少描述', suggestion: '添加双语描述' });
                }

                if (!tool.advice) {
                    var exportPattern = new RegExp('exports\\s*\\.\\s*' + tool.name + '\\s*=');
                    if (!exportPattern.test(code)) {
                        issues.push({ level: 'error', field: 'exports.' + tool.name, line: 0, message: '工具 "' + tool.name + '" 已声明但未导出', suggestion: '添加 exports.' + tool.name + ' = ...' });
                    }
                }

                if (Array.isArray(tool.parameters)) {
                    tool.parameters.forEach(function (param, pIdx) {
                        if (!param.name) {
                            issues.push({ level: 'error', field: 'tools[' + idx + '].parameters[' + pIdx + ']', line: 0, message: '参数缺少 name', suggestion: '添加 name' });
                        }
                        if (param.type && CONFIG.VALID_PARAM_TYPES.indexOf(param.type) === -1) {
                            issues.push({ level: 'error', field: 'tools[' + idx + '].parameters[' + pIdx + '].type', line: 0, message: '无效参数类型: "' + param.type + '"', suggestion: '有效: ' + CONFIG.VALID_PARAM_TYPES.join(', ') });
                        }
                        if (!param.type) {
                            issues.push({ level: 'info', field: 'tools[' + idx + '].parameters[' + pIdx + '].type', line: 0, message: '参数 "' + (param.name || '?') + '" 未指定 type', suggestion: '建议指定类型' });
                        }
                        if (param.required === undefined) {
                            issues.push({ level: 'info', field: 'tools[' + idx + '].parameters[' + pIdx + '].required', line: 0, message: '参数 "' + (param.name || '?') + '" 未声明 required', suggestion: '显式声明 required: true/false' });
                        }
                    });
                }
            });
        }

        if (Array.isArray(meta.env)) {
            meta.env.forEach(function (envVar, idx) {
                if (!envVar.name) {
                    issues.push({ level: 'error', field: 'env[' + idx + ']', line: 0, message: '环境变量缺少 name', suggestion: '添加 name' });
                } else if (!/^[A-Z][A-Z0-9_]*$/.test(envVar.name)) {
                    issues.push({ level: 'warn', field: 'env[' + idx + '].name', line: 0, message: '命名不合规: "' + envVar.name + '"', suggestion: '使用 UPPER_CASE' });
                }
                if (envVar.required === undefined) {
                    issues.push({ level: 'warn', field: 'env[' + idx + '].required', line: 0, message: '"' + (envVar.name || '') + '" 未声明 required', suggestion: '显式声明' });
                }
            });
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §12b  命名一致性检测（return对象 / exports / METADATA 三方校验）
    // ═══════════════════════════════════════════════════════════════════════════

    function checkNamingConsistency(code, meta) {
        var issues = [];

        // ── 1. 提取 IIFE return 对象方法名（深度感知解析器）────────────────
        var returnMethods = [];
        var lastReturnIdx = -1;
        var returnSearchPattern = /\n\s+return\s*\{/g;
        var rsm;
        while ((rsm = returnSearchPattern.exec(code)) !== null) {
            lastReturnIdx = rsm.index;
        }
        if (lastReturnIdx === -1) {
            var simpleReturnIdx = code.lastIndexOf('return {');
            if (simpleReturnIdx !== -1) lastReturnIdx = simpleReturnIdx;
        }
        if (lastReturnIdx !== -1) {
            var braceStart = code.indexOf('{', lastReturnIdx + 6);
            if (braceStart !== -1) {
                // 找到匹配的闭合括号
                var rDepth = 0, returnEnd = -1;
                var rInStr = false, rStrChar = '';
                for (var ri = braceStart; ri < code.length; ri++) {
                    var rc = code[ri];
                    if (rInStr) { if (rc === rStrChar && code[ri - 1] !== '\\') rInStr = false; continue; }
                    if (rc === '"' || rc === "'" || rc === '`') { rInStr = true; rStrChar = rc; continue; }
                    if (rc === '{') rDepth++;
                    else if (rc === '}') { rDepth--; if (rDepth === 0) { returnEnd = ri; break; } }
                }
                if (returnEnd > braceStart) {
                    // 深度感知：仅提取 depth=0 的顶层属性名
                    var rb = code.substring(braceStart + 1, returnEnd);
                    var rbLen = rb.length;
                    var rbDepth = 0, rbInStr = false, rbStrChar = '';
                    for (var rj = 0; rj < rbLen; rj++) {
                        var rjc = rb[rj];
                        if (rbInStr) { if (rjc === rbStrChar && (rj === 0 || rb[rj - 1] !== '\\')) rbInStr = false; continue; }
                        if (rjc === '"' || rjc === "'" || rjc === '`') { rbInStr = true; rbStrChar = rjc; continue; }
                        if (rjc === '{' || rjc === '(' || rjc === '[') { rbDepth++; continue; }
                        if (rjc === '}' || rjc === ')' || rjc === ']') { rbDepth--; continue; }
                        // 仅在 depth=0 时尝试匹配属性名
                        if (rbDepth === 0) {
                            var tail = rb.slice(rj);
                            var idMatch = tail.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
                            if (idMatch) {
                                returnMethods.push(idMatch[1]);
                                rj += idMatch[0].length - 1; // -1 因为 for 会 ++
                            }
                        }
                    }
                }
            }
        }

        // ── 2. 提取 exports.xxx 导出名 ─────────────────────────────────────
        var exportNames = [];
        var exportRegex = /exports\s*\.\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;
        var em;
        while ((em = exportRegex.exec(code)) !== null) {
            exportNames.push(em[1]);
        }

        // ── 3. 提取 METADATA 工具名 ────────────────────────────────────────
        var metaTools = [];
        if (meta && Array.isArray(meta.tools)) {
            meta.tools.forEach(function (t) { if (t.name) metaTools.push(t.name); });
        }

        // ── 辅助：命名转换 ─────────────────────────────────────────────────
        function toSnakeCase(s) {
            return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        }
        function toCamelCase(s) {
            return s.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
        }
        function findAlias(name, list) {
            if (list.indexOf(name) !== -1) return name;
            var snake = toSnakeCase(name);
            var camel = toCamelCase(name);
            if (list.indexOf(snake) !== -1) return snake;
            if (list.indexOf(camel) !== -1) return camel;
            return null;
        }

        // ── 4. exports vs return 对象 ─────────────────────────────────────
        if (returnMethods.length > 0 && exportNames.length > 0) {
            exportNames.forEach(function (name) {
                if (returnMethods.indexOf(name) === -1) {
                    var alias = findAlias(name, returnMethods);
                    if (alias) {
                        issues.push({
                            level: 'error', field: 'naming.exports.' + name, line: 0,
                            message: '命名不一致: exports."' + name + '" 但 return 对象中是 "' + alias + '"',
                            suggestion: '将 return 对象中的 "' + alias + '" 统一改为 "' + name + '"（与导出名对齐）'
                        });
                    } else {
                        issues.push({
                            level: 'error', field: 'naming.exports.' + name, line: 0,
                            message: 'exports."' + name + '" 在 return 对象中无对应方法',
                            suggestion: '在 return {} 中添加 "' + name + ': function(params){...}" 或修正拼写'
                        });
                    }
                }
            });
            returnMethods.forEach(function (name) {
                if (exportNames.indexOf(name) === -1 && findAlias(name, exportNames) === null) {
                    issues.push({
                        level: 'warn', field: 'naming.return.' + name, line: 0,
                        message: 'return 对象方法 "' + name + '" 未被导出',
                        suggestion: '添加 exports.' + name + ' = MODULE.' + name + '; 或确认是否需要公开'
                    });
                }
            });
        }

        // ── 5. METADATA tools vs exports ─────────────────────────────────
        if (metaTools.length > 0 && exportNames.length > 0) {
            metaTools.forEach(function (name) {
                if (exportNames.indexOf(name) === -1) {
                    var alias = returnMethods.length > 0 ? findAlias(name, returnMethods) : null;
                    var suffix = alias ? '（return 中有 "' + alias + '"，存在命名不一致）' : '';
                    issues.push({
                        level: 'error', field: 'naming.METADATA.' + name, line: 0,
                        message: 'METADATA 工具 "' + name + '" 无对应 exports 语句' + suffix,
                        suggestion: alias
                            ? '将 return 对象中 "' + alias + '" 重命名为 "' + name + '"，并添加 exports.' + name + ' = MODULE.' + name
                            : '添加 exports.' + name + ' = MODULE.' + name
                    });
                }
            });
        }

        // ── 6. 生成三方一致性摘要（仅在有 return 方法时） ────────────────
        if (returnMethods.length > 0 && (exportNames.length > 0 || metaTools.length > 0) && issues.length === 0) {
            // 全部一致，不产生 issue（静默通过）
        }

        return issues;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §13  架构与模式分析
    // ═══════════════════════════════════════════════════════════════════════════

    function analyzeArchitecture(code) {
        var patterns = {
            hasIIFE: /\(function\s*\(\)\s*\{/.test(code) || /\(\(\)\s*=>\s*\{/.test(code),
            hasConfig: /(?:const|var)\s+CONFIG\s*=/.test(code),
            hasHttpClient: /OkHttp\.newClient\(\)/.test(code) || /Tools\.Net\./.test(code),
            hasWrapPattern: /(?:function\s+)?wrap(?:ToolExecution|Execution|Tool)?\s*\(/i.test(code),
            hasComplete: /\bcomplete\s*\(/.test(code),
            hasExports: /exports\.\w+\s*=/.test(code),
            hasTryCatch: /try\s*\{/.test(code),
            hasAsyncAwait: /async\s+function|await\s+/.test(code),
            hasEnvRead: /getEnv\s*\(/.test(code),
            hasProxy: /(?:proxy|PROXY).*(?:getEnv|URL)/i.test(code) || /PROXY_URL|proxyUrl|proxy_url/.test(code),
            hasRetry: /retry|RETRY|retryCount|maxRetries|withRetry/i.test(code) && /(?:for|while)\s*\(/.test(code),
            hasTruncation: /truncat/i.test(code) && /\.substring|\.slice/.test(code),
            hasSendIntermediate: /sendIntermediateResult/.test(code),
            hasDebugMode: /(?:var|const|let)\s+DEBUG\b/.test(code),
            hasTestTool: /exports\.test\s*=/.test(code) || /"name"\s*:\s*"test"/.test(code),
            hasCache: /(?:var|const|let)\s+_?[Cc]ache\s*=/.test(code) || /readJsonCache|writeJsonCache|readCache|writeCache/.test(code),
            hasParamValidation: /(?:if\s*\(\s*!params\.\w+|if\s*\(\s*!safeStr\(params|'缺少必填参数'|"缺少必填参数"|params\.\w+\s*===\s*(?:undefined|null))/.test(code),
            lineCount: code.split('\n').length,
            charCount: code.length,
            functionCount: (code.match(/(?:async\s+)?function\s+\w+/g) || []).length,
            exportCount: (code.match(/exports\.\w+\s*=/g) || []).length
        };

        var complexityLevel = 'simple';
        if (patterns.lineCount > 1000) complexityLevel = 'complex';
        else if (patterns.lineCount > 400) complexityLevel = 'medium';

        var qualityScore = 0;
        var weights = CONFIG.QUALITY_WEIGHTS;
        var keys = Object.keys(weights);
        for (var k = 0; k < keys.length; k++) {
            if (patterns[keys[k]]) qualityScore += weights[keys[k]];
        }

        patterns.complexityLevel = complexityLevel;
        patterns.qualityScore = Math.min(qualityScore, 100);

        return patterns;
    }

    function extractCodePatterns(code) {
        var patterns = [];

        if (/(?:const|var)\s+\w+\s*=\s*\(function\s*\(\)\s*\{/.test(code)) {
            var iifeMatch = code.match(/(?:const|var)\s+(\w+)\s*=\s*\(function\s*\(\)\s*\{/);
            patterns.push({ type: 'architecture', name: 'IIFE 封装', detail: '变量名: ' + (iifeMatch ? iifeMatch[1] : '?'), quality: 'good' });
        }

        if (/(?:async\s+)?function\s+wrap\w*\s*\([^)]*\)\s*\{[\s\S]{10,300}?complete\s*\(/.test(code)) {
            patterns.push({ type: 'error_handling', name: 'wrap 包装器', detail: '统一错误处理包装器', quality: 'good' });
        }

        if (/(?:for|while)\s*\([^)]*retry[^)]*\)[\s\S]{10,500}?(?:sleep|setTimeout)/i.test(code)) {
            patterns.push({ type: 'retry', name: '重试机制', detail: '重试循环 + 延迟等待', quality: 'good' });
        }

        if (/function\s+truncate\w*\s*\([^)]*\)\s*\{[\s\S]{10,300}?substring/.test(code)) {
            patterns.push({ type: 'output', name: '截断保护', detail: '输出截断函数', quality: 'good' });
        }

        if (/(?:readJsonCache|writeJsonCache|readCache|writeCache|new\s+Map\(\))/.test(code)) {
            patterns.push({ type: 'cache', name: '缓存机制', detail: '缓存系统', quality: 'good' });
        }

        if (/if\s*\(\s*!(?:params\.\w+|safeStr\(params)/.test(code)) {
            patterns.push({ type: 'validation', name: '参数校验', detail: '必填参数校验', quality: 'good' });
        }

        if (/function\s+(?:getApiKey|safeGetEnv|getEnvVar)\s*\(/.test(code)) {
            patterns.push({ type: 'validation', name: '环境变量封装', detail: '封装环境变量读取', quality: 'good' });
        }

        if (/(?:proxy|PROXY).*(?:getEnv|process\.env)/i.test(code)) {
            patterns.push({ type: 'http', name: '反向代理支持', detail: '环境变量配置代理', quality: 'good' });
        }

        if (/sendIntermediateResult/.test(code)) {
            patterns.push({ type: 'output', name: '中间进度推送', detail: 'sendIntermediateResult', quality: 'good' });
        }

        if (/function\s+debugLog\s*\(/.test(code)) {
            patterns.push({ type: 'architecture', name: '调试日志', detail: '条件调试日志', quality: 'good' });
        }

        if (/(?:const|var)\s+CONFIG\s*=\s*\{/.test(code)) {
            patterns.push({ type: 'architecture', name: '集中配置', detail: 'CONFIG 对象管理常量', quality: 'good' });
        }

        if (/Promise\.all(?:Settled)?\s*\(/.test(code)) {
            patterns.push({ type: 'performance', name: '并发执行', detail: 'Promise.all/allSettled', quality: 'good' });
        }

        if (/function\s+(?:buildQueryString|encodeURIComponent)/.test(code) || /encodeURIComponent/.test(code)) {
            patterns.push({ type: 'http', name: 'URL 参数序列化', detail: 'URL 编码处理', quality: 'good' });
        }

        if (/exports\.test\s*=/.test(code)) {
            patterns.push({ type: 'testing', name: 'test 自检工具', detail: '包含连通性/功能自检', quality: 'good' });
        }

        if (/function\s+(?:robustJsonParse|safeJsonParse|parseJson)\s*\(/.test(code)) {
            patterns.push({ type: 'validation', name: '鲁棒 JSON 解析', detail: '容错 JSON 解析', quality: 'good' });
        }

        if (/(?:formatBytes|formatSize)\s*\(/.test(code)) {
            patterns.push({ type: 'output', name: '字节格式化', detail: '文件大小友好显示', quality: 'good' });
        }

        if (/toolCall\s*\(/.test(code)) {
            patterns.push({ type: 'architecture', name: '跨工具包调用', detail: 'toolCall() 跨包协作', quality: 'good' });
        }

        if (/Tools\.Files\.\w+/.test(code)) {
            patterns.push({ type: 'architecture', name: '文件系统操作', detail: 'Tools.Files API 调用', quality: 'neutral' });
        }

        if (/Tools\.Net\.Web\.\w+/.test(code)) {
            patterns.push({ type: 'architecture', name: '浏览器自动化', detail: 'Tools.Net.Web API 调用', quality: 'good' });
        }

        if (/function\s+safe(?:Str|Number|Bool)\s*\(/.test(code)) {
            patterns.push({ type: 'validation', name: '安全类型转换', detail: '参数安全提取函数', quality: 'good' });
        }

        if (/CryptoJS/.test(code)) {
            patterns.push({ type: 'security', name: '加密操作', detail: 'CryptoJS 加密库使用', quality: 'neutral' });
        }

        return patterns;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §14  代码替换引擎
    // ═══════════════════════════════════════════════════════════════════════════

    function applyPatchExact(content, oldCode, newCode, occurrence) {
        var occ = occurrence || 1;
        if (occ === 0) {
            var count = countOccurrences(content, oldCode);
            if (count === 0) return { content: content, matchCount: 0, applied: false, error: '未找到匹配' };
            var result = content.split(oldCode).join(newCode);
            return { content: result, matchCount: count, applied: true };
        }

        var index = -1;
        var startSearch = 0;
        for (var i = 0; i < occ; i++) {
            index = content.indexOf(oldCode, startSearch);
            if (index === -1) {
                return { content: content, matchCount: i, applied: false, error: '仅找到 ' + i + ' 处匹配，期望 ' + occ };
            }
            startSearch = index + oldCode.length;
        }

        var before = content.substring(0, index);
        var after = content.substring(index + oldCode.length);
        return { content: before + newCode + after, matchCount: occ, applied: true };
    }

    function applyPatchRegex(content, pattern, replacement, occurrence) {
        var regex;
        try {
            var flagMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
            if (flagMatch) {
                var flags = flagMatch[2].indexOf('g') === -1 ? flagMatch[2] + 'g' : flagMatch[2];
                regex = new RegExp(flagMatch[1], flags);
            } else {
                regex = new RegExp(pattern, 'g');
            }
        } catch (e) {
            return { content: content, matchCount: 0, applied: false, error: '正则语法错误: ' + e.message };
        }

        var matches = [];
        var m;
        while ((m = regex.exec(content)) !== null) {
            matches.push({ index: m.index, length: m[0].length, match: m[0] });
            if (m.index === regex.lastIndex) regex.lastIndex++;
        }

        if (matches.length === 0) {
            return { content: content, matchCount: 0, applied: false, error: '未找到匹配' };
        }

        var occ = occurrence || 1;
        if (occ === 0) {
            var result = content.replace(new RegExp(regex.source, regex.flags), replacement);
            return { content: result, matchCount: matches.length, applied: true };
        }

        if (occ > matches.length) {
            return { content: content, matchCount: matches.length, applied: false, error: '仅找到 ' + matches.length + ' 处' };
        }

        var target = matches[occ - 1];
        var before = content.substring(0, target.index);
        var after = content.substring(target.index + target.length);
        var useCaptures = /\$[0-9&`']/.test(replacement);
        var actualReplacement = useCaptures
            ? target.match.replace(new RegExp(regex.source, regex.flags.replace('g', '')), replacement)
            : target.match.replace(new RegExp(regex.source, regex.flags.replace('g', '')), function () { return replacement; });
        return { content: before + actualReplacement + after, matchCount: matches.length, applied: true };
    }

    function applyPatchAnchor(content, oldCode, newCode, anchorBefore, anchorAfter) {
        if (!anchorBefore && !anchorAfter) {
            return { content: content, matchCount: 0, applied: false, error: 'anchor 模式需要至少一个锚点' };
        }

        var startIndex = 0;
        var endIndex = content.length;

        if (anchorBefore) {
            var beforeIdx = content.indexOf(anchorBefore);
            if (beforeIdx === -1) {
                return { content: content, matchCount: 0, applied: false, error: '未找到前锚点: "' + anchorBefore.substring(0, 50) + '"' };
            }
            startIndex = beforeIdx + anchorBefore.length;
        }

        if (anchorAfter) {
            var afterIdx = content.indexOf(anchorAfter, startIndex);
            if (afterIdx === -1) {
                return { content: content, matchCount: 0, applied: false, error: '未找到后锚点: "' + anchorAfter.substring(0, 50) + '"' };
            }
            endIndex = afterIdx;
        }

        if (oldCode) {
            var regionContent = content.substring(startIndex, endIndex);
            var oldIdx = regionContent.indexOf(oldCode);
            if (oldIdx === -1) {
                return { content: content, matchCount: 0, applied: false, error: '锚点区域内未找到目标代码' };
            }
            var absoluteStart = startIndex + oldIdx;
            var absoluteEnd = absoluteStart + oldCode.length;
            var result = content.substring(0, absoluteStart) + newCode + content.substring(absoluteEnd);
            return { content: result, matchCount: 1, applied: true };
        } else {
            var result2 = content.substring(0, startIndex) + newCode + content.substring(endIndex);
            return { content: result2, matchCount: 1, applied: true };
        }
    }

    function applyPatchFuzzy(content, oldCode, newCode, occurrence) {
        var normalized = oldCode.replace(/\s+/g, ' ').trim();
        var lines = content.split('\n');
        var matches = [];
        var windowSize = Math.max(1, oldCode.split('\n').length);
        if (windowSize > lines.length) {
            return { content: content, matchCount: 0, applied: false, error: '目标代码行数(' + windowSize + ')超过文件总行数(' + lines.length + ')' };
        }
        for (var i = 0; i <= lines.length - windowSize; i++) {
            var block = lines.slice(i, i + windowSize).join('\n');
            var blockNorm = block.replace(/\s+/g, ' ').trim();
            if (blockNorm === normalized) {
                matches.push({ start: i, end: i + windowSize, original: block });
            }
        }
        if (matches.length === 0) {
            var bestScore = 0, bestMatch = null;
            for (var j = 0; j <= lines.length - windowSize; j++) {
                var blk = lines.slice(j, j + windowSize).join('\n');
                var score = computeSimilarity(oldCode, blk);
                if (score > bestScore && score >= CONFIG.FUZZY_MIN_SIMILARITY) {
                    bestScore = score;
                    bestMatch = { start: j, end: j + windowSize, original: blk, score: score };
                }
            }
            if (!bestMatch) return { content: content, matchCount: 0, applied: false, error: '模糊匹配未找到相似度 ≥' + Math.round(CONFIG.FUZZY_MIN_SIMILARITY * 100) + '% 的代码块' };
            matches = [bestMatch];
        }

        var occ = occurrence || 1;
        var newLines = newCode.split('\n');

        if (occ === 0) {
            var resultLines = lines.slice();
            for (var k = matches.length - 1; k >= 0; k--) {
                var m = matches[k];
                var head = resultLines.slice(0, m.start);
                var tail = resultLines.slice(m.end);
                resultLines = head.concat(newLines).concat(tail);
            }
            return { content: resultLines.join('\n'), matchCount: matches.length, applied: true };
        }

        if (occ > matches.length) {
            return { content: content, matchCount: matches.length, applied: false, error: '仅找到 ' + matches.length + ' 处模糊匹配，期望第 ' + occ + ' 处' };
        }

        var target = matches[occ - 1];
        var beforeLines = lines.slice(0, target.start);
        var afterLines = lines.slice(target.end);
        var resultContent = beforeLines.concat(newLines).concat(afterLines).join('\n');
        return { content: resultContent, matchCount: matches.length, applied: true, similarity: target.score };
    }

    function computeSimilarity(a, b) {
        if (a === b) return 1.0;
        var an = a.replace(/\s+/g, ' ').trim();
        var bn = b.replace(/\s+/g, ' ').trim();
        if (an === bn) return 0.95;
        if (an.length === 0 && bn.length === 0) return 1.0;
        if (an.length === 0 || bn.length === 0) return 0.0;
        var lenRatio = Math.min(an.length, bn.length) / Math.max(an.length, bn.length);
        if (lenRatio < 0.3) return lenRatio * 0.5;

        var maxLen = Math.max(an.length, bn.length);
        if (maxLen < 3) return an === bn ? 1.0 : 0.0;

        var bigramsA = Object.create(null), bigramsB = Object.create(null);
        var countA = 0, countB = 0;
        for (var i = 0; i < an.length - 1; i++) {
            var bg = an.charAt(i) + an.charAt(i + 1);
            bigramsA[bg] = (bigramsA[bg] || 0) + 1;
            countA++;
        }
        for (var j = 0; j < bn.length - 1; j++) {
            var bg2 = bn.charAt(j) + bn.charAt(j + 1);
            bigramsB[bg2] = (bigramsB[bg2] || 0) + 1;
            countB++;
        }
        if (countA === 0 || countB === 0) return 0.0;

        var intersection = 0;
        var keys = Object.keys(bigramsA);
        for (var k = 0; k < keys.length; k++) {
            if (bigramsB[keys[k]]) {
                intersection += Math.min(bigramsA[keys[k]], bigramsB[keys[k]]);
            }
        }
        return (2.0 * intersection) / (countA + countB);
    }

    function applyPatchInsertLine(content, newCode, lineNumber, oldCode) {
        var lines = content.split('\n');
        if (lineNumber < 1 || lineNumber > lines.length + 1) {
            return { content: content, matchCount: 0, applied: false, error: '行号超出范围: ' + lineNumber + '（文件共 ' + lines.length + ' 行）' };
        }
        if (oldCode) {
            var targetLine = lines[Math.min(lineNumber - 1, lines.length - 1)] || '';
            if (targetLine.trim() !== oldCode.trim() && targetLine.indexOf(oldCode.trim()) === -1) {
                return { content: content, matchCount: 0, applied: false, error: 'insert_line 断言失败: 第 ' + lineNumber + ' 行内容不匹配 old_code' };
            }
        }
        var insertAt = Math.max(0, Math.min(lineNumber - 1, lines.length));
        var newLines = newCode.split('\n');
        var resultLines = lines.slice(0, insertAt).concat(newLines).concat(lines.slice(insertAt));
        return { content: resultLines.join('\n'), matchCount: 1, applied: true, insertedAt: insertAt + 1 };
    }

    function applyPatch(content, patchObj) {
        var mode = safeStr(patchObj.mode, 'exact');
        var occ = safeNumber(patchObj.occurrence, 1, 0, 9999);

        if (patchObj.old_code && patchObj.old_code.length > CONFIG.PATCH_MAX_OLD_CODE) {
            return { content: content, matchCount: 0, applied: false, error: 'old_code 过长（' + patchObj.old_code.length + ' 字符），上限 ' + CONFIG.PATCH_MAX_OLD_CODE };
        }

        switch (mode) {
            case 'regex':
                return applyPatchRegex(content, patchObj.old_code, patchObj.new_code, occ);
            case 'anchor':
                return applyPatchAnchor(content, patchObj.old_code, patchObj.new_code, patchObj.anchor_before, patchObj.anchor_after);
            case 'fuzzy':
                return applyPatchFuzzy(content, patchObj.old_code, patchObj.new_code, occ);
            case 'insert_line':
                return applyPatchInsertLine(content, patchObj.new_code, occ || patchObj.line_number || 1, patchObj.old_code);
            case 'append':
                var appendContent = content.endsWith('\n') ? content + patchObj.new_code : content + '\n' + patchObj.new_code;
                return { content: appendContent, matchCount: 1, applied: true };
            default:
                return applyPatchExact(content, patchObj.old_code, patchObj.new_code, occ);
        }
    }

    function quickSyntaxCheck(code) {
        var bracketIssues = checkBracketBalance(code);
        var errors = bracketIssues.filter(function (i) { return i.level === 'error'; });
        return { valid: errors.length === 0, errors: errors };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §15  进化补丁生成器
    // ═══════════════════════════════════════════════════════════════════════════

    function generateTruncationPatch(code, arch) {
        if (arch.hasTruncation) return null;

        var truncateFunc = '\n    function truncateContent(content, maxLen) {\n' +
            '        if (!content) return \'\';\n' +
            '        var limit = maxLen || 15000;\n' +
            '        if (content.length <= limit) return content;\n' +
            '        return content.substring(0, limit) + \'\\n\\n*(内容已截断至 \' + limit + \' 字符)*\';\n' +
            '    }\n';

        var insertPoint = code.indexOf('return {');
        if (insertPoint === -1) insertPoint = code.indexOf('exports.');
        if (insertPoint <= 0) return null;

        var beforeReturn = code.lastIndexOf('\n', insertPoint - 1);
        if (beforeReturn <= 0) return null;

        var anchorStart = Math.max(0, beforeReturn - 80);
        var anchorEnd = Math.min(code.length, beforeReturn + 80);
        var anchorBefore = code.substring(anchorStart, beforeReturn);
        var anchorAfter = code.substring(beforeReturn + 1, anchorEnd);
        if (anchorBefore.length < 5 || anchorAfter.length < 5) return null;

        return {
            description: '添加截断保护函数 truncateContent()',
            suggestOnly: false,
            old_code: code.substring(beforeReturn, beforeReturn + 1),
            new_code: truncateFunc + '\n',
            mode: 'anchor',
            anchor_before: anchorBefore,
            anchor_after: anchorAfter
        };
    }

    function generateValidationPatch(code, meta, arch) {
        if (arch.hasParamValidation || !meta || !Array.isArray(meta.tools)) return null;

        var requiredParams = [];
        meta.tools.forEach(function (tool) {
            if (tool.advice) return;
            if (Array.isArray(tool.parameters)) {
                tool.parameters.forEach(function (param) {
                    if (param.required) {
                        requiredParams.push({ tool: tool.name, param: param.name, type: param.type || 'string' });
                    }
                });
            }
        });

        if (requiredParams.length === 0) return null;

        var toolParamMap = {};
        requiredParams.forEach(function (rp) {
            if (!toolParamMap[rp.tool]) toolParamMap[rp.tool] = [];
            toolParamMap[rp.tool].push(rp);
        });

        var firstTool = Object.keys(toolParamMap)[0];
        var firstParams = toolParamMap[firstTool];
        var funcPattern = new RegExp('(?:async\\s+)?function\\s+' + escapeRegex(firstTool) + '(?:Handler)?\\s*\\(\\s*(?:params|p)\\s*\\)\\s*\\{');
        var funcMatch = code.match(funcPattern);

        if (!funcMatch) {
            return {
                description: '为必填参数添加校验: ' + requiredParams.map(function (r) { return r.tool + '.' + r.param; }).join(', '),
                suggestOnly: true,
                tool: 'evolve',
                requiredParams: requiredParams
            };
        }

        var validationCode = '';
        firstParams.forEach(function (fp) {
            var paramRef = 'params.' + fp.param;
            if (fp.type === 'string') {
                validationCode += '\n        if (!' + paramRef + ' || String(' + paramRef + ').trim() === \'\') {\n' +
                    '            return { success: false, message: \'缺少必填参数 ' + fp.param + '\' };\n' +
                    '        }';
            } else {
                validationCode += '\n        if (' + paramRef + ' === undefined || ' + paramRef + ' === null) {\n' +
                    '            return { success: false, message: \'缺少必填参数 ' + fp.param + '\' };\n' +
                    '        }';
            }
        });

        var matchStr = funcMatch[0];
        return {
            description: '为 ' + firstTool + ' 的必填参数添加校验',
            suggestOnly: false,
            old_code: matchStr,
            new_code: matchStr + validationCode,
            mode: 'exact'
        };
    }

    function generateDebugPatch(code, arch) {
        if (arch.hasDebugMode) return null;

        var configMatch = code.match(/(?:const|var)\s+CONFIG\s*=\s*\{/);
        if (!configMatch) return null;

        var debugBlock = '\n\n    var DEBUG = (function () {\n' +
            '        try { return (typeof getEnv === \'function\' && getEnv(\'DEBUG\') === \'true\'); }\n' +
            '        catch (_) { return false; }\n' +
            '    })();\n\n' +
            '    function debugLog(msg) {\n' +
            '        if (DEBUG) console.log(\'[DEBUG] \' + msg);\n' +
            '    }\n';

        var configEnd = code.indexOf('};', configMatch.index);
        if (configEnd === -1) return null;
        configEnd += 2;

        var afterConfig = code.substring(configEnd, configEnd + 2);
        return {
            description: '添加 DEBUG 调试模式和 debugLog() 函数',
            suggestOnly: false,
            old_code: afterConfig,
            new_code: afterConfig + debugBlock,
            mode: 'anchor',
            anchor_before: code.substring(Math.max(0, configEnd - 30), configEnd),
            anchor_after: code.substring(configEnd + 2, Math.min(code.length, configEnd + 30))
        };
    }

    function generateWrapPatch(code, arch) {
        if (arch.hasWrapPattern || arch.exportCount <= 1) return null;

        var wrapFunc = '\n    async function wrapExecution(func, params, actionName) {\n' +
            '        try {\n' +
            '            var result = await func(params || {});\n' +
            '            complete(result);\n' +
            '        } catch (error) {\n' +
            '            complete({ success: false, message: actionName + \' 失败: \' + error.message });\n' +
            '        }\n' +
            '    }\n';

        return {
            description: '添加统一错误处理包装器 wrapExecution()',
            suggestOnly: false,
            codeSnippet: wrapFunc,
            insertHint: '在 return { ... } 之前插入'
        };
    }

    function generateEvolutionPatches(code, meta, arch, diffs, refCode, refArch, maxPatches) {
        var patches = [];
        var patchCount = 0;

        for (var d = 0; d < diffs.length && patchCount < maxPatches; d++) {
            var diff = diffs[d];
            var patch = null;

            if (diff.title === '缺少截断保护') {
                patch = generateTruncationPatch(code, arch);
            } else if (diff.title === '缺少参数校验') {
                patch = generateValidationPatch(code, meta, arch);
            } else if (diff.title === '缺少调试模式') {
                patch = generateDebugPatch(code, arch);
            } else if (diff.title === '缺少统一错误处理') {
                patch = generateWrapPatch(code, arch);
            } else if (diff.title === '缺少 CONFIG 常量' && !arch.hasConfig) {
                patch = {
                    description: '建议将魔法值提取到 CONFIG 对象中',
                    suggestOnly: true,
                    tool: 'evolve'
                };
            } else if (diff.title === '缺少 test 工具' && !arch.hasTestTool) {
                var exportMatch = code.match(/exports\.(\w+)\s*=/);
                if (exportMatch) {
                    var testExport = '\nexports.test = function (params) {\n' +
                        '    try {\n' +
                        '        complete({ success: true, message: \'自检通过\', data: \'✅ ' + (meta ? meta.name : 'toolkit') + ' 工作正常\' });\n' +
                        '    } catch (e) {\n' +
                        '        complete({ success: false, message: \'自检失败: \' + e.message });\n' +
                        '    }\n' +
                        '};\n';
                    var lastExport = code.lastIndexOf('exports.');
                    var lastExportEnd = code.indexOf('\n', lastExport);
                    if (lastExportEnd !== -1) {
                        patch = {
                            description: '添加 test 自检工具',
                            suggestOnly: false,
                            old_code: code.substring(lastExport, lastExportEnd + 1),
                            new_code: code.substring(lastExport, lastExportEnd + 1) + testExport,
                            mode: 'exact'
                        };
                    } else {
                        patch = { description: '建议添加 test 自检工具并在 METADATA 中声明', suggestOnly: true, tool: 'evolve' };
                    }
                } else {
                    patch = { description: '建议添加 test 自检工具并在 METADATA 中声明', suggestOnly: true, tool: 'evolve' };
                }
            } else if (diff.title === '缺少 IIFE 封装' && !arch.hasIIFE) {
                var moduleName = meta && meta.name ? meta.name.toUpperCase() : 'MODULE';
                var exportsBlock = code.match(/exports\.\w+\s*=/g);
                if (exportsBlock && exportsBlock.length > 0) {
                    var lastExportLine = code.lastIndexOf('exports.');
                    var lastExportEnd2 = code.indexOf('\n', lastExportLine);
                    if (lastExportEnd2 === -1) lastExportEnd2 = code.length;
                    patch = {
                        description: '建议使用 IIFE 封装: var ' + moduleName + ' = (function() { ... })(); 此变更较大，建议手动实施',
                        suggestOnly: true,
                        tool: 'evolve',
                        codeSnippet: 'var ' + moduleName + ' = (function () {\n    // ... 将所有函数移入 ...\n    return { /* 导出方法 */ };\n})();'
                    };
                } else {
                    patch = {
                        description: '建议使用 IIFE 封装防止全局命名空间污染',
                        suggestOnly: true,
                        tool: 'evolve'
                    };
                }
            } else if (diff.title === '缺少重试机制' && !arch.hasRetry) {
                if (arch.hasHttpClient) {
                    patch = {
                        description: '为网络请求添加指数退避重试函数',
                        suggestOnly: true,
                        tool: 'evolve',
                        codeSnippet: 'async function withRetry(fn, maxRetries) {\n' +
                            '    var tries = maxRetries || 3;\n' +
                            '    for (var i = 0; i < tries; i++) {\n' +
                            '        try { return await fn(); } catch (e) {\n' +
                            '            if (i === tries - 1) throw e;\n' +
                            '            if (typeof Tools !== \'undefined\' && Tools.System) {\n' +
                            '                Tools.System.sleep(Math.pow(2, i) * 500);\n' +
                            '            }\n' +
                            '        }\n' +
                            '    }\n' +
                            '}',
                        insertHint: '在 HTTP 请求相关函数之前插入，然后将 OkHttp 调用包裹在 withRetry(() => {...}) 中'
                    };
                } else {
                    patch = {
                        description: '建议为网络请求添加指数退避重试',
                        suggestOnly: true,
                        tool: 'evolve'
                    };
                }
            }

            if (patch) {
                patches.push(patch);
                patchCount++;
            }
        }

        return patches;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §16  诊断报告生成器
    // ═══════════════════════════════════════════════════════════════════════════

    function buildInspectReport(toolkitName, meta, arch, issues) {
        var lines = [];
        var counts = countByLevel(issues);

        lines.push('## 🔍 工具包深度审查报告: `' + toolkitName + '`\n');
        lines.push('> 审查时间: ' + nowTimestamp() + ' | 引擎版本: v' + CONFIG.VERSION + '\n');

        lines.push('### 总览\n');
        lines.push('| 指标 | 值 |');
        lines.push('| :--- | :--- |');
        lines.push('| 整体状态 | ' + statusIcon(counts.errors, counts.warns) + ' ' + counts.errors + ' 错误 / ' + counts.warns + ' 警告 / ' + counts.infos + ' 提示 |');
        lines.push('| 质量评分 | ' + arch.qualityScore + '/100 |');
        lines.push('| 代码行数 | ' + arch.lineCount + ' |');
        lines.push('| 字符数 | ' + (arch.charCount || '-') + ' |');
        lines.push('| 复杂度 | ' + arch.complexityLevel + ' |');
        lines.push('| 函数数量 | ' + arch.functionCount + ' |');
        lines.push('| 导出数量 | ' + arch.exportCount + ' |');
        lines.push('');

        lines.push('### 架构特征\n');
        lines.push('| 特征 | 状态 |');
        lines.push('| :--- | :--- |');
        CONFIG.ARCH_FEATURES.forEach(function (f) {
            var icon = arch[f[1]] ? '✅' : (f[2] ? '⚠️ 缺失' : '⚪');
            lines.push('| ' + f[0] + ' | ' + icon + ' |');
        });
        lines.push('');

        if (meta) {
            lines.push('### METADATA 信息\n');
            lines.push('| 字段 | 值 |');
            lines.push('| :--- | :--- |');
            lines.push('| name | ' + (meta.name || '❌ 缺失') + ' |');
            lines.push('| version | ' + (meta.version || '-') + ' |');
            lines.push('| category | ' + (meta.category || '-') + ' |');
            lines.push('| enabledByDefault | ' + (meta.enabledByDefault === true ? 'true' : 'false') + ' |');
            lines.push('| 工具数 | ' + (Array.isArray(meta.tools) ? meta.tools.length : 0) + ' |');
            lines.push('| 环境变量 | ' + (Array.isArray(meta.env) ? meta.env.length : 0) + ' |');
            lines.push('');
        }

        if (issues.length > 0) {
            lines.push('### 诊断详情\n');
            lines.push('| 级别 | 行号 | 问题 | 修复建议 |');
            lines.push('| :--- | :--- | :--- | :--- |');

            issues.slice(0, CONFIG.MAX_DISPLAY_ISSUES).forEach(function (issue) {
                var lineStr = issue.line > 0 ? String(issue.line) : (issue.field || '-');
                lines.push('| ' + levelIcon(issue.level) + ' | ' + lineStr + ' | ' + escapeTableCell(issue.message) + ' | ' + escapeTableCell(issue.suggestion) + ' |');
            });

            if (issues.length > CONFIG.MAX_DISPLAY_ISSUES) {
                lines.push('');
                lines.push('> *(共 ' + issues.length + ' 个问题，仅显示前 ' + CONFIG.MAX_DISPLAY_ISSUES + ' 个)*');
            }
            lines.push('');
        } else {
            lines.push('### ✅ 未发现问题\n');
        }

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' 生成*');

        return lines.join('\n');
    }

    function buildCompareReport(sourceName, targetName, sourceArch, targetArch, sourcePatterns, targetPatterns, diffs, enabledFeatures, aspectsStr) {
        var lines = [];
        lines.push('## 🔄 工具包对比报告\n');
        lines.push('> 对比时间: ' + nowTimestamp());
        lines.push('> 范本: `' + sourceName + '` ← 目标: `' + targetName + '`\n');

        lines.push('### 架构指标对比\n');
        lines.push('| 指标 | ' + sourceName + ' | ' + targetName + ' | 差异 |');
        lines.push('| :--- | :--- | :--- | :--- |');
        lines.push('| 代码行数 | ' + sourceArch.lineCount + ' | ' + targetArch.lineCount + ' | ' + (targetArch.lineCount - sourceArch.lineCount) + ' |');
        lines.push('| 质量评分 | ' + sourceArch.qualityScore + ' | ' + targetArch.qualityScore + ' | ' + (targetArch.qualityScore >= sourceArch.qualityScore ? '+' : '') + (targetArch.qualityScore - sourceArch.qualityScore) + ' |');
        lines.push('| 函数数 | ' + sourceArch.functionCount + ' | ' + targetArch.functionCount + ' | - |');
        lines.push('| 复杂度 | ' + sourceArch.complexityLevel + ' | ' + targetArch.complexityLevel + ' | - |');
        lines.push('');

        var features = [
            ['IIFE 封装', 'hasIIFE'], ['CONFIG 常量', 'hasConfig'], ['wrap 包装器', 'hasWrapPattern'],
            ['try-catch', 'hasTryCatch'], ['参数校验', 'hasParamValidation'], ['截断保护', 'hasTruncation'],
            ['test 工具', 'hasTestTool'], ['重试机制', 'hasRetry'], ['缓存机制', 'hasCache'],
            ['调试模式', 'hasDebugMode'], ['反向代理', 'hasProxy'], ['中间进度', 'hasSendIntermediate']
        ];

        lines.push('### 特征对比\n');
        lines.push('| 特征 | ' + sourceName + ' | ' + targetName + ' | 建议 |');
        lines.push('| :--- | :--- | :--- | :--- |');

        features.forEach(function (f) {
            if (aspectsStr && aspectsStr !== 'all' && enabledFeatures && !enabledFeatures[f[1]]) return;
            var sHas = sourceArch[f[1]];
            var tHas = targetArch[f[1]];
            var advice = sHas && !tHas ? '⬆️ 建议学习' :
                         !sHas && tHas ? '✅ 目标已具备' :
                         sHas && tHas ? '✅ 双方均有' : '-';
            lines.push('| ' + f[0] + ' | ' + (sHas ? '✅' : '❌') + ' | ' + (tHas ? '✅' : '❌') + ' | ' + advice + ' |');
        });
        lines.push('');

        if (diffs.length > 0) {
            lines.push('### 改进建议\n');
            diffs.forEach(function (d, i) {
                lines.push('#### ' + (i + 1) + '. ' + d.title);
                lines.push('');
                lines.push('**问题**: ' + d.problem);
                lines.push('**参考**: ' + d.reference);
                if (d.patchHint) lines.push('**补丁提示**: `' + d.patchHint + '`');
                lines.push('');
            });
        }

        if (sourcePatterns.length > 0 || targetPatterns.length > 0) {
            var srcOnly = sourcePatterns.filter(function (sp) {
                return !targetPatterns.some(function (tp) { return tp.name === sp.name; });
            });
            var tgtOnly = targetPatterns.filter(function (tp) {
                return !sourcePatterns.some(function (sp) { return sp.name === tp.name; });
            });
            if (srcOnly.length > 0 || tgtOnly.length > 0) {
                lines.push('### 设计模式差异\n');
                if (srcOnly.length > 0) {
                    lines.push('**范本独有**: ' + srcOnly.map(function (p) { return p.name; }).join(', '));
                }
                if (tgtOnly.length > 0) {
                    lines.push('**目标独有**: ' + tgtOnly.map(function (p) { return p.name; }).join(', '));
                }
                lines.push('');
            }
        }

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' 对比引擎生成*');

        return lines.join('\n');
    }

    function buildPatchReport(toolkitName, patches, results, dryRun) {
        var lines = [];
        lines.push('## 🔧 代码补丁' + (dryRun ? '预览' : '报告') + ': `' + toolkitName + '`\n');
        lines.push('> 时间: ' + nowTimestamp() + ' | 模式: ' + (dryRun ? '试运行' : '已应用') + '\n');

        var success = results.filter(function (r) { return r.applied; }).length;
        var failed = results.filter(function (r) { return !r.applied; }).length;

        lines.push('| 指标 | 值 |');
        lines.push('| :--- | :--- |');
        lines.push('| 补丁总数 | ' + results.length + ' |');
        lines.push('| 成功 | ' + success + ' |');
        lines.push('| 失败 | ' + failed + ' |');
        lines.push('');

        results.forEach(function (r, i) {
            var icon = r.applied ? '✅' : '❌';
            lines.push('### 补丁 #' + (i + 1) + ' ' + icon);
            lines.push('');
            lines.push('- **模式**: ' + (r.mode || 'exact'));
            lines.push('- **匹配数**: ' + (r.matchCount || 0));
            lines.push('- **状态**: ' + (r.applied ? '已替换' : '失败 - ' + (r.error || '未知')));
            if (r.line > 0) lines.push('- **位置**: 约第 ' + r.line + ' 行');
            if (r.old_preview) lines.push('- **原代码**: `' + r.old_preview + '`');
            if (r.new_preview) lines.push('- **新代码**: `' + r.new_preview + '`');
            lines.push('');
        });

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' 补丁引擎生成*');

        return lines.join('\n');
    }

    function buildLintReport(results, showFix) {
        var lines = [];
        lines.push('## 🧹 代码质量检查报告\n');
        lines.push('> 时间: ' + nowTimestamp() + '\n');

        var totalErrors = 0;
        var totalWarns = 0;
        var totalInfos = 0;

        results.forEach(function (r) {
            totalErrors += r.errors;
            totalWarns += r.warns;
            totalInfos += r.infos;
        });

        lines.push('| 指标 | 值 |');
        lines.push('| :--- | :--- |');
        lines.push('| 检查文件 | ' + results.length + ' |');
        lines.push('| 总错误 | ' + totalErrors + ' |');
        lines.push('| 总警告 | ' + totalWarns + ' |');
        lines.push('| 总提示 | ' + totalInfos + ' |');
        lines.push('');

        results.forEach(function (r) {
            if (r.issues.length === 0) return;
            lines.push('### ' + statusIcon(r.errors, r.warns) + ' `' + r.name + '`\n');
            lines.push(showFix !== false ? '| 级别 | 行号 | 问题 | 修复建议 |' : '| 级别 | 行号 | 问题 |');
            lines.push(showFix !== false ? '| :--- | :--- | :--- | :--- |' : '| :--- | :--- | :--- |');

            r.issues.slice(0, CONFIG.MAX_DISPLAY_LINT).forEach(function (issue) {
                var ln = issue.line > 0 ? String(issue.line) : (issue.field || '-');
                lines.push(showFix !== false
                    ? '| ' + levelIcon(issue.level) + ' | ' + ln + ' | ' + escapeTableCell(issue.message) + ' | ' + escapeTableCell(issue.suggestion) + ' |'
                    : '| ' + levelIcon(issue.level) + ' | ' + ln + ' | ' + escapeTableCell(issue.message) + ' |');
            });
            if (r.issues.length > CONFIG.MAX_DISPLAY_LINT) {
                lines.push('\n> *(共 ' + r.issues.length + ' 个，仅显示前 ' + CONFIG.MAX_DISPLAY_LINT + ' 个)*');
            }
            lines.push('');
        });

        var clean = results.filter(function (r) { return r.issues.length === 0; });
        if (clean.length > 0) {
            lines.push('### 🏆 无问题\n');
            lines.push(clean.map(function (r) { return '`' + r.name + '`'; }).join('  '));
            lines.push('');
        }

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' lint 引擎生成*');

        return lines.join('\n');
    }

    function buildEvolveReport(toolkitName, refName, inspectIssues, diffs, evolutionPatches, patchResults, postIssues) {
        var lines = [];
        lines.push('## 🧬 自递归进化报告: `' + toolkitName + '`\n');
        lines.push('> 时间: ' + nowTimestamp());
        lines.push('> 范本: `' + refName + '` | 引擎: v' + CONFIG.VERSION + '\n');

        var beforeCounts = countByLevel(inspectIssues);
        var afterCounts = countByLevel(postIssues);
        var appliedCount = patchResults.filter(function (r) { return r.applied; }).length;

        lines.push('### 进化摘要\n');
        lines.push('| 指标 | 进化前 | 进化后 | 变化 |');
        lines.push('| :--- | :--- | :--- | :--- |');
        lines.push('| 错误数 | ' + beforeCounts.errors + ' | ' + afterCounts.errors + ' | ' + (afterCounts.errors - beforeCounts.errors) + ' |');
        lines.push('| 警告数 | ' + beforeCounts.warns + ' | ' + afterCounts.warns + ' | ' + (afterCounts.warns - beforeCounts.warns) + ' |');
        lines.push('| 补丁 | - | ' + appliedCount + '/' + patchResults.length + ' | - |');
        lines.push('');

        if (diffs.length > 0) {
            lines.push('### 发现\n');
            diffs.forEach(function (d, i) {
                lines.push((i + 1) + '. **' + d.title + '**: ' + d.problem);
            });
            lines.push('');
        }

        if (evolutionPatches.length > 0) {
            lines.push('### 生成的补丁\n');
            evolutionPatches.forEach(function (p, i) {
                var icon = p.suggestOnly ? '💡' : '🔧';
                lines.push(icon + ' **#' + (i + 1) + '**: ' + p.description);
                if (p.codeSnippet) {
                    lines.push('```javascript');
                    lines.push(p.codeSnippet.trim());
                    lines.push('```');
                }
                if (p.insertHint) lines.push('> 位置: ' + p.insertHint);
                lines.push('');
            });
        }

        if (patchResults.length > 0) {
            lines.push('### 执行结果\n');
            patchResults.forEach(function (r, i) {
                var icon = r.applied ? '✅' : '❌';
                lines.push('- ' + icon + ' #' + (i + 1) + ': ' + (r.applied ? '成功' : '失败 - ' + (r.error || '')) + ' (' + (r.mode || 'exact') + ')');
            });
            lines.push('');
        }

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' 进化引擎生成*');

        return lines.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §17  工具处理器 - inspect_toolkit
    // ═══════════════════════════════════════════════════════════════════════════

    async function inspectToolkitHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }
        var depth = safeStr(params.depth, 'standard');

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🔍 正在审查: ' + toolkitName + ' ...' });
        }

        var code = await readToolkitSource(toolkitName);
        var meta = extractMetadata(code);
        var arch = analyzeArchitecture(code);
        var fileName = getToolkitFileName(toolkitName);
        var allIssues = [];

        allIssues = allIssues.concat(validateMetadata(meta, code, fileName));
        allIssues = allIssues.concat(checkNamingConsistency(code, meta));

        if (depth === 'standard' || depth === 'deep') {
            allIssues = allIssues.concat(checkBracketBalance(code));
            allIssues = allIssues.concat(checkSemicolons(code));
            allIssues = allIssues.concat(analyzeNesting(code));
            allIssues = allIssues.concat(checkNamingConventions(code));
            allIssues = allIssues.concat(checkCompleteCallCoverage(code));
            allIssues = allIssues.concat(checkTruncation(code));
            allIssues = allIssues.concat(checkTodoFixme(code));
            allIssues = allIssues.concat(checkConsoleUsage(code));
            allIssues = allIssues.concat(analyzeFunctionComplexity(code));
        }

        if (depth === 'deep') {
            allIssues = allIssues.concat(checkSecurityIssues(code));
            allIssues = allIssues.concat(detectDuplicateBlocks(code));
        }

        var report = buildInspectReport(toolkitName, meta, arch, allIssues);
        var counts = countByLevel(allIssues);

        return {
            success: true,
            message: '审查完成: ' + counts.errors + ' 错误, ' + counts.warns + ' 警告',
            data: truncateContent(report, CONFIG.MAX_INLINE_OUTPUT),
            meta: { errors: counts.errors, warns: counts.warns, infos: counts.infos, qualityScore: arch.qualityScore, lineCount: arch.lineCount, charCount: arch.charCount }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §18  工具处理器 - compare_toolkits
    // ═══════════════════════════════════════════════════════════════════════════

    async function compareToolkitsHandler(params) {
        var sourceName = safeStr(params.source_toolkit);
        var targetName = safeStr(params.target_toolkit);
        if (!sourceName || !targetName) {
            return { success: false, message: '缺少必填参数 source_toolkit 或 target_toolkit' };
        }

        var aspectsStr = safeStr(params.aspects, 'all');
        var aspects = aspectsStr === 'all'
            ? ['structure', 'error_handling', 'security', 'style', 'performance']
            : aspectsStr.split(',').map(function (a) { return a.trim().toLowerCase(); });

        var aspectFeatureMap = {
            structure: ['hasIIFE', 'hasConfig', 'hasTestTool'],
            error_handling: ['hasWrapPattern', 'hasTryCatch', 'hasParamValidation'],
            security: ['hasEnvRead', 'hasProxy'],
            style: ['hasDebugMode', 'hasSendIntermediate'],
            performance: ['hasRetry', 'hasCache', 'hasTruncation']
        };

        var enabledFeatures = {};
        aspects.forEach(function (a) {
            var feats = aspectFeatureMap[a];
            if (feats) feats.forEach(function (f) { enabledFeatures[f] = true; });
        });

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🔄 正在对比: ' + sourceName + ' vs ' + targetName + ' ...' });
        }

        var sourceCode = await readToolkitSource(sourceName);
        var targetCode = await readToolkitSource(targetName);
        var sourceArch = analyzeArchitecture(sourceCode);
        var targetArch = analyzeArchitecture(targetCode);
        var sourcePatterns = extractCodePatterns(sourceCode);
        var targetPatterns = extractCodePatterns(targetCode);

        var diffs = [];

        CONFIG.COMPARE_DIMENSIONS.forEach(function (c) {
            if (aspectsStr !== 'all' && !enabledFeatures[c[1]]) return;
            if (sourceArch[c[1]] && !targetArch[c[1]]) {
                if (c[1] === 'hasRetry' && !targetArch.hasHttpClient) return;
                if (c[1] === 'hasDebugMode' && targetArch.lineCount < 200) return;
                diffs.push({
                    title: c[0],
                    problem: '目标工具包' + c[2],
                    reference: '范本 ' + sourceName + ' ' + c[3],
                    patchHint: c[4]
                });
            }
        });

        var report = buildCompareReport(sourceName, targetName, sourceArch, targetArch, sourcePatterns, targetPatterns, diffs, enabledFeatures, aspectsStr);

        return {
            success: true,
            message: '对比完成: ' + diffs.length + ' 项改进建议',
            data: truncateContent(report, CONFIG.MAX_INLINE_OUTPUT),
            meta: { sourceScore: sourceArch.qualityScore, targetScore: targetArch.qualityScore, diffCount: diffs.length, improvements: diffs.map(function (d) { return d.title; }) }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §19  工具处理器 - patch_code
    // ═══════════════════════════════════════════════════════════════════════════

    async function patchCodeHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }
        var mode = safeStr(params.mode, 'exact');
        if (!params.old_code && mode !== 'anchor' && mode !== 'insert_line' && mode !== 'append') {
            return { success: false, message: '缺少必填参数 old_code（insert_line/anchor 模式除外）' };
        }
        if ((params.new_code === undefined || params.new_code === null) && mode !== 'exact') {
            return { success: false, message: '缺少必填参数 new_code' };
        }
        var newCode = params.new_code === undefined || params.new_code === null ? '' : params.new_code;

        if (toolkitName === CONFIG.SELF_NAME && !safeBool(params.dry_run, false)) {
            debugLog('对自身执行 patch_code，将强制备份');
        }

        var dryRun = safeBool(params.dry_run, false);
        var code = await readToolkitSource(toolkitName);

        var patchResult = applyPatch(code, {
            old_code: params.old_code,
            new_code: newCode,
            mode: mode,
            anchor_before: params.anchor_before,
            anchor_after: params.anchor_after,
            occurrence: params.occurrence,
            line_number: params.occurrence
        });

        if (!patchResult.applied) {
            var failData = '**替换失败**\n\n- 模式: ' + mode + '\n- 原因: ' + (patchResult.error || '未找到匹配') +
                      '\n- 匹配数: ' + (patchResult.matchCount || 0);
            if (mode === 'exact' && params.old_code) {
                var firstLine = params.old_code.split('\n')[0].trim();
                if (firstLine.length > 0) {
                    var codeLines = code.split('\n');
                    var candidates = [];
                    for (var ci = 0; ci < codeLines.length; ci++) {
                        if (codeLines[ci].indexOf(firstLine.substring(0, Math.min(30, firstLine.length))) !== -1) {
                            candidates.push(ci + 1);
                        }
                    }
                    if (candidates.length > 0 && candidates.length <= 5) {
                        failData += '\n- 首行相似位置: 第 ' + candidates.join(', ') + ' 行';
                    }
                }
                var fuzzyPreview = applyPatchFuzzy(code, params.old_code, newCode, 1);
                if (fuzzyPreview.applied) {
                    failData += '\n- 💡 fuzzy 模式可匹配' + (fuzzyPreview.similarity ? '（相似度 ' + Math.round(fuzzyPreview.similarity * 100) + '%）' : '');
                }
                failData += '\n\n> 💡 用 read_toolkit 查看源码确认 old_code 一致，或用 mode: "fuzzy"';
            }
            if (mode === 'fuzzy' && params.old_code) {
                var oldLines = params.old_code.split('\n').length;
                failData += '\n- old_code 行数: ' + oldLines;
                failData += '\n\n> 💡 试试 mode: "fuzzy" 或用 read_toolkit search_text 定位';
            } else {
                failData += '\n\n> 💡 用 read_toolkit 查看源码确认 old_code 一致';
            }
            return {
                success: false,
                message: '补丁失败: ' + (patchResult.error || '未找到匹配'),
                data: failData
            };
        }

        var syntaxResult = quickSyntaxCheck(patchResult.content);
        if (!syntaxResult.valid) {
            var errorDetail = syntaxResult.errors.map(function (e) { return '第 ' + e.line + ' 行: ' + e.message; }).join('\n');
            return {
                success: false,
                message: '补丁导致语法错误，已拒绝',
                data: '**语法检查未通过**\n\n' + errorDetail + '\n\n> 修正 new_code 后重试'
            };
        }

        var backupPath = null;
        if (!dryRun) {
            backupPath = await createBackup(toolkitName);
            await writeFile(getToolkitPath(toolkitName), patchResult.content);
        }

        var oldPreview = (params.old_code || '').substring(0, 80).replace(/\n/g, '↵');
        var newPreview = newCode.substring(0, 80).replace(/\n/g, '↵');
        var patchLine = 0;
        if (params.old_code && mode !== 'insert_line') {
            var idx = code.indexOf(params.old_code);
            if (idx !== -1) patchLine = code.substring(0, idx).split('\n').length;
        } else if (mode === 'insert_line') {
            patchLine = safeNumber(params.occurrence, 1, 1, 999999);
        }

        var namingIssues = checkNamingConsistency(patchResult.content, extractMetadata(patchResult.content));
        var namingErrors = namingIssues.filter(function (i) { return i.level === 'error'; });
        var namingWarns = namingIssues.filter(function (i) { return i.level === 'warn'; });

        var report = buildPatchReport(toolkitName, [params], [{
            applied: true, mode: mode,
            matchCount: patchResult.matchCount, old_preview: oldPreview, new_preview: newPreview,
            line: patchLine
        }], dryRun);

        if (namingIssues.length > 0) {
            var namingReport = ['\n### ⚠️ 命名一致性检查 (' + namingErrors.length + ' 错误, ' + namingWarns.length + ' 警告)\n'];
            namingIssues.forEach(function (issue) {
                namingReport.push(levelIcon(issue.level) + ' **' + issue.field + '**: ' + issue.message);
                if (issue.suggestion) namingReport.push('  > 💡 ' + issue.suggestion);
            });
            report = report + '\n' + namingReport.join('\n');
        }

        return {
            success: true,
            message: dryRun ? '试运行完成: 可成功应用' : ('补丁已应用' + (namingErrors.length > 0 ? ' ⚠️ 发现 ' + namingErrors.length + ' 个命名不一致' : '')),
            data: report,
            meta: { dry_run: dryRun, backup_path: backupPath, match_count: patchResult.matchCount, naming_errors: namingErrors.length, naming_warns: namingWarns.length, patch_line: patchLine, new_line_count: patchResult.content.split('\n').length }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §20  工具处理器 - batch_patch
    // ═══════════════════════════════════════════════════════════════════════════

    async function batchPatchHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }

        var patches;
        try {
            patches = JSON.parse(params.patches);
        } catch (e) {
            return { success: false, message: 'patches JSON 解析失败: ' + e.message };
        }
        if (!Array.isArray(patches) || patches.length === 0) {
            return { success: false, message: 'patches 必须是非空数组' };
        }

        var dryRun = safeBool(params.dry_run, false);
        var code = await readToolkitSource(toolkitName);
        var currentContent = code;
        var results = [];
        var allSuccess = true;
        var failedIndex = -1;

        for (var i = 0; i < patches.length; i++) {
            var patch = patches[i];
            var patchResult = applyPatch(currentContent, {
                old_code: patch.old_code, new_code: patch.new_code,
                mode: safeStr(patch.mode, 'exact'),
                anchor_before: patch.anchor_before, anchor_after: patch.anchor_after,
                occurrence: patch.occurrence
            });

            var oldPreview = (patch.old_code || '').substring(0, 60).replace(/\n/g, '↵');
            var newPreview = (patch.new_code || '').substring(0, 60).replace(/\n/g, '↵');

            if (!patchResult.applied) {
                allSuccess = false;
                failedIndex = i + 1;
                results.push({
                    applied: false, mode: safeStr(patch.mode, 'exact'),
                    matchCount: patchResult.matchCount || 0,
                    error: patchResult.error || '未找到匹配',
                    old_preview: oldPreview, new_preview: newPreview,
                    index: i + 1
                });
                break;
            }

            currentContent = patchResult.content;

            var interSyntax = quickSyntaxCheck(currentContent);
            if (!interSyntax.valid) {
                allSuccess = false;
                failedIndex = i + 1;
                results.push({
                    applied: false, mode: safeStr(patch.mode, 'exact'),
                    matchCount: patchResult.matchCount,
                    error: '补丁 #' + (i + 1) + ' 导致语法错误: ' + interSyntax.errors.map(function (e) { return '第' + e.line + '行: ' + e.message; }).join('; '),
                    old_preview: oldPreview, new_preview: newPreview
                });
                currentContent = code;
                break;
            }

            results.push({
                applied: true, mode: safeStr(patch.mode, 'exact'),
                matchCount: patchResult.matchCount, old_preview: oldPreview, new_preview: newPreview,
                line: patch.old_code ? (function () { var pi = code.indexOf(patch.old_code); return pi !== -1 ? code.substring(0, pi).split('\n').length : 0; })() : 0
            });

            if (typeof sendIntermediateResult === 'function' && patches.length > 3) {
                sendIntermediateResult({ success: true, message: '🔧 补丁 ' + (i + 1) + '/' + patches.length });
            }
        }

        if (allSuccess) {
            var syntaxResult = quickSyntaxCheck(currentContent);
            if (!syntaxResult.valid) {
                allSuccess = false;
                results.push({
                    applied: false, mode: 'syntax_check', matchCount: 0,
                    error: '语法检查失败: ' + syntaxResult.errors.map(function (e) { return '第 ' + e.line + ' 行: ' + e.message; }).join('; ')
                });
            }
        }

        var backupPath = null;
        if (allSuccess && !dryRun) {
            backupPath = await createBackup(toolkitName);
            await writeFile(getToolkitPath(toolkitName), currentContent);
        }

        var report = buildPatchReport(toolkitName, patches, results, dryRun);

        // 🔍 自动命名一致性校验（仅在成功且非试运行时）
        var batchNamingErrors = 0, batchNamingWarns = 0;
        if (allSuccess) {
            var batchNamingIssues = checkNamingConsistency(currentContent, extractMetadata(currentContent));
            batchNamingErrors = batchNamingIssues.filter(function (i) { return i.level === 'error'; }).length;
            batchNamingWarns = batchNamingIssues.filter(function (i) { return i.level === 'warn'; }).length;
            if (batchNamingIssues.length > 0) {
                var batchNamingReport = ['\n### ⚠️ 命名一致性检查 (' + batchNamingErrors + ' 错误, ' + batchNamingWarns + ' 警告)\n'];
                batchNamingIssues.forEach(function (issue) {
                    batchNamingReport.push(levelIcon(issue.level) + ' **' + issue.field + '**: ' + issue.message);
                    if (issue.suggestion) batchNamingReport.push('  > 💡 ' + issue.suggestion);
                });
                report = report + '\n' + batchNamingReport.join('\n');
            }
        }

        return {
            success: allSuccess,
            message: allSuccess
                ? (dryRun ? '试运行完成: ' + patches.length + ' 个补丁可应用' : ('已应用 ' + patches.length + ' 个补丁' + (batchNamingErrors > 0 ? ' ⚠️ 发现 ' + batchNamingErrors + ' 个命名不一致' : '')))
                : '批量补丁失败（未写入文件）: 第 ' + failedIndex + ' 个出错',
            data: truncateContent(report, CONFIG.MAX_INLINE_OUTPUT),
            meta: { dry_run: dryRun, backup_path: backupPath, total_patches: patches.length, applied: results.filter(function (r) { return r.applied; }).length, failed: results.filter(function (r) { return !r.applied; }).length, naming_errors: batchNamingErrors, naming_warns: batchNamingWarns }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §21  工具处理器 - lint_check
    // ═══════════════════════════════════════════════════════════════════════════

    async function lintCheckHandler(params) {
        var targetName = safeStr(params.toolkit_name);
        var showFix = safeBool(params.fix_suggestions, true);
        var rulesStr = safeStr(params.rules, 'all');
        var enabledRules = rulesStr === 'all'
            ? ['syntax', 'format', 'security', 'complexity', 'naming']
            : rulesStr.split(',').map(function (r) { return r.trim().toLowerCase(); });

        var filesToCheck = [];

        if (targetName) {
            filesToCheck.push(getToolkitFileName(targetName));
        } else {
            var entries = await listDir(getExamplesDir());
            listToolkitFiles(entries).forEach(function (entry) {
                filesToCheck.push(entry.name);
            });
        }

        if (filesToCheck.length === 0) {
            return { success: false, message: '未找到要检查的工具包' };
        }

        if (typeof sendIntermediateResult === 'function' && filesToCheck.length > 5) {
            sendIntermediateResult({ success: true, message: '🧹 正在检查 ' + filesToCheck.length + ' 个工具包...' });
        }

        var results = [];

        for (var f = 0; f < filesToCheck.length; f++) {
            var fileName = filesToCheck[f];
            var fileIssues = [];

            try {
                var code = await readFile(getExamplesDir() + fileName);
                var meta = extractMetadata(code);
                fileIssues = fileIssues.concat(validateMetadata(meta, code, fileName));

                if (enabledRules.indexOf('syntax') !== -1) {
                    fileIssues = fileIssues.concat(checkBracketBalance(code));
                    fileIssues = fileIssues.concat(checkCompleteCallCoverage(code));
                }
                if (enabledRules.indexOf('format') !== -1) {
                    fileIssues = fileIssues.concat(checkSemicolons(code));
                    fileIssues = fileIssues.concat(checkTodoFixme(code));
                    fileIssues = fileIssues.concat(checkConsoleUsage(code));
                    fileIssues = fileIssues.concat(checkTruncation(code));
                }
                if (enabledRules.indexOf('security') !== -1) {
                    fileIssues = fileIssues.concat(checkSecurityIssues(code));
                }
                if (enabledRules.indexOf('complexity') !== -1) {
                    fileIssues = fileIssues.concat(analyzeNesting(code));
                    fileIssues = fileIssues.concat(analyzeFunctionComplexity(code));
                }
                if (enabledRules.indexOf('naming') !== -1) {
                    fileIssues = fileIssues.concat(checkNamingConventions(code));
                    fileIssues = fileIssues.concat(checkNamingConsistency(code, meta));
                }
            } catch (readError) {
                fileIssues.push({ level: 'error', line: 0, message: '文件读取失败: ' + readError.message, suggestion: '检查文件是否存在' });
            }

            var fileCounts = countByLevel(fileIssues);
            results.push({
                name: fileName.replace(/\.(js|ts)$/, ''), fileName: fileName,
                issues: fileIssues,
                errors: fileCounts.errors, warns: fileCounts.warns, infos: fileCounts.infos
            });

            if (typeof sendIntermediateResult === 'function' && filesToCheck.length > 10 && (f + 1) % 5 === 0) {
                sendIntermediateResult({ success: true, message: '🧹 已检查 ' + (f + 1) + '/' + filesToCheck.length });
            }
        }

        var report = buildLintReport(results, showFix);
        var totalErrors = results.reduce(function (s, r) { return s + r.errors; }, 0);
        var totalWarns = results.reduce(function (s, r) { return s + r.warns; }, 0);

        return {
            success: true,
            message: '检查完成: ' + results.length + ' 文件, ' + totalErrors + ' 错误, ' + totalWarns + ' 警告',
            data: truncateContent(report, CONFIG.MAX_INLINE_OUTPUT),
            meta: { files_checked: results.length, total_errors: totalErrors, total_warns: totalWarns, files_with_errors: results.filter(function (r) { return r.errors > 0; }).length }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §22  工具处理器 - learn_patterns
    // ═══════════════════════════════════════════════════════════════════════════

    async function learnPatternsHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }
        var focus = safeStr(params.focus, 'all');

        var code = await readToolkitSource(toolkitName);
        var arch = analyzeArchitecture(code);
        var codePatterns = extractCodePatterns(code);
        var meta = extractMetadata(code);

        var lines = [];
        lines.push('## 📚 模式学习报告: `' + toolkitName + '`\n');
        lines.push('> 分析时间: ' + nowTimestamp());
        lines.push('> 规模: ' + arch.lineCount + ' 行 | 复杂度: ' + arch.complexityLevel + ' | 评分: ' + arch.qualityScore + '\n');

        if (codePatterns.length > 0) {
            lines.push('### 提取的设计模式\n');
            lines.push('| # | 名称 | 类型 | 质量 | 详情 |');
            lines.push('| :--- | :--- | :--- | :--- | :--- |');
            var idx = 0;
            codePatterns.forEach(function (p) {
                if (focus !== 'all' && p.type !== focus) return;
                idx++;
                lines.push('| ' + idx + ' | ' + p.name + ' | ' + p.type + ' | ' + p.quality + ' | ' + p.detail + ' |');
            });
            lines.push('');
        }

        lines.push('### 架构分析\n');
        var archDesc = [];
        if (arch.hasIIFE) archDesc.push('IIFE 封装');
        if (arch.hasConfig) archDesc.push('集中配置');
        if (arch.hasWrapPattern) archDesc.push('统一错误包装');
        if (arch.hasRetry) archDesc.push('重试机制');
        if (arch.hasCache) archDesc.push('缓存系统');
        if (arch.hasTruncation) archDesc.push('截断保护');
        if (arch.hasDebugMode) archDesc.push('调试模式');
        if (arch.hasProxy) archDesc.push('代理支持');
        if (arch.hasSendIntermediate) archDesc.push('进度推送');

        lines.push(archDesc.length > 0 ? '已采用: ' + archDesc.join(', ') : '未检测到标准模式');
        lines.push('');

        var missingPatterns = [];
        if (!arch.hasIIFE) missingPatterns.push('IIFE 封装');
        if (!arch.hasConfig && arch.lineCount > 100) missingPatterns.push('集中配置（CONFIG）');
        if (!arch.hasWrapPattern && arch.exportCount > 2) missingPatterns.push('统一错误包装器');
        if (!arch.hasTruncation) missingPatterns.push('输出截断保护');
        if (!arch.hasTestTool) missingPatterns.push('test 自检工具');
        if (!arch.hasParamValidation) missingPatterns.push('参数校验');

        if (missingPatterns.length > 0) {
            lines.push('### 建议采用\n');
            missingPatterns.forEach(function (p) { lines.push('- ⬆️ ' + p); });
            lines.push('');
        }

        if (meta && Array.isArray(meta.tools)) {
            lines.push('### 工具函数清单\n');
            lines.push('| 工具名 | 参数数 | 描述 |');
            lines.push('| :--- | :--- | :--- |');
            meta.tools.forEach(function (tool) {
                var paramCount = Array.isArray(tool.parameters) ? tool.parameters.length : 0;
                var desc = getDesc(tool.description).substring(0, 60);
                lines.push('| `' + tool.name + '` | ' + paramCount + ' | ' + desc + ' |');
            });
            lines.push('');
        }

        lines.push('---');
        lines.push('*由 toolkit_improve v' + CONFIG.VERSION + ' 模式学习引擎生成*');

        return {
            success: true,
            message: '模式学习完成: ' + codePatterns.length + ' 个模式, ' + missingPatterns.length + ' 项建议',
            data: truncateContent(lines.join('\n'), CONFIG.MAX_INLINE_OUTPUT),
            meta: { patterns_found: codePatterns.length, missing_patterns: missingPatterns.length, quality_score: arch.qualityScore }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §23  工具处理器 - evolve
    // ═══════════════════════════════════════════════════════════════════════════

    async function evolveHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }
        if (toolkitName === CONFIG.SELF_NAME || toolkitName === CONFIG.SELF_NAME + '.js') {
            return { success: false, message: '安全保护: toolkit_improve 不对自身执行自动进化。请用 inspect_toolkit 审查后手动修改。' };
        }

        var refName = safeStr(params.reference_toolkit);
        var maxPatches = safeNumber(params.max_patches, 10, 1, 50);
        var autoApply = safeBool(params.auto_apply, false);

        if (refName && (refName === toolkitName || refName.replace(/\.(js|ts)$/, '') === toolkitName)) {
            return { success: false, message: '参考范本不能是自身: ' + toolkitName };
        }

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🧬 [1/4] 审查 ' + toolkitName + ' ...' });
        }

        var code = await readToolkitSource(toolkitName);
        var meta = extractMetadata(code);
        var arch = analyzeArchitecture(code);
        var fileName = getToolkitFileName(toolkitName);

        var inspectIssues = [];
        inspectIssues = inspectIssues.concat(validateMetadata(meta, code, fileName));
        inspectIssues = inspectIssues.concat(checkBracketBalance(code));
        inspectIssues = inspectIssues.concat(checkSemicolons(code));
        inspectIssues = inspectIssues.concat(analyzeNesting(code));
        inspectIssues = inspectIssues.concat(checkCompleteCallCoverage(code));
        inspectIssues = inspectIssues.concat(checkTruncation(code));
        inspectIssues = inspectIssues.concat(checkSecurityIssues(code));
        inspectIssues = inspectIssues.concat(checkNamingConsistency(code, meta));
        inspectIssues = inspectIssues.concat(analyzeFunctionComplexity(code));

        if (!refName) {
            if (typeof sendIntermediateResult === 'function') {
                sendIntermediateResult({ success: true, message: '🧬 [2/4] 选择参考范本...' });
            }
            var entries = await listDir(getExamplesDir());
            var candidates = [];
            var toolkitEntries = listToolkitFiles(entries);

            var scanLimit = Math.min(toolkitEntries.length, CONFIG.EVOLVE_SCAN_LIMIT);
            for (var i = 0; i < scanLimit; i++) {
                var entry = toolkitEntries[i];
                var candidateName = entry.name.replace(/\.(js|ts)$/, '');
                if (candidateName === toolkitName || candidateName === CONFIG.SELF_NAME) continue;
                try {
                    var candidateCode = await readFile(getExamplesDir() + entry.name);
                    var candidateArch = analyzeArchitecture(candidateCode);
                    candidates.push({ name: candidateName, score: candidateArch.qualityScore, lines: candidateArch.lineCount });
                } catch (_) { }
            }

            candidates.sort(function (a, b) { return b.score - a.score; });
            if (candidates.length > 0) {
                refName = candidates[0].name;
                debugLog('选择范本: ' + refName + ' (评分 ' + candidates[0].score + ')');
            } else {
                return {
                    success: false,
                    message: '目录中无可用范本',
                    data: buildInspectReport(toolkitName, meta, arch, inspectIssues)
                };
            }
        }

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🧬 [2/4] 对比 ' + toolkitName + ' vs ' + refName + ' ...' });
        }

        var refCode = await readToolkitSource(refName);
        var refArch = analyzeArchitecture(refCode);

        var diffs = [];
        CONFIG.COMPARE_DIMENSIONS.forEach(function (c) {
            if (refArch[c[1]] && !arch[c[1]]) {
                if (c[1] === 'hasRetry' && !arch.hasHttpClient) return;
                if (c[1] === 'hasDebugMode' && arch.lineCount < 200) return;
                diffs.push({ title: c[0], problem: c[2], reference: refName + ' 具备此特征' });
            }
        });

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🧬 [3/4] 发现 ' + diffs.length + ' 项，生成补丁...' });
        }

        var evolutionPatches = generateEvolutionPatches(code, meta, arch, diffs, refCode, refArch, maxPatches);

        var patchResults = [];
        var currentContent = code;

        if (autoApply && evolutionPatches.length > 0) {
            var backupPath = await createBackup(toolkitName);

            for (var p = 0; p < evolutionPatches.length; p++) {
                var ep = evolutionPatches[p];
                if (ep.suggestOnly) {
                    patchResults.push({ applied: false, mode: 'suggest', matchCount: 0, error: '仅建议，需人工实现' });
                    continue;
                }
                if (ep.old_code && ep.new_code) {
                    var result = applyPatch(currentContent, {
                        old_code: ep.old_code, new_code: ep.new_code,
                        mode: ep.mode || 'exact',
                        anchor_before: ep.anchor_before, anchor_after: ep.anchor_after
                    });
                    if (result.applied) {
                        currentContent = result.content;
                        patchResults.push({ applied: true, mode: ep.mode || 'exact', matchCount: result.matchCount });
                    } else {
                        patchResults.push({ applied: false, mode: ep.mode || 'exact', matchCount: 0, error: result.error });
                    }
                } else {
                    patchResults.push({ applied: false, mode: 'manual', matchCount: 0, error: '需人工插入代码' });
                }
            }

            var syntaxOk = quickSyntaxCheck(currentContent);
            if (syntaxOk.valid && patchResults.some(function (r) { return r.applied; })) {
                await writeFile(getToolkitPath(toolkitName), currentContent);
            } else if (!syntaxOk.valid) {
                await restoreBackup(backupPath, toolkitName);
                currentContent = code;
                patchResults.push({ applied: false, mode: 'rollback', matchCount: 0, error: '语法检查失败，已回滚' });
            }
        }

        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '🧬 [4/4] 验证...' });
        }

        var postCode = autoApply ? currentContent : code;
        var postMeta = extractMetadata(postCode);
        var postIssues = [];
        postIssues = postIssues.concat(validateMetadata(postMeta, postCode, getToolkitFileName(toolkitName)));
        postIssues = postIssues.concat(checkBracketBalance(postCode));
        postIssues = postIssues.concat(checkCompleteCallCoverage(postCode));
        postIssues = postIssues.concat(checkNamingConsistency(postCode, postMeta));
        postIssues = postIssues.concat(checkTruncation(postCode));

        var report = buildEvolveReport(toolkitName, refName, inspectIssues, diffs, evolutionPatches, patchResults, postIssues);

        return {
            success: true,
            message: '进化完成: ' + diffs.length + ' 项发现, ' +
                     evolutionPatches.length + ' 个补丁, ' +
                     patchResults.filter(function (r) { return r.applied; }).length + ' 个已应用',
            data: truncateContent(report, CONFIG.MAX_INLINE_OUTPUT),
            meta: {
                target: toolkitName, reference: refName,
                issues_before: inspectIssues.length, issues_after: postIssues.length,
                diffs_found: diffs.length, patches_generated: evolutionPatches.length,
                patches_applied: patchResults.filter(function (r) { return r.applied; }).length,
                patches_total: patchResults.length
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §24  工具处理器 - read_toolkit
    // ═══════════════════════════════════════════════════════════════════════════

    async function readToolkitHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }

        var code = await readToolkitSource(toolkitName);
        var allLines = code.split('\n');
        var totalLines = allLines.length;

        var searchText = safeStr(params.search_text);

        // ── 全量读取模式 ─────────────────────────────────────────────────────
        if (safeBool(params.read_all, false) && !searchText) {
            var readStart = safeNumber(params.start_line, 1, 1, totalLines);
            var readEnd = safeNumber(params.end_line, totalLines, 1, totalLines);
            if (readEnd < readStart) readEnd = totalLines;
            var rangedLines = allLines.slice(readStart - 1, readEnd);
            var isPartial = (readStart > 1 || readEnd < totalLines);

            var fullOutput = [];
            if (isPartial) {
                fullOutput.push('## 源码: `' + toolkitName + '` [第 ' + readStart + '-' + readEnd + ' 行 / 共 ' + totalLines + ' 行]\n');
            } else {
                fullOutput.push('## 完整源码: `' + toolkitName + '` (' + totalLines + ' 行)\n');
            }
            fullOutput.push('```javascript');
            for (var ri = 0; ri < rangedLines.length; ri++) {
                fullOutput.push((readStart + ri) + '| ' + rangedLines[ri]);
            }
            fullOutput.push('```');
            if (isPartial && readEnd < totalLines) {
                fullOutput.push('\n> 📖 还有 ' + (totalLines - readEnd) + ' 行。用 `start_line: ' + (readEnd + 1) + '` 继续。');
            }
            var fullStr = fullOutput.join('\n');
            var truncated = fullStr.length > CONFIG.MAX_INLINE_OUTPUT;
            return {
                success: true,
                message: (isPartial ? '区间读取' : '全量读取') + '完成: ' + rangedLines.length + ' 行' + (truncated ? '（已截断）' : ''),
                data: truncateContent(fullStr, CONFIG.MAX_INLINE_OUTPUT),
                meta: { total_lines: totalLines, start_line: readStart, end_line: readEnd, lines_read: rangedLines.length, read_all: true, truncated: truncated, char_count: code.length }
            };
        }

        if (searchText) {
            var matches = [];
            var contextRange = safeNumber(params.start_line, 5, 0, 30);
            var isRegexSearch = searchText.startsWith('/') && searchText.lastIndexOf('/') > 0;
            var searchRegex = null;
            if (isRegexSearch) {
                try {
                    var lastSlash = searchText.lastIndexOf('/');
                    searchRegex = new RegExp(searchText.substring(1, lastSlash), searchText.substring(lastSlash + 1) || '');
                } catch (_) { searchRegex = null; }
            }
            for (var i = 0; i < allLines.length; i++) {
                var lineMatch = searchRegex ? searchRegex.test(allLines[i]) : allLines[i].indexOf(searchText) !== -1;
                if (lineMatch) {
                    var start = Math.max(0, i - contextRange);
                    var end = Math.min(allLines.length - 1, i + contextRange);
                    var contextLines = [];
                    for (var j = start; j <= end; j++) {
                        var prefix = (j === i) ? '>>> ' : '    ';
                        contextLines.push(prefix + (j + 1) + '| ' + allLines[j]);
                    }
                    matches.push({ line: i + 1, context: contextLines.join('\n') });
                }
            }

            if (matches.length === 0) {
                return { success: true, message: '未找到 "' + searchText + '"', data: '在 `' + toolkitName + '` (' + totalLines + ' 行) 中未找到' };
            }

            var output = [];
            output.push('## 搜索结果: `' + toolkitName + '`\n');
            output.push('> 搜索: "' + searchText + '" | 总行数: ' + totalLines + ' | 匹配: ' + matches.length + ' 处\n');

            matches.slice(0, CONFIG.MAX_SEARCH_RESULTS).forEach(function (m) {
                output.push('### 第 ' + m.line + ' 行');
                output.push('```javascript');
                output.push(m.context);
                output.push('```');
                output.push('');
            });

            if (matches.length > CONFIG.MAX_SEARCH_RESULTS) {
                output.push('> *(共 ' + matches.length + ' 处，仅显示前 ' + CONFIG.MAX_SEARCH_RESULTS + ' 处)*');
            }

            return {
                success: true,
                message: '找到 ' + matches.length + ' 处',
                data: truncateContent(output.join('\n'), CONFIG.MAX_INLINE_OUTPUT),
                meta: { total_lines: totalLines, match_count: matches.length }
            };
        }

        var startLine = safeNumber(params.start_line, 1, 1, totalLines);
        var endLine = safeNumber(params.end_line, Math.min(startLine + CONFIG.MAX_SEGMENT_LINES - 1, totalLines), 1, totalLines);

        if (endLine < startLine) endLine = startLine;
        if (endLine - startLine + 1 > CONFIG.MAX_SEGMENT_LINES) {
            endLine = startLine + CONFIG.MAX_SEGMENT_LINES - 1;
        }

        var segment = [];
        for (var si = startLine - 1; si < Math.min(endLine, totalLines); si++) {
            segment.push((si + 1) + '| ' + allLines[si]);
        }

        var output2 = [];
        output2.push('## 源码: `' + toolkitName + '` [第 ' + startLine + '-' + Math.min(endLine, totalLines) + ' 行 / 共 ' + totalLines + ' 行]\n');
        output2.push('```javascript');
        output2.push(segment.join('\n'));
        output2.push('```');

        if (endLine < totalLines) {
            output2.push('\n> 📖 还有 ' + (totalLines - endLine) + ' 行。用 `start_line: ' + (endLine + 1) + '` 继续。');
        }

        return {
            success: true,
            message: '已读取第 ' + startLine + '-' + Math.min(endLine, totalLines) + ' 行（共 ' + totalLines + ' 行）',
            data: truncateContent(output2.join('\n'), CONFIG.MAX_INLINE_OUTPUT),
            meta: { total_lines: totalLines, start_line: startLine, end_line: Math.min(endLine, totalLines), has_more: endLine < totalLines, char_count: code.length }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §25  工具处理器 - list_toolkits
    // ═══════════════════════════════════════════════════════════════════════════

    async function listToolkitsHandler(params) {
        var sortBy = safeStr(params.sort_by, 'name');
        var filterStr = safeStr(params.filter, '');
        var dir = getExamplesDir();
        var entries = await listDir(dir);

        var toolkits = [];

        var jsEntries = listToolkitFiles(entries);
        if (typeof sendIntermediateResult === 'function' && jsEntries.length > 5) {
            sendIntermediateResult({ success: true, message: '📦 正在扫描 ' + jsEntries.length + ' 个工具包...' });
        }
        for (var i = 0; i < jsEntries.length; i++) {
            var entry = jsEntries[i];
            var info = {
                name: entry.name.replace(/\.(js|ts)$/, ''),
                fileName: entry.name, size: entry.size || 0,
                lastModified: entry.lastModified || '',
                lineCount: 0, toolCount: 0, qualityScore: 0,
                category: '', version: '', author: ''
            };

            try {
                var content = await readFile(dir + entry.name);
                info.lineCount = content.split('\n').length;

                var meta = extractMetadata(content);
                if (meta) {
                    if (Array.isArray(meta.tools)) info.toolCount = meta.tools.length;
                    info.category = meta.category || '';
                    info.version = meta.version || '';
                    info.author = meta.author || '';
                }

                var localArch = analyzeArchitecture(content);
                info.qualityScore = localArch.qualityScore;
            } catch (readErr) {
                info.lineCount = -1;
                debugLog('读取 ' + entry.name + ' 失败: ' + readErr.message);
            }

            toolkits.push(info);
        }

        if (filterStr) {
            var fl = filterStr.toLowerCase();
            toolkits = toolkits.filter(function (t) {
                return t.name.toLowerCase().indexOf(fl) !== -1 ||
                       t.category.toLowerCase().indexOf(fl) !== -1 ||
                       t.author.toLowerCase().indexOf(fl) !== -1;
            });
        }

        switch (sortBy) {
            case 'size': toolkits.sort(function (a, b) { return b.size - a.size; }); break;
            case 'lines': toolkits.sort(function (a, b) { return b.lineCount - a.lineCount; }); break;
            case 'score': toolkits.sort(function (a, b) { return b.qualityScore - a.qualityScore; }); break;
            case 'modified': toolkits.sort(function (a, b) { return String(b.lastModified).localeCompare(String(a.lastModified)); }); break;
            default: toolkits.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }

        var lines = [];
        lines.push('## 📦 工具包列表\n');
        lines.push('> 目录: `' + dir + '` | 共 ' + toolkits.length + ' 个\n');
        lines.push('| # | 名称 | 行数 | 大小 | 工具数 | 分类 | 版本 | 评分 |');
        lines.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

        toolkits.forEach(function (t, i) {
            lines.push('| ' + (i + 1) + ' | `' + t.name + '` | ' + t.lineCount + ' | ' + formatBytes(t.size) + ' | ' + t.toolCount + ' | ' + (t.category || '-') + ' | ' + (t.version || '-') + ' | ' + t.qualityScore + ' |');
        });

        return {
            success: true,
            message: '共 ' + toolkits.length + ' 个工具包',
            data: truncateContent(lines.join('\n'), CONFIG.MAX_INLINE_OUTPUT),
            meta: {
                count: toolkits.length,
                total_lines: toolkits.reduce(function (s, t) { return s + Math.max(0, t.lineCount); }, 0),
                avg_score: toolkits.length > 0 ? Math.round(toolkits.reduce(function (s, t) { return s + t.qualityScore; }, 0) / toolkits.length) : 0
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §26  工具处理器 - snapshot
    // ═══════════════════════════════════════════════════════════════════════════

    async function snapshotHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) {
            return { success: false, message: '缺少必填参数 toolkit_name' };
        }
        var action = safeStr(params.action);
        if (!action) {
            return { success: false, message: '缺少必填参数 action (save/restore/list)' };
        }

        var snapshotDir = getSnapshotDir() + toolkitName + '/';
        await ensureDir(snapshotDir);

        if (action === 'save') {
            var code = await readToolkitSource(toolkitName);
            var timestamp = Date.now();
            var label = safeStr(params.snapshot_id, '');
            var snapshotId = label ? 'snap_' + timestamp + '_' + label.replace(/[^a-zA-Z0-9_]/g, '') : 'snap_' + timestamp;
            var snapshotPath = snapshotDir + snapshotId + '.js';
            await writeFile(snapshotPath, code);

            var meta = extractMetadata(code);
            var arch = analyzeArchitecture(code);
            var metaPath = snapshotDir + snapshotId + '.meta.json';
            await writeFile(metaPath, JSON.stringify({
                id: snapshotId, timestamp: timestamp, lineCount: arch.lineCount,
                qualityScore: arch.qualityScore, version: meta ? meta.version : 'unknown'
            }));

            return {
                success: true,
                message: '快照已保存: ' + snapshotId,
                data: '### ✅ 快照保存成功\n\n- **ID**: `' + snapshotId + '`\n- **时间**: ' + nowTimestamp() + '\n- **行数**: ' + arch.lineCount + '\n- **评分**: ' + arch.qualityScore,
                meta: { snapshot_id: snapshotId, toolkit: toolkitName }
            };
        }

        if (action === 'list') {
            var listEntries = await listDir(snapshotDir);
            var snapshots = listEntries.filter(function (e) {
                return e.name.endsWith('.js') && (!e.size || e.size > 0);
            }).map(function (e) { return e.name.replace('.js', ''); })
                .sort().reverse();

            if (snapshots.length === 0) {
                return { success: true, message: '没有快照', data: '`' + toolkitName + '` 没有快照' };
            }

            var listLines = [];
            listLines.push('## 📸 快照列表: `' + toolkitName + '`\n');
            listLines.push('| # | 快照 ID | 时间 | 行数 | 评分 |');
            listLines.push('| :--- | :--- | :--- | :--- | :--- |');
            for (var si = 0; si < snapshots.length; si++) {
                var s = snapshots[si];
                var ts = s.replace(/^snap_/, '');
                var tsNum = parseInt(ts.split('_')[0], 10);
                var date = isNaN(tsNum) ? ts : new Date(tsNum).toLocaleString('zh-CN', { hour12: false });
                var sLines = '-', sScore = '-';
                try {
                    var metaContent = await readFile(snapshotDir + s + '.meta.json');
                    var metaObj = JSON.parse(metaContent);
                    if (metaObj.lineCount) sLines = String(metaObj.lineCount);
                    if (metaObj.qualityScore !== undefined) sScore = String(metaObj.qualityScore);
                } catch (_) { }
                listLines.push('| ' + (si + 1) + ' | `' + s + '` | ' + date + ' | ' + sLines + ' | ' + sScore + ' |');
            }

            return { success: true, message: '共 ' + snapshots.length + ' 个快照', data: listLines.join('\n') };
        }

        if (action === 'diff') {
            var diffSnapId = safeStr(params.snapshot_id);
            if (!diffSnapId) {
                var diffEntries = await listDir(snapshotDir);
                var diffFiles = diffEntries.filter(function (e) { return e.name.endsWith('.js'); })
                    .sort(function (a, b) { return b.name.localeCompare(a.name); });
                if (diffFiles.length === 0) return { success: false, message: '没有快照可对比' };
                diffSnapId = diffFiles[0].name.replace('.js', '');
            }
            var diffPath = snapshotDir + diffSnapId + '.js';
            if (!(await fileExists(diffPath))) return { success: false, message: '快照不存在: ' + diffSnapId };

            var currentCode = await readToolkitSource(toolkitName);
            var snapCode = await readFile(diffPath);
            var currentLines = currentCode.split('\n');
            var snapLines = snapCode.split('\n');

            var diffReport = [];
            diffReport.push('## 📊 快照差异: `' + toolkitName + '`\n');
            diffReport.push('> 快照: `' + diffSnapId + '` vs 当前版本\n');
            diffReport.push('| 指标 | 快照 | 当前 | 变化 |');
            diffReport.push('| :--- | :--- | :--- | :--- |');
            diffReport.push('| 行数 | ' + snapLines.length + ' | ' + currentLines.length + ' | ' + (currentLines.length - snapLines.length > 0 ? '+' : '') + (currentLines.length - snapLines.length) + ' |');
            diffReport.push('| 字符数 | ' + snapCode.length + ' | ' + currentCode.length + ' | ' + (currentCode.length - snapCode.length > 0 ? '+' : '') + (currentCode.length - snapCode.length) + ' |');

            var snapArch = analyzeArchitecture(snapCode);
            var curArch = analyzeArchitecture(currentCode);
            diffReport.push('| 评分 | ' + snapArch.qualityScore + ' | ' + curArch.qualityScore + ' | ' + (curArch.qualityScore - snapArch.qualityScore > 0 ? '+' : '') + (curArch.qualityScore - snapArch.qualityScore) + ' |');
            diffReport.push('| 函数数 | ' + snapArch.functionCount + ' | ' + curArch.functionCount + ' | ' + (curArch.functionCount - snapArch.functionCount > 0 ? '+' : '') + (curArch.functionCount - snapArch.functionCount) + ' |');
            diffReport.push('');

            var changedLineNums = [];
            var maxLen = Math.max(currentLines.length, snapLines.length);
            for (var di = 0; di < maxLen; di++) {
                if ((currentLines[di] || '') !== (snapLines[di] || '')) {
                    changedLineNums.push(di + 1);
                }
            }

            if (changedLineNums.length === 0) {
                diffReport.push('### ✅ 内容完全一致');
            } else {
                diffReport.push('### 变更区域 (' + changedLineNums.length + ' 行不同)\n');
                var ranges = [];
                var rangeStart = changedLineNums[0], rangePrev = changedLineNums[0];
                for (var dj = 1; dj < changedLineNums.length; dj++) {
                    if (changedLineNums[dj] - rangePrev > 3) {
                        ranges.push([rangeStart, rangePrev]);
                        rangeStart = changedLineNums[dj];
                    }
                    rangePrev = changedLineNums[dj];
                }
                ranges.push([rangeStart, rangePrev]);

                ranges.slice(0, 15).forEach(function (r, rIdx) {
                    var rangeStr = r[0] + (r[1] > r[0] ? '-' + r[1] : '');
                    diffReport.push('**第 ' + rangeStr + ' 行**');
                    if (rIdx < 5) {
                        var previewStart = r[0] - 1;
                        var previewEnd = Math.min(r[1], previewStart + 3);
                        diffReport.push('```diff');
                        for (var pk = previewStart; pk < previewEnd; pk++) {
                            var snapLine = pk < snapLines.length ? snapLines[pk] : '';
                            var curLine = pk < currentLines.length ? currentLines[pk] : '';
                            if (snapLine !== curLine) {
                                if (snapLine) diffReport.push('- ' + snapLine);
                                if (curLine) diffReport.push('+ ' + curLine);
                            }
                        }
                        diffReport.push('```');
                    }
                    diffReport.push('');
                });
                if (ranges.length > 15) diffReport.push('*(更多 ' + (ranges.length - 15) + ' 个区域)*');
            }

            return {
                success: true,
                message: '差异对比完成: ' + changedLineNums.length + ' 行不同',
                data: truncateContent(diffReport.join('\n'), CONFIG.MAX_INLINE_OUTPUT),
                meta: { snapshot_id: diffSnapId, changed_lines: changedLineNums.length, score_before: snapArch.qualityScore, score_after: curArch.qualityScore }
            };
        }

        if (action === 'restore') {
            var snapshotId2 = safeStr(params.snapshot_id);

            if (!snapshotId2) {
                var restoreEntries = await listDir(snapshotDir);
                var jsFiles = restoreEntries.filter(function (e) { return e.name.endsWith('.js'); })
                    .sort(function (a, b) { return b.name.localeCompare(a.name); });
                if (jsFiles.length === 0) {
                    return { success: false, message: '没有可恢复的快照' };
                }
                snapshotId2 = jsFiles[0].name.replace('.js', '');
            }

            var restorePath = snapshotDir + snapshotId2 + '.js';
            var restoreExists = await fileExists(restorePath);
            if (!restoreExists) {
                return { success: false, message: '快照不存在: ' + snapshotId2 };
            }

            await createBackup(toolkitName);
            var snapshotContent = await readFile(restorePath);
            await writeFile(getToolkitPath(toolkitName), snapshotContent);

            return {
                success: true,
                message: '已恢复: ' + snapshotId2,
                data: '### ✅ 快照恢复成功\n\n- **ID**: `' + snapshotId2 + '`\n- **时间**: ' + nowTimestamp() + '\n- **已自动备份原文件**'
            };
        }

        if (action === 'delete') {
            var delSnapId = safeStr(params.snapshot_id);
            if (!delSnapId) return { success: false, message: '删除需指定 snapshot_id' };
            var delPath = snapshotDir + delSnapId + '.js';
            var delMetaPath = snapshotDir + delSnapId + '.meta.json';
            if (!(await fileExists(delPath))) return { success: false, message: '快照不存在: ' + delSnapId };
            try {
                await deleteFile(delPath);
                await deleteFile(delMetaPath);
            } catch (e) {
                return { success: false, message: '删除失败: ' + e.message };
            }
            return {
                success: true,
                message: '快照已删除: ' + delSnapId,
                data: '### 🗑️ 快照已删除\n\n- **ID**: `' + delSnapId + '`\n- **时间**: ' + nowTimestamp()
            };
        }

        return { success: false, message: '无效 action: ' + action + '（支持 save/restore/list/diff/delete）' };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §27  工具处理器 - test
    // ═══════════════════════════════════════════════════════════════════════════

    async function testHandler(params) {
        var report = [];
        report.push('## 🔧 toolkit_improve 自检报告\n');
        report.push('> 版本: v' + CONFIG.VERSION + ' | 时间: ' + nowTimestamp() + '\n');
        report.push('| 检查项 | 状态 |');
        report.push('| :--- | :--- |');

        var dir = getExamplesDir();
        var dirOk = false;
        try {
            var entries = await listDir(dir);
            dirOk = true;
            var jsCount = listToolkitFiles(entries).length;
            report.push('| 工具包目录 | ✅ 可访问 (' + jsCount + ' 个文件) |');
        } catch (e) {
            report.push('| 工具包目录 | ❌ ' + e.message + ' |');
        }
        report.push('| 目录路径 | `' + dir + '` |');

        var backupDir = getBackupDir();
        try {
            await ensureDir(backupDir);
            var testFile = backupDir + '.test_write_' + Date.now();
            await writeFile(testFile, 'test');
            var testExists = await fileExists(testFile);
            report.push('| 备份目录 | ' + (testExists ? '✅ 可读写' : '⚠️ 验证失败') + ' |');
            if (testExists) { try { await deleteFile(testFile); } catch (_) { } }
        } catch (e) {
            report.push('| 备份目录 | ❌ ' + e.message + ' |');
        }

        report.push('| 自动备份 | ' + (shouldBackup() ? '✅ 已启用' : '⚪ 已禁用') + ' |');
        report.push('| 调试模式 | ' + (DEBUG ? '✅ 已启用' : '⚪ 已禁用') + ' |');

        if (dirOk) {
            try {
                var sampleFile = listToolkitFiles(entries)[0];
                if (sampleFile) {
                    var sampleContent = await readFile(dir + sampleFile.name);
                    var sampleMeta = extractMetadata(sampleContent);
                    report.push('| METADATA 解析 | ' + (sampleMeta ? '✅ 正常 (样本: ' + sampleFile.name + ')' : '⚠️ 失败') + ' |');
                    if (sampleMeta) {
                        var sampleArch = analyzeArchitecture(sampleContent);
                        report.push('| 代码分析引擎 | ✅ 正常 (评分: ' + sampleArch.qualityScore + ', 行数: ' + sampleArch.lineCount + ') |');
                    }

                    var bracketTest = checkBracketBalance('var x = { a: "(", b: \'[\', c: `${1+2}` };');
                    report.push('| 括号检查器 | ' + (bracketTest.length === 0 ? '✅ 字符串字面量跟踪正常' : '⚠️ 存在误报 (' + bracketTest.length + ')') + ' |');

                    var patchTest = applyPatchExact('hello world', 'world', 'earth', 1);
                    report.push('| 补丁引擎 (exact) | ' + (patchTest.applied && patchTest.content === 'hello earth' ? '✅ 正常' : '❌ 异常') + ' |');

                    var fuzzyTest = applyPatchFuzzy('  var  x = 1;\n  var  y = 2;', 'var x = 1;', 'var x = 10;', 1);
                    report.push('| 补丁引擎 (fuzzy) | ' + (fuzzyTest.applied ? '✅ 正常' : '⚠️ 未匹配') + ' |');

                    var insertTest = applyPatchInsertLine('line1\nline2\nline3', 'inserted', 2);
                    report.push('| 补丁引擎 (insert_line) | ' + (insertTest.applied && insertTest.content === 'line1\ninserted\nline2\nline3' ? '✅ 正常' : '⚠️ 异常') + ' |');

                    var appendTest = applyPatch('line1\nline2', { new_code: 'line3', mode: 'append' });
                    report.push('| 补丁引擎 (append) | ' + (appendTest.applied && appendTest.content === 'line1\nline2\nline3' ? '✅ 正常' : '⚠️ 异常') + ' |');

                    var anchorTest = applyPatchAnchor('aaa bbb ccc', 'bbb', 'xxx', 'aaa ', ' ccc');
                    report.push('| 补丁引擎 (anchor) | ' + (anchorTest.applied && anchorTest.content === 'aaa xxx ccc' ? '✅ 正常' : '⚠️ 异常') + ' |');

                    var simTest = computeSimilarity('hello world', 'hello earth');
                    report.push('| 相似度算法 | ' + (simTest > 0.3 && simTest < 0.9 ? '✅ 正常 (' + (simTest * 100).toFixed(0) + '%)' : '⚠️ 异常 (' + (simTest * 100).toFixed(0) + '%)') + ' |');
                }
            } catch (e) {
                report.push('| 功能自检 | ⚠️ ' + e.message + ' |');
            }
        }

        report.push('');
        report.push('### 可用工具');
        report.push('');
        report.push('| 工具 | 用途 |');
        report.push('| :--- | :--- |');
        report.push('| `inspect_toolkit` | 深度审查（含命名一致性）|');
        report.push('| `compare_toolkits` | 工具包对比 |');
        report.push('| `patch_code` | 精准替换（自动命名校验，含 insert_line）|');
        report.push('| `batch_patch` | 批量补丁（自动命名校验）|');
        report.push('| `lint_check` | 质量检查（含命名一致性）|');
        report.push('| `learn_patterns` | 模式提取 |');
        report.push('| `evolve` | 自递归进化 |');
        report.push('| `read_toolkit` | 源码读取（支持全量 read_all）|');
        report.push('| `list_toolkits` | 列出工具包 |');
        report.push('| `snapshot` | 快照管理（含差异对比）|');
        report.push('| `create_toolkit` | 新工具包脚手架生成 |');

        return {
            success: dirOk,
            message: dirOk ? '自检通过 (v' + CONFIG.VERSION + ')' : '工具包目录不可访问',
            data: report.join('\n')
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §27b  工具处理器 - create_toolkit
    // ═══════════════════════════════════════════════════════════════════════════

    function buildToolkitScaffold(opts) {
        var name = opts.name, CONST = opts.CONST, feat = opts.feat, tools = opts.tools;
        function jstr(s) { return JSON.stringify(String(s || '')); }

        var envArr = [];
        if (feat.debug) envArr.push('        {\n            "name": "DEBUG",\n            "description": { "zh": "调试模式(true/false)", "en": "Debug mode" },\n            "required": false\n        }');
        if (feat.proxy) envArr.push('        {\n            "name": "' + name.toUpperCase() + '_PROXY",\n            "description": { "zh": "反向代理 URL", "en": "Proxy URL" },\n            "required": false\n        }');
        var envBlock = envArr.length > 0 ? ',\n    "env": [\n' + envArr.join(',\n') + '\n    ]' : '';

        var toolsJson = tools.map(function (t) {
            var paramsJson = (t.params || t.parameters || []).map(function (p) {
                return '            {\n' +
                    '                "name": ' + jstr(p.name) + ',\n' +
                    '                "type": ' + jstr(p.type || 'string') + ',\n' +
                    '                "required": ' + (p.required ? 'true' : 'false') + ',\n' +
                    '                "description": { "zh": ' + jstr(p.desc_zh || p.name) + ', "en": ' + jstr(p.desc_en || p.name) + ' }\n' +
                    '            }';
            }).join(',\n');
            return '        {\n' +
                '            "name": ' + jstr(t.name) + ',\n' +
                '            "description": { "zh": ' + jstr(t.desc_zh || t.name) + ', "en": ' + jstr(t.desc_en || t.name) + ' },\n' +
                '            "parameters": [\n' + paramsJson + '\n            ]\n' +
                '        }';
        }).join(',\n');

        var parts = [];
        parts.push('/* METADATA\n{\n' +
            '    "name": ' + jstr(name) + ',\n' +
            '    "version": "1.0",\n' +
            '    "display_name": { "zh": ' + jstr(opts.dispZh) + ', "en": ' + jstr(opts.dispEn) + ' },\n' +
            '    "description": { "zh": ' + jstr(opts.descZh) + ', "en": ' + jstr(opts.descEn) + ' },\n' +
            '    "enabledByDefault": ' + (opts.enabledByDefault === true ? 'true' : 'false') + ',\n' +
            '    "category": ' + jstr(opts.category) + ',\n' +
            '    "author": ' + jstr(opts.author || 'Operit Community') + ',\n' +
            '    "tools": [\n' + toolsJson + '\n    ]' + envBlock + '\n}\n*/\n\nvar ' + CONST + ' = (function () {\n\n');

        if (feat.config) parts.push('    var CONFIG = {\n        TIMEOUT: 10000\n    };\n\n');

        if (feat.debug) parts.push(
            '    var DEBUG = (function () {\n' +
            '        try { return (typeof getEnv === \'function\' && getEnv(\'DEBUG\') === \'true\'); } catch (_) { return false; }\n' +
            '    })();\n' +
            '    function debugLog(msg) { if (DEBUG) console.log(\'[' + name + '] \' + msg); }\n\n');

        if (feat.truncation) parts.push(
            '    function truncateContent(content, maxLen) {\n' +
            '        if (!content) return \'\';\n' +
            '        var limit = maxLen || 15000;\n' +
            '        if (content.length <= limit) return content;\n' +
            '        return content.substring(0, limit) + \'\\n*(已截断)*\';\n' +
            '    }\n\n');

        if (feat.retry) parts.push(
            '    async function withRetry(fn, maxRetries) {\n' +
            '        var tries = maxRetries || 3;\n' +
            '        for (var i = 0; i < tries; i++) {\n' +
            '            try { return await fn(); } catch (e) {\n' +
            '                if (i === tries - 1) throw e;\n' +
            '                if (typeof Tools !== \'undefined\' && Tools.System && Tools.System.sleep) {\n' +
            '                    Tools.System.sleep(Math.pow(2, i) * 500);\n' +
            '                }\n' +
            '            }\n' +
            '        }\n' +
            '    }\n\n');

        if (feat.cache) parts.push(
            '    var _cache = {};\n' +
            '    function getCache(key) { var e = _cache[key]; return (e && (e.expires === Infinity || Date.now() < e.expires)) ? e.value : null; }\n' +
            '    function setCache(key, value, ttlMs) { _cache[key] = { value: value, expires: ttlMs ? Date.now() + ttlMs : Infinity }; }\n\n');

        if (feat.proxy) parts.push(
            '    var PROXY_URL = (function () {\n' +
            '        try { return (typeof getEnv === \'function\' ? getEnv(\'' + name.toUpperCase() + '_PROXY\') : \'\') || \'\'; } catch (_) { return \'\'; }\n' +
            '    })();\n\n');

        tools.forEach(function (t) {
            if (t.name === 'test') return;
            var req = (t.params || t.parameters || []).filter(function (p) { return p.required; });
            var h = ['    async function ' + t.name + 'Handler(params) {'];
            if (feat.validation && req.length > 0) {
                req.forEach(function (p) { h.push('        if (!params.' + p.name + ') return { success: false, message: \'缺少必填参数 ' + p.name + '\' };'); });
            }
            h.push('        // TODO: 实现 ' + t.name + ' 逻辑');
            h.push('        return { success: true, message: \'' + t.name + ' 完成\', data: \'\' };');
            h.push('    }\n');
            parts.push(h.join('\n'));
        });

        if (tools.some(function (t) { return t.name === 'test'; })) {
            parts.push(
                '    async function testHandler() {\n' +
                '        return { success: true, message: \'' + name + ' 正常\', data: \'✅ 自检通过\' };\n' +
                '    }\n\n');
        }

        parts.push(
            '    async function wrapExecution(func, params, action) {\n' +
            '        try { var result = await func(params || {}); complete(result); }\n' +
            '        catch (error) { complete({ success: false, message: action + \' 失败: \' + error.message }); }\n' +
            '    }\n\n');

        var retItems = tools.map(function (t) {
            var fn = t.name === 'test' ? 'testHandler' : t.name + 'Handler';
            return '        ' + t.name + ': function (params) { return wrapExecution(' + fn + ', params, \'' + t.name + '\'); }';
        });
        parts.push('    return {\n' + retItems.join(',\n') + '\n    };\n\n})();\n\n');
        tools.forEach(function (t) { parts.push('exports.' + t.name + ' = ' + CONST + '.' + t.name + ';\n'); });
        return parts.join('');
    }

    async function createToolkitHandler(params) {
        var toolkitName = safeStr(params.toolkit_name);
        if (!toolkitName) return { success: false, message: '缺少必填参数 toolkit_name' };
        if (!CONFIG.NAMING_PATTERN.test(toolkitName)) return { success: false, message: 'toolkit_name 不合规: ' + toolkitName + '（需 /^[a-z][a-z0-9_]*$/）' };

        var targetPath = getToolkitPath(toolkitName);
        if (!safeBool(params.overwrite, false) && await fileExists(targetPath)) {
            return { success: false, message: '工具包已存在: ' + toolkitName + '，overwrite: true 可强制覆盖' };
        }

        var toolDefs = [{ name: 'test', desc_zh: '自检', desc_en: 'Self-test', params: [] }];
        if (params.tools) {
            try {
                var parsed = JSON.parse(params.tools);
                if (Array.isArray(parsed) && parsed.length > 0) toolDefs = parsed;
            } catch (e) {
                return { success: false, message: 'tools JSON 解析失败: ' + e.message };
            }
        }

        var featStr = safeStr(params.features, 'config,debug,truncation,validation');
        var feat = {};
        var featList = featStr === 'all'
            ? ['config', 'debug', 'truncation', 'validation', 'retry', 'cache', 'proxy']
            : featStr.split(',').map(function (f) { return f.trim(); });
        featList.forEach(function (f) { feat[f] = true; });

        var category = safeStr(params.category, 'UTILITY').toUpperCase();
        if (CONFIG.VALID_CATEGORIES.indexOf(category) === -1) category = 'UTILITY';

        var code = buildToolkitScaffold({
            name: toolkitName, CONST: toolkitName.toUpperCase(), feat: feat, tools: toolDefs,
            descZh: safeStr(params.description_zh, toolkitName + ' 工具包'),
            descEn: safeStr(params.description_en, toolkitName + ' toolkit'),
            dispZh: safeStr(params.display_name_zh, toolkitName),
            dispEn: safeStr(params.display_name_en, toolkitName),
            category: category,
            author: safeStr(params.author, 'Operit Community'),
            enabledByDefault: safeBool(params.enabled_by_default, false)
        });

        var syntaxResult = quickSyntaxCheck(code);
        if (!syntaxResult.valid) {
            return { success: false, message: '脚手架语法校验失败', data: syntaxResult.errors.map(function (e) { return e.message; }).join('\n') };
        }

        var genMeta = extractMetadata(code);
        var namingCheck = checkNamingConsistency(code, genMeta);
        var namingErrors = namingCheck.filter(function (i) { return i.level === 'error'; });
        if (namingErrors.length > 0) {
            return { success: false, message: '脚手架命名一致性校验失败', data: namingErrors.map(function (e) { return e.message; }).join('\n') };
        }

        await writeFile(targetPath, code);
        var lineCount = code.split('\n').length;

        var report = ['## ✅ 工具包已创建: `' + toolkitName + '`\n'];
        report.push('| 字段 | 值 |');
        report.push('| :--- | :--- |');
        report.push('| 路径 | `' + targetPath + '` |');
        report.push('| 行数 | ' + lineCount + ' |');
        report.push('| 工具数 | ' + toolDefs.length + ' |');
        report.push('| 特性 | ' + featList.join(', ') + ' |');
        report.push('');
        report.push('### 下一步');
        report.push('1. 用 `read_toolkit` 查看生成的代码');
        report.push('2. 用 `patch_code` 填充各工具的业务逻辑');
        report.push('3. 用 `inspect_toolkit` 审查代码质量');

        return {
            success: true,
            message: '已创建 ' + toolkitName + '.js（' + lineCount + ' 行，' + toolDefs.length + ' 个工具）',
            data: report.join('\n'),
            meta: { path: targetPath, line_count: lineCount, tool_count: toolDefs.length, features: featList }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // §28  统一错误处理包装器
    // ═══════════════════════════════════════════════════════════════════════════

    async function wrapToolExecution(func, params, actionName) {
        try {
            var result = await func(params || {});
            complete(result);
        } catch (error) {
            console.error('[ToolkitImprove] ' + actionName + ' 失败: ' + error.message);
            if (error.stack) console.error(error.stack);
            complete({
                success: false,
                message: actionName + ' 失败: ' + error.message,
                error_stack: DEBUG ? error.stack : undefined
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 公开接口
    // ═══════════════════════════════════════════════════════════════════════════

    return {
        inspect_toolkit: function (params) { return wrapToolExecution(inspectToolkitHandler, params, '工具包审查'); },
        compare_toolkits: function (params) { return wrapToolExecution(compareToolkitsHandler, params, '工具包对比'); },
        patch_code: function (params) { return wrapToolExecution(patchCodeHandler, params, '代码替换'); },
        batch_patch: function (params) { return wrapToolExecution(batchPatchHandler, params, '批量补丁'); },
        lint_check: function (params) { return wrapToolExecution(lintCheckHandler, params, '代码质量检查'); },
        learn_patterns: function (params) { return wrapToolExecution(learnPatternsHandler, params, '模式学习'); },
        evolve: function (params) { return wrapToolExecution(evolveHandler, params, '自递归进化'); },
        read_toolkit: function (params) { return wrapToolExecution(readToolkitHandler, params, '源码读取'); },
        list_toolkits: function (params) { return wrapToolExecution(listToolkitsHandler, params, '工具包列表'); },
        snapshot: function (params) { return wrapToolExecution(snapshotHandler, params, '快照管理'); },
        test: function (params) { return wrapToolExecution(testHandler, params, '自检'); },
        create_toolkit: function (params) { return wrapToolExecution(createToolkitHandler, params, '创建工具包'); }
    };

})();

// ═══════════════════════════════════════════════════════════════════════════════
// 模块导出
// ═══════════════════════════════════════════════════════════════════════════════
exports.inspect_toolkit = TOOLKIT_IMPROVE.inspect_toolkit;
exports.compare_toolkits = TOOLKIT_IMPROVE.compare_toolkits;
exports.patch_code = TOOLKIT_IMPROVE.patch_code;
exports.batch_patch = TOOLKIT_IMPROVE.batch_patch;
exports.lint_check = TOOLKIT_IMPROVE.lint_check;
exports.learn_patterns = TOOLKIT_IMPROVE.learn_patterns;
exports.evolve = TOOLKIT_IMPROVE.evolve;
exports.read_toolkit = TOOLKIT_IMPROVE.read_toolkit;
exports.list_toolkits = TOOLKIT_IMPROVE.list_toolkits;
exports.snapshot = TOOLKIT_IMPROVE.snapshot;
exports.test = TOOLKIT_IMPROVE.test;
exports.create_toolkit = TOOLKIT_IMPROVE.create_toolkit;
