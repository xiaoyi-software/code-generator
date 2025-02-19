import useAppStore from '@/store/AppStore'
import { DataServiceRequest } from './DataServiceRequest'

class SystemService extends DataServiceRequest {
  /**
   * 获取组织机构层级数据
   */
  organizationNodes(searchDto: NodeSearchDto) {
    const path = '/api/Organization/search'
    return this.request(`${path}`, {}, 'post')
  }

  /**
   *
   * @param searchDto 搜索地区参数，一次只能搜索一层
   * @returns
   */
  areaNodes(searchDto: NodeSearchDto) {
    const path = '/api/Area/search'
    return this.request(`${path}`, {}, 'post')
  }

  /**
   * 获取系统中启用的模块
   */
  getFeatures() {
    return this.request(`/api/system/features`, {}, 'get')
  }

  /**
   * 获取企业相关权限信息
   */
  getPermissions() {
    return this.request(`/api/system/permissions`, {}, 'get')
  }

  /**
   * 获取系统身份列表
   * @returns
   */
  getIdentities() {
    return this.request(`/api/system/identities`, {}, 'get')
  }

  // 如果缓存存在，则从缓存提取特性集合
  async ensureLoadFeatures(): Promise<string[]> {
    const store = useAppStore('app')
    const features: string[] = []
    try {
      const props = store.state.extraProperties || {}
      if (!props.features) {
        const data = await this.getFeatures()
        features.push(...data.items)
        store.action.updateExtraValue({ features: features })
      } else {
        features.push(props.features)
      }
    } catch (error) {
      console.log(error)
    }
    return features
  }

  async ensureLoadPermissions(): Promise<string[]> {
    const store = useAppStore('app')
    const permissions: string[] = []
    try {
      const props = store.state.extraProperties || {}
      if (!props.permissions) {
        const data = await this.getPermissions()
        permissions.push(...data.items)
        store.action.updateExtraValue({ permissions: permissions })
      } else {
        permissions.push(props.permissions)
      }
    } catch (error) {
      console.log(error)
    }
    return permissions
  }

  async ensureLoadIdentities(): Promise<string[]> {
    const store = useAppStore('app')
    const identities: string[] = []
    try {
      const props = store.state.extraProperties || {}
      if (!props.identities) {
        const data = await this.getIdentities()
        identities.push(...data.items)
        store.action.updateExtraValue(Object.assign({}, props, { identities }))
      } else {
        identities.push(props.identities)
      }
    } catch (error) {
      console.log(error)
    }
    return identities
  }
}

export interface NodeSearchDto {
  parentId?: number
  level: number

  items: number[]
}

const systemService = new SystemService()
export default systemService
