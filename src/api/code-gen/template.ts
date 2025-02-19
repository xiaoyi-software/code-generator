import request from '@/axios'
import { CodeTemplate, CodeTemplateSearchDto, CreateCodeTemplateDto, PagedResult } from './types'

export const getTemplates = (params: CodeTemplateSearchDto) => {
  return request.get<PagedResult<CodeTemplate>>({
    url: '/api/CodeTemplate',
    params: params
  })
}

export const getTemplate = (id: number) => {
  return request.get<CodeTemplate>({
    url: `/api/CodeTemplate/${id}`
  })
}

export const createTemplate = (template: CreateCodeTemplateDto) => {
  return request.post({
    url: '/api/CodeTemplate',
    data: template
  })
}

export const updateTemplate = (id: number, template: CreateCodeTemplateDto) => {
  return request.put({
    url: `/api/CodeTemplate/${id}`,
    data: template
  })
}

export const deleteTemplate = (id: number) => {
  return request.delete({
    url: `/api/CodeTemplate/${id}`
  })
}

export const importTemplates = (code: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post({
    url: `/api/CodeTemplate/${code}/import`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const exportTemplates = (code: string) => {
  return request.get({
    url: `/api/CodeTemplate/${code}/export`,
    responseType: 'blob'
  })
}
