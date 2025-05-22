import { app, BrowserWindow } from "electron";
import { windowManager } from "./windowManager.ts";

function main() {
  app.on("ready", () => {
    windowManager.setupWindows();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.setupWindows();
    }
  });
}

main();
