import { getRoleRoutes } from '@/utils/account'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import { RouteRecordRaw, useRouter } from 'vue-router'
import { UserInfo } from '@/api/login/types'

const useLoginRedirect = () => {
  const appStore = useAppStore()
  const permissionStore = usePermissionStore()
  const { currentRoute, addRoute, push } = useRouter()

  const loginRedirect = async (user: UserInfo, redirectPath: string): Promise<any> => {
    if (appStore.getDynamicRouter) {
      await getRoleRoutes(user, (route) => {
        addRoute(route)
      })
      if (permissionStore.isAddRouters) {
        push({ path: redirectPath || permissionStore.addRouters[0].path })
      }
    } else {
      await permissionStore.generateRoutes('static').catch(() => {
        //
      })
      permissionStore.getAddRouters.forEach((route) => {
        addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
      })
      permissionStore.setIsAddRouters(true)
      push({ path: redirectPath || permissionStore.addRouters[0].path })
    }
  }

  return { loginRedirect }
}

export { useLoginRedirect, LoginForm, RegisterForm }
