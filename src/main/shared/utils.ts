/**
 * Utility functions for the main process
 */

/**
 * Generate a unique ID for timer sessions
 */
export function generateId(): string {
  return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(durationString: string): number {
  const parts = durationString.split(':').map(Number);
  const minutes = parts[0] || 0;
  const seconds = parts[1] || 0;
  return (minutes * 60 + seconds) * 1000;
}

/**
 * Check if a value is a valid timer duration
 */
export function isValidDuration(duration: number): boolean {
  return typeof duration === 'number' && isFinite(duration) && duration > 0;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}
