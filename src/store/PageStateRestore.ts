import { ExtraPropertiesDto } from '@/services/Models'
import { DynamicColumnStore } from '@/store/dynamic-column-store'

export default function PageStateRestore(store: DynamicColumnStore, state: ExtraPropertiesDto) {
  Object.keys(state).forEach((key) => {
    const value = store.state.extraProperties[key]
    if (value) {
      Object.assign(state[key], value)
    }
  })

  const saveState = (state: ExtraPropertiesDto) => {
    store.action.updateExtraValue(state)
  }

  return {
    saveState
  }
}
