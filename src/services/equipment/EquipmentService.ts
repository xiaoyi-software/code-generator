import { DataServiceRequest, Query } from '../DataServiceRequest'

class EquipmentService extends DataServiceRequest {
  constructor() {
    super()
  }

  getEquipmentById(id: string): Promise<any> {
    return this.request(`/api/Equipment/${id}`, {}, 'get')
  }

  getEquipmentList(pageIndex: number, pageSize: number, query: any): Promise<any> {
    query = { pageIndex, pageSize, ...query }
    return this.request(`/api/Equipment`, query, 'get')
  }

  search(query: Query): Promise<any> {
    return this.request(`/api/equipment/search`, query, 'post')
  }
}

const service = new EquipmentService()
export default service
