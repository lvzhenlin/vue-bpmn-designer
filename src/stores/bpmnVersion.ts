import { defineStore } from 'pinia'
import { ref } from 'vue'

export type BpmnVersion = 'flowable' | 'activiti'

export const useBpmnVersionStore = defineStore('bpmnVersion', () => {
  const version = ref<BpmnVersion>('activiti')

  const setVersion = (newVersion: BpmnVersion) => {
    version.value = newVersion
  }

  const toggleVersion = () => {
    version.value = version.value === 'flowable' ? 'activiti' : 'flowable'
  }

  return {
    version,
    setVersion,
    toggleVersion
  }
})