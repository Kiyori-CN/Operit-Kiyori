/* METADATA
{
    "name": "netease_music",
    "version": "1.0",
    "display_name": {
        "zh": "网易云音乐控制",
        "en": "NetEase Cloud Music Control"
    },
    "description": {
        "zh": "网易云音乐工具包。采用 API 预搜索与 URI Scheme ID 直达混合架构，实现精准点歌播放。内置智能分词匹配算法、歌词提取引擎、歌单跳转及 API 连通性测试。支持自定义反向代理地址。",
        "en": "NetEase Cloud Music Toolkit. Hybrid 'API Pre-search + URI Scheme Direct' architecture for precise playback. Includes smart token matching, lyric extraction, playlist navigation, and API connectivity test. Supports custom reverse proxy."
    },
    "env": [
        {
            "name": "NETEASE_MUSIC_PROXY",
            "description": {
                "zh": "网易云音乐 API 反向代理基础地址（可选）。格式：https://your-proxy.example.com，替换默认的 music.163.com 请求域名。不填则直连官方接口",
                "en": "Optional reverse proxy base URL for NetEase Music API. Format: https://your-proxy.example.com. Replaces music.163.com. Leave empty for direct access."
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "play_song",
            "description": {
                "zh": "精准点歌工具。通过 歌名 歌手 格式匹配最佳搜索结果并直接跳转播放，具备多级回退机制（URI直达 → 系统媒体意图 → 搜索页降级）。",
                "en": "Play specific song via 'Title Artist' keyword. Auto-matches and plays via multi-level fallback (URI direct → system media intent → search page)."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词，建议格式为：歌名 歌手", "en": "Search keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "get_lyrics",
            "description": {
                "zh": "歌词提取工具。支持获取指定歌曲的原始歌词及其对应的中文翻译内容（LRC 格式）。",
                "en": "Extract lyrics (LRC format) including original and Chinese translation."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "歌曲搜索关键词（建议格式：歌名 歌手）", "en": "Song keyword (recommended: title + artist)" }
                }
            ]
        },
        {
            "name": "open_playlist",
            "description": {
                "zh": "歌单跳转工具。搜索并直接打开匹配度最高的云音乐歌单详情页。",
                "en": "Search and open the best matching playlist detail page."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "歌单关键词（如 华语流行金曲）", "en": "Playlist keyword" }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "API 连通性测试。验证网易云音乐搜索接口是否可正常访问，并检查代理配置是否生效。",
                "en": "Connectivity test. Verifies NetEase Music API accessibility and proxy configuration."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称：网易云音乐工具包 (NetEase Cloud Music Toolkit)
 * ----------------------------------------------------------------------------
 * 架构说明：
 * 1. 数据驱动：采用全公开 API 进行数据检索，不依赖用户登录状态。
 * 2. 混合调度：结合 API 预搜索定位与 URI Scheme 协议跳转，确保播放行为的精准与及时。
 * 3. 智能路由：具备多层级回退机制（协议直达 -> 系统意图 -> 搜索聚合页），保障调用稳定性。
 * ============================================================================
 */
const netease_music = (function () {
    
    // ========================================================================
    // 配置区域
    // ========================================================================
    /**
     * 从环境变量读取反向代理配置，构建 NetEase API 基础地址
     * @returns {string} 基础 URL（无尾部斜杠）
     */
    function _getNeteaseBase() {
        let proxy = (typeof getEnv === 'function') ? (getEnv('NETEASE_MUSIC_PROXY') || '') : '';
        proxy = proxy.trim().replace(/\/+$/, '');
        if (proxy && !proxy.startsWith('http')) proxy = 'https://' + proxy;
        return proxy || 'https://music.163.com';
    }

    const CONFIG = {
        PKG: "com.netease.cloudmusic",
        SCHEME: "orpheus://",
        API: {
            get SEARCH() { return _getNeteaseBase() + '/api/search/get/web'; },
            get LYRIC()  { return _getNeteaseBase() + '/api/song/lyric'; }
        },
        HEADERS: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://music.163.com/",
            "Accept": "application/json"
        }
    };

    const client = OkHttp.newClient();

    // ========================================================================
    // 通讯层实现
    // ========================================================================

    /**
     * 发送异步 GET 请求
     * @param {string} url 目标地址
     * @returns {Promise<Object|null>} 返回响应对象或空值
     */
    async function httpGet(url) {
        const headers = { ...CONFIG.HEADERS };
        try {
            const resp = await client.newRequest()
                .url(url)
                .method('GET')
                .headers(headers)
                .build()
                .execute();
            return resp;
        } catch (e) {
            return null;
        }
    }

    // ========================================================================
    // 核心业务逻辑实现
    // ========================================================================

    /**
     * 获取搜索候选列表
     * @param {string} keyword 关键词
     * @param {number} type 搜索类型 (1 为单曲, 1000 为歌单)
     * @returns {Promise<Array>} 解析后的候选数据列表
     */
    async function fetchCandidates(keyword, type) {
        try {
            const url = `${CONFIG.API.SEARCH}?s=${encodeURIComponent(keyword)}&type=${type}&offset=0&total=true&limit=5`;
            const resp = await httpGet(url);
            
            if (!resp || !resp.isSuccessful()) return [];
            
            const json = JSON.parse(resp.content);
            if (!json.result) return [];

            if (type === 1) { // 处理单曲列表
                const songs = json.result.songs || [];
                return songs.map(s => ({
                    id: s.id,
                    name: s.name,
                    artist: s.artists && s.artists[0] ? s.artists[0].name : "未知歌手",
                    alias: s.alias ? s.alias.join(" ") : ""
                }));
            } else if (type === 1000) { // 处理歌单列表
                const playlists = json.result.playlists || [];
                return playlists.map(p => ({
                    id: p.id,
                    name: p.name,
                    creator: p.creator ? p.creator.nickname : ""
                }));
            }
        } catch (e) {
            return [];
        }
        return [];
    }

    /**
     * 智能匹配算法
     * 功能：对搜索结果进行分词校验，优先匹配歌名、歌手名及别名完全符合预期的条目。
     * @param {Array} candidates 候选列表
     * @param {string} rawKeyword 原始搜索词
     * @returns {Object|null} 最佳匹配项
     */
    function selectBestMatch(candidates, rawKeyword) {
        if (!candidates || candidates.length === 0) return null;

        const tokens = rawKeyword.trim().split(/\s+/).filter(t => t.length > 0);
        // 若词数过少则直接返回首项
        if (tokens.length < 2) return candidates[0];

        for (const item of candidates) {
            let score = 0;
            const textToSearch = (item.name + " " + item.artist + " " + (item.alias || "")).toLowerCase();
            
            for (const token of tokens) {
                if (textToSearch.includes(token.toLowerCase())) {
                    score++;
                }
            }
            // 匹配所有词元时视为精准匹配
            if (score === tokens.length) {
                return item;
            }
        }
        return candidates[0];
    }

    /**
     * 歌词提取内部逻辑
     * @param {number} songId 歌曲数字 ID
     */
    async function fetchLyricInternal(songId) {
        try {
            const url = `${CONFIG.API.LYRIC}?id=${songId}&lv=1&kv=1&tv=-1`;
            const resp = await httpGet(url);
            
            if (!resp || !resp.isSuccessful()) return null;

            const json = JSON.parse(resp.content);
            return {
                original: json.lrc ? json.lrc.lyric : "",
                tlyric: json.tlyric ? json.tlyric.lyric : ""
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * 智能启动器
     * 功能：执行多级启动策略，支持协议直达、系统意图搜索及搜索页面降级。
     */
    async function smartLaunch(targetUri, fallbackKeyword, mode = 'song') {
        // 第一优先级：协议地址直达
        if (targetUri) {
            try {
                const res = await Tools.System.intent({
                    action: "android.intent.action.VIEW",
                    uri: targetUri,
                    package: CONFIG.PKG,
                    flags: [0x10000000]
                });
                if (res) return { success: true, method: "协议直达" };
            } catch (e) {}
        }

        // 第二优先级：系统媒体搜索意图 (仅限单曲模式)
        if (mode === 'song' && fallbackKeyword) {
            try {
                const res = await Tools.System.intent({
                    action: "android.media.action.MEDIA_PLAY_FROM_SEARCH",
                    extras: { 
                        "query": fallbackKeyword,
                        "android.intent.extra.focus": "vnd.android.cursor.item/audio"
                    },
                    package: CONFIG.PKG,
                    flags: [0x10000000]
                });
                if (res) return { success: true, method: "系统意图" };
            } catch (e) {}
        }

        // 第三优先级：跳转至内部搜索结果页
        const searchUri = `${CONFIG.SCHEME}search?keyword=${encodeURIComponent(fallbackKeyword)}`;
        try {
            await Tools.System.intent({
                action: "android.intent.action.VIEW",
                uri: searchUri,
                package: CONFIG.PKG,
                flags: [0x10000000]
            });
            return { success: true, method: "搜索页面降级" };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // ========================================================================
    // 公开工具接口
    // ========================================================================

    return {
        /**
         * 功能：精准点歌播放
         */
        playSong: async (params) => {
            const kw = params.keyword;
            const candidates = await fetchCandidates(kw, 1);
            const match = selectBestMatch(candidates, kw);
            
            let targetUri = null;
            let logMsg = "";

            if (match) {
                targetUri = `${CONFIG.SCHEME}song/${match.id}`;
                logMsg = `精准匹配: ${match.name} - ${match.artist}`;
            } else {
                logMsg = "未发现精准结果，已执行模糊启动";
            }

            const res = await smartLaunch(targetUri, kw, 'song');

            complete({
                success: res.success,
                message: res.success ? `已成功下发指令 (${logMsg})` : "调用失败，请确认客户端已安装。",
                details: { matched_song: match || "无", launch_mode: res.method }
            });
        },

        /**
         * 功能：提取歌词内容
         */
        getLyrics: async (params) => {
            const kw = params.keyword;
            const candidates = await fetchCandidates(kw, 1);
            const match = selectBestMatch(candidates, kw);

            if (!match) {
                return complete({ success: false, message: `未能定位歌曲: ${kw}` });
            }

            const lyricData = await fetchLyricInternal(match.id);
            
            if (lyricData && lyricData.original) {
                let output = `### ${match.name} - ${match.artist}\n\n`;
                output += `#### 原始歌词\n\`\`\`lrc\n${lyricData.original}\n\`\`\`\n`;
                
                if (lyricData.tlyric) {
                    output += `\n#### 中文翻译\n\`\`\`lrc\n${lyricData.tlyric}\n\`\`\`\n`;
                }
                
                const MAX_LEN = 12000;
                if (output.length > MAX_LEN) {
                    output = output.substring(0, MAX_LEN) + "\n... (内容过长，已执行截断)";
                }

                complete({ success: true, data: output });
            } else {
                complete({ success: false, message: "该歌曲暂无歌词数据。" });
            }
        },

        /**
         * 功能：搜索并跳转至歌单详情
         */
        openPlaylist: async (params) => {
            const kw = params.keyword;
            const candidates = await fetchCandidates(kw, 1000);
            const match = candidates[0]; 
            
            let targetUri = null;
            if (match) {
                targetUri = `${CONFIG.SCHEME}playlist/${match.id}`;
            }

            const res = await smartLaunch(targetUri, kw, 'playlist');
            
            complete({
                success: res.success,
                message: res.success ? `已请求打开歌单: ${match ? match.name : kw}` : "打开失败",
                details: { matched_playlist: match }
            });
        },

        /**
         * 功能：连通性测试
         */
        testConnectivity: async () => {
            const gateway = _getNeteaseBase();
            const isProxy = gateway !== 'https://music.163.com';
            const testUrl = `${CONFIG.API.SEARCH}?s=test&type=1&offset=0&total=false&limit=1`;
            const startTime = Date.now();
            try {
                const resp = await httpGet(testUrl);
                const latency = Date.now() - startTime;
                if (resp && resp.isSuccessful()) {
                    complete({
                        success: true,
                        message: `✅ 网易云音乐 API 连通正常 | 延迟 ${latency}ms`,
                        data: {
                            latency_ms: latency,
                            gateway: gateway,
                            is_proxy: isProxy,
                            tip: isProxy ? `使用代理: ${gateway}` : '直连官方接口'
                        }
                    });
                } else {
                    complete({ success: false, message: `⚠️ 连接成功但响应异常 | HTTP ${resp ? resp.statusCode : 'N/A'} | 延迟 ${latency}ms` });
                }
            } catch (e) {
                complete({ success: false, message: `❌ 连接失败: ${e.message}` });
            }
        }
    };
})();

/**
 * 模块导出定义
 */
exports.play_song      = netease_music.playSong;
exports.get_lyrics     = netease_music.getLyrics;
exports.open_playlist  = netease_music.openPlaylist;
exports.test           = netease_music.testConnectivity;
