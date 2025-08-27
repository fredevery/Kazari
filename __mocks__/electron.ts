const handlers: Record<string, Function> = {};
const rendererHandlers: Record<string, Function[]> = {};

export const ipcMain = {
  handle: (channel: string, listener: Function) => {
    handlers[channel] = listener;
  },
  removeAllListeners: (channel: string) => {
    delete handlers[channel];
  },
  // Test helper to simulate invoke from renderer
  _invokeHandler: async (channel: string, event: any, ...args: any[]) => {
    const handler = handlers[channel];
    if (!handler) throw new Error(`No handler for channel ${channel}`);
    return handler(event, ...args);
  },
} as any;

export const BrowserWindow = {
  getAllWindows: () => [],
  fromWebContents: () => null,
} as any;

export const app = {
  getPath: (_: string) => '/tmp',
  getVersion: () => '0.0.0-test',
  quit: () => void 0,
  whenReady: () => Promise.resolve(),
  on: () => void 0,
} as any;

export const screen = {
  getPrimaryDisplay: () => ({ workAreaSize: { width: 1280, height: 800 } }),
} as any;

export const contextBridge = {
  exposeInMainWorld: (key: string, api: unknown) => {
    // Attach API to global window for tests
    const g = global as unknown as { window?: Record<string, unknown> };
    if (!g.window) g.window = {};
    g.window[key] = api;
  },
} as any;

export const ipcRenderer = {
  invoke: async () => ({ success: true, data: undefined }),
  on: (channel: string, listener: Function) => {
    (rendererHandlers[channel] ||= []).push(listener);
  },
  removeListener: (channel: string, listener: Function) => {
    const list = rendererHandlers[channel];
    if (!list) return;
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
  },
  // Test helper to simulate main->renderer event
  _emit: (channel: string, ...args: any[]) => {
    const list = rendererHandlers[channel];
    if (!list) return;
    // Simulate Electron's (event, ...args) signature; event is not used in our code
    for (const fn of [...list]) fn({}, ...args);
  },
} as any;

export const powerMonitor = {
  on: () => void 0,
} as any;

export default {};
