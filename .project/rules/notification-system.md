# Notification System

_Rules for implementing cross-platform notification systems in Electron applications to ensure reliable user alerts, proper system integration, and consistent behavior across operating systems._

## Context

**Applies to:** Electron applications, desktop productivity apps, user notification systems  
**Level:** Tactical - implementation patterns and system integration  
**Audience:** Electron developers, UX designers, Desktop application developers

## Core Principles

1. **System Integration:** Use native OS notification APIs for consistent user experience
2. **Progressive Fallback:** Provide fallback mechanisms when native notifications are unavailable
3. **User Control:** Respect user preferences and system notification settings
4. **Accessibility:** Ensure notifications are accessible to users with disabilities

## Rules

### Must Have (Critical)

- **RULE-001:** Use Electron's native notification API as primary notification method
- **RULE-002:** Implement fallback to in-app notifications when system notifications are disabled
- **RULE-003:** Request notification permissions explicitly and handle denials gracefully
- **RULE-004:** Respect system Do Not Disturb settings and notification preferences
- **RULE-005:** Provide notification sound options with system sound integration
- **RULE-006:** Implement notification action buttons for interactive notifications
- **RULE-007:** Handle notification click events to focus or open relevant application windows

### Should Have (Important)

- **RULE-101:** Implement notification queuing to prevent notification spam
- **RULE-102:** Support rich notifications with icons, images, and custom styling
- **RULE-103:** Add notification persistence across application restarts
- **RULE-104:** Implement notification history for users to review missed notifications

### Could Have (Preferred)

- **RULE-201:** Support custom notification sounds and sound libraries
- **RULE-202:** Implement notification scheduling for future delivery

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Notification service with fallback mechanisms
class NotificationService {
  private notificationQueue: NotificationRequest[] = [];
  private isSystemNotificationsEnabled: boolean = false;
  private notificationHistory: NotificationRecord[] = [];
  
  async initialize(): Promise<void> {
    // Check system notification availability
    this.isSystemNotificationsEnabled = await this.checkNotificationPermission();
    
    // Setup notification handlers
    this.setupNotificationHandlers();
  }
  
  private async checkNotificationPermission(): Promise<boolean> {
    if (!Notification) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  async showNotification(request: NotificationRequest): Promise<void> {
    // Add to history
    this.addToHistory(request);
    
    // Check if system notifications are available
    if (this.isSystemNotificationsEnabled && !this.isDoNotDisturbActive()) {
      await this.showSystemNotification(request);
    } else {
      // Fallback to in-app notification
      await this.showInAppNotification(request);
    }
  }
  
  private async showSystemNotification(request: NotificationRequest): Promise<void> {
    try {
      const notification = new Notification(request.title, {
        body: request.body,
        icon: request.icon || this.getDefaultIcon(),
        sound: request.sound || 'default',
        actions: request.actions || [],
        requireInteraction: request.requireInteraction || false,
        silent: request.silent || false
      });
      
      // Handle notification events
      notification.onclick = () => {
        this.handleNotificationClick(request);
      };
      
      notification.onclose = () => {
        this.handleNotificationClose(request);
      };
      
      // Handle action button clicks
      notification.addEventListener('notificationclick', (event) => {
        this.handleNotificationAction(request, event.action);
      });
      
    } catch (error) {
      logger.error('System notification failed', { error, request });
      // Fallback to in-app notification
      await this.showInAppNotification(request);
    }
  }
  
  private async showInAppNotification(request: NotificationRequest): Promise<void> {
    // Send to renderer process for in-app display
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('notification:show-in-app', {
        ...request,
        id: this.generateNotificationId(),
        timestamp: Date.now()
      });
    });
    
    // Play sound if requested
    if (request.sound && !request.silent) {
      await this.playNotificationSound(request.sound);
    }
  }
  
  private handleNotificationClick(request: NotificationRequest): void {
    // Focus application window
    const mainWindow = BrowserWindow.getAllWindows().find(w => w.isVisible());
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
    
    // Execute callback if provided
    if (request.onClick) {
      request.onClick(request);
    }
    
    // Send event to renderer process
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('notification:clicked', request);
    });
  }
  
  private handleNotificationAction(request: NotificationRequest, action: string): void {
    // Handle action button clicks
    if (request.onAction) {
      request.onAction(action, request);
    }
    
    // Send action event to renderer process
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('notification:action', { action, request });
    });
  }
  
  private isDoNotDisturbActive(): boolean {
    // Check system Do Not Disturb status (platform-specific)
    if (process.platform === 'darwin') {
      // macOS Do Not Disturb check
      return this.checkMacOSDoNotDisturb();
    } else if (process.platform === 'win32') {
      // Windows Quiet Hours check
      return this.checkWindowsQuietHours();
    }
    
    return false;
  }
  
  private checkMacOSDoNotDisturb(): boolean {
    // Implement macOS Do Not Disturb detection
    // This would require native module or system call
    return false;
  }
  
  private checkWindowsQuietHours(): boolean {
    // Implement Windows Quiet Hours detection
    return false;
  }
  
  private async playNotificationSound(soundName: string): Promise<void> {
    try {
      // Play system sound or custom sound
      if (soundName === 'default') {
        // Use system default notification sound
        require('child_process').exec('afplay /System/Library/Sounds/Glass.aiff');
      } else {
        // Play custom sound file
        const soundPath = path.join(app.getPath('userData'), 'sounds', `${soundName}.wav`);
        require('child_process').exec(`afplay "${soundPath}"`);
      }
    } catch (error) {
      logger.warn('Failed to play notification sound', { error, soundName });
    }
  }
  
  private addToHistory(request: NotificationRequest): void {
    const record: NotificationRecord = {
      ...request,
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      read: false
    };
    
    this.notificationHistory.unshift(record);
    
    // Limit history size
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }
    
    // Persist history
    this.saveNotificationHistory();
  }
  
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private setupNotificationHandlers(): void {
    // IPC handlers for renderer process
    ipcMain.handle('notification:show', async (event, request: NotificationRequest) => {
      await this.showNotification(request);
    });
    
    ipcMain.handle('notification:get-history', () => {
      return this.notificationHistory;
    });
    
    ipcMain.handle('notification:mark-read', (event, notificationId: string) => {
      const notification = this.notificationHistory.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveNotificationHistory();
      }
    });
  }
  
  private async saveNotificationHistory(): Promise<void> {
    try {
      const historyPath = path.join(app.getPath('userData'), 'notification-history.json');
      await fs.writeFile(historyPath, JSON.stringify(this.notificationHistory));
    } catch (error) {
      logger.error('Failed to save notification history', { error });
    }
  }
}

// Type definitions
interface NotificationRequest {
  title: string;
  body: string;
  icon?: string;
  sound?: string;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  onClick?: (request: NotificationRequest) => void;
  onAction?: (action: string, request: NotificationRequest) => void;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationRecord extends NotificationRequest {
  id: string;
  timestamp: number;
  read: boolean;
}

// Timer-specific notification helpers
class TimerNotificationService extends NotificationService {
  showPhaseTransition(fromPhase: string, toPhase: string): void {
    this.showNotification({
      title: 'Timer Phase Change',
      body: `Switching from ${fromPhase} to ${toPhase}`,
      icon: this.getPhaseIcon(toPhase),
      sound: 'phase-transition',
      actions: [
        { action: 'pause', title: 'Pause' },
        { action: 'skip', title: 'Skip Phase' }
      ],
      onAction: (action) => {
        if (action === 'pause') {
          this.sendTimerAction('pause');
        } else if (action === 'skip') {
          this.sendTimerAction('skip');
        }
      }
    });
  }
  
  private getPhaseIcon(phase: string): string {
    const icons = {
      'focus': 'timer-focus.png',
      'break': 'timer-break.png',
      'planning': 'timer-planning.png'
    };
    return icons[phase] || 'timer-default.png';
  }
  
  private sendTimerAction(action: string): void {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('timer:action', action);
    });
  }
}
```

### ❌ Don't Do This

```typescript
// Don't create notifications without permission checks
new Notification('Title', { body: 'Body' }); // Might fail silently

// Don't spam notifications without queuing
for (let i = 0; i < 10; i++) {
  new Notification(`Message ${i}`); // Overwhelming user
}

// Don't ignore system settings
new Notification('Title', { 
  requireInteraction: true, 
  silent: false 
}); // Ignores Do Not Disturb

// Don't use notifications for debugging
new Notification('Debug', { body: JSON.stringify(debugData) }); // Wrong use case
```

## Decision Framework

**When implementing notifications:**

1. **Check availability:** Verify system notification support and permissions
2. **Respect user preferences:** Honor system settings and user notification preferences
3. **Plan fallbacks:** Implement in-app notifications when system notifications fail
4. **Consider timing:** Queue notifications to prevent spam and respect Do Not Disturb

**When designing notification content:**

- Keep titles concise and descriptive
- Use body text for additional context
- Provide relevant action buttons
- Choose appropriate sounds and icons

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Critical system alerts that must override Do Not Disturb settings
- Development/debugging scenarios requiring immediate notification feedback
- Accessibility requirements that need alternative notification methods

**Process for exceptions:**

1. Document why standard notification flow is insufficient
2. Implement additional user controls for exceptional notifications
3. Add clear user communication about notification behavior

## Quality Gates

- **Automated checks:** Unit tests verify notification permission handling, fallback mechanisms work correctly
- **Code review focus:** Verify proper permission requests, fallback implementations, user preference respect
- **Testing requirements:** Cross-platform testing, Do Not Disturb scenario testing, accessibility testing
- **User experience:** Notification timing, content clarity, action button effectiveness

## Related Rules

- `rules/electron-main-process.md` - Main process notification service implementation
- `rules/ipc-communication.md` - IPC patterns for notification events
- `rules/error-handling.md` - Error handling for notification failures

## References

- [Electron Notification Documentation](https://www.electronjs.org/docs/latest/api/notification) - Native notification API
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) - Browser notification standards
- [macOS Notification Guidelines](https://developer.apple.com/design/human-interface-guidelines/notifications) - Platform-specific design guidelines

---

## TL;DR

**Key Principles:**

- Use native OS notification APIs for consistent user experience
- Implement fallback mechanisms when system notifications are unavailable
- Respect user preferences and system notification settings
- Provide interactive notifications with action buttons

**Critical Rules:**

- Must use Electron's native notification API (RULE-001)
- Must implement fallback to in-app notifications (RULE-002)
- Must request notification permissions explicitly (RULE-003)
- Must respect system Do Not Disturb settings (RULE-004)

**Quick Decision Guide:**
When in doubt: Ask "Does this notification provide value to the user without being intrusive?" If yes, implement with proper permission handling and fallbacks.

**Before You Code Checklist:**
- [ ] Notification permissions properly requested and handled
- [ ] Fallback to in-app notifications implemented
- [ ] System Do Not Disturb settings respected
- [ ] Interactive notification actions implemented
- [ ] Notification history and persistence added
