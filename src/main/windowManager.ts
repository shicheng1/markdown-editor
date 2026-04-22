import { app, BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { buildMenu } from './menu'

const isDev = !app.isPackaged

function log(msg: string): void {
  try {
    const logPath = join(app.getPath('userData'), 'error.log')
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`, 'utf-8')
  } catch { /* ignore */ }
}

interface WindowEntry {
  window: BrowserWindow
  id: number
}

class WindowManager {
  private windows: WindowEntry[] = []

  createWindow(): BrowserWindow {
    log(`createWindow() called, isDev=${isDev}`)

    const preloadPath = join(__dirname, '../preload/index.js')
    log(`preload path: ${preloadPath}`)
    log(`preload exists: ${fs.existsSync(preloadPath)}`)

    const htmlPath = join(__dirname, '../renderer/index.html')
    log(`html path: ${htmlPath}`)
    log(`html exists: ${fs.existsSync(htmlPath)}`)

    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      title: 'Markdown Editor',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    // Allow loading local images in renderer
    win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
      // Allow file:// protocol requests for images
      callback({})
    })

    // Set menu for this window
    const menu = buildMenu(win)
    Menu.setApplicationMenu(menu)

    win.on('ready-to-show', () => {
      win.show()
    })

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Close confirmation for unsaved changes
    win.on('close', async (event) => {
      try {
        const isDirty = await win.webContents.executeJavaScript('window.__hasDirtyTabs__ === true')
        if (isDirty) {
          event.preventDefault()
          const { dialog } = await import('electron')
          const { response } = await dialog.showMessageBox(win, {
            type: 'warning',
            title: '未保存的更改',
            message: '当前文件有未保存的更改。',
            detail: '不保存就关闭将丢失这些更改。',
            buttons: ['不保存', '取消', '保存'],
            defaultId: 2,
            cancelId: 1,
            noLink: true
          })
          if (response === 0) {
            win.destroy()
          } else if (response === 2) {
            win.webContents.send('menu:save-and-close')
          }
        }
      } catch {
        // If check fails, allow close
      }
    })

    // Remove from manager when closed
    win.on('closed', () => {
      this.windows = this.windows.filter((w) => w.id !== win.id)
    })

    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
      log(`Loading dev URL: ${process.env['ELECTRON_RENDERER_URL']}`)
      win.loadURL(process.env['ELECTRON_RENDERER_URL']).catch((err) => {
        log(`FAILED to load dev URL: ${err.message}`)
      })
    } else {
      log(`Loading file: ${htmlPath}`)
      win.loadFile(htmlPath).catch((err) => {
        log(`FAILED to load file: ${err.message}`)
      })
    }

    this.windows.push({ window: win, id: win.id })
    return win
  }

  getAllWindows(): BrowserWindow[] {
    return this.windows.map((w) => w.window)
  }
}

export const windowManager = new WindowManager()
