import { Ref, ref } from 'vue'
import { TabItem } from './Models'

export default class TabsController {
  constructor(...tabs: TabItem[]) {
    this.tabs = []
    this.addTabs('', ...tabs)
    this.switch('')
  }

  tabs: TabItem[]
  activeName = ''

  tabGroup: Map<string, TabItem[]> = new Map<string, TabItem[]>()

  addTabs(group: string, ...tabs: TabItem[]): void {
    group = group || ''
    if (!this.tabGroup.has(group)) {
      this.tabGroup.set(group, [])
    }
    this.tabGroup.get(group)?.push(...tabs)
  }

  group = ''
  switch(group: string, activeName: string | null = null) {
    this.tabs = this.tabGroup.get(group || '') as TabItem[]
    this.group = group

    // 激活选项卡
    if (activeName) {
      this.active(activeName)
    } else {
      // 默认第一页
      this.activeName = this.tabs.length ? this.tabs[0].name : ''
    }
  }

  active(name: string) {
    const tab = this.tabs.find((m) => m.name == name || (m.alias && m.alias.indexOf(name) >= 0))
    if (tab) {
      this.activeName = tab.name
    }
  }
}
