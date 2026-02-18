/// <reference types="vite/client" />

interface IElectronAPI {
    toggleAlwaysOnTop: () => Promise<boolean>
    minimizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>
    resizeWindow: (collapsed: boolean) => Promise<void>
    getTasks: () => Promise<unknown>
    saveTasks: (tasks: unknown) => Promise<void>
    getTags: () => Promise<unknown>
    saveTags: (tags: unknown) => Promise<void>
    getStatuses: () => Promise<unknown>
    saveStatuses: (statuses: unknown) => Promise<void>
    showNotification: (title: string, body: string) => Promise<void>
}

declare global {
    interface Window {
        electron: IElectronAPI
        api: IElectronAPI
    }
}

export { }
