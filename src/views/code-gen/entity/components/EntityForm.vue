<template>
  <el-dialog
    :title="props.entity?.id ? '编辑实体' : '新增实体'"
    v-model="visible"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="entity-form">
      <el-form-item label="实体名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入实体名称" />
      </el-form-item>

      <el-form-item label="表名" prop="tableName">
        <el-input v-model="formData.tableName" placeholder="请输入表名" />
      </el-form-item>

      <el-form-item label="注释说明" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          :rows="3"
          placeholder="请输入注释说明"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createEntity, updateEntity } from '@/api/code-gen/entity'
import { CodeEntity } from '@/api/code-gen/types'

const props = defineProps<{
  visible: boolean
  entity?: Partial<CodeEntity>
  projectId: number | undefined
}>()

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref<FormInstance>()
const loading = ref(false)
const visible = ref(props.visible)

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  tableName: '',
  comment: '',
  projectId: props.projectId
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入实体名称', trigger: 'blur' }],
  tableName: [{ required: true, message: '请输入表名', trigger: 'blur' }],
  comment: [{ max: 500, message: '注释说明不能超过500个字符', trigger: 'blur' }]
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    visible.value = val
  }
)

// 监听visible变化，同步到父组件
watch(
  () => visible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 监听entity变化，更新表单数据
watch(
  () => props.entity,
  (val) => {
    if (val) {
      Object.assign(formData, val)
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      if (formData.id) {
        await updateEntity(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createEntity(formData)
        ElMessage.success('创建成功')
      }

      emit('success')
    } catch (error) {
      console.error('Failed to submit form:', error)
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框时重置表单
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    name: '',
    tableName: '',
    comment: '',
    projectId: props.projectId
  })
}
</script>

<style lang="less" scoped>
.entity-form {
  padding: 20px;
}
</style>
