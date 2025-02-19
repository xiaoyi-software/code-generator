export interface UserInfo {
  id: string
  userName: string
  name: string
  nickName?: string
  email?: string
  isEnabled: boolean
  avatar: string
  roles: string[]
  createdTime: string
  lastLoginTime?: string
}

export interface CreateUserInfo {
  userName: string
  email: string
  name: string
  nickName: string
  avatar: string
  password: string
  isEnabled: boolean
  roles: string[]
}

export interface RoleInfo {
  id: string
  name: string
  description: string
  isEnabled: boolean
  createdTime: string
}

export interface CreateRoleInfo {
  name: string
  description: string
  isEnabled: boolean
}

export interface ClaimInfo {
  type: string
  value: string
}

export interface SortingDto {
  field: string
  order: string
}

export interface UserSearchDto {
  pageIndex: number
  pageSize: number
  userName?: string
  name?: string
  email?: string
  nickName?: string
  isEnabled?: boolean
  roles?: string[]
  sorts?: SortingDto[]
}
