// GlobalComponents for Volar
export {}
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'

declare module 'vue' {
  interface ComponentCustomProperties {
    $showMsg(message: any, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void
    $router: Router
    $route: RouteLocationNormalizedLoaded
  }
}
