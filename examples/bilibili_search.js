/* METADATA
{
    "name": "bilibili_search",
    "version": "1.0",
    "display_name": {
        "zh": "Bilibili 视频提取",
        "en": "Bilibili Video Extractor"
    },
    "description": {
        "zh": "Bilibili视频提取工具包。提供视频字幕提取（支持 AI 总结与人工 CC 字幕）、弹幕获取、热门评论获取、视频搜索及用户基本信息功能。内置 WBI 签名算法与短链智能还原解析。",
        "en": "Bilibili video search toolkit. Provides stable subtitle extraction (AI/CC), danmaku searching, hot comments, video search, and user info. Includes built-in WBI signing and smart short-link parsing."
    },
    "env": [
        {
            "name": "BILIBILI_COOKIE",
            "description": {
                "zh": "Bilibili 登录 Cookie（可选但强烈推荐）。配置后可获取完整字幕、规避 API 频率限制。获取方式：登录 bilibili.com → F12 → Network → 任意请求 → Request Headers → 复制 Cookie 值",
                "en": "Bilibili login Cookie (optional but strongly recommended). Enables full subtitle access and higher API rate limits. Get it: login bilibili.com → F12 → Network → any request → Request Headers → copy Cookie value."
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "get_subtitles",
            "description": {
                "zh": "获取视频字幕。集成 WebCC 挂载字幕、WBI 接口高精度字幕及 AI 智能总结字幕，具备自动分段与时间轴处理能力。",
                "en": "Get video subtitles. Aggregates WebCC, WBI API, and AI summary subtitles."
            },
            "parameters": [
                {
                    "name": "url",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "视频链接（支持 b23.tv 短链）或 BV/av 号，例如：https://www.bilibili.com/video/BV1x341177NN", "en": "Video URL or BV/av ID, e.g. https://www.bilibili.com/video/BV1x341177NN" }
                }
            ]
        },
        {
            "name": "get_danmaku",
            "description": {
                "zh": "从Bilibili视频中获取弹幕。",
                "en": "Get danmaku (bullet comments) from a Bilibili video."
            },
            "parameters": [
                { "name": "url", "description": { "zh": "Bilibili视频URL，例如：https://www.bilibili.com/video/BV1x341177NN", "en": "Bilibili video URL, e.g. https://www.bilibili.com/video/BV1x341177NN" }, "type": "string", "required": true },
                { "name": "count", "description": { "zh": "要获取的弹幕数量，默认500，最多1000", "en": "Number of danmaku items to search (default: 500, max: 1000)." }, "type": "number", "required": false }
            ]
        },
        {
            "name": "get_comments",
            "description": {
                "zh": "获取视频热门评论。按热度排序提取高赞评论，支持视频舆情分析与观点提取。",
                "en": "Get hot comments. searches liked comments for sentiment analysis."
            },
            "parameters": [
                {
                    "name": "url",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "视频链接（支持 b23.tv 短链）或 BV/av 号，例如：https://www.bilibili.com/video/BV1x341177NN", "en": "Video URL or BV/av ID, e.g. https://www.bilibili.com/video/BV1x341177NN" }
                }
            ]
        },
        {
            "name": "search_videos",
            "description": { "zh": "在Bilibili上搜索视频。", "en": "Search videos on Bilibili." },
            "parameters": [
                { "name": "keyword", "description": { "zh": "要搜索的关键词", "en": "Keyword to search for." }, "type": "string", "required": true },
                { "name": "page", "description": { "zh": "页码，默认为1", "en": "Page number (default: 1)." }, "type": "number", "required": false, "default": 1 },
                { "name": "count", "description": { "zh": "返回结果的数量，默认10，最多20", "en": "Number of results to return (default: 10, max: 20)." }, "type": "number", "required": false, "default": 10 }
            ]
        },
        {
            "name": "get_user_info",
            "description": { "zh": "获取B站用户的基本信息。", "en": "Get basic information for a Bilibili user." },
            "parameters": [
                { "name": "mid", "description": { "zh": "用户的数字ID或包含UID前缀的格式（如：206122078 或 UID:206122078）", "en": "User numeric ID or format with UID prefix (e.g., 206122078 or UID:206122078)." }, "type": "string", "required": true }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 Bilibili API 连通性。验证网络可达性与 Cookie 配置状态（已登录 / 匿名模式）。",
                "en": "Test Bilibili API connectivity. Validates network access and Cookie login status (logged-in / anonymous mode)."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称: Bilibili 视频提取工具包
 * ----------------------------------------------------------------------------
 * 功能详述:
 * 1. 签名机制: 集成 B 站 WBI 签名算法，包含 MD5 哈希与 MixinKey 混淆。
 * 2. 标识解析: 具备 b23.tv 短链接重定向还原能力，支持从 HTML 元数据提取 BV 号。
 * 3. 字幕处理: 具备三级回退策略，按优先级聚合 Web、PlayerAPI 及 AI 总结内容。
 * 4. 评论检索: 支持基于 OID 的热度排序评论提取，支持分页以获取更多评论。
 * 5. 弹幕获取: 支持从压缩数据中提取弹幕，支持数量限制。
 * 6. 视频搜索: 支持关键词搜索，返回分页结果。
 * 7. 用户信息: 获取用户基本信息，包括粉丝数、关注数等。
 * 
 * 注意: 该工具包假设环境支持 OkHttp、pako（用于弹幕解压）。如果需要，设置 BILIBILI_COOKIE 环境变量以提升访问权限。
 * ============================================================================
 */
const bilibili_video = (function () {
    
    // ------------------------------------------------------------------------
    // [基础配置]
    // ------------------------------------------------------------------------
    
    // 初始化 HTTP 客户端
    const client = OkHttp.newClient();
    
    // 环境变量获取：用于提升资源清晰度、获取完整字幕及规避 API 频率限制
    const USER_COOKIE = getEnv("BILIBILI_COOKIE") || "";
    
    // 预设请求头：模拟标准浏览器环境
    const BASE_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'application/json, text/plain, */*'
    };

    // 鉴权信息注入
    if (USER_COOKIE) {
        BASE_HEADERS['Cookie'] = USER_COOKIE;
    }

    // Bilibili API endpoints
    const API_GET_VIEW_INFO = "https://api.bilibili.com/x/web-interface/view";
    const API_GET_SUBTITLE_LIST = "https://api.bilibili.com/x/player/v2";
    const API_GET_DANMAKU = "https://api.bilibili.com/x/v1/dm/list.so";
    const API_GET_COMMENTS = "https://api.bilibili.com/x/v2/reply/wbi/main";
    const API_SEARCH = "https://api.bilibili.com/x/web-interface/search/all/v2";
    const API_NAV = "https://api.bilibili.com/x/web-interface/nav";
    const API_GET_USER_INFO = "https://api.bilibili.com/x/space/wbi/acc/info";
    const API_GET_RELATION_STAT = "https://api.bilibili.com/x/relation/stat";

    let wbiKeys = null;
    let buvid3 = null;

    // ------------------------------------------------------------------------
    // [加密工具库] MD5 算法实现
    // ------------------------------------------------------------------------
    // 核心逻辑: 为 WBI 签名提供底层的哈希计算支持，不依赖外部二进制库。
    // ------------------------------------------------------------------------
    const CryptoUtils = {
        /**
         * 计算字符串的 MD5 哈希
         * @param {string} s - 目标字符串
         * @returns {string} - 32位小写十六进制字符串
         */
        md5: function(s) {
            // MD5 算法常量表
            const k = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391];
            // 链接变量初始化
            let r = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
            const h = (n, c) => (n << c) | (n >>> (32 - c));
            
            // UTF-8 字符转义处理
            let b = "";
            for (let i = 0; i < s.length; i++) {
                let c = s.charCodeAt(i);
                if (c < 128) b += String.fromCharCode(c);
                else if (c < 2048) b += String.fromCharCode((c >> 6) | 192) + String.fromCharCode((c & 63) | 128);
                else b += String.fromCharCode((c >> 12) | 224) + String.fromCharCode(((c >> 6) & 63) | 128) + String.fromCharCode((c & 63) | 128);
            }
            
            // 消息填充逻辑
            const m = new Uint8Array(b.length + ((56 - (b.length + 1) % 64 + 64) % 64) + 9);
            for (let i = 0; i < b.length; i++) m[i] = b.charCodeAt(i);
            m[b.length] = 0x80;
            new DataView(m.buffer).setUint32(m.length - 8, b.length * 8, true);
            
            // 分组处理与主逻辑迭代
            for (let i = 0; i < m.length; i += 64) {
                let [aa, bb, cc, dd] = r;
                for (let j = 0; j < 64; j++) {
                    let f, g;
                    if (j < 16) { f = (bb & cc) | (~bb & dd); g = j; }
                    else if (j < 32) { f = (dd & bb) | (~dd & cc); g = (5 * j + 1) % 16; }
                    else if (j < 48) { f = bb ^ cc ^ dd; g = (3 * j + 5) % 16; }
                    else { f = cc ^ (bb | ~dd); g = (7 * j) % 16; }
                    const v = new DataView(m.buffer).getUint32(i + g * 4, true);
                    const t = dd; dd = cc; cc = bb; bb = (bb + h(aa + f + k[j] + v, [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][j % 4 + (j >> 4) * 4])) | 0; aa = t;
                }
                r = r.map((v, idx) => (v + [aa, bb, cc, dd][idx]) | 0);
            }
            
            // 结果序列化
            return Array.from(new Uint8Array(new Uint32Array(r).buffer))
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join("");
        }
    };

    // ------------------------------------------------------------------------
    // [WBI 签名模块]
    // ------------------------------------------------------------------------
    // 核心职责: 实现 B 站 Web 端 API 的身份效验逻辑，包含密钥混淆与参数重组。
    // ------------------------------------------------------------------------
    const WbiSigner = (function() {
        // 预置的 MixinKey 混淆映射表
        const MIXIN_KEY_ENC_TAB = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
            33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
            61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
            36, 20, 34, 44, 52
        ];

        // 混淆密钥生成函数
        function getMixinKey(orig) {
            let s = "";
            for (let i = 0; i < 32; i++) {
                if (i < MIXIN_KEY_ENC_TAB.length) s += orig.charAt(MIXIN_KEY_ENC_TAB[i]);
            }
            return s;
        }

        return {
            /**
             * 执行 WBI 签名
             * @param {Object} params - 业务参数
             * @param {string} img_key - 图像标识密钥
             * @param {string} sub_key - 子标识密钥
             * @returns {string} - 包含 w_rid 签名的查询字符串
             */
            sign: function(params, img_key, sub_key) {
                const mixin_key = getMixinKey(img_key + sub_key);
                const curr_time = Math.round(Date.now() / 1000);
                
                // 注入时间戳，提升接口安全性
                const newParams = { ...params, wts: curr_time };
                
                // 参数规范化处理：排序、特殊字符过滤及 URL 编码
                const query = Object.keys(newParams)
                    .sort()
                    .map(key => {
                        let value = String(newParams[key]).replace(/[!'()*]/g, "");
                        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                    })
                    .join("&");
                
                // 生成最终签名标识符
                const w_rid = CryptoUtils.md5(query + mixin_key);
                return `${query}&w_rid=${w_rid}`;
            }
        };
    })();

    /**
     * 网络请求基础包装
     * @param {string} url - 请求 URL
     * @param {string} [method='GET'] - 请求方法
     * @returns {Promise<Object>} - 响应对象
     */
    async function request(url, method = 'GET') {
        try {
            const req = client.newRequest()
                .url(url)
                .method(method)
                .headers(BASE_HEADERS)
                .build();
            const resp = await req.execute();
            return resp;
        } catch (e) {
            throw new Error(`网络通讯异常: ${e.message}`);
        }
    }

    // ------------------------------------------------------------------------
    // [初始化逻辑]
    // ------------------------------------------------------------------------
    // 预取 WBI 密钥和生成 buvid3
    // ------------------------------------------------------------------------
    async function init() {
        if (!wbiKeys) {
            wbiKeys = await getWbiKeys();
        }
        if (!buvid3) {
            buvid3 = generateBuvid3();
            BASE_HEADERS['Cookie'] = (BASE_HEADERS['Cookie'] || '') + `; buvid3=${buvid3}`;
        }
    }

    function generateBuvid3() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 获取 WBI 签名所需的动态密钥对
     * @returns {Promise<{img_key: string, sub_key: string}>}
     */
    async function getWbiKeys() {
        try {
            const resp = await request(API_NAV);
            const json = JSON.parse(resp.content);
            const wbi_img = json?.data?.wbi_img;
            
            if (wbi_img) {
                const extractName = (u) => u.substring(u.lastIndexOf('/') + 1, u.lastIndexOf('.'));
                return { 
                    img_key: extractName(wbi_img.img_url), 
                    sub_key: extractName(wbi_img.sub_url) 
                };
            }
        } catch (e) {
            // 异常捕获，确保调用链不中断
        }
        return { img_key: "", sub_key: "" };
    }

    // ------------------------------------------------------------------------
    // [视频标识解析与基础信息获取]
    // ------------------------------------------------------------------------
    // 具备短链还原、Location 头解析及 HTML 源代码扫描能力，确保标识解析的稳定性。
    // ------------------------------------------------------------------------
    async function resolveAndGetBaseInfo(url) {
        url = url.match(/https?:\/\/[^\s]+/)?.[0] || url;
        let searchScope = url;

        // 短链接还原逻辑：处理重定向并聚合上下文信息
        if (url.includes("b23.tv")) {
            const resp = await request(url, 'HEAD');
            const locationHeader = (resp.headers && (resp.headers['Location'] || resp.headers['location'])) || "";
            const fullResp = await request(url);
            searchScope = (resp.url || "") + " " + locationHeader + " " + (fullResp.content || "");
        }

        // 标识符正则提取：支持 BV 与 av 双格式
        const bvMatch = searchScope.match(/(BV[a-zA-Z0-9]{10})/);
        const avMatch = searchScope.match(/(av\d{4,})/i);
        
        let id, type;
        if (bvMatch) {
            id = bvMatch[1];
            type = 'bvid';
        } else if (avMatch) {
            id = avMatch[1].replace(/^av/i, '');
            type = 'aid';
        } else {
            throw new Error("未能识别有效的视频标识符，请检查输入。");
        }

        // 调用基础视图接口获取 CID 与元数据
        const viewParams = type === 'bvid' ? `bvid=${id}` : `aid=${id}`;
        const resp = await request(`https://api.bilibili.com/x/web-interface/view?${viewParams}`);
        const json = JSON.parse(resp.content);
        
        if (json.code !== 0) {
            throw new Error(`API 业务异常: ${json.message}`);
        }
        
        return json.data; 
    }

    // ------------------------------------------------------------------------
    // [字幕获取逻辑]
    // ------------------------------------------------------------------------
    // 包含三级策略：WebCC 提取 -> WBI 接口提取 -> AI 智能总结提取。
    // ------------------------------------------------------------------------
    async function searchSubsInternal(info, wbiKeys) {
        const { bvid, aid, cid, owner } = info;
        let subText = null;

        // 策略 A: 提取 Web 端挂载的 CC 字幕 (优先处理 zh-CN)
        if (info.subtitle?.list?.length > 0) {
            const sub = info.subtitle.list.find(s => s.lan === 'zh-CN') || info.subtitle.list[0];
            if (sub?.subtitle_url) {
                try {
                    const u = sub.subtitle_url.startsWith("//") ? "https:" + sub.subtitle_url : sub.subtitle_url;
                    const resp = await request(u);
                    const json = JSON.parse(resp.content);
                    subText = json.body.map(l => `[${l.from.toFixed(1)}s] ${l.content}`).join(" ");
                } catch(e) {}
            }
        }

        // 策略 B: 调用 Player WBI 接口获取高精度字幕数据
        if (!subText) {
            try {
                const params = { bvid, cid, web_location: 1315873 };
                const query = WbiSigner.sign(params, wbiKeys.img_key, wbiKeys.sub_key);
                const resp = await request(`https://api.bilibili.com/x/player/wbi/v2?${query}`);
                const json = JSON.parse(resp.content);
                
                const s = json?.data?.subtitle?.subtitles?.[0];
                if (s) {
                    const u = s.subtitle_url.startsWith("//") ? "https:" + s.subtitle_url : s.subtitle_url;
                    const subResp = await request(u);
                    subText = JSON.parse(subResp.content).body.map(l => `[${parseFloat(l.from).toFixed(1)}s] ${l.content}`).join(" ");
                }
            } catch(e) {}
        }

        // 策略 C: 提取 AI 智能总结生成的文本内容
        if (!subText) {
            try {
                const params = { bvid, cid, up_mid: owner.mid };
                const query = WbiSigner.sign(params, wbiKeys.img_key, wbiKeys.sub_key);
                const resp = await request(`https://api.bilibili.com/x/web-interface/view/conclusion/get?${query}`);
                const json = JSON.parse(resp.content);
                
                const parts = json?.data?.model_result?.subtitle?.[0]?.part_subtitle;
                if (parts) {
                    subText = "【AI 总结内容】 " + parts.map(p => `[${parseFloat(p.start_timestamp).toFixed(1)}s] ${p.content}`).join(" ");
                }
            } catch(e) {}
        }

        return subText;
    }

    // ------------------------------------------------------------------------
    // [弹幕获取逻辑]
    // ------------------------------------------------------------------------
    // 从压缩数据中提取弹幕，支持数量限制。
    // ------------------------------------------------------------------------
    async function get_danmaku_from_api(cid, count) {
        const danmaku_list = [];
        try {
            const url = `${API_GET_DANMAKU}?oid=${cid}`;
            const response = await request(url);
            if (!response.isSuccessful()) {
                return { danmaku: [], error: `Failed to get danmaku, status: ${response.statusCode}` };
            }
            const compressedData = response.bodyAsBase64();
            if (!compressedData) {
                return { danmaku: [], error: null };
            }
            const danmaku_content = pako.inflate(compressedData, { to: 'string' });
            const regex = /<d p=".*?">(.*?)<\/d>/g;
            let match;
            while ((match = regex.exec(danmaku_content)) !== null) {
                if (danmaku_list.length >= count) {
                    break;
                }
                danmaku_list.push(unescapeXml(match[1]));
            }
            return { danmaku: danmaku_list, error: null };
        } catch (e) {
            return { danmaku: [], error: `Failed to get or parse danmaku: ${e.message}` };
        }
    }

    function unescapeXml(text) {
        return text.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    }

    // ------------------------------------------------------------------------
    // [评论获取逻辑]
    // ------------------------------------------------------------------------
    // 支持分页获取所有热门评论，按热度排序。
    // ------------------------------------------------------------------------
    async function get_comments_from_api(aid) {
        var _a, _b;
        const all_comments = [];
        if (!wbiKeys) {
            return { comments: "", count: 0, error: "获取 WBI keys 失败，无法请求评论 API" };
        }
        let page_num = 1;
        let total_pages = 1;
        try {
            while (page_num <= total_pages) {
                const params = {
                    type: 1,
                    oid: aid,
                    sort: 2, // sort=2 for hot
                    pn: page_num
                };
                const signed_query = WbiSigner.sign(params, wbiKeys.img_key, wbiKeys.sub_key);
                const url = `${API_GET_COMMENTS}?${signed_query}`;
                const response = await request(url);
                if (!response.isSuccessful()) {
                    console.error(`Failed to get comments page ${page_num}, status: ${response.statusCode}`);
                    page_num++;
                    continue;
                }
                const comments_data = JSON.parse(response.content);
                if (comments_data.code !== 0) {
                    console.error(`API error on page ${page_num}: ${comments_data.message}`);
                    page_num++;
                    continue;
                }
                if (page_num === 1 && ((_a = comments_data.data) === null || _a === void 0 ? void 0 : _a.page)) {
                    total_pages = Math.ceil(comments_data.data.page.count / comments_data.data.page.size);
                }
                if ((_b = comments_data.data) === null || _b === void 0 ? void 0 : _b.replies) {
                    for (const comment of comments_data.data.replies) {
                        const formatted_comment = format_comment(comment);
                        if (formatted_comment) {
                            all_comments.push(formatted_comment);
                        }
                    }
                }
                page_num++;
            }
            const comment_summary = format_comments_to_string(all_comments);
            return { comments: comment_summary, count: all_comments.length, error: null };
        } catch (e) {
            const comment_summary = format_comments_to_string(all_comments);
            return { comments: comment_summary, count: all_comments.length, error: `Failed to get comments: ${e.message}` }; // 返回已获取的部分数据
        }
    }

    function format_comment(comment_item) {
        const sub_comments = (comment_item.replies || []).map(format_comment).filter(Boolean);
        return {
            user: comment_item.member.uname,
            content: comment_item.content.message,
            likes: comment_item.like || 0,
            time: new Date(comment_item.ctime * 1000).toLocaleDateString(),
            sub_comments: sub_comments
        };
    }

    function format_comments_to_string(comments) {
        const result = [];
        function format_single(comment, indent) {
            result.push(`${indent}- ${comment.user} (👍${comment.likes}) [${comment.time}]: ${comment.content}`);
            if (comment.sub_comments && comment.sub_comments.length > 0) {
                for (const sub of comment.sub_comments) {
                    format_single(sub, indent + "  ");
                }
            }
        }
        for (const comment of comments) {
            format_single(comment, "");
        }
        return result.join('\n');
    }

    // ------------------------------------------------------------------------
    // [视频搜索逻辑]
    // ------------------------------------------------------------------------
    // 支持关键词搜索，返回分页结果。
    // ------------------------------------------------------------------------
    async function search_videos_from_api(keyword, page) {
        if (!wbiKeys) {
            return { results: null, error: "获取 WBI keys 失败，无法请求搜索 API" };
        }
        try {
            const params = {
                keyword: keyword,
                page: page,
                search_type: "video"
            };
            const signed_query = WbiSigner.sign(params, wbiKeys.img_key, wbiKeys.sub_key);
            const url = `${API_SEARCH}?${signed_query}`;
            const response = await request(url);
            if (!response.isSuccessful()) {
                return { results: null, error: `搜索失败, status: ${response.statusCode}` };
            }
            const search_data = JSON.parse(response.content);
            if (search_data.code !== 0) {
                return { results: null, error: `搜索 API 错误: ${search_data.message}` };
            }
            return { results: search_data.data, error: null };
        } catch (e) {
            return { results: null, error: `搜索时发生异常: ${e.message}` };
        }
    }

    function format_search_results_to_string(data, count) {
        var _a;
        if (!data.result) {
            return { formatted: "没有找到相关结果。", result_count: 0, total_count: 0 };
        }
        const videoResults = (_a = data.result
            .find((item) => item.result_type === "video")) === null || _a === void 0 ? void 0 : _a.data;
        if (!videoResults || videoResults.length === 0) {
            return { formatted: "没有找到相关视频结果。", result_count: 0, total_count: data.numResults || 0 };
        }
        const slicedResults = videoResults.slice(0, count);
        const formattedResults = slicedResults
            .map((video, index) => {
            var _a, _b, _c;
            const cleanTitle = video.title.replace(/<em class="keyword">|<\/em>/g, "");
            const cleanDescription = video.description.replace(/<em class="keyword">|<\/em>/g, "");
            return [
                `${index + 1}. "${cleanTitle}" - ${video.author}`,
                `   BV ID: ${video.bvid}`,
                `   播放: ${(_a = video.play) === null || _a === void 0 ? void 0 : _a.toLocaleString()}`,
                `   弹幕: ${(_b = video.danmaku) === null || _b === void 0 ? void 0 : _b.toLocaleString()}`,
                `   点赞: ${(_c = video.like) === null || _c === void 0 ? void 0 : _c.toLocaleString()}`,
                `   时长: ${video.duration}`,
                `   发布于: ${new Date(video.pubdate * 1000).toLocaleDateString()}`,
                `   简介: ${cleanDescription === null || cleanDescription === void 0 ? void 0 : cleanDescription.substring(0, 100)}${(cleanDescription === null || cleanDescription === void 0 ? void 0 : cleanDescription.length) > 100 ? "..." : ""}`,
            ].join("\n");
        })
            .join("\n\n");
        return { formatted: formattedResults, result_count: slicedResults.length, total_count: data.numResults || 0 };
    }

    // ------------------------------------------------------------------------
    // [用户信息获取逻辑]
    // ------------------------------------------------------------------------
    // 获取用户基本信息，包括粉丝数、关注数等。
    // ------------------------------------------------------------------------
    async function get_user_info_from_api(mid) {
        if (!wbiKeys) {
            return { user_info: null, error: "获取 WBI keys 失败，无法请求用户信息 API" };
        }
        try {
            // Get user account info (WBI signed)
            const params = { mid };
            const signed_query = WbiSigner.sign(params, wbiKeys.img_key, wbiKeys.sub_key);
            const url = `${API_GET_USER_INFO}?${signed_query}`;
            const response = await request(url);
            if (!response.isSuccessful()) {
                return { user_info: null, error: `获取用户信息失败, status: ${response.statusCode}` };
            }
            const userData = JSON.parse(response.content);
            if (userData.code !== 0) {
                return { user_info: null, error: `用户信息 API 错误: ${userData.message}` };
            }
            // Get user relation stat (not WBI signed)
            const statUrl = `${API_GET_RELATION_STAT}?vmid=${mid}`;
            const statResponse = await request(statUrl);
            let follower = -1, following = -1;
            if (statResponse.isSuccessful()) {
                const statData = JSON.parse(statResponse.content);
                if (statData.code === 0) {
                    follower = statData.data.follower;
                    following = statData.data.following;
                }
            }
            const userInfo = {
                mid: userData.data.mid,
                name: userData.data.name,
                sex: userData.data.sex,
                face: userData.data.face,
                sign: userData.data.sign,
                level: userData.data.level,
                birthday: userData.data.birthday,
                follower: follower,
                following: following
            };
            return { user_info: userInfo, error: null };
        } catch (e) {
            return { user_info: null, error: `获取用户信息时发生异常: ${e.message}` };
        }
    }

    function format_user_info_to_string(user) {
        return [
            `昵称: ${user.name} (UID: ${user.mid})`,
            `性别: ${user.sex}`,
            `等级: LV${user.level}`,
            `生日: ${user.birthday || '未设置'}`,
            `粉丝数: ${user.follower.toLocaleString()}`,
            `关注数: ${user.following.toLocaleString()}`,
            `个人简介: ${user.sign || '这个UP主很懒，什么都没有写...'}`,
            `头像链接: ${user.face}`
        ].join('\n');
    }

    // ------------------------------------------------------------------------
    // [对外工具接口]
    // ------------------------------------------------------------------------
    // 所有工具函数的入口，确保异步执行并处理异常。
    // ------------------------------------------------------------------------

    return {
        /**
         * 获取视频字幕
         * 执行流程: 初始化 -> 标识还原 -> 基础信息获取 -> 密钥获取 -> 字幕三级策略匹配 -> 格式化输出。
         */
        get_subtitles: async (params) => {
            try {
                await init();
                const [info, wbiKeys] = await Promise.all([
                    resolveAndGetBaseInfo(params.url),
                    getWbiKeys()
                ]);
                
                const subs = await searchSubsInternal(info, wbiKeys);
                
                let output = `### 视频字幕\n**标题**: ${info.title}\n**创作者**: ${info.owner.name}\n\n`;
                
                if (subs) {
                    // 内容截断逻辑：针对长视频进行 15000 字符的安全截断，防止上下文过载。
                    const truncated = subs.length > 15000 ? subs.substring(0, 15000) + "\n... (内容过长已执行截断)" : subs;
                    output += `\`\`\`text\n${truncated}\n\`\`\``;
                } else {
                    output += "> 暂未检索到字幕数据。可能原因包括：视频未配置字幕、AI 总结未生成或鉴权 Cookie 已失效。";
                }
                
                complete({ success: true, data: output });
            } catch (e) {
                complete({ success: false, message: `字幕获取失败: ${e.message}` });
            }
        },

        /**
         * 获取视频弹幕
         * 执行流程: 初始化 -> 标识还原 -> 基础信息获取 -> 弹幕提取。
         */
        get_danmaku: async (params) => {
            try {
                await init();
                const { url, count = 500 } = params;
                const info = await resolveAndGetBaseInfo(url);
                if (count > 1000) {
                    return complete({ success: false, message: "参数 'count' 不能超过 1000" });
                }
                const { danmaku, error: danmakuError } = await get_danmaku_from_api(info.cid, count);
                if (danmakuError) {
                    return complete({ success: false, message: `获取弹幕失败: ${danmakuError}` });
                }
                if (danmaku.length === 0) {
                    return complete({ success: true, message: "该视频没有弹幕", data: [] });
                }
                complete({ success: true, message: `成功获取 ${danmaku.length} 条弹幕`, data: danmaku });
            } catch (e) {
                complete({ success: false, message: `弹幕获取失败: ${e.message}` });
            }
        },

        /**
         * 获取视频热门评论
         * 执行流程: 初始化 -> 标识还原 -> 评论 API 检索 (热度排序，支持分页) -> 列表格式化。
         */
        get_comments: async (params) => {
            try {
                await init();
                const info = await resolveAndGetBaseInfo(params.url);
                const { comments, count, error: commentsError } = await get_comments_from_api(info.aid);
                if (commentsError && count === 0) {
                    return complete({ success: false, message: `获取评论失败: ${commentsError}` });
                }
                if (count === 0) {
                    return complete({ success: true, message: "该视频没有热门评论", data: "" });
                }
                const message = commentsError
                    ? `成功获取 ${count} 条热门评论，但过程中发生错误: ${commentsError}`
                    : `成功获取 ${count} 条热门评论`;
                complete({ success: true, message: message, data: comments });
            } catch (e) {
                complete({ success: false, message: `评论获取失败: ${e.message}` });
            }
        },

        /**
         * 在Bilibili上搜索视频
         * 执行流程: 初始化 -> WBI 签名 -> API 搜索 -> 结果格式化。
         */
        search_videos: async (params) => {
            try {
                await init();
                const { keyword, page = 1, count = 10 } = params;
                if (count > 20) {
                    return complete({ success: false, message: "参数 'count' 不能超过 20" });
                }
                const { results, error } = await search_videos_from_api(keyword, page);
                if (error) {
                    return complete({ success: false, message: `搜索失败: ${error}` });
                }
                const { formatted, result_count, total_count } = format_search_results_to_string(results, count);
                if (result_count === 0) {
                    return complete({ success: true, message: "没有找到相关视频。", data: "" });
                }
                const message = `成功为 "${keyword}" 找到 ${total_count} 个相关视频，当前显示第 ${page} 页的 ${result_count} 个结果。`;
                complete({ success: true, message, data: formatted });
            } catch (e) {
                complete({ success: false, message: `搜索失败: ${e.message}` });
            }
        },

        /**
         * 获取B站用户的基本信息
         * 执行流程: 初始化 -> WBI 签名 -> API 获取用户信息及统计 -> 格式化输出。
         */
        get_user_info: async (params) => {
            try {
                await init();
                const midStr = String(params.mid || "").match(/\d+/)?.[0];
                const numericMid = midStr ? parseInt(midStr, 10) : 0;

                if (!numericMid || numericMid <= 0) {
                    return complete({ success: false, message: "参数 'mid' 格式错误，必须包含有效的用户数字 ID" });
                }

                const { user_info, error } = await get_user_info_from_api(numericMid);
                if (error) {
                    return complete({ success: false, message: `获取用户信息失败: ${error}` });
                }
                if (!user_info) {
                    return complete({ success: false, message: "未能获取到用户信息" });
                }
                const formatted_info = format_user_info_to_string(user_info);
                const message = `成功获取 UID:${numericMid} 的用户信息。`;
                complete({ success: true, message, data: formatted_info });
            } catch (e) {
                complete({ success: false, message: `用户信息获取失败: ${e.message}` });
            }
        },

        /**
         * 连通性测试
         * 验证 Bilibili API 可达性与 Cookie 配置状态
         */
        test: async () => {
            try {
                const startTime = Date.now();
                const testResponse = await client.newRequest()
                    .url("https://api.bilibili.com/x/web-interface/nav")
                    .method('GET')
                    .headers(BASE_HEADERS)
                    .build()
                    .execute();
                const latency = Date.now() - startTime;
                const hasCookie = !!USER_COOKIE;
                let loginStatus = '未配置 Cookie（匿名模式）';
                if (hasCookie && testResponse.isSuccessful()) {
                    try {
                        const navData = JSON.parse(testResponse.content || '{}');
                        if (navData.code === 0 && navData.data && navData.data.isLogin) {
                            loginStatus = `Cookie 有效，已登录（用户: ${navData.data.uname}）`;
                        } else {
                            loginStatus = 'Cookie 已配置但登录已失效或未登录';
                        }
                    } catch (e) {
                        loginStatus = 'Cookie 已配置（登录状态解析失败）';
                    }
                }
                complete({
                    success: testResponse.isSuccessful(),
                    message: testResponse.isSuccessful() ? 'Bilibili API 连通性测试通过' : `HTTP ${testResponse.statusCode}`,
                    data: `## Bilibili API 连通性测试报告\n\n` +
                          `- **API 网关**: api.bilibili.com\n` +
                          `- **状态**: ${testResponse.isSuccessful() ? '✅ 连通正常' : '❌ 连通异常'}\n` +
                          `- **HTTP 状态码**: ${testResponse.statusCode}\n` +
                          `- **响应延迟**: ${latency}ms\n` +
                          `- **登录状态**: ${loginStatus}`
                });
            } catch (e) {
                complete({ success: false, message: `连通性测试失败: ${e.message}` });
            }
        }
    };
})();

// ----------------------------------------------------------------------------
// [工具导出]
// ----------------------------------------------------------------------------
exports.get_subtitles = bilibili_video.get_subtitles;
exports.get_danmaku = bilibili_video.get_danmaku;
exports.get_comments  = bilibili_video.get_comments;
exports.search_videos = bilibili_video.search_videos;
exports.get_user_info = bilibili_video.get_user_info;
exports.test          = bilibili_video.test;