<template>
  <el-dialog
    title="列管理"
    v-model="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @closed="handleDialogClosed"
  >
    <div id="dynamic-column-manager">
      <el-table :data="columnList" row-key="columnName" :max-height="500" v-loading="loading">
        <el-table-column width="40">
          <template #default>
            <el-icon class="drag-handle"><DragIcon /></el-icon>
          </template>
        </el-table-column>

        <el-table-column label="列名" prop="columnName" width="150">
          <template #default="{ row }">
            <el-tooltip v-if="row.description" :content="row.description" placement="right">
              <span>{{ row.columnName }}</span>
            </el-tooltip>
            <span v-else>{{ row.columnName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="显示名称" width="180">
          <template #default="{ row }">
            <el-input v-model="row.displayName" placeholder="请输入显示名称" />
          </template>
        </el-table-column>

        <el-table-column label="是否可排序" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.isSortable" />
          </template>
        </el-table-column>

        <el-table-column label="是否显示" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.isVisible" />
          </template>
        </el-table-column>

        <el-table-column label="描述">
          <template #default="{ row }">
            <el-input v-model="row.description" placeholder="请输入描述" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getTableColumns, saveTableColumns } from '@/api/code-gen/dynamic-data'
import Sortable from 'sortablejs'
import DragIcon from './DragIcon.vue'
import type { ITableColumn } from '@/api/code-gen/types'
import { saveTableColumnsToStorage } from '@/utils/storage'

const props = defineProps<{
  modelValue: boolean
  tableName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const dialogVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const columnList = ref<ITableColumn[]>([])

// 初始化拖拽排序
const initSortable = () => {
  nextTick(() => {
    const el: any = document.querySelector('#dynamic-column-manager .el-table__body > tbody')
    if (!el) return

    Sortable.create(el, {
      handle: '.drag-handle',
      animation: 150,
      onEnd({ newIndex, oldIndex }) {
        if (typeof newIndex === 'undefined' || typeof oldIndex === 'undefined') return

        const currRow = columnList.value.splice(oldIndex, 1)[0]
        columnList.value.splice(newIndex, 0, currRow)

        // 更新排序索引
        columnList.value.forEach((col, index) => {
          col.orderIndex = index
        })
      }
    })
  })
}

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      loadColumns()
    }
  }
)

watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:modelValue', val)
    if (val) {
      // 当对话框打开时，初始化排序
      initSortable()
    }
  }
)

const loadColumns = async () => {
  if (!props.tableName) return

  loading.value = true
  try {
    const res = await getTableColumns(props.tableName)
    columnList.value = res.data.columns
  } catch (error) {
    console.error('Failed to load columns:', error)
    ElMessage.error('加载列配置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    await saveTableColumns(props.tableName, columnList.value)
    // 清除本地缓存，使用新的后端配置
    saveTableColumnsToStorage(props.tableName, [])
    ElMessage.success('保存成功')
    emit('saved')
    dialogVisible.value = false
  } catch (error) {
    console.error('Failed to save columns:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleDialogClosed = () => {
  columnList.value = []
}
</script>

<style lang="less" scoped>
.drag-handle {
  cursor: move;
  color: var(--el-text-color-secondary);
}

:deep(.el-table__row) {
  &.sortable-ghost {
    background: var(--el-color-primary-light-9);
    opacity: 0.5;
  }
}
</style>
