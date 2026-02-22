"use strict";
const electron = require("electron");
const path = require("path");
const Store = require("electron-store");
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
const store = new Store({
  defaults: {
    tasks: [],
    tags: [],
    statuses: [
      { id: "todo", label: "未着手", color: "#94a3b8" },
      { id: "in-progress", label: "進行中", color: "#3b82f6" },
      { id: "done", label: "完了", color: "#10b981" }
    ]
  }
});
electron.app.name = "SpDo";
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    title: "SpDo",
    width: 400,
    height: 600,
    minWidth: 380,
    minHeight: 400,
    maxWidth: 800,
    maxHeight: 1200,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    // Frameless for sticky note look
    transparent: true,
    // Allow transparency
    resizable: true,
    // Allow window resizing
    icon: path.join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false
      // Allow loading local files (file://) from http source
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("SpDo");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("toggle-always-on-top", (event) => {
  const window = electron.BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const isAlwaysOnTop = window.isAlwaysOnTop();
    window.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  }
  return false;
});
electron.ipcMain.handle("minimize-window", (event) => {
  const window = electron.BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.minimize();
  }
});
electron.ipcMain.handle("close-window", (event) => {
  const window = electron.BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.close();
  }
});
electron.ipcMain.handle("resize-window", (event, collapsed) => {
  const window = electron.BrowserWindow.fromWebContents(event.sender);
  if (window) {
    if (collapsed) {
      window.setSize(380, 60);
    } else {
      window.setSize(400, 600);
    }
  }
});
electron.ipcMain.handle("get-tasks", () => {
  return store.get("tasks", []);
});
electron.ipcMain.handle("save-tasks", (_, tasks) => {
  store.set("tasks", tasks);
});
electron.ipcMain.handle("get-tags", () => {
  return store.get("tags", []);
});
electron.ipcMain.handle("save-tags", (_, tags) => {
  store.set("tags", tags);
});
electron.ipcMain.handle("get-statuses", () => {
  return store.get("statuses", []);
});
electron.ipcMain.handle("save-statuses", (_, statuses) => {
  store.set("statuses", statuses);
});
electron.ipcMain.handle("show-notification", (_, title, body) => {
  if (electron.Notification.isSupported()) {
    new electron.Notification({ title, body }).show();
  }
});
electron.ipcMain.handle("get-login-item-settings", () => {
  return electron.app.getLoginItemSettings();
});
electron.ipcMain.handle("set-login-item-settings", (_, settings) => {
  electron.app.setLoginItemSettings({
    openAtLogin: settings.openAtLogin,
    path: process.execPath,
    name: electron.app.name
  });
});
electron.ipcMain.handle("get-app-settings", () => {
  return store.get("appSettings", {});
});
electron.ipcMain.handle("save-app-settings", (_, settings) => {
  store.set("appSettings", settings);
});
