# Data Persistence and Storage Management

The Data Persistence system provides secure, reliable, and efficient local storage for user settings, task history, productivity metrics, and application state in the Kazari desktop application. It implements Electron best practices for data security, encryption of sensitive information, and seamless synchronization between main process state and persistent storage. This addresses the critical need for data durability across application sessions, secure handling of sensitive user data, and maintaining consistent state across multiple windows while ensuring optimal performance and data integrity.

## Requirements

- Storage architecture must handle user settings, task history, productivity metrics, and session data with appropriate data models
- Security implementation must encrypt sensitive data including authentication tokens, API keys, and personal information
- State synchronization must maintain consistency between in-memory application state and persistent storage
- Data migration system must handle schema changes and version upgrades without data loss
- Performance optimization must minimize I/O operations while ensuring data consistency and durability
- Backup and recovery mechanisms must protect against data corruption and provide restoration capabilities
- Cross-platform compatibility must ensure consistent storage behavior across macOS, Windows, and Linux
- Concurrent access handling must prevent data corruption when multiple windows access the same data
- Storage quotas and cleanup must manage disk space usage and remove obsolete data automatically
- Import/export functionality must allow users to backup and transfer their data between installations

## Rules

- rules/electron-security.md
- rules/error-handling.md
- rules/state-management.md
- rules/typescript-standards.md
- rules/hexagonal-architecture.md

## Domain

```typescript
// Data persistence domain model
interface DataPersistenceLayer {
  userSettings: SettingsRepository;
  taskHistory: TaskRepository;
  sessionMetrics: MetricsRepository;
  applicationState: StateRepository;
  securityManager: SecurityManager;
}

interface SettingsRepository {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  getAll(): Promise<UserSettings>;
  update(updates: Partial<UserSettings>): Promise<UserSettings>;
  reset(): Promise<void>;
  export(): Promise<string>;
  import(data: string): Promise<void>;
}

interface TaskRepository {
  create(task: Task): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Task | null>;
  getAll(filters?: TaskFilters): Promise<Task[]>;
  getHistory(dateRange: DateRange): Promise<TaskHistoryEntry[]>;
  archive(olderThan: Date): Promise<number>;
}

interface MetricsRepository {
  recordSession(session: SessionRecord): Promise<void>;
  getMetrics(period: TimePeriod): Promise<ProductivityMetrics>;
  getDailyMetrics(date: Date): Promise<DailyMetrics>;
  getWeeklyMetrics(weekStart: Date): Promise<WeeklyMetrics>;
  getMonthlyMetrics(month: Date): Promise<MonthlyMetrics>;
  calculateTrends(period: TimePeriod): Promise<ProductivityTrends>;
  cleanup(retentionPeriod: number): Promise<void>;
}

interface StateRepository {
  saveState(state: ApplicationState): Promise<void>;
  loadState(): Promise<ApplicationState | null>;
  getStateSnapshot(): Promise<StateSnapshot>;
  restoreFromSnapshot(snapshot: StateSnapshot): Promise<void>;
  clearState(): Promise<void>;
}

interface SecurityManager {
  encrypt(data: string, context: string): Promise<string>;
  decrypt(encryptedData: string, context: string): Promise<string>;
  hashSensitiveData(data: string): string;
  validateDataIntegrity(data: any, checksum: string): boolean;
  generateChecksum(data: any): string;
}

interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
  size(key: string): Promise<number>;
}

interface MigrationManager {
  getCurrentVersion(): Promise<number>;
  runMigrations(targetVersion: number): Promise<void>;
  registerMigration(version: number, migration: Migration): void;
  createBackup(version: number): Promise<string>;
  rollback(backupId: string): Promise<void>;
}
```

## Extra Considerations

- Storage location must follow OS-specific conventions for application data while being easily accessible for debugging
- Data compression may be needed for large datasets like task history and session metrics to optimize disk usage
- Atomic operations required for critical data writes to prevent corruption during unexpected shutdowns
- Memory caching strategy needed to balance performance with memory usage for frequently accessed data
- Data validation must ensure stored data matches expected schemas before deserialization
- Encryption key management requires secure storage and rotation policies for sensitive data protection
- Database schema evolution must handle breaking changes gracefully with automatic migration paths
- Storage monitoring needed to track usage patterns, performance metrics, and error rates
- Development vs production storage isolation to prevent test data corruption during development
- Emergency recovery procedures required for handling corrupted storage files and data loss scenarios

## Testing Considerations

Unit tests must cover all repository methods with mocked storage adapters and comprehensive edge case scenarios. Integration tests should verify end-to-end data persistence flows including encryption, serialization, and state synchronization. Performance tests must validate storage operations under various load conditions and data volumes. Security tests should verify encryption/decryption correctness and prevent unauthorized data access. Migration tests must ensure schema changes work correctly without data loss across multiple version jumps. Concurrency tests should validate data integrity when multiple processes access storage simultaneously. Recovery tests must verify backup and restoration procedures work correctly under failure conditions.

## Implementation Notes

Use electron-store or similar libraries for cross-platform file-based storage with atomic writes. Implement repository pattern to abstract storage implementation details from business logic. Use TypeScript strict mode with comprehensive type definitions for all data models and storage interfaces. Implement proper error handling with retry mechanisms for transient storage failures. Use structured logging to track storage operations, performance metrics, and error conditions. Implement data validation using libraries like Zod for runtime schema verification. Use encryption libraries like node-forge for sensitive data protection with proper key management. Implement lazy loading and caching strategies to optimize performance for large datasets. Use event-driven architecture to notify other components of data changes. Implement proper cleanup and resource management to prevent memory leaks.

## Specification by Example

```typescript
// Storage adapter implementation
class ElectronStoreAdapter implements StorageAdapter {
  private store: ElectronStore;

  constructor(options: StoreOptions) {
    this.store = new ElectronStore({
      name: options.name,
      encryptionKey: options.encryptionKey,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      fileExtension: 'json'
    });
  }

  async read(key: string): Promise<string | null> {
    try {
      return this.store.get(key, null);
    } catch (error) {
      logger.error('Storage read failed', { key, error });
      throw new StorageError('READ_FAILED', `Failed to read key: ${key}`);
    }
  }
}

// Repository implementation example
class TaskRepositoryImpl implements TaskRepository {
  constructor(
    private adapter: StorageAdapter,
    private validator: DataValidator,
    private securityManager: SecurityManager
  ) {}

  async create(task: Task): Promise<Task> {
    const validatedTask = await this.validator.validate(TaskSchema, task);
    const taskId = generateId();
    const taskWithId = { ...validatedTask, id: taskId, createdAt: new Date() };
    
    try {
      await this.adapter.write(`tasks:${taskId}`, JSON.stringify(taskWithId));
      await this.updateTaskIndex(taskId, taskWithId);
      
      logger.info('Task created', { taskId, title: taskWithId.title });
      return taskWithId;
    } catch (error) {
      logger.error('Task creation failed', { taskId, error });
      throw new StorageError('CREATE_FAILED', 'Failed to create task');
    }
  }

  async getHistory(dateRange: DateRange): Promise<TaskHistoryEntry[]> {
    const taskKeys = await this.adapter.list('tasks:');
    const tasks = await Promise.all(
      taskKeys.map(key => this.adapter.read(key))
    );
    
    return tasks
      .filter(task => task && this.isInDateRange(task, dateRange))
      .map(task => this.toHistoryEntry(task));
  }
}

// Settings with encryption example
class SettingsRepositoryImpl implements SettingsRepository {
  async set<T>(key: string, value: T): Promise<void> {
    const serializedValue = JSON.stringify(value);
    
    if (this.isSensitive(key)) {
      const encrypted = await this.securityManager.encrypt(
        serializedValue, 
        `settings:${key}`
      );
      await this.adapter.write(`settings:${key}`, encrypted);
    } else {
      await this.adapter.write(`settings:${key}`, serializedValue);
    }
  }

  private isSensitive(key: string): boolean {
    return ['apiKeys', 'tokens', 'credentials'].some(prefix => 
      key.startsWith(prefix)
    );
  }
}

// Migration example
const migrations: Migration[] = [
  {
    version: 2,
    description: 'Add task priority field',
    up: async (storage: StorageAdapter) => {
      const taskKeys = await storage.list('tasks:');
      for (const key of taskKeys) {
        const task = JSON.parse(await storage.read(key) || '{}');
        task.priority = task.priority || 'medium';
        await storage.write(key, JSON.stringify(task));
      }
    }
  }
];
```

## Verification

- [ ] All data types (settings, tasks, metrics, state) persist correctly across application restarts
- [ ] Sensitive data is properly encrypted using secure encryption methods and key management
- [ ] State synchronization maintains consistency between memory and storage without data loss
- [ ] Data migration system handles schema changes correctly without corrupting existing data
- [ ] Performance remains acceptable for all storage operations under realistic data volumes
- [ ] Concurrent access from multiple windows doesn't cause data corruption or conflicts
- [ ] Backup and recovery mechanisms work correctly and can restore data from corruption
- [ ] Cross-platform compatibility verified with consistent behavior on all supported operating systems
- [ ] Storage quotas and cleanup prevent excessive disk usage while preserving important data
- [ ] Import/export functionality allows complete data transfer between application installations
- [ ] Error handling provides appropriate recovery mechanisms for all storage failure scenarios
- [ ] Data validation ensures stored data integrity and prevents corruption from malformed data
- [ ] Security measures prevent unauthorized access to sensitive stored data
- [ ] Development and production data remain properly isolated during development workflows
- [ ] Monitoring and logging provide sufficient visibility into storage operations and performance
