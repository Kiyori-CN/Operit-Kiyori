/* METADATA
{
    "name": "aggregate_translate",
    "version": "1.0",
    "display_name": {
        "zh": "聚合翻译",
        "en": "Aggregate Translation"
    },
    "description": {
        "zh": "聚合翻译工具包。集成百度翻译、小牛翻译、火山翻译、腾讯翻译等多个主流翻译引擎，支持智能引擎选择、自动故障降级、多引擎对比翻译。无需科学上网，所有接口均为国内可直连。支持200+语种互译，涵盖中英日韩法德俄西等常用语言。提供单引擎翻译、智能翻译（自动选择最优引擎）、多引擎对比翻译、语种检测、批量翻译五大核心功能。",
        "en": "Aggregated Translation Toolkit. Integrates Baidu, Niutrans, Volcengine, Tencent and other major translation engines. Supports smart engine selection, automatic failover, multi-engine comparison. All APIs are China-domestic accessible without proxy. Supports 200+ languages including Chinese, English, Japanese, Korean, French, German, Russian, Spanish, etc. Provides single-engine translation, smart translation (auto-select best engine), multi-engine comparison, language detection, and batch translation."
    },
    "env": [
        {
            "name": "BAIDU_TRANSLATE_APPID",
            "description": {
                "zh": "百度翻译 APP ID。申请地址：https://fanyi-api.baidu.com 注册开发者 → 开通通用翻译API（高级版免费100万字符/月）→ 在管理控制台查看 APP ID",
                "en": "Baidu Translate APP ID. Apply at: https://fanyi-api.baidu.com"
            },
            "required": false
        },
        {
            "name": "BAIDU_TRANSLATE_SECRET",
            "description": {
                "zh": "百度翻译密钥（与 APP ID 配对）。在百度翻译开放平台 → 管理控制台 → 开发者信息 中查看",
                "en": "Baidu Translate secret key (paired with APP ID)."
            },
            "required": false
        },
        {
            "name": "NIUTRANS_API_KEY",
            "description": {
                "zh": "小牛翻译 API Key。申请地址：https://niutrans.com 注册 → 控制台 → 个人中心查看 API Key。每日免费20万字符",
                "en": "Niutrans API Key. Apply at: https://niutrans.com Free 200K chars/day."
            },
            "required": false
        },
        {
            "name": "VOLC_ACCESS_KEY_ID",
            "description": {
                "zh": "火山翻译 Access Key ID。申请地址：https://www.volcengine.com/product/machine-translation 注册火山引擎 → 开通机器翻译 → 密钥管理获取。每月免费200万字符",
                "en": "Volcengine Translate Access Key ID. Apply at: https://www.volcengine.com Free 2M chars/month."
            },
            "required": false
        },
        {
            "name": "VOLC_SECRET_ACCESS_KEY",
            "description": {
                "zh": "火山翻译 Secret Access Key（与 Access Key ID 配对）",
                "en": "Volcengine Translate Secret Access Key."
            },
            "required": false
        },
        {
            "name": "TENCENT_SECRET_ID",
            "description": {
                "zh": "腾讯翻译 SecretId。申请地址：https://cloud.tencent.com/product/tmt 注册腾讯云 → 开通机器翻译 → API密钥管理获取。每月免费500万字符",
                "en": "Tencent Translate SecretId. Apply at: https://cloud.tencent.com Free 5M chars/month."
            },
            "required": false
        },
        {
            "name": "TENCENT_SECRET_KEY",
            "description": {
                "zh": "腾讯翻译 SecretKey（与 SecretId 配对）",
                "en": "Tencent Translate SecretKey."
            },
            "required": false
        },
        {
            "name": "TRANSLATE_DEFAULT_ENGINE",
            "description": {
                "zh": "默认翻译引擎优先级（逗号分隔）。可选值：baidu,niutrans,volcengine,tencent。默认：niutrans,baidu,tencent,volcengine",
                "en": "Default engine priority (comma-separated). Options: baidu,niutrans,volcengine,tencent. Default: niutrans,baidu,tencent,volcengine"
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "translate",
            "description": {
                "zh": "智能翻译（推荐首选）。自动选择最优可用引擎进行翻译，支持自动故障降级。若指定引擎不可用则自动切换下一个。支持200+语种互译，源语言可设为auto自动检测。",
                "en": "Smart translate (recommended). Auto-selects best available engine with failover. Supports 200+ languages, source language can be 'auto' for detection."
            },
            "parameters": [
                {
                    "name": "text",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "待翻译的文本内容（建议单次不超过5000字符）",
                        "en": "Text to translate (recommended max 5000 chars per request)"
                    }
                },
                {
                    "name": "to",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标语言代码。常用值：zh(中文), en(英语), ja(日语), ko(韩语), fr(法语), de(德语), ru(俄语), es(西班牙语), pt(葡萄牙语), it(意大利语), vi(越南语), th(泰语), ar(阿拉伯语)",
                        "en": "Target language code: zh, en, ja, ko, fr, de, ru, es, pt, it, vi, th, ar, etc."
                    }
                },
                {
                    "name": "from",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "源语言代码，默认 auto（自动检测）",
                        "en": "Source language code, default 'auto' (auto-detect)"
                    }
                },
                {
                    "name": "engine",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "指定翻译引擎：baidu / niutrans / volcengine / tencent。留空则按优先级自动选择",
                        "en": "Specify engine: baidu / niutrans / volcengine / tencent. Empty for auto-select."
                    }
                }
            ]
        },
        {
            "name": "compare_translate",
            "description": {
                "zh": "多引擎对比翻译。同时调用所有可用翻译引擎，返回各引擎翻译结果的对比，便于择优使用。适合对翻译质量要求较高的场景。",
                "en": "Multi-engine comparison. Calls all available engines simultaneously and returns comparative results for quality selection."
            },
            "parameters": [
                {
                    "name": "text",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "待翻译的文本内容",
                        "en": "Text to translate"
                    }
                },
                {
                    "name": "to",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标语言代码",
                        "en": "Target language code"
                    }
                },
                {
                    "name": "from",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "源语言代码，默认 auto",
                        "en": "Source language code, default 'auto'"
                    }
                }
            ]
        },
        {
            "name": "batch_translate",
            "description": {
                "zh": "批量翻译。支持一次翻译多段文本（以换行符分隔），返回逐段翻译结果。自动限速防止API超频。",
                "en": "Batch translate. Translates multiple text segments (newline-separated) with auto rate-limiting."
            },
            "parameters": [
                {
                    "name": "texts",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "待翻译文本，多段以换行符(\\n)分隔",
                        "en": "Texts to translate, separated by newline (\\n)"
                    }
                },
                {
                    "name": "to",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "目标语言代码",
                        "en": "Target language code"
                    }
                },
                {
                    "name": "from",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "源语言代码，默认 auto",
                        "en": "Source language code, default 'auto'"
                    }
                },
                {
                    "name": "engine",
                    "type": "string",
                    "required": false,
                    "description": {
                        "zh": "指定翻译引擎，留空自动选择",
                        "en": "Specify engine or leave empty for auto-select"
                    }
                }
            ]
        },
        {
            "name": "detect_language",
            "description": {
                "zh": "语种检测。识别输入文本的语言种类，返回语言代码和名称。",
                "en": "Language detection. Identifies the language of input text, returns language code and name."
            },
            "parameters": [
                {
                    "name": "text",
                    "type": "string",
                    "required": true,
                    "description": {
                        "zh": "待检测语言的文本",
                        "en": "Text to detect language"
                    }
                }
            ]
        },
{
            "name": "list_engines",
            "description": {
                "zh": "列出引擎状态。显示所有翻译引擎的配置状态、免费额度信息和申请指引。帮助用户了解当前可用引擎和配置方法。",
                "en": "List engine status. Shows configuration status, free quota info, and setup guides for all translation engines."
            },
            "parameters": []
        },
        {
            "name": "test",
            "description": {
                "zh": "测试翻译引擎连通性。验证已配置引擎的可用性，返回诊断报告。",
                "en": "Test translation engine connectivity."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：聚合翻译工具包 (Aggregate Translation Toolkit)
 * ------------------------------------------------------------------------------
 * 架构说明：
 *
 * 本工具包采用 IIFE + Wrapper 模式封装，集成国内四大主流翻译引擎：
 *   1. 百度翻译 —— 国内最成熟的翻译平台，200+语种，高级版每月100万字符免费
 *   2. 小牛翻译 —— 每日20万字符免费（约600万/月），454语种，接口简单
 *   3. 火山翻译 —— 字节跳动旗下，每月200万字符免费，质量优秀
 *   4. 腾讯翻译 —— 每月500万字符免费额度最大，接口稳定
 *
 * 核心特性：
 *   - 智能引擎选择：按配置优先级自动选择可用引擎
 *   - 自动故障降级：当前引擎失败自动切换下一个
 *   - 多引擎对比：同时调用所有引擎便于择优
 *   - 批量翻译：支持多段文本自动限速翻译
 *   - 语种检测：基于百度API的语言识别
 *   - 全部国内直连：无需科学上网
 *
 * 签名算法：
 *   - 百度翻译：MD5(appid + q + salt + secret)
 *   - 火山翻译：HMAC-SHA256 签名（V4 签名简化版）
 *   - 腾讯翻译：HMAC-SHA256 TC3 签名（v3 简化版）
 *   - 小牛翻译：纯 API Key，无签名
 *
 * 版本：v1.0
 * 更新日期：2026-02-24
 * 运行环境：Operit JavaScript 沙箱（ES2017+）
 * 网络协议：HTTP/HTTPS + OkHttp 客户端
 * 依赖：CryptoJS（全局预注入）
 * ==============================================================================
 */
const AGGREGATE_TRANSLATE = (function () {

    // ==========================================================================
    // 第一部分：配置常量与初始化
    // ==========================================================================

    /**
     * OkHttp 客户端单例
     * 复用连接池以提升网络效率
     */
    const httpClient = OkHttp.newClient();

    /**
     * 全局配置
     */
    const CONFIG = {
        /** 请求超时（毫秒） */
        REQUEST_TIMEOUT: 15000,
        /** 批量翻译间隔（毫秒），防止 QPS 超频 */
        BATCH_DELAY: 1100,
        /** 单次最大文本长度（字符） */
        MAX_TEXT_LENGTH: 5000,
        /** 默认引擎优先级 */
        DEFAULT_PRIORITY: ['niutrans', 'baidu', 'tencent', 'volcengine'],
        /** User-Agent */
        USER_AGENT: 'AggregateTranslate/1.0 (Operit)'
    };



    var DEBUG = (function () {
        try { return (typeof getEnv === 'function' && getEnv('DEBUG') === 'true'); }
        catch (_) { return false; }
    })();

    function debugLog(msg) {
        if (DEBUG) console.log('[DEBUG] ' + msg);
    }
    /**
     * 语言代码与名称映射表
     * 统一使用百度翻译的语言代码标准
     */
    const LANG_NAMES = {
        'auto': '自动检测', 'zh': '中文', 'en': '英语', 'ja': '日语',
        'ko': '韩语', 'fr': '法语', 'de': '德语', 'ru': '俄语',
        'es': '西班牙语', 'pt': '葡萄牙语', 'it': '意大利语',
        'vi': '越南语', 'th': '泰语', 'ar': '阿拉伯语',
        'id': '印尼语', 'ms': '马来语', 'fil': '菲律宾语',
        'hi': '印地语', 'tr': '土耳其语', 'pl': '波兰语',
        'nl': '荷兰语', 'sv': '瑞典语', 'cs': '捷克语',
        'el': '希腊语', 'hu': '匈牙利语', 'ro': '罗马尼亚语',
        'da': '丹麦语', 'fi': '芬兰语', 'no': '挪威语',
        'uk': '乌克兰语', 'bg': '保加利亚语', 'hr': '克罗地亚语',
        'sk': '斯洛伐克语', 'sl': '斯洛文尼亚语', 'lt': '立陶宛语',
        'lv': '拉脱维亚语', 'et': '爱沙尼亚语', 'he': '希伯来语',
        'fa': '波斯语', 'bn': '孟加拉语', 'ta': '泰米尔语',
        'te': '泰卢固语', 'ur': '乌尔都语', 'sw': '斯瓦希里语',
        'yue': '粤语', 'wyw': '文言文', 'cht': '繁体中文'
    };

    /**
     * 各引擎的语言代码映射表
     * 不同引擎的语言代码标准不同，此处做统一转换
     * key: 统一代码 → value: 各引擎代码
     */
    const LANG_MAP = {
        /** 小牛翻译的语言代码 */
        niutrans: {
            'zh': 'zh', 'en': 'en', 'ja': 'ja', 'ko': 'ko',
            'fr': 'fr', 'de': 'de', 'ru': 'ru', 'es': 'es',
            'pt': 'pt', 'it': 'it', 'vi': 'vi', 'th': 'th',
            'ar': 'ar', 'id': 'id', 'ms': 'ms', 'hi': 'hi',
            'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'auto': 'auto',
            'yue': 'yue', 'cht': 'cht'
        },
        /** 百度翻译的语言代码 */
        baidu: {
            'zh': 'zh', 'en': 'en', 'ja': 'jp', 'ko': 'kor',
            'fr': 'fra', 'de': 'de', 'ru': 'ru', 'es': 'spa',
            'pt': 'pt', 'it': 'it', 'vi': 'vie', 'th': 'th',
            'ar': 'ara', 'id': 'id', 'ms': 'may', 'hi': 'hi',
            'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'auto': 'auto',
            'yue': 'yue', 'wyw': 'wyw', 'cht': 'cht',
            'sv': 'swe', 'cs': 'cs', 'el': 'el', 'hu': 'hu',
            'ro': 'rom', 'da': 'dan', 'fi': 'fin', 'no': 'nor',
            'uk': 'ukr', 'bg': 'bul', 'he': 'heb', 'fa': 'per',
            'bn': 'ben', 'ta': 'tam', 'te': 'tel', 'ur': 'urd',
            'sw': 'swa', 'fil': 'fil'
        },
        /** 火山翻译的语言代码 */
        volcengine: {
            'zh': 'zh', 'en': 'en', 'ja': 'ja', 'ko': 'ko',
            'fr': 'fr', 'de': 'de', 'ru': 'ru', 'es': 'es',
            'pt': 'pt', 'it': 'it', 'vi': 'vi', 'th': 'th',
            'ar': 'ar', 'id': 'id', 'ms': 'ms', 'hi': 'hi',
            'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'auto': '',
            'yue': 'yue', 'cht': 'zh-Hant'
        },
        /** 腾讯翻译的语言代码 */
        tencent: {
            'zh': 'zh', 'en': 'en', 'ja': 'ja', 'ko': 'ko',
            'fr': 'fr', 'de': 'de', 'ru': 'ru', 'es': 'es',
            'pt': 'pt', 'it': 'it', 'vi': 'vi', 'th': 'th',
            'ar': 'ar', 'id': 'id', 'ms': 'ms', 'hi': 'hi',
            'tr': 'tr', 'pl': 'pl', 'nl': 'nl', 'auto': 'auto',
            'yue': 'yue', 'cht': 'zh-TW'
        }
    };

    /**
     * 引擎信息注册表
     * 包含各引擎的元信息、免费额度和申请指引
     */
    const ENGINE_INFO = {
        baidu: {
            name: '百度翻译',
            nameEn: 'Baidu Translate',
            freeQuota: '高级版: 100万字符/月免费 (标准版: QPS=1, 免费)',
            applyUrl: 'https://fanyi-api.baidu.com',
            applySteps: '注册百度账号 → 进入百度翻译开放平台 → 管理控制台 → 开通通用翻译API → 选择高级版(需实名认证) → 在开发者信息中获取 APP ID 和密钥',
            requiredEnvs: ['BAIDU_TRANSLATE_APPID', 'BAIDU_TRANSLATE_SECRET']
        },
        niutrans: {
            name: '小牛翻译',
            nameEn: 'Niutrans',
            freeQuota: '每日20万字符免费 (约600万/月)',
            applyUrl: 'https://niutrans.com',
            applySteps: '注册小牛翻译账号 → 进入控制台 → 个人中心 → 查看 API Key',
            requiredEnvs: ['NIUTRANS_API_KEY']
        },
        volcengine: {
            name: '火山翻译',
            nameEn: 'Volcengine Translate',
            freeQuota: '200万字符/月免费',
            applyUrl: 'https://www.volcengine.com/product/machine-translation',
            applySteps: '注册火山引擎账号 → 开通机器翻译服务 → 密钥管理 → 创建API密钥获取 Access Key ID 和 Secret Access Key',
            requiredEnvs: ['VOLC_ACCESS_KEY_ID', 'VOLC_SECRET_ACCESS_KEY']
        },
        tencent: {
            name: '腾讯翻译',
            nameEn: 'Tencent Translate',
            freeQuota: '500万字符/月免费 (文本翻译)',
            applyUrl: 'https://cloud.tencent.com/product/tmt',
            applySteps: '注册腾讯云账号 → 搜索"机器翻译" → 开通服务 → 访问API密钥管理 → 创建密钥获取 SecretId 和 SecretKey',
            requiredEnvs: ['TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY']
        }
    };

    // ==========================================================================
    // 第二部分：通用工具函数
    // ==========================================================================

    /**
     * 读取并验证环境变量
     * @param {string} key - 环境变量名
     * @returns {string|null} 环境变量值或null
     */
    function readEnv(key) {
        const val = getEnv(key);
        if (!val || val.trim() === '') return null;
        return val.trim();
    }

    /**
     * 获取引擎优先级列表
     * @returns {string[]} 引擎名称数组
     */
    function getEnginePriority() {
        const custom = readEnv('TRANSLATE_DEFAULT_ENGINE');
        if (custom) {
            const engines = custom.split(',').map(e => e.trim().toLowerCase()).filter(e => e);
            if (engines.length > 0) return engines;
        }
        return CONFIG.DEFAULT_PRIORITY;
    }

    /**
     * 检查引擎是否已配置（环境变量齐全）
     * @param {string} engineName - 引擎名称
     * @returns {boolean}
     */
    function isEngineConfigured(engineName) {
        const info = ENGINE_INFO[engineName];
        if (!info) return false;
        return info.requiredEnvs.every(envKey => readEnv(envKey) !== null);
    }

    /**
     * 获取所有已配置的引擎列表（按优先级排序）
     * @returns {string[]}
     */
    function getAvailableEngines() {
        const priority = getEnginePriority();
        return priority.filter(eng => isEngineConfigured(eng));
    }

    /**
     * 语言代码转换
     * @param {string} code - 统一语言代码
     * @param {string} engineName - 引擎名称
     * @returns {string} 引擎专属语言代码
     */
    function mapLangCode(code, engineName) {
        if (!code) return 'auto';
        const map = LANG_MAP[engineName];
        if (!map) return code;
        return map[code.toLowerCase()] !== undefined ? map[code.toLowerCase()] : code;
    }

    /**
     * 获取语言名称
     * @param {string} code - 语言代码
     * @returns {string}
     */
    function getLangName(code) {
        return LANG_NAMES[code] || code;
    }

    /**
     * 生成随机salt
     * @returns {string}
     */
    function generateSalt() {
        return String(Math.floor(Math.random() * 1000000000 + 100000));
    }

    /**
     * 获取当前 Unix 时间戳（秒）
     * @returns {number}
     */
    function getUnixTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * 获取 ISO 日期字符串 (YYYY-MM-DD)
     * @param {Date} date
     * @returns {string}
     */
    function getISODate(date) {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // -----------------------------------------------------------------
    // 纯 JS SHA-256 + HMAC-SHA256 实现
    // 原因：Operit 沙箱的 CryptoJS 仅捆绑 MD5/AES，不含 SHA256
    // -----------------------------------------------------------------
    const SHA256_K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    /** UTF-8 字符串 → 字节数组 */
    function utf8ToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 0x80) {
                bytes.push(c);
            } else if (c < 0x800) {
                bytes.push((c >> 6) | 0xC0, (c & 0x3F) | 0x80);
            } else if (c >= 0xD800 && c < 0xDC00 && i + 1 < str.length) {
                const c2 = str.charCodeAt(++i);
                const cp = ((c - 0xD800) << 10) + (c2 - 0xDC00) + 0x10000;
                bytes.push((cp >> 18) | 0xF0, ((cp >> 12) & 0x3F) | 0x80,
                           ((cp >> 6) & 0x3F) | 0x80, (cp & 0x3F) | 0x80);
            } else {
                bytes.push((c >> 12) | 0xE0, ((c >> 6) & 0x3F) | 0x80, (c & 0x3F) | 0x80);
            }
        }
        return bytes;
    }

    /** 字节数组 → 十六进制字符串 */
    function bytesToHex(bytes) {
        const hex = [];
        for (let i = 0; i < bytes.length; i++) {
            hex.push(('0' + (bytes[i] & 0xFF).toString(16)).slice(-2));
        }
        return hex.join('');
    }

    /** 纯 JS SHA-256，输入字节数组，输出32字节数组 */
    function sha256Bytes(inputBytes) {
        const bytes = inputBytes.slice();
        const bitLen = bytes.length * 8;
        bytes.push(0x80);
        while ((bytes.length % 64) !== 56) bytes.push(0);
        // 追加64位大端长度（仅处理低32位，足够覆盖常规文本）
        bytes.push(0, 0, 0, 0);
        bytes.push((bitLen >>> 24) & 0xFF, (bitLen >>> 16) & 0xFF,
                   (bitLen >>> 8) & 0xFF, bitLen & 0xFF);

        let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
        let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

        function rr(v, n) { return (v >>> n) | (v << (32 - n)); }

        for (let i = 0; i < bytes.length; i += 64) {
            const w = new Array(64);
            for (let j = 0; j < 16; j++) {
                w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) |
                       (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
            }
            for (let j = 16; j < 64; j++) {
                const s0 = rr(w[j - 15], 7) ^ rr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
                const s1 = rr(w[j - 2], 17) ^ rr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
            }
            let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            for (let j = 0; j < 64; j++) {
                const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
                const ch = (e & f) ^ (~e & g);
                const t1 = (h + S1 + ch + SHA256_K[j] + w[j]) | 0;
                const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = (S0 + maj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
            h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
        }

        function u32ToBytes(v) {
            return [(v >>> 24) & 0xFF, (v >>> 16) & 0xFF, (v >>> 8) & 0xFF, v & 0xFF];
        }
        return [].concat(u32ToBytes(h0), u32ToBytes(h1), u32ToBytes(h2), u32ToBytes(h3),
                         u32ToBytes(h4), u32ToBytes(h5), u32ToBytes(h6), u32ToBytes(h7));
    }

    /**
     * SHA-256 哈希（字符串 → 十六进制）
     * @param {string} message
     * @returns {string}
     */
    function sha256Hex(message) {
        return bytesToHex(sha256Bytes(utf8ToBytes(message)));
    }

    /**
     * HMAC-SHA256（返回字节数组，用于链式签名）
     * key 支持字符串或字节数组（链式调用时上一步输出的字节数组）
     * @param {string} message
     * @param {string|number[]} key
     * @returns {number[]} 32字节数组
     */
    function hmacSHA256(message, key) {
        let keyBytes = (typeof key === 'string') ? utf8ToBytes(key) : key.slice();
        const msgBytes = (typeof message === 'string') ? utf8ToBytes(message) : message.slice();

        // 密钥长度处理
        if (keyBytes.length > 64) keyBytes = sha256Bytes(keyBytes);
        while (keyBytes.length < 64) keyBytes.push(0);

        const ipad = new Array(64);
        const opad = new Array(64);
        for (let i = 0; i < 64; i++) {
            ipad[i] = keyBytes[i] ^ 0x36;
            opad[i] = keyBytes[i] ^ 0x5C;
        }

        const inner = sha256Bytes(ipad.concat(msgBytes));
        return sha256Bytes(opad.concat(inner));
    }

    /**
     * HMAC-SHA256 并转十六进制
     * @param {string} message
     * @param {string|number[]} key
     * @returns {string}
     */
    function hmacSHA256Hex(message, key) {
        return bytesToHex(hmacSHA256(message, key));
    }

    /**
     * HTTP GET 请求
     * @param {string} url
     * @param {Object} headers
     * @returns {Promise<string|null>}
     */
    async function httpGet(url, headers) {
        try {
            const req = httpClient.newRequest().url(url).method('GET');
            if (headers) {
                for (const k in headers) {
                    req.header(k, headers[k]);
                }
            }
            const resp = await req.build().execute();
            if (resp.isSuccessful()) return resp.content;
            console.error(`[Translate] HTTP GET 失败: ${resp.code} | ${url}`);
            return null;
        } catch (e) {
            console.error(`[Translate] HTTP GET 异常: ${e.message} | ${url}`);
            return null;
        }
    }

    /**
     * HTTP POST 请求（Form 表单）
     * @param {string} url
     * @param {Object} data - 表单数据
     * @param {Object} headers
     * @returns {Promise<string|null>}
     */
    async function httpPostForm(url, data, headers) {
        try {
            const formParts = [];
            for (const k in data) {
                if (data[k] !== undefined && data[k] !== null) {
                    formParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`);
                }
            }
            const body = formParts.join('&');

            const req = httpClient.newRequest()
                .url(url)
                .method('POST')
                .header('Content-Type', 'application/x-www-form-urlencoded');

            if (headers) {
                for (const k in headers) {
                    req.header(k, headers[k]);
                }
            }

            const resp = await req.body(body).build().execute();
            if (resp.isSuccessful()) return resp.content;
            console.error(`[Translate] HTTP POST Form 失败: ${resp.code} | ${url}`);
            return null;
        } catch (e) {
            console.error(`[Translate] HTTP POST Form 异常: ${e.message} | ${url}`);
            return null;
        }
    }

    /**
     * HTTP POST 请求（JSON）
     * @param {string} url
     * @param {Object} payload - JSON 数据
     * @param {Object} headers
     * @returns {Promise<string|null>}
     */
    async function httpPostJson(url, payload, headers) {
        try {
            const body = JSON.stringify(payload);

            // 修复：传入的 headers 优先级高于默认值
            const allHeaders = Object.assign({
                'User-Agent': CONFIG.USER_AGENT,
                'Content-Type': 'application/json'
            }, headers || {});

            const req = httpClient.newRequest()
                        .url(url)
                        .method('POST');
                    for (const k in allHeaders) {
                        req.header(k, allHeaders[k]);
                    }
                    const resp = await req.body(body).build().execute();


            if (resp.isSuccessful()) return resp.content;
            console.error(`[Translate] HTTP POST JSON 失败: ${resp.code} | ${url}`);
            // 尝试读取错误体
            if (resp.content) {
                console.error(`[Translate] 错误响应: ${resp.content.substring(0, 500)}`);
                return resp.content; // 返回错误体以便解析具体错误码
            }
            return null;
        } catch (e) {
            console.error(`[Translate] HTTP POST JSON 异常: ${e.message} | ${url}`);
            return null;
        }
    }

    /**
     * 安全 JSON 解析
     * @param {string} text
     * @returns {Object|null}
     */
    function safeParseJson(text) {
        if (!text) return null;
        try {
            return JSON.parse(text.trim());
        } catch (e) {
            console.error(`[Translate] JSON 解析失败: ${e.message}`);
            return null;
        }
    }

    /**
     * 文本预处理：去除首尾空白、检测长度
     * @param {string} text
     * @returns {string}
     * @throws {Error}
     */
    function validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('翻译文本不能为空');
        }
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            throw new Error('翻译文本不能为空白');
        }
        if (trimmed.length > CONFIG.MAX_TEXT_LENGTH) {
            console.warn(`[Translate] 文本长度 ${trimmed.length} 超过建议上限 ${CONFIG.MAX_TEXT_LENGTH}，可能影响翻译质量`);
        }
        return trimmed;
    }

    // ==========================================================================
    // 第三部分：百度翻译引擎
    // ==========================================================================

    /**
     * 百度翻译引擎
     *
     * API 文档：https://fanyi-api.baidu.com/api/trans/product/apidoc
     * 签名规则：MD5(appid + q + salt + secretKey)
     * 请求方式：GET 或 POST
     * 接口地址：https://fanyi-api.baidu.com/api/trans/vip/translate
     * 免费额度：高级版 100万字符/月，标准版 QPS=1
     * QPS 限制：标准版1次/秒，高级版10次/秒
     */
    const BaiduEngine = {
        name: 'baidu',
        displayName: '百度翻译',

        /**
         * 执行翻译
         * @param {string} text - 待翻译文本
         * @param {string} from - 源语言（统一代码）
         * @param {string} to - 目标语言（统一代码）
         * @returns {Promise<Object>} { success, result, detected_from, engine }
         */
        translate: async function (text, from, to) {
            const appid = readEnv('BAIDU_TRANSLATE_APPID');
            const secret = readEnv('BAIDU_TRANSLATE_SECRET');
            if (!appid || !secret) {
                throw new Error('百度翻译未配置：缺少 BAIDU_TRANSLATE_APPID 或 BAIDU_TRANSLATE_SECRET');
            }

            // 转换语言代码
            const baiduFrom = mapLangCode(from || 'auto', 'baidu');
            const baiduTo = mapLangCode(to, 'baidu');

            if (!baiduTo || baiduTo === 'auto') {
                throw new Error('目标语言不能为 auto，请指定具体的目标语言');
            }

            // 生成签名：MD5(appid + q + salt + secret)
            const salt = generateSalt();
            const signStr = appid + text + salt + secret;
            const sign = CryptoJS.MD5(signStr).toString();

            // 使用 GET 请求（百度API同时支持GET/POST，GET更可靠）
            const queryParts = [
                'q=' + encodeURIComponent(text),
                'from=' + encodeURIComponent(baiduFrom),
                'to=' + encodeURIComponent(baiduTo),
                'appid=' + encodeURIComponent(appid),
                'salt=' + encodeURIComponent(salt),
                'sign=' + encodeURIComponent(sign)
            ];
            const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate?' + queryParts.join('&');

            console.log(`[Baidu] 请求: appid=${appid.substring(0,4)}****, from=${baiduFrom}, to=${baiduTo}`);

            const raw = await httpGet(url);
            const json = safeParseJson(raw);

            if (!json) {
                throw new Error('百度翻译 API 返回数据为空或格式错误');
            }

            // 百度错误码处理
            if (json.error_code) {
                const errCode = String(json.error_code);
                const errMsg = BAIDU_ERROR_CODES[errCode] || json.error_msg || '未知错误';
                throw new Error(`百度翻译错误 [${errCode}]: ${errMsg}`);
            }

            if (!json.trans_result || json.trans_result.length === 0) {
                throw new Error('百度翻译未返回翻译结果');
            }

            // 提取结果
            const resultParts = json.trans_result.map(item => item.dst);
            const result = resultParts.join('\n');

    function truncateContent(content, maxLen) {
        if (!content) return '';
        var limit = maxLen || 15000;
        if (content.length <= limit) return content;
        return content.substring(0, limit) + '\n\n*(内容已截断至 ' + limit + ' 字符)*';
    }

            return {
                success: true,
                result: result,
                detected_from: json.from || baiduFrom,
                engine: 'baidu'
            };
        },

        /**
         * 语种检测
         * @param {string} text
         * @returns {Promise<string>} 语言代码
         */
        detectLanguage: async function (text) {
            const appid = readEnv('BAIDU_TRANSLATE_APPID');
            const secret = readEnv('BAIDU_TRANSLATE_SECRET');
            if (!appid || !secret) {
                throw new Error('百度翻译未配置');
            }

            // 先翻译为英文，同时获取检测到的语言
            const sampleText = text.substring(0, 200);
            const salt = generateSalt();
            const signStr = appid + sampleText + salt + secret;
            const sign = CryptoJS.MD5(signStr).toString();

            const queryParts = [
                'q=' + encodeURIComponent(sampleText),
                'from=auto', 'to=en',
                'appid=' + encodeURIComponent(appid),
                'salt=' + encodeURIComponent(salt),
                'sign=' + encodeURIComponent(sign)
            ];
            const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate?' + queryParts.join('&');

            const raw = await httpGet(url);
            const json = safeParseJson(raw);

            if (json && json.from && json.from !== 'auto') {
                return json.from;
            }
            throw new Error('语种检测失败');
        }
    };

    /**
     * 百度翻译错误码映射
     */
    const BAIDU_ERROR_CODES = {
        '52001': '请求超时，请重试',
        '52002': '系统错误，请重试',
        '52003': '未授权用户（检查 APP ID 是否正确）',
        '54000': '必填参数为空',
        '54001': '签名错误（检查密钥是否正确、签名算法是否匹配）',
        '54003': '访问频率受限（标准版QPS=1，请降低调用频率或升级为高级版）',
        '54004': '账户余额不足',
        '54005': '长query请求频繁（请降低长文本提交频率）',
        '58000': '客户端IP非法（检查百度平台中的IP限制设置，建议留空不填）',
        '58001': '译文语言方向不支持',
        '58002': '服务当前已关闭',
        '90107': '认证未通过或未生效'
    };

    // ==========================================================================
    // 第四部分：小牛翻译引擎
    // ==========================================================================

    /**
     * 小牛翻译引擎
     *
     * API 文档：https://niutrans.com/text_trans
     * 认证方式：API Key（无签名）
     * 请求方式：POST
     * 接口地址：https://api.niutrans.com/NiuTransServer/translation
     * 免费额度：每日20万字符（约600万/月）
     * 特点：接口最简单，无需签名，支持454语种
     */
    const NiutransEngine = {
        name: 'niutrans',
        displayName: '小牛翻译',

        /**
         * 执行翻译
         */
        translate: async function (text, from, to) {
            const apikey = readEnv('NIUTRANS_API_KEY');
            if (!apikey) {
                throw new Error('小牛翻译未配置：缺少 NIUTRANS_API_KEY');
            }

            const niuFrom = mapLangCode(from || 'auto', 'niutrans');
            const niuTo = mapLangCode(to, 'niutrans');

            if (!niuTo || niuTo === 'auto') {
                throw new Error('目标语言不能为 auto');
            }

            const url = 'https://api.niutrans.com/NiuTransServer/translation';
            const formData = {
                from: niuFrom,
                to: niuTo,
                apikey: apikey,
                src_text: text
            };

            const raw = await httpPostForm(url, formData);
            const json = safeParseJson(raw);

            if (!json) {
                throw new Error('小牛翻译 API 返回数据为空或格式错误');
            }

            // 小牛错误处理
            if (json.error_code) {
                const errMsg = json.error_msg || '未知错误';
                throw new Error(`小牛翻译错误 [${json.error_code}]: ${errMsg}`);
            }

            if (!json.tgt_text) {
                throw new Error('小牛翻译未返回翻译结果');
            }

            return {
                success: true,
                result: json.tgt_text,
                detected_from: json.from || niuFrom,
                engine: 'niutrans'
            };
        }
    };

    // ==========================================================================
    // 第五部分：火山翻译引擎
    // ==========================================================================

    /**
     * 火山翻译引擎
     *
     * API 文档：https://www.volcengine.com/docs/4640/65067
     * 认证方式：HMAC-SHA256 签名 (V4 简化)
     * 请求方式：POST (JSON)
     * 接口地址：https://translate.volcengineapi.com
     * Action: TranslateText
     * Version: 2020-06-01
     * 免费额度：200万字符/月
     */
    const VolcengineEngine = {
        name: 'volcengine',
        displayName: '火山翻译',

        /**
         * 执行翻译
         */
        translate: async function (text, from, to) {
            const accessKeyId = readEnv('VOLC_ACCESS_KEY_ID');
            const secretAccessKey = readEnv('VOLC_SECRET_ACCESS_KEY');
            if (!accessKeyId || !secretAccessKey) {
                throw new Error('火山翻译未配置：缺少 VOLC_ACCESS_KEY_ID 或 VOLC_SECRET_ACCESS_KEY');
            }

            const volcFrom = mapLangCode(from || 'auto', 'volcengine');
            const volcTo = mapLangCode(to, 'volcengine');

            // 构建请求体
            const payload = {
                TargetLanguage: volcTo,
                TextList: [text]
            };
            // 火山翻译：如果 from 不是空（auto映射为空），则传 SourceLanguage
            if (volcFrom && volcFrom !== '') {
                payload.SourceLanguage = volcFrom;
            }

            const bodyStr = JSON.stringify(payload);

            // 签名参数
            const host = 'translate.volcengineapi.com';
            const service = 'translate';
            const region = 'cn-north-1';
            const action = 'TranslateText';
            const version = '2020-06-01';
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000);
            // 火山翻译规范要求日期格式为 YYYYMMDD（去除短横线）
            const dateStr = now.getUTCFullYear() + 
                          String(now.getUTCMonth() + 1).padStart(2, '0') + 
                          String(now.getUTCDate()).padStart(2, '0');

            // 构建规范请求
            const queryParams = { Action: action, Version: version };
            const sortedKeys = Object.keys(queryParams).sort();
            const queryString = sortedKeys.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k])).join('&');
            const contentHash = sha256Hex(bodyStr);
            const signedHeaders = 'content-type;host;x-date';

            // 火山官方 X-Date 格式（ISO 8601基本格式）
            const xDate = dateStr + 'T' +
                          String(now.getUTCHours()).padStart(2, '0') +
                          String(now.getUTCMinutes()).padStart(2, '0') +
                          String(now.getUTCSeconds()).padStart(2, '0') + 'Z';
            
            const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-date:${xDate}\n`;

            const canonicalRequest = [
                'POST',
                '/',
                queryString,
                canonicalHeaders,
                signedHeaders,
                contentHash
            ].join('\n');

            const credentialScope = `${dateStr}/${region}/${service}/request`;
            const stringToSign = [
                'HMAC-SHA256',
                xDate,
                credentialScope,
                sha256Hex(canonicalRequest)
            ].join('\n');

            // 计算签名密钥（火山翻译需要添加VOLC前缀）
            const kDate = hmacSHA256(dateStr, secretAccessKey);
            const kRegion = hmacSHA256(region, kDate);
            const kService = hmacSHA256(service, kRegion);
            const kSigning = hmacSHA256('request', kService);
            // 计算最终签名
            const signature = hmacSHA256Hex(stringToSign, kSigning);
            const authorization = `HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

            const url = `https://${host}/?${queryString}`;

            const headers = {
                'Content-Type': 'application/json',
                'Host': host,
                'X-Date': xDate,
                'Authorization': authorization
            };

            const raw = await httpPostJson(url, payload, headers);
            const json = safeParseJson(raw);

            if (!json) {
                console.error(`[Volcengine] 原始响应: ${raw ? raw.substring(0, 500) : 'null'}`);
                throw new Error('火山翻译 API 返回数据为空或格式错误');
            }

            // 火山错误处理
            if (json.ResponseMetadata && json.ResponseMetadata.Error) {
                const err = json.ResponseMetadata.Error;
                throw new Error(`火山翻译错误 [${err.Code}]: ${err.Message}`);
            }

            if (!json.TranslationList || json.TranslationList.length === 0) {
                throw new Error('火山翻译未返回翻译结果');
            }

            const resultParts = json.TranslationList.map(item => item.Translation);
            const detectedFrom = json.TranslationList[0].DetectedSourceLanguage || volcFrom;

            return {
                success: true,
                result: resultParts.join('\n'),
                detected_from: detectedFrom,
                engine: 'volcengine'
            };
        }
    };

    // ==========================================================================
    // 第六部分：腾讯翻译引擎
    // ==========================================================================

    /**
     * 腾讯翻译引擎
     *
     * API 文档：https://cloud.tencent.com/document/api/551/15619
     * 认证方式：TC3-HMAC-SHA256 签名 (v3)
     * 请求方式：POST (JSON)
     * 接口地址：https://tmt.tencentcloudapi.com
     * Action: TextTranslate
     * Version: 2018-03-21
     * 免费额度：500万字符/月（文本翻译）
     */
    const TencentEngine = {
        name: 'tencent',
        displayName: '腾讯翻译',

        /**
         * 执行翻译
         */
        translate: async function (text, from, to) {
            const secretId = readEnv('TENCENT_SECRET_ID');
            const secretKey = readEnv('TENCENT_SECRET_KEY');
            if (!secretId || !secretKey) {
                throw new Error('腾讯翻译未配置：缺少 TENCENT_SECRET_ID 或 TENCENT_SECRET_KEY');
            }

            const tcFrom = mapLangCode(from || 'auto', 'tencent');
            const tcTo = mapLangCode(to, 'tencent');

            if (!tcTo || tcTo === 'auto') {
                throw new Error('目标语言不能为 auto');
            }

            // 构建请求体
            const payload = {
                SourceText: text,
                Source: tcFrom,
                Target: tcTo,
                ProjectId: 0
            };
            const bodyStr = JSON.stringify(payload);

            // === 腾讯 TC3-HMAC-SHA256 官方正确签名（修复所有未定义变量）===
            const host = 'tmt.tencentcloudapi.com';
            const service = 'tmt';
            const action = 'TextTranslate';
            const version = '2018-03-21';
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000);
            const dateStr = now.getUTCFullYear() + '-' + 
                          String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                          String(now.getUTCDate()).padStart(2, '0');

            const payloadHash = sha256Hex(bodyStr);

            const canonicalRequest = [
                'POST',
                '/',
                '',
                `content-type:application/json; charset=utf-8\nhost:${host}\n`,
                'content-type;host',
                payloadHash
            ].join('\n');

            const credentialScope = `${dateStr}/${service}/tc3_request`;

            const stringToSign = [
                'TC3-HMAC-SHA256',
                String(timestamp),
                credentialScope,
                sha256Hex(canonicalRequest)
            ].join('\n');

            // 计算签名密钥（官方顺序）
            const kDate = hmacSHA256(dateStr, 'TC3' + secretKey);
            const kService = hmacSHA256(service, kDate);
            const kSigning = hmacSHA256('tc3_request', kService);
            const signature = hmacSHA256Hex(stringToSign, kSigning);

            const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`;

            const url = `https://${host}`;

            const headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': host,
                'X-TC-Action': action,
                'X-TC-Version': version,
                'X-TC-Timestamp': String(timestamp),
                'X-TC-Region': 'ap-guangzhou',
                'Authorization': authorization
            };           

            const raw = await httpPostJson(url, payload, headers);
            const json = safeParseJson(raw);

            if (!json) {
                console.error(`[Tencent] 原始响应: ${raw ? raw.substring(0, 500) : 'null'}`);
                throw new Error('腾讯翻译 API 返回数据为空或格式错误');
            }

            // 腾讯错误处理
            const response = json.Response;
            if (!response) {
                throw new Error('腾讯翻译响应格式异常');
            }

            if (response.Error) {
                throw new Error(`腾讯翻译错误 [${response.Error.Code}]: ${response.Error.Message}`);
            }

            if (!response.TargetText) {
                throw new Error('腾讯翻译未返回翻译结果');
            }

            return {
                success: true,
                result: response.TargetText,
                detected_from: response.Source || tcFrom,
                engine: 'tencent'
            };
        }
    };

    // ==========================================================================
    // 第七部分：引擎注册表与调度器
    // ==========================================================================

    /**
     * 引擎实例映射
     */
    const ENGINES = {
        baidu: BaiduEngine,
        niutrans: NiutransEngine,
        volcengine: VolcengineEngine,
        tencent: TencentEngine
    };

    /**
     * 智能翻译调度器
     * 按优先级尝试各引擎，失败自动降级
     *
     * @param {string} text - 待翻译文本
     * @param {string} from - 源语言
     * @param {string} to - 目标语言
     * @param {string|null} preferredEngine - 指定引擎（可选）
     * @returns {Promise<Object>} 翻译结果
     */
    async function smartTranslate(text, from, to, preferredEngine) {
        const validatedText = validateText(text);
        const errors = [];

        // 确定尝试顺序
        let tryOrder = [];
        if (preferredEngine && ENGINES[preferredEngine]) {
            tryOrder.push(preferredEngine);
            // 添加其余引擎作为降级备选
            const others = getAvailableEngines().filter(e => e !== preferredEngine);
            tryOrder = tryOrder.concat(others);
        } else {
            tryOrder = getAvailableEngines();
        }

        if (tryOrder.length === 0) {
            throw new Error(
                '没有可用的翻译引擎！请至少配置一个翻译引擎的 API 密钥。\n' +
                '推荐配置小牛翻译（最简单）：只需设置 NIUTRANS_API_KEY 环境变量。\n' +
                '使用 list_engines 工具查看所有引擎的配置方法。'
            );
        }

        // 逐个尝试
        for (const engineName of tryOrder) {
            const engine = ENGINES[engineName];
            if (!engine) continue;

            try {
                console.log(`[Translate] 尝试引擎: ${engine.displayName}`);
                const result = await engine.translate(validatedText, from, to);

                if (result && result.success) {
                    console.log(`[Translate] 翻译成功 (${engine.displayName})`);
                    return result;
                }
            } catch (e) {
                const errInfo = `${engine.displayName}: ${e.message}`;
                console.warn(`[Translate] 引擎失败 - ${errInfo}`);
                errors.push(errInfo);
            }

            // 引擎间限速（避免并发触发QPS限制）
            if (tryOrder.indexOf(engineName) < tryOrder.length - 1) {
                await Tools.System.sleep(200);
            }
        }

        // 所有引擎都失败
        throw new Error(
            '所有翻译引擎均失败：\n' +
            errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
        );
    }

    // ==========================================================================
    // 第八部分：结果格式化器
    // ==========================================================================

    /**
     * 格式化单次翻译结果
     */
    function formatTranslateResult(result, text, from, to) {
        const buf = [];
        buf.push(`## 翻译结果\n`);
        buf.push(`**引擎**: ${ENGINE_INFO[result.engine] ? ENGINE_INFO[result.engine].name : result.engine}`);
        buf.push(`**方向**: ${getLangName(result.detected_from || from)} → ${getLangName(to)}`);
        buf.push('');
        buf.push(`**原文**:`);
        buf.push(text.length > 500 ? text.substring(0, 500) + '...(已截断显示)' : text);
        buf.push('');
        buf.push(`**译文**:`);
        buf.push(result.result);
        return buf.join('\n');
    }

    /**
     * 格式化多引擎对比结果
     */
    function formatCompareResults(results, errors, text, from, to) {
        const buf = [];
        buf.push(`## 多引擎对比翻译\n`);
        buf.push(`**方向**: ${getLangName(from || 'auto')} → ${getLangName(to)}`);
        buf.push(`**原文**: ${text.length > 300 ? text.substring(0, 300) + '...' : text}`);
        buf.push('\n---\n');

        if (results.length > 0) {
            results.forEach((r, i) => {
                const info = ENGINE_INFO[r.engine];
                buf.push(`### ${i + 1}. ${info ? info.name : r.engine}`);
                buf.push(r.result);
                buf.push('');
            });
        }

        if (errors.length > 0) {
            buf.push('---\n');
            buf.push('### 失败的引擎\n');
            errors.forEach(err => {
                buf.push(`- ${err}`);
            });
        }

        if (results.length === 0) {
            buf.push('**所有引擎均翻译失败**，请检查 API 配置。');
        }

        return buf.join('\n');
    }

    /**
     * 格式化批量翻译结果
     */
    function formatBatchResults(results, engine, from, to) {
        const buf = [];
        buf.push(`## 批量翻译结果\n`);
        buf.push(`**引擎**: ${ENGINE_INFO[engine] ? ENGINE_INFO[engine].name : engine}`);
        buf.push(`**方向**: ${getLangName(from || 'auto')} → ${getLangName(to)}`);
        buf.push(`**总计**: ${results.length} 段`);
        buf.push('\n---\n');

        results.forEach((r, i) => {
            buf.push(`**[${i + 1}]** ${r.success ? '✓' : '✗'}`);
            if (r.success) {
                buf.push(`原文: ${r.source.length > 100 ? r.source.substring(0, 100) + '...' : r.source}`);
                buf.push(`译文: ${r.result}`);
            } else {
                buf.push(`原文: ${r.source.length > 100 ? r.source.substring(0, 100) + '...' : r.source}`);
                buf.push(`错误: ${r.error}`);
            }
            buf.push('');
        });

        const successCount = results.filter(r => r.success).length;
        buf.push(`---\n**成功**: ${successCount}/${results.length}`);

        return buf.join('\n');
    }

    /**
     * 格式化语种检测结果
     */
    function formatDetectResult(langCode, text) {
        const buf = [];
        buf.push(`## 语种检测结果\n`);
        buf.push(`**检测文本**: ${text.length > 200 ? text.substring(0, 200) + '...' : text}`);
        buf.push(`**语言代码**: \`${langCode}\``);
        buf.push(`**语言名称**: ${getLangName(langCode)}`);
        return buf.join('\n');
    }

    /**
     * 格式化引擎状态列表
     */
    function formatEngineList() {
        const buf = [];
        const lang = getLang && getLang() || 'zh';

        buf.push(`## 翻译引擎状态总览\n`);
        buf.push(`**当前优先级**: ${getEnginePriority().join(' → ')}`);
        buf.push('');

        const priority = getEnginePriority();

        for (const engName of ['niutrans', 'baidu', 'tencent', 'volcengine']) {
            const info = ENGINE_INFO[engName];
            const configured = isEngineConfigured(engName);
            const idx = priority.indexOf(engName);
            const priorityLabel = idx >= 0 ? `#${idx + 1}` : '未在优先级列表中';

            buf.push(`### ${configured ? '✅' : '❌'} ${info.name} (${info.nameEn})`);
            buf.push(`- **状态**: ${configured ? '已配置 ✓' : '未配置 ✗'}`);
            buf.push(`- **优先级**: ${priorityLabel}`);
            buf.push(`- **免费额度**: ${info.freeQuota}`);
            buf.push(`- **申请地址**: ${info.applyUrl}`);
            buf.push(`- **配置步骤**: ${info.applySteps}`);
            buf.push(`- **所需环境变量**: ${info.requiredEnvs.map(e => '\`' + e + '\`').join(', ')}`);

            // 显示各环境变量状态
            info.requiredEnvs.forEach(envKey => {
                const val = readEnv(envKey);
                const status = val ? `已设置 (${val.substring(0, 4)}****)` : '未设置';
                buf.push(`  - \`${envKey}\`: ${status}`);
            });

            buf.push('');
        }

        buf.push('---\n');
        buf.push('### 配置建议\n');

        const available = getAvailableEngines();
        if (available.length === 0) {
            buf.push('⚠️ **当前没有任何引擎可用！**\n');
            buf.push('**推荐快速开始**：配置小牛翻译（最简单，只需1个API Key）');
            buf.push('1. 访问 https://niutrans.com 注册账号');
            buf.push('2. 进入控制台 → 个人中心 → 复制 API Key');
            buf.push('3. 在 Operit 设置中添加环境变量 `NIUTRANS_API_KEY`');
        } else {
            buf.push(`当前有 ${available.length} 个引擎可用：${available.map(e => ENGINE_INFO[e].name).join('、')}`);
            if (available.length < 2) {
                buf.push('\n建议至少配置2个引擎，以确保故障降级时有备选方案。');
            }
        }

        buf.push('\n### 优先级自定义\n');
        buf.push('设置环境变量 `TRANSLATE_DEFAULT_ENGINE` 可自定义引擎优先级。');
        buf.push('格式：逗号分隔的引擎名，如 `baidu,niutrans,tencent,volcengine`');

        return buf.join('\n');
    }

    // ==========================================================================
    // 第九部分：核心业务逻辑
    // ==========================================================================

    /**
     * 智能翻译核心逻辑
     */
    async function translateCore(params) {
        const text = params.text;
        const to = params.to;
        const from = params.from || 'auto';
        const engine = params.engine || null;

        const result = await smartTranslate(text, from, to, engine);
        return {
            success: true,
            message: `翻译成功 (${ENGINE_INFO[result.engine] ? ENGINE_INFO[result.engine].name : result.engine})`,
            data: formatTranslateResult(result, text, from, to),
            raw: {
                engine: result.engine,
                detected_from: result.detected_from,
                result: result.result
            }
        };
    }

    /**
     * 多引擎对比核心逻辑
     */
    async function compareTranslateCore(params) {
        const text = validateText(params.text);
        const to = params.to;
        const from = params.from || 'auto';

        const available = getAvailableEngines();
        if (available.length === 0) {
            throw new Error('没有可用的翻译引擎，请先配置至少一个引擎的 API 密钥');
        }

        const results = [];
        const errors = [];

        for (const engineName of available) {
            const engine = ENGINES[engineName];
            if (!engine) continue;

            try {
                console.log(`[Compare] 调用 ${engine.displayName}...`);
                const r = await engine.translate(text, from, to);
                if (r && r.success) {
                    results.push(r);
                }
            } catch (e) {
                errors.push(`${engine.displayName}: ${e.message}`);
            }

            // 引擎间限速
            await Tools.System.sleep(300);
        }

        return {
            success: true,
            message: `对比翻译完成: ${results.length} 个引擎成功, ${errors.length} 个失败`,
            data: formatCompareResults(results, errors, text, from, to)
        };
    }

    /**
     * 批量翻译核心逻辑
     */
    async function batchTranslateCore(params) {
        const rawTexts = params.texts;
        const to = params.to;
        const from = params.from || 'auto';
        const engine = params.engine || null;

        if (!rawTexts) throw new Error('texts 不能为空');

        // 按换行分割文本
        const segments = rawTexts.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (segments.length === 0) {
            throw new Error('未找到有效的翻译文本段');
        }

        if (segments.length > 50) {
            throw new Error(`文本段数过多 (${segments.length})，单次批量翻译最多支持50段`);
        }

        // 确定使用的引擎
        let selectedEngine = engine;
        if (!selectedEngine) {
            const available = getAvailableEngines();
            if (available.length === 0) {
                throw new Error('没有可用的翻译引擎');
            }
            selectedEngine = available[0];
        }

        const results = [];
        let processedCount = 0;

        for (const segment of segments) {
            processedCount++;
            console.log(`[Batch] 翻译第 ${processedCount}/${segments.length} 段...`);

            try {
                const r = await smartTranslate(segment, from, to, selectedEngine);
                results.push({
                    success: true,
                    source: segment,
                    result: r.result,
                    engine: r.engine
                });
            } catch (e) {
                results.push({
                    success: false,
                    source: segment,
                    error: e.message
                });
            }

            // 批量限速（百度标准版QPS=1）
            if (processedCount < segments.length) {
                await Tools.System.sleep(CONFIG.BATCH_DELAY);
            }

            // 发送中间进度
            if (processedCount % 5 === 0 && processedCount < segments.length) {
                sendIntermediateResult({
                    success: true,
                    message: `批量翻译进度: ${processedCount}/${segments.length}`
                });
            }
        }

        const usedEngine = results.find(r => r.engine)?.engine || selectedEngine;

        return {
            success: true,
            message: `批量翻译完成: ${results.filter(r => r.success).length}/${results.length} 成功`,
            data: formatBatchResults(results, usedEngine, from, to)
        };
    }

    /**
     * 语种检测核心逻辑
     */
    async function detectLanguageCore(params) {
        const text = validateText(params.text);

        // 方法1：优先使用百度翻译的语种检测（from=auto时百度会返回检测到的语言）
        if (isEngineConfigured('baidu')) {
            try {
                const langCode = await BaiduEngine.detectLanguage(text);
                if (langCode && langCode !== 'auto') {
                    return {
                        success: true,
                        message: `语种检测成功: ${getLangName(langCode)} (${langCode})`,
                        data: formatDetectResult(langCode, text),
                        raw: { language: langCode, name: getLangName(langCode), method: 'baidu' }
                    };
                }
            } catch (e) {
                console.warn(`[Detect] 百度检测失败: ${e.message}`);
            }
        }

        // 方法2：使用小牛翻译 —— 注意小牛API可能回显"auto"而非实际检测结果
        // 策略：尝试翻译为中文，如果结果和原文几乎相同，说明原文就是中文
        if (isEngineConfigured('niutrans')) {
            try {
                const sample = text.substring(0, 200);
                // 先试翻译为中文
                const r1 = await NiutransEngine.translate(sample, 'auto', 'zh');
                if (r1 && r1.success) {
                    // 如果翻译结果和原文非常接近（>80%相似），原文可能就是中文
                    const similarity = computeSimpleSimilarity(sample, r1.result);
                    if (similarity > 0.8) {
                        return {
                            success: true,
                            message: `语种检测成功: ${getLangName('zh')} (zh)`,
                            data: formatDetectResult('zh', text),
                            raw: { language: 'zh', name: getLangName('zh'), method: 'niutrans_infer' }
                        };
                    }
                    // 否则再试翻译为英文
                    const r2 = await NiutransEngine.translate(sample, 'auto', 'en');
                    if (r2 && r2.success) {
                        const sim2 = computeSimpleSimilarity(sample, r2.result);
                        if (sim2 > 0.8) {
                            return {
                                success: true,
                                message: `语种检测成功: ${getLangName('en')} (en)`,
                                data: formatDetectResult('en', text),
                                raw: { language: 'en', name: getLangName('en'), method: 'niutrans_infer' }
                            };
                        }
                    }
                }
            } catch (e) {
                console.warn(`[Detect] 小牛推断检测失败: ${e.message}`);
            }
        }

        // 方法3：本地启发式检测（基于 Unicode 字符分布）
        const localDetect = heuristicDetect(text);
        return {
            success: true,
            message: `语种检测完成 (本地启发式): ${getLangName(localDetect)} (${localDetect})`,
            data: formatDetectResult(localDetect, text),
            raw: { language: localDetect, name: getLangName(localDetect), method: 'heuristic' }
        };
    }

    /**
     * 简单文本相似度计算（基于字符重叠率）
     * @param {string} a
     * @param {string} b
     * @returns {number} 0-1之间的相似度
     */
    function computeSimpleSimilarity(a, b) {
        if (!a || !b) return 0;
        const sa = a.replace(/\s+/g, '');
        const sb = b.replace(/\s+/g, '');
        if (sa.length === 0 || sb.length === 0) return 0;
        let match = 0;
        const shorter = sa.length <= sb.length ? sa : sb;
        const longer = sa.length > sb.length ? sa : sb;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.indexOf(shorter[i]) !== -1) match++;
        }
        return match / longer.length;
    }

    /**
     * 本地启发式语种检测
     * 基于 Unicode 字符分布的智能识别
     * @param {string} text
     * @returns {string} 语言代码
     */
    function heuristicDetect(text) {
        const sample = text.substring(0, 1000);
        // 只统计有意义的字符（去除空格、标点、数字）
        const cleaned = sample.replace(/[\s\d\.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=\-_~`|。，、；：？！""''（）【】《》…—·\n\r\t]/g, '');
        if (cleaned.length === 0) return 'en'; // 纯标点/空格默认英语

        // 各语系字符计数
        const cjk = (cleaned.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;  // CJK汉字
        const jp  = (cleaned.match(/[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/g) || []).length; // 假名
        const ko  = (cleaned.match(/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g) || []).length; // 韩文
        const cy  = (cleaned.match(/[\u0400-\u04ff]/g) || []).length;  // 西里尔（俄文等）
        const ar  = (cleaned.match(/[\u0600-\u06ff\u0750-\u077f]/g) || []).length;  // 阿拉伯文
        const th  = (cleaned.match(/[\u0e00-\u0e7f]/g) || []).length;  // 泰文
        const hi  = (cleaned.match(/[\u0900-\u097f]/g) || []).length;  // 天城文（印地语）
        const vi  = (cleaned.match(/[\u00c0-\u024f]/g) || []).length;  // 扩展拉丁（越南语等）
        const lat = (cleaned.match(/[a-zA-Z]/g) || []).length;  // 基础拉丁

        const total = cleaned.length;

        // 按比例判断（使用较低阈值确保能检测到）
        if (jp > 0 && jp / total > 0.05) return 'ja';  // 有假名就很可能是日语
        if (ko > 0 && ko / total > 0.05) return 'ko';  // 有韩文字母就很可能是韩语
        if (th > 0 && th / total > 0.05) return 'th';
        if (ar > 0 && ar / total > 0.05) return 'ar';
        if (hi > 0 && hi / total > 0.05) return 'hi';
        if (cy > 0 && cy / total > 0.1) return 'ru';
        if (cjk > 0 && cjk / total > 0.1) return 'zh';  // 有汉字且占比>10%
        if (lat > 0 && lat / total > 0.3) {
            // 拉丁字母系：尝试区分常见语言
            // 法语特征字符
            if (/[àâéèêëïîôùûüÿçœæ]/i.test(sample)) return 'fr';
            // 德语特征
            if (/[äöüß]/i.test(sample)) return 'de';
            // 西班牙语特征
            if (/[ñ¿¡]/i.test(sample)) return 'es';
            // 葡萄牙语特征
            if (/[ãõ]/i.test(sample)) return 'pt';
            // 越南语特征（大量声调符号）
            if (/[ắằẳẵặấầẩẫậéèẻẽẹ]/i.test(sample)) return 'vi';
            return 'en';  // 默认英语
        }
        if (cjk > 0) return 'zh';  // 有汉字就返回中文
        if (lat > 0) return 'en';  // 有拉丁字母返回英文

        return 'en'; // 最终兜底返回英文而非auto
    }

    /**
     * 引擎列表核心逻辑
     */
    async function listEnginesCore(params) {
        return {
            success: true,
            message: '引擎状态查询完成',
            data: formatEngineList()
        };
    }

    // ==========================================================================
    // 第十部分：统一错误处理包装器
    // ==========================================================================

    /**
     * 工具执行包装器
     * 统一处理异步执行、异常捕获及结果回调
     *
     * @param {Function} coreLogic - 核心业务函数
     * @param {Object} params - 原始参数
     * @returns {Promise<void>}
     */
    async function wrapToolExecution(coreLogic, params) {
        try {
            const result = await coreLogic(params);
            complete(result);
        } catch (error) {
            console.error(`[AggregateTranslate] 执行失败: ${error.message}`);
            complete({
                success: false,
                message: `翻译操作失败: ${error.message}`,
                error_stack: error.stack
            });
        }
    }

    // ==========================================================================
    // 第十一部分：公开接口
    // ==========================================================================

    return {
        /**
         * 智能翻译（推荐首选）
         */
        translate: function (params) {
            return wrapToolExecution(translateCore, params);
        },

        /**
         * 多引擎对比翻译
         */
        compare_translate: function (params) {
            return wrapToolExecution(compareTranslateCore, params);
        },

        /**
         * 批量翻译
         */
        batch_translate: function (params) {
            return wrapToolExecution(batchTranslateCore, params);
        },

        /**
         * 语种检测
         */
        detect_language: function (params) {
            return wrapToolExecution(detectLanguageCore, params);
        },

        /**
         * 列出引擎状态
         */
        list_engines: function (params) {
            return wrapToolExecution(listEnginesCore, params);
        },

        /**
         * 翻译引擎连通性测试
         * 检查各引擎配置状态，并用第一个可用引擎执行实际翻译验证
         */
        test: function (params) {
            return wrapToolExecution(async function () {
                const engineDefs = [
                    { name: 'niutrans',    label: '小牛翻译',  freeQuota: '每日20万字符' },
                    { name: 'baidu',       label: '百度翻译',  freeQuota: '每月100万字符' },
                    { name: 'tencent',     label: '腾讯翻译',  freeQuota: '每月500万字符' },
                    { name: 'volcengine', label: '火山翻译',  freeQuota: '每月200万字符' }
                ];

                const lines = ['## 聚合翻译 API 连通性测试报告\n'];
                lines.push('### 引擎配置状态\n');

                let configuredCount = 0;
                for (const def of engineDefs) {
                    const ok = isEngineConfigured(def.name);
                    if (ok) configuredCount++;
                    lines.push(`- ${ok ? '✅' : '❌'} **${def.label}**: ${ok ? `已配置（${def.freeQuota}免费）` : '未配置'}`);
                }

                if (configuredCount === 0) {
                    lines.push('\n> ⚠️ 所有翻译引擎均未配置。推荐首先配置小牛翻译（仅需1个 API Key）：https://niutrans.com');
                    return {
                        success: false,
                        message: `0/${engineDefs.length} 个引擎已配置，无法执行翻译测试`,
                        data: lines.join('\n')
                    };
                }

                // 用第一个可用引擎执行实际翻译测试
                lines.push('\n### 翻译连通性验证\n');
                const available = getAvailableEngines();
                const testEngine = available[0];
                const engineLabel = ENGINE_INFO[testEngine] ? ENGINE_INFO[testEngine].name : testEngine;

                try {
                    const startTime = Date.now();
                    const result = await smartTranslate('hello', 'auto', 'zh', testEngine);
                    const latency = Date.now() - startTime;
                    if (result && result.result) {
                        lines.push(`- ✅ **${engineLabel}** 翻译测试成功`);
                        lines.push(`  - 测试文本: "hello" → "${result.result}"`);
                        lines.push(`  - 响应延迟: ${latency}ms`);
                        return {
                            success: true,
                            message: `翻译引擎测试通过（使用 ${engineLabel}）`,
                            data: lines.join('\n')
                        };
                    } else {
                        lines.push(`- ❌ **${engineLabel}** 翻译测试失败：返回结果为空`);
                    }
                } catch (e) {
                    lines.push(`- ❌ **${engineLabel}** 翻译测试失败：${e.message}`);
                }

                return {
                    success: false,
                    message: `翻译引擎测试失败，请检查 API 配置`,
                    data: lines.join('\n')
                };
            }, params);
        }
    };

})();

// ==============================================================================
// 模块导出定义（严格匹配 METADATA 中的 tools[].name）
// ==============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │                         工具包调用流程示意                               │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  用户: "帮我把这段话翻译成英文：今天天气真好"                            │
// │    ↓                                                                     │
// │  AI 自动选择 translate 工具                                              │
// │    参数: { text: "今天天气真好", to: "en" }                              │
// │    ↓                                                                     │
// │  smartTranslate() 调度器                                                 │
// │    ├─ 读取引擎优先级: [niutrans, baidu, tencent, volcengine]             │
// │    ├─ 检查配置: niutrans ✓ → 尝试翻译                                   │
// │    ├─ 成功 → 返回结果                                                   │
// │    └─ 失败 → 尝试 baidu → 成功/继续降级...                              │
// │    ↓                                                                     │
// │  complete({ success: true, data: "## 翻译结果\n..." })                   │
// │    ↓                                                                     │
// │  AI 将翻译结果以自然语言呈现给用户                                       │
// │                                                                          │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  用户: "对比各引擎翻译这段话的效果"                                      │
// │    ↓                                                                     │
// │  AI 选择 compare_translate 工具                                          │
// │    参数: { text: "...", to: "en" }                                       │
// │    ↓                                                                     │
// │  依次调用所有已配置引擎                                                  │
// │    ├─ 百度翻译: "The weather is really nice today"                       │
// │    ├─ 小牛翻译: "What a nice day today"                                  │
// │    └─ 腾讯翻译: "The weather is really good today"                       │
// │    ↓                                                                     │
// │  返回对比结果，AI 可以帮助用户选择最佳翻译                               │
// │                                                                          │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  用户: "翻译这个文档里的几段话"                                          │
// │    ↓                                                                     │
// │  AI 选择 batch_translate 工具                                            │
// │    参数: { texts: "第一段\n第二段\n第三段", to: "en" }                   │
// │    ↓                                                                     │
// │  逐段翻译，自动限速，发送中间进度                                        │
// │    ├─ [1/3] 翻译成功                                                     │
// │    ├─ [2/3] 翻译成功                                                     │
// │    └─ [3/3] 翻译成功                                                     │
// │    ↓                                                                     │
// │  返回批量结果汇总                                                        │
// │                                                                          │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  用户: "这是什么语言？"                                                  │
// │    ↓                                                                     │
// │  AI 选择 detect_language 工具                                            │
// │    参数: { text: "..." }                                                 │
// │    ↓                                                                     │
// │  优先使用 API 检测，兜底本地启发式检测                                   │
// │                                                                          │
// ├──────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │  用户: "查看翻译引擎配置状态"                                            │
// │    ↓                                                                     │
// │  AI 选择 list_engines 工具                                               │
// │    ↓                                                                     │
// │  返回所有引擎状态、免费额度、配置指引                                    │
// │                                                                          │
// └──────────────────────────────────────────────────────────────────────────┘
//
// ============================================================================
// 常见语言代码速查表 (Common Language Codes Quick Reference)
// ============================================================================
//
// ┌────────────┬────────┬──────────────────────────────────────────────────┐
// │ 语言       │ 代码   │ 备注                                             │
// ├────────────┼────────┼──────────────────────────────────────────────────┤
// │ 中文       │ zh     │ 简体中文（默认）                                 │
// │ 繁体中文   │ cht    │ 百度/小牛支持                                    │
// │ 粤语       │ yue    │ 百度/小牛支持                                    │
// │ 文言文     │ wyw    │ 仅百度支持                                       │
// │ 英语       │ en     │ 所有引擎支持                                     │
// │ 日语       │ ja     │ 所有引擎支持                                     │
// │ 韩语       │ ko     │ 所有引擎支持                                     │
// │ 法语       │ fr     │ 所有引擎支持                                     │
// │ 德语       │ de     │ 所有引擎支持                                     │
// │ 俄语       │ ru     │ 所有引擎支持                                     │
// │ 西班牙语   │ es     │ 所有引擎支持                                     │
// │ 葡萄牙语   │ pt     │ 所有引擎支持                                     │
// │ 意大利语   │ it     │ 所有引擎支持                                     │
// │ 越南语     │ vi     │ 所有引擎支持                                     │
// │ 泰语       │ th     │ 所有引擎支持                                     │
// │ 阿拉伯语   │ ar     │ 所有引擎支持                                     │
// │ 印尼语     │ id     │ 所有引擎支持                                     │
// │ 马来语     │ ms     │ 所有引擎支持                                     │
// │ 印地语     │ hi     │ 大部分引擎支持                                   │
// │ 土耳其语   │ tr     │ 大部分引擎支持                                   │
// │ 波兰语     │ pl     │ 大部分引擎支持                                   │
// │ 荷兰语     │ nl     │ 大部分引擎支持                                   │
// │ 自动检测   │ auto   │ 所有引擎支持（源语言）                           │
// └────────────┴────────┴──────────────────────────────────────────────────┘
//
// ============================================================================
// API 密钥申请指南摘要 (API Key Application Quick Guide)
// ============================================================================
//
// 【小牛翻译 - 推荐首选，配置最简单】
//   申请地址：https://niutrans.com
//   免费额度：每日20万字符（约每月600万字符）
//   配置方式：仅需1个环境变量 NIUTRANS_API_KEY
//   操作步骤：
//     1. 打开 https://niutrans.com 注册/登录
//     2. 进入控制台 → 个人中心
//     3. 在"翻译API"部分找到 API Key 并复制
//     4. 在 Operit 设置中添加环境变量 NIUTRANS_API_KEY = 你的key
//
// 【百度翻译 - 国内最成熟】
//   申请地址：https://fanyi-api.baidu.com
//   免费额度：高级版每月100万字符（需实名认证）
//   配置方式：需2个环境变量
//     BAIDU_TRANSLATE_APPID = 你的APP ID
//     BAIDU_TRANSLATE_SECRET = 你的密钥
//   操作步骤：
//     1. 打开 https://fanyi-api.baidu.com 注册开发者
//     2. 管理控制台 → 开通通用翻译API
//     3. 选择高级版（需完成个人认证）
//     4. 在开发者信息中获取 APP ID 和密钥
//   注意事项：
//     - IP限制建议留空（不填），避免 58000 错误
//     - 标准版 QPS=1，高级版 QPS=10
//     - 签名算法：MD5(appid + q + salt + secret)
//
// 【腾讯翻译 - 免费额度最大】
//   申请地址：https://cloud.tencent.com/product/tmt
//   免费额度：每月500万字符
//   配置方式：需2个环境变量
//     TENCENT_SECRET_ID = 你的SecretId
//     TENCENT_SECRET_KEY = 你的SecretKey
//   操作步骤：
//     1. 注册腾讯云账号
//     2. 搜索"机器翻译"并开通
//     3. 访问 https://console.cloud.tencent.com/cam/capi
//     4. 创建密钥获取 SecretId 和 SecretKey
//   注意事项：
//     - 建议创建子账号使用，不要用主账号的密钥
//     - 签名算法：TC3-HMAC-SHA256
//     - 默认后付费，超出免费额度会自动计费
//
// 【火山翻译 - 字节跳动出品】
//   申请地址：https://www.volcengine.com/product/machine-translation
//   免费额度：每月200万字符
//   配置方式：需2个环境变量
//     VOLC_ACCESS_KEY_ID = 你的Access Key ID
//     VOLC_SECRET_ACCESS_KEY = 你的Secret Access Key
//   操作步骤：
//     1. 注册火山引擎账号
//     2. 开通机器翻译服务
//     3. 密钥管理 → 创建 API 密钥
//     4. 获取 Access Key ID 和 Secret Access Key
//   注意事项：
//     - 签名算法：HMAC-SHA256 (V4签名)
//     - 签名过程较复杂，本工具包已内置完整实现
//
// ==============================================================================

exports.translate         = AGGREGATE_TRANSLATE.translate;
exports.compare_translate = AGGREGATE_TRANSLATE.compare_translate;
exports.batch_translate   = AGGREGATE_TRANSLATE.batch_translate;
exports.detect_language   = AGGREGATE_TRANSLATE.detect_language;
exports.list_engines      = AGGREGATE_TRANSLATE.list_engines;
exports.test              = AGGREGATE_TRANSLATE.test;
