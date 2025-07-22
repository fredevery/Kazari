# Performance Optimization

Implement comprehensive performance optimization strategies for the Kazari desktop productivity application to ensure optimal memory usage, CPU efficiency, and fast startup times. This optimization framework will provide monitoring, profiling, and actionable improvements for both main and renderer processes.

## Requirements

- Optimize application startup time to under 3 seconds on average hardware configurations
- Implement memory usage monitoring and maintain total memory footprint under 200MB during normal operation
- Optimize CPU usage to remain under 5% during idle states and under 20% during active timer operations
- Create performance profiling infrastructure for both main and renderer processes
- Implement automated performance regression testing and monitoring in CI/CD pipeline
- Optimize bundle sizes with code splitting, tree shaking, and dynamic imports
- Implement lazy loading strategies for non-critical components and features
- Create performance monitoring dashboard with real-time metrics and alerts
- Optimize IPC communication patterns to minimize latency and overhead
- Document performance best practices and provide actionable optimization guidelines for developers

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/build-configuration.md
- rules/timer-precision.md
- rules/error-handling.md
- rules/typescript-standards.md
- rules/accessibility.md

## Domain

```typescript
// Performance Optimization Domain Model
interface PerformanceMetrics {
  id: string;
  timestamp: number;
  processType: ProcessType;
  metrics: ProcessMetrics;
  thresholds: PerformanceThresholds;
  status: MetricStatus;
}

enum ProcessType {
  Main = 'main',
  Renderer = 'renderer',
  Preload = 'preload',
  System = 'system'
}

interface ProcessMetrics {
  memory: MemoryMetrics;
  cpu: CpuMetrics;
  startup: StartupMetrics;
  ipc: IpcMetrics;
  rendering: RenderingMetrics;
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  workingSetSize: number;
  peakWorkingSetSize: number;
  privateBytes: number;
}

interface CpuMetrics {
  percentCpuUsage: number;
  idleWakeUps: number;
  creationTime: number;
  kernelTime: number;
  userTime: number;
}

interface StartupMetrics {
  appReady: number;
  windowShown: number;
  firstPaint: number;
  firstContentfulPaint: number;
  domContentLoaded: number;
  loadComplete: number;
}

interface IpcMetrics {
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  maxLatency: number;
  queueSize: number;
}

interface RenderingMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  jankOccurrences: number;
  layoutThrashing: number;
}

interface PerformanceThresholds {
  memory: MemoryThresholds;
  cpu: CpuThresholds;
  startup: StartupThresholds;
  rendering: RenderingThresholds;
}

interface OptimizationStrategy {
  name: string;
  type: OptimizationType;
  target: ProcessType;
  implementation: OptimizationImplementation;
  impact: PerformanceImpact;
  priority: Priority;
}

enum OptimizationType {
  MemoryOptimization = 'memory',
  CpuOptimization = 'cpu',
  StartupOptimization = 'startup',
  BundleOptimization = 'bundle',
  RenderOptimization = 'render',
  IpcOptimization = 'ipc'
}

interface PerformanceMonitor {
  collectors: MetricCollector[];
  analyzers: PerformanceAnalyzer[];
  alerts: PerformanceAlert[];
  reports: PerformanceReport[];
}

interface PerformanceBudget {
  memory: number;
  cpu: number;
  startup: number;
  bundleSize: number;
  violations: BudgetViolation[];
}
```

## Extra Considerations

- Electron applications have unique performance characteristics due to Chromium and Node.js overhead
- Memory leaks in renderer processes can accumulate over time with heavy usage patterns
- Timer precision requirements may conflict with power efficiency optimizations
- Cross-platform performance characteristics vary significantly between Windows, macOS, and Linux
- Background processes and system resource contention affect performance measurements
- Bundle size optimizations must balance performance gains with debugging capabilities
- V8 garbage collection patterns impact both memory usage and performance consistency
- IPC communication overhead increases with message frequency and payload size
- Window management and multi-window scenarios create additional performance complexity
- Performance monitoring itself can impact application performance if not implemented carefully
- Hardware acceleration availability varies across different system configurations
- Long-running timer applications need special consideration for memory leak prevention

## Testing Considerations

- **Performance Regression Tests**: Automated tests that fail if performance degrades beyond thresholds
- **Memory Leak Detection**: Long-running tests that monitor memory usage patterns over time
- **Startup Performance Tests**: Measure and validate application startup times across platforms
- **CPU Usage Tests**: Monitor CPU consumption during various application states and operations
- **Bundle Size Tests**: Track and alert on bundle size increases in CI/CD pipeline
- **Load Testing**: Simulate extended usage patterns and high-frequency timer operations
- **Cross-Platform Performance Tests**: Compare performance characteristics across operating systems
- **IPC Performance Tests**: Measure message latency and throughput under various conditions
- **Rendering Performance Tests**: Monitor frame rates, jank, and visual performance metrics
- **Resource Cleanup Tests**: Verify proper cleanup of timers, listeners, and other resources

## Implementation Notes

- Use Electron's built-in process monitoring APIs for accurate metrics collection
- Implement lazy loading with React.lazy() and dynamic imports for code splitting
- Use Web Workers for CPU-intensive operations to avoid blocking the main thread
- Optimize React rendering with useMemo, useCallback, and React.memo appropriately
- Implement proper cleanup patterns for timers, event listeners, and subscriptions
- Use efficient data structures and algorithms for timer state management
- Minimize IPC message frequency and payload sizes through batching and compression
- Implement performance budgets in build process with automated enforcement
- Use Chrome DevTools Performance tab and Node.js profiling tools for deep analysis
- Create custom performance monitoring hooks and utilities for development
- Implement automatic performance report generation and trending analysis
- Use proper TypeScript configurations to optimize bundle size and runtime performance

## Specification by Example

### Performance Monitoring Service
```typescript
// src/services/PerformanceMonitor.ts
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private collectors: Map<string, MetricCollector> = new Map();

  constructor() {
    this.setupCollectors();
    this.startMonitoring();
  }

  private setupCollectors() {
    // Memory monitoring
    this.collectors.set('memory', new MemoryCollector({
      interval: 5000,
      threshold: 200 * 1024 * 1024 // 200MB
    }));

    // CPU monitoring
    this.collectors.set('cpu', new CpuCollector({
      interval: 1000,
      idleThreshold: 5,
      activeThreshold: 20
    }));

    // IPC monitoring
    this.collectors.set('ipc', new IpcCollector({
      trackLatency: true,
      trackThroughput: true
    }));
  }

  async collectMetrics(): Promise<PerformanceMetrics> {
    const processMetrics = process.getProcessMemoryInfo();
    const cpuUsage = process.getCPUUsage();

    return {
      id: generateId(),
      timestamp: Date.now(),
      processType: ProcessType.Main,
      metrics: {
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss,
          workingSetSize: processMetrics.workingSetSize,
          peakWorkingSetSize: processMetrics.peakWorkingSetSize,
          privateBytes: processMetrics.privateBytes
        },
        cpu: {
          percentCpuUsage: cpuUsage.percentCPUUsage,
          idleWakeUps: cpuUsage.idleWakeupsPerSecond
        }
      }
    };
  }
}
```

### Startup Performance Optimization
```typescript
// src/main/StartupOptimizer.ts
export class StartupOptimizer {
  private startupMetrics: StartupMetrics = {
    appReady: 0,
    windowShown: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    domContentLoaded: 0,
    loadComplete: 0
  };

  optimize() {
    // Defer non-critical initialization
    this.deferNonCriticalServices();
    
    // Preload critical resources
    this.preloadCriticalAssets();
    
    // Optimize window creation
    this.optimizeWindowCreation();
  }

  private deferNonCriticalServices() {
    // Defer auto-updater initialization
    setTimeout(() => {
      import('./services/UpdaterService').then(({ UpdaterService }) => {
        new UpdaterService().initialize();
      });
    }, 3000);

    // Defer analytics initialization
    setTimeout(() => {
      import('./services/AnalyticsService').then(({ AnalyticsService }) => {
        new AnalyticsService().initialize();
      });
    }, 5000);
  }

  private optimizeWindowCreation() {
    // Use show: false and show window when ready
    const window = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    window.once('ready-to-show', () => {
      this.startupMetrics.windowShown = performance.now();
      window.show();
    });

    return window;
  }
}
```

### Bundle Optimization Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ['react', 'react-dom'],
          
          // UI components chunk
          ui: ['./src/components/index.ts'],
          
          // Utils chunk
          utils: ['./src/utils/index.ts']
        }
      }
    },
    
    // Enable minification
    minify: 'esbuild',
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Tree shaking configuration
    treeShake: true
  },
  
  plugins: [
    react(),
    
    // Bundle analyzer for size monitoring
    bundleAnalyzer({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true
    })
  ]
});
```

### Memory Leak Prevention
```typescript
// src/hooks/usePerformanceCleanup.ts
export function usePerformanceCleanup() {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const listenersRef = useRef<Array<() => void>>([]);

  const createTimer = useCallback((callback: () => void, interval: number) => {
    const timer = setInterval(callback, interval);
    timersRef.current.add(timer);
    
    return () => {
      clearInterval(timer);
      timersRef.current.delete(timer);
    };
  }, []);

  const addListener = useCallback((cleanup: () => void) => {
    listenersRef.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all timers
      timersRef.current.forEach(timer => clearInterval(timer));
      timersRef.current.clear();
      
      // Cleanup all listeners
      listenersRef.current.forEach(cleanup => cleanup());
      listenersRef.current.length = 0;
    };
  }, []);

  return { createTimer, addListener };
}
```

### IPC Optimization
```typescript
// src/services/OptimizedIpc.ts
export class OptimizedIpc {
  private messageQueue: IpcMessage[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 16; // ~60fps

  send(channel: string, data: any) {
    this.messageQueue.push({ channel, data, timestamp: Date.now() });
    
    if (this.messageQueue.length >= this.BATCH_SIZE) {
      this.flushQueue();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushQueue();
      }, this.BATCH_TIMEOUT);
    }
  }

  private flushQueue() {
    if (this.messageQueue.length === 0) return;

    const batch = this.messageQueue.splice(0, this.BATCH_SIZE);
    
    // Send batched messages
    ipcRenderer.send('batch-messages', batch);
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}
```

### Performance Budget Configuration
```json
{
  "performance": {
    "budgets": [
      {
        "type": "bundle",
        "name": "main",
        "baseline": "500kb",
        "maximumWarning": "750kb",
        "maximumError": "1mb"
      },
      {
        "type": "bundle", 
        "name": "vendor",
        "baseline": "1mb",
        "maximumWarning": "1.5mb",
        "maximumError": "2mb"
      }
    ],
    "thresholds": {
      "memory": {
        "warning": 150,
        "error": 200
      },
      "cpu": {
        "idle": 5,
        "active": 20,
        "peak": 50
      },
      "startup": {
        "appReady": 2000,
        "windowShown": 3000
      }
    }
  }
}
```

### Performance Testing Script
```typescript
// scripts/performance-test.ts
import { performance, PerformanceObserver } from 'perf_hooks';

class PerformanceTester {
  private metrics: PerformanceMetrics[] = [];

  async runStartupTest(): Promise<StartupMetrics> {
    const start = performance.now();
    
    // Simulate app startup
    await this.simulateAppStartup();
    
    const appReady = performance.now() - start;
    
    return {
      appReady,
      windowShown: appReady + 100,
      firstPaint: appReady + 150,
      firstContentfulPaint: appReady + 200,
      domContentLoaded: appReady + 250,
      loadComplete: appReady + 300
    };
  }

  async runMemoryTest(duration: number): Promise<MemoryMetrics[]> {
    const metrics: MemoryMetrics[] = [];
    const interval = 1000; // 1 second intervals
    
    const timer = setInterval(() => {
      const usage = process.memoryUsage();
      metrics.push({
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss,
        timestamp: Date.now()
      });
    }, interval);

    // Run test for specified duration
    await new Promise(resolve => setTimeout(resolve, duration));
    
    clearInterval(timer);
    return metrics;
  }

  generateReport(metrics: PerformanceMetrics[]): PerformanceReport {
    return {
      summary: this.calculateSummary(metrics),
      recommendations: this.generateRecommendations(metrics),
      trends: this.analyzeTrends(metrics),
      violations: this.checkBudgetViolations(metrics)
    };
  }
}
```
