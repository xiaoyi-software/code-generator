import { defineComponent, inject, ref, watch } from 'vue'
import { HostData } from '@/services/Models'
import { DynamicGridColumn } from '@/services/DynamicModels'

export default defineComponent({
  props: ['item', 'value', 'column'],
  setup(props, { attrs, slots, emit }) {
    const fieldItem = props.column as DynamicGridColumn
    const hostData = inject<HostData>('hostData') as HostData

    let url = ''
    if (props.value) {
      const files: any = props.value || []
      if (typeof files === 'string') {
        url = `${hostData.baseUrl}${files}`
      } else if (Array.isArray(files)) {
        url = files.length > 0 ? `${hostData.baseUrl}${files[0].url}` : ''
      } else {
        url = `${hostData.baseUrl}${files?.url}`
      }
    }
    return () => (
      <>
        {url ? (
          <el-link href={url} target="_blank">
            下载
          </el-link>
        ) : null}
      </>
    )
  }
})
