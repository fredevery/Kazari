import { app } from 'electron';
import { promises as fs } from 'fs';
import { join } from 'path';
import { TimerSession, TimerStatistics } from '../../../shared/types/timer';

/**
 * Implementation of Pomodoro timer repository using file system storage
 * Stores timer state, sessions, and statistics as JSON files
 */
export class PomodoroTimerRepositoryImpl {
  private readonly dataPath: string;
  private readonly statePath: string;
  private readonly statisticsPath: string;

  constructor() {
    this.dataPath = join(app.getPath('userData'), 'pomodoro-data');
    this.statePath = join(this.dataPath, 'timer-state.json');
    this.statisticsPath = join(this.dataPath, 'statistics.json');
  }

  /**
   * Initializes the repository and creates necessary directories
   */
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  /**
   * Atomically writes data to a file
   */
  private async writeJsonFile(filePath: string, data: any): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
    await fs.rename(tempPath, filePath);
  }

  /**
   * Safely reads and parses JSON file
   */
  private async readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      // File doesn't exist or is corrupted, return default
      return defaultValue;
    }
  }

  /**
   * Saves a completed timer session to the history
   */
  public async saveSession(session: TimerSession): Promise<void> {
    await this.ensureDataDirectory();

    const sessionsPath = join(this.dataPath, 'sessions.json');
    const sessions = await this.readJsonFile<TimerSession[]>(sessionsPath, []);

    sessions.push(session);

    // Keep only the last 1000 sessions
    const trimmedSessions = sessions.slice(-1000);

    await this.writeJsonFile(sessionsPath, trimmedSessions);
  }

  /**
   * Gets all timer sessions from history
   */
  public async getSessions(): Promise<TimerSession[]> {
    await this.ensureDataDirectory();
    const sessionsPath = join(this.dataPath, 'sessions.json');
    return this.readJsonFile<TimerSession[]>(sessionsPath, []);
  }

  /**
   * Gets timer statistics
   */
  public async getStatistics(): Promise<TimerStatistics> {
    await this.ensureDataDirectory();

    const sessions = await this.getSessions();

    // Calculate statistics from sessions
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const totalFocusTime = sessions.reduce((total, session) => {
      if (session.completed && session.phase === 'focus' && session.endTime) {
        const start = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
        const end = typeof session.endTime === 'number' ? session.endTime : session.endTime.getTime();
        return total + (end - start);
      }
      return total;
    }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const todaySessions = sessions.filter(s => {
      const sessionTime = typeof s.startTime === 'number' ? s.startTime : s.startTime.getTime();
      return sessionTime >= todayMs;
    });
    const todayCompleted = todaySessions.filter(s => s.completed).length;
    const todayFocusTime = todaySessions.reduce((total, session) => {
      if (session.completed && session.phase === 'focus' && session.endTime) {
        const start = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
        const end = typeof session.endTime === 'number' ? session.endTime : session.endTime.getTime();
        return total + (end - start);
      }
      return total;
    }, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);
    const thisWeekMs = thisWeek.getTime();

    const weekSessions = sessions.filter(s => {
      const sessionTime = typeof s.startTime === 'number' ? s.startTime : s.startTime.getTime();
      return sessionTime >= thisWeekMs;
    });
    const weekCompleted = weekSessions.filter(s => s.completed).length;
    const weekFocusTime = weekSessions.reduce((total, session) => {
      if (session.completed && session.phase === 'focus' && session.endTime) {
        const start = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
        const end = typeof session.endTime === 'number' ? session.endTime : session.endTime.getTime();
        return total + (end - start);
      }
      return total;
    }, 0);

    return {
      totalSessions,
      completedSessions,
      totalFocusTime,
      totalBreakTime: weekSessions.reduce((total, session) => {
        if (session.completed && session.phase === 'break' && session.endTime) {
          const start = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
          const end = typeof session.endTime === 'number' ? session.endTime : session.endTime.getTime();
          return total + (end - start);
        }
        return total;
      }, 0),
      totalPlanningTime: weekSessions.reduce((total, session) => {
        if (session.completed && session.phase === 'planning' && session.endTime) {
          const start = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
          const end = typeof session.endTime === 'number' ? session.endTime : session.endTime.getTime();
          return total + (end - start);
        }
        return total;
      }, 0),
      averageSessionLength: totalSessions > 0 ? totalFocusTime / totalSessions : 0,
      todaysSessions: todayCompleted,
      currentStreak: this.calculateCurrentStreak(sessions),
    };
  }

  /**
   * Calculates the longest streak of consecutive completed sessions
   */
  private calculateLongestStreak(sessions: TimerSession[]): number {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions
      .filter(s => s.completed)
      .sort((a, b) => {
        const aTime = typeof a.startTime === 'number' ? a.startTime : a.startTime.getTime();
        const bTime = typeof b.startTime === 'number' ? b.startTime : b.startTime.getTime();
        return aTime - bTime;
      });

    let longestStreak = 0;
    let currentStreak = 0;
    let lastSessionDate: string | null = null;

    for (const session of completedSessions) {
      const sessionTime = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
      const sessionDate = new Date(sessionTime).toDateString();

      if (lastSessionDate === null) {
        currentStreak = 1;
      } else {
        const lastDate = new Date(lastSessionDate);
        const sessionDateTime = new Date(sessionDate);
        const diffTime = sessionDateTime.getTime() - lastDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          // Consecutive day
          currentStreak++;
        } else if (diffDays === 0) {
          // Same day, continue streak
          // currentStreak stays the same
        } else {
          // Gap in days, reset streak
          currentStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak);
      lastSessionDate = sessionDate;
    }

    return longestStreak;
  }

  /**
   * Calculates the current streak of consecutive completed sessions
   */
  private calculateCurrentStreak(sessions: TimerSession[]): number {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions
      .filter(s => s.completed)
      .sort((a, b) => {
        const aTime = typeof a.startTime === 'number' ? a.startTime : a.startTime.getTime();
        const bTime = typeof b.startTime === 'number' ? b.startTime : b.startTime.getTime();
        return bTime - aTime; // Most recent first
      });

    if (completedSessions.length === 0) return 0;

    let currentStreak = 0;
    let lastSessionDate: string | null = null;
    const today = new Date().toDateString();

    for (const session of completedSessions) {
      const sessionTime = typeof session.startTime === 'number' ? session.startTime : session.startTime.getTime();
      const sessionDate = new Date(sessionTime).toDateString();

      if (lastSessionDate === null) {
        // First session - check if it's today or yesterday
        if (sessionDate === today) {
          currentStreak = 1;
          lastSessionDate = sessionDate;
          continue;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (sessionDate === yesterday.toDateString()) {
            currentStreak = 1;
            lastSessionDate = sessionDate;
            continue;
          } else {
            break; // Too old, no current streak
          }
        }
      }

      const lastDate = new Date(lastSessionDate);
      const sessionDateTime = new Date(sessionDate);
      const diffTime = lastDate.getTime() - sessionDateTime.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Previous consecutive day
        currentStreak++;
        lastSessionDate = sessionDate;
      } else if (diffDays === 0) {
        // Same day, continue
        // currentStreak stays the same
      } else {
        // Gap in days, stop counting
        break;
      }
    }

    return currentStreak;
  }

  /**
   * Clears all session data (for reset/testing purposes)
   */
  public async clearSessions(): Promise<void> {
    await this.ensureDataDirectory();
    const sessionsPath = join(this.dataPath, 'sessions.json');
    await this.writeJsonFile(sessionsPath, []);
  }
}

export default PomodoroTimerRepositoryImpl;
