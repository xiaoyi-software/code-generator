<template>
  <el-dialog
    :title="props.template?.id ? '编辑模板' : '新增模板'"
    v-model="visible"
    :width="isFullscreen ? '100%' : '800px'"
    :fullscreen="isFullscreen"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span>{{ props.template?.id ? '编辑模板' : '新增模板' }}</span>
        <el-button
          type="primary"
          link
          :icon="isFullscreen ? ScaleToOriginal : FullScreen"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </el-button>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="template-form"
    >
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模板名称" />
      </el-form-item>

      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="formData.fileName" placeholder="请输入文件名" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入模板描述"
        />
      </el-form-item>

      <el-form-item label="模板内容" prop="content">
        <LiquidEditor
          v-model="formData.content"
          :height="isFullscreen ? 460 : 300"
          :read-only="false"
          @change="handleContentChange"
        />
        <div class="text-gray-400 text-sm mt-1" v-pre>
          支持 Liquid 模板语法，例如: {{ variable }}, {% if condition %}
        </div>
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
import { createTemplate, updateTemplate } from '@/api/code-gen/template'
import { CodeTemplate } from '@/api/code-gen/types'
import LiquidEditor from '@/components/LiquidEditor/index.vue'
import { ScaleToOriginal, FullScreen } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  template?: Partial<CodeTemplate>
  projectId: number
}>()

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref<FormInstance>()
const loading = ref(false)
const visible = ref(props.visible)

const window = globalThis.window

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  fileName: '',
  description: '',
  content: '',
  projectId: props.projectId
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
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

// 监听template变化，更新表单数据
watch(
  () => props.template,
  (val) => {
    if (val) {
      Object.assign(formData, val)
    }
  },
  { immediate: true }
)

// 添加全屏状态控制
const isFullscreen = ref(false)

// 切换全屏状态
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      if (formData.id) {
        await updateTemplate(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createTemplate(formData)
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
    fileName: '',
    description: '',
    content: '',
    projectId: props.projectId
  })
}

// 处理内容变化
const handleContentChange = (value: string) => {
  formData.content = value
}
</script>

<style lang="less" scoped>
.template-form {
  padding: 20px;
}

:deep(.el-form-item__content) {
  width: calc(100% - 100px); // 100px 是 label 的宽度
}

// 全屏时调整内容高度
:deep(.el-dialog__body) {
  height: v-bind('isFullscreen ? "calc(100vh - 120px)" : "auto"');
  overflow-y: auto;
}
</style>
