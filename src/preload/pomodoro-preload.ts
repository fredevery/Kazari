import {
  APP_CHANNELS,
  CreateSessionIPCRequest,
  CreateWindowIPCRequest,
  ElectronAPI,
  IPCResult,
  PhaseChangedIPCData,
  SETTINGS_CHANNELS,
  ShowNotificationIPCRequest,
  TIMER_CHANNELS,
  WINDOW_CHANNELS
} from '@shared/types/ipc';
import {
  LegacyTimerSession,
  TimerConfig,
  TimerSession,
  TimerSettings,
  TimerState,
  TimerStatistics, // For backwards compatibility
  WindowState
} from '@shared/types/timer';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Preload script for the Pomodoro Timer System
 *
 * Exposes a minimal, secure API to the renderer via contextBridge. All methods return
 * IPCResult<T> and never throw on transport errors. Event subscriptions return an
 * unsubscribe function that must be called to avoid leaks.
 */

const electronAPI: ElectronAPI = {
  // Legacy timer operations (for backwards compatibility)
  /** Create a legacy timer session with a name and duration (ms). */
  createSession: (request: CreateSessionIPCRequest): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.CREATE_SESSION, request),

  /** Start a legacy timer session by id. */
  startSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.START_SESSION, sessionId),

  /** Pause a legacy timer session by id. */
  pauseSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.PAUSE_SESSION, sessionId),

  /** Stop a legacy timer session by id. */
  stopSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.STOP_SESSION, sessionId),

  /** Get the current legacy session, if any. */
  getCurrentSession: (): Promise<IPCResult<LegacyTimerSession | null>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.GET_CURRENT_SESSION),

  /** Get the history of legacy sessions. */
  getSessionHistory: (): Promise<IPCResult<readonly LegacyTimerSession[]>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.GET_SESSION_HISTORY),

  // New Pomodoro timer operations
  pomodoro: {
    /** Start the Pomodoro timer. */
    start: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.START_TIMER),

    /** Pause the Pomodoro timer. */
    pause: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.PAUSE_TIMER),

    /** Reset the Pomodoro timer to idle state. */
    reset: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.RESET_TIMER),

    /** Skip the current phase (planning/focus/break). */
    skip: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.SKIP_PHASE),

    /** Update Pomodoro configuration; unspecified fields remain unchanged. */
    configure: (config: Partial<TimerConfig>): Promise<IPCResult<TimerConfig>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.CONFIGURE_TIMER, config),

    /** Get the current timer state. */
    getState: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_TIMER_STATE),

    /** Get aggregated timer statistics. */
    getStatistics: (): Promise<IPCResult<TimerStatistics>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_STATISTICS),

    /** Get structured session history records. */
    getHistory: (): Promise<IPCResult<readonly TimerSession[]>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_SESSION_HISTORY),
  },

  // Settings operations
  /** Retrieve persisted timer settings. */
  getSettings: (): Promise<IPCResult<TimerSettings>> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.GET_SETTINGS),

  /** Update and persist timer settings. */
  updateSettings: (settings: Partial<TimerSettings>): Promise<IPCResult<TimerSettings>> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE_SETTINGS, { settings }),

  // Window operations
  /** Create a new window of the provided type. */
  createWindow: (request: CreateWindowIPCRequest): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.CREATE_WINDOW, request),

  /** Close the current window. */
  closeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.CLOSE_WINDOW),

  /** Minimize the current window. */
  minimizeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.MINIMIZE_WINDOW),

  /** Maximize or restore the current window. */
  maximizeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.MAXIMIZE_WINDOW),

  /** Toggle always-on-top for the current window. */
  setAlwaysOnTop: (alwaysOnTop: boolean): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, alwaysOnTop),

  /** Query the current window state. */
  getWindowState: (): Promise<IPCResult<WindowState>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.GET_WINDOW_STATE),

  // App operations
  /** Quit the application. */
  quit: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(APP_CHANNELS.QUIT),

  /** Get the app version string. */
  getVersion: (): Promise<IPCResult<string>> =>
    ipcRenderer.invoke(APP_CHANNELS.GET_VERSION),

  /** Show a system notification. */
  showNotification: (request: ShowNotificationIPCRequest): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(APP_CHANNELS.SHOW_NOTIFICATION, request),

  // Event subscriptions (legacy)
  /** Subscribe to legacy session update events. */
  onSessionUpdated: (callback: (session: LegacyTimerSession) => void) => {
    const handler = (_: IpcRendererEvent, session: LegacyTimerSession) => callback(session);
    ipcRenderer.on(TIMER_CHANNELS.SESSION_UPDATED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_UPDATED, handler);
  },

  /** Subscribe to legacy session completion events. */
  onSessionCompleted: (callback: (session: LegacyTimerSession) => void) => {
    const handler = (_: IpcRendererEvent, session: LegacyTimerSession) => callback(session);
    ipcRenderer.on(TIMER_CHANNELS.SESSION_COMPLETED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_COMPLETED, handler);
  },

  /** Subscribe to settings update events. */
  onSettingsUpdated: (callback: (settings: TimerSettings) => void) => {
    const handler = (_: IpcRendererEvent, settings: TimerSettings) => callback(settings);
    ipcRenderer.on(SETTINGS_CHANNELS.SETTINGS_UPDATED, handler);
    return () => ipcRenderer.removeListener(SETTINGS_CHANNELS.SETTINGS_UPDATED, handler);
  },

  // New Pomodoro timer events
  /** Subscribe to high-frequency timer tick updates. */
  onTimerTick: (callback: (state: TimerState) => void) => {
    const handler = (_: IpcRendererEvent, state: TimerState) => callback(state);
    ipcRenderer.on(TIMER_CHANNELS.TIMER_TICK, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.TIMER_TICK, handler);
  },

  /** Subscribe to phase change events. */
  onPhaseChanged: (callback: (data: PhaseChangedIPCData) => void) => {
    const handler = (_: IpcRendererEvent, data: PhaseChangedIPCData) => callback(data);
    ipcRenderer.on(TIMER_CHANNELS.PHASE_CHANGED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.PHASE_CHANGED, handler);
  },

  /** Subscribe to coarse timer state changes. */
  onStateChanged: (callback: (state: TimerState) => void) => {
    const handler = (_: IpcRendererEvent, state: TimerState) => callback(state);
    ipcRenderer.on(TIMER_CHANNELS.STATE_CHANGED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.STATE_CHANGED, handler);
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type guard to ensure window.electronAPI is properly typed
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

console.log('Pomodoro Timer preload script loaded successfully');
