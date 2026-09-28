/**
 * 文档图片全屏查看器（theme 集成于 index.ts，样式在 custom.css）
 * - 正文图片右下角悬停显示「全屏查看」图标，点击图片本身无动作
 * - 点击图标打开全屏暗色无限画布：滚轮以鼠标为中心缩放、按住拖动平移
 * - ESC 或双击退出；查看期间锁定页面滚动
 * - 无第三方依赖；SPA 翻页后由主题重新调用 enhanceDocImages()（幂等）
 */

// 逃生口：md 中给 img 或其祖先加 data-no-zoom / .no-zoom 可跳过增强
const IMG_SELECTOR = '.VPContent .vp-doc img:not([data-no-zoom]):not(.no-zoom):not(:is([data-no-zoom] *))';

// 四角展开式「全屏」图标
const EXPAND_ICON =
    '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
    '<path fill="currentColor" d="M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 0h2v7h-7v-2h5v-5z"/>' +
    '</svg>';

const MIN_SCALE = 0.2;
const MAX_SCALE = 20;

interface ViewerState {
    scale: number;
    x: number;
    y: number;
}

let overlay: HTMLDivElement | null = null;
let viewerImg: HTMLImageElement | null = null;
const state: ViewerState = { scale: 1, x: 0, y: 0 };
let dragging = false;
let lastPointer = { x: 0, y: 0 };
// 活跃指针表：1 指/鼠标单键 = 拖动平移，2 指 = 捏合缩放（移动端无 wheel 事件）
const pointers = new Map<number, { x: number; y: number }>();
let pinch: { dist: number; scale: number; midX: number; midY: number } | null = null;

function clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}

function applyTransform() {
    if (viewerImg !== null) {
        viewerImg.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    }
}

function isOpen(): boolean {
    return overlay !== null && overlay.classList.contains('doc-img-viewer--open');
}

function onKeydown(e: KeyboardEvent) {
    if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
        closeViewer();
    }
}

/** 懒创建单例查看层，并绑定滚轮/拖动/捏合/双击交互 */
function ensureOverlay() {
    if (overlay !== null) return;

    overlay = document.createElement('div');
    overlay.className = 'doc-img-viewer';
    viewerImg = document.createElement('img');
    viewerImg.alt = '';
    viewerImg.draggable = false;
    overlay.appendChild(viewerImg);

    // 滚轮缩放：保持鼠标底下的图像点不动（图像经 flex 居中，布局中心 ≈ 视口中心）
    overlay.addEventListener('wheel', e => {
        e.preventDefault();
        const prev = state.scale;
        const next = clamp(prev * Math.exp(-e.deltaY * 0.0015), MIN_SCALE, MAX_SCALE);
        const k = next / prev;
        const ox = window.innerWidth / 2;
        const oy = window.innerHeight / 2;
        state.x = e.clientX - ox - (e.clientX - ox - state.x) * k;
        state.y = e.clientY - oy - (e.clientY - oy - state.y) * k;
        state.scale = next;
        applyTransform();
    }, { passive: false });

    // 拖动平移（单指针）+ 捏合缩放（双指针，以捏合中点为不动点并跟随中点移动）
    overlay.addEventListener('pointerdown', e => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        overlay!.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            const [p1, p2] = [...pointers.values()];
            pinch = {
                dist: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
                scale: state.scale,
                midX: (p1.x + p2.x) / 2,
                midY: (p1.y + p2.y) / 2,
            };
        } else if (pointers.size === 1) {
            dragging = true;
            lastPointer = { x: e.clientX, y: e.clientY };
            overlay!.classList.add('doc-img-viewer--dragging');
        }
    });
    overlay.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch !== null && pointers.size >= 2) {
            const [p1, p2] = [...pointers.values()];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
            const prev = state.scale;
            const next = clamp(pinch.scale * (dist / pinch.dist), MIN_SCALE, MAX_SCALE);
            const k = next / prev;
            const ox = window.innerWidth / 2;
            const oy = window.innerHeight / 2;
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2;
            // 两步合成：绕当前中点缩放 k 倍，再叠加中点位移（缩放+平移同步跟手）
            state.x = cx - ox - (cx - ox - state.x) * k + (cx - pinch.midX);
            state.y = cy - oy - (cy - oy - state.y) * k + (cy - pinch.midY);
            state.scale = next;
            pinch.midX = cx;
            pinch.midY = cy;
            applyTransform();
        } else if (dragging) {
            state.x += e.clientX - lastPointer.x;
            state.y += e.clientY - lastPointer.y;
            lastPointer = { x: e.clientX, y: e.clientY };
            applyTransform();
        }
    });
    const endPointer = (e: PointerEvent) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinch = null;
        if (pointers.size === 0) {
            dragging = false;
            overlay?.classList.remove('doc-img-viewer--dragging');
        } else if (pointers.size === 1) {
            // 捏合后剩单指：从该指当前位置继续平移，避免跳变
            const [p] = [...pointers.values()];
            lastPointer = { x: p.x, y: p.y };
            dragging = true;
        }
    };
    overlay.addEventListener('pointerup', endPointer);
    overlay.addEventListener('pointercancel', endPointer);

    // 双击退出
    overlay.addEventListener('dblclick', closeViewer);

    window.addEventListener('keydown', onKeydown);
    document.body.appendChild(overlay);
}

function openViewer(src: string, alt: string) {
    ensureOverlay();
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    viewerImg!.src = src;
    viewerImg!.alt = alt;
    applyTransform();
    overlay!.classList.add('doc-img-viewer--open');
    document.body.classList.add('doc-img-locked');
}

/** 关闭查看层（内部引用，对外导出名见文件末尾） */
function closeViewer() {
    if (overlay === null) return;
    overlay.classList.remove('doc-img-viewer--open');
    document.body.classList.remove('doc-img-locked');
}

export { closeViewer as closeDocImageViewer };

/** 扫描正文图片，注入右下角全屏图标（幂等，可在每次翻页后重复调用） */
export function enhanceDocImages() {
    if (typeof document === 'undefined') return; // SSR 预渲染阶段无 DOM
    document.querySelectorAll<HTMLImageElement>(IMG_SELECTOR + ':not(.doc-img-ready)').forEach(img => {
        img.classList.add('doc-img-ready');

        const wrap = document.createElement('span');
        wrap.className = 'doc-img-wrap';
        img.parentNode!.insertBefore(wrap, img);
        wrap.appendChild(img);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'doc-img-expand';
        btn.title = '全屏查看';
        btn.setAttribute('aria-label', '全屏查看');
        btn.innerHTML = EXPAND_ICON;
        btn.addEventListener('click', e => {
            // 图片可能位于 <a> 内，阻止触发链接跳转
            e.preventDefault();
            e.stopPropagation();
            openViewer(img.currentSrc || img.src, img.alt);
        });
        wrap.appendChild(btn);
    });
}
