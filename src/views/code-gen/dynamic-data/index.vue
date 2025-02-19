<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">动态数据管理</span>
          <div class="button-group">
            <el-button type="primary" @click="handleUpdateSchema">更新架构</el-button>
            <el-button type="primary" @click="handleImportSchema">导入架构</el-button>
            <el-select
              v-model="currentTable"
              placeholder="请选择数据表"
              :loading="tableLoading"
              filterable
              remote
              :remote-method="loadTables"
              @change="handleTableChange"
              style="width: 200px"
            >
              <el-option
                v-for="table in tables"
                :key="table.name"
                :label="table.label"
                :value="table.name"
              >
                <span>{{ table.label }}</span>
                <small v-if="table.description" class="text-gray-500 ml-2">
                  {{ table.description }}
                </small>
              </el-option>
            </el-select>
            <el-button type="primary" @click="handleAdd" :disabled="!currentTable">新增</el-button>
            <el-button type="primary" @click="handleManageColumns" :disabled="!currentTable">
              管理列
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
        <div :class="['search-form-content', { 'is-collapsed': isCollapsed }]">
          <template v-for="(column, index) in searchableColumns" :key="column.name">
            <el-form-item
              :label="column.name"
              :prop="column.name"
              :class="{ 'hidden-item': isCollapsed && index > 2 }"
            >
              <el-input v-model="searchForm[column.name]" :placeholder="`请输入${column.name}`" />
            </el-form-item>
          </template>
        </div>

        <div class="search-form-buttons">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button
              type="text"
              class="expand-button"
              @click="isCollapsed = !isCollapsed"
              v-if="searchableColumns.length > 3"
            >
              {{ isCollapsed ? '展开' : '收起' }}
              <el-icon class="expand-icon" :class="{ 'is-collapsed': isCollapsed }">
                <ArrowUp />
              </el-icon>
            </el-button>
          </el-form-item>
        </div>
      </el-form>

      <!-- 在表格上方添加列设置 -->
      <div class="table-toolbar">
        <el-button type="primary" @click="handleExport" :loading="exporting">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <DynamicTableColumnDisplay v-if="columns.length" v-model:columns="displayColumns" />
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <template v-for="column in sortedDisplayColumns" :key="column.columnName">
          <el-table-column
            v-if="column.isVisible"
            :prop="column.columnName"
            :label="column.displayName || column.columnName"
            :sortable="column.isSortable ? 'custom' : false"
          >
            <template #header>
              <el-tooltip
                v-if="column.description"
                :content="column.description"
                placement="top"
                effect="light"
              >
                <span>{{ column.displayName || column.columnName }}</span>
              </el-tooltip>
              <span v-else>{{ column.displayName || column.columnName }}</span>
            </template>
            <template #default="{ row }">
              {{ formatColumnValue(row[column.columnName], column.dbType) }}
            </template>
          </el-table-column>
        </template>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page.pageIndex"
        v-model:page-size="page.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑数据' : '新增数据'"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-height: 60vh; overflow-y: auto"
      >
        <!-- 编辑时显示主键 -->
        <template v-if="isEdit && primaryKeyColumn">
          <el-form-item :label="primaryKeyColumn.name">
            <el-tag>{{ form[primaryKeyColumn.name] }}</el-tag>
          </el-form-item>
        </template>

        <!-- 可编辑字段 -->
        <template v-for="column in editableColumns" :key="column.name">
          <el-form-item :label="column.name" :prop="column.name">
            <component :is="getFormItemComponent(column)" />
            <small v-if="column.comment" class="form-item-tip text-gray-500">{{
              column.comment
            }}</small>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加架构对话框 -->
    <el-dialog
      :title="schemaDialogType === 'update' ? '更新架构' : '导入架构'"
      v-model="schemaDialogVisible"
      width="800px"
    >
      <el-form ref="schemaFormRef" :model="schemaForm" label-width="100px">
        <el-form-item label="架构JSON" prop="schema">
          <JsonEditor
            v-model="schemaForm.schema"
            :height="400"
            :options="{
              modes: ['code', 'tree'],
              mode: 'code'
            }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="schemaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSchemaSubmit" :loading="schemaSubmitting"
          >确定</el-button
        >
      </template>
    </el-dialog>

    <!-- 添加列管理组件 -->
    <DynamicTableColumnManager
      v-model="columnManagerVisible"
      :table-name="currentTable"
      @saved="handleColumnsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, h, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  getDynamicData,
  createDynamicData,
  updateDynamicData,
  deleteDynamicData,
  getTableSchema,
  type ITableSchema,
  getTables,
  updateSchema,
  importSchema,
  getTableColumns,
  exportDynamicData
} from '@/api/code-gen/dynamic-data'
import type { IDynamicDataQuery } from '@/api/code-gen/types'
import { formatDateTime } from '@/utils/format'
import { ElInput, ElInputNumber, ElDatePicker, ElSelect } from 'element-plus'
import JsonEditor from '@/components/CustomJsonEditor.vue'
import DynamicTableColumnManager from './components/DynamicTableColumnManager.vue'
import DynamicTableColumnDisplay from './components/DynamicTableColumnDisplay.vue'
import { getTableColumnsFromStorage, saveTableColumnsToStorage } from '@/utils/storage'
import { ArrowUp, Download } from '@element-plus/icons-vue'

// 状态定义
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const currentTable = ref('')
const formRef = ref<FormInstance>()

// 表格数据
const tableData = ref<any[]>([])
const total = ref(0)
const page = reactive({
  pageIndex: 1,
  pageSize: 10
})

// 可用的表
const tables = ref<Array<{ name: string; label: string; description?: string }>>([])
const tableLoading = ref(false)

// 架构对话框相关状态
const schemaDialogVisible = ref(false)
const schemaDialogType = ref<'update' | 'import'>('update')
const schemaSubmitting = ref(false)
const schemaForm = reactive({
  schema: '' // 改为字符串类型的初始值
})
const schemaFormRef = ref<FormInstance>()

// 添加编辑状态变量
const isEdit = ref(false)

// 表单数据
const form = reactive<Record<string, any>>({})
const searchForm = reactive<Record<string, any>>({})

// 列定义
const columns = ref<
  Array<{
    name: string
    dbType: string
    isNullable: boolean
    isPrimaryKey: boolean
    isIdentity: boolean
    maxLength?: number
    comment?: string
  }>
>([])

// 获取可编辑的列
const editableColumns = computed(() =>
  columns.value.filter((col) => {
    // 排除审计字段
    const auditFields = [
      'CreatedAt',
      'UpdatedAt',
      'CreationTime',
      'CreatorId',
      'LastModificationTime',
      'LastModifierId'
    ]
    if (auditFields.includes(col.name)) return false

    // 新增时排除自增主键，编辑时排除所有主键
    if ((isEdit.value && col.isPrimaryKey) || (!isEdit.value && col.isPrimaryKey && col.isIdentity))
      return false

    return true
  })
)

// 获取可搜索的列
const searchableColumns = computed(() =>
  columns.value.filter(
    (col) =>
      ![
        'CreatedAt',
        'UpdatedAt',
        'CreationTime',
        'CreatorId',
        'LastModificationTime',
        'LastModifierId'
      ].includes(col.name)
  )
)

// 获取主键列
const primaryKeyColumn = computed(() => columns.value.find((col) => col.isPrimaryKey))

// 表单验证规则
const rules = computed(() => {
  const result: Record<string, any> = {}
  editableColumns.value.forEach((col) => {
    if (!col.isNullable) {
      result[col.name] = [{ required: true, message: `请输入${col.name}`, trigger: 'blur' }]
    }
  })
  return result
})

// 根据数据类型获取输入组件
const getInputComponent = (dbType: string) => {
  const props: any = {
    modelValue: form[dbType],
    'onUpdate:modelValue': (val: any) => (form[dbType] = val),
    style: 'width: 100%',
    clearable: columns.value.find((col) => col.name === dbType)?.isNullable || false
  }

  if (dbType.includes('datetime')) {
    return h(ElDatePicker, {
      ...props,
      type: 'datetime',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    })
  }

  if (dbType.includes('decimal') || dbType.includes('int')) {
    return h(ElInputNumber, {
      ...props,
      precision: dbType.includes('decimal') ? 2 : 0
    })
  }

  return h(ElInput, props)
}

// 格式化列值
const formatColumnValue = (value: any, dbType: string) => {
  if (value == null) return ''
  if (dbType?.includes('datetime')) return formatDateTime(value)
  if (dbType === 'date') return value.split('T')[0]
  return value
}

// 加载表结构
const loadTableSchema = async () => {
  if (!currentTable.value) return

  try {
    const res = await getTableSchema(currentTable.value)
    columns.value = res.data.columns
  } catch (error) {
    console.error('Failed to load table schema:', error)
    ElMessage.error('加载表结构失败')
  }
}

// 添加排序状态
const sortState = ref<Array<{ field: string; order: string }>>([])

// 修改加载表格数据的方法
const loadTableData = async () => {
  if (!currentTable.value) return

  loading.value = true
  try {
    // 过滤掉空值
    const filters = {}
    Object.keys(searchForm).forEach((key) => {
      if (searchForm[key] !== undefined && searchForm[key] !== '') {
        filters[key] = searchForm[key]
      }
    })

    const params: IDynamicDataQuery = {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      ...filters
    }
    const res = await getDynamicData(currentTable.value, params, sortState.value || [])
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load table data:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 处理表格排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  if (!prop) {
    sortState.value = []
  } else {
    // 转换 element-plus 的排序方向为后端格式
    const direction = order === 'descending' ? 'desc' : order === 'ascending' ? 'asc' : undefined

    if (direction) {
      // 更新或添加排序
      const existingSort = sortState.value.find((s) => s.field === prop)
      if (existingSort) {
        existingSort.order = direction
      } else {
        sortState.value.push({ field: prop, order: direction })
      }
    } else {
      // 移除排序
      sortState.value = sortState.value.filter((s) => s.field !== prop)
    }
  }
  loadTableData()
}

// 处理表切换
const handleTableChange = async () => {
  await loadTableSchema()
  await loadTableData()
}

// 处理搜索
const handleSearch = () => {
  page.pageIndex = 1
  loadTableData()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = undefined
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  resetForm()
  // 打开对话框
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  // 先重置表单
  resetForm()
  // 等待下一个 tick，确保表单已经重置
  nextTick(() => {
    // 复制行数据到表单
    editableColumns.value.forEach((col) => {
      form[col.name] = row[col.name]
    })
    // 如果有主键，也需要复制
    if (primaryKeyColumn.value) {
      form[primaryKeyColumn.value.name] = row[primaryKeyColumn.value.name]
    }
    // 打开对话框
    dialogVisible.value = true
  })
}

// 处理删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该记录吗？', '提示', {
      type: 'warning'
    })
    // 构建主键对象
    const keys = {}
    columns.value
      .filter((col) => col.isPrimaryKey)
      .forEach((col) => {
        keys[col.name] = row[col.name]
      })
    await deleteDynamicData(currentTable.value, keys)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    console.error('Failed to delete:', error)
    ElMessage.error('删除失败')
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 处理表单数据，区分空值和空字符串
      const submitData = {}
      columns.value.forEach((col) => {
        const value = form[col.name]
        if (col.isNullable && value === '') {
          submitData[col.name] = null
        } else if (value !== undefined) {
          submitData[col.name] = value
        }
      })

      if (isEdit.value) {
        await updateDynamicData(currentTable.value, submitData)
        ElMessage.success('更新成功')
      } else {
        await createDynamicData(currentTable.value, submitData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadTableData()
    } catch (error) {
      console.error('Failed to save:', error)
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  // 清空表单对象
  Object.keys(form).forEach((key) => {
    delete form[key]
  })

  // 为所有可编辑列设置初始值为 undefined
  editableColumns.value.forEach((col) => {
    form[col.name] = undefined
  })

  // 如果是编辑模式，需要为主键设置初始值
  if (isEdit.value && primaryKeyColumn.value) {
    form[primaryKeyColumn.value.name] = undefined
  }

  // 重置表单验证状态
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  page.pageSize = val
  loadTableData()
}

const handleCurrentChange = (val: number) => {
  page.pageIndex = val
  loadTableData()
}

// 处理更新架构
const handleUpdateSchema = () => {
  schemaDialogType.value = 'update'
  schemaForm.schema = '{}' // 初始化为空对象的字符串形式
  schemaDialogVisible.value = true
}

// 处理导入架构
const handleImportSchema = () => {
  schemaDialogType.value = 'import'
  schemaForm.schema = '{}' // 初始化为空对象的字符串形式
  schemaDialogVisible.value = true
}

// 处理架构提交
const handleSchemaSubmit = async () => {
  if (!schemaForm.schema) {
    ElMessage.warning('请输入架构JSON')
    return
  }

  try {
    // 确保 schema 是对象
    const schemaData = JSON.parse(schemaForm.schema)

    schemaSubmitting.value = true
    if (schemaDialogType.value === 'update') {
      await updateSchema(schemaData)
      ElMessage.success('架构更新成功')
    } else {
      await importSchema(schemaData)
      ElMessage.success('架构导入成功')
    }

    schemaDialogVisible.value = false
    await loadTables()
    if (currentTable.value) {
      await handleTableChange()
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON格式错误，请检查输入')
    } else {
      console.error('Failed to submit schema:', error)
      ElMessage.error(schemaDialogType.value === 'update' ? '更新架构失败' : '导入架构失败')
    }
  } finally {
    schemaSubmitting.value = false
  }
}

// 修改表单项组件，为可空字段添加 clearable 属性
const getFormItemComponent = (column: any) => {
  const props: any = {
    modelValue: form[column.name],
    'onUpdate:modelValue': (val: any) => (form[column.name] = val),
    style: 'width: 100%',
    clearable: column.isNullable // 保持可空字段的 clearable 属性
  }

  if (column.dbType.includes('datetime')) {
    return h(ElDatePicker, {
      ...props,
      type: 'datetime',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    })
  }

  if (column.dbType.includes('decimal') || column.dbType.includes('int')) {
    return h(ElInputNumber, {
      ...props,
      precision: column.dbType.includes('decimal') ? 2 : 0
    })
  }

  return h(ElInput, props)
}

// 加载表列表
const loadTables = async (keyword?: string) => {
  tableLoading.value = true
  try {
    const res = await getTables(keyword)
    tables.value = res.data.items
  } catch (error) {
    console.error('Failed to load tables:', error)
    ElMessage.error('加载表列表失败')
  } finally {
    tableLoading.value = false
  }
}

const columnManagerVisible = ref(false)

const handleManageColumns = () => {
  columnManagerVisible.value = true
}

const handleColumnsSaved = () => {
  // 重新加载表格数据和列配置
  loadTableSchema()
  loadTableData()
}

// 添加显示列状态
const displayColumns = ref<any[]>([])

// 监听表格列变化
watch(
  () => columns.value,
  async (newColumns) => {
    if (newColumns.length && currentTable.value) {
      // 如果没有本地存储，获取后端配置
      try {
        const res = await getTableColumns(currentTable.value)
        displayColumns.value = res.data.columns
        const storedColumns = getTableColumnsFromStorage(currentTable.value) || []
        displayColumns.value = displayColumns.value.map((col) => {
          const storedColumn = storedColumns.find((sc) => sc.columnName === col.columnName)
          return storedColumn || col
        })
      } catch (error) {
        console.error('Failed to load column config:', error)
        // 如果获取配置失败，使用默认配置
        displayColumns.value = newColumns.map((col) => ({
          columnName: col.name,
          displayName: col.name,
          isVisible: true,
          isSortable: false,
          orderIndex: 0,
          description: col.comment,
          dbType: col.dbType
        }))
      }
    } else {
      displayColumns.value = []
    }
  },
  { immediate: true }
)

// 监听列配置变化，保存到本地存储
watch(
  () => displayColumns.value,
  (newColumns) => {
    if (currentTable.value && newColumns.length) {
      saveTableColumnsToStorage(currentTable.value, newColumns)
    }
  },
  { deep: true }
)

// 计算排序后的显示列
const sortedDisplayColumns = computed(() => {
  return [...displayColumns.value].sort((a, b) => a.orderIndex - b.orderIndex)
})

// 添加展开/收起状态
const isCollapsed = ref(true)

const exporting = ref(false)

const handleExport = async () => {
  if (!currentTable.value) return

  exporting.value = true
  try {
    const response = await exportDynamicData(
      currentTable.value,
      {
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        ...searchForm
      },
      sortState.value || [],
      displayColumns.value
    )

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${currentTable.value}_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  if (currentTable.value) {
    handleTableChange()
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
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 16px;

    &-content {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      transition: max-height 0.3s ease-in-out;
      overflow: hidden;

      &.is-collapsed {
        max-height: 52px; // 一行的高度
      }

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 0;
        flex: 0 0 auto;

        &.hidden-item {
          display: none;
        }
      }
    }

    &-buttons {
      display: flex;
      align-items: center;
      margin-top: 16px;

      .expand-button {
        margin-left: 8px;
        padding: 0;

        .expand-icon {
          margin-left: 4px;
          transition: transform 0.3s;

          &.is-collapsed {
            transform: rotate(180deg);
          }
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .form-item-tip {
    display: block;
    margin-top: 4px;
    line-height: 1.2;
  }

  .table-toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

// 添加 JSON 编辑器相关样式
:deep(.jsoneditor-vue) {
  height: 100%;

  .jsoneditor {
    border: 1px solid var(--el-border-color);

    .jsoneditor-menu {
      background-color: var(--el-color-primary);
      border-bottom: 1px solid var(--el-border-color);
    }
  }
}
</style>
