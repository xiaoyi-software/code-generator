<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">代码生成</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px">
        <el-form-item label="表结构" required>
          <json-editor
            v-model="form.tablesInput"
            :options="jsonOptions"
            :height="300"
            class="w-full"
          />
          <div class="text-gray-400 text-sm mt-1">
            输入表结构的JSON数据，可以从Schema导出功能获取
          </div>
        </el-form-item>

        <el-form-item label="属性配置" required>
          <json-editor
            v-model="form.propertiesInput"
            :options="jsonOptions"
            :height="200"
            class="w-full"
          />
          <div class="text-gray-400 text-sm mt-1"> 输入生成代码所需的属性配置JSON数据 </div>
        </el-form-item>

        <el-form-item label="子目录">
          <el-input v-model="form.subDir" placeholder="请输入子目录（可选）" />
          <div class="text-gray-400 text-sm mt-1"> 可选：指定生成代码的子目录 </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handlePreview" :loading="previewLoading">
            预览代码
          </el-button>
          <el-button type="success" @click="handleDownload" :loading="downloadLoading">
            下载代码
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 预览结果 -->
      <div v-if="previewData" class="mt-4">
        <el-divider>生成结果预览</el-divider>

        <div class="preview-container">
          <!-- 左侧树形导航 -->
          <div class="nav-panel" :class="{ 'nav-panel-collapsed': isNavCollapsed }">
            <div class="nav-header">
              <div
                class="nav-title"
                @click="isNavCollapsed = !isNavCollapsed"
                :class="{ clickable: true }"
              >
                <span>文件导航</span>
                <i v-if="!isNavCollapsed" class="el-icon-d-arrow-left"></i>
              </div>
              <div class="nav-actions" v-show="!isNavCollapsed">
                <el-tooltip content="清除选择" placement="top" v-if="selectedCategory">
                  <el-button type="primary" link @click="clearSelection">
                    <i class="el-icon-close"></i>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <el-tree
              v-show="!isNavCollapsed"
              :data="treeData"
              :props="{ label: 'label' }"
              @node-click="handleNodeClick"
              default-expand-all
              highlight-current
              node-key="label"
              ref="treeRef"
            />
          </div>

          <!-- 右侧内容区 -->
          <div class="content-panel">
            <!-- 遍历第一层：分类 -->
            <div
              v-for="(category, categoryName) in filteredPreviewData"
              :key="categoryName"
              class="mb-6"
            >
              <h3 class="mb-4">{{ formatCategoryName(categoryName) }}</h3>

              <!-- 遍历第二层：文件 -->
              <div
                v-for="(content, fileName) in category"
                :key="fileName"
                class="mb-4"
                :id="'file-' + categoryName + '-' + fileName"
              >
                <el-card>
                  <template #header>
                    <div class="card-header">
                      <span>{{ fileName }}</span>
                      <el-button type="primary" link @click="copyContent(content as string)"
                        >复制代码</el-button
                      >
                    </div>
                  </template>
                  <pre class="code-preview">{{ content }}</pre>
                </el-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { generateCode, downloadCode } from '@/api/code-gen/generate'
import JsonEditor from '@/components/CustomJsonEditor.vue'

const form = ref({
  tablesInput: '{}',
  propertiesInput: '{}',
  subDir: ''
})

const previewLoading = ref(false)
const downloadLoading = ref(false)
const previewData = ref<Record<string, string> | null>(null)

const isNavCollapsed = ref(false)
const selectedCategory = ref('')
const selectedFile = ref('')

const treeRef = ref()

// 添加JSON编辑器的配置
const jsonOptions = {
  mode: 'code',
  modes: ['code', 'tree']
}

// 构建树形数据
const treeData = computed(() => {
  if (!previewData.value) return []

  return Object.entries(previewData.value).map(([category, files]) => ({
    label: formatCategoryName(category),
    category,
    children: Object.keys(files).map((fileName) => ({
      label: fileName,
      category,
      fileName
    }))
  }))
})

// 过滤显示的预览数据
const filteredPreviewData = computed(() => {
  if (!previewData.value) return null
  if (!selectedCategory.value) return previewData.value

  const result: Record<string, Record<string, string> | string> = {}
  if (!selectedFile.value) {
    // 只选择了分类
    result[selectedCategory.value] = previewData.value[selectedCategory.value]
  } else {
    // 选择了具体文件
    result[selectedCategory.value] = {
      [selectedFile.value]: previewData.value[selectedCategory.value][selectedFile.value]
    }
  }
  return result
})

// 处理树节点点击
const handleNodeClick = (data: any) => {
  if (data.fileName) {
    // 点击的是文件节点
    selectedCategory.value = data.category
    selectedFile.value = data.fileName
    // 滚动到对应元素
    nextTick(() => {
      const element = document.getElementById(`file-${data.category}-${data.fileName}`)
      element?.scrollIntoView({ behavior: 'smooth' })
    })
  } else {
    // 点击的是分类节点
    selectedCategory.value = data.category
    selectedFile.value = ''
  }
}

// 重置过滤条件
watch(previewData, () => {
  selectedCategory.value = ''
  selectedFile.value = ''
})

// 修改parseJSON函数
const parseJSON = (input: string, fieldName: string): Record<string, any> | null => {
  try {
    // 如果输入已经是对象，直接返回
    if (typeof input === 'object') {
      return input
    }

    // 表结构不能为空
    if (fieldName === '表结构' && (!input || input === '{}')) {
      ElMessage.warning(`请输入${fieldName}`)
      return null
    }

    // 解析 JSON
    const parsed = JSON.parse(input)
    return parsed
  } catch (error) {
    ElMessage.error(`${fieldName}的JSON格式不正确`)
    return null
  }
}

// 格式化分类名称
const formatCategoryName = (name: string) => {
  if (name === '__global') {
    return '全局代码'
  }
  return `${name} 相关代码`
}

// 预览代码
const handlePreview = async () => {
  const tables = parseJSON(form.value.tablesInput, '表结构')
  if (!tables) return

  const properties = parseJSON(form.value.propertiesInput, '属性配置')
  if (!properties) return

  previewLoading.value = true
  try {
    const res = await generateCode({ tables, properties }, form.value.subDir || undefined)
    previewData.value = res.data
    ElMessage.success('代码生成成功')
  } catch (error) {
    console.error('Generate failed:', error)
    ElMessage.error('代码生成失败')
  } finally {
    previewLoading.value = false
  }
}

// 下载代码
const handleDownload = async () => {
  const tables = parseJSON(form.value.tablesInput, '表结构')
  if (!tables) return

  const properties = parseJSON(form.value.propertiesInput, '属性配置')
  if (!properties) return

  downloadLoading.value = true
  try {
    const response = await downloadCode({ tables, properties }, form.value.subDir || undefined)

    // 创建 Blob 对象并下载
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.setAttribute('download', `generated_code_${timestamp}.zip`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('代码下载成功')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('代码下载失败')
  } finally {
    downloadLoading.value = false
  }
}

// 复制代码内容
const copyContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 清除选择
const clearSelection = () => {
  selectedCategory.value = ''
  selectedFile.value = ''
  if (treeRef.value) {
    treeRef.value.setCurrentKey(null)
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .code-preview {
    margin: 0;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.5;
    max-height: 400px;
    overflow-y: auto;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #606266;
    margin-top: 20px;
  }

  .mb-6 {
    margin-bottom: 24px;
  }

  .preview-container {
    display: flex;
    gap: 20px;
    position: relative;

    .nav-panel {
      width: 250px;
      background-color: #fff;
      border-right: 1px solid #dcdfe6;
      transition: all 0.3s;
      flex-shrink: 0;

      &.nav-panel-collapsed {
        width: 40px;
      }

      .nav-header {
        padding: 10px;
        border-bottom: 1px solid #dcdfe6;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .nav-title {
          display: flex;
          align-items: center;
          gap: 8px;

          &.clickable {
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }

          i {
            font-size: 12px;
          }
        }

        .nav-actions {
          display: flex;
          gap: 4px;
        }
      }

      :deep(.el-tree) {
        padding: 10px;

        .el-tree-node__label {
          white-space: normal;
          word-break: break-all;
          line-height: 1.2;
          padding: 4px 0;
        }

        .el-tree-node__content {
          height: auto;
          min-height: 26px;
        }
      }

      // 图标样式
      :deep(.el-icon-close) {
        &::before {
          content: '×';
          font-size: 16px;
        }
      }

      :deep(.el-icon-d-arrow-left) {
        &::before {
          content: '◄';
          font-size: 12px;
        }
      }
    }

    .content-panel {
      flex: 1;
      min-width: 0; // 防止内容溢出
    }
  }
}
</style>
