/// <reference types="vite/client" />

interface IElectronAPI {
    toggleAlwaysOnTop: () => Promise<boolean>
    minimizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>
    resizeWindow: (collapsed: boolean, isMenuOpen?: boolean) => Promise<void>
    getTasks: () => Promise<unknown>
    saveTasks: (tasks: unknown) => Promise<void>
    getTags: () => Promise<unknown>
    saveTags: (tags: unknown) => Promise<void>
    getStatuses: () => Promise<unknown>
    saveStatuses: (statuses: unknown) => Promise<void>
    showNotification: (title: string, body: string) => Promise<void>
    getLoginItemSettings: () => Promise<any>
    setLoginItemSettings: (settings: any) => Promise<void>
    getAppSettings: () => Promise<any>
    saveAppSettings: (settings: any) => Promise<void>
}

declare global {
    interface Window {
        electron: IElectronAPI
        api: IElectronAPI
    }
}

export { }
