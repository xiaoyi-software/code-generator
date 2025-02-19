import { DataServiceRequest, Query } from '../DataServiceRequest'
import { EntityBase, ExtraPropertiesDto } from '../Models'

class OrganizationService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: number) {
    return this.request(`/api/Organization/${id}`, null, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/Organization`, query, 'get')
  }

  list(query: Query): Promise<any> {
    return this.request(`/api/Organization/list`, query, 'get')
  }

  add(model: CreateOrganizationDto): Promise<any> {
    return this.request(`/api/Organization`, model, 'post')
  }

  update(model: CreateOrganizationDto): Promise<any> {
    return this.request(`/api/Organization/${model.id}`, model, 'put')
  }

  delete(id: number): Promise<any> {
    return this.request(`/api/Organization/${id}`, {}, 'delete')
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/Organization/search`, query, 'post')
  }

  sortable(data: any): Promise<any> {
    return this.request(`/api/Organization/sortable`, data, 'post')
  }
}

class CreateOrganizationDto extends EntityBase<number> {
  id: number = 0
  name = ''
  description = ''
}

const oragnizationService = new OrganizationService()
export default oragnizationService
