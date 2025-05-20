import { app, BrowserWindow } from "electron";
import { setupWindows } from "./windowManager.ts";

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
