export {}

interface ElectronAPI {
  dialog: {
    saveFile: (options: { title: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<Electron.SaveDialogReturnValue>
    openFile: (options: { title: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<Electron.OpenDialogReturnValue>
    openImage: () => Promise<Electron.OpenDialogReturnValue>
  }
  fs: {
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
    writeBinaryFile: (filePath: string, data: ArrayBuffer) => Promise<{ success: boolean; error?: string }>
    readImageAsBase64: (filePath: string) => Promise<{ success: boolean; dataUrl?: string; fileName?: string; error?: string }>
    copyImageToAssets: (sourcePath: string, docDir: string) => Promise<{ success: boolean; relativePath?: string; error?: string }>
    resolveImagePath: (relativePath: string, docDir: string) => Promise<{ success: boolean; fullPath?: string; exists?: boolean; error?: string }>
    getDefaultDir: () => Promise<{ dir: string }>
  }
  menu: {
    onMenuItem: (channel: string, callback: (...args: unknown[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
  window: {
    setTitle: (title: string) => void
    setRepresentedFilename: (path: string) => void
    setDocumentEdited: (edited: boolean) => void
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
