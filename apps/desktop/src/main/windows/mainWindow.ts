import path from "node:path";
import { BrowserWindow, app } from "electron";

export function createMainWindow() {
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log("Loading main window from dev server");
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "right" });
  }

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  return mainWindow;
}
