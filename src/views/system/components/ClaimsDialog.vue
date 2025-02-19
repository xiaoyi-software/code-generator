<template>
  <el-dialog
    :title="`${title} Claims`"
    v-model="dialogVisible"
    width="800px"
    destroy-on-close
    @closed="handleDialogClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules">
      <el-table :data="formData.claims" border>
        <el-table-column type="index" width="50" />
        <el-table-column label="Type" min-width="200">
          <template #default="{ row, $index }">
            <el-form-item :prop="`claims.${$index}.type`" :rules="rules.type">
              <el-input v-model="row.type" placeholder="请输入Type" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="Value" min-width="200">
          <template #default="{ row, $index }">
            <el-form-item :prop="`claims.${$index}.value`" :rules="rules.value">
              <el-input v-model="row.value" placeholder="请输入Value" />
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeClaim($index)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="claims-actions">
        <el-button type="primary" @click="addClaim">
          <el-icon><Plus /></el-icon>添加 Claim
        </el-button>
      </div>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'

interface ClaimItem {
  type: string
  value: string
}

const props = defineProps<{
  modelValue: boolean
  title: string
  claims: ClaimItem[]
  onSubmit: (claims: ClaimItem[]) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const formData = ref({
  claims: [] as ClaimItem[]
})

const rules: FormRules = {
  type: [{ required: true, message: 'Type不能为空', trigger: 'blur' }],
  value: [{ required: true, message: 'Value不能为空', trigger: 'blur' }]
}

const addClaim = () => {
  formData.value.claims.push({
    type: '',
    value: ''
  })
}

const removeClaim = (index: number) => {
  formData.value.claims.splice(index, 1)
}

const resetForm = () => {
  if (props.claims) {
    formData.value.claims = props.claims.map((claim) => ({
      type: claim.type,
      value: claim.value
    }))
  } else {
    formData.value.claims = []
  }
}

const clearForm = () => {
  formData.value.claims = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleDialogClosed = () => {
  clearForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await props.onSubmit(formData.value.claims)
    ElMessage.success('Claims 更新成功')
    emit('success')
  } catch (error) {
    if (error === 'validate') {
      ElMessage.warning('请完善表单信息')
    } else {
      ElMessage.error('Claims 更新失败')
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.claims,
  () => {
    resetForm()
  },
  { immediate: true }
)

watch(
  () => dialogVisible.value,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  }
)
</script>

<style scoped>
.claims-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-table .el-table__cell) {
  padding: 6px 0;
}
</style>
