import { DynamicGridColumn } from '@/services/DynamicModels'
import { HostData } from '@/services/Models'
import { defineComponent, inject } from 'vue'

export default defineComponent({
  props: ['item', 'value', 'valueType', 'column'],
  setup(props, { attrs, slots, emit }) {
    const fieldItem = props.column as DynamicGridColumn
    const hostData = inject<HostData>('hostData')

    let valueType = props.valueType as string
    if (!valueType) {
      valueType = fieldItem.name || ''
    }
    const items = hostData?.dataMap.get(valueType) || []

    return {
      items,
      fieldItem
    }
  },

  render() {
    const item = this.items.find((m: any) => m.id == this.value || m.value == this.value)
    return <span>{item?.name}</span>
  }
})
