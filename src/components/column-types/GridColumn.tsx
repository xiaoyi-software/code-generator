import { DynamicGridColumn } from '@/services/DynamicModels'
import { Vue, Options, Inject, Provide, Prop } from 'vue-property-decorator'
import ColumnTypeStore from './ColumnTypeStore'

export default class GridColumn extends Vue {
  @Prop()
  item: any

  @Prop()
  column!: DynamicGridColumn

  getFieldComponent(value: any) {
    const slot = this.$slots[this.column.name]
    let component: any | null = null
    if (slot) {
      component = slot(this.item)
    }

    if (!component && this.column.columnType) {
      let columnType = this.column.columnType
      let valueType = ''
      if (columnType.indexOf(':') > 0) {
        const arr = columnType.split(':')
        columnType = arr[0]
        valueType = arr.length > 1 ? arr[1] : ''
      }

      const tempComponent = ColumnTypeStore.getColumnType(columnType)
      if (tempComponent) {
        component = (
          <tempComponent
            item={this.item}
            value={value}
            valueType={valueType}
            column={this.column}
          ></tempComponent>
        )
      }
    }
    return component
  }

  render() {
    let value = this.item[this.column.name]
    if (value == undefined && this.item.extraProperties) {
      value = this.item.extraProperties[this.column.name]
    }
    value = value ?? ''
    const component = this.getFieldComponent(value)
    return <>{component ? component : typeof value === 'string' ? value : JSON.stringify(value)}</>
  }
}
