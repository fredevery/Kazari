import { TIMER_CONFIG } from '@shared/constants/app';
import {
  CreateTimerSessionRequest,
  NotificationService,
  Result,
  SessionNotFoundError,
  TimerError,
  TimerRepository,
  TimerService,
  TimerSession,
} from '@shared/types/timer';
import { TimerSessionEntity } from '../../domain/entities/timer-session';

/**
 * Timer Service Implementation
 * Handles all timer-related business logic and coordinates between repository and domain
 */
export class TimerServiceImpl implements TimerService {
  private currentSessionId: string | null = null;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly timerRepository: TimerRepository,
    private readonly notificationService: NotificationService
  ) { }

  /**
   * Create a new timer session
   */
  public async createSession(request: CreateTimerSessionRequest): Promise<Result<TimerSession, TimerError>> {
    try {
      const sessionEntity = TimerSessionEntity.create(request);
      const session = sessionEntity.toJSON();

      await this.timerRepository.save(session);

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to create session', 'CREATION_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Start a timer session
   */
  public async startSession(sessionId: string): Promise<Result<TimerSession, TimerError>> {
    try {
      const existingSession = await this.timerRepository.findById(sessionId);
      if (!existingSession) {
        const error = new SessionNotFoundError(sessionId);
        return {
          success: false,
          error,
        };
      }

      // Stop current session if running
      if (this.currentSessionId && this.currentSessionId !== sessionId) {
        await this.stopCurrentSession();
      }

      const sessionEntity = new TimerSessionEntity(existingSession);
      const startedSession = sessionEntity.start();
      const session = startedSession.toJSON();

      await this.timerRepository.save(session);
      this.currentSessionId = sessionId;
      this.startTimer();

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to start session', 'START_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Pause a timer session
   */
  public async pauseSession(sessionId: string): Promise<Result<TimerSession, TimerError>> {
    try {
      const existingSession = await this.timerRepository.findById(sessionId);
      if (!existingSession) {
        const error = new SessionNotFoundError(sessionId);
        return {
          success: false,
          error,
        };
      }

      const sessionEntity = new TimerSessionEntity(existingSession);
      const pausedSession = sessionEntity.pause();
      const session = pausedSession.toJSON();

      await this.timerRepository.save(session);
      this.stopTimer();

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to pause session', 'PAUSE_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Stop a timer session
   */
  public async stopSession(sessionId: string): Promise<Result<TimerSession, TimerError>> {
    try {
      const existingSession = await this.timerRepository.findById(sessionId);
      if (!existingSession) {
        const error = new SessionNotFoundError(sessionId);
        return {
          success: false,
          error,
        };
      }

      const sessionEntity = new TimerSessionEntity(existingSession);
      const stoppedSession = sessionEntity.stop();
      const session = stoppedSession.toJSON();

      await this.timerRepository.save(session);

      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
        this.stopTimer();
      }

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to stop session', 'STOP_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Get the current active session
   */
  public async getCurrentSession(): Promise<Result<TimerSession | null, TimerError>> {
    try {
      if (!this.currentSessionId) {
        return {
          success: true,
          data: null,
        };
      }

      const session = await this.timerRepository.findById(this.currentSessionId);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      const timerError = new TimerError('Failed to get current session', 'FETCH_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Get session history
   */
  public async getSessionHistory(): Promise<Result<readonly TimerSession[], TimerError>> {
    try {
      const sessions = await this.timerRepository.getHistory();
      return {
        success: true,
        data: sessions,
      };
    } catch (error) {
      const timerError = new TimerError('Failed to get session history', 'FETCH_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Start the timer interval
   */
  private startTimer(): void {
    this.stopTimer(); // Ensure no duplicate timers

    this.timerInterval = setInterval(() => {
      this.tick().catch(console.error);
    }, TIMER_CONFIG.TICK_INTERVAL);
  }

  /**
   * Stop the timer interval
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Timer tick - update remaining time
   */
  private async tick(): Promise<void> {
    if (!this.currentSessionId) {
      this.stopTimer();
      return;
    }

    try {
      const existingSession = await this.timerRepository.findById(this.currentSessionId);
      if (!existingSession || existingSession.status !== 'running') {
        this.stopTimer();
        return;
      }

      const sessionEntity = new TimerSessionEntity(existingSession);
      const newRemainingTime = sessionEntity.remainingTime - TIMER_CONFIG.TICK_INTERVAL;
      const updatedSession = sessionEntity.updateRemainingTime(newRemainingTime);
      const session = updatedSession.toJSON();

      await this.timerRepository.save(session);

      // Check for warnings and completion
      if (updatedSession.isExpired()) {
        await this.completeSession(session);
      } else if (updatedSession.needsWarning()) {
        await this.showWarningNotification(session);
      }

    } catch (error) {
      console.error('Error during timer tick:', error);
    }
  }

  /**
   * Complete the current session
   */
  private async completeSession(session: TimerSession): Promise<void> {
    try {
      const sessionEntity = new TimerSessionEntity(session);
      const completedSession = sessionEntity.complete();
      const finalSession = completedSession.toJSON();

      await this.timerRepository.save(finalSession);
      await this.notificationService.showTimerComplete(finalSession);

      this.currentSessionId = null;
      this.stopTimer();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }

  /**
   * Show warning notification
   */
  private async showWarningNotification(session: TimerSession): Promise<void> {
    try {
      await this.notificationService.showTimerWarning(session, session.remainingTime);
    } catch (error) {
      console.error('Error showing warning notification:', error);
    }
  }

  /**
   * Stop the current session (if any)
   */
  private async stopCurrentSession(): Promise<void> {
    if (this.currentSessionId) {
      await this.stopSession(this.currentSessionId);
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopTimer();
    this.currentSessionId = null;
  }
}
