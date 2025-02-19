import dynamicForm from '@/dynamic-form/dynamic-form'
import {
  ColumnModel,
  DynamicFormData,
  RowModel,
  DynamicFieldModel,
  DynamicFormFieldModel
} from './DynamicModels'
import { List } from 'linqts'

type ItemType = 'row' | 'column'

export default class DynamicFormDataHelper {
  constructor(private formData: DynamicFormData) {}

  getGridColumns(columnName: string | null = null) {
    const gridColumns: any[] = []
    if (columnName) {
      const items = this.findRow(
        this.formData.dynamicForm,
        (itemType, item) => itemType == 'column' && item.name == columnName
      )
      if (items.length > 0) {
        gridColumns.push(
          ...this.formData.dynamicGridColumns.filter((m) => m.columnId == items[0].id)
        )
      }
    } else {
      gridColumns.push(...this.formData.dynamicGridColumns.filter((m) => !m.columnId))
    }
    return gridColumns
  }

  // 获取动态表单中的一列字段
  getFormFields(columnName: string) {
    const formFields: any[] = []
    const items = this.findRow(
      this.formData.dynamicForm,
      (itemType, item) => itemType == 'column' && item.name == columnName
    )
    if (items.length) {
      formFields.push(...this.formData.dynamicFormFields.filter((m) => m.columnId == items[0].id))
    }
    return formFields
  }

  private findRow(column: any, f: (itemType: ItemType, item: any) => boolean): any {
    const items: Array<any> = []
    if (column.rows && column.rows.length) {
      for (const row of column.rows) {
        if (f('row', row)) {
          items.push(row)
        } else if (row.columns && row.columns.length) {
          items.push(...this.findColumn(row, f))
        }
      }
    }
    return items
  }

  private findColumn(row: any, f: (itemType: ItemType, item: any) => boolean): any {
    const items: Array<any> = []
    if (row.columns && row.columns.length) {
      for (const column of row.columns) {
        if (f('column', column)) {
          items.push(column)
        } else if (column.rows && column.rows.length) {
          items.push(...this.findRow(column, f))
        }
      }
    }
    return items
  }

  private static names = new List([
    'name',
    'label',
    'fieldId',
    'formId',
    'columnId',
    'isInline',
    'isShowLabel',
    'isStatic',
    'placement'
  ])

  // 创建一个默认的最小化表单数据
  // {name:"test",label:"测试",fieldName:"input",type:"textarea"}
  static createFormData(fields: any[]): DynamicFormData {
    const form: any = {
      id: 'form',
      name: 'form',
      display: 'form',
      rows: [
        {
          id: 'row',
          name: 'row',
          formId: 'form',
          columns: [
            {
              id: 'column',
              rowId: 'row',
              name: 'column',
              formId: 'form',
              rows: []
            }
          ]
        }
      ]
    }

    const instance = dynamicForm.getInstance()
    const dynamicFields = instance.getFields().map((item) => this.createField(item, {}))

    const dynamicFormFields: DynamicFormFieldModel[] = []
    fields.forEach((item) => {
      if (item.name && item.fieldId) {
        const model = this.createFormField(item.name, item.fieldId, {
          formId: 'form',
          columnId: 'column',
          // 默认值提供
          isInline: false,
          isShowLabel: true,
          isStatic: true,
          ...item
        })
        dynamicFormFields.push(model as any)
      }
    })

    const dynamicFormData: DynamicFormData = {
      dynamicForm: form,
      dynamicFields: dynamicFields,
      dynamicFormFields: dynamicFormFields,
      dynamicGridColumns: []
    }
    return dynamicFormData
  }

  static createField(name: string, othorData: any = null): DynamicFieldModel {
    const model = {
      id: name,
      name: name,
      displayName: name
    } as DynamicFieldModel

    if (othorData) {
      Object.assign(model, othorData)
    }
    return model
  }

  static createFormField(
    name: string,
    fieldId: string,
    othorData: any = null
  ): DynamicFormFieldModel {
    const model: any = {
      id: name,
      name: name,
      label: name,
      fieldId: fieldId,
      extraProperties: {}
    }

    if (othorData) {
      const keys = new List(Object.keys(othorData))
      this.names.Intersect(keys).ForEach((item) => {
        if (item) {
          model[item] = othorData[item]
        }
      })
      keys.Except(this.names).ForEach((item) => {
        if (item) {
          model.extraProperties[item] = othorData[item]
        }
      })
    }
    return model
  }
}
