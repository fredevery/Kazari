# Testing Infrastructure

Establish a comprehensive testing infrastructure for the Kazari desktop productivity application to ensure reliability, maintainability, and quality across all components and user workflows. This infrastructure will support both unit testing for business logic and end-to-end testing for complete user scenarios.

## Requirements

- Set up unit testing framework with Jest and React Testing Library for component and business logic testing
- Implement end-to-end testing infrastructure using Playwright for Electron applications
- Achieve minimum 80% test coverage for business logic and critical components
- Establish test coverage reporting and monitoring with detailed metrics
- Create CI/CD pipeline integration for automated test execution on pull requests and deployments
- Implement test data factories and fixtures for consistent test scenarios
- Set up performance testing for timer precision and multi-window synchronization
- Create accessibility testing integration to ensure compliance with WCAG guidelines
- Establish visual regression testing for UI consistency
- Implement test categorization (unit, integration, e2e) with appropriate test runners

## Rules

- rules/typescript-standards.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/timer-precision.md
- rules/state-management.md
- rules/error-handling.md
- rules/accessibility.md
- rules/build-configuration.md

## Domain

```typescript
// Testing Domain Model
interface TestSuite {
  id: string;
  name: string;
  type: TestType;
  coverage: CoverageReport;
  results: TestResult[];
  duration: number;
}

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  assertions: Assertion[];
}

interface CoverageReport {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
  threshold: CoverageThreshold;
}

interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
}

enum TestType {
  Unit = 'unit',
  Integration = 'integration',
  EndToEnd = 'e2e',
  Performance = 'performance',
  Accessibility = 'accessibility',
  Visual = 'visual'
}

// Test Fixtures and Factories
interface TestTimerState {
  currentPhase: 'planning' | 'focus' | 'break';
  timeRemaining: number;
  sessionCount: number;
  isRunning: boolean;
}

interface TestTaskData {
  id: string;
  title: string;
  priority: number;
  completed: boolean;
  estimatedSessions: number;
}
```

## Extra Considerations

- Electron applications require special setup for testing both main and renderer processes
- Timer precision testing needs to account for system performance variations
- Multi-window state synchronization requires complex test scenarios
- IPC communication testing must verify message passing reliability
- Break screen full-screen behavior needs platform-specific testing approaches
- Test isolation is critical to prevent timer state leakage between tests
- Mock strategies needed for system-level APIs (notifications, window management)
- Performance tests should run in isolated environments to ensure consistent results
- CI environments may have different timing characteristics than development machines
- Visual regression tests need baseline image management across different platforms

## Testing Considerations

- **Unit Tests**: Focus on business logic, state management, and utility functions with fast execution times
- **Integration Tests**: Test IPC communication, state synchronization between processes, and data persistence
- **End-to-End Tests**: Cover complete user workflows including planning → focus → break cycles
- **Performance Tests**: Verify timer accuracy within ±100ms tolerance and window transition performance
- **Accessibility Tests**: Automated checks for keyboard navigation, screen reader compatibility, and WCAG compliance
- **Visual Tests**: Screenshot comparison for UI consistency across different window states and phases
- **Error Scenario Tests**: Test recovery mechanisms, error boundaries, and graceful degradation
- **Cross-Platform Tests**: Verify behavior consistency across Windows, macOS, and Linux
- **Load Tests**: Simulate extended usage patterns and memory leak detection
- **Security Tests**: Validate IPC message sanitization and process isolation

## Implementation Notes

- Use Playwright with Electron support for comprehensive e2e testing capabilities
- Implement custom test utilities for Electron main process testing
- Create shared test fixtures for consistent timer states and task data
- Use GitHub Actions for CI/CD with parallel test execution
- Implement test sharding for faster feedback loops
- Create custom matchers for timer precision and window state assertions
- Use MSW (Mock Service Worker) for API mocking in tests
- Implement test database seeding and cleanup strategies
- Create visual testing baseline management system
- Use code coverage badges and reports in documentation
- Implement test result reporting to Slack/Teams for team visibility

## Specification by Example

### Unit Test Example
```typescript
describe('TimerService', () => {
  it('should accurately track focus session duration', async () => {
    const timerService = new TimerService();
    const startTime = Date.now();
    
    timerService.startFocusSession(25 * 60 * 1000); // 25 minutes
    await advanceTimerBy(5 * 60 * 1000); // 5 minutes
    
    const remaining = timerService.getTimeRemaining();
    expect(remaining).toBeCloseTo(20 * 60 * 1000, 100); // ±100ms tolerance
  });
});
```

### E2E Test Example
```typescript
test('complete pomodoro cycle', async ({ page }) => {
  // Start planning phase
  await page.goto('/');
  await page.click('[data-testid="start-planning"]');
  
  // Select task and start focus session
  await page.selectOption('[data-testid="task-selector"]', 'Write documentation');
  await page.click('[data-testid="start-focus"]');
  
  // Verify floating countdown appears
  const floatingWindow = await page.waitForSelector('[data-testid="floating-countdown"]');
  expect(floatingWindow).toBeVisible();
  
  // Fast-forward to break time
  await page.evaluate(() => window.electronAPI.skipToBreak());
  
  // Verify break screen takeover
  await page.waitForSelector('[data-testid="break-screen"]');
  expect(await page.locator('[data-testid="break-screen"]').isVisible()).toBe(true);
});
```

### Coverage Configuration
```json
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main/preload.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### CI Pipeline Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```
