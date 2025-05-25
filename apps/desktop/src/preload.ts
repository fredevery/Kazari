import { contextBridge } from "electron";
import { logger } from "@/shared/logger.ts";

contextBridge.exposeInMainWorld("kazari", {
  logger: {
    info: (message: string, ...args: unknown[]) =>
      logger.info(message, ...args),
    error: (message: string, ...args: unknown[]) =>
      logger.error(message, ...args),
    warn: (message: string, ...args: unknown[]) =>
      logger.warn(message, ...args),
    debug: (message: string, ...args: unknown[]) =>
      logger.debug(message, ...args),
  },
});
