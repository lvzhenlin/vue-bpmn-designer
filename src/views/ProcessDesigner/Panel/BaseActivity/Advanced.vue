<script setup lang="ts">
import { useCustomRef } from '@/views/ProcessDesigner/utils/ElementUtil.ts'
import MultiInstance from '../MultiInstance/index.vue'
import Document from './Document.vue'
import Async from './Async.vue'
import { useBpmnContextService } from '@/hooks/useService.ts'
import { computed } from 'vue'
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import juelSupport from '@/components/CodemirrorEditor/language/juel'
import Codemirror from '@/components/CodemirrorEditor/index.vue'

defineOptions({
  name: 'Advanced',
})
const { selectedElement } = useBpmnContextService()
const skipExpression = useCustomRef('skipExpression')
const propertiesByName = computed(() => {
  const businessObject = getBusinessObject(selectedElement)
  return businessObject?.$descriptor?.propertiesByName || {}
})
</script>

<template>
  <el-collapse-item name="arg2" title="高级">
    <el-form-item v-if="propertiesByName['skipExpression']">
    <template #label>
      <span>跳过表达式</span>
      <HelpTooltip content="支持JUEL表达式，返回boolean值，当表达式为true时，该任务将被跳过

常用变量：
• assignee - 当前办理人
• candidateUsers - 候选用户列表
• candidateGroups - 候选角色列表

示例：
• ${skipTask == true}
• ${assignee == 'admin'}" />
    </template>
    <Codemirror
      no-wrap
      :max-rows="5"
      autosize
      placeholder="请输入跳过表达式"
      :extensions="[juelSupport()]"
      v-model="skipExpression"
    />
  </el-form-item>
    <MultiInstance v-if="propertiesByName['loopCharacteristics']" />
    <Async v-if="propertiesByName['async']" />
    <Document />
  </el-collapse-item>
</template>

<style scoped lang="scss"></style>
