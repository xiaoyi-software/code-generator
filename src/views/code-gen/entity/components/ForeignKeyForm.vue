<template>
  <el-dialog
    :title="props.foreignKey?.id ? '编辑外键' : '新增外键'"
    v-model="visible"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      style="max-height: 60vh; overflow-y: auto"
    >
      <el-form-item label="外键名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入外键名称" />
      </el-form-item>

      <el-form-item label="关联表" prop="principalTable">
        <el-select
          v-model="form.principalTable"
          placeholder="请选择关联表"
          style="width: 100%"
          @change="handlePrincipalTableChange"
        >
          <el-option
            v-for="entity in entities"
            :key="entity.tableName"
            :label="entity.tableName"
            :value="entity.tableName"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="关联列" prop="keyColumns">
        <el-table :data="form.keyColumns" style="width: 100%">
          <el-table-column label="当前实体列" prop="propertyName" min-width="200">
            <template #default="{ row }">
              <el-select v-model="row.propertyName" style="width: 100%">
                <el-option
                  v-for="column in entityColumns"
                  :key="column.name"
                  :label="column.name"
                  :value="column.name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="关联表列" prop="principalName" min-width="200">
            <template #default="{ row }">
              <el-select v-model="row.principalName" style="width: 100%">
                <el-option
                  v-for="column in principalEntityColumns"
                  :key="column.name"
                  :label="column.name"
                  :value="column.name"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="80" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeColumn($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="column-actions">
          <el-button type="primary" link @click="addColumn">添加列映射</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getEntities } from '@/api/code-gen/entity'
import { getColumns } from '@/api/code-gen/column'
import { createForeignKey, updateForeignKey } from '@/api/code-gen/foreignKey'
import type { CodeEntityForeignKey, CodeEntity, CodeEntityColumn } from '@/api/code-gen/types'

const props = defineProps<{
  visible: boolean
  foreignKey?: Partial<CodeEntityForeignKey>
  entityId?: number
  projectId?: number
}>()

const emit = defineEmits(['update:visible', 'success'])

const visible = ref(props.visible)
const loading = ref(false)
const formRef = ref<FormInstance>()
const entities = ref<CodeEntity[]>([])
const entityColumns = ref<CodeEntityColumn[]>([])
const principalEntityColumns = ref<CodeEntityColumn[]>([])

// 定义列映射的接口
interface KeyColumnMapping {
  propertyName: string // 当前实体列名
  principalName: string // 关联表列名
}

// 表单数据结构修改
const form = ref<{
  id?: number
  name: string
  entityId?: number
  principalTable: string
  keyColumns: KeyColumnMapping[] // 用于展示的合并列映射
}>({
  name: '',
  entityId: props.entityId,
  principalTable: '',
  keyColumns: []
})

// 表单校验规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入外键名称', trigger: 'blur' }],
  principalTable: [{ required: true, message: '请选择关联表', trigger: 'change' }],
  keyColumns: [{ required: true, message: '请添加列映射', trigger: 'change' }]
}

// 获取实体列表
const fetchEntities = async () => {
  try {
    const res = await getEntities({
      pageIndex: 1,
      pageSize: 100,
      projectId: props.projectId
    })
    entities.value = res.data.items.filter((item) => item.id !== props.entityId)
  } catch (error) {
    console.error('Failed to fetch entities:', error)
  }
}

// 获取当前实体的列
const fetchEntityColumns = async () => {
  if (!props.entityId) return
  try {
    const res = await getColumns(props.entityId)
    entityColumns.value = res.data.items
  } catch (error) {
    console.error('Failed to fetch entity columns:', error)
  }
}

// 获取关联实体的列
const fetchPrincipalEntityColumns = async (tableName: string) => {
  try {
    const principalEntity = entities.value.find((entity) => entity.tableName === tableName)
    if (principalEntity) {
      const res = await getColumns(principalEntity.id)
      principalEntityColumns.value = res.data.items
    }
  } catch (error) {
    console.error('Failed to fetch principal entity columns:', error)
  }
}

// 关联表变更
const handlePrincipalTableChange = async () => {
  form.value.keyColumns = []
  if (form.value.principalTable) {
    await fetchPrincipalEntityColumns(form.value.principalTable)
  } else {
    principalEntityColumns.value = []
  }
}

// 添加列映射
const addColumn = () => {
  form.value.keyColumns.push({
    propertyName: '',
    principalName: ''
  })
}

// 移除列映射
const removeColumn = (index: number) => {
  form.value.keyColumns.splice(index, 1)
}

// 监听visible变化
watch(
  () => props.visible,
  async (val) => {
    visible.value = val
    if (val) {
      await fetchEntities()
      await fetchEntityColumns()
      if (props.foreignKey?.id) {
        // 编辑模式，合并 properties 和 principalColumns
        const keyColumns = props.foreignKey.properties.map((prop, index) => ({
          propertyName: prop.name,
          principalName: props.foreignKey.principalColumns[index].name
        }))

        form.value = {
          id: props.foreignKey.id,
          name: props.foreignKey.name as string,
          entityId: props.foreignKey.entityId,
          principalTable: props.foreignKey.principalTable as string,
          keyColumns
        }

        // 加载关联实体的列
        if (props.foreignKey.principalTable) {
          await fetchPrincipalEntityColumns(props.foreignKey.principalTable)
        }
      } else {
        // 新增模式
        form.value = {
          name: '',
          entityId: props.entityId,
          principalTable: '',
          keyColumns: []
        }
        principalEntityColumns.value = []
      }
    }
  }
)

// 监听visible变化，同步到父组件
watch(
  () => visible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      // 转换回后端需要的数据结构
      const submitData = {
        ...form.value,
        properties: form.value.keyColumns.map((col) => ({
          name: col.propertyName,
          isPrincipalColumn: false
        })),
        principalColumns: form.value.keyColumns.map((col) => ({
          name: col.principalName,
          isPrincipalColumn: true
        }))
      }

      if (props.foreignKey?.id) {
        await updateForeignKey(props.foreignKey.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createForeignKey(submitData)
        ElMessage.success('创建成功')
      }
      visible.value = false
      emit('success')
    } catch (error) {
      console.error('Failed to save foreign key:', error)
      ElMessage.error('保存失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="less" scoped>
.column-actions {
  margin-top: 10px;
  text-align: right;
}
</style>
