import type { BpmnVersion } from '@/stores/bpmnVersion'
import { activitiConfig, flowableConfig } from './moddleConfig'

export const loadModdleConfig = (version: BpmnVersion): any => {
  switch (version) {
    case 'flowable':
      return flowableConfig
    case 'activiti':
    default:
      return activitiConfig
  }
}
