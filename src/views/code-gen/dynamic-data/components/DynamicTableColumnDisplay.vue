<template>
  <el-dropdown trigger="click" @visible-change="handleDropdownVisible">
    <el-button>
      <el-icon><Operation /></el-icon>
      列设置
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-card class="column-config-card" :body-style="{ padding: '10px' }">
          <div class="column-header">
            <el-checkbox
              v-model="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="handleCheckAll"
            >
              全选
            </el-checkbox>
          </div>
          <el-divider style="margin: 8px 0" />

          <draggable
            v-model="localColumns"
            item-key="columnName"
            handle=".drag-handle"
            @end="handleDragEnd"
          >
            <template #item="{ element }">
              <div class="column-item">
                <el-icon class="drag-handle"><DragIcon /></el-icon>
                <el-checkbox v-model="element.isVisible" @change="handleConfigChange">
                  {{ element.displayName || element.columnName }}
                </el-checkbox>
                <el-tooltip
                  v-if="element.description"
                  :content="element.description"
                  placement="right"
                >
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
          </draggable>
        </el-card>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Operation, InfoFilled } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import DragIcon from './DragIcon.vue'
import type { ITableColumn } from '@/api/code-gen/types'

const props = defineProps<{
  columns: ITableColumn[]
}>()

const emit = defineEmits<{
  (e: 'update:columns', columns: ITableColumn[]): void
}>()

const localColumns = ref<ITableColumn[]>([])

// 计算全选状态
const isAllSelected = computed({
  get: () => {
    return localColumns.value.length > 0 && localColumns.value.every((col) => col.isVisible)
  },
  set: (val) => {
    handleCheckAll(val)
  }
})

// 计算部分选中状态
const isIndeterminate = computed(() => {
  const visibleCount = localColumns.value.filter((col) => col.isVisible).length
  return visibleCount > 0 && visibleCount < localColumns.value.length
})

// 处理全选/取消全选
const handleCheckAll = (val: boolean) => {
  localColumns.value.forEach((col) => {
    col.isVisible = val
  })
  handleConfigChange()
}

// 监听外部列变化
watch(
  () => props.columns,
  (newColumns) => {
    localColumns.value = [...newColumns]
  },
  { deep: true, immediate: true }
)

// 处理拖拽结束
const handleDragEnd = () => {
  // 更新排序索引
  localColumns.value.forEach((col, index) => {
    col.orderIndex = index
  })
  handleConfigChange()
}

// 处理配置变更
const handleConfigChange = () => {
  emit('update:columns', localColumns.value)
}

// 处理下拉菜单显示状态变化
const handleDropdownVisible = (visible: boolean) => {
  if (!visible) {
    // 关闭时确保更新配置
    handleConfigChange()
  }
}
</script>

<style lang="less" scoped>
.column-config-card {
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;

  .column-header {
    padding: 8px;
  }

  .column-item {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .drag-handle {
      cursor: move;
      color: var(--el-text-color-secondary);
    }
  }
}

:deep(.el-dropdown-menu__item) {
  padding: 0;

  &:hover {
    background-color: transparent;
  }
}
</style>
