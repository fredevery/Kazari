import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimerSettings } from '@shared/types/timer';

/**
 * Settings state interface
 */
interface SettingsState {
  settings: TimerSettings | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

/**
 * Async thunks for settings operations
 */

export const getSettings = createAsyncThunk(
  'settings/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getSettings();
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error.message);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings: Partial<TimerSettings>, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.updateSettings(settings);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error.message);
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * Settings slice
 */
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<TimerSettings>) => {
      state.settings = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get settings
    builder
      .addCase(getSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update settings
    builder
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSettings, clearError } = settingsSlice.actions;
