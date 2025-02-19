import { defineComponent, inject, ref, watch } from 'vue'
import moment from 'moment'
import { DynamicGridColumn } from '@/services/DynamicModels'
import { HostData } from '../../services/Models'

export default defineComponent({
  props: ['item', 'value', 'column'],
  setup(props, { attrs, slots, emit }) {
    //
    const hostData = inject('hostData') as HostData
    return { baseUrl: hostData.baseUrl }
  },
  render() {
    const fieldItem = this.column as DynamicGridColumn
    let url = ''
    if (this.value) {
      const files: any = this.value || []
      if (typeof files === 'string') {
        url = files
      } else if (Array.isArray(files)) {
        url = files.length > 0 ? files[0].url : ''
      } else {
        url = files?.url
      }
    }

    return /(jpg|png|jpeg)$/i.test(url) ? <img src={this.baseUrl + url} /> : <>{url}</>
  }
})
