import { configureStore } from '@reduxjs/toolkit';
import { settingsSlice } from './slices/settings-slice';
import { uiSlice } from './slices/ui-slice';

/**
 * Redux store configuration
 */
export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
  // No special ignores required after removing legacy timer slice
      },
    }),
  devTools: process.env['NODE_ENV'] !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
