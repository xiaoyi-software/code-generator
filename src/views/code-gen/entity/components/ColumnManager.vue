<template>
  <el-dialog
    :title="`管理列 - ${props.entity?.name}`"
    v-model="visible"
    width="900px"
    :close-on-click-modal="false"
    @closed="close"
  >
    <div class="column-manager">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">新增列</el-button>
      </div>

      <el-table :data="columns" style="width: 100%">
        <el-table-column prop="name" label="列名" width="180" />
        <el-table-column prop="dbType" label="数据类型" width="150" />
        <el-table-column prop="comment" label="注释说明" min-width="200" show-overflow-tooltip />
        <el-table-column label="可空" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isNullable ? 'info' : 'danger'">
              {{ row.isNullable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="主键" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isPrimaryKey ? 'success' : 'info'">
              {{ row.isPrimaryKey ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="自增" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isIdentity ? 'warning' : 'info'">
              {{ row.isIdentity ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxLength" label="最大长度" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 列编辑对话框 -->
    <ColumnForm
      v-model:visible="columnFormVisible"
      :column="currentColumn"
      :entityId="props.entity?.id"
      @success="handleColumnSuccess"
    />

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getColumns, deleteColumn } from '@/api/code-gen/column'
import { CodeEntity, CodeEntityColumn } from '@/api/code-gen/types'
import ColumnForm from './ColumnForm.vue'

const props = defineProps<{
  visible: boolean
  entity?: Partial<CodeEntity>
}>()

const updated = ref(false)

const emit = defineEmits(['update:visible', 'success'])
const close = () => {
  if (updated.value) {
    emit('success')
  }
}

const visible = ref(props.visible)
const columnFormVisible = ref(false)
const columns = ref<CodeEntityColumn[]>([])
const currentColumn = ref<Partial<CodeEntityColumn>>({})

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val && props.entity?.id) {
      fetchColumns()
    }
  }
)

// 监听visible变化，同步到父组件
watch(
  () => visible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 获取列数据
const fetchColumns = async () => {
  if (!props.entity?.id) return
  try {
    const res = await getColumns(props.entity.id)
    columns.value = Array.isArray(res.data) ? res.data : res.data.items
  } catch (error) {
    console.error('Failed to fetch columns:', error)
    ElMessage.error('获取列数据失败')
  }
}

// 新增
const handleAdd = () => {
  currentColumn.value = { entityId: props.entity?.id }
  columnFormVisible.value = true
}

// 编辑
const handleEdit = (row: CodeEntityColumn) => {
  currentColumn.value = { ...row }
  columnFormVisible.value = true
}

// 删除
const handleDelete = async (row: CodeEntityColumn) => {
  try {
    await ElMessageBox.confirm('确认删除该列吗？', '提示', {
      type: 'warning'
    })
    await deleteColumn(row.id)
    ElMessage.success('删除成功')
    fetchColumns()
  } catch (error) {
    console.error('Failed to delete column:', error)
    ElMessage.error('删除失败')
  }
}

// 列表单提交成功
const handleColumnSuccess = () => {
  columnFormVisible.value = false
  fetchColumns()
  // emit('success')
  updated.value = true
}
</script>

<style lang="less" scoped>
.column-manager {
  .toolbar {
    margin-bottom: 20px;
  }
}
</style>
