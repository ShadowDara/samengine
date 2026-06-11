// 2 Dimensional Vector Type

import { clamp, lerp, map, scale } from "../utils/math.js";

/**
 * Two-dimensional vector for positions, directions, velocities, and sizes.
 */
export type Vector2d = {
    x: number;
    y: number
};

/**
 * Creates a new 2D vector.
 */
export function makeVector2d(x: number, y: number): Vector2d {
    return {
        x: x,
        y: y
    }
}

/**
 * Adds two vectors and returns a new vector.
 */
export function add2d(vector1: Vector2d, vector2: Vector2d): Vector2d {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
    }
}

/**
 * Subtracts `vector2` from `vector1` and returns a new vector.
 */
export function subtract2d(vector1: Vector2d, vector2: Vector2d): Vector2d {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
    }
}

/**
 * Returns the Euclidean length/magnitude of a vector.
 */
export function length2d(vector: Vector2d): number {
    let produkt = vector.x * vector.x + vector.y * vector.y;
    let root = Math.sqrt(produkt);

    return root;
}

/**
 * Normalizes a vector to length `1`.
 *
 * Important: this function mutates and returns the original vector object. Zero
 * vectors are returned unchanged.
 */
export function normalize2d(vector: Vector2d): Vector2d {
    // Check if the Vector is zero because then you dont need to
    // calculate sth
    if (vector.x == 0 && vector.y == 0) {
        return vector;
    }

    let root = length2d(vector)
    
    vector.x = vector.x / root;
    vector.y = vector.y / root;

    return vector;
}

/**
 * Returns the dot product of two vectors.
 */
export function dot2d(v1: Vector2d, v2: Vector2d): number {
    return (v1.x * v2.x + v1.y * v2.y);
}

// crossprodukt (only for 3 Dimensinal Vectors)

/**
 * Returns the distance between two vector positions.
 */
export function distance2d(v1: Vector2d, v2: Vector2d): number {
    let tmp: Vector2d = subtract2d(v1, v2);
    return length2d(tmp);
}

/**
 * Clamps each component of `vector` between the matching `min` and `max`
 * component.
 */
export function clamp2d(vector: Vector2d, min: Vector2d, max: Vector2d): Vector2d {
    return {
        x: clamp(vector.x, min.x, max.x),
        y: clamp(vector.y, min.y, max.y),
    };
}

/**
 * Linearly interpolates each component from `start` to `end`.
 *
 * `t.x` controls x interpolation and `t.y` controls y interpolation.
 */
export function lerp2d(start: Vector2d, end: Vector2d, t: Vector2d): Vector2d {
    return {
        x: lerp(start.x, end.x, t.x),
        y: lerp(start.y, end.y, t.y),
    };
}

/**
 * Maps each vector component from one numeric range into another range.
 */
export function map2d(
    value: Vector2d,
    inMin: Vector2d,
    inMax: Vector2d,
    outMin: Vector2d,
    outMax: Vector2d,
): Vector2d {
    return {
        x: map(value.x, inMin.x, inMax.x, outMin.x, outMax.x),
        y: map(value.y, inMin.y, inMax.y, outMin.y, outMax.y),
    }
}

/**
 * Multiplies both vector components by a scalar.
 */
export function scale2d(value: Vector2d, vscale: number): Vector2d {
    return {
        x: scale(value.x, vscale),
        y: scale(value.y, vscale),
    }
}
