/* METADATA
{
    "name": "cloudinary_upload",
    "version": "1.0",
    "display_name": {
        "zh": "Cloudinary 图床上传",
        "en": "Cloudinary Image Upload"
    },
    "description": {
        "zh": "Cloudinary图床工具包。支持本地路径自动转换、文件名脱敏清洗及 Android 路径归一化。",
        "en": "Cloudinary Upload Toolkit. Supports local path conversion, filename sanitization, and Android path normalization."
    },
    "env": [
        {
            "name": "CLOUDINARY_CLOUD_NAME",
            "description": {
                "zh": "Cloudinary Cloud Name，在 Cloudinary 控制台首页可找到",
                "en": "Cloudinary Cloud Name, found on the Cloudinary dashboard."
            },
            "required": true
        },
        {
            "name": "CLOUDINARY_UPLOAD_PRESET",
            "description": {
                "zh": "Cloudinary Upload Preset（上传预设），需在控制台 Settings → Upload 中创建 unsigned preset",
                "en": "Cloudinary Upload Preset. Create an unsigned preset in Settings → Upload on the dashboard."
            },
            "required": true
        },
        {
            "name": "CLOUDINARY_API_KEY",
            "description": {
                "zh": "Cloudinary API Key（仅删除操作需要），在控制台 API Keys 页面获取",
                "en": "Cloudinary API Key (required for deletion only). Get it from the API Keys page."
            },
            "required": false
        },
        {
            "name": "CLOUDINARY_API_SECRET",
            "description": {
                "zh": "Cloudinary API Secret（仅删除操作需要），配合 API Key 使用",
                "en": "Cloudinary API Secret (required for deletion only). Used together with API Key."
            },
            "required": false
        },
        {
            "name": "CLOUDINARY_PROXY_URL",
            "description": {
                "zh": "自定义反向代理地址（可选），用于替换默认的 api.cloudinary.com。在国内网络环境下强烈建议配置。格式：https://your-proxy.example.com",
                "en": "Custom reverse proxy URL (optional). Replaces api.cloudinary.com. Strongly recommended for users in China. Format: https://your-proxy.example.com"
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "upload_image",
            "description": { "zh": "上传本地图片并返回公网 URL。[隐私红线：严禁 AI 自行猜测或使用历史路径上传图片，必须由用户明确提供本次任务的路径。上传后必须预定 10 分钟自动销毁]", "en": "Upload local image [Privacy Redline: AI is strictly forbidden from using guessed or historical paths. Path must be explicitly provided by the user. Auto-delete in 10m required.]" },
            "parameters": [
                {
                    "name": "file_path",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "本地文件路径", "en": "Local file path" }
                }
            ]
        },
{
            "name": "delete_image",
            "description": { "zh": "通过 public_id 删除图片。", "en": "Delete image by public_id" },
            "parameters": [
                {
                    "name": "public_id",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "图片的 public_id", "en": "Image public_id" }
                }
            ]
        },
        {
            "name": "test",
            "description": { "zh": "测试 Cloudinary API 连通性。验证环境变量配置及网络可达性。", "en": "Test Cloudinary API connectivity." },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称: Cloudinary Upload Toolkit
 * ----------------------------------------------------------------------------
 * 功能：
 * 1. 自动处理 Android 内部存储路径兼容性。
 * 2. 对文件名进行安全清洗，防止因特殊字符导致的上传失败。
 * 3. 采用 Base64 流式上传，无需关心本地文件权限。
 * ============================================================================
 */
const cloudinary_upload = (function () {

    const client = OkHttp.newClient();

    /**
     * 获取并校验环境变量
     */
    function getEnvVar(key) {
        const val = getEnv(key);
        return (val && val.trim().length > 0) ? val.trim() : null;
    }

    /**
     * 核心：读取文件并转换为 Data URI
     */
    async function getFileDataUri(rawPath) {
        let path = rawPath.trim();
        
        // 修正 Android 常见的路径表示形式
        if (path.startsWith("file://")) path = path.substring(7);
        if (path.startsWith("/storage/emulated/0/")) path = "/sdcard/" + path.substring(20);

        const check = await Tools.Files.exists(path);
        const exists = (typeof check === 'object') ? check.exists : check;
        if (!exists) throw new Error(`找不到文件: ${path}`);

        const result = await Tools.Files.readBinary(path);
        let base64 = (typeof result === 'string') ? result : (result?.contentBase64 || "");
        
        if (!base64) throw new Error("文件读取为空，请检查权限。");

        // 自动补齐 MIME 类型
        if (!base64.startsWith("data:image")) {
            let mime = "jpeg";
            const lowPath = path.toLowerCase();
            if (lowPath.endsWith(".png")) mime = "png";
            else if (lowPath.endsWith(".gif")) mime = "gif";
            else if (lowPath.endsWith(".webp")) mime = "webp";
            return `data:image/${mime};base64,${base64}`;
        }
        return base64;
    }

    /**
     * 文件名清洗：仅保留字母数字，并追加随机时间戳
     */
    function getCleanFileName(path) {
        const parts = path.split(/[/\\]/);
        const fullName = parts[parts.length - 1];
        const nameParts = fullName.split('.');
        if (nameParts.length > 1) nameParts.pop();

        const clean = nameParts.join('.').replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);
        const timestamp = Date.now().toString().slice(-6);
        return `up_${clean}_${timestamp}`; 
    }

    /**
     * 解析 Cloudinary API 基础地址
     * 优先使用反向代理地址（CLOUDINARY_PROXY_URL），否则使用官方地址
     * @returns {string} 基础 URL（无尾部斜杠）
     */
    function getBaseUrl() {
        const proxyUrl = getEnvVar("CLOUDINARY_PROXY_URL");
        if (proxyUrl) {
            let base = proxyUrl.replace(/\/+$/, '');
            if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
            return base;
        }
        return "https://api.cloudinary.com";
    }

    /**
     * 计算字符串的 SHA1 哈希值
     * 使用运行时内置的 CryptoJS 库，稳定可靠，无需 Shell 命令依赖
     * @param {string} str - 待计算的字符串
     * @returns {string} 十六进制 SHA1 哈希值（小写）
     */
    function sha1(str) {
        return CryptoJS.SHA1(str).toString();
    }

function formatTestReport(result) {
        let report = '## Cloudinary API 连通性测试\n\n';
        report += '| 项目 | 状态 |\n';
        report += '| :--- | :--- |\n';
        report += `| API 连通性 | ${result.connected ? '✅ 正常' : '❌ 失败'} |\n`;
        report += `| 响应延迟 | ${result.latency} ms |\n`;
        report += `| Cloud Name | ${result.cloudName} |\n`;
        report += `| Upload Preset | ${result.uploadPreset} |\n`;
        if (result.error) {
            report += `| 错误信息 | ${result.error} |\n`;
        }
        return report;
    }

    return {
        upload_image: async (params) => {
            try {
                const cloudName = getEnvVar("CLOUDINARY_CLOUD_NAME");
                const uploadPreset = getEnvVar("CLOUDINARY_UPLOAD_PRESET");

                if (!cloudName || !uploadPreset) {
                    throw new Error("Cloudinary 环境变量未配置");
                }

                const dataUri = await getFileDataUri(params.file_path);
                const publicId = getCleanFileName(params.file_path);
                const apiUrl = `${getBaseUrl()}/v1_1/${cloudName}/image/upload`;

                const payload = {
                    file: dataUri,
                    upload_preset: uploadPreset,
                    public_id: publicId
                };

                const resp = await client.newRequest()
                    .url(apiUrl)
                    .method("POST")
                    .header("Content-Type", "application/json")
                    .body(JSON.stringify(payload), "json")
                    .build()
                    .execute();

                if (!resp.isSuccessful()) {
                    let errorMsg = `HTTP ${resp.statusCode}`;
                    try { errorMsg = JSON.parse(resp.content).error.message; } catch(e) {}
                    throw new Error(errorMsg);
                }

                const data = JSON.parse(resp.content);
                
                // 返回结构化数据供工作流引用，并保留 Markdown 预览
                complete({
                    success: true,
                    public_id: data.public_id,
                    url: data.secure_url,
                    data: `### [成功] 图片上传完成\n` +
                          `**URL**: ${data.secure_url}\n\n` +
                          `**Public ID**: \`${data.public_id}\` (用于自动销毁)\n\n` +
                          `![Preview](${data.secure_url})`
                });
            } catch (e) {
                complete({ success: false, message: `上传失败: ${e.message}` });
            }
        },

        delete_image: async (params) => {
            try {
                const cloudName = getEnvVar("CLOUDINARY_CLOUD_NAME");
                const apiKey = getEnvVar("CLOUDINARY_API_KEY");
                const apiSecret = getEnvVar("CLOUDINARY_API_SECRET");

                if (!cloudName || !apiKey || !apiSecret) {
                    throw new Error("删除功能需要配置 CLOUDINARY_API_KEY 和 CLOUDINARY_API_SECRET");
                }

                const timestamp = Math.floor(Date.now() / 1000);
                // Cloudinary 要求所有参与签名的参数按字母序排列，最后拼接 Secret
                const signatureStr = `public_id=${params.public_id}&timestamp=${timestamp}${apiSecret}`;
                const signature = sha1(signatureStr);

                const apiUrl = `${getBaseUrl()}/v1_1/${cloudName}/image/destroy`;
                const payload = {
                    public_id: params.public_id,
                    timestamp: timestamp,
                    api_key: apiKey,
                    signature: signature
                };

                const resp = await client.newRequest()
                    .url(apiUrl)
                    .method("POST")
                    .header("Content-Type", "application/json")
                    .body(JSON.stringify(payload), "json")
                    .build()
                    .execute();

                const result = JSON.parse(resp.content);
                if (result.result === "ok") {
                    complete({ success: true, data: `图片 ${params.public_id} 已从 Cloudinary 成功删除。` });
                } else {
                    throw new Error(result.error?.message || result.result);
                }
} catch (e) {
                complete({ success: false, message: `删除失败: ${e.message}` });
            }
        },

        test: async () => {
            const startTime = Date.now();
            const cloudName = getEnvVar("CLOUDINARY_CLOUD_NAME");
            const uploadPreset = getEnvVar("CLOUDINARY_UPLOAD_PRESET");
            const targetBase = getBaseUrl();

            if (!cloudName || !uploadPreset) {
                return complete({
                    success: false,
                    message: '环境变量未配置',
                    data: formatTestReport({
                        connected: false,
                        latency: 0,
                        cloudName: cloudName || '未配置',
                        uploadPreset: uploadPreset || '未配置',
                        error: '请在 Operit 设置 → 环境变量中添加 CLOUDINARY_CLOUD_NAME 和 CLOUDINARY_UPLOAD_PRESET'
                    })
                });
            }

            // 对 Cloudinary API 基础域名发起轻量 GET 请求验证网络连通性
            try {
                const pingUrl = `${targetBase}/v1_1/${cloudName}/image/upload`;
                const response = await client.newRequest()
                    .url(pingUrl)
                    .method("GET")
                    .header("Accept", "application/json")
                    .build()
                    .execute();
                const latency = Date.now() - startTime;
                // Cloudinary 对无效 GET 返回 4xx，但这足以证明网络可达
                const connected = response.statusCode > 0;

                complete({
                    success: connected,
                    message: connected
                        ? `网络连通正常，响应延迟 ${latency} ms`
                        : '网络请求未获有效响应',
                    data: formatTestReport({
                        connected: connected,
                        latency: latency,
                        cloudName: cloudName,
                        uploadPreset: uploadPreset,
                        error: connected ? null : `HTTP ${response.statusCode}`
                    }) + (targetBase !== 'https://api.cloudinary.com'
                        ? `\n\n> ✅ 已启用反向代理: ${targetBase}`
                        : '\n\n> ⚠️ 国内网络建议配置 CLOUDINARY_PROXY_URL 反向代理以提升稳定性。')
                });
            } catch (netErr) {
                const latency = Date.now() - startTime;
                complete({
                    success: false,
                    message: `网络连通性测试失败: ${netErr.message}`,
                    data: formatTestReport({
                        connected: false,
                        latency: latency,
                        cloudName: cloudName,
                        uploadPreset: uploadPreset,
                        error: `网络错误: ${netErr.message}。请检查网络连接或配置 CLOUDINARY_PROXY_URL。`
                    })
                });
            }
        }
    };
})();

exports.upload_image = cloudinary_upload.upload_image;
exports.delete_image = cloudinary_upload.delete_image;
exports.test = cloudinary_upload.test;