import { ipcRenderer } from 'electron';
import './pomodoro-preload';

describe('pomodoro-preload events', () => {
  it('subscribes and unsubscribes to timer tick events', () => {
    const g = global as unknown as { window?: any };
    const cb = jest.fn();

    const off = g.window!.electronAPI.onTimerTick(cb);

    // Emit event twice
    (ipcRenderer as any)._emit('pomodoro:tick', { phase: 'focus', status: 'running', remainingTime: 1000, totalTime: 1500, sessionCount: 1 });
    (ipcRenderer as any)._emit('pomodoro:tick', { phase: 'focus', status: 'running', remainingTime: 900, totalTime: 1500, sessionCount: 1 });

    expect(cb).toHaveBeenCalledTimes(2);

    // Unsubscribe and emit again
    off();
    (ipcRenderer as any)._emit('pomodoro:tick', { phase: 'focus', status: 'running', remainingTime: 800, totalTime: 1500, sessionCount: 1 });

    expect(cb).toHaveBeenCalledTimes(2);
  });
});
