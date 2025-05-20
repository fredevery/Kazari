import { app, BrowserWindow } from "electron";
import { setupWindows } from "./utils/windowManager.js";

function main() {
  app.on("ready", () => {
    setupWindows();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      setupWindows();
    }
  });
}

main();
