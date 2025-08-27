/**
 * IPC Channel Types and Constants
 * Defines all communication channels between main and renderer processes.
 *
 * Contract notes:
 * - All channel names are branded strings to avoid typo misuse.
 * - Every request/response follows the IPCResult<T> pattern and never throws on transport.
 * - Channels are exposed to the renderer only via contextBridge (window.electronAPI).
 */

/**
 * Channel name branded type to prevent typos when passing channel strings to Electron APIs.
 */
export type IPCChannel = string & { readonly __brand: 'IPCChannel' };

/**
 * Timer channels for both legacy timer operations and the new Pomodoro system.
 *
 * Grouped into:
 * - Legacy: compatibility methods for existing UI workflows
 * - Pomodoro: new timer flow (start/pause/reset/skip/config/state/stats)
 * - Events: push updates from main to renderer
 */
export const TIMER_CHANNELS = {
  // Legacy channels for backwards compatibility
  CREATE_SESSION: 'timer:create-session' as IPCChannel,
  START_SESSION: 'timer:start-session' as IPCChannel,
  PAUSE_SESSION: 'timer:pause-session' as IPCChannel,
  STOP_SESSION: 'timer:stop-session' as IPCChannel,
  GET_CURRENT_SESSION: 'timer:get-current-session' as IPCChannel,
  GET_SESSION_HISTORY: 'timer:get-session-history' as IPCChannel,
  SESSION_UPDATED: 'timer:session-updated' as IPCChannel,
  SESSION_COMPLETED: 'timer:session-completed' as IPCChannel,

  // New Pomodoro timer channels
  START_TIMER: 'pomodoro:start' as IPCChannel,
  PAUSE_TIMER: 'pomodoro:pause' as IPCChannel,
  RESET_TIMER: 'pomodoro:reset' as IPCChannel,
  SKIP_PHASE: 'pomodoro:skip' as IPCChannel,
  CONFIGURE_TIMER: 'pomodoro:configure' as IPCChannel,
  GET_TIMER_STATE: 'pomodoro:get-state' as IPCChannel,
  GET_STATISTICS: 'pomodoro:get-statistics' as IPCChannel,

  // Event channels for real-time updates
  TIMER_TICK: 'pomodoro:tick' as IPCChannel,
  PHASE_CHANGED: 'pomodoro:phase-changed' as IPCChannel,
  STATE_CHANGED: 'pomodoro:state-changed' as IPCChannel,
} as const;

/**
 * Settings channels for querying and updating timer settings.
 */
export const SETTINGS_CHANNELS = {
  GET_SETTINGS: 'settings:get' as IPCChannel,
  UPDATE_SETTINGS: 'settings:update' as IPCChannel,
  SETTINGS_UPDATED: 'settings:updated' as IPCChannel,
} as const;

/**
 * Window management channels for creating and controlling windows.
 */
export const WINDOW_CHANNELS = {
  CREATE_WINDOW: 'window:create' as IPCChannel,
  CLOSE_WINDOW: 'window:close' as IPCChannel,
  MINIMIZE_WINDOW: 'window:minimize' as IPCChannel,
  MAXIMIZE_WINDOW: 'window:maximize' as IPCChannel,
  SET_ALWAYS_ON_TOP: 'window:set-always-on-top' as IPCChannel,
  GET_WINDOW_STATE: 'window:get-state' as IPCChannel,
} as const;

/**
 * Application lifecycle channels for app-level utilities.
 */
export const APP_CHANNELS = {
  QUIT: 'app:quit' as IPCChannel,
  GET_VERSION: 'app:get-version' as IPCChannel,
  SHOW_NOTIFICATION: 'app:show-notification' as IPCChannel,
} as const;

/**
 * IPC Request/Response Types
 */

// Timer IPC types
/**
 * Request to create a legacy timer session.
 * @property name - Human-readable session name.
 * @property duration - Session duration in milliseconds.
 */
export interface CreateSessionIPCRequest {
  readonly name: string;
  readonly duration: number;
}

/**
 * Request containing a legacy session identifier for actions.
 */
export interface SessionActionIPCRequest {
  readonly sessionId: string;
}

/**
 * Request to configure Pomodoro timer settings.
 * @property config - Partial timer configuration; unspecified fields remain unchanged.
 */
export interface ConfigureTimerIPCRequest {
  readonly config: Partial<import('./timer').TimerConfig>;
}

/**
 * Payload describing a phase change in the Pomodoro system.
 * Includes the previous and next phases and the resulting timer state.
 */
export interface PhaseChangedIPCData {
  readonly fromPhase: import('./timer').TimerPhase;
  readonly toPhase: import('./timer').TimerPhase;
  readonly state: import('./timer').TimerState;
}

/**
 * Request to update persisted timer settings.
 * @property settings - Partial settings to merge.
 */
export interface UpdateSettingsIPCRequest {
  readonly settings: Partial<import('./timer').TimerSettings>;
}

/**
 * Request to create a new application window of a given type.
 * @property type - Logical window type.
 * @property bounds - Optional initial size/position.
 * @property alwaysOnTop - Optional always-on-top preference.
 */
export interface CreateWindowIPCRequest {
  readonly type: import('./timer').WindowType;
  readonly bounds?: {
    readonly width: number;
    readonly height: number;
    readonly x?: number;
    readonly y?: number;
  };
  readonly alwaysOnTop?: boolean;
}

/**
 * Request to toggle always-on-top state for the current window.
 */
export interface SetAlwaysOnTopIPCRequest {
  readonly alwaysOnTop: boolean;
}

/**
 * Request to display a notification from the main process.
 * @property title - Notification title.
 * @property body - Notification body text.
 * @property icon - Optional icon path.
 * @property silent - Whether to suppress sounds.
 */
export interface ShowNotificationIPCRequest {
  readonly title: string;
  readonly body: string;
  readonly icon?: string;
  readonly silent?: boolean;
}

/**
 * IPC Response Types
 */
export interface IPCError {
  readonly code: string;
  readonly message: string;
  details?: Record<string, unknown>;
}

/**
 * Discriminated union for IPC call results.
 *
 * @template T - Success payload type.
 * @example
 * const res = await window.electronAPI.getVersion();
 * if (res.success) console.log(res.data);
 * else console.error(res.error.code);
 */
export type IPCResult<T> = {
  readonly success: true;
  readonly data: T;
} | {
  readonly success: false;
  readonly error: IPCError;
};

/**
 * Electron API exposed through contextBridge
 */
/**
 * Electron API exposed via contextBridge to the renderer process.
 *
 * All methods return IPCResult<T> and never throw on transport errors.
 * Subscribe methods return unsubscribe functions that must be called to avoid leaks.
 */
export interface ElectronAPI {
  // Legacy timer operations (for backwards compatibility)
  /**
   * Create a legacy timer session.
   * @deprecated Use electronAPI.pomodoro.start/reset/skip plus session history APIs instead.
   */
  createSession: (request: CreateSessionIPCRequest) => Promise<IPCResult<import('./timer').LegacyTimerSession>>;
  /**
   * Start a legacy timer session by id.
   * @deprecated Use electronAPI.pomodoro.start instead.
   */
  startSession: (sessionId: string) => Promise<IPCResult<import('./timer').LegacyTimerSession>>;
  /**
   * Pause a legacy timer session by id.
   * @deprecated Use electronAPI.pomodoro.pause instead.
   */
  pauseSession: (sessionId: string) => Promise<IPCResult<import('./timer').LegacyTimerSession>>;
  /**
   * Stop a legacy timer session by id.
   * @deprecated Use electronAPI.pomodoro.reset instead.
   */
  stopSession: (sessionId: string) => Promise<IPCResult<import('./timer').LegacyTimerSession>>;
  /**
   * Get the current legacy session, if any.
   * @deprecated Prefer electronAPI.pomodoro.getState.
   */
  getCurrentSession: () => Promise<IPCResult<import('./timer').LegacyTimerSession | null>>;
  /**
   * Get the history of legacy sessions.
   * @deprecated Prefer electronAPI.pomodoro.getHistory.
   */
  getSessionHistory: () => Promise<IPCResult<readonly import('./timer').LegacyTimerSession[]>>;

  // New Pomodoro timer operations
  pomodoro: {
    /** Start the Pomodoro timer. */
    start: () => Promise<IPCResult<import('./timer').TimerState>>;
    /** Pause the Pomodoro timer. */
    pause: () => Promise<IPCResult<import('./timer').TimerState>>;
    /** Reset the Pomodoro timer to idle. */
    reset: () => Promise<IPCResult<import('./timer').TimerState>>;
    /** Skip the current phase (planning/focus/break). */
    skip: () => Promise<IPCResult<import('./timer').TimerState>>;
    /** Update Pomodoro configuration. */
    configure: (config: Partial<import('./timer').TimerConfig>) => Promise<IPCResult<import('./timer').TimerConfig>>;
    /** Get the current timer state. */
    getState: () => Promise<IPCResult<import('./timer').TimerState>>;
    /** Get aggregated timer statistics. */
    getStatistics: () => Promise<IPCResult<import('./timer').TimerStatistics>>;
    /** Get structured session history records. */
    getHistory: () => Promise<IPCResult<readonly import('./timer').TimerSession[]>>;
  };

  // Settings operations
  /** Retrieve persisted timer settings. */
  getSettings: () => Promise<IPCResult<import('./timer').TimerSettings>>;
  /** Update and persist timer settings. */
  updateSettings: (settings: Partial<import('./timer').TimerSettings>) => Promise<IPCResult<import('./timer').TimerSettings>>;

  // Window operations
  /** Create a new window of the provided type. */
  createWindow: (request: CreateWindowIPCRequest) => Promise<IPCResult<void>>;
  /** Close the current window. */
  closeWindow: () => Promise<IPCResult<void>>;
  /** Minimize the current window. */
  minimizeWindow: () => Promise<IPCResult<void>>;
  /** Maximize the current window. */
  maximizeWindow: () => Promise<IPCResult<void>>;
  /** Toggle the always-on-top state for the current window. */
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<IPCResult<void>>;
  /** Query the current window state. */
  getWindowState: () => Promise<IPCResult<import('./timer').WindowState>>;

  // App operations
  /** Quit the application. */
  quit: () => Promise<IPCResult<void>>;
  /** Get the app version string. */
  getVersion: () => Promise<IPCResult<string>>;
  /** Show a system notification. */
  showNotification: (request: ShowNotificationIPCRequest) => Promise<IPCResult<void>>;

  // Event subscriptions
  /** Subscribe to legacy session updates; returns an unsubscribe function. */
  onSessionUpdated: (callback: (session: import('./timer').LegacyTimerSession) => void) => () => void;
  /** Subscribe to legacy session completion events; returns an unsubscribe function. */
  onSessionCompleted: (callback: (session: import('./timer').LegacyTimerSession) => void) => () => void;
  /** Subscribe to settings updates; returns an unsubscribe function. */
  onSettingsUpdated: (callback: (settings: import('./timer').TimerSettings) => void) => () => void;

  // New Pomodoro timer events
  /** Subscribe to high-frequency timer tick updates; returns an unsubscribe function. */
  onTimerTick: (callback: (state: import('./timer').TimerState) => void) => () => void;
  /** Subscribe to phase change events; returns an unsubscribe function. */
  onPhaseChanged: (callback: (data: PhaseChangedIPCData) => void) => () => void;
  /** Subscribe to coarse state changes; returns an unsubscribe function. */
  onStateChanged: (callback: (state: import('./timer').TimerState) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
