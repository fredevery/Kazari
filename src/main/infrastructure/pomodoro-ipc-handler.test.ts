import { TIMER_CHANNELS, WINDOW_CHANNELS } from '@shared/types/ipc';
import { BrowserWindow, ipcMain } from 'electron';
import { PomodoroIPCHandler } from './pomodoro-ipc-handler';

// Minimal fakes for dependencies
const fakePomodoroService = {
  start: jest.fn(async () => ({ success: true, data: { phase: 'focus', status: 'running', remainingTime: 0, totalTime: 0, sessionCount: 1 } })),
  pause: jest.fn(),
  reset: jest.fn(),
  skip: jest.fn(),
  configure: jest.fn(),
  getState: jest.fn(),
  getStatistics: jest.fn(),
  getHistory: jest.fn(),
  onTick: (cb: Function) => { PomodoroIPCHandlerTestHarness.tick = cb as any; return () => { }; },
  onPhaseChange: (cb: Function) => { PomodoroIPCHandlerTestHarness.phase = cb as any; return () => { }; },
  onStateChange: (cb: Function) => { PomodoroIPCHandlerTestHarness.state = cb as any; return () => { }; },
  cleanup: jest.fn(),
} as any;

const fakeLegacyService = {
  createSession: jest.fn(),
  startSession: jest.fn(),
  pauseSession: jest.fn(),
  stopSession: jest.fn(),
  getCurrentSession: jest.fn(),
  getSessionHistory: jest.fn(),
} as any;

const fakeSettingsRepo = {
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
} as any;

const fakeWindowManager = {
  createWindow: jest.fn(),
} as any;

const fakeNotificationService = {
  showCustomNotification: jest.fn(),
} as any;

class PomodoroIPCHandlerTestHarness {
  static tick?: (s: any) => void;
  static phase?: (from: any, to: any, s: any) => void;
  static state?: (s: any) => void;
}

describe('PomodoroIPCHandler', () => {
  beforeAll(() => {
    // Instantiate to register channels
    new PomodoroIPCHandler(
      fakePomodoroService,
      fakeLegacyService,
      fakeSettingsRepo,
      fakeWindowManager,
      fakeNotificationService
    );
  });

  it('broadcasts timer events to all windows', () => {
    // Arrange two fake BrowserWindows with spies
    const sendA = jest.fn();
    const sendB = jest.fn();
    (BrowserWindow as any).getAllWindows = () => [
      { isDestroyed: () => false, webContents: { send: sendA } },
      { isDestroyed: () => false, webContents: { send: sendB } },
    ];

    // Act - simulate service events via captured callbacks
    PomodoroIPCHandlerTestHarness.tick!({ foo: 'bar' });
    PomodoroIPCHandlerTestHarness.state!({ baz: 'qux' });
    PomodoroIPCHandlerTestHarness.phase!('planning', 'focus', { test: true });

    // Assert each window received messages on expected channels
    expect(sendA).toHaveBeenCalledWith(TIMER_CHANNELS.TIMER_TICK, { foo: 'bar' });
    expect(sendB).toHaveBeenCalledWith(TIMER_CHANNELS.TIMER_TICK, { foo: 'bar' });

    expect(sendA).toHaveBeenCalledWith(TIMER_CHANNELS.STATE_CHANGED, { baz: 'qux' });
    expect(sendB).toHaveBeenCalledWith(TIMER_CHANNELS.STATE_CHANGED, { baz: 'qux' });

    expect(sendA).toHaveBeenCalledWith(TIMER_CHANNELS.PHASE_CHANGED, { fromPhase: 'planning', toPhase: 'focus', state: { test: true } });
    expect(sendB).toHaveBeenCalledWith(TIMER_CHANNELS.PHASE_CHANGED, { fromPhase: 'planning', toPhase: 'focus', state: { test: true } });
  });

  it('validates alwaysOnTop flag is boolean', async () => {
    const res = await (ipcMain as any)._invokeHandler(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, { sender: {} }, 'not-a-boolean');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe('INVALID_REQUEST');
    }
  });
});
