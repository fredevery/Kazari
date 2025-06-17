import { app, BrowserWindow, dialog } from "electron";
import dotenv from "dotenv";
import { windowManager } from "./windowManager.js";
import { logger } from "@/shared/logger.ts";
import { WindowManager } from "@/main/windows/WindowManager.ts";
import { Bus } from "@/main/core/Bus.ts";

dotenv.config({
  path: [".env.local", ".env"],
});

function main() {
  const windowManager = WindowManager.getInstance();
  const rootBus = Bus.getRootBus();

  logger.info("Starting Kazari application...");

  app.on("ready", () => {
    logger.info("Application is ready, setting up windows...");
    rootBus.emit("app:ready");
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
      windowManager.launchSessionPlanningWindow();
    }
  });

  app.on("before-quit", () => {
    logger.info("Application is about to quit...");
    // Perform any necessary cleanup here
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    performGracefulShutdown();
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled rejection:", reason, promise);
    performGracefulShutdown();
  });
}

async function performGracefulShutdown() {
  logger.info("Performing graceful shutdown...");
  dialog.showErrorBox(
    "Fatal Error",
    "An unexpected error occurred. The application will now exit.",
  );
  // TODO: Save state or perform cleanup if necessary
  app.quit();
}

try {
  main();
} catch (error) {
  logger.error("Error starting application:", error);
  process.exit(1);
}
