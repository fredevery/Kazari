import { BrowserWindow, ipcMain } from 'electron';
import { PomodoroIPCHandler } from './pomodoro-ipc-handler';
import { SETTINGS_CHANNELS } from '@shared/types/ipc';

// Fakes
const fakePomodoroService = {
  onTick: () => () => {}, onPhaseChange: () => () => {}, onStateChange: () => () => {},
  start: jest.fn(), pause: jest.fn(), reset: jest.fn(), skip: jest.fn(),
  configure: jest.fn(), getState: jest.fn(), getStatistics: jest.fn(), getHistory: jest.fn(),
  cleanup: jest.fn(),
} as any;
const fakeLegacyService = { createSession: jest.fn(), startSession: jest.fn(), pauseSession: jest.fn(), stopSession: jest.fn(), getCurrentSession: jest.fn(), getSessionHistory: jest.fn() } as any;
const fakeWindowManager = { createWindow: jest.fn() } as any;

const defaultConfig = {
  planningDuration: 5, focusDuration: 25, breakDuration: 5, longBreakDuration: 15, longBreakInterval: 4,
  autoStartBreaks: true, autoStartFocus: false,
};

const fakeSettingsRepo = {
  getSettings: jest.fn(),
  updateSettings: jest.fn(async (s: any) => ({
    config: s.config ?? defaultConfig,
    notifications: s.notifications ?? true,
    soundEnabled: s.soundEnabled ?? true,
    alwaysOnTop: s.alwaysOnTop ?? false,
  })),
} as any;

// Register channels
new PomodoroIPCHandler(
  fakePomodoroService,
  fakeLegacyService,
  fakeSettingsRepo,
  fakeWindowManager,
  { showCustomNotification: jest.fn() } as any
);

describe('settings:update broadcasts SETTINGS_UPDATED', () => {
  it('sends settings update to all windows', async () => {
    const sendA = jest.fn();
    const sendB = jest.fn();
    (BrowserWindow as any).getAllWindows = () => [
      { isDestroyed: () => false, webContents: { send: sendA } },
      { isDestroyed: () => false, webContents: { send: sendB } },
    ];

    const payload = { settings: { notifications: false, config: defaultConfig } };
    const res = await (ipcMain as any)._invokeHandler(SETTINGS_CHANNELS.UPDATE_SETTINGS, {}, payload);
    expect(res.success).toBe(true);

    expect(sendA).toHaveBeenCalledWith(SETTINGS_CHANNELS.SETTINGS_UPDATED, expect.objectContaining({ notifications: false }));
    expect(sendB).toHaveBeenCalledWith(SETTINGS_CHANNELS.SETTINGS_UPDATED, expect.objectContaining({ notifications: false }));
  });
});
