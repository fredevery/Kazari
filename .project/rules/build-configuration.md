# Build Configuration

_Rules for implementing build configuration in Electron applications to ensure fast development workflows, optimized production builds, proper asset handling, and reliable cross-platform packaging._

## Context

**Applies to:** Electron applications, multi-platform desktop apps, build systems and tooling  
**Level:** Strategic & Tactical - build architecture and implementation patterns  
**Audience:** Build engineers, DevOps engineers, Frontend developers, Release engineers

## Core Principles

1. **Fast Development:** Development builds should be fast with hot reloading for productive workflows
2. **Optimized Production:** Production builds should be optimized for size, performance, and security
3. **Consistent Environments:** Build configuration should work consistently across development, staging, and production
4. **Platform Support:** Build system must support all target platforms with proper native integrations

## Rules

### Must Have (Critical)

- **RULE-001:** Separate build configurations for main process, preload scripts, and renderer process
- **RULE-002:** TypeScript compilation must be configured with strict mode and proper type checking
- **RULE-003:** Development builds must support hot module reloading for renderer process
- **RULE-004:** Production builds must include code minification, tree shaking, and dead code elimination
- **RULE-005:** Source maps must be configurable for development (enabled) and production (optional)
- **RULE-006:** External dependencies must be properly externalized to prevent bundling conflicts
- **RULE-007:** Build artifacts must be reproducible and deterministic for consistent deployments

### Should Have (Important)

- **RULE-101:** Asset handling should support images, fonts, and static resources with proper optimization
- **RULE-102:** Environment variables should be managed securely with proper injection mechanisms
- **RULE-103:** Build process should validate that all required dependencies are included
- **RULE-104:** Cross-platform packaging should be automated with electron-builder or similar tools

### Could Have (Preferred)

- **RULE-201:** Build caching should be implemented to improve build performance
- **RULE-202:** Bundle analysis tools should be integrated for size optimization insights
- **RULE-203:** Automated testing should be integrated into the build pipeline

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Proper Vite configuration for Electron main process
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
        'fs',
        'path',
        'os',
        ...Object.keys(require('./package.json').dependencies || {}),
      ],
    },
    outDir: 'dist/main',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});

// Environment-aware configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  build: {
    sourcemap: isDevelopment ? 'inline' : false,
    minify: isProduction ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: isProduction ? {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns'],
        } : undefined,
      },
    },
  },
  server: {
    hmr: isDevelopment,
    port: 3000,
    strictPort: true,
  },
});

// Proper package.json scripts structure
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:main": "cross-env NODE_ENV=development vite build --config vite.main.config.ts --watch",
    "dev:renderer": "cross-env NODE_ENV=development vite --config vite.renderer.config.ts",
    "build": "npm run typecheck && npm run build:main && npm run build:preload && npm run build:renderer",
    "build:main": "cross-env NODE_ENV=production vite build --config vite.main.config.ts",
    "build:renderer": "cross-env NODE_ENV=production vite build --config vite.renderer.config.ts",
    "typecheck": "tsc --noEmit",
    "package": "npm run build && electron-builder",
    "clean": "rimraf dist build"
  }
}
```

### ❌ Don't Do This

```typescript
// Don't bundle Node.js modules in renderer
export default defineConfig({
  build: {
    rollupOptions: {
      external: [], // Missing externals will cause issues
    },
  },
});

// Don't use inconsistent build environments
if (someCondition) {
  // Different config based on runtime conditions
  config.build.minify = true;
}

// Don't ignore TypeScript errors in builds
export default defineConfig({
  build: {
    skipLibCheck: true, // Allows type errors to slip through
  },
});

// Don't hardcode paths or URLs
const config = {
  server: {
    port: 3000, // Should be configurable via environment
  },
  build: {
    outDir: '/absolute/path/to/dist', // Should use relative paths
  },
};
```

## Decision Framework

**When configuring build tools:**

1. **Identify target environments:** Development, staging, production requirements
2. **Define entry points:** Main process, preload scripts, renderer processes
3. **Plan asset strategy:** Static assets, dynamic imports, code splitting
4. **Consider security:** Source maps, external dependencies, environment variables

**When optimizing builds:**

- Measure build times and bundle sizes before optimization
- Use bundle analysis tools to identify optimization opportunities
- Consider trade-offs between build speed and runtime performance
- Test optimized builds thoroughly across all target platforms

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Legacy dependencies that require specific build configurations
- Platform-specific requirements that need custom handling
- Performance critical paths where standard optimization doesn't apply

**Process for exceptions:**

1. Document the exception with detailed technical justification
2. Implement monitoring to ensure exception doesn't cause issues
3. Plan migration path when standard approach becomes viable

## Quality Gates

- **Automated checks:** TypeScript compilation passes, build artifacts are generated successfully, bundle size within limits
- **Code review focus:** Build configuration changes, dependency updates, environment variable handling
- **Testing requirements:** Build artifacts work correctly across all target platforms
- **Performance monitoring:** Build times, bundle sizes, hot reload performance

## Related Rules

- `rules/typescript-standards.md` - TypeScript configuration and compilation requirements
- `rules/electron-main-process.md` - Main process architecture and build considerations
- `rules/electron-security.md` - Security considerations for build configuration
- `rules/error-handling.md` - Error handling in build scripts and processes

## References

- [Vite Documentation](https://vitejs.dev/guide/) - Official Vite build tool documentation
- [Electron Builder](https://www.electron.build/) - Cross-platform Electron packaging
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig) - TypeScript compiler options

---

## TL;DR

**Key Principles:**

- Separate configurations for main process, preload scripts, and renderer process
- Fast development builds with hot reloading for productive workflows
- Optimized production builds with minification and tree shaking
- Proper externalization of Node.js modules and Electron APIs

**Critical Rules:**

- Must have separate build configs for each Electron process (RULE-001)
- Must configure TypeScript with strict mode and type checking (RULE-002)
- Must support hot module reloading in development (RULE-003)
- Must include production optimizations (minification, tree shaking) (RULE-004)

**Quick Decision Guide:**
When in doubt: Ask "Does this build configuration support both fast development and optimized production?" Optimize for developer productivity in dev, runtime performance in prod.

**Before You Code Checklist:**
- [ ] Separate Vite configs for main, preload, and renderer
- [ ] TypeScript strict mode enabled with proper type checking
- [ ] Hot reloading configured for renderer development
- [ ] Production optimizations (minification, tree shaking) enabled
- [ ] External dependencies properly externalized
- [ ] Environment variables managed securely
