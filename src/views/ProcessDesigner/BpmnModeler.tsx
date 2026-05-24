import { defineComponent, onMounted, watch, type PropType, ref } from 'vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import GridLineModule from 'diagram-js-grid-bg'
import MinimapModule from 'diagram-js-minimap'
import LintModule from 'bpmn-js-bpmnlint'
import TokenSimulationModule from 'bpmn-js-token-simulation'
import Translate from './Translate'
import httpTaskRenderer from './Renderer/index.ts'
import CustomModeling from './Modeling/index.ts'
import CustomContextPad from './ContextPad'
import CustomPopupMenu from './PopupMenu'
import CustomReplace from './Replace'
import ElementParse from './Parse'
import RerenderPalette from '@/views/ProcessDesigner/Palette'
import BpmnColorPickerModule from 'bpmn-js-color-picker'
import bpmnlint from './Lint'
import type { BpmnVersion } from '@/stores/bpmnVersion'

export default defineComponent({
  props: {
    options: {
      type: Object as PropType<Record<string, any>>,
      default: () => {},
    },
    version: {
      type: String as PropType<BpmnVersion>,
      default: 'activiti',
    },
    initialXml: {
      type: String,
      default: '',
    },
    // 待加载的 XML（用于版本切换时传递转换后的内容）
    pendingXml: {
      type: String,
      default: '',
    },
  },
  emits: ['modeler-ready', 'version-changed'],
  setup(props, { emit, expose }) {
    const canvasRef = ref<HTMLDivElement>()
    const modeler = ref<BpmnModeler>()
    let isInitializing = false

    const initModeler = async (bpmnVersion: BpmnVersion, xml?: string) => {
      // 动态加载对应的 moddle 配置
      const moddleConfig = await import(
        bpmnVersion === 'activiti'
          ? './activiti.json'
          : './flowable.json'
      )

      // 销毁旧的 modeler
      if (modeler.value) {
        try {
          modeler.value.destroy()
        } catch (e) {
          console.warn('Error destroying modeler:', e)
        }
      }

      // 创建新的 modeler
      modeler.value = new BpmnModeler({
        container: canvasRef.value,
        height: '100%',
        width: '100%',
        additionalModules: [
          GridLineModule,
          CustomModeling,
          MinimapModule,
          Translate,
          LintModule,
          TokenSimulationModule,
          httpTaskRenderer,
          CustomContextPad,
          CustomPopupMenu,
          CustomReplace,
          ElementParse,
          RerenderPalette,
          BpmnColorPickerModule,
        ],
        moddleExtensions: {
          [bpmnVersion]: moddleConfig.default || moddleConfig,
        },
        connectorIconRenderer: {
          iconProperty: `${bpmnVersion}:connectorIcon`,
        },
        gridLine: {
          smallGridSpacing: 10,
          gridSpacing: 100,
          gridLineStroke: 1,
          gridLineOpacity: 0.1,
          gridLineColor: 'var(--el-border-color)',
        },
        bpmnRenderer: {
          defaultFillColor: 'var(--bjsl-fill-color)',
          defaultStrokeColor: 'var(--bjsl-stroke-color)',
        },
        linting: {
          active: false,
          bpmnlint: bpmnlint,
        },
        minimap: {
          open: false,
        },
        ...props.options,
      })

      // 如果有待加载的初始 XML，加载它
      const xmlToLoad = xml || props.initialXml
      if (xmlToLoad && modeler.value) {
        await modeler.value.importXML(xmlToLoad)
      }

      // 确保 XML 加载完成后再通知父组件
      emit('modeler-ready', modeler.value)
      emit('version-changed', bpmnVersion)
    }

    onMounted(() => {
      initModeler(props.version, props.initialXml)
    })

    watch(
      () => props.version,
      async (newVersion) => {
        // 防止重复触发
        if (isInitializing) {
          return
        }
        isInitializing = true
        try {
          await initModeler(newVersion)
        } finally {
          isInitializing = false
        }
      }
    )

    // 暴露给外部的方法
    const loadXml = (xml: string) => {
      if (modeler.value) {
        return modeler.value.importXML(xml)
      }
      return Promise.resolve()
    }

    // 暴露方法给父组件
    expose({
      loadXml,
      modeler,
    })

    return () => <div class="canvas" ref={canvasRef} />
  },
})
