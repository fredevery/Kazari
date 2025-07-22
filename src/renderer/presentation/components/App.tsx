import React, { useEffect } from 'react';
import { getSettings, setSettings } from '../../application/slices/settings-slice';
import { addToHistory, getCurrentSession, getSessionHistory, setCurrentSession } from '../../application/slices/timer-slice';
import { useAppDispatch, useAppSelector } from '../hooks/redux-hooks';
import { Dashboard } from './Dashboard';

/**
 * Main App component
 * Handles initialization and routes to appropriate views
 */
export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWindow } = useAppSelector(state => state.ui);

  useEffect(() => {
    // Initialize the app
    const initializeApp = (): (() => void) | undefined => {
      try {
        // Load initial data
        dispatch(getCurrentSession());
        dispatch(getSessionHistory());
        dispatch(getSettings());

        // Set up IPC event listeners
        const unsubscribeSessionUpdated = window.electronAPI.onSessionUpdated((session) => {
          dispatch(setCurrentSession(session));
        });

        const unsubscribeSessionCompleted = window.electronAPI.onSessionCompleted((session) => {
          dispatch(setCurrentSession(session));
          dispatch(addToHistory(session));
        });

        const unsubscribeSettingsUpdated = window.electronAPI.onSettingsUpdated((settings) => {
          dispatch(setSettings(settings));
        });

        // Return cleanup function
        return () => {
          unsubscribeSessionUpdated();
          unsubscribeSessionCompleted();
          unsubscribeSettingsUpdated();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        return undefined;
      }
    };

    const cleanup = initializeApp();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [dispatch]);

  // Determine which view to render based on current window type
  const renderCurrentView = (): JSX.Element => {
    switch (currentWindow) {
      case 'dashboard':
        return <Dashboard />;
      case 'floating-countdown':
        // TODO: Implement floating countdown component
        return <div>Floating Countdown (Coming Soon)</div>;
      case 'break-screen':
        // TODO: Implement break screen component
        return <div>Break Screen (Coming Soon)</div>;
      case 'planning':
        // TODO: Implement planning component
        return <div>Planning (Coming Soon)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {renderCurrentView()}
    </div>
  );
};
