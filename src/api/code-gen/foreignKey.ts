import request from '@/axios'
import { CodeEntityForeignKey } from './types'

export const getForeignKeys = (entityId: number) => {
  return request.get<{ items: CodeEntityForeignKey[] }>({
    url: '/api/CodeEntityForeignKey',
    params: { entityId }
  })
}

export const getForeignKey = (id: number) => {
  return request.get<CodeEntityForeignKey>({
    url: `/api/CodeEntityForeignKey/${id}`
  })
}

export const createForeignKey = (foreignKey: Partial<CodeEntityForeignKey>) => {
  return request.post({
    url: '/api/CodeEntityForeignKey',
    data: {
      name: foreignKey.name,
      entityId: foreignKey.entityId,
      principalTable: foreignKey.principalTable,
      properties: foreignKey.properties,
      principalColumns: foreignKey.principalColumns
    }
  })
}

export const updateForeignKey = (id: number, foreignKey: Partial<CodeEntityForeignKey>) => {
  return request.put({
    url: `/api/CodeEntityForeignKey/${id}`,
    data: {
      id,
      name: foreignKey.name,
      entityId: foreignKey.entityId,
      principalTable: foreignKey.principalTable,
      properties: foreignKey.properties,
      principalColumns: foreignKey.principalColumns
    }
  })
}

export const deleteForeignKey = (id: number) => {
  return request.delete({
    url: `/api/CodeEntityForeignKey/${id}`
  })
}
