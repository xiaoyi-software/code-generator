import { reactive } from 'vue'

// 泛型存储
export function createGenericStore<
  T,
  TAction extends { [propertyName: string]: (value: T) => (val: any) => void }
>(
  state: T,
  action: TAction
): {
  state: T
  action: { [propertyName: string]: (value: any) => void }
} {
  const stateValue = reactive(state as any)

  const actionValue: any = {}
  Object.entries(action).forEach(([key, value]) => {
    actionValue[key] = value(stateValue as any)
  })

  return {
    state: stateValue,
    action: actionValue
  }
}
