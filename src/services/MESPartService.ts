import { DataServiceRequest, Query } from './DataServiceRequest'
import { PagedSelectOption } from './Models'

class MESPartService extends DataServiceRequest {
  get Url() {
    return ''
  }

  getPartItems(part: string[]): Promise<any> {
    const path = '/api/Part/items'
    return this.request(`${this.Url}${path}`, part, 'post')
  }

  // query{pageIndex,pageSize,classId?:number,partUseType?:number,items:string[]}
  getParts(query: Query): Promise<PagedSelectOption> {
    const path = '/api/Part/search'

    return this.request(`${this.Url}${path}`, query, 'post')
  }

  getPartProcesses(query: Query): Promise<PagedSelectOption> {
    const path = '/api/PartProcess/search'

    return this.request(`${this.Url}${path}`, query, 'post')
  }

  /**
   * 获取产品BOM清单
   * @param id 产品ID
   * @param level BOM层级
   * @param version BOM版本
   * @returns BOM清单
   */
  getBomItems(id: string, level: number, version: string): Promise<any> {
    return this.request(
      `${this.Url}/api/PartBom/items`,
      { id: id, level: 4, version: version },
      'get'
    )
  }

  /**
   * 获取产品的BOM版本列表
   * @param id 产品ID
   * @returns
   */
  getBomVersions(query: Query): Promise<any> {
    return this.request(`${this.Url}/api/PartBom/versions`, query, 'get')
  }

  /**
   * 搜索产品的BOM版本列表
   * @param id 产品ID
   * @returns
   */
  searchBomVersions(query: Query): Promise<any> {
    return this.request(`${this.Url}/api/PartBom/search/versions`, query, 'post')
  }

  /**
   * 获取产品工艺流程
   * @param id 产品ID
   * @param version 工艺版本
   * @returns 经过排序的产品工艺流程
   */
  getProcessFlows(id: string, version: string): Promise<any> {
    return this.request(`${this.Url}/api/PartProcess/flows`, { id, version }, 'get')
  }

  /**
   * 获取工序列表
   * @param flowIdArray 工序ID集合
   * @returns
   */
  searchProcessFlows(query: Query): Promise<any> {
    return this.request(`${this.Url}/api/PartProcess/search/flows`, query, 'post')
  }

  getProcessVersions(query: Query): Promise<any> {
    return this.request(`${this.Url}/api/PartProcess/versions`, query, 'get')
  }

  /**
   * 获取产品的工艺版本列表
   * @param id 产品ID
   * @returns
   */
  searchProcessVersions(query: Query): Promise<any> {
    return this.request(`${this.Url}/api/PartProcess/search/versions`, query, 'post')
  }

  getDict(): Promise<any> {
    return this.request(`${this.Url}/api/part/dict`, {}, 'get')
  }
}

const service = new MESPartService()
export default service
