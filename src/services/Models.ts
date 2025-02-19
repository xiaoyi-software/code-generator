import { Emitter } from 'mitt'

export interface HostData {
  baseUrl?: string
  token?: string
  antiToken?: string
  provideName: string
  dataMap: Map<string, any>
  app: any
  eventBus: Emitter<any>

  [propertyName: string]: any
}

export interface PagedSearchDto {
  pageIndex?: number
  pageSize?: number
  name?: string | null
}

export interface DropDto {
  node: any
  targetId?: number | string
  dropType: string
}

export interface Ajax {
  request: <T>(url: string, data: T | ExtraPropertiesDto, method: string) => Promise<any>
}

export type Dictionary<T> = { [key: string]: T }

export type ExtensibleEntityDto = {
  extraProperties: Dictionary<string>
}

// 用于多选时审核
export interface SelectItemsDto {
  items: any[]
  enable: boolean
  status?: number
}

export class SelectOption {
  constructor(
    public name: string,
    public value: any
  ) {}

  id = ''
  imgUrl?: string | null = null
}

export class PagedSelectOption {
  items: SelectOption[] = []
  totalCount = 0
}

export class MessageResult {
  status = 0
  message: string | null = null
  data: Dictionary<any> | null = null
}

export class EntityBase<TKey> {
  id!: TKey
}

export class ExtraPropertiesDto {
  [propertyName: string]: any
}

export class TabItem {
  constructor(
    public name: string,
    public text: string
  ) {}

  params: Dictionary<string> = {}
  // 别名，子路由
  alias?: Array<string>
  disabled? = false
  closable? = false

  public static emptyItems: TabItem[] = []
}

export class NameValue {
  name = ''
  value = ''
}

export class FlowModel {
  id = 0
  x = 0
  y = 0
  isStart = false
  flowId = ''
  name = ''

  outcomes: NameValue[] = []
  description = ''
}

export class TransitionModel {
  sourceFlowId = ''
  sourceOutcomeName = ''
  destinationFlowId = ''
}

export class FlowDesignModel {
  id = ''
  version = ''
  flows: Array<FlowModel> = []
  transitions: Array<TransitionModel> = []
  removedFlows: Array<string> = []
}

export enum DataStatus {
  创建 = 0,
  提交 = 1,
  无效 = 2
}

export enum PartUseType {
  Materiel = 0,
  Product = 1
}

export enum OrderUseType {
  Produce,
  Purchase,
  Cooperation
}

export enum BomItemType {
  Produce,
  Purchase,
  Cooperation
}

export enum EquipmentUseType {
  // 设备
  Equipment,
  // 工装模具
  EquipmentFixture,
  // 模具
  EquipmentMould,
  // 备件
  EquipmentSpare
}

export enum CheckUseType {
  // 巡检
  Check,
  // 设备巡检
  CheckEquipment,
  // 设备维护
  CheckEquipmentMaintain
}

export const DefaultOutcomes: NameValue = { name: 'Next', value: 'Next' }

export function logError(error: any) {
  console.log(error)
}
