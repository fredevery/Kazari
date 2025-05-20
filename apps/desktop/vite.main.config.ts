import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: "es2024",
    lib: {
      entry: "./src/main/index.ts",
      formats: ["cjs"],
      fileName: "main",
    },
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
