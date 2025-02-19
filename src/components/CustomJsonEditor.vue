<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'

const props = defineProps<{
  modelValue?: string
  height?: number
  readOnly?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = ref<HTMLDivElement>()
let view: EditorView | null = null

// 格式化JSON
const formatJson = (value: any): string => {
  try {
    if (!value) return ''
    const jsonObj = typeof value === 'string' ? JSON.parse(value) : value
    return JSON.stringify(jsonObj, null, 2)
  } catch {
    return typeof value === 'string' ? value : ''
  }
}

// 初始化编辑器
const initEditor = () => {
  if (!editorRef.value) return

  const startState = EditorState.create({
    doc: formatJson(props.modelValue),
    extensions: [
      basicSetup,
      json(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString()
          emit('update:modelValue', value)
          emit('change', value)
        }
      }),
      EditorView.theme({
        '&': {
          height: `${props.height || 200}px`,
          border: '1px solid var(--el-border-color)',
          borderRadius: '4px'
        },
        '.cm-scroller': { overflow: 'auto' }
      }),
      EditorState.readOnly.of(props.readOnly || false)
    ]
  })

  view = new EditorView({
    state: startState,
    parent: editorRef.value
  })
}

// 监听值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (view && view.state.doc.toString() !== newValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: formatJson(newValue)
        }
      })
    }
  }
)

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
  }
})
</script>

<template>
  <div class="json-editor-container">
    <div ref="editorRef" class="json-editor"></div>
  </div>
</template>

<style scoped>
.json-editor-container {
  width: 100%;
  position: relative;
}

.json-editor {
  width: 100%;
}
</style>
