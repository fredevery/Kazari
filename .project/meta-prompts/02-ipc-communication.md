Please generate a prompt that instructs an LLM to perform the following tasks:

* Design and implement secure, structured IPC communication between Electron main and renderer processes using contextBridge.
* Validate all IPC channels and ensure only whitelisted APIs are exposed to the renderer.
* Include type definitions for IPC messages and ensure type safety across main, preload, and renderer code.
* Follow Electron security best practices for data handling and API exposure.
* Follow the prompt structure as detailed in `.project/templates/00_PROMPT_TEMPLATE.md`. Write the prompt as Markdown and place it under the `prompts` directory as `02-ipc-communication.md`.
