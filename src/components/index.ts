import type { App } from 'vue'
import { Icon } from './Icon'
import { Permission } from './Permission'
import { BaseButton } from './Button'
import { ElMessage } from 'element-plus'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import { ExtraPropertiesDto } from '@/services/Models'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import hostData from '@/host-data'

function showMsg(message: any, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  let msg
  if (typeof message === 'string') {
    msg = message
  } else if (message instanceof Error) {
    type = 'error'
    msg = message.message
  } else {
    type = 'error'
    msg = message.message || message.errorMessage || '出错了。'
  }
  if (msg === 'cancel') {
    ElMessage('已取消。')
  } else {
    ElMessage({
      type: type,
      message: msg
    })
  }
}
export const setupGlobCom = (
  app: App<Element>,
  options: ExtraPropertiesDto | null = null
): void => {
  app.component('Icon', Icon)
  app.component('Permission', Permission)
  app.component('BaseButton', BaseButton)

  app.component('Splitpanes', Splitpanes)
  app.component('Pane', Pane)

  app.config.globalProperties.$showMsg = showMsg

  const enviroment = import.meta.env.MODE
  if (hostData.baseUrl && enviroment === 'base') {
    const appStore = useAppStore()
    appStore.setDynamicRouter(false)
    appStore.setServerDynamicRouter(false)
    // 自动登录
    const userStore = useUserStore()
    userStore.setUserInfo({
      id: '4zg63w2tyyfcxw4aknh5aeq85y',
      userName: 'admin',
      name: '管理员'
    } as any)

    if (hostData.token) {
      userStore.setToken(hostData.token)
    }
    app.config.globalProperties.autoLogin = true
  }
}
