import { STORAGE_KEYS } from '@shared/constants/app';
import { SettingsRepository, TimerSettings } from '@shared/types/timer';
import Store from 'electron-store';

/**
 * Settings Repository Implementation using electron-store
 * Handles persistence and retrieval of application settings with Pomodoro timer support
 */
export class SettingsRepositoryImpl implements SettingsRepository {
  private readonly store: Store;

  constructor() {
    this.store = new Store({
      name: 'settings-data',
    });

    // Initialize with default settings if not exists
    if (!this.store.has(STORAGE_KEYS.TIMER_SETTINGS)) {
      this.store.set(STORAGE_KEYS.TIMER_SETTINGS, this.getDefaultSettings());
    }
  }

  /**
   * Initialize the repository (optional for compatibility)
   */
  public async initialize(): Promise<void> {
    // Already initialized in constructor
  }

  /**
   * Get current timer settings
   */
  public async getSettings(): Promise<TimerSettings> {
    try {
      const settings = this.store.get(STORAGE_KEYS.TIMER_SETTINGS) as TimerSettings;

      // Ensure all required properties exist by merging with defaults
      return this.validateAndMigrateSettings(settings);
    } catch (error) {
      // If settings are corrupted, return defaults
      console.error('Failed to load settings, using defaults:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update timer settings
   */
  public async updateSettings(partialSettings: Partial<TimerSettings>): Promise<TimerSettings> {
    try {
      const currentSettings = await this.getSettings();

      // Create updated settings with proper immutability
      const updatedSettings: TimerSettings = {
        config: partialSettings.config
          ? { ...currentSettings.config, ...partialSettings.config }
          : currentSettings.config,
        notifications: partialSettings.notifications ?? currentSettings.notifications,
        soundEnabled: partialSettings.soundEnabled ?? currentSettings.soundEnabled,
        alwaysOnTop: partialSettings.alwaysOnTop ?? currentSettings.alwaysOnTop,
      };

      // Validate the updated settings
      this.validateSettings(updatedSettings);

      // Save to store
      this.store.set(STORAGE_KEYS.TIMER_SETTINGS, updatedSettings);

      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): TimerSettings {
    return {
      config: {
        planningDuration: 5,
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: true,
        autoStartFocus: false,
      },
      notifications: true,
      soundEnabled: true,
      alwaysOnTop: false,
    };
  }

  /**
   * Validate and migrate settings from older versions
   */
  private validateAndMigrateSettings(settings: any): TimerSettings {
    const defaultSettings = this.getDefaultSettings();

    // Handle migration from old settings format
    let migratedSettings = { ...settings };

    // Migrate old defaultDuration to config.focusDuration
    if (migratedSettings.defaultDuration && !migratedSettings.config?.focusDuration) {
      migratedSettings.config = migratedSettings.config || {};
      migratedSettings.config.focusDuration = Math.round(migratedSettings.defaultDuration / (60 * 1000));
      delete migratedSettings.defaultDuration;
    }

    // Migrate old autoStart to config.autoStartBreaks and config.autoStartFocus
    if (migratedSettings.autoStart !== undefined && migratedSettings.config) {
      if (migratedSettings.config.autoStartBreaks === undefined) {
        migratedSettings.config.autoStartBreaks = migratedSettings.autoStart;
      }
      if (migratedSettings.config.autoStartFocus === undefined) {
        migratedSettings.config.autoStartFocus = false; // Default to false for focus
      }
      delete migratedSettings.autoStart;
    }

    // Ensure all required properties exist
    const finalSettings: TimerSettings = {
      config: {
        ...defaultSettings.config,
        ...migratedSettings.config,
      },
      notifications: migratedSettings.notifications ?? defaultSettings.notifications,
      soundEnabled: migratedSettings.soundEnabled ?? defaultSettings.soundEnabled,
      alwaysOnTop: migratedSettings.alwaysOnTop ?? defaultSettings.alwaysOnTop,
    };

    return finalSettings;
  }

  /**
   * Validate settings structure and values
   */
  private validateSettings(settings: TimerSettings): void {
    if (!settings.config) {
      throw new Error('Timer config is required');
    }

    const { config } = settings;

    // Validate durations
    if (typeof config.planningDuration !== 'number' || config.planningDuration <= 0 || config.planningDuration > 60) {
      throw new Error('Planning duration must be between 1 and 60 minutes');
    }

    if (typeof config.focusDuration !== 'number' || config.focusDuration <= 0 || config.focusDuration > 120) {
      throw new Error('Focus duration must be between 1 and 120 minutes');
    }

    if (typeof config.breakDuration !== 'number' || config.breakDuration <= 0 || config.breakDuration > 60) {
      throw new Error('Break duration must be between 1 and 60 minutes');
    }

    if (typeof config.longBreakDuration !== 'number' || config.longBreakDuration <= 0 || config.longBreakDuration > 120) {
      throw new Error('Long break duration must be between 1 and 120 minutes');
    }

    if (typeof config.longBreakInterval !== 'number' || config.longBreakInterval <= 0 || config.longBreakInterval > 10) {
      throw new Error('Long break interval must be between 1 and 10 sessions');
    }

    // Validate boolean settings
    if (typeof config.autoStartBreaks !== 'boolean') {
      throw new Error('Auto start breaks must be a boolean');
    }

    if (typeof config.autoStartFocus !== 'boolean') {
      throw new Error('Auto start focus must be a boolean');
    }

    if (typeof settings.notifications !== 'boolean') {
      throw new Error('Notifications setting must be a boolean');
    }

    if (typeof settings.soundEnabled !== 'boolean') {
      throw new Error('Sound enabled setting must be a boolean');
    }

    if (typeof settings.alwaysOnTop !== 'boolean') {
      throw new Error('Always on top setting must be a boolean');
    }
  }

  /**
   * Reset to default settings
   */
  public async resetToDefaults(): Promise<TimerSettings> {
    const defaultSettings = this.getDefaultSettings();
    this.store.set(STORAGE_KEYS.TIMER_SETTINGS, defaultSettings);
    return defaultSettings;
  }
}
