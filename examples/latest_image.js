/* METADATA
{
    "name": "latest_image",
    "version": "1.0",
    "display_name": {
        "zh": "最新图片获取",
        "en": "Latest Image Fetcher"
    },
    "description": {
        "zh": "最新图片工具包。自动扫描指定缓存目录中最新收到的图片，返回其本地路径及元数据（尺寸、MIME类型、修改时间）。常用于 OCR、图像处理等后续任务。支持通过环境变量自定义默认扫描目录。",
        "en": "Latest Image Toolkit. Scans the specified cache directory for the most recently received image and returns its local path and metadata (size, MIME type, modification time). Useful for OCR and image processing pipelines. Default directory configurable via environment variable."
    },
    "env": [
        {
            "name": "LATEST_IMAGE_DEFAULT_DIR",
            "description": {
                "zh": "默认图片扫描目录（可选）。默认值：/sdcard/Download/Operit/cleanOnExit/",
                "en": "Default image scan directory (optional). Default: /sdcard/Download/Operit/cleanOnExit/"
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "get_latest",
            "description": {
                "zh": "查找并返回指定缓存目录中最新修改的一张图片及其元数据。",
                "en": "Find and return the most recently modified image from the specified directory, along with its metadata."
            },
            "parameters": [
                {
                    "name": "path",
                    "type": "string",
                    "description": {
                        "zh": "可选。自定义扫描目录绝对路径，默认读取环境变量 LATEST_IMAGE_DEFAULT_DIR 或 Operit 缓存目录",
                        "en": "Optional. Absolute path of directory to scan. Defaults to LATEST_IMAGE_DEFAULT_DIR env var or Operit cache directory."
                    },
                    "required": false
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "自检工具。列出默认扫描目录中的图片数量，验证目录配置是否正确。",
                "en": "Self-test. Lists image count in the default scan directory to verify configuration."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * @namespace LATEST_IMAGE_TOOLKIT
 * @description 封装了获取最新图片的逻辑，采用 IIFE 隔离作用域。
 */
const LATEST_IMAGE_TOOLKIT = (function () {
    /**
     * @constant {Object} CONFIG 配置项
     * @property {string} DIR - 默认扫描目录。
     * @property {string[]} ALLOWED_EXTS - 支持的图片扩展名。
     */
    /** 从环境变量读取默认扫描目录 */
    function _getDefaultDir() {
        const envDir = (typeof getEnv === 'function') ? (getEnv('LATEST_IMAGE_DEFAULT_DIR') || '') : '';
        return envDir.trim() || '/sdcard/Download/Operit/cleanOnExit/';
    }

    const CONFIG = {
        get DIR() { return _getDefaultDir(); },
        ALLOWED_EXTS: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
        get DEBUG() { return (typeof getEnv === 'function') ? (getEnv('LATEST_IMAGE_DEBUG') === 'true') : false; }
    };

    /**
     * 调试日志输出
     * @private
     */
    function _debugLog(message) {
        if (CONFIG.DEBUG) {
            console.log('[LatestImage DEBUG] ' + message);
        }
    }

    /**
     * 智能截断文本，在合适的断点处截断
     * @private
     * @param {string} text - 原始文本
     * @param {number} maxLen - 最大字符数
     * @returns {string} 截断后的文本
     */
    function _smartTruncate(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        const truncated = text.substring(0, maxLen);
        const breakPoints = [
            truncated.lastIndexOf("。"),
            truncated.lastIndexOf("？"),
            truncated.lastIndexOf("！"),
            truncated.lastIndexOf("；"),
            truncated.lastIndexOf("，"),
            truncated.lastIndexOf(". "),
            truncated.lastIndexOf(", "),
            truncated.lastIndexOf(" ")
        ];
        const bestBreak = Math.max.apply(null, breakPoints);
        if (bestBreak > maxLen * 0.55) {
            return truncated.substring(0, bestBreak + 1).trim() + "…";
        }
        return truncated.trim() + "…";
    }

    /**
     * 将多种格式的时间属性解析为统一的 Unix 毫秒时间戳。
     * @private
     * @param {string|number} rawValue - 原始时间值。
     * @returns {number}
     */
    function _toUnixTimestamp(rawValue) {
        if (!rawValue) return 0;
        const numeric = Number(rawValue);
        if (!isNaN(numeric)) return numeric;
        const parsed = Date.parse(rawValue);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * 统一错误处理包装器
     * @private
     * @param {Function} coreFunc - 核心逻辑函数
     * @param {Object} params - 参数
     * @param {string} actionName - 操作名称
     */
    async function _wrapExecution(coreFunc, params, actionName) {
        try {
            const result = await coreFunc(params);
            return complete({ success: true, message: actionName + " 完成", data: result });
        } catch (error) {
            console.error("[LatestImage] " + actionName + " 失败: " + error.message);
            return complete({ success: false, error: actionName + " 失败: " + error.message });
        }
    }

    /**
     * 获取最新图片的核心逻辑
     * @private
     * @param {Object} params - 工具调用参数
     */
    async function _getLatestCore(params = {}) {
        // 参数校验
        if (params.path !== undefined && typeof params.path !== 'string') {
            throw new Error('参数 path 必须是字符串类型');
        }
        if (params.path && params.path.trim() === '') {
            throw new Error('参数 path 不能为空字符串');
        }
        
        const targetDir = params.path || CONFIG.DIR;
        _debugLog('扫描目录: ' + targetDir);
        
        // 1. 获取目录下的文件列表
        const result = await Tools.Files.list(targetDir, "android");

        // 2. 检查返回结果
        if (!result || !Array.isArray(result.entries)) {
            throw new Error(`目录读取失败或路径不存在: ${targetDir}`);
        }

        // 3. 过滤与排序
        const images = result.entries
            .filter(item => {
                if (item.isDirectory) return false;
                const fileNameLower = item.name.toLowerCase();
                return CONFIG.ALLOWED_EXTS.some(ext => fileNameLower.endsWith(ext));
            })
            .sort((a, b) => {
                return _toUnixTimestamp(b.lastModified) - _toUnixTimestamp(a.lastModified);
            });

        // 4. 处理结果
        _debugLog('找到 ' + images.length + ' 张图片');
        if (images.length > 0) {
            const target = images[0];
            const baseDir = targetDir.endsWith('/') ? targetDir : targetDir + '/';
            const fullPath = baseDir + target.name;
            
            // 优化 MIME 推断逻辑
            const ext = target.name.split('.').pop().toLowerCase();
            const mimeMap = { 'jpg': 'jpeg', 'jpeg': 'jpeg', 'png': 'png', 'webp': 'webp', 'gif': 'gif', 'bmp': 'bmp' };
            const mimeType = `image/${mimeMap[ext] || ext}`;

            return {
                name: target.name,
                path: fullPath,
                mimeType: mimeType,
                size: target.size,
                lastModified: target.lastModified,
                lastModifiedTs: _toUnixTimestamp(target.lastModified)
            };
        } else {
            return null;
        }
    }

    /**
     * 获取最新图片的主函数（带统一错误处理）
     * @param {Object} params - 工具调用参数
     */
    async function getLatest(params = {}) {
        return _wrapExecution(_getLatestCore, params, "获取最新图片");
    }

    /**
     * 自检工具核心逻辑
     * @private
     */
    async function _testScanCore() {
        const dir = CONFIG.DIR;
        const result = await Tools.Files.list(dir, "android");
        
        if (!result || !Array.isArray(result.entries)) {
            throw new Error(`目录不可访问或不存在: ${dir}`);
        }
        
        const images = result.entries.filter(item => {
            if (item.isDirectory) return false;
            return CONFIG.ALLOWED_EXTS.some(ext => item.name.toLowerCase().endsWith(ext));
        });
        
        return {
            directory: dir,
            total_files: result.entries.length,
            image_count: images.length,
            latest: images.length > 0 ? images.sort((a, b) => _toUnixTimestamp(b.lastModified) - _toUnixTimestamp(a.lastModified))[0].name : null,
            message: `✅ 目录正常 | 共找到 ${images.length} 张图片`
        };
    }

    /**
     * 自检工具（带统一错误处理）
     */
    async function testScan() {
        return _wrapExecution(_testScanCore, {}, "自检扫描");
    }

    // 暴露接口
    return {
        get_latest: getLatest,
        test: testScan
    };
})();

// 导出 CommonJS 模块
exports.get_latest = LATEST_IMAGE_TOOLKIT.get_latest;
exports.test       = LATEST_IMAGE_TOOLKIT.test;
