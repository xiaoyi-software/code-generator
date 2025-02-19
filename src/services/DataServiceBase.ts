import $ from 'jquery'
import { ExtraPropertiesDto, HostData } from './Models'
import Utils from './Utils'
import hostData from '@/host-data'
import PromiseHelper from './PromiseHelper'
import { DataServiceRequest } from './DataServiceRequest'

export interface Model<TKey> {
  id: TKey
}

export interface Query {
  [propertyName: string]: any
}

export class Paths {
  getPath?: string
  queryPath?: string
  addPath?: string
  updatePath?: string
  deletePath?: string
}

// export abstract class DataServiceRequest {
//   constructor(protected hostData: HostData) {}

//   request<T>(url: string, data: any, method: any): Promise<any> {
//     let jqXHR: JQuery.jqXHR
//     if (method == 'get' || method == 'delete') {
//       jqXHR = $.ajax({
//         url: url,
//         type: method,
//         processData: true,
//         headers: this.getHeaders(),
//         data: data
//       })
//     } else {
//       jqXHR = $.ajax({
//         url: url,
//         type: method,
//         headers: this.getHeaders(),
//         data: JSON.stringify(data)
//       })
//     }

//     const helper = new PromiseHelper(jqXHR)
//     return helper.getPromise()
//   }

//   getHeaders(headers: any = {}) {
//     // 添加token
//     if (this.hostData.token) {
//       headers['Authorization'] = 'Bearer ' + this.hostData.token
//     }
//     return headers
//   }

//   attachQueryToUrl(url: string, query: any) {
//     const queryString = this.extractQueryString(query)
//     if (url.indexOf('?') >= 0) {
//       if (url.endsWith('?') || url.endsWith('&')) {
//         url += queryString
//       } else {
//         url = url + '&' + queryString
//       }
//     } else {
//       url = url + '?' + queryString
//     }
//     return url
//   }

//   extractQueryString(query: any): string {
//     const items: any[] = []
//     for (const key in query) {
//       if (query[key] instanceof Array) {
//         const queryString = Utils.arrayToQuery(key, query[key])
//         items.push(queryString)
//       } else {
//         items.push(`${key}=${query[key]}`)
//       }
//     }
//     return items.join('&')
//   }
// }

export class AjaxRequest extends DataServiceRequest {
  constructor(private hostData: HostData) {
    super()
  }

  public static Ajax: AjaxRequest = new AjaxRequest(hostData)
  // 下载文件
  download(url: string, path: string, method: 'get' | 'post' = 'get'): JQueryXHR {
    if (method == 'get') {
      url = Utils.attachQueryToUrl(url, { path })
    }

    const jqXHR = $.ajax({
      url: url,
      data: method == 'post' ? { path } : {},
      cache: false,
      type: method,
      xhrFields: {
        responseType: 'blob'
      },
      headers: this.getHeaders({
        'Content-Type': 'application/json;charset=utf-8'
      })
    })

    return jqXHR.promise()
  }

  // 表单上传文件
  upload(url: string, formData: FormData): JQueryXHR {
    const jqXHR = $.ajax({
      url: url,
      type: 'post',
      data: formData,
      processData: false,
      headers: this.getHeaders({
        'Content-Type': 'multipart/form-data'
      })
    })
    return jqXHR.promise()
  }

  // TODO 将下面DataServiceBase的jquery方法挪进来

  getHeaders(headers: any = {}) {
    // 添加token
    if (this.hostData.token) {
      headers['Authorization'] = 'Bearer ' + this.hostData.token
    }
    return headers
  }
}

export abstract class DataServiceBase<T extends Model<TKey>, TKey> extends DataServiceRequest {
  constructor() {
    super()
  }

  abstract get Paths(): Paths

  get(id: TKey): Promise<any> {
    return this.request(`${this.Paths.getPath}/${id}`, null, 'get')
    // const jqXHR = $.ajax({
    //   url: `${this.Url}${this.Paths.getPath}/${id}`,
    //   type: 'get',
    //   headers: this.getHeaders()
    // })

    // const helper = new PromiseHelper(jqXHR)
    // return helper.getPromise()
  }

  query(q: Query): Promise<any> {
    return this.request(`${this.Paths.queryPath}`, q, 'get')
    // const jqXHR = $.ajax({
    //   url: `${this.Url}${this.Paths.queryPath}`,
    //   type: 'get',
    //   processData: true,
    //   headers: this.getHeaders(),
    //   data: q
    // })

    // const helper = new PromiseHelper(jqXHR)
    // return helper.getPromise()
  }

  add(model: T): Promise<any> {
    return this.request(`${this.Paths.addPath}`, model, 'post')
    // const jqXHR = $.ajax({
    //   url: `${this.Url}${this.Paths.addPath}`,
    //   type: 'post',
    //   headers: this.getHeaders(),
    //   data: JSON.stringify(model)
    // })

    // const helper = new PromiseHelper(jqXHR)
    // return helper.getPromise()
  }

  update(id: TKey, model: T): Promise<any> {
    return this.request(`${this.Paths.updatePath}/${id}`, model, 'put')
    // const jqXHR = $.ajax({
    //   url: `${this.Url}${this.Paths.updatePath}/${id}`,
    //   type: 'put',
    //   headers: this.getHeaders(),
    //   data: JSON.stringify(model)
    // })

    // const helper = new PromiseHelper(jqXHR)
    // return helper.getPromise()
  }

  delete(id: TKey): Promise<any> {
    return this.request(`${this.Paths.deletePath}/${id}`, null, 'delete')
    // const jqXHR = $.ajax({
    //   url: `${this.Url}${this.Paths.deletePath}/${id}`,
    //   type: 'delete',
    //   headers: this.getHeaders()
    // })

    // const helper = new PromiseHelper(jqXHR)
    // return helper.getPromise()
  }
}
