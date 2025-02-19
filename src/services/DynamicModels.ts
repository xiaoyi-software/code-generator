import { ExtraPropertiesDto } from './Models'

// 布局类型
export enum ItemType {
  item,
  row,
  column
}

// 行数据
export interface RowModel {
  id: string | number
  name: string
  displayName?: string

  columnId?: number
  sortId: number
  level: number
  description: string

  itemType: ItemType
  columns: Array<ColumnModel>

  // 临时共享，行、列、项特有的字段
  extraCache: ExtraPropertiesDto
  extraProperties: ExtraPropertiesDto
  hide?: boolean
}

// 列数据
export interface ColumnModel {
  id: any
  name: string
  rowId: number
  sortId: number
  level: number
  description: string

  itemType: ItemType
  rows: Array<RowModel>

  extraCache: ExtraPropertiesDto // 临时共享
  extraProperties: ExtraPropertiesDto
}

// 列内元素，数据项或行
export interface ItemModel extends RowModel {
  itemId: number
}

export interface DynamicMetadata<T> {
  items: Array<T>
}

export interface DynamicFieldCallback {
  getValue: (name: string) => any
  [propertyName: string]: ExtraPropertiesDto
}

export interface DynamicFormModel {
  name: string
  displayName: string
  width: number
  height?: any
  cssClass?: any
  style?: any
  typeId: string
  isResponsive: boolean
  description: string
  rows: any[]
  id: string
}

export interface DynamicFieldModel {
  name: string
  displayName: string
  icon: string
  description: string
  validates: any[]
  id: string
  extraProperties: ExtraPropertiesDto
}

export interface DynamicFormFieldModel {
  formId: string
  columnId: number
  fieldId: string
  sortId: number
  name: string
  label: string
  elementId?: any
  isInline: boolean
  isShowLabel: boolean
  isStatic: boolean
  placement: string
  description: string
  extraProperties: ExtraPropertiesDto
  id: number
}

export interface DynamicGridColumn {
  name: string
  displayName: string

  width?: number
  align?: 'left' | 'center' | 'right'

  // 用于动态呈现列类型
  columnType?: string
  // 列配置数据
  columnData?: string

  isDefault?: boolean // 显示在表格
  isSortable?: boolean // 列可排序
  isDynamic?: boolean // 可动态控制显示

  // 表单列ID
  columnId?: number
}

export interface DynamicFormData {
  dynamicForm: DynamicFormModel
  dynamicFields: DynamicFieldModel[]
  dynamicFormFields: DynamicFormFieldModel[]
  dynamicGridColumns: DynamicGridColumn[]
}

export interface DynamicPanelCallback {
  [propertyName: string]: ExtraPropertiesDto
}

export interface DynamicViewModel {
  name: string
  displayName: string
  width: number
  height?: any
  cssClass?: any
  style?: any
  typeId: string
  isResponsive: boolean
  description: string
  rows: any[]
  id: string
}

export interface DynamicPanelModel {
  name: string
  displayName: string
  icon: string
  description: string
  id: string
  extraProperties: ExtraPropertiesDto
}

export interface DynamicViewPanelModel {
  viewId: string
  columnId: number
  panelId: string
  sortId: number
  name: string
  label: string
  elementId?: any
  prevRowId?: number
  isShowLabel: boolean
  description: string
  extraProperties: ExtraPropertiesDto
  id: number
}

export interface DynamicViewData {
  dynamicView: DynamicViewModel
  dynamicPanels: DynamicPanelModel[]
  dynamicViewPanels: DynamicViewPanelModel[]
}
