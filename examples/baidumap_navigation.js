/* METADATA
{
    "name": "baidumap_navigation",
    "version": "1.0",
    "display_name": {
        "zh": "百度地图导航",
        "en": "Baidu Map Navigation"
    },
    "description": {
        "zh": "百度地图导航工具包。集成路径规划、实时导航、地点搜索与查看功能，自动处理协议参数。",
        "en": "Baidu Map Toolkit. Integrates route planning, real-time navigation, place search, and map viewing with auto parameter handling."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "route_direction",
            "description": {
                "zh": "智能路径规划。提供公交、驾车、步行、骑行路线查询服务。支持使用地名或经纬度坐标作为起终点。",
                "en": "Smart route planning. Suitable for Transit, Driving, Walking, and Riding. Supports keywords or coordinates."
            },
            "parameters": [
                {
                    "name": "destination",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目的地。支持地名关键词（如 故宫）或经纬度坐标（如 39.988,116.432。注：百度标准为 纬度,经度）",
                        "en": "Destination. Format: 1. Keyword (e.g., 'Forbidden City'); 2. Lat/Lon (e.g., '39.988,116.432')."
                    }
                },
                {
                    "name": "mode",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "出行方式：driving(驾车-默认), transit(公交), walking(步行), riding(骑行)",
                        "en": "Mode: driving (default), transit, walking, riding"
                    }
                },
                {
                    "name": "origin",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "起点。若不填则默认以用户当前位置作为出发点。",
                        "en": "Origin. Leave empty to start from current location."
                    }
                },
                {
                    "name": "region",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "所属城市或区域（如 beijing），用于提高关键词搜索的准确度。",
                        "en": "City/Region (e.g., 'beijing'), improves keyword accuracy."
                    }
                }
            ]
        },
        {
            "name": "start_navigation",
            "description": {
                "zh": "实时GPS导航。提供驾车、骑行、步行的逐向导航服务。",
                "en": "Start GPS Real-time Navigation (Turn-by-turn). Supports Driving, Riding, Walking."
            },
            "parameters": [
                {
                    "name": "destination",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "终点关键词或坐标。在骑行或步行模式下，建议提供 纬度,经度 格式以确保直接进入导航。",
                        "en": "Destination keyword or coords. Note: Lat/Lon format strongly recommended for ride/walk."
                    }
                },
                {
                    "name": "mode",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "导航模式：driving(驾车-默认), walking(步行), riding(骑行)",
                        "en": "Navi Mode: driving (default), walking, riding"
                    }
                }
            ]
        },
        {
            "name": "search_place",
            "description": {
                "zh": "周边地点搜索。提供地图周边POI（兴趣点）搜索及详情查看服务。",
                "en": "Nearby search or place detail viewing."
            },
            "parameters": [
                {
                    "name": "query",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "搜索关键词（如 加油站, ATM）",
                        "en": "Search query (e.g., 'Gas Station', 'ATM')"
                    }
                },
                {
                    "name": "radius",
                    "type": "number",
                    "required": false,
                    "description": {
                        "zh": "搜索半径，单位为米，默认为 1000",
                        "en": "Search radius in meters, default 1000"
                    }
                }
            ]
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：百度地图导航工具包 (BAIDU MAP TOOLKIT)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本工具包基于百度地图 Android URI API 协议实现。
 * 具备自动处理必选参数（src、coord_type）、智能路径降级逻辑以及坐标格式标准化功能。
 * * 核心特性：
 * 1. 提供驾车、步行、骑行及公交的路径规划服务。
 * 2. 提供实时的实时 GPS 逐向导航引导。
 * 3. 提供基于地理位置的周边兴趣点检索服务。
 * * 版本：v1.0
 * 更新日期：2026-02-06
 * ==============================================================================
 */
const BAIDU_MAP_TOOLKIT = (function () {

    /**
     * 配置常量
     * 定义百度地图包名、Intent 动作、协议头及默认协议参数
     */
    const CONFIG = {
        PKG_MAIN     : 'com.baidu.BaiduMap',
        ACTION       : 'android.intent.action.VIEW',
        CAT          : 'android.intent.category.DEFAULT',
        SCHEME       : 'baidumap://',
        // 统计来源标识：andr.公司名.应用名
        DEFAULT_SRC  : 'andr.operit.toolkit',
        // 默认坐标系类型：bd09ll (百度经纬度坐标)
        DEFAULT_COORD: 'bd09ll' 
    };

    // ==========================================================================
    // 第一部分：内部工具函数
    // ==========================================================================

    /**
     * 参数序列化工具
     * 功能：将对象转换为 URL 查询字符串，并自动注入 src 和 coord_type 必选参数。
     * @param {Object} params - 待转换的键值对对象
     * @returns {string} 编码后的查询字符串
     */
    function buildQuery(params) {
        if (!params.src) params.src = CONFIG.DEFAULT_SRC;
        if (!params.coord_type) params.coord_type = CONFIG.DEFAULT_COORD;

        return Object.keys(params)
            .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
            .map(k => `${k}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    /**
     * 坐标标准化工具
     * 功能：识别输入字符串是否为坐标格式，并确保符合百度地图 纬度,经度 的规范。
     * @param {string} input - 地点名称或坐标字符串
     * @returns {string|null} 若为坐标则返回标准化字符串，否则返回 null
     */
    function normalizeLocation(input) {
        if (!input) return null;
        // 正则表达式：匹配 纬度,经度 格式
        const regex = /^(-?\d+\.?\d*)[,，\s]+(-?\d+\.?\d*)$/;
        const match = input.trim().match(regex);
        
        if (match) {
            return `${match[1]},${match[2]}`; 
        }
        return null;
    }

    /**
     * URI 构建工厂
     * 功能：根据百度地图 API 协议生成具体的 URI 调用地址。
     */
    const UrlBuilder = {
        /**
         * 生成路径规划 URI (Direction API)
         * 支持驾车、公交、步行、骑行。
         */
        direction: (dest, mode, origin, region) => {
            const params = {
                destination: dest,
                origin: origin,
                mode: mode || 'driving',
                region: region
            };
            return `${CONFIG.SCHEME}map/direction?${buildQuery(params)}`;
        },

        /**
         * 生成实时导航 URI (Navi API)
         * 提供驾车导航及高精度的骑行、步行导航。
         */
        navigation: (dest, mode, origin) => {
            const isCoord = normalizeLocation(dest) !== null;

            // 驾车导航：支持关键词或坐标
            if (mode === 'driving') {
                const params = { query: dest };
                return `${CONFIG.SCHEME}map/navi?${buildQuery(params)}`;
            }

            // 步行与骑行导航：协议要求必须显式提供起点与终点坐标
            // 若条件不满足，自动降级至路径规划（Direction）模式以确保可用性
            if ((mode === 'riding' || mode === 'walking') && isCoord && normalizeLocation(origin)) {
                const endpoint = mode === 'riding' ? 'bikenavi' : 'walknavi';
                const params = {
                    origin: origin,
                    destination: dest
                };
                return `${CONFIG.SCHEME}map/${endpoint}?${buildQuery(params)}`;
            }

            // 降级处理逻辑
            console.warn(`[BaiduMap] ${mode} 导航模式需要明确的起终点坐标，系统已自动切换至路径规划。`);
            return UrlBuilder.direction(dest, mode, origin);
        },

        /**
         * 生成周边搜索 URI (Search API)
         * 基于当前位置或指定位置检索 POI。
         */
        search: (query, radius) => {
            const params = {
                query: query,
                radius: radius || 1000
            };
            return `${CONFIG.SCHEME}map/place/nearby?${buildQuery(params)}`;
        }
    };

    /**
     * 系统 Intent 唤起逻辑
     * 功能：执行 Android 系统级调用，尝试启动百度地图客户端。
     * @param {string} uri - 完整的 baidumap:// 协议地址
     */
    async function callSystemIntent(uri) {
        const sys = globalThis.Tools?.System;
        if (!sys || !sys.intent) {
            throw new Error("当前系统环境缺失 System.intent 调用能力。");
        }

        const baseIntent = {
            action: CONFIG.ACTION,
            category: CONFIG.CAT,
            uri: uri,
            package: CONFIG.PKG_MAIN
        };

        const res = await sys.intent(baseIntent);
        return { executed: !!res, uri: uri };
    }

    // ==========================================================================
    // 第二部分：对外公开接口
    // ==========================================================================
    return {
        /**
         * 接口 1：执行路径规划
         * 服务于公交、驾车、步行、骑行路线的预览与选择。
         */
        routeDirection: async (params) => {
            try {
                const uri = UrlBuilder.direction(
                    params.destination, 
                    params.mode, 
                    params.origin, 
                    params.region
                );
                const res = await callSystemIntent(uri);
                
                complete({
                    success: res.executed,
                    message: res.executed ? `已成功唤起百度地图路径规划 (${params.mode || 'driving'})` : "唤起失败，请确认设备已安装百度地图客户端。",
                    uri: uri
                });
            } catch (err) {
                complete({ success: false, status: "error", message: err.message });
            }
        },

        /**
         * 接口 2：启动实时导航
         * 直接进入 GPS 导航模式。
         */
        startNavigation: async (params) => {
            try {
                const mode = (params.mode || 'driving').toLowerCase();
                // 导航模式下若未指定起点，则由 UrlBuilder 内部处理降级逻辑
                const uri = UrlBuilder.navigation(params.destination, mode, null);
                
                const res = await callSystemIntent(uri);
                complete({
                    success: res.executed,
                    message: res.executed ? `已成功唤起百度地图导航 (${mode})` : "唤起失败，请确认设备已安装百度地图客户端。",
                    uri: uri
                });
            } catch (err) {
                complete({ success: false, status: "error", message: err.message });
            }
        },

        /**
         * 接口 3：搜索周边地点
         * 展示关键词搜索结果列表。
         */
        searchPlace: async (params) => {
            try {
                const uri = UrlBuilder.search(params.query, params.radius);
                const res = await callSystemIntent(uri);
                complete({
                    success: res.executed,
                    message: res.executed ? `已启动百度地图搜索：${params.query}` : "唤起失败。",
                    uri: uri
                });
            } catch (err) {
                complete({ success: false, status: "error", message: err.message });
            }
        }
    };
})();

// ==============================================================================
// 模块导出定义
// ==============================================================================
exports.route_direction  = BAIDU_MAP_TOOLKIT.routeDirection;
exports.start_navigation = BAIDU_MAP_TOOLKIT.startNavigation;
exports.search_place     = BAIDU_MAP_TOOLKIT.searchPlace;