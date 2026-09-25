/**
 * 视频嵌入插件（本地化封装，参考 markdown-it-video 核心逻辑重写）
 *
 * 支持语法：@[service](视频ID 或 视频链接)
 *   @[youtube](dQw4w9WgXcQ)
 *   @[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 *   @[vimeo](119932781)
 *   @[bilibili](BV1aj411i7oJ)
 *   @[bilibili](https://www.bilibili.com/video/BV1aj411i7oJ?t=3)
 *   @[video](/media/demo.mp4)     —— 本地/远程视频文件
 *   @[audio](/media/demo.mp3)     —— 本地/远程音频文件
 *
 * 相比原插件的裁剪：移除已停运的 Vine、依赖 jQuery 的 OSF、少用的 Prezi；
 * 输出去掉 Bootstrap 类名，改用主题 custom.css 中的自适应样式。
 */

// ---------------- 各平台视频 ID 解析 ----------------

// YouTube：支持 youtu.be / watch?v= / embed/ / shorts/ / live/ 等链接形式，或直接给 11 位 ID
function youtubeParser(input) {
    const s = input.trim();
    const fromUrl = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    if (fromUrl) return fromUrl[1];
    const bareId = s.match(/^[\w-]{11}/);
    return bareId ? bareId[0] : s;
}

// Vimeo：支持 vimeo.com/{id}、channels、groups、album 等链接形式，或直接给数字 ID
const VIMEO_URL_RE = /(?:https?:)?\/\/(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
function vimeoParser(input) {
    const s = input.trim();
    const m = s.match(VIMEO_URL_RE);
    return m ? m[1] : s;
}

// Bilibili：支持 av号 / BV号，或播放页、player 嵌入页、分享链接
function bilibiliParser(input) {
    const s = input.trim();
    const m = s.match(/(av\d+|BV\w{10})/i) || s.match(/[?&](?:bvid|avid|aid)=([^&#\s]+)/i);
    if (!m) return s;
    return /^\d+$/.test(m[1]) ? "av" + m[1] : m[1]; // 纯数字 aid 补全 av 前缀
}

const ID_PARSERS = {
    youtube: youtubeParser,
    vimeo: vimeoParser,
    bilibili: bilibiliParser,
};

// ---------------- 嵌入地址生成 ----------------

// 从原始链接中提取 query 参数（如 ?t=3、&rel=0），转成 Map
function extractParameters(url) {
    const params = new Map();
    const parts = url.replace(/&amp;/gi, "&").split(/[#?&]/);
    for (let i = 1; i < parts.length; i++) {
        const kv = parts[i].split("=");
        if (kv.length > 1) params.set(kv[0], kv[1]);
    }
    return params;
}

// YouTube 的 t=0m10s / t=60 起始时间统一换算为 embed 需要的 start=<秒>
function normalizeYoutubeStart(params) {
    const t = params.get("t");
    if (t === undefined) return;
    const nums = t.match(/\d+/g) || [];
    let seconds = 0;
    nums.reverse().forEach((n, i) => {
        seconds += Number(n) * Math.pow(60, i);
    });
    params.set("start", seconds);
    params.delete("t");
}

function buildEmbedUrl(service, videoID, rawUrl, options) {
    switch (service) {
        case "youtube": {
            const params = extractParameters(rawUrl);
            if (options.youtube.parameters) {
                Object.entries(options.youtube.parameters).forEach(([k, v]) => params.set(k, v));
            }
            normalizeYoutubeStart(params);
            ["v", "feature", "origin"].forEach(k => params.delete(k));
            params.set("autoplay", "0"); // 禁止自动播放
            const domain = options.youtube.nocookie || rawUrl.includes("youtube-nocookie.com")
                ? "www.youtube-nocookie.com"
                : "www.youtube.com";
            const query = [...params].map(([k, v]) => `${k}=${v}`).join("&");
            return `https://${domain}/embed/${videoID}${query ? "?" + query : ""}`;
        }
        case "vimeo": {
            const params = extractParameters(rawUrl);
            params.set("autoplay", "0"); // 禁止自动播放
            const query = [...params].map(([k, v]) => `${k}=${v}`).join("&");
            return `https://player.vimeo.com/video/${videoID}${query ? "?" + query : ""}`;
        }
        case "bilibili": {
            const params = extractParameters(rawUrl);
            if (options.bilibili.parameters) {
                Object.entries(options.bilibili.parameters).forEach(([k, v]) => params.set(k, v));
            }
            params.delete("bvid");
            params.delete("avid");
            params.set("autoplay", "0"); // 禁止自动播放
            const key = videoID.toLowerCase().startsWith("bv") ? "bvid" : "avid";
            const query = [...params].map(([k, v]) => `${k}=${v}`).join("&");
            return `https://player.bilibili.com/player.html?${key}=${videoID}${query ? "&" + query : ""}`;
        }
        default:
            return videoID; // video / audio 直接使用原始地址
    }
}

// ---------------- 插件主体 ----------------

// @[service](id) —— service 必须以字母开头，id 允许首尾空白，不含右括号
const EMBED_RE = /^@\[([a-zA-Z][\w-]*)\]\(\s*([^)\r\n]*?)\s*\)/;

const defaults = {
    youtube: { width: 640, height: 360, nocookie: false },
    vimeo: { width: 640, height: 360 },
    bilibili: { width: 800, height: 450 },
};

export default function markdownVideo(md, userOptions = {}) {
    const options = { ...defaults, ...userOptions };

    // 行内规则：识别 @[service](id)，生成 video token
    function videoRule(state, silent) {
        if (state.src.charCodeAt(state.pos) !== 0x40 /* @ */) return false;

        const match = EMBED_RE.exec(state.src.slice(state.pos));
        if (!match) return false;

        const service = match[1].toLowerCase();
        const rawUrl = match[2];
        if (!rawUrl) return false; // 空链接不处理，按普通文本渲染

        // 未支持的平台不拦截，交给 markdown-it 默认规则（渲染成普通链接）
        if (!(service in ID_PARSERS) && service !== "video" && service !== "audio" && !(service in options)) {
            return false;
        }

        const videoID = ID_PARSERS[service] ? ID_PARSERS[service](rawUrl) : rawUrl;

        if (!silent) {
            const token = state.push("video", "", 0);
            token.service = service;
            token.videoID = videoID;
            token.url = rawUrl;
        }

        state.pos += match[0].length;
        return true;
    }

    // 渲染规则：video token -> HTML
    function videoRenderer(tokens, idx) {
        const { service, videoID, url } = tokens[idx];
        const esc = md.utils.escapeHtml;

        if (service === "video") {
            return `<div class="media-file-player"><video controls preload="metadata" src="${esc(videoID)}"></video></div>`;
        }
        if (service === "audio") {
            return `<div class="media-file-player"><audio controls preload="metadata" src="${esc(videoID)}"></audio></div>`;
        }

        const size = options[service] || { width: 640, height: 360 };
        const src = buildEmbedUrl(service, videoID, url, options);
        return (
            `<iframe class="video-embed ${service}-player" src="${esc(src)}" ` +
            `width="${esc(String(size.width))}" height="${esc(String(size.height))}" ` +
            `title="${esc(service)} video" loading="lazy" allowfullscreen></iframe>`
        );
    }

    md.inline.ruler.before("emphasis", "video", videoRule);
    md.renderer.rules.video = videoRenderer;
}
