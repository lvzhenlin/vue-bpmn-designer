<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getUserList, getGroupList, type Option, type PageResponse } from '@/api/processDesigner'

interface Props {
  title: string
  visible: boolean
  modelValue?: string | string[]
  multiple?: boolean
  apiType?: 'user' | 'group'
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:modelValue', value: string | string[]): void
}>()

const selectedValue = ref('')
const selectedValues = ref<string[]>([])
const visibleLocal = ref(false)
const options = ref<Option[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const leftSelected = ref<string[]>([])
const rightSelected = ref<string[]>([])
const radioSelected = ref<string>('')

const formatOption = (opt: Option): string => `${opt.id}_${opt.name}`

const parseOption = (val: string): Option | null => {
  const lastIndex = val.lastIndexOf('_')
  if (lastIndex === -1) {
    return null
  }
  return {
    id: val.substring(0, lastIndex),
    name: val.substring(lastIndex + 1),
  }
}

const unselectedOptions = computed(() => {
  return options.value.filter((opt) => !selectedValues.value.includes(formatOption(opt)))
})

const selectedOptions = computed(() => {
  return selectedValues.value.map((val) => {
    const option = options.value.find((o) => formatOption(o) === val)
    if (option) {
      return option
    }
    return parseOption(val)
  }).filter((o): o is Option => !!o)
})

const selectedIds = computed(() => {
  return selectedValues.value.map((val) => {
    const parsed = parseOption(val)
    return parsed?.id || ''
  }).filter(Boolean)
})

const fetchOptions = async () => {
  if (!props.apiType) return

  loading.value = true
  try {
    const response: PageResponse = props.apiType === 'user'
      ? await getUserList({ page: currentPage.value, pageSize: pageSize.value, keyword: keyword.value, excludeIds: selectedIds.value })
      : await getGroupList({ page: currentPage.value, pageSize: pageSize.value, keyword: keyword.value, excludeIds: selectedIds.value })
    if (response.code === 200) {
      options.value = response.data
      total.value = response.total
    }
  } catch (error) {
    console.error('Failed to fetch options:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchOptions()
}

const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  leftSelected.value = []
  fetchOptions()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  leftSelected.value = []
  fetchOptions()
}

watch(
  () => props.visible,
  (val) => {
    visibleLocal.value = val
    if (val) {
      initSelected()
      currentPage.value = 1
      if (props.apiType) {
        fetchOptions()
      }
    }
  }
)

const initSelected = () => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    selectedValues.value = [...props.modelValue]
  } else if (!props.multiple && props.modelValue) {
    selectedValue.value = props.modelValue as string
    selectedValues.value = [props.modelValue as string]
  } else {
    selectedValues.value = []
    selectedValue.value = ''
  }
  leftSelected.value = []
  rightSelected.value = []
  radioSelected.value = ''
}

const handleOpen = () => {
  visibleLocal.value = true
  currentPage.value = 1
  initSelected()
  if (props.apiType) {
    fetchOptions()
  }
}

const handleClose = () => {
  visibleLocal.value = false
  emit('update:visible', false)
}

const handleConfirm = () => {
  if (props.multiple) {
    emit('update:modelValue', [...selectedValues.value])
  } else {
    emit('update:modelValue', selectedValues.value[0] || '')
  }
  handleClose()
}

const handleClear = () => {
  selectedValues.value = []
  selectedValue.value = ''
  leftSelected.value = []
  rightSelected.value = []
  radioSelected.value = ''
}

const addSelected = () => {
  if (props.multiple) {
    leftSelected.value.forEach((val) => {
      if (!selectedValues.value.includes(val)) {
        selectedValues.value.push(val)
      }
    })
    leftSelected.value = []
  } else {
    if (radioSelected.value) {
      selectedValues.value = [radioSelected.value]
      radioSelected.value = ''
    }
  }
}

const removeSelected = () => {
  rightSelected.value.forEach((val) => {
    const index = selectedValues.value.indexOf(val)
    if (index > -1) {
      selectedValues.value.splice(index, 1)
    }
  })
  rightSelected.value = []
}

const removeAll = () => {
  handleClear()
}

const selectedLabel = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const values = props.modelValue.slice(0, 2)
    const count = props.modelValue.length
    if (count > 2) {
      return `${values.join('、')}等${count}项`
    }
    return values.join('、')
  } else if (!props.multiple && props.modelValue) {
    return props.modelValue as string
  }
  return ''
})

const hasValue = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0
  }
  return !!props.modelValue
})
</script>

<template>
  <div class="select-modal-container">
    <div class="select-modal-input">
      <span v-if="hasValue" class="select-modal-label">
        {{ selectedLabel }}
      </span>

      <button type="button" class="select-modal-btn" @click="handleOpen">
        选择
      </button>
    </div>

    <div v-if="visibleLocal" class="select-modal-mask">
      <div class="select-modal-dialog">
        <div class="select-modal-header">{{ title }}</div>
        <div class="select-modal-body">
          <div v-if="loading" class="select-modal-loading">加载中...</div>
          <template v-else>
            <div class="transfer-search">
              <input
                type="text"
                v-model="keyword"
                :placeholder="`搜索${props.apiType === 'user' ? '用户名称' : '候选组名称'}`"
                @keyup="handleKeyup"
                class="transfer-search-input"
              />
              <button type="button" class="transfer-search-btn" @click="handleSearch">查询</button>
            </div>
            <div class="transfer-container">
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  待选<!--（{{ total }}）-->
                </div>
                <div class="transfer-panel-body">
                  <label
                    v-for="option in unselectedOptions"
                    :key="option.id"
                    class="transfer-option"
                  >
                    <input
                      v-if="props.multiple"
                      type="checkbox"
                      :value="formatOption(option)"
                      v-model="leftSelected"
                      :disabled="!props.multiple && selectedValues.length > 0"
                    />
                    <input
                      v-else
                      type="radio"
                      :value="formatOption(option)"
                      v-model="radioSelected"
                    />
                    {{ formatOption(option) }}
                  </label>
                  <div v-if="unselectedOptions.length === 0" class="transfer-empty">
                    暂无数据
                  </div>
                </div>
                <div class="transfer-panel-footer">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100, 200]"
                    :pager-count="3"
                    :total="total || 0"
                    background
                    size="small"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handlePageChange"
                  />
                </div>
              </div>

              <div class="transfer-actions">
                <button
                  type="button"
                  class="transfer-action-btn"
                  @click="addSelected"
                  :disabled="props.multiple ? leftSelected.length === 0 : !radioSelected"
                >
                  >
                </button>
                <button
                  type="button"
                  class="transfer-action-btn"
                  @click="removeSelected"
                  :disabled="rightSelected.length === 0"
                >
                  <
                </button>
                <button
                  type="button"
                  class="transfer-action-btn"
                  @click="removeAll"
                  :disabled="selectedOptions.length === 0"
                >
                  <<
                </button>
              </div>

              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  已选（{{ selectedOptions.length }}）
                </div>
                <div class="transfer-panel-body">
                  <label
                    v-for="option in selectedOptions"
                    :key="option.id"
                    class="transfer-option"
                  >
                    <input
                      type="checkbox"
                      :value="formatOption(option)"
                      v-model="rightSelected"
                    />
                    {{ formatOption(option) }}
                  </label>
                  <div v-if="selectedOptions.length === 0" class="transfer-empty">
                    暂无数据
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="select-modal-footer">
          <!-- <button type="button" class="select-modal-btn-cancel" @click="handleClear">清除</button> -->
          <button type="button" class="select-modal-btn-cancel" @click="handleClose">取消</button>
          <button type="button" class="select-modal-btn-confirm" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.select-modal-container {
  width: 100%;
  max-width: 316px;
}

.select-modal-input {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}

.select-modal-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  padding: 0 4px;
  text-align: left;
}

.select-modal-btn {
  height: 24px;
  padding: 0 12px;
  border: none;
  border-left: 1px solid #dcdfe6;
  background: transparent;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  margin-left: 8px;
  flex-shrink: 0;
}

.select-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.select-modal-dialog {
  background: #fff;
  width: 1200px;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.select-modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.select-modal-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.select-modal-loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

.transfer-container {
  display: flex;
  align-items: stretch;
  gap: 16px;
  height: 380px;
}

.transfer-panel {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.transfer-panel-header {
  padding: 2px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.transfer-search {
  padding: 0 0 12px 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

.transfer-search-input {
  width: 300px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #409eff;
  }
}

.transfer-search-btn {
  height: 32px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #66b1ff;
  }
}

.transfer-panel-body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.transfer-panel-footer {
  padding: 2px 12px;
  border-top: 1px solid #dcdfe6;
  background: #fafafa;
}

.transfer-option {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f5f7fa;
  }

  input {
    margin-right: 8px;
    cursor: pointer;
  }

  &:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.transfer-empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

.transfer-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.transfer-action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #ecf5ff;
    border-color: #409eff;
  }

  &:disabled {
    color: #c0c4cc;
    cursor: not-allowed;
  }
}

.select-modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.select-modal-btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #666;
  cursor: pointer;
}

.select-modal-btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}
</style>
