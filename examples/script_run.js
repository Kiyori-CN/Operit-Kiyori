/* METADATA
{
    "name": "script_run",
    "version": "1.0",
    "display_name": {
        "zh": "脚本运行器",
        "en": "Script Runner"
    },
    "description": {
        "zh": "通用脚本运行工具包。支持在手机本地 Ubuntu 环境中执行任意脚本文件（Shell/Python/Node/Ruby/Perl/Lua/PHP 等），提供参数注入、环境变量设置、工作目录切换、超时控制、信号管理、输出捕获与流式跟踪、执行历史记录、批量执行、脚本权限修复、依赖检测等高级功能。适用于自动化运维、定时任务触发、开发调试等场景。",
        "en": "Universal script runner toolkit. Execute arbitrary script files (Shell/Python/Node/Ruby/Perl/Lua/PHP etc.) in the local Ubuntu environment on mobile. Provides argument injection, environment variables, working directory, timeout control, signal management, output capture with streaming, execution history, batch execution, permission fixing, dependency detection and more. Suitable for automation, scheduled tasks and development debugging."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "env": [
        {
            "name": "SCRIPT_RUN_DEFAULT_TIMEOUT",
            "description": {
                "zh": "默认脚本执行超时时间（秒），默认 300",
                "en": "Default script execution timeout in seconds, default 300"
            },
            "required": false
        },
        {
            "name": "SCRIPT_RUN_HISTORY_DIR",
            "description": {
                "zh": "执行历史记录存储目录，默认 /sdcard/Download/Operit/.script_run_history/",
                "en": "Execution history storage directory, default /sdcard/Download/Operit/.script_run_history/"
            },
            "required": false
        },
        {
            "name": "SCRIPT_RUN_MAX_OUTPUT",
            "description": {
                "zh": "最大输出捕获字节数，默认 262144 (256KB)",
                "en": "Maximum output capture bytes, default 262144 (256KB)"
            },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "execute",
            "description": {
                "zh": "执行指定路径的脚本文件。自动识别脚本类型，支持参数传递、环境变量注入、工作目录设定、超时控制。返回退出码、stdout/stderr、执行耗时等详细信息。",
                "en": "Execute a script file at the specified path. Auto-detects script type, supports argument passing, env injection, working directory, timeout control. Returns exit code, stdout/stderr, execution time and more."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "脚本文件的绝对路径",
                        "en": "Absolute path to the script file"
                    }
                },
                {
                    "name": "args",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "传递给脚本的参数字符串，多个参数用空格分隔。支持引号包裹含空格的参数。",
                        "en": "Arguments string passed to the script, space-separated. Supports quoted arguments with spaces."
                    }
                },
                {
                    "name": "env_vars",
                    "type": "object",
                    "required": false,
                    "description": {
                        "zh": "注入的环境变量键值对，如 {\"API_KEY\": \"xxx\", \"DEBUG\": \"1\"}",
                        "en": "Environment variable key-value pairs to inject, e.g. {\"API_KEY\": \"xxx\", \"DEBUG\": \"1\"}"
                    }
                },
                {
                    "name": "working_dir",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "工作目录，默认为脚本所在目录",
                        "en": "Working directory, defaults to script's parent directory"
                    }
                },
                {
                    "name": "timeout",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "超时时间（秒），默认读取环境变量 SCRIPT_RUN_DEFAULT_TIMEOUT 或 300",
                        "en": "Timeout in seconds, defaults to SCRIPT_RUN_DEFAULT_TIMEOUT env or 300"
                    }
                },
                {
                    "name": "interpreter",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "强制指定解释器路径（如 /usr/bin/python3），留空则自动检测 shebang 或按扩展名匹配",
                        "en": "Force interpreter path (e.g. /usr/bin/python3), leave empty for auto-detection via shebang or extension"
                    }
                },
                {
                    "name": "interpreter_flags",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "解释器附加参数，如 -u（Python 无缓冲）、--harmony（Node）",
                        "en": "Interpreter flags, e.g. -u (Python unbuffered), --harmony (Node)"
                    }
                },
                {
                    "name": "stdin_data",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "通过 stdin 传入脚本的数据",
                        "en": "Data to pass to script via stdin"
                    }
                },
                {
                    "name": "run_as_root",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "是否以 root 权限运行（需设备已 root），默认 false",
                        "en": "Whether to run as root (requires rooted device), default false"
                    }
                },
                {
                    "name": "capture_stderr",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "是否分离捕获 stderr，默认 true（合并到 stdout 时设为 false）",
                        "en": "Whether to capture stderr separately, default true (set false to merge into stdout)"
                    }
                }
            ]
        },
        {
            "name": "execute_batch",
            "description": {
                "zh": "批量顺序执行多个脚本。支持设置全局超时、失败时是否继续、共享环境变量。返回每个脚本的独立执行结果。",
                "en": "Batch execute multiple scripts sequentially. Supports global timeout, continue-on-failure, shared env vars. Returns individual results for each script."
            },
            "parameters": [
                {
                    "name": "scripts",
                    "type": "array",
                    "required": true,
                    "description": {
                        "zh": "脚本列表，每项包含 file_path（必填）及可选的 args、timeout、working_dir、interpreter",
                        "en": "Script list, each with file_path (required) and optional args, timeout, working_dir, interpreter"
                    }
                },
                {
                    "name": "stop_on_failure",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "某脚本失败时是否终止后续执行，默认 true",
                        "en": "Whether to stop remaining scripts on failure, default true"
                    }
                },
                {
                    "name": "shared_env",
                    "type": "object",
                    "required": false,
                    "description": {
                        "zh": "所有脚本共享的环境变量",
                        "en": "Environment variables shared across all scripts"
                    }
                },
                {
                    "name": "global_timeout",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "批量执行总超时（秒），默认 900",
                        "en": "Total batch execution timeout in seconds, default 900"
                    }
                }
            ]
        },
        {
            "name": "inspect",
            "description": {
                "zh": "检查脚本文件的详细信息：文件是否存在、权限、大小、shebang 行、脚本类型、解释器可用性、依赖检测（import/require 等）。",
                "en": "Inspect script file details: existence, permissions, size, shebang line, script type, interpreter availability, dependency detection (import/require etc.)."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "脚本文件的绝对路径",
                        "en": "Absolute path to the script file"
                    }
                }
            ]
        },
        {
            "name": "fix_permissions",
            "description": {
                "zh": "修复脚本文件的执行权限（chmod +x），并可选修复 shebang 行的换行符问题（Windows CRLF → Unix LF）。",
                "en": "Fix script file execution permissions (chmod +x), optionally fix shebang line ending issues (Windows CRLF → Unix LF)."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "脚本文件的绝对路径",
                        "en": "Absolute path to the script file"
                    }
                },
                {
                    "name": "fix_line_endings",
                    "type": "boolean",
                    "required": false,
                    "description": {
                        "zh": "是否同时修复 CRLF 换行符为 LF，默认 true",
                        "en": "Whether to also convert CRLF to LF, default true"
                    }
                }
            ]
        },
        {
            "name": "get_history",
            "description": {
                "zh": "获取脚本执行历史记录。支持按路径过滤、限制返回条数、按时间排序。",
                "en": "Get script execution history. Supports filtering by path, limiting result count, sorting by time."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "按脚本路径过滤，留空返回全部",
                        "en": "Filter by script path, empty for all"
                    }
                },
                {
                    "name": "limit",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "返回最近 N 条记录，默认 20",
                        "en": "Return latest N records, default 20"
                    }
                }
            ]
        },
        {
            "name": "kill_script",
            "description": {
                "zh": "终止正在运行的脚本进程。通过 PID 或脚本路径匹配目标进程，支持选择信号（SIGTERM/SIGKILL/SIGINT 等）。",
                "en": "Kill a running script process. Match target by PID or script path, supports signal selection (SIGTERM/SIGKILL/SIGINT etc.)."
            },
            "parameters": [
                {
                    "name": "pid",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "目标进程 PID（与 file_path 二选一）",
                        "en": "Target process PID (either pid or file_path required)"
                    }
                },
                {
                    "name": "file_path",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "脚本文件路径（通过 pgrep 匹配，与 pid 二选一）",
                        "en": "Script file path (matched via pgrep, either pid or file_path required)"
                    }
                },
                {
                    "name": "signal",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "发送的信号：SIGTERM（默认，优雅终止）、SIGKILL（强制）、SIGINT（中断）、SIGHUP",
                        "en": "Signal to send: SIGTERM (default, graceful), SIGKILL (force), SIGINT (interrupt), SIGHUP"
                    }
                }
            ]
        },
        {
            "name": "list_running",
            "description": {
                "zh": "列出当前正在运行的脚本进程。显示 PID、CPU/内存占用、运行时长、命令行等信息。",
                "en": "List currently running script processes. Shows PID, CPU/memory usage, runtime, command line etc."
            },
            "parameters": [
                {
                    "name": "filter",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "关键词过滤（匹配进程命令行）",
                        "en": "Keyword filter (matches process command line)"
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "自检。验证各语言解释器可用性、临时目录可写性、历史目录状态。",
                "en": "Self-test. Verify interpreter availability, temp directory writability, history directory status."
            },
            "parameters": []
        }
    ]
}
*/

const SCRIPT_RUN = (function () {

    const INTERPRETER_MAP = {
        'sh':     { bin: ['/bin/sh'],                                           name: 'Shell (sh)' },
        'bash':   { bin: ['/bin/bash', '/usr/bin/bash'],                        name: 'Bash' },
        'zsh':    { bin: ['/bin/zsh', '/usr/bin/zsh'],                          name: 'Zsh' },
        'fish':   { bin: ['/usr/bin/fish'],                                     name: 'Fish' },
        'py':     { bin: ['/root/.code_runner/py/bin/python3', '/usr/bin/python3', '/usr/bin/python'], name: 'Python' },
        'python': { bin: ['/root/.code_runner/py/bin/python3', '/usr/bin/python3', '/usr/bin/python'], name: 'Python' },
        'python3':{ bin: ['/root/.code_runner/py/bin/python3', '/usr/bin/python3'],                    name: 'Python 3' },
        'js':     { bin: ['/usr/bin/node', '/usr/local/bin/node'],              name: 'Node.js' },
        'mjs':    { bin: ['/usr/bin/node', '/usr/local/bin/node'],              name: 'Node.js (ESM)' },
        'ts':     { bin: ['/usr/local/bin/ts-node', '/usr/bin/npx'],            name: 'TypeScript' },
        'rb':     { bin: ['/usr/bin/ruby', '/usr/local/bin/ruby'],              name: 'Ruby' },
        'pl':     { bin: ['/usr/bin/perl'],                                     name: 'Perl' },
        'lua':    { bin: ['/usr/bin/lua', '/usr/local/bin/lua'],                name: 'Lua' },
        'php':    { bin: ['/usr/bin/php'],                                      name: 'PHP' },
        'awk':    { bin: ['/usr/bin/awk', '/usr/bin/gawk'],                     name: 'AWK' },
        'sed':    { bin: ['/usr/bin/sed'],                                      name: 'Sed' },
        'tcl':    { bin: ['/usr/bin/tclsh'],                                    name: 'Tcl' },
        'r':      { bin: ['/usr/bin/Rscript'],                                  name: 'R' },
        'groovy': { bin: ['/usr/bin/groovy', '/usr/local/bin/groovy'],          name: 'Groovy' },
        'swift':  { bin: ['/usr/bin/swift'],                                    name: 'Swift' },
        'dart':   { bin: ['/usr/bin/dart'],                                     name: 'Dart' },
        'elixir': { bin: ['/usr/bin/elixir'],                                   name: 'Elixir' }
    };

    const SIGNAL_MAP = {
        'SIGTERM': 15, 'SIGKILL': 9, 'SIGINT': 2, 'SIGHUP': 1,
        'SIGUSR1': 10, 'SIGUSR2': 12, 'SIGSTOP': 19, 'SIGCONT': 18,
        'TERM': 15, 'KILL': 9, 'INT': 2, 'HUP': 1
    };

    const DEPENDENCY_PATTERNS = {
        'py':   [/^\s*import\s+(\S+)/gm, /^\s*from\s+(\S+)\s+import/gm],
        'js':   [/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, /\bimport\s+.*?\s+from\s+['"]([^'"]+)['"]/g, /\bimport\s+['"]([^'"]+)['"]/g],
        'mjs':  [/\bimport\s+.*?\s+from\s+['"]([^'"]+)['"]/g, /\bimport\s+['"]([^'"]+)['"]/g],
        'rb':   [/^\s*require\s+['"]([^'"]+)['"]/gm, /^\s*require_relative\s+['"]([^'"]+)['"]/gm],
        'pl':   [/^\s*use\s+(\S+)/gm, /^\s*require\s+['"]?(\S+?)['"]?\s*;/gm],
        'php':  [/^\s*(?:require|include)(?:_once)?\s+['"]([^'"]+)['"]/gm],
        'lua':  [/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g]
    };

    function _getDefaultTimeout() {
        if (typeof getEnv === 'function') {
            const val = parseInt(getEnv('SCRIPT_RUN_DEFAULT_TIMEOUT'), 10);
            if (val > 0) return val;
        }
        return 300;
    }

    function _getHistoryDir() {
        if (typeof getEnv === 'function') {
            const dir = (getEnv('SCRIPT_RUN_HISTORY_DIR') || '').trim();
            if (dir) return dir.endsWith('/') ? dir : dir + '/';
        }
        return '/sdcard/Download/Operit/.script_run_history/';
    }

    function _getMaxOutput() {
        if (typeof getEnv === 'function') {
            const val = parseInt(getEnv('SCRIPT_RUN_MAX_OUTPUT'), 10);
            if (val > 0) return val;
        }
        return 262144;
    }

    function _escapeShell(str) {
        return "'" + String(str).replace(/'/g, "'\\''") + "'";
    }

    function _extractDirectory(filePath) {
        const idx = filePath.lastIndexOf('/');
        return idx > 0 ? filePath.substring(0, idx) : '/';
    }

    function _getExtension(filePath) {
        const base = filePath.substring(filePath.lastIndexOf('/') + 1);
        const dotIdx = base.lastIndexOf('.');
        if (dotIdx <= 0) return '';
        return base.substring(dotIdx + 1).toLowerCase();
    }

    function _getBaseName(filePath) {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }

    function _generateRunId() {
        var ts = Date.now().toString(36);
        var rand = Math.random().toString(36).substring(2, 8);
        return ts + '_' + rand;
    }

    function _formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0;
        var val = bytes;
        while (val >= 1024 && i < units.length - 1) {
            val /= 1024;
            i++;
        }
        return val.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
    }

    function _formatDuration(seconds) {
        if (seconds < 0.01) return '<10ms';
        if (seconds < 1) return (seconds * 1000).toFixed(0) + 'ms';
        if (seconds < 60) return seconds.toFixed(2) + 's';
        var m = Math.floor(seconds / 60);
        var s = (seconds % 60).toFixed(1);
        if (m < 60) return m + 'm ' + s + 's';
        var h = Math.floor(m / 60);
        m = m % 60;
        return h + 'h ' + m + 'm ' + s + 's';
    }

    function _truncateOutput(output, maxBytes) {
        if (!output || output.length <= maxBytes) return output;
        var half = Math.floor(maxBytes / 2) - 50;
        var head = output.substring(0, half);
        var tail = output.substring(output.length - half);
        var omitted = output.length - half * 2;
        return head + '\n\n... [truncated ' + omitted + ' chars] ...\n\n' + tail;
    }

    async function _execTerminal(command) {
        var session = await Tools.System.terminal.create("script_run_session");
        return await Tools.System.terminal.exec(session.sessionId, command);
    }

    async function _fileExists(path) {
        var result = await _execTerminal('[ -e ' + _escapeShell(path) + ' ] && echo YES || echo NO');
        return result.output.trim().indexOf('YES') !== -1;
    }

    async function _isFile(path) {
        var result = await _execTerminal('[ -f ' + _escapeShell(path) + ' ] && echo YES || echo NO');
        return result.output.trim().indexOf('YES') !== -1;
    }

    async function _isExecutable(path) {
        var result = await _execTerminal('[ -x ' + _escapeShell(path) + ' ] && echo YES || echo NO');
        return result.output.trim().indexOf('YES') !== -1;
    }

    async function _readFileHead(path, lines) {
        var n = lines || 5;
        var result = await _execTerminal('head -n ' + n + ' ' + _escapeShell(path) + ' 2>/dev/null');
        return result.output || '';
    }

    async function _getFileInfo(path) {
        var cmd = 'stat -c "%s|%a|%U|%G|%Y|%F" ' + _escapeShell(path) + ' 2>/dev/null';
        var result = await _execTerminal(cmd);
        var line = (result.output || '').trim();
        if (!line || line.indexOf('|') === -1) return null;
        var parts = line.split('|');
        return {
            size: parseInt(parts[0], 10) || 0,
            permissions: parts[1] || '000',
            owner: parts[2] || 'unknown',
            group: parts[3] || 'unknown',
            mtime: parseInt(parts[4], 10) || 0,
            type: parts[5] || 'unknown'
        };
    }

    async function _ensureDir(dirPath) {
        await _execTerminal('mkdir -p ' + _escapeShell(dirPath));
    }

    async function _writeFile(path, content) {
        await _ensureDir(_extractDirectory(path));
        var escaped = content.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
        await _execTerminal("printf '%s' " + _escapeShell(content) + " > " + _escapeShell(path));
    }

    async function _readFile(path) {
        var result = await _execTerminal('cat ' + _escapeShell(path) + ' 2>/dev/null');
        return result.output || '';
    }

    function _parseShebang(headContent) {
        if (!headContent) return null;
        var firstLine = headContent.split('\n')[0].trim();
        if (!firstLine.startsWith('#!')) return null;
        var shebang = firstLine.substring(2).trim();
        if (shebang.startsWith('/usr/bin/env ')) {
            var parts = shebang.substring(13).trim().split(/\s+/);
            return { type: 'env', interpreter: parts[0], flags: parts.slice(1).join(' '), raw: firstLine };
        }
        var spaceIdx = shebang.indexOf(' ');
        if (spaceIdx === -1) {
            return { type: 'direct', interpreter: shebang, flags: '', raw: firstLine };
        }
        return {
            type: 'direct',
            interpreter: shebang.substring(0, spaceIdx),
            flags: shebang.substring(spaceIdx + 1).trim(),
            raw: firstLine
        };
    }

    async function _resolveInterpreter(filePath, forceInterpreter) {
        if (forceInterpreter) {
            var isExec = await _isExecutable(forceInterpreter);
            if (!isExec) {
                var whichResult = await _execTerminal('which ' + _escapeShell(forceInterpreter) + ' 2>/dev/null');
                var resolved = whichResult.output.trim();
                if (resolved) return { bin: resolved, source: 'forced_which', name: forceInterpreter };
                throw new Error('指定的解释器不可用: ' + forceInterpreter);
            }
            return { bin: forceInterpreter, source: 'forced', name: forceInterpreter };
        }

        var headContent = await _readFileHead(filePath, 3);
        var shebang = _parseShebang(headContent);
        if (shebang) {
            if (shebang.type === 'env') {
                var whichEnv = await _execTerminal('which ' + _escapeShell(shebang.interpreter) + ' 2>/dev/null');
                var envBin = whichEnv.output.trim();
                if (envBin) {
                    return {
                        bin: envBin,
                        source: 'shebang_env',
                        name: shebang.interpreter,
                        flags: shebang.flags,
                        shebang: shebang.raw
                    };
                }
            } else {
                if (await _isExecutable(shebang.interpreter)) {
                    return {
                        bin: shebang.interpreter,
                        source: 'shebang_direct',
                        name: _getBaseName(shebang.interpreter),
                        flags: shebang.flags,
                        shebang: shebang.raw
                    };
                }
            }
        }

        var ext = _getExtension(filePath);
        if (ext && INTERPRETER_MAP[ext]) {
            var mapping = INTERPRETER_MAP[ext];
            for (var i = 0; i < mapping.bin.length; i++) {
                if (await _isExecutable(mapping.bin[i])) {
                    return { bin: mapping.bin[i], source: 'extension', name: mapping.name, detectedExt: ext };
                }
            }
            var whichExt = await _execTerminal('which ' + _escapeShell(ext) + ' 2>/dev/null');
            if (whichExt.output.trim()) {
                return { bin: whichExt.output.trim(), source: 'extension_which', name: mapping.name, detectedExt: ext };
            }
            throw new Error('扩展名 .' + ext + ' 对应的解释器 (' + mapping.name + ') 未安装');
        }

        if (!ext) {
            var isFileExec = await _isExecutable(filePath);
            if (isFileExec) {
                return { bin: null, source: 'direct_exec', name: 'Direct Executable' };
            }
            var fileTypeResult = await _execTerminal('file -b ' + _escapeShell(filePath) + ' 2>/dev/null');
            var fileType = (fileTypeResult.output || '').trim().toLowerCase();
            if (fileType.indexOf('shell') !== -1 || fileType.indexOf('script') !== -1) {
                return { bin: '/bin/sh', source: 'file_detection', name: 'Shell (detected)' };
            }
            if (fileType.indexOf('python') !== -1) {
                var pyBin = await _execTerminal('which python3 2>/dev/null');
                if (pyBin.output.trim()) return { bin: pyBin.output.trim(), source: 'file_detection', name: 'Python (detected)' };
            }
            if (fileType.indexOf('text') !== -1) {
                return { bin: '/bin/sh', source: 'fallback', name: 'Shell (fallback)' };
            }
        }

        throw new Error('无法确定脚本类型。请通过 interpreter 参数指定解释器，或添加 shebang 行。');
    }

    function _buildEnvPrefix(envVars) {
        if (!envVars || typeof envVars !== 'object') return '';
        var parts = [];
        var keys = Object.keys(envVars);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) continue;
            parts.push(k + '=' + _escapeShell(String(envVars[k])));
        }
        if (parts.length === 0) return '';
        return 'export ' + parts.join(' && export ') + ' && ';
    }

    function _buildCommand(interpreter, filePath, args, envVars, workDir, timeout, stdinData, runAsRoot, captureSeparate) {
        var parts = [];

        if (workDir) {
            parts.push('cd ' + _escapeShell(workDir));
        }

        var envPrefix = _buildEnvPrefix(envVars);
        if (envPrefix) {
            parts.push(envPrefix.replace(/ && $/, ''));
        }

        var execParts = [];
        if (timeout > 0) {
            execParts.push('timeout --signal=TERM --kill-after=10 ' + timeout);
        }
        if (runAsRoot) {
            execParts.push('sudo');
        }

        if (interpreter.bin) {
            execParts.push(interpreter.bin);
            if (interpreter.flags) execParts.push(interpreter.flags);
        }

        execParts.push(_escapeShell(filePath));

        if (args) {
            execParts.push(args);
        }

        var execCmd = execParts.join(' ');

        if (stdinData) {
            execCmd = 'echo ' + _escapeShell(stdinData) + ' | ' + execCmd;
        }

        if (captureSeparate) {
            var stderrTmp = '/tmp/script_run_stderr_' + _generateRunId();
            execCmd = execCmd + ' 2>' + stderrTmp;
            parts.push(execCmd);
            return { command: parts.join(' && '), stderrFile: stderrTmp };
        }

        execCmd = execCmd + ' 2>&1';
        parts.push(execCmd);
        return { command: parts.join(' && '), stderrFile: null };
    }

    async function _saveHistory(entry) {
        try {
            var histDir = _getHistoryDir();
            await _ensureDir(histDir);
            var indexFile = histDir + 'index.jsonl';
            var line = JSON.stringify(entry);
            await _execTerminal('echo ' + _escapeShell(line) + ' >> ' + _escapeShell(indexFile));
        } catch (e) {
            console.error('[script_run] 保存历史失败: ' + e.message);
        }
    }

    async function _loadHistory() {
        try {
            var histDir = _getHistoryDir();
            var indexFile = histDir + 'index.jsonl';
            if (!(await _fileExists(indexFile))) return [];
            var content = await _readFile(indexFile);
            if (!content.trim()) return [];
            var lines = content.trim().split('\n');
            var entries = [];
            for (var i = 0; i < lines.length; i++) {
                try {
                    entries.push(JSON.parse(lines[i]));
                } catch (e) { }
            }
            return entries;
        } catch (e) {
            return [];
        }
    }

    function _extractDependencies(content, ext) {
        var patterns = DEPENDENCY_PATTERNS[ext];
        if (!patterns) return [];
        var deps = {};
        for (var i = 0; i < patterns.length; i++) {
            var regex = new RegExp(patterns[i].source, patterns[i].flags);
            var match;
            while ((match = regex.exec(content)) !== null) {
                var dep = match[1];
                if (dep && dep.indexOf('.') !== 0 && dep.indexOf('/') !== 0) {
                    var mod = dep.split('.')[0].split('/')[0];
                    if (mod && mod.length < 64) deps[mod] = true;
                }
            }
        }
        return Object.keys(deps).sort();
    }

    async function _checkInterpreterVersion(binPath) {
        var versionFlags = ['--version', '-v', '-V', 'version'];
        for (var i = 0; i < versionFlags.length; i++) {
            var result = await _execTerminal(binPath + ' ' + versionFlags[i] + ' 2>&1 | head -1');
            var out = (result.output || '').trim();
            if (out && out.length < 200 && out.indexOf('not found') === -1 && out.indexOf('No such') === -1) {
                return out;
            }
        }
        return null;
    }

    async function executeHandler(params) {
        var filePath = (params.file_path || '').trim();
        if (!filePath) throw new Error('参数 file_path 不能为空');
        if (!filePath.startsWith('/')) throw new Error('file_path 必须为绝对路径: ' + filePath);

        if (!(await _isFile(filePath))) {
            throw new Error('脚本文件不存在或不是普通文件: ' + filePath);
        }

        var timeout = parseInt(params.timeout, 10) || _getDefaultTimeout();
        if (timeout < 1) timeout = 1;
        if (timeout > 86400) timeout = 86400;

        var workDir = (params.working_dir || '').trim() || _extractDirectory(filePath);
        var args = (params.args || '').trim();
        var envVars = params.env_vars || null;
        var stdinData = params.stdin_data || null;
        var runAsRoot = params.run_as_root === true;
        var captureSeparate = params.capture_stderr !== false;
        var forceInterpreter = (params.interpreter || '').trim() || null;
        var interpreterFlags = (params.interpreter_flags || '').trim() || null;

        var interpreter = await _resolveInterpreter(filePath, forceInterpreter);
        if (interpreterFlags) {
            interpreter.flags = interpreter.flags
                ? interpreter.flags + ' ' + interpreterFlags
                : interpreterFlags;
        }

        var built = _buildCommand(interpreter, filePath, args, envVars, workDir, timeout, stdinData, runAsRoot, captureSeparate);

        var runId = _generateRunId();
        var startTime = Date.now();

        var result = await _execTerminal(built.command);

        var elapsed = (Date.now() - startTime) / 1000;
        var exitCode = result.exitCode;
        var stdout = result.output || '';
        var stderr = '';

        if (built.stderrFile) {
            try {
                stderr = await _readFile(built.stderrFile);
                await _execTerminal('rm -f ' + _escapeShell(built.stderrFile));
            } catch (e) { }
        }

        var maxOut = _getMaxOutput();
        stdout = _truncateOutput(stdout.trim(), maxOut);
        stderr = _truncateOutput(stderr.trim(), maxOut);

        var timedOut = exitCode === 124 || exitCode === 137;

        var histEntry = {
            run_id: runId,
            file_path: filePath,
            interpreter: interpreter.name,
            exit_code: exitCode,
            timed_out: timedOut,
            execution_time: elapsed,
            timestamp: new Date().toISOString(),
            success: exitCode === 0
        };
        await _saveHistory(histEntry);

        return {
            run_id: runId,
            file_path: filePath,
            file_name: _getBaseName(filePath),
            interpreter: {
                name: interpreter.name,
                bin: interpreter.bin,
                source: interpreter.source,
                flags: interpreter.flags || null
            },
            working_dir: workDir,
            exit_code: exitCode,
            timed_out: timedOut,
            execution_time: _formatDuration(elapsed),
            execution_time_raw: elapsed,
            stdout: stdout,
            stderr: stderr,
            has_errors: exitCode !== 0 || (stderr.length > 0 && stderr.toLowerCase().indexOf('error') !== -1),
            output_stats: {
                stdout_length: stdout.length,
                stderr_length: stderr.length,
                stdout_lines: stdout ? stdout.split('\n').length : 0,
                stderr_lines: stderr ? stderr.split('\n').length : 0
            }
        };
    }

    async function executeBatchHandler(params) {
        var scripts = params.scripts;
        if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
            throw new Error('参数 scripts 必须为非空数组');
        }
        if (scripts.length > 50) {
            throw new Error('批量执行脚本数量不能超过 50');
        }

        var stopOnFailure = params.stop_on_failure !== false;
        var sharedEnv = params.shared_env || null;
        var globalTimeout = parseInt(params.global_timeout, 10) || 900;

        var batchStartTime = Date.now();
        var results = [];
        var totalSuccess = 0;
        var totalFailed = 0;
        var totalSkipped = 0;
        var stopped = false;

        for (var i = 0; i < scripts.length; i++) {
            var elapsed = (Date.now() - batchStartTime) / 1000;
            if (elapsed >= globalTimeout) {
                for (var j = i; j < scripts.length; j++) {
                    results.push({
                        index: j,
                        file_path: scripts[j].file_path || 'unknown',
                        status: 'timeout',
                        message: '批量执行总超时'
                    });
                    totalSkipped++;
                }
                break;
            }

            if (stopped) {
                results.push({
                    index: i,
                    file_path: scripts[i].file_path || 'unknown',
                    status: 'skipped',
                    message: '前序脚本失败，已跳过'
                });
                totalSkipped++;
                continue;
            }

            var script = scripts[i];
            var execParams = {
                file_path: script.file_path,
                args: script.args || '',
                working_dir: script.working_dir || '',
                timeout: script.timeout || null,
                interpreter: script.interpreter || '',
                interpreter_flags: script.interpreter_flags || '',
                env_vars: sharedEnv ? Object.assign({}, sharedEnv, script.env_vars || {}) : (script.env_vars || null),
                capture_stderr: true
            };

            try {
                var execResult = await executeHandler(execParams);
                var success = execResult.exit_code === 0;
                results.push({
                    index: i,
                    file_path: execResult.file_path,
                    status: success ? 'success' : 'failed',
                    exit_code: execResult.exit_code,
                    execution_time: execResult.execution_time,
                    stdout_preview: (execResult.stdout || '').substring(0, 200),
                    stderr_preview: (execResult.stderr || '').substring(0, 200),
                    timed_out: execResult.timed_out
                });
                if (success) {
                    totalSuccess++;
                } else {
                    totalFailed++;
                    if (stopOnFailure) stopped = true;
                }
            } catch (e) {
                results.push({
                    index: i,
                    file_path: script.file_path || 'unknown',
                    status: 'error',
                    message: e.message
                });
                totalFailed++;
                if (stopOnFailure) stopped = true;
            }
        }

        var totalElapsed = (Date.now() - batchStartTime) / 1000;

        return {
            total: scripts.length,
            success: totalSuccess,
            failed: totalFailed,
            skipped: totalSkipped,
            execution_time: _formatDuration(totalElapsed),
            stop_on_failure: stopOnFailure,
            results: results
        };
    }

    async function inspectHandler(params) {
        var filePath = (params.file_path || '').trim();
        if (!filePath) throw new Error('参数 file_path 不能为空');

        var exists = await _fileExists(filePath);
        if (!exists) {
            return {
                file_path: filePath,
                exists: false,
                message: '文件不存在: ' + filePath
            };
        }

        var isFile = await _isFile(filePath);
        if (!isFile) {
            return {
                file_path: filePath,
                exists: true,
                is_file: false,
                message: '路径存在但不是普通文件'
            };
        }

        var fileInfo = await _getFileInfo(filePath);
        var isExec = await _isExecutable(filePath);
        var headContent = await _readFileHead(filePath, 10);
        var shebang = _parseShebang(headContent);
        var ext = _getExtension(filePath);

        var interpreterInfo = null;
        var interpreterAvailable = false;
        var interpreterVersion = null;
        try {
            interpreterInfo = await _resolveInterpreter(filePath, null);
            interpreterAvailable = true;
            if (interpreterInfo.bin) {
                interpreterVersion = await _checkInterpreterVersion(interpreterInfo.bin);
            }
        } catch (e) {
            interpreterInfo = { error: e.message };
        }

        var fullContent = '';
        var dependencies = [];
        if (fileInfo && fileInfo.size < 1048576) {
            fullContent = await _readFile(filePath);
            if (ext) {
                dependencies = _extractDependencies(fullContent, ext);
            }
        }

        var lineCount = 0;
        if (fullContent) {
            lineCount = fullContent.split('\n').length;
        } else {
            var wcResult = await _execTerminal('wc -l < ' + _escapeShell(filePath) + ' 2>/dev/null');
            lineCount = parseInt(wcResult.output.trim(), 10) || 0;
        }

        var hasCRLF = fullContent.indexOf('\r\n') !== -1;

        var encodingResult = await _execTerminal('file -bi ' + _escapeShell(filePath) + ' 2>/dev/null');
        var encoding = (encodingResult.output || '').trim();

        return {
            file_path: filePath,
            file_name: _getBaseName(filePath),
            exists: true,
            is_file: true,
            size: fileInfo ? fileInfo.size : 0,
            size_human: fileInfo ? _formatBytes(fileInfo.size) : '0 B',
            permissions: fileInfo ? fileInfo.permissions : null,
            is_executable: isExec,
            owner: fileInfo ? fileInfo.owner : null,
            group: fileInfo ? fileInfo.group : null,
            encoding: encoding,
            line_count: lineCount,
            has_crlf: hasCRLF,
            extension: ext || null,
            shebang: shebang ? shebang.raw : null,
            shebang_detail: shebang,
            interpreter: {
                resolved: interpreterInfo,
                available: interpreterAvailable,
                version: interpreterVersion
            },
            dependencies: dependencies,
            dependency_count: dependencies.length,
            head_preview: headContent.substring(0, 500),
            issues: _detectIssues(filePath, ext, isExec, hasCRLF, shebang, interpreterAvailable, fileInfo)
        };
    }

    function _detectIssues(filePath, ext, isExec, hasCRLF, shebang, interpAvail, fileInfo) {
        var issues = [];

        if (!isExec && !ext) {
            issues.push({
                severity: 'warn',
                code: 'NOT_EXECUTABLE',
                message: '文件没有执行权限且无扩展名，可能需要 chmod +x'
            });
        }

        if (hasCRLF) {
            issues.push({
                severity: 'warn',
                code: 'CRLF_DETECTED',
                message: '检测到 Windows 换行符 (CRLF)，可能导致 shebang 解析失败'
            });
        }

        if (!shebang && !ext) {
            issues.push({
                severity: 'error',
                code: 'NO_TYPE_INFO',
                message: '无 shebang 且无扩展名，无法自动识别脚本类型'
            });
        }

        if (!interpAvail) {
            issues.push({
                severity: 'error',
                code: 'INTERPRETER_MISSING',
                message: '对应的解释器未安装或不可用'
            });
        }

        if (fileInfo && fileInfo.size === 0) {
            issues.push({
                severity: 'warn',
                code: 'EMPTY_FILE',
                message: '文件为空'
            });
        }

        if (fileInfo && fileInfo.size > 10485760) {
            issues.push({
                severity: 'warn',
                code: 'LARGE_FILE',
                message: '文件较大 (' + _formatBytes(fileInfo.size) + ')，执行可能较慢'
            });
        }

        return issues;
    }

    async function fixPermissionsHandler(params) {
        var filePath = (params.file_path || '').trim();
        if (!filePath) throw new Error('参数 file_path 不能为空');

        if (!(await _isFile(filePath))) {
            throw new Error('文件不存在: ' + filePath);
        }

        var actions = [];

        var chmodResult = await _execTerminal('chmod +x ' + _escapeShell(filePath) + ' 2>&1');
        if (chmodResult.exitCode === 0) {
            actions.push({ action: 'chmod_x', success: true, message: '已添加执行权限' });
        } else {
            actions.push({ action: 'chmod_x', success: false, message: 'chmod 失败: ' + chmodResult.output.trim() });
        }

        var fixLf = params.fix_line_endings !== false;
        if (fixLf) {
            var checkCr = await _execTerminal('grep -cP "\\r$" ' + _escapeShell(filePath) + ' 2>/dev/null || echo 0');
            var crCount = parseInt(checkCr.output.trim(), 10) || 0;

            if (crCount > 0) {
                var sedResult = await _execTerminal("sed -i 's/\\r$//' " + _escapeShell(filePath) + ' 2>&1');
                if (sedResult.exitCode === 0) {
                    actions.push({
                        action: 'fix_crlf',
                        success: true,
                        message: '已转换 ' + crCount + ' 行 CRLF → LF'
                    });
                } else {
                    actions.push({
                        action: 'fix_crlf',
                        success: false,
                        message: '转换失败: ' + sedResult.output.trim()
                    });
                }
            } else {
                actions.push({ action: 'fix_crlf', success: true, message: '无需转换，未检测到 CRLF' });
            }
        }

        var newInfo = await _getFileInfo(filePath);

        return {
            file_path: filePath,
            actions: actions,
            current_permissions: newInfo ? newInfo.permissions : null,
            is_executable: await _isExecutable(filePath)
        };
    }

    async function getHistoryHandler(params) {
        var filterPath = (params.file_path || '').trim();
        var limit = Math.min(Math.max(parseInt(params.limit, 10) || 20, 1), 500);

        var entries = await _loadHistory();

        if (filterPath) {
            entries = entries.filter(function (e) {
                return e.file_path === filterPath || (e.file_path && e.file_path.indexOf(filterPath) !== -1);
            });
        }

        entries.sort(function (a, b) {
            var ta = new Date(a.timestamp).getTime() || 0;
            var tb = new Date(b.timestamp).getTime() || 0;
            return tb - ta;
        });

        entries = entries.slice(0, limit);

        var stats = { total: entries.length, success: 0, failed: 0, timed_out: 0 };
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].success) stats.success++;
            else stats.failed++;
            if (entries[i].timed_out) stats.timed_out++;
        }

        return {
            history: entries,
            stats: stats,
            filter: filterPath || null,
            limit: limit
        };
    }

    async function killScriptHandler(params) {
        var pid = params.pid ? parseInt(params.pid, 10) : null;
        var filePath = (params.file_path || '').trim();
        var signal = (params.signal || 'SIGTERM').toUpperCase().trim();

        if (!pid && !filePath) {
            throw new Error('必须提供 pid 或 file_path 参数之一');
        }

        var sigName = signal;
        if (signal.indexOf('SIG') !== 0) sigName = 'SIG' + signal;
        var sigNum = SIGNAL_MAP[sigName] || SIGNAL_MAP[signal];
        if (!sigNum) throw new Error('不支持的信号: ' + signal);

        var targetPids = [];

        if (pid) {
            var checkPid = await _execTerminal('ps -p ' + pid + ' -o pid= 2>/dev/null');
            if (checkPid.output.trim()) {
                targetPids.push(pid);
            } else {
                throw new Error('进程不存在: PID ' + pid);
            }
        } else {
            var pgrepResult = await _execTerminal('pgrep -f ' + _escapeShell(filePath) + ' 2>/dev/null');
            var pids = (pgrepResult.output || '').trim().split('\n').filter(function (p) { return p.trim(); });
            for (var i = 0; i < pids.length; i++) {
                var p = parseInt(pids[i].trim(), 10);
                if (p > 0) targetPids.push(p);
            }
            if (targetPids.length === 0) {
                throw new Error('未找到匹配的运行进程: ' + filePath);
            }
        }

        var killResults = [];
        for (var k = 0; k < targetPids.length; k++) {
            var kResult = await _execTerminal('kill -' + sigNum + ' ' + targetPids[k] + ' 2>&1');
            killResults.push({
                pid: targetPids[k],
                signal: sigName,
                success: kResult.exitCode === 0,
                message: kResult.output.trim() || 'signal sent'
            });
        }

        return {
            target: pid ? ('PID:' + pid) : ('path:' + filePath),
            signal: sigName,
            signal_number: sigNum,
            processes_found: targetPids.length,
            results: killResults
        };
    }

    async function listRunningHandler(params) {
        var filter = (params.filter || '').trim();

        var interpreterNames = ['python', 'python3', 'node', 'ruby', 'perl', 'lua', 'php', 'bash', 'sh', 'zsh'];
        var psCmds = [];
        for (var i = 0; i < interpreterNames.length; i++) {
            psCmds.push("pgrep -a " + interpreterNames[i] + " 2>/dev/null");
        }

        var psResult = await _execTerminal(
            'ps aux --sort=-%cpu 2>/dev/null | ' +
            'grep -E "(\\.sh|\\.py|\\.js|\\.rb|\\.pl|\\.lua|\\.php|\\.ts|\\.r|\\.awk|python|node|ruby|perl|lua|php|bash)" | ' +
            'grep -v "grep" | head -50'
        );

        var lines = (psResult.output || '').trim().split('\n').filter(function (l) { return l.trim(); });

        var processes = [];
        for (var j = 0; j < lines.length; j++) {
            var cols = lines[j].trim().split(/\s+/);
            if (cols.length < 11) continue;

            var proc = {
                user: cols[0],
                pid: parseInt(cols[1], 10),
                cpu: parseFloat(cols[2]) || 0,
                mem: parseFloat(cols[3]) || 0,
                vsz: cols[4],
                rss: cols[5],
                stat: cols[7] || '',
                start: cols[8] || '',
                time: cols[9] || '',
                command: cols.slice(10).join(' ')
            };

            if (filter && proc.command.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
                continue;
            }

            processes.push(proc);
        }

        processes.sort(function (a, b) { return b.cpu - a.cpu; });

        return {
            count: processes.length,
            processes: processes,
            filter: filter || null
        };
    }

    async function testHandler() {
        var results = [];

        var interpretersToCheck = [
            { name: 'Shell (sh)',  cmd: 'sh --version 2>&1 | head -1 || echo sh' },
            { name: 'Bash',        cmd: 'bash --version 2>&1 | head -1' },
            { name: 'Python 3',    cmd: 'python3 --version 2>&1' },
            { name: 'Python (venv)', cmd: '/root/.code_runner/py/bin/python3 --version 2>&1' },
            { name: 'Node.js',     cmd: 'node --version 2>&1' },
            { name: 'Ruby',        cmd: 'ruby --version 2>&1' },
            { name: 'Perl',        cmd: 'perl --version 2>&1 | head -2' },
            { name: 'Lua',         cmd: 'lua -v 2>&1' },
            { name: 'PHP',         cmd: 'php --version 2>&1 | head -1' },
            { name: 'AWK',         cmd: 'awk --version 2>&1 | head -1' }
        ];

        for (var i = 0; i < interpretersToCheck.length; i++) {
            var check = interpretersToCheck[i];
            var result = await _execTerminal(check.cmd);
            var available = result.exitCode === 0 && result.output.trim().indexOf('not found') === -1;
            results.push({
                name: check.name,
                available: available,
                version: available ? result.output.trim().substring(0, 120) : null
            });
        }

        var tmpCheck = await _execTerminal('touch /tmp/script_run_test_$$ && rm -f /tmp/script_run_test_$$ && echo OK');
        var tmpWritable = tmpCheck.output.trim().indexOf('OK') !== -1;

        var histDir = _getHistoryDir();
        await _ensureDir(histDir);
        var histCheck = await _execTerminal('touch ' + _escapeShell(histDir + '.test') + ' && rm -f ' + _escapeShell(histDir + '.test') + ' && echo OK');
        var histWritable = histCheck.output.trim().indexOf('OK') !== -1;

        var availCount = 0;
        for (var j = 0; j < results.length; j++) {
            if (results[j].available) availCount++;
        }

        return {
            interpreters: results,
            available_count: availCount,
            total_checked: results.length,
            temp_dir_writable: tmpWritable,
            history_dir: histDir,
            history_dir_writable: histWritable,
            default_timeout: _getDefaultTimeout(),
            max_output: _getMaxOutput(),
            status: availCount > 0 && tmpWritable ? 'healthy' : 'degraded'
        };
    }

    async function wrapExecution(func, params, actionName) {
        try {
            var result = await func(params || {});
            var success = true;
            if (result && result.exit_code !== undefined) {
                success = result.exit_code === 0;
            }
            if (result && result.status === 'degraded') {
                success = true;
            }
            complete({
                success: success,
                message: success
                    ? actionName + '完成'
                    : actionName + '完成，但存在错误',
                data: result
            });
        } catch (error) {
            console.error('[script_run] ' + actionName + ' 异常: ' + error.message);
            complete({
                success: false,
                message: actionName + '失败: ' + error.message,
                data: null
            });
        }
    }

    return {
        execute: function (p) { return wrapExecution(executeHandler, p, '脚本执行'); },
        execute_batch: function (p) { return wrapExecution(executeBatchHandler, p, '批量执行'); },
        inspect: function (p) { return wrapExecution(inspectHandler, p, '脚本检查'); },
        fix_permissions: function (p) { return wrapExecution(fixPermissionsHandler, p, '权限修复'); },
        get_history: function (p) { return wrapExecution(getHistoryHandler, p, '历史查询'); },
        kill_script: function (p) { return wrapExecution(killScriptHandler, p, '进程终止'); },
        list_running: function (p) { return wrapExecution(listRunningHandler, p, '进程列表'); },
        test: function (p) { return wrapExecution(testHandler, p, '自检'); }
    };

})();

exports.execute = SCRIPT_RUN.execute;
exports.execute_batch = SCRIPT_RUN.execute_batch;
exports.inspect = SCRIPT_RUN.inspect;
exports.fix_permissions = SCRIPT_RUN.fix_permissions;
exports.get_history = SCRIPT_RUN.get_history;
exports.kill_script = SCRIPT_RUN.kill_script;
exports.list_running = SCRIPT_RUN.list_running;
exports.test = SCRIPT_RUN.test;
