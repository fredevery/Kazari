# Build and Packaging

Implement a comprehensive build and packaging system for the Kazari desktop productivity application that creates production-ready, signed, and distributable packages for all supported platforms. This system will ensure consistent, secure, and automated builds suitable for release to end users.

## Requirements

- Implement production build pipeline that optimizes code, assets, and bundles for distribution
- Create automated packaging scripts using Electron Builder for Windows, macOS, and Linux
- Establish code signing infrastructure for trusted distribution on all platforms
- Implement automatic versioning and changelog generation based on semantic versioning
- Create platform-specific installers with proper metadata, icons, and branding
- Set up build artifact management with checksums and integrity verification
- Implement automated build verification and smoke testing for packaged applications
- Create distribution channels for auto-updates with delta patching support
- Establish build reproducibility with locked dependencies and deterministic builds
- Document complete build and release process with troubleshooting guides for maintainers

## Rules

- rules/build-configuration.md
- rules/electron-security.md
- rules/typescript-standards.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/error-handling.md
- rules/accessibility.md
- rules/state-management.md

## Domain

```typescript
// Build and Packaging Domain Model
interface BuildConfiguration {
  id: string;
  name: string;
  platform: BuildPlatform;
  architecture: Architecture;
  optimization: OptimizationConfig;
  signing: SigningConfig;
  packaging: PackagingConfig;
}

enum BuildPlatform {
  Windows = 'win32',
  MacOS = 'darwin',
  Linux = 'linux'
}

enum Architecture {
  x64 = 'x64',
  arm64 = 'arm64',
  ia32 = 'ia32'
}

interface OptimizationConfig {
  minification: boolean;
  treeShaking: boolean;
  bundleAnalysis: boolean;
  sourceMap: boolean;
  compression: CompressionType;
  assetOptimization: AssetOptimizationConfig;
}

interface SigningConfig {
  certificateType: CertificateType;
  certificatePath?: string;
  timestampServer: string;
  identity?: string;
  provisioningProfile?: string;
  notarization?: NotarizationConfig;
}

enum CertificateType {
  CodeSigning = 'code-signing',
  DeveloperID = 'developer-id',
  Authenticode = 'authenticode'
}

interface PackagingConfig {
  outputFormat: OutputFormat[];
  installer: InstallerConfig;
  metadata: ApplicationMetadata;
  resources: ResourceConfig;
  autoUpdater: AutoUpdaterConfig;
}

enum OutputFormat {
  DMG = 'dmg',
  PKG = 'pkg',
  NSIS = 'nsis',
  MSI = 'msi',
  AppImage = 'appimage',
  DEB = 'deb',
  RPM = 'rpm',
  TAR = 'tar.gz'
}

interface BuildPipeline {
  stages: BuildStage[];
  artifacts: BuildArtifact[];
  verification: VerificationStep[];
  distribution: DistributionChannel[];
}

interface BuildArtifact {
  name: string;
  path: string;
  platform: BuildPlatform;
  architecture: Architecture;
  checksum: string;
  signature?: string;
  size: number;
}

interface DistributionChannel {
  name: string;
  type: ChannelType;
  configuration: ChannelConfig;
  autoUpdate: boolean;
}

enum ChannelType {
  Direct = 'direct',
  AppStore = 'app-store',
  WindowsStore = 'windows-store',
  SnapStore = 'snap-store',
  GitHub = 'github-releases'
}
```

## Extra Considerations

- Code signing requires platform-specific certificates and may involve Apple notarization process
- Cross-platform builds need proper environment setup or CI/CD infrastructure
- Large binary sizes require optimization strategies and delta update mechanisms
- Auto-update systems need secure channels and rollback capabilities
- Platform-specific packaging requirements (Windows registry, macOS plists, Linux desktop files)
- Build reproducibility requires locked dependency versions and consistent environments
- Security scanning of dependencies and built artifacts before distribution
- App Store distribution requires additional compliance and review processes
- Performance impact of security scanning and virus detection on packaged apps
- Licensing and legal compliance verification in build artifacts
- Build cache management to optimize build times without compromising security
- Disaster recovery for build infrastructure and certificate management

## Testing Considerations

- **Build Verification Tests**: Automated testing of packaged applications on target platforms
- **Installation Tests**: Verify installers work correctly on clean systems
- **Code Signing Tests**: Validate certificate validity and signature verification
- **Auto-Update Tests**: Test update mechanisms, delta patching, and rollback functionality
- **Cross-Platform Tests**: Ensure consistent behavior across Windows, macOS, and Linux
- **Performance Tests**: Verify build optimization doesn't break functionality
- **Security Tests**: Scan for vulnerabilities in dependencies and built artifacts
- **Integration Tests**: Test with real signing certificates and distribution channels
- **Smoke Tests**: Basic functionality verification in packaged applications
- **Regression Tests**: Ensure new builds don't break existing functionality

## Implementation Notes

- Use Electron Builder for comprehensive packaging with platform-specific configurations
- Implement Semantic Release for automated versioning and changelog generation
- Use GitHub Actions or similar CI/CD for automated building across platforms
- Store signing certificates securely using encrypted secrets or key management systems
- Implement build caching to reduce build times while maintaining security
- Use npm scripts and package.json for build configuration and task management
- Create separate development and production build configurations
- Implement proper error handling and logging throughout build processes
- Use ESBuild or similar for fast production builds with proper optimization
- Implement build artifact validation and integrity checking
- Create comprehensive build documentation with troubleshooting guides
- Use proper dependency management with lockfiles for reproducible builds

## Specification by Example

### Electron Builder Configuration
```json
{
  "build": {
    "appId": "com.kazari.app",
    "productName": "Kazari",
    "copyright": "Copyright © 2025 Kazari Team",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist-electron/**/*",
      "dist/**/*",
      "node_modules/**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!.editorconfig",
      "!**/._*",
      "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
      "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
      "!**/{appveyor.yml,.travis.yml,circle.yml}",
      "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "gatekeeperAssess": false,
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.ico",
      "requestedExecutionLevel": "asInvoker",
      "signAndEditExecutable": true
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build/installer-icon.ico",
      "uninstallerIcon": "build/uninstaller-icon.ico",
      "installerHeaderIcon": "build/installer-header-icon.ico"
    },
    "publish": {
      "provider": "github",
      "owner": "fredevery",
      "repo": "kazari"
    }
  }
}
```

### Build Scripts Configuration
```json
{
  "scripts": {
    "build": "npm run build:main && npm run build:renderer && npm run build:preload",
    "build:main": "tsc --project src/main/tsconfig.json",
    "build:renderer": "vite build",
    "build:preload": "tsc --project src/preload/tsconfig.json",
    "pack": "electron-builder --publish=never",
    "pack:all": "electron-builder -mwl --publish=never",
    "pack:win": "electron-builder --win --publish=never",
    "pack:mac": "electron-builder --mac --publish=never",
    "pack:linux": "electron-builder --linux --publish=never",
    "dist": "npm run build && electron-builder --publish=onTagOrDraft",
    "dist:all": "npm run build && electron-builder -mwl --publish=onTagOrDraft",
    "release": "semantic-release",
    "prebuild": "npm run clean && npm run type-check && npm run lint",
    "postpack": "npm run verify-build"
  }
}
```

### GitHub Actions Build Workflow
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'
  pull_request:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Build packages (macOS)
        if: matrix.os == 'macos-latest'
        run: npm run pack:mac
        env:
          CSC_LINK: ${{ secrets.MAC_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

      - name: Build packages (Windows)
        if: matrix.os == 'windows-latest'
        run: npm run pack:win
        env:
          CSC_LINK: ${{ secrets.WIN_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.WIN_CERTIFICATE_PASSWORD }}

      - name: Build packages (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: npm run pack:linux

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/

      - name: Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Semantic Release Configuration
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "npm run build && npm run pack:all"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": [
          {"path": "dist/*.dmg", "label": "macOS DMG"},
          {"path": "dist/*.pkg", "label": "macOS PKG"},
          {"path": "dist/*.exe", "label": "Windows Installer"},
          {"path": "dist/*.AppImage", "label": "Linux AppImage"},
          {"path": "dist/*.deb", "label": "Debian Package"}
        ]
      }
    ],
    "@semantic-release/git"
  ]
}
```

### Build Verification Script
```typescript
// scripts/verify-build.ts
import { existsSync, statSync, createHash } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface BuildArtifact {
  path: string;
  expectedSize: number;
  checksum?: string;
}

async function verifyBuild() {
  const artifacts: BuildArtifact[] = [
    { path: 'dist/Kazari-*.dmg', expectedSize: 50 * 1024 * 1024 }, // ~50MB
    { path: 'dist/Kazari-*.exe', expectedSize: 40 * 1024 * 1024 }, // ~40MB
    { path: 'dist/Kazari-*.AppImage', expectedSize: 45 * 1024 * 1024 } // ~45MB
  ];

  for (const artifact of artifacts) {
    try {
      const files = glob.sync(artifact.path);
      
      if (files.length === 0) {
        throw new Error(`No files found matching ${artifact.path}`);
      }

      for (const file of files) {
        // Check file exists and has reasonable size
        const stats = statSync(file);
        
        if (stats.size < artifact.expectedSize * 0.5) {
          throw new Error(`${file} is too small: ${stats.size} bytes`);
        }

        // Verify checksum if provided
        if (artifact.checksum) {
          const content = await readFile(file);
          const hash = createHash('sha256').update(content).digest('hex');
          
          if (hash !== artifact.checksum) {
            throw new Error(`Checksum mismatch for ${file}`);
          }
        }

        console.log('✅', file, 'verified');
      }
    } catch (error) {
      console.error('❌', artifact.path, error.message);
      process.exit(1);
    }
  }

  console.log('🎉 All build artifacts verified successfully!');
}

verifyBuild();
```

### Auto-Update Configuration
```typescript
// src/main/updater.ts
import { autoUpdater } from 'electron-updater';

export class UpdaterService {
  constructor() {
    // Configure auto-updater
    autoUpdater.checkForUpdatesAndNotify();
    
    // Set update server
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'fredevery',
      repo: 'kazari'
    });

    // Handle update events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded; will install on restart');
      autoUpdater.quitAndInstall();
    });
  }
}
```

### Platform-Specific Entitlements (macOS)
```xml
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
</dict>
</plist>
```
