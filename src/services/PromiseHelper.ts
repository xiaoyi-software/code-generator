import $ from 'jquery'

export default class PromiseHelper<TData> {
  constructor(
    private j: JQuery.jqXHR,
    private dataFunc: ((data: any) => TData) | undefined = undefined
  ) {}

  resolve!: (value: TData) => void
  reject!: (reason: any) => void

  getPromise(): Promise<TData> {
    const promise = new Promise<TData>((a, b) => {
      this.resolve = a
      this.reject = b
    })

    this.j
      .then((data) => {
        if (data.status === 0) {
          this.resolve(this.dataFunc ? this.dataFunc(data.data) : data.data)
        } else {
          this.reject(data.message || '出错了。')
        }
      })
      .catch((error) => {
        console.log(error)
        this.reject(error)
      })

    return promise
  }
}
