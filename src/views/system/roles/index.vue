<template>
  <div class="roles-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>新建角色
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="roles" border style="width: 100%">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="isEnabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="primary" link @click="openClaimsDialog(row)">
              <el-icon><Setting /></el-icon>Claims
            </el-button>
            <el-button type="danger" link @click="confirmDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <role-form-dialog v-model="showDialog" :edit-data="editData" @success="handleSuccess" />

    <!-- Claims管理对话框 -->
    <claims-dialog
      v-model="showClaimsDialog"
      title="角色"
      :claims="currentClaims"
      :on-submit="handleClaimsSubmit"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
import { getRoleList, deleteRole, getRoleClaims, updateRoleClaims } from '@/api/system/role'
import type { RoleInfo } from '@/api/system/types'
import RoleFormDialog from './components/RoleFormDialog.vue'
import ClaimsDialog from '../components/ClaimsDialog.vue'

const roles = ref<RoleInfo[]>([])
const loading = ref(false)
const showDialog = ref(false)
const showClaimsDialog = ref(false)
const editData = ref<RoleInfo | null>(null)
const currentClaims = ref<{ type: string; value: string }[]>([])
const total = ref(0)

const loadRoles = async () => {
  loading.value = true
  try {
    const res = await getRoleList()
    roles.value = res.data.items
    total.value = roles.value.length
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
  loading.value = false
}

const openCreateDialog = () => {
  editData.value = null
  showDialog.value = true
}

const openEditDialog = (role: RoleInfo) => {
  editData.value = role
  showDialog.value = true
}

const openClaimsDialog = async (role: RoleInfo) => {
  editData.value = role
  showClaimsDialog.value = true
  try {
    const res = await getRoleClaims(role.id)
    currentClaims.value = res.data.claims
  } catch (error) {
    ElMessage.error('加载 Claims 失败')
  }
}

const handleClaimsSubmit = async (claims: { type: string; value: string }[]) => {
  if (!editData.value) return
  await updateRoleClaims(editData.value.id, claims)
}

const confirmDelete = async (role: RoleInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '提示', {
      type: 'warning'
    })
    await deleteRole(role.id)
    ElMessage.success('删除成功')
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSuccess = () => {
  loadRoles()
  showDialog.value = false
  showClaimsDialog.value = false
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
