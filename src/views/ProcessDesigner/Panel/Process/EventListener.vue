<script setup lang="ts">
import { Delete, EditPen, Plus } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import type { AnyEventListener } from '@/types'
import { useBpmnContextService } from '@/hooks/useService.ts'
import type BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements,
} from '@/views/ProcessDesigner/utils/ExtensionElementsUtil.ts'
import EventListenerDrawer from '@/views/ProcessDesigner/Panel/Process/EventListenerDrawer.vue'

const { getService, updateProperties, selectedElement } = useBpmnContextService()
const bpmnFactory = getService<BpmnFactory>('bpmnFactory')
const events = ref<AnyEventListener[]>([])
const eventListenerDrawerRef = ref<InstanceType<typeof EventListenerDrawer>>()
const editEventListener = (eventListener?: AnyEventListener) => {
  eventListenerDrawerRef.value?.openDrawer(eventListener)
}
const removeEventListener = (eventListener: AnyEventListener) => {
  const { element } = eventListener
  if (element) {
    removeExtensionElements(selectedElement, element)
  }
  loadEventListeners()
}
const confirmEventListener = (eventListener: AnyEventListener) => {
  const { element, events } = eventListener
  const properties: Record<string, any> = {
    events: events,
    entityType: undefined,
    class: undefined,
    delegateExpression: undefined,
    messageName: undefined,
    errorCode: undefined,
    signalName: undefined,
    throwEvent: undefined,
  }
  if ('throwEvent' in eventListener) {
    properties.throwEvent = eventListener.throwEvent
    properties[eventListener.type] = eventListener.value
  } else {
    properties.entityType = eventListener.entityType
    properties[eventListener.type] = eventListener.value
  }
  if (element) {
    updateProperties(properties, element)
  } else {
    const eventListenerElement = bpmnFactory?.create('activiti:EventListener', properties)
    addExtensionElements(selectedElement, eventListenerElement)
  }
  loadEventListeners()
}
const loadEventListeners = () => {
  const listenerElements = getExtensionElementsList(selectedElement, 'activiti:EventListener')
  events.value = listenerElements.map((e) => {
    const throwEvent = e.get('throwEvent')
    if (throwEvent) {
      const type = e.get('messageName')
        ? 'messageName'
        : e.get('errorCode')
          ? 'errorCode'
          : 'signalName'
      return {
        events: e.get('events'),
        rethrowEvent: true,
        element: e,
        throwEvent: throwEvent,
        type: type,
        value: e.get(type),
      }
    } else {
      const type = e.get('class') ? 'class' : 'delegateExpression'
      return {
        events: e.get('events'),
        rethrowEvent: false,
        element: e,
        type: type,
        value: e.get(type),
        entityType: e.get('entityType'),
      }
    }
  })
}
onMounted(() => {
  loadEventListeners()
})
</script>

<template>
  <div class="event-container">
    <div class="event-header">
      <span style="display: inline-flex; align-items: center;">
        <el-text>事件监听器</el-text>
        <HelpTooltip content="全局监听器，它可以监听流程中发生的几乎所有事件，包括节点开始、结束、连线执行、任务创建、分配、完成或删除等。

它配置在流程的根标签上，或直接注册到流程引擎（Process Engine）中，而不是在具体的节点或连线线上
• 配置在流程根标签 - 仅限当前这一个流程定义，它只能监听到这个特定流程（比如【请假流程】）内发生的事件
• 注册到流程引擎中 - 生效范围为整个流程引擎，它监听到的所有流程（比如【请假流程】、【报销流程】），内发生的事件

支持类型：
• Java类 - 指定完整类名
• 表达式 - JUEL表达式

自定义事件监听器类：
• 实现 org.activiti.engine.delegate.event.ActivitiEventListener 接口
• 重写 onEvent 方法，根据需要执行自定义逻辑
" />
      </span>
      <el-button type="primary" link :icon="Plus" @click="editEventListener()">添加</el-button>
    </div>
    <el-table :data="events" height="200px">
      <el-table-column prop="events" show-overflow-tooltip label="事件"></el-table-column>
      <el-table-column prop="type" show-overflow-tooltip label="类型"></el-table-column>
      <el-table-column prop="value" show-overflow-tooltip label="监听"></el-table-column>
      <el-table-column label="操作" min-width="63px" align="center">
        <template #default="{ row }">
          <el-space>
            <el-button
              type="primary"
              :icon="EditPen"
              link
              @click="editEventListener(row)"
            ></el-button>
            <el-popconfirm title="您确定要删除该事件吗？" @confirm="removeEventListener(row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" link></el-button>
              </template>
            </el-popconfirm>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <EventListenerDrawer ref="eventListenerDrawerRef" @confirm="confirmEventListener" />
  </div>
</template>

<style scoped lang="scss">
.event-container {
  .event-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 7px 7px;
  }
}
</style>
