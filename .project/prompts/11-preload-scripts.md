# Electron Preload Scripts Security Layer

The Electron Preload Scripts serve as the secure bridge between the main process and renderer processes, implementing controlled API exposure through contextBridge while maintaining strict security boundaries. They provide type-safe, validated IPC communication channels that prevent unauthorized access to system resources while enabling necessary application functionality. This addresses the critical security requirement for sandboxed renderer processes to communicate with the main process without compromising the application's security posture or exposing sensitive system APIs.

## Requirements

- ContextBridge API must expose only whitelisted, validated functions to renderer processes with no direct Node.js access
- IPC channel validation must enforce type safety with runtime schema validation for all message payloads
- Security boundary enforcement must prevent renderer processes from accessing unauthorized system resources or APIs
- API surface documentation must provide comprehensive examples and usage patterns for all exposed functions
- Error handling must sanitize all error messages before exposing them to renderer processes
- Type definitions must provide complete TypeScript support for all exposed APIs with strict typing
- Logging integration must capture security violations and API usage for monitoring and debugging
- Performance optimization must minimize serialization overhead for high-frequency IPC operations
- Version compatibility must ensure preload script APIs remain stable across application updates
- Development tooling must support debugging and hot reload without compromising security in production

## Rules

- rules/electron-security.md
- rules/ipc-communication.md
- rules/typescript-standards.md
- rules/error-handling.md

## Domain

```typescript
// Preload API domain model
interface PreloadAPI {
  timer: TimerPreloadAPI;
  tasks: TasksPreloadAPI;
  windows: WindowsPreloadAPI;
  settings: SettingsPreloadAPI;
  logger: LoggerPreloadAPI;
  system: SystemPreloadAPI;
}

interface TimerPreloadAPI {
  start(): Promise<TimerState>;
  pause(): Promise<TimerState>;
  reset(): Promise<TimerState>;
  skip(): Promise<TimerState>;
  getState(): Promise<TimerState>;
  onStateChange(callback: (state: TimerState) => void): () => void;
}

interface TasksPreloadAPI {
  getAll(): Promise<Task[]>;
  create(task: CreateTaskRequest): Promise<Task>;
  update(id: string, updates: UpdateTaskRequest): Promise<Task>;
  delete(id: string): Promise<void>;
  markComplete(id: string): Promise<Task>;
  onTasksChange(callback: (tasks: Task[]) => void): () => void;
}

interface WindowsPreloadAPI {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  setAlwaysOnTop(enabled: boolean): Promise<void>;
  onWindowEvent(event: WindowEvent, callback: (data: any) => void): () => void;
}

interface SettingsPreloadAPI {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  getAll(): Promise<UserSettings>;
  onSettingsChange(callback: (settings: UserSettings) => void): () => void;
}

interface LoggerPreloadAPI {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

interface ValidationSchema {
  [channel: string]: {
    request: JSONSchema;
    response: JSONSchema;
  };
}

interface SecurityPolicy {
  allowedChannels: string[];
  rateLimit: {
    [channel: string]: {
      maxRequests: number;
      windowMs: number;
    };
  };
  sanitization: {
    [channel: string]: SanitizationRule[];
  };
}
```

## Extra Considerations

- Runtime validation must handle malformed data gracefully without crashing the preload script
- Memory management requires careful cleanup of event listeners and IPC handlers to prevent leaks
- Error boundary isolation must prevent renderer errors from affecting main process stability
- API versioning strategy needed for backward compatibility during application updates
- Security audit trail must log all API calls with sufficient detail for forensic analysis
- Performance monitoring required for detecting IPC bottlenecks and optimizing high-traffic channels
- Cross-platform compatibility must account for different security models on various operating systems
- Development vs production security policies may require different levels of API exposure and logging
- Hot reload support must reinitialize preload scripts without losing security context
- Fallback mechanisms needed when main process becomes unresponsive during IPC operations

## Testing Considerations

Unit tests must verify API exposure correctness with mocked contextBridge and ipcRenderer dependencies. Security tests should validate that unauthorized APIs are not exposed and malicious payloads are properly rejected. Integration tests must verify end-to-end IPC communication flows with realistic data scenarios. Type safety tests should ensure all exposed APIs match their TypeScript definitions at runtime. Performance tests must validate IPC throughput and latency under various load conditions. Error handling tests must verify proper sanitization and safe error propagation to renderer processes. Compatibility tests should ensure preload scripts work across different Electron versions and operating systems.

## Implementation Notes

Use contextBridge.exposeInMainWorld exclusively for API exposure, never attach properties directly to window. Implement comprehensive input validation using libraries like Zod or Joi for all IPC payloads. Use TypeScript strict mode with complete type definitions for all exposed APIs. Implement proper error handling with sanitized error messages that don't leak sensitive information. Use structured logging with appropriate log levels and security context. Implement rate limiting and throttling for high-frequency API calls to prevent abuse. Use event emitter patterns for real-time updates with proper cleanup mechanisms. Implement defensive programming practices to handle edge cases and malformed inputs gracefully. Use consistent naming conventions and API patterns across all exposed functions.

## Specification by Example

```typescript
// Secure contextBridge API implementation
import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';

// Input validation schemas
const TimerActionSchema = z.enum(['start', 'pause', 'reset', 'skip']);
const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Secure API implementation
const timerAPI = {
  async start(): Promise<TimerState> {
    try {
      return await ipcRenderer.invoke('timer:start');
    } catch (error) {
      throw new Error('Failed to start timer');
    }
  },

  onStateChange(callback: (state: TimerState) => void): () => void {
    const handler = (_event: any, state: TimerState) => {
      if (isValidTimerState(state)) {
        callback(state);
      }
    };

    ipcRenderer.on('timer:state-changed', handler);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('timer:state-changed', handler);
    };
  }
};

// Validation helper
function isValidTimerState(state: any): state is TimerState {
  return state && typeof state.phase === 'string' && 
         typeof state.remainingTime === 'number';
}

// Secure contextBridge exposure
contextBridge.exposeInMainWorld('kazari', {
  timer: timerAPI,
  tasks: tasksAPI,
  logger: loggerAPI,
  // Only expose whitelisted APIs
});

// Type definitions for renderer
declare global {
  interface Window {
    kazari: {
      timer: TimerPreloadAPI;
      tasks: TasksPreloadAPI;
      logger: LoggerPreloadAPI;
    };
  }
}
```

## Verification

- [ ] ContextBridge exposes only whitelisted APIs with no direct Node.js access available to renderer
- [ ] All IPC channels implement comprehensive input validation with proper error handling
- [ ] Type definitions provide complete TypeScript support matching runtime API surface exactly
- [ ] Security boundaries prevent unauthorized system resource access from renderer processes
- [ ] Error messages are properly sanitized before exposure to renderer processes
- [ ] Event listeners implement proper cleanup mechanisms to prevent memory leaks
- [ ] API documentation includes comprehensive examples for all exposed functions
- [ ] Rate limiting prevents abuse of high-frequency API calls
- [ ] Performance remains acceptable under high IPC throughput scenarios
- [ ] Logging captures security violations and API usage for monitoring
- [ ] Hot reload functionality works without compromising security policies
- [ ] Cross-platform compatibility verified on macOS, Windows, and Linux
- [ ] Development and production security policies are appropriately configured
- [ ] All exposed APIs handle edge cases and malformed inputs gracefully
- [ ] API versioning strategy maintains backward compatibility during updates
