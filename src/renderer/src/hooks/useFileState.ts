import { useState, useCallback, useEffect } from 'react'

interface FileState {
  filePath: string | null
  fileName: string
  isDirty: boolean
  lastSavedContent: string
}

export function useFileState(content: string) {
  const [fileState, setFileState] = useState<FileState>({
    filePath: null,
    fileName: '未命名',
    isDirty: false,
    lastSavedContent: content
  })

  // Track dirty state
  useEffect(() => {
    const isDirty = content !== fileState.lastSavedContent
    if (isDirty !== fileState.isDirty) {
      setFileState((prev) => ({ ...prev, isDirty }))
      window.electronAPI?.window.setDocumentEdited(isDirty)
    }
  }, [content, fileState.lastSavedContent, fileState.isDirty])

  // Update window title
  useEffect(() => {
    const prefix = fileState.isDirty ? '● ' : ''
    const title = `${prefix}${fileState.fileName} - Markdown Editor`
    window.electronAPI?.window.setTitle(title)
    if (fileState.filePath) {
      window.electronAPI?.window.setRepresentedFilename(fileState.filePath)
    }
  }, [fileState.fileName, fileState.isDirty, fileState.filePath])

  const newFile = useCallback((): string => {
    setFileState({
      filePath: null,
      fileName: '未命名',
      isDirty: false,
      lastSavedContent: ''
    })
    return ''
  }, [])

  const openFile = useCallback(async (): Promise<string | null> => {
    const result = await window.electronAPI?.dialog.openFile({
      title: '打开 Markdown 文件',
      filters: [{ name: 'Markdown 文件', extensions: ['md', 'markdown', 'txt'] }]
    })
    if (result && !result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const fileResult = await window.electronAPI?.fs.readFile(filePath)
      if (fileResult?.success && fileResult.content !== undefined) {
        const fileName = filePath.split(/[\\/]/).pop() || '未命名'
        setFileState({
          filePath,
          fileName,
          isDirty: false,
          lastSavedContent: fileResult.content
        })
        return fileResult.content
      }
    }
    return null
  }, [])

  const saveFile = useCallback(
    async (currentContent: string): Promise<boolean> => {
      if (fileState.filePath) {
        const result = await window.electronAPI?.fs.writeFile(fileState.filePath, currentContent)
        if (result?.success) {
          setFileState((prev) => ({ ...prev, isDirty: false, lastSavedContent: currentContent }))
          return true
        }
        return false
      }
      return saveFileAs(currentContent)
    },
    [fileState.filePath]
  )

  const saveFileAs = useCallback(async (currentContent: string): Promise<boolean> => {
    const defaultPath = fileState.filePath || 'untitled.md'
    const result = await window.electronAPI?.dialog.saveFile({
      title: '另存为',
      defaultPath,
      filters: [{ name: 'Markdown 文件', extensions: ['md', 'markdown'] }]
    })
    if (result && !result.canceled && result.filePath) {
      const writeResult = await window.electronAPI?.fs.writeFile(result.filePath, currentContent)
      if (writeResult?.success) {
        const fileName = result.filePath.split(/[\\/]/).pop() || '未命名'
        setFileState({
          filePath: result.filePath,
          fileName,
          isDirty: false,
          lastSavedContent: currentContent
        })
        return true
      }
    }
    return false
  }, [fileState.filePath])

  return {
    fileState,
    newFile,
    openFile,
    saveFile,
    saveFileAs
  }
}
