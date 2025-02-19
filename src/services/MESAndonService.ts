import { DataServiceRequest, Query } from './DataServiceRequest'
import { PagedSelectOption } from './Models'

class MESAndonService extends DataServiceRequest {
  get Url() {
    return ''
  }

  getAndonItemsByWorkSpaceCode(codes: string[]): Promise<any> {
    const path = '/api/Andon/getAndonItemsByWorkSpaceCode'
    return this.request(`${this.Url}${path}`, codes, 'post')
  }

  // query:{pageIndex:number,pageSize:number,name:string,typeId:string,items:string[]}
  getAndons(query: Query): Promise<PagedSelectOption> {
    const path = '/api/Andon/search'

    return this.request(`${this.Url}${path}`, query, 'post')
  }

  getDict(): Promise<any> {
    return this.request(`${this.Url}/api/andon/dict`, {}, 'get')
  }
}

const service = new MESAndonService()
export default service
