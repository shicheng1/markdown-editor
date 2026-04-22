import { app, Menu, BrowserWindow, shell, dialog } from 'electron'

export function buildMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const, label: '关于 Markdown Editor' },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),

    {
      label: '文件',
      submenu: [
        {
          label: '新建文件',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new-file')
        },
        {
          label: '打开文件...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open-file')
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save')
        },
        {
          label: '另存为...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        {
          label: '导出为 PDF',
          click: () => mainWindow.webContents.send('menu:export-pdf')
        },
        {
          label: '导出为 HTML',
          click: () => mainWindow.webContents.send('menu:export-html')
        },
        {
          label: '导出为 Markdown',
          click: () => mainWindow.webContents.send('menu:export-md')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow.webContents.send('menu:undo')
        },
        {
          label: '重做',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => mainWindow.webContents.send('menu:redo')
        },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
        { type: 'separator' },
        {
          label: '查找和替换',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow.webContents.send('menu:find')
        }
      ]
    },

    {
      label: '视图',
      submenu: [
        {
          label: '切换主题',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => mainWindow.webContents.send('menu:toggle-theme')
        },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
        { role: 'toggleDevTools', label: '开发者工具' }
      ]
    },

    {
      label: '窗口',
      submenu: [
        {
          label: '新建标签',
          accelerator: 'CmdOrCtrl+T',
          click: () => mainWindow.webContents.send('menu:new-tab')
        },
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: '前置所有窗口' }
            ]
          : [
              { type: 'separator' as const },
              { role: 'close' as const, label: '关闭窗口' }
            ])
      ]
    },

    {
      label: '帮助',
      submenu: [
        {
          label: '关于 Markdown Editor',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'Markdown Editor',
              detail: '版本 1.0.0\n一个功能完善的 Markdown 编辑器\n\n技术栈: React + Electron + CodeMirror'
            })
          }
        },
        {
          label: 'Markdown 语法帮助',
          click: () => shell.openExternal('https://www.markdownguide.org/basic-syntax/')
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
