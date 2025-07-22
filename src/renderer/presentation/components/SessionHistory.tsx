import React from 'react';
import { useAppSelector } from '../hooks/redux-hooks';

/**
 * Session history component - displays past timer sessions
 */
export const SessionHistory: React.FC = () => {
  const { sessionHistory, isLoading } = useAppSelector((state) => state.timer);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="session-history card">
        <h3 className="mb-3">Session History</h3>
        <div className="loading-indicator">Loading history...</div>
      </div>
    );
  }

  if (sessionHistory.length === 0) {
    return (
      <div className="session-history card">
        <h3 className="mb-3">Session History</h3>
        <p className="text-muted text-center">No sessions found</p>
      </div>
    );
  }

  return (
    <div className="session-history card">
      <h3 className="mb-3">Session History</h3>

      <div className="history-list">
        {sessionHistory.map((session) => (
          <div key={session.id} className="history-item">
            <div className="history-item-header">
              <h4 className="history-item-name">{session.name}</h4>
              <span className={`status-badge status-${session.status}`}>
                {session.status}
              </span>
            </div>

            <div className="history-item-details">
              <span className="history-item-duration">
                Duration: {formatTime(session.duration)}
              </span>
              {session.completedAt && (
                <span className="history-item-completed">
                  Completed: {formatDate(session.completedAt)}
                </span>
              )}
              {session.createdAt && (
                <span className="history-item-created">
                  Created: {formatDate(session.createdAt)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
