import { DataServiceRequest, Query } from '../DataServiceRequest'

class ScheduleTaskService extends DataServiceRequest {
  get(id: string): Promise<any> {
    return this.request(`/api/ScheduleTask/${id}`, {}, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/ScheduleTask`, query, 'get')
  }

  /**
   * 获取任务操作记录
   * @param taskId 任务ID
   */
  getTaskItems(taskId: string): Promise<any> {
    return this.request(`/api/ScheduleTask/task-items/${taskId}`, {}, 'get')
  }

  /**
   * 获取任务计划工单及报工工单
   * @param taskId 任务ID
   */
  getTaskSheets(taskId: string): Promise<any> {
    return this.request(`/api/ScheduleTask/task-sheets/${taskId}`, {}, 'get')
  }

  /**
   * 领取任务
   * @param dto 参数
   */
  start(dto: TaskStartDto): Promise<any> {
    return this.request(`/api/ScheduleTask/start`, dto, 'post')
  }

  /**
   * 提交任务（报工）
   * @param dto 参数
   */
  stop(dto: TaskStopDto) {
    return this.request(`/api/ScheduleTask/stop`, dto, 'post')
  }

  /**
   * 取消任务，可取消未报工的任务
   * @param dto 参数
   */
  cancel(dto: TaskCancelDto) {
    return this.request(`/api/ScheduleTask/cancel`, dto, 'post')
  }
}

export interface TaskStartDto {
  scheduleId: number
  flowId: string
  qty: number
  startTime: string
  endTime: string
}

export interface TaskStopDto {
  scheduleId: number
  taskId: string
  qty: number
  unqualifiedCount: number
  startTime: string
  endTime: string
}

export interface TaskCancelDto {
  scheduleId: number
  taskId: string
  qty: number
}

const scheduleTaskService = new ScheduleTaskService()
export default scheduleTaskService
