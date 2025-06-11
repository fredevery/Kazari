import path from "node:path";
import { app } from "electron";

export const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
export const userDataPath = app.getPath("userData");
export const logPath = path.join(userDataPath, "logs");
