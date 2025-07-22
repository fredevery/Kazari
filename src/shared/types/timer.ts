/**
 * Core Timer Domain Types
 * Shared across all processes for consistent timer functionality
 */

/**
 * Timer State representing the current state of the Pomodoro timer
 */
export interface TimerState {
  readonly phase: TimerPhase;
  readonly status: TimerStatus;
  readonly remainingTime: number; // in milliseconds
  readonly totalTime: number; // in milliseconds
  readonly sessionCount: number;
  readonly startTime?: Date | undefined;
  readonly pausedTime?: Date | undefined;
}

/**
 * Timer phases based on Pomodoro Technique
 */
export type TimerPhase = 'planning' | 'focus' | 'break';

/**
 * Timer status states
 */
export type TimerStatus = 'idle' | 'running' | 'paused';

/**
 * Timer configuration settings
 */
export interface TimerConfig {
  readonly planningDuration: number; // in minutes
  readonly focusDuration: number; // in minutes
  readonly breakDuration: number; // in minutes
  readonly longBreakDuration: number; // in minutes
  readonly longBreakInterval: number; // every N sessions
  readonly autoStartBreaks: boolean;
  readonly autoStartFocus: boolean;
}

/**
 * Individual timer session record for history tracking
 */
export interface TimerSession {
  readonly id: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly phase: TimerPhase;
  readonly completed: boolean;
  readonly interrupted: boolean;
}

/**
 * Timer statistics for analytics
 */
export interface TimerStatistics {
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly totalFocusTime: number; // in milliseconds
  readonly totalBreakTime: number; // in milliseconds
  readonly totalPlanningTime: number; // in milliseconds
  readonly averageSessionLength: number; // in milliseconds
  readonly todaysSessions: number;
  readonly currentStreak: number;
}

/**
 * Legacy timer session interface for backwards compatibility
 * TODO: Remove when migration to Pomodoro system is complete
 */
export interface LegacyTimerSession {
  readonly id: string;
  readonly name: string;
  readonly duration: number; // in milliseconds
  readonly remainingTime: number;
  readonly status: LegacyTimerStatus;
  readonly createdAt: Date;
  readonly startedAt: Date | undefined;
  readonly pausedAt: Date | undefined;
  readonly completedAt: Date | undefined;
}

export type LegacyTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSettings {
  readonly config: TimerConfig;
  readonly notifications: boolean;
  readonly soundEnabled: boolean;
  readonly alwaysOnTop: boolean;
}

export interface CreateTimerSessionRequest {
  readonly phase: TimerPhase;
  readonly name?: string; // For backwards compatibility
  readonly duration?: number; // For backwards compatibility
}

export interface UpdateTimerSessionRequest {
  readonly id: string;
  readonly phase?: TimerPhase;
}

/**
 * Application State Types
 */
export interface AppState {
  readonly currentState: TimerState;
  readonly settings: TimerSettings;
  readonly sessionHistory: readonly TimerSession[];
  readonly statistics: TimerStatistics;
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
  saveState(state: TimerState): Promise<void>;
  getState(): Promise<TimerState | null>;
  saveSession(session: TimerSession): Promise<void>;
  getSessionHistory(): Promise<readonly TimerSession[]>;
  getStatistics(): Promise<TimerStatistics>;
  saveConfig(config: TimerConfig): Promise<void>;
  getConfig(): Promise<TimerConfig>;
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
  showPhaseTransition(fromPhase: TimerPhase, toPhase: TimerPhase): Promise<void>;
  showTimerWarning(phase: TimerPhase, remainingTime: number): Promise<void>;
  requestPermission(): Promise<boolean>;
  showCustomNotification(title: string, body: string, silent?: boolean): Promise<void>;
}

export interface PomodoroTimerService {
  start(): Promise<Result<TimerState, TimerError>>;
  pause(): Promise<Result<TimerState, TimerError>>;
  reset(): Promise<Result<TimerState, TimerError>>;
  skip(): Promise<Result<TimerState, TimerError>>;
  configure(config: Partial<TimerConfig>): Promise<Result<TimerConfig, TimerError>>;
  getState(): Promise<Result<TimerState, TimerError>>;
  getStatistics(): Promise<Result<TimerStatistics, TimerError>>;
  getHistory(): Promise<Result<readonly TimerSession[], TimerError>>;

  // Event subscriptions for IPC
  onTick(callback: (state: TimerState) => void): () => void;
  onPhaseChange(callback: (fromPhase: TimerPhase, toPhase: TimerPhase, state: TimerState) => void): () => void;
  onStateChange(callback: (state: TimerState) => void): () => void;

  // Cleanup method
  cleanup(): void;
}

/**
 * Legacy service interface for backwards compatibility
 */
export interface TimerService {
  createSession(request: CreateTimerSessionRequest): Promise<Result<LegacyTimerSession, TimerError>>;
  startSession(sessionId: string): Promise<Result<LegacyTimerSession, TimerError>>;
  pauseSession(sessionId: string): Promise<Result<LegacyTimerSession, TimerError>>;
  stopSession(sessionId: string): Promise<Result<LegacyTimerSession, TimerError>>;
  getCurrentSession(): Promise<Result<LegacyTimerSession | null, TimerError>>;
  getSessionHistory(): Promise<Result<readonly LegacyTimerSession[], TimerError>>;
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
