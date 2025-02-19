import { DynamicGridColumn } from '@/services/DynamicModels'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  props: ['item', 'value', 'column'],
  setup(props, { attrs, slots, emit }) {
    //
  },
  render() {
    const fieldItem = this.column as DynamicGridColumn

    let text = ''
    if (this.value !== undefined) {
      const temp = this.item[this.column.name] || false
      text = this.value ? '是' : '否'
    }
    return <span>{text}</span>
  }
})
