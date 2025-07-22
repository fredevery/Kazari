# Electron Main Process Architecture

_Rules for structuring and implementing Electron main process code to ensure proper separation of concerns, maintainability, and reliable IPC communication with renderer processes._

## Context

**Applies to:** Electron desktop applications, cross-platform desktop apps, main process modules  
**Level:** Strategic & Tactical - architectural decisions and implementation patterns  
**Audience:** Electron developers, Desktop application architects, Full-stack developers

## Core Principles

1. **Single Responsibility:** Main process handles system integration, window management, and business logic - not UI rendering
2. **IPC Abstraction:** Communication with renderer processes must be abstracted through well-defined interfaces
3. **State Centralization:** Application state should be managed in main process with controlled access from renderers
4. **System Integration:** Main process is the only entry point for native system APIs and file system operations

## Rules

### Must Have (Critical)

- **RULE-001:** Main process must never directly manipulate DOM or handle UI rendering logic
- **RULE-002:** All IPC communication must be handled through typed interfaces with proper error handling
- **RULE-003:** Business logic and application state must reside in main process, not renderer processes
- **RULE-004:** Main process must handle all file system operations and system API calls
- **RULE-005:** Window lifecycle management must be centralized in main process
- **RULE-006:** Application configuration and settings must be managed by main process
- **RULE-007:** Main process must validate all data received from renderer processes

### Should Have (Important)

- **RULE-101:** Use dependency injection to provide adapters for system APIs to enable testing
- **RULE-102:** Implement proper error boundaries and recovery mechanisms for IPC failures
- **RULE-103:** Structure main process code using ports and adapters pattern for external dependencies
- **RULE-104:** Use event-driven architecture for decoupled communication between main process modules

### Could Have (Preferred)

- **RULE-201:** Use TypeScript for strong typing in IPC communication contracts
- **RULE-202:** Implement automatic retry mechanisms for critical IPC operations
- **RULE-203:** Use structured logging with correlation IDs for tracing across processes

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Main process service with proper abstraction
interface TimerService {
  start(): Promise<TimerState>;
  pause(): Promise<TimerState>;
  getState(): TimerState;
}

class MainTimerService implements TimerService {
  private state: TimerState = { /* initial state */ };
  
  async start(): Promise<TimerState> {
    this.state = { ...this.state, status: 'running' };
    this.notifyRenderers();
    return this.state;
  }
  
  private notifyRenderers(): void {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('timer:state-changed', this.state);
    });
  }
}

// IPC handlers with proper error handling
ipcMain.handle('timer:start', async (): Promise<TimerState> => {
  try {
    return await timerService.start();
  } catch (error) {
    logger.error('Failed to start timer', error);
    throw new Error('Timer start failed');
  }
});
```

### ❌ Don't Do This

```typescript
// Don't put business logic in renderer process
// renderer.js - WRONG
const startTimer = () => {
  const newState = { status: 'running', startTime: Date.now() };
  ipcRenderer.send('timer:update', newState);
};

// Don't expose internal state directly
// main.js - WRONG
let timerState = { /* state */ };
ipcMain.handle('timer:get-state', () => timerState); // No validation

// Don't perform file operations in renderer
// renderer.js - WRONG
const fs = require('fs');
fs.writeFileSync('config.json', JSON.stringify(config)); // Security risk
```

## Decision Framework

**When designing main process architecture:**

1. Identify what belongs in main vs renderer (system APIs, business logic → main; UI logic → renderer)
2. Define clear IPC contracts with error handling and validation
3. Abstract external dependencies through ports and adapters
4. Design for testability with dependency injection

**When handling IPC communication:**

- Use `handle/invoke` for request-response patterns
- Use `send/on` for event broadcasting
- Always validate data from renderer processes
- Implement proper error handling and logging

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Performance-critical operations requiring direct renderer access (with security review)
- Legacy integration requiring specific architectural patterns (with migration plan)
- Rapid prototyping or proof-of-concept development (with refactoring plan)

**Process for exceptions:**

1. Document the exception, rationale, and security implications
2. Get approval from architecture and security teams
3. Implement time-bound review for exception removal

## Quality Gates

- **Automated checks:** Dependency analysis to ensure main process doesn't import UI libraries
- **Code review focus:** Verify proper separation of concerns, IPC contracts are well-defined
- **Testing requirements:** Unit tests for main process services with mocked dependencies
- **Security review:** Validate all data from renderer processes

## Related Rules

- `rules/hexagonal-architecture.md` - Architectural patterns for decoupling business logic from infrastructure
- `rules/ipc-communication.md` - Detailed rules for Inter-Process Communication patterns
- `rules/state-management.md` - Guidelines for managing application state across processes

## References

- [Electron Main Process Documentation](https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process) - Official documentation
- [Electron IPC Best Practices](https://www.electronjs.org/docs/latest/tutorial/ipc) - Inter-Process Communication patterns
- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security) - Security best practices

---

## TL;DR

**Key Principles:**

- Main process owns business logic and system integration, renderers handle only UI
- All IPC communication must be typed, validated, and error-handled
- Use ports and adapters pattern to abstract external dependencies

**Critical Rules:**

- Must never manipulate DOM or handle UI rendering in main process (RULE-001)
- Must handle all IPC through typed interfaces with error handling (RULE-002)
- Must centralize business logic and state in main process (RULE-003)
- Must validate all data from renderer processes (RULE-007)

**Quick Decision Guide:**
When in doubt: Ask "Does this involve system APIs, business logic, or application state?" If yes, it belongs in main process. If it's UI rendering or user interaction, it belongs in renderer.

**Before You Code Checklist:**
- [ ] Business logic is in main process, not renderer
- [ ] IPC contracts are well-defined with TypeScript interfaces
- [ ] Error handling is implemented for all IPC operations
- [ ] External dependencies are abstracted through ports
