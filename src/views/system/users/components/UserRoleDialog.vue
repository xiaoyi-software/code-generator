<template>
  <el-dialog title="角色授权" v-model="dialogVisible" width="500px" destroy-on-close>
    <el-form>
      <el-form-item label="用户">
        <span>{{ userData?.userName }} ({{ userData?.name }})</span>
      </el-form-item>

      <el-form-item label="角色">
        <el-checkbox-group v-model="selectedRoles">
          <el-checkbox v-for="role in roles" :key="role.id" :label="role.name" border>
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoleList } from '@/api/system/role'
import { updateUser } from '@/api/system/user'
import type { UserInfo, RoleInfo } from '@/api/system/types'

const props = defineProps<{
  modelValue: boolean
  userData: UserInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const roles = ref<RoleInfo[]>([])
const selectedRoles = ref<string[]>([])

const loadRoles = async () => {
  try {
    const res = await getRoleList()
    roles.value = res.data.items
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
}

const handleSubmit = async () => {
  if (!props.userData) return

  loading.value = true
  try {
    await updateUser(props.userData.id, {
      name: props.userData.name,
      nickName: props.userData.nickName || '',
      email: props.userData.email || '',
      isEnabled: props.userData.isEnabled,
      roles: selectedRoles.value,
      userName: props.userData.userName,
      avatar: props.userData.avatar,
      password: ''
    })
    ElMessage.success('角色授权成功')
    emit('success')
  } catch (error) {
    ElMessage.error('角色授权失败')
  }
  loading.value = false
}

watch(
  () => props.userData,
  (newVal) => {
    if (newVal) {
      selectedRoles.value = newVal.roles
    }
  },
  { immediate: true }
)

loadRoles()
</script>

<style scoped>
.el-checkbox {
  margin-right: 15px;
  margin-bottom: 15px;
}
</style>
