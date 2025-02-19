<template>
  <el-dialog
    :title="props.project?.id ? '编辑项目' : '新增项目'"
    v-model="visible"
    width="800px"
    :close-on-click-modal="false"
    @closed="handleClosed"
    class="project-form-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="project-form"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入项目名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入项目描述"
        />
      </el-form-item>

      <el-form-item label="属性配置" prop="properties">
        <JsonEditor v-model="formData.properties" :height="200" @change="handlePropertiesChange" />
        <div class="text-gray-400 text-sm mt-1"> 请输入有效的JSON格式数据 </div>
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
import { createProject, updateProject } from '@/api/code-gen/project'
import { CodeProject } from '@/api/code-gen/types'
import JsonEditor from '@/components/CustomJsonEditor.vue'

const props = defineProps<{
  visible: boolean
  project?: Partial<CodeProject | null>
}>()

const emit = defineEmits(['update:visible', 'success'])

// 安全地解析JSON字符串
const safeParseJson = (jsonString: string | null | undefined) => {
  if (!jsonString) return ''
  try {
    // 尝试解析JSON字符串
    const parsed = JSON.parse(jsonString)
    // 返回格式化的JSON字符串
    return JSON.stringify(parsed, null, 2)
  } catch (err) {
    console.warn('Failed to parse JSON:', err)
    // 如果解析失败，返回原始字符串
    return jsonString
  }
}

const formRef = ref<FormInstance>()
const loading = ref(false)
const visible = ref(props.visible)

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  description: '',
  properties: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  properties: [
    {
      validator: (rule: any, value: string) => {
        if (!value) return true
        try {
          JSON.parse(value)
          return true
        } catch (e) {
          return false
        }
      },
      message: '请输入有效的JSON格式',
      trigger: 'blur'
    }
  ]
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

// 监听project变化，更新表单数据
watch(
  () => props.project,
  (val) => {
    if (val) {
      formData.id = val.id
      formData.name = val.name || ''
      formData.description = val.description || ''
      // 如果properties是对象，先转换为字符串
      const propertiesStr =
        typeof val.properties === 'string' ? val.properties : JSON.stringify(val.properties)
      formData.properties = safeParseJson(propertiesStr)
    }
  },
  { immediate: true }
)

// 处理JSON编辑器的值变化
const handlePropertiesChange = (value: string) => {
  formData.properties = value
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      // 准备提交的数据
      const submitData = {
        ...formData,
        // 将JSON字符串解析为对象
        properties: formData.properties ? JSON.parse(formData.properties) : undefined
      }

      if (formData.id) {
        await updateProject(formData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createProject(submitData)
        ElMessage.success('创建成功')
      }

      emit('success')
      visible.value = false
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
    description: '',
    properties: ''
  })
}
</script>

<style lang="less" scoped>
.project-form {
  padding: 20px;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-form-item__content) {
  width: calc(100% - 100px); // 100px 是 label 的宽度
}

.json-editor {
  height: 200px;
  margin-bottom: 8px;
}
</style>
