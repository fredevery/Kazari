# TypeScript Integration and Project Architecture

_Implement a comprehensive TypeScript integration for the Kazari Electron application using project references to share types across main, preload, and renderer processes, with complete type definitions for IPC channels, modules, and domain models to ensure type safety and maintainability throughout the codebase._

## Requirements

- Set up TypeScript project references architecture with shared types across main, preload, and renderer processes
- Create comprehensive type definitions for all IPC channels, requests, responses, and error handling
- Implement strongly-typed domain models for timer, session, task, and notification entities
- Configure TypeScript compilation with strict mode and proper module resolution across all processes
- Create type-safe IPC client/server abstractions that prevent runtime type mismatches
- Implement branded types for domain-specific identifiers (SessionId, TaskId, TimerId, etc.)
- Add comprehensive type definitions for Electron APIs and custom window management
- Create utility types for common patterns like event handling, state management, and async operations
- Implement proper type guards and validation for data crossing process boundaries
- Document all types with comprehensive JSDoc comments and usage examples

## Rules

- rules/typescript-standards.md
- rules/ipc-communication.md
- rules/build-configuration.md
- rules/electron-main-process.md
- rules/error-handling.md
- rules/state-management.md

## Domain

```typescript
// Project structure and configuration types
interface TypeScriptProjectConfig {
  references: ProjectReference[];
  sharedTypes: SharedTypeDefinition[];
  compilationTargets: CompilationTarget[];
  moduleResolution: ModuleResolutionStrategy;
  strictness: StrictnessLevel;
}

interface ProjectReference {
  path: string;
  prepend?: boolean;
  composite: boolean;
}

interface SharedTypeDefinition {
  namespace: string;
  location: string;
  exports: TypeExport[];
  dependencies: string[];
}

// IPC type system
interface IPCContract {
  channels: Record<string, ChannelDefinition>;
  events: Record<string, EventDefinition>;
  errors: Record<string, ErrorDefinition>;
}

interface ChannelDefinition<TRequest = unknown, TResponse = unknown> {
  request: TRequest;
  response: TResponse;
  validation: ValidationSchema<TRequest>;
  timeout?: number;
}

interface EventDefinition<TPayload = unknown> {
  payload: TPayload;
  validation: ValidationSchema<TPayload>;
  broadcast: boolean;
}

// Domain-specific branded types
type SessionId = string & { readonly __brand: 'SessionId' };
type TaskId = string & { readonly __brand: 'TaskId' };
type TimerId = string & { readonly __brand: 'TimerId' };
type UserId = string & { readonly __brand: 'UserId' };
type NotificationId = string & { readonly __brand: 'NotificationId' };

// Core domain types with full type safety
interface TimerState {
  readonly id: TimerId;
  readonly sessionId: SessionId;
  phase: 'planning' | 'focus' | 'break';
  remainingTime: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  readonly id: TaskId;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedDuration: number;
  actualDuration?: number;
  completedAt?: Date;
  createdAt: Date;
}

interface Session {
  readonly id: SessionId;
  readonly taskId: TaskId;
  startTime: Date;
  endTime?: Date;
  duration: number;
  phase: 'planning' | 'focus' | 'break';
  completedSuccessfully: boolean;
  notes?: string;
}

// Type-safe error handling
type AppErrorCode = 
  | 'TIMER_START_FAILED'
  | 'TIMER_PAUSE_FAILED' 
  | 'TIMER_RESET_FAILED'
  | 'TASK_NOT_FOUND'
  | 'SESSION_INVALID'
  | 'IPC_COMMUNICATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED';

interface TypedAppError<TCode extends AppErrorCode = AppErrorCode> {
  code: TCode;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, unknown>;
  recoverable: boolean;
  timestamp: Date;
}
```

## Extra Considerations

- TypeScript compilation must be fast enough for productive development with watch mode
- Type definitions should be automatically generated from runtime schemas where possible
- Project references must work correctly with build tools (Vite) and IDEs
- Type checking should catch IPC contract mismatches at compile time, not runtime
- Shared types must be versioned to handle schema evolution and backward compatibility
- Generic types should be used appropriately without sacrificing readability or performance
- Type definitions should support both strict and gradual typing adoption strategies
- Consider performance implications of complex type computations at compile time
- Types should be self-documenting with comprehensive JSDoc annotations
- Integration with external libraries should maintain type safety through proper declarations

## Testing Considerations

- Type-only tests to verify type compatibility and inference correctness
- Runtime type validation tests for data crossing process boundaries
- Integration tests for IPC type safety across main/renderer communication
- Build-time tests to ensure project references resolve correctly
- Performance tests for TypeScript compilation times across different project sizes
- Testing of type definitions with various IDE configurations and versions
- Automated testing of generated type definitions from schemas
- Regression testing for type changes to prevent breaking changes
- Testing type narrowing and control flow analysis in complex scenarios

## Implementation Notes

- Use TypeScript project references with composite projects for efficient incremental compilation
- Implement utility functions for runtime type validation that align with compile-time types
- Create code generation tools for IPC contracts from central schema definitions
- Use path mapping in tsconfig to create clean import paths for shared types
- Implement proper type declaration merging for extending third-party library types
- Use conditional types and template literal types for advanced type inference
- Create custom ESLint rules to enforce project-specific TypeScript patterns
- Implement proper dependency tracking between type definition files
- Use TypeScript's strict mode with all strict checks enabled for maximum safety
- Create comprehensive type utilities for common patterns like event handling and async operations

## Specification by Example

### Project References Configuration
```json
// tsconfig.json - Root configuration with project references
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext", 
    "lib": ["ES2022"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@main/*": ["src/main/*"],
      "@renderer/*": ["src/renderer/*"],
      "@preload/*": ["src/preload/*"]
    }
  },
  "references": [
    { "path": "./src/shared" },
    { "path": "./src/main" },
    { "path": "./src/preload" },
    { "path": "./src/renderer" }
  ],
  "files": []
}

// src/shared/tsconfig.json - Shared types project
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/shared",
    "rootDir": ".",
    "composite": true,
    "declaration": true
  },
  "include": ["**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}

// src/main/tsconfig.json - Main process project
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "../../dist/main",
    "rootDir": ".",
    "types": ["node", "electron"]
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["**/*"]
}

// src/renderer/tsconfig.json - Renderer process project  
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "outDir": "../../dist/renderer",
    "rootDir": ".",
    "types": ["vite/client"]
  },
  "references": [
    { "path": "../shared" }
  ],
  "include": ["**/*"]
}
```

### Shared Type Definitions
```typescript
// src/shared/types/domain.ts - Core domain types
export type SessionId = string & { readonly __brand: 'SessionId' };
export type TaskId = string & { readonly __brand: 'TaskId' };
export type TimerId = string & { readonly __brand: 'TimerId' };

/**
 * Creates a branded SessionId from a string
 * @param id - The string to convert to SessionId
 * @returns A branded SessionId
 */
export const createSessionId = (id: string): SessionId => id as SessionId;

/**
 * Core timer state representation
 */
export interface TimerState {
  /** Unique timer identifier */
  readonly id: TimerId;
  /** Associated session identifier */
  readonly sessionId: SessionId;
  /** Current timer phase */
  phase: TimerPhase;
  /** Remaining time in milliseconds */
  remainingTime: number;
  /** Total time in milliseconds */
  totalTime: number;
  /** Whether timer is currently running */
  isRunning: boolean;
  /** Whether timer is paused */
  isPaused: boolean;
  /** Timer creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

export type TimerPhase = 'planning' | 'focus' | 'break';

/**
 * Timer configuration options
 */
export interface TimerConfig {
  /** Focus session duration in milliseconds */
  focusDuration: number;
  /** Break duration in milliseconds */
  breakDuration: number;
  /** Long break duration in milliseconds */
  longBreakDuration: number;
  /** Number of sessions before long break */
  sessionsUntilLongBreak: number;
}

// src/shared/types/ipc-contracts.ts - IPC type definitions
export interface IPCContracts {
  // Timer operations
  'timer:start': {
    request: { sessionId: SessionId };
    response: TimerState;
  };
  'timer:pause': {
    request: { timerId: TimerId };
    response: TimerState;
  };
  'timer:resume': {
    request: { timerId: TimerId };
    response: TimerState;
  };
  'timer:reset': {
    request: { timerId: TimerId };
    response: TimerState;
  };
  'timer:configure': {
    request: { timerId: TimerId; config: Partial<TimerConfig> };
    response: TimerState;
  };
  'timer:get-state': {
    request: { timerId: TimerId };
    response: TimerState;
  };

  // Task operations
  'task:create': {
    request: Omit<Task, 'id' | 'createdAt'>;
    response: Task;
  };
  'task:update': {
    request: { id: TaskId; updates: Partial<Omit<Task, 'id' | 'createdAt'>> };
    response: Task;
  };
  'task:delete': {
    request: { id: TaskId };
    response: { success: boolean };
  };
  'task:list': {
    request: { filters?: TaskFilters };
    response: Task[];
  };
}

// IPC Events (one-way communications)
export interface IPCEvents {
  'timer:tick': TimerState;
  'timer:phase-changed': { 
    timerId: TimerId; 
    oldPhase: TimerPhase; 
    newPhase: TimerPhase;
    timestamp: Date;
  };
  'task:completed': { 
    taskId: TaskId; 
    sessionId: SessionId;
    completedAt: Date;
  };
  'session:ended': {
    sessionId: SessionId;
    duration: number;
    successful: boolean;
  };
}

// Error types for IPC operations
export type IPCErrorCode = 
  | 'INVALID_REQUEST'
  | 'TIMER_NOT_FOUND' 
  | 'TASK_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export interface IPCError {
  code: IPCErrorCode;
  message: string;
  context?: Record<string, unknown>;
}
```

### Type-Safe IPC Implementation
```typescript
// src/shared/ipc/type-safe-ipc.ts - Type-safe IPC abstraction
import type { IPCContracts, IPCEvents, IPCError } from '../types/ipc-contracts';

/**
 * Type-safe IPC client for renderer process
 */
export class TypeSafeIPCClient {
  /**
   * Invoke an IPC handler with full type safety
   */
  async invoke<TChannel extends keyof IPCContracts>(
    channel: TChannel,
    request: IPCContracts[TChannel]['request']
  ): Promise<IPCContracts[TChannel]['response']> {
    try {
      const response = await window.electronAPI.invoke(channel, request);
      
      // Runtime type validation could be added here
      return response as IPCContracts[TChannel]['response'];
    } catch (error) {
      throw this.handleIPCError(error);
    }
  }

  /**
   * Subscribe to IPC events with type safety
   */
  on<TEvent extends keyof IPCEvents>(
    event: TEvent,
    callback: (payload: IPCEvents[TEvent]) => void
  ): () => void {
    const unsubscribe = window.electronAPI.on(event, callback);
    return unsubscribe;
  }

  private handleIPCError(error: unknown): Error {
    if (this.isIPCError(error)) {
      return new Error(`IPC Error [${error.code}]: ${error.message}`);
    }
    
    return new Error(`Unknown IPC error: ${String(error)}`);
  }

  private isIPCError(error: unknown): error is IPCError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }
}

// src/main/ipc/type-safe-handlers.ts - Type-safe IPC handlers
import { ipcMain } from 'electron';
import type { IPCContracts } from '@shared/types/ipc-contracts';
import { TimerService } from '../services/timer-service';
import { validateRequest } from '../utils/validation';

/**
 * Register type-safe IPC handlers
 */
export function registerIPCHandlers(timerService: TimerService): void {
  // Timer start handler
  ipcMain.handle(
    'timer:start',
    async (
      event,
      request: IPCContracts['timer:start']['request']
    ): Promise<IPCContracts['timer:start']['response']> => {
      validateRequest('timer:start', request);
      
      try {
        const timerState = await timerService.start(request.sessionId);
        return timerState;
      } catch (error) {
        throw {
          code: 'TIMER_START_FAILED' as const,
          message: `Failed to start timer: ${error.message}`,
          context: { sessionId: request.sessionId }
        };
      }
    }
  );

  // Timer configuration handler with partial updates
  ipcMain.handle(
    'timer:configure',
    async (
      event,
      request: IPCContracts['timer:configure']['request']
    ): Promise<IPCContracts['timer:configure']['response']> => {
      validateRequest('timer:configure', request);
      
      const timerState = await timerService.configure(
        request.timerId, 
        request.config
      );
      
      return timerState;
    }
  );
}
```

### Runtime Type Validation
```typescript
// src/shared/validation/type-guards.ts - Runtime type validation
import type { TimerState, Task, SessionId, TaskId, TimerId } from '../types/domain';

/**
 * Type guard for SessionId
 */
export function isSessionId(value: unknown): value is SessionId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for TimerState
 */
export function isTimerState(value: unknown): value is TimerState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'sessionId' in value &&
    'phase' in value &&
    'remainingTime' in value &&
    'totalTime' in value &&
    'isRunning' in value &&
    typeof (value as any).remainingTime === 'number' &&
    typeof (value as any).totalTime === 'number' &&
    typeof (value as any).isRunning === 'boolean' &&
    ['planning', 'focus', 'break'].includes((value as any).phase)
  );
}

/**
 * Validation schema type
 */
export interface ValidationSchema<T> {
  validate(value: unknown): value is T;
  sanitize?(value: T): T;
}

/**
 * Create validation schema for IPC requests
 */
export function createValidationSchema<T>(
  typeGuard: (value: unknown) => value is T,
  sanitizer?: (value: T) => T
): ValidationSchema<T> {
  return {
    validate: typeGuard,
    sanitize: sanitizer
  };
}

// Validation schemas for IPC contracts
export const IPCValidationSchemas = {
  'timer:start': createValidationSchema(
    (value): value is { sessionId: SessionId } =>
      typeof value === 'object' && 
      value !== null && 
      'sessionId' in value &&
      isSessionId((value as any).sessionId)
  ),
  'timer:configure': createValidationSchema(
    (value): value is { timerId: TimerId; config: Partial<TimerConfig> } =>
      typeof value === 'object' &&
      value !== null &&
      'timerId' in value &&
      'config' in value &&
      typeof (value as any).timerId === 'string'
  )
} as const;
```

### Advanced Type Utilities
```typescript
// src/shared/types/utilities.ts - Advanced TypeScript utilities
/**
 * Make specific properties required in a type
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional in a type
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract the payload type from an event handler
 */
export type EventPayload<T> = T extends (payload: infer P) => any ? P : never;

/**
 * Create a type-safe event emitter interface
 */
export interface TypedEventEmitter<TEvents extends Record<string, any>> {
  on<K extends keyof TEvents>(event: K, listener: (payload: TEvents[K]) => void): void;
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  off<K extends keyof TEvents>(event: K, listener: (payload: TEvents[K]) => void): void;
}

/**
 * Deep readonly type for immutable data structures
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Create a branded type factory
 */
export type Brand<T, TBrand> = T & { readonly __brand: TBrand };

/**
 * Extract brand from branded type
 */
export type UnBrand<T> = T extends Brand<infer U, any> ? U : T;

/**
 * Async result type for operations that can fail
 */
export type AsyncResult<T, E = Error> = Promise<
  | { success: true; data: T }
  | { success: false; error: E }
>;

/**
 * Helper to create async result
 */
export const createAsyncResult = <T, E = Error>(
  promise: Promise<T>
): AsyncResult<T, E> =>
  promise
    .then((data): { success: true; data: T } => ({ success: true, data }))
    .catch((error): { success: false; error: E } => ({ success: false, error }));
```
