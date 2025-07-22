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
 * Exposes secure APIs to the renderer process using contextBridge
 */

const electronAPI: ElectronAPI = {
  // Legacy timer operations (for backwards compatibility)
  createSession: (request: CreateSessionIPCRequest): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.CREATE_SESSION, request),

  startSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.START_SESSION, sessionId),

  pauseSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.PAUSE_SESSION, sessionId),

  stopSession: (sessionId: string): Promise<IPCResult<LegacyTimerSession>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.STOP_SESSION, sessionId),

  getCurrentSession: (): Promise<IPCResult<LegacyTimerSession | null>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.GET_CURRENT_SESSION),

  getSessionHistory: (): Promise<IPCResult<readonly LegacyTimerSession[]>> =>
    ipcRenderer.invoke(TIMER_CHANNELS.GET_SESSION_HISTORY),

  // New Pomodoro timer operations
  pomodoro: {
    start: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.START_TIMER),

    pause: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.PAUSE_TIMER),

    reset: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.RESET_TIMER),

    skip: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.SKIP_PHASE),

    configure: (config: Partial<TimerConfig>): Promise<IPCResult<TimerConfig>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.CONFIGURE_TIMER, config),

    getState: (): Promise<IPCResult<TimerState>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_TIMER_STATE),

    getStatistics: (): Promise<IPCResult<TimerStatistics>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_STATISTICS),

    getHistory: (): Promise<IPCResult<readonly TimerSession[]>> =>
      ipcRenderer.invoke(TIMER_CHANNELS.GET_SESSION_HISTORY),
  },

  // Settings operations
  getSettings: (): Promise<IPCResult<TimerSettings>> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.GET_SETTINGS),

  updateSettings: (settings: Partial<TimerSettings>): Promise<IPCResult<TimerSettings>> =>
    ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE_SETTINGS, { settings }),

  // Window operations
  createWindow: (request: CreateWindowIPCRequest): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.CREATE_WINDOW, request),

  closeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.CLOSE_WINDOW),

  minimizeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.MINIMIZE_WINDOW),

  maximizeWindow: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.MAXIMIZE_WINDOW),

  setAlwaysOnTop: (alwaysOnTop: boolean): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, alwaysOnTop),

  getWindowState: (): Promise<IPCResult<WindowState>> =>
    ipcRenderer.invoke(WINDOW_CHANNELS.GET_WINDOW_STATE),

  // App operations
  quit: (): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(APP_CHANNELS.QUIT),

  getVersion: (): Promise<IPCResult<string>> =>
    ipcRenderer.invoke(APP_CHANNELS.GET_VERSION),

  showNotification: (request: ShowNotificationIPCRequest): Promise<IPCResult<void>> =>
    ipcRenderer.invoke(APP_CHANNELS.SHOW_NOTIFICATION, request),

  // Event subscriptions (legacy)
  onSessionUpdated: (callback: (session: LegacyTimerSession) => void) => {
    const handler = (_: IpcRendererEvent, session: LegacyTimerSession) => callback(session);
    ipcRenderer.on(TIMER_CHANNELS.SESSION_UPDATED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_UPDATED, handler);
  },

  onSessionCompleted: (callback: (session: LegacyTimerSession) => void) => {
    const handler = (_: IpcRendererEvent, session: LegacyTimerSession) => callback(session);
    ipcRenderer.on(TIMER_CHANNELS.SESSION_COMPLETED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_COMPLETED, handler);
  },

  onSettingsUpdated: (callback: (settings: TimerSettings) => void) => {
    const handler = (_: IpcRendererEvent, settings: TimerSettings) => callback(settings);
    ipcRenderer.on(SETTINGS_CHANNELS.SETTINGS_UPDATED, handler);
    return () => ipcRenderer.removeListener(SETTINGS_CHANNELS.SETTINGS_UPDATED, handler);
  },

  // New Pomodoro timer events
  onTimerTick: (callback: (state: TimerState) => void) => {
    const handler = (_: IpcRendererEvent, state: TimerState) => callback(state);
    ipcRenderer.on(TIMER_CHANNELS.TIMER_TICK, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.TIMER_TICK, handler);
  },

  onPhaseChanged: (callback: (data: PhaseChangedIPCData) => void) => {
    const handler = (_: IpcRendererEvent, data: PhaseChangedIPCData) => callback(data);
    ipcRenderer.on(TIMER_CHANNELS.PHASE_CHANGED, handler);
    return () => ipcRenderer.removeListener(TIMER_CHANNELS.PHASE_CHANGED, handler);
  },

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
