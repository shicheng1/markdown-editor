import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { EditorView, type ViewUpdate } from '@codemirror/view'
import { undo, redo } from '@codemirror/commands'
import { openSearchPanel, search } from '@codemirror/search'
import { useTheme } from '../../context/ThemeContext'
import './Editor.css'

export interface EditorHandle {
  insertText: (text: string) => void
  replaceSelection: (text: string) => void
  getEditorView: () => unknown
  undo: () => void
  redo: () => void
  openFindReplace: () => void
  focus: () => void
}

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onCursorChange?: (line: number, col: number) => void
  onDropImage?: (files: File[]) => void
  onPasteImage?: (file: File) => void
}

function getView(editorRef: React.RefObject<ReactCodeMirrorRef | null>): EditorView | undefined {
  const cmRef = editorRef.current as ReactCodeMirrorRef | null
  return cmRef?.view
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ value, onChange, onCursorChange, onDropImage, onPasteImage }, ref) => {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<ReactCodeMirrorRef>(null)

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      const view = getView(editorRef)
      if (view) {
        const cursor = view.state.selection.main.head
        view.dispatch({ changes: { from: cursor, insert: text } })
      }
    },
    replaceSelection: (text: string) => {
      const view = getView(editorRef)
      if (view) {
        const { from, to } = view.state.selection.main
        view.dispatch({ changes: { from, to, insert: text } })
      }
    },
    getEditorView: () => editorRef.current,
    undo: () => {
      const view = getView(editorRef)
      if (view) undo(view)
    },
    redo: () => {
      const view = getView(editorRef)
      if (view) redo(view)
    },
    openFindReplace: () => {
      const view = getView(editorRef)
      if (view) openSearchPanel(view)
    },
    focus: () => {
      const view = getView(editorRef)
      if (view) view.focus()
    }
  }))

  const handleChange = useCallback(
    (val: string) => {
      onChange(val)
    },
    [onChange]
  )

  const handleUpdate = useCallback(
    (update: ViewUpdate) => {
      if (update.state.selection && onCursorChange) {
        const pos = update.state.selection.main.head
        const lines = update.state.doc.toString().substring(0, pos).split('\n')
        const line = lines.length
        const col = lines[lines.length - 1].length + 1
        onCursorChange(line, col)
      }
    },
    [onCursorChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) return

    onDropImage?.(imageFiles)
  }, [onDropImage])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>): void => {
    const clipboardItems = Array.from(e.clipboardData.items)
    const imageItems = clipboardItems.filter(item => item.type.startsWith('image/'))

    if (imageItems.length === 0) return

    e.preventDefault()

    for (const item of imageItems) {
      const file = item.getAsFile()
      if (!file) continue
      onPasteImage?.(file)
    }
  }, [onPasteImage])

  return (
    <div
      className="editor-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={handleChange}
        onUpdate={handleUpdate}
        theme={resolvedTheme === 'dark' ? githubDark : githubLight}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
          search()
        ]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          autocompletion: false,
          bracketMatching: true,
          closeBrackets: true,
          indentOnInput: true,
          searchKeymap: false // We handle Ctrl+F via menu IPC
        }}
        className="editor-codemirror"
      />
    </div>
  )
})

Editor.displayName = 'Editor'

export default Editor
