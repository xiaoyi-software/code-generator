import { defineStore } from 'pinia'
import { store } from '../index'
import { CodeValue, UserInfo, UserLoginType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { logoutApi } from '@/api/login'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import mesBaseService from '@/services/MESBaseService'
import mesEquipmentService from '@/services/MESEquipmentService'

interface UserState {
  userInfo?: UserInfo
  entUser?: any
  // tokenKey: string
  token: string
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  workSpace?: CodeValue
  equipment?: CodeValue
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      entUser: undefined,
      // tokenKey: 'Authorization',
      token: '',
      roleRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined,
      workSpace: undefined,
      equipment: undefined
    }
  },
  getters: {
    // getTokenKey(): string {
    //   return this.tokenKey
    // },
    getToken(): string {
      return this.token
    },
    getUserInfo(): UserInfo | undefined {
      return this.userInfo
    },
    getEntUser(): any {
      return this.entUser
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getWorkSpace(): CodeValue | undefined {
      return this.workSpace
    },
    getEquipment(): CodeValue | undefined {
      return this.equipment
    }
  },
  actions: {
    // setTokenKey(tokenKey: string) {
    //   this.tokenKey = tokenKey
    // },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo?: UserInfo) {
      this.userInfo = userInfo
    },
    setEntUser(entUser: any) {
      this.entUser = entUser
    },
    setRoleRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.roleRouters = roleRouters
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          const res = await logoutApi().catch(() => {})
          if (res) {
            this.reset()
            router.replace('/login')
          }
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      this.setUserInfo(undefined)
      this.setEntUser(undefined)
      this.setRoleRouters([])
    },
    logout() {
      this.reset()
      router.replace('/login')
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    },
    setWorkSpace(workSpace: CodeValue | undefined) {
      this.workSpace = workSpace
    },
    setEquipment(equipment: CodeValue | undefined) {
      this.equipment = equipment
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
