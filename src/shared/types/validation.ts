import { z } from 'zod';

// TimerConfig: numeric minutes and booleans
export const TimerConfigSchema = z.object({
  planningDuration: z.number().positive(),
  focusDuration: z.number().positive(),
  breakDuration: z.number().positive(),
  longBreakDuration: z.number().positive(),
  longBreakInterval: z.number().positive(),
  autoStartBreaks: z.boolean(),
  autoStartFocus: z.boolean(),
});

// Partial updates allowed for configure()
export const TimerConfigUpdateSchema = TimerConfigSchema.partial();

// TimerSettings
export const TimerSettingsSchema = z.object({
  config: TimerConfigSchema,
  notifications: z.boolean(),
  soundEnabled: z.boolean(),
  alwaysOnTop: z.boolean(),
});

// Partial settings update
export const TimerSettingsUpdateSchema = z.object({
  settings: z.object({
    // When updating config, require a full TimerConfig to avoid partial nested updates
    config: TimerConfigSchema.optional(),
    notifications: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    alwaysOnTop: z.boolean().optional(),
  }),
});

// Window creation
export const CreateWindowRequestSchema = z.object({
  type: z.enum(['dashboard', 'floating-countdown', 'break-screen', 'planning']),
  bounds: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    x: z.number().optional(),
    y: z.number().optional(),
  }).optional(),
  alwaysOnTop: z.boolean().optional(),
});

// Notification request
export const ShowNotificationRequestSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().optional(),
  silent: z.boolean().optional(),
});

export type TimerConfigUpdate = z.infer<typeof TimerConfigUpdateSchema>;
export type TimerSettingsUpdate = z.infer<typeof TimerSettingsUpdateSchema>;
export type CreateWindowRequest = z.infer<typeof CreateWindowRequestSchema>;
export type ShowNotificationRequest = z.infer<typeof ShowNotificationRequestSchema>;
