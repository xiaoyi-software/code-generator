import request from '@/axios'
import type { IDynamicDataQuery, ITableColumn } from './types'

export interface IDynamicDataPageResult {
  items: any[]
  total: number
}

export interface ITableSchema {
  columns: Array<{
    name: string
    dbType: string
    isNullable: boolean
    isPrimaryKey: boolean
    isIdentity: boolean
    maxLength?: number
  }>
}

/** 获取动态数据 */
export function getDynamicData(tableName: string, params: IDynamicDataQuery, sorts: any[]) {
  const { pageIndex, pageSize, ...searchParams } = params
  return request.get({
    url: '/api/Database/Query',
    params: {
      tableName,
      pageIndex,
      pageSize,
      filters: JSON.stringify(searchParams), // 将搜索参数序列化为 JSON 字符串
      sortsJson: JSON.stringify(sorts) // 将排序参数序列化为 JSON 字符串
    }
  })
}

/** 创建动态数据 */
export function createDynamicData(tableName: string, data: Record<string, any>) {
  return request.post({
    url: `/api/Database/${tableName}`,
    method: 'post',
    data
  })
}

/** 更新动态数据 */
export function updateDynamicData(tableName: string, data: Record<string, any>) {
  return request.put({
    url: `/api/Database/${tableName}`,
    data
  })
}

/** 删除动态数据 */
export function deleteDynamicData(tableName: string, keys: Record<string, any>) {
  return request.delete({
    url: `/api/Database/${tableName}`,
    params: keys
  })
}

/** 获取表结构 */
export function getTableSchema(tableName: string) {
  return request.get<ITableSchema>({
    url: `/api/Database/GetSchema/${tableName}`,
    method: 'get'
  })
}

/** 获取表列表 */
export function getTables(keyword?: string) {
  return request.get<{
    items: Array<{
      name: string
      label: string
      description?: string
    }>
  }>({
    url: '/api/Database/GetTables',
    params: { keyword }
  })
}

/** 更新架构 */
export function updateSchema(schema: Record<string, any>) {
  return request.post({
    url: '/api/Database/UpdateSchema',
    data: schema
  })
}

/** 导入架构 */
export function importSchema(schema: Record<string, any>) {
  return request.post({
    url: '/api/Database/ImportSchema',
    data: schema
  })
}

/** 获取表列配置 */
export function getTableColumns(tableName: string) {
  return request.get({
    url: `/api/Database/GetTableColumns/${tableName}`,
    method: 'get'
  })
}

/** 保存表列配置 */
export function saveTableColumns(tableName: string, columns: any[]) {
  return request.post({
    url: `/api/Database/SaveTableColumns/${tableName}`,
    method: 'post',
    data: columns
  })
}

/** 导出数据 */
export function exportDynamicData(
  tableName: string,
  params: IDynamicDataQuery,
  sorts: any[],
  columns: ITableColumn[]
) {
  const { pageIndex, pageSize, ...searchParams } = params
  return request.post({
    url: '/api/Database/Export',
    responseType: 'blob',
    data: {
      tableName,
      filters: searchParams,
      sortsJson: JSON.stringify(sorts),
      columns
    }
  })
}
