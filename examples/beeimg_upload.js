/* METADATA
{
    "name": "beeimg_upload",
    "version": "1.0",
    "display_name": {
        "zh": "BeeIMG 图床上传",
        "en": "BeeIMG Image Upload"
    },
    "description": {
        "zh": "BeeIMG图床工具包。提供将本地图片上传至 BeeIMG (https://beeimg.com/) 的功能，支持公网 URL 返回，适用于图生图及内容分享场景。",
        "en": "BeeIMG Image Upload. Uploads local images to BeeIMG and returns public URLs. Ideal for image-to-image workflows and content sharing."
    },
    "env": [
        {
            "name": "BEEIMG_API_KEY",
            "description": {
                "zh": "BeeIMG API 密钥。获取地址：https://beeimg.com/user/api",
                "en": "BeeIMG API Key. Get yours at: https://beeimg.com/user/api"
            },
            "required": true
        },
        {
            "name": "BEEIMG_PROXY_URL",
            "description": {
                "zh": "自定义反向代理域名（可选），用于替换默认的 beeimg.com API 地址。格式：https://your-proxy.example.com 或 your-proxy.example.com（自动补全协议）",
                "en": "Custom reverse proxy URL (optional). Replaces the default beeimg.com endpoint. Format: https://your-proxy.example.com or your-proxy.example.com (auto-prefixes https://)."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "upload_image",
            "description": {
                "zh": "上传本地图片到 BeeIMG 图床。支持自定义相册和隐私设置，返回图片的公网链接、缩略图及查看页面。",
                "en": "Upload a local image to BeeIMG via multipart upload and return the image URL."
            },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "待上传图片的本地绝对路径 (如 /sdcard/DCIM/Camera/IMG.jpg)",
                        "en": "Absolute path of the image file to upload."
                    }
                },
                {
                    "name": "album_id",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "相册 ID (可选)",
                        "en": "Album ID (optional)."
                    }
                },
                {
                    "name": "privacy",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "隐私设置：public (公开) 或 private (私密)",
                        "en": "Privacy setting: 'public' or 'private' (optional)."
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 BeeIMG API 连通性。验证 API Key 有效性、网络可达性及服务响应延迟，返回诊断报告。适用于首次配置后的连通性验证与故障排查。",
                "en": "Test BeeIMG API connectivity."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：BeeIMG 图床工具包 (BeeIMG Upload)
 * ------------------------------------------------------------------------------
 * 功能详述：
 * 1. 核心协议：基于 BeeIMG 标准 JSON API 实现 multipart/form-data 文件上传。
 * 2. 智能预检：内置本地文件存在性校验及自动 MIME 类型推断机制。
 * 3. 容错解析：具备鲁棒的 JSON 响应拦截与解析能力，处理非标准响应。
 * 4. 结果展示：自动生成 Markdown 预览，方便在对话中直接查看上传结果。
 * * 版本：v1.0
 * 驱动：基于 Tools.Net.uploadFile 与 Tools.Files 核心组件
 * ==============================================================================
 */
const beeimg_uploaded_impl = (function () {

    // --------------------------------------------------------------------------
    // 1. 配置常量与初始化
    // --------------------------------------------------------------------------

    const CONFIG = {
        API_ENDPOINT: "https://beeimg.com/api/upload/file/json/",
        DEFAULT_UA: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        TIMEOUT_SEC: 60
    };

    /**
     * 解析 API 端点地址
     * 优先使用反向代理地址（BEEIMG_PROXY_URL），否则使用默认官方地址
     * @returns {string} 完整的 API 上传端点 URL
     */
    function resolveApiEndpoint() {
        const proxyUrl = getEnv("BEEIMG_PROXY_URL");
        if (proxyUrl && proxyUrl.trim()) {
            let base = proxyUrl.trim().replace(/\/+$/, '');
            if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
            return base + "/api/upload/file/json/";
        }
        return CONFIG.API_ENDPOINT;
    }

    /**
     * 获取 API 密钥
     * @returns {string} 密钥字符串
     */
    function getApiKey() {
        const key = getEnv("BEEIMG_API_KEY");
        if (!key || key.trim() === "") {
            throw new Error("环境变量 BEEIMG_API_KEY 未配置，请先设置 API Key。");
        }
        return key.trim();
    }

    // --------------------------------------------------------------------------
    // 2. 内部工具函数
    // --------------------------------------------------------------------------

    /**
     * 根据后缀名推断 MIME 类型
     * @param {string} filePath 文件路径
     * @returns {string} MIME 字符串
     */
    function guessMimeType(filePath) {
        const lower = filePath.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return "application/octet-stream";
    }

    /**
     * 鲁棒的 JSON 解析
     * 处理响应中可能存在的非标准字符或 HTML 包裹
     * @param {string} text 原始响应文本
     * @returns {Object} 解析后的对象
     */
    function robustJsonParse(text) {
        const trimmed = (text || "").trim();
        if (!trimmed) throw new Error("服务器返回内容为空");

        try {
            return JSON.parse(trimmed);
        } catch (e) {
            // 尝试提取 JSON 结构块
            const start = trimmed.indexOf("{");
            const end = trimmed.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
                return JSON.parse(trimmed.substring(start, end + 1));
            }
            throw new Error(`无法解析 API 响应: ${trimmed.substring(0, 100)}`);
        }
    }

    // --------------------------------------------------------------------------
    // 3. 核心业务逻辑
    // --------------------------------------------------------------------------

    /**
     * 格式化测试报告
     */
    function formatTestReport(result) {
        let report = '## BeeIMG API 连通性测试\n\n';
        report += '| 项目 | 状态 |\n';
        report += '| :--- | :--- |\n';
        report += `| API 连通性 | ${result.connected ? '✅ 正常' : '❌ 失败'} |\n`;
        report += `| 响应延迟 | ${result.latency} ms |\n`;
        report += `| API 地址 | ${result.apiUrl} |\n`;
        report += `| 密钥状态 | ${result.keyPreview} |\n`;
        if (result.error) {
            report += `| 错误信息 | ${result.error} |\n`;
        }
        return report;
    }

    return {
        /**
         * 功能：执行图片上传
         * 流程：路径清洗 -> 存在性校验 -> 环境校验 -> 构造表单 -> 发起请求 -> 解析回执
         */
        uploadImage: async (params) => {
            try {
                // 1. 参数校验与路径预处理
                let filePath = (params.file_path || "").trim();
                if (!filePath) throw new Error("参数 file_path 不能为空");

                // 兼容 file:// 协议头
                if (filePath.startsWith("file://")) {
                    filePath = filePath.substring(7);
                }

                // 2. 检查本地文件是否存在
                const existsInfo = await Tools.Files.exists(filePath);
                if (!existsInfo.exists) {
                    throw new Error(`找不到本地文件: ${filePath}。请确保路径正确且应用具备访问权限。`);
                }

                // 3. 准备上传参数
                const apiKey = getApiKey();
                const formData = {
                    apikey: apiKey
                };
                if (params.album_id) formData.albumid = String(params.album_id);
                if (params.privacy)  formData.privacy = String(params.privacy);

                // 4. 执行网络请求 (Multipart)
                const resp = await Tools.Net.uploadFile({
                    url: resolveApiEndpoint(),
                    method: "POST",
                    headers: {
                        "User-Agent": CONFIG.DEFAULT_UA,
                        "Accept": "application/json"
                    },
                    form_data: formData,
                    files: [
                        {
                            field_name: "file",
                            file_path: filePath,
                            content_type: guessMimeType(filePath)
                        }
                    ]
                });

                // 5. 响应处理与状态码拦截
                if (resp.statusCode < 200 || resp.statusCode >= 300) {
                    throw new Error(`HTTP 异常 [${resp.statusCode}]: ${resp.content || "未知服务异常"}`);
                }

                const json = robustJsonParse(resp.content);
                const fileInfo = json.files;

                if (!fileInfo) {
                    throw new Error("API 响应结构异常: 缺失 files 字段");
                }

                // 6. 业务状态校验 (BeeIMG 返回 200 或 Success 表示成功)
                const isSuccess = fileInfo.status === "Success" || String(fileInfo.code) === "200";
                
                if (isSuccess && fileInfo.url) {
                    const result = {
                        url: String(fileInfo.url),
                        thumbnail: fileInfo.thumbnail_url ? String(fileInfo.thumbnail_url) : null,
                        view_page: fileInfo.view_url ? String(fileInfo.view_url) : null
                    };

                    // 构造 Markdown 预览反馈
                    let markdown = `### [BeeIMG] 图片上传成功\n` +
                        `---\n` +
                        `* **原始链接**: ${result.url}\n` +
                        `* **查看页面**: ${result.view_page || "N/A"}\n\n` +
                        `![上传预览](${result.url})`;

                    complete({ 
                        success: true, 
                        message: "图片已成功托管至 BeeIMG", 
                        data: markdown 
                    });
                } else {
                    const errorMsg = fileInfo.message || fileInfo.status || JSON.stringify(fileInfo);
                    throw new Error(`BeeIMG 业务错误: ${errorMsg}`);
                }

            } catch (err) {
                complete({ 
                    success: false, 
                    message: `上传任务终止: ${err.message}` 
                });
            }
        },

        /**
         * 功能：API 连通性测试
         * 验证环境变量配置与网络可达性
         */
        test: async () => {
            const startTime = Date.now();
            const apiKey = getEnv("BEEIMG_API_KEY");
            const targetUrl = resolveApiEndpoint();

            if (!apiKey || apiKey.trim() === "") {
                return complete({
                    success: false,
                    message: '环境变量未配置',
                    data: formatTestReport({
                        connected: false,
                        latency: 0,
                        apiUrl: targetUrl,
                        keyPreview: '未配置',
                        error: '请在 Operit 设置 → 环境变量中添加 BEEIMG_API_KEY'
                    })
                });
            }

            // 向 BeeIMG 主站发起轻量 GET 请求验证网络连通性（无需上传文件）
            try {
                const client = OkHttp.newClient();
                const pingUrl = "https://beeimg.com/";
                const response = await client.newRequest()
                    .url(pingUrl)
                    .method("GET")
                    .header("User-Agent", CONFIG.DEFAULT_UA)
                    .build()
                    .execute();
                const latency = Date.now() - startTime;
                const connected = response.statusCode > 0;

                complete({
                    success: connected,
                    message: connected ? `网络连通正常，响应延迟 ${latency} ms` : '网络请求未获有效响应',
                    data: formatTestReport({
                        connected: connected,
                        latency: latency,
                        apiUrl: targetUrl,
                        keyPreview: '已配置',
                        error: connected ? null : `HTTP ${response.statusCode}`
                    }) + '\n\n> ⚠️ BeeIMG 无独立 Key 验证端点，需上传文件才能完整验证密钥有效性。'
                });
            } catch (netErr) {
                const latency = Date.now() - startTime;
                complete({
                    success: false,
                    message: `网络连通性测试失败: ${netErr.message}`,
                    data: formatTestReport({
                        connected: false,
                        latency: latency,
                        apiUrl: targetUrl,
                        keyPreview: '已配置',
                        error: `网络错误: ${netErr.message}`
                    })
                });
            }
        }
    };
})();

// --------------------------------------------------------------------------
// 4. 模块导出映射
// --------------------------------------------------------------------------

exports.upload_image = beeimg_uploaded_impl.uploadImage;
exports.test = beeimg_uploaded_impl.test;