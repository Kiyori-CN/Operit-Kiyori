/* METADATA
{
    "name": "amap_navigation",
    "version": "1.0",
    "display_name": {
        "zh": "高德地图导航",
        "en": "Amap Navigation"
    },
    "description": {
        "zh": "高德地图导航工具包。智能识别坐标与地名，自动匹配驾车、骑行、步行、公交的最佳调用协议。",
        "en": "Amap Navigation Toolkit. Intelligently identifies coordinates vs keywords, automatically matching best schemes for driving, riding, walking, and transit."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "navigate_to",
            "description": {
                "zh": "智能唤起高德地图导航。支持经纬度直接导航或地名路径规划。",
                "en": "Smartly invoke Amap navigation. Supports direct navigation by coordinates or route planning by location name."
            },
            "parameters": [
                {
                    "name": "destination",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目的地。支持格式：1. 关键词 (如 天安门)；2. 经纬度 (如 116.397,39.909，建议顺序为：经度,纬度)",
                        "en": "Destination. Format: 1. Keyword (e.g., 'Tiananmen'); 2. Coordinates (e.g., '116.397,39.909', recommended: lon,lat)"
                    }
                },
                {
                    "name": "mode",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "出行方式：car(驾车-默认), bus(公交), walk(步行), ride(骑行/电单车)",
                        "en": "Travel mode: car (default), bus, walk, ride"
                    }
                },
                {
                    "name": "coord_type",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "仅当输入为坐标时生效。0:WGS84(GPS坐标), 1:GCJ02(高德/火星坐标)。不确定请填0。",
                        "en": "Effective only for coordinates. 0:WGS84, 1:GCJ02. Default 0."
                    }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "自检工具。验证高德地图导航工具包配置是否正常。",
                "en": "Self-test tool. Verify Amap navigation toolkit configuration."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：高德地图导航工具包 (AMAP NAVIGATION TOOLKIT)
 * ------------------------------------------------------------------------------
 * 功能陈述：
 * 1. 集成通过 Android Intent 唤起高德地图客户端的核心逻辑。
 * 2. 具备智能协议识别机制，根据输入类型（坐标或关键词）及出行方式自动选择最优 URI Scheme。
 * 3. 支持 WGS84 与 GCJ02 坐标系转换声明。
 * 4. 采用多包名兼容策略，覆盖主流设备及定制版高德地图。
 * 5. 提供驾车、骑行（含电单车）、步行及公交全场景路径规划支持。
 *
 * 版本：1.0
 * 运行环境：标准 Android 宿主环境
 * ==============================================================================
 */

const AMAP_NAVIGATION = (function () {

    /**
     * 全局配置常量
     * 维护高德地图相关的包名、意图动作以及不同版本的协议头
     */
    const CONFIG = {
        // 高德地图官方主包名
        PKG_MAIN   : 'com.autonavi.minimap',
        // 兼容性备用包名（含定制版或历史版本）
        PKG_ALTS   : ['com.autonavi.amap', 'com.amap.android.ams'],
        // 标准 Android 视图查看动作
        ACTION     : 'android.intent.action.VIEW',
        // 意图类别声明
        CAT        : 'android.intent.category.DEFAULT',
        // 来源应用标识，用于高德统计及合规调用
        SOURCE_APP : 'ThirdPartyTool',
        // 协议头定义
        SCHEME     : {
            OLD : 'androidamap://', // 传统协议：适用于直接导航与关键词搜索
            NEW : 'amapuri://'      // 新版组件协议：适用于骑行、步行及精细化路径规划
        }
    };



    var DEBUG = (function () {
        try { return (typeof getEnv === 'function' && getEnv('DEBUG') === 'true'); }
        catch (_) { return false; }
    })();

    function debugLog(msg) {
        if (DEBUG) console.log('[DEBUG] ' + msg);
    }

    async function _wrapExecution(coreFunc, params, actionName) {
        try {
            const result = await coreFunc(params);
            return complete({ success: true, message: actionName + ' 完成', data: result });
        } catch (error) {
            console.error('[Amap] ' + actionName + ' 失败: ' + error.message);
            return complete({ success: false, message: error.message || '执行失败', status: 'exception' });
        }
    }

    // ==========================================================================
    // 第一部分：内部工具函数库
    // ==========================================================================

    /**
     * 序列化查询参数
     * 功能：将 JSON 对象转换为符合 URL 规范的查询字符串，并过滤无效值
     * * @param   {Object} params - 待转换的键值对集合
     * @returns {string} 经过 URL 编码的参数字符串
     */
    function buildQuery(params) {
        return Object.keys(params)
            .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
            .map(k => `${k}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    /**
     * 坐标解析器
     * 功能：验证并提取字符串中的经纬度数值。支持经度在前、纬度在后的标准格式。
     * * @param   {string} input - 输入字符串，支持 "经度,纬度" 或 "经度 纬度"
     * @returns {{lon: string, lat: string}|null} 返回坐标对象，格式错误则返回 null
     */
    function parseCoordinates(input) {
        if (!input) return null;
        const regex = /^(-?\d+\.?\d*)[,，\s]+(-?\d+\.?\d*)$/;
        const match = input.trim().match(regex);
        if (match) {
            return { lon: match[1], lat: match[2] };
        }
        return null;
    }

    function truncateContent(content, maxLen) {
        if (!content) return '';
        var limit = maxLen || 15000;
        if (content.length <= limit) return content;
        return content.substring(0, limit) + '\n\n*(内容已截断至 ' + limit + ' 字符)*';
    }

    /**
     * URL 构建工厂
     * 功能：针对不同的出行策略生成高德地图专用的 URI 链接
     */
    const UrlBuilder = {
        /**
         * 场景 A：基于坐标的驾车直接导航
         * 采用 androidamap://navi 协议
         */
        driveByCoord: (lon, lat, dev = 0) => {
            const params = {
                sourceApplication : CONFIG.SOURCE_APP,
                poiname           : '目的地', // 默认终点名称
                lat               : lat,
                lon               : lon,
                dev               : dev, // 是否偏移(0:WGS84, 1:GCJ02)
                style             : 2    // 路线偏好：2 代表距离最短
            };
            return `${CONFIG.SCHEME.OLD}navi?${buildQuery(params)}`;
        },

        /**
         * 场景 B：基于坐标的骑行或步行导航
         * 采用 amapuri://openFeature 组件化协议
         * 特性：针对骑行模式默认启用电单车路径规划
         */
        rideOrWalkByCoord: (lon, lat, mode, dev = 0) => {
            const featureName = (mode === 'walk') ? 'OnFootNavi' : 'OnRideNavi';
            const params = {
                featureName       : featureName,
                sourceApplication : CONFIG.SOURCE_APP,
                lat               : lat,
                lon               : lon,
                dev               : dev
            };
            // 若为骑行模式，指定骑行类型为电单车 (elebike)
            if (mode === 'ride') params.rideType = 'elebike'; 
            
            return `${CONFIG.SCHEME.NEW}openFeature?${buildQuery(params)}`;
        },

        /**
         * 场景 C：基于关键词的驾车直接导航
         * 采用 androidamap://keywordNavi 协议
         */
        driveByKeyword: (keyword) => {
            const params = {
                sourceApplication : CONFIG.SOURCE_APP,
                keyword           : keyword,
                style             : 2
            };
            return `${CONFIG.SCHEME.OLD}keywordNavi?${buildQuery(params)}`;
        },

        /**
         * 场景 D：多模式路径规划（通用兜底）
         * 采用 amapuri://route/plan 协议
         * 特性：支持公交模式及关键词转路径规划
         */
        routePlan: (dname, mode, coords = null, dev = 0) => {
            // 高德路径规划模式映射：0:驾车, 1:公交, 2:步行, 3:骑行
            const modeMap = { 'car': 0, 'bus': 1, 'walk': 2, 'ride': 3 };
            const params = {
                sourceApplication : CONFIG.SOURCE_APP,
                dname             : dname,
                dev               : dev,
                t                 : modeMap[mode] !== undefined ? modeMap[mode] : 0
            };

            // 若提供了精确坐标，注入终点坐标参数以提高规划准确度
            if (coords) {
                params.dlat = coords.lat;
                params.dlon = coords.lon;
            }

            return `${CONFIG.SCHEME.NEW}route/plan/?${buildQuery(params)}`;
        }
    };

    /**
     * 系统级意图发送逻辑
     * 功能：执行三级降级唤起策略。
     * 策略 1：显式指定主包名唤起。
     * 策略 2：循环尝试备用包名。
     * 策略 3：无包名隐式意图唤起（由系统分发）。
     * * @param {string} uri - 生成的高德协议地址
     * @returns {Promise<{executed: boolean, package?: string}>} 唤起结果状态
     */
    async function callSystemIntent(uri) {
        const sys = globalThis.Tools?.System;
        if (!sys || !sys.intent) {
            throw new Error("当前系统环境未提供有效的 System.intent 接口。");
        }

        const baseIntent = {
            action   : CONFIG.ACTION,
            category : CONFIG.CAT,
            uri      : uri
        };

        // 尝试通过官方主包名启动
        let res = await sys.intent({ ...baseIntent, package: CONFIG.PKG_MAIN });
        if (res) return { executed: true, package: CONFIG.PKG_MAIN };

        // 尝试通过备用包名列表启动
        for (const pkg of CONFIG.PKG_ALTS) {
            res = await sys.intent({ ...baseIntent, package: pkg });
            if (res) return { executed: true, package: pkg };
        }

        // 隐式意图唤起：由系统弹出应用选择框或使用默认开启应用
        res = await sys.intent(baseIntent);
        if (res) return { executed: true, package: 'auto_matching' };

        return { executed: false };
    }

    // ==========================================================================
    // 第二部分：外部公开接口
    // ==========================================================================

    async function _wrapExecution(coreFunc, params, actionName) {
        try {
            await coreFunc(params);
        } catch (error) {
            console.error('[Amap] ' + actionName + ' 失败: ' + error.message);
            complete({ success: false, message: error.message || '执行失败', status: 'exception' });
        }
    }

    async function _testCore() {
        const sys = globalThis.Tools?.System;
        if (!sys || !sys.intent) {
            throw new Error('System.intent 接口不可用');
        }
        complete({
            success: true,
            message: '✅ 高德地图导航工具包配置正常',
            data: { packages: [CONFIG.PKG_MAIN, ...CONFIG.PKG_ALTS] }
        });
    }

    return {
        navigate_to: async (params) => {
            try {
                // --- 1. 参数校验与规范化处理 ---
                if (!params || typeof params !== 'object') {
                    throw new Error("参数格式错误：params 必须为对象。");
                }
                
                const dest = params.destination;
                if (!dest || typeof dest !== 'string' || dest.trim() === '') {
                    throw new Error("必填参数 destination 为空或格式错误，操作已终止。");
                }
                
                // 校验 mode 参数
                const validModes = ['car', 'bus', 'walk', 'ride'];
                const mode = (params.mode || 'car').toLowerCase();
                if (!validModes.includes(mode)) {
                    throw new Error(`出行方式参数错误：mode 必须为 ${validModes.join('/')} 之一。`);
                }
                
                // 校验 coord_type 参数
                if (params.coord_type !== undefined && params.coord_type !== 0 && params.coord_type !== 1) {
                    throw new Error("坐标类型参数错误：coord_type 必须为 0(WGS84) 或 1(GCJ02)。");
                }
                
                const dev  = (params.coord_type === 1) ? 1 : 0; // 严格限制为 0 或 1

                // --- 2. 解析输入并决定路由策略 ---
                const coords = parseCoordinates(dest);
                let finalUri = '';
                let strategyDescription = '';

                if (coords) {
                    // 输入为经纬度坐标时的逻辑分支
                    strategyDescription = `坐标导航模式 [方式: ${mode}]`;
                    
                    if (mode === 'car') {
                        finalUri = UrlBuilder.driveByCoord(coords.lon, coords.lat, dev);
                    } else if (mode === 'walk' || mode === 'ride') {
                        finalUri = UrlBuilder.rideOrWalkByCoord(coords.lon, coords.lat, mode, dev);
                    } else {
                        // 公交模式或其它模式，回退至路径规划接口
                        finalUri = UrlBuilder.routePlan('目的地', mode, coords, dev);
                    }
                } else {
                    // 输入为地点关键词时的逻辑分支
                    strategyDescription = `关键词导航模式 [方式: ${mode}]`;
                    
                    if (mode === 'car') {
                        finalUri = UrlBuilder.driveByKeyword(dest);
                    } else {
                        // 非驾车场景下，关键词输入统一走路径规划协议
                        finalUri = UrlBuilder.routePlan(dest, mode);
                    }
                }

                // --- 3. 记录日志并执行系统调用 ---
                console.log(`[Amap Service] 匹配策略: ${strategyDescription}`);
                console.log(`[Amap Service] 目标 URI: ${finalUri}`);
                
                const result = await callSystemIntent(finalUri);

                // --- 4. 返回结果回调 ---
                if (result.executed) {
                    complete({
                        success: true,
                        message: `成功唤起高德地图，当前模式：${mode}`,
                        data: {
                            mode: mode,
                            type: coords ? 'coordinate' : 'keyword',
                            package: result.package,
                            uri: finalUri
                        }
                    });
                } else {
                    complete({
                        success: false,
                        message: "无法启动高德地图。请检查设备是否安装高德地图客户端。",
                        uri: finalUri
                    });
                }

            } catch (err) {
                console.error(`[Amap Service Error] 异常详情: ${err.message}`);
                complete({
                    success: false,
                    status: "exception",
                    message: err.message || "执行导航请求时发生未预期错误。"
                });
            }
        },
        test: () => _wrapExecution(_testCore, {}, '自检')
    };
})();

/**
 * ==============================================================================
 * 模块导出定义
 * ==============================================================================
 */
exports.navigate_to = AMAP_NAVIGATION.navigate_to;
exports.test = AMAP_NAVIGATION.test;