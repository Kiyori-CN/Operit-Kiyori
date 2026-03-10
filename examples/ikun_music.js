/* METADATA
{
    "name": "ikun_music",
    "version": "1.0",
    "display_name": {
        "zh": "IKUN Music 全能工具包",
        "en": "IKUN Music All-in-One Toolkit"
    },
    "description": {
        "zh": "IKUN_Music 全能工具包。集成播放器远程控制与多平台歌词检索（网易云、QQ音乐、酷狗、咪咕）。支持聚合搜索（四平台并发、智能取字数最多前两条）、QQ音乐三级接口自动容错切换、自定义反向代理。",
        "en": "IKUN_Music All-in-One Toolkit. Player remote control and multi-platform lyrics (NetEase, QQ, KuGou, Migu). Features aggregate search (4-platform concurrent, top-2 by lyric length), QQ Music 3-tier auto-failover, and reverse proxy support."
    },
    "env": [
        {
            "name": "IKUN_MUSIC_QQ_PROXY",
            "description": {
                "zh": "QQ音乐 API 反向代理基础地址（可选）。格式：https://your-proxy.example.com，替换默认 u.y.qq.com 域名。不填则直连官方接口。",
                "en": "Optional reverse proxy base URL for QQ Music API (e.g. https://your-proxy.example.com). Replaces u.y.qq.com. Leave empty for direct access."
            },
            "required": false
        }
    ],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "get_lyrics_aggregate",
            "description": {
                "zh": "【首选】聚合歌词搜索。四平台（网易云、QQ音乐、酷狗、咪咕）同时并发搜索，智能筛选歌词字数最多的前两条结果返回，最大程度确保歌词完整准确。",
                "en": "[Recommended] Aggregate lyrics search. Searches all 4 platforms (NetEase, QQ, KuGou, Migu) concurrently, returns top-2 results ranked by lyric length to maximize completeness and accuracy."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词（建议：歌名 歌手）", "en": "Song keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "get_lyrics_netease",
            "description": {
                "zh": "网易云音乐歌词检索。返回 LRC 原文歌词及翻译歌词。",
                "en": "Get lyrics from NetEase Cloud Music. Returns original and translated LRC lyrics."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词（建议：歌名 歌手）", "en": "Song keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "get_lyrics_qq",
            "description": {
                "zh": "QQ音乐歌词检索。三级接口自动容错切换（musicu.fcg → c.y.qq.com → i.y.qq.com），支持自定义反向代理，返回 LRC 原文及翻译歌词。",
                "en": "Get lyrics from QQ Music. 3-tier auto-failover (musicu.fcg → c.y.qq.com → i.y.qq.com). Supports reverse proxy. Returns LRC lyrics with translations."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词（建议：歌名 歌手）", "en": "Song keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "get_lyrics_kugou",
            "description": {
                "zh": "酷狗音乐歌词检索。通过官方三步接口（搜歌 → 歌词候选 → 下载）获取 LRC 歌词。",
                "en": "Get lyrics from KuGou Music via official 3-step API (search → candidates → download)."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词（建议：歌名 歌手）", "en": "Song keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "get_lyrics_migu",
            "description": {
                "zh": "咪咕音乐歌词检索。主接口 MIGUM3.0，失败自动切换移动端备用接口兜底。",
                "en": "Get lyrics from Migu Music. Uses MIGUM3.0 API with automatic fallback to mobile endpoint."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索关键词（建议：歌名 歌手）", "en": "Song keyword (recommended: song title + artist)" }
                }
            ]
        },
        {
            "name": "play_music",
            "description": {
                "zh": "音乐精准播放。支持 歌名 - 歌手 格式关键词，自动优化并发送至播放器执行搜索播放。",
                "en": "Play music precisely. Supports 'Title - Artist' format. Auto-optimizes keyword and sends to player."
            },
            "parameters": [
                {
                    "name": "keyword",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "搜索词，建议 歌名 - 歌手 格式", "en": "Keyword (recommended: Title - Artist)" }
                }
            ]
        },
        {
            "name": "control_player",
            "description": {
                "zh": "播放器控制。支持 play / pause / prev / next / stop 指令。",
                "en": "Player control. Supports play / pause / prev / next / stop actions."
            },
            "parameters": [
                {
                    "name": "action",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "控制指令：play / pause / prev / next / stop", "en": "Action: play / pause / prev / next / stop" }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "全平台连通性测试。验证播放器协议及各歌词平台（网易云、QQ音乐、酷狗、咪咕）API 可访问性，输出详细报告。",
                "en": "Full connectivity test. Checks player protocol and all lyrics platform APIs (NetEase, QQ, KuGou, Migu) with a detailed report."
            },
            "parameters": []
        }
    ]
}
*/

const IKUN_MUSIC = (function () {

    // ── Constants ──────────────────────────────────────────────────────────────

    const CONFIG = {
        VERSION: "1.0",
        DEBUG: false
    };

    const VERSION          = CONFIG.VERSION;
    const PKG              = "com.ikunshare.music.mobile";
    const SCHEME           = "lxmusic://";
    const INTENT_ACTION    = "android.intent.action.VIEW";
    const INTENT_FLAGS     = [0x10000000];
    const TRUNCATE_SINGLE  = 12000;   // max chars for single-platform result
    const TRUNCATE_AGGR    = 24000;   // max chars for aggregate result

    const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
    const UA_MOBILE  = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

    const QQ_HEADERS = {
        "User-Agent": UA_DESKTOP,
        "Referer":    "https://y.qq.com/",
        "Origin":     "https://y.qq.com"
    };
    const QQ_LRC_HEADERS = {
        "User-Agent": UA_DESKTOP,
        "Referer":    "https://y.qq.com/portal/player.html",
        "Origin":     "https://y.qq.com"
    };

    // ── HTTP Client ────────────────────────────────────────────────────────────

    const client = OkHttp.newClient();

    async function httpGet(url, headers) {
        try {
            const b = client.newRequest().url(url).method('GET');
            if (headers) for (const k in headers) b.header(k, headers[k]);
            const r = await b.build().execute();
            return r.isSuccessful() ? r.content : null;
        } catch (_) { return null; }
    }

    async function httpPost(url, body, headers) {
        try {
            const b = client.newRequest().url(url).method('POST');
            if (headers) for (const k in headers) b.header(k, headers[k]);
            b.body(body, 'application/json');
            const r = await b.build().execute();
            return r.isSuccessful() ? r.content : null;
        } catch (_) { return null; }
    }

    function parseJson(raw) {
        if (!raw) return null;
        try {
            let s = raw.trim();
            // Strip JSONP wrappers (MusicJsonCallback(...), callback(...), etc.)
            if (/^[a-zA-Z_$][\w$]*\s*\(/.test(s)) {
                s = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')'));
            }
            return JSON.parse(s);
        } catch (_) { return null; }
    }

    async function getJson(url, headers)         { return parseJson(await httpGet(url, headers)); }
    async function postJson(url, body, headers)  { return parseJson(await httpPost(url, body, headers)); }

    // ── Utilities ──────────────────────────────────────────────────────────────

    function b64(input) {
        if (!input) return "";
        try {
            return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(input));
        } catch (_) {
            try { return decodeURIComponent(escape(atob(input))); } catch (_2) { return ""; }
        }
    }

    function unHtml(s) {
        if (!s) return "";
        return s
            .replace(/&apos;/g,  "'")
            .replace(/&quot;/g,  '"')
            .replace(/&gt;/g,    '>')
            .replace(/&lt;/g,    '<')
            .replace(/&amp;/g,   '&')
            .replace(/&#10;/g,   '\n')
            .replace(/&#13;/g,   '\r');
    }

    function truncate(s, max) {
        max = max || TRUNCATE_SINGLE;
        return s.length > max ? s.substring(0, max) + "\n\n…[内容过长已截断]" : s;
    }

    function fmtKw(kw) {
        if (!kw) return "";
        return kw.replace(/\s*-\s*/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();
    }

    /**
     * Extract the raw lyric body from a formatted result string.
     * Used to measure "true" lyric length for ranking.
     */
    function lrcBodyLen(data) {
        if (!data) return 0;
        // Sum character count of all ```lrc...``` blocks
        let total = 0;
        const re = /```lrc\n([\s\S]*?)\n```/g;
        let m;
        while ((m = re.exec(data)) !== null) total += m[1].length;
        return total > 0 ? total : data.length;
    }

    function intermediateMsg(msg) {
        if (typeof sendIntermediateResult === 'function')
            sendIntermediateResult({ success: true, message: msg });
    }

    // ── Player ─────────────────────────────────────────────────────────────────

    async function launchScheme(uri) {
        try {
            const r = await Tools.System.intent({
                action: INTENT_ACTION, uri: uri, package: PKG, flags: INTENT_FLAGS
            });
            return { ok: !!r };
        } catch (e) { return { ok: false, err: e.message }; }
    }

    async function playMusic(params) {
        const kw = fmtKw(params.keyword);
        if (!kw) return complete({ success: false, message: "关键词无效" });
        const uri = SCHEME + "music/searchPlay/" + encodeURIComponent(kw);
        const r = await launchScheme(uri);
        complete({
            success: r.ok,
            message: r.ok
                ? "▶ 播放指令已发送：" + kw
                : "启动失败，请检查 IKUN Music 是否已安装",
            uri: uri
        });
    }

    async function controlPlayer(params) {
        const raw = (params.action || "").toLowerCase().trim();
        const MAP = {
            play: "play", resume: "play",
            pause: "pause", stop: "pause",
            prev: "prev", previous: "prev", last: "prev",
            next: "next",
            toggle: "togglePlay", switch: "togglePlay"
        };
        const act = MAP[raw] || raw;
        const VALID = ["play", "pause", "prev", "next", "togglePlay"];
        if (!VALID.includes(act))
            return complete({ success: false, message: "无法识别指令：" + raw + "（支持：play / pause / prev / next / stop）" });
        const uri = SCHEME + "player/" + act;
        const r = await launchScheme(uri);
        complete({
            success: r.ok,
            message: r.ok ? "✅ 指令 [" + act + "] 已发送" : "指令发送失败，请确保 IKUN Music 在后台运行"
        });
    }

    // ── QQ Music ───────────────────────────────────────────────────────────────
    // Three-tier auto-failover:
    //   Tier 1: proxy/u.y.qq.com  musicu.fcg  (POST, new unified gateway)
    //   Tier 2: c.y.qq.com        soso search (GET, legacy)
    //   Tier 3: i.y.qq.com        direct      (GET, mobile gateway)

    function _getQQBase() {
        let p = (typeof getEnv === 'function') ? (getEnv('IKUN_MUSIC_QQ_PROXY') || '') : '';
        p = p.trim().replace(/\/+$/, '');
        if (p && !p.startsWith('http')) p = 'https://' + p;
        return p || 'https://u.y.qq.com';
    }

    async function qqSearchTier1(kw, n, base) {
        const data = JSON.stringify({
            comm: { ct: 24, cv: 0 },
            req_0: {
                module: "music.search.SearchCgiService",
                method: "DoSearchForQQMusicDesktop",
                param: { remoteplace: "txt.mqq.all", searchid: "", search_type: 0, query: kw, page_num: 1, num_per_page: n }
            }
        });
        const res = await postJson(base + "/cgi-bin/musicu.fcg?_webcgikey=DoSearchForQQMusicDesktop", data, QQ_HEADERS);
        if (res && res.req_0 && res.req_0.data && res.req_0.data.body && res.req_0.data.body.song)
            return res.req_0.data.body.song.list || [];
        return null;
    }

    async function qqSearchTier2(kw, n) {
        const url = "https://c.y.qq.com/soso/fcgi-bin/client_search_cp?w=" +
                    encodeURIComponent(kw) + "&format=json&n=" + n + "&p=1&cr=1&new_json=1";
        const res = await getJson(url, QQ_HEADERS);
        if (res && res.data && res.data.song && res.data.song.list)
            return res.data.song.list;
        return null;
    }

    async function qqSearchTier3(kw, n) {
        const url = "https://i.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg?format=json&newsong=1&inCharset=utf8&outCharset=utf8&platform=yqq&searchword=" +
                    encodeURIComponent(kw) + "&num_per_page=" + n + "&page_no=1";
        const res = await getJson(url, QQ_HEADERS);
        if (res && res.data && res.data.list && res.data.list.length)
            return res.data.list;
        return null;
    }

    async function qqSearch(kw, n) {
        const base = _getQQBase();
        n = n || 5;
        let list;
        // Tier 1
        list = await qqSearchTier1(kw, n, base);
        if (list && list.length) return list;
        // Tier 2
        list = await qqSearchTier2(kw, n);
        if (list && list.length) return list;
        // Tier 3
        list = await qqSearchTier3(kw, n);
        if (list && list.length) return list;
        return [];
    }

    function qqPickBestSong(list, kw) {
        if (!list || !list.length) return null;
        const t = kw.split(/\s*-\s*/)[0].trim().toLowerCase();
        for (const s of list) {
            if ((s.name || s.songname || "").toLowerCase().includes(t)) return s;
        }
        return list[0];
    }

    function qqSongMeta(song) {
        if (!song) return { name: "", mid: "", singer: "" };
        const name   = song.name || song.songname || "";
        const mid    = song.mid  || song.songmid  || "";
        let   singer = "Unknown";
        if (song.singer && song.singer.length)
            singer = song.singer.map(s => s.name || s.title || "").filter(Boolean).join(" / ") || "Unknown";
        return { name, mid, singer };
    }

    async function qqLyricTier1(songmid, base) {
        const data = JSON.stringify({
            comm: { ct: 24, cv: 0 },
            req_0: {
                module: "music.musichallSong.PlayLyricInfo",
                method: "GetPlayLyricInfo",
                param: { songMID: songmid, songID: 0 }
            }
        });
        const res = await postJson(base + "/cgi-bin/musicu.fcg", data, QQ_LRC_HEADERS);
        if (res && res.req_0 && res.req_0.data && res.req_0.data.lyric)
            return { lyric: res.req_0.data.lyric, trans: res.req_0.data.trans || "" };
        return null;
    }

    async function qqLyricTier2(songmid) {
        const url = "https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=" +
                    songmid + "&format=json&nobase64=0";
        const res = await getJson(url, QQ_LRC_HEADERS);
        if (res && res.lyric) return { lyric: res.lyric, trans: res.trans || "" };
        return null;
    }

    async function qqLyricTier3(songmid) {
        const url = "https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=" +
                    songmid + "&format=json&nobase64=0";
        const res = await getJson(url, QQ_LRC_HEADERS);
        if (res && res.lyric) return { lyric: res.lyric, trans: res.trans || "" };
        return null;
    }

    async function qqLyric(songmid) {
        const base = _getQQBase();
        let lrc;
        lrc = await qqLyricTier1(songmid, base); if (lrc) return lrc;
        lrc = await qqLyricTier2(songmid);        if (lrc) return lrc;
        lrc = await qqLyricTier3(songmid);        if (lrc) return lrc;
        return null;
    }

    async function fetchQQ(kw) {
        const list = await qqSearch(kw, 5);
        if (!list.length) return { success: false, msg: "QQ Music：未找到歌曲" };
        const song = qqPickBestSong(list, kw);
        const meta = qqSongMeta(song);
        if (!meta.mid) return { success: false, msg: "QQ Music：歌曲信息不完整" };
        const lrc = await qqLyric(meta.mid);
        if (!lrc) return { success: true, data: "### " + meta.name + " - " + meta.singer + " (QQ Music)\n\n该歌曲暂无歌词数据" };
        const lyricText = unHtml(b64(lrc.lyric));
        const transText = lrc.trans ? unHtml(b64(lrc.trans)) : "";
        let out = "### " + meta.name + " - " + meta.singer + " (QQ Music)\n\n#### 原文歌词\n```lrc\n" + lyricText + "\n```\n";
        if (transText) out += "\n#### 翻译\n```lrc\n" + transText + "\n```\n";
        return { success: true, data: truncate(out) };
    }

    // ── NetEase Cloud Music ────────────────────────────────────────────────────

    async function fetchNetEase(kw) {
        const h = { "Referer": "http://music.163.com/", "User-Agent": UA_DESKTOP };
        const res = await getJson(
            "http://music.163.com/api/search/get?s=" + encodeURIComponent(kw) +
            "&type=1&offset=0&total=true&limit=5", h
        );
        if (!res || !res.result || !res.result.songs || !res.result.songs.length)
            return { success: false, msg: "NetEase：未找到歌曲" };
        const song   = res.result.songs[0];
        const name   = song.name || "";
        const artist = (song.artists && song.artists[0]) ? song.artists[0].name : "Unknown";
        const lrc    = await getJson(
            "http://music.163.com/api/song/lyric?os=pc&id=" + song.id + "&lv=-1&kv=-1&tv=-1", h
        );
        if (!lrc || (!lrc.lrc && !lrc.tlyric))
            return { success: false, msg: "NetEase：暂无歌词" };
        let out = "### " + name + " - " + artist + " (NetEase)\n\n";
        if (lrc.lrc && lrc.lrc.lyric)     out += "#### 原文歌词\n```lrc\n" + lrc.lrc.lyric + "\n```\n";
        if (lrc.tlyric && lrc.tlyric.lyric) out += "\n#### 翻译\n```lrc\n" + lrc.tlyric.lyric + "\n```\n";
        return { success: true, data: truncate(out) };
    }

    // ── KuGou Music (3-step) ───────────────────────────────────────────────────

    async function fetchKuGou(kw) {
        // Step 1: Search song → get hash
        const sRes = await getJson(
            "http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=" +
            encodeURIComponent(kw) + "&page=1&pagesize=5&showtype=1"
        );
        if (!sRes || !sRes.data || !sRes.data.info || !sRes.data.info.length)
            return { success: false, msg: "KuGou：未找到歌曲" };
        const song = sRes.data.info[0];
        const hash = song.hash || "";
        if (!hash) return { success: false, msg: "KuGou：Hash 为空" };
        // Step 2: Get lyric candidates
        const lsRes = await getJson(
            "http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" +
            encodeURIComponent(kw) + "&duration=&hash=" + hash
        );
        if (!lsRes || !lsRes.candidates || !lsRes.candidates.length)
            return { success: false, msg: "KuGou：未找到歌词候选" };
        const c = lsRes.candidates[0];
        if (!c.id || !c.accesskey) return { success: false, msg: "KuGou：歌词凭证无效" };
        // Step 3: Download lyric content
        const ldRes = await getJson(
            "http://lyrics.kugou.com/download?ver=1&client=pc&id=" + c.id +
            "&accesskey=" + c.accesskey + "&fmt=lrc&charset=utf8"
        );
        if (!ldRes || !ldRes.content) return { success: false, msg: "KuGou：歌词内容为空" };
        const text = b64(ldRes.content);
        if (!text || text.trim().length < 5) return { success: false, msg: "KuGou：歌词解码失败" };
        const title = (song.songname || kw) + (song.singername ? " - " + song.singername : "");
        return { success: true, data: "### " + title + " (KuGou)\n\n```lrc\n" + text.trim() + "\n```" };
    }

    // ── Migu Music ─────────────────────────────────────────────────────────────

    async function fetchMigu(kw) {
        const h = { "User-Agent": UA_MOBILE, "Referer": "https://music.migu.cn/" };
        const sw = encodeURIComponent(JSON.stringify({
            song: 1, album: 0, singer: 0, tagSong: 0, mvSong: 0, songlist: 0, bestShow: 0
        }));
        let songName = "", singerName = "", copyrightId = "", lyricUrl = "";

        // Primary API: MIGUM3.0
        const sRes = await getJson(
            "https://pd.musicapp.migu.cn/MIGUM3.0/v1.0/content/search_all.do?ua=Android_migu&version=5.0.1&text=" +
            encodeURIComponent(kw) + "&pageNo=1&pageSize=5&searchSwitch=" + sw, h
        );
        if (sRes && sRes.songResultData && sRes.songResultData.result && sRes.songResultData.result.length) {
            const s = sRes.songResultData.result[0];
            songName    = s.name         || "";
            singerName  = (s.singers && s.singers.length) ? s.singers[0].name : "";
            copyrightId = s.copyrightId  || s.id || "";
            lyricUrl    = s.lyricUrl     || "";
        } else {
            // Fallback API: mobile search
            const bRes = await getJson(
                "https://m.music.migu.cn/migu/remoting/scr_search_tag?keyword=" +
                encodeURIComponent(kw) + "&type=2&rows=5&pgc=1", h
            );
            if (!bRes || !bRes.musics || !bRes.musics.length)
                return { success: false, msg: "Migu：未找到歌曲" };
            const s     = bRes.musics[0];
            songName    = s.songName  || s.title  || "";
            singerName  = s.singerName || s.artist || "";
            copyrightId = s.copyrightId || s.id   || "";
            lyricUrl    = s.lyricUrl  || s.lyrics  || "";
        }

        if (!copyrightId && !lyricUrl) return { success: false, msg: "Migu：未找到歌曲" };

        let lyricText = "";
        // Try direct lyricUrl first
        if (lyricUrl && lyricUrl.startsWith("http")) {
            const raw = await httpGet(lyricUrl, h);
            if (raw && raw.trim().length > 10) lyricText = raw.trim();
        }
        // Fallback: getLyric API
        if (!lyricText && copyrightId) {
            const lRes = await getJson(
                "https://music.migu.cn/v3/api/music/audioPlayer/getLyric?copyrightId=" + copyrightId,
                { ...h, "Referer": "https://music.migu.cn/" }
            );
            if (lRes && lRes.lyric) lyricText = lRes.lyric;
        }

        if (!lyricText) return { success: false, msg: "Migu：无歌词数据" };
        return { success: true, data: "### " + songName + " - " + singerName + " (Migu)\n\n```lrc\n" + lyricText + "\n```" };
    }

    // ── Aggregate Search ───────────────────────────────────────────────────────
    // Searches all 4 platforms concurrently.
    // Collects all successful results, ranks by lyric body length (descending),
    // returns the top 2 — ensuring the most complete lyrics are surfaced first.

    async function fetchAggregate(kw) {
        intermediateMsg("🔍 聚合搜索启动：" + kw + "  [网易云 / QQ / 酷狗 / 咪咕 四平台并发]");

        const PLATFORMS = [
            { id: "NetEase", fn: () => fetchNetEase(kw) },
            { id: "QQ",      fn: () => fetchQQ(kw)      },
            { id: "KuGou",   fn: () => fetchKuGou(kw)   },
            { id: "Migu",    fn: () => fetchMigu(kw)    }
        ];

        const settled = await Promise.allSettled(PLATFORMS.map(p => p.fn()));

        const results = [];
        settled.forEach((r, i) => {
            if (r.status === 'fulfilled' && r.value && r.value.success && r.value.data) {
                results.push({
                    platform: PLATFORMS[i].id,
                    data:     r.value.data,
                    score:    lrcBodyLen(r.value.data)   // rank by lyric body character count
                });
            }
        });

        if (!results.length)
            return { success: false, msg: "聚合搜索：四平台均未找到歌词，请尝试调整关键词" };

        // Sort descending by lyric length, take top 2
        results.sort((a, b) => b.score - a.score);
        const top2 = results.slice(0, 2);

        const platformNames = top2.map(r => r.platform).join(" · ");
        let out = "## 🎵 聚合歌词搜索结果  (" + top2.length + "/" + results.length + " 平台成功，已按歌词字数排序)\n\n";

        top2.forEach((r, i) => {
            out += "---\n\n### 📌 结果 " + (i + 1) + " — " + r.platform +
                   "  _(歌词字符数: " + r.score + ")_\n\n" + r.data + "\n\n";
        });

        return { success: true, data: truncate(out, TRUNCATE_AGGR) };
    }

    // ── Lyrics Router ──────────────────────────────────────────────────────────

    async function execLyrics(source, kw) {
        if (!kw || !kw.trim()) return complete({ success: false, message: "关键词不能为空" });
        kw = kw.trim();
        intermediateMsg("🔍 正在搜索：" + kw + "  [" + source + "]");
        let res;
        try {
            switch (source) {
                case 'aggregate': res = await fetchAggregate(kw); break;
                case 'netease':   res = await fetchNetEase(kw);   break;
                case 'qq':        res = await fetchQQ(kw);        break;
                case 'kugou':     res = await fetchKuGou(kw);     break;
                case 'migu':      res = await fetchMigu(kw);      break;
                default:          res = { success: false, msg: "未知平台：" + source };
            }
        } catch (e) {
            res = { success: false, msg: source + " 运行时错误：" + (e.message || e) };
        }
        if (res.success) complete({ success: true, data: res.data });
        else             complete({ success: false, message: res.msg });
    }

    // ── Connectivity Test ──────────────────────────────────────────────────────

    async function runTest() {
        const qqBase  = _getQQBase();
        const isProxy = qqBase !== 'https://u.y.qq.com';
        const tests   = [
            {
                name: "QQ音乐 Tier1 (musicu.fcg POST)",
                fn: async () => {
                    const d = JSON.stringify({
                        comm: { ct: 24, cv: 0 },
                        req_0: { module: "music.search.SearchCgiService", method: "DoSearchForQQMusicDesktop",
                                 param: { query: "test", page_num: 1, num_per_page: 1 } }
                    });
                    return await postJson(qqBase + "/cgi-bin/musicu.fcg?_webcgikey=DoSearchForQQMusicDesktop", d, QQ_HEADERS);
                }
            },
            {
                name: "QQ音乐 Tier2 (c.y.qq.com GET)",
                fn: async () => await getJson("https://c.y.qq.com/soso/fcgi-bin/client_search_cp?w=test&format=json&n=1&p=1&cr=1&new_json=1", QQ_HEADERS)
            },
            {
                name: "QQ音乐 Tier3 (i.y.qq.com GET)",
                fn: async () => await getJson("https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=test&format=json&nobase64=0", QQ_LRC_HEADERS)
            },
            {
                name: "网易云音乐",
                fn: async () => await getJson("http://music.163.com/api/search/get?s=test&type=1&offset=0&total=false&limit=1", { "Referer": "http://music.163.com/" })
            },
            {
                name: "酷狗音乐",
                fn: async () => await getJson("http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=test&page=1&pagesize=1")
            },
            {
                name: "咪咕音乐 MIGUM3.0",
                fn: async () => await getJson(
                    "https://pd.musicapp.migu.cn/MIGUM3.0/v1.0/content/search_all.do?ua=Android_migu&version=5.0.1&text=test&pageNo=1&pageSize=1&searchSwitch=%7B%22song%22%3A1%7D",
                    { "Referer": "https://music.migu.cn/", "User-Agent": UA_MOBILE }
                )
            },
            {
                name: "咪咕音乐 移动端备用",
                fn: async () => await getJson(
                    "https://m.music.migu.cn/migu/remoting/scr_search_tag?keyword=test&type=2&rows=1&pgc=1",
                    { "Referer": "https://music.migu.cn/", "User-Agent": UA_MOBILE }
                )
            }
        ];

        let report = "## IKUN Music v" + VERSION + " 连通性测试报告\n\n";
        if (isProxy) report += "> ⚙️ QQ音乐代理：" + qqBase + "\n\n";
        report += "| 平台 | 状态 | 延迟 |\n|------|------|------|\n";

        for (const t of tests) {
            const start = Date.now();
            try {
                const r  = await t.fn();
                const ms = Date.now() - start;
                const ok = r !== null;
                report += "| " + t.name + " | " + (ok ? "✅ 正常" : "⚠️ 响应异常") + " | " + ms + " ms |\n";
            } catch (e) {
                report += "| " + t.name + " | ❌ 连接失败 | — |\n";
            }
        }
        report += "\n_测试时间：" + new Date().toLocaleString() + "_";
        complete({ success: true, message: "连通性测试完成", data: report });
    }

    // ── Error Handling Wrapper ─────────────────────────────────────────────────

    async function wrapExecution(func, params, actionName) {
        try {
            return await func(params || {});
        } catch (error) {
            if (CONFIG.DEBUG) console.error('[' + actionName + '] Error:', error);
            complete({ success: false, message: actionName + ' 失败: ' + error.message });
        }
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    return {
        play_music:           function(p) { return wrapExecution(playMusic, p, '播放音乐'); },
        control_player:       function(p) { return wrapExecution(controlPlayer, p, '控制播放器'); },
        get_lyrics_aggregate: p => execLyrics('aggregate', p.keyword),
        get_lyrics_netease:   p => execLyrics('netease',   p.keyword),
        get_lyrics_qq:        p => execLyrics('qq',        p.keyword),
        get_lyrics_kugou:     p => execLyrics('kugou',     p.keyword),
        get_lyrics_migu:      p => execLyrics('migu',      p.keyword),
        test:                 runTest
    };

})();

// ── Exports ────────────────────────────────────────────────────────────────────

exports.play_music            = IKUN_MUSIC.play_music;
exports.control_player        = IKUN_MUSIC.control_player;
exports.get_lyrics_aggregate  = IKUN_MUSIC.get_lyrics_aggregate;
exports.get_lyrics_netease    = IKUN_MUSIC.get_lyrics_netease;
exports.get_lyrics_qq         = IKUN_MUSIC.get_lyrics_qq;
exports.get_lyrics_kugou      = IKUN_MUSIC.get_lyrics_kugou;
exports.get_lyrics_migu       = IKUN_MUSIC.get_lyrics_migu;
exports.test                  = IKUN_MUSIC.test;
