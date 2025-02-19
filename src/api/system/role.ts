import request from '@/axios'
import type { RoleInfo, CreateRoleInfo, ClaimInfo } from './types'

export const getRoleList = (): Promise<IResponse<{ items: RoleInfo[] }>> => {
  return request.get({ url: '/api/Role' })
}

export const getRole = (id: string): Promise<IResponse<RoleInfo>> => {
  return request.get({ url: `/api/Role/${id}` })
}

export const createRole = (data: CreateRoleInfo): Promise<IResponse> => {
  return request.post({ url: '/api/Role', data })
}

export const updateRole = (id: string, data: CreateRoleInfo): Promise<IResponse> => {
  return request.put({ url: `/api/Role/${id}`, data })
}

export const deleteRole = (id: string): Promise<IResponse> => {
  return request.delete({ url: `/api/Role/${id}` })
}

export const getRoleClaims = (id: string): Promise<IResponse<{ claims: ClaimInfo[] }>> => {
  return request.get({ url: `/api/Role/${id}/claims` })
}

export const updateRoleClaims = (id: string, claims: ClaimInfo[]): Promise<IResponse> => {
  return request.put({ url: `/api/Role/${id}/claims`, data: claims })
}
