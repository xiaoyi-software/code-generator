export enum ReduceGroupDuration {
  horizontal,
  vertical
}

export class ReduceGroup<T> {
  constructor(
    private columns: number, // 列
    private duration: ReduceGroupDuration = ReduceGroupDuration.horizontal // 排列方向
  ) {}

  private groups: Array<any> = []
  private pushGroupItem() {
    const item = { items: [...this.items] }
    this.groups.push(item)
    this.items = []
    this.init = 0
  }

  private init = 0
  private items: Array<T> = []
  push(item: T) {
    this.items.push(item)
    this.init++

    if (this.init == this.columns) {
      this.pushGroupItem()
    }
  }

  getGroups(): Array<{ items: Array<T> }> {
    if (this.items.length > 0) {
      this.pushGroupItem()
    }

    // 垂直排列
    if (this.duration == ReduceGroupDuration.vertical) {
      // 串联全部项
      const tempItems: Array<any> = []
      this.groups.forEach((item) => tempItems.push(...item.items))
      // 重新排列
      tempItems.forEach((item, index) => {
        const column = Math.floor(index / this.groups.length) // 列
        const row = index % this.groups.length // 行
        this.groups[row].items[column] = item
      })
    }

    return this.groups
  }
}
