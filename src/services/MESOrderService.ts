import { DataServiceRequest } from './DataServiceRequest'
import { PagedSelectOption } from './Models'

class MESOrderService extends DataServiceRequest {
  get Url() {
    return ''
  }

  getDict(): Promise<any> {
    const path = '/api/order/dict'
    return this.request(path, {}, 'get')
  }

  getPartOrderProduces(orders: string[]): Promise<any> {
    const path = '/api/PartOrderProduce/items'
    return this.request(path, orders, 'post')
  }

  getProduceOrder(id: number, partId: string | null = null): Promise<any> {
    const path = '/api/ProduceOrder'
    return this.request(`${this.Url}${path}/${id}`, { partId }, 'get')
  }

  searchProduceOrders(
    pageIndex: number,
    pageSize: number,
    name: string,
    id: number | null = null
  ): Promise<PagedSelectOption> {
    const path = '/api/ProduceOrder/search'
    return this.request(`${this.Url}${path}`, { pageIndex, pageSize, name }, 'get')
  }

  searchPartOrderProduces(
    pageIndex: number,
    pageSize: number,
    name: string,
    orderUseType = 0,
    items: string[] = []
  ): Promise<PagedSelectOption> {
    const path = '/api/PartOrderProduce/search'
    return this.request(
      `${this.Url}${path}`,
      { pageIndex, pageSize, name, orderUseType, items },
      'post'
    )
  }
}

const service = new MESOrderService()
export default service
