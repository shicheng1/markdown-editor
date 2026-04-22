import { contextBridge, ipcRenderer } from 'electron'

const validMenuChannels = [
  'menu:new-file', 'menu:new-tab', 'menu:open-file', 'menu:save', 'menu:save-as',
  'menu:export-pdf', 'menu:export-html', 'menu:export-md',
  'menu:undo', 'menu:redo', 'menu:find',
  'menu:toggle-theme'
]

const electronAPI = {
  dialog: {
    saveFile: (options: { title: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) =>
      ipcRenderer.invoke('dialog:saveFile', options),
    openFile: (options: { title: string; filters?: Array<{ name: string; extensions: string[] }> }) =>
      ipcRenderer.invoke('dialog:openFile', options),
    openImage: () => ipcRenderer.invoke('dialog:openImage')
  },
  fs: {
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    readFile: (filePath: string) =>
      ipcRenderer.invoke('fs:readFile', filePath),
    writeBinaryFile: (filePath: string, data: ArrayBuffer) =>
      ipcRenderer.invoke('fs:writeBinaryFile', filePath, data),
    readImageAsBase64: (filePath: string) =>
      ipcRenderer.invoke('fs:readImageAsBase64', filePath),
    copyImageToAssets: (sourcePath: string, docDir: string) =>
      ipcRenderer.invoke('fs:copyImageToAssets', sourcePath, docDir),
    resolveImagePath: (relativePath: string, docDir: string) =>
      ipcRenderer.invoke('fs:resolveImagePath', relativePath, docDir),
    getDefaultDir: () => ipcRenderer.invoke('fs:getDefaultDir')
  },
  menu: {
    onMenuItem: (channel: string, callback: (...args: unknown[]) => void) => {
      if (validMenuChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => callback(...args))
      }
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel)
    }
  },
  window: {
    setTitle: (title: string) => ipcRenderer.send('window:set-title', title),
    setRepresentedFilename: (path: string) => ipcRenderer.send('window:set-represented-filename', path),
    setDocumentEdited: (edited: boolean) => ipcRenderer.send('window:set-document-edited', edited)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electronAPI = electronAPI
}
