import {
  NotificationService,
  PomodoroTimerService,
  Result,
  TimerConfig,
  TimerError,
  TimerPhase,
  TimerSession,
  TimerState,
  TimerStatistics
} from '@shared/types/timer';
import { EventEmitter } from 'events';
import { PomodoroTimerEntity } from '../../domain/entities/pomodoro-timer';
import { PomodoroTimerRepositoryImpl } from '../../infrastructure/repositories/pomodoro-timer-repository-impl';

/**
 * Pomodoro Timer Service Implementation
 * Manages the core Pomodoro timer logic running in the main process
 * Handles high-precision timing, state persistence, and event broadcasting
 */
export class PomodoroTimerServiceImpl extends EventEmitter implements PomodoroTimerService {
  private timer: PomodoroTimerEntity;
  private intervalId: NodeJS.Timeout | null = null;
  private highPrecisionIntervalId: NodeJS.Timeout | null = null;
  private tickInterval: NodeJS.Timeout | null = null;
  private startTime: bigint | null = null;
  private lastTickTime: bigint | null = null;
  private isInitialized: boolean = false;

  private readonly TICK_INTERVAL_MS = 1000;
  private readonly HIGH_PRECISION_INTERVAL_MS = 100;

  constructor(
    private readonly pomodoroRepository: PomodoroTimerRepositoryImpl,
    private readonly notificationService: NotificationService
  ) {
    super();

    // Initialize with default timer - will be loaded from persistence in init()
    this.timer = PomodoroTimerEntity.create();
  }

  /**
   * Initialize the service and load persisted state
   */
  public async initialize(): Promise<Result<void, TimerError>> {
    try {
      // Load persisted state - for now using empty state until persistence is implemented
      // TODO: Implement proper state persistence
      this.timer = PomodoroTimerEntity.create();
      this.isInitialized = true;
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'InitializationError',
          code: 'INITIALIZATION_ERROR',
          message: `Failed to initialize timer service: ${error}`,
        },
      };
    }
  }

  /**
   * Start or resume the timer
   */
  public async start(): Promise<Result<TimerState, TimerError>> {
    try {
      this.timer = this.timer.start();
      await this.persistState();

      this.startTicking();
      this.emit('stateChange', this.timer.getState());

      return {
        success: true,
        data: this.timer.getState(),
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to start timer', 'START_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Pause the timer
   */
  public async pause(): Promise<Result<TimerState, TimerError>> {
    try {
      this.timer = this.timer.pause();
      await this.persistState();

      this.stopTicking();
      this.emit('stateChange', this.timer.getState());

      return {
        success: true,
        data: this.timer.getState(),
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to pause timer', 'PAUSE_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Reset the timer to current phase's initial state
   */
  public async reset(): Promise<Result<TimerState, TimerError>> {
    try {
      this.timer = this.timer.reset();
      await this.persistState();

      this.stopTicking();
      this.emit('stateChange', this.timer.getState());

      return {
        success: true,
        data: this.timer.getState(),
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to reset timer', 'RESET_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Skip to the next phase
   */
  public async skip(): Promise<Result<TimerState, TimerError>> {
    try {
      const previousPhase = this.timer.getState().phase;
      this.timer = this.timer.skip();
      const newState = this.timer.getState();

      await this.persistState();
      this.stopTicking();

      // Emit phase change event
      this.emit('phaseChange', previousPhase, newState.phase, newState);
      this.emit('stateChange', newState);

      // Show phase transition notification
      await this.notificationService.showPhaseTransition(previousPhase, newState.phase);

      return {
        success: true,
        data: newState,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to skip phase', 'SKIP_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Update timer configuration
   */
  public async configure(config: Partial<TimerConfig>): Promise<Result<TimerConfig, TimerError>> {
    try {
      this.timer = this.timer.configure(config);
      const newConfig = this.timer.getConfig();

      await Promise.all([
        // TODO: Implement config persistence
        this.persistState()
      ]);

      this.emit('stateChange', this.timer.getState());

      return {
        success: true,
        data: newConfig,
      };
    } catch (error) {
      const timerError = error instanceof TimerError ? error : new TimerError('Failed to configure timer', 'CONFIG_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Get current timer state
   */
  public async getState(): Promise<Result<TimerState, TimerError>> {
    try {
      return {
        success: true,
        data: this.timer.getState(),
      };
    } catch (error) {
      const timerError = new TimerError('Failed to get timer state', 'STATE_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Get timer statistics
   */
  public async getStatistics(): Promise<Result<TimerStatistics, TimerError>> {
    try {
      const statistics = await this.pomodoroRepository.getStatistics();
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      const timerError = new TimerError('Failed to get timer statistics', 'STATISTICS_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Get session history
   */
  public async getHistory(): Promise<Result<readonly TimerSession[], TimerError>> {
    try {
      const history = await this.pomodoroRepository.getSessions();
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      const timerError = new TimerError('Failed to get session history', 'HISTORY_FAILED');
      return {
        success: false,
        error: timerError,
      };
    }
  }

  /**
   * Subscribe to timer tick events
   */
  public onTick(callback: (state: TimerState) => void): () => void {
    this.on('tick', callback);
    return () => this.off('tick', callback);
  }

  /**
   * Subscribe to phase change events
   */
  public onPhaseChange(callback: (fromPhase: TimerPhase, toPhase: TimerPhase, state: TimerState) => void): () => void {
    this.on('phaseChange', callback);
    return () => this.off('phaseChange', callback);
  }

  /**
   * Subscribe to state change events
   */
  public onStateChange(callback: (state: TimerState) => void): () => void {
    this.on('stateChange', callback);
    return () => this.off('stateChange', callback);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopTicking();
    this.removeAllListeners();
  }

  /**
   * Start the high-precision timer ticking
   */
  private startTicking(): void {
    this.stopTicking(); // Ensure no duplicate intervals

    this.lastTickTime = process.hrtime.bigint();

    this.tickInterval = setInterval(() => {
      this.performTick().catch(error => {
        console.error('Error during timer tick:', error);
      });
    }, this.HIGH_PRECISION_INTERVAL_MS);
  }

  /**
   * Stop the timer ticking
   */
  private stopTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Perform a single timer tick with high precision
   */
  private async performTick(): Promise<void> {
    const currentTime = process.hrtime.bigint();
    const elapsedMs = this.lastTickTime ? Number(currentTime - this.lastTickTime) / 1_000_000 : 1000;
    this.lastTickTime = currentTime;

    const { timer, phaseChanged, completedSession } = this.timer.tick(elapsedMs);

    // Check if we need to emit a warning
    const needsWarning = this.timer.needsWarning();

    this.timer = timer;
    const currentState = this.timer.getState();

    // Persist state periodically (every second to avoid excessive I/O)
    if (Math.floor(Date.now() / 1000) !== Math.floor((Date.now() - elapsedMs) / 1000)) {
      await this.persistState();
    }

    // Emit tick event for UI updates
    this.emit('tick', currentState);

    // Handle warning notification
    if (needsWarning) {
      await this.notificationService.showTimerWarning(
        currentState.phase,
        currentState.remainingTime
      );
    }

    // Handle phase change
    if (phaseChanged && completedSession) {
      // Save completed session
      await this.pomodoroRepository.saveSession(completedSession);

      // Emit phase change event
      this.emit('phaseChange', completedSession.phase, currentState.phase, currentState);

      // Show phase transition notification
      await this.notificationService.showPhaseTransition(completedSession.phase, currentState.phase);

      // If new phase is not auto-started, stop ticking
      if (currentState.status !== 'running') {
        this.stopTicking();
      }
    }

    // Emit general state change
    this.emit('stateChange', currentState);
  }

  /**
   * Persist current timer state
   */
  private async persistState(): Promise<void> {
    try {
      // TODO: Implement state persistence
    } catch (error) {
      console.error('Failed to persist timer state:', error);
    }
  }

  /**
   * Setup system event handlers for sleep/wake
   */
  private setupSystemEventHandlers(): void {
    // Handle system suspend/resume events
    if (process.platform === 'darwin' || process.platform === 'win32') {
      process.on('SIGTERM', this.handleSystemSuspend.bind(this));
      process.on('SIGCONT', this.handleSystemResume.bind(this));
    }

    // Handle power monitor events if available (Electron main process)
    try {
      const { powerMonitor } = require('electron');
      if (powerMonitor) {
        powerMonitor.on('suspend', this.handleSystemSuspend.bind(this));
        powerMonitor.on('resume', this.handleSystemResume.bind(this));
      }
    } catch {
      // Power monitor not available
    }
  }

  /**
   * Handle system suspend - pause timer if running
   */
  private async handleSystemSuspend(): Promise<void> {
    if (this.timer.getState().status === 'running') {
      await this.pause();
    }
  }

  /**
   * Handle system resume - optionally resume timer
   */
  private async handleSystemResume(): Promise<void> {
    // Timer will remain paused - user needs to manually resume
    // This prevents unwanted time loss during system sleep
  }
}
