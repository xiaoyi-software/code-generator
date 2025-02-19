import { DataServiceRequest, Query } from './DataServiceRequest'
import { PagedSelectOption } from './Models'

class MESBaseService extends DataServiceRequest {
  async getUserWorkSpace(query: Query): Promise<any> {
    return this.request(`/api/WorkSpace/user-workSpace`, query, 'get')
  }

  async updateUserWorkSpace(model: any): Promise<any> {
    return this.request(`/api/WorkSpace/user-workSpace`, model, 'post')
  }

  async deleteUserWorkSpace(id: string): Promise<any> {
    return this.request(`/api/WorkSpace/user-workSpace/${id}`, {}, 'delete')
  }

  async getUserResource(): Promise<any> {
    return this.request(`/api/WorkCenter/user-resource`, {}, 'get')
  }

  async updateUserResource(code: string): Promise<any> {
    return this.request(`/api/WorkCenter/user-resource`, { code }, 'post')
  }

  getCalendarTypes(name: string): Promise<any> {
    const path = '/api/base/calendar-types'
    return this.request(`${path}`, { name: (name || '').trim() }, 'get')
  }

  getWorkCalendar(calendarTypeId: string): Promise<any> {
    return this.request(`/api/base/work-calendar/${calendarTypeId}`, {}, 'get')
  }

  // getWorkClasses(typeId: string): Promise<any> {
  //   const path = "/api/base/work-classes";
  //   return this.request(`${path}/${typeId}`, {}, "get");
  // }

  /**
   * 获取客户列表
   * @param query {name:string, items:[]}
   */
  getCustomers(query: Query): Promise<PagedSelectOption> {
    const path = '/api/Customer/search'
    return this.request(`/api/Customer/search`, query, 'post')
  }

  /**
   * 获取供应商列表
   * @param query {name:string, items:[]}
   */
  getSuppliers(query: Query): Promise<PagedSelectOption> {
    const path = '/api/Supplier/search'
    return this.request(`/api/Supplier/search`, query, 'post')
  }

  /**
   * 获取厂区层级数据
   */
  factoryAreaNodes(): Promise<any> {
    const path = '/api/FactoryArea/search'
    return this.request(`${path}`, {}, 'post')
  }

  /**
   * 获取字典层级数据
   * @param typeId 字典类型ID
   */
  dictItemNodes(typeId: string): Promise<any> {
    const path = '/api/DictItem/search'
    return this.request(`${path}`, { typeId: typeId }, 'post')
  }

  /**
   * 获取字典类型集合，包含字典项
   * @param types 字典类型名称
   * @returns
   */
  getDictTypes(...types: string[]): Promise<any> {
    const path = '/api/DictItem/search-types'
    return this.request(`${path}`, { items: types }, 'post')
  }

  getDict(): Promise<any> {
    return this.request(`/api/base/dict`, {}, 'get')
  }

  // @param query:{pageIndex:number,pageSize:number,name:string,factoryAreaId?:number}
  getWorkSpaces(query: Query): Promise<any> {
    const path = '/api/WorkSpace/search'
    return this.request(`${path}`, query, 'post')
  }

  getProcessItems(query: Query): Promise<PagedSelectOption> {
    return this.request(`/api/ProcessItem/search`, query, 'post')
  }

  getProcessRoutes(query: Query): Promise<any> {
    return this.request(`/api/ProcessRoute/search`, query, 'post')
  }

  getProductionLines(query: Query): Promise<any> {
    return this.request(`/api/ProductionLine/search`, query, 'post')
  }

  // query:{pageIndex:number,pageSize:number,name:string,typeId:string,items:string[]}
  getWorkResourceTypes(query: Query): Promise<any> {
    return this.request(`/api/workResourceType/search`, query, 'post')
  }

  // query:{pageIndex:number,pageSize:number,name:string,typeId:string,items:string[]}
  getWorkCenters(query: Query): Promise<PagedSelectOption> {
    const path = '/api/WorkCenter/search'

    return this.request(`${path}`, query, 'post')
  }

  /**
   * 获取班组信息
   * @param query {factoryAreaId:number,name:string}
   * @returns
   */
  getWorkGroups(query: Query): Promise<PagedSelectOption> {
    return this.request(`/api/WorkGroup/search`, query, 'post')
  }

  /**
   * 获取报表接口
   * @param query
   * @returns
   */
  getReportContracts(query: Query): Promise<any> {
    return this.request(`/api/ReportDefinition/contracts`, query, 'get')
  }

  /**
   * 获取报表配置
   * @param query {contract:string,reportType:number}
   * @returns
   */
  getReports(query: Query): Promise<any> {
    return this.request(`/api/ReportDefinition/reports`, query, 'get')
  }
}

const mesBaseService = new MESBaseService()
export default mesBaseService
