// Clamp
export function clamp(input: number, min: number, max: number): number {
    return Math.min(Math.max(input, min), max);
}

// Lerp
export function lerp(start: number, end: number, t: number): number {
    return (start + (end - start) * t);
}

// Map
export function map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return (outMax - outMin) * ((value - inMin) / (inMax - inMin)) + outMin;
}

// Scale
export function scale(n1: number, n2: number): number {
    return n1 * n2;
}
