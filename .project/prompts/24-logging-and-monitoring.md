# Logging and Monitoring

Implement a comprehensive logging and monitoring system for the Kazari desktop productivity application that provides visibility into application behavior, performance metrics, error tracking, and diagnostic information across both main and renderer processes. This system will enable effective debugging, performance optimization, and proactive issue resolution.

## Requirements

- Implement structured logging system with configurable log levels for main and renderer processes
- Create centralized error reporting and crash analytics with stack trace capture and symbolication
- Establish performance metrics collection for startup time, memory usage, CPU utilization, and timer precision
- Implement diagnostic information gathering including system specs, application state, and user actions
- Create log rotation and retention policies to manage disk space usage effectively
- Set up optional integration with external monitoring services (Sentry, LogRocket, DataDog)
- Implement privacy-compliant logging that excludes sensitive user data and respects user preferences
- Create monitoring dashboard for real-time application health and performance visualization
- Establish alerting system for critical errors, performance degradation, and unusual behavior patterns
- Document logging standards, monitoring procedures, and troubleshooting workflows for development teams

## Rules

- rules/error-handling.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/typescript-standards.md
- rules/electron-security.md
- rules/timer-precision.md
- rules/accessibility.md

## Domain

```typescript
// Logging and Monitoring Domain Model
interface LoggingService {
  id: string;
  name: string;
  level: LogLevel;
  outputs: LogOutput[];
  formatters: LogFormatter[];
  filters: LogFilter[];
}

enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context: LogContext;
  metadata: LogMetadata;
  stackTrace?: string;
}

interface LogContext {
  processType: ProcessType;
  processId: number;
  userId?: string;
  sessionId: string;
  component: string;
  action?: string;
  timerState?: TimerState;
}

interface LogMetadata {
  version: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  buildId: string;
  environment: Environment;
}

enum Environment {
  Development = 'development',
  Testing = 'testing',
  Staging = 'staging',
  Production = 'production'
}

interface MonitoringService {
  collectors: MetricCollector[];
  reporters: MetricReporter[];
  alertRules: AlertRule[];
  dashboards: MonitoringDashboard[];
}

interface MetricCollector {
  name: string;
  type: MetricType;
  interval: number;
  enabled: boolean;
  configuration: CollectorConfig;
}

enum MetricType {
  Counter = 'counter',
  Gauge = 'gauge',
  Histogram = 'histogram',
  Summary = 'summary'
}

interface ErrorReport {
  id: string;
  timestamp: number;
  error: ErrorInfo;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
  systemInfo: SystemInfo;
  userImpact: UserImpact;
}

interface ErrorInfo {
  name: string;
  message: string;
  stack: string;
  code?: string;
  severity: ErrorSeverity;
  fingerprint: string;
}

enum ErrorSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: MetricUnit;
  timestamp: number;
  tags: Record<string, string>;
  context: PerformanceContext;
}

interface DiagnosticInfo {
  systemSpecs: SystemSpecs;
  applicationState: ApplicationState;
  recentActions: UserAction[];
  performanceSnapshot: PerformanceSnapshot;
  configurationSettings: ConfigurationSettings;
}

interface MonitoringIntegration {
  provider: MonitoringProvider;
  configuration: IntegrationConfig;
  enabled: boolean;
  privacyCompliant: boolean;
}

enum MonitoringProvider {
  Sentry = 'sentry',
  LogRocket = 'logrocket',
  DataDog = 'datadog',
  NewRelic = 'newrelic',
  Custom = 'custom'
}
```

## Extra Considerations

- Electron applications require monitoring across multiple processes with different security contexts
- Log file management must balance detail level with disk space consumption on user devices
- Performance monitoring should not significantly impact application performance itself
- Privacy regulations (GDPR, CCPA) require careful handling of user data in logs and metrics
- Cross-platform logging paths and file permissions vary between Windows, macOS, and Linux
- Network connectivity issues may affect external monitoring service integration
- Long-running applications need log rotation to prevent unbounded disk usage
- Error reporting must handle both caught and uncaught exceptions across process boundaries
- Timer precision monitoring requires high-frequency sampling that could affect performance
- User consent and opt-out mechanisms are required for telemetry collection
- Development vs production logging needs require different configurations and detail levels
- Sensitive information (passwords, tokens, personal data) must be excluded from all logging

## Testing Considerations

- **Log Output Tests**: Verify correct log formatting, filtering, and routing to appropriate outputs
- **Error Capture Tests**: Ensure comprehensive error tracking across all process types and scenarios
- **Performance Impact Tests**: Measure logging overhead and ensure minimal application performance impact
- **Privacy Compliance Tests**: Validate that no sensitive user data appears in logs or telemetry
- **Log Rotation Tests**: Verify proper file rotation, compression, and cleanup of old log files
- **External Integration Tests**: Test connectivity and data transmission to monitoring services
- **Cross-Platform Tests**: Ensure consistent logging behavior across Windows, macOS, and Linux
- **Volume Tests**: Test logging system under high-frequency event scenarios
- **Recovery Tests**: Verify logging system recovery from disk full, network issues, or service outages
- **Configuration Tests**: Validate dynamic log level changes and configuration reloading

## Implementation Notes

- Use Winston or Pino for structured logging with JSON output format
- Implement correlation IDs to trace requests across process boundaries
- Use Electron's crash reporter for native crash detection and reporting
- Create custom log transports for file rotation, compression, and network transmission
- Implement sampling strategies for high-frequency events to reduce overhead
- Use secure transmission (HTTPS/TLS) for external monitoring service integration
- Create log aggregation and search capabilities for development and debugging
- Implement proper error boundaries in React components for renderer process error capture
- Use TypeScript strict mode and proper typing for all logging interfaces
- Create monitoring configuration that can be updated without application restart
- Implement graceful degradation when external monitoring services are unavailable
- Use proper authentication and API key management for external service integrations

## Specification by Example

### Logging Service Implementation
```typescript
// src/services/LoggingService.ts
import winston from 'winston';
import { format } from 'winston';

export class LoggingService {
  private logger: winston.Logger;
  private correlationId: string;

  constructor(processType: ProcessType) {
    this.correlationId = this.generateCorrelationId();
    
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(this.formatLogEntry.bind(this))
      ),
      defaultMeta: {
        service: 'kazari',
        processType,
        processId: process.pid,
        correlationId: this.correlationId,
        version: process.env.npm_package_version
      },
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        new winston.transports.File({
          filename: this.getLogPath('error.log'),
          level: 'error',
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        new winston.transports.File({
          filename: this.getLogPath('combined.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 10,
          tailable: true
        })
      ]
    });
  }

  private formatLogEntry(info: any): string {
    const { timestamp, level, message, ...meta } = info;
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      correlationId: this.correlationId,
      ...this.sanitizeMetadata(meta)
    });
  }

  private sanitizeMetadata(meta: any): any {
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret'];
    const sanitized = { ...meta };
    
    sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, { error: error?.stack || error, ...meta });
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }
}
```

### Error Reporting Service
```typescript
// src/services/ErrorReportingService.ts
import * as Sentry from '@sentry/electron';

export class ErrorReportingService {
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 50;

  constructor() {
    this.initializeSentry();
    this.setupGlobalErrorHandlers();
  }

  private initializeSentry(): void {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version,
        beforeSend: this.sanitizeErrorData.bind(this),
        integrations: [
          new Sentry.Integrations.MainThreadCrashIntegration({
            globalHook: false
          })
        ]
      });
    }
  }

  private setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.captureError(error, {
        level: ErrorSeverity.Critical,
        context: { type: 'uncaughtException' }
      });
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.captureError(new Error(`Unhandled Rejection: ${reason}`), {
        level: ErrorSeverity.High,
        context: { type: 'unhandledRejection', promise }
      });
    });
  }

  captureError(error: Error, options?: ErrorCaptureOptions): string {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack || '',
        severity: options?.level || ErrorSeverity.Medium,
        fingerprint: this.generateFingerprint(error)
      },
      context: {
        processType: process.type as ProcessType,
        userId: options?.userId,
        sessionId: this.getSessionId(),
        ...options?.context
      },
      breadcrumbs: [...this.breadcrumbs],
      systemInfo: this.getSystemInfo(),
      userImpact: this.assessUserImpact(error)
    };

    // Send to external service if available
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: options?.tags,
        extra: options?.context
      });
    }

    // Log locally
    logger.error('Error captured', errorReport);

    return errorReport.id;
  }

  addBreadcrumb(message: string, category: string, data?: any): void {
    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      message,
      category,
      data: this.sanitizeData(data),
      level: 'info'
    };

    this.breadcrumbs.push(breadcrumb);
    
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }

    // Also add to Sentry
    Sentry.addBreadcrumb(breadcrumb);
  }

  private sanitizeErrorData(event: Sentry.Event): Sentry.Event | null {
    // Remove sensitive information from error reports
    if (event.extra) {
      event.extra = this.sanitizeData(event.extra);
    }
    
    // Check user consent for error reporting
    if (!this.hasUserConsent()) {
      return null;
    }

    return event;
  }
}
```

### Performance Monitoring Service
```typescript
// src/services/PerformanceMonitoringService.ts
export class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private collectors: MetricCollector[] = [];

  constructor() {
    this.setupDefaultCollectors();
    this.startCollection();
  }

  private setupDefaultCollectors(): void {
    // Memory usage collector
    this.collectors.push({
      name: 'memory',
      type: MetricType.Gauge,
      interval: 30000, // 30 seconds
      enabled: true,
      collect: this.collectMemoryMetrics.bind(this)
    });

    // CPU usage collector
    this.collectors.push({
      name: 'cpu',
      type: MetricType.Gauge,
      interval: 10000, // 10 seconds
      enabled: true,
      collect: this.collectCpuMetrics.bind(this)
    });

    // Timer precision collector
    this.collectors.push({
      name: 'timer_precision',
      type: MetricType.Histogram,
      interval: 5000, // 5 seconds
      enabled: true,
      collect: this.collectTimerMetrics.bind(this)
    });
  }

  private async collectMemoryMetrics(): Promise<PerformanceMetric[]> {
    const memoryUsage = process.memoryUsage();
    const processMetrics = process.getProcessMemoryInfo 
      ? await process.getProcessMemoryInfo()
      : null;

    return [
      {
        name: 'memory.heap_used',
        value: memoryUsage.heapUsed,
        unit: MetricUnit.Bytes,
        timestamp: Date.now(),
        tags: { process: process.type },
        context: { processType: process.type as ProcessType }
      },
      {
        name: 'memory.heap_total',
        value: memoryUsage.heapTotal,
        unit: MetricUnit.Bytes,
        timestamp: Date.now(),
        tags: { process: process.type },
        context: { processType: process.type as ProcessType }
      },
      {
        name: 'memory.rss',
        value: memoryUsage.rss,
        unit: MetricUnit.Bytes,
        timestamp: Date.now(),
        tags: { process: process.type },
        context: { processType: process.type as ProcessType }
      }
    ];
  }

  recordMetric(name: string, value: number, unit: MetricUnit, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags: tags || {},
      context: {
        processType: process.type as ProcessType,
        processId: process.pid
      }
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per name
    if (metrics.length > 1000) {
      metrics.shift();
    }

    // Send to external monitoring service
    this.sendToExternalService(metric);
  }

  private sendToExternalService(metric: PerformanceMetric): void {
    // Implementation for sending to DataDog, New Relic, etc.
    if (process.env.DATADOG_API_KEY && process.env.NODE_ENV === 'production') {
      // Send to DataDog
      this.sendToDataDog(metric);
    }
  }
}
```

### Diagnostic Information Collector
```typescript
// src/services/DiagnosticsService.ts
export class DiagnosticsService {
  async collectDiagnosticInfo(): Promise<DiagnosticInfo> {
    return {
      systemSpecs: await this.getSystemSpecs(),
      applicationState: this.getApplicationState(),
      recentActions: this.getRecentActions(),
      performanceSnapshot: await this.getPerformanceSnapshot(),
      configurationSettings: this.getConfigurationSettings()
    };
  }

  private async getSystemSpecs(): Promise<SystemSpecs> {
    const os = require('os');
    
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron || '',
      chromiumVersion: process.versions.chrome || '',
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      uptime: os.uptime(),
      userInfo: {
        username: os.userInfo().username,
        homedir: os.userInfo().homedir
      }
    };
  }

  private getApplicationState(): ApplicationState {
    // Get current application state
    return {
      currentPhase: timerService.getCurrentPhase(),
      timerState: timerService.getState(),
      windowStates: windowManager.getAllWindowStates(),
      taskCount: taskService.getTaskCount(),
      sessionCount: sessionService.getSessionCount(),
      settingsVersion: settingsService.getVersion()
    };
  }

  exportDiagnostics(): string {
    const diagnostics = this.collectDiagnosticInfo();
    
    // Sanitize sensitive information
    const sanitizedDiagnostics = this.sanitizeDiagnostics(diagnostics);
    
    return JSON.stringify(sanitizedDiagnostics, null, 2);
  }

  private sanitizeDiagnostics(diagnostics: DiagnosticInfo): DiagnosticInfo {
    // Remove or mask sensitive information
    const sanitized = JSON.parse(JSON.stringify(diagnostics));
    
    // Remove full file paths, keep only filenames
    if (sanitized.systemSpecs?.userInfo?.homedir) {
      sanitized.systemSpecs.userInfo.homedir = '[REDACTED]';
    }
    
    return sanitized;
  }
}
```

### Monitoring Configuration
```json
{
  "monitoring": {
    "logging": {
      "level": "info",
      "maxFileSize": "10MB",
      "maxFiles": 10,
      "rotateOnStartup": true,
      "excludePatterns": [
        "password",
        "token",
        "apiKey",
        "secret"
      ]
    },
    "errorReporting": {
      "enabled": true,
      "requireUserConsent": true,
      "samplingRate": 1.0,
      "attachStackTraces": true,
      "attachBreadcrumbs": true
    },
    "performance": {
      "collectMetrics": true,
      "samplingRate": 0.1,
      "metricsInterval": 30000,
      "maxMetricsHistory": 1000
    },
    "external": {
      "sentry": {
        "enabled": true,
        "environment": "production",
        "beforeSend": "sanitize"
      },
      "datadog": {
        "enabled": false,
        "tags": {
          "service": "kazari",
          "version": "1.0.0"
        }
      }
    },
    "privacy": {
      "requireConsent": true,
      "allowOptOut": true,
      "dataRetention": "30d",
      "anonymizeIpAddresses": true
    }
  }
}
```
