# Project Improvements TODO

## Critical Issues

### Electron Version
- [ ] Update Electron from 36.2.1 to latest stable version (^28.0.0)
- [ ] Review and update all Electron-related dependencies

### Dependencies
- [ ] Remove unnecessary `electron-squirrel-startup` unless Windows Squirrel installers are needed
- [ ] Audit and update ESLint dependencies for version compatibility
- [ ] Remove duplicate lock file (package-lock.json) and stick to pnpm

## Security Enhancements

### Electron Fuses
- [ ] Enable `EnableRemoteContentSandbox` for additional security
- [ ] Enable `EnableRemoteModuleSandbox` if using remote modules
- [ ] Review and document security implications of current Fuse settings

## Build and Configuration

### Vite Configuration
- [ ] Properly configure `vite.main.config.ts`
- [ ] Properly configure `vite.renderer.config.ts`
- [ ] Properly configure `vite.preload.config.ts`
- [ ] Document build process and configuration

### TypeScript
- [ ] Extend desktop app's `tsconfig.json` from shared config
- [ ] Review and update TypeScript configurations across the project
- [ ] Add proper type definitions for all modules

## Project Structure

### Source Organization
- [ ] Implement proper directory structure for components
- [ ] Separate main and renderer process code
- [ ] Set up proper IPC (Inter-Process Communication) structure
- [ ] Add type definitions for IPC messages
- [ ] Document architecture decisions

## Testing Infrastructure

### Test Setup
- [ ] Add unit testing framework
- [ ] Set up E2E testing with Spectron or Playwright
- [ ] Add test configuration files
- [ ] Create initial test suite
- [ ] Set up CI/CD pipeline for tests

## Documentation

### Project Documentation
- [ ] Set up proper documentation structure in `docs` app
- [ ] Add API documentation
- [ ] Create development setup instructions
- [ ] Add contributing guidelines
- [ ] Document build and deployment processes

## Development Experience

### Tooling
- [ ] Add VS Code debug configurations
- [ ] Set up Prettier for consistent formatting
- [ ] Add Husky for pre-commit hooks
- [ ] Implement commitlint for commit message standardization
- [ ] Add development scripts for common tasks

## Package Management

### Dependency Management
- [ ] Remove package-lock.json
- [ ] Document pnpm workspace usage
- [ ] Add dependency update strategy
- [ ] Set up automated dependency updates

## Additional Considerations

### Performance
- [ ] Add performance monitoring
- [ ] Implement proper error tracking
- [ ] Set up logging infrastructure

### Maintenance
- [ ] Add automated version bumping
- [ ] Set up automated changelog generation
- [ ] Implement proper release process

## Notes
- Prioritize critical issues first
- Security enhancements should be implemented early
- Documentation should be updated as changes are made
- Consider creating separate issues for each task in your issue tracking system 