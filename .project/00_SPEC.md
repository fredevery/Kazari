# SPEC.md

## Project Overview

**Kazari** is a cross-platform desktop productivity application built with Electron, React, TypeScript, and Vite. The app is designed to help users plan their day, manage tasks, and take regular breaks to improve focus and well-being.

## Key Features

- **Daily Planning:** Users can plan their day, set goals, and track progress.
- **Break Screen:** Encourages users to take regular breaks with a dedicated break interface.
- **Session Planning:** Before each session the user can see what they need to focus on for this session. If they have completed the task at hand they can flag it as completed and select the next task from a sorted list for the next session.
- **Floating Countdown** A small countdown window should be shown during a session. Until the last minute of the session the window can be covered by other windows. During the last minute the countdown window should appear on top of all windows.
- **Dashboard:** Central hub for productivity metrics and quick access to features.
- **IPC Communication:** Secure and structured communication between Electron main and renderer processes.
- **Customizable:** Modular architecture for easy addition of new features and integrations.

## Key Flows

- **Phases:**

  1. Planning - First phase is to plan what to focus on. The first planning for the day will be used to prioritize tasks for the day. Subsequent planning phases are simply to keep track of task progress.
  2. Focus - This phase only has the countdown timer visible. Until the last minute of this phase the countdown timer window can be covered by other windows. For the last minute of the phase it should be on top of all windows
  3. Break - During this phase the whole screen should be taken up buy a full screen window with the break timer countdown on it. When the break time completes the counter will begin counting into the negatives to show the user that they have gone over their break time. When the user

- **Break Overrun Feedback:**

  - When the break timer reaches zero, the timer continues counting into negative values.
  - The break screen visually indicates the user is over their allotted break time (e.g., color change, message, or negative timer).
  - The user can end the break and return to planning or focus at any time.

- **Multi-Window Timer Sync:**

  - The Pomodoro timer logic runs in the Electron main process.
  - All windows (Dashboard, Floating Countdown, Break Screen, etc.) receive real-time timer updates via IPC.
  - User actions (start, pause, reset, skip) from any window are sent to the main process and broadcast to all windows, ensuring a single source of truth.

- **Session Transition Flow:**

  - At the end of a focus session, the app automatically transitions to the break phase.
  - At the end of a break (or when the user ends it), the app transitions to the planning phase for the next session.
  - The user is prompted to review or select the next task before starting the next focus session.

- **Task Completion and Progress Tracking:**

  - During planning or session transitions, users can mark tasks as completed.
  - The app tracks completed sessions and tasks, updating productivity metrics on the Dashboard.

- **Error Handling and Recovery:**

  - If a renderer or main process error occurs, the app displays a user-friendly error screen and attempts recovery where possible.
  - All errors are logged and (optionally) reported to an external service.

- **Secure IPC and Data Handling:**
  - All IPC channels are validated and use contextBridge for secure API exposure.
  - Sensitive data (tokens, user settings) is stored securely using Electron best practices.

## Technical Stack

- **Electron:** Desktop application framework (latest stable version).
- **React:** UI library for renderer process.
- **TypeScript:** Type safety across main, preload, and renderer code.
- **Vite:** Fast build tool for both main and renderer processes.
- **PNPM:** Monorepo package management.
- **ESLint & Prettier:** Code quality and formatting.
- **Testing:** (Planned) Unit and E2E testing with Playwright or Spectron.

## Project Structure

- `apps/desktop/`: Main Electron app (main, preload, renderer, assets, components, pages).
- `configs/`: Shared configuration for ESLint, TypeScript, etc.
- `packages/`: (Planned) Shared packages/libraries.
- `.project/`: Project management files (TODO.md, SPEC.md, etc.).

## Security

- Electron fuses and sandboxing for enhanced security.
- Minimal use of Node.js integration in renderer.
- Planned: Enable Electron remote content and module sandboxes.

## Build & Development

- Vite-based configuration for all Electron entry points.
- TypeScript project references for shared types.
- Scripts for development, build, and packaging.
- Planned: CI/CD pipeline for automated testing and releases.

## Testing

- (Planned) Unit tests for business logic and components.
- (Planned) E2E tests for user flows.
- (Planned) Test coverage reporting and CI integration.

## Documentation

- All documentation to be maintained in the `docs` app and `.project/` directory.
- Architecture decisions, build process, and contribution guidelines to be documented.

## Roadmap

- Complete Electron dependency audit and update.
- Add type definitions for IPC and modules.
- Implement and document testing infrastructure.
- Set up automated dependency updates and release process.
- Expand documentation and developer tooling.
