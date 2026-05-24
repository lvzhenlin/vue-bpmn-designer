import type { BpmnVersion } from '@/stores/bpmnVersion'

export const loadModdleConfig = async (version: BpmnVersion): Promise<any> => {
  switch (version) {
    case 'flowable':
      return import('@/views/ProcessDesigner/flowable.json')
    case 'activiti':
      return import('@/views/ProcessDesigner/activiti.json')
    default:
      return import('@/views/ProcessDesigner/activiti.json')
  }
}
