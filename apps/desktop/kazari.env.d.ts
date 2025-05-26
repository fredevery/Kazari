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
