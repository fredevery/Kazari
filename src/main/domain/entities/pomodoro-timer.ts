import {
  TimerConfig,
  TimerError,
  TimerPhase,
  TimerSession,
  TimerState
} from '@shared/types/timer';
import { generateId } from '../../shared/utils';

/**
 * Pomodoro Timer Entity
 * Core business logic for the Pomodoro timer system following Clean Architecture
 * Implements the three-phase timer (Planning, Focus, Break) with automatic transitions
 */
export class PomodoroTimerEntity {
  private readonly _state: TimerState;
  private readonly _config: TimerConfig;

  constructor(state: TimerState, config: TimerConfig) {
    this.validateState(state);
    this.validateConfig(config);

    this._state = { ...state };
    this._config = { ...config };
  }

  /**
   * Create a new Pomodoro timer with default configuration
   */
  public static create(config?: Partial<TimerConfig>): PomodoroTimerEntity {
    const defaultConfig: TimerConfig = {
      planningDuration: 5,
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartFocus: false,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const initialState: TimerState = {
      phase: 'planning',
      status: 'idle',
      remainingTime: finalConfig.planningDuration * 60 * 1000,
      totalTime: finalConfig.planningDuration * 60 * 1000,
      sessionCount: 0,
    };

    return new PomodoroTimerEntity(initialState, finalConfig);
  }

  /**
   * Start or resume the timer
   */
  public start(): PomodoroTimerEntity {
    if (this._state.status === 'running') {
      throw new TimerError('Timer is already running', 'INVALID_STATE');
    }

    const now = new Date();
    const newState: TimerState = {
      ...this._state,
      status: 'running',
      startTime: this._state.startTime || now,
      pausedTime: undefined,
    };

    return new PomodoroTimerEntity(newState, this._config);
  }

  /**
   * Pause the timer
   */
  public pause(): PomodoroTimerEntity {
    if (this._state.status !== 'running') {
      throw new TimerError('Can only pause a running timer', 'INVALID_STATE');
    }

    const newState: TimerState = {
      ...this._state,
      status: 'paused',
      pausedTime: new Date(),
    };

    return new PomodoroTimerEntity(newState, this._config);
  }

  /**
   * Reset the timer to the current phase's initial state
   */
  public reset(): PomodoroTimerEntity {
    const phaseDuration = this.getPhaseDuration(this._state.phase);
    const newState: TimerState = {
      ...this._state,
      status: 'idle',
      remainingTime: phaseDuration,
      totalTime: phaseDuration,
      startTime: undefined,
      pausedTime: undefined,
    };

    return new PomodoroTimerEntity(newState, this._config);
  }

  /**
   * Skip to the next phase
   */
  public skip(): PomodoroTimerEntity {
    const nextPhase = this.getNextPhase();
    const phaseDuration = this.getPhaseDuration(nextPhase);

    let sessionCount = this._state.sessionCount;
    if (this._state.phase === 'focus') {
      sessionCount += 1;
    }

    const newState: TimerState = {
      phase: nextPhase,
      status: 'idle',
      remainingTime: phaseDuration,
      totalTime: phaseDuration,
      sessionCount,
      startTime: undefined,
      pausedTime: undefined,
    };

    return new PomodoroTimerEntity(newState, this._config);
  }

  /**
   * Update the timer with elapsed time (called on each tick)
   */
  public tick(elapsedTime: number): { timer: PomodoroTimerEntity; phaseChanged: boolean; completedSession?: TimerSession } {
    if (this._state.status !== 'running') {
      return { timer: this, phaseChanged: false };
    }

    const newRemainingTime = Math.max(0, this._state.remainingTime - elapsedTime);

    // Check if phase is complete
    if (newRemainingTime <= 0) {
      return this.completePhase();
    }

    const newState: TimerState = {
      ...this._state,
      remainingTime: newRemainingTime,
    };

    return {
      timer: new PomodoroTimerEntity(newState, this._config),
      phaseChanged: false
    };
  }

  /**
   * Update configuration
   */
  public configure(newConfig: Partial<TimerConfig>): PomodoroTimerEntity {
    const updatedConfig = { ...this._config, ...newConfig };
    this.validateConfig(updatedConfig);

    // If currently idle and phase duration changed, update remaining time
    let newState = this._state;
    if (this._state.status === 'idle') {
      const newPhaseDuration = this.getPhaseDuration(this._state.phase, updatedConfig);
      newState = {
        ...this._state,
        remainingTime: newPhaseDuration,
        totalTime: newPhaseDuration,
      };
    }

    return new PomodoroTimerEntity(newState, updatedConfig);
  }

  /**
   * Check if timer needs a warning notification (last minute)
   */
  public needsWarning(): boolean {
    return this._state.remainingTime <= 60 * 1000 &&
      this._state.remainingTime > 59 * 1000 &&
      this._state.status === 'running';
  }

  /**
   * Get current timer state (immutable)
   */
  public getState(): TimerState {
    return { ...this._state };
  }

  /**
   * Get current configuration (immutable)
   */
  public getConfig(): TimerConfig {
    return { ...this._config };
  }

  /**
   * Get the duration for a specific phase
   */
  private getPhaseDuration(phase: TimerPhase, config?: TimerConfig): number {
    const activeConfig = config || this._config;

    switch (phase) {
      case 'planning':
        return activeConfig.planningDuration * 60 * 1000;
      case 'focus':
        return activeConfig.focusDuration * 60 * 1000;
      case 'break':
        return this.shouldUseLongBreak()
          ? activeConfig.longBreakDuration * 60 * 1000
          : activeConfig.breakDuration * 60 * 1000;
      default:
        throw new TimerError(`Invalid phase: ${phase}`, 'INVALID_PHASE');
    }
  }

  /**
   * Determine if this should be a long break
   */
  private shouldUseLongBreak(): boolean {
    return this._state.sessionCount > 0 &&
      this._state.sessionCount % this._config.longBreakInterval === 0;
  }

  /**
   * Get the next phase in the sequence
   */
  private getNextPhase(): TimerPhase {
    switch (this._state.phase) {
      case 'planning':
        return 'focus';
      case 'focus':
        return 'break';
      case 'break':
        return 'planning';
      default:
        throw new TimerError(`Invalid current phase: ${this._state.phase}`, 'INVALID_PHASE');
    }
  }

  /**
   * Complete the current phase and transition to next
   */
  private completePhase(): { timer: PomodoroTimerEntity; phaseChanged: boolean; completedSession?: TimerSession } {
    const currentPhase = this._state.phase;
    const nextPhase = this.getNextPhase();
    const nextPhaseDuration = this.getPhaseDuration(nextPhase);

    // Create session record for completed phase
    const completedSession: TimerSession = {
      id: generateId(),
      startTime: this._state.startTime!,
      endTime: new Date(),
      phase: currentPhase,
      completed: true,
      interrupted: false,
    };

    let sessionCount = this._state.sessionCount;
    if (currentPhase === 'focus') {
      sessionCount += 1;
    }

    // Determine if next phase should auto-start
    const shouldAutoStart = this.shouldAutoStartPhase(nextPhase);

    const newState: TimerState = {
      phase: nextPhase,
      status: shouldAutoStart ? 'running' : 'idle',
      remainingTime: nextPhaseDuration,
      totalTime: nextPhaseDuration,
      sessionCount,
      startTime: shouldAutoStart ? new Date() : undefined,
      pausedTime: undefined,
    };

    return {
      timer: new PomodoroTimerEntity(newState, this._config),
      phaseChanged: true,
      completedSession,
    };
  }

  /**
   * Determine if a phase should auto-start based on configuration
   */
  private shouldAutoStartPhase(phase: TimerPhase): boolean {
    switch (phase) {
      case 'break':
        return this._config.autoStartBreaks;
      case 'focus':
        return this._config.autoStartFocus;
      case 'planning':
        return false; // Planning phase never auto-starts
      default:
        return false;
    }
  }

  /**
   * Validate timer state
   */
  private validateState(state: TimerState): void {
    if (!state.phase || !['planning', 'focus', 'break'].includes(state.phase)) {
      throw new TimerError('Invalid timer phase', 'VALIDATION_ERROR');
    }

    if (!state.status || !['idle', 'running', 'paused'].includes(state.status)) {
      throw new TimerError('Invalid timer status', 'VALIDATION_ERROR');
    }

    if (state.remainingTime < 0) {
      throw new TimerError('Remaining time cannot be negative', 'VALIDATION_ERROR');
    }

    if (state.totalTime <= 0) {
      throw new TimerError('Total time must be positive', 'VALIDATION_ERROR');
    }

    if (state.sessionCount < 0) {
      throw new TimerError('Session count cannot be negative', 'VALIDATION_ERROR');
    }
  }

  /**
   * Validate timer configuration
   */
  private validateConfig(config: TimerConfig): void {
    if (config.planningDuration <= 0 || config.planningDuration > 60) {
      throw new TimerError('Planning duration must be between 1 and 60 minutes', 'VALIDATION_ERROR');
    }

    if (config.focusDuration <= 0 || config.focusDuration > 120) {
      throw new TimerError('Focus duration must be between 1 and 120 minutes', 'VALIDATION_ERROR');
    }

    if (config.breakDuration <= 0 || config.breakDuration > 60) {
      throw new TimerError('Break duration must be between 1 and 60 minutes', 'VALIDATION_ERROR');
    }

    if (config.longBreakDuration <= 0 || config.longBreakDuration > 120) {
      throw new TimerError('Long break duration must be between 1 and 120 minutes', 'VALIDATION_ERROR');
    }

    if (config.longBreakInterval <= 0 || config.longBreakInterval > 10) {
      throw new TimerError('Long break interval must be between 1 and 10 sessions', 'VALIDATION_ERROR');
    }
  }
}
