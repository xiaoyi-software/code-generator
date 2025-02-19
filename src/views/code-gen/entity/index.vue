<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">代码实体管理</span>
          <div class="button-group">
            <el-upload
              class="upload-demo"
              :show-file-list="false"
              :before-upload="handleImportSchema"
              :disabled="!selectedProject"
            >
              <el-button :disabled="!selectedProject" type="warning">导入Schema</el-button>
            </el-upload>
            <el-button type="success" :disabled="!selectedProject" @click="handleExportSchema">
              导出Schema
            </el-button>
            <el-button type="primary" @click="handleAdd">新增实体</el-button>
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
        <el-form-item label="实体名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入实体名称" clearable />
        </el-form-item>
        <el-form-item label="表名" prop="tableName">
          <el-input v-model="searchForm.tableName" placeholder="请输入表名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="实体名称" />
        <el-table-column prop="tableName" label="表名" />
        <el-table-column prop="comment" label="注释说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link @click="handleManageColumns(row)">管理列</el-button>
            <el-button type="warning" link @click="handleManageForeignKeys(row)"
              >管理外键</el-button
            >
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
    <EntityForm
      v-model:visible="dialogVisible"
      :entity="currentEntity"
      :projectId="selectedProjectId"
      @success="handleSuccess"
    />

    <!-- 列管理对话框 -->
    <ColumnManager
      v-model:visible="columnDialogVisible"
      :entity="currentEntity"
      @success="handleColumnSuccess"
    />

    <!-- 外键管理对话框 -->
    <ForeignKeyManager
      v-model:visible="foreignKeyDialogVisible"
      :entity="currentEntity"
      @success="handleForeignKeySuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { getEntities, deleteEntity } from '@/api/code-gen/entity'
import { getProjects, getProject, importSchema, exportSchema } from '@/api/code-gen/project'
import { CodeEntity } from '@/api/code-gen/types'
import { formatDateTime } from '@/utils/format'
import EntityForm from './components/EntityForm.vue'
import ColumnManager from './components/ColumnManager.vue'
import ForeignKeyManager from './components/ForeignKeyManager.vue'

const route = useRoute()
const projectId = Number(route.query.projectId)

const loading = ref(false)
const projectLoading = ref(false)
const dialogVisible = ref(false)
const columnDialogVisible = ref(false)
const foreignKeyDialogVisible = ref(false)
const currentEntity = ref<Partial<CodeEntity>>({})
const tableData = ref<CodeEntity[]>([])
const total = ref(0)
const projectOptions = ref<Array<{ id: number; name: string; code: string }>>([])
const selectedProject = ref<{ id: number; name: string; code: string } | null>(null)

const searchForm = reactive({
  name: '',
  tableName: '',
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
    const res = await getEntities(searchForm)
    tableData.value = res.data.items
    total.value = res.data.totalCount
  } catch (error) {
    console.error('Failed to fetch entities:', error)
    ElMessage.error('获取实体列表失败')
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
  searchForm.tableName = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }
  currentEntity.value = { projectId: selectedProjectId.value }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: CodeEntity) => {
  currentEntity.value = { ...row }
  dialogVisible.value = true
}

// 管理列
const handleManageColumns = (row: CodeEntity) => {
  currentEntity.value = { ...row }
  columnDialogVisible.value = true
}

// 管理外键
const handleManageForeignKeys = (row: CodeEntity) => {
  currentEntity.value = { ...row }
  foreignKeyDialogVisible.value = true
}

// 删除
const handleDelete = async (row: CodeEntity) => {
  try {
    await ElMessageBox.confirm('确认删除该实体吗？', '提示', {
      type: 'warning'
    })
    await deleteEntity(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('Failed to delete entity:', error)
    ElMessage.error('删除失败')
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

// 列管理成功
const handleColumnSuccess = () => {
  columnDialogVisible.value = false
  fetchData()
}

// 外键管理成功
const handleForeignKeySuccess = () => {
  foreignKeyDialogVisible.value = false
  fetchData()
}

// 导入Schema
const handleImportSchema = async (file: File) => {
  if (!selectedProject.value?.code) {
    ElMessage.warning('请先选择项目')
    return false
  }

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const schemaData = JSON.parse(e.target?.result as string)
        await importSchema(selectedProject.value!.code, schemaData)
        ElMessage.success('导入成功')
        fetchData() // 刷新列表
      } catch (error) {
        console.error('Failed to import schema:', error)
        ElMessage.error('导入失败：无效的Schema数据')
      }
    }
    reader.readAsText(file)
    return false // 阻止默认上传
  } catch (error) {
    console.error('Failed to read file:', error)
    ElMessage.error('读取文件失败')
    return false
  }
}

// 导出Schema
const handleExportSchema = async () => {
  if (!selectedProject.value?.code) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    const res = await exportSchema(selectedProject.value.code)
    // 创建Blob对象
    const blob = new Blob([JSON.stringify(res.data.schema, null, 2)], {
      type: 'application/json'
    })
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // 使用项目编码和时间戳作为文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    link.setAttribute('download', `schema_${selectedProject.value.code}_${timestamp}.json`)
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export schema:', error)
    ElMessage.error('导出失败')
  }
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
      align-items: center;
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
