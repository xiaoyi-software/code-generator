import axios from '@/axios'
import axiosRequest from '@/axios'
import qs from 'qs'
import Utils from './Utils'

export interface Model<TKey> {
  id: TKey
}

export interface Query {
  [propertyName: string]: any
}

const getArrayObject = (data: any) => {
  const obj: any = {}
  for (const key in data) {
    if (Array.isArray(data[key])) {
      obj[key] = data[key]
      delete data[key]
    }
  }
  return obj
}
export abstract class DataServiceRequest {
  request(url: string, data: any, method: string): Promise<any> {
    let result: Promise<IResponse<any>> = Promise.resolve(null as any)
    switch (method) {
      case 'get':
        {
          result = axiosRequest.get({
            url: url,
            params: {},
            paramsSerializer: {
              serialize: () => {
                return qs.stringify(data, { arrayFormat: 'indices' })
              }
            }
          })
        }
        break
      case 'post':
        result = axiosRequest.post({
          url: url,
          data: data
        })
        break
      case 'put':
        result = axiosRequest.put({
          url: url,
          data: data
        })
        break
      case 'delete':
        {
          const obj = getArrayObject(data)
          result = axiosRequest.delete({
            url: url,
            params: data,
            paramsSerializer: {
              serialize: (params) => {
                return Object.keys(obj).length
                  ? qs.stringify(obj, { arrayFormat: 'repeat' })
                  : params
              }
            }
          })
        }
        break
    }
    return new Promise((resolve, reject) => {
      result
        .then((data: any) => {
          if (!data || data.status !== 0) {
            let message = data ? data.message : ''
            if (!message) {
              message = '出错了。'
            }
            reject(message)
          } else {
            resolve(data.data)
          }
        })
        .catch((error) => {
          console.error(error)
          reject(error)
        })
    })
  }
}
