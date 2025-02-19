<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GenerateApi } from '@/api/code-gen/generate'
import { Search, Delete, Refresh, Download } from '@element-plus/icons-vue'
import type { CodeGenerateRecord, CodeProject } from '@/api/code-gen/types'
import FileList from './components/FileList.vue'
import { getProject, getProjects } from '@/api/code-gen/project'

const route = useRoute()
const projectId = Number(route.query.projectId)

// 查询条件
const queryFormRef = ref()
const searchForm = reactive({
  projectId: undefined as number | undefined,
  creatorId: '',
  pageIndex: 1,
  pageSize: 10
})

// 项目选择
const projectLoading = ref(false)
const projectOptions = ref<CodeProject[]>([])
const selectedProject = ref<{ id: number; name: string; code: string } | null>(null)

// 从路由查询参数加载项目ID
onMounted(async () => {
  if (projectId) {
    searchForm.projectId = projectId
    loadProjectInfo(projectId).then(() => {
      getGenerateList()
    })
  }
})

// 加载项目信息
const loadProjectInfo = async (projectId: number) => {
  try {
    const res = await getProject(projectId)
    const project = res.data
    projectOptions.value = [project]
  } catch (err) {
    console.error('Failed to load project:', err)
  }
}

// 监听项目ID变更
watch(
  () => searchForm.projectId,
  async (newId) => {
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

// 远程搜索项目
const handleProjectSearch = async (query: string) => {
  if (!query) {
    projectOptions.value = []
    return
  }

  projectLoading.value = true
  try {
    const { data } = await getProjects({
      // 使用 getProjects 而不是 GenerateApi.getProjects
      name: query,
      pageIndex: 1,
      pageSize: 20
    })
    projectOptions.value = data.items || []
  } catch (err) {
    console.error('Failed to search projects:', err)
  } finally {
    projectLoading.value = false
  }
}

// 生成记录表格
const generateTable = ref()
const generateList = ref<CodeGenerateRecord[]>([])
const generateTotal = ref(0)
const generateLoading = ref(false)
const currentGenerateId = ref<number>()

// 获取生成记录列表
const getGenerateList = async () => {
  generateLoading.value = true
  try {
    const { data } = await GenerateApi.list(searchForm) // 使用 searchForm
    generateList.value = data.items
    generateTotal.value = data.totalCount
  } catch (err) {
    console.error('Failed to fetch generate records:', err)
  } finally {
    generateLoading.value = false
  }
}

// 删除生成记录
const handleDeleteGenerate = async (row: CodeGenerateRecord) => {
  try {
    await ElMessageBox.confirm('确认删除该生成记录吗？', '提示', {
      type: 'warning'
    })
    await GenerateApi.delete(row.id)
    ElMessage.success('删除成功')
    getGenerateList()
    if (currentGenerateId.value === row.id) {
      currentGenerateId.value = undefined
    }
  } catch (err) {
    // 取消删除或删除失败
  }
}

// 下载生成记录
const handleDownloadGenerate = async (row: CodeGenerateRecord) => {
  try {
    const { data } = await GenerateApi.downloadGenerate(row.id)
    // 确保response.data是Blob类型
    if (!(data instanceof Blob)) {
      throw new Error('Response data is not a Blob')
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/zip' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `generated_${row.id}.zip`)
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

// 查询
const handleQuery = () => {
  searchForm.pageIndex = 1
  getGenerateList()
}

// 重置
const handleReset = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

// 格式化时间
const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}
</script>

<template>
  <div class="main">
    <!-- 查询表单 -->
    <el-card class="box-card !border-none mb-4" shadow="never">
      <el-form ref="queryFormRef" :model="searchForm" inline class="grid grid-cols-4 gap-4">
        <el-form-item label="项目" prop="projectId">
          <el-select
            v-model="searchForm.projectId"
            placeholder="请选择项目"
            clearable
            filterable
            remote
            :remote-method="handleProjectSearch"
            :loading="projectLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="`${item.name}(${item.code})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="creatorId">
          <el-input v-model="searchForm.creatorId" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 生成记录表格 -->
    <el-card class="box-card !border-none" shadow="never">
      <el-table
        ref="generateTable"
        v-loading="generateLoading"
        :data="generateList"
        style="width: 100%"
        @row-click="(row) => (currentGenerateId = row.id)"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectId" label="项目ID" width="100" />
        <el-table-column prop="fileCount" label="文件数量" width="100" />
        <el-table-column prop="creatorId" label="操作人" width="120" />
        <el-table-column prop="generatedAt" label="生成时间" align="center" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.generatedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Download"
              @click.stop="handleDownloadGenerate(row)"
            >
              下载
            </el-button>
            <el-button type="danger" link :icon="Delete" @click.stop="handleDeleteGenerate(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="searchForm.pageIndex"
        v-model:page-size="searchForm.pageSize"
        :total="generateTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="getGenerateList"
        @current-change="getGenerateList"
      />
    </el-card>

    <!-- 生成文件列表 -->
    <FileList v-if="currentGenerateId" :generate-id="currentGenerateId" class="mt-4" />
  </div>
</template>

<style lang="less" scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
