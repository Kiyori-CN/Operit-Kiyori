/* METADATA
{
    "name": "anime_search",
    "version": "1.0",
    "display_name": {
        "zh": "以图搜番",
        "en": "Anime Search by Image"
    },
    "description": {
        "zh": "以图搜番工具包。集成 trace.moe 搜索引擎，专用于通过公网图片链接检索动漫番剧信息。包含配额监控、详细元数据解析及多维度相似度匹配功能。",
        "en": "Anime Search Toolkit. Powered by trace.moe. Search anime via public image URLs. Features quota monitoring, detailed metadata parsing, and multi-dimensional similarity matching."
    },
    "env": [
        {
            "name": "TRACE_MOE_KEY",
            "description": {
                "zh": "trace.moe API Key（可选），配置后可显著提升每日搜索配额及并发限制。获取地址：https://trace.moe/",
                "en": "trace.moe API Key (Optional). Increases daily quota and concurrency limits. Get yours at: https://trace.moe/"
            },
            "required": false
        },
        {
            "name": "TRACE_MOE_PROXY_URL",
            "description": {
                "zh": "自定义反向代理地址（可选），用于替换默认的 api.trace.moe。在国内网络环境下建议配置。格式：https://your-proxy.example.com",
                "en": "Custom reverse proxy URL (optional). Replaces api.trace.moe. Recommended for users in China. Format: https://your-proxy.example.com"
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "tools": [
        {
            "name": "search_anime",
            "description": {
                "zh": "动漫检索工具。通过公网图片 URL 搜索番剧，返回包括番名、集数、时间轴及预览视频在内的详细信息。",
                "en": "Search anime by public image URL. Returns title, episode, timestamp, and video preview."
            },
            "parameters": [
                {
                    "name": "image_url",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "图片的公网链接 (http/https开头)，需确保链接可公开访问",
                        "en": "Public image URL (http/https). Must be accessible."
                    }
                },
                {
                    "name": "cut_borders",
                    "type": "boolean",
                    "required": false,
                    "default": true,
                    "description": {
                        "zh": "是否自动裁剪画面黑边 (推荐开启，可提高宽银幕截图的识别率)",
                        "en": "Auto-cut black borders (Recommended for higher accuracy)"
                    }
                },
                {
                    "name": "include_adult",
                    "type": "boolean",
                    "required": false,
                    "default": false,
                    "description": {
                        "zh": "是否包含成人/R18 内容结果",
                        "en": "Include adult/R18 content results"
                    }
                }
            ]
        },
        {
            "name": "check_limit",
            "description": {
                "zh": "服务诊断工具。查询当前 API Key 的剩余配额、重置时间及并发限制状态。",
                "en": "Check API usage quota, reset time, and concurrency limits."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：Anime Search Toolkit
 * 版本号：v1.0
 * ------------------------------------------------------------------------------
 * 变更日志：
 * 1. 移除了所有本地文件处理与图床上传逻辑，专注于 URL 检索功能。
 * 2. 增强了 API 错误处理机制，支持 402、429、50x 等状态码的详细映射。
 * 3. 重构了结果展示层，增加了置信度分级可视化与时间轴格式化功能。
 * 4. 增强了 URL 输入的安全性校验与规范化处理流程。
 * ------------------------------------------------------------------------------
 * 架构说明：
 * 1. Configuration: 集中管理 API 端点、请求头与阈值常量。
 * 2. Utils: 提供时间格式化、数值计算及网络校验等基础工具函数。
 * 3. Network Layer: 封装 OkHttp，统一处理 HTTP 异常与 JSON 数据解析。
 * 4. Service Layer: 实现具体的 trace.moe 业务逻辑 (Search 与 Me 接口)。
 * 5. Presentation Layer: 负责将结构化数据转换为易读的 Markdown 格式。
 * ==============================================================================
 */

const anime_search_impl = (function () {

    // ==========================================================================
    // 1. 全局配置与常量定义 (Configuration)
    //    此处定义了脚本运行所需的所有静态参数，包括 API 地址、阈值和错误信息。
    // ==========================================================================

    const CONFIG = {
        // API 基础配置参数
        API: {
            // trace.moe 的基础服务地址
            BASE_URL: "https://api.trace.moe",
            
            // 具体的 API 路由端点
            ENDPOINTS: {
                SEARCH: "/search", // 搜索接口
                ME: "/me"          // 用户信息与配额接口
            },
            
            // 全局请求超时时间设定（单位：秒）
            TIMEOUT: 30
        },

        // 外部服务链接配置，用于结果展示中的跳转
        LINKS: {
            // Anilist 动漫详情页前缀
            ANILIST_ANIME: "https://anilist.co/anime/",
            // Anilist 用户主页前缀
            ANILIST_USER: "https://anilist.co/user/"
        },

        // 相似度阈值判定标准
        // 用于将 API 返回的浮点数相似度转换为可视化的置信度等级
        THRESHOLDS: {
            EXACT: 0.95,    // 精确匹配：几乎可以确定是同一画面
            HIGH: 0.87,     // 高置信度：极大概率匹配
            MEDIUM: 0.80,   // 中置信度：存在匹配可能，但需人工确认
            LOW: 0.60       // 低置信度：结果可能不准确
        },

        // HTTP 请求头配置
        HEADERS: {
            // 自定义 User-Agent 以标识客户端身份
            "User-Agent": "Operit-Anime-Search/1.0 (Refined)",
            // 明确接收 JSON 格式的响应
            "Accept": "application/json"
        },

        // HTTP 状态码与用户友好提示信息的映射表
        // 用于在 API 请求失败时提供更具体的错误原因
        ERRORS: {
            400: "请求无效。请检查图片 URL 是否可访问或格式是否正确。",
            402: "API 配额已耗尽。请稍后再试，或配置 API Key 以提升额度。",
            403: "访问被拒绝。API Key 可能无效或已被禁用。",
            405: "请求方法不允许 (Method Not Allowed)。",
            429: "请求过于频繁 (Rate Limit)。请降低请求速率。",
            500: "trace.moe 服务器内部错误。请稍后重试。",
            503: "服务暂时不可用。服务器可能正在维护中。",
            504: "网关超时。搜番耗时过长，建议压缩图片后重试。"
        }
    };

    /**
     * 初始化 HTTP 客户端实例
     * 使用宿主环境提供的 OkHttp 对象构建新的客户端，用于后续的网络请求。
     */
    const client = OkHttp.newClient();

    // ==========================================================================
    // 2. 工具函数库 (Utilities)
    //    包含通用的数据处理、格式化和校验函数，不包含具体业务逻辑。
    // ==========================================================================

    const Utils = {
        /**
         * 获取环境变量并进行清洗
         * 从宿主环境中读取指定的配置项，并去除首尾空格。
         * * @param {string} key - 环境变量的键名
         * @returns {string|null} - 清洗后的字符串值，如果为空则返回 null
         */
        getEnv: (key) => {
            // 调用宿主环境的 getEnv 方法
            const val = getEnv(key);
            // 确保返回值非空且去除空格后有长度
            return (val && val.trim().length > 0) ? val.trim() : null;
        },

        /**
         * 校验 URL 格式合法性
         * 使用正则表达式检查字符串是否为标准的 HTTP/HTTPS 链接。
         * * @param {string} url - 待校验的字符串
         * @returns {boolean} - 如果格式合法返回 true，否则返回 false
         */
        isValidUrl: (url) => {
            if (!url) return false;
            // 正则说明：
            // ^https?:\/\/ : 必须以 http:// 或 https:// 开头
            // [^\s/$.?#]   : 域名部分不能包含特殊空白字符
            // .[^\s]* : 后续字符不包含空白
            const regex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
            return regex.test(url);
        },

        /**
         * 格式化秒数为时间戳字符串
         * 将总秒数转换为 MM:SS 或 HH:MM:SS 格式，用于展示番剧时间轴。
         * * @param {number} seconds - 视频的时间点（秒）
         * @returns {string} - 格式化后的时间字符串
         */
        formatTimestamp: (seconds) => {
            // 输入有效性检查
            if (typeof seconds !== 'number' || isNaN(seconds)) return "--:--";
            
            // 计算小时、分钟、秒
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);

            // 内部辅助函数：数字补零（如 5 -> "05"）
            const pad = (num) => num.toString().padStart(2, '0');
            
            // 如果包含小时，则返回 HH:MM:SS，否则返回 MM:SS
            if (h > 0) {
                return `${pad(h)}:${pad(m)}:${pad(s)}`;
            }
            return `${pad(m)}:${pad(s)}`;
        },

        /**
         * 格式化文件大小
         * 将字节数转换为人类可读的格式（B, KB, MB, GB）。
         * 注意：此函数在当前版本主要作为预留工具，用于后续可能的文件处理功能。
         * * @param {number} bytes - 字节大小
         * @returns {string} - 格式化后的字符串 (如 "1.5 MB")
         */
        formatFileSize: (bytes) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * 根据相似度数值生成视觉指示器
         * 将 0-1 的浮点数映射为具体的置信度等级、图标和描述文本。
         * * @param {number} similarity - 相似度数值 (范围 0.0 - 1.0)
         * @returns {Object} - 包含 icon (表情), label (中文标签), desc (英文描述) 的对象
         */
        getConfidenceLevel: (similarity) => {
            if (similarity >= CONFIG.THRESHOLDS.EXACT) 
                return { icon: "🟢", label: "精确匹配", desc: "Exact" };
            if (similarity >= CONFIG.THRESHOLDS.HIGH) 
                return { icon: "🟢", label: "极高", desc: "High" };
            if (similarity >= CONFIG.THRESHOLDS.MEDIUM) 
                return { icon: "🟡", label: "中等", desc: "Medium" };
            if (similarity >= CONFIG.THRESHOLDS.LOW) 
                return { icon: "🟠", label: "较低", desc: "Low" };
            // 低于最低阈值的情况
            return { icon: "🔴", label: "极低", desc: "Poor" };
        }
    };

    // ==========================================================================
    // 3. 网络请求封装层 (Network Layer)
    //    对 OkHttp 进行二次封装，简化 HTTP 请求构建、鉴权注入和错误处理流程。
    // ==========================================================================

    const HttpClient = {
        /**
         * 执行 HTTP 请求
         * * @param {string} endpoint - API 的相对路径 (如 "/search")
         * @param {Object} params - 查询参数对象 (Key-Value)
         * @param {string} method - 请求方法 (默认 "GET")
         * @returns {Promise<Object>} - 成功解析后的 JSON 数据对象
         * @throws {Error} - 当网络异常或 HTTP 状态码非 200 时抛出错误
         */
        request: async (endpoint, params = {}, method = 'GET') => {
            // 尝试获取 API Key
            const apiKey = Utils.getEnv("TRACE_MOE_KEY");
            // 支持反向代理：优先使用 TRACE_MOE_PROXY_URL，否则使用默认 BASE_URL
            const proxyUrl = Utils.getEnv("TRACE_MOE_PROXY_URL");
            const baseUrl = proxyUrl
                ? proxyUrl.replace(/\/+$/, '').replace(/^(?!https?:\/\/)/, 'https://')
                : CONFIG.API.BASE_URL;
            // 拼接完整 URL
            let url = baseUrl + endpoint;

            // 构建 Query String 参数字符串
            const queryParts = [];
            for (const [key, value] of Object.entries(params)) {
                // 仅处理非空值
                if (value !== undefined && value !== null) {
                    // 特殊处理：布尔值为 true 的参数 (如 &cutBorders) 不需要携带具体值
                    if (value === true) {
                        queryParts.push(key);
                    } else {
                        // 标准键值对需进行 URL 编码
                        queryParts.push(`${key}=${encodeURIComponent(value)}`);
                    }
                }
            }
            
            // 如果存在参数，追加到 URL 末尾
            if (queryParts.length > 0) {
                // 判断 URL 中是否已包含 '?'
                url += (url.includes('?') ? '&' : '?') + queryParts.join('&');
            }

            // 使用 OkHttp 构建 Request 对象
            const builder = client.newRequest()
                .url(url)
                .method(method);

            // 注入通用请求头
            for (const [k, v] of Object.entries(CONFIG.HEADERS)) {
                builder.header(k, v);
            }
            
            // 如果存在 API Key，注入鉴权请求头
            if (apiKey) {
                builder.header("x-trace-moe-key", apiKey);
            }

            // 执行网络请求
            try {
                const response = await builder.build().execute();
                const content = response.content;
                let json = {};

                // 尝试将响应内容解析为 JSON
                try {
                    json = JSON.parse(content);
                } catch (e) {
                    // 若解析失败（如返回 HTML 错误页），保留原始文本以便后续调试或显示
                    json = { raw_content: content };
                }

                // 统一 HTTP 状态码错误拦截
                if (!response.isSuccessful()) {
                    const code = response.statusCode;
                    // 优先使用 API 返回的 error 字段，其次使用本地映射表，最后使用通用描述
                    const errorMsg = json.error || CONFIG.ERRORS[code] || `HTTP Error ${code}`;
                    throw new Error(`API 请求失败: ${errorMsg}`);
                }

                return json;

            } catch (error) {
                // 捕获网络层面的异常（如 DNS 解析失败、连接超时）
                throw new Error(`网络通讯异常: ${error.message}`);
            }
        }
    };

    // ==========================================================================
    // 4. 业务逻辑与展示层 (Service & Presentation)
    //    包含核心的 trace.moe 交互逻辑以及 Markdown 报告生成逻辑。
    // ==========================================================================

    const TraceMoeService = {
        /**
         * 执行搜番核心业务逻辑
         * * @param {Object} params - 用户输入的参数对象
         * @param {string} params.image_url - 图片链接
         * @param {boolean} params.cut_borders - 是否裁剪黑边
         * @param {boolean} params.include_adult - 是否包含 R18 结果
         * @returns {Promise<string>} - 生成的 Markdown 格式搜索报告
         */
        search: async (params) => {
            // 步骤 1: 输入参数基本校验
            const imageUrl = params.image_url;
            if (!Utils.isValidUrl(imageUrl)) {
                throw new Error("提供的 URL 格式不正确。请提供以 http:// 或 https:// 开头的有效图片链接。");
            }

            // 步骤 2: 构造 API 请求参数
            // 注意：trace.moe 建议携带 anilistInfo 空参数以触发元数据关联
            const apiParams = {
                url: imageUrl,
                anilistInfo: "", // 必须携带此参数以获取番剧详细信息
                cutBorders: params.cut_borders === true ? "" : undefined
            };

            // 步骤 3: 调用网络层发起搜索请求
            const data = await HttpClient.request(CONFIG.API.ENDPOINTS.SEARCH, apiParams);

            // 步骤 4: 结果集空值处理
            if (!data.result || data.result.length === 0) {
                return "### 搜番结果\n\n> 🤷‍♂️ 未能找到任何匹配的动漫画面。";
            }

            // 步骤 5: 内容过滤 (敏感内容处理)
            let results = data.result;
            // 如果用户未显式开启 include_adult，则过滤掉 R18 结果
            if (!params.include_adult) {
                results = results.filter(item => {
                    // 检查 anilist 元数据中的 isAdult 标记
                    return !(item.anilist && item.anilist.isAdult);
                });
                
                // 如果过滤后结果为空，但原始结果不为空，提示用户
                if (results.length === 0 && data.result.length > 0) {
                    return "### 搜番结果\n\n> ⚠️ 已找到匹配结果，但均被标记为成人内容 (R18)。请开启 `include_adult` 参数以查看。";
                }
            }

            // 步骤 6: 调用展示层生成 Markdown 报告
            return TraceMoeService.generateSearchReport(results, imageUrl, data.frameCount);
        },

        /**
         * 生成搜索结果的 Markdown 报告
         * 将 API 返回的 JSON 数据转换为用户友好的图文排版。
         * * @param {Array} results - 过滤后的结果数组
         * @param {string} sourceUrl - 原始搜索图片的链接
         * @param {number} totalFrames - 数据库中被搜索的总帧数
         * @returns {string} - 格式化后的 Markdown 字符串
         */
        generateSearchReport: (results, sourceUrl, totalFrames) => {
            // 仅选取置信度最高的前 3 个结果，避免信息过载
            const topResults = results.slice(0, 3);
            
            // 构建报告头部
            let md = `### 🎬 以图搜番结果\n`;
            md += `> **数据源**: [Original Image](${sourceUrl}) | **搜索范围**: ${totalFrames || 'Unknown'} 帧\n\n`;

            // 遍历并渲染每个结果项
            topResults.forEach((item, index) => {
                const meta = item.anilist || {};
                const similarity = item.similarity;
                // 获取可视化的置信度对象
                const conf = Utils.getConfidenceLevel(similarity);
                
                // 标题处理优先级逻辑：原生标题 -> 罗马音 -> 英语 -> 默认占位符
                const titleNative = meta.title?.native || "未知标题";
                const titleRomaji = meta.title?.romaji || "";
                const titleEnglish = meta.title?.english || "";
                const primaryTitle = titleNative;
                
                // 处理剧集号与时间轴
                // 如果 episode 为空，通常是剧场版或 OVA
                const episode = item.episode ? `EP ${String(item.episode).padStart(2, '0')}` : "OVA/Movie";
                const timeStr = `${Utils.formatTimestamp(item.from)} - ${Utils.formatTimestamp(item.to)}`;
                
                // 成人内容标记
                const isAdult = meta.isAdult ? "🔞 **R-18**" : "";
                
                // 渲染结果标题行
                md += `#### ${index + 1}. ${primaryTitle} ${isAdult}\n`;
                
                // 渲染副标题信息
                if (titleRomaji) md += `* **Romaji**: ${titleRomaji}\n`;
                if (titleEnglish) md += `* **English**: ${titleEnglish}\n`;
                
                // 渲染匹配详情数据
                md += `* **匹配度**: ${conf.icon} **${(similarity * 100).toFixed(2)}%** (${conf.label})\n`;
                md += `* **定位**: ${episode} @ \`${timeStr}\`\n`;
                
                // 构建外部链接区域
                const links = [];
                if (meta.id) links.push(`[Anilist ID: ${meta.id}](${CONFIG.LINKS.ANILIST_ANIME}${meta.id})`);
                if (item.video) links.push(`[🎥 预览片段](${item.video})`);
                if (item.image) links.push(`[🖼️ 匹配截图](${item.image})`);
                
                md += `> ${links.join(" • ")}\n`;
                
                // 渲染结果预览图 (直接嵌入 Markdown 图片语法)
                md += `\n![Result Preview](${item.image})\n\n`;
                
                // 添加分割线 (最后一个结果除外)
                if (index < topResults.length - 1) {
                    md += `---\n\n`;
                }
            });

            // 添加底部免责声明
            md += `> *注意：预览视频链接具有时效性，且可能含有声音，请注意播放环境。*`;
            
            return md;
        },

        /**
         * 检查 API 配额状态
         * 调用 /me 接口获取当前 API Key 的使用限制和剩余量。
         * * @returns {Promise<string>} - 诊断报告的 Markdown 字符串
         */
        checkLimit: async () => {
            try {
                // 发起 API 请求
                const data = await HttpClient.request(CONFIG.API.ENDPOINTS.ME);
                
                // 判断当前使用的 Key 状态
                const keyStatus = Utils.getEnv("TRACE_MOE_KEY") ? "已配置 (Premium)" : "未配置 (Guest)";
                
                // 解析配额数据
                // trace.moe 返回字段说明:
                // quota: 本月总配额
                // quotaUsed: 本月已使用配额
                // concurrency: 允许的并发请求数
                const quotaTotal = data.quota || 0;
                const quotaUsed = data.quotaUsed || 0;
                const quotaLeft = quotaTotal - quotaUsed;
                // 计算使用百分比，保留一位小数
                const usagePercent = quotaTotal > 0 ? ((quotaUsed / quotaTotal) * 100).toFixed(1) : 0;
                
                // 开始构建 Markdown 报告
                let md = `### 📡 trace.moe 服务诊断报告\n\n`;
                
                // 构建状态概览表格
                md += `| 指标 (Metric) | 状态 (Status) | 说明 (Note) |\n`;
                md += `| :--- | :--- | :--- |\n`;
                md += `| **API Key** | ${keyStatus} | 身份标识 |\n`;
                md += `| **UID** | \`${data.id || 'Guest'}\` | 用户 ID |\n`;
                md += `| **并发限制** | ${data.concurrency || 1} 请求/秒 | 并行搜索能力 |\n`;
                
                // 生成 ASCII 进度条
                const barLength = 20;
                const filled = Math.round((quotaUsed / quotaTotal) * barLength);
                // 使用 Unicode 方块字符模拟进度条
                const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
                
                md += `\n#### 📊 配额使用情况 (本月)\n`;
                md += `\`[${bar}] ${usagePercent}%\`\n\n`;
                
                // 详细配额数据列表
                md += `* **总额度**: ${quotaTotal} 次\n`;
                md += `* **已使用**: ${quotaUsed} 次\n`;
                md += `* **剩余可用**: **${quotaLeft}** 次\n`;
                
                // 根据剩余量添加智能提示
                if (quotaLeft < 10 && quotaTotal > 0) {
                    md += `\n> ⚠️ **警告**: 您的配额即将耗尽，请考虑升级 API Key 或等待下月重置。`;
                } else if (!Utils.getEnv("TRACE_MOE_KEY")) {
                    md += `\n> 💡 **提示**: 当前处于访客模式，搜索配额较低且受 IP 限制。配置 API Key 可获得更高限额。`;
                }

                return md;

            } catch (error) {
                // 特殊错误处理：如果返回 403，明确提示 Key 配置问题
                if (error.message.includes("403")) {
                    return "### ❌ 诊断失败\n> **API Key 无效**。请检查环境变量 `TRACE_MOE_KEY` 的配置是否正确。";
                }
                // 其他错误向上抛出
                throw error;
            }
        }
    };

    // ==========================================================================
    // 5. 模块导出 (Public Interface)
    //    定义对外暴露的公共方法，这些方法将被宿主环境调用。
    // ==========================================================================

    return {
        /**
         * 搜索动漫 (对外工具方法)
         * 接收宿主传递的参数，执行搜索流程，并最终调用 complete 回调。
         * * @param {Object} params - 参数对象 {image_url, cut_borders, include_adult}
         */
        search_anime: async (params) => {
            try {
                // 记录调试日志
                console.log(`[AnimeSearch] Starting search for: ${params.image_url}`);
                
                // 执行核心搜索逻辑
                const resultMarkdown = await TraceMoeService.search(params);
                
                // 调用宿主环境的 complete 函数返回成功结果
                complete({
                    success: true,
                    message: "搜番任务执行完成",
                    data: resultMarkdown
                });
            } catch (error) {
                // 记录错误日志
                console.error(`[AnimeSearch] Error: ${error.message}`);
                
                // 调用宿主环境的 complete 函数返回失败结果
                // 在出错时也返回部分帮助信息，改善用户体验
                complete({
                    success: false,
                    message: `搜番失败: ${error.message}`,
                    data: `### 🚫 搜索中断\n错误详情: ${error.message}\n\n> 建议检查图片链接是否有效，或稍后重试。`
                });
            }
        },

        /**
         * 检查配额 (对外工具方法)
         * 接收宿主调用，执行诊断流程。
         */
        check_limit: async () => {
            try {
                // 执行诊断逻辑
                const resultMarkdown = await TraceMoeService.checkLimit();
                
                // 返回成功结果
                complete({
                    success: true,
                    message: "诊断完成",
                    data: resultMarkdown
                });
            } catch (error) {
                // 返回失败结果
                complete({
                    success: false,
                    message: `诊断失败: ${error.message}`
                });
            }
        }
    };
})();

/**
 * ==============================================================================
 * 模块导出定义
 * 将 IIFE 内部的公共方法挂载到 exports 对象上，供模块加载器使用。
 * ==============================================================================
 */
exports.search_anime = anime_search_impl.search_anime;
exports.check_limit = anime_search_impl.check_limit;