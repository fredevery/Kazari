export enum WindowType {
  BaseWindow = "BASE_WINDOW",
  Main = "MAIN",
  DailyPlanning = "DAILY_PLANNING",
  BreakScreen = "BREAK_SCREEN",
  Dashboard = "DASHBOARD",
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
