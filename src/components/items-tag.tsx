import Utils from '@/services/Utils'
import { defineComponent, ref, watch } from 'vue'

// 用于将非数组对象转换为数组对象，以便提供插槽内的组件使用
export default defineComponent({
  props: {
    tags: String,
    json: Boolean
  },
  setup(props, { attrs, slots, emit }) {
    const items = ref<any>()
    const getValue = (tags: string) => {
      if (props.json) {
        return Utils.parseJSON(tags) ?? []
      } else {
        return (tags || '').split(',').filter((m) => m)
      }
    }

    items.value = getValue(props.tags as string)

    watch(
      () => props.tags,
      (value, oldValue) => {
        items.value = getValue(props.tags as string)
      }
    )

    return () => (
      <>
        {slots.items
          ? slots.items(items.value)
          : items.value.map((item) => slots.default && slots.default(item))}
      </>
    )
  }
})
