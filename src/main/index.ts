import { app, shell, BrowserWindow, ipcMain, globalShortcut, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { store } from './store'

// Set app name for notifications
app.name = 'SpDo'

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: 'SpDo',
        width: 400,
        height: 600,
        minWidth: 380,
        minHeight: 400,
        maxWidth: 800,
        maxHeight: 1200,
        show: false,
        autoHideMenuBar: true,
        frame: false, // Frameless for sticky note look
        transparent: true, // Allow transparency
        resizable: true, // Allow window resizing
        icon: join(__dirname, '../../resources/icon.png'),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webSecurity: false // Allow loading local files (file://) from http source
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Disable autoplay policy to ensure sounds can play
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('SpDo')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// IPC Handlers for window controls
ipcMain.handle('toggle-always-on-top', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
        const isAlwaysOnTop = window.isAlwaysOnTop()
        window.setAlwaysOnTop(!isAlwaysOnTop)
        return !isAlwaysOnTop
    }
    return false
})

ipcMain.handle('minimize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
        window.minimize()
    }
})

ipcMain.handle('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
        window.close()
    }
})

ipcMain.handle('resize-window', (event, collapsed: boolean, isMenuOpen: boolean = false) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
        if (collapsed) {
            window.setResizable(false)
            window.setMinimumSize(380, 60)
            const height = isMenuOpen ? 350 : 60
            window.setSize(380, height)
        } else {
            window.setMinimumSize(380, 400)
            window.setSize(400, 600)
            window.setResizable(true)
        }
    }
})

// Data persistence IPC handlers
ipcMain.handle('get-tasks', () => {
    return store.get('tasks', [])
})

ipcMain.handle('save-tasks', (_, tasks) => {
    store.set('tasks', tasks)
})

ipcMain.handle('get-tags', () => {
    return store.get('tags', [])
})

ipcMain.handle('save-tags', (_, tags) => {
    store.set('tags', tags)
})

ipcMain.handle('get-statuses', () => {
    return store.get('statuses', [])
})

ipcMain.handle('save-statuses', (_, statuses) => {
    store.set('statuses', statuses)
})

ipcMain.handle('show-notification', (_, title: string, body: string) => {
    if (Notification.isSupported()) {
        new Notification({ title, body }).show()
    }
})

ipcMain.handle('get-login-item-settings', () => {
    return app.getLoginItemSettings()
})

ipcMain.handle('set-login-item-settings', (_, settings: { openAtLogin: boolean }) => {
    app.setLoginItemSettings({
        openAtLogin: settings.openAtLogin,
        path: process.execPath,
        name: app.name
    })
})

ipcMain.handle('get-app-settings', () => {
    return store.get('appSettings', {})
})

ipcMain.handle('save-app-settings', (_, settings) => {
    store.set('appSettings', settings)
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
