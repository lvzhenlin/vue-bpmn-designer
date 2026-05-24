<script setup lang="ts">
import { customRef, provide, ref } from 'vue'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'diagram-js-minimap/assets/diagram-js-minimap.css'
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css'
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css'

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-color-picker/colors/color-picker.css'
import ToggleMode from 'bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import {
  CaretLeft,
  CaretRight,
  Download,
  FolderOpened,
  Moon,
  Sunny,
  VideoPause,
  VideoPlay,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue'
import type CommandStack from 'diagram-js/lib/command/CommandStack'
import BpmnPanel from './BpmnPanel.vue'
import BpmnDesigner from './BpmnModeler.tsx'
import EmptyXML from './EmptyXML'
import type { Injector } from 'didi'
import { getRootElement, nextId } from './utils/ElementUtil.ts'
import type { ElementIssue, Issues, Linting } from 'bpmn-js-bpmnlint'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type { Minimap } from 'diagram-js-minimap'
import { layoutProcess } from 'bpmn-auto-layout'
import { ElMessage } from 'element-plus'
import { useBpmnVersionStore, type BpmnVersion } from '@/stores/bpmnVersion'

defineOptions({
  name: 'ProcessDesigner',
})
const props = defineProps<{
  id?: string
  name?: string
  xml?: string
  idPrefix?: string
}>()

const versionStore = useBpmnVersionStore()
const currentVersion = ref<BpmnVersion>(versionStore.version)
const mockVisible = customRef<boolean>((track, trigger) => {
  return {
    get() {
      track()
      const toggleMode = modeler.value?.get<ToggleMode>('toggleMode')
      return toggleMode?._active || false
    },
    set() {
      const toggleMode = modeler.value?.get<ToggleMode>('toggleMode')
      toggleMode?.toggleMode()
      trigger()
    },
  }
})
const lintVisible = customRef<boolean>((track, trigger) => {
  return {
    get() {
      track()
      const linting = injector.value?.get<Linting>('linting')
      return linting?.isActive() || false
    },
    set(newValue: boolean) {
      const linting = injector.value?.get<Linting>('linting')
      linting?.toggle(newValue)
      trigger()
    },
  }
})
const mapVisible = customRef<boolean>((track, trigger) => {
  return {
    get() {
      track()
      const minimap = modeler.value?.get<Minimap>('minimap')
      return minimap?.isOpen() || false
    },
    set(newValue: boolean) {
      const minimap = modeler.value?.get<Minimap>('minimap')
      minimap?.toggle(newValue)
      trigger()
    },
  }
})
const zoom = customRef<number>((track, trigger) => {
  return {
    get() {
      track()
      return modeler.value?.get<Canvas>('canvas')?.zoom() || 1
    },
    set(newValue: number) {
      modeler.value?.get<Canvas>('canvas')?.zoom(newValue)
      trigger()
    },
  }
})
const isDark = customRef<boolean>((track, trigger) => {
  return {
    get() {
      track()
      return document.documentElement.classList.contains('dark')
    },
    set(newValue: boolean) {
      if (newValue) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      trigger()
    },
  }
})
const rightArrow = ref(true)
const issuesList = ref<ElementIssue[]>([])
const modeler = ref<BpmnModeler>()
const injector = ref<Injector>()
const fileRef = ref<HTMLInputElement>()
const bpmnDesignerRef = ref()
const pendingXml = ref('')
const skipRestart = ref(false) // 标志：版本切换时跳过 restart
const labelPosition = ref('top')
const formSize = ref('default')
const importXml = () => {
  const file = fileRef.value?.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = async () => {
      const result = reader.result
      if (result && typeof result === 'string') {
        // 使用命名空间转换器检测 XML 的版本
        const { namespaceConverter } = await import('./utils/namespaceConverter')
        const detectedVersion = namespaceConverter.detectVersion(result)

        console.log('检测到的版本:', detectedVersion)

        // 如果检测到版本且与当前版本不同，先切换版本
        if (detectedVersion !== 'unknown' && detectedVersion !== currentVersion.value) {
          console.log(`需要切换版本: ${currentVersion.value} -> ${detectedVersion}`)

          // 设置待加载的 XML（使用原始格式，因为要切换到检测到的版本）
          pendingXml.value = result

          // 切换版本
          currentVersion.value = detectedVersion
          versionStore.setVersion(detectedVersion)

          ElMessage.success(`已自动切换到${detectedVersion === 'flowable' ? 'Flowable' : 'Activiti'}版本`)
        } else {
          // 版本相同或无法检测，直接导入
          const xmlResult = await modeler.value?.importXML(result)
          if (xmlResult) {
            const { warnings } = xmlResult
            console.log('警告：', warnings)
          }
        }

        if (fileRef.value) {
          fileRef.value.value = ''
        }
      }
    }
  }
}
const exportXml = async () => {
  try {
    const xml = await getXml()
    if (!xml) {
      ElMessage.warning('画布内容为空，无法导出')
      return
    }

    // 直接从 XML 中提取流程名称，避免使用可能出错的 getRootElement
    const nameMatch = xml.match(/<bpmn:process[^>]*name="([^"]+)"/)
    const fileName = nameMatch ? nameMatch[1] : '匿名流程'

    const blob = new Blob([xml], { type: 'text/xml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.bpmn20.xml`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

const exportSvg = () => {
  modeler.value?.saveSVG().then(({ svg }) => {
    const replacedSvg = svg
      .replace(/var\(--bjsl-fill-color\)/g, '#fff')
      .replace(/var\(--bjsl-stroke-color\)/g, '#000')
    const blob = new Blob([replacedSvg], { type: 'image/svg+xml' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `匿名流程.svg`
    a.click()
    window.URL.revokeObjectURL(url)
  })
}
const redo = () => {
  modeler.value?.get<CommandStack>('commandStack').redo()
}
const undo = () => {
  modeler.value?.get<CommandStack>('commandStack').undo()
}
const layout = async () => {
  const xml = await getXml()
  if (xml) {
    const diagramWithLayoutXML = await layoutProcess(xml)
    modeler.value?.importXML(diagramWithLayoutXML)
  }
}
const restart = () => {
  // 如果 skipRestart 为 true（版本切换时），不执行 restart
  if (skipRestart.value) {
    skipRestart.value = false
    modeler.value?.get<Canvas>('canvas')?.zoom('fit-viewport')
    return
  }

  modeler.value?.get<CommandStack>('commandStack').clear()
  const xml = EmptyXML(props.id || nextId('Process_'), props.name || '新建流程')
  modeler.value?.importXML(props.xml || xml)
  modeler.value?.get<Canvas>('canvas')?.zoom('fit-viewport')
}
const loadXml = (xml: string) => {
  modeler.value?.importXML(xml)
}
const getXml = async () => {
  try {
    if (!modeler.value) {
      return null
    }

    const res = await modeler.value.saveXML({ format: true, preamble: true })
    return res?.xml || null
  } catch (error) {
    console.error('获取 XML 失败:', error)
    return null
  }
}
const modelerReady = async (bpmnModeler: BpmnModeler) => {
  modeler.value = bpmnModeler
  injector.value = bpmnModeler.get<Injector>('injector')
  modeler.value?.on<{ issues: Issues }>('linting.completed', ({ issues }) => {
    issuesList.value = Object.values(issues).flat()
  })

  // 如果有待加载的 XML（版本切换时），加载并跳过 restart
  if (pendingXml.value) {
    skipRestart.value = true
    const xmlToLoad = pendingXml.value
    pendingXml.value = ''
    await modeler.value?.importXML(xmlToLoad)
  }

  restart()
}
const validate = async () => {
  const errors = issuesList.value.filter((issue) => issue.category === 'error')
  if (errors.length) {
    return errors
  }
  return []
}
const resetZoom = () => {
  zoom.value = 1
  modeler.value?.get<Canvas>('canvas')?.zoom('fit-viewport')
}
const toggleRightArrow = () => {
  if (mockVisible.value) {
    return ElMessage.warning('请先退出模拟模式')
  }
  rightArrow.value = !rightArrow.value
}

const switchVersion = async (version: BpmnVersion) => {
  if (mockVisible.value) {
    return ElMessage.warning('请先退出模拟模式')
  }

  try {
    // 获取当前 XML 并转换命名空间
    const currentXml = await getXml()
    const { namespaceConverter } = await import('./utils/namespaceConverter')
    const convertedXml = currentXml ? namespaceConverter.convert(currentXml, version) : null

    if (convertedXml) {
      pendingXml.value = convertedXml
    }

    // 更新版本（会触发 BpmnModeler 重新初始化）
    currentVersion.value = version
    versionStore.setVersion(version)

    ElMessage.success(`已切换到${version === 'flowable' ? 'Flowable' : 'Activiti'}版本`)
  } catch (error) {
    console.error('版本切换失败:', error)
    ElMessage.error('版本切换失败，请重试')
  }
}

provide('ProcessDesigner', {
  modeler: modeler,
})
onMounted(() => {

})
defineExpose({
  loadXml,
  getXml,
  validate,
})
</script>

<template>
  <el-container class="design-container">
    <input
      ref="fileRef"
      accept=".xml,.bpmn"
      @change="importXml"
      style="display: none"
      type="file"
    />
    <el-header class="design-header">
      <el-text tag="b" :size="'large'">流程设计器</el-text>
      <el-space>
        <!-- <el-switch
          inline-prompt
          active-text="顶部标签"
          inactive-text="左侧标签"
          active-value="top"
          inactive-value="left"
          v-model="labelPosition"
        />
        <el-switch
          inline-prompt
          active-text="默认"
          inactive-text="迷你"
          active-value="default"
          inactive-value="small"
          v-model="formSize"
        /> -->
        <el-switch inline-prompt :active-icon="Moon" :inactive-icon="Sunny" v-model="isDark" />
        <!-- <el-link
          underline="never"
          target="_blank"
          href="https://github.com/tsai996/vue-bpmn-designer"
        >
          <Iconify class="el-icon--left" icon="ri:github-fill" width="25px" />
        </el-link>
        <el-link
          underline="never"
          target="_blank"
          href="https://gitee.com/cai_xiao_feng/vue-bpmn-designer"
        >
          <Iconify class="el-icon--left" icon="ri:gitee-fill" width="25px" />
        </el-link> -->
      </el-space>
    </el-header>
    <el-container style="overflow-y: auto">
      <el-container style="position: relative">
        <el-header class="design-inner__header">
          <el-space :size="10">
            <el-button-group size="small">
              <el-tooltip placement="top" content="导入">
                <el-button :icon="FolderOpened" @click="fileRef?.click()" />
              </el-tooltip>
              <el-tooltip placement="top" content="导出">
                <el-button :icon="Download" size="small" @click="exportXml" />
              </el-tooltip>
            </el-button-group>

            <el-button-group size="small">
              <el-tooltip placement="top" content="撤销">
                <el-button @click="undo">
                  <iconify icon="ic:baseline-undo" :size="3" />
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="恢复">
                <el-button @click="redo">
                  <iconify icon="ic:baseline-redo" :size="3" />
                </el-button>
              </el-tooltip>
            </el-button-group>

            <el-button-group size="small">
              <el-tooltip content="放大" placement="top-start">
                <el-button :icon="ZoomIn" @click="zoom += 0.1" :disabled="zoom >= 1.7"></el-button>
              </el-tooltip>
              <el-tooltip content="重置缩放" placement="top-start">
                <el-button @click="resetZoom"> {{ (zoom * 100).toFixed(0) }}%</el-button>
              </el-tooltip>
              <el-tooltip content="缩小" placement="top-start">
                <el-button :icon="ZoomOut" @click="zoom -= 0.1" :disabled="zoom <= 0.5"></el-button>
              </el-tooltip>
            </el-button-group>

            <el-button-group size="small">
              <el-tooltip placement="top" content="自动布局">
                <el-button @click="layout">
                  <iconify icon="tabler:layout-filled" :size="3" />
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="重做">
                <el-button @click="restart">
                  <iconify icon="solar:eraser-outline" :size="3" />
                </el-button>
              </el-tooltip>
              <!-- <el-tooltip placement="top" content="流程模拟">
                <el-button
                  :icon="mockVisible ? VideoPause : VideoPlay"
                  @click="mockVisible = !mockVisible"
                >
                  {{ mockVisible ? '退出模拟' : '开启模拟' }}
                </el-button>
              </el-tooltip> -->
              <el-tooltip placement="top" content="流程校验">
                <el-button
                  :icon="lintVisible ? VideoPause : VideoPlay"
                  @click="lintVisible = !lintVisible"
                >
                  {{ lintVisible ? '关闭校验' : '开启校验' }}
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="小地图">
                <el-button
                  :icon="mapVisible ? VideoPause : VideoPlay"
                  @click="mapVisible = !mapVisible"
                >
                  {{ mapVisible ? '收起地图' : '展开地图' }}
                </el-button>
              </el-tooltip>
            </el-button-group>

            <el-button-group size="small">
              <el-tooltip placement="top" content="切换到 Activiti 版本">
                <el-button
                  :type="currentVersion === 'activiti' ? 'primary' : 'default'"
                  @click="switchVersion('activiti')"
                >
                  Activiti
                </el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="切换到 Flowable 版本">
                <el-button
                  :type="currentVersion === 'flowable' ? 'primary' : 'default'"
                  @click="switchVersion('flowable')"
                >
                  Flowable
                </el-button>
              </el-tooltip>
            </el-button-group>
          </el-space>
        </el-header>
        <el-main class="design-inner__main">
          <bpmn-designer
            ref="bpmnDesignerRef"
            :version="currentVersion"
            :pending-xml="pendingXml"
            @modeler-ready="modelerReady"
          />
        </el-main>
        <div class="right-panel-arrow" @click="toggleRightArrow">
          <el-icon :size="15">
            <CaretRight v-if="rightArrow && !mockVisible" />
            <CaretLeft v-else />
          </el-icon>
        </div>
      </el-container>
      <el-aside :width="rightArrow && !mockVisible ? '370px' : '0px'" class="design-aside">
        <BpmnPanel
          v-if="modeler"
          :modeler="modeler"
          :size="formSize"
          :label-position="labelPosition"
        ></BpmnPanel>
      </el-aside>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.right-panel-arrow {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 3;
  transform: translateY(-50%);
  background-color: var(--el-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  height: 36px;
  width: 6px;
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  box-shadow: -7px 0px 7px -5px rgba(0, 0, 0, 0.1);
}

.design-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .design-header {
    height: 50px;
    border-bottom: var(--el-border);
    background-color: var(--el-bg-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .design-inner__header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--el-border);
    // background-color: var(--el-bg-color);
    // box-shadow: var(--el-box-shadow-light);
  }

  .design-inner__main {
    padding: 0;
    height: 100%;
  }

  .design-aside {
    box-shadow: var(--el-box-shadow);
    transition: width 0.3s ease;
    background-color: var(--el-bg-color);
    // z-index: 1;
  }
}

.canvas {
  width: 100%;
  height: 100%;
}
</style>
