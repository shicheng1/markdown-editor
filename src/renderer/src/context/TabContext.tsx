import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'

const DEFAULT_CONTENT = `# 欢迎使用 Markdown 编辑器 ✨

这是一个功能完善的 Markdown 编辑查看器，支持实时预览、语法高亮、导出和主题切换。

## 功能特性

- **实时预览** — 左侧编辑，右侧即时渲染
- **语法高亮** — 代码块支持多种语言高亮
- **主题切换** — 浅色 / 深色 / 跟随系统
- **导出功能** — 支持 PDF 和 HTML 导出

## 代码示例

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome to Markdown Editor\` };
}

greet('World');
\`\`\`

## 表格示例

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| 实时预览 | ✅ | 编辑即预览 |
| 语法高亮 | ✅ | 多语言支持 |
| 导出 PDF | ✅ | 一键导出 |
| 主题切换 | ✅ | 三种模式 |

## 引用

> 好的工具让创作更加专注。
> 
> — Markdown 编辑器

---

*使用工具栏按钮快速插入 Markdown 语法，或使用键盘快捷键。*
`

export interface Tab {
  id: string
  fileName: string
  filePath: string | null
  content: string
  lastSavedContent: string
  isDirty: boolean
  cursorLine: number
  cursorCol: number
}

interface TabState {
  tabs: Tab[]
  activeTabId: string
}

type TabAction =
  | { type: 'CREATE_TAB'; payload: { id: string; tab: Tab } }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SWITCH_TAB'; payload: string }
  | { type: 'UPDATE_CONTENT'; payload: { id: string; content: string } }
  | { type: 'UPDATE_FILE_STATE'; payload: { id: string; updates: Partial<Pick<Tab, 'fileName' | 'filePath' | 'lastSavedContent'>> } }
  | { type: 'MARK_SAVED'; payload: string }
  | { type: 'UPDATE_CURSOR'; payload: { id: string; line: number; col: number } }

function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case 'CREATE_TAB': {
      const newTabs = [...state.tabs, action.payload.tab]
      return { tabs: newTabs, activeTabId: action.payload.id }
    }
    case 'CLOSE_TAB': {
      const idx = state.tabs.findIndex((t) => t.id === action.payload)
      if (idx === -1) return state
      const newTabs = state.tabs.filter((t) => t.id !== action.payload)
      if (newTabs.length === 0) {
        // Create a new empty tab when closing the last one
        const newId = Date.now().toString()
        const newTab: Tab = {
          id: newId,
          fileName: '未命名',
          filePath: null,
          content: '',
          lastSavedContent: '',
          isDirty: false,
          cursorLine: 1,
          cursorCol: 1
        }
        return { tabs: [newTab], activeTabId: newId }
      }
      // Switch to adjacent tab
      const newActiveIdx = idx > 0 ? idx - 1 : 0
      return { tabs: newTabs, activeTabId: newTabs[newActiveIdx].id }
    }
    case 'SWITCH_TAB': {
      return { ...state, activeTabId: action.payload }
    }
    case 'UPDATE_CONTENT': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id
            ? { ...t, content: action.payload.content, isDirty: action.payload.content !== t.lastSavedContent }
            : t
        )
      }
    }
    case 'UPDATE_FILE_STATE': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      }
    }
    case 'MARK_SAVED': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload
            ? { ...t, isDirty: false, lastSavedContent: t.content }
            : t
        )
      }
    }
    case 'UPDATE_CURSOR': {
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.payload.id
            ? { ...t, cursorLine: action.payload.line, cursorCol: action.payload.col }
            : t
        )
      }
    }
    default:
      return state
  }
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string
  activeTab: Tab | null
  createTab: (content?: string, fileName?: string, filePath?: string) => string
  closeTab: (tabId: string) => void
  switchTab: (tabId: string) => void
  updateTabContent: (tabId: string, content: string) => void
  updateTabFileState: (tabId: string, updates: Partial<Pick<Tab, 'fileName' | 'filePath' | 'lastSavedContent'>>) => void
  markTabSaved: (tabId: string) => void
  updateTabCursor: (tabId: string, line: number, col: number) => void
  getStats: (tabId: string) => { lineCount: number; charCount: number; wordCount: number }
}

const TabContext = createContext<TabContextType | null>(null)

let tabIdCounter = 0

function makeTab(content: string, fileName: string, filePath: string | null): { id: string; tab: Tab } {
  const id = (++tabIdCounter).toString()
  return {
    id,
    tab: {
      id,
      fileName,
      filePath,
      content,
      lastSavedContent: content,
      isDirty: false,
      cursorLine: 1,
      cursorCol: 1
    }
  }
}

export function TabProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const initial = makeTab(DEFAULT_CONTENT, '未命名', null)
  const [state, dispatch] = useReducer(tabReducer, {
    tabs: [initial.tab],
    activeTabId: initial.id
  })

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId) ?? null

  const createTab = useCallback((content = '', fileName = '未命名', filePath: string | null = null): string => {
    const { id, tab } = makeTab(content, fileName, filePath)
    dispatch({ type: 'CREATE_TAB', payload: { id, tab } })
    return id
  }, [])

  const closeTab = useCallback((tabId: string): void => {
    dispatch({ type: 'CLOSE_TAB', payload: tabId })
  }, [])

  const switchTab = useCallback((tabId: string): void => {
    dispatch({ type: 'SWITCH_TAB', payload: tabId })
  }, [])

  const updateTabContent = useCallback((tabId: string, content: string): void => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { id: tabId, content } })
  }, [])

  const updateTabFileState = useCallback(
    (tabId: string, updates: Partial<Pick<Tab, 'fileName' | 'filePath' | 'lastSavedContent'>>): void => {
      dispatch({ type: 'UPDATE_FILE_STATE', payload: { id: tabId, updates } })
    },
    []
  )

  const markTabSaved = useCallback((tabId: string): void => {
    dispatch({ type: 'MARK_SAVED', payload: tabId })
  }, [])

  const updateTabCursor = useCallback((tabId: string, line: number, col: number): void => {
    dispatch({ type: 'UPDATE_CURSOR', payload: { id: tabId, line, col } })
  }, [])

  const getStats = useCallback(
    (tabId: string): { lineCount: number; charCount: number; wordCount: number } => {
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab) return { lineCount: 0, charCount: 0, wordCount: 0 }
      const lines = tab.content.split('\n')
      const lineCount = lines.length
      const charCount = tab.content.length
      const words = tab.content.trim().split(/\s+/).filter(Boolean)
      const wordCount = tab.content.trim() === '' ? 0 : words.length
      return { lineCount, charCount, wordCount }
    },
    [state.tabs]
  )

  // Update window title based on active tab
  useEffect(() => {
    if (activeTab) {
      const prefix = activeTab.isDirty ? '● ' : ''
      const title = `${prefix}${activeTab.fileName} - Markdown Editor`
      window.electronAPI?.window.setTitle(title)
      if (activeTab.filePath) {
        window.electronAPI?.window.setRepresentedFilename(activeTab.filePath)
      }
      window.electronAPI?.window.setDocumentEdited(activeTab.isDirty)
    }
  }, [activeTab])

  // Expose dirty state for close confirmation
  useEffect(() => {
    const hasDirty = state.tabs.some((t) => t.isDirty)
    ;(window as unknown as Record<string, boolean>).__hasDirtyTabs__ = hasDirty
  }, [state.tabs])

  return (
    <TabContext.Provider
      value={{
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        activeTab,
        createTab,
        closeTab,
        switchTab,
        updateTabContent,
        updateTabFileState,
        markTabSaved,
        updateTabCursor,
        getStats
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTab(): TabContextType {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTab must be used within TabProvider')
  return ctx
}
