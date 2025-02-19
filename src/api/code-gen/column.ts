import request from '@/axios'
import { CodeEntityColumn } from './types'

// 获取实体的所有列
export const getColumns = (entityId: number) => {
  return request.get<{ items: CodeEntityColumn[] }>({
    url: '/api/CodeEntityColumn',
    params: { entityId }
  })
}

// 获取单个列详情
export const getColumn = (id: number) => {
  return request.get<CodeEntityColumn>({
    url: `/api/CodeEntityColumn/${id}`
  })
}

// 创建列
export const createColumn = (column: Partial<CodeEntityColumn>) => {
  return request.post({
    url: '/api/CodeEntityColumn',
    data: column
  })
}

// 更新列
export const updateColumn = (id: number, column: Partial<CodeEntityColumn>) => {
  return request.put({
    url: `/api/CodeEntityColumn/${id}`,
    data: column
  })
}

// 删除列
export const deleteColumn = (id: number) => {
  return request.delete({
    url: `/api/CodeEntityColumn/${id}`
  })
}
