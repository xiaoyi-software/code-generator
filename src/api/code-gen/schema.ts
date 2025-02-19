import request from '@/axios'

export interface TableSchemaRequest {
  connectionStringName: string
  entityNames: string[]
}

export const getTableSchema = (entityNames: string[]): Promise<IResponse> => {
  return request.post({
    url: '/api/Schema/GetTableSchema',
    data: entityNames
  })
}

export const getTableSchemaFromConnection = (data: TableSchemaRequest): Promise<IResponse> => {
  return request.post({
    url: '/api/Schema/GetTableSchemaFromConnection',
    data
  })
}

// 获取实体列表
export function getEntities(searchText?: string) {
  return request.get({
    url: '/api/Schema/GetEntities',
    method: 'get',
    params: { searchText }
  })
}

// 获取表列表
export function getTablesFromConnection(connectionStringName: string, searchText?: string) {
  return request.get({
    url: '/api/Schema/GetTablesFromConnection',
    method: 'get',
    params: { connectionStringName, searchText }
  })
}
