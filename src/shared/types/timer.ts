/**
 * Core Timer Domain Types
 * Shared across all processes for consistent timer functionality
 */

export interface TimerSession {
  readonly id: string;
  readonly name: string;
  readonly duration: number; // in milliseconds
  readonly remainingTime: number;
  readonly status: TimerStatus;
  readonly createdAt: Date;
  readonly startedAt: Date | undefined;
  readonly pausedAt: Date | undefined;
  readonly completedAt: Date | undefined;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSettings {
  readonly defaultDuration: number; // in milliseconds
  readonly autoStart: boolean;
  readonly notifications: boolean;
  readonly soundEnabled: boolean;
  readonly alwaysOnTop: boolean;
}

export interface CreateTimerSessionRequest {
  readonly name: string;
  readonly duration: number;
}

export interface UpdateTimerSessionRequest {
  readonly id: string;
  readonly name?: string;
  readonly duration?: number;
}

/**
 * Application State Types
 */
export interface AppState {
  readonly currentSession: TimerSession | null;
  readonly settings: TimerSettings;
  readonly sessionHistory: readonly TimerSession[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

/**
 * Window Management Types
 */
export type WindowType = 'dashboard' | 'floating-countdown' | 'break-screen' | 'planning';

export interface WindowState {
  readonly type: WindowType;
  readonly isVisible: boolean;
  readonly bounds: { x: number; y: number; width: number; height: number } | undefined;
  readonly alwaysOnTop: boolean;
}

/**
 * Repository Interfaces
 */
export interface TimerRepository {
  save(session: TimerSession): Promise<void>;
  findById(id: string): Promise<TimerSession | null>;
  getHistory(): Promise<readonly TimerSession[]>;
  deleteById(id: string): Promise<void>;
  clear(): Promise<void>;
}

export interface SettingsRepository {
  getSettings(): Promise<TimerSettings>;
  updateSettings(settings: Partial<TimerSettings>): Promise<TimerSettings>;
}

/**
 * Service Interfaces
 */
export interface NotificationService {
  showTimerComplete(session: TimerSession): Promise<void>;
  showTimerWarning(session: TimerSession, remainingTime: number): Promise<void>;
  requestPermission(): Promise<boolean>;
  showCustomNotification(title: string, body: string, silent?: boolean): Promise<void>;
}

export interface TimerService {
  createSession(request: CreateTimerSessionRequest): Promise<Result<TimerSession, TimerError>>;
  startSession(sessionId: string): Promise<Result<TimerSession, TimerError>>;
  pauseSession(sessionId: string): Promise<Result<TimerSession, TimerError>>;
  stopSession(sessionId: string): Promise<Result<TimerSession, TimerError>>;
  getCurrentSession(): Promise<Result<TimerSession | null, TimerError>>;
  getSessionHistory(): Promise<Result<readonly TimerSession[], TimerError>>;
}

/**
 * Error Types
 */
export class TimerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TimerError';
  }
}

export class ValidationError extends TimerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class SessionNotFoundError extends TimerError {
  constructor(sessionId: string) {
    super(`Timer session not found: ${sessionId}`, 'SESSION_NOT_FOUND', { sessionId });
    this.name = 'SessionNotFoundError';
  }
}

/**
 * Utility Types
 */
export type Result<T, E = Error> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly error: E;
};

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
