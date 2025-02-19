<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>新建用户
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="mb-4">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nickName" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.isEnabled"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option :value="true" label="启用" />
            <el-option :value="false" label="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.roles"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择角色"
            clearable
            style="width: 200px"
          >
            <el-option v-for="role in roles" :key="role.id" :value="role.name" :label="role.name" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="users"
        border
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="userName" label="用户名" sortable="custom" />
        <el-table-column prop="name" label="姓名" sortable="custom" />
        <el-table-column prop="nickName" label="昵称" sortable="custom" />
        <el-table-column prop="email" label="邮箱" sortable="custom" />
        <el-table-column prop="isEnabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" class="mr-1" size="small">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="primary" link @click="openRoleDialog(row)">
              <el-icon><Key /></el-icon>授权
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

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.pageIndex"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <user-form-dialog v-model="showDialog" :edit-data="editData" @success="handleSuccess" />

    <!-- 角色授权对话框 -->
    <user-role-dialog v-model="showRoleDialog" :user-data="editData" @success="handleSuccess" />

    <!-- Claims 对话框 -->
    <claims-dialog
      v-model="showClaimsDialog"
      title="用户"
      :claims="currentClaims"
      :on-submit="handleClaimsSubmit"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Key, Setting } from '@element-plus/icons-vue'
import { getUserList, deleteUser, getUserClaims, updateUserClaims } from '@/api/system/user'
import { getRoleList } from '@/api/system/role'
import type { UserInfo } from '@/api/system/types'
import type { RoleInfo } from '@/api/system/types'
import UserFormDialog from './components/UserFormDialog.vue'
import UserRoleDialog from './components/UserRoleDialog.vue'
import ClaimsDialog from '../components/ClaimsDialog.vue'

interface SearchForm {
  pageIndex: number
  pageSize: number
  userName: string
  name: string
  email: string
  nickName: string
  isEnabled: boolean | undefined
  roles: string[] | undefined
  'sorts[0].field'?: string | undefined
  'sorts[0].order'?: string | undefined
}

const users = ref<UserInfo[]>([])
const loading = ref(false)
const total = ref(0)
const showDialog = ref(false)
const showRoleDialog = ref(false)
const showClaimsDialog = ref(false)
const editData = ref<UserInfo | null>(null)
const currentClaims = ref<{ type: string; value: string }[]>([])
const roles = ref<RoleInfo[]>([])

const searchForm = ref<SearchForm>({
  pageIndex: 1,
  pageSize: 10,
  userName: '',
  name: '',
  email: '',
  nickName: '',
  isEnabled: undefined,
  roles: [],
  'sorts[0].field': undefined,
  'sorts[0].order': undefined
})

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      pageIndex: searchForm.value.pageIndex,
      pageSize: searchForm.value.pageSize,
      userName: searchForm.value.userName || undefined,
      name: searchForm.value.name || undefined,
      email: searchForm.value.email || undefined,
      nickName: searchForm.value.nickName || undefined,
      isEnabled: searchForm.value.isEnabled
    }

    if (searchForm.value.roles?.length) {
      params['roles'] = searchForm.value.roles
    }

    if (searchForm.value['sorts[0].field'] && searchForm.value['sorts[0].order']) {
      params['sorts[0].field'] = searchForm.value['sorts[0].field']
      params['sorts[0].order'] = searchForm.value['sorts[0].order']
    }

    const res = await getUserList(params)
    users.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  }
  loading.value = false
}

const loadRoles = async () => {
  try {
    const res = await getRoleList()
    if (res.data.items) {
      roles.value = res.data.items
    } else {
      console.error('Role data format error:', res.data)
      ElMessage.error('角色数据格式错误')
    }
  } catch (error) {
    console.error('Failed to load roles:', error)
    ElMessage.error('加载角色列表失败')
  }
}

const handleSearch = () => {
  searchForm.value.pageIndex = 1
  loadUsers()
}

const handleReset = () => {
  searchForm.value = {
    pageIndex: 1,
    pageSize: 10,
    userName: '',
    name: '',
    email: '',
    nickName: '',
    isEnabled: undefined,
    roles: [],
    'sorts[0].field': undefined,
    'sorts[0].order': undefined
  }
  loadUsers()
}

const handleSortChange = ({ prop, order }) => {
  const fieldMap: Record<string, string> = {
    userName: 'userName',
    name: 'name',
    email: 'email',
    nickName: 'nickName'
  }

  if (!prop || !order) {
    searchForm.value['sorts[0].field'] = undefined
    searchForm.value['sorts[0].order'] = undefined
  } else {
    const sort = {
      'sorts[0].field': fieldMap[prop] || prop,
      'sorts[0].order': order === 'descending' ? 'desc' : 'asc'
    }

    searchForm.value = {
      ...searchForm.value,
      ...sort
    }
  }
  loadUsers()
}

const handleSizeChange = (val: number) => {
  searchForm.value.pageSize = val
  loadUsers()
}

const handleCurrentChange = (val: number) => {
  searchForm.value.pageIndex = val
  loadUsers()
}

const openCreateDialog = () => {
  editData.value = null
  showDialog.value = true
}

const openEditDialog = (user: UserInfo) => {
  editData.value = user
  showDialog.value = true
}

const openRoleDialog = (user: UserInfo) => {
  editData.value = user
  showRoleDialog.value = true
}

const openClaimsDialog = async (user: UserInfo) => {
  editData.value = user
  showClaimsDialog.value = true
  try {
    const res = await getUserClaims(user.id)
    currentClaims.value = res.data.claims
  } catch (error) {
    ElMessage.error('加载 Claims 失败')
  }
}

const confirmDelete = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.userName}" 吗？`, '提示', {
      type: 'warning'
    })
    await deleteUser(user.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleClaimsSubmit = async (claims: { type: string; value: string }[]) => {
  if (!editData.value) return
  await updateUserClaims(editData.value.id, claims)
}

const handleSuccess = () => {
  loadUsers()
  showDialog.value = false
  showRoleDialog.value = false
  showClaimsDialog.value = false
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mr-1 {
  margin-right: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
