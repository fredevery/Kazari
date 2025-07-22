import { TIMER_CONFIG } from '@shared/constants/app';
import { CreateTimerSessionRequest, TimerError, TimerSession, TimerStatus, ValidationError } from '@shared/types/timer';
import { generateId } from '../../shared/utils';

/**
 * Timer Session Entity
 * Represents a timer session with all business rules and validation
 */
export class TimerSessionEntity implements TimerSession {
  public readonly id: string;
  public readonly name: string;
  public readonly duration: number;
  public readonly remainingTime: number;
  public readonly status: TimerStatus;
  public readonly createdAt: Date;
  public readonly startedAt: Date | undefined;
  public readonly pausedAt: Date | undefined;
  public readonly completedAt: Date | undefined;

  constructor(data: {
    readonly id: string;
    readonly name: string;
    readonly duration: number;
    readonly remainingTime?: number;
    readonly status?: TimerStatus;
    readonly createdAt?: Date;
    readonly startedAt?: Date | undefined;
    readonly pausedAt?: Date | undefined;
    readonly completedAt?: Date | undefined;
  }) {
    // Validate required fields
    this.validateName(data.name);
    this.validateDuration(data.duration);

    this.id = data.id;
    this.name = data.name.trim();
    this.duration = data.duration;
    this.remainingTime = data.remainingTime ?? data.duration;
    this.status = data.status ?? 'idle';
    this.createdAt = data.createdAt ?? new Date();
    this.startedAt = data.startedAt;
    this.pausedAt = data.pausedAt;
    this.completedAt = data.completedAt;
  }

  /**
   * Create a new timer session from a request
   */
  public static create(request: CreateTimerSessionRequest): TimerSessionEntity {
    return new TimerSessionEntity({
      id: generateId(),
      name: request.name,
      duration: request.duration,
    });
  }

  /**
   * Start the timer session
   */
  public start(): TimerSessionEntity {
    if (this.status === 'completed') {
      throw new TimerError('Cannot start a completed timer session', 'INVALID_STATE');
    }

    if (this.status === 'running') {
      throw new TimerError('Timer session is already running', 'INVALID_STATE');
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: 'running',
      createdAt: this.createdAt,
      startedAt: new Date(),
      pausedAt: undefined,
      completedAt: this.completedAt,
    });
  }

  /**
   * Pause the timer session
   */
  public pause(): TimerSessionEntity {
    if (this.status !== 'running') {
      throw new TimerError('Can only pause a running timer session', 'INVALID_STATE');
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: 'paused',
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      pausedAt: new Date(),
      completedAt: this.completedAt,
    });
  }

  /**
   * Resume the timer session
   */
  public resume(): TimerSessionEntity {
    if (this.status !== 'paused') {
      throw new TimerError('Can only resume a paused timer session', 'INVALID_STATE');
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: 'running',
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      pausedAt: undefined,
      completedAt: this.completedAt,
    });
  }

  /**
   * Stop the timer session
   */
  public stop(): TimerSessionEntity {
    if (this.status === 'completed' || this.status === 'idle') {
      throw new TimerError('Cannot stop a timer that is not running or paused', 'INVALID_STATE');
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: 'idle',
      createdAt: this.createdAt,
      startedAt: undefined,
      pausedAt: undefined,
      completedAt: this.completedAt,
    });
  }

  /**
   * Complete the timer session
   */
  public complete(): TimerSessionEntity {
    if (this.status === 'completed') {
      return this;
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: 0,
      status: 'completed',
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      pausedAt: this.pausedAt,
      completedAt: new Date(),
    });
  }

  /**
   * Update the remaining time
   */
  public updateRemainingTime(remainingTime: number): TimerSessionEntity {
    if (remainingTime < 0) {
      return this.complete();
    }

    return new TimerSessionEntity({
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      pausedAt: this.pausedAt,
      completedAt: this.completedAt,
    });
  }

  /**
   * Check if the session is expired
   */
  public isExpired(): boolean {
    return this.remainingTime <= 0;
  }

  /**
   * Check if the session needs a warning (less than 1 minute remaining)
   */
  public needsWarning(): boolean {
    return this.remainingTime <= TIMER_CONFIG.WARNING_TIME && this.remainingTime > 0;
  }

  /**
   * Get the progress as a percentage
   */
  public getProgress(): number {
    if (this.duration === 0) return 100;
    return Math.max(0, Math.min(100, ((this.duration - this.remainingTime) / this.duration) * 100));
  }

  /**
   * Get the elapsed time in milliseconds
   */
  public getElapsedTime(): number {
    return this.duration - this.remainingTime;
  }

  /**
   * Validate timer session name
   */
  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Timer session name is required');
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new ValidationError('Timer session name cannot be empty');
    }

    if (trimmedName.length > 100) {
      throw new ValidationError('Timer session name cannot exceed 100 characters');
    }
  }

  /**
   * Validate timer session duration
   */
  private validateDuration(duration: number): void {
    if (typeof duration !== 'number' || !isFinite(duration)) {
      throw new ValidationError('Timer duration must be a valid number');
    }

    if (duration < TIMER_CONFIG.MIN_DURATION) {
      throw new ValidationError(
        `Timer duration must be at least ${TIMER_CONFIG.MIN_DURATION / 1000 / 60} minutes`
      );
    }

    if (duration > TIMER_CONFIG.MAX_DURATION) {
      throw new ValidationError(
        `Timer duration cannot exceed ${TIMER_CONFIG.MAX_DURATION / 1000 / 60} minutes`
      );
    }
  }

  /**
   * Convert to plain object for serialization
   */
  public toJSON(): TimerSession {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      pausedAt: this.pausedAt,
      completedAt: this.completedAt,
    };
  }
}
