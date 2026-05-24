<script setup lang="ts">
import { useCustomRef } from '@/views/ProcessDesigner/utils/ElementUtil.ts'
import { useBpmnContextService } from '@/hooks/useService.ts'
import type EventBus from 'diagram-js/lib/core/EventBus'
import { onMounted } from 'vue'

defineOptions({
  name: 'UserTaskPanel',
})
const { getService } = useBpmnContextService()
const eventBus = getService<EventBus>('eventBus')
const assignee = useCustomRef('assignee')
const candidateUsers = useCustomRef<string[]>('candidateUsers')
const candidateGroups = useCustomRef<string[]>('candidateGroups')
const dueDate = useCustomRef('dueDate')
const priority = useCustomRef<number>('priority')
onMounted(() => {
  eventBus?.on('elementVariableChanged', (event: any) => {
    assignee.value = `\${${event.elementVariable}}`
  })
})
</script>

<template>
  <el-collapse-item name="arg1" title="处理人">
    <el-form-item prop="assignee" label="办理人">
      <el-select v-model="assignee" filterable allow-create clearable placeholder="请选择办理人">
        <el-option label="张三" value="zhangsan" />
        <el-option label="李四" value="lisi" />
        <el-option label="王五" value="wangwu" />
        <el-option label="毛六" value="maoliu" />
        <el-option label="钱七" value="qianqi" />
      </el-select>
    </el-form-item>
    <el-form-item prop="candidateUsers" label="候选人">
      <el-select v-model="candidateUsers" multiple clearable placeholder="请选择候选人">
        <el-option label="张三" value="zhangsan" />
        <el-option label="李四" value="lisi" />
        <el-option label="王五" value="wangwu" />
        <el-option label="毛六" value="maoliu" />
        <el-option label="钱七" value="qianqi" />
      </el-select>
    </el-form-item>
    <el-form-item prop="candidateGroups" label="候选组">
      <el-select v-model="candidateGroups" multiple clearable placeholder="请选择候选组">
        <el-option label="部门A" value="deptA" />
        <el-option label="部门B" value="deptB" />
        <el-option label="部门C" value="deptC" />
        <el-option label="部门D" value="deptD" />
        <el-option label="部门E" value="deptE" />
      </el-select>
    </el-form-item>
    <!-- <el-form-item prop="priority" label="优先级">
      <el-input-number v-model="priority" placeholder="优先级" :min="0" :max="10" />
    </el-form-item> -->
    <el-form-item prop="dueDate" label="到期时间">
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
  </el-collapse-item>
</template>

<style scoped lang="scss">
// 到期时间问号图标样式
</style>
