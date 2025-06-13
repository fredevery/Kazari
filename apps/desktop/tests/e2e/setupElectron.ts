import path from "path";
import { _electron } from "@playwright/test";

const electron = _electron;
export async function getElectronApp() {
  const app = await electron.launch({
    args: [path.join(process.cwd(), "apps/desktop/.vite/build/main.cjs")],
    executablePath: path.join(
      process.cwd(),
      "apps/desktop/node_modules/.bin/electron",
    ),
  });
  return app;
}
