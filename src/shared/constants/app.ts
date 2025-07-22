/**
 * Shared constants used across all processes
 */

export const APP_CONFIG = {
  NAME: 'Kazari',
  VERSION: '0.1.0',
  AUTHOR: 'Oonyana',
  DESCRIPTION: 'A cross-platform desktop productivity application',
} as const;

export const TIMER_CONFIG = {
  DEFAULT_DURATION: 25 * 60 * 1000, // 25 minutes in milliseconds
  MIN_DURATION: 1 * 60 * 1000, // 1 minute
  MAX_DURATION: 120 * 60 * 1000, // 2 hours
  TICK_INTERVAL: 1000, // 1 second
  WARNING_TIME: 60 * 1000, // 1 minute warning

  // Pomodoro timer specific configuration
  DEFAULT_POMODORO_CONFIG: {
    planningDuration: 5, // minutes
    focusDuration: 25, // minutes
    breakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    longBreakInterval: 4, // every N sessions
    autoStartBreaks: true,
    autoStartFocus: false,
  },
} as const;

export const WINDOW_CONFIG = {
  DASHBOARD: {
    WIDTH: 800,
    HEIGHT: 600,
    MIN_WIDTH: 600,
    MIN_HEIGHT: 400,
  },
  FLOATING_COUNTDOWN: {
    WIDTH: 300,
    HEIGHT: 150,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 100,
  },
  BREAK_SCREEN: {
    // Fullscreen, dimensions set dynamically
  },
  PLANNING: {
    WIDTH: 600,
    HEIGHT: 500,
    MIN_WIDTH: 500,
    MIN_HEIGHT: 400,
  },
} as const;

export const STORAGE_KEYS = {
  TIMER_SESSIONS: 'timer-sessions',
  TIMER_SETTINGS: 'timer-settings',
  WINDOW_STATES: 'window-states',
  APP_SETTINGS: 'app-settings',
} as const;

export const DEFAULT_SETTINGS = {
  TIMER: {
    defaultDuration: TIMER_CONFIG.DEFAULT_DURATION,
    autoStart: false,
    notifications: true,
    soundEnabled: true,
    alwaysOnTop: false,
  },
} as const;
