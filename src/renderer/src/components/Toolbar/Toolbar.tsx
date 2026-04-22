import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import type { EditorHandle } from '../Editor/Editor'
import './Toolbar.css'

type ViewMode = 'split' | 'editor' | 'preview'

interface ToolbarProps {
  editorRef: React.RefObject<EditorHandle | null>
  onExportPDF: () => void
  onExportHTML: () => void
  onPrint: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onInsertImage: () => void
}

/* ─── SVG Icon Components ─── */

const IconH1: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3v10M2 8h6M8 3v10M12 3c-1.5 0-2.5 1-2.5 2.5S10.5 8 12 8c-1.5 0-2.5 1-2.5 2.5S10.5 13 12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconH2: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3v10M2 8h6M8 3v10M11.5 5.5h3M13 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconH3: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3v10M2 8h6M8 3v10M11 8.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2M11 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconBold: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3h4.5a2.5 2.5 0 0 1 0 5H4V3zM4 8h5a2.5 2.5 0 0 1 0 5H4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconItalic: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3H6M10 13H6M8.5 2.5L6.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconStrikethrough: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4h6M7 4c1.5 0 3 .5 3 2s-1.5 2-3 2M3 8h10M3 12h6c1.5 0 3-.5 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconQuote: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h10M3 7h10M3 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 10l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconInlineCode: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 4L2 8l3.5 4M10.5 4L14 8l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconCodeBlock: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 6.5L3.5 8l2 1.5M10.5 6.5l2 1.5-2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconLink: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 9a3 3 0 0 0 4.24 0l1.42-1.42a3 3 0 0 0-4.24-4.24L7.5 4.24M9 7a3 3 0 0 0-4.24 0L3.34 8.42a3 3 0 0 0 4.24 4.24L8.5 11.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconImage: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 11l3-3 2 2 3-4 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconUnorderedList: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="4" r="1" fill="currentColor"/>
    <circle cx="3" cy="8" r="1" fill="currentColor"/>
    <circle cx="3" cy="12" r="1" fill="currentColor"/>
    <path d="M7 4h7M7 8h7M7 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconOrderedList: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="1" y="5.5" fontSize="5" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">1</text>
    <text x="1" y="9.5" fontSize="5" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">2</text>
    <text x="1" y="13.5" fontSize="5" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">3</text>
    <path d="M7 4h7M7 8h7M7 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconTaskList: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 4.5l.7.7L5.5 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1.5" y="7.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1.5" y="12.5" width="4" height="1" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 4.5h6M8 9.5h6M8 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconTable: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1.5 6h13M1.5 10h13M6 2.5v11" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const IconHorizontalRule: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconPDF: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="1.5" width="10" height="13" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 5.5h4M6 8h4M6 10.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconHTML: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2l1.5 12L8 15l3.5-1L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 5h5M6 8h4M6.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const IconPrint: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="9" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 11H2.5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 2v3M11 2v3M5 9V7h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconSun: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconMoon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8.5A6.5 6.5 0 0 1 7.5 2 6.5 6.5 0 1 0 14 8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconComputer: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 14h6M8 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconSplitView: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="5" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9.5" y="2.5" width="5" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const IconEditorView: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 6l2 2-2 2M9 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconPreviewView: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 8a3 3 0 0 1 6 0 3 3 0 0 1-6 0z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
  </svg>
)

/* ─── Toolbar Component ─── */

function Toolbar({ editorRef, onExportPDF, onExportHTML, onPrint, viewMode, onViewModeChange, onInsertImage }: ToolbarProps): React.JSX.Element {
  const { theme, setTheme, toggleTheme } = useTheme()

  const handleFormat = (type: string): void => {
    const editor = editorRef.current
    if (!editor) return

    const actions: Record<string, { before: string; after: string; placeholder?: string }> = {
      h1: { before: '# ', after: '' },
      h2: { before: '## ', after: '' },
      h3: { before: '### ', after: '' },
      bold: { before: '**', after: '**', placeholder: '粗体文本' },
      italic: { before: '*', after: '*', placeholder: '斜体文本' },
      strikethrough: { before: '~~', after: '~~', placeholder: '删除线文本' },
      quote: { before: '> ', after: '' },
      code: { before: '`', after: '`', placeholder: '代码' },
      codeblock: { before: '```\n', after: '\n```' },
      link: { before: '[', after: '](url)', placeholder: '链接文本' },
      ul: { before: '- ', after: '' },
      ol: { before: '1. ', after: '' },
      task: { before: '- [ ] ', after: '' },
      table: { before: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| ', after: ' | | |' },
      hr: { before: '\n---\n', after: '' }
    }

    const format = actions[type]
    if (format) {
      const text = format.placeholder ? format.before + format.placeholder + format.after : format.before + format.after
      editor.replaceSelection(text)
    }
  }

  const cycleTheme = (): void => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = (): React.JSX.Element => {
    switch (theme) {
      case 'light': return <IconSun />
      case 'dark': return <IconMoon />
      case 'system': return <IconComputer />
    }
  }

  const getThemeLabel = (): string => {
    switch (theme) {
      case 'light': return '浅色'
      case 'dark': return '深色'
      case 'system': return '跟随系统'
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {/* Format group */}
        <div className="toolbar-group">
          <button className="toolbar-btn" title="标题 1 (Ctrl+1)" onClick={() => handleFormat('h1')}>
            <IconH1 />
          </button>
          <button className="toolbar-btn" title="标题 2 (Ctrl+2)" onClick={() => handleFormat('h2')}>
            <IconH2 />
          </button>
          <button className="toolbar-btn" title="标题 3 (Ctrl+3)" onClick={() => handleFormat('h3')}>
            <IconH3 />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button className="toolbar-btn" title="加粗 (Ctrl+B)" onClick={() => handleFormat('bold')}>
            <IconBold />
          </button>
          <button className="toolbar-btn" title="斜体 (Ctrl+I)" onClick={() => handleFormat('italic')}>
            <IconItalic />
          </button>
          <button className="toolbar-btn" title="删除线" onClick={() => handleFormat('strikethrough')}>
            <IconStrikethrough />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Insert group */}
        <div className="toolbar-group">
          <button className="toolbar-btn" title="引用" onClick={() => handleFormat('quote')}>
            <IconQuote />
          </button>
          <button className="toolbar-btn" title="行内代码" onClick={() => handleFormat('code')}>
            <IconInlineCode />
          </button>
          <button className="toolbar-btn" title="代码块" onClick={() => handleFormat('codeblock')}>
            <IconCodeBlock />
          </button>
          <button className="toolbar-btn" title="链接" onClick={() => handleFormat('link')}>
            <IconLink />
          </button>
          <button className="toolbar-btn" title="插入图片" onClick={onInsertImage}>
            <IconImage />
          </button>
          <button className="toolbar-btn" title="无序列表" onClick={() => handleFormat('ul')}>
            <IconUnorderedList />
          </button>
          <button className="toolbar-btn" title="有序列表" onClick={() => handleFormat('ol')}>
            <IconOrderedList />
          </button>
          <button className="toolbar-btn" title="任务列表" onClick={() => handleFormat('task')}>
            <IconTaskList />
          </button>
          <button className="toolbar-btn" title="表格" onClick={() => handleFormat('table')}>
            <IconTable />
          </button>
          <button className="toolbar-btn" title="分割线" onClick={() => handleFormat('hr')}>
            <IconHorizontalRule />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* View mode toggle */}
        <div className="toolbar-view-mode">
          <button
            className={`toolbar-view-btn ${viewMode === 'split' ? 'active' : ''}`}
            title="分屏视图"
            onClick={() => onViewModeChange('split')}
          >
            <IconSplitView />
          </button>
          <button
            className={`toolbar-view-btn ${viewMode === 'editor' ? 'active' : ''}`}
            title="编辑器视图"
            onClick={() => onViewModeChange('editor')}
          >
            <IconEditorView />
          </button>
          <button
            className={`toolbar-view-btn ${viewMode === 'preview' ? 'active' : ''}`}
            title="预览视图"
            onClick={() => onViewModeChange('preview')}
          >
            <IconPreviewView />
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        {/* Export group */}
        <div className="toolbar-group">
          <button className="toolbar-btn" title="导出 PDF" onClick={onExportPDF}>
            <IconPDF />
            <span className="toolbar-btn-label">PDF</span>
          </button>
          <button className="toolbar-btn" title="导出 HTML" onClick={onExportHTML}>
            <IconHTML />
            <span className="toolbar-btn-label">HTML</span>
          </button>
          <button className="toolbar-btn" title="打印" onClick={onPrint}>
            <IconPrint />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Theme toggle */}
        <button
          className="toolbar-btn toolbar-theme-btn"
          title={`主题: ${getThemeLabel()}`}
          onClick={cycleTheme}
        >
          {getThemeIcon()}
        </button>
      </div>
    </div>
  )
}

export default Toolbar
