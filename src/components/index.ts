import ProcessDesigner from '@/views/ProcessDesigner/index.vue'
import type { BpmnVersion } from '@/stores/bpmnVersion'
import type { LanguageType } from '@/stores/modules/app'
import { useBpmnVersionStore } from '@/stores/bpmnVersion'
import useAppStore from '@/stores/modules/app'
import '@/styles/index.scss'
import 'element-plus/dist/index.css'

// 预加载 Iconify 图标数据，避免运行时从 API 加载（内网环境）
import { addIcon } from '@iconify/vue'
import { iconsData } from './icons-data'

Object.entries(iconsData).forEach(([iconName, iconData]) => {
  addIcon(iconName, iconData)
})

export { ProcessDesigner }
export { useBpmnVersionStore }
export { useAppStore }
export { setApiConfig } from '@/api'
export type { ApiConfig, SaveProcessRequest, SaveProcessResponse, PageParams, PageResponse } from '@/api'
export type { BpmnVersion }
export type { LanguageType }

export default ProcessDesigner
