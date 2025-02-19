import { watch, toRaw, readonly } from 'vue'

export function createPersistStorage<T>(state: any, key = 'default'): T {
  const STORAGE_KEY = '--APP-STORAGE--'

  // init value
  Object.entries(getItem(key)).forEach(([key, value]) => {
    state[key] = value
  })

  function setItem(state: any) {
    const stateRow = getItem()
    stateRow[key] = state
    const stateValue = JSON.stringify(stateRow)
    localStorage.setItem(STORAGE_KEY, stateValue)
  }

  function getItem(key?: string) {
    const stateValue = localStorage.getItem(STORAGE_KEY) || '{}'
    const stateRow = JSON.parse(stateValue) || {}
    return key ? stateRow[key] || {} : stateRow
  }

  watch(state, () => {
    const stateRow = toRaw(state)
    setItem(stateRow)
  })

  return readonly(state)
}
