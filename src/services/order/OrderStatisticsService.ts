import { DataServiceRequest } from '../DataServiceRequest'

class OrderStatisticsService extends DataServiceRequest {
  constructor() {
    super()
  }

  /**
   * 获取产品工单进度
   * @param searchData {partId:string,startTime,endTime,orderUseType,status:0|1|2,produces:string[]}
   */
  getPartOrderProgress(searchData: any): Promise<any> {
    return this.request(`/api/OrderStatistics/partOrder-progress`, searchData, 'post')
  }

  /**
   * 获取生产单进度
   * @param searchData {partId:string,startTime,endTime,status:0|1|2}
   */
  getProduceOrderProgress(searchData: any): Promise<any> {
    return this.request(`/api/OrderStatistics/produceOrder-progress`, searchData, 'post')
  }

  /**
   * 获取工序生产进度
   * @param id 产品工单ID
   */
  getWorkReportProgress(id: string): Promise<any> {
    return this.request(`/api/OrderStatistics/workReport-progress/${id}`, {}, 'post')
  }

  /**
   * 获取工序计划进度
   * @param id 产品工单ID
   */
  getWorkSheetProgress(id: string): Promise<any> {
    return this.request(`/api/OrderStatistics/workSheet-progress/${id}`, {}, 'post')
  }
}

const orderStatisticsService = new OrderStatisticsService()
export default orderStatisticsService
