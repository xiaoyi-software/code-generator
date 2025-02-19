import { DataServiceRequest } from './DataServiceRequest'

class CommandDebugService extends DataServiceRequest {
  constructor() {
    super()
  }

  sendCommandResult(data: any): Promise<any> {
    return this.request('/api/communication/command-debug', data, 'post')
  }
}

const commandDebugService = new CommandDebugService()
export default commandDebugService
