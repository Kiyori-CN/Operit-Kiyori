/* METADATA
{
    "name": "filetree_generate",
    "version": "1.0",
    "display_name": {
        "zh": "文件目录树生成器",
        "en": "File Directory Tree Generator"
    },
    "description": {
        "zh": "文件目录树生成工具包。递归扫描指定路径，生成结构清晰的树状目录视图。支持：1) 自定义递归深度与隐藏文件显示；2) 按文件类型、名称模式、大小范围过滤；3) 多种排序策略（名称/大小/修改时间）；4) 目录统计摘要（文件数、目录数、总大小）；5) 导出为 Markdown 或 JSON 格式持久化保存；6) 大目录智能截断与中间进度推送。适用于项目结构概览、文档编写、代码审查等场景。",
        "en": "File directory tree generator toolkit. Recursively scans paths to produce clear tree-view outputs. Features: 1) Custom depth and hidden file toggle; 2) Filter by extension, name pattern, size range; 3) Multiple sort strategies (name/size/modified); 4) Directory statistics (file count, dir count, total size); 5) Export to Markdown or JSON for persistence; 6) Smart truncation and intermediate progress for large directories. Ideal for project overview, documentation, and code review."
    },
    "enabledByDefault": true,
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "generate_tree",
            "description": {
                "zh": "生成指定路径的目录树。递归扫描并以缩进树状图形式输出，支持深度限制、隐藏文件显示、文件过滤（扩展名/名称模式/大小范围）、排序方式选择、统计摘要。适合快速了解项目或目录结构。",
                "en": "Generate a directory tree at the given path. Recursively scans and outputs indented tree view. Supports depth limit, hidden files, filtering (extension/name pattern/size range), sort order, and statistics summary."
            },
            "parameters": [
                {
                    "name": "path",
                    "type": "string",
                    "required": false,
                    "default": "/storage/emulated/0/Download/Operit",
                    "description": {
                        "zh": "目标路径。默认为 Operit 主目录。支持 Android 文件系统路径。",
                        "en": "Target path. Defaults to Operit home directory. Supports Android filesystem paths."
                    }
                },
                {
                    "name": "depth",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "最大递归深度（1-10），默认 3。大目录建议设为 2 以提升速度。",
                        "en": "Max recursion depth (1-10), default 3. Use 2 for large directories."
                    }
                },
                {
                    "name": "show_hidden",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否显示隐藏文件（以 . 开头），默认 false",
                        "en": "Show hidden files (starting with .), default false"
                    }
                },
                {
                    "name": "filter_ext",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按扩展名过滤，多个用逗号分隔，如 js,ts,json。仅显示匹配的文件（目录始终显示）。留空不过滤。",
                        "en": "Filter by extensions (comma-separated, e.g. js,ts,json). Only matching files shown (dirs always shown). Empty = no filter."
                    }
                },
                {
                    "name": "filter_pattern",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按文件名关键词过滤（不区分大小写），仅显示名称包含该关键词的文件/目录。留空不过滤。",
                        "en": "Filter by filename keyword (case-insensitive). Only entries containing this keyword are shown. Empty = no filter."
                    }
                },
                {
                    "name": "min_size",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "文件最小字节数过滤（仅对文件生效），小于此值的文件将被隐藏",
                        "en": "Minimum file size in bytes (files only). Files smaller than this are hidden."
                    }
                },
                {
                    "name": "max_size",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "文件最大字节数过滤（仅对文件生效），大于此值的文件将被隐藏",
                        "en": "Maximum file size in bytes (files only). Files larger than this are hidden."
                    }
                },
                {
                    "name": "sort_by",
                    "type": "string",
                    "required": false,
                    "default": "name",
                    "description": {
                        "zh": "排序方式：name（名称升序）/ name_desc（名称降序）/ size（大小升序）/ size_desc（大小降序）/ modified（修改时间升序）/ modified_desc（修改时间降序）。默认 name。所有模式下目录始终排在文件前面。",
                        "en": "Sort: name / name_desc / size / size_desc / modified / modified_desc. Default: name. Directories always come first."
                    }
                },
                {
                    "name": "show_size",
                    "type": "boolean",
                    "required": false,
                    "default": true,
                    "description": {
                        "zh": "是否在文件名后显示文件大小，默认 true",
                        "en": "Show file size after filename, default true"
                    }
                },
                {
                    "name": "show_date",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否在文件名后显示最后修改日期，默认 false",
                        "en": "Show last modified date after filename, default false"
                    }
                },
                {
                    "name": "dirs_only",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否只显示目录（忽略所有文件），默认 false",
                        "en": "Show directories only (ignore all files), default false"
                    }
                }
            ]
        },
        {
            "name": "export_tree",
            "description": {
                "zh": "生成目录树并导出为文件。支持 Markdown (.md) 和 JSON (.json) 两种格式。Markdown 格式适合文档编写和展示，JSON 格式适合程序化处理。文件保存到指定路径或默认临时目录。",
                "en": "Generate and export directory tree to a file. Supports Markdown (.md) and JSON (.json) formats. Markdown for documentation, JSON for programmatic use. Saves to specified path or default temp directory."
            },
            "parameters": [
                {
                    "name": "path",
                    "type": "string",
                    "required": false,
                    "default": "/storage/emulated/0/Download/Operit",
                    "description": {
                        "zh": "目标扫描路径。默认为 Operit 主目录。",
                        "en": "Target scan path. Defaults to Operit home directory."
                    }
                },
                {
                    "name": "depth",
                    "type": "number",
                    "required": false,
                    "default": 3,
                    "description": {
                        "zh": "最大递归深度（1-10），默认 3",
                        "en": "Max recursion depth (1-10), default 3"
                    }
                },
                {
                    "name": "format",
                    "type": "string",
                    "required": false,
                    "default": "markdown",
                    "description": {
                        "zh": "导出格式：markdown（.md 文件，含代码块包裹的树状图）/ json（.json 文件，结构化数据含每个节点的名称、路径、类型、大小、子节点）。默认 markdown。",
                        "en": "Export format: markdown (.md with code-fenced tree) / json (.json with structured node data). Default: markdown."
                    }
                },
                {
                    "name": "output_path",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "输出文件保存路径（含文件名）。留空则自动保存到 Operit 临时目录，文件名包含时间戳。",
                        "en": "Output file path (with filename). Leave empty to auto-save to Operit temp directory with timestamp."
                    }
                },
                {
                    "name": "show_hidden",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否包含隐藏文件，默认 false",
                        "en": "Include hidden files, default false"
                    }
                },
                {
                    "name": "filter_ext",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按扩展名过滤，多个用逗号分隔",
                        "en": "Filter by extensions, comma-separated"
                    }
                }
            ]
        },
        {
            "name": "get_dir_stats",
            "description": {
                "zh": "获取目录的详细统计信息。递归扫描并统计：文件总数、目录总数、总大小、各扩展名文件数量与大小分布、最大文件 Top5、最近修改文件 Top5。不生成树状图，专注于数据统计分析。适用于磁盘占用分析和项目规模评估。",
                "en": "Get detailed directory statistics. Recursively counts: total files, dirs, size, extension distribution, top 5 largest files, top 5 recently modified. Focused on data analysis without tree rendering. For disk usage analysis and project size assessment."
            },
            "parameters": [
                {
                    "name": "path",
                    "type": "string",
                    "required": false,
                    "default": "/storage/emulated/0/Download/Operit",
                    "description": {
                        "zh": "目标路径。默认为 Operit 主目录。",
                        "en": "Target path. Defaults to Operit home directory."
                    }
                },
                {
                    "name": "depth",
                    "type": "number",
                    "required": false,
                    "default": 10,
                    "description": {
                        "zh": "最大递归深度（1-50），默认 10。统计场景可设更大值。",
                        "en": "Max recursion depth (1-50), default 10. Can be larger for stats."
                    }
                },
                {
                    "name": "show_hidden",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否统计隐藏文件，默认 false",
                        "en": "Include hidden files in stats, default false"
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试文件系统访问能力。验证 Tools.Files API 的 info、list 等核心接口可用性，检查默认目录的读取权限，输出诊断报告。无需参数。",
                "en": "Test filesystem access. Validates Tools.Files API (info, list) availability and default directory read permissions. Outputs diagnostic report. No parameters needed."
            },
            "parameters": []
        }
    ]
}
*/

const FILETREE = (function () {

    var CONFIG = {
        DEFAULT_PATH: "/storage/emulated/0/Download/Operit",
        TEMP_DIR: "/storage/emulated/0/Download/Operit/.filetree_tmp/",
        MAX_OUTPUT_CHARS: 60000,
        MAX_SINGLE_DIR_ENTRIES: 500,
        MAX_TOTAL_NODES: 5000,
        PROGRESS_INTERVAL: 200,
        VERSION: "1.0"
    };

    var ICON_DIR       = "\uD83D\uDCC1";
    var ICON_FILE      = "\uD83D\uDCC4";
    var ICON_LOCK      = "\uD83D\uDD12";
    var ICON_HIDDEN    = "\uD83D\uDCA4";
    var BRANCH_MID     = "\u251C\u2500\u2500 ";
    var BRANCH_END     = "\u2514\u2500\u2500 ";
    var BRANCH_PIPE    = "\u2502   ";
    var BRANCH_SPACE   = "    ";

    var SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

    var EXT_CATEGORIES = {
        code:   ["js", "ts", "jsx", "tsx", "py", "java", "kt", "c", "cpp", "h", "go", "rs", "rb", "php", "swift", "dart", "lua", "sh", "bat", "ps1"],
        data:   ["json", "xml", "yaml", "yml", "toml", "csv", "tsv", "sql", "db", "sqlite"],
        doc:    ["md", "txt", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf", "tex", "log"],
        media:  ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "ico", "mp3", "mp4", "wav", "flac", "avi", "mkv", "mov", "ogg", "aac"],
        archive:["zip", "tar", "gz", "bz2", "7z", "rar", "xz", "zst", "apk", "jar", "war"],
        config: ["ini", "cfg", "conf", "env", "properties", "gradle", "lock"]
    };

    function formatSize(bytes) {
        if (bytes === undefined || bytes === null || bytes < 0) return "?";
        if (bytes === 0) return "0 B";
        var i = 0;
        var b = bytes;
        while (b >= 1024 && i < SIZE_UNITS.length - 1) {
            b /= 1024;
            i++;
        }
        return (i === 0 ? b : b.toFixed(1)) + " " + SIZE_UNITS[i];
    }

    function formatDate(timestamp) {
        if (!timestamp) return "?";
        try {
            var d = new Date(typeof timestamp === "number" ? timestamp : Date.parse(timestamp));
            if (isNaN(d.getTime())) return "?";
            var y = d.getFullYear();
            var m = String(d.getMonth() + 1).padStart(2, "0");
            var day = String(d.getDate()).padStart(2, "0");
            var h = String(d.getHours()).padStart(2, "0");
            var min = String(d.getMinutes()).padStart(2, "0");
            return y + "-" + m + "-" + day + " " + h + ":" + min;
        } catch (_) {
            return "?";
        }
    }

    function getExtension(name) {
        if (!name) return "";
        var idx = name.lastIndexOf(".");
        if (idx <= 0 || idx === name.length - 1) return "";
        return name.substring(idx + 1).toLowerCase();
    }

    function getExtCategory(ext) {
        if (!ext) return "other";
        for (var cat in EXT_CATEGORIES) {
            if (EXT_CATEGORIES[cat].indexOf(ext) !== -1) return cat;
        }
        return "other";
    }

    function getDirName(path) {
        if (!path) return "";
        var clean = path.replace(/\/+$/, "");
        var idx = clean.lastIndexOf("/");
        return idx >= 0 ? clean.substring(idx + 1) : clean;
    }

    function normalizePath(p) {
        if (!p) return CONFIG.DEFAULT_PATH;
        var s = p.trim().replace(/\/+$/, "");
        return s || "/";
    }

    function safeNumber(value, defaultVal, min, max) {
        if (value === undefined || value === null || value === "") return defaultVal;
        var num = Number(value);
        if (isNaN(num)) return defaultVal;
        return Math.max(min, Math.min(max, Math.round(num)));
    }

    function safeBool(value, defaultVal) {
        if (value === undefined || value === null || value === "") return defaultVal;
        if (typeof value === "boolean") return value;
        var str = String(value).trim().toLowerCase();
        if (str === "true" || str === "1" || str === "yes") return true;
        if (str === "false" || str === "0" || str === "no") return false;
        return defaultVal;
    }

    function truncateOutput(content, maxLen) {
        if (!content) return "";
        if (content.length <= maxLen) return content;
        return content.substring(0, maxLen) + "\n\n*(\u5185\u5bb9\u8fc7\u957f\uff0c\u5df2\u622a\u65ad\u81f3 " + maxLen + " \u5b57\u7b26)*";
    }

    function parseExtFilter(filterStr) {
        if (!filterStr || !filterStr.trim()) return null;
        var exts = filterStr.split(",")
            .map(function (e) { return e.trim().toLowerCase().replace(/^\./, ""); })
            .filter(function (e) { return e.length > 0; });
        return exts.length > 0 ? exts : null;
    }

    function sendProgress(msg) {
        if (typeof sendIntermediateResult === "function") {
            sendIntermediateResult({ success: true, message: msg });
        }
    }

    function buildSortComparator(sortBy) {
        var desc = false;
        var field = "name";
        if (sortBy) {
            var s = sortBy.trim().toLowerCase();
            if (s.endsWith("_desc")) {
                desc = true;
                field = s.replace(/_desc$/, "");
            } else {
                field = s;
            }
        }
        return function (a, b) {
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            var result = 0;
            switch (field) {
                case "size":
                    var sa = (a.size !== undefined && a.size !== null) ? a.size : 0;
                    var sb = (b.size !== undefined && b.size !== null) ? b.size : 0;
                    result = sa - sb;
                    break;
                case "modified":
                    var ma = a.lastModified || 0;
                    var mb = b.lastModified || 0;
                    if (typeof ma === "string") ma = Date.parse(ma) || 0;
                    if (typeof mb === "string") mb = Date.parse(mb) || 0;
                    result = ma - mb;
                    break;
                default:
                    result = (a.name || "").localeCompare(b.name || "");
                    break;
            }
            return desc ? -result : result;
        };
    }

    function matchesFilter(entry, opts) {
        if (!opts.showHidden && entry.name && entry.name.charAt(0) === ".") {
            return false;
        }
        if (entry.isDirectory) {
            if (opts.filterPattern) {
                return true;
            }
            return true;
        }
        if (opts.dirsOnly) return false;
        if (opts.extFilter) {
            var ext = getExtension(entry.name);
            if (opts.extFilter.indexOf(ext) === -1) return false;
        }
        if (opts.filterPattern) {
            var lower = (entry.name || "").toLowerCase();
            if (lower.indexOf(opts.filterPattern) === -1) return false;
        }
        if (opts.minSize !== null && opts.minSize !== undefined) {
            if (entry.size !== undefined && entry.size < opts.minSize) return false;
        }
        if (opts.maxSize !== null && opts.maxSize !== undefined) {
            if (entry.size !== undefined && entry.size > opts.maxSize) return false;
        }
        return true;
    }

    var scanState = {
        totalNodes: 0,
        totalFiles: 0,
        totalDirs: 0,
        totalSize: 0,
        lastProgressTime: 0,
        errors: [],
        allFiles: [],
        extMap: {}
    };

    function resetScanState() {
        scanState.totalNodes = 0;
        scanState.totalFiles = 0;
        scanState.totalDirs = 0;
        scanState.totalSize = 0;
        scanState.lastProgressTime = Date.now();
        scanState.errors = [];
        scanState.allFiles = [];
        scanState.extMap = {};
    }

    function recordFile(entry, fullPath) {
        scanState.totalFiles++;
        var sz = entry.size || 0;
        scanState.totalSize += sz;
        var ext = getExtension(entry.name) || "(none)";
        if (!scanState.extMap[ext]) {
            scanState.extMap[ext] = { count: 0, size: 0 };
        }
        scanState.extMap[ext].count++;
        scanState.extMap[ext].size += sz;
        scanState.allFiles.push({
            name: entry.name,
            path: fullPath,
            size: sz,
            lastModified: entry.lastModified || 0,
            ext: ext
        });
    }

    function maybeProgress(currentPath) {
        var now = Date.now();
        if (now - scanState.lastProgressTime >= CONFIG.PROGRESS_INTERVAL) {
            scanState.lastProgressTime = now;
            sendProgress(
                "\u2699\uFE0F \u626B\u63CF\u4E2D... \u5DF2\u53D1\u73B0 " +
                scanState.totalDirs + " \u4E2A\u76EE\u5F55\u3001" +
                scanState.totalFiles + " \u4E2A\u6587\u4EF6 | " +
                getDirName(currentPath)
            );
        }
    }

    async function scanDirectory(path, currentDepth, maxDepth, opts, sortCmp) {
        if (currentDepth > maxDepth) return [];
        if (scanState.totalNodes >= CONFIG.MAX_TOTAL_NODES) return [];

        var listing;
        try {
            listing = await Tools.Files.list(path, "android");
        } catch (e) {
            scanState.errors.push({ path: path, error: e.message || String(e) });
            return [];
        }

        if (!listing || !listing.entries) return [];

        var entries = listing.entries;
        if (entries.length > CONFIG.MAX_SINGLE_DIR_ENTRIES) {
            scanState.errors.push({
                path: path,
                error: "\u76EE\u5F55\u5305\u542B " + entries.length + " \u4E2A\u6761\u76EE\uFF0C\u5DF2\u622A\u53D6\u524D " + CONFIG.MAX_SINGLE_DIR_ENTRIES + " \u4E2A"
            });
            entries = entries.slice(0, CONFIG.MAX_SINGLE_DIR_ENTRIES);
        }

        var filtered = [];
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (!matchesFilter(entry, opts)) continue;
            filtered.push(entry);
        }

        filtered.sort(sortCmp);

        var nodes = [];
        for (var j = 0; j < filtered.length; j++) {
            var e = filtered[j];
            scanState.totalNodes++;
            if (scanState.totalNodes >= CONFIG.MAX_TOTAL_NODES) break;

            var fullPath = path + "/" + e.name;
            var node = {
                name: e.name,
                path: fullPath,
                isDirectory: !!e.isDirectory,
                size: e.size,
                lastModified: e.lastModified,
                children: []
            };

            if (e.isDirectory) {
                scanState.totalDirs++;
                maybeProgress(fullPath);
                if (currentDepth < maxDepth) {
                    node.children = await scanDirectory(fullPath, currentDepth + 1, maxDepth, opts, sortCmp);
                    if (opts.filterPattern || opts.extFilter) {
                        if (node.children.length === 0 && !opts.dirsOnly) {
                            var dirNameLower = (e.name || "").toLowerCase();
                            var patternMatch = !opts.filterPattern || dirNameLower.indexOf(opts.filterPattern) !== -1;
                            if (!patternMatch) continue;
                        }
                    }
                }
            } else {
                recordFile(e, fullPath);
            }

            nodes.push(node);
        }

        return nodes;
    }

    function renderTree(nodes, prefix, showSize, showDate) {
        var lines = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var isLast = (i === nodes.length - 1);
            var connector = isLast ? BRANCH_END : BRANCH_MID;
            var icon = node.isDirectory ? ICON_DIR : ICON_FILE;
            var suffix = "";
            if (!node.isDirectory) {
                if (showSize && node.size !== undefined) {
                    suffix += " (" + formatSize(node.size) + ")";
                }
                if (showDate && node.lastModified) {
                    suffix += " [" + formatDate(node.lastModified) + "]";
                }
            } else {
                if (showDate && node.lastModified) {
                    suffix += " [" + formatDate(node.lastModified) + "]";
                }
            }

            lines.push(prefix + connector + icon + " " + node.name + suffix);

            if (node.isDirectory && node.children && node.children.length > 0) {
                var childPrefix = prefix + (isLast ? BRANCH_SPACE : BRANCH_PIPE);
                var childLines = renderTree(node.children, childPrefix, showSize, showDate);
                for (var c = 0; c < childLines.length; c++) {
                    lines.push(childLines[c]);
                }
            }
        }
        return lines;
    }

    function buildJsonTree(nodes) {
        return nodes.map(function (node) {
            var obj = {
                name: node.name,
                path: node.path,
                type: node.isDirectory ? "directory" : "file"
            };
            if (!node.isDirectory) {
                obj.size = node.size || 0;
                obj.extension = getExtension(node.name);
            }
            if (node.lastModified) {
                obj.lastModified = node.lastModified;
            }
            if (node.isDirectory && node.children && node.children.length > 0) {
                obj.children = buildJsonTree(node.children);
            }
            return obj;
        });
    }

    function buildSummary(rootPath, depthUsed) {
        var lines = [];
        lines.push("---");
        lines.push("**\u7EDF\u8BA1\u6458\u8981** | \u6DF1\u5EA6: " + depthUsed);
        lines.push(
            ICON_DIR + " \u76EE\u5F55: " + scanState.totalDirs +
            " | " + ICON_FILE + " \u6587\u4EF6: " + scanState.totalFiles +
            " | \u603B\u5927\u5C0F: " + formatSize(scanState.totalSize)
        );
        if (scanState.errors.length > 0) {
            lines.push(ICON_LOCK + " \u8BBF\u95EE\u53D7\u9650: " + scanState.errors.length + " \u4E2A\u76EE\u5F55");
        }
        return lines.join("\n");
    }

    function buildExtDistribution() {
        var entries = [];
        for (var ext in scanState.extMap) {
            entries.push({ ext: ext, count: scanState.extMap[ext].count, size: scanState.extMap[ext].size });
        }
        if (entries.length === 0) return "";
        entries.sort(function (a, b) { return b.count - a.count; });

        var lines = [];
        lines.push("\n### \u6587\u4EF6\u7C7B\u578B\u5206\u5E03\n");
        lines.push("| \u6269\u5C55\u540D | \u6570\u91CF | \u5927\u5C0F | \u5206\u7C7B |");
        lines.push("| :--- | :--- | :--- | :--- |");
        var showCount = Math.min(entries.length, 20);
        for (var i = 0; i < showCount; i++) {
            var e = entries[i];
            var cat = getExtCategory(e.ext === "(none)" ? "" : e.ext);
            lines.push("| ." + e.ext + " | " + e.count + " | " + formatSize(e.size) + " | " + cat + " |");
        }
        if (entries.length > 20) {
            lines.push("| ... | " + (entries.length - 20) + " \u79CD\u5176\u4ED6 | - | - |");
        }
        return lines.join("\n");
    }

    function buildTopFiles(label, sortFn, count) {
        if (scanState.allFiles.length === 0) return "";
        var sorted = scanState.allFiles.slice().sort(sortFn);
        var top = sorted.slice(0, count);
        var lines = [];
        lines.push("\n### " + label + " (Top " + count + ")\n");
        lines.push("| \u6587\u4EF6\u540D | \u5927\u5C0F | \u8DEF\u5F84 |");
        lines.push("| :--- | :--- | :--- |");
        for (var i = 0; i < top.length; i++) {
            var f = top[i];
            lines.push("| " + f.name + " | " + formatSize(f.size) + " | " + f.path + " |");
        }
        return lines.join("\n");
    }

    async function generateTreeHandler(params) {
        var p = params || {};
        var rootPath   = normalizePath(p.path);
        var depth      = safeNumber(p.depth, 3, 1, 10);
        var showHidden = safeBool(p.show_hidden, false);
        var showSize   = safeBool(p.show_size, true);
        var showDate   = safeBool(p.show_date, false);
        var dirsOnly   = safeBool(p.dirs_only, false);
        var sortBy     = (p.sort_by || "name").trim().toLowerCase();
        var extFilter  = parseExtFilter(p.filter_ext);
        var filterPattern = p.filter_pattern ? p.filter_pattern.trim().toLowerCase() : null;
        var minSize    = (p.min_size !== undefined && p.min_size !== null && p.min_size !== "") ? Number(p.min_size) : null;
        var maxSize    = (p.max_size !== undefined && p.max_size !== null && p.max_size !== "") ? Number(p.max_size) : null;

        var info;
        try {
            info = await Tools.Files.info(rootPath, "android");
        } catch (e) {
            return { success: false, message: "\u65E0\u6CD5\u8BBF\u95EE\u8DEF\u5F84: " + rootPath + " (" + e.message + ")" };
        }

        if (!info || !info.exists) {
            return { success: false, message: "\u8DEF\u5F84\u4E0D\u5B58\u5728: " + rootPath };
        }

        if (info.fileType !== "directory") {
            var fileInfo = ICON_FILE + " " + getDirName(rootPath) + "\n";
            fileInfo += "  \u7C7B\u578B: \u6587\u4EF6\n";
            fileInfo += "  \u5927\u5C0F: " + formatSize(info.size) + "\n";
            fileInfo += "  \u6269\u5C55\u540D: " + (getExtension(getDirName(rootPath)) || "\u65E0") + "\n";
            if (info.lastModified) fileInfo += "  \u4FEE\u6539\u65F6\u95F4: " + formatDate(info.lastModified);
            return { success: true, message: "\u76EE\u6807\u662F\u6587\u4EF6\u800C\u975E\u76EE\u5F55", data: fileInfo };
        }

        resetScanState();
        sendProgress("\u2699\uFE0F \u5F00\u59CB\u626B\u63CF: " + rootPath);

        var opts = {
            showHidden: showHidden,
            dirsOnly: dirsOnly,
            extFilter: extFilter,
            filterPattern: filterPattern,
            minSize: minSize,
            maxSize: maxSize
        };
        var sortCmp = buildSortComparator(sortBy);

        var nodes = await scanDirectory(rootPath, 1, depth, opts, sortCmp);

        var rootLabel = ICON_DIR + " " + getDirName(rootPath) + "/";
        var treeLines = renderTree(nodes, "", showSize, showDate);
        var output = [];
        output.push("## \uD83C\uDF33 \u76EE\u5F55\u6811: " + rootPath + "\n");

        var filterInfo = [];
        if (extFilter) filterInfo.push("\u6269\u5C55\u540D: " + extFilter.join(", "));
        if (filterPattern) filterInfo.push("\u5173\u952E\u8BCD: " + filterPattern);
        if (minSize !== null) filterInfo.push("\u6700\u5C0F: " + formatSize(minSize));
        if (maxSize !== null) filterInfo.push("\u6700\u5927: " + formatSize(maxSize));
        if (dirsOnly) filterInfo.push("\u4EC5\u76EE\u5F55");
        if (showHidden) filterInfo.push("\u542B\u9690\u85CF\u6587\u4EF6");
        if (filterInfo.length > 0) {
            output.push("> \u8FC7\u6EE4: " + filterInfo.join(" | ") + "\n");
        }

        output.push("```");
        output.push(rootLabel);
        for (var i = 0; i < treeLines.length; i++) {
            output.push(treeLines[i]);
        }
        output.push("```");
        output.push("");
        output.push(buildSummary(rootPath, depth));

        if (scanState.errors.length > 0 && scanState.errors.length <= 5) {
            output.push("\n**\u8BBF\u95EE\u53D7\u9650\u76EE\u5F55:**");
            for (var k = 0; k < scanState.errors.length; k++) {
                output.push("- `" + scanState.errors[k].path + "`: " + scanState.errors[k].error);
            }
        }

        var result = truncateOutput(output.join("\n"), CONFIG.MAX_OUTPUT_CHARS);
        return {
            success: true,
            message: "\u76EE\u5F55\u6811\u751F\u6210\u5B8C\u6210\uFF0C" + scanState.totalDirs + " \u4E2A\u76EE\u5F55\u3001" + scanState.totalFiles + " \u4E2A\u6587\u4EF6",
            data: result,
            meta: {
                dirs: scanState.totalDirs,
                files: scanState.totalFiles,
                total_size: scanState.totalSize,
                errors: scanState.errors.length
            }
        };
    }

    async function exportTreeHandler(params) {
        var p = params || {};
        var rootPath   = normalizePath(p.path);
        var depth      = safeNumber(p.depth, 3, 1, 10);
        var showHidden = safeBool(p.show_hidden, false);
        var format     = (p.format || "markdown").trim().toLowerCase();
        var outputPath = (p.output_path || "").trim();
        var extFilter  = parseExtFilter(p.filter_ext);

        if (format !== "markdown" && format !== "json") {
            return { success: false, message: "\u4E0D\u652F\u6301\u7684\u683C\u5F0F: " + format + "\uFF0C\u8BF7\u4F7F\u7528 markdown \u6216 json" };
        }

        var info;
        try {
            info = await Tools.Files.info(rootPath, "android");
        } catch (e) {
            return { success: false, message: "\u65E0\u6CD5\u8BBF\u95EE\u8DEF\u5F84: " + rootPath + " (" + e.message + ")" };
        }
        if (!info || !info.exists || info.fileType !== "directory") {
            return { success: false, message: "\u8DEF\u5F84\u4E0D\u5B58\u5728\u6216\u4E0D\u662F\u76EE\u5F55: " + rootPath };
        }

        resetScanState();
        sendProgress("\u2699\uFE0F \u5BFC\u51FA\u6A21\u5F0F\uFF0C\u5F00\u59CB\u626B\u63CF: " + rootPath);

        var opts = {
            showHidden: showHidden,
            dirsOnly: false,
            extFilter: extFilter,
            filterPattern: null,
            minSize: null,
            maxSize: null
        };
        var sortCmp = buildSortComparator("name");
        var nodes = await scanDirectory(rootPath, 1, depth, opts, sortCmp);

        var content;
        var ext;
        if (format === "json") {
            ext = ".json";
            var jsonData = {
                generator: "filetree_generate v" + CONFIG.VERSION,
                generated_at: new Date().toISOString(),
                root_path: rootPath,
                scan_depth: depth,
                statistics: {
                    total_dirs: scanState.totalDirs,
                    total_files: scanState.totalFiles,
                    total_size: scanState.totalSize,
                    total_size_formatted: formatSize(scanState.totalSize)
                },
                tree: buildJsonTree(nodes)
            };
            content = JSON.stringify(jsonData, null, 2);
        } else {
            ext = ".md";
            var rootLabel = ICON_DIR + " " + getDirName(rootPath) + "/";
            var treeLines = renderTree(nodes, "", true, false);
            var mdLines = [];
            mdLines.push("# \u76EE\u5F55\u6811: " + getDirName(rootPath));
            mdLines.push("");
            mdLines.push("> \u751F\u6210\u65F6\u95F4: " + new Date().toLocaleString("zh-CN", { hour12: false }));
            mdLines.push("> \u8DEF\u5F84: `" + rootPath + "`");
            mdLines.push("> \u6DF1\u5EA6: " + depth);
            mdLines.push("");
            mdLines.push("```");
            mdLines.push(rootLabel);
            for (var i = 0; i < treeLines.length; i++) {
                mdLines.push(treeLines[i]);
            }
            mdLines.push("```");
            mdLines.push("");
            mdLines.push("## \u7EDF\u8BA1");
            mdLines.push("");
            mdLines.push("- \u76EE\u5F55\u6570: " + scanState.totalDirs);
            mdLines.push("- \u6587\u4EF6\u6570: " + scanState.totalFiles);
            mdLines.push("- \u603B\u5927\u5C0F: " + formatSize(scanState.totalSize));
            content = mdLines.join("\n");
        }

        if (!outputPath) {
            try {
                await Tools.Files.mkdir(CONFIG.TEMP_DIR, true, "android");
            } catch (_) {}
            var safeName = getDirName(rootPath).replace(/[\\/:*?"<>|\s]/g, "_").substring(0, 20);
            outputPath = CONFIG.TEMP_DIR + "tree_" + safeName + "_" + Date.now() + ext;
        }

        try {
            await Tools.Files.write(outputPath, content, false, "android");
        } catch (e) {
            return { success: false, message: "\u5199\u5165\u6587\u4EF6\u5931\u8D25: " + outputPath + " (" + e.message + ")" };
        }

        return {
            success: true,
            message: format.toUpperCase() + " \u5BFC\u51FA\u5B8C\u6210\uFF0C" + scanState.totalDirs + " \u4E2A\u76EE\u5F55\u3001" + scanState.totalFiles + " \u4E2A\u6587\u4EF6",
            data: "\u6587\u4EF6\u5DF2\u4FDD\u5B58\u5230: `" + outputPath + "`\n\u683C\u5F0F: " + format + "\n\u5927\u5C0F: " + formatSize(content.length),
            meta: {
                output_path: outputPath,
                format: format,
                dirs: scanState.totalDirs,
                files: scanState.totalFiles,
                file_size: content.length
            }
        };
    }

    async function getDirStatsHandler(params) {
        var p = params || {};
        var rootPath   = normalizePath(p.path);
        var depth      = safeNumber(p.depth, 10, 1, 50);
        var showHidden = safeBool(p.show_hidden, false);

        var info;
        try {
            info = await Tools.Files.info(rootPath, "android");
        } catch (e) {
            return { success: false, message: "\u65E0\u6CD5\u8BBF\u95EE\u8DEF\u5F84: " + rootPath + " (" + e.message + ")" };
        }
        if (!info || !info.exists || info.fileType !== "directory") {
            return { success: false, message: "\u8DEF\u5F84\u4E0D\u5B58\u5728\u6216\u4E0D\u662F\u76EE\u5F55: " + rootPath };
        }

        resetScanState();
        sendProgress("\u2699\uFE0F \u7EDF\u8BA1\u6A21\u5F0F\uFF0C\u5F00\u59CB\u6DF1\u5EA6\u626B\u63CF: " + rootPath);

        var opts = {
            showHidden: showHidden,
            dirsOnly: false,
            extFilter: null,
            filterPattern: null,
            minSize: null,
            maxSize: null
        };
        var sortCmp = buildSortComparator("name");
        await scanDirectory(rootPath, 1, depth, opts, sortCmp);

        var output = [];
        output.push("## \uD83D\uDCCA \u76EE\u5F55\u7EDF\u8BA1: " + rootPath + "\n");
        output.push("| \u6307\u6807 | \u503C |");
        output.push("| :--- | :--- |");
        output.push("| \u76EE\u5F55\u6570 | " + scanState.totalDirs + " |");
        output.push("| \u6587\u4EF6\u6570 | " + scanState.totalFiles + " |");
        output.push("| \u603B\u5927\u5C0F | " + formatSize(scanState.totalSize) + " (" + scanState.totalSize + " \u5B57\u8282) |");
        output.push("| \u626B\u63CF\u6DF1\u5EA6 | " + depth + " |");
        if (scanState.allFiles.length > 0) {
            var avgSize = Math.round(scanState.totalSize / scanState.allFiles.length);
            output.push("| \u5E73\u5747\u6587\u4EF6\u5927\u5C0F | " + formatSize(avgSize) + " |");
        }
        output.push("| \u8BBF\u95EE\u53D7\u9650\u76EE\u5F55 | " + scanState.errors.length + " |");

        output.push(buildExtDistribution());

        output.push(buildTopFiles(
            "\uD83D\uDCC8 \u6700\u5927\u6587\u4EF6",
            function (a, b) { return b.size - a.size; },
            5
        ));

        output.push(buildTopFiles(
            "\uD83D\uDD51 \u6700\u8FD1\u4FEE\u6539",
            function (a, b) {
                var ta = a.lastModified || 0;
                var tb = b.lastModified || 0;
                if (typeof ta === "string") ta = Date.parse(ta) || 0;
                if (typeof tb === "string") tb = Date.parse(tb) || 0;
                return tb - ta;
            },
            5
        ));

        if (scanState.errors.length > 0) {
            output.push("\n### " + ICON_LOCK + " \u8BBF\u95EE\u53D7\u9650\u76EE\u5F55\n");
            var showErrors = Math.min(scanState.errors.length, 10);
            for (var i = 0; i < showErrors; i++) {
                output.push("- `" + scanState.errors[i].path + "`: " + scanState.errors[i].error);
            }
            if (scanState.errors.length > 10) {
                output.push("- ... \u53CA\u5176\u4ED6 " + (scanState.errors.length - 10) + " \u4E2A");
            }
        }

        var result = truncateOutput(output.join("\n"), CONFIG.MAX_OUTPUT_CHARS);
        return {
            success: true,
            message: "\u7EDF\u8BA1\u5B8C\u6210\uFF0C" + scanState.totalDirs + " \u4E2A\u76EE\u5F55\u3001" + scanState.totalFiles + " \u4E2A\u6587\u4EF6\u3001\u603B\u5927\u5C0F " + formatSize(scanState.totalSize),
            data: result,
            meta: {
                dirs: scanState.totalDirs,
                files: scanState.totalFiles,
                total_size: scanState.totalSize,
                extension_types: Object.keys(scanState.extMap).length,
                errors: scanState.errors.length
            }
        };
    }

    async function testHandler() {
        var report = [];
        report.push("## \uD83D\uDD27 filetree_generate v" + CONFIG.VERSION + " \u8BCA\u65AD\u62A5\u544A\n");
        report.push("> \u6D4B\u8BD5\u65F6\u95F4: " + new Date().toLocaleString("zh-CN", { hour12: false }) + "\n");
        report.push("| \u68C0\u6D4B\u9879 | \u72B6\u6001 | \u8BE6\u60C5 |");
        report.push("| :--- | :--- | :--- |");

        var hasFilesApi = !!(globalThis.Tools && globalThis.Tools.Files);
        report.push("| Tools.Files API | " + (hasFilesApi ? "\u2705 \u53EF\u7528" : "\u274C \u4E0D\u53EF\u7528") + " | " +
            (hasFilesApi ? "\u6587\u4EF6\u64CD\u4F5C\u63A5\u53E3\u5C31\u7EEA" : "\u7F3A\u5C11\u6587\u4EF6\u7CFB\u7EDF\u6865\u63A5") + " |");

        if (!hasFilesApi) {
            report.push("\n> \u26A0\uFE0F Tools.Files API \u4E0D\u53EF\u7528\uFF0C\u5DE5\u5177\u5305\u65E0\u6CD5\u6B63\u5E38\u5DE5\u4F5C\u3002");
            return { success: false, message: "Tools.Files API \u4E0D\u53EF\u7528", data: report.join("\n") };
        }

        var testPath = CONFIG.DEFAULT_PATH;
        var infoOk = false;
        var listOk = false;
        var infoLatency = 0;
        var listLatency = 0;

        try {
            var t1 = Date.now();
            var info = await Tools.Files.info(testPath, "android");
            infoLatency = Date.now() - t1;
            infoOk = !!(info && info.exists);
            report.push("| Files.info() | " + (infoOk ? "\u2705 \u6B63\u5E38" : "\u26A0\uFE0F \u8DEF\u5F84\u4E0D\u5B58\u5728") + " | " +
                testPath + " (" + infoLatency + " ms) |");
        } catch (e) {
            report.push("| Files.info() | \u274C \u5F02\u5E38 | " + e.message + " |");
        }

        if (infoOk) {
            try {
                var t2 = Date.now();
                var listing = await Tools.Files.list(testPath, "android");
                listLatency = Date.now() - t2;
                var entryCount = listing && listing.entries ? listing.entries.length : 0;
                listOk = true;
                report.push("| Files.list() | \u2705 \u6B63\u5E38 | " + entryCount + " \u4E2A\u6761\u76EE (" + listLatency + " ms) |");
            } catch (e) {
                report.push("| Files.list() | \u274C \u5F02\u5E38 | " + e.message + " |");
            }
        }

        var writeOk = false;
        try {
            await Tools.Files.mkdir(CONFIG.TEMP_DIR, true, "android");
            var testFile = CONFIG.TEMP_DIR + "test_" + Date.now() + ".tmp";
            await Tools.Files.write(testFile, "filetree_test", false, "android");
            var readBack = await Tools.Files.read(testFile, "android");
            writeOk = !!(readBack && readBack.content === "filetree_test");
            try { await Tools.Files.deleteFile(testFile, false, "android"); } catch (_) {}
            report.push("| \u6587\u4EF6\u8BFB\u5199 | " + (writeOk ? "\u2705 \u6B63\u5E38" : "\u26A0\uFE0F \u8BFB\u5199\u5F02\u5E38") + " | \u4E34\u65F6\u76EE\u5F55: " + CONFIG.TEMP_DIR + " |");
        } catch (e) {
            report.push("| \u6587\u4EF6\u8BFB\u5199 | \u274C \u5931\u8D25 | " + e.message + " |");
        }

        var allOk = hasFilesApi && infoOk && listOk;
        report.push("");
        report.push(allOk
            ? "> \u2705 \u6240\u6709\u68C0\u6D4B\u901A\u8FC7\uFF0C\u5DE5\u5177\u5305\u5C31\u7EEA\u3002"
            : "> \u26A0\uFE0F \u90E8\u5206\u68C0\u6D4B\u672A\u901A\u8FC7\uFF0C\u8BF7\u68C0\u67E5\u6743\u9650\u6216\u8DEF\u5F84\u914D\u7F6E\u3002");

        return {
            success: allOk,
            message: allOk ? "\u8BCA\u65AD\u901A\u8FC7\uFF0C\u6587\u4EF6\u7CFB\u7EDF\u8BBF\u95EE\u6B63\u5E38" : "\u90E8\u5206\u68C0\u6D4B\u672A\u901A\u8FC7",
            data: report.join("\n"),
            meta: {
                files_api: hasFilesApi,
                info_ok: infoOk,
                list_ok: listOk,
                write_ok: writeOk,
                info_latency_ms: infoLatency,
                list_latency_ms: listLatency
            }
        };
    }

    async function wrapToolExecution(func, params, actionName) {
        try {
            var result = await func(params || {});
            complete(result);
        } catch (error) {
            console.error("[filetree_generate] " + actionName + " \u5931\u8D25: " + error.message);
            complete({
                success: false,
                message: actionName + " \u5931\u8D25: " + error.message,
                error_stack: error.stack
            });
        }
    }

    return {
        generate_tree: function (params) {
            return wrapToolExecution(generateTreeHandler, params, "\u76EE\u5F55\u6811\u751F\u6210");
        },
        export_tree: function (params) {
            return wrapToolExecution(exportTreeHandler, params, "\u76EE\u5F55\u6811\u5BFC\u51FA");
        },
        get_dir_stats: function (params) {
            return wrapToolExecution(getDirStatsHandler, params, "\u76EE\u5F55\u7EDF\u8BA1");
        },
        test: function (params) {
            return wrapToolExecution(testHandler, params, "\u8FDE\u901A\u6027\u6D4B\u8BD5");
        }
    };

})();

exports.generate_tree = FILETREE.generate_tree;
exports.export_tree   = FILETREE.export_tree;
exports.get_dir_stats = FILETREE.get_dir_stats;
exports.test          = FILETREE.test;
