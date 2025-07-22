# Timer Precision

_Rules for implementing high-precision timers in Electron applications to ensure accurate time tracking, proper drift compensation, and reliable timer behavior across different system conditions._

## Context

**Applies to:** Electron applications, desktop productivity apps, time-tracking systems  
**Level:** Tactical - implementation patterns and precision requirements  
**Audience:** Electron developers, Frontend developers, Performance engineers

## Core Principles

1. **High-Resolution Timing:** Use high-resolution timestamps for accurate time measurements
2. **Drift Compensation:** Compensate for timer drift caused by system sleep, load, and JavaScript limitations
3. **Consistent Behavior:** Ensure timer behavior is predictable across different operating systems
4. **System Resilience:** Handle system sleep/wake cycles and time zone changes gracefully

## Rules

### Must Have (Critical)

- **RULE-001:** Use `performance.now()` or `process.hrtime()` for high-resolution timestamps, never `Date.now()`
- **RULE-002:** Implement drift compensation by calculating actual elapsed time vs expected time
- **RULE-003:** Handle system sleep/wake events to pause and resume timers accurately
- **RULE-004:** Validate timer state consistency after system events (sleep, time changes)
- **RULE-005:** Use interval-based updates with drift correction, not cumulative intervals
- **RULE-006:** Implement maximum drift tolerance thresholds with automatic correction
- **RULE-007:** Persist timer state with high-resolution timestamps for recovery

### Should Have (Important)

- **RULE-101:** Implement background tick detection to handle system sleep scenarios
- **RULE-102:** Use exponential moving averages to smooth out timing variations
- **RULE-103:** Add timer performance monitoring and drift analytics

### Could Have (Preferred)

- **RULE-201:** Implement adaptive timer intervals based on system performance
- **RULE-202:** Add timer synchronization across multiple windows or processes

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// High-precision timer implementation
class PrecisionTimer {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private lastTickTime: number = 0;
  private expectedElapsed: number = 0;
  private actualElapsed: number = 0;
  private maxDrift: number = 1000; // 1 second max drift
  private interval: NodeJS.Timeout | null = null;
  
  start(): void {
    this.startTime = performance.now();
    this.lastTickTime = this.startTime;
    this.expectedElapsed = 0;
    this.actualElapsed = 0;
    
    // Start with 100ms intervals for smooth updates
    this.interval = setInterval(() => this.tick(), 100);
    
    // Handle system sleep/wake events
    this.setupSystemEventHandlers();
  }
  
  private tick(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTickTime;
    
    // Check for system sleep (gap > 2 seconds indicates sleep)
    if (deltaTime > 2000) {
      this.handleSystemSleep(deltaTime);
      return;
    }
    
    // Calculate expected vs actual elapsed time
    this.expectedElapsed += 100; // Expected 100ms intervals
    this.actualElapsed = currentTime - this.startTime - this.pausedTime;
    
    // Apply drift compensation
    const drift = this.actualElapsed - this.expectedElapsed;
    if (Math.abs(drift) > this.maxDrift) {
      this.correctDrift(drift);
    }
    
    this.lastTickTime = currentTime;
    this.updateDisplay();
  }
  
  private handleSystemSleep(gapTime: number): void {
    // System was asleep - add gap to paused time
    this.pausedTime += gapTime;
    this.lastTickTime = performance.now();
    
    // Validate timer state after sleep
    this.validateTimerState();
  }
  
  private correctDrift(drift: number): void {
    // Correct drift by adjusting expected elapsed time
    this.expectedElapsed = this.actualElapsed;
    
    // Log drift for monitoring
    logger.warn('Timer drift corrected', { drift, maxDrift: this.maxDrift });
  }
  
  private validateTimerState(): void {
    // Ensure timer state is consistent
    if (this.actualElapsed < 0) {
      this.actualElapsed = 0;
      this.expectedElapsed = 0;
    }
  }
  
  private setupSystemEventHandlers(): void {
    // Handle system sleep/wake events (Node.js)
    if (process.platform === 'darwin') {
      process.on('SIGTERM', () => this.handleSystemSleep(0));
      process.on('SIGCONT', () => this.handleSystemWake());
    }
  }
  
  private handleSystemWake(): void {
    // Recalibrate timer after wake
    this.lastTickTime = performance.now();
    this.validateTimerState();
  }
  
  pause(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.pausedTime += performance.now() - this.startTime;
  }
  
  getElapsedTime(): number {
    if (this.interval) {
      // Timer is running
      return performance.now() - this.startTime - this.pausedTime;
    } else {
      // Timer is paused
      return this.actualElapsed;
    }
  }
  
  private updateDisplay(): void {
    const elapsed = this.getElapsedTime();
    // Update UI with precise elapsed time
    this.onTick(elapsed);
  }
  
  private onTick(elapsed: number): void {
    // Override this method to handle timer updates
  }
}

// Timer state persistence with high precision
interface TimerPersistenceState {
  startTime: number;
  pausedTime: number;
  expectedElapsed: number;
  actualElapsed: number;
  lastSaveTime: number;
}

class TimerPersistence {
  private static readonly STORAGE_KEY = 'timer-precision-state';
  
  static async save(timer: PrecisionTimer): Promise<void> {
    const state: TimerPersistenceState = {
      startTime: timer.startTime,
      pausedTime: timer.pausedTime,
      expectedElapsed: timer.expectedElapsed,
      actualElapsed: timer.actualElapsed,
      lastSaveTime: performance.now()
    };
    
    await fs.writeFile(
      path.join(app.getPath('userData'), 'timer-state.json'),
      JSON.stringify(state)
    );
  }
  
  static async restore(): Promise<TimerPersistenceState | null> {
    try {
      const data = await fs.readFile(
        path.join(app.getPath('userData'), 'timer-state.json'),
        'utf8'
      );
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
}
```

### ❌ Don't Do This

```typescript
// Don't use Date.now() for precision timing
let startTime = Date.now(); // Low precision, affected by system clock changes

// Don't use cumulative intervals without drift correction
setInterval(() => {
  elapsed += 1000; // Accumulates drift over time
}, 1000);

// Don't ignore system sleep/wake events
setInterval(() => {
  // Timer continues during system sleep
  updateTimer();
}, 1000);

// Don't use setTimeout chains without drift compensation
function tick() {
  setTimeout(tick, 1000); // Drift accumulates
}
```

## Decision Framework

**When implementing timer precision:**

1. **Choose timing method:** Use performance.now() for sub-millisecond precision
2. **Set drift tolerance:** Define acceptable drift thresholds (typically 100-1000ms)
3. **Handle edge cases:** Plan for system sleep, time zone changes, clock adjustments
4. **Monitor performance:** Track drift patterns and system-specific behavior

**When handling system events:**

- Detect system sleep through timing gaps
- Validate timer state after system events
- Implement graceful recovery from timing anomalies
- Log timing issues for debugging and optimization

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Simple countdown timers where high precision isn't critical
- Timers with durations less than 1 second where drift is negligible
- Development/testing environments where precision monitoring is disabled

**Process for exceptions:**

1. Document the precision requirements and acceptable drift
2. Implement basic drift monitoring even for low-precision timers
3. Plan for future precision upgrades when requirements change

## Quality Gates

- **Automated checks:** Unit tests verify drift compensation algorithms, integration tests validate system event handling
- **Code review focus:** Verify high-resolution timing usage, drift compensation logic, system event handling
- **Testing requirements:** Performance tests under various system loads, sleep/wake cycle testing
- **Monitoring:** Track timer drift patterns, system event frequency, precision degradation

## Related Rules

- `rules/electron-main-process.md` - Main process timer implementation requirements
- `rules/state-management.md` - Timer state persistence and synchronization
- `rules/error-handling.md` - Error handling for timer anomalies and system events

## References

- [Performance API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Performance) - High-resolution timing
- [Node.js hrtime Documentation](https://nodejs.org/api/process.html#processhrtimetime) - High-resolution time measurements
- [Electron Power Monitor](https://www.electronjs.org/docs/latest/api/power-monitor) - System sleep/wake event handling

---

## TL;DR

**Key Principles:**

- Use high-resolution timestamps (performance.now()) for accurate timing
- Implement drift compensation by comparing expected vs actual elapsed time
- Handle system sleep/wake events to maintain timer accuracy
- Validate timer state consistency after system events

**Critical Rules:**

- Must use performance.now() or process.hrtime() for timing (RULE-001)
- Must implement drift compensation algorithms (RULE-002)
- Must handle system sleep/wake events (RULE-003)
- Must validate timer state after system events (RULE-004)

**Quick Decision Guide:**
When in doubt: Ask "Does this timer need to be accurate within 1 second over a 25-minute period?" If yes, implement full precision handling.

**Before You Code Checklist:**
- [ ] High-resolution timing methods implemented
- [ ] Drift compensation algorithms in place
- [ ] System sleep/wake event handling implemented
- [ ] Timer state validation after system events
- [ ] Performance monitoring and drift logging enabled
