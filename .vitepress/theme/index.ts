// https://vitepress.dev/guide/custom-theme
import { h, nextTick, watch } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
import { enhanceDocImages, closeDocImageViewer } from './doc-image-viewer';
import './style.css'
import './custom.css'
// import { NolebaseBreadcrumbs } from '@nolebase/vitepress-plugin-breadcrumbs/client'

const toolbarLocales = {
  tr: {
    tooltips: {
      zoomIn: 'Yakınlaştır',
      zoomOut: 'Uzaklaştır',
      resetView: 'Görünümü sıfırla',
      copyCode: 'Kodu kopyala',
      copyCodeCopied: 'Kopyalandı',
      download: 'Diyagramı indir',
      toggleFullscreen: 'Tam ekranı aç/kapa',
    },
  },
  zh: {
    tooltips: {
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '重置视图',
      copyCode: '复制代码',
      copyCodeCopied: '已复制',
      download: '下载图表',
      toggleFullscreen: '切换全屏',
    },
  },
};

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark, localeIndex } = useData();
    const route = useRoute();
    
    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        theme: isDark.value ? 'dark' : 'forest',
      });
      
      mermaidRenderer.setToolbar({
        showLanguageLabel: false,
        downloadFormat: 'svg',
        fullscreenMode: 'browser',
        desktop: {
          copyCode: 'enabled',
          toggleFullscreen: 'enabled',
          resetView: 'enabled',
          zoomOut: 'enabled',
          zoomIn: 'enabled',
          zoomLevel: 'enabled',
          download: 'enabled',
        },
        fullscreen: {
          copyCode: 'disabled',
          toggleFullscreen: 'enabled',
          resetView: 'disabled',
          zoomLevel: 'disabled',
          download: 'enabled',
        },
        i18n: {
          localeIndex: localeIndex.value,
          locales: toolbarLocales,
        },
      });
    };
    
    nextTick(() => initMermaid());

    // 正文图片注入右下角全屏查看图标（逻辑见 doc-image-viewer.ts）
    nextTick(() => enhanceDocImages());

    // 主题/语言切换：重建 mermaid 渲染器
    watch(
        () => [isDark.value, localeIndex.value] as const,
        () => {
          initMermaid();
        },
    );

    // SPA 无刷新翻页：关闭可能残留的查看层，并重新扫描正文图片
    watch(
        () => route.path,
        () => {
          closeDocImageViewer();
          nextTick(() => enhanceDocImages());
        },
    );
    
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 将面包屑导航组件添加到文档上方
      //'doc-before': () => h(NolebaseBreadcrumbs),
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  }
} satisfies Theme
