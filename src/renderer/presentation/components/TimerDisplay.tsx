import { TimerSession } from '@shared/types/timer';
import React from 'react';

interface TimerDisplayProps {
  session: TimerSession | null;
}

/**
 * Timer display component - shows current timer state and remaining time
 */
export const TimerDisplay: React.FC<TimerDisplayProps> = ({ session }) => {
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="timer-display card text-center">
        <h2>No Timer Active</h2>
        <p className="text-muted">Create a new timer to get started</p>
      </div>
    );
  }

  return (
    <div className="timer-display card text-center">
      <h2 className="mb-2">{session.name}</h2>
      <div className="timer-time">
        <span className="time-display">{formatTime(session.remainingTime)}</span>
      </div>
      <div className="timer-status mt-2">
        <span className={`status-badge status-${session.status}`}>
          {session.status.toUpperCase()}
        </span>
      </div>
      <div className="timer-progress mt-3">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((session.duration - session.remainingTime) / session.duration) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};
