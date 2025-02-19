import { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/routerHelper'

const systemRoutes: AppRouteRecordRaw = {
  path: '/system',
  name: 'System',
  component: Layout,
  meta: {
    title: '系统管理',
    icon: 'mdi-cog',
    order: 100
  },
  children: [
    {
      path: 'users',
      name: 'Users',
      component: () => import('@/views/system/users/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'mdi-account-multiple'
      }
    },
    {
      path: 'roles',
      name: 'Roles',
      component: () => import('@/views/system/roles/index.vue'),
      meta: {
        title: '角色管理',
        icon: 'mdi-shield-account'
      }
    }
  ]
}

export default systemRoutes
