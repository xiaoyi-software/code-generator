import request from '@/axios'
import { CodeProject, CodeProjectSearchDto, PagedResult } from './types'

export const getProjects = (params: CodeProjectSearchDto) => {
  return request.get<PagedResult<CodeProject>>({
    url: '/api/CodeProject',
    params: params
  })
}

export const getProject = (id: number) => {
  return request.get<CodeProject>({
    url: `/api/CodeProject/${id}`
  })
}

export const createProject = (project: Partial<CodeProject>) => {
  return request.post({
    url: '/api/CodeProject',
    data: project
  })
}

export const updateProject = (id: number, project: Partial<CodeProject>) => {
  return request.put({
    url: `/api/CodeProject/${id}`,
    data: project
  })
}

export const deleteProject = (id: number) => {
  return request.delete({
    url: `/api/CodeProject/${id}`
  })
}

export const generateCode = (
  code: string,
  saveToDb: boolean = true,
  useFileSystem: boolean = false
) => {
  return request.post({
    url: useFileSystem
      ? `/api/CodeProject/${code}/generate-from-files`
      : `/api/CodeProject/${code}/generate`,
    params: { saveToDb },
    responseType: 'blob'
  })
}

export const importSchema = (code: string, schemaData: any): Promise<IResponse> => {
  return request.post({
    url: `/api/CodeProject/${code}/schema`,
    data: schemaData
  })
}

export const exportSchema = (code: string): Promise<IResponse> => {
  return request.get({
    url: `/api/CodeProject/${code}/schema`
  })
}
