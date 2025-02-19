export interface CodeProject {
  id: number
  code: string
  name: string
  description?: string
  properties?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface CodeProjectSearchDto {
  code?: string
  name?: string
  pageIndex: number
  pageSize: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageIndex: number
  pageSize: number
}

export interface CodeTemplate {
  id: number
  name: string
  description?: string
  fileName?: string
  content: string
  projectId: number
  createdAt?: string
  updatedAt?: string
}

export interface CodeTemplateSearchDto {
  name?: string
  isGlobal?: boolean
  pageIndex: number
  pageSize: number
}

export interface CreateCodeTemplateDto {
  id?: number
  name: string
  description?: string
  fileName?: string
  content: string
  projectId: number
}

export interface CodeEntity {
  id: number
  name: string
  tableName: string
  projectId: number
  createdAt?: string
  updatedAt?: string
  columns?: CodeEntityColumn[]
  foreignKeys?: CodeEntityForeignKey[]
}

export interface CodeEntityColumn {
  id: number
  name: string
  dbType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isIdentity: boolean
  maxLength?: number
  comment: string
  entityId: number
}

export interface CodeEntityForeignKeyColumn {
  id?: number
  name: string
  isPrincipalColumn: boolean
  propertyForeignKeyId?: number
  principalForeignKeyId?: number
}

export interface CodeEntityForeignKey {
  id: number
  name: string
  entityId: number
  principalTable: string
  properties: CodeEntityForeignKeyColumn[]
  principalColumns: CodeEntityForeignKeyColumn[]
}

export interface CodeEntitySearchDto {
  name?: string
  tableName?: string
  projectId?: number
  pageIndex: number
  pageSize: number
}

export interface CodeGenerateRecord {
  id: number
  projectId: number
  generatedAt: string
  fileCount: number
  creatorId: string
  remarks?: string
}

export interface CodeGenerateFile {
  id: number
  generateId: number
  projectId: number
  templateName: string
  entityId?: number
  filePath: string
  fileName: string
  content: string
  fileSize: number
  generatedAt: string
}

export interface CodeGenerateSearchParams {
  projectId?: number
  creatorId?: string
  pageIndex: number
  pageSize: number
}

export interface CodeGenerateFileSearchParams {
  generateId?: number
  projectId?: number
  fileName?: string
  pageIndex: number
  pageSize: number
}

/** 动态数据查询参数 */
export interface IDynamicDataQuery {
  pageIndex: number
  pageSize: number
  sorts?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  [key: string]: any
}

export interface ITableColumn {
  columnName: string
  displayName: string
  isVisible: boolean
  isSortable: boolean
  orderIndex: number
  description?: string
  dbType?: string
}
