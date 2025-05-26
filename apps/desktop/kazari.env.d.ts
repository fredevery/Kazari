declare global {
  interface Window {
    kazari: {
      logger: {
        info: (message: string, ...args: any[]) => void;
        error: (message: string, ...args: any[]) => void;
        debug: (message: string, ...args: any[]) => void;
      };
    };
  }
}
export {};
