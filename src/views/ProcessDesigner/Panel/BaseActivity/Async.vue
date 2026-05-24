<script setup lang="ts">
import { useCustomRef } from '@/views/ProcessDesigner/utils/ElementUtil.ts'
import { customRef } from 'vue'
import { useBpmnContextService } from '@/hooks/useService.ts'
import {
  addExtensionElements,
  getExtensionElement,
  removeExtensionElements,
} from '@/views/ProcessDesigner/utils/ExtensionElementsUtil.ts'
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'
import { useFormItem } from 'element-plus'

defineOptions({
  name: 'Async',
})

const { form } = useFormItem()
const { selectedElement, updateProperties } = useBpmnContextService()
const asyncBefore = useCustomRef<boolean>('asyncBefore')
const asyncAfter = useCustomRef<boolean>('asyncAfter')
const exclusive = useCustomRef<boolean>('exclusive')
const retryTimeCycle = customRef((track, trigger) => {
  return {
    get() {
      track()
      const failedJobRetryTimeCycle = getExtensionElement(
        selectedElement,
        'activiti:FailedJobRetryTimeCycle',
      )
      return failedJobRetryTimeCycle?.get('body')
    },
    set(newValue: string) {
      const failedJobRetryTimeCycle = getExtensionElement(
        selectedElement,
        'activiti:FailedJobRetryTimeCycle',
      )
      if (newValue) {
        if (!failedJobRetryTimeCycle) {
          const businessObject = getBusinessObject(selectedElement)
          const failedJobRetryTimeCycleElement = businessObject.$model.create(
            'activiti:FailedJobRetryTimeCycle',
            {
              body: newValue,
            },
          )
          addExtensionElements(selectedElement, failedJobRetryTimeCycleElement)
        } else {
          updateProperties({ body: newValue }, failedJobRetryTimeCycle)
        }
      } else {
        failedJobRetryTimeCycle && removeExtensionElements(selectedElement, failedJobRetryTimeCycle)
      }
      trigger()
    },
  }
})
</script>

<template>
  <el-row :gutter="10">
    <el-col :span="form?.labelPosition === 'top' ? 8 : 24">
      <el-form-item>
        <template #label>
          <span>排他</span>
          <HelpTooltip content="含义：
这是一个并发控制属性。开启排他（Activiti 5.9 之后默认为开启状态）意味着：同一个流程实例的异步任务，绝对不允许并发执行。
如果同一个流程实例同时产生了多个异步任务（比如并行网关后的多个异步节点），Job 执行器会把它们“串”起来，在同一个线程中按顺序一个接一个地执行。

应用场景：
• 防止并行网关的数据冲突（最核心场景）：在并行网关（Parallel Gateway）的汇聚处，如果多个分支都是异步任务且没有开启排他，它们可能会在多线程中同时到达汇聚点。
由于事务隔离，它们都以为自己在等待其他分支，导致流程“死锁”卡住。开启排他后，这些分支会乖乖排队，一个接一个地通过汇聚点，完美解决并发冲突。
• 保证业务逻辑顺序：确保同一个流程实例中的多个后台任务，严格按照设定的先后顺序执行，避免多线程乱序导致的数据错乱。" />
        </template>
        <el-switch v-model="exclusive" :disabled="!(asyncBefore || asyncAfter)" />
      </el-form-item>
    </el-col>
    <el-col :span="form?.labelPosition === 'top' ? 8 : 24">
      <el-form-item>
        <template #label>
          <span>前异步</span>
          <HelpTooltip content="含义：
在流程引擎真正开始执行这个 UserTask 之前，会先将当前的事务提交并保存到数据库，然后结束当前线程。
之后，引擎的异步执行器（Job Executor）会从数据库中捞取这个任务，开启一个全新的线程和事务来创建这个用户任务。

应用场景：
• 解耦耗时操作：如果在这个任务创建之前有一些非常耗时的执行监听器（Execution Listener）逻辑，开启前异步可以防止阻塞主流程，让主流程快速响应。
• 确保任务落库：在某些复杂的微服务或集群架构中，为了确保 UserTask 绝对被持久化到数据库后，再触发后续的消息通知或外部系统调用。" />
        </template>
        <el-switch v-model="asyncBefore" />
      </el-form-item>
    </el-col>
    <el-col :span="form?.labelPosition === 'top' ? 8 : 24">
      <el-form-item>
        <template #label>
          <span>后异步</span>
          <HelpTooltip content="含义：
流程引擎会同步执行并创建好这个 UserTask。但是，在任务完成、准备流转到下一个节点之前，引擎会提交当前事务。
后续的流程流转（比如离开这个 UserTask 走向下一个 ServiceTask）会被放入异步执行器，由新的线程和事务来继续执行。

应用场景：
• 优化用户界面响应速度（最常用）：当用户点击“完成任务”时，如果后续流程包含复杂的逻辑（如自动生成报表、调用第三方慢接口、发送大量邮件），
开启后异步可以让用户点击后立刻看到“办理成功”的提示，而复杂的后续逻辑在后台慢慢跑，极大提升用户体验。
• 隔离事务风险：如果后续节点的逻辑很容易报错，开启后异步可以将当前 UserTask 的完成状态独立保存。
即使后面报错了回滚，当前任务也已经是“已完成”的历史状态，便于排查和重试。" />
        </template>
        <el-switch v-model="asyncAfter" />
      </el-form-item>
    </el-col>
  </el-row>
  <el-form-item label="失败重试周期" v-show="asyncBefore || asyncAfter">
    <template #label>
      <span>失败重试周期</span>
      <HelpTooltip content="支持ISO 8601时间周期格式：R[n]/P[n]Y[n]M[n]DT[n]H[n]M[n]S

语法规则：
• R：必须放在开头，代表重复（Repeat），后面紧跟一个数字，表示最大重试次数（默认值为 3 次）。
• /：分隔符，用于分隔重复次数和时间周期。
• P：代表“周期”（Period）的开始。
• T：日期和时间的分割隔符。
• Y/M/D：分别代表年、月、日。
• H/M/S：分别代表时、分、秒。

示例：
• R3/PT30S - 失败后最多重试 3 次，每次间隔 30 秒
• R3/PT1M - 失败后最多重试 3 次，每次间隔 1 分钟
• R3/PT1H - 失败后最多重试 3 次，每次间隔 1 小时" />
    </template>
    <el-input v-model="retryTimeCycle" clearable placeholder="请输入失败重试周期" />
  </el-form-item>
</template>

<style scoped lang="scss"></style>
