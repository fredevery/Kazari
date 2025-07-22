import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@shared/constants/app';
import { SettingsRepository, TimerSettings } from '@shared/types/timer';
import Store from 'electron-store';

/**
 * Settings Repository Implementation using electron-store
 * Handles persistence and retrieval of application settings
 */
export class SettingsRepositoryImpl implements SettingsRepository {
  private readonly store: Store;

  constructor() {
    this.store = new Store({
      name: 'settings-data',
    });

    // Initialize with default settings if not exists
    if (!this.store.has(STORAGE_KEYS.TIMER_SETTINGS)) {
      this.store.set(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_SETTINGS.TIMER);
    }
  }

  /**
   * Get current timer settings
   */
  public async getSettings(): Promise<TimerSettings> {
    try {
      const settings = this.store.get(STORAGE_KEYS.TIMER_SETTINGS) as TimerSettings;

      // Ensure all required properties exist by merging with defaults
      return {
        ...DEFAULT_SETTINGS.TIMER,
        ...settings,
      };
    } catch (error) {
      // If settings are corrupted, return defaults
      console.error('Failed to load settings, using defaults:', error);
      return DEFAULT_SETTINGS.TIMER;
    }
  }

  /**
   * Update timer settings
   */
  public async updateSettings(partialSettings: Partial<TimerSettings>): Promise<TimerSettings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings: TimerSettings = {
        ...currentSettings,
        ...partialSettings,
      };

      // Validate settings before saving
      this.validateSettings(updatedSettings);

      this.store.set(STORAGE_KEYS.TIMER_SETTINGS, updatedSettings);
      return updatedSettings;
    } catch (error) {
      throw new Error(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate settings values
   */
  private validateSettings(settings: TimerSettings): void {
    if (typeof settings.defaultDuration !== 'number' || settings.defaultDuration <= 0) {
      throw new Error('Default duration must be a positive number');
    }

    if (settings.defaultDuration < 60000) { // Less than 1 minute
      throw new Error('Default duration must be at least 1 minute');
    }

    if (settings.defaultDuration > 7200000) { // More than 2 hours
      throw new Error('Default duration cannot exceed 2 hours');
    }

    if (typeof settings.autoStart !== 'boolean') {
      throw new Error('Auto start must be a boolean value');
    }

    if (typeof settings.notifications !== 'boolean') {
      throw new Error('Notifications must be a boolean value');
    }

    if (typeof settings.soundEnabled !== 'boolean') {
      throw new Error('Sound enabled must be a boolean value');
    }

    if (typeof settings.alwaysOnTop !== 'boolean') {
      throw new Error('Always on top must be a boolean value');
    }
  }

  /**
   * Reset settings to defaults
   */
  public async resetToDefaults(): Promise<TimerSettings> {
    try {
      this.store.set(STORAGE_KEYS.TIMER_SETTINGS, DEFAULT_SETTINGS.TIMER);
      return DEFAULT_SETTINGS.TIMER;
    } catch (error) {
      throw new Error(`Failed to reset settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
