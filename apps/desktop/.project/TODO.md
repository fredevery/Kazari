# Kazari TODO List

Kazari is a desktop productivity app using Electron + Vite + TypeScript + React. It uses Pomodoro techniques with a fullscreen daily planning screen, floating countdown timers, and integrated task management from third-party sources.

---

## Project Setup
- [x] Initialize project with Electron Forge + Vite + TypeScript + React
- [x] Configure `vite.config.ts` for the renderer
- [x] Configure `electron.vite.config.ts` for the main process
- [x] Enable ESM support in `tsconfig.json` and project structure
- [x] Create base directory structure:
  - [x] `src/main/` - Electron main process
  - [x] `src/renderer/` - React application
  - [x] `src/shared/` - Shared types and utilities
  - [x] `src/data/` - Data management
  - [x] `src/integrations/` - Third-party integrations
  - [x] `src/public/` - Static assets
  - [x] `src/assets/` - Application assets

---

## Error Handling & Logging (High Priority)
- [x] Set up error boundary in React app:
  - [x] Create ErrorBoundary component
  - [x] Add error reporting UI
  - [ ] Implement error recovery mechanisms
- [~] Implement main process error handling:
    - [x] Handle uncaught exceptions (`process.on("uncaughtException")`)
    - [x] Handle unhandled promise rejections (`process.on("unhandledRejection")`)
    - [ ] Log all errors using electron-log (partially implemented)
    - [ ] Implement graceful shutdown on fatal errors
    - [ ] (Optional) Notify user of critical errors
    - [ ] (Optional) Integrate crash/error reporting service (e.g., Sentry)
    - [ ] Test error handling by simulating errors
- [x] Add logging system:
  - [x] Set up electron-log
  - [x] Configure log levels
  - [x] Implement log rotation
  - [x] Add log file management
- [ ] Create error reporting mechanism:
  - [ ] Add error tracking service
  - [ ] Implement error aggregation
  - [ ] Create error notification system

---

## Security (High Priority)
- [ ] Implement Content Security Policy:
  - [ ] Configure CSP headers
  - [ ] Set up CSP reporting
  - [ ] Test CSP effectiveness
- [ ] Set up secure storage:
  - [ ] Implement secure token storage
  - [ ] Add encryption for sensitive data
  - [ ] Create secure key management
- [ ] Add input sanitization:
  - [ ] Implement input validation
  - [ ] Add XSS protection
  - [ ] Set up sanitization utilities
- [ ] Implement rate limiting:
  - [ ] Add API rate limiting
  - [ ] Create rate limit configuration
  - [ ] Implement rate limit notifications

---

## Electron Windows
- [x] Basic `MainWindow.ts` setup
- [x] Implement `windowManager.ts`:
  - [x] Window lifecycle management
  - [x] Window state persistence with electron-store
  - [x] Window positioning and sizing
  - [x] Window event handling
  - [ ] Window positioning strategies for different types
- [x] Basic `index.ts` Electron main entry point
- [ ] Implement additional window types:
  - [ ] `DailyPlanning` window
  - [ ] `BreakScreen` window
  - [ ] `Dashboard` window
- [ ] Window state logic: show planning view only once per day

---

## React Renderer
- [x] Bootstrap React app with Vite in `src/renderer`
- [ ] Create proper directory structure:
  - [ ] `components/` - Reusable UI components (ErrorBoundary exists)
  - [ ] `pages/` - Main application views
  - [ ] `state/` - State management
  - [ ] `hooks/` - Custom React hooks
  - [ ] `utils/` - Utility functions
- [ ] `pages/DailyPlanning.tsx`
- [ ] `pages/BreakScreen.tsx`
- [ ] `pages/Dashboard.tsx`
- [ ] Global state management (Zustand or Redux)
- [ ] Tailwind CSS (optional)

---

## IPC & Preload
- [ ] Complete `preload.ts` implementation:
  - [ ] Context isolation setup
  - [ ] API exposure to renderer
  - [ ] Type definitions for exposed APIs
- [ ] Define IPC channels:
  - [ ] Timer control (start, pause, reset)
  - [ ] Window management
  - [ ] Task synchronization
  - [ ] State persistence
- [ ] Implement secure renderer ↔ main communication

---

## Core Pomodoro Logic
- [ ] Timer logic:
  - [ ] Session timing (25/5/15)
  - [ ] Break timing
  - [ ] Long break scheduling
- [ ] Break screen with countdown + negative time
- [ ] Daily session tracking + completion streaks
- [ ] Button to resume or revisit planning after break

---

## Task Aggregation
- [ ] API wrappers in `src/integrations/`:
  - [ ] `todoist.ts`
  - [ ] `github.ts`
  - [ ] `trello.ts`
  - [ ] `calendar.ts`
- [ ] Unified task model in `src/data/`
- [ ] OAuth flows + token caching
- [ ] Daily task sync and prioritization UI

---

## Local Data & Persistence
- [x] Set up electron-store for window state
- [ ] Add additional store configurations:
  - [ ] Daily planning state
  - [ ] Last login timestamp
  - [ ] User preferences
  - [ ] Completed session log
- [ ] Implement data synchronization
- [ ] Add data migration utilities

---

## System Integration (Medium Priority)
- [ ] Add system tray integration:
  - [ ] Create tray icon
  - [ ] Add tray menu
  - [ ] Implement tray actions
- [ ] Implement global shortcuts:
  - [ ] Add shortcut registration
  - [ ] Create shortcut configuration
  - [ ] Implement shortcut actions
- [ ] Add notification system:
  - [ ] Create notification templates
  - [ ] Add notification preferences
  - [ ] Implement notification actions
- [ ] Create system startup option:
  - [ ] Add startup configuration
  - [ ] Implement startup management
  - [ ] Create startup preferences

---

## Accessibility (Medium Priority)
- [ ] Add keyboard shortcuts:
  - [ ] Create shortcut documentation
  - [ ] Implement shortcut handlers
  - [ ] Add shortcut customization
- [ ] Implement screen reader support:
  - [ ] Add ARIA labels
  - [ ] Create screen reader announcements
  - [ ] Test with screen readers
- [ ] Add high contrast mode:
  - [ ] Create high contrast theme
  - [ ] Add theme switching
  - [ ] Test contrast ratios
- [ ] Ensure proper focus management:
  - [ ] Implement focus trapping
  - [ ] Add focus indicators
  - [ ] Create focus navigation

---

## Updates & Auto-updates (Medium Priority)
- [ ] Implement auto-update mechanism:
  - [ ] Set up update server
  - [ ] Add update checking
  - [ ] Implement update installation
- [ ] Add update notification system:
  - [ ] Create update notifications
  - [ ] Add update preferences
  - [ ] Implement update scheduling
- [ ] Create update rollback system:
  - [ ] Add version backup
  - [ ] Implement rollback mechanism
  - [ ] Create rollback UI
- [ ] Add version checking:
  - [ ] Implement version comparison
  - [ ] Add version requirements
  - [ ] Create version notifications

---

## Dev & Build
- [ ] Complete Vite dev server setup:
  - [ ] Hot module replacement
  - [ ] Source maps
  - [ ] TypeScript compilation
- [ ] Combine dev and build commands in one script
- [ ] Test production build with Electron Forge
- [ ] Package for macOS, Windows, and Linux

---

## Testing (High Priority)
- [ ] Set up unit testing framework:
  - [ ] Configure Jest
  - [ ] Add test utilities
  - [ ] Create test templates
- [ ] Add E2E testing:
  - [ ] Set up Spectron
  - [ ] Create test scenarios
  - [ ] Add test data
- [ ] Create test utilities:
  - [ ] Add test helpers
  - [ ] Create mock data
  - [ ] Implement test fixtures
- [ ] Add CI/CD pipeline:
  - [ ] Set up GitHub Actions
  - [ ] Add test automation
  - [ ] Implement coverage reporting

---

## Internationalization (Low Priority)
- [ ] Set up i18n framework:
  - [ ] Configure i18next
  - [ ] Add language detection
  - [ ] Create translation structure
- [ ] Add language selection:
  - [ ] Create language switcher
  - [ ] Add language preferences
  - [ ] Implement language persistence
- [ ] Create translation files:
  - [ ] Add English translations
  - [ ] Create translation templates
  - [ ] Add translation validation
- [ ] Implement RTL support:
  - [ ] Add RTL styles
  - [ ] Create RTL components
  - [ ] Test RTL layout

---

## Development Tools (Low Priority)
- [ ] Add debug logging:
  - [ ] Create debug utilities
  - [ ] Add debug configuration
  - [ ] Implement debug UI
- [ ] Create development tools panel:
  - [ ] Add state inspector
  - [ ] Create performance monitor
  - [ ] Implement network inspector
- [ ] Add performance profiling:
  - [ ] Set up profiling tools
  - [ ] Add performance metrics
  - [ ] Create performance reports
- [ ] Implement state inspection:
  - [ ] Add state viewer
  - [ ] Create state history
  - [ ] Implement state debugging

---

## Documentation (Medium Priority)
- [ ] Add JSDoc comments:
  - [ ] Document components
  - [ ] Add API documentation
  - [ ] Create type documentation
- [ ] Create API documentation:
  - [ ] Add API examples
  - [ ] Create API reference
  - [ ] Add API guides
- [ ] Add component documentation:
  - [ ] Create component stories
  - [ ] Add usage examples
  - [ ] Document props
- [ ] Create architecture diagrams:
  - [ ] Add system overview
  - [ ] Create component diagrams
  - [ ] Document data flow

---

## Stretch Goals
- [ ] Progress dashboard/stats view
- [ ] Ambient break screen with background media
- [ ] AI suggestions or prioritization of tasks

---

## Notes
- Focus on implementing additional window types
- Implement basic Pomodoro timer before adding task integration
- Ensure proper type safety across IPC boundaries
- Consider adding error tracking and logging early
- Security and error handling should be implemented before adding features
- Testing should be set up early to ensure quality
- System integration features can be added incrementally
- Internationalization can be added later in the development cycle
