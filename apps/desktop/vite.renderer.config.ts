import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, "./src/renderer"),
  // root: "./src/renderer",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@renderer": path.resolve(__dirname, "./src/renderer/src"),
      // "@": "./src",
    },
  },
});
