import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateTimerSessionRequest, TimerSession } from '@shared/types/timer';

/**
 * Timer state interface
 */
interface TimerState {
  currentSession: TimerSession | null;
  sessionHistory: TimerSession[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: TimerState = {
  currentSession: null,
  sessionHistory: [],
  isLoading: false,
  error: null,
};

/**
 * Async thunks for timer operations
 */

export const createTimerSession = createAsyncThunk(
  'timer/createSession',
  async (request: CreateTimerSessionRequest, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.createSession(request);
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

export const startTimerSession = createAsyncThunk(
  'timer/startSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.startSession(sessionId);
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

export const pauseTimerSession = createAsyncThunk(
  'timer/pauseSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.pauseSession(sessionId);
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

export const stopTimerSession = createAsyncThunk(
  'timer/stopSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.stopSession(sessionId);
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

export const getCurrentSession = createAsyncThunk(
  'timer/getCurrentSession',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getCurrentSession();
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

export const getSessionHistory = createAsyncThunk(
  'timer/getSessionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const result = await window.electronAPI.getSessionHistory();
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
 * Timer slice
 */
export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<TimerSession | null>) => {
      state.currentSession = action.payload;
    },
    updateCurrentSession: (state, action: PayloadAction<Partial<TimerSession>>) => {
      if (state.currentSession && action.payload.id === state.currentSession.id) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },
    addToHistory: (state, action: PayloadAction<TimerSession>) => {
      const existingIndex = state.sessionHistory.findIndex(s => s.id === action.payload.id);
      if (existingIndex >= 0) {
        state.sessionHistory[existingIndex] = action.payload;
      } else {
        state.sessionHistory.unshift(action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create session
    builder
      .addCase(createTimerSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimerSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(createTimerSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Start session
    builder
      .addCase(startTimerSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTimerSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(startTimerSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Pause session
    builder
      .addCase(pauseTimerSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(pauseTimerSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(pauseTimerSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Stop session
    builder
      .addCase(stopTimerSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(stopTimerSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(stopTimerSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current session
    builder
      .addCase(getCurrentSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(getCurrentSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get session history
    builder
      .addCase(getSessionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSessionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionHistory = action.payload as TimerSession[];
      })
      .addCase(getSessionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentSession, updateCurrentSession, addToHistory, clearError } = timerSlice.actions;
