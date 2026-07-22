<script setup lang="ts">
import { useCustomRef } from '@/views/ProcessDesigner/utils/ElementUtil'
import MultiInstance from '../MultiInstance/index.vue'
import Document from './Document.vue'
import Async from './Async.vue'
import { useBpmnContextService } from '@/hooks/useService'
import { computed } from 'vue'
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import juelSupport from '@/components/CodemirrorEditor/language/juel'
import Codemirror from '@/components/CodemirrorEditor/index.vue'

defineOptions({
  name: 'Advanced',
})
const { selectedElement } = useBpmnContextService()
const dueDate = useCustomRef('dueDate')
const skipExpression = useCustomRef('skipExpression')
const propertiesByName = computed(() => {
  const businessObject = getBusinessObject(selectedElement)
  return businessObject?.$descriptor?.propertiesByName || {}
})
</script>

<template>
  <el-collapse-item name="arg2" title="高级">
    <el-form-item v-if="propertiesByName['dueDate']" prop="dueDate" label="到期时间">
      <template #label>
        <span>到期时间</span>
        <HelpTooltip content="支持ISO 8601时间格式：P[n]Y[n]M[n]DT[n]H[n]M[n]S

语法规则：
• P：必须放在开头，代表“周期”（Period）的开始。
• T：时间分隔符。如果你要定义时、分、秒，必须在它们前面加上 T。
• Y/M/D：分别代表年、月、日。
• H/M/S：分别代表时、分、秒。

示例：
• P5D - 5天后
• PT2H30M - 2小时30分后
• P1DT6H - 1天6小时后" />
      </template>
      <el-input v-model="dueDate" placeholder="请输入到期时间" />
    </el-form-item>
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
