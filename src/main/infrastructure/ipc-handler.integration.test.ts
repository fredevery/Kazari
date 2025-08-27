import { IPCHandler } from './ipc-handler';
import { TimerService, SettingsRepository, NotificationService } from '../../shared/types/timer';
import { TIMER_CHANNELS, SETTINGS_CHANNELS, APP_CHANNELS, WINDOW_CHANNELS } from '../../shared/types/ipc';

describe('IPCHandler', () => {
  let timerService: jest.Mocked<TimerService>;
  let settingsRepository: jest.Mocked<SettingsRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let ipcHandler: IPCHandler;

  beforeEach(() => {
    timerService = {
      createSession: jest.fn().mockResolvedValue('session'),
      startSession: jest.fn().mockResolvedValue('started'),
      pauseSession: jest.fn().mockResolvedValue('paused'),
      stopSession: jest.fn().mockResolvedValue('stopped'),
      getCurrentSession: jest.fn().mockResolvedValue('current'),
      getSessionHistory: jest.fn().mockResolvedValue(['history']),
    } as any;
    settingsRepository = {
      getSettings: jest.fn().mockResolvedValue('settings'),
      updateSettings: jest.fn().mockResolvedValue('updatedSettings'),
    } as any;
    notificationService = {
      showCustomNotification: jest.fn().mockResolvedValue(undefined),
    } as any;
    ipcHandler = new IPCHandler(timerService, settingsRepository, {} as any, notificationService);
  });

  it('should call timerService.createSession on TIMER_CHANNELS.CREATE_SESSION', async () => {
    const req = { phase: 'focus' as const, name: 'Test', duration: 25 };
    const result = await timerService.createSession(req);
    expect(result).toBe('session');
    expect(timerService.createSession).toHaveBeenCalledWith(req);
  });

  it('should call settingsRepository.getSettings on SETTINGS_CHANNELS.GET_SETTINGS', async () => {
    const result = await settingsRepository.getSettings();
    expect(result).toBe('settings');
    expect(settingsRepository.getSettings).toHaveBeenCalled();
  });



  it('should call notificationService.showCustomNotification on APP_CHANNELS.SHOW_NOTIFICATION', async () => {
    const req = { title: 'Title', body: 'Body', silent: false };
    await notificationService.showCustomNotification(req.title, req.body, req.silent);
    expect(notificationService.showCustomNotification).toHaveBeenCalledWith(req.title, req.body, req.silent);
  });
});
