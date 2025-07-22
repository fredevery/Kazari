import React from 'react';
import { PomodoroTimer } from './PomodoroTimer';

/**
 * Main App component
 * Renders the Pomodoro Timer application
 */
export const App: React.FC = () => {
  return (
    <div className="app">
      <PomodoroTimer />
    </div>
  );
};
