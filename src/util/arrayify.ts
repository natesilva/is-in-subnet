/**
 * Ensures a value is an array. If it's already an array, returns it unchanged. If it’s a
 * single value, wraps it in an array.
 *
 * @param arr - The value to ensure is an array.
 * @returns An array containing the value.
 */
export function arrayify<T>(arr: T | readonly T[]): readonly T[] {
  return Array.isArray(arr) ? arr : [arr as T];
}
