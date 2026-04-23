import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { windowManager } from './windowManager'
import { buildMenu } from './menu'

// ===== Error Logging =====
const logPath = join(app.getPath('userData'), 'error.log')
function log(msg: string): void {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] ${msg}\n`
  try {
    fs.appendFileSync(logPath, line, 'utf-8')
  } catch {
    // ignore
  }
}

// Catch all unhandled errors
process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}`)
  dialog.showErrorBox('启动错误', `发生未捕获的异常:\n${error.message}\n\n日志文件: ${logPath}`)
})

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${String(reason)}`)
})

log('=== App Starting ===')
log(`app.isPackaged: ${app.isPackaged}`)
log(`app.getPath('exe'): ${app.getPath('exe')}`)
log(`__dirname: ${__dirname}`)
log(`app.getPath('userData'): ${app.getPath('userData')}`)
log(`process.resourcesPath: ${process.resourcesPath}`)
log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`)

const isDev = !app.isPackaged

// IPC handlers for file dialogs (use event.sender to support multi-window)
ipcMain.handle('dialog:saveFile', async (event, options: { title: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showSaveDialog(win!, options)
  return result
})

ipcMain.handle('dialog:openFile', async (event, options: { title: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win!, {
    ...options,
    properties: ['openFile']
  })
  return result
})

ipcMain.handle('dialog:openImage', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win!, {
    title: '选择图片',
    filters: [
      { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'] }
    ],
    properties: ['openFile']
  })
  return result
})

// IPC handlers for file system
ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Binary file write (for PDF export)
ipcMain.handle('fs:writeBinaryFile', async (_event, filePath: string, data: ArrayBuffer) => {
  try {
    const buffer = Buffer.from(data)
    fs.writeFileSync(filePath, buffer)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:readImageAsBase64', async (_event, filePath: string) => {
  try {
    const buffer = fs.readFileSync(filePath)
    const base64 = buffer.toString('base64')
    const ext = filePath.split('.').pop()?.toLowerCase() || 'png'
    const mimeMap: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', bmp: 'image/bmp'
    }
    const mime = mimeMap[ext] || 'image/png'
    return { success: true, dataUrl: `data:${mime};base64,${base64}`, fileName: filePath.split(/[\\/]/).pop() || 'image' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:copyImageToAssets', async (_event, sourcePath: string, docDir: string) => {
  console.log('copyImageToAssets 被调用，参数:', { sourcePath, docDir })
  try {
    const assetsDir = join(docDir, 'assets')
    console.log('assetsDir:', assetsDir)
    if (!fs.existsSync(assetsDir)) {
      console.log('创建 assets 目录:', assetsDir)
      fs.mkdirSync(assetsDir, { recursive: true })
    }
    let fileName = sourcePath.split(/[\\/]/).pop() || 'image.png'
    let destPath = join(assetsDir, fileName)
    // Handle duplicate filenames
    let counter = 1
    const baseName = fileName.replace(/\.[^.]+$/, '')
    const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : '.png'
    while (fs.existsSync(destPath)) {
      fileName = `${baseName}-${counter}${ext}`
      destPath = join(assetsDir, fileName)
      counter++
    }
    console.log('复制文件:', sourcePath, '到:', destPath)
    fs.copyFileSync(sourcePath, destPath)
    const relativePath = `assets/${fileName}`
    console.log('返回相对路径:', relativePath)
    return { success: true, relativePath }
  } catch (error) {
    console.error('copyImageToAssets 错误:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:resolveImagePath', async (_event, relativePath: string, docDir: string) => {
  try {
    const fullPath = join(docDir, relativePath)
    const exists = fs.existsSync(fullPath)
    return { success: true, fullPath, exists }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:mkdir', async (_event, dirPath: string) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('fs:getDefaultDir', async () => {
  try {
    const documentsPath = app.getPath('documents')
    // 确保目录存在
    if (!fs.existsSync(documentsPath)) {
      fs.mkdirSync(documentsPath, { recursive: true })
    }
    return { dir: documentsPath }
  } catch (error) {
    // 如果获取文档目录失败，返回当前工作目录
    return { dir: process.cwd() }
  }
})

// Window title and dirty state
ipcMain.on('window:set-title', (event, title: string) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.setTitle(title)
})

ipcMain.on('window:set-represented-filename', (event, path: string) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.setRepresentedFilename(path)
})

ipcMain.on('window:set-document-edited', (event, edited: boolean) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.setDocumentEdited(edited)
})

// 注册自定义协议来加载本地文件
import { protocol } from 'electron'

app.whenReady().then(() => {
  // 注册自定义协议 'safe-file' 来安全加载本地文件
  protocol.registerFileProtocol('safe-file', (request, callback) => {
    const url = request.url.replace('safe-file://', '')
    // 解码URL编码的路径
    const decodedUrl = decodeURIComponent(url)
    callback(decodedUrl)
  })

  log('app.whenReady() resolved, creating window...')
  try {
    windowManager.createWindow()
    log('Window created successfully')
  } catch (error) {
    log(`FAILED to create window: ${error}`)
    dialog.showErrorBox('窗口创建失败', `错误: ${error}\n\n日志文件: ${logPath}`)
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
