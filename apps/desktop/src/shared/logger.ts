import { ipcMain } from "electron";
import path from "node:path";
import log from "electron-log";
import dotenv from "dotenv";
import { isDev, logPath } from "./constants.js";
import Rollbar from "rollbar";

dotenv.config({
  path: [".env.local", ".env"],
});

export class Logger {
  private static instance: Logger;
  private logger: typeof log;
  private rollbar: Rollbar;

  private constructor() {
    this.logger = log;
    this.rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_CLIENT_TOKEN || "",
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: process.env.NODE_ENV || "development",
      payload: {
        platform: "client",
        code_version: "0.0.1",
      },
    });
  }

  static setupTransports() {
    log.transports.file.resolvePathFn = () => path.join(logPath, "app.log");
    log.transports.file.maxSize = 1024 * 1024 * 10;
    log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s} {level} {message}";
    log.transports.file.level = isDev ? "debug" : "info";

    log.transports.console.level = isDev ? "debug" : "info";
  }

  static setupIpcListeners() {
    ipcMain.on("log", (_event, { level, message, args }) => {
      const logger = Logger.getInstance();
      const logMethod = logger[level as keyof Logger] || logger.info;
      logMethod.call(logger, message, ...args);
    });
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.setupTransports();
      Logger.setupIpcListeners();
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  error(message: string, ...args: unknown[]) {
    this.logger.error(message, ...args);
    this.rollbar.error(message, { args });
  }

  warn(message: string, ...args: unknown[]) {
    this.logger.warn(message, ...args);
    this.rollbar.warn(message, { args });
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }

  verbose(message: string, ...args: unknown[]): void {
    this.logger.verbose(message, ...args);
  }
}

export const logger = Logger.getInstance();
