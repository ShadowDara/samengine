// 2 Dimensional Vector Type

import { clamp, lerp, map } from "./math-utils.js";

// 2d Vector
export type Vector2d = {
    x: number;
    y: number
};

// Function to normalize a Vector 2d
export function normalize2d(vector: Vector2d): Vector2d {
    // Check if the Vector is zero because then you dont need to
    // calculate sth
    if (vector.x == 0 && vector.y == 0) {
        return vector;
    }

    let produkt = vector.x * vector.x + vector.y * vector.y;
    let root = Math.sqrt(produkt);
    
    vector.x = vector.x / root;
    vector.y = vector.y / root;

    return vector;
}

// Function to clamp a Vector 2d
export function clamp2d(vector: Vector2d, min: Vector2d, max: Vector2d): Vector2d {
    return {
        x: clamp(vector.x, min.x, max.x),
        y: clamp(vector.y, min.y, max.y),
    };
}

// Lerp for a 2d Vector
export function lerp2d(start: Vector2d, end: Vector2d, t: Vector2d): Vector2d {
    return {
        x: lerp(start.x, end.x, t.x),
        y: lerp(start.y, end.y, t.y),
    };
}

// Map Function for a 2d Vector
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
