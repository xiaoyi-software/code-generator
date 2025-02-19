import { createGenericStore } from '@/store/createGenericStore'
import { createPersistStorage } from '@/store/createPersistStorage'
import { readonly } from 'vue'
import { ExtraPropertiesDto } from '../services/Models'

declare type AppStoreAction = {
  updateName: (value: string) => void
  updateExtraProperties: (value: ExtraPropertiesDto) => void
  updateExtraValue: (value: ExtraPropertiesDto) => void
}

export type AppStore = {
  state: {
    name: string
    extraProperties: any
  }
  action: AppStoreAction
}

export default function useAppStore(persistName: string): AppStore {
  const store = createGenericStore(
    { columns: [], name: '', extraProperties: {} },
    {
      updateName: (state) => (value) => (state.name = value),
      updateExtraProperties: (state) => (value) => (state.extraProperties = value),
      updateExtraValue: (state) => (obj) =>
        (state.extraProperties = Object.assign({ ...state.extraProperties }, obj))
    }
  )

  // 持久存储
  return {
    state: createPersistStorage<{
      name: string
      extraProperties: ExtraPropertiesDto
    }>(store.state, persistName),
    //state: readonly(store.state),
    action: readonly(store.action) as AppStoreAction
  }
}
