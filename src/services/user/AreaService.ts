import { DataServiceRequest, Query } from '../DataServiceRequest'
import { EntityBase, ExtraPropertiesDto } from '../Models'

class AreaService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: number) {
    return this.request(`/api/Area/${id}`, null, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/Area`, query, 'get')
  }

  list(query: Query): Promise<any> {
    return this.request(`/api/Area/list`, query, 'get')
  }

  add(model: CreateAreaDto): Promise<any> {
    return this.request(`/api/Area`, model, 'post')
  }

  update(model: CreateAreaDto): Promise<any> {
    return this.request(`/api/Area/${model.id}`, model, 'put')
  }

  delete(id: number): Promise<any> {
    return this.request(`/api/Area/${id}`, {}, 'delete')
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/Area/search`, query, 'post')
  }

  sortable(data: any): Promise<any> {
    return this.request(`/api/Area/sortable`, data, 'post')
  }
}

class CreateAreaDto extends EntityBase<number> {
  id: number = 0
  name = ''
  description = ''
}

const areaService = new AreaService()
export default areaService
