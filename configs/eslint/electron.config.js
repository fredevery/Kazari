import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import baseConfig from "./base.config.js";

export default defineConfig([
  baseConfig,
  importPlugin.flatConfigs.electron,
  {
    files: ["apps/kazari-desktop/**/*.{js,jsx,ts,tsx}"],
    extends: [""],
    rules: {
      // Electron-specific rules
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
      // Allow require statements in Electron main process
      "@typescript-eslint/no-var-requires": "off",
      // Allow __dirname and __filename
      "no-restricted-globals": [
        "error",
        {
          name: "window",
          message: "Use globalThis instead.",
        },
      ],
      // Allow process.env
      "no-process-env": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "apps/kazari-desktop/tsconfig.json",
        },
      },
    },
  },
]);
