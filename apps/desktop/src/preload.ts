import { contextBridge, ipcRenderer } from "electron";
// import { logger } from "@/shared/logger.ts";

contextBridge.exposeInMainWorld("kazari", {
  logger: {
    info: (message: string, ...args: unknown[]) =>
      ipcRenderer.send("log", { level: "info", message, args }),
    error: (message: string, ...args: unknown[]) => {
      console.log("logger.error", message, args);
      ipcRenderer.send("log", { level: "error", message, args });
    },
    warn: (message: string, ...args: unknown[]) =>
      ipcRenderer.send("log", { level: "warn", message, args }),
    debug: (message: string, ...args: unknown[]) =>
      ipcRenderer.send("log", { level: "debug", message, args }),
    verbose: (message: string, ...args: unknown[]) =>
      ipcRenderer.send("log", { level: "verbose", message, args }),
  },
});
