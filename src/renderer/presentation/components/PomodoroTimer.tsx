import { TimerConfig, TimerPhase, TimerState, TimerStatistics } from '@shared/types/timer';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * Pomodoro Timer Component
 * Main UI component for the Pomodoro timer system
 * Demonstrates the integration with the main process timer service
 */
export const PomodoroTimer: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [statistics, setStatistics] = useState<TimerStatistics | null>(null);
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        const [stateResult, statsResult, settingsResult] = await Promise.all([
          window.electronAPI.pomodoro.getState(),
          window.electronAPI.pomodoro.getStatistics(),
          window.electronAPI.getSettings()
        ]);

        if (!stateResult.success) {
          throw new Error(stateResult.error.message);
        }
        if (!statsResult.success) {
          throw new Error(statsResult.error.message);
        }
        if (!settingsResult.success) {
          throw new Error(settingsResult.error.message);
        }

        setTimerState(stateResult.data);
        setStatistics(statsResult.data);
        setConfig(settingsResult.data.config);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Subscribe to timer events
  useEffect(() => {
    const unsubscribeFromTick = window.electronAPI.onTimerTick((state) => {
      setTimerState(state);
    });

    const unsubscribeFromPhaseChange = window.electronAPI.onPhaseChanged((data) => {
      setTimerState(data.state);

      // Show phase transition message
      const phaseNames = {
        planning: 'Planning',
        focus: 'Focus',
        break: 'Break'
      };

      console.log(`Phase changed from ${phaseNames[data.fromPhase]} to ${phaseNames[data.toPhase]}`);
    });

    const unsubscribeFromStateChange = window.electronAPI.onStateChanged((state) => {
      setTimerState(state);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeFromTick();
      unsubscribeFromPhaseChange();
      unsubscribeFromStateChange();
    };
  }, []);

  // Timer control functions
  const handleStart = useCallback(async () => {
    try {
      const result = await window.electronAPI.pomodoro.start();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setTimerState(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer');
    }
  }, []);

  const handlePause = useCallback(async () => {
    try {
      const result = await window.electronAPI.pomodoro.pause();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setTimerState(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause timer');
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      const result = await window.electronAPI.pomodoro.reset();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setTimerState(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset timer');
    }
  }, []);

  const handleSkip = useCallback(async () => {
    try {
      const result = await window.electronAPI.pomodoro.skip();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      setTimerState(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip phase');
    }
  }, []);

  // Helper functions
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPhaseEmoji = (phase: TimerPhase): string => {
    switch (phase) {
      case 'planning': return '🎯';
      case 'focus': return '🔥';
      case 'break': return '☕';
      default: return '⏱️';
    }
  };

  const getPhaseDisplayName = (phase: TimerPhase): string => {
    switch (phase) {
      case 'planning': return 'Planning';
      case 'focus': return 'Focus';
      case 'break': return 'Break';
      default: return phase;
    }
  };

  if (isLoading) {
    return (
      <div className="pomodoro-timer loading">
        <div className="loading-spinner"></div>
        <p>Loading Pomodoro Timer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pomodoro-timer error">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!timerState) {
    return (
      <div className="pomodoro-timer error">
        <p>No timer state available</p>
      </div>
    );
  }

  return (
    <div className="pomodoro-timer">
      <header className="timer-header">
        <h1>Pomodoro Timer</h1>
      </header>

      <main className="timer-main">
        {/* Current Phase Display */}
        <div className="phase-display">
          <div className="phase-icon">
            {getPhaseEmoji(timerState.phase)}
          </div>
          <h2 className="phase-name">
            {getPhaseDisplayName(timerState.phase)}
          </h2>
          <div className="phase-status">
            Status: <span className={`status-${timerState.status}`}>
              {timerState.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timer Display */}
        <div className="timer-display">
          <div className="time-remaining">
            {formatTime(timerState.remainingTime)}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((timerState.totalTime - timerState.remainingTime) / timerState.totalTime) * 100}%`
              }}
            ></div>
          </div>
          <div className="time-info">
            {formatTime(timerState.totalTime - timerState.remainingTime)} / {formatTime(timerState.totalTime)}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="timer-controls">
          {timerState.status === 'idle' || timerState.status === 'paused' ? (
            <button className="control-btn start-btn" onClick={handleStart}>
              ▶️ Start
            </button>
          ) : (
            <button className="control-btn pause-btn" onClick={handlePause}>
              ⏸️ Pause
            </button>
          )}

          <button className="control-btn reset-btn" onClick={handleReset}>
            🔄 Reset
          </button>

          <button className="control-btn skip-btn" onClick={handleSkip}>
            ⏭️ Skip
          </button>
        </div>

        {/* Session Info */}
        <div className="session-info">
          <div className="session-count">
            Sessions Completed: <strong>{timerState.sessionCount}</strong>
          </div>
          {timerState.startTime && (
            <div className="session-start">
              Started: {new Date(timerState.startTime).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="statistics">
            <h3>📊 Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{statistics.completedSessions}</div>
                <div className="stat-label">Completed Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{statistics.todaysSessions}</div>
                <div className="stat-label">Today's Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{statistics.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{Math.round(statistics.totalFocusTime / (60 * 1000))}m</div>
                <div className="stat-label">Focus Time</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PomodoroTimer;
