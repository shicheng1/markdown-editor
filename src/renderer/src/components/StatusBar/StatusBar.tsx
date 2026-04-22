import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import './StatusBar.css'

interface StatusBarProps {
  wordCount: number
  charCount: number
  lineCount: number
  cursorLine: number
  cursorCol: number
}

function StatusBar({
  wordCount,
  charCount,
  lineCount,
  cursorLine,
  cursorCol
}: StatusBarProps): React.JSX.Element {
  const { theme } = useTheme()

  const themeLabel = theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        <span className="statusbar-item">
          {lineCount} 行
        </span>
        <span className="statusbar-item">
          {wordCount} 词
        </span>
        <span className="statusbar-item">
          {charCount} 字符
        </span>
      </div>
      <div className="statusbar-right">
        <span className="statusbar-item">
          行 {cursorLine}, 列 {cursorCol}
        </span>
        <span className="statusbar-item statusbar-theme">
          {themeLabel}
        </span>
      </div>
    </div>
  )
}

export default StatusBar
