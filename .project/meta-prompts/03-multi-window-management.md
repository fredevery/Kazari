Please generate a prompt that instructs an LLM to perform the following tasks:

* Implement multi-window management for the desktop app, including Dashboard, Floating Countdown, and Break Screen windows.
* Ensure all windows receive real-time timer updates and remain synchronized via IPC.
* Handle window creation, destruction, z-index management (e.g., Floating Countdown always on top in last minute), and inter-window communication.
* Follow the prompt structure as detailed in `.project/templates/00_PROMPT_TEMPLATE.md`. Write the prompt as Markdown and place it under the `prompts` directory as `03-multi-window-management.md`.
