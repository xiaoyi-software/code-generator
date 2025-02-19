import { DataServiceRequest, Query } from '../DataServiceRequest'

class ResourceExecutorService extends DataServiceRequest {
  get(id: string) {
    return this.request(`/api/ResourceExecutor/${id}`, {}, 'get')
  }

  query(query: Query): Promise<any> {
    return this.request(`/api/ResourceExecutor`, query, 'get')
  }

  add(model: CreateResourceExecutorDto): Promise<any> {
    return this.request(`/api/ResourceExecutor`, model, 'post')
  }

  update(model: CreateResourceExecutorDto): Promise<any> {
    return this.request(`/api/ResourceExecutor/${model.id}`, model, 'put')
  }

  delete(id: string): Promise<any> {
    return this.request(`/api/ResourceExecutor/${id}`, {}, 'delete')
  }

  getFlowTrace(id: string): Promise<any> {
    return this.request(`/api/ResourceExecutor/getFlowTrace/${id}`, {}, 'get')
  }
}

export class CreateResourceExecutorDto {
  id = ''
  partOrderId = ''
  flowId = ''
  workSpaceId? = ''
  equipmentId? = ''
  connectionId = ''
  description? = ''
}

const resourceExecutorService = new ResourceExecutorService()
export default resourceExecutorService
