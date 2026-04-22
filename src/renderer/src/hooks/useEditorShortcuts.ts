import { useEffect } from 'react'
import type { EditorHandle } from '../components/Editor/Editor'

export function useEditorShortcuts(editorRef: React.RefObject<EditorHandle | null>): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const editor = editorRef.current
      if (!editor) return

      const isCtrl = e.ctrlKey || e.metaKey

      // Ctrl+B: Bold
      if (isCtrl && !e.shiftKey && e.key === 'b') {
        e.preventDefault()
        editor.replaceSelection('**粗体文本**')
        return
      }

      // Ctrl+I: Italic
      if (isCtrl && !e.shiftKey && e.key === 'i') {
        e.preventDefault()
        editor.replaceSelection('*斜体文本*')
        return
      }

      // Ctrl+1: H1
      if (isCtrl && !e.shiftKey && e.key === '1') {
        e.preventDefault()
        editor.insertText('# ')
        return
      }

      // Ctrl+2: H2
      if (isCtrl && !e.shiftKey && e.key === '2') {
        e.preventDefault()
        editor.insertText('## ')
        return
      }

      // Ctrl+3: H3
      if (isCtrl && !e.shiftKey && e.key === '3') {
        e.preventDefault()
        editor.insertText('### ')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [editorRef])
}
