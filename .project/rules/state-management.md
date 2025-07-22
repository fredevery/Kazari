# State Management

_Rules for managing application state in Electron applications to ensure consistency, predictability, and proper synchronization across main and renderer processes._

## Context

**Applies to:** Electron applications, multi-process desktop apps, stateful applications  
**Level:** Strategic & Tactical - architecture decisions and implementation patterns  
**Audience:** Electron developers, Frontend developers, Application architects

## Core Principles

1. **Single Source of Truth:** All application state must be managed in the main process
2. **Unidirectional Data Flow:** State updates flow from main process to renderer processes
3. **Immutability:** State objects must be immutable to prevent unintended mutations
4. **Predictability:** State changes must be predictable and traceable through actions

## Rules

### Must Have (Critical)

- **RULE-001:** All application state must reside in the main process, never in renderer processes
- **RULE-002:** State updates must only occur through well-defined actions and reducers
- **RULE-003:** State must be serializable - no functions, classes, or complex objects
- **RULE-004:** State changes must be broadcasted to all relevant renderer processes immediately
- **RULE-005:** Implement state persistence to survive application restarts
- **RULE-006:** Use immutable update patterns to prevent state corruption
- **RULE-007:** Validate all state mutations before applying them

### Should Have (Important)

- **RULE-101:** Use action creators to encapsulate state change logic
- **RULE-102:** Implement optimistic updates for better user experience
- **RULE-103:** Add state change logging for debugging and auditing

### Could Have (Preferred)

- **RULE-201:** Use state selectors to derive computed values
- **RULE-202:** Implement state compression for large datasets

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Define immutable state structure
interface AppState {
  readonly timer: TimerState;
  readonly settings: SettingsState;
  readonly sessions: readonly SessionState[];
}

// Action-based state updates
interface StateAction {
  type: 'TIMER_START' | 'TIMER_PAUSE' | 'TIMER_RESET' | 'SETTINGS_UPDATE';
  payload?: any;
}

// Main process state manager
class StateManager {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();
  
  constructor(initialState: AppState) {
    this.state = initialState;
  }
  
  dispatch(action: StateAction): void {
    const newState = this.reducer(this.state, action);
    
    if (!this.validateState(newState)) {
      throw new Error(`Invalid state transition: ${action.type}`);
    }
    
    this.state = newState;
    this.notifyListeners();
    this.persistState();
  }
  
  private reducer(state: AppState, action: StateAction): AppState {
    switch (action.type) {
      case 'TIMER_START':
        return {
          ...state,
          timer: { ...state.timer, status: 'running', startTime: Date.now() }
        };
      
      case 'TIMER_PAUSE':
        return {
          ...state,
          timer: { ...state.timer, status: 'paused', pausedTime: Date.now() }
        };
      
      default:
        return state;
    }
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  private async persistState(): Promise<void> {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(this.state));
  }
  
  getState(): AppState {
    return this.state;
  }
  
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// IPC integration for state synchronization
class StateIPCManager {
  constructor(private stateManager: StateManager) {
    this.setupIPCHandlers();
    this.setupStateSubscription();
  }
  
  private setupIPCHandlers(): void {
    ipcMain.handle('state:get', () => this.stateManager.getState());
    
    ipcMain.handle('state:dispatch', (event, action: StateAction) => {
      this.stateManager.dispatch(action);
      return this.stateManager.getState();
    });
  }
  
  private setupStateSubscription(): void {
    this.stateManager.subscribe((state) => {
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('state:changed', state);
      });
    });
  }
}

// Renderer process state client
class StateClient {
  private currentState: AppState | null = null;
  private listeners: Set<(state: AppState) => void> = new Set();
  
  constructor() {
    this.setupIPCListener();
    this.initializeState();
  }
  
  private setupIPCListener(): void {
    ipcRenderer.on('state:changed', (event, state: AppState) => {
      this.currentState = state;
      this.notifyListeners();
    });
  }
  
  private async initializeState(): Promise<void> {
    this.currentState = await ipcRenderer.invoke('state:get');
    this.notifyListeners();
  }
  
  async dispatch(action: StateAction): Promise<void> {
    await ipcRenderer.invoke('state:dispatch', action);
  }
  
  getState(): AppState | null {
    return this.currentState;
  }
  
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    if (this.currentState) {
      listener(this.currentState);
    }
    return () => this.listeners.delete(listener);
  }
}
```

### ❌ Don't Do This

```typescript
// Don't manage state in renderer processes
let timerState = { status: 'idle' }; // This will get out of sync

// Don't mutate state directly
state.timer.status = 'running'; // Breaks immutability

// Don't use non-serializable state
const state = {
  timer: new TimerClass(), // Classes don't serialize
  callback: () => {} // Functions don't serialize
};
```

## Decision Framework

**When designing state structure:**

1. **Keep it flat:** Avoid deeply nested state structures
2. **Normalize data:** Use normalized state for collections and relationships
3. **Separate concerns:** Group related state by domain (timer, settings, etc.)
4. **Plan for growth:** Design state structure to accommodate future features

**When handling state updates:**

- Use action creators for complex state changes
- Implement optimistic updates for better UX
- Batch related state changes to reduce updates
- Validate state changes before applying

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Performance-critical UI state (animations, scrolling) can be managed locally in renderer
- Temporary form state before submission can be managed in renderer

**Process for exceptions:**

1. Document the exception and justify why main process state is insufficient
2. Ensure exceptional state cannot conflict with main process state

## Quality Gates

- **Automated checks:** TypeScript ensures state type safety, tests verify state immutability
- **Code review focus:** Verify state updates use proper actions, no direct mutations
- **Testing requirements:** Unit tests for reducers, integration tests for state synchronization

## Related Rules

- `rules/electron-main-process.md` - Main process architecture and state ownership
- `rules/ipc-communication.md` - IPC patterns for state synchronization
- `rules/hexagonal-architecture.md` - Separating state from infrastructure concerns

## References

- [Redux Documentation](https://redux.js.org/) - State management patterns and principles
- [Immer Documentation](https://immerjs.github.io/immer/) - Immutable state updates

---

## TL;DR

**Key Principles:**

- All application state lives in main process as single source of truth
- State updates only through actions, never direct mutations
- State must be serializable and immutable
- State changes broadcast immediately to all renderer processes

**Critical Rules:**

- Must manage all application state in main process (RULE-001)
- Must use action-based state updates only (RULE-002)
- Must keep state serializable (RULE-003)
- Must broadcast state changes to all renderers (RULE-004)

**Quick Decision Guide:**
When in doubt: Ask "Is this application state or just UI state?" If it's application state, manage it in main process.

**Before You Code Checklist:**
- [ ] State structure is defined with TypeScript interfaces
- [ ] State updates use immutable patterns
- [ ] Actions and reducers are properly implemented
- [ ] State synchronization to renderers is working
- [ ] State persistence is implemented for important data
