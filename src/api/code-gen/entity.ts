import request from '@/axios'
import { CodeEntity, CodeEntitySearchDto, PagedResult } from './types'

export const getEntities = (params: CodeEntitySearchDto) => {
  return request.get<PagedResult<CodeEntity>>({
    url: '/api/CodeEntity',
    params: params
  })
}

export const getEntity = (id: number) => {
  return request.get<CodeEntity>({
    url: `/api/CodeEntity/${id}`
  })
}

export const createEntity = (entity: Partial<CodeEntity>) => {
  return request.post({
    url: '/api/CodeEntity',
    data: entity
  })
}

export const updateEntity = (id: number, entity: Partial<CodeEntity>) => {
  return request.put({
    url: `/api/CodeEntity/${id}`,
    data: entity
  })
}

export const deleteEntity = (id: number) => {
  return request.delete({
    url: `/api/CodeEntity/${id}`
  })
}
