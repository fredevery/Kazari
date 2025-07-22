import React from 'react';
import { useAppSelector } from '../hooks/redux-hooks';
import { CreateTimerForm } from './CreateTimerForm';
import { SessionHistory } from './SessionHistory';
import { TimerControls } from './TimerControls';
import { TimerDisplay } from './TimerDisplay';

/**
 * Dashboard component - main timer interface
 */
export const Dashboard: React.FC = () => {
  const { currentSession, isLoading } = useAppSelector((state) => state.timer);
  const { isHistoryOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Kazari Timer</h1>
      </header>

      <main className="dashboard-main">
        {isLoading && (
          <div className="loading-indicator">
            Loading...
          </div>
        )}

        <div className="timer-section">
          <TimerDisplay session={currentSession} />
          <TimerControls session={currentSession} />
        </div>

        {!currentSession && (
          <div className="create-timer-section">
            <CreateTimerForm />
          </div>
        )}

        {isHistoryOpen && (
          <div className="history-section">
            <SessionHistory />
          </div>
        )}
      </main>
    </div>
  );
};
