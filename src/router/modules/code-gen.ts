import { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/routerHelper'

const codeGenRouter: AppRouteRecordRaw = {
  path: '/code-gen',
  component: Layout,
  redirect: '/code-gen/code-project',
  name: 'CodeGen',
  meta: {
    title: '代码生成',
    icon: 'ep:cpu',
    order: 1
  },
  children: [
    {
      path: 'code-project',
      component: () => import('@/views/code-gen/project/index.vue'),
      name: 'CodeProject',
      meta: {
        title: '项目管理'
      }
    },
    {
      path: 'code-entity',
      component: () => import('@/views/code-gen/entity/index.vue'),
      name: 'CodeEntity',
      meta: {
        title: '实体管理'
      }
    },
    {
      path: 'code-template',
      component: () => import('@/views/code-gen/template/index.vue'),
      name: 'CodeTemplate',
      meta: {
        title: '模板管理'
      }
    },
    {
      path: 'code-generate',
      component: () => import('@/views/code-gen/generate/index.vue'),
      name: 'CodeGenerate',
      meta: {
        title: '生成记录'
      }
    },
    {
      path: 'schema',
      component: () => import('@/views/code-gen/schema/index.vue'),
      name: 'Schema',
      meta: {
        title: 'Schema导出'
      }
    },
    {
      path: 'generate-code',
      component: () => import('@/views/code-gen/generate-code/index.vue'),
      name: 'GenerateCode',
      meta: {
        title: '代码生成'
      }
    },
    {
      path: 'dynamic-data',
      component: () => import('@/views/code-gen/dynamic-data/index.vue'),
      name: 'DynamicData',
      meta: {
        title: '动态数据管理'
      }
    }
  ]
}

export default codeGenRouter
