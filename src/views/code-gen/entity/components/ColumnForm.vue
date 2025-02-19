<template>
  <el-dialog
    :title="props.column?.id ? '编辑列' : '新增列'"
    v-model="visible"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="max-height: 60vh; overflow-y: auto"
    >
      <el-form-item label="列名" prop="name">
        <el-input v-model="form.name" placeholder="请输入列名" />
      </el-form-item>

      <el-form-item label="数据类型" prop="dbType">
        <el-select v-model="form.dbType" placeholder="请选择数据类型" style="width: 100%">
          <el-option label="int" value="int" />
          <el-option label="bigint" value="bigint" />
          <el-option label="varchar" value="varchar" />
          <el-option label="nvarchar" value="nvarchar" />
          <el-option label="text" value="text" />
          <el-option label="datetime" value="datetime" />
          <el-option label="decimal" value="decimal" />
          <el-option label="bit" value="bit" />
        </el-select>
      </el-form-item>

      <el-form-item label="最大长度" prop="maxLength" v-if="showMaxLength">
        <el-input-number v-model="form.maxLength" :min="1" :max="4000" />
      </el-form-item>

      <el-form-item label="注释说明" prop="comment">
        <el-input v-model="form.comment" type="textarea" :rows="3" placeholder="请输入注释说明" />
      </el-form-item>

      <el-form-item label="可空" prop="isNullable">
        <el-switch v-model="form.isNullable" />
      </el-form-item>

      <el-form-item label="主键" prop="isPrimaryKey">
        <el-switch v-model="form.isPrimaryKey" />
      </el-form-item>

      <el-form-item label="自增" prop="isIdentity">
        <el-switch v-model="form.isIdentity" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createColumn, updateColumn } from '@/api/code-gen/column'
import type { CodeEntityColumn } from '@/api/code-gen/types'

const props = defineProps<{
  visible: boolean
  column?: Partial<CodeEntityColumn>
  entityId?: number
}>()

const emit = defineEmits(['update:visible', 'success'])

const visible = ref(props.visible)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = ref<Partial<CodeEntityColumn>>({
  name: '',
  dbType: '',
  maxLength: undefined,
  comment: '',
  isNullable: true,
  isPrimaryKey: false,
  isIdentity: false,
  entityId: props.entityId
})

// 表单校验规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入列名', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  comment: [{ max: 500, message: '注释说明不能超过500个字符', trigger: 'blur' }]
}

// 是否显示最大长度输入框
const showMaxLength = computed(() => {
  return ['varchar', 'nvarchar'].includes(form.value.dbType || '')
})

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (val && props.column) {
      form.value = { ...props.column }
    } else {
      resetForm()
    }
  }
)

// 监听visible变化，同步到父组件
watch(
  () => visible.value,
  (val) => {
    emit('update:visible', val)
    if (!val) {
      resetForm()
    }
  }
)

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    dbType: '',
    maxLength: undefined,
    comment: '',
    isNullable: true,
    isPrimaryKey: false,
    isIdentity: false,
    entityId: props.entityId
  }
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      if (props.column?.id) {
        await updateColumn(props.column.id, form.value)
        ElMessage.success('更新成功')
      } else {
        await createColumn(form.value)
        ElMessage.success('创建成功')
      }
      visible.value = false
      emit('success')
    } catch (error) {
      console.error('Failed to save column:', error)
      ElMessage.error('保存失败')
    } finally {
      loading.value = false
    }
  })
}
</script>
