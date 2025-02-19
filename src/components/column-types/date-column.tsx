import { defineComponent, ref, watch } from 'vue'
import moment from 'moment'
import { DynamicGridColumn } from '@/services/DynamicModels'

export default defineComponent({
  props: ['item', 'value', 'column'],
  setup(props, { attrs, slots, emit }) {
    //
  },
  render() {
    const fieldItem = this.column as DynamicGridColumn
    let text = ''
    if (this.value) {
      if (fieldItem.columnData) {
        text = moment(this.value).format(fieldItem.columnData)
      } else {
        text = moment(this.value).format('YYYY-MM-DD')
      }
    }
    return <span>{text}</span>
  }
})
