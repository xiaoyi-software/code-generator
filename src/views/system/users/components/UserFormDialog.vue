<template>
  <el-dialog
    :title="isEdit ? '编辑用户' : '新建用户'"
    v-model="dialogVisible"
    width="550px"
    destroy-on-close
  >
    <Form as="el-form" label-width="120" @submit="onSubmit" :initial-values="formData">
      <Field
        name="userName"
        :rules="isEdit ? undefined : 'required|min:3'"
        v-slot="{ field, errorMessage }"
      >
        <el-form-item label="用户名" :error="errorMessage">
          <el-input
            :model-value="field.value"
            :disabled="isEdit"
            placeholder="请输入用户名"
            v-bind="field"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </Field>

      <Field name="name" rules="required" v-slot="{ field, errorMessage }">
        <el-form-item label="姓名" :error="errorMessage">
          <el-input :model-value="field.value" placeholder="请输入姓名" v-bind="field" />
        </el-form-item>
      </Field>

      <Field name="nickName" v-slot="{ field, errorMessage }">
        <el-form-item label="昵称" :error="errorMessage">
          <el-input :model-value="field.value" placeholder="请输入昵称" v-bind="field" />
        </el-form-item>
      </Field>

      <Field name="email" rules="required|email" v-slot="{ field, errorMessage }">
        <el-form-item label="邮箱" :error="errorMessage">
          <el-input :model-value="field.value" placeholder="请输入邮箱" v-bind="field">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </Field>

      <Field
        name="password"
        :rules="isEdit ? undefined : 'required|min:6'"
        v-slot="{ field, errorMessage }"
      >
        <el-form-item label="密码" :error="errorMessage">
          <el-input
            :model-value="field.value"
            type="password"
            :placeholder="isEdit ? '不填写则不修改密码' : '请输入密码'"
            show-password
            v-bind="field"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </Field>

      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleAvatarChange"
        >
          <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="状态">
        <el-switch v-model="formData.isEnabled" active-text="启用" inactive-text="禁用" />
      </el-form-item>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" native-type="submit">确定</el-button>
      </div>
    </Form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Message, Lock, Plus } from '@element-plus/icons-vue'
import { Form, Field } from 'vee-validate'
import { createUser, updateUser } from '@/api/system/user'
import type { UserInfo } from '@/api/system/types'
import type { UploadFile } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  editData: UserInfo | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.editData)
const loading = ref(false)
const formData = ref({
  userName: '',
  name: '',
  nickName: '',
  email: '',
  password: '',
  avatar: '',
  isEnabled: true,
  roles: [] as string[]
})

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    if (isEdit.value && props.editData) {
      await updateUser(props.editData.id, {
        email: values.email,
        userName: '',
        name: values.name,
        nickName: values.nickName,
        avatar: formData.value.avatar,
        isEnabled: formData.value.isEnabled,
        roles: formData.value.roles,
        password: values.password || undefined
      })
    } else {
      await createUser({
        email: values.email,
        userName: values.userName,
        name: values.name,
        nickName: values.nickName,
        avatar: formData.value.avatar,
        isEnabled: values.isEnabled,
        roles: formData.value.roles,
        password: values.password
      })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    emit('success')
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  }
  loading.value = false
}

const handleAvatarChange = (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target?.result as string
  }
  reader.readAsDataURL(uploadFile.raw)
}

watch(
  () => props.editData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        userName: newVal.userName,
        name: newVal.name,
        nickName: newVal.nickName || '',
        email: newVal.email || '',
        password: '',
        avatar: newVal.avatar || '',
        isEnabled: newVal.isEnabled,
        roles: newVal.roles
      }
    } else {
      formData.value = {
        userName: '',
        name: '',
        nickName: '',
        email: '',
        password: '',
        avatar: '',
        isEnabled: true,
        roles: []
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.dialog-footer {
  margin-top: 20px;
  text-align: right;
}

.error-message {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 12px;
  color: var(--el-color-danger);
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  line-height: 100px;
}
</style>
