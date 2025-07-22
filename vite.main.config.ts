import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist/main',
    lib: {
      entry: resolve(__dirname, 'src/main/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'os',
        'crypto',
        'buffer',
        'stream',
        'util',
        'url',
        'events',
        'child_process',
        'electron-store'
      ]
    },
    sourcemap: process.env['NODE_ENV'] === 'development',
    minify: process.env['NODE_ENV'] === 'production'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@main': resolve(__dirname, 'src/main')
    }
  }
});
