# Notifications System for Phase Transitions and Session Management

_Implement a comprehensive notifications system for the Kazari Electron application that provides timely, accessible, and contextually appropriate notifications for phase transitions, break reminders, session completion, and other productivity events while respecting user preferences and focus sessions._

## Requirements

- Implement native OS notification system with fallback to in-app notifications when system notifications are unavailable
- Create notification types for focus phase transitions (planning → focus → break), session completion, break reminders, and overrun warnings
- Provide comprehensive user preferences for notification types, timing, sounds, and visual styles
- Ensure notifications respect Do Not Disturb settings and focus session states to avoid unnecessary disruption
- Implement interactive notification actions (snooze break, extend session, mark task complete, start next session)
- Support rich notifications with custom icons, sounds, and action buttons across all platforms
- Create accessible notifications that work with screen readers and follow WCAG guidelines
- Implement notification history and persistence for users to review missed notifications
- Add notification queuing and rate limiting to prevent notification spam during rapid state changes
- Integrate with timer system to provide precise timing-based notifications with drift compensation

## Rules

- rules/notification-system.md
- rules/timer-precision.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/error-handling.md
- rules/typescript-standards.md

## Domain

```typescript
// Notification types and configuration
enum NotificationType {
  PHASE_TRANSITION = 'phase_transition',
  SESSION_COMPLETE = 'session_complete',
  BREAK_REMINDER = 'break_reminder',
  BREAK_OVERRUN = 'break_overrun',
  TASK_REMINDER = 'task_reminder',
  DAILY_SUMMARY = 'daily_summary'
}

enum DeliveryMethod {
  SYSTEM_NATIVE = 'system_native',
  IN_APP_BANNER = 'in_app_banner',
  IN_APP_MODAL = 'in_app_modal',
  AUDIO_ONLY = 'audio_only',
  DISABLED = 'disabled'
}

interface NotificationRequest {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  sound?: string;
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  requireInteraction: boolean;
  silent: boolean;
  scheduledTime?: Date;
  context: NotificationContext;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationContext {
  sessionId: string;
  phase: 'planning' | 'focus' | 'break';
  taskId?: string;
  remainingTime?: number;
  overrunTime?: number;
  metadata?: Record<string, any>;
}

interface NotificationPreferences {
  deliveryMethods: Record<NotificationType, DeliveryMethod>;
  respectDoNotDisturb: boolean;
  quietHours: { start: string; end: string } | null;
  sounds: Record<NotificationType, string>;
  vibration: boolean;
  showOnLockScreen: boolean;
  persistHistory: boolean;
  maxHistoryDays: number;
}

interface NotificationService {
  initialize(): Promise<void>;
  showNotification(request: NotificationRequest): Promise<void>;
  scheduleNotification(request: NotificationRequest, delay: number): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  getNotificationHistory(limit?: number): Promise<NotificationRecord[]>;
  updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void>;
  testNotification(type: NotificationType): Promise<void>;
}
```

## Extra Considerations

- Notification timing must be synchronized with high-precision timer events to ensure accuracy
- Focus session notifications should not interrupt the user during active focus periods unless critical
- Break reminder notifications should be progressive (gentle reminder → more urgent → overrun warnings)
- Notification sounds should be carefully selected to be alerting but not jarring during focus sessions
- System notification permissions must be requested gracefully with clear explanations of benefits
- Notification content should be contextual and actionable rather than purely informational
- Consider cultural and accessibility preferences for notification timing and presentation
- Implement notification batching for rapid successive events (e.g., multiple timer state changes)
- Ensure notification system works correctly across all supported platforms (macOS, Windows, Linux)
- Notification preferences should sync across application sessions and be easily discoverable

## Testing Considerations

- Unit tests for notification service logic, preference handling, and scheduling mechanisms
- Integration tests for IPC communication between notification service and renderer processes
- Cross-platform testing for native OS notification behavior and appearance
- Accessibility testing with screen readers and assistive technologies
- User experience testing for notification timing, interruption patterns, and recovery flows
- Performance testing for notification queuing, rate limiting, and memory usage
- Manual testing of Do Not Disturb scenarios, system sleep/wake, and permission handling
- End-to-end testing of complete notification flows from timer events to user actions
- Load testing notification system under high-frequency timer events

## Implementation Notes

- Use Electron's native Notification API as the primary notification method with fallback strategies
- Implement notification service in the main process with IPC communication to renderers
- Use high-resolution timers to ensure notification timing accuracy and prevent drift
- Store notification preferences in persistent storage with migration strategies for updates
- Implement notification templates for consistent messaging and localization support
- Use event-driven architecture for decoupled notification triggering from timer and session events
- Implement proper error handling and graceful degradation when notification APIs are unavailable
- Consider using Web Workers for notification scheduling to avoid blocking the main thread
- Implement notification analytics to understand user engagement and optimize notification strategies
- Use TypeScript discriminated unions for type-safe notification request handling

## Specification by Example

### Phase Transition Notifications
```typescript
// Focus session starting notification
const focusStartNotification: NotificationRequest = {
  id: 'focus-start-123',
  type: NotificationType.PHASE_TRANSITION,
  title: '🎯 Focus Session Started',
  body: 'Working on: Implement user authentication. Duration: 25 minutes',
  icon: 'focus-icon.png',
  sound: 'focus-start.wav',
  priority: 'normal',
  requireInteraction: false,
  silent: false,
  actions: [
    { action: 'adjust-timer', title: 'Adjust Timer', icon: 'timer-icon.png' },
    { action: 'skip-session', title: 'Skip Session', icon: 'skip-icon.png' }
  ],
  context: {
    sessionId: 'session-123',
    phase: 'focus',
    taskId: 'task-456',
    remainingTime: 25 * 60 * 1000
  }
};

// Break reminder with overrun warning
const breakOverrunNotification: NotificationRequest = {
  id: 'break-overrun-123',
  type: NotificationType.BREAK_OVERRUN,
  title: '⏰ Break Time Over',
  body: 'Your break ended 2 minutes ago. Ready to get back to focus?',
  priority: 'high',
  requireInteraction: true,
  silent: false,
  actions: [
    { action: 'start-focus', title: 'Start Focus', icon: 'focus-icon.png' },
    { action: 'extend-break', title: 'Extend Break', icon: 'extend-icon.png' }
  ],
  context: {
    sessionId: 'session-123',
    phase: 'break',
    overrunTime: 2 * 60 * 1000
  }
};
```

### Notification Service Implementation
```typescript
class ElectronNotificationService implements NotificationService {
  private preferences: NotificationPreferences;
  private notificationQueue: Map<string, NotificationRequest> = new Map();
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  async showNotification(request: NotificationRequest): Promise<void> {
    // Check if notifications are enabled for this type
    if (!this.shouldShowNotification(request)) {
      return;
    }

    // Handle delivery method based on user preferences
    const deliveryMethod = this.preferences.deliveryMethods[request.type];
    
    switch (deliveryMethod) {
      case DeliveryMethod.SYSTEM_NATIVE:
        await this.showSystemNotification(request);
        break;
      case DeliveryMethod.IN_APP_BANNER:
        await this.showInAppNotification(request, 'banner');
        break;
      case DeliveryMethod.IN_APP_MODAL:
        await this.showInAppNotification(request, 'modal');
        break;
      case DeliveryMethod.AUDIO_ONLY:
        await this.playNotificationSound(request.sound);
        break;
      default:
        // Disabled - do nothing
        break;
    }

    // Store in history if enabled
    if (this.preferences.persistHistory) {
      await this.addToHistory(request);
    }
  }

  private shouldShowNotification(request: NotificationRequest): boolean {
    // Check Do Not Disturb
    if (this.preferences.respectDoNotDisturb && this.isDoNotDisturbActive()) {
      return request.priority === 'critical';
    }

    // Check quiet hours
    if (this.preferences.quietHours && this.isQuietHours()) {
      return request.priority === 'critical';
    }

    // Check focus session state
    if (this.isInFocusSession() && request.type !== NotificationType.SESSION_COMPLETE) {
      return request.priority === 'critical';
    }

    return true;
  }
}
```

### User Preference Configuration
```typescript
// Notification preferences interface
const defaultPreferences: NotificationPreferences = {
  deliveryMethods: {
    [NotificationType.PHASE_TRANSITION]: DeliveryMethod.SYSTEM_NATIVE,
    [NotificationType.SESSION_COMPLETE]: DeliveryMethod.SYSTEM_NATIVE,
    [NotificationType.BREAK_REMINDER]: DeliveryMethod.IN_APP_BANNER,
    [NotificationType.BREAK_OVERRUN]: DeliveryMethod.SYSTEM_NATIVE,
    [NotificationType.TASK_REMINDER]: DeliveryMethod.IN_APP_BANNER,
    [NotificationType.DAILY_SUMMARY]: DeliveryMethod.SYSTEM_NATIVE
  },
  respectDoNotDisturb: true,
  quietHours: { start: '22:00', end: '08:00' },
  sounds: {
    [NotificationType.PHASE_TRANSITION]: 'gentle-chime.wav',
    [NotificationType.SESSION_COMPLETE]: 'success-bell.wav',
    [NotificationType.BREAK_REMINDER]: 'soft-reminder.wav',
    [NotificationType.BREAK_OVERRUN]: 'urgent-alert.wav',
    [NotificationType.TASK_REMINDER]: 'gentle-ping.wav',
    [NotificationType.DAILY_SUMMARY]: 'summary-chime.wav'
  },
  vibration: true,
  showOnLockScreen: false,
  persistHistory: true,
  maxHistoryDays: 7
};
```

### Accessibility Implementation
```typescript
// Accessible notification with ARIA support
const accessibleNotification = {
  ...baseNotification,
  // Use clear, descriptive language
  title: 'Focus session completed successfully',
  body: 'You focused for 25 minutes on implementing user authentication. Great work! Take a 5-minute break.',
  
  // Provide alternative text for icons
  ariaLabel: 'Focus session completion notification with options to start break or continue working',
  
  // Ensure sufficient contrast and readable fonts in custom UI
  accessibilityFeatures: {
    highContrast: true,
    largeText: true,
    reducedMotion: true
  }
};
```
