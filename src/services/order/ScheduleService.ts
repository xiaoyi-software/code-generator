import { DataServiceRequest, Query } from '../DataServiceRequest'

class ScheduleService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: string) {
    return this.request(`/api/Schedule/${id}`, {}, 'get')
  }

  /**
   * 搜索生产计划
   * @param query {name:string,startTime,endTime,isComplete}
   * @returns
   */
  query(query: Query): Promise<any> {
    return this.request(`/api/Schedule`, query, 'get')
  }

  getScheduleProcessFlows(query: Query): Promise<any> {
    return this.request(`/api/Schedule/getScheduleProcessFlows`, query, 'get')
  }

  getScheduleResources(query: Query): Promise<any> {
    return this.request(`/api/Schedule/getScheduleResources`, query, 'get')
  }

  getEnableReportResources(query: Query): Promise<any> {
    return this.request(`/api/Schedule/getEnableReportResources`, query, 'get')
  }

  // // 获取计划对应的产品工序
  // getProcessFlows(query: Query): Promise<any> {
  //   const path = '/api/Schedule/getProcessFlows'
  //   return this.request(`${path}`, query, 'get')
  // }

  getPartOrderExecutor(id: string): Promise<any> {
    return this.request(`/api/Schedule/getPartOrderExecutor/${id}`, {}, 'get')
  }

  // 获取用户资源权限
  getValidatorResources(): Promise<any> {
    const path = '/api/Schedule/getValidatorResources'
    return this.request(`${path}`, {}, 'get')
  }

  // 获取工作时间
  getWorkTimes(query: { id: number; startTime?: string; endTime?: string }): Promise<any> {
    const path = '/api/Schedule/getWorkTimes'
    return this.request(`${path}`, query, 'get')
  }

  /**
   * 查询资源报工记录
   * @param query {orderId,flowId,startTime,endTime,resourceId[],userId[],creatorId}
   */
  getWorkReports(query: Query): Promise<any> {
    return this.request(`/api/Schedule/getWorkReports`, query, 'get')
  }

  /**
   * 查询资源计划工单
   * @param query {orderId,flowId,startTime,endTime,resourceId[],userId[]}
   */
  getWorkSheets(query: Query): Promise<any> {
    return this.request(`/api/Schedule/getWorkSheets`, query, 'get')
  }
}

const scheduleServide = new ScheduleService()
export default scheduleServide
