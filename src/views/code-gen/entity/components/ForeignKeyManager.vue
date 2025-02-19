<template>
  <el-dialog
    :title="`管理外键 - ${props.entity?.name}`"
    v-model="visible"
    width="900px"
    :close-on-click-modal="false"
    @closed="close"
  >
    <div class="foreign-key-manager">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">新增外键</el-button>
      </div>

      <el-table :data="foreignKeys" style="width: 100%">
        <el-table-column prop="name" label="外键名称" width="180" />
        <el-table-column prop="principalTable" label="关联表" width="180">
          <template #default="{ row }">
            {{ row.principalTable || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 外键编辑对话框 -->
    <ForeignKeyForm
      v-model:visible="formVisible"
      :foreignKey="currentForeignKey"
      :entityId="props.entity?.id"
      :projectId="props.entity?.projectId"
      @success="handleSuccess"
    />

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getForeignKeys, deleteForeignKey } from '@/api/code-gen/foreignKey'
import type { CodeEntity, CodeEntityForeignKey } from '@/api/code-gen/types'
import ForeignKeyForm from './ForeignKeyForm.vue'

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
const formVisible = ref(false)
const foreignKeys = ref<CodeEntityForeignKey[]>([])
const currentForeignKey = ref<Partial<CodeEntityForeignKey>>({})

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val && props.entity?.id) {
      fetchForeignKeys()
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

// 获取外键数据
const fetchForeignKeys = async () => {
  if (!props.entity?.id) return
  try {
    const res = await getForeignKeys(props.entity.id)
    foreignKeys.value = res.data.items
  } catch (error) {
    console.error('Failed to fetch foreign keys:', error)
    ElMessage.error('获取外键数据失败')
  }
}

// 新增
const handleAdd = () => {
  currentForeignKey.value = { entityId: props.entity?.id }
  formVisible.value = true
}

// 编辑
const handleEdit = (row: CodeEntityForeignKey) => {
  currentForeignKey.value = { ...row }
  formVisible.value = true
}

// 删除
const handleDelete = async (row: CodeEntityForeignKey) => {
  try {
    await ElMessageBox.confirm('确认删除该外键吗？', '提示', {
      type: 'warning'
    })
    await deleteForeignKey(row.id)
    ElMessage.success('删除成功')
    fetchForeignKeys()
  } catch (error) {
    console.error('Failed to delete foreign key:', error)
    ElMessage.error('删除失败')
  }
}

// 提交成功
const handleSuccess = () => {
  formVisible.value = false
  fetchForeignKeys()
  // emit('success')
  updated.value = true
}
</script>

<style lang="less" scoped>
.foreign-key-manager {
  .toolbar {
    margin-bottom: 20px;
  }
}
</style>
