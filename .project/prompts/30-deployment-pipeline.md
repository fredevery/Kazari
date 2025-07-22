# CI/CD Deployment Pipeline

_Establish a comprehensive CI/CD deployment pipeline for automated testing, building, and releasing the Kazari Electron application across multiple platforms with integrated test coverage, dependency management, and release automation._

## Requirements

- Set up GitHub Actions workflow for automated testing on pull requests and pushes to main branch
- Implement multi-platform build pipeline supporting macOS (x64, ARM64), Windows (x64, ia32), and Linux (x64) 
- Create automated test suite execution including unit tests, integration tests, and E2E tests with coverage reporting
- Establish semantic versioning with automated changelog generation and release notes
- Implement secure code signing infrastructure for trusted distribution on all target platforms
- Set up automated dependency updates with security vulnerability scanning and approval workflows
- Create deployment pipeline with staging and production environments supporting different release channels
- Implement build artifact management with checksums, integrity verification, and secure storage
- Set up notification systems for build failures, security alerts, and successful releases
- Create deployment rollback mechanisms and hotfix deployment procedures for critical issues

## Rules

- rules/build-configuration.md
- rules/electron-security.md
- rules/typescript-standards.md
- rules/error-handling.md
- rules/electron-main-process.md
- rules/ipc-communication.md

## Domain

```typescript
// CI/CD Pipeline Domain Model
interface DeploymentPipeline {
  id: string;
  name: string;
  triggers: PipelineTrigger[];
  stages: PipelineStage[];
  environment: DeploymentEnvironment;
  configuration: PipelineConfiguration;
}

interface PipelineTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  branches: string[];
  paths?: string[];
  schedule?: CronSchedule;
}

enum TriggerType {
  Push = 'push',
  PullRequest = 'pull_request',
  Schedule = 'schedule',
  ManualTrigger = 'workflow_dispatch',
  Release = 'release'
}

interface PipelineStage {
  name: string;
  type: StageType;
  dependsOn: string[];
  matrix?: BuildMatrix;
  steps: PipelineStep[];
  artifacts: Artifact[];
  timeoutMinutes: number;
}

enum StageType {
  Test = 'test',
  Build = 'build',
  Package = 'package',
  Deploy = 'deploy',
  Release = 'release'
}

interface BuildMatrix {
  os: OperatingSystem[];
  nodeVersion: string[];
  architecture: Architecture[];
}

enum OperatingSystem {
  Ubuntu = 'ubuntu-latest',
  Windows = 'windows-latest',
  MacOS = 'macos-latest'
}

interface PipelineStep {
  name: string;
  action: string;
  parameters: Record<string, any>;
  condition?: string;
  continueOnError: boolean;
  retryAttempts: number;
}

interface Artifact {
  name: string;
  path: string;
  retentionDays: number;
  uploadCondition?: string;
}

interface DeploymentEnvironment {
  name: string;
  type: EnvironmentType;
  approvalRequired: boolean;
  secrets: SecretConfiguration[];
  variables: EnvironmentVariable[];
}

enum EnvironmentType {
  Development = 'development',
  Staging = 'staging',
  Production = 'production'
}

interface ReleaseConfiguration {
  strategy: ReleaseStrategy;
  channels: ReleaseChannel[];
  versioning: VersioningStrategy;
  changelogGeneration: ChangelogConfig;
  assetManagement: AssetManagementConfig;
}

enum ReleaseStrategy {
  Semantic = 'semantic-release',
  Manual = 'manual',
  Scheduled = 'scheduled'
}

interface SecurityConfiguration {
  codeSigning: CodeSigningConfig;
  vulnerabilityScanning: VulnerabilityConfig;
  secretsManagement: SecretsConfig;
  accessControl: AccessControlConfig;
}
```

## Extra Considerations

- Pipeline must handle cross-platform builds with different architecture requirements and native dependencies
- Code signing certificates and notarization credentials require secure storage and rotation procedures
- Build times should be optimized through caching strategies and parallel execution where possible
- Test flakiness in E2E tests requires retry mechanisms and proper environment isolation
- Release channels (alpha, beta, stable) need different deployment strategies and user communication
- Build artifacts can be large (50-100MB per platform) requiring efficient storage and bandwidth management
- Security scanning must cover both source code and final packaged applications for compliance
- Dependency updates require careful testing to avoid breaking changes in production releases
- Network failures during builds require robust retry mechanisms and proper error handling
- Auto-update mechanism deployment needs coordination with backend infrastructure and CDN configuration
- Rollback procedures must be tested and documented for quick recovery from problematic releases
- Compliance requirements for different markets may affect build and distribution processes

## Testing Considerations

Unit tests must execute across all supported Node.js versions and operating systems with comprehensive coverage reporting. Integration tests should validate the complete build pipeline from source to packaged application. E2E tests must run against actual packaged applications in isolated environments. Security tests should validate code signing, certificate validity, and vulnerability scanning accuracy. Performance tests must validate build times, artifact sizes, and deployment speed under various conditions. Smoke tests should verify basic functionality of deployed applications before release promotion. Regression tests must ensure new pipeline changes don't break existing functionality. Load testing should validate artifact distribution and auto-update mechanisms under high demand scenarios.

## Implementation Notes

Use GitHub Actions with self-hosted runners for consistent cross-platform builds and secure certificate access. Implement matrix builds for efficient parallel execution across multiple OS and architecture combinations. Store build artifacts in secure cloud storage with proper access controls and retention policies. Use semantic-release for automated versioning with conventional commits and comprehensive changelog generation. Implement build caching using GitHub Actions cache and Docker layer caching for faster execution. Use encrypted secrets for code signing certificates with automated rotation and secure key management. Configure branch protection rules with required status checks and approval workflows for production deployments. Implement proper logging and monitoring for all pipeline stages with alerting for failures. Use infrastructure as code for reproducible deployment environments and configuration management. Create comprehensive documentation with troubleshooting guides and incident response procedures.

## Specification by Example

### GitHub Actions Workflow Structure
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
    paths-ignore: [ 'docs/**', '*.md' ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1' # Weekly dependency check
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type (patch, minor, major)'
        required: false
        default: 'patch'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Test Suite
    runs-on: ${{ matrix.os }}
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: ['18.x', '20.x']
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm run lint

      - name: Run type checking
        run: pnpm run type-check

      - name: Run unit tests
        run: pnpm run test:unit --coverage

      - name: Run integration tests
        run: pnpm run test:integration

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.os }}-${{ matrix.node-version }}
          path: |
            coverage/
            test-results/
          retention-days: 30
```

### Build and Package Workflow
```yaml
  build:
    name: Build Application
    needs: test
    runs-on: ${{ matrix.os }}
    timeout-minutes: 45
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            platform: linux
            arch: x64
          - os: windows-latest
            platform: win32
            arch: x64
          - os: windows-latest
            platform: win32
            arch: ia32
          - os: macos-latest
            platform: darwin
            arch: x64
          - os: macos-13 # Intel Mac for x64 builds
            platform: darwin
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: arm64

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build application
        run: pnpm run build
        env:
          NODE_ENV: production

      - name: Import Code Signing Certificate (macOS)
        if: matrix.platform == 'darwin'
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.APPLE_CERTIFICATE }}
          p12-password: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}

      - name: Import Code Signing Certificate (Windows)
        if: matrix.platform == 'win32'
        run: |
          echo "${{ secrets.WINDOWS_CERTIFICATE }}" | base64 -d > cert.p12
          certutil -f -importpfx cert.p12 -p "${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}"
        shell: bash

      - name: Package application
        run: pnpm run package:${{ matrix.platform }}
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_IDENTITY_AUTO_DISCOVERY: true

      - name: Notarize application (macOS)
        if: matrix.platform == 'darwin'
        run: pnpm run notarize
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: kazari-${{ matrix.platform }}-${{ matrix.arch }}
          path: |
            dist/*.dmg
            dist/*.pkg
            dist/*.exe
            dist/*.msi
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm
          retention-days: 30
```

### E2E Testing Workflow
```yaml
  e2e-test:
    name: End-to-End Tests
    needs: build
    runs-on: ${{ matrix.os }}
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: kazari-${{ matrix.os == 'ubuntu-latest' && 'linux' || matrix.os == 'windows-latest' && 'win32' || 'darwin' }}-x64
          path: dist/

      - name: Install E2E dependencies
        run: pnpm install --frozen-lockfile

      - name: Run E2E tests
        run: pnpm run test:e2e
        env:
          CI: true

      - name: Upload E2E test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-results-${{ matrix.os }}
          path: |
            test-results/
            screenshots/
            videos/
          retention-days: 7
```

### Security and Dependency Management
```yaml
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Check licenses
        run: pnpm run license-check

  dependency-update:
    name: Dependency Update Check
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'

      - name: Check for updates
        run: |
          npx npm-check-updates --upgrade --packageFile package.json
          npx npm-check-updates --upgrade --packageFile apps/desktop/package.json

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update dependencies'
          title: 'chore: automated dependency updates'
          body: |
            Automated dependency update created by GitHub Actions.
            
            Please review the changes and test thoroughly before merging.
          branch: automated-dependency-updates
```

### Release Automation
```yaml
  release:
    name: Release
    needs: [test, build, e2e-test, security-scan]
    runs-on: ubuntu-latest
    timeout-minutes: 30
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts/

      - name: Organize release assets
        run: |
          mkdir -p release-assets
          find artifacts/ -name "*.dmg" -o -name "*.pkg" -o -name "*.exe" -o -name "*.msi" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" | \
            xargs -I {} cp {} release-assets/

      - name: Generate checksums
        run: |
          cd release-assets
          for file in *; do
            sha256sum "$file" >> checksums.txt
          done

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm run release

      - name: Upload release assets
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/v')
        with:
          files: |
            release-assets/*
          generate_release_notes: true
          draft: false
          prerelease: false
```

### Semantic Release Configuration
```json
// .releaserc.json
{
  "branches": [
    "main",
    {
      "name": "develop",
      "prerelease": "beta"
    },
    {
      "name": "release/*",
      "prerelease": "rc"
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/npm",
      {
        "npmPublish": false
      }
    ],
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "npm run build && npm run package:all"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": [
          {
            "path": "release-assets/*.dmg",
            "label": "macOS DMG (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.pkg",
            "label": "macOS PKG (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.exe",
            "label": "Windows Installer (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.msi",
            "label": "Windows MSI (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.AppImage",
            "label": "Linux AppImage (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.deb",
            "label": "Debian Package (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/*.rpm",
            "label": "RPM Package (${nextRelease.gitTag})"
          },
          {
            "path": "release-assets/checksums.txt",
            "label": "Checksums"
          }
        ]
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json", "apps/desktop/package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

### Package.json Scripts Configuration
```json
{
  "scripts": {
    "build": "turbo run build",
    "package:win32": "electron-builder --win --x64 --ia32",
    "package:darwin": "electron-builder --mac --x64 --arm64",
    "package:linux": "electron-builder --linux --x64",
    "package:all": "electron-builder -mwl",
    "notarize": "electron-notarize --bundle-id com.kazari.app --apple-id $APPLE_ID --apple-id-password $APPLE_ID_PASSWORD --team-id $APPLE_TEAM_ID",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "license-check": "license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC'",
    "release": "semantic-release",
    "release:dry": "semantic-release --dry-run"
  }
}
```

### Build Verification and Monitoring
```typescript
// scripts/verify-deployment.ts
import { existsSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

interface DeploymentArtifact {
  name: string;
  path: string;
  platform: string;
  architecture: string;
  expectedMinSize: number;
  expectedMaxSize: number;
}

class DeploymentVerifier {
  private artifacts: DeploymentArtifact[] = [
    {
      name: 'macOS DMG x64',
      path: 'release-assets/Kazari-*-x64.dmg',
      platform: 'darwin',
      architecture: 'x64',
      expectedMinSize: 45 * 1024 * 1024,
      expectedMaxSize: 80 * 1024 * 1024
    },
    {
      name: 'Windows EXE x64', 
      path: 'release-assets/Kazari-Setup-*-x64.exe',
      platform: 'win32',
      architecture: 'x64',
      expectedMinSize: 40 * 1024 * 1024,
      expectedMaxSize: 75 * 1024 * 1024
    },
    {
      name: 'Linux AppImage x64',
      path: 'release-assets/Kazari-*-x64.AppImage',
      platform: 'linux',
      architecture: 'x64',
      expectedMinSize: 50 * 1024 * 1024,
      expectedMaxSize: 85 * 1024 * 1024
    }
  ];

  async verify(): Promise<boolean> {
    console.log('🔍 Verifying deployment artifacts...');
    
    let allVerified = true;

    for (const artifact of this.artifacts) {
      try {
        const verified = await this.verifyArtifact(artifact);
        if (!verified) {
          allVerified = false;
        }
      } catch (error) {
        console.error(`❌ Error verifying ${artifact.name}:`, error.message);
        allVerified = false;
      }
    }

    if (allVerified) {
      console.log('✅ All deployment artifacts verified successfully!');
      await this.generateManifest();
    } else {
      console.error('❌ Deployment verification failed!');
      process.exit(1);
    }

    return allVerified;
  }

  private async verifyArtifact(artifact: DeploymentArtifact): Promise<boolean> {
    const files = await glob(artifact.path);
    
    if (files.length === 0) {
      console.error(`❌ No files found matching ${artifact.path}`);
      return false;
    }

    for (const file of files) {
      const stats = statSync(file);
      
      // Check file size
      if (stats.size < artifact.expectedMinSize) {
        console.error(`❌ ${file} is too small: ${stats.size} bytes (expected >= ${artifact.expectedMinSize})`);
        return false;
      }
      
      if (stats.size > artifact.expectedMaxSize) {
        console.error(`❌ ${file} is too large: ${stats.size} bytes (expected <= ${artifact.expectedMaxSize})`);
        return false;
      }

      // Calculate checksum
      const content = await readFile(file);
      const checksum = createHash('sha256').update(content).digest('hex');
      
      console.log(`✅ ${artifact.name}: ${file}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   SHA256: ${checksum}`);
    }

    return true;
  }

  private async generateManifest(): Promise<void> {
    const manifest = {
      version: process.env.RELEASE_VERSION || 'unknown',
      buildId: process.env.GITHUB_RUN_ID || 'unknown',
      timestamp: new Date().toISOString(),
      artifacts: this.artifacts.map(artifact => ({
        name: artifact.name,
        platform: artifact.platform,
        architecture: artifact.architecture
      }))
    };

    await writeFile('release-assets/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('📋 Generated deployment manifest');
  }
}

new DeploymentVerifier().verify().catch(console.error);
```

## Verification

- [ ] GitHub Actions workflow triggers on push, pull request, and schedule events
- [ ] Multi-platform builds execute successfully for Windows, macOS, and Linux
- [ ] Unit tests, integration tests, and E2E tests run across all platforms with coverage reporting
- [ ] Code signing and notarization work correctly for macOS and Windows builds
- [ ] Security scanning detects vulnerabilities and blocks deployment when issues found
- [ ] Semantic release generates proper version numbers and changelog entries automatically
- [ ] Build artifacts are uploaded with checksums and integrity verification passes
- [ ] Dependency update automation creates pull requests for security updates
- [ ] Release deployment succeeds and applications install/run correctly on target platforms
- [ ] Rollback procedures documented and tested for critical issue recovery
- [ ] Pipeline monitoring and alerting notify team of failures and successful releases
- [ ] Auto-update mechanism works correctly with deployed releases and proper fallbacks
