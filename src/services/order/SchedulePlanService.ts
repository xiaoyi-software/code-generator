import { DataServiceRequest, Model } from '../DataServiceRequest'
import { ExtraPropertiesDto } from '../Models'

class SchedulePlanService extends DataServiceRequest {
  addWorkReport(data: CreateWorkReportModel): Promise<any> {
    return this.request(`/api/SchedulePlan/addWorkReport`, data, 'post')
  }

  addWorkReportBatch(data: CreateWorkReportModel[]): Promise<any> {
    return this.request(`/api/SchedulePlan/addWorkReport-batch`, data, 'post')
  }
}

export class CreateWorkReportModel {
  scheduleId!: number
  flowId = ''
  resourceId = ''

  startTime = ''
  endTime = ''
  qualifiedCount = 0
  unqualifiedCount = 0
}

export interface IFlowModuleData {
  items: any[]
}

// 工序排产方式
export enum PlanFlowType {
  Resource = 0, // 设备
  User = 1, // 人工
  Both = 2 // 含前两者
}

export class PartProcessFlowModel implements Model<number> {
  id = 0
  processId = ''
  version = ''
  name = ''
  flowId = ''

  parentId: number | null = null

  processItemId: string | null = null

  isEnableChild = false
  outcome = ''

  description = ''
  stepId = 0

  extraProperties: ExtraPropertiesDto = {}

  modules: string[] = []
}

// 产品工艺
export class PartProcessModel {
  id = ''
  name = ''

  creatorId = ''
  creationTime = ''

  planFlowType!: PlanFlowType
  version = ''

  description = ''

  flows: PartProcessFlowModel[] = []
  flowModuleData: IFlowModuleData = { items: [] }

  static bindModuleData(dto: PartProcessModel): void {
    const map = new Map<any, any>()
    dto.flowModuleData.items
      .filter((m) => m.resourceTypeId)
      .map((item: any) => {
        map.set(item.processFlowId, item)
      })
    for (let i = 0; i < dto.flows.length; i++) {
      const flow = dto.flows[i]
      flow.stepId = i + 1
      flow.extraProperties.module = map.get(flow.id)
    }
  }
}
const schedulePlanService = new SchedulePlanService()
export default schedulePlanService
