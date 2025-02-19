import { HostData } from '@/services/Models'
import mitt, { Emitter } from 'mitt'

const emitter = mitt()
const hostData: HostData = {
  // baseUrl&token发布时保持空
  baseUrl: 'http://localhost:5035',
  token: '',

  provideName: '',
  dataMap: new Map<string, any>(),
  app: null,
  eventBus: emitter
}
export default hostData
