import { DataServiceRequest, Query } from '../DataServiceRequest'

class AndonService extends DataServiceRequest {
  getAndon(id: string): Promise<any> {
    return this.request(`/api/Andon/${id}`, {}, 'get')
  }

  getAndonSheets(query: Query): Promise<any> {
    return this.request(`/api/AndonSheet`, query, 'get')
  }

  getAndonReports(query: Query): Promise<any> {
    return this.request(`/api/AndonReport`, query, 'get')
  }

  searchAndonItemsByWorkSpaceCode(codes: string[]): Promise<any> {
    return this.request(`/api/AndonClient/searchAndonItemsByWorkSpaceCode`, codes, 'post')
  }

  getSheet(id: number): Promise<any> {
    return this.request(`/api/AndonSheet/${id}`, {}, 'get')
  }

  /**
   * 添加安灯工单
   */
  addSheet(dto: any): Promise<any> {
    return this.request(`/api/AndonClient/add-sheet`, dto, 'post')
  }

  getReport(id: number): Promise<any> {
    return this.request(`/api/AndonReport/${id}`, {}, 'get')
  }

  /**
   * 添加安灯报告
   */
  addReport(dto: any): Promise<any> {
    return this.request(`/api/AndonClient/add-report`, dto, 'post')
  }

  /**
   * 取消已发起的安灯消息
   * @param sheetId 工单ID
   * @returns
   */
  cancel(sheetId: number): Promise<any> {
    return this.request(`/api/AndonClient/cancel/${sheetId}`, {}, 'post')
  }
}

const service = new AndonService()
export default service
