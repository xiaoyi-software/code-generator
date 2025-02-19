import { App, Component } from 'vue'
import DateColumn from './date-column'
import ImageColumn from './image-column'
import BooleanColumn from './boolean-column'
import FileColumn from './file-column'
import DataStatusColumn from './dataStatus-column'
import EnumColumn from './enum-column'

class ColumnTypeStore {
  private static _instance = new ColumnTypeStore()

  constructor() {
    //
  }

  _typesMap = new Map<string, any>()

  static getInstance(): ColumnTypeStore {
    ColumnTypeStore._instance.registerDefaults()
    return ColumnTypeStore._instance
  }

  private registerDefaults() {
    if (this._typesMap.keys.length == 0) {
      this.registerColumnType('date', DateColumn)
      this.registerColumnType('image', ImageColumn)
      this.registerColumnType('boolean', BooleanColumn)
      this.registerColumnType('file', FileColumn)
      this.registerColumnType('dataStatus', DataStatusColumn)
      this.registerColumnType('enum', EnumColumn)
    }
  }

  registerColumnType(type: string, component: Component): void {
    this._typesMap.set(type, component)
  }

  getColumnType(type: string): any {
    return this._typesMap.get(type)
  }
}

const instance = ColumnTypeStore.getInstance()
export default instance
