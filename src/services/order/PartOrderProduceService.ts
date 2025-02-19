import { DataServiceRequest, Query } from '../DataServiceRequest'
import { SelectItemsDto } from '../Models'

class PartOrderProduceService extends DataServiceRequest {
  get(id: string) {
    return this.request(`/api/PartOrderProduce/${id}`, {}, 'get')
  }

  /**
   * 搜索产品工单
   * @param query {name:string,startTime,endTime,isComplete}
   * @returns
   */
  query(query: Query): Promise<any> {
    return this.request(`/api/PartOrderProduce`, query, 'get')
  }

  items(orders: string[]): Promise<any> {
    return this.request(`/api/PartOrderProduce/items`, orders, 'post')
  }

  changeWorkStatus(data: SelectItemsDto): Promise<any> {
    return this.request(`/api/PartOrderProduce/change-workStatus`, data, 'post')
  }

  search(query: Query): Promise<any> {
    return this.request('/api/PartOrderProduce/search', query, 'post')
  }

  getProcessFlows(id: string, provideType: number | null = null): Promise<any> {
    return this.request(`/api/PartOrderProduce/getProcessFlows`, { id, provideType }, 'get')
  }

  /** 获取资源可执行的工单 */
  getPartOrdersByResource(query: Query): Promise<any> {
    return this.request(`/api/PartOrderProduce/getPartOrdersByResource`, query, 'get')
  }
}

const partOrderProduceService = new PartOrderProduceService()
export default partOrderProduceService
