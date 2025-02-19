import request from '@/axios'
import type { UserInfo, CreateUserInfo, ClaimInfo, UserSearchDto } from './types'

export const getUserList = (
  params: UserSearchDto
): Promise<IResponse<{ items: UserInfo[]; total: number }>> => {
  return request.get({
    url: '/api/User',
    params
  })
}

export const getUser = (id: string): Promise<IResponse<UserInfo>> => {
  return request.get({ url: `/api/User/${id}` })
}

export const createUser = (data: CreateUserInfo): Promise<IResponse> => {
  return request.post({ url: '/api/User', data })
}

export const updateUser = (id: string, data: CreateUserInfo): Promise<IResponse> => {
  return request.put({ url: `/api/User/${id}`, data })
}

export const deleteUser = (id: string): Promise<IResponse> => {
  return request.delete({ url: `/api/User/${id}` })
}

export const getUserClaims = (id: string): Promise<IResponse<{ claims: ClaimInfo[] }>> => {
  return request.get({ url: `/api/User/${id}/claims` })
}

export const updateUserClaims = (id: string, claims: ClaimInfo[]): Promise<IResponse> => {
  return request.put({ url: `/api/User/${id}/claims`, data: claims })
}
