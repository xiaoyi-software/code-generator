<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{
  modelValue?: string
  height?: number
  readOnly?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = ref<HTMLDivElement>()
let view: EditorView | null = null

// 自定义 Liquid 语法高亮规则
const liquidSyntax = EditorView.theme({
  // Liquid 标签样式
  '.cm-liquid-tag': { color: '#569CD6' }, // 标签颜色
  '.cm-liquid-variable': { color: '#9CDCFE' }, // 变量颜色
  '.cm-liquid-string': { color: '#CE9178' }, // 字符串颜色
  '.cm-liquid-keyword': { color: '#C586C0' }, // 关键字颜色
  '.cm-liquid-operator': { color: '#D4D4D4' }, // 操作符颜色
  '.cm-liquid-comment': { color: '#6A9955' } // 注释颜色
})

// 初始化编辑器
const initEditor = () => {
  if (!editorRef.value) return

  const startState = EditorState.create({
    doc: props.modelValue || '',
    extensions: [
      basicSetup,
      oneDark,
      liquidSyntax,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString()
          emit('update:modelValue', value)
          emit('change', value)
        }
      }),
      EditorView.theme({
        '&': {
          height: `${props.height || 400}px`,
          border: '1px solid var(--el-border-color)',
          borderRadius: '4px'
        },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': {
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        },
        '.cm-line': {
          padding: '0 4px'
        }
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
          insert: newValue || ''
        }
      })
    }
  }
)

// 监听高度变化
watch(
  () => props.height,
  (newHeight) => {
    if (view) {
      // 销毁旧的编辑器实例
      view.destroy()
      // 重新初始化编辑器
      initEditor()
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
  <div class="liquid-editor-container">
    <div ref="editorRef" class="liquid-editor"></div>
  </div>
</template>

<style scoped>
.liquid-editor-container {
  width: 100%;
  position: relative;
}

.liquid-editor {
  width: 100%;
}
</style>
