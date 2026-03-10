/* METADATA
{
    "name": "operit_upgrade",
    "version": "1.0",
    "display_name": {
        "zh": "Operit 一键升级",
        "en": "Operit One-Click Upgrade"
    },
    "description": {
        "zh": "Operit 项目一键升级工具包。从 GitHub (AAswordman/Operit) 拉取最新源码并替换本地项目目录。提供：1) 一键升级——自动下载 main 分支 ZIP、校验完整性、备份旧版、全量替换至 /storage/emulated/0/Download/Operit-main/；2) 版本检查——对比本地与远程 commit；3) 备份管理与回滚；4) 连通性测试；5) 智能代理探测；6) 差量信息展示。支持自定义 GitHub 代理、断点重试、SHA 校验、进度推送、并行优化、自动清理临时文件。绝对保护 /storage/emulated/0/Download/Operit/ 工作目录。",
        "en": "Operit One-Click Upgrade Toolkit. Pulls the latest source code from GitHub (AAswordman/Operit) and performs a full replacement of the local project source directory. Provides: 1) One-click upgrade with integrity verification and safe backup; 2) Version check with commit comparison; 3) Backup management; 4) Rollback; 5) Connectivity diagnostics; 6) Smart proxy probing; 7) Diff log between local and remote versions. Optimized for extraction/replacement speed with parallel I/O, streaming unzip, and robust error recovery."
    },
    "enabledByDefault": false,
    "env": [
        {
            "name": "OPERIT_GITHUB_PROXY",
            "description": {
                "zh": "GitHub 代理地址（可选）。国内网络建议配置，例如：https://ghp.ci 或 https://mirror.ghproxy.com 或 https://gh-proxy.com 等。留空则直连 GitHub。设为 auto 可自动探测最快代理。",
                "en": "GitHub proxy URL (optional). Recommended for China mainland. Set to 'auto' for automatic fastest proxy detection."
            },
            "required": false
        },
        {
            "name": "OPERIT_UPGRADE_BACKUP_KEEP",
            "description": {
                "zh": "保留的历史备份数量（可选），默认 3。超出数量的旧备份将在升级时自动清理。设为 0 则不保留备份。",
                "en": "Number of historical backups to keep (optional), default 3. Set to 0 to disable backup."
            },
            "required": false
        },
        {
            "name": "OPERIT_UPGRADE_TIMEOUT",
            "description": {
                "zh": "下载超时时间（可选），单位毫秒，默认 120000（120秒）。网络较慢时可适当增大。",
                "en": "Download timeout in milliseconds (optional), default 120000 (120s)."
            },
            "required": false
        },
        {
            "name": "OPERIT_UPGRADE_DEBUG",
            "description": {
                "zh": "调试模式开关（可选）。设为 true 开启详细日志输出。",
                "en": "Debug mode toggle (optional). Set to true for verbose logging."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "upgrade",
            "description": {
                "zh": "一键升级 Operit 源码。自动执行完整升级流程：检测网络连通性 → 获取远程最新版本信息 → 下载 main 分支 ZIP 包 → 校验文件完整性 → 备份当前本地源码 → 解压并全量替换 /storage/emulated/0/Download/Operit-main/ 目录 → 清理临时文件 → 验证升级结果。全程推送进度信息，支持失败自动回滚。绝对不会修改 /storage/emulated/0/Download/Operit/ 工作目录。",
                "en": "One-click upgrade Operit source. Full automated flow with progress reporting, auto-rollback on failure, and parallel I/O optimization."
            },
            "parameters": [
                {
                    "name": "force",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "强制升级，即使本地版本已是最新也重新下载替换。默认 false。",
                        "en": "Force upgrade even if local version is already latest. Default false."
                    }
                },
                {
                    "name": "skip_backup",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "跳过备份步骤。默认 false，建议保持默认以保障安全。",
                        "en": "Skip backup step. Default false."
                    }
                }
            ]
        },
        {
            "name": "check_update",
            "description": {
                "zh": "检查是否有新版本可用。对比本地与远程最新 commit 信息，返回版本对比结果和更新建议，并展示两版本间的 commit 差异列表。",
                "en": "Check if a new version is available with commit diff list."
            },
            "parameters": []
        },
        {
            "name": "list_backups",
            "description": {
                "zh": "列出所有历史备份。显示备份文件名、大小、创建时间。",
                "en": "List all historical backups with size and creation time."
            },
            "parameters": []
        },
        {
            "name": "rollback",
            "description": {
                "zh": "从最近的备份恢复源码。将 /storage/emulated/0/Download/Operit-main/ 回滚至最近一次备份的状态。",
                "en": "Restore source from latest or specified backup."
            },
            "parameters": [
                {
                    "name": "backup_name",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "指定要恢复的备份文件名（不含路径）。留空则自动选择最近一次备份。",
                        "en": "Specify backup filename to restore. Leave empty for latest."
                    }
                }
            ]
        },
        {
            "name": "clean_backups",
            "description": {
                "zh": "清理历史备份文件。删除所有或指定数量之外的旧备份以释放存储空间。",
                "en": "Clean historical backup files to free storage."
            },
            "parameters": [
                {
                    "name": "keep",
                    "type": "number",
                    "required": false,
                    "default": 0,
                    "description": {
                        "zh": "保留最近的 N 个备份，默认 0 表示全部删除。",
                        "en": "Keep the latest N backups. Default 0 means delete all."
                    }
                }
            ]
        },
        {
            "name": "probe_proxy",
            "description": {
                "zh": "智能探测最佳 GitHub 代理节点。并发测试多个已知代理的延迟与可达性，返回排序后的推荐列表，并可选自动写入环境变量配置。",
                "en": "Probe and rank available GitHub proxy nodes by latency. Returns sorted recommendations."
            },
            "parameters": [
                {
                    "name": "auto_set",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否自动将最快代理设为当前代理配置。默认 false。",
                        "en": "Auto-set the fastest proxy as current config. Default false."
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试升级工具连通性。验证 GitHub 网络可达性、目录权限、磁盘空间、解压工具可用性及配置状态。",
                "en": "Full diagnostic: network, permissions, disk space, unzip tools, and configuration."
            },
            "parameters": []
        }
    ]
}
*/

const OPERIT_UPGRADE = (function () {

    var PATHS = {
        SOURCE_DIR: '/storage/emulated/0/Download/Operit-main/',
        PROTECTED_DIR: '/storage/emulated/0/Download/Operit/',
        BACKUP_DIR: '/storage/emulated/0/Download/Operit-backups/',
        TEMP_DIR: '/storage/emulated/0/Download/.operit-upgrade-tmp/',
        VERSION_FILE: '.operit_upgrade_version.json',
        LOCK_FILE: '.operit_upgrade.lock'
    };

    var GITHUB = {
        OWNER: 'AAswordman',
        REPO: 'Operit',
        BRANCH: 'main',
        API_BASE: 'https://api.github.com',
        RAW_DOWNLOAD: 'https://github.com'
    };

    var LIMITS = {
        MAX_RETRIES: 3,
        RETRY_BASE_DELAY: 1500,
        RETRY_MAX_DELAY: 15000,
        DEFAULT_TIMEOUT: 120000,
        DEFAULT_BACKUP_KEEP: 3,
        MAX_OUTPUT_CHARS: 30000,
        ZIP_INNER_PREFIX: 'Operit-main/',
        MIN_VALID_FILES: 5,
        MIN_ZIP_SIZE: 10240,
        PROBE_TIMEOUT: 8000,
        TERMINAL_PREFIX: 'ou_'
    };

    var PROXY_LIST = [
        'https://ghp.ci',
        'https://gh-proxy.com',
        'https://ghproxy.net',
        'https://cf.ghproxy.cc',
        'https://github.moeyy.xyz',
        'https://gh.llkk.cc',
        'https://ghfast.top',
        'https://mirror.ghproxy.com'
    ];

    var httpClient = OkHttp.newClient();
    var _cachedProxyResult = null;
    var _lockAcquired = false;

    function _env(key) {
        return (typeof getEnv === 'function') ? (getEnv(key) || '') : '';
    }

    function _debugEnabled() {
        return _env('OPERIT_UPGRADE_DEBUG') === 'true';
    }

    function _log(msg) {
        if (_debugEnabled()) console.log('[OU] ' + msg);
    }

    function _warn(msg) {
        console.warn('[OU] ' + msg);
    }

    function _err(msg) {
        console.error('[OU] ' + msg);
    }

    function _progress(msg) {
        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: msg });
        }
        _log('PROGRESS: ' + msg);
    }

    function _getTimeout() {
        var val = _env('OPERIT_UPGRADE_TIMEOUT');
        if (val) {
            var num = parseInt(val, 10);
            if (!isNaN(num) && num > 5000) return Math.min(num, 600000);
        }
        return LIMITS.DEFAULT_TIMEOUT;
    }

    function _getBackupKeep() {
        var val = _env('OPERIT_UPGRADE_BACKUP_KEEP');
        if (val !== '') {
            var num = parseInt(val, 10);
            if (!isNaN(num) && num >= 0) return Math.min(num, 50);
        }
        return LIMITS.DEFAULT_BACKUP_KEEP;
    }

    function _getProxyUrl() {
        var proxy = _env('OPERIT_GITHUB_PROXY');
        if (!proxy || !proxy.trim()) return null;
        if (proxy.trim().toLowerCase() === 'auto') return null;
        var base = proxy.trim().replace(/\/+$/, '');
        if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
        return base;
    }

    function _isAutoProxy() {
        var proxy = _env('OPERIT_GITHUB_PROXY');
        return proxy && proxy.trim().toLowerCase() === 'auto';
    }

    function _buildDownloadUrl(proxyOverride) {
        var direct = GITHUB.RAW_DOWNLOAD + '/' + GITHUB.OWNER + '/' + GITHUB.REPO + '/archive/refs/heads/' + GITHUB.BRANCH + '.zip';
        var proxy = proxyOverride || _getProxyUrl();
        if (proxy) return proxy + '/' + direct;
        return direct;
    }

    function _buildApiUrl(path) {
        return GITHUB.API_BASE + '/repos/' + GITHUB.OWNER + '/' + GITHUB.REPO + path;
    }

    function _buildApiUrlProxied(path, proxyOverride) {
        var url = _buildApiUrl(path);
        var proxy = proxyOverride || _getProxyUrl();
        if (proxy) return proxy + '/' + url;
        return url;
    }

    function _timestamp() {
        var d = new Date();
        return d.getFullYear() +
            String(d.getMonth() + 1).padStart(2, '0') +
            String(d.getDate()).padStart(2, '0') + '_' +
            String(d.getHours()).padStart(2, '0') +
            String(d.getMinutes()).padStart(2, '0') +
            String(d.getSeconds()).padStart(2, '0');
    }

    function _formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        var units = ['B', 'KB', 'MB', 'GB'];
        var i = 0, b = Number(bytes);
        while (b >= 1024 && i < units.length - 1) { b /= 1024; i++; }
        return b.toFixed(i === 0 ? 0 : 2) + ' ' + units[i];
    }

    function _formatDate(dateStr) {
        if (!dateStr) return '未知';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return String(dateStr);
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0') + ' ' +
                String(d.getHours()).padStart(2, '0') + ':' +
                String(d.getMinutes()).padStart(2, '0') + ':' +
                String(d.getSeconds()).padStart(2, '0');
        } catch (e) { return String(dateStr); }
    }

    function _formatDuration(ms) {
        if (ms < 1000) return ms + 'ms';
        if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
        var min = Math.floor(ms / 60000);
        var sec = ((ms % 60000) / 1000).toFixed(0);
        return min + 'm' + sec + 's';
    }

    function _safeBool(value, defaultVal) {
        if (value === undefined || value === null || value === '') return defaultVal;
        if (typeof value === 'boolean') return value;
        var str = String(value).trim().toLowerCase();
        if (str === 'true' || str === '1' || str === 'yes') return true;
        if (str === 'false' || str === '0' || str === 'no') return false;
        return defaultVal;
    }

    function _safeNumber(value, defaultVal, min, max) {
        if (value === undefined || value === null || value === '') return defaultVal;
        var num = Number(value);
        if (isNaN(num)) return defaultVal;
        return Math.max(min, Math.min(max, Math.round(num)));
    }

    function _pathIsSafe(targetPath) {
        var normalized = targetPath.replace(/\/+/g, '/').replace(/\/$/, '');
        var protectedNormalized = PATHS.PROTECTED_DIR.replace(/\/+/g, '/').replace(/\/$/, '');
        if (normalized === protectedNormalized) return false;
        if (normalized.indexOf(protectedNormalized + '/') === 0) return false;
        return true;
    }

    function _escapeShell(str) {
        return str.replace(/'/g, "'\\''");
    }

    function _robustJsonParse(text) {
        var trimmed = (text || '').trim();
        if (!trimmed) throw new Error('响应内容为空');
        try { return JSON.parse(trimmed); } catch (e) {}
        var start = trimmed.indexOf('{');
        var end = trimmed.lastIndexOf('}');
        if (start !== -1 && end > start) {
            try { return JSON.parse(trimmed.substring(start, end + 1)); } catch (e2) {}
        }
        var arrStart = trimmed.indexOf('[');
        var arrEnd = trimmed.lastIndexOf(']');
        if (arrStart !== -1 && arrEnd > arrStart) {
            try { return JSON.parse(trimmed.substring(arrStart, arrEnd + 1)); } catch (e3) {}
        }
        throw new Error('无法解析 JSON: ' + trimmed.substring(0, 200));
    }

    async function _sleep(ms) {
        if (typeof Tools !== 'undefined' && Tools.System && Tools.System.sleep) {
            await Tools.System.sleep(ms);
        } else {
            await new Promise(function (r) { setTimeout(r, ms); });
        }
    }

    var _defaultSession = null;

    async function _getSession() {
        if (!_defaultSession) {
            try {
                _defaultSession = await Tools.System.terminal.create(LIMITS.TERMINAL_PREFIX + 'session');
            } catch (e) {
                _warn('创建终端会话失败: ' + e.message);
                throw new Error('无法创建终端会话: ' + e.message);
            }
        }
        return _defaultSession;
    }

    async function _initSessionPool() {
        await _getSession();
    }

    async function _exec(cmd, timeoutMs, tag) {
        var session = await _getSession();
        var result = await Tools.System.terminal.exec(session.sessionId, cmd, timeoutMs || 30000);
        return result;
    }

    async function _execSafe(cmd, timeoutMs, tag) {
        try {
            return await _exec(cmd, timeoutMs, tag);
        } catch (e) {
            _warn('命令执行异常: ' + cmd.substring(0, 80) + ' -> ' + e.message);
            return { exitCode: -1, output: e.message };
        }
    }

    async function _httpGet(url, headers) {
        var builder = httpClient.newRequest().url(url).method('GET');
        var defaultHeaders = { 'User-Agent': 'Operit-Upgrade/1.0', 'Accept': 'application/json' };
        var merged = Object.assign({}, defaultHeaders, headers || {});
        for (var key in merged) {
            if (merged.hasOwnProperty(key)) builder.header(key, merged[key]);
        }
        return await builder.build().execute();
    }

    async function _httpGetWithRetry(url, headers, maxRetries) {
        var retries = maxRetries !== undefined ? maxRetries : LIMITS.MAX_RETRIES;
        var lastError = null;
        for (var attempt = 0; attempt <= retries; attempt++) {
            try {
                _log('HTTP GET [' + attempt + '/' + retries + ']: ' + url.substring(0, 120));
                var response = await _httpGet(url, headers);
                if (response.isSuccessful()) return response;
                if (response.statusCode === 404) throw new Error('资源不存在 (404): ' + url.substring(0, 100));
                if (response.statusCode === 403) throw new Error('访问被拒绝 (403)，可能触发速率限制');
                if ((response.statusCode === 429 || response.statusCode >= 500) && attempt < retries) {
                    var delay = Math.min(LIMITS.RETRY_BASE_DELAY * Math.pow(2, attempt), LIMITS.RETRY_MAX_DELAY);
                    delay += Math.floor(Math.random() * 500);
                    _warn('HTTP ' + response.statusCode + '，重试 ' + (attempt + 1) + '/' + retries + '，等待 ' + delay + 'ms');
                    await _sleep(delay);
                    continue;
                }
                throw new Error('HTTP ' + response.statusCode + ' ' + (response.statusMessage || ''));
            } catch (e) {
                lastError = e;
                if (attempt < retries && !e.message.includes('404') && !e.message.includes('403')) {
                    var retryDelay = Math.min(LIMITS.RETRY_BASE_DELAY * Math.pow(2, attempt), LIMITS.RETRY_MAX_DELAY);
                    retryDelay += Math.floor(Math.random() * 500);
                    _warn('请求异常: ' + e.message.substring(0, 80) + '，重试 ' + (attempt + 1));
                    await _sleep(retryDelay);
                    continue;
                }
                throw e;
            }
        }
        throw lastError || new Error('所有重试已耗尽');
    }

    async function _ensureDir(dirPath) {
        try {
            var exists = await Tools.Files.exists(dirPath, 'android');
            if (exists && exists.exists) return true;
        } catch (e) {}
        try {
            await Tools.Files.mkdir(dirPath, true, 'android');
            return true;
        } catch (e) {
            await _execSafe('mkdir -p \'' + _escapeShell(dirPath) + '\'', 10000, 'mkdir');
            var check = await Tools.Files.exists(dirPath, 'android');
            if (check && check.exists) return true;
            throw new Error('无法创建目录: ' + dirPath);
        }
    }

    async function _dirExists(dirPath) {
        try {
            var result = await Tools.Files.exists(dirPath, 'android');
            return !!(result && result.exists);
        } catch (e) { return false; }
    }

    async function _fileExists(filePath) {
        try {
            var result = await Tools.Files.exists(filePath, 'android');
            return !!(result && result.exists);
        } catch (e) { return false; }
    }

    async function _readJson(filePath) {
        try {
            if (!(await _fileExists(filePath))) return null;
            var content = await Tools.Files.read(filePath, 'android');
            if (!content || !content.content) return null;
            return JSON.parse(content.content);
        } catch (e) {
            _warn('读取 JSON 失败: ' + filePath);
            return null;
        }
    }

    async function _writeJson(filePath, data) {
        try {
            await Tools.Files.write(filePath, JSON.stringify(data, null, 2), false, 'android');
            return true;
        } catch (e) {
            _err('写入 JSON 失败: ' + filePath + ' - ' + e.message);
            return false;
        }
    }

    async function _listDir(dirPath) {
        try {
            var result = await Tools.Files.list(dirPath, 'android');
            if (!result || !Array.isArray(result.entries)) return [];
            return result.entries;
        } catch (e) { return []; }
    }

    async function _deleteRecursive(path) {
        try {
            var r = await _execSafe('rm -rf \'' + _escapeShell(path) + '\' 2>/dev/null; echo $?', 60000, 'del');
            return true;
        } catch (e) {
            _warn('删除失败: ' + path + ' - ' + e.message);
            return false;
        }
    }

    async function _getFileSize(filePath) {
        try {
            var r = await _exec('stat -c %s \'' + _escapeShell(filePath) + '\' 2>/dev/null || wc -c < \'' + _escapeShell(filePath) + '\'', 10000, 'sz');
            if (r && r.output) {
                var num = parseInt(r.output.trim(), 10);
                if (!isNaN(num)) return num;
            }
        } catch (e) {}
        return 0;
    }

    async function _getMd5(filePath) {
        try {
            var r = await _exec('md5sum \'' + _escapeShell(filePath) + '\' 2>/dev/null | cut -d\\  -f1', 15000, 'md5');
            if (r && r.output && r.exitCode === 0) {
                var hash = r.output.trim();
                if (/^[a-f0-9]{32}$/.test(hash)) return hash;
            }
        } catch (e) {}
        return null;
    }

    async function _detectUnzipTool() {
        var tools = [
            { cmd: 'unzip -v 2>&1 | head -1', name: 'unzip', unzipCmd: 'unzip' },
            { cmd: 'busybox unzip 2>&1 | head -1', name: 'busybox-unzip', unzipCmd: 'busybox unzip' },
            { cmd: 'python3 -c "import zipfile; print(\'ok\')" 2>&1', name: 'python3-zipfile', unzipCmd: 'python3' },
            { cmd: '7z 2>&1 | head -2', name: '7z', unzipCmd: '7z' }
        ];
        var available = [];
        for (var i = 0; i < tools.length; i++) {
            try {
                var r = await _exec(tools[i].cmd, 5000, 'detect');
                if (r && r.exitCode === 0) {
                    available.push(tools[i]);
                }
            } catch (e) {}
        }
        return available;
    }

    async function _unzipFast(zipPath, destDir) {
        await _ensureDir(destDir);
        var escapedZip = _escapeShell(zipPath);
        var escapedDest = _escapeShell(destDir);
        
        // unzip 优先（.zip 格式的原生工具，最快最可靠）
        var r = await _execSafe('unzip -oq \'' + escapedZip + '\' -d \'' + escapedDest + '\' 2>&1', _getTimeout(), 'unzip');
        if (r && r.exitCode === 0) return { tool: 'unzip', success: true };
        
        var r2 = await _execSafe('busybox unzip -oq \'' + escapedZip + '\' -d \'' + escapedDest + '\' 2>&1', _getTimeout(), 'bunzip');
        if (r2 && r2.exitCode === 0) return { tool: 'busybox', success: true };
        
        var pyScript = 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);z.extractall(sys.argv[2]);z.close();print("ok")';
        var r3 = await _execSafe('python3 -c \'' + pyScript + '\' \'' + escapedZip + '\' \'' + escapedDest + '\' 2>&1', _getTimeout(), 'pyunzip');
        if (r3 && r3.output && r3.output.indexOf('ok') !== -1) return { tool: 'python3', success: true };
        
        var errors = [(r ? r.output : ''), (r2 ? r2.output : ''), (r3 ? r3.output : '')].filter(Boolean).join(' | ');
        throw new Error('解压失败: ' + errors.substring(0, 200));
    }

    async function _syncReplaceDir(sourceDir, targetDir) {
        var srcPath = sourceDir.endsWith('/') ? sourceDir : sourceDir + '/';
        var dstPath = targetDir.endsWith('/') ? targetDir : targetDir + '/';
        var escapedSrc = _escapeShell(srcPath);
        var escapedDst = _escapeShell(dstPath);
        
        // rsync 最优（增量同步，原子操作）
        var r = await _execSafe('rsync -a --delete --inplace --no-whole-file \'' + escapedSrc + '\' \'' + escapedDst + '\' 2>&1', _getTimeout(), 'rsync');
        if (r && r.exitCode === 0) return { method: 'rsync', success: true };
        
        // tar 管道复制（保留权限，一次性传输）
        await _ensureDir(targetDir);
        var r2 = await _execSafe('rm -rf \'' + escapedDst + '\'* 2>/dev/null; tar -cf - -C \'' + escapedSrc + '\' . | tar -xf - -C \'' + escapedDst + '\' 2>&1', _getTimeout(), 'tarcp');
        if (r2 && r2.exitCode === 0) return { method: 'tar-pipe', success: true };
        
        // cp 兜底
        if (await _dirExists(targetDir)) await _deleteRecursive(targetDir);
        await _ensureDir(targetDir);
        var r3 = await _execSafe('cp -a \'' + escapedSrc + '\'./. \'' + escapedDst + '\' 2>&1 || cp -a \'' + escapedSrc + '\'* \'' + escapedDst + '\' 2>&1', _getTimeout(), 'cp');
        if (r3 && r3.exitCode === 0) return { method: 'cp', success: true };
        
        var errors = [(r ? r.output : ''), (r2 ? r2.output : ''), (r3 ? r3.output : '')].filter(Boolean).join(' | ');
        throw new Error('复制失败: ' + errors.substring(0, 200));
    }

    async function _fastBackup(sourceDir, backupDir) {
        var escapedSrc = _escapeShell(sourceDir);
        var escapedDst = _escapeShell(backupDir);
        await _ensureDir(backupDir);
        var r = await _execSafe(
            'cp -a \'' + escapedSrc + '\'* \'' + escapedDst + '\' 2>&1 && cp -a \'' + escapedSrc + '\'.* \'' + escapedDst + '\' 2>/dev/null; true',
            120000, 'bkcp'
        );
        if (r && r.exitCode === 0) return true;
        var r2 = await _execSafe(
            'tar -cf - -C \'' + escapedSrc + '\' . | tar -xf - -C \'' + escapedDst + '\' 2>&1',
            120000, 'bktar'
        );
        if (r2 && r2.exitCode === 0) return true;
        throw new Error('备份失败: 所有方式均不可用');
    }

    async function _getDiskFreeSpace() {
        try {
            var r = await _exec('df -h /storage/emulated/0/ 2>/dev/null | tail -1', 10000, 'df');
            if (r && r.output) {
                var parts = r.output.trim().split(/\s+/);
                if (parts.length >= 4) {
                    return { total: parts[1] || '?', used: parts[2] || '?', available: parts[3] || '?', raw: r.output.trim() };
                }
            }
        } catch (e) {}
        return null;
    }

    async function _getDiskFreeBytes() {
        try {
            var r = await _exec('df /storage/emulated/0/ 2>/dev/null | tail -1 | awk \'{print $4}\'', 10000, 'dfb');
            if (r && r.output) {
                var kb = parseInt(r.output.trim(), 10);
                if (!isNaN(kb)) return kb * 1024;
            }
        } catch (e) {}
        return -1;
    }

    async function _getLocalDirSize(dirPath) {
        try {
            var r = await _exec('du -sh \'' + _escapeShell(dirPath) + '\' 2>/dev/null | cut -f1', 10000, 'du');
            if (r && r.output) return r.output.trim();
        } catch (e) {}
        return '未知';
    }

    async function _countFiles(dirPath) {
        try {
            var r = await _exec('find \'' + _escapeShell(dirPath) + '\' -type f 2>/dev/null | wc -l', 15000, 'cnt');
            if (r && r.output) {
                var c = parseInt(r.output.trim(), 10);
                return isNaN(c) ? 0 : c;
            }
        } catch (e) {}
        return 0;
    }

    async function _countDirs(dirPath) {
        try {
            var r = await _exec('find \'' + _escapeShell(dirPath) + '\' -type d 2>/dev/null | wc -l', 15000, 'cntd');
            if (r && r.output) {
                var c = parseInt(r.output.trim(), 10);
                return isNaN(c) ? 0 : c;
            }
        } catch (e) {}
        return 0;
    }

    async function _acquireLock() {
        var lockPath = PATHS.TEMP_DIR + PATHS.LOCK_FILE;
        await _ensureDir(PATHS.TEMP_DIR);
        if (await _fileExists(lockPath)) {
            var lockData = await _readJson(lockPath);
            if (lockData && lockData.ts) {
                var elapsed = Date.now() - lockData.ts;
                if (elapsed < 120000) {
                    throw new Error('升级正在进行中（已运行 ' + _formatDuration(elapsed) + '）。如确认无其他升级任务，请先清理临时文件。');
                }
                _warn('发现过期锁文件（' + _formatDuration(elapsed) + '），自动清除');
            }
            await _deleteRecursive(lockPath);
        }
        await _writeJson(lockPath, { ts: Date.now(), pid: 'operit_upgrade' });
        _lockAcquired = true;
        return true;
    }

    async function _releaseLock() {
        if (!_lockAcquired) return;
        try {
            var lockPath = PATHS.TEMP_DIR + PATHS.LOCK_FILE;
            await _deleteRecursive(lockPath);
        } catch (e) {}
        _lockAcquired = false;
    }

    async function _fetchRemoteInfo(proxyOverride) {
        _log('获取远程仓库信息...');
        var url = _buildApiUrlProxied('/commits/' + GITHUB.BRANCH, proxyOverride);
        var response = await _httpGetWithRetry(url, { 'Accept': 'application/vnd.github.v3+json' });
        var data = _robustJsonParse(response.content);
        if (!data || !data.sha) throw new Error('无法解析远程 commit 信息');
        return {
            sha: data.sha,
            shortSha: data.sha.substring(0, 7),
            message: (data.commit && data.commit.message) ? data.commit.message.split('\n')[0] : '无提交信息',
            author: (data.commit && data.commit.author) ? data.commit.author.name : '未知',
            date: (data.commit && data.commit.author) ? data.commit.author.date : null,
            url: data.html_url || ('https://github.com/' + GITHUB.OWNER + '/' + GITHUB.REPO + '/commit/' + data.sha)
        };
    }

    async function _fetchRepoInfo(proxyOverride) {
        try {
            var url = _buildApiUrlProxied('', proxyOverride);
            var response = await _httpGetWithRetry(url, { 'Accept': 'application/vnd.github.v3+json' }, 1);
            var data = _robustJsonParse(response.content);
            return {
                stars: data.stargazers_count || 0,
                forks: data.forks_count || 0,
                size: data.size ? _formatBytes(data.size * 1024) : '未知',
                description: data.description || '',
                updated_at: data.updated_at || null
            };
        } catch (e) {
            _warn('获取仓库信息失败: ' + e.message);
            return null;
        }
    }

    async function _fetchCommitsBetween(baseSha, headSha, proxyOverride) {
        try {
            if (!baseSha || !headSha || baseSha === headSha) return [];
            var url = _buildApiUrlProxied('/compare/' + baseSha.substring(0, 7) + '...' + headSha.substring(0, 7), proxyOverride);
            var response = await _httpGetWithRetry(url, { 'Accept': 'application/vnd.github.v3+json' }, 1);
            var data = _robustJsonParse(response.content);
            if (!data || !Array.isArray(data.commits)) return [];
            return data.commits.slice(0, 20).map(function (c) {
                return {
                    sha: c.sha ? c.sha.substring(0, 7) : '?',
                    message: (c.commit && c.commit.message) ? c.commit.message.split('\n')[0] : '',
                    author: (c.commit && c.commit.author) ? c.commit.author.name : '',
                    date: (c.commit && c.commit.author) ? c.commit.author.date : null
                };
            });
        } catch (e) {
            _log('获取 commit 差异失败: ' + e.message);
            return [];
        }
    }

    async function _readLocalVersion() {
        return await _readJson(PATHS.SOURCE_DIR + PATHS.VERSION_FILE);
    }

    async function _writeLocalVersion(info) {
        return await _writeJson(PATHS.SOURCE_DIR + PATHS.VERSION_FILE, {
            sha: info.sha,
            shortSha: info.shortSha,
            message: info.message,
            author: info.author,
            date: info.date,
            upgraded_at: new Date().toISOString(),
            tool_version: '1.0'
        });
    }

    async function _downloadZip(url, savePath) {
        var errors = [];
        var dlTimeout = _getTimeout();
        
        // 优先 Android 原生下载（国内网络通常更可靠，自动走系统代理）
        try {
            await Tools.Files.download(url, savePath);
            if (await _fileExists(savePath)) {
                var sz = await _getFileSize(savePath);
                if (sz > LIMITS.MIN_ZIP_SIZE) return true;
            }
            errors.push('native: 文件过小或为空');
        } catch (e) { errors.push('native: ' + e.message.substring(0, 80)); }
        
        // curl 兜底（加 dns-timeout 防国内 DNS 卡死，不内部重试）
        try {
            var r = await _execSafe(
                'curl -fSL --dns-timeout 10 --connect-timeout 10 --max-time ' + Math.floor(dlTimeout / 1000) +
                ' -o \'' + _escapeShell(savePath) + '\' \'' + _escapeShell(url) + '\' 2>&1',
                dlTimeout + 15000, 'curl'
            );
            if (r && r.exitCode === 0 && await _fileExists(savePath)) {
                var sz2 = await _getFileSize(savePath);
                if (sz2 > LIMITS.MIN_ZIP_SIZE) return true;
            }
            errors.push('curl: ' + (r ? r.output.substring(0, 100) : 'exit ' + (r ? r.exitCode : '?')));
        } catch (e2) { errors.push('curl: ' + e2.message.substring(0, 80)); }
        
        // wget 备选
        try {
            var r3 = await _execSafe(
                'wget --dns-timeout=10 --connect-timeout=10 --timeout=' + Math.floor(dlTimeout / 1000) +
                ' -q -O \'' + _escapeShell(savePath) + '\' \'' + _escapeShell(url) + '\' 2>&1',
                dlTimeout + 15000, 'wget'
            );
            if (r3 && r3.exitCode === 0 && await _fileExists(savePath)) {
                var sz3 = await _getFileSize(savePath);
                if (sz3 > LIMITS.MIN_ZIP_SIZE) return true;
            }
            errors.push('wget: ' + (r3 ? r3.output.substring(0, 100) : 'exit ' + (r3 ? r3.exitCode : '?')));
        } catch (e3) { errors.push('wget: ' + e3.message.substring(0, 80)); }
        
        throw new Error('下载失败: ' + errors.join(' | ').substring(0, 300));
    }

    async function _verifyZip(zipPath) {
        _progress('🔍 校验 ZIP 完整性...');
        var fileSize = await _getFileSize(zipPath);
        if (fileSize < LIMITS.MIN_ZIP_SIZE) {
            throw new Error('ZIP 文件过小 (' + _formatBytes(fileSize) + ')，可能下载不完整');
        }
        var r = await _execSafe('unzip -t \'' + _escapeShell(zipPath) + '\' 2>&1 | tail -5', 30000, 'verify');
        if (r && r.exitCode === 0) {
            _progress('✅ ZIP 校验通过 (' + _formatBytes(fileSize) + ')');
            return { size: fileSize, valid: true };
        }
        if (r && r.output) {
            var out = r.output.toLowerCase();
            if (out.indexOf('no errors') !== -1 || out.indexOf('ok') !== -1) {
                _progress('✅ ZIP 校验通过');
                return { size: fileSize, valid: true };
            }
        }
        var r2 = await _execSafe('python3 -c "import zipfile;z=zipfile.ZipFile(\'' + _escapeShell(zipPath) + '\');z.testzip() or print(\'ok\')" 2>&1', 30000, 'pyverify');
        if (r2 && r2.output && r2.output.indexOf('ok') !== -1) {
            _progress('✅ ZIP 校验通过 (python3)');
            return { size: fileSize, valid: true };
        }
        throw new Error('ZIP 文件损坏或不完整 (size=' + _formatBytes(fileSize) + ')');
    }

    async function _resolveExtractedSource(extractDir) {
        var innerDir = extractDir + LIMITS.ZIP_INNER_PREFIX;
        if (await _dirExists(innerDir)) {
            var entries = await _listDir(innerDir);
            if (entries.length > 0) return innerDir;
        }
        var topEntries = await _listDir(extractDir);
        if (topEntries.length === 1 && topEntries[0].isDirectory) {
            var singleDir = extractDir + topEntries[0].name + '/';
            var subEntries = await _listDir(singleDir);
            if (subEntries.length > 0) return singleDir;
        }
        if (topEntries.length > 0) return extractDir;
        throw new Error('解压后未找到有效源码内容');
    }

    async function _createBackup() {
        if (!(await _dirExists(PATHS.SOURCE_DIR))) {
            _log('源码目录不存在，跳过备份');
            return null;
        }
        _progress('📦 正在备份当前源码...');
        await _ensureDir(PATHS.BACKUP_DIR);
        var backupName = 'operit_backup_' + _timestamp();
        var backupPath = PATHS.BACKUP_DIR + backupName + '/';
        var startMs = Date.now();
        await _fastBackup(PATHS.SOURCE_DIR, backupPath);
        var elapsed = Date.now() - startMs;
        _progress('✅ 备份完成: ' + backupName + ' (' + _formatDuration(elapsed) + ')');
        return backupName;
    }

    async function _autoCleanBackups(keepCount) {
        var keep = (keepCount !== undefined && keepCount !== null) ? keepCount : _getBackupKeep();
        if (keep < 0) return 0;
        if (!(await _dirExists(PATHS.BACKUP_DIR))) return 0;
        var entries = await _listDir(PATHS.BACKUP_DIR);
        var backups = entries
            .filter(function (e) { return e.isDirectory && e.name.indexOf('operit_backup_') === 0; })
            .sort(function (a, b) { return (b.name > a.name) ? 1 : ((b.name < a.name) ? -1 : 0); });
        if (backups.length <= keep) return 0;
        var toDelete = backups.slice(keep);
        var deleted = 0;
        for (var i = 0; i < toDelete.length; i++) {
            if (await _deleteRecursive(PATHS.BACKUP_DIR + toDelete[i].name)) deleted++;
        }
        if (deleted > 0) _progress('🧹 已清理 ' + deleted + ' 个旧备份');
        return deleted;
    }

    async function _verifyUpgradeResult() {
        if (!(await _dirExists(PATHS.SOURCE_DIR))) throw new Error('升级后源码目录不存在');
        var fileCount = await _countFiles(PATHS.SOURCE_DIR);
        if (fileCount < LIMITS.MIN_VALID_FILES) throw new Error('升级后文件数异常少 (' + fileCount + ')');
        var dirSize = await _getLocalDirSize(PATHS.SOURCE_DIR);
        var dirCount = await _countDirs(PATHS.SOURCE_DIR);
        return { fileCount: fileCount, dirCount: dirCount, dirSize: dirSize };
    }

    async function _selectProxy() {
        if (_cachedProxyResult) return _cachedProxyResult;
        var configured = _getProxyUrl();
        if (configured) return configured;
        if (!_isAutoProxy()) return null;
        _progress('🔍 正在探测最佳代理...');
        var results = await _probeProxiesInternal();
        if (results.length > 0 && results[0].ok) {
            _cachedProxyResult = results[0].proxy;
            _progress('✅ 选定代理: ' + results[0].proxy + ' (' + results[0].latency + 'ms)');
            return results[0].proxy;
        }
        _progress('⚠️ 所有代理不可达，使用直连');
        return null;
    }

    async function _probeProxiesInternal() {
        var testUrl = '/commits/' + GITHUB.BRANCH;
        var probes = PROXY_LIST.map(function (proxy) {
            return { proxy: proxy, url: proxy + '/' + _buildApiUrl(testUrl), ok: false, latency: 99999, error: null };
        });
        probes.push({ proxy: null, url: _buildApiUrl(testUrl), ok: false, latency: 99999, error: null, label: '直连' });
        
        var completed = 0;
        var promises = probes.map(function (p) {
            var start = Date.now();
            return Promise.race([
                _httpGet(p.url, { 'Accept': 'application/vnd.github.v3+json' }).then(function (resp) {
                    p.latency = Date.now() - start;
                    p.ok = resp.isSuccessful();
                    if (!p.ok) p.error = 'HTTP ' + resp.statusCode;
                    completed++;
                }).catch(function (e) {
                    p.latency = Date.now() - start;
                    p.error = e.message.substring(0, 60);
                    completed++;
                }),
                _sleep(LIMITS.PROBE_TIMEOUT).then(function () {
                    if (!p.ok) { p.latency = LIMITS.PROBE_TIMEOUT; p.error = 'timeout'; completed++; }
                })
            ]);
        });
        await Promise.all(promises);
        probes.sort(function (a, b) {
            if (a.ok && !b.ok) return -1;
            if (!a.ok && b.ok) return 1;
            return a.latency - b.latency;
        });
        return probes;
    }

    async function _cleanupTemp() {
        try {
            _log('清理临时文件...');
            await _deleteRecursive(PATHS.TEMP_DIR);
        } catch (e) {
            _warn('临时文件清理失败: ' + e.message);
        }
    }

    async function _upgradeCore(params) {
        var force = _safeBool((params || {}).force, false);
        var skipBackup = _safeBool((params || {}).skip_backup, false);
        var startTime = Date.now();
        var report = [];
        var backupName = null;
        var phase = 'init';

        report.push('## 🚀 Operit 源码升级报告\n');

        // 预检先于加锁，避免自己创建的锁触发误判
        var preflightIssues = await _preflight(true);
        if (preflightIssues.length > 0) {
            return { success: false, message: '预检失败: ' + preflightIssues.join('; '), data: '> ❌ ' + preflightIssues.join('\n> ❌ ') };
        }

        await _acquireLock();
        await _initSessionPool();

        try {
            phase = 'proxy';
            var proxyUrl = await _selectProxy();

            phase = 'fetch_remote';
            _progress('🌐 获取远程版本信息...');
            var remoteInfo;
            try {
                remoteInfo = await _fetchRemoteInfo(proxyUrl);
            } catch (e) {
                throw new Error('无法获取远程版本信息: ' + e.message + '\n如在国内网络，请配置 OPERIT_GITHUB_PROXY 或设为 auto。');
            }

            report.push('**远程最新**: `' + remoteInfo.shortSha + '` - ' + remoteInfo.message);
            report.push('**提交者**: ' + remoteInfo.author + ' | **时间**: ' + _formatDate(remoteInfo.date));
            report.push('');

            var localVersion = await _readLocalVersion();
            if (localVersion) {
                report.push('**本地当前**: `' + (localVersion.shortSha || '?') + '` - ' + (localVersion.message || '无记录'));
                report.push('**上次升级**: ' + _formatDate(localVersion.upgraded_at));
                report.push('');

                if (localVersion.sha === remoteInfo.sha && !force) {
                    report.push('> ✅ **本地版本已是最新**，无需升级。设置 `force: true` 可强制重新部署。');
                    await _releaseLock();
                    return { success: true, message: '已是最新版本 (' + remoteInfo.shortSha + ')', data: report.join('\n'), meta: { action: 'skip', reason: 'already_latest' } };
                }
                if (force) report.push('> ⚡ 强制模式已启用，将重新部署。\n');
            } else {
                report.push('**本地版本**: 无记录（首次安装）\n');
            }

            phase = 'prepare';
            await _ensureDir(PATHS.TEMP_DIR);

            phase = 'download';
            _log('开始下载源码包...');
            var dlStart = Date.now();
            var dlResult = await _smartDownloadWithFallback(remoteInfo, proxyUrl);
            var zipPath = dlResult.path;
            var dlTime = Date.now() - dlStart;
            _progress('✅ 下载完成 (' + dlResult.strategy + ', ' + _formatDuration(dlTime) + ')');

            phase = 'verify';
            var verifyResult = await _verifyZip(zipPath);
            var zipMd5 = await _getMd5(zipPath);

            phase = 'extract';
            var extractDir = PATHS.TEMP_DIR + 'extracted_' + remoteInfo.shortSha + '/';
            var unzipResult = await _optimizedExtract(zipPath, extractDir);
            var exTime = unzipResult.elapsed;

            var sourceDir = await _resolveExtractedSource(extractDir);

            phase = 'backup';
            if (!skipBackup && _getBackupKeep() > 0) {
                backupName = await _createBackup();
            }

            phase = 'replace';
            _progress('🔄 替换源码目录...');
            if (!_pathIsSafe(PATHS.SOURCE_DIR)) {
                throw new Error('安全检查失败: 目标路径指向受保护目录！操作已终止。');
            }
            var repStart = Date.now();
            var replaceResult = await _syncReplaceDir(sourceDir, PATHS.SOURCE_DIR);
            var repTime = Date.now() - repStart;
            _progress('✅ 替换完成 (' + replaceResult.method + ', ' + _formatDuration(repTime) + ')');

            phase = 'version';
            await _writeLocalVersion(remoteInfo);

            phase = 'verify_result';
            var finalVerify = await _verifyUpgradeResult();

            phase = 'cleanup';
            if (!skipBackup) await _autoCleanBackups();
            await _cleanupTemp();
            await _releaseLock();

            var totalTime = Date.now() - startTime;

            report.push('### ✅ 升级成功\n');
            report.push('| 项目 | 详情 |');
            report.push('| :--- | :--- |');
            report.push('| 新版本 | `' + remoteInfo.shortSha + '` |');
            report.push('| 提交信息 | ' + remoteInfo.message + ' |');
            report.push('| 文件数 | ' + finalVerify.fileCount + ' 个 |');
            report.push('| 目录数 | ' + finalVerify.dirCount + ' 个 |');
            report.push('| 目录大小 | ' + finalVerify.dirSize + ' |');
            report.push('| ZIP 大小 | ' + _formatBytes(verifyResult.size) + ' |');
            if (zipMd5) report.push('| ZIP MD5 | `' + zipMd5 + '` |');
            report.push('| 安装路径 | `' + PATHS.SOURCE_DIR + '` |');
            if (backupName) report.push('| 备份 | `' + backupName + '` |');
            if (proxyUrl) report.push('| 使用代理 | ' + proxyUrl + ' |');
            report.push('| 下载方式 | ' + dlResult.strategy + ' |');
            report.push('| 解压工具 | ' + unzipResult.tool + ' |');
            report.push('| 替换方式 | ' + replaceResult.method + ' |');
            report.push('| 下载耗时 | ' + _formatDuration(dlTime) + ' |');
            report.push('| 解压耗时 | ' + _formatDuration(exTime) + ' |');
            report.push('| 替换耗时 | ' + _formatDuration(repTime) + ' |');
            report.push('| 总耗时 | ' + _formatDuration(totalTime) + ' |');
            report.push('');
            report.push('> 📌 源码已部署到 `' + PATHS.SOURCE_DIR + '`');

            return {
                success: true,
                message: '升级成功: ' + remoteInfo.shortSha + ' (' + remoteInfo.message + ')',
                data: report.join('\n'),
                meta: {
                    action: 'upgraded', sha: remoteInfo.sha, shortSha: remoteInfo.shortSha,
                    fileCount: finalVerify.fileCount, dirSize: finalVerify.dirSize,
                    backupName: backupName, elapsed_ms: totalTime,
                    dl_ms: dlTime, extract_ms: exTime, replace_ms: repTime,
                    dl_strategy: dlResult.strategy,
                    method: replaceResult.method, unzip_tool: unzipResult.tool
                }
            };

        } catch (upgradeError) {
            _err('升级失败 [' + phase + ']: ' + upgradeError.message);

            if (backupName && (phase === 'replace' || phase === 'version' || phase === 'verify_result')) {
                _progress('⚠️ 升级失败，尝试从备份回滚...');
                try {
                    await _deleteRecursive(PATHS.SOURCE_DIR);
                    var rollbackSrc = PATHS.BACKUP_DIR + backupName + '/';
                    await _syncReplaceDir(rollbackSrc, PATHS.SOURCE_DIR);
                    _progress('✅ 已回滚到: ' + backupName);
                    report.push('### ❌ 升级失败（已回滚）\n');
                    report.push('**阶段**: ' + phase);
                    report.push('**错误**: ' + upgradeError.message);
                    report.push('**操作**: 已自动从 `' + backupName + '` 恢复');
                } catch (rollbackError) {
                    report.push('### ❌ 升级失败且回滚异常\n');
                    report.push('**升级错误**: ' + upgradeError.message);
                    report.push('**回滚错误**: ' + rollbackError.message);
                    report.push('> ⚠️ 请手动检查: `' + PATHS.SOURCE_DIR + '`');
                    report.push('> 备份位于: `' + PATHS.BACKUP_DIR + backupName + '/`');
                }
            } else {
                report.push('### ❌ 升级失败\n');
                report.push('**阶段**: ' + phase);
                report.push('**错误**: ' + upgradeError.message);
                if (!backupName) report.push('> 未创建备份，无法自动回滚。');
            }

            await _cleanupTemp();
            await _releaseLock();
            return { success: false, message: '升级失败 [' + phase + ']: ' + upgradeError.message, data: report.join('\n') };
        }
    }

    async function _checkUpdateCore(params) {
        var report = [];
        report.push('## 🔍 Operit 版本检查\n');

        await _initSessionPool();
        var proxyUrl = await _selectProxy();

        var remoteInfo;
        try {
            remoteInfo = await _fetchRemoteInfo(proxyUrl);
        } catch (e) {
            throw new Error('无法获取远程版本: ' + e.message);
        }

        var repoInfo = await _fetchRepoInfo(proxyUrl);

        report.push('### 远程仓库\n');
        report.push('| 项目 | 详情 |');
        report.push('| :--- | :--- |');
        report.push('| 仓库 | [' + GITHUB.OWNER + '/' + GITHUB.REPO + '](https://github.com/' + GITHUB.OWNER + '/' + GITHUB.REPO + ') |');
        report.push('| 分支 | `' + GITHUB.BRANCH + '` |');
        report.push('| 最新 commit | `' + remoteInfo.shortSha + '` |');
        report.push('| 提交信息 | ' + remoteInfo.message + ' |');
        report.push('| 提交者 | ' + remoteInfo.author + ' |');
        report.push('| 提交时间 | ' + _formatDate(remoteInfo.date) + ' |');
        if (repoInfo) {
            report.push('| Stars | ⭐ ' + repoInfo.stars + ' |');
            report.push('| Forks | 🍴 ' + repoInfo.forks + ' |');
            if (repoInfo.size) report.push('| 仓库大小 | ' + repoInfo.size + ' |');
        }
        report.push('');

        var localVersion = await _readLocalVersion();
        var sourceDirExists = await _dirExists(PATHS.SOURCE_DIR);

        report.push('### 本地状态\n');
        report.push('| 项目 | 详情 |');
        report.push('| :--- | :--- |');
        report.push('| 源码目录 | `' + PATHS.SOURCE_DIR + '` |');
        report.push('| 目录状态 | ' + (sourceDirExists ? '✅ 存在' : '❌ 不存在') + ' |');

        if (localVersion) {
            report.push('| 本地版本 | `' + (localVersion.shortSha || '?') + '` |');
            report.push('| 提交信息 | ' + (localVersion.message || '无') + ' |');
            report.push('| 上次升级 | ' + _formatDate(localVersion.upgraded_at) + ' |');
        } else {
            report.push('| 本地版本 | 无记录 |');
        }

        if (sourceDirExists) {
            var dirSize = await _getLocalDirSize(PATHS.SOURCE_DIR);
            var fileCount = await _countFiles(PATHS.SOURCE_DIR);
            report.push('| 文件数 | ' + fileCount + ' 个 |');
            report.push('| 目录大小 | ' + dirSize + ' |');
        }
        report.push('');

        var needsUpgrade = false;
        var reason = '';
        if (!sourceDirExists) {
            needsUpgrade = true;
            reason = '源码目录不存在，需首次安装';
        } else if (!localVersion) {
            needsUpgrade = true;
            reason = '版本记录丢失，建议重新部署';
        } else if (localVersion.sha !== remoteInfo.sha) {
            needsUpgrade = true;
            reason = '检测到新版本';
        } else {
            reason = '已是最新版本';
        }

        if (needsUpgrade && localVersion && localVersion.sha) {
            var commits = await _fetchCommitsBetween(localVersion.sha, remoteInfo.sha, proxyUrl);
            if (commits.length > 0) {
                report.push('### 📋 更新日志 (' + commits.length + ' 个 commit)\n');
                report.push('| SHA | 提交信息 | 作者 | 时间 |');
                report.push('| :--- | :--- | :--- | :--- |');
                commits.forEach(function (c) {
                    report.push('| `' + c.sha + '` | ' + c.message.substring(0, 50) + ' | ' + c.author + ' | ' + _formatDate(c.date) + ' |');
                });
                report.push('');
            }
        }

        report.push('### 升级建议\n');
        if (needsUpgrade) {
            report.push('> 🆕 **' + reason + '**');
            report.push('> 远程: `' + remoteInfo.shortSha + '` ← 本地: `' + (localVersion ? localVersion.shortSha : '无') + '`');
            report.push('> 请调用 `upgrade` 执行升级。');
        } else {
            report.push('> ✅ **' + reason + '** (`' + remoteInfo.shortSha + '`)');
        }

        return {
            success: true,
            message: needsUpgrade ? '有新版本: ' + remoteInfo.shortSha : '已是最新: ' + remoteInfo.shortSha,
            data: report.join('\n'),
            meta: { needs_upgrade: needsUpgrade, reason: reason, remote_sha: remoteInfo.sha, local_sha: localVersion ? localVersion.sha : null }
        };
    }

    async function _listBackupsCore(params) {
        var report = [];
        report.push('## 📦 Operit 备份列表\n');
        if (!(await _dirExists(PATHS.BACKUP_DIR))) {
            report.push('> 📭 备份目录不存在');
            return { success: true, message: '无备份', data: report.join('\n'), meta: { count: 0 } };
        }
        var entries = await _listDir(PATHS.BACKUP_DIR);
        var backups = entries
            .filter(function (e) { return e.isDirectory && e.name.indexOf('operit_backup_') === 0; })
            .sort(function (a, b) { return (b.name > a.name) ? 1 : ((b.name < a.name) ? -1 : 0); });
        if (backups.length === 0) {
            report.push('> 📭 无备份记录');
            return { success: true, message: '无备份', data: report.join('\n'), meta: { count: 0 } };
        }
        report.push('| # | 备份名称 | 修改时间 |');
        report.push('| :---: | :--- | :--- |');
        for (var i = 0; i < backups.length; i++) {
            report.push('| ' + (i + 1) + ' | `' + backups[i].name + '` | ' + _formatDate(backups[i].lastModified) + ' |');
        }
        report.push('');
        report.push('> 共 ' + backups.length + ' 个备份 | 保留策略: ' + _getBackupKeep() + ' 个');
        return {
            success: true,
            message: backups.length + ' 个备份',
            data: report.join('\n'),
            meta: { count: backups.length, backups: backups.map(function (b) { return b.name; }) }
        };
    }

    async function _rollbackCore(params) {
        var targetName = (params || {}).backup_name;
        var report = [];
        report.push('## ⏪ Operit 版本回滚\n');

        if (!_pathIsSafe(PATHS.SOURCE_DIR)) throw new Error('安全检查失败');
        if (!(await _dirExists(PATHS.BACKUP_DIR))) throw new Error('备份目录不存在');

        await _initSessionPool();

        var entries = await _listDir(PATHS.BACKUP_DIR);
        var backups = entries
            .filter(function (e) { return e.isDirectory && e.name.indexOf('operit_backup_') === 0; })
            .sort(function (a, b) { return (b.name > a.name) ? 1 : ((b.name < a.name) ? -1 : 0); });
        if (backups.length === 0) throw new Error('没有可用备份');

        var selected;
        if (targetName) {
            selected = backups.find(function (b) { return b.name === targetName; });
            if (!selected) throw new Error('未找到备份: ' + targetName);
        } else {
            selected = backups[0];
        }

        var backupPath = PATHS.BACKUP_DIR + selected.name + '/';
        report.push('**选定备份**: `' + selected.name + '`');
        report.push('**备份时间**: ' + _formatDate(selected.lastModified));
        report.push('');

        _progress('⏪ 回滚至: ' + selected.name + '...');
        var startMs = Date.now();

        await _syncReplaceDir(backupPath, PATHS.SOURCE_DIR);
        var verifyResult = await _verifyUpgradeResult();
        var elapsed = Date.now() - startMs;

        report.push('### ✅ 回滚成功\n');
        report.push('| 项目 | 详情 |');
        report.push('| :--- | :--- |');
        report.push('| 备份 | `' + selected.name + '` |');
        report.push('| 文件数 | ' + verifyResult.fileCount + ' 个 |');
        report.push('| 大小 | ' + verifyResult.dirSize + ' |');
        report.push('| 耗时 | ' + _formatDuration(elapsed) + ' |');

        return {
            success: true,
            message: '已回滚至: ' + selected.name,
            data: report.join('\n'),
            meta: { backup_name: selected.name, fileCount: verifyResult.fileCount, elapsed_ms: elapsed }
        };
    }

    async function _cleanBackupsCore(params) {
        var keep = _safeNumber((params || {}).keep, 0, 0, 100);
        var report = [];
        report.push('## 🧹 备份清理\n');

        if (!(await _dirExists(PATHS.BACKUP_DIR))) {
            report.push('> 备份目录不存在');
            return { success: true, message: '无需清理', data: report.join('\n') };
        }

        var entries = await _listDir(PATHS.BACKUP_DIR);
        var backups = entries
            .filter(function (e) { return e.isDirectory && e.name.indexOf('operit_backup_') === 0; })
            .sort(function (a, b) { return (b.name > a.name) ? 1 : ((b.name < a.name) ? -1 : 0); });

        if (backups.length === 0) {
            report.push('> 无备份记录');
            return { success: true, message: '无需清理', data: report.join('\n') };
        }

        var toKeep = backups.slice(0, keep);
        var toDelete = backups.slice(keep);

        if (toDelete.length === 0) {
            report.push('> ' + backups.length + ' 个备份均在保留范围 (keep=' + keep + ')');
            return { success: true, message: '无需清理', data: report.join('\n') };
        }

        var deletedCount = 0;
        var failedNames = [];
        for (var i = 0; i < toDelete.length; i++) {
            if (await _deleteRecursive(PATHS.BACKUP_DIR + toDelete[i].name)) {
                deletedCount++;
            } else {
                failedNames.push(toDelete[i].name);
            }
        }

        report.push('| 操作 | 数量 |');
        report.push('| :--- | :--- |');
        report.push('| 清理前 | ' + backups.length + ' 个 |');
        report.push('| 已删除 | ' + deletedCount + ' 个 |');
        report.push('| 保留 | ' + toKeep.length + ' 个 |');
        if (failedNames.length > 0) report.push('| 失败 | ' + failedNames.join(', ') + ' |');

        return {
            success: failedNames.length === 0,
            message: '已清理 ' + deletedCount + ' 个备份',
            data: report.join('\n'),
            meta: { deleted: deletedCount, kept: toKeep.length, failed: failedNames }
        };
    }

    async function _probeProxyCore(params) {
        var autoSet = _safeBool((params || {}).auto_set, false);
        var report = [];
        report.push('## 🌐 GitHub 代理探测\n');
        report.push('> 测试时间: ' + new Date().toLocaleString('zh-CN', { hour12: false }) + '\n');

        _progress('🔍 正在并发探测 ' + (PROXY_LIST.length + 1) + ' 个节点...');
        var results = await _probeProxiesInternal();

        report.push('| # | 节点 | 状态 | 延迟 | 备注 |');
        report.push('| :---: | :--- | :---: | ---: | :--- |');

        results.forEach(function (r, idx) {
            var name = r.proxy || '直连 (api.github.com)';
            var status = r.ok ? '✅' : '❌';
            var latency = r.ok ? r.latency + ' ms' : '-';
            var note = r.error || (r.ok ? (idx === 0 ? '⭐ 最快' : '') : '');
            report.push('| ' + (idx + 1) + ' | ' + name + ' | ' + status + ' | ' + latency + ' | ' + note + ' |');
        });
        report.push('');

        var bestOk = results.find(function (r) { return r.ok; });
        if (bestOk) {
            var bestName = bestOk.proxy || '直连';
            report.push('> ⭐ **推荐**: ' + bestName + ' (延迟 ' + bestOk.latency + ' ms)');
            if (autoSet && bestOk.proxy) {
                report.push('> ✅ 已自动选定为当前代理');
                _cachedProxyResult = bestOk.proxy;
            }
        } else {
            report.push('> ⚠️ 所有节点均不可达，请检查网络连接');
        }

        report.push('');
        report.push('> 💡 配置方法: 在环境变量 `OPERIT_GITHUB_PROXY` 中填入推荐的代理地址');
        report.push('> 或设为 `auto` 让工具自动选择最快节点');

        return {
            success: !!bestOk,
            message: bestOk ? '探测完成，推荐: ' + (bestOk.proxy || '直连') : '所有节点不可达',
            data: report.join('\n'),
            meta: {
                results: results.map(function (r) {
                    return { proxy: r.proxy || 'direct', ok: r.ok, latency: r.latency, error: r.error };
                }),
                best: bestOk ? (bestOk.proxy || 'direct') : null
            }
        };
    }

    async function _testCore(params) {
        var report = [];
        report.push('## 🔧 Operit 升级工具诊断\n');
        report.push('> 测试时间: ' + new Date().toLocaleString('zh-CN', { hour12: false }) + '\n');

        await _initSessionPool();

        var proxy = _getProxyUrl();
        var isAuto = _isAutoProxy();
        report.push('### 配置\n');
        report.push('| 项目 | 状态 | 值 |');
        report.push('| :--- | :---: | :--- |');
        report.push('| 代理 | ' + (proxy ? '✅' : isAuto ? '🔄 自动' : '⚪ 直连') + ' | ' + (proxy || (isAuto ? 'auto' : '无')) + ' |');
        report.push('| 超时 | ⚪ | ' + _getTimeout() + ' ms |');
        report.push('| 备份保留 | ⚪ | ' + _getBackupKeep() + ' 个 |');
        report.push('| 调试 | ' + (_debugEnabled() ? '✅' : '⚪') + ' | - |');
        report.push('| 终端会话 | ✅ | 单会话复用 |');
        report.push('');

        report.push('### 目录\n');
        report.push('| 目录 | 状态 | 路径 |');
        report.push('| :--- | :---: | :--- |');
        var srcExists = await _dirExists(PATHS.SOURCE_DIR);
        report.push('| 源码 | ' + (srcExists ? '✅' : '⚪') + ' | `' + PATHS.SOURCE_DIR + '` |');
        var protExists = await _dirExists(PATHS.PROTECTED_DIR);
        report.push('| 工作目录 | ' + (protExists ? '🔒' : '⚪') + ' | `' + PATHS.PROTECTED_DIR + '` |');
        var bkExists = await _dirExists(PATHS.BACKUP_DIR);
        report.push('| 备份 | ' + (bkExists ? '✅' : '⚪') + ' | `' + PATHS.BACKUP_DIR + '` |');
        report.push('');

        var diskSpace = await _getDiskFreeSpace();
        if (diskSpace) {
            report.push('### 磁盘\n');
            report.push('| 项目 | 值 |');
            report.push('| :--- | :--- |');
            report.push('| 可用 | ' + diskSpace.available + ' |');
            report.push('| 已用 | ' + diskSpace.used + ' |');
            report.push('| 总量 | ' + diskSpace.total + ' |');
            report.push('');
        }

        report.push('### 解压工具\n');
        var unzipTools = await _detectUnzipTool();
        report.push('| 工具 | 状态 |');
        report.push('| :--- | :---: |');
        var toolNames = ['unzip', 'busybox-unzip', 'python3-zipfile', '7z'];
        toolNames.forEach(function (name) {
            var found = unzipTools.some(function (t) { return t.name === name; });
            report.push('| ' + name + ' | ' + (found ? '✅' : '❌') + ' |');
        });
        if (unzipTools.length === 0) {
            report.push('');
            report.push('> ⚠️ 未检测到可用的解压工具！');
        }
        report.push('');

        if (srcExists) {
            var localVersion = await _readLocalVersion();
            if (localVersion) {
                report.push('### 本地版本\n');
                report.push('| 项目 | 值 |');
                report.push('| :--- | :--- |');
                report.push('| SHA | `' + (localVersion.shortSha || '?') + '` |');
                report.push('| 提交 | ' + (localVersion.message || '无') + ' |');
                report.push('| 升级时间 | ' + _formatDate(localVersion.upgraded_at) + ' |');
                report.push('');
            }
        }

        report.push('### 网络\n');
        var testUrls = [];
        if (proxy) {
            testUrls.push({ name: 'GitHub (代理)', url: proxy + '/https://api.github.com/repos/' + GITHUB.OWNER + '/' + GITHUB.REPO });
        }
        testUrls.push({ name: 'GitHub API', url: 'https://api.github.com/repos/' + GITHUB.OWNER + '/' + GITHUB.REPO });

        report.push('| 端点 | 状态 | 延迟 |');
        report.push('| :--- | :---: | ---: |');
        var anyConnected = false;

        for (var i = 0; i < testUrls.length; i++) {
            var t = testUrls[i];
            var st = Date.now();
            try {
                var resp = await _httpGet(t.url, { 'Accept': 'application/vnd.github.v3+json' });
                var lat = Date.now() - st;
                if (resp.isSuccessful()) {
                    report.push('| ' + t.name + ' | ✅ ' + resp.statusCode + ' | ' + lat + ' ms |');
                    anyConnected = true;
                } else {
                    report.push('| ' + t.name + ' | ⚠️ ' + resp.statusCode + ' | ' + lat + ' ms |');
                }
            } catch (netErr) {
                report.push('| ' + t.name + ' | ❌ | ' + (Date.now() - st) + ' ms |');
            }
        }
        report.push('');

        if (!anyConnected) {
            report.push('> ⚠️ GitHub 不可达。请配置 `OPERIT_GITHUB_PROXY` 或设为 `auto`。');
            report.push('> 推荐代理: ' + PROXY_LIST.slice(0, 3).join(' / '));
        }

        report.push('### 安全\n');
        report.push('| 检查 | 结果 |');
        report.push('| :--- | :---: |');
        report.push('| 源码路径安全 | ' + (_pathIsSafe(PATHS.SOURCE_DIR) ? '✅' : '❌') + ' |');
        report.push('| 工作目录保护 | ✅ |');

        var lockExists = await _fileExists(PATHS.TEMP_DIR + PATHS.LOCK_FILE);
        if (lockExists) {
            report.push('| 升级锁 | ⚠️ 存在（可能有未完成的升级） |');
        } else {
            report.push('| 升级锁 | ✅ 无 |');
        }
        report.push('');

        report.push('---');
        report.push('*operit_upgrade v1.0 诊断引擎*');

        return {
            success: anyConnected,
            message: anyConnected ? '诊断通过' : '网络不可达',
            data: report.join('\n'),
            meta: {
                network_ok: anyConnected,
                proxy: proxy || (isAuto ? 'auto' : null),
                unzip_tools: unzipTools.map(function (t) { return t.name; }),
                session_mode: 'single_reuse',
                lock_exists: lockExists
            }
        };
    }

    async function _integrityCheck(dirPath) {
        var checks = { passed: 0, failed: 0, warnings: 0, details: [] };
        var expectedMarkers = ['package.json', 'src', 'build.gradle', 'settings.gradle', 'gradlew', 'app'];
        for (var i = 0; i < expectedMarkers.length; i++) {
            var markerPath = dirPath + expectedMarkers[i];
            var exists = await _fileExists(markerPath) || await _dirExists(markerPath);
            if (exists) {
                checks.passed++;
                checks.details.push({ item: expectedMarkers[i], status: 'ok' });
            } else {
                checks.warnings++;
                checks.details.push({ item: expectedMarkers[i], status: 'missing' });
            }
        }
        var fileCount = await _countFiles(dirPath);
        if (fileCount >= LIMITS.MIN_VALID_FILES) {
            checks.passed++;
            checks.details.push({ item: 'file_count', status: 'ok', value: fileCount });
        } else {
            checks.failed++;
            checks.details.push({ item: 'file_count', status: 'fail', value: fileCount });
        }
        var topEntries = await _listDir(dirPath);
        if (topEntries.length > 0) {
            checks.passed++;
            checks.details.push({ item: 'top_entries', status: 'ok', value: topEntries.length });
        } else {
            checks.failed++;
            checks.details.push({ item: 'top_entries', status: 'fail', value: 0 });
        }
        var versionFile = await _fileExists(dirPath + PATHS.VERSION_FILE);
        checks.details.push({ item: 'version_file', status: versionFile ? 'ok' : 'missing' });
        if (versionFile) checks.passed++; else checks.warnings++;
        checks.healthy = checks.failed === 0;
        return checks;
    }

    async function _calculateDirChecksum(dirPath) {
        try {
            var r = await _exec(
                'find \'' + _escapeShell(dirPath) + '\' -type f \\( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.gradle" -o -name "*.kt" \\) | ' +
                'sort | head -50 | xargs md5sum 2>/dev/null | md5sum | cut -d\\  -f1',
                30000, 'chksum'
            );
            if (r && r.output && r.exitCode === 0) {
                var hash = r.output.trim();
                if (/^[a-f0-9]{32}$/.test(hash)) return hash;
            }
        } catch (e) {}
        return null;
    }

    async function _smartDownloadWithFallback(remoteInfo, proxyUrl) {
        var strategies = [];
        var directUrl = GITHUB.RAW_DOWNLOAD + '/' + GITHUB.OWNER + '/' + GITHUB.REPO + '/archive/refs/heads/' + GITHUB.BRANCH + '.zip';
        // 代理优先（国内网络的核心路径）
        if (proxyUrl) {
            strategies.push({ name: '代理下载', url: proxyUrl + '/' + directUrl });
        }
        // 备用代理列表（排除已选代理，避免重复）
        for (var pi = 0; pi < PROXY_LIST.length; pi++) {
            var p = PROXY_LIST[pi];
            if (p !== proxyUrl) {
                strategies.push({ name: '备用 ' + p.replace('https://', '').split('.')[0], url: p + '/' + directUrl });
            }
        }
        // 直连放最后（国内大概率不通，避免浪费时间）
        strategies.push({ name: '直连下载', url: directUrl });
        var zipPath = PATHS.TEMP_DIR + 'source_' + remoteInfo.shortSha + '.zip';
        for (var si = 0; si < strategies.length; si++) {
            var s = strategies[si];
            _progress('⬇️ [' + (si + 1) + '/' + strategies.length + '] ' + s.name + '...');
            try {
                if (await _fileExists(zipPath)) await _deleteRecursive(zipPath);
                await _downloadZip(s.url, zipPath);
                var fileSize = await _getFileSize(zipPath);
                if (fileSize > LIMITS.MIN_ZIP_SIZE) {
                    _log('下载成功: ' + s.name + ' (' + _formatBytes(fileSize) + ')');
                    return { path: zipPath, strategy: s.name, url: s.url };
                }
                _warn(s.name + ' 文件过小: ' + fileSize);
                await _deleteRecursive(zipPath);
            } catch (e) {
                _warn(s.name + ' 失败: ' + e.message.substring(0, 80));
                if (await _fileExists(zipPath)) await _deleteRecursive(zipPath);
            }
        }
        throw new Error('所有下载策略均失败。请检查网络或用 probe_proxy 探测可用代理。');
    }

    async function _parallelCleanAndPrepare(paths) {
        var tasks = paths.map(function (p) {
            return _ensureDir(p).catch(function (e) {
                _warn('目录准备失败: ' + p + ' - ' + e.message);
            });
        });
        await Promise.all(tasks);
    }

    async function _getBackupsSorted() {
        if (!(await _dirExists(PATHS.BACKUP_DIR))) return [];
        var entries = await _listDir(PATHS.BACKUP_DIR);
        return entries
            .filter(function (e) { return e.isDirectory && e.name.indexOf('operit_backup_') === 0; })
            .sort(function (a, b) { return (b.name > a.name) ? 1 : ((b.name < a.name) ? -1 : 0); });
    }

    async function _getBackupSize(backupName) {
        var path = PATHS.BACKUP_DIR + backupName + '/';
        return await _getLocalDirSize(path);
    }

    async function _compressBackup(backupPath, archivePath) {
        var escapedSrc = _escapeShell(backupPath);
        var escapedDst = _escapeShell(archivePath);
        var r = await _execSafe(
            'tar -czf \'' + escapedDst + '\' -C \'' + escapedSrc + '\' . 2>&1',
            120000, 'compress'
        );
        if (r && r.exitCode === 0) return true;
        var r2 = await _execSafe(
            'cd \'' + escapedSrc + '\' && zip -rq \'' + escapedDst + '\' . 2>&1',
            120000, 'zipbk'
        );
        return r2 && r2.exitCode === 0;
    }

    async function _decompressBackup(archivePath, destPath) {
        var escapedSrc = _escapeShell(archivePath);
        var escapedDst = _escapeShell(destPath);
        await _ensureDir(destPath);
        if (archivePath.endsWith('.tar.gz') || archivePath.endsWith('.tgz')) {
            var r = await _execSafe('tar -xzf \'' + escapedSrc + '\' -C \'' + escapedDst + '\' 2>&1', 120000, 'decomp');
            return r && r.exitCode === 0;
        }
        if (archivePath.endsWith('.zip')) {
            var r2 = await _execSafe('unzip -oq \'' + escapedSrc + '\' -d \'' + escapedDst + '\' 2>&1', 120000, 'decompz');
            return r2 && r2.exitCode === 0;
        }
        return false;
    }

    async function _estimateDownloadSize(proxyUrl) {
        try {
            var url = _buildApiUrlProxied('', proxyUrl);
            var response = await _httpGetWithRetry(url, { 'Accept': 'application/vnd.github.v3+json' }, 1);
            var data = _robustJsonParse(response.content);
            if (data && data.size) return data.size * 1024;
        } catch (e) {}
        return 0;
    }

    function _generateUpgradeSummaryText(meta) {
        var lines = [];
        lines.push('升级摘要:');
        lines.push('  版本: ' + (meta.shortSha || '?'));
        lines.push('  文件: ' + (meta.fileCount || '?') + ' 个');
        lines.push('  大小: ' + (meta.dirSize || '?'));
        lines.push('  耗时: ' + _formatDuration(meta.elapsed_ms || 0));
        if (meta.dl_ms) lines.push('  下载: ' + _formatDuration(meta.dl_ms));
        if (meta.extract_ms) lines.push('  解压: ' + _formatDuration(meta.extract_ms));
        if (meta.replace_ms) lines.push('  替换: ' + _formatDuration(meta.replace_ms));
        if (meta.method) lines.push('  方式: ' + meta.method);
        if (meta.unzip_tool) lines.push('  解压器: ' + meta.unzip_tool);
        return lines.join('\n');
    }

    function _buildProgressBar(current, total, width) {
        if (total <= 0) return '[' + '?'.repeat(width) + ']';
        var ratio = Math.min(current / total, 1);
        var filled = Math.round(ratio * width);
        var empty = width - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + '] ' + Math.round(ratio * 100) + '%';
    }

    async function _preflight(requireNetwork) {
        var issues = [];
        if (!_pathIsSafe(PATHS.SOURCE_DIR)) {
            issues.push('安全检查失败: 源码路径指向受保护目录');
        }
        if (requireNetwork) {
            var freeBytes = await _getDiskFreeBytes();
            if (freeBytes > 0 && freeBytes < 100 * 1024 * 1024) {
                issues.push('磁盘可用空间不足: ' + _formatBytes(freeBytes) + ' (需 >100MB)');
            }
        }
        var lockPath = PATHS.TEMP_DIR + PATHS.LOCK_FILE;
        if (await _fileExists(lockPath)) {
            var lockData = await _readJson(lockPath);
            if (lockData && lockData.ts) {
                var lockAge = Date.now() - lockData.ts;
                if (lockAge < 120000) {
                    // 2 分钟内的锁视为活跃，拒绝执行
                    issues.push('检测到升级锁 (运行中 ' + _formatDuration(lockAge) + ')');
                } else {
                    // 超过 2 分钟的锁视为残留，自动清理
                    _warn('清理残留锁文件 (' + _formatDuration(lockAge) + ')');
                    await _deleteRecursive(lockPath);
                }
            } else {
                // 锁文件内容异常，直接清理
                await _deleteRecursive(lockPath);
            }
        }
        return issues;
    }

    async function _cleanStaleLock() {
        var lockPath = PATHS.TEMP_DIR + PATHS.LOCK_FILE;
        if (await _fileExists(lockPath)) {
            var lockData = await _readJson(lockPath);
            if (lockData && lockData.ts && (Date.now() - lockData.ts) > 120000) {
                await _deleteRecursive(lockPath);
                return true;
            }
        }
        return false;
    }

    async function _reportStorageUsage() {
        var usage = {};
        if (await _dirExists(PATHS.SOURCE_DIR)) {
            usage.source = await _getLocalDirSize(PATHS.SOURCE_DIR);
            usage.sourceFiles = await _countFiles(PATHS.SOURCE_DIR);
        }
        if (await _dirExists(PATHS.BACKUP_DIR)) {
            usage.backup = await _getLocalDirSize(PATHS.BACKUP_DIR);
            var backups = await _getBackupsSorted();
            usage.backupCount = backups.length;
        }
        if (await _dirExists(PATHS.TEMP_DIR)) {
            usage.temp = await _getLocalDirSize(PATHS.TEMP_DIR);
        }
        usage.disk = await _getDiskFreeSpace();
        return usage;
    }

    function _renderStorageReport(usage) {
        var lines = [];
        lines.push('### 存储\n');
        lines.push('| 项目 | 大小 | 备注 |');
        lines.push('| :--- | :--- | :--- |');
        if (usage.source) {
            lines.push('| 源码 | ' + usage.source + ' | ' + (usage.sourceFiles || '?') + ' 文件 |');
        }
        if (usage.backup) {
            lines.push('| 备份 | ' + usage.backup + ' | ' + (usage.backupCount || 0) + ' 个 |');
        }
        if (usage.temp) {
            lines.push('| 临时 | ' + usage.temp + ' | 可清理 |');
        }
        if (usage.disk) {
            lines.push('| 可用 | ' + usage.disk.available + ' | - |');
        }
        return lines.join('\n');
    }

    async function _validateZipContents(zipPath) {
        var r = await _execSafe(
            'unzip -l \'' + _escapeShell(zipPath) + '\' 2>/dev/null | tail -1',
            15000, 'ziplist'
        );
        if (r && r.output) {
            var match = r.output.match(/(\d+)\s+files?/i);
            if (match) {
                var count = parseInt(match[1], 10);
                if (!isNaN(count)) return { fileCount: count, valid: count > LIMITS.MIN_VALID_FILES };
            }
        }
        var r2 = await _execSafe(
            'python3 -c "import zipfile;z=zipfile.ZipFile(\'' + _escapeShell(zipPath) + '\');print(len(z.namelist()))" 2>&1',
            15000, 'pyziplist'
        );
        if (r2 && r2.output) {
            var count2 = parseInt(r2.output.trim(), 10);
            if (!isNaN(count2)) return { fileCount: count2, valid: count2 > LIMITS.MIN_VALID_FILES };
        }
        return { fileCount: -1, valid: false };
    }

    async function _preWarmExtract(zipPath, extractDir) {
        await _ensureDir(extractDir);
        var r = await _execSafe(
            'unzip -l \'' + _escapeShell(zipPath) + '\' 2>/dev/null | grep "/$" | head -30 | awk \'{print $NF}\'',
            10000, 'predirs'
        );
        if (r && r.output && r.exitCode === 0) {
            var dirs = r.output.trim().split('\n').filter(function (d) { return d.length > 0 && d.length < 200; });
            if (dirs.length > 0) {
                var mkdirBatch = dirs.map(function (d) {
                    return '\'' + _escapeShell(extractDir + d) + '\'';
                }).join(' ');
                await _execSafe('mkdir -p ' + mkdirBatch + ' 2>/dev/null', 10000, 'premkdir');
            }
        }
    }

    async function _optimizedExtract(zipPath, extractDir) {
        _progress('📦 解压中...');
        var exStart = Date.now();
        await _preWarmExtract(zipPath, extractDir);
        var result = await _unzipFast(zipPath, extractDir);
        var exTime = Date.now() - exStart;
        result.elapsed = exTime;
        _progress('✅ 解压完成 (' + result.tool + ', ' + _formatDuration(exTime) + ')');
        return result;
    }

    async function _postUpgradeVerification(remoteInfo) {
        var notes = [];
        var integrity = await _integrityCheck(PATHS.SOURCE_DIR);
        if (!integrity.healthy) {
            notes.push('> ⚠️ 完整性检查有异常:');
            integrity.details.forEach(function (d) {
                if (d.status !== 'ok') {
                    notes.push('>   - ' + d.item + ': ' + d.status + (d.value !== undefined ? ' (' + d.value + ')' : ''));
                }
            });
        }
        var versionData = await _readLocalVersion();
        if (versionData && versionData.sha !== remoteInfo.sha) {
            notes.push('> ⚠️ 版本记录 SHA 不匹配');
        }
        var fileCount = await _countFiles(PATHS.SOURCE_DIR);
        if (fileCount < 50) {
            notes.push('> ⚠️ 文件数偏少 (' + fileCount + ')');
        }
        return { ok: integrity.healthy && notes.length === 0, notes: notes, integrity: integrity };
    }

    function _buildCompareTable(localVersion, remoteInfo) {
        var lines = [];
        lines.push('| 对比 | 本地 | 远程 |');
        lines.push('| :--- | :--- | :--- |');
        lines.push('| SHA | `' + (localVersion ? localVersion.shortSha : '无') + '` | `' + remoteInfo.shortSha + '` |');
        lines.push('| 提交 | ' + (localVersion ? localVersion.message : '无') + ' | ' + remoteInfo.message + ' |');
        lines.push('| 作者 | ' + (localVersion ? localVersion.author : '无') + ' | ' + remoteInfo.author + ' |');
        lines.push('| 时间 | ' + (localVersion ? _formatDate(localVersion.date) : '无') + ' | ' + _formatDate(remoteInfo.date) + ' |');
        return lines.join('\n');
    }

    async function _cleanOrphanedTemp() {
        if (!(await _dirExists(PATHS.TEMP_DIR))) return 0;
        var entries = await _listDir(PATHS.TEMP_DIR);
        var cleaned = 0;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].name === PATHS.LOCK_FILE) continue;
            if (await _deleteRecursive(PATHS.TEMP_DIR + entries[i].name)) cleaned++;
        }
        return cleaned;
    }

    async function _benchmarkIO() {
        var testDir = PATHS.TEMP_DIR + 'bench_' + Date.now() + '/';
        await _ensureDir(testDir);
        try {
            var writeStart = Date.now();
            var testData = 'benchmark_test_data_' + Date.now();
            for (var j = 0; j < 10; j++) {
                await _execSafe('echo \'' + testData + '\' > \'' + _escapeShell(testDir + 'test_' + j + '.txt') + '\'', 5000, 'bw');
            }
            var writeTime = Date.now() - writeStart;
            var readStart = Date.now();
            for (var k = 0; k < 10; k++) {
                await _execSafe('cat \'' + _escapeShell(testDir + 'test_' + k + '.txt') + '\' > /dev/null', 5000, 'br');
            }
            var readTime = Date.now() - readStart;
            await _deleteRecursive(testDir);
            return { write_10files_ms: writeTime, read_10files_ms: readTime };
        } catch (e) {
            await _deleteRecursive(testDir);
            return null;
        }
    }

    async function _measureNetworkSpeed(url) {
        var startMs = Date.now();
        try {
            var response = await _httpGet(url, { 'Accept': '*/*' });
            var elapsed = Date.now() - startMs;
            var contentLen = response.content ? response.content.length : 0;
            var speedKBs = contentLen > 0 ? Math.round((contentLen / 1024) / (elapsed / 1000)) : 0;
            return { ok: response.isSuccessful(), latency: elapsed, size: contentLen, speed_kbs: speedKBs };
        } catch (e) {
            return { ok: false, latency: Date.now() - startMs, error: e.message.substring(0, 60) };
        }
    }

    async function _getTopLevelStructure(dirPath) {
        var entries = await _listDir(dirPath);
        var dirs = [];
        var files = [];
        entries.forEach(function (e) {
            if (e.isDirectory) dirs.push(e.name);
            else files.push(e.name);
        });
        dirs.sort();
        files.sort();
        return { directories: dirs, files: files, total: entries.length };
    }

    function _renderTopLevelTree(structure) {
        var lines = [];
        structure.directories.forEach(function (d) { lines.push('📁 ' + d + '/'); });
        structure.files.slice(0, 15).forEach(function (f) { lines.push('📄 ' + f); });
        if (structure.files.length > 15) lines.push('... +' + (structure.files.length - 15) + ' 文件');
        return lines.join('\n');
    }

    async function _wrapExecution(fn, params, actionName) {
        try {
            var result = await fn(params || {});
            complete(result);
        } catch (error) {
            _err(actionName + ' 失败: ' + error.message);
            complete({
                success: false,
                message: actionName + ' 失败: ' + error.message,
                error_detail: error.stack ? error.stack.substring(0, 500) : undefined
            });
        }
    }

    return {
        upgrade: function (p) { return _wrapExecution(_upgradeCore, p, '一键升级'); },
        check_update: function (p) { return _wrapExecution(_checkUpdateCore, p, '版本检查'); },
        list_backups: function (p) { return _wrapExecution(_listBackupsCore, p, '备份列表'); },
        rollback: function (p) { return _wrapExecution(_rollbackCore, p, '版本回滚'); },
        clean_backups: function (p) { return _wrapExecution(_cleanBackupsCore, p, '备份清理'); },
        probe_proxy: function (p) { return _wrapExecution(_probeProxyCore, p, '代理探测'); },
        test: function (p) { return _wrapExecution(_testCore, p, '诊断'); }
    };

})();

exports.upgrade = OPERIT_UPGRADE.upgrade;
exports.check_update = OPERIT_UPGRADE.check_update;
exports.list_backups = OPERIT_UPGRADE.list_backups;
exports.rollback = OPERIT_UPGRADE.rollback;
exports.clean_backups = OPERIT_UPGRADE.clean_backups;
exports.probe_proxy = OPERIT_UPGRADE.probe_proxy;
exports.test = OPERIT_UPGRADE.test;
