# Dashboard Interface

The Dashboard Interface serves as the central hub for the Kazari productivity application, providing users with comprehensive productivity metrics, quick access to all app features, and an intuitive overview of their daily progress. It acts as the main control center where users can navigate between different phases (planning, focus, break), monitor their session statistics, track task completion, and access settings and customization options. This addresses the need for a unified interface that gives users complete visibility into their productivity patterns while providing seamless navigation to all application features.

## Requirements

- Dashboard must display real-time productivity metrics including completed sessions, total focus time, and task completion statistics
- Interface must provide quick navigation buttons to planning phase, focus phase, and break phase
- Dashboard must show current timer state and phase information synchronized with the main process
- System must display recent session history with timestamps and durations
- Interface must present task completion progress with visual indicators (progress bars, completion percentages)
- Dashboard must provide access to settings and customization panels
- Display must update automatically when timer state changes or tasks are completed in other windows
- Interface must show daily, weekly, and monthly productivity insights and trends
- Dashboard must display upcoming planned tasks and current task information
- System must provide quick actions for common operations (start timer, pause, reset, skip phase)
- Interface must be responsive and maintain consistent performance during real-time updates
- Dashboard must support keyboard shortcuts for navigation and common actions

## Rules

- rules/state-management.md
- rules/ipc-communication.md
- rules/electron-main-process.md
- rules/domain-driven-design-rules.md
- rules/typescript-standards.md
- rules/error-handling.md

## Domain

```typescript
// Dashboard state and metrics domain model
interface DashboardState {
  currentTimer: TimerState;
  sessionMetrics: SessionMetrics;
  taskProgress: TaskProgress;
  recentSessions: SessionHistory[];
  productivityInsights: ProductivityInsights;
  currentTask?: Task;
  upcomingTasks: Task[];
}

interface SessionMetrics {
  todayCompletedSessions: number;
  todayFocusTime: number; // in milliseconds
  todayBreakTime: number; // in milliseconds
  weeklyCompletedSessions: number;
  weeklyFocusTime: number;
  monthlyCompletedSessions: number;
  monthlyFocusTime: number;
  currentStreak: number; // consecutive days with at least one session
  bestStreak: number;
}

interface TaskProgress {
  todayCompletedTasks: number;
  todayTotalTasks: number;
  weeklyCompletedTasks: number;
  weeklyTotalTasks: number;
  completionRate: number; // percentage
  averageTaskDuration: number; // in milliseconds
}

interface SessionHistory {
  id: string;
  phase: 'planning' | 'focus' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
  taskId?: string;
  taskTitle?: string;
  completed: boolean;
}

interface ProductivityInsights {
  mostProductiveHours: number[]; // array of hours (0-23)
  averageSessionsPerDay: number;
  focusEfficiencyTrend: number; // positive/negative trend
  breakComplianceRate: number; // percentage of breaks taken
  taskCompletionConsistency: number; // variance in completion times
}

interface DashboardActions {
  navigateToPlanning(): void;
  navigateToFocus(): void;
  navigateToBreak(): void;
  openSettings(): void;
  startTimer(): void;
  pauseTimer(): void;
  resetTimer(): void;
  skipPhase(): void;
  selectTask(taskId: string): void;
  markTaskComplete(taskId: string): void;
  refreshMetrics(): void;
}
```

## Extra Considerations

- Dashboard must handle graceful degradation when metrics are loading or unavailable
- Interface should implement progressive loading for historical data to maintain performance
- Visual design must be clean and non-distracting to maintain focus-friendly environment
- Color scheme and themes must be consistent with the overall application design system
- Dashboard must be accessible and support screen readers for productivity metrics
- Real-time updates must not cause visual flickering or performance degradation
- Interface must handle timezone changes and maintain accurate session timestamps
- System must support data export functionality for external productivity analysis
- Dashboard must provide visual feedback for all user interactions to ensure responsiveness
- Error states must be handled gracefully with meaningful user messages

## Testing Considerations

- Unit tests must verify dashboard state management and metric calculations
- Integration tests should validate IPC communication with timer and task systems
- Visual regression tests should ensure UI consistency across different data states
- Performance tests must verify real-time update handling without UI blocking
- Accessibility tests should validate screen reader compatibility for all metrics
- Cross-platform tests must ensure consistent behavior across different operating systems
- Load tests should verify dashboard performance with large amounts of historical data
- User interaction tests must validate all navigation and quick action functionality

## Implementation Notes

- Use React functional components with hooks for state management and lifecycle handling
- Implement memoization for expensive metric calculations to prevent unnecessary re-renders
- Use CSS Grid or Flexbox for responsive dashboard layout that adapts to different window sizes
- Implement debounced updates for real-time metrics to balance responsiveness with performance
- Follow Material Design or similar design system principles for consistent visual hierarchy
- Use TypeScript strict mode with comprehensive type definitions for all dashboard data
- Implement proper error boundaries to isolate dashboard failures from other app components
- Use CSS transitions and animations sparingly to maintain professional appearance
- Implement keyboard navigation support following WCAG accessibility guidelines
- Structure components modularly to support future customization and feature additions

## Specification by Example

```typescript
// Example dashboard data state
const exampleDashboardState: DashboardState = {
  currentTimer: {
    phase: 'focus',
    status: 'running',
    remainingTime: 900000, // 15 minutes
    totalTime: 1500000, // 25 minutes
    sessionCount: 3,
    startTime: new Date('2025-07-22T09:30:00Z')
  },
  sessionMetrics: {
    todayCompletedSessions: 3,
    todayFocusTime: 4500000, // 75 minutes
    todayBreakTime: 900000, // 15 minutes
    weeklyCompletedSessions: 18,
    weeklyFocusTime: 27000000, // 7.5 hours
    monthlyCompletedSessions: 78,
    monthlyFocusTime: 117000000, // 32.5 hours
    currentStreak: 5,
    bestStreak: 12
  },
  taskProgress: {
    todayCompletedTasks: 2,
    todayTotalTasks: 5,
    weeklyCompletedTasks: 12,
    weeklyTotalTasks: 20,
    completionRate: 85.5,
    averageTaskDuration: 1800000 // 30 minutes
  },
  recentSessions: [
    {
      id: 'session-123',
      phase: 'focus',
      startTime: new Date('2025-07-22T08:00:00Z'),
      endTime: new Date('2025-07-22T08:25:00Z'),
      duration: 1500000,
      taskId: 'task-456',
      taskTitle: 'Review API documentation',
      completed: true
    }
  ],
  productivityInsights: {
    mostProductiveHours: [9, 10, 14, 15],
    averageSessionsPerDay: 6.5,
    focusEfficiencyTrend: 0.12, // 12% improvement
    breakComplianceRate: 89.5,
    taskCompletionConsistency: 0.85
  },
  currentTask: {
    id: 'task-789',
    title: 'Implement dashboard metrics',
    description: 'Build the productivity metrics display component',
    priority: 'high',
    estimatedDuration: 45,
    completed: false
  },
  upcomingTasks: [
    {
      id: 'task-101',
      title: 'Code review session',
      priority: 'medium',
      estimatedDuration: 30,
      completed: false
    }
  ]
};
```

```jsx
// Example dashboard component structure
<Dashboard>
  <Header>
    <TimerStatus current={currentTimer} />
    <QuickActions onStart={startTimer} onPause={pauseTimer} />
  </Header>
  
  <MainContent>
    <MetricsGrid>
      <SessionMetrics data={sessionMetrics} />
      <TaskProgress data={taskProgress} />
      <ProductivityInsights data={productivityInsights} />
    </MetricsGrid>
    
    <TaskSection>
      <CurrentTask task={currentTask} />
      <UpcomingTasks tasks={upcomingTasks} />
    </TaskSection>
    
    <RecentActivity sessions={recentSessions} />
  </MainContent>
  
  <Navigation>
    <NavigationButton target="planning" />
    <NavigationButton target="focus" />
    <NavigationButton target="break" />
    <SettingsButton />
  </Navigation>
</Dashboard>
```

## Verification

- [ ] Dashboard displays real-time productivity metrics that update automatically
- [ ] Navigation buttons successfully launch planning, focus, and break interfaces
- [ ] Timer state information is synchronized and displays current phase and remaining time
- [ ] Session history shows accurate timestamps and durations for completed sessions
- [ ] Task completion progress is visually represented with progress indicators
- [ ] Settings and customization panels are accessible from the dashboard
- [ ] Dashboard updates immediately when timer state changes in other windows
- [ ] Daily, weekly, and monthly insights are calculated and displayed correctly
- [ ] Current and upcoming task information is displayed and updates dynamically
- [ ] Quick action buttons (start, pause, reset, skip) function correctly from dashboard
- [ ] Interface maintains responsive performance during real-time metric updates
- [ ] Keyboard shortcuts work for navigation and common dashboard actions
- [ ] Dashboard gracefully handles loading states and missing data
- [ ] All visual elements follow the consistent application design system
- [ ] Error states display meaningful messages without breaking the interface
