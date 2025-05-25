declare global {
  interface Window {
    logger: {
      info: (message: string, ...args: any[]) => void;
      error: (message: string, ...args: any[]) => void;
      debug: (message: string, ...args: any[]) => void;
    };
  }
}
export {};

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
