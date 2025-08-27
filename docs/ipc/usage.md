# IPC Usage Guide

This guide shows how to use Kazari's secure IPC API from the renderer via `window.electronAPI`.

All request/response calls return `IPCResult<T>` and never throw on transport errors. Validate `success` before using data.

## Quickstart

```ts
// Start Pomodoro
const res = await window.electronAPI.pomodoro.start();
if (res.success) {
  console.log('Timer state:', res.data);
} else {
  console.error(res.error.code, res.error.message);
}

// Configure timer
await window.electronAPI.pomodoro.configure({ focusDuration: 30, autoStartBreaks: true });

// Subscribe to events
const offTick = window.electronAPI.onTimerTick((state) => {
  // update UI (remainingTime in ms)
});

const offPhase = window.electronAPI.onPhaseChanged(({ fromPhase, toPhase, state }) => {
  // animate transition
});

// Later, clean up
offTick();
offPhase();
```

## Legacy Timer (backwards compatibility)

```ts
const create = await window.electronAPI.createSession({ name: 'Focus', duration: 25 * 60_000 });
const start = await window.electronAPI.startSession(create.success ? create.data.id : '');
const offLegacy = window.electronAPI.onSessionUpdated((session) => { /* ... */ });
// offLegacy();
```

## Settings

```ts
const s = await window.electronAPI.getSettings();
if (s.success) {
  const next = await window.electronAPI.updateSettings({ soundEnabled: false });
}
```

## Window management

```ts
await window.electronAPI.createWindow({ type: 'floating-countdown', bounds: { width: 320, height: 160 } });
await window.electronAPI.setAlwaysOnTop(true);
const ws = await window.electronAPI.getWindowState();
```

## App utilities

```ts
const v = await window.electronAPI.getVersion();
await window.electronAPI.showNotification({ title: 'Break over', body: 'Time to focus!' });
```

## Error handling

Every call returns:

```ts
export type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, unknown> } };
```

Common error codes:
- VALIDATION_ERROR: Payload failed schema/shape validation
- RATE_LIMITED: Too many calls in a short period
- TIMEOUT: Operation exceeded channel timeout
- SESSION_NOT_FOUND: Legacy session not found

## Security notes

- All communication is allowlisted in the main process and validated per channel.
- Only `window.electronAPI` is exposed; Node integration is disabled and context isolation is enabled.
- Do not call `ipcRenderer` directly from the renderer.

## Testing tips

- For unit tests, you can stub `window.electronAPI` methods to return deterministic `IPCResult<T>` values.
- Integration tests run with Electron APIs mocked; see the repository Jest setup for examples.

## Channel reference

See the full list of channels and payloads in `docs/ipc/channels.md`.
