# Project Setup - Productivity Desktop App (Electron)

Set up a complete Electron-based desktop application following clean architecture principles. This productivity app will serve as the foundation for a timer-focused desktop application with modern architecture patterns, proper separation of concerns, and scalable state management.

## Requirements

- Initialize an Electron project with TypeScript support and modern build tooling
- Implement clean architecture folder structure with clear layer separation
- Configure main and renderer processes with proper IPC communication channels
- Set up state management foundation using modern patterns (Redux Toolkit or Zustand)
- Create basic timer logic infrastructure with proper domain modeling
- Include essential development dependencies and build scripts
- Configure linting, formatting, and testing frameworks
- Establish proper configuration management for different environments
- Include basic security configurations following Electron best practices

## Rules

- rules/clean-architecture.md
- rules/electron-security.md
- rules/typescript-standards.md

## Domain

```typescript
// Core Timer Domain
interface TimerSession {
  id: string;
  name: string;
  duration: number; // in milliseconds
  remainingTime: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TimerSettings {
  defaultDuration: number;
  autoStart: boolean;
  notifications: boolean;
  soundEnabled: boolean;
}

// Application State
interface AppState {
  currentSession: TimerSession | null;
  settings: TimerSettings;
  sessionHistory: TimerSession[];
}

// Core Use Cases
interface TimerRepository {
  save(session: TimerSession): Promise<void>;
  findById(id: string): Promise<TimerSession | null>;
  getHistory(): Promise<TimerSession[]>;
}

interface NotificationService {
  showTimerComplete(session: TimerSession): void;
  requestPermission(): Promise<boolean>;
}
```

## Extra Considerations

- Ensure proper process isolation between main and renderer processes
- Implement secure IPC communication with input validation
- Consider cross-platform compatibility (Windows, macOS, Linux)
- Plan for automatic updates using electron-updater
- Include proper error handling and logging mechanisms
- Consider performance implications of timer precision and background execution
- Plan for data persistence using appropriate storage solutions
- Ensure proper cleanup of timers when app closes or crashes

## Testing Considerations

- Unit tests for business logic and domain models using Jest
- Integration tests for IPC communication between processes
- E2E tests using Spectron or Playwright for Electron
- Test timer accuracy and edge cases (pause/resume, system sleep)
- Mock system notifications and validate notification triggers
- Test state persistence and recovery scenarios
- Validate security configurations and CSP policies

## Implementation Notes

- Use TypeScript throughout for type safety and better developer experience
- Implement dependency injection for better testability
- Follow clean architecture with clear boundaries between layers
- Use modern React with hooks for renderer process UI (if React is chosen)
- Implement proper error boundaries and error handling strategies
- Use webpack or Vite for efficient bundling and hot reload during development
- Configure ESLint and Prettier for consistent code style
- Set up GitHub Actions or similar CI/CD pipeline for automated testing and building

## Specification by Example

### Project Structure
```
src/
├── main/                 # Main process
│   ├── application/      # Use cases and application services
│   ├── domain/          # Business logic and entities
│   ├── infrastructure/  # External adapters (file system, notifications)
│   └── main.ts          # Entry point
├── renderer/            # Renderer process
│   ├── application/     # Application layer
│   ├── domain/         # Shared domain types
│   ├── infrastructure/ # UI adapters and external services
│   ├── presentation/   # UI components and views
│   └── index.tsx       # Entry point
├── shared/             # Shared types and utilities
│   ├── types/          # Common interfaces
│   └── constants/      # Application constants
└── tests/              # Test files
```

### IPC Communication Example
```typescript
// Main process
ipcMain.handle('timer:start', async (event, sessionData) => {
  const session = await timerService.startTimer(sessionData);
  return session;
});

// Renderer process
const startTimer = async (sessionData: CreateSessionData) => {
  const session = await window.electronAPI.invoke('timer:start', sessionData);
  dispatch(setCurrentSession(session));
};
```

### Configuration Files
- `package.json` with scripts for dev, build, and test
- `tsconfig.json` for TypeScript configuration
- `webpack.config.js` or `vite.config.ts` for build configuration
- `.eslintrc.js` and `.prettierrc` for code quality
- `electron-builder.yml` for application packaging

## Verification

- [ ] Electron application starts successfully in development mode
- [ ] TypeScript compilation works without errors
- [ ] Main and renderer processes communicate via IPC
- [ ] State management updates UI reactively
- [ ] Basic timer can be created, started, and stopped
- [ ] Timer state persists between app restarts
- [ ] All linting and formatting rules pass
- [ ] Unit tests run successfully
- [ ] Application can be built for production
- [ ] Security configurations are properly applied (CSP, nodeIntegration: false)
- [ ] Cross-platform compatibility verified on target platforms
