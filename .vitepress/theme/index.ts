// https://vitepress.dev/guide/custom-theme
import { h, nextTick, watch } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress';
import { createMermaidRenderer } from 'vitepress-mermaid-renderer';
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
    
    watch(
        () => [isDark.value, localeIndex.value] as const,
        () => {
          initMermaid();
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
