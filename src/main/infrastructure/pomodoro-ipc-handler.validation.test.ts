import { APP_CHANNELS, SETTINGS_CHANNELS, TIMER_CHANNELS, WINDOW_CHANNELS } from '@shared/types/ipc';
import { ipcMain } from 'electron';
import { PomodoroIPCHandler } from './pomodoro-ipc-handler';

// Minimal fakes
const fakePomodoroService = {
  start: jest.fn(), pause: jest.fn(), reset: jest.fn(), skip: jest.fn(),
  configure: jest.fn(), getState: jest.fn(), getStatistics: jest.fn(), getHistory: jest.fn(),
  onTick: () => () => { }, onPhaseChange: () => () => { }, onStateChange: () => () => { }, cleanup: jest.fn(),
} as any;
const fakeLegacyService = { createSession: jest.fn(), startSession: jest.fn(), pauseSession: jest.fn(), stopSession: jest.fn(), getCurrentSession: jest.fn(), getSessionHistory: jest.fn() } as any;
const fakeSettingsRepo = { getSettings: jest.fn(), updateSettings: jest.fn() } as any;
const fakeWindowManager = { createWindow: jest.fn() } as any;
const fakeNotificationService = { showCustomNotification: jest.fn() } as any;

// Register channels once
new PomodoroIPCHandler(
  fakePomodoroService,
  fakeLegacyService,
  fakeSettingsRepo,
  fakeWindowManager,
  fakeNotificationService
);

describe('PomodoroIPCHandler validation', () => {
  it('rejects invalid pomodoro configure payload', async () => {
    const res = await (ipcMain as any)._invokeHandler(TIMER_CHANNELS.CONFIGURE_TIMER, {}, { focusDuration: -1 });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.code).toBe('INVALID_CONFIG');
  });

  it('rejects invalid settings update payload', async () => {
    const res = await (ipcMain as any)._invokeHandler(SETTINGS_CHANNELS.UPDATE_SETTINGS, {}, { settings: null });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.code).toBe('INVALID_SETTINGS');
  });

  it('rejects invalid window create payload', async () => {
    const res = await (ipcMain as any)._invokeHandler(WINDOW_CHANNELS.CREATE_WINDOW, {}, { type: 'unknown-type' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.code).toBe('INVALID_REQUEST');
  });

  it('rejects invalid notification payload', async () => {
    const res = await (ipcMain as any)._invokeHandler(APP_CHANNELS.SHOW_NOTIFICATION, {}, { title: '', body: '' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.code).toBe('INVALID_NOTIFICATION');
  });
});
