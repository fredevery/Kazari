# Electron Security Implementation

_Implement comprehensive security measures for the Kazari Electron application following security best practices, including Electron fuses, process sandboxing, minimal Node.js integration, secure IPC validation, encrypted data storage, and preparation for remote content and module sandboxes to protect against XSS, code injection, and unauthorized system access._

## Requirements

- Configure Electron fuses to disable insecure features and enable security-focused build options
- Implement process sandboxing with context isolation for all renderer processes
- Minimize Node.js integration in renderer processes using secure contextBridge patterns
- Create comprehensive IPC channel validation with input sanitization and rate limiting
- Implement secure storage for sensitive data including user preferences, session tokens, and configuration
- Set up Content Security Policy (CSP) headers and security headers for all renderer content
- Prepare infrastructure for remote content loading with proper security controls
- Implement module sandboxes to isolate third-party code execution
- Add security monitoring and logging for suspicious activities and security events
- Create security testing framework with automated vulnerability scanning and penetration testing

## Rules

- rules/electron-security.md
- rules/ipc-communication.md
- rules/error-handling.md
- rules/typescript-standards.md
- rules/build-configuration.md
- rules/accessibility.md

## Domain

```typescript
// Security configuration types
interface ElectronSecurityConfig {
  fuses: ElectronFuseConfig;
  sandboxing: SandboxConfig;
  contextIsolation: ContextIsolationConfig;
  contentSecurity: ContentSecurityConfig;
  dataProtection: DataProtectionConfig;
  ipcSecurity: IPCSecurityConfig;
}

interface ElectronFuseConfig {
  version: string;
  resetAdHocDarwinCA: boolean;
  resetWinCertificateStore: boolean;
  enableCookieEncryption: boolean;
  enableNodeOptionsEnvironmentVariable: boolean;
  enableNodeCliInspectArguments: boolean;
  enableEmbeddedAsarIntegrityValidation: boolean;
  onlyLoadAppFromAsar: boolean;
  loadBrowserProcessSpecificV8Snapshot: boolean;
}

interface SandboxConfig {
  enabled: boolean;
  allowedPermissions: SandboxPermission[];
  restrictedAPIs: string[];
  secureDefaults: boolean;
}

interface ContextIsolationConfig {
  enabled: boolean;
  exposedAPIs: ExposedAPI[];
  validationRules: ValidationRule[];
}

interface ContentSecurityConfig {
  csp: CSPDirectives;
  securityHeaders: SecurityHeaders;
  resourceIntegrity: boolean;
  trustedOrigins: string[];
}

interface DataProtectionConfig {
  encryption: EncryptionConfig;
  keyManagement: KeyManagementConfig;
  secureStorage: SecureStorageConfig;
  sensitiveDataTypes: SensitiveDataType[];
}

interface IPCSecurityConfig {
  channelWhitelist: string[];
  validationSchemas: Record<string, ValidationSchema>;
  rateLimiting: RateLimitConfig;
  auditLogging: AuditConfig;
}

// Security validation types
interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  sanitizer?: (value: any) => any;
  validator?: (value: any) => boolean;
  maxLength?: number;
  allowedValues?: any[];
}

interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: 'main' | 'renderer' | 'preload';
  details: SecurityEventDetails;
  userId?: string;
  sessionId?: string;
}

type SecurityEventType = 
  | 'IPC_VALIDATION_FAILED'
  | 'UNAUTHORIZED_API_ACCESS'
  | 'SUSPICIOUS_ACTIVITY_DETECTED'
  | 'CSP_VIOLATION'
  | 'INSECURE_CONTENT_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ENCRYPTION_ERROR'
  | 'AUTHENTICATION_FAILURE';

// Secure storage interfaces
interface SecureStorageProvider {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(encryptedData: string, key: string): Promise<string>;
  store(key: string, value: any): Promise<void>;
  retrieve<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface EncryptionProvider {
  generateKey(): Promise<string>;
  encryptData(data: any, key: string): Promise<EncryptedData>;
  decryptData(encryptedData: EncryptedData, key: string): Promise<any>;
  hashPassword(password: string, salt: string): Promise<string>;
  generateSalt(): string;
}
```

## Extra Considerations

- Security measures must not significantly impact application performance or user experience
- Security configuration should be environment-aware (development vs production settings)
- Remote content loading security must be balanced with functionality requirements
- Security logging should not expose sensitive user data in logs
- Encryption keys must be managed securely and rotated periodically
- Security measures should work consistently across all supported platforms
- Consider GDPR and privacy compliance when implementing data protection measures
- Security updates should be deployable without requiring full application updates
- Third-party dependencies must be regularly audited for security vulnerabilities
- Security measures should gracefully degrade rather than break application functionality

## Testing Considerations

- Automated security testing with tools like Electronegativity and npm audit
- Penetration testing for IPC channels and exposed APIs
- Security regression testing after configuration changes
- Load testing of rate limiting and validation systems
- Cross-platform security testing to ensure consistent protection
- User acceptance testing to ensure security measures don't impact usability
- Testing of encryption/decryption performance and key management
- Vulnerability scanning of packaged applications
- Testing of CSP policies and security headers effectiveness
- Social engineering and phishing simulation tests

## Implementation Notes

- Use Electron's built-in security features as the foundation layer
- Implement defense-in-depth with multiple validation layers
- Use established cryptographic libraries rather than rolling custom encryption
- Create security utilities that can be reused across different parts of the application
- Implement proper error handling that doesn't leak sensitive information
- Use TypeScript for type safety in security-critical code
- Document all security configurations and their rationale
- Implement security monitoring that can detect and respond to threats
- Use secure coding practices and regular security code reviews
- Plan for security incident response and recovery procedures

## Specification by Example

### Electron Fuses Configuration
```typescript
// forge.config.ts - Electron Forge configuration with fuses
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: true,
      [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
    }),
  ],
};

export default config;
```

### Secure BrowserWindow Configuration
```typescript
// src/main/window-manager.ts - Secure window configuration
import { BrowserWindow, session } from 'electron';
import { join } from 'path';

export class SecureWindowManager {
  createMainWindow(): BrowserWindow {
    // Configure session security
    this.configureSessionSecurity();

    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        // Critical security settings
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        
        // Preload script for secure API exposure
        preload: join(__dirname, '../preload/preload.js'),
        
        // Additional security settings
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        enableBlinkFeatures: '',
        disableBlinkFeatures: '',
        
        // Content security
        webSecurity: true,
        additionalArguments: [
          '--disable-web-security=false',
          '--disable-features=VizDisplayCompositor'
        ]
      }
    });

    // Set up Content Security Policy
    this.setupContentSecurityPolicy(mainWindow);
    
    // Set up security event handlers
    this.setupSecurityEventHandlers(mainWindow);

    return mainWindow;
  }

  private configureSessionSecurity(): void {
    const defaultSession = session.defaultSession;

    // Set security headers
    defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = {
        ...details.responseHeaders,
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block'],
        'Strict-Transport-Security': ['max-age=31536000; includeSubDomains'],
        'Referrer-Policy': ['strict-origin-when-cross-origin']
      };

      callback({ responseHeaders });
    });

    // Block insecure content
    defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url);
      
      // Block non-HTTPS requests (except for local development)
      if (url.protocol === 'http:' && !url.hostname.includes('localhost')) {
        this.securityLogger.logEvent({
          type: 'INSECURE_CONTENT_BLOCKED',
          severity: 'medium',
          details: { url: details.url },
          timestamp: new Date(),
          source: 'main'
        });
        callback({ cancel: true });
        return;
      }

      callback({ cancel: false });
    });
  }

  private setupContentSecurityPolicy(window: BrowserWindow): void {
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "media-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspHeader]
        }
      });
    });
  }
}
```

### Secure Preload Script
```typescript
// src/preload/preload.ts - Secure API exposure
import { contextBridge, ipcRenderer } from 'electron';
import { SecurityValidator } from './security-validator';
import { IPCRateLimiter } from './ipc-rate-limiter';

interface SecureElectronAPI {
  // Timer operations with validation
  timer: {
    start(sessionId: string): Promise<TimerState>;
    pause(timerId: string): Promise<TimerState>;
    resume(timerId: string): Promise<TimerState>;
    configure(timerId: string, config: TimerConfig): Promise<TimerState>;
  };
  
  // Task operations with validation
  tasks: {
    create(taskData: CreateTaskRequest): Promise<Task>;
    update(id: string, updates: UpdateTaskRequest): Promise<Task>;
    delete(id: string): Promise<{ success: boolean }>;
    list(filters?: TaskFilters): Promise<Task[]>;
  };
  
  // Secure event handling
  events: {
    on(channel: string, callback: (data: any) => void): () => void;
    removeAllListeners(channel: string): void;
  };
  
  // Security utilities
  security: {
    validateInput(data: any, schema: ValidationSchema): boolean;
    sanitizeInput(data: any): any;
  };
}

class SecurePreloadAPI {
  private validator = new SecurityValidator();
  private rateLimiter = new IPCRateLimiter();
  private securityLogger = new SecurityLogger();

  constructor() {
    this.exposeSecureAPI();
  }

  private exposeSecureAPI(): void {
    const secureAPI: SecureElectronAPI = {
      timer: {
        start: this.createSecureHandler('timer:start', (sessionId: string) => {
          // Validate session ID
          if (!this.validator.isValidSessionId(sessionId)) {
            throw new Error('Invalid session ID format');
          }
          return { sessionId };
        }),
        
        pause: this.createSecureHandler('timer:pause', (timerId: string) => {
          if (!this.validator.isValidTimerId(timerId)) {
            throw new Error('Invalid timer ID format');
          }
          return { timerId };
        }),

        resume: this.createSecureHandler('timer:resume', (timerId: string) => {
          if (!this.validator.isValidTimerId(timerId)) {
            throw new Error('Invalid timer ID format');
          }
          return { timerId };
        }),

        configure: this.createSecureHandler('timer:configure', (timerId: string, config: TimerConfig) => {
          if (!this.validator.isValidTimerId(timerId)) {
            throw new Error('Invalid timer ID format');
          }
          if (!this.validator.isValidTimerConfig(config)) {
            throw new Error('Invalid timer configuration');
          }
          return { timerId, config: this.validator.sanitizeTimerConfig(config) };
        })
      },

      tasks: {
        create: this.createSecureHandler('task:create', (taskData: CreateTaskRequest) => {
          if (!this.validator.isValidTaskData(taskData)) {
            throw new Error('Invalid task data');
          }
          return this.validator.sanitizeTaskData(taskData);
        }),

        update: this.createSecureHandler('task:update', (id: string, updates: UpdateTaskRequest) => {
          if (!this.validator.isValidTaskId(id)) {
            throw new Error('Invalid task ID format');
          }
          if (!this.validator.isValidTaskUpdates(updates)) {
            throw new Error('Invalid task updates');
          }
          return { id, updates: this.validator.sanitizeTaskUpdates(updates) };
        }),

        delete: this.createSecureHandler('task:delete', (id: string) => {
          if (!this.validator.isValidTaskId(id)) {
            throw new Error('Invalid task ID format');
          }
          return { id };
        }),

        list: this.createSecureHandler('task:list', (filters?: TaskFilters) => {
          if (filters && !this.validator.isValidTaskFilters(filters)) {
            throw new Error('Invalid task filters');
          }
          return { filters: filters ? this.validator.sanitizeTaskFilters(filters) : undefined };
        })
      },

      events: {
        on: (channel: string, callback: (data: any) => void) => {
          if (!this.validator.isValidEventChannel(channel)) {
            throw new Error(`Invalid event channel: ${channel}`);
          }

          const secureCallback = (data: any) => {
            // Validate and sanitize event data
            const sanitizedData = this.validator.sanitizeEventData(channel, data);
            callback(sanitizedData);
          };

          ipcRenderer.on(channel, (event, data) => secureCallback(data));
          
          // Return unsubscribe function
          return () => {
            ipcRenderer.removeListener(channel, secureCallback);
          };
        },

        removeAllListeners: (channel: string) => {
          if (!this.validator.isValidEventChannel(channel)) {
            throw new Error(`Invalid event channel: ${channel}`);
          }
          ipcRenderer.removeAllListeners(channel);
        }
      },

      security: {
        validateInput: (data: any, schema: ValidationSchema) => {
          return this.validator.validate(data, schema);
        },

        sanitizeInput: (data: any) => {
          return this.validator.sanitizeGeneric(data);
        }
      }
    };

    contextBridge.exposeInMainWorld('electronAPI', secureAPI);
  }

  private createSecureHandler<TRequest, TResponse>(
    channel: string, 
    requestProcessor: (request: TRequest) => any
  ) {
    return async (request: TRequest): Promise<TResponse> => {
      try {
        // Rate limiting
        if (!this.rateLimiter.checkLimit(channel)) {
          this.securityLogger.logEvent({
            type: 'RATE_LIMIT_EXCEEDED',
            severity: 'medium',
            details: { channel },
            timestamp: new Date(),
            source: 'preload'
          });
          throw new Error('Rate limit exceeded');
        }

        // Process and validate request
        const processedRequest = requestProcessor(request);
        
        // Make IPC call
        const response = await ipcRenderer.invoke(channel, processedRequest);
        
        // Log successful operation
        this.securityLogger.logEvent({
          type: 'IPC_OPERATION_SUCCESS',
          severity: 'low',
          details: { channel },
          timestamp: new Date(),
          source: 'preload'
        });

        return response;
      } catch (error) {
        // Log security event
        this.securityLogger.logEvent({
          type: 'IPC_VALIDATION_FAILED',
          severity: 'high',
          details: { channel, error: error.message },
          timestamp: new Date(),
          source: 'preload'
        });
        
        throw error;
      }
    };
  }
}

// Initialize secure API
new SecurePreloadAPI();
```

### Security Validation Framework
```typescript
// src/preload/security-validator.ts - Input validation and sanitization
export class SecurityValidator {
  private readonly MAX_STRING_LENGTH = 1000;
  private readonly MAX_NUMBER_VALUE = 1000000;
  private readonly ALLOWED_CHANNELS = new Set([
    'timer:start', 'timer:pause', 'timer:resume', 'timer:configure',
    'task:create', 'task:update', 'task:delete', 'task:list',
    'session:start', 'session:end', 'notification:show'
  ]);

  isValidSessionId(sessionId: string): boolean {
    return (
      typeof sessionId === 'string' &&
      sessionId.length > 0 &&
      sessionId.length <= 36 &&
      /^[a-zA-Z0-9-_]+$/.test(sessionId)
    );
  }

  isValidTimerId(timerId: string): boolean {
    return (
      typeof timerId === 'string' &&
      timerId.length > 0 &&
      timerId.length <= 36 &&
      /^[a-zA-Z0-9-_]+$/.test(timerId)
    );
  }

  isValidTimerConfig(config: any): config is TimerConfig {
    return (
      typeof config === 'object' &&
      config !== null &&
      typeof config.focusDuration === 'number' &&
      config.focusDuration > 0 &&
      config.focusDuration <= this.MAX_NUMBER_VALUE &&
      typeof config.breakDuration === 'number' &&
      config.breakDuration > 0 &&
      config.breakDuration <= this.MAX_NUMBER_VALUE
    );
  }

  sanitizeTimerConfig(config: TimerConfig): TimerConfig {
    return {
      focusDuration: Math.min(Math.max(config.focusDuration, 1), this.MAX_NUMBER_VALUE),
      breakDuration: Math.min(Math.max(config.breakDuration, 1), this.MAX_NUMBER_VALUE),
      longBreakDuration: config.longBreakDuration 
        ? Math.min(Math.max(config.longBreakDuration, 1), this.MAX_NUMBER_VALUE)
        : undefined,
      sessionsUntilLongBreak: config.sessionsUntilLongBreak
        ? Math.min(Math.max(config.sessionsUntilLongBreak, 1), 10)
        : undefined
    };
  }

  isValidEventChannel(channel: string): boolean {
    return (
      typeof channel === 'string' &&
      this.ALLOWED_CHANNELS.has(channel)
    );
  }

  sanitizeString(value: string): string {
    if (typeof value !== 'string') {
      return '';
    }
    
    return value
      .slice(0, this.MAX_STRING_LENGTH)
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .trim();
  }

  sanitizeEventData(channel: string, data: any): any {
    // Channel-specific sanitization
    switch (channel) {
      case 'timer:tick':
        return this.sanitizeTimerState(data);
      case 'task:completed':
        return this.sanitizeTaskEvent(data);
      default:
        return this.sanitizeGeneric(data);
    }
  }

  sanitizeGeneric(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (typeof data === 'number') {
      return Math.min(Math.max(data, -this.MAX_NUMBER_VALUE), this.MAX_NUMBER_VALUE);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.sanitizeString(key);
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeGeneric(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}
```

### Secure Data Storage
```typescript
// src/main/security/secure-storage.ts - Encrypted data storage
import { safeStorage } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { app } from 'electron';

export class SecureStorageProvider {
  private readonly storageDir: string;
  private readonly encryptionKey: string;

  constructor() {
    this.storageDir = join(app.getPath('userData'), 'secure');
    this.encryptionKey = this.generateOrRetrieveKey();
    this.ensureStorageDirectory();
  }

  async store(key: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      // Use Electron's safeStorage for encryption
      const encryptedBuffer = safeStorage.encryptString(serializedValue);
      
      const filePath = join(this.storageDir, this.hashKey(key));
      await fs.writeFile(filePath, encryptedBuffer);
      
      this.logSecurityEvent('DATA_STORED', 'low', { key: this.hashKey(key) });
    } catch (error) {
      this.logSecurityEvent('ENCRYPTION_ERROR', 'high', { 
        operation: 'store',
        error: error.message 
      });
      throw new Error('Failed to securely store data');
    }
  }

  async retrieve<T>(key: string): Promise<T | null> {
    try {
      const filePath = join(this.storageDir, this.hashKey(key));
      
      const encryptedBuffer = await fs.readFile(filePath);
      const decryptedString = safeStorage.decryptString(encryptedBuffer);
      
      const value = JSON.parse(decryptedString);
      
      this.logSecurityEvent('DATA_RETRIEVED', 'low', { key: this.hashKey(key) });
      return value as T;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      
      this.logSecurityEvent('ENCRYPTION_ERROR', 'high', {
        operation: 'retrieve',
        error: error.message
      });
      throw new Error('Failed to retrieve secure data');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = join(this.storageDir, this.hashKey(key));
      await fs.unlink(filePath);
      
      this.logSecurityEvent('DATA_DELETED', 'low', { key: this.hashKey(key) });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logSecurityEvent('ENCRYPTION_ERROR', 'medium', {
          operation: 'delete',
          error: error.message
        });
        throw new Error('Failed to delete secure data');
      }
    }
  }

  private generateOrRetrieveKey(): string {
    // In production, this would use proper key management
    // For now, we rely on Electron's safeStorage
    return 'app-encryption-key';
  }

  private hashKey(key: string): string {
    // Simple hash for filename - in production use proper crypto
    return Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
  }

  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create secure storage directory: ${error.message}`);
    }
  }

  private logSecurityEvent(type: string, severity: string, details: any): void {
    // Implementation would log to security monitoring system
    console.log(`[SECURITY] ${severity.toUpperCase()}: ${type}`, details);
  }
}
```
