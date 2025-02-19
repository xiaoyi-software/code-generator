/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  Vue: any;
  DynamicForm: any;
  DynamicView: any;
}
