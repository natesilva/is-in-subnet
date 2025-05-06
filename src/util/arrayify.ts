/**
 * Ensures a value is an array. If it's already an array, returns it unchanged. If it’s a
 * single value, wraps it in an array.
 */
export function arrayify<T>(arr: T | readonly T[]): readonly T[] {
  return Array.isArray(arr) ? arr : [arr as T];
}
