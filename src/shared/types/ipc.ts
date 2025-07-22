/**
 * IPC Channel Types and Constants
 * Defines all communication channels between main and renderer processes
 */

// Channel name branded types to prevent typos
export type IPCChannel = string & { readonly __brand: 'IPCChannel' };

// Timer channels
export const TIMER_CHANNELS = {
  CREATE_SESSION: 'timer:create-session' as IPCChannel,
  START_SESSION: 'timer:start-session' as IPCChannel,
  PAUSE_SESSION: 'timer:pause-session' as IPCChannel,
  STOP_SESSION: 'timer:stop-session' as IPCChannel,
  GET_CURRENT_SESSION: 'timer:get-current-session' as IPCChannel,
  GET_SESSION_HISTORY: 'timer:get-session-history' as IPCChannel,
  SESSION_UPDATED: 'timer:session-updated' as IPCChannel,
  SESSION_COMPLETED: 'timer:session-completed' as IPCChannel,
} as const;

// Settings channels
export const SETTINGS_CHANNELS = {
  GET_SETTINGS: 'settings:get' as IPCChannel,
  UPDATE_SETTINGS: 'settings:update' as IPCChannel,
  SETTINGS_UPDATED: 'settings:updated' as IPCChannel,
} as const;

// Window management channels
export const WINDOW_CHANNELS = {
  CREATE_WINDOW: 'window:create' as IPCChannel,
  CLOSE_WINDOW: 'window:close' as IPCChannel,
  MINIMIZE_WINDOW: 'window:minimize' as IPCChannel,
  MAXIMIZE_WINDOW: 'window:maximize' as IPCChannel,
  SET_ALWAYS_ON_TOP: 'window:set-always-on-top' as IPCChannel,
  GET_WINDOW_STATE: 'window:get-state' as IPCChannel,
} as const;

// Application lifecycle channels
export const APP_CHANNELS = {
  QUIT: 'app:quit' as IPCChannel,
  GET_VERSION: 'app:get-version' as IPCChannel,
  SHOW_NOTIFICATION: 'app:show-notification' as IPCChannel,
} as const;

/**
 * IPC Request/Response Types
 */

// Timer IPC types
export interface CreateSessionIPCRequest {
  readonly name: string;
  readonly duration: number;
}

export interface SessionActionIPCRequest {
  readonly sessionId: string;
}

export interface UpdateSettingsIPCRequest {
  readonly settings: Partial<import('./timer').TimerSettings>;
}

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

export interface SetAlwaysOnTopIPCRequest {
  readonly alwaysOnTop: boolean;
}

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
  readonly details?: Record<string, unknown>;
}

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
export interface ElectronAPI {
  // Timer operations
  createSession: (request: CreateSessionIPCRequest) => Promise<IPCResult<import('./timer').TimerSession>>;
  startSession: (sessionId: string) => Promise<IPCResult<import('./timer').TimerSession>>;
  pauseSession: (sessionId: string) => Promise<IPCResult<import('./timer').TimerSession>>;
  stopSession: (sessionId: string) => Promise<IPCResult<import('./timer').TimerSession>>;
  getCurrentSession: () => Promise<IPCResult<import('./timer').TimerSession | null>>;
  getSessionHistory: () => Promise<IPCResult<readonly import('./timer').TimerSession[]>>;

  // Settings operations
  getSettings: () => Promise<IPCResult<import('./timer').TimerSettings>>;
  updateSettings: (settings: Partial<import('./timer').TimerSettings>) => Promise<IPCResult<import('./timer').TimerSettings>>;

  // Window operations
  createWindow: (request: CreateWindowIPCRequest) => Promise<IPCResult<void>>;
  closeWindow: () => Promise<IPCResult<void>>;
  minimizeWindow: () => Promise<IPCResult<void>>;
  maximizeWindow: () => Promise<IPCResult<void>>;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<IPCResult<void>>;
  getWindowState: () => Promise<IPCResult<import('./timer').WindowState>>;

  // App operations
  quit: () => Promise<IPCResult<void>>;
  getVersion: () => Promise<IPCResult<string>>;
  showNotification: (request: ShowNotificationIPCRequest) => Promise<IPCResult<void>>;

  // Event subscriptions
  onSessionUpdated: (callback: (session: import('./timer').TimerSession) => void) => () => void;
  onSessionCompleted: (callback: (session: import('./timer').TimerSession) => void) => () => void;
  onSettingsUpdated: (callback: (settings: import('./timer').TimerSettings) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
