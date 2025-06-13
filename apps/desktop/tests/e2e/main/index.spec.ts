import { test, expect, chromium } from "@playwright/test";
import { getElectronApp } from "../setupElectron.ts";

test("launch app", async () => {
  const app = await getElectronApp();
  const isPackaged = await app.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);
  const mainWindow = await app.firstWindow();
  const allWindows = await app.windows();
  console.log("Main window URL:", mainWindow.url());
  console.log(
    "All windows:",
    allWindows.map((win) => win.url()),
  );
});
