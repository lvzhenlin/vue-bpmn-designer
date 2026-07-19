import ProcessDesigner from '@/views/ProcessDesigner/index.vue'
import type { BpmnVersion } from '@/stores/bpmnVersion'
import type { LanguageType } from '@/stores/modules/app.ts'
import { useBpmnVersionStore } from '@/stores/bpmnVersion'
import useAppStore from '@/stores/modules/app.ts'
import '@/styles/index.scss'
import 'element-plus/dist/index.css'

// 预加载 Iconify 图标集，避免运行时从 API 加载
import { addCollection } from '@iconify/vue'
import riIcons from '@iconify-json/ri/icons.json'
import icIcons from '@iconify-json/ic/icons.json'
import tablerIcons from '@iconify-json/tabler/icons.json'
import solarIcons from '@iconify-json/solar/icons.json'

addCollection(riIcons)
addCollection(icIcons)
addCollection(tablerIcons)
addCollection(solarIcons)

export { ProcessDesigner }
export { useBpmnVersionStore }
export { useAppStore }
export type { BpmnVersion }
export type { LanguageType }

export default ProcessDesigner
