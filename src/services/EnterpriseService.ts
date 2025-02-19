import { DataServiceRequest } from './DataServiceRequest'

class EnterpriseService extends DataServiceRequest {
  /**
   * 获取用户当前企业
   */
  getEnterprise(): Promise<any> {
    return this.request(`/api/ent/enterprise`, {}, 'get')
  }

  updateEnterprise(data: any): Promise<any> {
    return this.request(`/api/ent/enterprise`, data, 'post')
  }

  /**
   * 通过验证码加入企业
   * @param data
   */
  join(data: JoinEnterpriseDto) {
    return this.request(`/api/ent/join`, data, 'post')
  }
}

export enum EnterpriseJoinType {
  CheckCode,
  Approval
}

export interface JoinEnterpriseDto {
  enterpriseCode: string
  checkCode: string
}

export interface UpdateEnterpriseDto {
  code: string
  name: string
  areaId?: number
  typeId: string
  checkCode: string
  joinType: EnterpriseJoinType
  description: string
}

const service = new EnterpriseService()
export default service
