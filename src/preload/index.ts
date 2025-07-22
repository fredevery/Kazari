import {
  APP_CHANNELS,
  ElectronAPI,
  SETTINGS_CHANNELS,
  TIMER_CHANNELS,
  WINDOW_CHANNELS,
} from '@shared/types/ipc';
import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script that exposes secure APIs to renderer processes
 */

// Create the API object that will be exposed to renderer processes
const electronAPI: ElectronAPI = {
  // Timer operations
  createSession: async (request) => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.CREATE_SESSION, request);
  },

  startSession: async (sessionId) => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.START_SESSION, sessionId);
  },

  pauseSession: async (sessionId) => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.PAUSE_SESSION, sessionId);
  },

  stopSession: async (sessionId) => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.STOP_SESSION, sessionId);
  },

  getCurrentSession: async () => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.GET_CURRENT_SESSION);
  },

  getSessionHistory: async () => {
    return await ipcRenderer.invoke(TIMER_CHANNELS.GET_SESSION_HISTORY);
  },

  // Settings operations
  getSettings: async () => {
    return await ipcRenderer.invoke(SETTINGS_CHANNELS.GET_SETTINGS);
  },

  updateSettings: async (settings) => {
    return await ipcRenderer.invoke(SETTINGS_CHANNELS.UPDATE_SETTINGS, { settings });
  },

  // Window operations
  createWindow: async (request) => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.CREATE_WINDOW, request);
  },

  closeWindow: async () => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.CLOSE_WINDOW);
  },

  minimizeWindow: async () => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.MINIMIZE_WINDOW);
  },

  maximizeWindow: async () => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.MAXIMIZE_WINDOW);
  },

  setAlwaysOnTop: async (alwaysOnTop) => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, alwaysOnTop);
  },

  getWindowState: async () => {
    return await ipcRenderer.invoke(WINDOW_CHANNELS.GET_WINDOW_STATE);
  },

  // App operations
  quit: async () => {
    return await ipcRenderer.invoke(APP_CHANNELS.QUIT);
  },

  getVersion: async () => {
    return await ipcRenderer.invoke(APP_CHANNELS.GET_VERSION);
  },

  showNotification: async (request) => {
    return await ipcRenderer.invoke(APP_CHANNELS.SHOW_NOTIFICATION, request);
  },

  // Event subscriptions
  onSessionUpdated: (callback) => {
    const subscription = (_event: Electron.IpcRendererEvent, session: any) => {
      callback(session);
    };

    ipcRenderer.on(TIMER_CHANNELS.SESSION_UPDATED, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_UPDATED, subscription);
    };
  },

  onSessionCompleted: (callback) => {
    const subscription = (_event: Electron.IpcRendererEvent, session: any) => {
      callback(session);
    };

    ipcRenderer.on(TIMER_CHANNELS.SESSION_COMPLETED, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(TIMER_CHANNELS.SESSION_COMPLETED, subscription);
    };
  },

  onSettingsUpdated: (callback) => {
    const subscription = (_event: Electron.IpcRendererEvent, settings: any) => {
      callback(settings);
    };

    ipcRenderer.on(SETTINGS_CHANNELS.SETTINGS_UPDATED, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(SETTINGS_CHANNELS.SETTINGS_UPDATED, subscription);
    };
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Log that preload script has loaded (for debugging)
console.log('Preload script loaded successfully');

export { };

