<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">代码模板管理</span>
          <div class="button-group">
            <el-upload
              class="upload-demo"
              :show-file-list="false"
              :before-upload="handleImport"
              :disabled="!selectedProjectId"
            >
              <el-button type="primary" :disabled="!selectedProjectId">导入模板</el-button>
            </el-upload>
            <el-button type="success" @click="handleExport" :disabled="!selectedProjectId"
              >导出模板</el-button
            >
            <el-button type="primary" @click="handleAdd">新增模板</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
        <el-form-item label="所属项目" prop="projectId">
          <el-select
            style="width: 200px"
            v-model="searchForm.projectId"
            placeholder="请选择项目"
            clearable
            filterable
            remote
            :remote-method="handleProjectSearch"
            :loading="projectLoading"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入模板名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="fileName" label="文件名" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="searchForm.pageIndex"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <TemplateForm
      v-model:visible="dialogVisible"
      :template="currentTemplate"
      :projectId="projectId"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import {
  getTemplates,
  deleteTemplate,
  importTemplates,
  exportTemplates
} from '@/api/code-gen/template'
import { getProjects, getProject } from '@/api/code-gen/project'
import { CodeTemplate } from '@/api/code-gen/types'
import { formatDateTime } from '@/utils/format'
import TemplateForm from './components/TemplateForm.vue'

const route = useRoute()
const projectId = Number(route.query.projectId)

const loading = ref(false)
const projectLoading = ref(false)
const dialogVisible = ref(false)
const currentTemplate = ref<Partial<CodeTemplate>>({})
const tableData = ref<CodeTemplate[]>([])
const total = ref(0)
const projectOptions = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedProject = ref<{ id: number; name: string; code: string } | null>(null)

const searchForm = reactive({
  name: '',
  projectId: undefined as number | undefined,
  pageIndex: 1,
  pageSize: 10
})

const selectedProjectId = computed(() => searchForm.projectId)

// 监听项目选择变化
watch(
  () => searchForm.projectId,
  (newId) => {
    if (newId) {
      const project = projectOptions.value.find((p) => p.id === newId)
      if (project) {
        selectedProject.value = project
      } else {
        // 如果在当前选项中找不到，需要单独加载项目信息
        loadProjectInfo(newId)
      }
    } else {
      selectedProject.value = null
    }
  }
)

// 加载单个项目信息
const loadProjectInfo = async (id: number) => {
  try {
    const res = await getProject(id)
    const project = res.data
    selectedProject.value = project
    projectOptions.value = [project]
  } catch (error) {
    console.error('Failed to load project info:', error)
  }
}

// 项目搜索
const handleProjectSearch = async (query: string) => {
  if (query !== '') {
    projectLoading.value = true
    try {
      const res = await getProjects({
        name: query,
        pageIndex: 1,
        pageSize: 20
      })
      projectOptions.value = res.data.items
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      projectLoading.value = false
    }
  } else {
    projectOptions.value = []
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTemplates(searchForm)
    tableData.value = res.data.items
    total.value = res.data.totalCount
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.pageIndex = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }
  currentTemplate.value = { projectId: selectedProjectId.value }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: CodeTemplate) => {
  currentTemplate.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: CodeTemplate) => {
  try {
    await ElMessageBox.confirm('确认删除该模板吗？', '提示', {
      type: 'warning'
    })
    await deleteTemplate(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('Failed to delete template:', error)
    ElMessage.error('删除失败')
  }
}

// 导入
const handleImport = async (file: File) => {
  if (!selectedProject.value?.code) {
    ElMessage.warning('请先选择项目')
    return false
  }

  try {
    await importTemplates(selectedProject.value.code, file)
    ElMessage.success('导入成功')
    fetchData()
    return false
  } catch (error) {
    console.error('Failed to import templates:', error)
    ElMessage.error('导入失败')
    return false
  }
}

// 导出
const handleExport = async () => {
  if (!selectedProject.value?.code) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    const res = await exportTemplates(selectedProject.value.code)
    const blob = new Blob([res.data], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `templates_${selectedProject.value.code}.zip`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export templates:', error)
    ElMessage.error('导出失败')
  }
}

// 分页
const handleSizeChange = (val: number) => {
  searchForm.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  searchForm.pageIndex = val
  fetchData()
}

// 表单提交成功
const handleSuccess = () => {
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  // 如果URL中有projectId参数，自动加载对应的项目
  if (projectId) {
    searchForm.projectId = projectId
    loadProjectInfo(projectId).then(() => {
      fetchData()
    })
  }
})
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .button-group {
      display: flex;
      gap: 10px;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
