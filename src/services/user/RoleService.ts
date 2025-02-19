import { DataServiceRequest, Query } from '../DataServiceRequest'
import { EntityBase, ExtraPropertiesDto } from '../Models'

class RoleService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: string) {
    return this.request(`/api/Role/${id}`, null, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/Role`, query, 'get')
  }

  add(model: CreateRoleDto): Promise<any> {
    return this.request(`/api/Role`, model, 'post')
  }

  update(model: CreateRoleDto): Promise<any> {
    return this.request(`/api/Role/${model.id}`, model, 'put')
  }

  delete(id: string): Promise<any> {
    return this.request(`/api/Role/${id}`, {}, 'delete')
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/Role/search`, query, 'post')
  }

  sortable(data: any): Promise<any> {
    return this.request(`/api/Role/sortable`, data, 'post')
  }
}

class CreateRoleDto extends EntityBase<number> {
  id: number = 0
  name = ''
  description = ''
}

const roleService = new RoleService()
export default roleService
