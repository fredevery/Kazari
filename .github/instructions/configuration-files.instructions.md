---
description: "Configuration file management and build tool setup"
applyTo: "**/vite.config.ts,**/tsconfig.json,**/*.config.js,**/*.config.ts,package.json"
---

# Configuration Files Instructions

## Vite Configuration

Configure separate Vite builds for main process, preload scripts, and renderer process.
Use proper TypeScript compilation settings for each process type.
Implement proper asset handling and optimization for production builds.
Configure proper source maps for development debugging.
Set up proper external dependency handling for Electron-specific modules.

## TypeScript Configuration

Use project references to share types between main, preload, and renderer processes.
Enable strict mode with all type checking options enabled.
Configure proper module resolution for cross-process type sharing.
Set up appropriate target and lib settings for each process environment.
Implement proper path mapping for clean import statements.

## ESLint Configuration

Configure TypeScript-aware ESLint rules for code quality enforcement.
Set up React-specific linting rules for renderer process code.
Implement Electron-specific security linting rules.
Configure proper import/export linting with TypeScript support.
Set up accessibility linting rules for React components.

## Package.json Management

Separate dependencies between main process and renderer process requirements.
Use proper Electron version management with consistent updates.
Configure appropriate Node.js version targeting for Electron compatibility.
Set up proper script commands for development, building, and packaging.
Implement proper security audit and dependency update workflows.

## Build Configuration

Configure multi-target builds for different platforms (Windows, macOS, Linux).
Set up proper code signing configuration for distribution.
Implement proper asset optimization and compression.
Configure proper output directory structure for packaged applications.
Set up incremental builds for faster development iteration.

## Environment Configuration

Use proper environment variable management for different build targets.
Implement configuration validation to catch misconfigurations early.
Set up proper secrets management for sensitive configuration values.
Configure appropriate logging levels for different environments.
Implement proper feature flag management for gradual rollouts.

## Development Tools Configuration

Set up proper debugging configuration for VS Code or preferred IDE.
Configure proper hot reloading for efficient development workflow.
Implement proper test runner configuration with coverage reporting.
Set up proper linting and formatting on pre-commit hooks.
Configure appropriate development proxy settings if needed.

## Security Configuration

Configure Content Security Policy settings appropriately.
Set up proper Electron security options in configuration files.
Implement proper certificate and signing configuration.
Configure appropriate sandbox settings for renderer processes.
Set up proper update server and auto-updater configuration.

## Performance Configuration

Configure appropriate bundle splitting and code splitting strategies.
Set up proper caching strategies for build artifacts.
Implement proper optimization settings for production builds.
Configure appropriate memory and resource limits.
Set up proper profiling and performance monitoring configuration.

## Platform-Specific Configuration

Handle platform differences in configuration files using conditional logic.
Set up appropriate file associations and protocol handlers.
Configure platform-specific packaging options and metadata.
Implement proper native module configuration for each platform.
Handle platform-specific security and permission requirements.
