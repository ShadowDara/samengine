/**
 * Restricts a number to the inclusive range between `min` and `max`.
 */
export function clamp(input: number, min: number, max: number): number {
    return Math.min(Math.max(input, min), max);
}

/**
 * Linear interpolation between `start` and `end`.
 *
 * `t = 0` returns `start`, `t = 1` returns `end`, and values between them blend.
 */
export function lerp(start: number, end: number, t: number): number {
    return (start + (end - start) * t);
}

/**
 * Maps a number from one range into another range.
 *
 * Example: `map(5, 0, 10, 0, 100)` returns `50`.
 */
export function map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return (outMax - outMin) * ((value - inMin) / (inMax - inMin)) + outMin;
}

/**
 * Multiplies two numbers.
 *
 * Kept as a tiny utility so vector helpers can use the same naming style.
 */
export function scale(n1: number, n2: number): number {
    return n1 * n2;
}
