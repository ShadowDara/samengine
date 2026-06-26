// Utils Package

// Math Utilities
export { clamp, lerp, map, scale } from "./math.js";

/**
 * Creates a small deterministic 32-bit hash from a string.
 *
 * Used internally by the immediate-mode HTML UI to turn labels into stable
 * numeric ids. This is not a cryptographic hash.
 */
export function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // 32bit int
  }
  return h;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 *
 * The same array instance is returned for convenient chaining.
 */
export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
