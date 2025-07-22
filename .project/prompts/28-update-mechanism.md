# Auto-Update Mechanism

_Implement a secure and reliable auto-update system for the Electron application that manages version control, downloads updates seamlessly, notifies users appropriately, and provides rollback capabilities without disrupting active user workflows._

## Requirements

- Implement electron-updater for automatic update checking and downloading
- Create version management system with semantic versioning support
- Implement secure update server communication with signature verification
- Provide user-friendly update notifications with options to defer or install
- Ensure updates do not interrupt active timers or ongoing work sessions
- Implement background update downloads with progress indicators
- Create rollback mechanism for failed updates or user preference
- Support staged rollouts and beta channel updates
- Implement update scheduling to minimize workflow disruption
- Provide offline update capability when possible
- Log all update operations for debugging and monitoring
- Handle update failures gracefully with appropriate user feedback

## Rules

- rules/electron-main-process.md
- rules/electron-security.md
- rules/build-configuration.md
- rules/error-handling.md
- rules/notification-system.md

## Domain

```typescript
// Update Management Domain Model
interface UpdateService {
  checkForUpdates(): Promise<UpdateInfo | null>;
  downloadUpdate(updateInfo: UpdateInfo): Promise<DownloadProgress>;
  installUpdate(): Promise<void>;
  rollbackUpdate(): Promise<void>;
  scheduleUpdate(when: UpdateSchedule): Promise<void>;
  cancelUpdate(): Promise<void>;
}

interface UpdateInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  signature: string;
  size: number;
  mandatory: boolean;
  releaseDate: Date;
  channel: UpdateChannel;
}

interface UpdateSchedule {
  when: 'immediate' | 'on-restart' | 'scheduled';
  scheduledTime?: Date;
  deferUntil?: Date;
}

interface DownloadProgress {
  percentage: number;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number;
}

enum UpdateChannel {
  STABLE = 'stable',
  BETA = 'beta',
  ALPHA = 'alpha'
}

interface UpdatePreferences {
  autoCheck: boolean;
  autoDownload: boolean;
  autoInstall: boolean;
  channel: UpdateChannel;
  checkInterval: number;
  notificationLevel: 'all' | 'important' | 'none';
}
```

## Extra Considerations

- Updates must preserve user data and application state during installation
- Consider bandwidth limitations and provide options for metered connections  
- Implement delta updates to minimize download size when possible
- Handle update server outages and network connectivity issues gracefully
- Ensure update process works correctly across all supported operating systems
- Consider corporate firewall and proxy configurations for enterprise users
- Implement proper cleanup of old update files to prevent disk space issues
- Handle concurrent update attempts and prevent race conditions
- Ensure update signatures are verified using trusted certificates
- Consider impact on application startup time during update checks
- Implement proper permission handling for update installation
- Handle cases where user denies update installation permissions

## Testing Considerations

- Unit tests for update logic, version comparison, and error scenarios
- Integration tests with mock update server to verify download and installation flows
- End-to-end tests covering the complete update lifecycle from check to installation
- Security tests to verify signature validation and prevent malicious updates
- Performance tests for update download and installation impact on system resources
- Cross-platform tests to ensure consistent behavior on Windows, macOS, and Linux
- Network failure simulation tests to verify graceful handling of connectivity issues
- User acceptance tests for update notification UX and workflow integration
- Load testing for update server during high-traffic scenarios
- Rollback testing to ensure successful recovery from failed updates

## Implementation Notes

- Use electron-updater as the primary update mechanism for cross-platform support
- Implement Code Signing for all platforms to ensure update authenticity
- Use electron-builder's auto-updater configuration for proper setup
- Store update preferences in secure local storage with encryption
- Implement update scheduling using Electron's native timer APIs
- Use IPC communication to coordinate between main and renderer processes
- Follow semver principles for version comparison and compatibility checking
- Implement exponential backoff for failed update attempts
- Use native OS notifications for update alerts with fallback to in-app notifications
- Store rollback information before applying updates
- Implement proper error boundaries around update operations
- Use structured logging for update events and debugging

## Specification by Example

```typescript
// Update Check Scenario
const updateService = new UpdateService();

// Check for updates on app startup
const updateInfo = await updateService.checkForUpdates();
if (updateInfo) {
  // Show notification to user
  showUpdateNotification({
    version: updateInfo.version,
    releaseNotes: updateInfo.releaseNotes,
    actions: ['Download Now', 'Remind Later', 'Skip This Version']
  });
}

// Background download with progress
if (userChoosesDownload) {
  const progressStream = await updateService.downloadUpdate(updateInfo);
  progressStream.on('progress', (progress) => {
    updateDownloadProgress(progress.percentage);
  });
}

// Scheduled installation
await updateService.scheduleUpdate({
  when: 'scheduled',
  scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours later
});
```

```json
// Update Server Response Example
{
  "version": "1.2.3",
  "releaseNotes": "## New Features\n- Improved timer accuracy\n- Enhanced break notifications\n\n## Bug Fixes\n- Fixed memory leak in dashboard\n- Resolved IPC communication issues",
  "downloadUrl": "https://releases.kazari.app/v1.2.3/kazari-1.2.3.exe",
  "signature": "MEQCIBxHwz...",
  "size": 52428800,
  "mandatory": false,
  "releaseDate": "2025-07-22T10:00:00Z",
  "channel": "stable",
  "minimumVersion": "1.0.0"
}
```

```gherkin
# Update Workflow Scenarios
Scenario: User receives update notification during active timer
  Given the user has an active pomodoro timer running
  And a new update is available
  When the update service checks for updates
  Then a non-intrusive notification should appear
  And the user should have options to "Download in Background", "Remind After Session", or "Skip"
  And the active timer should continue without interruption

Scenario: Automatic background update download
  Given update preferences are set to auto-download
  And a non-mandatory update is available
  And the user is not in a focus session
  When the update check occurs
  Then the update should download in the background
  And a subtle progress indicator should be shown
  And the user should be notified when download is complete

Scenario: Failed update rollback
  Given an update was downloaded and installed
  And the application fails to start after update
  When the rollback mechanism is triggered
  Then the previous version should be restored
  And user data should remain intact
  And an error report should be generated
```

## Verification

- [ ] Update checking works on application startup and at scheduled intervals
- [ ] Update notifications appear appropriately based on user preferences and context
- [ ] Background downloads work without impacting application performance
- [ ] Update signatures are properly verified before installation
- [ ] Installation process preserves user data and application settings
- [ ] Rollback mechanism successfully restores previous version after failed updates
- [ ] Update scheduling respects user workflow and timer sessions
- [ ] Error handling provides clear feedback for all failure scenarios
- [ ] Cross-platform compatibility verified on Windows, macOS, and Linux
- [ ] Update preferences can be configured and persist across app restarts
- [ ] Network failure handling works correctly with appropriate retry mechanisms
- [ ] Update server authentication and secure communication are implemented
- [ ] Delta updates work to minimize bandwidth usage
- [ ] Corporate firewall and proxy support is functional
- [ ] Update logs provide sufficient information for debugging issues
- [ ] Performance impact of update operations is within acceptable limits
- [ ] Beta and stable update channels work correctly
- [ ] Concurrent update attempt prevention is effective
- [ ] Update file cleanup prevents disk space accumulation
- [ ] Permission handling works correctly across all supported operating systems
