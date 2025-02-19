import request from '@/axios'
import type { TokenInfo, UserType, UserInfo } from './types'

interface GetMenuParams {
  workSpaceId: string
  clientType: string
  permissionRule: number
}

export const loginApi = (data: UserType): Promise<IResponse<TokenInfo>> => {
  // return request.post({ url: '/mock/user/login', data })
  return request.post({
    url: '/api/Account/Login',
    data: {
      userName: data.username,
      password: data.password
    }
  })
}

export const logoutApi = (): Promise<IResponse> => {
  return request.post({ url: '/api/Account/Logout' })
}

export const restoreToken = (): Promise<IResponse<any>> => {
  return request.post({ url: '/api/Account/RestoreLogin' })
}

export const getUser = (): Promise<IResponse<any>> => {
  return request.get({ url: '/api/Account/user' })
}

export const updateUser = (dto: any) => {
  return request.post({ url: '/api/Account/user', data: dto })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

export const getAdminRoleApi = (params: GetMenuParams): Promise<IResponse<any>> => {
  // return request.get({ url: '/mock/role/list', params })
  return request.get({ url: '/api/base/permission-menus', params: params })
}

export const getTestRoleApi = (params: GetMenuParams): Promise<IResponse<any>> => {
  // return request.get({ url: '/mock/role/list2', params })
  return request.get({ url: '/api/base/permission-menu-keys', params: params })
}
