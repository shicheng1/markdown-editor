import React from 'react'
import { useTab } from '../../context/TabContext'
import './TabBar.css'

function TabBar(): React.JSX.Element {
  const { tabs, activeTabId, switchTab, closeTab, createTab } = useTab()

  const handleClose = (e: React.MouseEvent, tabId: string): void => {
    e.stopPropagation()
    closeTab(tabId)
  }

  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            <span className="tab-title">
              {tab.isDirty && <span className="tab-dirty">●</span>}
              {tab.fileName}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleClose(e, tab.id)}
              title="关闭标签"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button className="tab-new" onClick={() => createTab()} title="新建标签 (Ctrl+T)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default TabBar
