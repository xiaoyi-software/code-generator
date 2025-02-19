import moment, { Moment } from 'moment'
import { ExtraPropertiesDto } from './Models'

export default class Utils {
  static isNull(val: any): boolean {
    return val === undefined || val === null
  }

  static len(o: Array<any>): number {
    return !o ? 0 : o.length
  }

  static loop<T>(arr: Array<T>, f: (item: T, index: number) => any | boolean): void {
    if (arr) {
      for (let i = 0, ln = Utils.len(arr); i < ln; i++) {
        const col = arr[i]
        if (f(col, i) === false) {
          break
        }
      }
    }
  }

  static parseJSON(str): any {
    try {
      const json = JSON.parse(str)
      return json
    } catch (error) {
      return null
    }
  }

  static isNullOrEmp(val: any) {
    return Utils.isNull(val) || Utils.len(val.toString()) === 0
  }

  static strEquals(x: any, y: any) {
    if (Utils.isNull(x) || Utils.isNull(y)) {
      return x === y
    }

    return x.toString() === y.toString()
  }

  static select<T>(list: Array<T>, func: (item: T) => any) {
    const res: Array<T> = []
    Utils.loop(list, (el) => {
      res.push(func(el))
    })

    return res
  }
  static where<T>(list: Array<T>, func: (item: T) => boolean) {
    const res: Array<T> = []
    Utils.loop(list, function (el) {
      if (func(el)) {
        res.push(el)
      }
    })

    return res
  }

  static first<T>(list: Array<T>, func: (item: T) => boolean) {
    return Utils.where(list, func)[0]
  }

  static getById<T extends { id: any; [propertyName: string]: any }>(list: Array<T>, id: any) {
    id = id.toString()
    return Utils.where(list, function (o) {
      return o.id.toString() === id
    })[0]
  }

  static isNotNull(val: any) {
    return !Utils.isNull(val)
  }

  // id: string
  static removeById<T extends { id: any; [propertyName: string]: any }>(list: Array<T>, id: any) {
    let index: number | undefined = undefined

    Utils.loop(list, function (o, ix) {
      if (o.id.toString() === id) {
        index = ix
      }
    })

    if (index) {
      list.splice(index, 1)
    }
  }

  static getByIds<T extends { id: any; [propertyName: string]: any }>(list: Array<T>, ids: any) {
    if (Utils.isNotNull(ids) && !(ids instanceof Array)) {
      ids = [ids]
    }

    const res: Array<T> = []
    Utils.loop(ids, function (id: any) {
      const fit = Utils.first(list, function (it) {
        return it.id.toString() === id.toString()
      })

      if (Utils.isNotNull(fit)) {
        res.push(fit)
      }
    })

    return res
  }

  static max<T>(list: Array<T>, f: (item: T) => any) {
    let item: any
    Utils.loop(list, function (o, ix) {
      const temp = f(o)
      if (!item || item < temp) {
        item = temp
      }
    })
    return item
  }

  // 求集合中的最大日期
  static maxDate<T>(list: Array<T>, f: (item: T) => any): Moment | null {
    let max: any
    list.forEach((item) => {
      const dt = moment(f(item))
      if (!max || max < dt) {
        max = dt
      }
    })
    return max
  }

  static min<T>(list: Array<T>, f: (item: T) => any) {
    let item: any
    Utils.loop(list, function (o, ix) {
      const temp = f(o)
      if (!item || item > temp) {
        item = temp
      }
    })
    return item
  }

  // 求集合中的最小日期
  static minDate<T>(list: Array<T>, f: (item: T) => any): Moment | null {
    let min: any
    list.forEach((item) => {
      const dt = moment(f(item))
      if (!min || min > dt) {
        min = dt
      }
    })
    return min
  }

  // 可移除多项
  static removeTreeItem<T extends { items: Array<T> }>(items: T[], f: (item: T) => boolean): void {
    const removeItem: any[] = []
    for (const item of items) {
      if (f(item)) {
        removeItem.push(item)
      }

      if (item.items && item.items.length > 0) {
        Utils.removeTreeItem(item.items, f)
      }
    }

    for (const item of removeItem) {
      const index = items.indexOf(item)
      items.splice(index, 1)
    }
  }

  static findTreeItem<T extends { items: Array<T> }>(
    items: T[],
    f: (item: T) => boolean
  ): T | null {
    let findItem: any = null
    for (const item of items) {
      if (f(item)) {
        findItem = item
        break
      }

      if (item.items && item.items.length > 0) {
        const temp = Utils.findTreeItem(item.items, f)
        if (temp) {
          findItem = temp
          break
        }
      }
    }
    return findItem
  }

  static filterTreeItem<T extends { items: Array<T> }>(items: T[], f: (item: T) => boolean): T[] {
    const temp: any[] = []
    for (const item of items) {
      if (f(item)) {
        temp.push(item)
      }

      if (item.items && item.items.length > 0) {
        temp.push(...Utils.filterTreeItem(item.items, f))
      }
    }
    return temp
  }

  // 封装代码给DynamicFieldCallback接口实现者使用
  static dynamicFieldCallbackGetValueFunction(
    globalAccessor: ((key: string) => any) | null,
    dto: any
  ): (name: string) => any {
    return function (name: string) {
      if (!name) {
        return null
      }

      const type = name.substring(0, 1)
      const propertyName = name.substring(1)
      let value = null
      switch (type) {
        case '@':
          if (globalAccessor) {
            value = globalAccessor(propertyName)
          }
          break
        case '#':
          value = (dto as any)[propertyName]
          if (value === undefined && dto.extraProperties) {
            value = dto.extraProperties[propertyName]
          }
          break
      }
      return value === undefined ? null : value
    }
  }

  static format(input: string, ...args: any[]): string {
    return input.replace(/\{(\d+)\}/g, function (m, i) {
      return args[i]
    })
  }

  static copy(
    sourceObj: any,
    targetObj: any,
    isDeleteSource: boolean,
    ...fields: Array<string>[]
  ): void {
    for (const field in fields) {
      if (sourceObj[field] !== undefined) {
        targetObj[field] = sourceObj[field]
        if (isDeleteSource) {
          delete sourceObj[field]
        }
      }
    }
  }

  static percentage(value: number, denominator: number) {
    return denominator > 0 ? Math.round((value / denominator) * 10000) / 100 : 0
  }
  static toFixed(value: number): number {
    return Math.floor(value * 100) / 100
  }

  // to mvc modelbinder
  static arrayToQuery(queryName: string, array: Array<number | string>): string {
    let query = ''
    for (let i = 0; i < array.length; i++) {
      if (query != '' && !query.endsWith('&')) {
        query = query + '&'
      }
      query = query + `${queryName}[${i}]=${array[i]}`
    }
    return query
  }

  static attachQueryToUrl(url: string, query: any) {
    const queryString = this.extractQueryString(query)
    if (url.indexOf('?') >= 0) {
      if (url.endsWith('?') || url.endsWith('&')) {
        url += queryString
      } else {
        url = url + '&' + queryString
      }
    } else {
      url = url + '?' + queryString
    }
    return url
  }

  static extractQueryString(query: any): string {
    const items: any[] = []
    for (const key in query) {
      if (query[key] instanceof Array) {
        const queryString = Utils.arrayToQuery(key, query[key])
        items.push(queryString)
      } else {
        items.push(`${key}=${query[key]}`)
      }
    }
    return items.join('&')
  }

  static async yupValidate(validate: () => Promise<any>): Promise<any> {
    try {
      const value = await validate()
      return value
    } catch (error) {
      //
    }
  }

  static blobToDataURI(blob: Blob): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = reject
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  static dataURItoBlob(dataURI: string) {
    let byteString
    if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1])
    else byteString = decodeURI(dataURI.split(',')[1])

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ia], {
      type: mimeString
    })
  }

  static toKeyValuePair = toKeyValuePair
  static discoverCssJSON = discoverCssJSON
}

// 将文本解析成对象表示，提供vue使用
export function discoverCssJSON(content: any): any {
  const extraProperties = new ExtraPropertiesDto()
  if (content && typeof content === 'string') {
    const lines = content.split(/[;,\s]+/)
    for (const line of lines) {
      const name = line.trim()
      if (name.indexOf(':') >= 0) {
        const splits = name.split(':')
        extraProperties[splits[0]] = splits[1]
      } else if (name) {
        extraProperties[name] = true
      }
    }
  }
  return extraProperties
}

export function toKeyValuePair(value: string, split = ':', defaultValue = '') {
  const splits = value.split(split)
  let keyValue: any = null
  if (splits.length && splits[0]) {
    if (splits.length == 1 || !splits[1]) splits[1] = defaultValue

    keyValue = { label: splits[0], value: splits[1] }
  }
  return keyValue
}
