import { getUser, restoreToken } from '@/api/login'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  watch
} from 'vue'
import enterpriseUserService from '@/services/EnterpriseUserService'
import { RouteLocationNormalizedLoaded, RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { getRoleRoutes } from '@/utils/account'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import { useLoginRedirect } from './index'

const enviroment = import.meta.env.MODE
export default defineComponent({
  async setup(props, { slots }) {
    const { proxy, appContext } = getCurrentInstance() as ComponentInternalInstance
    try {
      const appStore = useAppStore()
      const permissionStore = usePermissionStore()
      const { currentRoute, addRoute, push } = useRouter()
      const { loginRedirect } = useLoginRedirect()

      const redirect = ref<string>('')

      watch(
        () => currentRoute.value,
        (route: RouteLocationNormalizedLoaded) => {
          redirect.value = route?.query?.redirect as string
        },
        {
          immediate: true
        }
      )

      const userStore = useUserStore()
      const loadEnterpriseUser = async () => {
        const data = await enterpriseUserService.getUser()
        if (data) {
          userStore.setEntUser(data.dto)
        } else {
          userStore.setEntUser(undefined)
        }
        return userStore.entUser
      }

      // 企业用户信息变更
      provide<() => Promise<void>>('loadEnterpriseUser', async () => {
        try {
          const entUser = await loadEnterpriseUser()
          if (entUser) {
            await enterpriseUserService.updateUser(entUser)
          }
        } catch (error) {
          console.log(error)
        }
      })

      userStore.$subscribe(async (mutation, state) => {
        try {
          if (state.userInfo && !state.entUser) {
            await loadEnterpriseUser()
          }
        } catch (error: any) {
          console.log(error)
        }
      })

      if (enviroment === 'base' && !userStore.getUserInfo && userStore.token) {
        // 测试模式，TODO验证token有效期
        const userData = await getUser()
        userStore.setUserInfo(userData.data.dto)
        loginRedirect(userData.data.dto, redirect.value)
      } else if (enviroment !== 'base' && !userStore.getUserInfo) {
        // 发布模式
        console.log(`${enviroment} mode`)
        const res = await restoreToken()
        if (res.data.token) {
          userStore.setToken(res.data.token)
          const userData = await getUser()
          userStore.setUserInfo(userData.data.dto)

          loginRedirect(userData.data.dto, redirect.value)
          // if (appStore.getDynamicRouter) {
          //   await getRoleRoutes(userData.data.dto, (route) => {
          //     addRoute(route)
          //   })
          //   if (permissionStore.isAddRouters) {
          //     push({ path: redirect.value || permissionStore.addRouters[0].path })
          //   }
          // } else {
          //   await permissionStore.generateRoutes('static').catch(() => {
          //     //
          //   })
          //   permissionStore.getAddRouters.forEach((route) => {
          //     addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
          //   })
          //   permissionStore.setIsAddRouters(true)
          //   push({ path: redirect.value || permissionStore.addRouters[0].path })
          // }
        }
      }
    } catch (error: any) {
      ElMessage.error({
        message: error.message
      })
    }
    return () => <>{slots.default && slots.default()}</>
  }
})
