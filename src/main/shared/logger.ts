export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Minimal structured logger for main process
 */
export class Logger {
  constructor(private readonly context: string) { }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry = {
      ts: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta ? { meta } : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }

  debug(msg: string, meta?: Record<string, unknown>): void { this.log('debug', msg, meta); }
  info(msg: string, meta?: Record<string, unknown>): void { this.log('info', msg, meta); }
  warn(msg: string, meta?: Record<string, unknown>): void { this.log('warn', msg, meta); }
  error(msg: string, meta?: Record<string, unknown>): void { this.log('error', msg, meta); }
}

export const createLogger = (context: string): Logger => new Logger(context);
