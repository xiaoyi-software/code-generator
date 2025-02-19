// 用于兼容历史项目
import { App } from 'vue'
import { Vue } from 'vue-property-decorator'
import vue3Cron from '../components/vue3-cron/index.vue'
class AppInit {
  constructor(
    private app: App,
    private options: any
  ) {
    //
  }

  // 全局提供者
  provide() {
    // hostData注入
    this.options.hostData = this.options.hostData || {}
    this.app.provide('hostData', this.options.hostData)
  }

  // 全局混入
  mixin() {
    //
  }

  // 全局组件
  component() {
    //
    this.app.component('vue3Cron', vue3Cron)
  }

  // methods

  static install = (app: App, options: any = {}) => {
    // 在TS类型中使用路由回调
    Vue.registerHooks(['beforeRouteEnter', 'beforeRouteUpdate', 'beforeRouteLeave'])

    const appInit = new AppInit(app, options)
    appInit.provide()
    appInit.mixin()
    appInit.component()
  }
}

export default AppInit
