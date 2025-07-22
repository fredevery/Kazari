# React Renderer Process Architecture

The React Renderer Process forms the user interface layer of the Kazari desktop application, providing responsive and intuitive interfaces for all productivity features across multiple windows. It manages component hierarchy, local state, and secure communication with the Electron main process through IPC APIs. This addresses the need for a maintainable, type-safe, and performant frontend architecture that supports hot reloading during development, efficient state management, and seamless integration with Electron's multi-window environment.

## Requirements

- Component architecture must support multiple window types (Dashboard, Break Screen, Floating Countdown, Planning) with shared and specialized components
- State management must handle local UI state while synchronizing with main process application state via IPC
- IPC integration layer must provide type-safe communication with main process using strongly-typed contracts
- Routing system must support navigation within windows and coordinate with main process window management
- UI component library must provide consistent design system across all application windows
- Error boundary system must gracefully handle component failures and provide recovery mechanisms
- Performance optimization must include memoization, lazy loading, and efficient re-rendering strategies
- Hot reload support must maintain development productivity while preserving component state
- Accessibility features must support keyboard navigation, screen readers, and WCAG compliance
- Testing infrastructure must enable unit testing, integration testing, and visual regression testing

## Rules

- rules/typescript-standards.md
- rules/ipc-communication.md
- rules/error-handling.md
- rules/state-management.md
- rules/electron-security.md

## Domain

```typescript
// Renderer process core domain model
interface RendererApplication {
  windowType: WindowType;
  router: ApplicationRouter;
  stateManager: RendererStateManager;
  ipcClient: IPCClient;
  componentRegistry: ComponentRegistry;
}

interface RendererStateManager {
  localState: LocalUIState;
  syncedState: SyncedApplicationState;
  updateLocalState(updates: Partial<LocalUIState>): void;
  syncWithMainProcess(): Promise<void>;
  subscribeToMainProcessUpdates(): void;
}

interface IPCClient {
  timer: TimerIPCClient;
  tasks: TaskIPCClient;
  windows: WindowIPCClient;
  settings: SettingsIPCClient;
}

interface TimerIPCClient {
  start(): Promise<TimerState>;
  pause(): Promise<TimerState>;
  reset(): Promise<TimerState>;
  skip(): Promise<TimerState>;
  getState(): Promise<TimerState>;
  subscribeToUpdates(callback: (state: TimerState) => void): void;
}

interface ComponentRegistry {
  dashboard: DashboardComponents;
  breakScreen: BreakScreenComponents;
  floatingCountdown: FloatingCountdownComponents;
  planning: PlanningComponents;
  shared: SharedComponents;
}

interface DashboardComponents {
  TimerStatus: React.FC<TimerStatusProps>;
  SessionMetrics: React.FC<SessionMetricsProps>;
  TaskProgress: React.FC<TaskProgressProps>;
  ProductivityInsights: React.FC<ProductivityInsightsProps>;
  QuickActions: React.FC<QuickActionsProps>;
}

interface LocalUIState {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationState[];
  modals: ModalState[];
  currentRoute: string;
  loading: LoadingState;
  errors: ErrorState[];
}

interface SyncedApplicationState {
  timer: TimerState;
  tasks: TaskCollection;
  settings: UserSettings;
  session: SessionMetrics;
}
```

## Extra Considerations

- Window-specific styling and layout requirements must account for different window sizes and purposes
- Context switching between windows should maintain user's mental model and workflow continuity
- Real-time updates from main process require efficient state synchronization without causing render thrashing
- Memory management in renderer processes must prevent leaks during long-running sessions
- Offline state handling needed when main process becomes unavailable or crashes
- Theme and appearance consistency across windows with system theme integration
- Component testing requires mocking Electron APIs and IPC communication
- Performance profiling needed for timer updates and high-frequency state changes
- Internationalization support for future localization requirements
- Animation and transition management for smooth user experience without impacting performance

## Testing Considerations

Unit tests must cover individual components with mocked IPC dependencies and state management hooks. Integration tests should verify IPC communication flows and state synchronization between renderer and main process. Component testing requires React Testing Library for user interaction simulation. Visual regression testing must ensure UI consistency across window types and themes. Accessibility testing should validate keyboard navigation, focus management, and screen reader compatibility. Performance testing must validate render times, memory usage, and update frequencies for real-time components. Error boundary testing must verify graceful failure handling and recovery mechanisms.

## Implementation Notes

Use React functional components with hooks for consistent patterns and better performance. Implement context providers for theme, IPC client, and global state management. Use React Query or SWR for IPC request management and caching. Implement custom hooks for common IPC operations and state management patterns. Use CSS modules or styled-components for component-scoped styling. Implement proper TypeScript interfaces for all component props and state. Use React.memo and useMemo strategically for performance optimization. Implement proper cleanup in useEffect hooks to prevent memory leaks. Use error boundaries at strategic component tree levels for graceful failure handling. Implement proper loading and error states for all async operations.

## Specification by Example

```typescript
// IPC client integration example
const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const ipcClient = useContext(IPCContext);

  useEffect(() => {
    const unsubscribe = ipcClient.timer.subscribeToUpdates(setTimerState);
    return unsubscribe;
  }, [ipcClient]);

  const startTimer = useCallback(async () => {
    try {
      const newState = await ipcClient.timer.start();
      setTimerState(newState);
    } catch (error) {
      throw new IPCError('TIMER_START_FAILED', 'Failed to start timer');
    }
  }, [ipcClient]);

  return { timerState, startTimer };
};

// Component example with error boundary
const Dashboard: React.FC = () => {
  const { timerState, startTimer } = useTimer();
  const { tasks } = useTasks();
  const { metrics } = useSessionMetrics();

  return (
    <ErrorBoundary fallback={<DashboardError />}>
      <div className="dashboard">
        <Header>
          <TimerStatus state={timerState} />
          <QuickActions onStart={startTimer} />
        </Header>
        <MainContent>
          <MetricsGrid>
            <SessionMetrics data={metrics} />
            <TaskProgress tasks={tasks} />
          </MetricsGrid>
        </MainContent>
      </div>
    </ErrorBoundary>
  );
};

// Window-specific routing example
const App: React.FC = () => {
  const windowType = useContext(WindowTypeContext);
  
  if (windowType === 'dashboard') {
    return <Dashboard />;
  } else if (windowType === 'break-screen') {
    return <BreakScreen />;
  } else if (windowType === 'floating-countdown') {
    return <FloatingCountdown />;
  }
  
  return <Planning />;
};
```

## Verification

- [ ] All window types render correctly with appropriate components and layouts
- [ ] IPC communication works reliably with proper error handling and timeout management
- [ ] State synchronization maintains consistency between renderer and main process
- [ ] Component hot reloading works without losing application state during development
- [ ] Error boundaries catch component failures and provide appropriate fallback UI
- [ ] Performance remains acceptable during high-frequency timer updates and state changes
- [ ] Memory usage stays stable during extended application usage
- [ ] Accessibility features support keyboard navigation and screen reader interaction
- [ ] Theme switching works correctly across all components and window types
- [ ] All components properly handle loading states and async operations
- [ ] TypeScript interfaces provide complete type safety for props and state
- [ ] Component testing covers all user interaction scenarios and edge cases
- [ ] Visual consistency maintained across different window sizes and screen densities
- [ ] Real-time updates display smoothly without causing UI jank or flicker
- [ ] Error states provide clear feedback and recovery options for users
