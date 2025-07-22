# Vite-Based Electron Build Configuration

_Set up a comprehensive Vite-based build configuration for the Kazari Electron application that provides fast development builds, hot module reloading, TypeScript support, and optimized production builds for all Electron entry points (main, preload, and renderer processes)._

## Requirements

- Configure Vite for all three Electron entry points: main process, preload scripts, and renderer process
- Implement hot module reloading (HMR) for renderer process development with live preview
- Set up TypeScript compilation and type checking for all entry points with strict mode enabled
- Create development scripts that support concurrent main/renderer development with automatic restart
- Configure production build optimization with code splitting, tree shaking, and minification
- Set up electron-builder integration for cross-platform packaging and distribution
- Implement source map generation for both development and production builds
- Configure asset handling for images, fonts, and other static resources
- Set up environment variable management for different build contexts (dev/staging/prod)
- Create build scripts for development, production, type checking, and packaging workflows

## Rules

- rules/build-configuration.md
- rules/typescript-standards.md
- rules/electron-main-process.md
- rules/electron-security.md
- rules/error-handling.md

## Domain

```typescript
// Build configuration interfaces
interface ViteBuildConfig {
  main: {
    entry: string;
    outDir: string;
    format: 'cjs' | 'esm';
    external: string[];
    rollupOptions: any;
  };
  preload: {
    entry: string;
    outDir: string;
    format: 'cjs' | 'esm';
    external: string[];
  };
  renderer: {
    entry: string;
    outDir: string;
    base: string;
    publicDir: string;
    assetsDir: string;
  };
}

interface ElectronBuilderConfig {
  appId: string;
  productName: string;
  directories: {
    output: string;
    buildResources: string;
  };
  files: string[];
  extraResources: string[];
  mac: MacConfig;
  win: WindowsConfig;
  linux: LinuxConfig;
}

interface DevelopmentServer {
  port: number;
  host: string;
  https: boolean;
  cors: boolean;
  hmr: {
    port: number;
    overlay: boolean;
  };
}

interface BuildScripts {
  'dev': string;
  'dev:main': string;
  'dev:renderer': string;
  'build': string;
  'build:main': string;
  'build:preload': string;
  'build:renderer': string;
  'typecheck': string;
  'package': string;
  'dist': string;
  'clean': string;
}

// Environment configuration
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  ELECTRON_IS_DEV: boolean;
  VITE_APP_VERSION: string;
  VITE_RENDERER_PORT: number;
  VITE_MAIN_VITE_DEV_SERVER_URL?: string;
}
```

## Extra Considerations

- Build configuration must support both development and production environments seamlessly
- Hot reloading should not interfere with Electron's main process or cause memory leaks
- TypeScript compilation should be fast enough for productive development workflow
- Production builds must be optimized for file size and runtime performance
- Source maps should be configurable for security considerations in production
- Build process should validate that all required assets and dependencies are included
- Consider electron-builder configuration for code signing and notarization on macOS
- Build configuration should support both ARM64 and x64 architectures
- Development server should handle CORS and security headers appropriately
- Build artifacts should be reproducible and cacheable for CI/CD optimization

## Testing Considerations

- Unit tests for build configuration utilities and helper functions
- Integration tests for the complete build pipeline from source to packaged application
- Performance tests for build times and hot reload speed during development
- Cross-platform testing of build artifacts on macOS, Windows, and Linux
- Testing of packaged applications to ensure all features work after distribution
- Validation of TypeScript compilation and type checking across all entry points
- Testing of environment variable injection and configuration management
- Asset loading and bundling verification for different file types
- Memory usage testing during development with hot reloading enabled

## Implementation Notes

- Use Vite's built-in TypeScript support with `esbuild` for fast compilation
- Configure separate Vite configurations for main, preload, and renderer processes
- Implement custom Vite plugins for Electron-specific requirements (e.g., node integration)
- Use `concurrently` or similar tools to run multiple development servers simultaneously
- Configure electron-builder with appropriate file patterns and ignore rules
- Set up proper externalization of Node.js modules and Electron APIs
- Use Vite's built-in CSS processing and PostCSS integration for styling
- Implement proper handling of static assets with Vite's asset pipeline
- Configure TypeScript path mapping and module resolution for monorepo structure
- Use Vite's environment variable system for runtime configuration

## Specification by Example

### Main Vite Configuration Structure
```typescript
// vite.config.ts - Root configuration
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
    },
  },
  envPrefix: 'VITE_',
});

// vite.main.config.ts - Main process configuration
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        ...Object.keys(require('./package.json').dependencies || {}),
      ],
    },
    outDir: 'dist/main',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});

// vite.preload.config.ts - Preload script configuration
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/preload/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
    outDir: 'dist/preload',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },
});

// vite.renderer.config.ts - Renderer process configuration  
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer'),
    },
  },
});
```

### Package.json Scripts Configuration
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:main": "cross-env NODE_ENV=development vite build --config vite.main.config.ts --mode development --watch",
    "dev:preload": "cross-env NODE_ENV=development vite build --config vite.preload.config.ts --mode development --watch", 
    "dev:renderer": "cross-env NODE_ENV=development vite --config vite.renderer.config.ts",
    "build": "npm run build:main && npm run build:preload && npm run build:renderer",
    "build:main": "cross-env NODE_ENV=production vite build --config vite.main.config.ts",
    "build:preload": "cross-env NODE_ENV=production vite build --config vite.preload.config.ts",
    "build:renderer": "cross-env NODE_ENV=production vite build --config vite.renderer.config.ts",
    "typecheck": "concurrently \"tsc --noEmit --project tsconfig.main.json\" \"tsc --noEmit --project tsconfig.renderer.json\"",
    "electron:dev": "cross-env NODE_ENV=development electron dist/main/main.js",
    "electron:start": "npm run build && cross-env NODE_ENV=production electron dist/main/main.js",
    "package": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --publish=never",
    "clean": "rimraf dist build coverage"
  }
}
```

### TypeScript Configuration
```json
// tsconfig.json - Root TypeScript configuration
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["src/shared/*"],
      "@main/*": ["src/main/*"],
      "@renderer/*": ["src/renderer/*"]
    }
  },
  "include": ["src/**/*", "vite.*.config.ts"],
  "references": [
    { "path": "./tsconfig.main.json" },
    { "path": "./tsconfig.renderer.json" }
  ]
}

// tsconfig.main.json - Main process TypeScript config
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": [
    "src/main/**/*",
    "src/preload/**/*",
    "src/shared/**/*"
  ]
}

// tsconfig.renderer.json - Renderer process TypeScript config
{
  "extends": "./tsconfig.json", 
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": [
    "src/renderer/**/*",
    "src/shared/**/*"
  ]
}
```

### Electron Builder Configuration
```json
// electron-builder configuration in package.json
{
  "build": {
    "appId": "com.kazari.productivity",
    "productName": "Kazari",
    "directories": {
      "output": "build",
      "buildResources": "build-resources"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "!node_modules/**/*.{md,txt}",
      "!node_modules/*/{LICENSE,CHANGELOG,README,readme}*"
    ],
    "extraResources": [
      {
        "from": "assets",
        "to": "assets",
        "filter": ["**/*"]
      }
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ],
      "hardenedRuntime": true,
      "entitlements": "build-resources/entitlements.mac.plist"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ],
      "category": "Office"
    }
  }
}
```

### Development Environment Setup
```typescript
// scripts/dev-runner.ts - Development orchestration script
import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'vite';
import { resolve } from 'path';

class DevRunner {
  private processes: ChildProcess[] = [];
  private rendererServer: any = null;

  async start(): Promise<void> {
    console.log('🚀 Starting Kazari development environment...');

    // Start renderer development server
    await this.startRendererServer();

    // Build and watch main process
    this.startMainProcess();

    // Build and watch preload script
    this.startPreloadProcess();

    // Start Electron after initial builds complete
    setTimeout(() => {
      this.startElectron();
    }, 3000);

    // Handle cleanup
    process.on('SIGTERM', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
  }

  private async startRendererServer(): Promise<void> {
    const config = await import('../vite.renderer.config');
    this.rendererServer = await createServer(config.default);
    await this.rendererServer.listen();
    
    console.log('✅ Renderer server started');
  }

  private startMainProcess(): void {
    const mainProcess = spawn('npm', ['run', 'dev:main'], {
      stdio: 'inherit',
      shell: true,
    });
    
    this.processes.push(mainProcess);
    console.log('✅ Main process build started');
  }

  private startPreloadProcess(): void {
    const preloadProcess = spawn('npm', ['run', 'dev:preload'], {
      stdio: 'inherit', 
      shell: true,
    });
    
    this.processes.push(preloadProcess);
    console.log('✅ Preload script build started');
  }

  private startElectron(): void {
    const electronProcess = spawn('npm', ['run', 'electron:dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_MAIN_VITE_DEV_SERVER_URL: 'http://localhost:3000',
      },
    });
    
    this.processes.push(electronProcess);
    console.log('✅ Electron application started');
  }

  private cleanup(): void {
    console.log('🧹 Cleaning up development environment...');
    
    this.processes.forEach((process) => {
      process.kill();
    });
    
    if (this.rendererServer) {
      this.rendererServer.close();
    }
    
    process.exit(0);
  }
}

new DevRunner().start().catch(console.error);
```
