import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import dts from 'vite-plugin-dts'
import { readFileSync } from 'fs'

const idsFixPlugin = () => ({
  name: 'ids-fix',
  transform(code, id) {
    if (id.includes('bpmn-js-token-simulation') && id.endsWith('.js')) {
      return code.replace(/import Ids from 'ids'/g, "import { Ids } from 'ids'")
    }
    return null
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/vue-bpmn-designer',
  publicDir: false,
  plugins: [
    vue(),
    idsFixPlugin(),
    vueJsx(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/typings/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    Components({
      extensions: ['vue', 'tsx', 'md'],
      globs: ['src/components/*/*.vue', 'src/components/*/*.tsx', 'src/components/*/index.ts'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.[tj]sx?$/],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: 'src/typings/components.d.ts',
    }),
    vueDevTools(),
    cssInjectedByJsPlugin(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: './tsconfig.app.json',
      cleanVueFileName: true,
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/index.ts'),
      name: 'VueBpmnDesigner',
      fileName: (format) => `vue-bpmn-designer.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      plugins: [idsFixPlugin()],
      external: (id: string) => {
        const externals = [
          'vue',
          'pinia',
          'vue-i18n',
          'element-plus',
          '@element-plus/icons-vue',
          '@vueuse/core',
          'bpmn-js',
          'bpmn-js-bpmnlint',
          'bpmn-js-color-picker',
          'bpmn-js-create-append-anything',
          'bpmn-auto-layout',
          'diagram-js',
          'diagram-js-minimap',
          'diagram-js-grid',
          'diagram-js-grid-bg',
          'bpmnlint',
          'didi',
          'lodash-es',
          'tiny-svg',
          'codemirror',
          '@codemirror/autocomplete',
          '@codemirror/commands',
          '@codemirror/lang-javascript',
          '@codemirror/lang-json',
          '@codemirror/language',
          '@codemirror/legacy-modes',
          '@codemirror/lint',
          '@codemirror/state',
          '@codemirror/view',
          '@lezer/highlight',
        ]
        return externals.some((ext) => id === ext || id.startsWith(ext + '/'))
      },
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'vue-i18n': 'VueI18n',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@vueuse/core': 'VueUse',
          'bpmn-js': 'BpmnJS',
          'bpmn-js-bpmnlint': 'BpmnJSBpmnlint',
          'bpmn-js-color-picker': 'BpmnJSColorPicker',
          'bpmn-js-create-append-anything': 'BpmnJSCreateAppendAnything',
          'bpmn-auto-layout': 'BpmnAutoLayout',
          'diagram-js': 'DiagramJS',
          'diagram-js-minimap': 'DiagramJSMinimap',
          'diagram-js-grid': 'DiagramJSGrid',
          'diagram-js-grid-bg': 'DiagramJSGridBg',
          bpmnlint: 'Bpmnlint',
          didi: 'Didi',
          'lodash-es': 'LodashEs',
          'tiny-svg': 'TinySvg',
          codemirror: 'Codemirror',
          '@codemirror/autocomplete': 'CodemirrorAutocomplete',
          '@codemirror/commands': 'CodemirrorCommands',
          '@codemirror/lang-javascript': 'CodemirrorLangJavascript',
          '@codemirror/lang-json': 'CodemirrorLangJson',
          '@codemirror/language': 'CodemirrorLanguage',
          '@codemirror/legacy-modes': 'CodemirrorLegacyModes',
          '@codemirror/lint': 'CodemirrorLint',
          '@codemirror/state': 'CodemirrorState',
          '@codemirror/view': 'CodemirrorView',
          '@lezer/highlight': 'LezerHighlight',
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        sanitizeFileName(name) {
          const match = /^[a-z]:/i.exec(name)
          const driveLetter = match ? match[0] : ''
          return (
            driveLetter +
            name.substring(driveLetter.length).replace(/[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g, '')
          )
        },
      },
    },
  },
})
