import { createGenericStore } from '@/store/createGenericStore'
import { createPersistStorage } from '@/store/createPersistStorage'
import { readonly } from 'vue'
import { ExtraPropertiesDto } from '../services/Models'

declare type DynamicColumnStoreAction = {
  updateName: (value: string) => void
  updateColumns: (value: Array<any>) => void
  updateExtraProperties: (value: ExtraPropertiesDto) => void
  updateExtraValue: (value: ExtraPropertiesDto) => void
}

export type DynamicColumnStore = {
  state: {
    name: string
    columns: Array<any>
    extraProperties: any
  }
  action: DynamicColumnStoreAction
}

export default function useDynamicColumnStore(persistName: string): DynamicColumnStore {
  const store = createGenericStore(
    { columns: [], name: '', extraProperties: {} },
    {
      updateName: (state) => (value) => (state.name = value),
      updateColumns: (state) => (value) => (state.columns = value),
      updateExtraProperties: (state) => (value) => (state.extraProperties = value),
      updateExtraValue: (state) => (obj) =>
        (state.extraProperties = Object.assign({ ...state.extraProperties }, obj))
    }
  )

  // 持久存储
  return {
    state: createPersistStorage<{
      name: string
      columns: Array<any>
      extraProperties: ExtraPropertiesDto
    }>(store.state, persistName),
    //state: readonly(store.state),
    action: readonly(store.action) as DynamicColumnStoreAction
  }
}
