<template>
  <v-form as="el-form" :inline="true" @submit="submit">
    <div id="search-bar">
      <div class="search-controls">
        <slot name="controls-prev"></slot>
        <slot name="default">
          <v-field name="name" v-model="model.name" v-slot="{ field }">
            <el-form-item :label="label || '名称'" size="small">
              <el-input
                type="text"
                :clearable="clearable"
                :disabled="disabled"
                :placeholder="placeholder"
                :model-value="field.value"
                v-bind="field"
              />
            </el-form-item>
          </v-field>
        </slot>
        <slot name="controls-next"></slot>
      </div>
      <div class="search-buttons">
        <slot name="controls-button">
          <el-button type="primary" native-type="submit" size="small">
            <el-icon style="vertical-align: middle">
              <SearchIcon />
            </el-icon>
            <span style="vertical-align: middle">搜索</span>
          </el-button>
        </slot>
      </div>
    </div>
  </v-form>
</template>

<script lang="ts">
import { Vue, Options, Inject, Provide, Prop, Watch } from 'vue-property-decorator'
import { Search } from '@element-plus/icons-vue'

@Options({
  components: {
    SearchIcon: Search
  },
  emits: ['search']
})
export default class GridSearch extends Vue {
  @Prop()
  searchData: any

  @Prop()
  label?: string

  @Prop()
  clearable?: boolean

  @Prop()
  disabled?: boolean

  @Prop()
  placeholder?: string

  @Watch('searchData')
  onSearchChange(): void {
    if (this.searchData) {
      Object.assign(this.model, this.searchData)
    }
  }

  model = { name: '' }

  created() {
    this.onSearchChange()
  }

  submit(values: any) {
    this.$emit('search', values)
  }
}
</script>

<style>
#search-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

#search-bar .el-form-item {
  margin: 0px 0px 0px 10px;
}

#search-bar .search-controls {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: center;
}

#search-bar .search-controls > div {
  padding: 6px 0px;
}

#search-bar .search-buttons {
  padding-left: 20px;
}
</style>
