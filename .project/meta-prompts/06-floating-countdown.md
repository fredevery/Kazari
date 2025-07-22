Please generate a prompt that instructs an LLM to perform the following tasks:

* Implement the Floating Countdown window, a small always-on-top timer window for focus sessions.
* Ensure the window can be covered by other windows until the last minute of the session, at which point it should appear on top of all windows.
* Synchronize the countdown with the main timer logic and handle z-index management programmatically.
* Follow the prompt structure as detailed in `.project/templates/00_PROMPT_TEMPLATE.md`. Write the prompt as Markdown and place it under the `prompts` directory as `06-floating-countdown.md`.
