
// Import the preload to execute its top-level exposure
import './pomodoro-preload';

// Basic smoke test ensuring electronAPI is exposed with expected methods

describe('pomodoro-preload', () => {
  it('exposes electronAPI in window with expected shape', async () => {
    const g = global as unknown as { window?: any };
    expect(g.window).toBeDefined();
    expect(g.window.electronAPI).toBeDefined();

    const api = g.window.electronAPI as any;

    // Legacy methods
    expect(typeof api.createSession).toBe('function');
    expect(typeof api.startSession).toBe('function');
    expect(typeof api.pauseSession).toBe('function');
    expect(typeof api.stopSession).toBe('function');

    // Pomodoro group
    expect(api.pomodoro).toBeDefined();
    expect(typeof api.pomodoro.start).toBe('function');
    expect(typeof api.pomodoro.pause).toBe('function');
    expect(typeof api.pomodoro.reset).toBe('function');
    expect(typeof api.pomodoro.skip).toBe('function');
    expect(typeof api.pomodoro.configure).toBe('function');
    expect(typeof api.pomodoro.getState).toBe('function');
    expect(typeof api.pomodoro.getStatistics).toBe('function');
    expect(typeof api.pomodoro.getHistory).toBe('function');

    // Settings
    expect(typeof api.getSettings).toBe('function');
    expect(typeof api.updateSettings).toBe('function');

    // Window and App
    expect(typeof api.createWindow).toBe('function');
    expect(typeof api.getVersion).toBe('function');

    // Events return an unsubscribe function
    const off = api.onTimerTick(() => { });
    expect(typeof off).toBe('function');
  });
});
