import { getAdminRoleApi, getTestRoleApi } from '@/api/login'
import { UserInfo } from '@/api/login/types'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { RouteRecordRaw, useRouter } from 'vue-router'

export const getRoleRoutes = async (userInfo: UserInfo, addRoute: (route) => void) => {
  const appStore = useAppStore()
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()

  try {
    // 获取用户菜单参数
    const params = {
      userId: userInfo.id,
      workSpaceId: '',
      clientType: '',
      // 获取用户菜单
      // TODO本地配置
      permissionRule: 0
    }

    permissionStore.setIsAddRouters(false)
    const res =
      appStore.getDynamicRouter && appStore.getServerDynamicRouter
        ? await getAdminRoleApi(params)
        : await getTestRoleApi(params)

    if (res && res.status === 0) {
      const routers = res.data.items || []
      if (routers.length == 0) throw Error('未配置权限菜单。')
      userStore.setRoleRouters(routers)
      appStore.getDynamicRouter && appStore.getServerDynamicRouter
        ? await permissionStore.generateRoutes('server', routers).catch(() => {
            //
          })
        : await permissionStore.generateRoutes('frontEnd', routers).catch(() => {
            //
          })

      permissionStore.getAddRouters.forEach((route) => {
        addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
      })
      permissionStore.setIsAddRouters(true)
    }
  } catch {
    console.log('获取用户菜单错误。')
  }
}
