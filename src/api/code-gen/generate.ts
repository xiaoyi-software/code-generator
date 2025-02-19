import request from '@/axios'
import type {
  CodeGenerateRecord,
  CodeGenerateFile,
  CodeGenerateSearchParams,
  CodeGenerateFileSearchParams,
  CodeProject
} from './types'
import type { AxiosResponse } from 'axios'

export const GenerateApi = {
  // 生成记录相关接口
  list: (
    params: CodeGenerateSearchParams
  ): Promise<IResponse<{ items: CodeGenerateRecord[]; totalCount: number }>> => {
    return request.get({ url: '/api/CodeGenerate', params })
  },
  detail: (id: number): Promise<IResponse<CodeGenerateRecord>> => {
    return request.get({ url: `/api/CodeGenerate/${id}` })
  },
  delete: (id: number): Promise<IResponse> => {
    return request.delete({ url: `/api/CodeGenerate/${id}` })
  },

  // 生成文件相关接口
  fileList: (
    params: CodeGenerateFileSearchParams
  ): Promise<IResponse<{ items: CodeGenerateFile[]; total: number }>> => {
    return request.get({ url: '/api/CodeGenerateFile', params })
  },
  fileDetail: (id: number): Promise<IResponse<CodeGenerateFile>> => {
    return request.get({ url: `/api/CodeGenerateFile/${id}` })
  },
  fileDelete: (id: number): Promise<IResponse> => {
    return request.delete({ url: `/api/CodeGenerateFile/${id}` })
  },
  downloadFile: (id: number): Promise<{ data: Blob }> => {
    return request.get({
      url: `/api/CodeGenerateFile/download/${id}`,
      responseType: 'blob',
      headers: {
        Accept: 'text/plain'
      }
    })
  },

  // 下载生成记录的所有文件（ZIP压缩包）
  downloadGenerate: (id: number): Promise<{ data: Blob }> => {
    return request.get({
      url: `/api/CodeGenerate/${id}/download`,
      responseType: 'blob',
      headers: {
        Accept: 'application/zip'
      }
    })
  },

  fileCreate: (data: Partial<CodeGenerateFile>): Promise<IResponse> => {
    return request.post({ url: '/api/CodeGenerateFile', data })
  },

  fileUpdate: (data: Partial<CodeGenerateFile>): Promise<IResponse> => {
    return request.put({ url: `/api/CodeGenerateFile/${data.id}`, data })
  }
}

export interface GenerateRequest {
  tables: Record<string, any> // 表结构数据
  properties: Record<string, any> // 属性数据
}

// 生成代码预览
export const generateCode = (data: GenerateRequest, subDir?: string) =>
  request.post({
    url: '/api/CodeGen/Generate',
    method: 'post',
    params: { subDir },
    data
  })

// 下载代码
export const downloadCode = (data: GenerateRequest, subDir?: string) =>
  request.post({
    url: '/api/CodeGen/Download',
    method: 'post',
    params: { subDir },
    data,
    responseType: 'blob'
  })
