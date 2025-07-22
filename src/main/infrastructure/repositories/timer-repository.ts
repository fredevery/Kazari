import { STORAGE_KEYS } from '@shared/constants/app';
import { TimerRepository, TimerSession } from '@shared/types/timer';
import Store from 'electron-store';

/**
 * Timer Repository Implementation using electron-store
 * Handles persistence and retrieval of timer sessions
 */
export class TimerRepositoryImpl implements TimerRepository {
  private readonly store: Store;

  constructor() {
    this.store = new Store({
      name: 'timer-data',
    });

    // Initialize with empty array if not exists
    if (!this.store.has(STORAGE_KEYS.TIMER_SESSIONS)) {
      this.store.set(STORAGE_KEYS.TIMER_SESSIONS, []);
    }
  }

  /**
   * Save a timer session
   */
  public async save(session: TimerSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        // Update existing session
        sessions[existingIndex] = session;
      } else {
        // Add new session
        sessions.push(session);
      }

      this.store.set(STORAGE_KEYS.TIMER_SESSIONS, sessions);
    } catch (error) {
      throw new Error(`Failed to save timer session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a timer session by ID
   */
  public async findById(id: string): Promise<TimerSession | null> {
    try {
      const sessions = await this.getAllSessions();
      return sessions.find(session => session.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to find timer session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get session history
   */
  public async getHistory(): Promise<readonly TimerSession[]> {
    try {
      const sessions = await this.getAllSessions();
      // Sort by creation date, newest first
      return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      throw new Error(`Failed to get session history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a timer session by ID
   */
  public async deleteById(id: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== id);
      this.store.set(STORAGE_KEYS.TIMER_SESSIONS, filteredSessions);
    } catch (error) {
      throw new Error(`Failed to delete timer session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all timer sessions
   */
  public async clear(): Promise<void> {
    try {
      this.store.set(STORAGE_KEYS.TIMER_SESSIONS, []);
    } catch (error) {
      throw new Error(`Failed to clear timer sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all sessions from storage
   */
  private async getAllSessions(): Promise<TimerSession[]> {
    try {
      const sessions = this.store.get(STORAGE_KEYS.TIMER_SESSIONS) as TimerSession[];

      // Convert date strings back to Date objects if needed
      return sessions.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
        pausedAt: session.pausedAt ? new Date(session.pausedAt) : undefined,
        completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
      }));
    } catch (error) {
      // If storage is corrupted, return empty array and log error
      console.error('Failed to load timer sessions from storage:', error);
      return [];
    }
  }
}
