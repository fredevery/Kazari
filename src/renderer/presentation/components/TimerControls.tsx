import { TimerSession } from '@shared/types/timer';
import React from 'react';
import { pauseTimerSession, startTimerSession, stopTimerSession } from '../../application/slices/timer-slice';
import { useAppDispatch } from '../hooks/redux-hooks';

interface TimerControlsProps {
  session: TimerSession | null;
}

/**
 * Timer controls component - handles start, pause, stop actions
 */
export const TimerControls: React.FC<TimerControlsProps> = ({ session }) => {
  const dispatch = useAppDispatch();

  const handleStart = (): void => {
    if (session) {
      dispatch(startTimerSession(session.id));
    }
  };

  const handlePause = (): void => {
    if (session) {
      dispatch(pauseTimerSession(session.id));
    }
  };

  const handleStop = (): void => {
    if (session) {
      dispatch(stopTimerSession(session.id));
    }
  };

  if (!session) {
    return null;
  }

  const canStart = session.status === 'idle' || session.status === 'paused';
  const canPause = session.status === 'running';
  const canStop = session.status === 'running' || session.status === 'paused';

  return (
    <div className="timer-controls flex gap-3">
      {canStart && (
        <button
          className="btn btn-success"
          onClick={handleStart}
        >
          {session.status === 'paused' ? 'Resume' : 'Start'}
        </button>
      )}

      {canPause && (
        <button
          className="btn btn-warning"
          onClick={handlePause}
        >
          Pause
        </button>
      )}

      {canStop && (
        <button
          className="btn btn-danger"
          onClick={handleStop}
        >
          Stop
        </button>
      )}
    </div>
  );
};
