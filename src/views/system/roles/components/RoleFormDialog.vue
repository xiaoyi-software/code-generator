<template>
  <el-dialog
    :title="isEdit ? '编辑角色' : '新建角色'"
    v-model="dialogVisible"
    width="550px"
    destroy-on-close
  >
    <Form @submit="onSubmit" :initial-values="formData">
      <Field
        name="name"
        :rules="isEdit ? undefined : 'required|min:2'"
        v-slot="{ field, errorMessage }"
      >
        <el-form-item label="角色名称" label-position="top" :error="errorMessage">
          <el-input
            v-bind="field"
            :disabled="isEdit"
            placeholder="请输入角色名称"
            :class="{ 'is-error': errorMessage }"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </Field>

      <Field name="description" rules="required" v-slot="{ field, errorMessage }">
        <el-form-item label="角色描述" label-position="top" :error="errorMessage">
          <el-input
            :model-value="field.value"
            @update:model-value="field['onUpdate:modelValue']"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
            :class="{ 'is-error': errorMessage }"
          />
        </el-form-item>
      </Field>

      <el-form-item label="状态" label-position="top">
        <el-switch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
      </el-form-item>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" native-type="submit">确定</el-button>
      </div>
    </Form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Key } from '@element-plus/icons-vue'
import { Form, Field } from 'vee-validate'
import { createRole, updateRole } from '@/api/system/role'
import type { RoleInfo, CreateRoleInfo } from '@/api/system/types'

const props = defineProps<{
  modelValue: boolean
  editData: RoleInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.editData)
const loading = ref(false)
const formData = ref<Partial<CreateRoleInfo>>({
  name: '',
  description: '',
  isEnabled: true
})

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    if (isEdit.value && props.editData) {
      await updateRole(props.editData.id, {
        description: values.description,
        name: formData.value.name,
        isEnabled: formData.value.isEnabled!
      })
    } else {
      await createRole({
        name: values.name,
        isEnabled: values.isEnabled,
        description: values.description
      })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    emit('success')
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  }
  loading.value = false
}

watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        name: newVal.name,
        description: newVal.description,
        isEnabled: newVal.isEnabled
      }
    } else {
      formData.value = {
        name: '',
        description: '',
        isEnabled: true
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.dialog-footer {
  margin-top: 20px;
  text-align: right;
}

.error-message {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 12px;
  color: var(--el-color-danger);
}
</style>
