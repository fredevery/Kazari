import { configureStore } from '@reduxjs/toolkit';
import { settingsSlice } from './slices/settings-slice';
import { timerSlice } from './slices/timer-slice';
import { uiSlice } from './slices/ui-slice';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    timer: timerSlice.reducer,
    settings: settingsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['timer/setCurrentSession', 'timer/addToHistory'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.createdAt', 'payload.startedAt', 'payload.pausedAt', 'payload.completedAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'timer.currentSession.createdAt',
          'timer.currentSession.startedAt',
          'timer.currentSession.pausedAt',
          'timer.currentSession.completedAt',
          'timer.sessionHistory',
        ],
      },
    }),
  devTools: process.env['NODE_ENV'] !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
