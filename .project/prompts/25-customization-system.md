# Customization System

Implement a comprehensive customization system for the Kazari desktop productivity application that provides users with flexible theme selection, preference management, and configuration options. This system will ensure settings are persisted securely, synchronized across all application windows, and provide an intuitive user interface for customization.

## Requirements

- Implement user preference management system with type-safe configuration schema and validation
- Create comprehensive theming system supporting light, dark, and custom themes with real-time switching
- Establish secure settings persistence using encrypted storage for sensitive preferences
- Implement settings synchronization across all application windows using IPC communication
- Create intuitive preferences UI with categorized settings, search functionality, and reset options
- Implement configuration import/export functionality for user backup and migration
- Support user-defined custom themes with color picker, font selection, and layout preferences
- Establish settings validation and migration system for version upgrades
- Implement accessibility-compliant theming with high contrast options and screen reader support
- Create configuration presets and templates for common use cases and user workflows

## Rules

- rules/state-management.md
- rules/ipc-communication.md
- rules/accessibility.md
- rules/electron-security.md
- rules/typescript-standards.md
- rules/error-handling.md
- rules/electron-main-process.md

## Domain

```typescript
// Customization System Domain Model
interface UserPreferences {
  id: string;
  userId: string;
  version: string;
  theme: ThemeConfiguration;
  timer: TimerPreferences;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  appearance: AppearancePreferences;
  behavior: BehaviorPreferences;
  privacy: PrivacyPreferences;
  lastModified: number;
}

interface ThemeConfiguration {
  id: string;
  name: string;
  type: ThemeType;
  colors: ColorScheme;
  typography: TypographySettings;
  spacing: SpacingSettings;
  animations: AnimationSettings;
  customProperties: CustomThemeProperties;
}

enum ThemeType {
  Light = 'light',
  Dark = 'dark',
  HighContrast = 'high-contrast',
  Custom = 'custom'
}

interface ColorScheme {
  primary: ColorPalette;
  secondary: ColorPalette;
  surface: ColorPalette;
  background: ColorPalette;
  text: TextColorScheme;
  status: StatusColorScheme;
  accent: string;
}

interface ColorPalette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

interface TextColorScheme {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
}

interface TimerPreferences {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  tickSounds: boolean;
  alarmSound: string;
  alarmVolume: number;
  showNotifications: boolean;
}

interface NotificationPreferences {
  enabled: boolean;
  desktop: boolean;
  sound: boolean;
  volume: number;
  position: NotificationPosition;
  duration: number;
  types: NotificationType[];
}

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: FontSize;
  colorBlindnessSupport: ColorBlindnessType;
  focusIndicators: boolean;
}

interface AppearancePreferences {
  windowOpacity: number;
  showInTaskbar: boolean;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  startMinimized: boolean;
  showMenuBar: boolean;
  compactMode: boolean;
}

interface BehaviorPreferences {
  launchOnStartup: boolean;
  closeToTray: boolean;
  confirmBeforeExit: boolean;
  autoSave: boolean;
  autoBackup: boolean;
  language: string;
  timezone: string;
}

interface PrivacyPreferences {
  analytics: boolean;
  crashReporting: boolean;
  usageStatistics: boolean;
  personalizedRecommendations: boolean;
  dataRetention: DataRetentionPeriod;
}

interface SettingsManager {
  preferences: UserPreferences;
  themes: ThemeConfiguration[];
  presets: ConfigurationPreset[];
  schema: ConfigurationSchema;
  validator: SettingsValidator;
}

interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  configuration: Partial<UserPreferences>;
  tags: string[];
}

interface CustomizationUI {
  categories: SettingsCategory[];
  searchIndex: SettingsSearchIndex;
  validator: UIValidator;
  changeTracker: ChangeTracker;
}

interface SettingsCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  settings: SettingsField[];
  order: number;
}

interface SettingsField {
  id: string;
  name: string;
  type: FieldType;
  value: any;
  defaultValue: any;
  validation: ValidationRule[];
  description: string;
  tooltip?: string;
  dependencies?: FieldDependency[];
}

enum FieldType {
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  Color = 'color',
  Select = 'select',
  Range = 'range',
  File = 'file',
  KeyBinding = 'keybinding'
}
```

## Extra Considerations

- Settings changes must be validated and applied atomically to prevent invalid states
- Theme switching should be smooth and immediate without requiring application restart
- Color accessibility must be maintained across all custom themes with contrast validation
- Settings persistence should handle corruption gracefully with automatic backup restoration
- Large configuration files may impact startup performance and require lazy loading
- Cross-platform font availability requires fallback handling and validation
- Theme assets (icons, images) need proper caching and memory management
- Settings migration between application versions requires careful schema evolution
- User-generated custom themes may contain invalid CSS that could break the application
- Preferences UI should be responsive and accessible across different screen sizes
- Import/export functionality must validate external configuration files for security
- Real-time settings synchronization across windows may create performance bottlenecks

## Testing Considerations

- **Settings Persistence Tests**: Verify settings are correctly saved, loaded, and preserved across application restarts
- **Theme Application Tests**: Ensure theme changes are immediately reflected across all windows and components
- **Validation Tests**: Test configuration validation with invalid inputs, edge cases, and malformed data
- **Migration Tests**: Verify settings migration works correctly between different application versions
- **Accessibility Tests**: Validate high contrast themes, screen reader compatibility, and keyboard navigation
- **Performance Tests**: Measure settings loading time, theme switching performance, and memory usage
- **Cross-Platform Tests**: Ensure consistent theming behavior across Windows, macOS, and Linux
- **Import/Export Tests**: Test configuration backup, restore, and cross-device synchronization
- **UI Responsiveness Tests**: Verify preferences interface works on different screen sizes and resolutions
- **Corruption Recovery Tests**: Test automatic recovery from corrupted settings files

## Implementation Notes

- Use JSON Schema for configuration validation with TypeScript type generation
- Implement CSS custom properties for theme variables with fallback support
- Use Electron's safeStorage API for encrypting sensitive configuration data
- Create reactive state management for real-time settings synchronization across windows
- Implement debounced settings saving to reduce disk I/O for frequently changing values
- Use IndexedDB or similar for client-side settings caching in renderer processes
- Create settings backup and restoration system with automatic corruption detection
- Implement proper error boundaries for settings UI to handle validation failures gracefully
- Use proper color science for accessible color palette generation and validation
- Create modular settings architecture that supports plugin-based configuration extensions
- Implement settings change notifications with proper event propagation across processes
- Use proper TypeScript discriminated unions for different setting field types

## Specification by Example

### Settings Manager Implementation
```typescript
// src/services/SettingsManager.ts
import { safeStorage } from 'electron';
import Ajv from 'ajv';

export class SettingsManager {
  private preferences: UserPreferences;
  private schema: any;
  private validator: Ajv;
  private settingsPath: string;

  constructor() {
    this.validator = new Ajv({ allErrors: true });
    this.schema = this.loadConfigurationSchema();
    this.settingsPath = path.join(app.getPath('userData'), 'preferences.json');
    this.preferences = this.loadPreferences();
  }

  async loadPreferences(): Promise<UserPreferences> {
    try {
      if (existsSync(this.settingsPath)) {
        const encryptedData = await fs.readFile(this.settingsPath);
        const decryptedData = safeStorage.decryptString(encryptedData);
        const preferences = JSON.parse(decryptedData);
        
        // Validate and migrate if necessary
        return this.validateAndMigrate(preferences);
      }
    } catch (error) {
      logger.error('Failed to load preferences', error);
      return this.createDefaultPreferences();
    }
    
    return this.createDefaultPreferences();
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      // Validate before saving
      const isValid = this.validator.validate(this.schema, preferences);
      if (!isValid) {
        throw new Error(`Invalid preferences: ${JSON.stringify(this.validator.errors)}`);
      }

      // Create backup
      await this.createBackup();

      // Encrypt and save
      const jsonData = JSON.stringify(preferences, null, 2);
      const encryptedData = safeStorage.encryptString(jsonData);
      await fs.writeFile(this.settingsPath, encryptedData);

      this.preferences = preferences;
      
      // Notify all windows of settings change
      this.broadcastSettingsUpdate(preferences);
      
    } catch (error) {
      logger.error('Failed to save preferences', error);
      throw error;
    }
  }

  updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> {
    const updatedPreferences = {
      ...this.preferences,
      [key]: value,
      lastModified: Date.now()
    };

    return this.savePreferences(updatedPreferences);
  }

  private validateAndMigrate(preferences: any): UserPreferences {
    // Check version and migrate if necessary
    const currentVersion = process.env.npm_package_version;
    if (preferences.version !== currentVersion) {
      return this.migratePreferences(preferences, currentVersion);
    }

    const isValid = this.validator.validate(this.schema, preferences);
    if (!isValid) {
      logger.warn('Invalid preferences detected, using defaults');
      return this.createDefaultPreferences();
    }

    return preferences;
  }

  private broadcastSettingsUpdate(preferences: UserPreferences): void {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.send('settings-updated', preferences);
    });
  }
}
```

### Theme System Implementation
```typescript
// src/services/ThemeManager.ts
export class ThemeManager {
  private currentTheme: ThemeConfiguration;
  private availableThemes: Map<string, ThemeConfiguration> = new Map();
  private customThemes: Map<string, ThemeConfiguration> = new Map();

  constructor() {
    this.loadBuiltInThemes();
    this.loadCustomThemes();
    this.currentTheme = this.getDefaultTheme();
  }

  private loadBuiltInThemes(): void {
    const lightTheme: ThemeConfiguration = {
      id: 'light',
      name: 'Light Theme',
      type: ThemeType.Light,
      colors: {
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
          contrastText: '#ffffff'
        },
        background: {
          main: '#ffffff',
          light: '#fafafa',
          dark: '#f5f5f5',
          contrastText: '#000000'
        },
        surface: {
          main: '#ffffff',
          light: '#ffffff',
          dark: '#f5f5f5',
          contrastText: '#000000'
        },
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
          disabled: 'rgba(0, 0, 0, 0.38)',
          hint: 'rgba(0, 0, 0, 0.38)'
        },
        status: {
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          info: '#2196f3'
        },
        accent: '#ff4081'
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 14,
        lineHeight: 1.5,
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        unit: 8,
        small: 4,
        medium: 8,
        large: 16,
        xlarge: 24
      },
      animations: {
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375
        },
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
        }
      }
    };

    this.availableThemes.set('light', lightTheme);
    
    // Create dark theme variant
    const darkTheme = this.createDarkThemeVariant(lightTheme);
    this.availableThemes.set('dark', darkTheme);
    
    // Create high contrast theme
    const highContrastTheme = this.createHighContrastTheme();
    this.availableThemes.set('high-contrast', highContrastTheme);
  }

  applyTheme(themeId: string): void {
    const theme = this.availableThemes.get(themeId) || this.customThemes.get(themeId);
    
    if (!theme) {
      logger.error(`Theme not found: ${themeId}`);
      return;
    }

    this.currentTheme = theme;
    this.generateCSSVariables(theme);
    this.notifyThemeChange(theme);
  }

  private generateCSSVariables(theme: ThemeConfiguration): void {
    const cssVariables = this.convertThemeToCSSVariables(theme);
    
    // Apply to all windows
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
      window.webContents.executeJavaScript(`
        document.documentElement.style.cssText = \`${cssVariables}\`;
      `);
    });
  }

  private convertThemeToCSSVariables(theme: ThemeConfiguration): string {
    const variables: string[] = [];
    
    // Color variables
    Object.entries(theme.colors).forEach(([category, colors]) => {
      if (typeof colors === 'object' && colors !== null) {
        Object.entries(colors).forEach(([shade, color]) => {
          variables.push(`--color-${category}-${shade}: ${color};`);
        });
      } else {
        variables.push(`--color-${category}: ${colors};`);
      }
    });

    // Typography variables
    variables.push(`--font-family: ${theme.typography.fontFamily};`);
    variables.push(`--font-size: ${theme.typography.fontSize}px;`);
    variables.push(`--line-height: ${theme.typography.lineHeight};`);

    // Spacing variables
    Object.entries(theme.spacing).forEach(([size, value]) => {
      variables.push(`--spacing-${size}: ${value}px;`);
    });

    return variables.join('\n');
  }

  createCustomTheme(baseThemeId: string, customizations: Partial<ThemeConfiguration>): ThemeConfiguration {
    const baseTheme = this.availableThemes.get(baseThemeId);
    if (!baseTheme) {
      throw new Error(`Base theme not found: ${baseThemeId}`);
    }

    const customTheme: ThemeConfiguration = {
      ...baseTheme,
      ...customizations,
      id: generateId(),
      type: ThemeType.Custom,
      colors: {
        ...baseTheme.colors,
        ...customizations.colors
      },
      typography: {
        ...baseTheme.typography,
        ...customizations.typography
      }
    };

    // Validate color accessibility
    this.validateThemeAccessibility(customTheme);

    this.customThemes.set(customTheme.id, customTheme);
    return customTheme;
  }

  private validateThemeAccessibility(theme: ThemeConfiguration): void {
    const contrastRatio = this.calculateContrastRatio(
      theme.colors.text.primary,
      theme.colors.background.main
    );

    if (contrastRatio < 4.5) {
      logger.warn('Theme may not meet WCAG AA contrast requirements');
    }
  }

  exportTheme(themeId: string): string {
    const theme = this.availableThemes.get(themeId) || this.customThemes.get(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    return JSON.stringify(theme, null, 2);
  }
}
```

### Preferences UI Implementation
```typescript
// src/components/PreferencesDialog.tsx
interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
  settings: UserPreferences;
  onSettingsChange: (settings: UserPreferences) => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Partial<UserPreferences>>({});

  const categories: SettingsCategory[] = [
    {
      id: 'general',
      name: 'General',
      icon: 'settings',
      description: 'Basic application settings and behavior',
      settings: [
        {
          id: 'launchOnStartup',
          name: 'Launch on Startup',
          type: FieldType.Boolean,
          value: settings.behavior.launchOnStartup,
          defaultValue: false,
          description: 'Start Kazari automatically when your computer boots'
        },
        {
          id: 'closeToTray',
          name: 'Close to System Tray',
          type: FieldType.Boolean,
          value: settings.behavior.closeToTray,
          defaultValue: true,
          description: 'Keep Kazari running in the background when closed'
        }
      ]
    },
    {
      id: 'timer',
      name: 'Timer',
      icon: 'timer',
      description: 'Pomodoro timer configuration',
      settings: [
        {
          id: 'focusDuration',
          name: 'Focus Duration',
          type: FieldType.Range,
          value: settings.timer.focusDuration,
          defaultValue: 25 * 60 * 1000,
          validation: [{ type: 'min', value: 5 * 60 * 1000 }, { type: 'max', value: 90 * 60 * 1000 }],
          description: 'Duration of focus sessions in minutes'
        }
      ]
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: 'palette',
      description: 'Themes, colors, and visual customization',
      settings: [
        {
          id: 'theme',
          name: 'Theme',
          type: FieldType.Select,
          value: settings.theme.id,
          defaultValue: 'light',
          description: 'Choose your preferred color theme'
        }
      ]
    }
  ];

  const handleSettingChange = (categoryId: string, settingId: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [settingId]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedSettings = applyChangesToSettings(settings, pendingChanges);
      await onSettingsChange(updatedSettings);
      setPendingChanges({});
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
      logger.error('Settings save failed', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    searchQuery === '' ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.settings.some(setting =>
      setting.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Preferences</Typography>
          <TextField
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon />
            }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box display="flex" height={500}>
          {/* Category Sidebar */}
          <Box width={200} borderRight="1px solid" borderColor="divider" pr={2}>
            <List>
              {filteredCategories.map(category => (
                <ListItem
                  key={category.id}
                  button
                  selected={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <ListItemIcon>
                    <Icon>{category.icon}</Icon>
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Settings Content */}
          <Box flex={1} pl={3}>
            {filteredCategories
              .find(cat => cat.id === activeCategory)
              ?.settings.map(setting => (
                <SettingsField
                  key={setting.id}
                  setting={setting}
                  onChange={(value) => handleSettingChange(activeCategory, setting.id, value)}
                />
              ))
            }
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setPendingChanges({})}>
          Reset Changes
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant="contained"
          disabled={Object.keys(pendingChanges).length === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Settings Schema Definition
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Kazari User Preferences",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "userId": { "type": "string" },
    "version": { "type": "string" },
    "theme": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "type": { 
          "type": "string",
          "enum": ["light", "dark", "high-contrast", "custom"]
        }
      },
      "required": ["id", "name", "type"]
    },
    "timer": {
      "type": "object",
      "properties": {
        "focusDuration": {
          "type": "number",
          "minimum": 300000,
          "maximum": 5400000
        },
        "shortBreakDuration": {
          "type": "number",
          "minimum": 60000,
          "maximum": 1800000
        },
        "longBreakDuration": {
          "type": "number",
          "minimum": 300000,
          "maximum": 3600000
        }
      },
      "required": ["focusDuration", "shortBreakDuration", "longBreakDuration"]
    }
  },
  "required": ["id", "version", "theme", "timer"]
}
```
