# Complete User Journey Workflow System

The Complete User Journey Workflow System orchestrates the entire user experience from daily planning through focus sessions to breaks and back. This system ensures smooth state transitions, clear user prompts, and synchronized experiences across all application windows and phases. It addresses the critical need for a cohesive workflow that guides users through productivity cycles while maintaining state consistency, providing clear feedback, and handling edge cases gracefully. This comprehensive system transforms discrete productivity features into a unified, intuitive user experience.

## Requirements

- System must orchestrate complete user journey from app launch through planning, focus, break, and repeat cycles
- All workflow transitions must be automatic with clear visual and audio cues for phase changes
- User must receive contextual prompts and guidance at each workflow stage with clear next steps
- State synchronization must be maintained across all windows (dashboard, floating timer, break screen, planning interface)
- Workflow must handle user-initiated actions (skip phases, end early, pause) from any window
- System must provide recovery mechanisms for interrupted workflows (app crash, system sleep, network issues)
- Progress tracking must persist across sessions and provide continuity after disruptions
- Error states must display user-friendly messages with clear recovery paths
- Workflow timing must be configurable with sensible defaults and user customization options
- System must track and report workflow effectiveness metrics and user behavior patterns
- All workflow states must be accessible and keyboard navigable for accessibility compliance
- System must handle multi-monitor setups and window management across different screen configurations

## Rules

- rules/state-management.md
- rules/ipc-communication.md
- rules/electron-main-process.md
- rules/error-handling.md
- rules/timer-precision.md
- rules/notification-system.md
- rules/domain-driven-design-rules.md
- rules/hexagonal-architecture.md
- rules/electron-security.md
- rules/typescript-standards.md

## Domain

```typescript
// Core workflow domain model
interface WorkflowState {
  currentPhase: WorkflowPhase;
  previousPhase?: WorkflowPhase;
  sessionNumber: number;
  dayStartTime: Date;
  totalFocusTime: number;
  totalBreakTime: number;
  completedTasks: string[];
  isFirstLaunch: boolean;
  lastStateSync: Date;
}

enum WorkflowPhase {
  INITIAL_SETUP = 'initial-setup',
  DAILY_PLANNING = 'daily-planning',
  SESSION_PLANNING = 'session-planning',
  FOCUS_SESSION = 'focus-session',
  BREAK_TIME = 'break-time',
  END_OF_DAY = 'end-of-day',
  RECOVERY = 'recovery'
}

interface WorkflowTransition {
  fromPhase: WorkflowPhase;
  toPhase: WorkflowPhase;
  trigger: TransitionTrigger;
  conditions: TransitionCondition[];
  actions: WorkflowAction[];
  timeoutMs?: number;
}

enum TransitionTrigger {
  TIMER_COMPLETE = 'timer-complete',
  USER_ACTION = 'user-action',
  SYSTEM_EVENT = 'system-event',
  ERROR_RECOVERY = 'error-recovery',
  AUTOMATIC = 'automatic'
}

interface WorkflowAction {
  type: 'SHOW_WINDOW' | 'HIDE_WINDOW' | 'UPDATE_UI' | 'SEND_NOTIFICATION' | 'SAVE_STATE' | 'PLAY_SOUND';
  target?: string;
  payload?: any;
  delay?: number;
}

interface UserPrompt {
  id: string;
  phase: WorkflowPhase;
  title: string;
  message: string;
  actions: PromptAction[];
  timeout?: number;
  priority: PromptPriority;
}

enum PromptPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface PromptAction {
  label: string;
  action: string;
  isPrimary: boolean;
  shortcut?: string;
}

class WorkflowOrchestrator {
  private state: WorkflowState;
  private transitions: Map<string, WorkflowTransition[]>;
  private activePrompts: Map<string, UserPrompt>;
  
  transitionTo(phase: WorkflowPhase, trigger?: TransitionTrigger): Promise<void>;
  handleUserAction(action: string, context?: any): Promise<void>;
  showPrompt(prompt: UserPrompt): Promise<string>;
  syncStateAcrossWindows(): Promise<void>;
  recoverFromError(error: WorkflowError): Promise<void>;
  
  // State management
  saveState(): Promise<void>;
  loadState(): Promise<WorkflowState>;
  resetWorkflow(): Promise<void>;
}

interface WorkflowMetrics {
  dailySessionsCompleted: number;
  averageFocusSessionLength: number;
  breakOverrunFrequency: number;
  taskCompletionRate: number;
  phaseTransitionErrors: number;
  userPromptResponseTimes: number[];
}

interface WorkflowError {
  phase: WorkflowPhase;
  error: Error;
  context: any;
  timestamp: Date;
  recoverable: boolean;
}
```

## Extra Considerations

- Workflow must handle network connectivity issues and offline mode gracefully
- State synchronization must work across multiple application instances (if accidentally launched multiple times)
- System must handle rapid user interactions without creating race conditions or state conflicts
- Workflow timing must account for system sleep/wake cycles and timezone changes
- User prompts must have appropriate timeouts to prevent workflow blocking
- Error recovery must preserve user progress and allow resuming from the last known good state
- Accessibility requirements must be met including screen reader support and high contrast modes
- Performance must remain optimal even with complex state synchronization across multiple windows
- Workflow must support different user preferences (notification styles, timing preferences, UI themes)
- System must handle edge cases like rapid phase skipping, app termination during transitions, and concurrent user actions
- Memory usage must be optimized for long-running workflow sessions
- Integration with system notifications and focus modes must be handled appropriately

## Testing Considerations

Unit tests must cover all workflow state transitions, error handling, and recovery mechanisms with comprehensive edge case coverage achieving 95% code coverage. Integration tests should validate IPC communication between all workflow components, state synchronization across windows, and proper error propagation. End-to-end tests must simulate complete user journeys from app launch through multiple productivity cycles, including interruption and recovery scenarios. Performance tests should verify smooth transitions under load, memory usage over extended sessions, and response times for user interactions. Accessibility tests must validate keyboard navigation, screen reader compatibility, and high contrast mode functionality. Error injection tests should verify graceful degradation and recovery from various failure modes including network issues, timer failures, and unexpected window closures.

## Implementation Notes

Implement the workflow orchestrator in the Electron main process as the single source of truth for workflow state. Use a finite state machine pattern with clear state transitions and guards to prevent invalid transitions. Implement state persistence using encrypted local storage with automatic backup and recovery capabilities. Use event-driven architecture for loose coupling between workflow components and windows. Implement proper debouncing for rapid user interactions and use queuing for sequential actions. Follow the hexagonal architecture pattern with clear domain boundaries and adapter interfaces. Use TypeScript discriminated unions for type-safe state management and workflow actions. Implement comprehensive logging for debugging workflow issues and user behavior analysis. Use React context providers in renderer processes for workflow state subscription and updates. Implement proper cleanup and resource management for long-running workflow sessions.

## Specification by Example

### Initial App Launch Flow
```typescript
// User opens app for the first time
const initialFlow = {
  phase: WorkflowPhase.INITIAL_SETUP,
  actions: [
    { type: 'SHOW_WINDOW', target: 'onboarding' },
    { type: 'SEND_NOTIFICATION', payload: 'Welcome to Kazari!' }
  ],
  nextPhase: WorkflowPhase.DAILY_PLANNING
};

// After onboarding completion
const dailyPlanningTransition = {
  fromPhase: WorkflowPhase.INITIAL_SETUP,
  toPhase: WorkflowPhase.DAILY_PLANNING,
  trigger: TransitionTrigger.USER_ACTION,
  actions: [
    { type: 'HIDE_WINDOW', target: 'onboarding' },
    { type: 'SHOW_WINDOW', target: 'planning' },
    { type: 'UPDATE_UI', payload: { mode: 'daily-planning' } }
  ]
};
```

### Complete Focus Session Cycle
```typescript
// Planning -> Focus transition
const startFocusSession = {
  fromPhase: WorkflowPhase.SESSION_PLANNING,
  toPhase: WorkflowPhase.FOCUS_SESSION,
  trigger: TransitionTrigger.USER_ACTION,
  conditions: [
    { type: 'TASK_SELECTED', required: true },
    { type: 'TIMER_CONFIGURED', required: true }
  ],
  actions: [
    { type: 'HIDE_WINDOW', target: 'planning' },
    { type: 'SHOW_WINDOW', target: 'floating-timer' },
    { type: 'SEND_NOTIFICATION', payload: 'Focus session started!' },
    { type: 'PLAY_SOUND', payload: 'start-session.wav' }
  ]
};

// Focus -> Break automatic transition
const focusToBreak = {
  fromPhase: WorkflowPhase.FOCUS_SESSION,
  toPhase: WorkflowPhase.BREAK_TIME,
  trigger: TransitionTrigger.TIMER_COMPLETE,
  actions: [
    { type: 'HIDE_WINDOW', target: 'floating-timer' },
    { type: 'SHOW_WINDOW', target: 'break-screen' },
    { type: 'SEND_NOTIFICATION', payload: 'Time for a break!' },
    { type: 'PLAY_SOUND', payload: 'break-time.wav' }
  ]
};
```

### Error Recovery Flow
```typescript
// App crash during focus session
const crashRecovery = {
  phase: WorkflowPhase.RECOVERY,
  prompt: {
    id: 'crash-recovery',
    title: 'Session Recovery',
    message: 'Your focus session was interrupted. Would you like to continue where you left off?',
    actions: [
      { label: 'Continue Session', action: 'resume-focus', isPrimary: true },
      { label: 'Start Break', action: 'start-break', isPrimary: false },
      { label: 'Return to Planning', action: 'return-planning', isPrimary: false }
    ]
  }
};

// Network disconnection handling
const offlineMode = {
  trigger: TransitionTrigger.SYSTEM_EVENT,
  actions: [
    { type: 'UPDATE_UI', payload: { mode: 'offline', showNotification: true } },
    { type: 'SAVE_STATE', payload: { local: true, cloud: false } }
  ]
};
```

### State Synchronization Example
```typescript
// Multi-window state sync
const syncState = async (newState: WorkflowState) => {
  const windows = ['dashboard', 'floating-timer', 'planning', 'break-screen'];
  
  await Promise.all(windows.map(async (windowId) => {
    if (windowExists(windowId)) {
      await ipcMain.send(windowId, 'workflow:state-update', {
        state: newState,
        timestamp: Date.now(),
        sync: true
      });
    }
  }));
};

// User prompt with timeout
const showTimedPrompt = {
  id: 'session-complete',
  phase: WorkflowPhase.FOCUS_SESSION,
  title: 'Session Complete',
  message: 'Great work! Ready for your break?',
  actions: [
    { label: 'Start Break', action: 'start-break', isPrimary: true, shortcut: 'Enter' },
    { label: 'Continue Working', action: 'extend-session', isPrimary: false, shortcut: 'Space' }
  ],
  timeout: 30000, // Auto-start break after 30 seconds
  priority: PromptPriority.HIGH
};
```

### Workflow Metrics Tracking
```typescript
// Daily workflow summary
const dailyMetrics = {
  date: '2025-01-15',
  sessionsPlanned: 8,
  sessionsCompleted: 6,
  totalFocusTime: 150, // minutes
  totalBreakTime: 30, // minutes
  tasksCompleted: 4,
  workflowInterruptions: 2,
  averageSessionLength: 25, // minutes
  breakOverruns: 1,
  userSatisfactionRating: 4.5
};

// Workflow efficiency analysis
const efficiencyMetrics = {
  planningToFocusTime: 45, // seconds average
  breakEndToSessionStartTime: 120, // seconds average
  errorRecoverySuccessRate: 0.95,
  userPromptResponseRate: 0.87,
  stateSync Latency: 150 // milliseconds average
};
```

## Verification

- [ ] Complete user journey from app launch through multiple focus/break cycles executes smoothly
- [ ] All phase transitions trigger appropriate UI updates across all open windows
- [ ] State synchronization maintains consistency across dashboard, floating timer, break screen, and planning interface
- [ ] User prompts appear at correct times with appropriate messaging and clear action options
- [ ] Error recovery mechanisms restore user to appropriate workflow state after interruptions
- [ ] Workflow timing respects user preferences and handles system sleep/wake cycles correctly
- [ ] Keyboard navigation and accessibility features work throughout entire workflow
- [ ] Metrics tracking accurately captures user behavior and workflow effectiveness
- [ ] Multi-monitor support works correctly with proper window positioning and focus management
- [ ] Performance remains optimal during long workflow sessions with multiple window transitions
- [ ] All workflow states persist correctly across application restarts
- [ ] Integration with system notifications and focus modes functions as expected
