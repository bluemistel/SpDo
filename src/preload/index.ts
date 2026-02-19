import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    resizeWindow: (collapsed: boolean) => ipcRenderer.invoke('resize-window', collapsed),
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    saveTasks: (tasks: unknown) => ipcRenderer.invoke('save-tasks', tasks),
    getTags: () => ipcRenderer.invoke('get-tags'),
    saveTags: (tags: unknown) => ipcRenderer.invoke('save-tags', tags),
    getStatuses: () => ipcRenderer.invoke('get-statuses'),
    saveStatuses: (statuses: unknown) => ipcRenderer.invoke('save-statuses', statuses),
    showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
    getLoginItemSettings: () => ipcRenderer.invoke('get-login-item-settings'),
    setLoginItemSettings: (settings: any) => ipcRenderer.invoke('set-login-item-settings', settings)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
