import { DataServiceRequest } from '../DataServiceRequest'
import { ExtraPropertiesDto } from '../Models'

class AndonClassService extends DataServiceRequest {
  constructor() {
    super()
  }

  search(query: ExtraPropertiesDto): Promise<any> {
    return this.request(`/api/andonClass/search`, query, 'post')
  }
}

const service = new AndonClassService()
export default service
