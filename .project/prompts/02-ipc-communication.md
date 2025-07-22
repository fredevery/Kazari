# Secure IPC Communication System

Design and implement a secure, structured Inter-Process Communication (IPC) system for Electron applications that ensures safe communication between main and renderer processes while maintaining type safety and following security best practices.

## Requirements

- Implement secure IPC communication between Electron main and renderer processes using contextBridge
- Create a validation system for all IPC channels with whitelisted APIs only
- Establish comprehensive type definitions for IPC messages ensuring type safety across main, preload, and renderer code
- Follow Electron security best practices for data handling and API exposure
- Implement proper error handling and logging for IPC communications
- Create a scalable architecture that can accommodate future IPC channel additions
- Ensure all sensitive operations are properly validated and sanitized

## Rules

- rules/electron-security.md
- rules/typescript-standards.md
- rules/ipc-communication.md
- rules/error-handling.md

## Domain

```typescript
// Core IPC Communication Domain Model

interface IPCChannel {
  name: string;
  direction: 'main-to-renderer' | 'renderer-to-main' | 'bidirectional';
  validator: (data: unknown) => boolean;
  handler: (data: any) => Promise<any> | any;
}

interface IPCMessage<T = any> {
  channel: string;
  payload: T;
  timestamp: number;
  requestId?: string;
}

interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

interface ContextBridgeAPI {
  [key: string]: (...args: any[]) => Promise<any>;
}

// Security validation layer
interface IPCSecurityContext {
  allowedChannels: string[];
  validationRules: Record<string, (data: any) => boolean>;
  sanitizers: Record<string, (data: any) => any>;
}
```

## Extra Considerations

- All IPC communications must be validated and sanitized to prevent XSS and injection attacks
- Implement proper error boundaries to handle IPC failures gracefully
- Consider performance implications of large data transfers through IPC
- Ensure backward compatibility when adding new IPC channels
- Implement proper logging for debugging and monitoring IPC communications
- Handle edge cases like renderer process crashes or main process restarts
- Consider rate limiting for IPC communications to prevent abuse

## Testing Considerations

- Unit tests for all IPC channel handlers with 100% code coverage
- Integration tests for main-to-renderer and renderer-to-main communication flows
- Security tests to verify that only whitelisted APIs are accessible
- Performance tests for large data transfers through IPC
- Error handling tests for various failure scenarios
- Type safety tests to ensure TypeScript definitions are correct
- End-to-end tests for complete user workflows involving IPC

## Implementation Notes

- Use Electron's contextBridge API exclusively for secure IPC communication
- Implement a centralized IPC registry for managing all channels
- Use TypeScript strict mode for enhanced type safety
- Follow the principle of least privilege when exposing APIs to renderer
- Implement proper async/await patterns for IPC operations
- Use structured logging with appropriate log levels
- Create reusable validation utilities for common data types
- Implement proper error serialization for cross-process communication

## Specification by Example

### IPC Channel Registration
```typescript
// Main process
const ipcManager = new IPCManager();

ipcManager.registerChannel('user:create', {
  validator: (data) => isValidUser(data),
  handler: async (userData) => await createUser(userData)
});

// Preload script
contextBridge.exposeInMainWorld('electronAPI', {
  createUser: (userData) => ipcRenderer.invoke('user:create', userData)
});

// Renderer process
const user = await window.electronAPI.createUser({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Type-Safe IPC Messages
```typescript
// Type definitions
interface CreateUserRequest {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Usage
const response: IPCResponse<CreateUserResponse> = await window.electronAPI.createUser({
  name: 'Jane Smith',
  email: 'jane@example.com'
});
```

### Security Validation
```typescript
// Validation rules
const userValidationRules = {
  name: (value: any) => typeof value === 'string' && value.length > 0,
  email: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  role: (value: any) => !value || ['admin', 'user'].includes(value)
};

// Sanitization
const sanitizeUserData = (data: any) => ({
  name: String(data.name).trim(),
  email: String(data.email).toLowerCase().trim(),
  role: data.role || 'user'
});
```

## Verification

- [ ] All IPC channels are registered through the centralized IPCManager
- [ ] contextBridge is used exclusively for renderer-to-main communication
- [ ] All IPC messages are validated before processing
- [ ] Type definitions are provided for all IPC message types
- [ ] Error handling is implemented for all IPC operations
- [ ] Security tests pass with no unauthorized API access
- [ ] Performance tests show acceptable latency for IPC communications
- [ ] All IPC channels are properly documented with usage examples
- [ ] Logging is implemented for all IPC operations
- [ ] Integration tests cover all critical IPC workflows
- [ ] Code coverage is at least 95% for IPC-related code
- [ ] No direct access to Node.js APIs from renderer processes
