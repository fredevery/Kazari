export enum WindowType {
  PLANNING = "PLANNING",
  BaseWindow = "BASE_WINDOW",
  Main = "MAIN",
  DailyPlanning = "DAILY_PLANNING",
  BreakScreen = "BREAK_SCREEN",
  Dashboard = "DASHBOARD",
  SessionPlanning = "SESSION_PLANNING",
  Settings = "SETTINGS",
}

export enum AppEvents {
  BeforeQuit = "before-quit",
  Ready = "ready",
  WindowAllClosed = "window-all-closed",
  Activate = "activate",
}

export enum WindowEvents {
  Move = "move",
  Resize = "resize",
  Close = "close",
  Minimize = "minimize",
  Maximize = "maximize",
  Unmaximize = "unmaximize",
  EnterFullScreen = "enter-full-screen",
  LeaveFullScreen = "leave-full-screen",
}

export enum Phases {
  FOCUS = "focus",
  BREAK = "break",
  PLANNING = "planning",
}

export enum TimerActions {
  START = "start",
  PAUSE = "pause",
  RESUME = "resume",
  STOP = "stop",
}

export enum TimerEvents {
  PHASE_START = "timer:phase:start:global",
  PHASE_END = "timer:phase:end:global",
  PHASE_SET = "timer:phase:activated:global",
  TICK = "timer:tick:global",
}

export enum TaskStates {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
  ARCHIVED = "archived",
  DELETED = "deleted",
}
