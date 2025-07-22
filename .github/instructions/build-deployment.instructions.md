---
description: "Build processes and deployment strategies"
applyTo: "**/scripts/**/*.ts,package.json,**/build/**/*.js,**/dist/**"
---

# Build & Deployment Instructions

## Build Process Architecture

Use Vite for fast development builds with hot module replacement.
Implement separate build processes for main, preload, and renderer code.
Configure proper dependency bundling with external module handling.
Set up incremental builds to minimize rebuild times during development.
Implement proper build validation to catch errors before packaging.

## Cross-Platform Building

Configure builds for Windows, macOS, and Linux from any development platform.
Use Electron Builder or similar for consistent packaging across platforms.
Implement proper native dependency handling for each target platform.
Set up platform-specific metadata and configuration files.
Handle platform-specific file permissions and executable settings.

## Code Signing and Security

Implement proper code signing for all target platforms.
Set up certificate management for Windows and macOS code signing.
Configure proper notarization process for macOS distribution.
Implement integrity checking for distributed binaries.
Set up proper security scanning for build artifacts.

## Asset Optimization

Optimize images, fonts, and other assets for production distribution.
Implement proper compression strategies for different file types.
Set up asset versioning and cache busting for web assets.
Configure proper icon generation for different platforms and sizes.
Implement proper resource embedding and extraction strategies.

## Packaging Strategies

Create installer packages for each target platform (NSIS, DMG, AppImage).
Configure proper application metadata including version, description, and branding.
Set up proper file associations and protocol handlers in installers.
Implement proper uninstaller generation with complete cleanup.
Handle upgrade scenarios with proper data migration strategies.

## Distribution Channels

Set up automated distribution to appropriate app stores or update servers.
Configure proper release channel management (alpha, beta, stable).
Implement proper version management with semantic versioning.
Set up automatic update mechanisms with proper rollback capabilities.
Handle distribution signing and verification requirements.

## Build Validation

Implement automated testing of built packages before distribution.
Set up smoke tests for critical application functionality.
Verify proper asset loading and dependency resolution in packaged apps.
Test installer and uninstaller functionality on target platforms.
Validate security configurations and permissions in built applications.

## Development Workflow

Set up proper development build scripts with watch mode capabilities.
Implement proper preview builds for testing before release.
Configure proper debugging symbols and source map generation.
Set up proper environment variable management for different build types.
Implement proper build caching strategies for faster iterations.

## Performance Optimization

Optimize bundle sizes through proper tree shaking and dead code elimination.
Implement proper code splitting strategies for faster startup times.
Configure proper lazy loading for non-critical application components.
Set up proper asset preloading and caching strategies.
Optimize memory usage through proper resource management.

## Error Handling and Recovery

Implement proper build error reporting and diagnosis.
Set up automatic retry mechanisms for transient build failures.
Configure proper rollback strategies for failed deployments.
Implement proper logging and monitoring for build processes.
Handle edge cases like disk space limitations and network failures.

## Continuous Integration

Configure automated builds on code changes with proper validation.
Set up proper test execution before build packaging.
Implement automated security scanning and vulnerability checking.
Configure proper artifact storage and retention policies.
Set up proper deployment automation with approval workflows.
