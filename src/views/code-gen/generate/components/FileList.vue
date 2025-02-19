<script setup lang="ts">
import { ref, watch, onMounted, shallowRef, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GenerateApi } from '@/api/code-gen/generate'
import {
  Download,
  Delete,
  Edit,
  Plus,
  Expand,
  Fold,
  FullScreen,
  ScaleToOriginal
} from '@element-plus/icons-vue'
import type { CodeGenerateFile } from '@/api/code-gen/types'
import { useEventListener } from '@vueuse/core'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// 配置 Monaco Editor workers
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const props = defineProps<{
  generateId?: number
}>()

// 表格和数据
const fileTable = ref()
const fileList = ref<CodeGenerateFile[]>([])
const fileTotal = ref(0)
const fileLoading = ref(false)
const treeData = ref<any[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = ref<Partial<CodeGenerateFile>>({})
const formRules = {
  fileName: [{ required: true, message: '请输入文件名', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文件内容', trigger: 'blur' }]
}

// 全屏状态
const isFullscreen = ref(false)

// 编辑器相关
const editorContainer = ref()
const monacoEditor = shallowRef()

// 根据文件名判断语言
const getLanguage = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    html: 'html',
    vue: 'html',
    css: 'css',
    less: 'less',
    scss: 'scss',
    xml: 'xml',
    java: 'java',
    py: 'python',
    go: 'go',
    sql: 'sql',
    cs: 'csharp',
    cshtml: 'csharp',
    razor: 'csharp',
    vb: 'vb',
    config: 'xml',
    csproj: 'xml'
  }
  return languageMap[ext || ''] || 'plaintext'
}

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return

  try {
    // 确保容器是空的
    editorContainer.value.innerHTML = ''

    monacoEditor.value = monaco.editor.create(editorContainer.value, {
      value: formData.value.content || '',
      language: getLanguage(formData.value.fileName || ''),
      theme: 'vs',
      automaticLayout: true,
      minimap: {
        enabled: true
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      renderWhitespace: 'selection'
    })

    // 监听内容变化
    monacoEditor.value.onDidChangeModelContent(() => {
      formData.value.content = monacoEditor.value.getValue()
    })
  } catch (err: any) {
    console.error('Failed to initialize editor:', err)
    ElMessage.error('编辑器初始化失败：' + (err.message || '未知错误'))
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (monacoEditor.value) {
    monacoEditor.value.dispose()
    monacoEditor.value = null
  }
}

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    nextTick(() => {
      initEditor()
    })
  } else {
    destroyEditor()
  }
})

// 监听全屏状态变化，重新布局编辑器
watch(isFullscreen, () => {
  nextTick(() => {
    monacoEditor.value?.layout()
  })
})

// 监听窗口大小变化
useEventListener(window, 'resize', () => {
  monacoEditor.value?.layout()
})

// 获取列表
const getFileList = async () => {
  if (!props.generateId) return

  fileLoading.value = true
  try {
    const { data } = await GenerateApi.fileList({
      generateId: props.generateId,
      pageIndex: 1,
      pageSize: 100
    })
    fileList.value = data.items
    treeData.value = convertToTree(data.items)
    fileTotal.value = data.total
  } catch (err) {
    console.error('Failed to fetch generate files:', err)
  } finally {
    fileLoading.value = false
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增生成文件'
  formData.value = {
    generateId: props.generateId,
    fileName: '',
    content: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: CodeGenerateFile) => {
  dialogTitle.value = '编辑生成文件'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate()
  try {
    if (formData.value.id) {
      await GenerateApi.fileUpdate(formData.value)
      ElMessage.success('更新成功')
    } else {
      await GenerateApi.fileCreate(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getFileList()
  } catch (err) {
    console.error('Save failed:', err)
    ElMessage.error('保存失败')
  }
}

// 删除
const handleDelete = async (row: CodeGenerateFile) => {
  try {
    await ElMessageBox.confirm('确认删除该文件吗？', '提示', {
      type: 'warning'
    })
    await GenerateApi.fileDelete(row.id)
    ElMessage.success('删除成功')
    getFileList()
  } catch (err) {
    // 取消删除或删除失败
  }
}

// 下载文件
const handleDownloadFile = async (row: CodeGenerateFile) => {
  try {
    const { data } = await GenerateApi.downloadFile(row.id)
    // 创建 Blob 对象，使用实际的文件内容
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', row.fileName)
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download failed:', err)
    ElMessage.error('下载失败')
  }
}

// 格式化时间
const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 将文件列表转换为树形结构
const convertToTree = (files: CodeGenerateFile[]) => {
  const root: any = { children: [] }

  files.forEach((file) => {
    const paths = file.fileName.split('/')
    let current = root

    // 创建目录节点
    paths.slice(0, -1).forEach((name, index) => {
      let folder = current.children.find((c: any) => c.isFolder && c.name === name)
      if (!folder) {
        folder = {
          id: `folder_${index}_${name}`,
          name,
          isFolder: true,
          children: []
        }
        current.children.push(folder)
      }
      current = folder
    })

    // 添加文件节点（只使用文件名，不包含路径）
    current.children.push({
      ...file,
      displayName: paths[paths.length - 1] // 添加 displayName 用于显示
    })
  })

  return root.children
}

// 展开所有节点
const handleExpandAll = () => {
  const table = fileTable.value
  if (!table) return

  // 获取所有可展开的行
  const expandableRows = getAllNodes(treeData.value)
  expandableRows.forEach((row) => {
    table.toggleRowExpansion(row, true)
  })
}

// 收起所有节点
const handleCollapseAll = () => {
  const table = fileTable.value
  if (!table) return

  // 获取所有可展开的行
  const expandableRows = getAllNodes(treeData.value)
  expandableRows.forEach((row) => {
    table.toggleRowExpansion(row, false)
  })
}

// 获取所有节点
const getAllNodes = (nodes: any[]): any[] => {
  let result: any[] = []
  nodes.forEach((node) => {
    if (node.children) {
      result.push(node)
      result = result.concat(getAllNodes(node.children))
    }
  })
  return result
}

// 添加切换全屏方法
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    dialogVisible.value = true
  }
}

// 监听生成记录ID变化
watch(
  () => props.generateId,
  (newVal) => {
    if (newVal) {
      getFileList()
    } else {
      fileList.value = []
      fileTotal.value = 0
    }
  },
  { immediate: true }
)

// 组件挂载时如果有 generateId 也执行查询
onMounted(() => {
  if (props.generateId) {
    getFileList()
  }
})

// 在 script setup 的最后添加
onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<template>
  <el-card class="box-card !border-none" shadow="never">
    <template #header>
      <div class="card-header flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span>生成文件列表</span>
          <el-button-group class="ml-4">
            <el-button :icon="Expand" @click="handleExpandAll">展开</el-button>
            <el-button :icon="Fold" @click="handleCollapseAll">收起</el-button>
          </el-button-group>
        </div>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
    </template>

    <!-- 树形表格 -->
    <el-table
      ref="fileTable"
      v-loading="fileLoading"
      :data="treeData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
      :empty-text="props.generateId ? '暂无数据' : '请选择生成记录'"
    >
      <el-table-column label="文件名" min-width="300" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.isFolder ? row.name : row.displayName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="templateName" label="模板名称" width="200" show-overflow-tooltip />
      <el-table-column prop="fileSize" label="文件大小" width="120" align="right">
        <template #default="{ row }">
          {{ !row.isFolder ? formatFileSize(row.fileSize) : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="generatedAt" label="生成时间" align="center" width="180">
        <template #default="{ row }">
          {{ !row.isFolder ? formatDateTime(row.generatedAt) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <template v-if="!row.isFolder">
            <el-button type="primary" link :icon="Download" @click="handleDownloadFile(row)">
              下载
            </el-button>
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isFullscreen ? '100%' : '65%'"
      :fullscreen="isFullscreen"
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <span>{{ dialogTitle }}</span>
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
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="formData.fileName" placeholder="请输入文件名（包含路径）" />
        </el-form-item>
        <el-form-item label="文件内容" prop="content" class="w-full">
          <div
            ref="editorContainer"
            class="w-full"
            :style="{
              height: isFullscreen ? 'calc(100vh - 250px)' : '400px',
              border: '1px solid #dcdfe6',
              borderRadius: '4px'
            }"
          ></div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.monaco-editor {
  width: 100% !important;
  height: 100% !important;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-form-item__content) {
  width: 100%;
}

:deep(.el-dialog__body) {
  padding: 20px;
  width: 100%;
}
</style>
