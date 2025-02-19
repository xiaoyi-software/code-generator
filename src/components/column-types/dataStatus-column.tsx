import { defineComponent, ref, watch } from 'vue'
import { DataStatus } from '@/services/Models'
import { DynamicGridColumn } from '@/services/DynamicModels'

export default defineComponent({
  props: ['item', 'value', 'column'],
  setup(props, { attrs, slots, emit }) {
    //
  },
  render() {
    const fieldItem = this.column as DynamicGridColumn
    let text = ''
    if (this.value !== undefined) {
      text = DataStatus[this.value]
    }
    return <span>{text}</span>
  }
})
