import { DataServiceRequest, Query } from '../DataServiceRequest'

class PartService extends DataServiceRequest {
  getPartById(id: string): Promise<any> {
    return this.request(`/api/Part/${id}`, {}, 'get')
  }

  getPartList(pageIndex: number, pageSize: number, query: any): Promise<any> {
    query = { pageIndex, pageSize, ...query }
    return this.request(`/api/Part`, query, 'get')
  }

  search(query: Query): Promise<any> {
    const path = '/api/part/search'
    return this.request(`${path}`, query, 'post')
  }
}

const service = new PartService()
export default service
