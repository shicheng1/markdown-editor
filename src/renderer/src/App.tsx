import React, { useRef, useState, useCallback, useEffect } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { TabProvider, useTab } from './context/TabContext'
import Editor, { type EditorHandle } from './components/Editor/Editor'
import Preview from './components/Preview/Preview'
import Toolbar from './components/Toolbar/Toolbar'
import TabBar from './components/TabBar/TabBar'
import StatusBar from './components/StatusBar/StatusBar'
import { useEditorShortcuts } from './hooks/useEditorShortcuts'
import { exportHTML, exportPDF, exportMarkdown, usePrint } from './utils/export'
import './assets/styles/global.css'

type ViewMode = 'split' | 'editor' | 'preview'

function AppContent(): React.JSX.Element {
  const editorRef = useRef<EditorHandle>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const {
    tabs,
    activeTabId,
    activeTab,
    createTab,
    closeTab,
    switchTab,
    updateTabContent,
    updateTabFileState,
    markTabSaved,
    updateTabCursor,
    getStats
  } = useTab()
  const { toggleTheme } = useTheme()
  const [splitRatio, setSplitRatio] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const stats = getStats(activeTabId)

  // Editor shortcuts (Ctrl+B, Ctrl+I, etc.)
  useEditorShortcuts(editorRef)

  // File operations
  const handleNewFile = useCallback(() => {
    const id = createTab()
    switchTab(id)
    editorRef.current?.focus()
  }, [createTab, switchTab])

  const handleOpenFile = useCallback(async () => {
    const api = window.electronAPI
    if (!api) return

    const result = await api.dialog.openFile({
      title: '打开文件',
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return

    const filePath = result.filePaths[0]
    const fileResult = await api.fs.readFile(filePath)
    if (!fileResult.success || fileResult.content === undefined) return
    const fileName = filePath.split(/[\\/]/).pop() ?? '未命名'

    const id = createTab(fileResult.content, fileName, filePath)
    switchTab(id)
    editorRef.current?.focus()
  }, [createTab, switchTab])

  const handleSave = useCallback(async () => {
    const api = window.electronAPI
    if (!api || !activeTab) return

    const content = activeTab.content
    if (activeTab.filePath) {
      await api.fs.writeFile(activeTab.filePath, content)
      markTabSaved(activeTabId)
    } else {
      // No file path — do save-as
      const result = await api.dialog.saveFile({
        title: '另存为',
        defaultPath: activeTab.fileName,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      })
      if (!result.canceled && result.filePath) {
        await api.fs.writeFile(result.filePath, content)
        const fileName = result.filePath.split(/[\\/]/).pop() ?? activeTab.fileName
        updateTabFileState(activeTabId, { filePath: result.filePath, fileName, lastSavedContent: content })
      }
    }
  }, [activeTab, activeTabId, markTabSaved, updateTabFileState])

  const handleSaveAs = useCallback(async () => {
    const api = window.electronAPI
    if (!api || !activeTab) return

    const content = activeTab.content
    const result = await api.dialog.saveFile({
      title: '另存为',
      defaultPath: activeTab.filePath ?? activeTab.fileName,
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
    })
    if (!result.canceled && result.filePath) {
      await api.fs.writeFile(result.filePath, content)
      const fileName = result.filePath.split(/[\\/]/).pop() ?? activeTab.fileName
      updateTabFileState(activeTabId, { filePath: result.filePath, fileName, lastSavedContent: content })
    }
  }, [activeTab, activeTabId, updateTabFileState])

  const handleSaveAndClose = useCallback(async () => {
    const api = window.electronAPI
    if (!api || !activeTab) return

    const content = activeTab.content
    if (activeTab.filePath) {
      await api.fs.writeFile(activeTab.filePath, content)
      markTabSaved(activeTabId)
    } else {
      const result = await api.dialog.saveFile({
        title: '另存为',
        defaultPath: activeTab.fileName,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
      })
      if (result.canceled || !result.filePath) return
      await api.fs.writeFile(result.filePath, content)
      const fileName = result.filePath.split(/[\\/]/).pop() ?? activeTab.fileName
      updateTabFileState(activeTabId, { filePath: result.filePath, fileName, lastSavedContent: content })
    }
    closeTab(activeTabId)
  }, [activeTab, activeTabId, markTabSaved, updateTabFileState, closeTab])

  // Export operations
  const handleExportPDF = useCallback(() => {
    exportPDF(previewRef)
  }, [])

  const handleExportHTML = useCallback(() => {
    exportHTML(previewRef)
  }, [])

  const handleExportMD = useCallback(() => {
    exportMarkdown(activeTab?.content ?? '')
  }, [activeTab])

  const handlePrint = usePrint(previewRef)

  // Get document directory for image operations
  const getDocDir = useCallback(async (): Promise<string> => {
    if (activeTab?.filePath) {
      const parts = activeTab.filePath.split(/[\/]/)
      parts.pop()
      return parts.join('/') || parts.join('\\')
    }
    // 确保返回一个存在且可写的目录
    const result = await window.electronAPI?.fs.getDefaultDir()
    if (result?.dir) {
      // 尝试创建文档目录
      try {
        await window.electronAPI?.fs.mkdir(result.dir)
      } catch (e) {
        // 目录已存在或创建失败，忽略错误
      }
      return result.dir
    }
    // 如果文档目录不可用，使用当前工作目录
    return '.'
  }, [activeTab?.filePath])

  // Handle dropped image files
  const handleDropImage = useCallback(async (files: File[]) => {
    console.log('处理拖放图片:', files)
    const docDir = await getDocDir()
    console.log('文档目录:', docDir)
    if (!docDir) return
    const api = window.electronAPI
    if (!api || !editorRef.current) return

    for (const file of files) {
      // For dropped files from OS, we have the path via file.path (Electron extends File)
      const filePath = (file as any).path as string | undefined
      console.log('文件路径:', filePath)
      if (filePath) {
        const result = await api.fs.copyImageToAssets(filePath, docDir)
        console.log('保存结果:', result)
        if (result.success && result.relativePath) {
          const fileName = result.relativePath.split('/').pop() || 'image'
          editorRef.current.insertText(`\n![${fileName}](${result.relativePath})\n`)
        } else {
          console.error('保存失败:', result.error)
        }
      }
    }
  }, [getDocDir])

  // Handle pasted image files
  const handlePasteImage = useCallback(async (file: File) => {
    const docDir = await getDocDir()
    if (!docDir) return
    const api = window.electronAPI
    if (!api || !editorRef.current) return

    // Write blob to temp file first, then copy to assets
    const arrayBuffer = await file.arrayBuffer()
    const tempDir = await api.fs.getDefaultDir()
    const tempPath = `${tempDir.dir}/temp_paste_${Date.now()}.${file.name.split('.').pop() || 'png'}`
    await api.fs.writeBinaryFile(tempPath, arrayBuffer)

    const result = await api.fs.copyImageToAssets(tempPath, docDir)
    if (result.success && result.relativePath) {
      const fileName = result.relativePath.split('/').pop() || 'image'
      editorRef.current.insertText(`\n![${fileName}](${result.relativePath})\n`)
    }
    // Clean up temp file (best effort)
  }, [getDocDir])

  // Insert image via IPC dialog
  const handleInsertImage = useCallback(async () => {
    console.log('handleInsertImage 被调用')
    const api = window.electronAPI
    if (!api || !editorRef.current) return

    try {
      const result = await api.dialog.openImage()
      console.log('打开图片对话框结果:', result)
      if (result.canceled || result.filePaths.length === 0) return

      const docDir = await getDocDir()
      console.log('文档目录:', docDir)
      if (!docDir) return

      const filePath = result.filePaths[0]
      console.log('选择的图片文件路径:', filePath)
      const copyResult = await api.fs.copyImageToAssets(filePath, docDir)
      console.log('复制图片到assets结果:', copyResult)
      if (copyResult.success && copyResult.relativePath) {
        const fileName = copyResult.relativePath.split('/').pop() || 'image'
        editorRef.current.insertText(`\n![${fileName}](${copyResult.relativePath})\n`)
        console.log('图片链接已插入编辑器')
      } else {
        console.error('图片复制失败:', copyResult.error)
      }
    } catch (error) {
      console.error('Failed to insert image:', error)
    }
  }, [getDocDir])

  // Register menu event listeners
  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    const handlers: Record<string, () => void> = {
      'menu:new-file': handleNewFile,
      'menu:new-tab': handleNewFile,
      'menu:open-file': handleOpenFile,
      'menu:save': handleSave,
      'menu:save-as': handleSaveAs,
      'menu:export-pdf': handleExportPDF,
      'menu:export-html': handleExportHTML,
      'menu:export-md': handleExportMD,
      'menu:undo': () => editorRef.current?.undo(),
      'menu:redo': () => editorRef.current?.redo(),
      'menu:find': () => editorRef.current?.openFindReplace(),
      'menu:toggle-theme': toggleTheme
    }

    // Also listen for save-and-close from main process
    const saveAndCloseHandler = (): void => {
      handleSaveAndClose()
    }
    api.menu.onMenuItem('menu:save-and-close', saveAndCloseHandler)

    Object.entries(handlers).forEach(([channel, handler]) => {
      api.menu.onMenuItem(channel, handler)
    })

    return () => {
      Object.keys(handlers).forEach((channel) => {
        api.menu.removeAllListeners(channel)
      })
      api.menu.removeAllListeners('menu:save-and-close')
    }
  }, [handleNewFile, handleOpenFile, handleSave, handleSaveAs, handleExportPDF, handleExportHTML, handleExportMD, handleSaveAndClose, toggleTheme])

  // Drag to resize split panes
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      const container = document.querySelector('.main-content')
      if (!container) return
      const rect = container.getBoundingClientRect()
      const ratio = ((moveEvent.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(80, Math.max(20, ratio)))
    }

    const handleMouseUp = (): void => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  return (
    <div className="app">
      <TabBar />

      <Toolbar
        editorRef={editorRef}
        onExportPDF={handleExportPDF}
        onExportHTML={handleExportHTML}
        onPrint={handlePrint}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onInsertImage={handleInsertImage}
      />

      <div className="main-content">
        {viewMode !== 'preview' && (
          <div
            className="pane editor-pane"
            style={{ width: viewMode === 'split' ? `${splitRatio}%` : '100%' }}
          >
            <div className="pane-header">
              <span className="pane-title">Markdown</span>
            </div>
            <Editor
              ref={editorRef}
              value={activeTab?.content ?? ''}
              onChange={(val) => updateTabContent(activeTabId, val)}
              onCursorChange={(line, col) => updateTabCursor(activeTabId, line, col)}
              onDropImage={handleDropImage}
              onPasteImage={handlePasteImage}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div
            className={`pane-divider ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
          >
            <div className="divider-handle" />
          </div>
        )}

        {viewMode !== 'editor' && (
          <div
            className="pane preview-pane"
            style={{ width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%' }}
          >
            <div className="pane-header">
              <span className="pane-title">预览</span>
            </div>
            <Preview ref={previewRef} content={activeTab?.content ?? ''} docDir={activeTab?.filePath ? activeTab.filePath.replace(/[\\/][^\\/]+$/, '').replace(/\\/g, '/') : ''} />
          </div>
        )}
      </div>

      <StatusBar
        wordCount={stats.wordCount}
        charCount={stats.charCount}
        lineCount={stats.lineCount}
        cursorLine={activeTab?.cursorLine ?? 1}
        cursorCol={activeTab?.cursorCol ?? 1}
      />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <TabProvider>
        <AppContent />
      </TabProvider>
    </ThemeProvider>
  )
}

export default App
