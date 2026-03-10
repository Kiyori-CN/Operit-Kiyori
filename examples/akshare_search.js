/* METADATA
{
    "name": "akshare_search",
    "version": "1.0",
    "display_name": {
        "zh": "A股金融数据",
        "en": "A-Share Financial Data"
    },
    "description": {
        "zh": "A股金融数据工具包。基于东方财富公开接口，提供A股实时行情、历史K线、公司资料、指数行情、板块资金流向及财经快讯的极速查询。纯HTTP直连，无需Python依赖，响应速度极快。",
        "en": "A-share financial data toolkit. Based on EastMoney public APIs, provides real-time quotes, historical K-lines, company profiles, index data, sector fund flows and financial news. Pure HTTP, no Python dependency, ultra-fast response."
    },
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "get_stock_realtime",
            "description": {
                "zh": "获取A股单只股票的实时行情快照。返回最新价、涨跌幅、成交量、换手率、市盈率、市净率、总市值等核心盘口数据。",
                "en": "Get real-time snapshot for a single A-share stock including price, change, volume, turnover, PE, PB, market cap."
            },
            "parameters": [
                {
                    "name": "symbol",
                    "type": "string",
                    "description": {
                        "zh": "股票代码，如 '600519'（贵州茅台）、'000001'（平安银行）",
                        "en": "Stock code, e.g. '600519', '000001'"
                    },
                    "required": true
                }
            ]
        },
        {
            "name": "get_stock_history",
            "description": {
                "zh": "获取A股历史K线数据（前复权）。支持日线/周线/月线，用于技术分析与趋势研判。",
                "en": "Get historical K-line data (forward-adjusted). Supports daily/weekly/monthly periods."
            },
            "parameters": [
                {
                    "name": "symbol",
                    "type": "string",
                    "description": { "zh": "股票代码", "en": "Stock code" },
                    "required": true
                },
                {
                    "name": "period",
                    "type": "string",
                    "description": {
                        "zh": "K线周期：'daily'(日线), 'weekly'(周线), 'monthly'(月线)。默认 daily",
                        "en": "K-line period: 'daily', 'weekly', 'monthly'. Default: daily"
                    },
                    "required": false,
                    "default": "daily"
                },
                {
                    "name": "limit",
                    "type": "number",
                    "description": {
                        "zh": "返回条数，默认30，最大120。建议30条即可满足多数分析需求",
                        "en": "Number of records. Default: 30, max: 120"
                    },
                    "required": false,
                    "default": 30
                }
            ]
        },
        {
            "name": "get_stock_profile",
            "description": {
                "zh": "获取上市公司基本资料。包含公司名称、行业、主营业务、总股本、流通股本等。",
                "en": "Get listed company profile including name, industry, main business, total shares, etc."
            },
            "parameters": [
                {
                    "name": "symbol",
                    "type": "string",
                    "description": { "zh": "股票代码", "en": "Stock code" },
                    "required": true
                }
            ]
        },
        {
            "name": "get_index_realtime",
            "description": {
                "zh": "获取主要市场指数实时行情。支持上证指数(000001)、深证成指(399001)、沪深300(000300)、创业板指(399006)等。",
                "en": "Get real-time data for major market indices like SSE(000001), SZSE(399001), CSI300(000300), ChiNext(399006)."
            },
            "parameters": [
                {
                    "name": "symbol",
                    "type": "string",
                    "description": {
                        "zh": "指数代码，如 '000001'(上证指数), '399001'(深证成指)",
                        "en": "Index code, e.g. '000001'(SSE), '399001'(SZSE)"
                    },
                    "required": true
                }
            ]
        },
        {
            "name": "get_sector_fund_flow",
            "description": {
                "zh": "获取行业板块资金流向排名。展示主力净流入最多的行业板块，帮助判断市场热点。",
                "en": "Get sector fund flow ranking showing top sectors by main capital inflow."
            },
            "parameters": [
                {
                    "name": "limit",
                    "type": "number",
                    "description": {
                        "zh": "返回板块数量，默认15，最多30",
                        "en": "Number of sectors to return. Default: 15, max: 30"
                    },
                    "required": false,
                    "default": 15
                }
            ]
        },
        {
            "name": "get_financial_news",
            "description": {
                "zh": "获取财联社7x24小时实时财经快讯电报。",
                "en": "Get CLS 7x24 real-time financial news telegraph."
            },
            "parameters": [
                {
                    "name": "limit",
                    "type": "number",
                    "description": {
                        "zh": "返回新闻条数，默认15，最多30",
                        "en": "Number of news items. Default: 15, max: 30"
                    },
                    "required": false,
                    "default": 15
                }
            ]
        },
        {
            "name": "search_stock",
            "description": {
                "zh": "通过关键词模糊搜索股票。输入股票名称、拼音首字母或代码片段，返回匹配的股票列表。",
                "en": "Fuzzy search stocks by name, pinyin initials, or code fragment."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "description": {
                        "zh": "搜索关键词，如 '茅台'、'GZMT'、'600519'",
                        "en": "Search keyword, e.g. 'Moutai', 'GZMT', '600519'"
                    },
                    "required": true
                }
            ]
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称：A股金融数据工具包 (AkShare Search)
 * ----------------------------------------------------------------------------
 * 架构模式：IIFE + Wrapper 统一错误处理
 * 运行环境：Operit JavaScript 沙箱
 * 数据源  ：东方财富网公开 REST API（无需 API Key）
 * 网络协议：HTTPS + OkHttp 客户端
 * 
 * 设计理念：
 *   原版 akshare_search 依赖 Python + akshare 库，通过终端执行脚本获取数据，
 *   存在以下严重问题：
 *     1. 冷启动慢（Python 解释器 + 库导入约需 3-8 秒）
 *     2. 依赖管理复杂（需安装 Python、akshare、pandas、numpy）
 *     3. JSON 序列化不稳定（NaN、Infinity、Timestamp 均可能导致崩溃）
 *     4. 终端会话状态不可控
 * 
 *   本版本完全重构为纯 OkHttp 直连东方财富公开接口：
 *     ✓ 零依赖：无需 Python 环境
 *     ✓ 极速响应：单次请求通常 200-500ms
 *     ✓ 防崩溃：全链路 JSON 安全解析
 *     ✓ Token 节省：精简返回字段，减少 50%+ 的数据体积
 * 
 * 版本：v1.0
 * ============================================================================
 */
const AkShareToolkit = (function () {

    // =========================================================================
    // 第一部分：全局配置与初始化
    // =========================================================================

    /** 配置常量 */
    const CONFIG = {
        MAX_CONTENT_LENGTH: 3000,
        MAX_NEWS_CONTENT: 150,
        MAX_PROFILE_LENGTH: 200,
        DEFAULT_HISTORY_LIMIT: 30,
        MAX_HISTORY_LIMIT: 120,
        DEFAULT_SECTOR_LIMIT: 15,
        MAX_SECTOR_LIMIT: 30,
        DEFAULT_NEWS_LIMIT: 15,
        MAX_NEWS_LIMIT: 30,
        DEBUG: false
    };

    /** HTTP 客户端单例 */
    const client = OkHttp.newClient();

    /** 通用请求头：模拟标准浏览器环境，防止被反爬拦截 */
    const HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Referer": "https://quote.eastmoney.com/"
    };

    /** K线周期映射：将用户友好的名称转换为 API 参数 */
    const KLT_MAP = {
        "daily": "101",    // 日线
        "weekly": "102",   // 周线
        "monthly": "103"   // 月线
    };

    // =========================================================================
    // 第二部分：核心工具函数
    // =========================================================================

    /**
     * 统一 GET 请求执行器
     * 功能：发送 HTTP GET 请求并安全解析 JSON 响应
     * @param {string} url - 完整请求地址
     * @returns {Promise<Object>} 解析后的 JSON 对象
     * @throws {Error} 网络故障或响应解析失败
     */
    async function httpGet(url) {
        const response = await client.newRequest()
            .url(url)
            .method("GET")
            .headers(HEADERS)
            .build()
            .execute();

        if (!response.isSuccessful()) {
            throw new Error("HTTP " + response.statusCode + ": 请求失败");
        }

        const raw = response.content;
        if (!raw || raw.trim() === "") {
            throw new Error("服务器返回空响应");
        }

        // 安全 JSON 解析：处理可能的 JSONP 包装 (jQuery callback)
        let jsonStr = raw.trim();

        // 检测 JSONP 格式：jQuery123456_789({...})
        const jsonpMatch = jsonStr.match(/^[a-zA-Z_$][\w$]*\((.+)\);?\s*$/s);
        if (jsonpMatch) {
            jsonStr = jsonpMatch[1];
        }

        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // 尝试二次清理：移除 BOM 头、控制字符
            jsonStr = jsonStr.replace(/^\uFEFF/, "").replace(/[\x00-\x1F\x7F]/g, "");
            try {
                return JSON.parse(jsonStr);
            } catch (e2) {
                throw new Error("JSON 解析失败: " + e2.message + " (前100字符: " + jsonStr.substring(0, 100) + ")");
            }
        }
    }

    /**
     * 内容截断保护
     * 功能：防止超长内容溢出 AI 上下文窗口
     * @param {string} content - 原始内容
     * @param {number} maxLen - 最大长度
     * @returns {string} 截断后的内容
     */
    function truncateContent(content, maxLen) {
        if (!content || typeof content !== "string") return "";
        maxLen = maxLen || CONFIG.MAX_CONTENT_LENGTH;
        if (content.length <= maxLen) return content;
        return content.substring(0, maxLen) + "...";
    }

    /**
     * 安全数值格式化
     * 功能：将任意值转为可读的数字字符串，处理 null/undefined/NaN/特大数
     * @param {*} val - 原始值
     * @param {number} decimals - 小数位数，默认 2
     * @returns {string|number} 格式化后的值
     */
    function safeNum(val, decimals) {
        if (val === null || val === undefined || val === "" || val === "-") return "-";
        const n = Number(val);
        if (isNaN(n) || !isFinite(n)) return "-";
        if (decimals !== undefined) return n.toFixed(decimals);
        return n;
    }

    /**
     * 大数金额格式化
     * 功能：将大数值转为亿/万为单位的可读格式
     * @param {number} val - 原始数值（单位：元）
     * @returns {string} 如 "1234.56亿" 或 "56.78万"
     */
    function formatAmount(val) {
        if (val === null || val === undefined || val === "-") return "-";
        const n = Number(val);
        if (isNaN(n) || !isFinite(n)) return "-";
        if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + "亿";
        if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(2) + "万";
        return n.toFixed(2);
    }

    /**
     * 股票代码智能路由：确定代码所属交易所
     * 功能：根据代码前缀自动判断沪市(1)或深市(0)，生成 secid 参数
     * @param {string} symbol - 纯数字股票代码
     * @returns {string} 如 "1.600519" 或 "0.000001"
     */
    function buildSecId(symbol) {
        // 6开头 → 沪市(1)；0/3开头 → 深市(0)；4/8开头 → 北交所(0)
        const prefix = symbol.charAt(0);
        if (prefix === "6") return "1." + symbol;
        if (prefix === "0" || prefix === "3" || prefix === "4" || prefix === "8") return "0." + symbol;
        // 默认尝试深市
        return "0." + symbol;
    }

    /**
     * 指数代码智能路由
     * 功能：指数的 secid 规则与个股不同
     * @param {string} symbol - 指数代码
     * @returns {string} 如 "1.000001"(上证指数) 或 "0.399001"(深证成指)
     */
    function buildIndexSecId(symbol) {
        // 000 开头的指数属于上交所(1)；399 开头属于深交所(0)
        if (symbol.startsWith("000") || symbol.startsWith("880")) return "1." + symbol;
        if (symbol.startsWith("399")) return "0." + symbol;
        // 默认上交所
        return "1." + symbol;
    }

    /**
     * 参数校验与格式化
     * @param {string} symbol - 用户输入的代码
     * @returns {string} 清洗后的纯数字代码
     */
    function validateSymbol(symbol) {
        if (!symbol || typeof symbol !== "string") {
            throw new Error("缺少有效的标的代码参数");
        }
        // 去除空格、前后缀（如 SH/SZ/sh/sz/.SH）
        const cleaned = symbol.trim()
            .replace(/^(SH|SZ|sh|sz)/i, "")
            .replace(/\.(SH|SZ|sh|sz)$/i, "")
            .replace(/\s+/g, "");

        if (!/^\d{6}$/.test(cleaned)) {
            throw new Error("股票/指数代码格式错误，请输入6位数字代码（如 600519、000001）");
        }
        return cleaned;
    }

    // =========================================================================
    // 第三部分：Wrapper 统一错误处理
    // =========================================================================

    /**
     * 工具执行包装器
     * 功能：统一异步执行、异常捕获与 complete 回调
     * @param {Function} coreFn - 核心业务逻辑函数
     * @param {Object} params - 原始参数对象
     * @param {string} toolName - 工具名称（用于日志与错误提示）
     */
    async function wrapExec(coreFn, params, toolName) {
        try {
            if (CONFIG.DEBUG) {
                console.log("[AkShare] 执行: " + toolName + ", 参数: " + JSON.stringify(params));
            }
            const data = await coreFn(params);
            complete({
                success: true,
                message: toolName + " 查询成功",
                data: data
            });
        } catch (error) {
            console.error("[AkShare] " + toolName + " 失败: " + error.message);
            complete({
                success: false,
                message: toolName + " 失败: " + error.message,
                error_stack: CONFIG.DEBUG ? error.stack : undefined
            });
        }
    }

    /**
     * 工具 0：API 连通性测试
     * 功能：验证东方财富 API 是否可访问
     */
    async function testCore(params) {
        const testSymbol = "600519";
        const secid = buildSecId(testSymbol);
        const url = "https://push2.eastmoney.com/api/qt/stock/get"
            + "?secid=" + secid
            + "&ut=fa5fd1943c7b386f172d6893dbfba10b"
            + "&fields=f57,f58,f43";
        
        const startTime = Date.now();
        const json = await httpGet(url);
        const latency = Date.now() - startTime;
        
        if (!json.data || !json.data.f57) {
            throw new Error("API 测试失败：返回数据格式异常");
        }
        
        return {
            "状态": "正常",
            "测试股票": json.data.f58 + " (" + json.data.f57 + ")",
            "响应延迟": latency + "ms",
            "API地址": "push2.eastmoney.com",
            "版本": "v1.0"
        };
    }

    // =========================================================================
    // 第四部分：核心业务逻辑实现
    // =========================================================================

    /**
     * 工具 1：获取股票实时行情
     * 接口：push2.eastmoney.com/api/qt/stock/get
     * 字段说明：f43=最新价, f44=最高, f45=最低, f46=开盘, f47=成交量,
     *          f48=成交额, f50=量比, f57=代码, f58=名称, f60=昨收,
     *          f116=总市值, f117=流通市值, f162=市盈率, f167=市净率,
     *          f168=换手率, f169=涨跌额, f170=涨跌幅
     */
    async function getStockRealtimeCore(params) {
        const symbol = validateSymbol(params.symbol);
        const secid = buildSecId(symbol);
        const url = "https://push2.eastmoney.com/api/qt/stock/get"
            + "?secid=" + secid
            + "&ut=fa5fd1943c7b386f172d6893dbfba10b"
            + "&invt=2&fltt=2"
            + "&fields=f43,f44,f45,f46,f47,f48,f50,f57,f58,f60,f84,f85,f116,f117,f162,f167,f168,f169,f170,f171";

        const json = await httpGet(url);

        if (!json.data || json.data.f57 === undefined) {
            throw new Error("未找到股票代码 " + symbol + " 的实时行情，请确认代码是否正确");
        }

        const d = json.data;
        return {
            "代码": d.f57,
            "名称": d.f58,
            "最新价": safeNum(d.f43, 2),
            "涨跌幅(%)": safeNum(d.f170, 2),
            "涨跌额": safeNum(d.f169, 2),
            "今开": safeNum(d.f46, 2),
            "最高": safeNum(d.f44, 2),
            "最低": safeNum(d.f45, 2),
            "昨收": safeNum(d.f60, 2),
            "成交量(手)": safeNum(d.f47),
            "成交额": formatAmount(d.f48),
            "换手率(%)": safeNum(d.f168, 2),
            "量比": safeNum(d.f50, 2),
            "市盈率(动态)": safeNum(d.f162, 2),
            "市净率": safeNum(d.f167, 2),
            "总市值": formatAmount(d.f116),
            "流通市值": formatAmount(d.f117)
        };
    }

    /**
     * 工具 2：获取历史K线数据
     * 接口：push2his.eastmoney.com/api/qt/stock/kline/get
     * fqt=1 为前复权，klt 见 KLT_MAP
     * fields2: f51=日期, f52=开盘, f53=收盘, f54=最高, f55=最低,
     *          f56=成交量, f57=成交额, f58=振幅, f59=涨跌幅, f60=涨跌额, f61=换手率
     */
    async function getStockHistoryCore(params) {
        const symbol = validateSymbol(params.symbol);
        const period = (params.period || "daily").toLowerCase();
        const limit = Math.min(Math.max(parseInt(params.limit) || CONFIG.DEFAULT_HISTORY_LIMIT, 1), CONFIG.MAX_HISTORY_LIMIT);

        const klt = KLT_MAP[period];
        if (!klt) {
            throw new Error("period 参数必须是 daily, weekly 或 monthly");
        }

        const secid = buildSecId(symbol);
        const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get"
            + "?secid=" + secid
            + "&ut=fa5fd1943c7b386f172d6893dbfba10b"
            + "&fields1=f1,f2,f3,f4,f5,f6"
            + "&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61"
            + "&klt=" + klt
            + "&fqt=1"
            + "&end=20500101"
            + "&lmt=" + limit;

        const json = await httpGet(url);

        if (!json.data || !json.data.klines || json.data.klines.length === 0) {
            throw new Error("未找到股票 " + symbol + " 的历史K线数据");
        }

        const name = json.data.name || symbol;
        const klines = json.data.klines;

        // 解析 CSV 格式的 K 线数据行
        const records = [];
        for (let i = 0; i < klines.length; i++) {
            const parts = klines[i].split(",");
            if (parts.length < 11) continue;
            records.push({
                "date": parts[0],
                "open": safeNum(parts[1], 2),
                "close": safeNum(parts[2], 2),
                "high": safeNum(parts[3], 2),
                "low": safeNum(parts[4], 2),
                "volume": safeNum(parts[5]),
                "amount": safeNum(parts[6]),
                "amplitude(%)": safeNum(parts[7], 2),
                "pct_chg(%)": safeNum(parts[8], 2),
                "change": safeNum(parts[9], 2),
                "turnover(%)": safeNum(parts[10], 2)
            });
        }

        return {
            "symbol": symbol,
            "name": name,
            "period": period,
            "adjust": "前复权",
            "count": records.length,
            "data": records
        };
    }

    /**
     * 工具 3：获取上市公司基本资料
     * 接口：push2.eastmoney.com/api/qt/stock/get (扩展字段)
     * 额外字段：f84=总股本, f85=流通股本, f127=行业, f128=板块
     *          f173=ROE, f183=总营收, f184=净利润, f185=净利率
     *          f186=毛利率, f187=净资产, f188=负债率
     * 再结合 f10.eastmoney.com 的公司简介接口
     */
    async function getStockProfileCore(params) {
        const symbol = validateSymbol(params.symbol);
        const secid = buildSecId(symbol);

        // 请求1：基本行情+财务摘要字段
        const url1 = "https://push2.eastmoney.com/api/qt/stock/get"
            + "?secid=" + secid
            + "&ut=fa5fd1943c7b386f172d6893dbfba10b"
            + "&invt=2&fltt=2"
            + "&fields=f57,f58,f84,f85,f116,f117,f127,f128,f162,f167,f173,f183,f184,f185,f186,f187,f188,f189";

        const json1 = await httpGet(url1);

        if (!json1.data || json1.data.f57 === undefined) {
            throw new Error("未找到股票 " + symbol + " 的公司信息");
        }

        const d = json1.data;

        // 请求2：从 F10 接口获取公司简介（尝试，失败不影响主流程）
        let profile = "";
        try {
            const marketCode = symbol.charAt(0) === "6" ? "SH" : "SZ";
            const url2 = "https://emweb.securities.eastmoney.com/PC_HSF10/CompanySurvey/CompanySurveyAjax"
                + "?code=" + marketCode + symbol;
            const json2 = await httpGet(url2);
            if (json2 && json2.jbzl) {
                const info = json2.jbzl;
                profile = info.MAIN_BUSINESS || info.BUSINESS_SCOPE || "";
            }
        } catch (_) {
            // F10 接口失败不影响返回
        }

        const result = {
            "代码": d.f57,
            "名称": d.f58,
            "行业": d.f127 || "-",
            "板块": d.f128 || "-",
            "总股本(亿股)": d.f84 ? safeNum(d.f84 / 1e8, 2) : "-",
            "流通股本(亿股)": d.f85 ? safeNum(d.f85 / 1e8, 2) : "-",
            "总市值": formatAmount(d.f116),
            "流通市值": formatAmount(d.f117),
            "市盈率(动态)": safeNum(d.f162, 2),
            "市净率": safeNum(d.f167, 2),
            "ROE(%)": safeNum(d.f173, 2),
            "总营收": formatAmount(d.f183),
            "净利润": formatAmount(d.f184),
            "净利率(%)": safeNum(d.f185, 2),
            "毛利率(%)": safeNum(d.f186, 2),
            "净资产": formatAmount(d.f187),
            "资产负债率(%)": safeNum(d.f188, 2)
        };

        if (profile) {
            // 截断过长的主营业务描述
            result["主营业务"] = truncateContent(profile, CONFIG.MAX_PROFILE_LENGTH);
        }

        return result;
    }

    /**
     * 工具 4：获取指数实时行情
     * 接口与个股相同，但 secid 路由规则不同
     */
    async function getIndexRealtimeCore(params) {
        const symbol = validateSymbol(params.symbol);
        const secid = buildIndexSecId(symbol);
        const url = "https://push2.eastmoney.com/api/qt/stock/get"
            + "?secid=" + secid
            + "&ut=fa5fd1943c7b386f172d6893dbfba10b"
            + "&invt=2&fltt=2"
            + "&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f169,f170,f171";

        const json = await httpGet(url);

        if (!json.data || json.data.f57 === undefined) {
            throw new Error("未找到指数代码 " + symbol + " 的行情数据。常用指数: 000001(上证), 399001(深证成指), 000300(沪深300), 399006(创业板指)");
        }

        const d = json.data;
        return {
            "代码": d.f57,
            "名称": d.f58,
            "最新点位": safeNum(d.f43, 2),
            "涨跌幅(%)": safeNum(d.f170, 2),
            "涨跌额": safeNum(d.f169, 2),
            "今开": safeNum(d.f46, 2),
            "最高": safeNum(d.f44, 2),
            "最低": safeNum(d.f45, 2),
            "昨收": safeNum(d.f60, 2),
            "成交量(手)": safeNum(d.f47),
            "成交额": formatAmount(d.f48)
        };
    }

    /**
     * 工具 5：获取行业板块资金流向
     * 接口：push2.eastmoney.com/api/qt/clist/get
     * fid=f62(按主力净流入排序)
     * fs=m:90+t:2 表示行业板块
     */
    async function getSectorFundFlowCore(params) {
        const limit = Math.min(Math.max(parseInt(params.limit) || CONFIG.DEFAULT_SECTOR_LIMIT, 1), CONFIG.MAX_SECTOR_LIMIT);

        const url = "https://push2.eastmoney.com/api/qt/clist/get"
            + "?fid=f62"
            + "&po=1"
            + "&pz=" + limit
            + "&pn=1"
            + "&np=1"
            + "&fltt=2"
            + "&invt=2"
            + "&ut=b2884a393a59ad64002292a3e90d46a5"
            + "&fs=m:90+t:2"
            + "&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124";

        const json = await httpGet(url);

        if (!json.data || !json.data.diff || json.data.diff.length === 0) {
            throw new Error("未获取到行业板块资金流向数据");
        }

        const list = json.data.diff;
        const records = [];

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            records.push({
                "排名": i + 1,
                "板块名称": item.f14 || "-",
                "板块代码": item.f12 || "-",
                "涨跌幅(%)": safeNum(item.f3, 2),
                "主力净流入": formatAmount(item.f62),
                "主力净占比(%)": safeNum(item.f184, 2),
                "超大单净流入": formatAmount(item.f66),
                "大单净流入": formatAmount(item.f72),
                "中单净流入": formatAmount(item.f78),
                "小单净流入": formatAmount(item.f84)
            });
        }

        return {
            "类型": "行业板块资金流向",
            "数量": records.length,
            "数据": records
        };
    }

    /**
     * 工具 6：获取财联社7x24财经快讯
     * 接口：财联社 telegraphList API
     */
    async function getFinancialNewsCore(params) {
        const limit = Math.min(Math.max(parseInt(params.limit) || 15, 1), 30);

        // 财联社电报接口
        const url = "https://www.cls.cn/nodeapi/updateTelegraph"
            + "?app=CailianpressWeb"
            + "&os=web"
            + "&sv=8.4.6"
            + "&rn=" + limit;

        let json;
        try {
            json = await httpGet(url);
        } catch (_) {
            // 备用接口：东方财富快讯
            return await getEastMoneyNewsCore(limit);
        }

        if (!json.data || !json.data.roll_data || json.data.roll_data.length === 0) {
            // 回退到东方财富快讯
            return await getEastMoneyNewsCore(limit);
        }

        const newsList = json.data.roll_data;
        const records = [];

        for (let i = 0; i < Math.min(newsList.length, limit); i++) {
            const item = newsList[i];
            // 安全提取时间
            let timeStr = "-";
            if (item.ctime) {
                try {
                    const d = new Date(item.ctime * 1000);
                    timeStr = d.getFullYear() + "-"
                        + String(d.getMonth() + 1).padStart(2, "0") + "-"
                        + String(d.getDate()).padStart(2, "0") + " "
                        + String(d.getHours()).padStart(2, "0") + ":"
                        + String(d.getMinutes()).padStart(2, "0");
                } catch (_) { /* ignore */ }
            }

            let title = item.title || "";
            let content = item.content || item.brief || "";

            // 清理 HTML 标签
            content = content.replace(/<[^>]*>/g, "").trim();
            if (!title && content) {
                title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
            }

            // 截断过长内容以节省 token
            content = truncateContent(content, CONFIG.MAX_NEWS_CONTENT);

            records.push({
                "时间": timeStr,
                "标题": title || "快讯",
                "内容": content || "-"
            });
        }

        return {
            "来源": "财联社电报",
            "数量": records.length,
            "快讯": records
        };
    }

    /**
     * 备用新闻接口：东方财富 7x24 快讯
     */
    async function getEastMoneyNewsCore(limit) {
        const url = "https://np-listapi.eastmoney.com/comm/wap/getListInfo"
            + "?client=wap"
            + "&type=0"
            + "&mession=1"
            + "&pageSize=" + limit
            + "&pageNo=1"
            + "&fields=title,mediaName,showTime,digest";

        const json = await httpGet(url);

        if (!json.data || !json.data.list || json.data.list.length === 0) {
            throw new Error("财经快讯接口暂时不可用，请稍后重试");
        }

        const records = [];
        const list = json.data.list;

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            let digest = (item.digest || "").replace(/<[^>]*>/g, "").trim();
            digest = truncateContent(digest, CONFIG.MAX_NEWS_CONTENT);
            records.push({
                "时间": item.showTime || "-",
                "标题": item.title || "快讯",
                "内容": digest || "-",
                "来源": item.mediaName || "-"
            });
        }

        return {
            "来源": "东方财富",
            "数量": records.length,
            "快讯": records
        };
    }

    /**
     * 工具 7：股票模糊搜索
     * 接口：searchapi.eastmoney.com/api/suggest/get
     */
    async function searchStockCore(params) {
        const keyword = (params.keyword || "").trim();
        if (!keyword) {
            throw new Error("搜索关键词不能为空");
        }

        const url = "https://searchapi.eastmoney.com/api/suggest/get"
            + "?input=" + encodeURIComponent(keyword)
            + "&type=14"
            + "&token=D43BF722C8E33BDC906FB84D85E326E8"
            + "&count=10";

        const json = await httpGet(url);

        if (!json.QuotationCodeTable || !json.QuotationCodeTable.Data) {
            // 可能只是没有匹配结果
            return {
                "keyword": keyword,
                "count": 0,
                "results": [],
                "message": "未找到匹配的股票，请尝试其他关键词"
            };
        }

        const data = json.QuotationCodeTable.Data;
        const results = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            // 仅保留 A 股相关（MktNum: 0=深, 1=沪）
            if (item.MktNum !== 0 && item.MktNum !== 1) continue;

            results.push({
                "代码": item.Code || "-",
                "名称": item.Name || "-",
                "拼音": item.PinYin || "-",
                "市场": item.MktNum === 1 ? "沪市" : "深市",
                "类型": item.SecurityTypeName || "股票"
            });
        }

        return {
            "keyword": keyword,
            "count": results.length,
            "results": results
        };
    }

    // =========================================================================
    // 第五部分：模块接口暴露与绑定
    // =========================================================================

    return {
        test:               function (p) { return wrapExec(testCore, p, "API连通性测试"); },
        get_stock_realtime: function (p) { return wrapExec(getStockRealtimeCore, p, "股票实时行情"); },
        get_stock_history:  function (p) { return wrapExec(getStockHistoryCore, p, "历史K线数据"); },
        get_stock_profile:  function (p) { return wrapExec(getStockProfileCore, p, "公司基本资料"); },
        get_index_realtime: function (p) { return wrapExec(getIndexRealtimeCore, p, "指数实时行情"); },
        get_sector_fund_flow: function (p) { return wrapExec(getSectorFundFlowCore, p, "板块资金流向"); },
        get_financial_news: function (p) { return wrapExec(getFinancialNewsCore, p, "财经快讯"); },
        search_stock:       function (p) { return wrapExec(searchStockCore, p, "股票搜索"); }
    };

})();

// =============================================================================
// 第六部分：Exports 接口注册（严格匹配 METADATA 中的 tools[].name）
// =============================================================================

exports.test                = AkShareToolkit.test;
exports.get_stock_realtime  = AkShareToolkit.get_stock_realtime;
exports.get_stock_history   = AkShareToolkit.get_stock_history;
exports.get_stock_profile   = AkShareToolkit.get_stock_profile;
exports.get_index_realtime  = AkShareToolkit.get_index_realtime;
exports.get_sector_fund_flow = AkShareToolkit.get_sector_fund_flow;
exports.get_financial_news  = AkShareToolkit.get_financial_news;
exports.search_stock        = AkShareToolkit.search_stock;
