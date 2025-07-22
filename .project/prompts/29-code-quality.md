# Code Quality Standards and Process

_Establish comprehensive code quality standards and processes for the Kazari Electron application using Biome and project-specific coding guidelines to ensure all code is reviewed, tested, and meets maintainability requirements across all processes (main, preload, and renderer)._

## Requirements

- Configure Biome as the primary tool for code formatting, linting, and static analysis across TypeScript codebase
- Establish comprehensive code review process with mandatory peer reviews and quality gates
- Implement automated code quality checks in CI/CD pipeline with coverage thresholds and performance budgets
- Define maintainability standards with complexity metrics, technical debt tracking, and documentation requirements
- Create pre-commit hooks for automated formatting, linting, and basic quality validation
- Establish testing standards with minimum coverage requirements and comprehensive test categorization
- Document code quality guidelines with examples, anti-patterns, and decision frameworks
- Implement quality monitoring with metrics collection, trend analysis, and automated reporting
- Create code style guide specific to Electron architecture and TypeScript best practices
- Establish technical debt management process with regular audits and remediation planning

## Rules

- rules/typescript-standards.md
- rules/build-configuration.md
- rules/electron-security.md
- rules/ipc-communication.md
- rules/error-handling.md
- rules/state-management.md
- rules/accessibility.md
- rules/timer-precision.md
- rules/notification-system.md
- rules/hexagonal-architecture.md
- rules/domain-driven-design-rules.md

## Domain

```typescript
// Code Quality Domain Model
interface CodeQualityMetrics {
  id: string;
  timestamp: number;
  projectPath: string;
  metrics: QualityMetrics;
  thresholds: QualityThresholds;
  violations: QualityViolation[];
  status: QualityStatus;
}

interface QualityMetrics {
  coverage: CoverageMetrics;
  complexity: ComplexityMetrics;
  maintainability: MaintainabilityMetrics;
  security: SecurityMetrics;
  performance: PerformanceMetrics;
  techDebt: TechnicalDebtMetrics;
}

interface CoverageMetrics {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  threshold: CoverageThreshold;
  uncoveredFiles: string[];
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  halsteadVolume: number;
  linesOfCode: number;
  duplicatedLines: number;
}

interface QualityThresholds {
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  complexity: {
    maxCyclomatic: number;
    maxCognitive: number;
    maxFileLength: number;
    maxFunctionLength: number;
  };
  maintainability: {
    minMaintainabilityIndex: number;
    maxTechnicalDebt: number;
  };
}

interface QualityViolation {
  id: string;
  type: ViolationType;
  severity: Severity;
  file: string;
  line: number;
  column: number;
  message: string;
  rule: string;
  fixable: boolean;
}

enum ViolationType {
  Style = 'style',
  Bug = 'bug',
  Security = 'security',
  Performance = 'performance',
  Maintainability = 'maintainability',
  Accessibility = 'accessibility'
}

enum Severity {
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}

interface CodeReviewProcess {
  pullRequestId: string;
  author: string;
  reviewers: Reviewer[];
  qualityGates: QualityGate[];
  automatedChecks: AutomatedCheck[];
  status: ReviewStatus;
  approvals: ReviewApproval[];
}

interface QualityGate {
  name: string;
  type: GateType;
  status: GateStatus;
  metrics: QualityMetrics;
  blocker: boolean;
}

enum GateType {
  Coverage = 'coverage',
  Complexity = 'complexity',
  Security = 'security',
  Performance = 'performance',
  Documentation = 'documentation'
}
```

## Extra Considerations

- Biome configuration must be consistent across development, CI/CD, and editor environments
- Code quality standards should be balanced to avoid hindering development velocity while maintaining high standards
- Quality metrics collection should not significantly impact build times or development workflow performance
- Integration with VS Code and other IDEs should provide real-time feedback and auto-fixing capabilities
- Quality thresholds should be adjustable per module/component based on criticality and complexity
- Historical quality trends should be tracked to identify regressions and improvement opportunities
- Code quality documentation should be easily discoverable and regularly updated with examples
- Quality gates should fail fast in CI/CD pipeline to provide quick feedback to developers
- Integration with external security scanning and dependency vulnerability checking tools
- Support for gradual quality improvement through quality debt tracking and remediation planning

## Testing Considerations

- Unit tests for code quality rule configurations and custom rules implementation
- Integration tests for Biome configuration across different file types and project structures
- Performance tests for quality checking tools to ensure acceptable build and CI/CD times
- Testing quality gate implementations with various code quality scenarios and edge cases
- Validation testing for quality metrics accuracy and consistency across different environments
- Testing pre-commit hooks functionality across different operating systems and Git workflows
- End-to-end testing of code review process automation and quality gate enforcement
- Testing quality reporting and dashboard functionality with realistic code quality data
- Accessibility testing of quality reporting interfaces and developer tooling
- Load testing of quality checking infrastructure under high development team activity

## Implementation Notes

- Use Biome as unified toolchain for formatting, linting, and import sorting to reduce tooling complexity
- Configure Biome with project-specific rules that align with Electron architecture patterns
- Implement quality gates in GitHub Actions/CI pipeline with proper caching for performance
- Create VS Code workspace settings that automatically apply quality tools on save
- Use husky and lint-staged for pre-commit quality validation without blocking development flow
- Implement custom ESLint rules for Electron-specific patterns and security requirements
- Create quality monitoring dashboard using tools like SonarQube or CodeClimate integration
- Use TypeScript strict mode configuration that aligns with overall code quality standards
- Implement automated dependency vulnerability scanning and license compliance checking
- Create code quality documentation generator that syncs with actual rule configurations
- Use proper error handling and logging in quality checking scripts and CI/CD integrations
- Implement quality metrics collection that integrates with project management and planning tools

## Specification by Example

### Biome Configuration

```json
// biome.json - Main configuration for code quality
{
  "$schema": "https://biomejs.dev/schemas/1.4.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "noNonNullAssertion": "error",
        "useImportType": "error",
        "useExportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noEmptyInterface": "error",
        "noConfusingVoidType": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useHookAtTopLevel": "error"
      },
      "complexity": {
        "noForEach": "warn",
        "useLiteralKeys": "error"
      },
      "security": {
        "noDangerouslySetInnerHtml": "error"
      },
      "nursery": {
        "useSortedClasses": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingComma": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "bracketSameLine": false,
      "quoteStyle": "single"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "files": {
    "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.{js,ts}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}"
    ]
  },
  "overrides": [
    {
      "include": ["src/main/**/*.ts"],
      "linter": {
        "rules": {
          "style": {
            "useNodejsImportProtocol": "error"
          }
        }
      }
    },
    {
      "include": ["src/renderer/**/*.{ts,tsx}"],
      "linter": {
        "rules": {
          "a11y": {
            "recommended": true
          }
        }
      }
    }
  ]
}
```

### Quality Gate Configuration

```typescript
// scripts/quality-gates.ts
interface QualityGateConfig {
  coverage: {
    statements: 80;
    branches: 75;
    functions: 80;
    lines: 80;
  };
  complexity: {
    maxCyclomatic: 10;
    maxCognitive: 15;
    maxFileLength: 300;
    maxFunctionLength: 50;
  };
  performance: {
    maxBuildTime: 120; // seconds
    maxBundleSize: 5; // MB
  };
  security: {
    allowedVulnerabilities: 0;
    maxDependencyAge: 365; // days
  };
}

async function runQualityGates() {
  const results = await Promise.all([
    checkCodeCoverage(),
    checkComplexityMetrics(),
    checkSecurityVulnerabilities(),
    checkBundleSize(),
    checkTypeScriptErrors()
  ]);

  const failedGates = results.filter(result => !result.passed);
  
  if (failedGates.length > 0) {
    console.error('Quality gates failed:', failedGates);
    process.exit(1);
  }
  
  console.log('✅ All quality gates passed');
}
```

### Pre-commit Hook Configuration

```json
// package.json
{
  "scripts": {
    "quality:check": "biome check .",
    "quality:fix": "biome check --apply .",
    "quality:format": "biome format --write .",
    "quality:lint": "biome lint .",
    "quality:ci": "biome ci .",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit --project tsconfig.json",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --apply --no-errors-on-unmatched",
      "biome format --write --no-errors-on-unmatched"
    ],
    "*.{json,md}": [
      "biome format --write --no-errors-on-unmatched"
    ]
  }
}
```

### CI/CD Quality Pipeline

```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Type Check
        run: npm run type-check
      
      - name: Code Quality Check
        run: npm run quality:ci
      
      - name: Run Tests with Coverage
        run: npm run test:coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
      
      - name: Security Audit
        run: npm audit --audit-level=moderate
      
      - name: Bundle Size Check
        run: npm run build && npm run bundle-size:check
```

### Quality Metrics Dashboard

```typescript
// src/quality/metrics.ts
export class QualityMetricsCollector {
  async collectMetrics(): Promise<QualityMetrics> {
    return {
      coverage: await this.getCoverageMetrics(),
      complexity: await this.getComplexityMetrics(),
      maintainability: await this.getMaintainabilityMetrics(),
      security: await this.getSecurityMetrics(),
      performance: await this.getPerformanceMetrics(),
      techDebt: await this.getTechnicalDebtMetrics()
    };
  }

  private async getCoverageMetrics(): Promise<CoverageMetrics> {
    // Implementation using Jest coverage reports
  }

  private async getComplexityMetrics(): Promise<ComplexityMetrics> {
    // Implementation using TypeScript AST analysis
  }
}
```

### Code Review Guidelines

```markdown
# Code Review Checklist

## Functionality
- [ ] Code accomplishes its intended purpose
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive and user-friendly

## Code Quality
- [ ] Code follows project style guidelines (Biome rules)
- [ ] Functions are single-purpose and reasonably sized
- [ ] Variable and function names are descriptive
- [ ] Complex logic is commented and documented

## Performance
- [ ] No obvious performance bottlenecks
- [ ] Memory leaks are prevented
- [ ] Database queries are optimized (if applicable)

## Security
- [ ] No security vulnerabilities introduced
- [ ] User input is properly validated and sanitized
- [ ] Sensitive data is handled securely

## Testing
- [ ] New functionality has appropriate test coverage
- [ ] Tests are meaningful and test the right things
- [ ] Tests are maintainable and readable

## Documentation
- [ ] Public APIs are documented
- [ ] Complex algorithms are explained
- [ ] README or docs are updated if needed
```

## Verification

- [ ] Biome is configured and enforced across all TypeScript/JavaScript files with consistent formatting
- [ ] Quality gates are implemented in CI/CD pipeline and block merging of substandard code
- [ ] Code coverage thresholds are met with comprehensive test suite across all modules
- [ ] Pre-commit hooks prevent committing of unformatted or low-quality code
- [ ] Code review process is documented and consistently followed by all team members
- [ ] Quality metrics are collected, monitored, and used for continuous improvement decisions
- [ ] Technical debt is tracked, prioritized, and systematically addressed in development cycles
- [ ] Security vulnerabilities are automatically detected and prevent deployment
- [ ] Performance regressions are caught by automated quality gates and monitoring
- [ ] Documentation quality standards are enforced with examples and up-to-date guidelines
- [ ] Quality tooling integrates seamlessly with development workflow and IDE experience
- [ ] Quality standards are balanced to maintain developer productivity while ensuring code excellence
- [ ] Historical quality trends show continuous improvement and reduced technical debt over time
- [ ] All team members understand and can execute the code quality process independently
- [ ] Quality standards scale appropriately as the codebase and team grow over time
