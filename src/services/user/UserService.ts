import { DataServiceRequest, Query } from '../DataServiceRequest'
import { EntityBase, ExtraPropertiesDto } from '../Models'

class UserService extends DataServiceRequest {
  constructor() {
    super()
  }

  get(id: string) {
    return this.request(`/api/User/${id}`, null, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/User`, query, 'get')
  }

  add(model: CreateUserDto): Promise<any> {
    return this.request(`/api/User`, model, 'post')
  }

  update(model: CreateUserDto): Promise<any> {
    return this.request(`/api/User/${model.id}`, model, 'put')
  }

  delete(id: string): Promise<any> {
    return this.request(`/api/User/${id}`, {}, 'delete')
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/User/search`, query, 'post')
  }

  sortable(data: any): Promise<any> {
    return this.request(`/api/User/sortable`, data, 'post')
  }
}

class CreateUserDto extends EntityBase<number> {
  id: number = 0
  name = ''
  description = ''
}

const userService = new UserService()
export default userService
