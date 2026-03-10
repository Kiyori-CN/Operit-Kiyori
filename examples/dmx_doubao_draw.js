/* METADATA
{
    "name": "dmx_doubao_draw",
    "version": "1.0",
    "display_name": {
        "zh": "DMX 豆包绘画",
        "en": "DMX Doubao Drawing"
    },
    "description": {
        "zh": "DMX豆包绘画工具包。基于 DMXAPI (doubao-seedream-4-5) 模型，集成文生图、图生图（修图）及多图融合创作功能。支持自动下载图片至本地并生成 Markdown 预览。https://dmxapi.cn/",
        "en": "DMX Doubao Draw Toolkit. Powered by DMXAPI (doubao-seedream-4-5), supporting Text-to-Image, Image-to-Image, and Multi-Image Composition with auto-download and Markdown preview. https://dmxapi.cn/"
    },
    "env": [
        {
            "name": "DMX_API_KEY",
            "description": {
                "zh": "DMXAPI 密钥。在 https://dmxapi.cn/ 注册后获取，支持豆包/Midjourney/Stable Diffusion 等多种模型",
                "en": "DMXAPI Key. Register at https://dmxapi.cn/ to get your key. Supports Doubao, Midjourney, Stable Diffusion and more."
            },
            "required": true
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "generate_image",
            "description": {
                "zh": "【文生图】根据详细的文本提示词生成高质量图片。支持超高分辨率生成。",
                "en": "Text-to-Image generation based on detailed prompts. Supports ultra-high resolution."
            },
            "parameters": [
                { "name": "prompt", "description": { "zh": "画面描述提示词 (建议使用英文，结构：主体+风格+光影+细节)", "en": "Detailed image prompt (English recommended)" }, "type": "string", "required": true },
                { "name": "resolution", "description": { "zh": "分辨率 (强烈建议使用 '2K' 或 '4K'，避免使用 '1024x1024' 导致像素不足报错)", "en": "Resolution (Recommend '2K' or '4K')" }, "type": "string", "required": false, "default": "2K" },
                { "name": "seed", "description": { "zh": "随机种子 (用于结果复现)", "en": "Random seed" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "edit_image",
            "description": {
                "zh": "【图生图/修图】基于本地原图，配合提示词进行重绘或细节修改。",
                "en": "Image-to-Image editing based on a local source image and prompt."
            },
            "parameters": [
                { "name": "prompt", "description": { "zh": "修改指令或新画面的详细描述", "en": "Edit instruction or prompt" }, "type": "string", "required": true },
                { "name": "image", "description": { "zh": "原图路径 (必须为本地绝对路径，如 /sdcard/...)", "en": "Local absolute path to source image" }, "type": "string", "required": true },
                { "name": "resolution", "description": { "zh": "分辨率 (推荐 'adaptive' 自适应原图，或 '2K')", "en": "Resolution" }, "type": "string", "required": false, "default": "adaptive" },
                { "name": "guidance_scale", "description": { "zh": "重绘强度 (0-10)，默认 5。值越小越接近原图，值越大越遵循提示词", "en": "Guidance scale (0-10)" }, "type": "number", "required": false },
                { "name": "seed", "description": { "zh": "随机种子", "en": "Seed" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "compose_image",
            "description": {
                "zh": "【多图融合】输入多张本地参考图，进行风格融合、角色迁移或多图对话生成。",
                "en": "Multi-image composition and fusion."
            },
            "parameters": [
                { "name": "prompt", "description": { "zh": "融合后的画面描述提示词", "en": "Composition prompt" }, "type": "string", "required": true },
                { "name": "image_1", "description": { "zh": "第1张参考图本地路径 (必填)", "en": "Reference Image 1 path" }, "type": "string", "required": true },
                { "name": "image_2", "description": { "zh": "第2张参考图本地路径 (可选)", "en": "Reference Image 2 path" }, "type": "string", "required": false },
                { "name": "image_3", "description": { "zh": "第3张参考图本地路径 (可选)", "en": "Reference Image 3 path" }, "type": "string", "required": false },
                { "name": "image_4", "description": { "zh": "第4张参考图本地路径 (可选)", "en": "Reference Image 4 path" }, "type": "string", "required": false },
                { "name": "image_5", "description": { "zh": "第5张参考图本地路径 (可选)", "en": "Reference Image 5 path" }, "type": "string", "required": false },
                { "name": "resolution", "description": { "zh": "分辨率 (推荐 'adaptive' 或 '2K')", "en": "Resolution" }, "type": "string", "required": false, "default": "adaptive" },
                { "name": "guidance_scale", "description": { "zh": "相似度控制 (0-10)", "en": "Guidance scale" }, "type": "number", "required": false }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 DMXAPI 连通性。验证 API Key 有效性、网络可达性及服务响应延迟，返回诊断报告。适用于首次配置后的连通性验证与故障排查。",
                "en": "Test DMXAPI connectivity."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：DMX Doubao Draw
 * 版本号：v1.0
 * ------------------------------------------------------------------------------
 * 模块概述：
 * 本插件严格遵循 Operit 工具包开发协议，封装了 DMXAPI 的图像生成能力。
 * 核心功能包括：
 * 1. 基础生图：支持文生图，推荐使用 2K/4K 分辨率。
 * 2. 图像编辑：支持基于本地路径的图生图与修图功能。
 * 3. 多图融合：支持最多 5 张图片的风格迁移与融合。
 * 4. 自动管理：自动处理 Base64 转换、图片下载存储及 Markdown 预览生成。
 * * 依赖环境：
 * - 必须配置环境变量 DMX_API_KEY。
 * - 依赖 Tools.Files 进行文件操作。
 * - 依赖 OkHttp 进行网络通信。
 * ==============================================================================
 */
const dmxDoubaoDraw = (function () {

    // ==========================================================================
    // 1. 配置常量定义
    // ==========================================================================
    
    const CONFIG = {
        API_HOST: "https://www.dmxapi.cn",         // DMXAPI 服务基地址
        ENDPOINT: "/v1/images/generations",        // 图像生成统一接口端点
        MODEL_ID: "doubao-seedream-4-5-251128",    // 使用的豆包 Seedream 模型版本
        TIMEOUT_SEC: 120,                          // 网络请求超时时间（秒），适应高分辨率生成耗时
        SAVE_DIR_NAME: "doubao"                    // 本地存储的子目录名称
    };

    const PATHS = {
        // 图片保存的基础路径，最终路径为 /sdcard/Download/Operit/draws/doubao
        SAVE_DIR: "/sdcard/Download/Operit/draws/" + CONFIG.SAVE_DIR_NAME
    };

    // 实例化 OkHttp 客户端，用于后续的所有 HTTP 请求
    const client = OkHttp.newClient();

    // ==========================================================================
    // 2. 基础工具函数
    // ==========================================================================

    /**
     * 获取并校验环境变量中的 API 密钥
     * * @returns {string} 有效的 API 密钥
     * @throws {Error} 如果密钥未配置或为空
     */
    function getApiKey() {
        const key = getEnv("DMX_API_KEY");
        if (!key || key.trim() === "") {
            throw new Error("未配置 API 密钥。请在环境变量中设置 DMX_API_KEY。");
        }
        return key.trim();
    }

    /**
     * 确保本地图片存储目录存在
     * 如果目录不存在，将递归创建
     */
    async function ensureDirectory() {
        await Tools.Files.mkdir(PATHS.SAVE_DIR, true);
    }

    /**
     * 生成标准化的安全文件名
     * 格式：db_[清洗后的提示词前缀]_[时间戳].png
     * * @param {string} prefix - 用于文件名的提示词前缀
     * @returns {string} 格式化后的文件名
     */
    function generateSafeFileName(prefix) {
        // 移除非法路径字符，截取前 15 个字符，并追加时间戳以确保唯一性
        const safePrefix = (prefix || "image").replace(/[\\/:*?"<>|\s]/g, "_").substring(0, 15);
        return `db_${safePrefix}_${Date.now()}.png`;
    }

    /**
     * 根据文件扩展名推断 MIME 类型
     * * @param {string} path - 文件路径
     * @returns {string} 对应的 MIME 类型，默认为 image/png
     */
    function getMimeType(path) {
        const lower = path.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return "image/png";
    }

    /**
     * 图片输入预处理
     * 功能：将输入的图片路径（URL 或本地路径）统一转换为 API 所需的格式。
     * 逻辑：
     * 1. 如果是网络 URL，直接返回。
     * 2. 如果是本地路径，读取文件内容并转换为 Base64 Data URI。
     * * @param {string} inputPath - 输入的图片路径
     * @returns {Promise<string>} 处理后的图片字符串（URL 或 Data URI）
     * @throws {Error} 如果本地文件不存在或读取失败
     */
    async function processInputImage(inputPath) {
        if (!inputPath || typeof inputPath !== 'string') return null;

        const trimmedPath = inputPath.trim();

        // 情况 A: 公网 URL，API 可直接处理
        if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
            return trimmedPath;
        }

        // 情况 B: 本地文件路径
        let localPath = trimmedPath;
        if (localPath.startsWith("file://")) {
            localPath = localPath.replace("file://", "");
        }

        // 检查文件是否存在
        const existsInfo = await Tools.Files.exists(localPath);
        if (!existsInfo.exists) {
             throw new Error(`找不到本地文件，请检查路径是否正确: ${localPath}`);
        }

        // 读取文件二进制内容
        const fileResult = await Tools.Files.readBinary(localPath);
        
        // 校验文件内容有效性
        if (!fileResult || !fileResult.contentBase64) {
            throw new Error(`无法读取本地图片文件内容: ${localPath}`);
        }

        // 构造标准的 Data URI Scheme
        const mime = getMimeType(localPath);
        return `data:${mime};base64,${fileResult.contentBase64}`;
    }

    // ==========================================================================
    // 3. 核心 API 交互逻辑
    // ==========================================================================

    /**
     * 执行 DMXAPI 网络请求
     * * @param {Object} payload - 发送给 API 的 JSON 请求体
     * @returns {Promise<Object>} API 返回的 JSON 数据
     * @throws {Error} 网络错误或 API 返回错误状态码时抛出异常
     */
    async function callApi(payload) {
        const apiKey = getApiKey();
        const url = `${CONFIG.API_HOST}${CONFIG.ENDPOINT}`;

        // 构建 HTTP POST 请求
        const request = client.newRequest()
            .url(url)
            .method("POST")
            .header("Authorization", `Bearer ${apiKey}`)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .header("User-Agent", "Operit-DMX-Doubao/1.0")
            .body(JSON.stringify(payload), "json");

        // 执行请求
        const response = await request.build().execute();

        // 统一错误处理逻辑
        if (!response.isSuccessful()) {
            let errorDetail = response.content;
            try {
                // 尝试解析服务端返回的 JSON 错误详情
                const errJson = JSON.parse(response.content);
                if (errJson.error && errJson.error.message) {
                    errorDetail = errJson.error.message;
                } else if (errJson.message) {
                    errorDetail = errJson.message;
                }
            } catch (e) {
                // 解析失败则保留原始响应文本
            }
            throw new Error(`DMXAPI 请求失败 [HTTP ${response.statusCode}]: ${errorDetail}`);
        }

        return JSON.parse(response.content);
    }

    /**
     * 处理 API 响应并保存图片至本地
     * * @param {Object} apiResponse - API 返回的原始 JSON 数据
     * @param {string} prompt - 原始提示词，用于文件名生成和结果展示
     * @param {string} mode - 当前任务模式（如“文生图”），用于日志展示
     * @returns {Object} 符合插件协议的返回结果对象
     */
    async function handleResponseAndSave(apiResponse, prompt, mode) {
        // 兼容 DMXAPI/OpenAI 响应格式
        const imageDataItem = apiResponse.data?.[0];
        
        if (!imageDataItem) {
            throw new Error("API 响应格式异常：响应中未包含有效的 data 字段。");
        }

        await ensureDirectory();
        
        const fileName = generateSafeFileName(prompt);
        const savePath = `${PATHS.SAVE_DIR}/${fileName}`;
        const fileUri = `file://${savePath}`;

        // 根据返回类型（URL 或 Base64）分别处理
        if (imageDataItem.url) {
            // DMX 返回的通常是临时 URL，必须下载并持久化保存
            const downloadRes = await Tools.Files.download(imageDataItem.url, savePath);
            
            // 检查下载操作是否成功
            if (downloadRes && downloadRes.success === false) { 
                throw new Error(`图片下载失败: ${downloadRes.details || '未知网络错误'}`);
            }
        } else if (imageDataItem.b64_json) {
            // 处理 Base64 数据，移除可能存在的 Data URI 前缀
            const cleanBase64 = imageDataItem.b64_json.replace(/^data:image\/\w+;base64,/, "");
            await Tools.Files.writeBinary(savePath, cleanBase64);
        } else {
            throw new Error("API 返回了不支持的图片数据格式（缺失 url 或 b64_json）。");
        }

        // 提取元数据用于结果展示
        const seedInfo = imageDataItem.seed ? ` (Seed: ${imageDataItem.seed})` : "";
        const finalUrl = imageDataItem.url || "Base64 Data";
        
        // 构建 Markdown 格式的返回信息，便于用户直接预览
        const markdownOutput = `### ${mode} 任务完成\n` +
            `> **提示词**: ${prompt}\n` +
            `> **模型**: ${CONFIG.MODEL_ID}${seedInfo}\n\n` +
            `![生成的图片](${fileUri})`;

        return {
            success: true,
            data: {
                file_path: savePath,
                file_uri: fileUri,
                markdown: markdownOutput,
                original_url: finalUrl
            },
            // 定义 toString 方法以便在部分 UI 中直接显示 Markdown 内容
            toString: () => markdownOutput
        };
    }

    // ==========================================================================
    // 4. 功能导出定义
    // ==========================================================================

    /**
     * 格式化测试报告
     */
    function formatTestReport(result) {
        let report = '## DMXAPI 连通性测试\n\n';
        report += '| 项目 | 状态 |\n';
        report += '| :--- | :--- |\n';
        report += `| API 连通性 | ${result.connected ? '✅ 正常' : '❌ 失败'} |\n`;
        report += `| 响应延迟 | ${result.latency} ms |\n`;
        report += `| API 地址 | ${result.apiUrl} |\n`;
        report += `| 模型 | ${result.model} |\n`;
        report += `| 密钥状态 | ${result.keyPreview} |\n`;
        if (result.error) {
            report += `| 错误信息 | ${result.error} |\n`;
        }
        return report;
    }

    return {
        /**
         * 功能 1: 文生图 (generate_image)
         * 根据文本提示词生成图片，支持 2K/4K 分辨率。
         */
        generate_image: async (params) => {
            try {
                // 1. 构建请求参数
                const payload = {
                    model: CONFIG.MODEL_ID,
                    prompt: params.prompt,
                    size: params.resolution || "2K", // 默认使用 2K 以保证稳定性
                    n: 1,
                    watermark: false
                };
                
                if (params.seed !== undefined) payload.seed = params.seed;

                // 2. 调用 API
                const apiRes = await callApi(payload);

                // 3. 处理并返回结果
                const result = await handleResponseAndSave(apiRes, params.prompt, "文生图");
                complete(result);

            } catch (err) {
                complete({ success: false, error: `文生图任务失败: ${err.message}` });
            }
        },

        /**
         * 功能 2: 图生图/修图 (edit_image)
         * 接受一张本地图片和提示词，进行图像编辑或重绘。
         */
        edit_image: async (params) => {
            try {
                // 1. 预处理输入图片
                const imageBase64 = await processInputImage(params.image);
                if (!imageBase64) throw new Error("输入图片路径无效或无法读取。");

                // 2. 构建请求参数
                const payload = {
                    model: CONFIG.MODEL_ID,
                    prompt: params.prompt,
                    image: imageBase64,
                    size: params.resolution || "adaptive",
                    n: 1,
                    watermark: false
                };

                if (params.guidance_scale !== undefined) payload.guidance_scale = params.guidance_scale;
                if (params.seed !== undefined) payload.seed = params.seed;

                // 3. 调用 API
                const apiRes = await callApi(payload);

                // 4. 处理并返回结果
                const result = await handleResponseAndSave(apiRes, params.prompt, "图生图");
                complete(result);

            } catch (err) {
                complete({ success: false, error: `图生图任务失败: ${err.message}` });
            }
        },

        /**
         * 功能 3: 多图融合 (compose_image)
         * 支持多达 5 张参考图的输入，用于复杂的风格迁移或融合。
         */
        compose_image: async (params) => {
            try {
                const images = [];
                // 遍历 image_1 到 image_5 参数，收集所有有效的输入图片
                for (let i = 1; i <= 5; i++) {
                    const key = `image_${i}`;
                    if (params[key]) {
                        try {
                            const imgData = await processInputImage(params[key]);
                            if (imgData) images.push(imgData);
                        } catch (subErr) {
                            // 遇到单张图片处理错误时，抛出异常终止流程
                            throw new Error(`处理第 ${i} 张图片时出错 (${params[key]}): ${subErr.message}`);
                        }
                    }
                }

                if (images.length === 0) {
                    throw new Error("多图融合模式至少需要提供一张有效图片 (image_1)。");
                }

                // 构建请求参数
                const payload = {
                    model: CONFIG.MODEL_ID,
                    prompt: params.prompt,
                    images: images,      // 多图模式下传递图片数组
                    size: params.resolution || "adaptive",
                    n: 1,
                    watermark: false
                };

                if (params.guidance_scale !== undefined) payload.guidance_scale = params.guidance_scale;
                // 注意：seed 参数在某些多图模式下可能不生效，但传递无害
                if (params.seed !== undefined) payload.seed = params.seed;

                // 调用 API
                const apiRes = await callApi(payload);

                // 处理并返回结果
                const result = await handleResponseAndSave(apiRes, params.prompt, "多图融合");
                complete(result);

            } catch (err) {
                complete({ success: false, error: `多图融合任务失败: ${err.message}` });
            }
        },

        /**
         * 功能 4: API 连通性测试（轻量版）
         * 仅验证环境变量与网络连通性，不生成实际图片以避免消耗配额
         */
        test: async () => {
            const startTime = Date.now();
            const apiKey = getEnv("DMX_API_KEY");
            const apiUrl = `${CONFIG.API_HOST}${CONFIG.ENDPOINT}`;

            if (!apiKey || apiKey.trim() === "") {
                return complete({
                    success: false,
                    message: '环境变量未配置',
                    data: formatTestReport({
                        connected: false,
                        latency: 0,
                        apiUrl: apiUrl,
                        model: CONFIG.MODEL_ID,
                        keyPreview: '未配置',
                        error: '请在 Operit 设置 → 环境变量中添加 DMX_API_KEY'
                    })
                });
            }

            // 对 DMXAPI 主站发起轻量 GET 请求验证连通性（不消耗生图配额）
            try {
                const response = await client.newRequest()
                    .url(CONFIG.API_HOST)
                    .method("GET")
                    .header("Authorization", `Bearer ${apiKey.trim()}`)
                    .header("User-Agent", "Operit-DMX-Doubao/1.0")
                    .build()
                    .execute();

                const latency = Date.now() - startTime;
                // 任何 HTTP 响应（包括 4xx）都代表网络连通正常
                const connected = response.statusCode > 0;

                complete({
                    success: connected,
                    message: connected
                        ? `连通性测试完成，响应延迟 ${latency} ms`
                        : `服务端无有效响应 (HTTP ${response.statusCode})`,
                    data: formatTestReport({
                        connected: connected,
                        latency: latency,
                        apiUrl: apiUrl,
                        model: CONFIG.MODEL_ID,
                        keyPreview: '已配置',
                        error: connected ? null : `HTTP ${response.statusCode}`
                    }),
                    meta: { latency_ms: latency }
                });
            } catch (err) {
                const latency = Date.now() - startTime;
                complete({
                    success: false,
                    message: `连接测试失败: ${err.message}`,
                    data: formatTestReport({
                        connected: false,
                        latency: latency,
                        apiUrl: apiUrl,
                        model: CONFIG.MODEL_ID,
                        keyPreview: '已配置',
                        error: err.message
                    })
                });
            }
        }
    };
})();

// 导出模块功能，使其对宿主环境可见
exports.generate_image = dmxDoubaoDraw.generate_image;
exports.edit_image = dmxDoubaoDraw.edit_image;
exports.compose_image = dmxDoubaoDraw.compose_image;
exports.test = dmxDoubaoDraw.test;