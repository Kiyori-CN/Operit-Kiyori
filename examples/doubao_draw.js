/* METADATA
{
  "name": "doubao_draw",
  "version": "1.0",
  "display_name": {
    "zh": "豆包 AI 绘画",
    "en": "Doubao AI Drawing"
  },
  "description": {
    "zh": "豆包绘画工具包。通过火山方舟 (VolcEngine) API 使用 Doubao Seedream 3.0 模型生成高清图片。支持自定义分辨率、提示词相关性及随机种子。",
    "en": "Doubao draw tool. Generate high-quality images using the Doubao Seedream 3.0 model via the VolcEngine API."
  },
  "env": [
    {
      "name": "VOLCENGINE_API_KEY",
      "description": {
        "zh": "火山方舟 API Key。在火山引擎控制台 → 模型推理 → API Key 管理 中获取",
        "en": "VolcEngine Ark API Key. Get it from the VolcEngine console → Model Inference → API Key Management."
      },
      "required": true
    },
    {
      "name": "VOLCENGINE_PROXY_DOMAIN",
      "description": {
        "zh": "自定义反向代理域名（可选），用于替换默认的 ark.cn-beijing.volces.com。格式：https://your-proxy.example.com 或 your-proxy.example.com",
        "en": "Custom reverse proxy domain (optional). Replaces ark.cn-beijing.volces.com. Format: https://your-proxy.example.com or your-proxy.example.com"
      },
      "required": false
    }
  ],
  "author": "Operit Community",
  "category": "Admin",
  "tools": [
    {
      "name": "generate_image",
      "description": {
        "zh": "根据提示词生成图片，将图片持久化存储至本地设备，并返回用于展示的 Markdown 引用地址。",
        "en": "Generate an image based on the prompt, save it locally, and return a Markdown image display."
      },
      "parameters": [
        { "name": "prompt", "description": { "zh": "绘图提示词，用于描述生成内容（建议使用英文以获得更精准的效果）", "en": "Image prompt (English recommended)" }, "type": "string", "required": true },
        { "name": "resolution", "description": { "zh": "图片分辨率，支持 '1024x1024', '720x1280' 等标准格式", "en": "Image resolution, e.g., '1024x1024', '720x1280'" }, "type": "string", "required": false },
        { "name": "seed", "description": { "zh": "随机种子，用于固定生成结果或进行微调", "en": "Random seed" }, "type": "number", "required": false },
        { "name": "guidance_scale", "description": { "zh": "提示词相关性，取值范围 1-10，数值越高越严格遵循提示词", "en": "Guidance scale (1-10)" }, "type": "number", "required": false },
        { "name": "watermark", "description": { "zh": "控制输出图片是否包含官方水印", "en": "Whether to add a watermark" }, "type": "boolean", "required": false }
      ]
    },
    {
      "name": "test",
      "description": {
        "zh": "测试火山方舟 API 连通性。验证 API Key 有效性、网络可达性及服务响应延迟，返回诊断报告。适用于首次配置后的连通性验证与故障排查。",
        "en": "Test VolcEngine API connectivity."
      },
      "parameters": []
    }
  ]
}
*/

/**
 * ==============================================================================
 * 模块名称：Doubao 绘图助手 (Doubao Gen)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本模块基于火山方舟 (Ark) 平台提供的 Doubao Seedream 3.0 模型接口实现。
 * 具备图片生成、自动目录创建、文件名合法性过滤及文件自动化下载存储等核心功能。
 * * 版本：1.0
 * 语言：JavaScript (ES8+)
 * ==============================================================================
 */
const doubaoGen = (function () {
    // 初始化网络请求客户端及基础 API 配置
    const client = OkHttp.newClient();
    const BASE_URL = 'https://ark.cn-beijing.volces.com';
    const ENDPOINT = '/api/v3/images/generations';
    const MODEL_ID = "doubao-seedream-3-0-t2i-250415";
    
    // 存储路径配置：定义下载根目录及专用绘图存档目录
    const DOWNLOAD_ROOT = "/sdcard/Download";
    const DRAWS_DIR = `${DOWNLOAD_ROOT}/Operit/draws/doubaogen`;

    /**
     * 解析 API 基础 URL
     * 支持通过 VOLCENGINE_PROXY_DOMAIN 环境变量配置反向代理
     * @returns {string} 完整的 API 基础 URL（无尾部斜杠）
     */
    function resolveBaseUrl() {
        const proxyDomain = getEnv("VOLCENGINE_PROXY_DOMAIN");
        if (proxyDomain && proxyDomain.trim()) {
            let domain = proxyDomain.trim().replace(/\/+$/, '');
            if (!/^https?:\/\//i.test(domain)) domain = 'https://' + domain;
            return domain;
        }
        return BASE_URL;
    }

    /**
     * 环境校验：获取并校验 API 密钥
     * @returns {string} 有效的 API 密钥
     * @throws {Error} 未配置环境变量时抛出异常
     */
    function getApiKey() {
        const apiKey = getEnv("VOLCENGINE_API_KEY");
        if (!apiKey) {
            throw new Error("VOLCENGINE_API_KEY 未配置，请在环境变量中设置。");
        }
        return apiKey;
    }

    /**
     * 文件系统维护：确保图片存储目录存在
     */
    async function ensureDirectories() {
        await Tools.Files.mkdir(DRAWS_DIR);
    }

    /**
     * 文件名安全过滤：移除非法字符并限制长度
     * @param {string} name 原始文件名（通常源自提示词）
     * @returns {string} 过滤后的安全文件名
     */
    function sanitizeFileName(name) {
        return name.replace(/[\\/:*?"<>|]/g, "_").trim().substring(0, 50);
    }

    /**
     * 核心业务逻辑：图片生成与持久化
     * @param {Object} params 包含 prompt, resolution 等生成参数
     * @returns {Object} 包含状态及本地路径的结构化数据
     */
    async function generate_image_internal(params) {
        // 输入参数预校验
        if (!params.prompt || params.prompt.trim().length === 0) {
            throw new Error("prompt 参数不能为空。");
        }

        const apiKey = getApiKey();
        await ensureDirectories();

        // 构造 API 请求负载
        const payload = {
            model: MODEL_ID,
            prompt: params.prompt,
            n: 1, // 固定单次生成一张图片以优化处理流程
            size: params.resolution || "1024x1024",
            guidance_scale: params.guidance_scale || 2.5,
            watermark: params.watermark === undefined ? false : params.watermark
        };

        // 处理可选参数：随机种子
        if (params.seed !== undefined) {
            payload.seed = params.seed;
        }

        // 配置请求头：包含鉴权信息与数据格式声明
        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        };

        // 发起异步 POST 请求至火山方舟网关
        const response = await client.newRequest()
            .url(resolveBaseUrl() + ENDPOINT)
            .method("POST")
            .headers(headers)
            .body(JSON.stringify(payload), "json")
            .build()
            .execute();

        // 响应状态码检查
        if (!response.isSuccessful()) {
            throw new Error(`火山方舟 API 调用失败: ${response.statusCode} - ${response.content}`);
        }

        const resData = JSON.parse(response.content);
        const imgData = resData.data?.[0];
        
        // 提取图片资源定位符
        let imgUrlOrBase64 = imgData?.url || imgData?.b64_json;
        if (!imgUrlOrBase64) {
            throw new Error("API 响应中未找到图片数据。");
        }

        // 构造本地存储文件名及绝对路径
        const timestamp = Date.now();
        const fileName = `doubao_${sanitizeFileName(params.prompt)}_${timestamp}.png`;
        const filePath = `${DRAWS_DIR}/${fileName}`;

        // 执行文件持久化：处理 URL 远程下载
        if (imgUrlOrBase64.startsWith('http')) {
            const downloadRes = await Tools.Files.download(imgUrlOrBase64, filePath);
            if (!downloadRes.successful) {
                throw new Error(`图片下载失败: ${downloadRes.details}`);
            }
        } else {
            // 目前限制仅支持 URL 下载方式以保证存储稳定性
            throw new Error("当前工具包暂不支持 Base64 数据直接存储，请确保 API 配置返回 URL。");
        }

        // 构造输出元数据
        const fileUri = `file://${filePath}`;
        const markdown = `![AI生成的图片](${fileUri})`;

        return {
            status: "success",
            data: {
                file_path: filePath,
                file_uri: fileUri,
                markdown: markdown,
                message: `图片已生成并保存至: ${filePath}`
            }
        };
    }

    /**
     * 格式化测试报告
     */
    function formatTestReport(result) {
        let report = '## 火山方舟 API 连通性测试\n\n';
        report += '| 项目 | 状态 |\n';
        report += '| :--- | :--- |\n';
        report += `| API 连通性 | ${result.connected ? '✅ 正常' : '❌ 失败'} |\n`;
        report += `| 响应延迟 | ${result.latency} ms |\n`;
        report += `| API 地址 | ${result.apiUrl} |\n`;
        report += `| 模型 | ${result.model} |\n`;
        report += `| 密钥状态 | ${result.keyPreview ? '✅ ' + result.keyPreview : '❌ 未配置'} |\n`;
        if (result.error) {
            report += `| 错误信息 | ${result.error} |\n`;
        }
        return report;
    }

    /**
     * API 连通性测试
     */
    /**
     * API 连通性测试（轻量版）
     * 仅验证环境变量配置与网络可达性，不生成实际图片（避免消耗配额）
     */
    async function test_internal() {
        const startTime = Date.now();
        const apiKey = getEnv("VOLCENGINE_API_KEY");
        const resolvedBase = resolveBaseUrl();
        const apiUrl = resolvedBase + ENDPOINT;

        if (!apiKey) {
            return {
                status: "error",
                message: 'VOLCENGINE_API_KEY 未配置',
                data: formatTestReport({
                    connected: false,
                    latency: 0,
                    apiUrl: apiUrl,
                    model: MODEL_ID,
                    keyPreview: null,
                    error: '请在 Operit 设置 → 环境变量中添加 VOLCENGINE_API_KEY（火山引擎控制台 → 模型推理 → API Key 管理）'
                })
            };
        }

        // 对 API 基础域名发起 GET 请求验证网络连通性（不消耗生图配额）
        // 服务端会返回 4xx 错误，但这足以证明网络可达且 API 端点存在
        try {
            const response = await client.newRequest()
                .url(resolvedBase)
                .method("GET")
                .headers({
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "application/json"
                })
                .build()
                .execute();

            const latency = Date.now() - startTime;
            // 任何 HTTP 响应（包括 4xx）都代表网络连通正常
            const connected = response.statusCode > 0;

            return {
                status: connected ? "success" : "error",
                message: connected
                    ? `连通性测试完成，响应延迟 ${latency} ms`
                    : `服务端无有效响应 (HTTP ${response.statusCode})`,
                data: formatTestReport({
                    connected: connected,
                    latency: latency,
                    apiUrl: apiUrl,
                    model: MODEL_ID,
                    keyPreview: '已配置',
                    error: connected ? null : `HTTP ${response.statusCode}`
                }),
                meta: { latency_ms: latency }
            };
        } catch (e) {
            const latency = Date.now() - startTime;
            return {
                status: "error",
                message: `连接测试失败: ${e.message}`,
                data: formatTestReport({
                    connected: false,
                    latency: latency,
                    apiUrl: apiUrl,
                    model: MODEL_ID,
                    keyPreview: '已配置',
                    error: e.message
                })
            };
        }
    }

    // 公开暴露的工具接口
    return {
        generate_image: async function (params) {
            try {
                const result = await generate_image_internal(params);
                complete(result); // 任务完成回调
            } catch (e) {
                // 统一错误处理与状态反馈
                complete({
                    status: "error",
                    message: e.message
                });
            }
        },

        test: async function () {
            try {
                const result = await test_internal();
                complete(result);
            } catch (e) {
                complete({
                    status: "error",
                    message: e.message
                });
            }
        }
    };
})();

// 模块导出：注册 generate_image 工具
exports.generate_image = doubaoGen.generate_image;
exports.test = doubaoGen.test;