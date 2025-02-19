import { DataServiceRequest, Query } from './DataServiceRequest'
import { ExtraPropertiesDto } from './Models'

class DynamicContentService extends DataServiceRequest {
  get Url() {
    return ''
  }

  getCorrelationFileCount(query: {
    typeId: string
    correlations: string[]
    isEnableCode?: boolean
    codePath?: string
  }): Promise<any> {
    return this.request(`${this.Url}/api/DynamicContent/correlation-fileCount`, query, 'post')
  }

  getCorrelationContents(query: {
    [propertyName: string]: any
    correlationId: string
    typeId: string
    codePath: string
  }): Promise<any> {
    return this.request(`${this.Url}/api/DynamicContent/correlation-contents`, query, 'post')
  }
}

const service = new DynamicContentService()
export default service
