import { app, BrowserWindow } from "electron";
import { windowManager } from "./windowManager.js";
import { logger } from "@/shared/logger.ts";

function main() {
  logger.info("Starting Kazari application...");

  app.on("ready", () => {
    logger.info("Application is ready, setting up windows...");
    windowManager.setupWindows();
  });

  app.on("window-all-closed", () => {
    logger.info("All windows closed!");
    if (process.platform !== "darwin") {
      logger.info("Quitting application...");
      app.quit();
    }
  });

  app.on("activate", () => {
    logger.info("Application activated!");
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info("No windows found, setting up windows...");
      windowManager.setupWindows();
    }
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection:", reason, promise);
  });
}

try {
  main();
} catch (error) {
  logger.error("Error starting application:", error);
  process.exit(1);
}
