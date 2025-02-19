import { DataServiceRequest, Query } from './DataServiceRequest'
import { PagedSelectOption } from './Models'

class MESEquipmentService extends DataServiceRequest {
  get Url() {
    return ''
  }

  // 获取用户设备列表
  async getUserEquipment(query: Query): Promise<any> {
    return this.request(`/api/Equipment/user-equipment`, query, 'get')
  }

  // 更新用户设备
  async updateUserEquipment(model: any): Promise<any> {
    return this.request(`/api/Equipment/user-equipment`, model, 'post')
  }

  // 删除用户设备
  async deleteUserEquipment(id: string): Promise<any> {
    return this.request(`/api/Equipment/user-equipment/${id}`, {}, 'delete')
  }

  getEquipmentItems(equipments: string[]): Promise<any> {
    const path = '/api/Equipment/items'
    return this.request(`${this.Url}${path}`, equipments, 'post')
  }

  // query:{pageIndex:number,pageSize:number,name:string,typeId:string,items:string[]}
  getEquipments(query: Query): Promise<PagedSelectOption> {
    const path = '/api/Equipment/search'

    return this.request(`${this.Url}${path}`, query, 'post')
  }

  getDict(): Promise<any> {
    return this.request(`${this.Url}/api/equipment/dict`, {}, 'get')
  }
}

const mesEquipmentService = new MESEquipmentService()
export default mesEquipmentService
