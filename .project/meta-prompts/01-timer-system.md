Please generate a prompt that instructs an LLM to perform the following tasks:

* Implement the Pomodoro timer system for a productivity desktop app, including timer logic, state management, and phase transitions (Planning, Focus, Break).
* Ensure the timer logic runs in the Electron main process and synchronizes state across multiple windows via IPC.
* Support user actions (start, pause, reset, skip) from any window, with a single source of truth in the main process.
* Handle automatic transitions between phases and provide real-time updates to all windows.
* Follow the prompt structure as detailed in `.project/templates/00_PROMPT_TEMPLATE.md`. Write the prompt as Markdown and place it under the `prompts` directory as `01-timer-system.md`.
