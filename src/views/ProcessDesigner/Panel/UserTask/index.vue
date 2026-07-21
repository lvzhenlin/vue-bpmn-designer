<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCustomRef, useCustomRefList } from '@/views/ProcessDesigner/utils/ElementUtil.ts';
import { useBpmnContextService } from '@/hooks/useService.ts';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import type EventBus from 'diagram-js/lib/core/EventBus';
import SelectModal from './components/SelectModal.vue';
defineOptions({
  name: 'UserTaskPanel',
});
const { getService, selectedElement } = useBpmnContextService();
const eventBus = getService<EventBus>('eventBus');
const assignee = useCustomRef('assignee');
const candidateUsers = useCustomRefList('candidateUsers');
const candidateGroups = useCustomRefList('candidateGroups');
const isUserTask = computed(() => is(selectedElement, 'bpmn:UserTask'));
const taskType = useCustomRef('taskType', 'any');
const assigneeType = ref<'assignee' | 'candidateUsers' | 'candidateGroups'>('assignee');
const isInitializing = ref(false);
const initAssigneeType = () => {
  isInitializing.value = true;
  if (assignee.value) {
    assigneeType.value = 'assignee';
  } else if (candidateUsers.value.length > 0) {
    assigneeType.value = 'candidateUsers';
  } else if (candidateGroups.value.length > 0) {
    assigneeType.value = 'candidateGroups';
  } else {
    assigneeType.value = 'assignee';
  }
  isInitializing.value = false;
};
watch(() => selectedElement, () => {
  initAssigneeType();
}, { immediate: true });
watch(assigneeType, (newType) => {
  if (isInitializing.value) return;
  if (newType !== 'assignee') {
    assignee.value = undefined as any;
  }
  if (newType !== 'candidateUsers') {
    candidateUsers.value = [];
  }
  if (newType !== 'candidateGroups') {
    candidateGroups.value = [];
  }
});
onMounted(() => {
  eventBus?.on('elementVariableChanged', (event: any) => {
    if (assigneeType.value === 'assignee') {
      assignee.value = `\${${event.elementVariable}}`;
    }
  });
});
const assigneeModalVisible = ref(false);
const candidateUsersModalVisible = ref(false);
const candidateGroupsModalVisible = ref(false);
</script>

<template>
  <el-collapse-item name="arg1" title="节点配置">

    <el-form-item label="办理人设置">
      <el-select v-model="assigneeType" placeholder="请选择办理人">
        <el-option label="指定人" value="assignee" />
        <el-option label="候选人" value="candidateUsers" />
        <el-option label="候选组" value="candidateGroups" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="assigneeType === 'assignee'" prop="assignee" label="指定人">
      <SelectModal
        title="选择指定人"
        v-model="assignee"
        :visible="assigneeModalVisible"
        apiType="user"
        :multiple="false"
        @update:visible="(val) => (assigneeModalVisible = val)"
      />
    </el-form-item>

    <el-form-item v-if="assigneeType === 'candidateUsers'" prop="candidateUsers" label="候选人">
      <SelectModal
        title="选择候选人"
        v-model="candidateUsers"
        :visible="candidateUsersModalVisible"
        apiType="user"
        :multiple="true"
        @update:visible="(val) => (candidateUsersModalVisible = val)"
      />
    </el-form-item>

    <el-form-item v-if="assigneeType === 'candidateGroups'" prop="candidateGroups" label="候选组">
      <SelectModal
        title="选择候选组"
        v-model="candidateGroups"
        :visible="candidateGroupsModalVisible"
        apiType="group"
        :multiple="true"
        @update:visible="(val) => (candidateGroupsModalVisible = val)"
      />
    </el-form-item>

    <el-form-item v-if="isUserTask" prop="taskType" label="会签类型">
      <el-select v-model="taskType" placeholder="请选择会签类型">
        <el-option label="或签" value="any" />
        <el-option label="并签" value="all" />
      </el-select>
    </el-form-item>

  </el-collapse-item>
</template>

<style scoped lang="scss">
</style>
