import { ExtraPropertiesDto } from '@/services/Models'

export interface UserLoginType {
  username: string
  password: string
}

export interface CodeValue {
  code: string
  name: string

  extraProperties: ExtraPropertiesDto
}

export interface UserType {
  username: string
  password: string
}

export interface TokenInfo {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface UserInfo {
  id: string
  userName: string
  nickName: string
  name: string
  gender: number
  avatar: string
  email: string
  phoneNumber: string
  address: string
  extraProperties: any
}
