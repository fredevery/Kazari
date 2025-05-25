import path from "node:path";
import log from "electron-log";
import { isDev, logPath } from "./constants.js";
import Rollbar from "rollbar";

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
    });

    this.rollbar.log("Hello world!");
  }

  static setupTransports() {
    log.transports.file.resolvePathFn = () => path.join(logPath, "app.log");
    log.transports.file.maxSize = 1024 * 1024 * 10;
    log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s} {level} {message}";
    log.transports.file.level = isDev ? "debug" : "info";

    log.transports.console.level = isDev ? "debug" : "info";
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  error(message: string, ...args: unknown[]) {
    this.logger.error(message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.logger.warn(message, ...args);
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
