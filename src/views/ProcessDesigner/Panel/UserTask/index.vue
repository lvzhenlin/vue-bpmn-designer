<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
const dueDate = useCustomRef('dueDate');
const isUserTask = computed(() => is(selectedElement, 'bpmn:UserTask'));
const taskType = useCustomRef('taskType', 'any');
onMounted(() => {
  eventBus?.on('elementVariableChanged', (event: any) => {
    assignee.value = `\${${event.elementVariable}}`;
  });
});
const assigneeModalVisible = ref(false);
const candidateUsersModalVisible = ref(false);
const candidateGroupsModalVisible = ref(false);
</script>

<template>
  <el-collapse-item name="arg1" title="节点配置">
    <el-form-item prop="assignee" label="办理人">
      <SelectModal
        title="选择办理人"
        v-model="assignee"
        :visible="assigneeModalVisible"
        apiType="user"
        :multiple="false"
        @update:visible="(val) => (assigneeModalVisible = val)"
      />
    </el-form-item>

    <el-form-item prop="candidateUsers" label="候选人">
      <SelectModal
        title="选择候选人"
        v-model="candidateUsers"
        :visible="candidateUsersModalVisible"
        apiType="user"
        :multiple="true"
        @update:visible="(val) => (candidateUsersModalVisible = val)"
      />
    </el-form-item>

    <el-form-item prop="candidateGroups" label="候选组">
      <SelectModal
        title="选择候选组"
        v-model="candidateGroups"
        :visible="candidateGroupsModalVisible"
        apiType="group"
        :multiple="true"
        @update:visible="(val) => (candidateGroupsModalVisible = val)"
      />
    </el-form-item>

    <el-form-item v-if="isUserTask" prop="taskType" label="节点类型">
      <el-select v-model="taskType" placeholder="请选择节点类型">
        <el-option label="或签" value="any" />
        <el-option label="会签" value="all" />
      </el-select>
    </el-form-item>

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
</style>
