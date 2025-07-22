import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WindowType } from '@shared/types/timer';

/**
 * UI state interface
 */
interface UIState {
  currentWindow: WindowType;
  isSettingsOpen: boolean;
  isHistoryOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
}

/**
 * Initial state
 */
const initialState: UIState = {
  currentWindow: 'dashboard',
  isSettingsOpen: false,
  isHistoryOpen: false,
  theme: 'system',
  notifications: [],
};

/**
 * UI slice
 */
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentWindow: (state, action: PayloadAction<WindowType>) => {
      state.currentWindow = action.payload;
    },
    toggleSettings: (state) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
    setSettingsOpen: (state, action: PayloadAction<boolean>) => {
      state.isSettingsOpen = action.payload;
    },
    toggleHistory: (state) => {
      state.isHistoryOpen = !state.isHistoryOpen;
    },
    setHistoryOpen: (state, action: PayloadAction<boolean>) => {
      state.isHistoryOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>) => {
      const notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        ...action.payload,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setCurrentWindow,
  toggleSettings,
  setSettingsOpen,
  toggleHistory,
  setHistoryOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;
