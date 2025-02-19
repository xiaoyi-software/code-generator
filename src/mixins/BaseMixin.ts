import TabsController from '@/services/TabsController'
import moment from 'moment'
import { Options, Vue } from 'vue-property-decorator'

@Options({})
export default class BaseMixin extends Vue {
  $dateFormat(date: any, format = 'YYYY-MM-DD') {
    //
    if (date) {
      return moment(date).format(format)
    }
    return ''
  }

  // 重新格式化层级数据，以适配el-table，主要是去除无子项的items
  formatNodes(nodes: any[]) {
    const handle = (node: any) => {
      if (node.items) {
        if (node.items.length == 0) {
          node.items = null
        } else {
          for (const childNode of node.items) {
            handle(childNode)
          }
        }
      }
    }

    for (const node of nodes) {
      handle(node)
    }
    return nodes
  }

  // 显示枚举值
  displayName(id: string | number, values: any[]): string {
    const item = values.find((m) => m.id == id || m.value == id)
    return item?.name || id
  }

  created() {
    //
  }
}
