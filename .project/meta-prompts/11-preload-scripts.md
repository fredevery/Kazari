Please generate a prompt that instructs an LLM to perform the following tasks:

* Implement secure preload scripts for Electron, exposing only whitelisted APIs to the renderer via contextBridge.
* Ensure all IPC channels are validated and type safe.
* Document the preload API surface and provide examples of secure usage.
* Follow the prompt structure as detailed in `.project/templates/00_PROMPT_TEMPLATE.md`. Write the prompt as Markdown and place it under the `prompts` directory as `11-preload-scripts.md`.
