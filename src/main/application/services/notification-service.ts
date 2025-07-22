import { NotificationService, TimerError, TimerPhase } from '@shared/types/timer';
import { nativeImage, NativeImage, Notification } from 'electron';

/**
 * Notification Service Implementation
 * Handles system notifications for timer events with proper platform integration
 */
export class NotificationServiceImpl implements NotificationService {
  private hasPermission: boolean = false;

  constructor() {
    // Request notification permission on initialization
    this.requestPermission().catch(console.error);
  }

  /**
   * Show phase transition notification
   */
  public async showPhaseTransition(fromPhase: TimerPhase, toPhase: TimerPhase): Promise<void> {
    const { title, body } = this.getPhaseTransitionMessage(fromPhase, toPhase);

    await this.showCustomNotification(title, body, false);
  }

  /**
   * Show timer warning notification (last minute)
   */
  public async showTimerWarning(phase: TimerPhase, remainingTime: number): Promise<void> {
    const title = this.getPhaseDisplayName(phase);
    const minutes = Math.ceil(remainingTime / (60 * 1000));
    const body = `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;

    await this.showCustomNotification(title, body, true);
  }

  /**
   * Request notification permission from the system
   */
  public async requestPermission(): Promise<boolean> {
    try {
      // Electron notifications don't require explicit permission on most platforms
      // but we simulate the check for consistency
      this.hasPermission = true;
      return true;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      this.hasPermission = false;
      return false;
    }
  }

  /**
   * Show a custom notification
   */
  public async showCustomNotification(
    title: string,
    body: string,
    silent: boolean = false
  ): Promise<void> {
    try {
      if (!this.hasPermission) {
        console.warn('No notification permission, skipping notification');
        return;
      }

      const icon = this.getNotificationIcon();
      const notificationOptions: Electron.NotificationConstructorOptions = {
        title,
        body,
        silent,
        urgency: silent ? 'low' : 'normal',
      };

      if (icon) {
        notificationOptions.icon = icon;
      }

      const notification = new Notification(notificationOptions);
      notification.show();
    } catch (error) {
      throw new TimerError('Failed to show notification', 'NOTIFICATION_FAILED', { error });
    }
  }

  /**
   * Get phase transition message
   */
  private getPhaseTransitionMessage(fromPhase: TimerPhase, toPhase: TimerPhase): { title: string; body: string } {
    const fromName = this.getPhaseDisplayName(fromPhase);
    const toName = this.getPhaseDisplayName(toPhase);

    switch (toPhase) {
      case 'planning':
        return {
          title: '🎯 Planning Time',
          body: `${fromName} complete! Time to plan your next session.`
        };
      case 'focus':
        return {
          title: '🔥 Focus Time',
          body: `${fromName} complete! Time to focus and get things done.`
        };
      case 'break':
        return {
          title: '☕ Break Time',
          body: `${fromName} complete! Take a well-deserved break.`
        };
      default:
        return {
          title: 'Phase Complete',
          body: `${fromName} finished. Starting ${toName}.`
        };
    }
  }

  /**
   * Get display name for a timer phase
   */
  private getPhaseDisplayName(phase: TimerPhase): string {
    switch (phase) {
      case 'planning':
        return 'Planning';
      case 'focus':
        return 'Focus';
      case 'break':
        return 'Break';
      default:
        return phase;
    }
  }

  /**
   * Get notification icon
   */
  private getNotificationIcon(): NativeImage | undefined {
    try {
      // Use app icon if available
      return nativeImage.createFromPath('./assets/icon.png');
    } catch {
      // Return undefined to use default system icon
      return undefined;
    }
  }
}
