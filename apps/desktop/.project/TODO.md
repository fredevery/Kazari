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

## Key Features (from SPEC.md)
- [ ] **Session Planning**
  - [ ] Pre-session focus screen: show user what to focus on for the session
  - [ ] Mark tasks as completed
  - [ ] Select next task from a sorted list for the next session
- [ ] **Floating Countdown Window**
  - [ ] Show small countdown window during session
  - [ ] Window stays in background until last minute
  - [ ] Window appears on top of all windows in last minute
- [x] **Modular Architecture**
  - [x] Refactor codebase for modularity and easy feature addition (Factory, Bus, BaseModule implemented)
- [~] **Secure IPC Communication**
  - [~] contextBridge and preload exist, but not all IPC is validated or fully secured
- [~] **Bus Architecture**
  - [x] Basic event system implementation
  - [x] Event handler decorators (@Bus.eventHandler)
  - [~] Request-response pattern (handleRequest decorator exists, but full implementation pending)
  - [ ] Test utilities for decorated methods

---

## Error Handling & Logging (High Priority)
- [x] Set up error boundary in React app:
  - [x] Create ErrorBoundary component
  - [x] Add error reporting UI
  - [ ] Implement error recovery mechanisms
- [x] Implement main process error handling:
    - [x] Handle uncaught exceptions (`process.on("uncaughtException")`)
    - [x] Handle unhandled promise rejections (`process.on("unhandledRejection")`)
    - [x] Log all errors using electron-log (basic logging present, not all errors routed)
    - [x] Implement graceful shutdown on fatal errors
    - [x] (Optional) Notify user of critical errors
    - [x] (Optional) Integrate crash/error reporting service (e.g., Sentry/Rollbar)
    - [x] Test error handling by simulating errors
- [x] Add logging system:
  - [x] Set up electron-log
  - [x] Configure log levels
  - [x] Implement log rotation
  - [x] Add log file management
- [~] Create error reporting mechanism:
  - [~] Rollbar integration present, but no aggregation or notification UI

---

## Security (High Priority)
- [ ] Implement Content Security Policy
- [ ] Set up secure storage
- [ ] Add input sanitization
- [ ] Implement rate limiting

---

## Improved Code Architecture
- [x] Implement BaseModule class
- [x] Implement BaseManager class
- [x] Create singleton pattern for managers
- [ ] Complete dependency injection system

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
- [~] Implement additional window types:
  - [~] `DailyPlanning` window (stub exists)
  - [~] `BreakScreen` window (stub exists)
  - [~] `SessionPlanning` window (stub exists)
  - [~] `Dashboard` window (stub exists)
- [ ] Window state logic: show planning view only once per day

---

## React Renderer
- [x] Bootstrap React app with Vite in `src/renderer`
- [~] Create proper directory structure:
  - [x] `components/` - Reusable UI components (ErrorBoundary exists)
  - [x] `pages/` - Main application views (stubs exist)
  - [ ] `state/` - State management
  - [ ] `hooks/` - Custom React hooks
  - [ ] `utils/` - Utility functions
- [~] `pages/DailyPlanning.tsx` (stub exists, not fully implemented)
- [~] `pages/BreakScreen.tsx` (stub exists, not fully implemented)
- [~] `pages/Dashboard.tsx` (stub exists, not fully implemented)
- [~] `pages/SessionPlanning.tsx` (stub exists, not fully implemented)
- [ ] Global state management (Zustand or Redux)
- [ ] Tailwind CSS (not present)

---

## IPC & Preload
- [~] `preload.ts` exists, context isolation enabled, but API exposure and secure IPC not complete
- [ ] Define IPC channels
- [ ] Implement secure renderer ↔ main communication

---

## Core Pomodoro Logic
- [x] Timer logic (Timer module and tests implemented)
- [~] Scheduler implementation with availability and time blocks (basic structure exists)
- [ ] Break screen with countdown + negative time
- [ ] Daily session tracking + completion streaks
- [ ] Button to resume or revisit planning after break
- [ ] Floating Countdown window (see Key Features)

---

## Task Aggregation
- [ ] API wrappers in `src/integrations/`
- [ ] Unified task model in `src/data/`
- [ ] OAuth flows + token caching
- [ ] Daily task sync and prioritization UI

---

## Local Data & Persistence
- [x] Set up electron-store for window state
- [ ] Add additional store configurations
- [ ] Implement data synchronization
- [ ] Add data migration utilities

---

## System Integration (Medium Priority)
- [ ] Add system tray integration
- [ ] Implement global shortcuts
- [ ] Add notification system
- [ ] Create system startup option

---

## Accessibility (Medium Priority)
- [ ] Add keyboard shortcuts
- [ ] Implement screen reader support
- [ ] Add high contrast mode
- [ ] Ensure proper focus management

---

## Updates & Auto-updates (Medium Priority)
- [ ] Implement auto-update mechanism
- [ ] Add update notification system
- [ ] Create update rollback system
- [ ] Add version checking

---

## Dev & Build
- [ ] Audit and update Electron dependencies (from SPEC.md roadmap)
- [ ] Add type definitions for IPC and modules (from SPEC.md roadmap)
- [~] Vite dev server and build scripts present, but not fully integrated/tested
- [ ] Combine dev and build commands in one script
- [ ] Test production build with Electron Forge
- [ ] Package for macOS, Windows, and Linux

---

## Testing (High Priority)
- [x] Implement unit tests for Timer, Bus, Factory modules
- [~] Playwright E2E test exists, but not full coverage/CI
- [ ] Add test coverage reporting and CI integration (from SPEC.md)
- [ ] Create test utilities
- [ ] Add CI/CD pipeline

---

## Internationalization (Low Priority)
- [ ] Set up i18n framework
- [ ] Add language selection
- [ ] Create translation files
- [ ] Implement RTL support

---

## Development Tools (Low Priority)
- [ ] Set up automated dependency updates and release process (from SPEC.md roadmap)
- [ ] Add debug logging
- [ ] Create development tools panel
- [ ] Add performance profiling
- [ ] Implement state inspection

---

## Documentation (Medium Priority)
- [ ] Maintain documentation in both `docs` app and `.project/` directory (from SPEC.md)
- [ ] Document architecture decisions, build process, and contribution guidelines (from SPEC.md)
- [ ] Add JSDoc comments
- [ ] Create API documentation
- [ ] Add component documentation
- [ ] Create architecture diagrams

---

## Stretch Goals
- [ ] Progress dashboard/stats view
- [ ] Ambient break screen with background media
- [ ] AI suggestions or prioritization of tasks

---

## General Logging Improvements (Low Priority)
- [ ] Log all error recovery attempts and their outcomes
- [ ] Log user actions that trigger recovery or shutdown
- [ ] Aggregate logs for later analysis
- [ ] Add log rotation or log file size management
