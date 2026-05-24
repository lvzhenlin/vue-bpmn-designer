<script setup lang="ts">
/**
 * HelpTooltip - 通用帮助提示组件
 * 用于在标签旁显示带问号图标的悬浮提示，支持多行文本
 */
defineProps<{
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}>()
</script>

<template>
  <el-tooltip :placement="placement || 'top'">
    <template #content>
      <span class="help-tooltip-content">{{ content }}</span>
    </template>
    <el-icon class="help-tooltip-icon">
      <el-icon-question-filled />
    </el-icon>
  </el-tooltip>
</template>

<style scoped>
.help-tooltip-content {
  display: inline-block;
  text-align: left;
  line-height: 1.8;
  white-space: pre-line;
}

.help-tooltip-icon {
  margin-left: 4px;
  cursor: pointer;
  color: #909399;
  vertical-align: middle;
}
</style>
