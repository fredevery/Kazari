import {
  TimerConfig,
  TimerError,
  TimerRepository,
  TimerSession,
  TimerState,
  TimerStatistics,
} from '@shared/types/timer';
import { app } from 'electron';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Timer Repository Implementation
 * Handles persistence of timer state, configuration, and session history
 * Uses JSON files in the user data directory with atomic writes
 */
export class TimerRepositoryImpl implements TimerRepository {
  private readonly dataDir: string;
  private readonly stateFilePath: string;
  private readonly configFilePath: string;
  private readonly sessionsFilePath: string;
  private readonly statisticsFilePath: string;

  constructor() {
    this.dataDir = join(app.getPath('userData'), 'timer-data');
    this.stateFilePath = join(this.dataDir, 'timer-state.json');
    this.configFilePath = join(this.dataDir, 'timer-config.json');
    this.sessionsFilePath = join(this.dataDir, 'timer-sessions.json');
    this.statisticsFilePath = join(this.dataDir, 'timer-statistics.json');
  }

  /**
   * Initialize the repository by ensuring data directory exists
   */
  public async initialize(): Promise<void> {
    try {
      await mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      throw new TimerError('Failed to initialize timer repository', 'INIT_FAILED', { error });
    }
  }

  /**
   * Save timer state to disk
   */
  public async saveState(state: TimerState): Promise<void> {
    try {
      const data = {
        ...state,
        savedAt: new Date().toISOString(),
      };

      await this.writeFileAtomic(this.stateFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new TimerError('Failed to save timer state', 'SAVE_FAILED', { error });
    }
  }

  /**
   * Load timer state from disk
   */
  public async getState(): Promise<TimerState | null> {
    try {
      const data = await readFile(this.stateFilePath, 'utf8');
      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      if (parsed.startTime) {
        parsed.startTime = new Date(parsed.startTime);
      }
      if (parsed.pausedTime) {
        parsed.pausedTime = new Date(parsed.pausedTime);
      }

      // Remove metadata
      delete parsed.savedAt;

      return parsed as TimerState;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw new TimerError('Failed to load timer state', 'LOAD_FAILED', { error });
    }
  }

  /**
   * Save timer configuration to disk
   */
  public async saveConfig(config: TimerConfig): Promise<void> {
    try {
      const data = {
        ...config,
        savedAt: new Date().toISOString(),
      };

      await this.writeFileAtomic(this.configFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new TimerError('Failed to save timer config', 'SAVE_FAILED', { error });
    }
  }

  /**
   * Load timer configuration from disk
   */
  public async getConfig(): Promise<TimerConfig> {
    try {
      const data = await readFile(this.configFilePath, 'utf8');
      const parsed = JSON.parse(data);

      // Remove metadata
      delete parsed.savedAt;

      return parsed as TimerConfig;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // Return default configuration if file doesn't exist
        return {
          planningDuration: 5,
          focusDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          autoStartBreaks: true,
          autoStartFocus: false,
        };
      }
      throw new TimerError('Failed to load timer config', 'LOAD_FAILED', { error });
    }
  }

  /**
   * Save a completed session to history
   */
  public async saveSession(session: TimerSession): Promise<void> {
    try {
      const sessions = await this.getSessionHistory();
      const updatedSessions = [...sessions, session];

      // Keep only last 1000 sessions to prevent file from growing too large
      const trimmedSessions = updatedSessions.slice(-1000);

      const data = {
        sessions: trimmedSessions,
        savedAt: new Date().toISOString(),
      };

      await this.writeFileAtomic(this.sessionsFilePath, JSON.stringify(data, null, 2));

      // Update statistics after saving session
      await this.updateStatistics(session);
    } catch (error) {
      throw new TimerError('Failed to save session', 'SAVE_FAILED', { error });
    }
  }

  /**
   * Get session history from disk
   */
  public async getSessionHistory(): Promise<readonly TimerSession[]> {
    try {
      const data = await readFile(this.sessionsFilePath, 'utf8');
      const parsed = JSON.parse(data);

      return (parsed.sessions || []).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return []; // File doesn't exist
      }
      throw new TimerError('Failed to load session history', 'LOAD_FAILED', { error });
    }
  }

  /**
   * Get timer statistics
   */
  public async getStatistics(): Promise<TimerStatistics> {
    try {
      const data = await readFile(this.statisticsFilePath, 'utf8');
      const parsed = JSON.parse(data);

      // Remove metadata
      delete parsed.updatedAt;

      return parsed as TimerStatistics;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // Return default statistics if file doesn't exist
        return this.getDefaultStatistics();
      }
      throw new TimerError('Failed to load timer statistics', 'LOAD_FAILED', { error });
    }
  }

  /**
   * Clear all timer data
   */
  public async clear(): Promise<void> {
    try {
      await Promise.allSettled([
        this.writeFileAtomic(this.stateFilePath, '{}'),
        this.writeFileAtomic(this.sessionsFilePath, '{"sessions":[]}'),
        this.writeFileAtomic(this.statisticsFilePath, JSON.stringify(this.getDefaultStatistics(), null, 2)),
      ]);
    } catch (error) {
      throw new TimerError('Failed to clear timer data', 'CLEAR_FAILED', { error });
    }
  }

  /**
   * Update statistics after a session is completed
   */
  private async updateStatistics(session: TimerSession): Promise<void> {
    try {
      const currentStats = await this.getStatistics();
      const sessionDuration = session.endTime && session.startTime
        ? session.endTime.getTime() - session.startTime.getTime()
        : 0;

      const newStats: TimerStatistics = {
        totalSessions: currentStats.totalSessions + 1,
        completedSessions: session.completed
          ? currentStats.completedSessions + 1
          : currentStats.completedSessions,
        totalFocusTime: session.phase === 'focus'
          ? currentStats.totalFocusTime + sessionDuration
          : currentStats.totalFocusTime,
        totalBreakTime: session.phase === 'break'
          ? currentStats.totalBreakTime + sessionDuration
          : currentStats.totalBreakTime,
        totalPlanningTime: session.phase === 'planning'
          ? currentStats.totalPlanningTime + sessionDuration
          : currentStats.totalPlanningTime,
        averageSessionLength: this.calculateAverageSessionLength(
          currentStats.totalSessions + 1,
          currentStats.averageSessionLength * currentStats.totalSessions + sessionDuration
        ),
        todaysSessions: this.isSameDay(session.startTime, new Date())
          ? currentStats.todaysSessions + 1
          : this.isSameDay(new Date(), new Date()) // Reset if different day
            ? 1
            : currentStats.todaysSessions,
        currentStreak: session.completed
          ? this.calculateStreak(currentStats, session)
          : currentStats.currentStreak,
      };

      const data = {
        ...newStats,
        updatedAt: new Date().toISOString(),
      };

      await this.writeFileAtomic(this.statisticsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      // Don't throw here - statistics update is not critical
      console.error('Failed to update statistics:', error);
    }
  }

  /**
   * Calculate average session length
   */
  private calculateAverageSessionLength(totalSessions: number, totalTime: number): number {
    return totalSessions > 0 ? totalTime / totalSessions : 0;
  }

  /**
   * Calculate current streak of completed sessions
   */
  private calculateStreak(currentStats: TimerStatistics, session: TimerSession): number {
    if (!session.completed) {
      return 0; // Streak broken
    }

    // For simplicity, increment streak for any completed session
    // In a more sophisticated implementation, you might consider consecutive days
    return currentStats.currentStreak + 1;
  }

  /**
   * Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * Get default statistics structure
   */
  private getDefaultStatistics(): TimerStatistics {
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalFocusTime: 0,
      totalBreakTime: 0,
      totalPlanningTime: 0,
      averageSessionLength: 0,
      todaysSessions: 0,
      currentStreak: 0,
    };
  }

  /**
   * Write file atomically by writing to temp file first
   */
  private async writeFileAtomic(filePath: string, data: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;

    try {
      await writeFile(tempPath, data, 'utf8');

      // On Windows, we need to handle the rename differently
      if (process.platform === 'win32') {
        const { rename, unlink } = await import('fs/promises');
        try {
          await unlink(filePath);
        } catch {
          // File might not exist
        }
        await rename(tempPath, filePath);
      } else {
        const { rename } = await import('fs/promises');
        await rename(tempPath, filePath);
      }
    } catch (error) {
      // Clean up temp file on error
      try {
        const { unlink } = await import('fs/promises');
        await unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }
}
