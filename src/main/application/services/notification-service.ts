import { NotificationService, TimerSession } from '@shared/types/timer';
import { Notification, app } from 'electron';
import { formatDuration } from '../../shared/utils';

/**
 * Notification Service Implementation using Electron notifications
 * Handles system notifications for timer events
 */
export class NotificationServiceImpl implements NotificationService {
  private hasPermission = false;

  constructor() {
    this.requestPermission().catch(console.error);
  }

  /**
   * Show timer completion notification
   */
  public async showTimerComplete(session: TimerSession): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (!this.hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const options: Electron.NotificationConstructorOptions = {
        title: 'Timer Complete! 🎉',
        body: `"${session.name}" finished after ${formatDuration(session.duration)}`,
        silent: false,
        urgency: 'critical',
      };

      const icon = this.getAppIcon();
      if (icon) {
        options.icon = icon;
      }

      const notification = new Notification(options);

      notification.show();

      notification.on('click', () => {
        // Bring app to front when notification is clicked
        app.focus();
      });
    } catch (error) {
      console.error('Failed to show completion notification:', error);
    }
  }

  /**
   * Show timer warning notification
   */
  public async showTimerWarning(session: TimerSession, remainingTime: number): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (!this.hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const options: Electron.NotificationConstructorOptions = {
        title: 'Timer Warning ⏰',
        body: `"${session.name}" has ${formatDuration(remainingTime)} remaining`,
        silent: true,
        urgency: 'normal',
      };

      const icon = this.getAppIcon();
      if (icon) {
        options.icon = icon;
      }

      const notification = new Notification(options);

      notification.show();

      notification.on('click', () => {
        // Bring app to front when notification is clicked
        app.focus();
      });
    } catch (error) {
      console.error('Failed to show warning notification:', error);
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<boolean> {
    try {
      // On Electron, notifications are usually available by default
      // but we should still check if the system supports them
      if ('Notification' in globalThis) {
        this.hasPermission = true;
        return true;
      }

      // For older Electron versions or systems without notification support
      this.hasPermission = false;
      console.warn('System notifications not supported');
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      this.hasPermission = false;
      return false;
    }
  }

  /**
   * Show a custom notification
   */
  public async showCustomNotification(title: string, body: string, silent = false): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (!this.hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const options: Electron.NotificationConstructorOptions = {
        title,
        body,
        silent,
        urgency: silent ? 'normal' : 'low',
      };

      const icon = this.getAppIcon();
      if (icon) {
        options.icon = icon;
      }

      const notification = new Notification(options);

      notification.show();

      notification.on('click', () => {
        app.focus();
      });
    } catch (error) {
      console.error('Failed to show custom notification:', error);
    }
  }

  /**
   * Get the application icon path for notifications
   */
  private getAppIcon(): string | undefined {
    // In a real app, you would return the path to your app icon
    // For now, we'll return undefined to use the system default
    return undefined;
  }

  /**
   * Check if notifications are supported and enabled
   */
  public isSupported(): boolean {
    return this.hasPermission;
  }
}
