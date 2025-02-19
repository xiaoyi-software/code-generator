<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">代码生成项目管理</span>
          <el-button type="primary" @click="handleAdd">新增项目</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
        <el-form-item label="项目编码" prop="code">
          <el-input v-model="searchForm.code" placeholder="请输入项目编码" clearable />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="code" label="项目编码" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="代码生成" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Document" @click="handleOpenGenerate(row)">
              生成代码
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link @click="handleManageTemplates(row)">模板</el-button>
            <el-button type="success" link @click="handleManageEntities(row)">实体</el-button>
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
    <ProjectForm
      v-model:visible="dialogVisible"
      :project="currentProject"
      @success="handleSuccess"
    />

    <!-- 生成代码对话框 -->
    <el-dialog v-model="generateDialogVisible" title="生成代码" width="500px" destroy-on-close>
      <div class="flex flex-col gap-4">
        <div class="text-gray-600"> 当前项目：{{ currentProject?.name }} </div>

        <el-form label-width="140px">
          <el-form-item label="保存到数据库">
            <el-switch v-model="generateOptions.saveToDb" />
          </el-form-item>
          <el-form-item label="使用文件系统模板">
            <el-switch v-model="generateOptions.useFileSystem" />
          </el-form-item>
        </el-form>

        <div class="flex items-center text-gray-400 gap-1">
          <el-icon><Link /></el-icon>
          <span>查看</span>
          <el-button type="primary" link @click="handleGoToGenerateRecords"> 生成记录 </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate">
          <el-icon><Download /></el-icon>
          生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjects, getProject, deleteProject, generateCode } from '@/api/code-gen/project'
import { CodeProject } from '@/api/code-gen/types'
import { formatDateTime } from '@/utils/format'
import ProjectForm from './components/ProjectForm.vue'
import { useRouter } from 'vue-router'
import { Document, Download, Link } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const dialogVisible = ref(false)
const currentProject = ref<CodeProject | null>(null)
const tableData = ref<CodeProject[]>([])
const total = ref(0)

const searchForm = reactive({
  code: '',
  name: '',
  pageIndex: 1,
  pageSize: 10
})

// 生成代码对话框
const generateDialogVisible = ref(false)
const generateOptions = ref({
  saveToDb: true,
  useFileSystem: false
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getProjects(searchForm)
    tableData.value = res.data.items
    total.value = res.data.totalCount
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    ElMessage.error('获取项目列表失败')
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
  searchForm.code = ''
  searchForm.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  currentProject.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: CodeProject) => {
  currentProject.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: CodeProject) => {
  try {
    await ElMessageBox.confirm('确认删除该项目吗？', '提示', {
      type: 'warning'
    })
    await deleteProject(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('Failed to delete project:', error)
    ElMessage.error('删除失败')
  }
}

// 打开生成代码对话框
const handleOpenGenerate = (row: CodeProject) => {
  currentProject.value = row
  generateDialogVisible.value = true
}

// 生成代码
const handleGenerate = async () => {
  try {
    if (!currentProject.value) throw Error('未选择项目。')

    const response = await generateCode(
      currentProject.value.code,
      generateOptions.value.saveToDb,
      generateOptions.value.useFileSystem
    )

    // 如果保存到数据库，显示成功消息
    if (generateOptions.value.saveToDb) {
      ElMessage.success('代码生成成功，已保存到数据库')
    }

    // 下载生成的文件
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${currentProject.value.code}_generated.zip`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    generateDialogVisible.value = false
  } catch (err) {
    console.error('Generate code failed:', err)
    ElMessage.error('生成代码失败')
  }
}

// 跳转到生成记录页面
const handleGoToGenerateRecords = () => {
  router.push({
    path: '/code-gen/code-generate',
    query: { projectId: currentProject.value?.id?.toString() }
  })
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

// 管理模板
const handleManageTemplates = (row: CodeProject) => {
  router.push({
    name: 'CodeTemplate',
    query: { projectId: row.id.toString() }
  })
}

// 管理实体
const handleManageEntities = (row: CodeProject) => {
  router.push({
    name: 'CodeEntity',
    query: { projectId: row.id.toString() }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
