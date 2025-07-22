# Development Workflow

Establish a comprehensive development workflow for the Kazari desktop productivity application that enables efficient development, debugging, and collaboration. This workflow will provide developers with the tools, scripts, and procedures needed to contribute effectively to the project while maintaining code quality and consistency.

## Requirements

- Set up development server with hot reloading for both main and renderer processes
- Implement comprehensive debugging setup for Electron main process, renderer processes, and preload scripts
- Create automated development environment setup scripts for quick onboarding
- Establish code formatting, linting, and pre-commit hooks for consistent code quality
- Implement development build optimization for fast iteration cycles
- Create comprehensive developer documentation with setup guides and troubleshooting
- Set up local testing environment with automated test running during development
- Implement source map generation and debugging tools integration
- Create development scripts for common tasks (building, testing, packaging, cleaning)
- Establish branch protection rules and pull request workflow for collaborative development

## Rules

- rules/typescript-standards.md
- rules/build-configuration.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/error-handling.md
- rules/state-management.md
- rules/accessibility.md
- rules/electron-security.md

## Domain

```typescript
// Development Workflow Domain Model
interface DevelopmentEnvironment {
  id: string;
  name: string;
  configuration: EnvironmentConfig;
  services: DevelopmentService[];
  status: EnvironmentStatus;
}

interface EnvironmentConfig {
  nodeVersion: string;
  electronVersion: string;
  hotReload: HotReloadConfig;
  debugging: DebuggingConfig;
  buildOptimization: BuildOptimizationConfig;
}

interface HotReloadConfig {
  mainProcess: boolean;
  rendererProcess: boolean;
  preloadScripts: boolean;
  watchPaths: string[];
  excludePaths: string[];
  restartDelay: number;
}

interface DebuggingConfig {
  mainProcessPort: number;
  rendererProcessPort: number;
  sourceMapSupport: boolean;
  inspectorProtocol: boolean;
  vscodeIntegration: boolean;
}

interface DevelopmentService {
  name: string;
  type: ServiceType;
  port?: number;
  command: string;
  healthCheck: HealthCheck;
  dependencies: string[];
}

enum ServiceType {
  DevServer = 'dev-server',
  HotReload = 'hot-reload',
  TypeChecker = 'type-checker',
  Linter = 'linter',
  TestRunner = 'test-runner',
  AssetWatcher = 'asset-watcher'
}

interface DeveloperWorkflow {
  setupSteps: SetupStep[];
  commonTasks: DevelopmentTask[];
  troubleshooting: TroubleshootingGuide[];
  bestPractices: BestPractice[];
}

interface DevelopmentTask {
  name: string;
  description: string;
  command: string;
  prerequisites: string[];
  expectedOutput: string;
}
```

## Extra Considerations

- Electron development requires managing multiple processes simultaneously
- Hot reloading for main process requires full application restart while renderer can be hot-reloaded
- Source maps must work across main/renderer process boundaries for effective debugging
- Development builds should prioritize speed over optimization
- Cross-platform development considerations for Windows, macOS, and Linux environments
- Memory usage monitoring during development to catch potential leaks early
- Asset handling for development vs production builds requires different strategies
- IPC communication debugging requires specialized tools and logging
- Development environment consistency across team members is critical
- Local development should mirror production environment as closely as possible
- Performance profiling tools integration for optimization work
- Version management for Electron, Node.js, and npm dependencies

## Testing Considerations

- **Development Server Tests**: Verify hot reloading works correctly for all process types
- **Debugging Integration Tests**: Ensure debugger attachment works for VS Code and Chrome DevTools
- **Build Script Tests**: Validate all npm scripts execute successfully in clean environments
- **Environment Setup Tests**: Test automated setup scripts on fresh systems
- **Hot Reload Performance Tests**: Measure reload times and identify optimization opportunities
- **Cross-Platform Tests**: Verify development workflow consistency across operating systems
- **Documentation Tests**: Validate setup instructions by following them step-by-step
- **Dependency Resolution Tests**: Ensure npm install works correctly with lockfile
- **Pre-commit Hook Tests**: Verify linting, formatting, and type checking run correctly
- **Development Build Tests**: Ensure development builds work correctly with debugging symbols

## Implementation Notes

- Use Vite for fast development server and hot module replacement
- Implement nodemon or similar for main process restart on changes
- Use concurrently to manage multiple development processes
- Integrate ESLint, Prettier, and TypeScript compiler for code quality
- Create VS Code workspace configuration with recommended extensions
- Use husky for git hooks and lint-staged for pre-commit checks
- Implement development environment health checks and monitoring
- Create Docker development environment option for consistency
- Use proper error boundaries and error reporting in development
- Implement development-specific logging and debugging utilities
- Create automated dependency update and security scanning workflows
- Use proper TypeScript project references for multi-package development

## Specification by Example

### Development Server Setup
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\" \"npm run dev:preload\"",
    "dev:main": "nodemon --exec electron . --watch src/main --ext ts",
    "dev:renderer": "vite serve --port 3000 --host localhost",
    "dev:preload": "tsc --build src/preload --watch",
    "debug": "concurrently \"npm run debug:main\" \"npm run dev:renderer\"",
    "debug:main": "electron --inspect=5858 . --remote-debugging-port=8315"
  }
}
```

### VS Code Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["--inspect=5858", "."],
      "console": "integratedTerminal",
      "sourceMaps": true
    },
    {
      "name": "Debug Renderer Process",
      "type": "chrome",
      "request": "attach",
      "port": 8315,
      "webRoot": "${workspaceFolder}/src/renderer",
      "sourceMaps": true
    }
  ],
  "compounds": [
    {
      "name": "Debug Electron App",
      "configurations": ["Debug Main Process", "Debug Renderer Process"]
    }
  ]
}
```

### Environment Setup Script
```bash
#!/bin/bash
# setup-dev-env.sh

echo "🚀 Setting up Kazari development environment..."

# Check Node.js version
node_version=$(node --version | cut -d'v' -f2)
required_version="18.0.0"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js $required_version or higher."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup git hooks
echo "🔧 Setting up git hooks..."
npx husky install

# Create local environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating local environment file..."
    cp .env.example .env.local
fi

# Run health check
echo "🏥 Running health check..."
npm run health-check

echo "✅ Development environment setup complete!"
echo "Run 'npm run dev' to start development server."
```

### Hot Reload Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    electronRenderer({
      nodeIntegration: false,
      contextIsolation: true
    })
  ],
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/index.html')
      }
    }
  }
});
```

### Pre-commit Configuration
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

### Development Health Check
```typescript
// scripts/health-check.ts
async function runHealthCheck() {
  const checks = [
    () => checkNodeVersion(),
    () => checkElectronVersion(),
    () => checkDependencies(),
    () => checkTypeScript(),
    () => checkESLint(),
    () => checkViteConfig(),
    () => checkEnvironmentFiles()
  ];

  for (const check of checks) {
    try {
      await check();
      console.log('✅', check.name);
    } catch (error) {
      console.error('❌', check.name, error.message);
      process.exit(1);
    }
  }

  console.log('🎉 All health checks passed!');
}
```

### Development Documentation Structure
```markdown
# Developer Guide

## Quick Start
1. Clone repository
2. Run `./scripts/setup-dev-env.sh`
3. Start development: `npm run dev`
4. Open debugger in VS Code

## Common Tasks
- `npm run dev` - Start development server
- `npm run debug` - Start with debugger
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Run TypeScript compiler
- `npm run lint:fix` - Fix linting issues

## Troubleshooting
### Hot Reload Not Working
- Check if port 3000 is available
- Restart development server
- Clear node_modules and reinstall

### Debugger Not Attaching
- Verify VS Code configuration
- Check if debug ports are available
- Restart Electron with --inspect flag
```

### Package.json Development Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\" --kill-others-on-fail",
    "dev:main": "nodemon",
    "dev:renderer": "vite",
    "dev:preload": "tsc --build --watch",
    "build": "npm run build:main && npm run build:renderer && npm run build:preload",
    "build:main": "tsc --build src/main",
    "build:renderer": "vite build",
    "build:preload": "tsc --build src/preload",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "clean": "rimraf dist node_modules/.cache",
    "health-check": "ts-node scripts/health-check.ts"
  }
}
```
