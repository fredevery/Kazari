# IPC Communication

_Rules for implementing Inter-Process Communication in Electron applications to ensure type safety, reliability, and maintainable communication patterns between main and renderer processes._

## Context

**Applies to:** Electron applications, multi-process desktop apps, main-renderer communication  
**Level:** Tactical - implementation patterns and communication protocols  
**Audience:** Electron developers, Frontend developers, Desktop application developers

## Core Principles

1. **Type Safety:** All IPC messages must be strongly typed with clear contracts
2. **Error Handling:** Every IPC operation must handle failures gracefully with proper error propagation
3. **Validation:** All data crossing process boundaries must be validated before use
4. **Performance:** Minimize IPC overhead through efficient message patterns and batching

## Rules

### Must Have (Critical)

- **RULE-001:** Define TypeScript interfaces for all IPC message types and responses
- **RULE-002:** Use `handle/invoke` pattern for request-response operations, never callbacks
- **RULE-003:** Use `send/on` pattern for one-way notifications and event broadcasting
- **RULE-004:** Validate all incoming data with proper error responses for invalid input
- **RULE-005:** Implement timeout handling for all `invoke` operations
- **RULE-006:** Never pass complex objects or functions through IPC, use serializable data only
- **RULE-007:** Implement proper error serialization and deserialization across processes

### Should Have (Important)

- **RULE-101:** Group related IPC operations under consistent channel naming conventions
- **RULE-102:** Implement retry mechanisms for critical operations with exponential backoff
- **RULE-103:** Use structured logging for all IPC operations with correlation IDs
- **RULE-104:** Implement proper cleanup for event listeners to prevent memory leaks

### Could Have (Preferred)

- **RULE-201:** Create type-safe IPC client wrappers to abstract raw IPC calls
- **RULE-202:** Implement request/response correlation for debugging and monitoring
- **RULE-203:** Use compression for large data transfers between processes

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Define clear IPC contracts
interface TimerIPCContract {
  'timer:start': { request: void; response: TimerState };
  'timer:pause': { request: void; response: TimerState };
  'timer:configure': { request: TimerConfig; response: TimerState };
  'timer:get-state': { request: void; response: TimerState };
}

// Main process handlers with validation
ipcMain.handle('timer:configure', async (event, config: TimerConfig): Promise<TimerState> => {
  try {
    // Validate input
    if (!config || typeof config.focusDuration !== 'number') {
      throw new Error('Invalid timer configuration');
    }
    
    const result = await timerService.configure(config);
    return result;
  } catch (error) {
    logger.error('Timer configuration failed', { error, config });
    throw new Error(`Configuration failed: ${error.message}`);
  }
});

// Renderer process with timeout and error handling
class TimerIPCClient {
  private readonly timeout = 5000; // 5 second timeout
  
  async configure(config: TimerConfig): Promise<TimerState> {
    try {
      const result = await Promise.race([
        ipcRenderer.invoke('timer:configure', config),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('IPC timeout')), this.timeout)
        )
      ]);
      return result as TimerState;
    } catch (error) {
      logger.error('Failed to configure timer', error);
      throw new Error('Timer configuration failed');
    }
  }
}

// Event broadcasting with proper typing
// Main process
function broadcastTimerState(state: TimerState): void {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('timer:state-changed', state);
  });
}

// Renderer process
ipcRenderer.on('timer:state-changed', (event, state: TimerState) => {
  updateUI(state);
});
```

### ❌ Don't Do This

```typescript
// Don't use callbacks for async operations
// WRONG - using callbacks
ipcMain.on('timer:start', (event) => {
  timerService.start().then(result => {
    event.reply('timer:start-result', result); // Error-prone callback pattern
  });
});

// Don't skip validation
// WRONG - no validation
ipcMain.handle('timer:configure', async (event, config) => {
  return timerService.configure(config); // What if config is malformed?
});

// Don't pass complex objects or functions
// WRONG - passing functions
ipcRenderer.invoke('complex-operation', {
  data: someData,
  callback: () => { /* this won't work */ }
});

// Don't ignore errors
// WRONG - no error handling
const result = await ipcRenderer.invoke('timer:start'); // What if it fails?
```

## Decision Framework

**When choosing IPC patterns:**

1. **Request-Response:** Use `handle/invoke` for operations that need a response
2. **Event Broadcasting:** Use `send/on` for state updates and notifications
3. **Batch Operations:** Group related operations to reduce IPC overhead
4. **Error Handling:** Always implement proper error boundaries and user feedback

**When designing IPC contracts:**

- Keep messages simple and serializable
- Use discriminated unions for different message types
- Version your contracts for backward compatibility
- Document expected response times and error conditions

**When handling performance:**

- Batch multiple updates into single messages
- Use debouncing for high-frequency updates
- Cache responses when appropriate
- Monitor IPC message frequency and size

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Performance-critical operations requiring direct shared memory (with security review)
- Legacy integration requiring specific IPC patterns (with migration plan)
- Debugging and development tools requiring raw IPC access (development only)

**Process for exceptions:**

1. Document the exception, performance impact, and security implications
2. Get approval from architecture team
3. Implement monitoring and alerting for exception usage

## Quality Gates

- **Automated checks:** TypeScript compilation ensures type safety, ESLint rules for IPC patterns
- **Code review focus:** Verify proper error handling, validation, and timeout handling
- **Testing requirements:** Unit tests for IPC handlers, integration tests for end-to-end communication
- **Performance monitoring:** Track IPC message frequency, size, and response times

## Related Rules

- `rules/electron-main-process.md` - Main process architecture and responsibilities
- `rules/state-management.md` - Guidelines for managing application state across processes
- `rules/error-handling.md` - Comprehensive error handling strategies

## References

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc) - Official IPC patterns
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security) - Security considerations for IPC
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type safety patterns

---

## TL;DR

**Key Principles:**

- All IPC must be strongly typed with clear contracts
- Use handle/invoke for request-response, send/on for events
- Always validate data crossing process boundaries
- Implement proper error handling and timeouts

**Critical Rules:**

- Must define TypeScript interfaces for all IPC messages (RULE-001)
- Must use handle/invoke for request-response operations (RULE-002)
- Must validate all incoming data with error responses (RULE-004)
- Must implement timeout handling for invoke operations (RULE-005)

**Quick Decision Guide:**
When in doubt: Ask "Does this need a response?" If yes, use handle/invoke. If no, use send/on.

**Before You Code Checklist:**
- [ ] IPC contracts are defined with TypeScript interfaces
- [ ] Proper error handling and validation implemented
- [ ] Timeout handling for all invoke operations
- [ ] Event listeners properly cleaned up to prevent memory leaks
