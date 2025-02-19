import { DataServiceRequest } from './DataServiceRequest'
import { ExtraPropertiesDto } from './Models'

class EnterpriseUserService extends DataServiceRequest {
  /**
   * 获取企业用户扩展信息
   */
  getUser(): Promise<any> {
    return this.request(`/api/entUser/user`, {}, 'get')
  }

  getUsers(): Promise<any> {
    return this.request(`/api/entUser/users`, {}, 'get')
  }

  /**
   * 更新企业用户扩展信息
   * @param data 企业用户扩展信息（存储绑定信息）
   */
  updateUser(data: UpdateEnterpriseUserDto): Promise<any> {
    return this.request(`/api/entUser/user`, data, 'post')
  }

  /**
   *
   * @param code 设置用户默认企业
   */
  setDefault(code: string): Promise<any> {
    return this.request(`/api/entUser/set-default/${code}`, {}, 'post')
  }

  search(searchDto: UserPagedSearchDto): Promise<any> {
    return this.request(`/api/entUser/search`, searchDto, 'post')
  }
}

export interface UserPagedSearchDto {
  pageIndex: number
  pageSize: number
  name: string
  items: string[]
}

export interface UpdateEnterpriseUserDto {
  name: string

  extraProperties?: ExtraPropertiesDto
}

const service = new EnterpriseUserService()
export default service
