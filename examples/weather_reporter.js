/* METADATA
{
    "name": "weather_reporter",
    "version": "1.0",
    "display_name": {
        "zh": "和风天气",
        "en": "QWeather Reporter"
    },
    "description": {
        "zh": "和风天气工具包。提供实时天气、空气质量、气象预警、生活建议指数及多日预报功能。需在环境变量中配置 WeatherUrl（反向代理或官方域名）、WeatherKey（API 密钥）和 VarCity（默认城市）。获取密钥：https://dev.qweather.com/",
        "en": "QWeather toolkit. Provides real-time weather, AQI, meteorological warnings, lifestyle indices, and multi-day forecasts. Requires WeatherUrl (reverse proxy or official domain), WeatherKey (API key), and VarCity (default city) in env. Get key: https://dev.qweather.com/"
    },
    "author": "Operit Community",
    "category": "Admin",
    "env": [
        {
            "name": "WEATHERURL",
            "description": {
                "zh": "和风天气 API 地址（必填）。可填官方域名 devapi.qweather.com，或填写自建反向代理地址（格式：https://your-proxy.example.com）。工具包会自动补全 https:// 协议头",
                "en": "QWeather API base URL (required). Use official domain devapi.qweather.com or your own reverse proxy (e.g., https://your-proxy.example.com). Protocol prefix is auto-added if missing."
            },
            "required": true
        },
        {
            "name": "WEATHERKEY",
            "description": {
                "zh": "和风天气 API 密钥（必填）。在 https://dev.qweather.com/ 注册后获取",
                "en": "QWeather API key (required). Get yours at https://dev.qweather.com/"
            },
            "required": true
        },
        {
            "name": "VARCITY",
            "description": {
                "zh": "默认城市名称（可选）。当工具调用时未指定 city 参数时使用此城市。支持中文城市名（如：北京）",
                "en": "Default city name (optional). Used when city parameter is not specified in tool calls. Supports Chinese city names (e.g., Beijing)."
            },
            "required": false
        }
    ],
    "tools": [
        {
            "name": "get_full_weather_report",
            "description": { "zh": "获取完整的实时天气、空气质量、预警及生活建议。", "en": "Get full real-time weather, AQI, warnings, and indices." },
            "parameters": [
                { "name": "city", "description": { "zh": "目标城市名称，若缺省则使用系统默认城市", "en": "Target city name" }, "type": "string", "required": false }
            ]
        },
        {
            "name": "get_forecast",
            "description": { "zh": "获取未来多日天气预报表格。", "en": "Get multi-day weather forecast table." },
            "parameters": [
                { "name": "city", "description": { "zh": "目标城市名称", "en": "City name" }, "type": "string", "required": false },
                { "name": "days", "description": { "zh": "预报天数，支持 3, 7, 10, 15", "en": "Days" }, "type": "number", "required": false, "default": 7 }
            ]
        },
        {
            "name": "test",
            "description": { "zh": "测试和风天气 API 连通性。验证 API Key 有效性、网络可达性及服务响应延迟，返回诊断报告。适用于首次配置后的连通性验证与故障排查。", "en": "Test QWeather API connectivity." },
            "parameters": []
        }
    ]
}
*/

/**
 * ------------------------------------------------------------------------------
 * 模块名称：和风天气核心实现 (Weather Reporter Implementation)
 * ------------------------------------------------------------------------------
 * 版本：v1.0
 * 驱动：基于和风天气 (QWeather) 标准 REST API
 * 功能：
 * 1. 具备内存级城市 ID 缓存机制，减少地理逆查询请求，提升响应速度。
 * 2. 具备多维度气象数据并发异步请求能力，同步聚合实况、空气、指数与预警。
 * 3. 具备预报周期自适应匹配逻辑，根据天数自动切换 API 阶梯路径。
 * 4. 支持反向代理配置，自动补全协议头与路径规范化，适配国内网络环境。
 * ------------------------------------------------------------------------------
 */
const weather_reporter_impl = (function () {

    // --------------------------------------------------------------------------
    // 基础配置与环境初始化
    // --------------------------------------------------------------------------
    
    // --------------------------------------------------------------------------
    // 配置常量
    // --------------------------------------------------------------------------
    const CONFIG = {
        MAX_OUTPUT_LENGTH: 15000,
        DEFAULT_FORECAST_DAYS: 7,
        TEST_LOCATION_ID: '101010100',
        USER_AGENT: 'WeatherReporter/1.0 (Operit)',
        INDICES_TYPES: '1,3,5'
    };

    const DEBUG = getEnv("WeatherDebug") === "true";

    const client       = OkHttp.newClient();
    const KEY          = getEnv("WeatherKey");
    const RAW_URL      = getEnv("WeatherUrl") || "";
    const DEFAULT_CITY = getEnv("VarCity");

    if (DEBUG) console.log("[Weather] 环境变量加载完成 | KEY: " + (KEY ? "已配置" : "未配置") + " | URL: " + (RAW_URL || "未配置"));

    // URL 规范化处理：确保包含协议头并移除冗余斜杠
    const BASE_URL = RAW_URL.startsWith('http') 
        ? RAW_URL.replace(/\/+$/, "") 
        : `https://${RAW_URL.replace(/\/+$/, "")}`;

    /**
     * 城市信息缓存池
     * 功能：存储已查询城市的地理信息对象，避免重复调用 GeoAPI 以优化性能。
     */
    const ID_CACHE = new Map();

    // --------------------------------------------------------------------------
    // 内部私有工具函数
    // --------------------------------------------------------------------------

    /**
     * 网络请求封装工具
     * 功能：执行带有鉴权信息的 HTTP GET 请求，并处理和风天气的业务状态码。
     * @param {string} path - 接口端点路径
     * @param {Object} queryParams - 业务查询参数
     * @returns {Promise<Object>} 解析后的 JSON 数据
     */
    async function fastFetch(path, queryParams = {}) {
        if (!KEY || !BASE_URL) {
            throw new Error("关键环境变量 WeatherKey 或 WeatherUrl 未配置");
        }
        
        // 构建包含 API Key 的查询字符串
        const query = Object.entries({ ...queryParams, key: KEY })
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&");
        
        const finalUrl = `${BASE_URL}${path}?${query}`;
        if (DEBUG) console.log("[Weather] 请求 API: " + path);
        const res = await client.newRequest()
            .url(finalUrl)
            .method('GET')
            .header('User-Agent', CONFIG.USER_AGENT)
            .header('Accept', 'application/json')
            .build()
            .execute();
        
        if (!res.isSuccessful()) {
            throw new Error(`HTTP 异常状态码: ${res.statusCode}`);
        }
        
        const data = JSON.parse(res.content || "{}");
        
        // 校验业务逻辑状态码：200 表示成功，204 表示请求成功但该地区无数据
        if (data.code !== '200' && data.code !== '204') {
            throw new Error(`和风天气 API 业务错误码: ${data.code}`);
        }
        return data;
    }

    /**
     * 城市地理信息检索工具
     * 功能：实现 缓存检索 -> 网络降级查询 -> 同步缓存 的闭环逻辑。
     * @param {string} name - 城市名称
     */
    async function getCityId(name) {
        const target = name || DEFAULT_CITY;
        if (!target) {
            throw new Error("未指定城市名称且默认城市环境变量不存在");
        }
        
        // 优先从内存缓存中提取数据
        if (ID_CACHE.has(target)) {
            if (DEBUG) console.log("[Weather] 缓存命中: " + target);
            return ID_CACHE.get(target);
        }

        // 调用地理逆查询接口获取城市标识符 (Location ID)
        const res = await fastFetch("/geo/v2/city/lookup", { location: target });
        const cityInfo = res.location[0];
        
        // 将获取到的城市信息写入缓存池
        ID_CACHE.set(target, cityInfo);
        return cityInfo;
    }

    // --------------------------------------------------------------------------
    // 核心业务逻辑导出
    // --------------------------------------------------------------------------

    /**
     * 格式化测试报告
     */
    function formatTestReport(result) {
        let report = '## 和风天气 API 连通性测试\n\n';
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

    function truncateContent(content, maxLen) {
        if (!content) return '';
        var limit = maxLen || 15000;
        if (content.length <= limit) return content;
        return content.substring(0, limit) + '\n\n*(内容已截断至 ' + limit + ' 字符)*';
    }

    /**
     * 参数校验工具
     * 功能：验证必需参数是否存在且类型正确
     */
    function validateParams(params, rules) {
        for (var key in rules) {
            var rule = rules[key];
            if (rule.required && (params[key] === undefined || params[key] === null)) {
                throw new Error('缺少必需参数: ' + key);
            }
            if (params[key] !== undefined && rule.type && typeof params[key] !== rule.type) {
                throw new Error('参数 ' + key + ' 类型错误，期望 ' + rule.type + '，实际 ' + typeof params[key]);
            }
        }
    }

    /**
     * 统一错误处理包装器
     * 功能：封装核心逻辑，统一处理成功/失败响应
     */
    async function wrapExecution(coreFunc, params, actionName) {
        try {
            const result = await coreFunc(params);
            return complete({ success: true, message: actionName + ' 完成', data: result });
        } catch (error) {
            console.error('[Weather] ' + actionName + ' 失败: ' + error.message);
            return complete({ success: false, message: actionName + ' 失败: ' + error.message });
        }
    }

    return {
        /**
         * 功能 1：生成全维度气象报告
         * 实现：利用 Promise.all 进行极速并发调度，同时获取实时天气、空气、预警及指数。
         */
        runFullReport: async (p) => {
            try {
                validateParams(p || {}, {
                    city: { required: false, type: 'string' }
                });
                const city = await getCityId(p.city);
                const loc  = { location: city.id };

                // 执行并发数据采集
                const [now, air, warn, indices] = await Promise.all([
                    fastFetch("/v7/weather/now", loc),
                    fastFetch("/v7/air/now",     loc),
                    fastFetch("/v7/warning/now", loc),
                    fastFetch("/v7/indices/1d",  { ...loc, type: CONFIG.INDICES_TYPES }) // 1:运动, 3:穿衣, 5:紫外线
                ]);

                // 结构化 Markdown 文档组装
                let out = `## [天气报告] ${city.name}\n---\n`;
                out += `* 状态: ${now.now.text} | 温度: ${now.now.temp}摄氏度 (体感 ${now.now.feelsLike}摄氏度)\n`;
                out += `* 空气: ${(air.now && air.now.category) ? air.now.category : '未知'} (AQI: ${(air.now && air.now.aqi) ? air.now.aqi : '-'})\n`;
                out += `* 风力: ${now.now.windDir}${now.now.windScale}级, 湿度: ${now.now.humidity}%\n`;
                
                if (indices.daily) {
                    out += `* 建议: ${indices.daily.map(i => i.category).join(' | ')}\n`;
                }
                
                if (warn.warning && warn.warning.length > 0) {
                    out += `\n> [气象预警] ${warn.warning.map(w => w.title).join(' | ')}\n`;
                }

                complete({ success: true, message: `${city.name} 数据更新完成`, data: truncateContent(out, CONFIG.MAX_OUTPUT_LENGTH) });
            } catch (e) {
                complete({ success: false, message: `气象报告获取失败: ${e.message}` });
            }
        },

        /**
         * 功能 2：生成多日气象预报表格
         * 实现：根据用户需求天数，动态计算并选择对应的 API 路由 (3d/7d/10d/15d)。
         */
        runForecast: async (p) => {
            try {
                validateParams(p || {}, {
                    city: { required: false, type: 'string' },
                    days: { required: false, type: 'number' }
                });
                const city = await getCityId(p.city);
                const days = p.days || CONFIG.DEFAULT_FORECAST_DAYS;
                
                // 动态计算 API 路径：和风天气通过路径标识预报周期天数
                const endpoint = `/v7/weather/${days > 10 ? 15 : (days > 7 ? 10 : (days > 3 ? 7 : 3))}d`;

                const res = await fastFetch(endpoint, { location: city.id });
                
                // 构建多日预报数据表格
                let table = `### [多日预报] ${city.name} ${days}日数据\n\n| 日期 | 天气状况 | 温度区间 | 风向描述 |\n| :--- | :--- | :--- | :--- |\n`;
                table += res.daily
                    .slice(0, days) // 截取用户指定的具体天数
                    .map(d => `| ${d.fxDate} | ${d.textDay} | ${d.tempMin}至${d.tempMax}摄氏度 | ${d.windDirDay} |`)
                    .join('\n');

                complete({ success: true, data: truncateContent(table, CONFIG.MAX_OUTPUT_LENGTH) });
            } catch (e) {
                complete({ success: false, message: `预报数据获取失败: ${e.message}` });
            }
        },

        /**
         * 功能 3：API 连通性测试
         */
        runTest: async () => {
            const startTime = Date.now();
            
            try {
                if (!KEY || !BASE_URL) {
                    const latency = Date.now() - startTime;
                    complete({
                        success: false,
                        message: '环境变量未配置',
                        data: formatTestReport({
                            connected: false,
                            latency: latency,
                            apiUrl: BASE_URL || '未配置',
                            keyPreview: KEY ? '已配置' : '未配置',
                            error: '请在 Operit 设置 → 环境变量中添加 WeatherKey 和 WeatherUrl'
                        })
                    });
                    return;;
                }

                // 执行最小化测试请求：获取北京实时天气
                const res = await fastFetch('/v7/weather/now', { location: CONFIG.TEST_LOCATION_ID });
                const latency = Date.now() - startTime;

                complete({
                    success: true,
                    message: `连接成功，响应延迟 ${latency} ms`,
                    data: formatTestReport({
                        connected: true,
                        latency: latency,
                        apiUrl: BASE_URL,
                        keyPreview: '已配置',
                        error: null
                    }),
                    meta: { latency_ms: latency }
                });
            } catch (e) {
                const latency = Date.now() - startTime;
                complete({
                    success: false,
                    message: `连接测试失败: ${e.message}`,
                    data: formatTestReport({
                        connected: false,
                        latency: latency,
                        apiUrl: BASE_URL,
                        keyPreview: KEY ? '已配置' : '未配置',
                        error: e.message
                    })
                });
            }
        }
    };
})();

// --------------------------------------------------------------------------
// 模块导出映射
// --------------------------------------------------------------------------

exports.get_full_weather_report = weather_reporter_impl.runFullReport;
exports.get_forecast            = weather_reporter_impl.runForecast;
exports.test                    = weather_reporter_impl.runTest;