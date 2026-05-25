<script setup lang="ts">
import { ref } from 'vue'
import { useCloned } from '@vueuse/core'
import { type FormInstance, type FormItemRule, useFormSize } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import type { AnyEventListener, Event } from '@/types'
import { useBpmnContextService } from '@/hooks/useService.ts'
import {
  getErrorEvents,
  getMessageEvents,
  getSignalEvents,
} from '@/views/ProcessDesigner/utils/EventDefinitionUtil.ts'
import type { Element } from 'bpmn-js/lib/model/Types.ts'

const emits = defineEmits<{
  (e: 'confirm', data: AnyEventListener): void
}>()
const formSize = useFormSize()
const { selectedElement } = useBpmnContextService()
const { cloned, sync } = useCloned<AnyEventListener>({
  events: [],
  rethrowEvent: false,
  type: 'class',
  value: undefined,
  entityType: '',
})
const formRef = ref<FormInstance>()
const drawerVisible = ref(false)
const throwEvents = ref<Event[]>([])

// 事件类型选项（复用）
const eventTypeOptions = [
  { label: 'PROCESS_CREATED（流程实例已创建）', value: 'PROCESS_CREATED' },
  { label: 'PROCESS_STARTED（流程实例已启动）', value: 'PROCESS_STARTED' },
  { label: 'PROCESS_COMPLETED（流程实例完成）', value: 'PROCESS_COMPLETED' },
  { label: 'PROCESS_CANCELLED（流程实例被取消）', value: 'PROCESS_CANCELLED' },
  { label: 'PROCESS_COMPLETED_WITH_TERMINATE_END_EVENT（流程实例到达终止结束事件）', value: 'PROCESS_COMPLETED_WITH_TERMINATE_END_EVENT' },
  { label: 'TASK_ASSIGNED（任务已分配人员）', value: 'TASK_ASSIGNED' },
  { label: 'TASK_CREATED（任务已创建）', value: 'TASK_CREATED' },
  { label: 'TASK_COMPLETED（任务已完成）', value: 'TASK_COMPLETED' },
  { label: 'MULTI_INSTANCE_ACTIVITY_STARTED（多实例活动已启动）', value: 'MULTI_INSTANCE_ACTIVITY_STARTED' },
  { label: 'MULTI_INSTANCE_ACTIVITY_COMPLETED（多实例活动已完成）', value: 'MULTI_INSTANCE_ACTIVITY_COMPLETED' },
  { label: 'MULTI_INSTANCE_ACTIVITY_CANCELLED（多实例活动已取消）', value: 'MULTI_INSTANCE_ACTIVITY_CANCELLED' },
  { label: 'VARIABLE_CREATED（变量已创建）', value: 'VARIABLE_CREATED' },
  { label: 'VARIABLE_UPDATED（变量已更新）', value: 'VARIABLE_UPDATED' },
  { label: 'VARIABLE_DELETED（变量已删除）', value: 'VARIABLE_DELETED' },
  { label: 'ENTITY_CREATED（实体已创建）', value: 'ENTITY_CREATED' },
  { label: 'ENGINE_CREATED（发动机创建）', value: 'ENGINE_CREATED' },
  { label: 'ENGINE_CLOSED（发动机关闭）', value: 'ENGINE_CLOSED' },
  { label: 'ENTITY_INITIALIZED（实体已初始化）', value: 'ENTITY_INITIALIZED' },
  { label: 'ENTITY_UPDATED（实体已更新）', value: 'ENTITY_UPDATED' },
  { label: 'ENTITY_DELETED（实体已删除）', value: 'ENTITY_DELETED' },
  { label: 'ENTITY_SUSPENDED（实体被暂停）', value: 'ENTITY_SUSPENDED' },
  { label: 'ENTITY_ACTIVATED（实体已激活）', value: 'ENTITY_ACTIVATED' },
  { label: 'JOB_EXECUTION_SUCCESS（作业执行成功）', value: 'JOB_EXECUTION_SUCCESS' },
  { label: 'JOB_EXECUTION_FAILURE（作业执行）', value: 'JOB_EXECUTION_FAILURE' },
  { label: 'JOB_RETRIES_DECREMENTED（作业重试次数减少）', value: 'JOB_RETRIES_DECREMENTED' },
  { label: 'JOB_CANCELED（作业已取消）', value: 'JOB_CANCELED' },
  { label: 'TIMER_SCHEDULED（定时器已安排）', value: 'TIMER_SCHEDULED' },
  { label: 'TIMER_FIRED（定时器启动）', value: 'TIMER_FIRED' },
  { label: 'ACTIVITY_STARTED（活动已开始）', value: 'ACTIVITY_STARTED' },
  { label: 'ACTIVITY_COMPLETED（活动已完成）', value: 'ACTIVITY_COMPLETED' },
  { label: 'ACTIVITY_CANCELLED（活动已取消）', value: 'ACTIVITY_CANCELLED' },
  { label: 'ACTIVITY_SIGNALED（活动信号）', value: 'ACTIVITY_SIGNALED' },
  { label: 'ACTIVITY_MESSAGE_RECEIVED（收到活动消息）', value: 'ACTIVITY_MESSAGE_RECEIVED' },
  { label: 'ACTIVITY_MESSAGE_WAITING（活动消息等待）', value: 'ACTIVITY_MESSAGE_WAITING' },
  { label: 'ACTIVITY_MESSAGE_CANCELLED（活动消息已取消）', value: 'ACTIVITY_MESSAGE_CANCELLED' },
  { label: 'ACTIVITY_ERROR_RECEIVED（收到活动错误）', value: 'ACTIVITY_ERROR_RECEIVED' },
  { label: 'ACTIVITY_COMPENSATE（活动补偿）', value: 'ACTIVITY_COMPENSATE' },
  { label: 'UNCAUGHT_BPMN_ERROR（未捕获的BPMN错误）', value: 'UNCAUGHT_BPMN_ERROR' },
  { label: 'MEMBERSHIP_CREATED（已创建成员资格）', value: 'MEMBERSHIP_CREATED' },
  { label: 'MEMBERSHIP_DELETED（成员身份已删除）', value: 'MEMBERSHIP_DELETED' },
  { label: 'MEMBERSHIPS_DELETED（成员身份已删除）', value: 'MEMBERSHIPS_DELETED' },
]

const fieldValueRule = ref<FormItemRule>({
  trigger: 'blur',
  required: true,
  validator(_, value, callback) {
    if (!value) {
      return callback('请输入监听器')
    }
    if (cloned.value.type === 'delegateExpression') {
      const reg = /^\$\{.*\}$/
      if (!reg.test(value)) {
        return callback('请输入正确的监听器，必须是 ${xx} 格式')
      }
    } else if (cloned.value.type === 'class') {
      const reg = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/
      if (!reg.test(value)) {
        return callback('请输入正确的java类路径，必须是 com.xx.xx 格式')
      }
    }
    callback()
  },
})
const openDrawer = (eventListener?: AnyEventListener) => {
  if (eventListener) {
    cloned.value = cloneDeep(eventListener)
    cloned.value.element = eventListener.element
    if ('throwEvent' in cloned.value) {
      loadEventOptions(cloned.value.throwEvent)
    }
  }
  drawerVisible.value = true
}
const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      emits('confirm', cloned.value)
      drawerVisible.value = false
    }
  })
}
const changeRethrowEvent = (rethrowEvent: boolean) => {
  if (rethrowEvent) {
    cloned.value = {
      events: cloned.value.events,
      element: cloned.value.element,
      rethrowEvent: rethrowEvent,
      throwEvent: 'message',
      type: 'messageName',
      value: undefined,
    }
    changeThrowEvent('message')
  } else {
    cloned.value = {
      events: cloned.value.events,
      element: cloned.value.element,
      rethrowEvent: rethrowEvent,
      type: 'class',
      value: undefined,
      entityType: '',
    }
  }
}
const changeThrowEvent = (val: string) => {
  cloned.value.value = undefined
  loadEventOptions(val)
}

const loadEventOptions = (val: string) => {
  if (val === 'message') {
    throwEvents.value = toOptions(getMessageEvents(selectedElement))
  } else if (val === 'error') {
    throwEvents.value = toOptions(getErrorEvents(selectedElement))
  } else if (val === 'signal') {
    const events = getSignalEvents(selectedElement)
    throwEvents.value = toOptions(
      events.filter((e) => e.get('activiti:scope') === 'processInstance'),
    )
  } else if (val === 'globalSignal') {
    const events = getSignalEvents(selectedElement)
    throwEvents.value = toOptions(events.filter((e) => e.get('activiti:scope') === 'global'))
  } else {
    throwEvents.value = []
  }
}

const toOptions = (elements: Element[]) => {
  return elements.map((item) => {
    return {
      id: item.id,
      name: item.name,
    }
  })
}

const onClosed = () => {
  sync()
  formRef.value?.clearValidate()
}
defineExpose({
  openDrawer,
})
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    size="35%"
    append-to-body
    :lock-scroll="false"
    @closed="onClosed"
    title="事件监听器"
  >
    <el-form ref="formRef" label-position="top" :model="cloned" label-width="90px" :size="formSize">
      <el-form-item prop="rethrowEvent">
        <template #label>
          <span>处理模式</span>
          <HelpTooltip content="选择事件监听器的处理方式

• 监听模式 - 在引擎内部执行自定义逻辑
• 抛出模式 - 将事件转换为BPMN事件抛给外部系统" />
        </template>
        <el-radio-group v-model="cloned.rethrowEvent" @change="changeRethrowEvent">
          <el-radio-button label="监听模式" :value="false"></el-radio-button>
          <el-radio-button label="抛出模式" :value="true"></el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 监听模式配置 -->
      <div v-if="!cloned.rethrowEvent" style="border-left: 3px solid #e6f7ff; padding-left: 15px; margin-top: 10px;">
        <el-form-item prop="events">
          <template #label>
            <span>监听事件类型</span>
            <HelpTooltip content="选择监听器要监听的引擎事件类型（可多选）

常用事件分类：
• PROCESS_* - 流程实例相关事件
• TASK_* - 任务相关事件
• ACTIVITY_* - 活动节点相关事件
• VARIABLE_* - 变量相关事件
• ENTITY_* - 实体相关事件
• JOB_* - 作业/定时器相关事件

监听器将在选中的事件发生时被触发，留空则监听所有事件类型" />
          </template>
          <el-select
            v-model="cloned.events"
            multiple
            collapse-tags
            :max-collapse-tags="4"
            placeholder="请选择事件类型"
          >
            <el-option
              v-for="option in eventTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="监听器类型" prop="type">
          <el-radio-group v-model="cloned.type">
            <el-radio-button label="Java类" value="class"></el-radio-button>
            <el-radio-button label="委托表达式" value="delegateExpression"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="value" :rules="fieldValueRule">
          <template #label>
            <span>监听器</span>
            <HelpTooltip content="自定义事件监听器类：
• 实现 org.activiti.engine.delegate.event.ActivitiEventListener 接口
• 重写 onEvent 方法，根据需要执行自定义逻辑

支持类型：
• Java类 - 指定完整类名
• JUEL表达式 - 如：${myDelegate}" />
          </template>
          <el-input v-model="cloned.value" placeholder="请输入监听器"></el-input>
        </el-form-item>
        <el-form-item prop="entityType">
          <template #label>
            <span>实体类型</span>
            <HelpTooltip content="指定监听器只监听特定类型的实体事件，留空则监听所有实体类型事件" />
          </template>
          <el-select v-model="cloned.entityType" placeholder="请选择实体类型">
            <el-option label="ProcessInstance（流程实例）" value="ProcessInstance" />
            <el-option label="Task（任务）" value="Task" />
            <el-option label="Execution（执行实例）" value="Execution" />
            <el-option label="VariableInstance（变量实例）" value="VariableInstance" />
            <el-option label="Job（作业）" value="Job" />
            <el-option label="IdentityLink（身份关联）" value="IdentityLink" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 抛出模式配置 -->
      <div v-else style="border-left: 3px solid #fff7e6; padding-left: 15px; margin-top: 10px;">
        <el-form-item prop="events">
          <template #label>
            <span>触发事件</span>
            <HelpTooltip content="选择哪些引擎事件会触发消息抛出（可多选）

当以下事件发生时，会将消息抛给外部系统：
• PROCESS_* - 流程实例相关事件
• TASK_* - 任务相关事件
• ACTIVITY_* - 活动节点相关事件

留空则监听所有事件类型" />
          </template>
          <el-select
            v-model="cloned.events"
            multiple
            collapse-tags
            :max-collapse-tags="4"
            placeholder="请选择触发事件（留空监听所有）"
          >
            <el-option
              v-for="option in eventTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="抛出事件类型" prop="type">
          <template #label>
            <span>抛出事件类型</span>
            <HelpTooltip content="选择要抛出的BPMN事件类型

• 消息 - 通过消息机制传递事件，用于点对点通信
• 错误 - 抛出错误事件，用于错误处理
• 信号 - 抛出信号事件，用于广播通信
• 全局信号 - 跨流程广播信号" />
          </template>
          <el-select
            v-model="cloned.throwEvent"
            placeholder="请选择抛出事件类型"
            @change="changeThrowEvent"
          >
            <el-option label="消息" value="message"></el-option>
            <el-option label="错误" value="error"></el-option>
            <el-option label="信号" value="signal"></el-option>
            <el-option label="全局信号" value="globalSignal"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="value" :rules="{ required: true, message: '请选择抛出事件', trigger: 'blur' }">
          <template #label>
            <span>抛出事件</span>
            <HelpTooltip content="选择要抛出的事件定义

事件需要先在「全局事件」面板中定义：
• 消息事件 - 在消息定义中添加
• 错误事件 - 在错误定义中添加
• 信号事件 - 在信号定义中添加

选择流程元素后，在右侧面板找到全局事件标签" />
          </template>
          <el-select v-model="cloned.value" placeholder="请选择抛出事件">
            <el-option
              v-for="item in throwEvents"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss"></style>
