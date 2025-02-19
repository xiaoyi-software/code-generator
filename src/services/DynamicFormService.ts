import { DataServiceRequest } from './DataServiceRequest'

class DynamicFormService extends DataServiceRequest {
  constructor() {
    super()
  }

  formData(id: string): Promise<any> {
    return this.request(`/api/DynamicForm/formData/${id}`, {}, 'get')
  }
}

const dynamicFormService = new DynamicFormService()
export default dynamicFormService
