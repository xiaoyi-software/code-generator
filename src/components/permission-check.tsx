import { defineComponent, PropType, ref, watch } from 'vue'

export default defineComponent({
  props: {
    permissions: {
      type: Object as PropType<Array<string>>,
      required: true
    },
    allows: [String, Array]
  },
  setup(props, { attrs, slots, emit }) {
    const allowd = ref(false)

    const checkPermissions: string[] = []
    if (typeof props.allows === 'string') {
      checkPermissions.push(...props.allows.split(','))
    } else if (props.allows instanceof Array) {
      checkPermissions.push(...(props.allows as string[]))
    }

    const check = (permissions: string[]) => {
      allowd.value = false
      if (permissions.length > 0) {
        const set = new Set<string>(props.permissions)

        for (const permission of checkPermissions) {
          if (set.has(permission)) {
            allowd.value = true
            break
          }
        }
      }
    }

    watch(
      () => [...props.permissions],
      (newValue: any, oldValue: any) => {
        check(newValue)
      }
    )

    check(props.permissions)

    return () => <>{allowd.value && slots.default ? slots.default() : null}</>
  }
})
