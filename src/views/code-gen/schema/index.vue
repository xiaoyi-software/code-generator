<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">Schema导出</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 本地数据库 Schema -->
        <el-tab-pane label="本地数据库" name="local">
          <el-form :model="localForm" label-width="120px">
            <el-form-item label="实体名称" required>
              <el-select
                v-model="localForm.entityNames"
                multiple
                filterable
                remote
                :remote-method="handleSearchEntities"
                :loading="entitySearchLoading"
                placeholder="请选择实体"
                style="width: 100%"
              >
                <el-option
                  v-for="item in entityOptions"
                  :key="item.name"
                  :label="item.displayName"
                  :value="item.name"
                >
                  <span>{{ item.displayName }}</span>
                  <span class="text-gray-400 ml-2">({{ item.tableName }})</span>
                </el-option>
              </el-select>
              <div v-if="localForm.entityNames.length" class="text-gray-500 mt-2 w-full">
                已选择: {{ localForm.entityNames.join(', ') }}
              </div>
              <div class="text-gray-400 text-sm mt-1"> 选择需要导出Schema的实体，支持搜索 </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleExportLocal" :loading="localLoading">
                导出Schema
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 远程数据库 Schema -->
        <el-tab-pane label="远程数据库" name="remote">
          <el-form :model="remoteForm" label-width="120px">
            <el-form-item label="连接字符串" required>
              <el-input
                v-model="remoteForm.connectionStringName"
                type="textarea"
                :rows="3"
                placeholder="请输入连接字符串或连接字符串名称"
                @change="handleConnectionStringChange"
              />
              <div class="text-gray-400 text-sm mt-1">
                可以输入连接字符串名称或完整的连接字符串
              </div>
            </el-form-item>

            <el-form-item label="表名" required>
              <el-select
                v-model="remoteForm.tableNames"
                multiple
                filterable
                remote
                :remote-method="handleSearchTables"
                :loading="tableSearchLoading"
                placeholder="请选择数据表"
                style="width: 100%"
                :disabled="!remoteForm.connectionStringName"
              >
                <el-option
                  v-for="item in tableOptions"
                  :key="item.name"
                  :label="item.displayName"
                  :value="item.name"
                >
                  <span>{{ item.displayName }}</span>
                  <span class="text-gray-400 ml-2">({{ item.rowCount }}行)</span>
                  <span class="text-gray-400 ml-2">
                    {{ item.createTime ? new Date(item.createTime).toLocaleDateString() : '' }}
                  </span>
                </el-option>
              </el-select>
              <div v-if="remoteForm.tableNames.length" class="text-gray-500 mt-2 w-full">
                已选择: {{ remoteForm.tableNames.join(', ') }}
              </div>
              <div class="text-gray-400 text-sm mt-1" style="display: block">
                选择需要导出Schema的数据表，支持搜索
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleExportRemote" :loading="remoteLoading">
                导出Schema
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTableSchema,
  getTableSchemaFromConnection,
  getEntities,
  getTablesFromConnection
} from '@/api/code-gen/schema'

const activeTab = ref('local')
const localLoading = ref(false)
const remoteLoading = ref(false)
const entitySearchLoading = ref(false)
const tableSearchLoading = ref(false)

// 选项数据
const entityOptions = ref<any[]>([])
const tableOptions = ref<any[]>([])

// 表单数据
const localForm = ref({
  entityNames: [] as string[]
})

const remoteForm = ref({
  connectionStringName: '',
  tableNames: [] as string[]
})

// 搜索实体
const handleSearchEntities = async (query: string) => {
  if (query !== '') {
    entitySearchLoading.value = true
    try {
      const res = await getEntities(query)
      entityOptions.value = res.data.items
    } catch (error) {
      console.error('Search entities failed:', error)
      ElMessage.error('搜索实体失败')
    } finally {
      entitySearchLoading.value = false
    }
  } else {
    entityOptions.value = []
  }
}

// 搜索表
const handleSearchTables = async (query: string) => {
  if (!remoteForm.value.connectionStringName) {
    ElMessage.warning('请先输入连接字符串')
    return
  }

  if (query !== '') {
    tableSearchLoading.value = true
    try {
      const res = await getTablesFromConnection(remoteForm.value.connectionStringName, query)
      tableOptions.value = res.data.items
    } catch (error) {
      console.error('Search tables failed:', error)
      ElMessage.error('搜索表失败')
    } finally {
      tableSearchLoading.value = false
    }
  } else {
    tableOptions.value = []
  }
}

// 连接字符串改变时清空表选择
const handleConnectionStringChange = () => {
  remoteForm.value.tableNames = []
  tableOptions.value = []
}

// 导出本地Schema
const handleExportLocal = async () => {
  if (!localForm.value.entityNames.length) {
    ElMessage.warning('请至少选择一个实体')
    return
  }

  localLoading.value = true
  try {
    const res = await getTableSchema(localForm.value.entityNames)
    downloadSchema(res.data, 'local_schema')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    localLoading.value = false
  }
}

// 导出远程Schema
const handleExportRemote = async () => {
  if (!remoteForm.value.connectionStringName.trim()) {
    ElMessage.warning('请输入连接字符串或连接字符串名称')
    return
  }

  if (!remoteForm.value.tableNames.length) {
    ElMessage.warning('请至少选择一个表')
    return
  }

  remoteLoading.value = true
  try {
    const res = await getTableSchemaFromConnection({
      connectionStringName: remoteForm.value.connectionStringName.trim(),
      entityNames: remoteForm.value.tableNames
    })
    downloadSchema(res.data, 'remote_schema')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    remoteLoading.value = false
  }
}

// 下载Schema文件
const downloadSchema = (data: any, prefix: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  link.setAttribute('download', `${prefix}_${timestamp}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
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
}
</style>
