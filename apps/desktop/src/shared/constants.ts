import path from "node:path";
import { app } from "electron";

export enum WindowType {
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

export const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
export const userDataPath = app.getPath("userData");
export const logPath = path.join(userDataPath, "logs");
