import { ipcMain } from 'electron';
import { IPCChannelConfig, IPCManager } from './ipc-handler';

describe('IPCManager', () => {
  let ipcManager: IPCManager;
  beforeEach(() => {
    ipcManager = new IPCManager();
  });

  it('should register a channel and validate correct data', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const config: IPCChannelConfig<{ foo: string }, string> = {
      name: 'test:channel',
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'object' && data !== null && typeof (data as any).foo === 'string',
      sanitizer: (data) => ({ foo: String(data.foo) }),
      handler,
    };
    ipcManager.registerChannel(config);
    // Simulate ipcMain.handle call
    const result = await (ipcMain as any)._invokeHandler('test:channel', null, { foo: 'bar' });
    expect(result).toEqual({ success: true, data: 'ok' });
    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should reject invalid data', async () => {
    const handler = jest.fn();
    const config: IPCChannelConfig<{ foo: string }, string> = {
      name: 'test:channel',
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'object' && data !== null && typeof (data as any).foo === 'string',
      handler,
    };
    ipcManager.registerChannel(config);
    const result = await (ipcMain as any)._invokeHandler('test:channel', null, { foo: 123 });
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle errors in handler', async () => {
    const handler = jest.fn().mockImplementation(() => { throw new Error('fail'); });
    const config: IPCChannelConfig<{ foo: string }, string> = {
      name: 'test:channel',
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'object' && data !== null && typeof (data as any).foo === 'string',
      handler,
    };
    ipcManager.registerChannel(config);
    const result = await (ipcMain as any)._invokeHandler('test:channel', null, { foo: 'bar' });
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('IPC_ERROR');
  });

  it('should rate limit rapid repeated calls', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const config: IPCChannelConfig<{ v: number }, string> = {
      name: 'test:rl',
      direction: 'renderer-to-main',
      validator: (d) => typeof (d as any).v === 'number',
      handler,
    };
    ipcManager.registerChannel(config);
    const r1 = await (ipcMain as any)._invokeHandler('test:rl', null, { v: 1 });
    const r2 = await (ipcMain as any)._invokeHandler('test:rl', null, { v: 2 });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(false);
    expect(r2.error.code).toBe('RATE_LIMITED');
  });

  it('should time out long-running handlers when timeoutMs is set', async () => {
    const handler = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'late';
    });
    const config: IPCChannelConfig<{ v: number }, string> = {
      name: 'test:timeout',
      direction: 'renderer-to-main',
      validator: (d) => typeof (d as any).v === 'number',
      handler,
      timeoutMs: 10,
    };
    ipcManager.registerChannel(config);
    const res = await (ipcMain as any)._invokeHandler('test:timeout', null, { v: 1 });
    expect(res.success).toBe(false);
    expect(res.error.code).toBe('IPC_TIMEOUT');
  });
});
