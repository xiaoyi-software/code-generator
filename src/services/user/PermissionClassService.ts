import { DataServiceRequest, Query } from '../DataServiceRequest'
import { EntityBase, ExtraPropertiesDto } from '../Models'

class PermissionClassService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: number) {
    return this.request(`/api/PermissionClass/${id}`, null, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/PermissionClass`, query, 'get')
  }

  list(query: Query): Promise<any> {
    return this.request(`/api/PermissionClass/list`, query, 'get')
  }

  add(model: CreatePermissionClassDto): Promise<any> {
    return this.request(`/api/PermissionClass`, model, 'post')
  }

  update(model: CreatePermissionClassDto): Promise<any> {
    return this.request(`/api/PermissionClass/${model.id}`, model, 'put')
  }

  delete(id: number): Promise<any> {
    return this.request(`/api/PermissionClass/${id}`, {}, 'delete')
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/PermissionClass/search`, query, 'post')
  }

  sortable(data: any): Promise<any> {
    return this.request(`/api/PermissionClass/sortable`, data, 'post')
  }

  getPermissions(data: { userId?: string; roleName?: string }): Promise<any> {
    return this.request(`/api/PermissionClass/permissions`, data, 'get')
  }
}

class CreatePermissionClassDto extends EntityBase<number> {
  id: number = 0
  name = ''
  description = ''
}

const permissionClassService = new PermissionClassService()
export default permissionClassService
