<template>
  <el-dropdown :hide-on-click="false" trigger="click" @command="change">
    <span class="el-dropdown-link">
      列配置<el-icon class="el-icon--right"><arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu id="grid-column-selector">
        <VueDraggable v-model="gridColumns" :animation="150" @sort="sort">
          <el-dropdown-item
            v-for="element in gridColumns"
            :key="element.name"
            :command="element"
            :disabled="!element.isDynamic"
          >
            <el-icon>
              <check v-if="element.isDefault" />
              <minus v-else />
            </el-icon>
            {{ element.displayName }}</el-dropdown-item
          >
        </VueDraggable>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { DynamicGridColumn } from '@/services/DynamicModels'
import { defineComponent, inject, ref, watch } from 'vue'
// import draggable from 'vuedraggable'
import { type DraggableEvent, type UseDraggableReturn, VueDraggable } from 'vue-draggable-plus'
import { ArrowDown, Check, Minus } from '@element-plus/icons-vue'

export default defineComponent({
  components: {
    VueDraggable,
    // draggable,
    ArrowDown,
    Check,
    Minus
  },
  props: {
    columns: {
      type: Array
    }
  },
  emits: ['change'],
  setup(props, { attrs, slots, emit }) {
    // 操作持久存储
    const persistStore = inject<{
      state: { columns: any[] }
      action: { updateColumns: (value: any) => void }
    }>('persistStore')

    const gridColumns = ref<DynamicGridColumn[]>([])
    const change = (value: any) => {
      value.isDefault = !value.isDefault
      emit('change', gridColumns.value)
    }

    const sort = (event: any) => {
      emit('change', gridColumns.value)
    }

    let init = false
    watch(
      () => props.columns,
      (newValue: any) => {
        let columns = props.columns as DynamicGridColumn[]
        if (!init) {
          init = true
          if (persistStore && persistStore.state.columns.length == columns.length) {
            // 从缓存获取
            const temp: any[] = []
            // 取交集
            for (let j = 0; j < persistStore.state.columns.length; j++) {
              for (let i = 0; i < columns.length; i++) {
                if (columns[i].name === persistStore.state.columns[j].name) {
                  Object.assign(columns[i], persistStore.state.columns[j])
                  temp.push(columns[i])
                }
              }
            }

            // 如交集一致则使用缓存
            if (temp.length == columns.length) {
              columns = temp
              emit('change', columns)
            }
          }
        }

        gridColumns.value = columns
        persistStore?.action.updateColumns(gridColumns.value)
      }
    )

    return {
      gridColumns: gridColumns,
      change: change,
      sort: sort
    }
  }
})
</script>
