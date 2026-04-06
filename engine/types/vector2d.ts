// 2 Dimensional Vector Type

import { clamp, lerp, map } from "../utils/math.js";

// 2d Vector
export type Vector2d = {
    x: number;
    y: number
};

// Function to add 2 Vectors together
export function add2d(vector1: Vector2d, vector2: Vector2d): Vector2d {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
    }
}

// Function to subtract 2 Vectors from each other
export function subtract2d(vector1: Vector2d, vector2: Vector2d): Vector2d {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
    }
}

// Function to get the length from an Vector
export function length2d(vector: Vector2d): number {
    let produkt = vector.x * vector.x + vector.y * vector.y;
    let root = Math.sqrt(produkt);

    return root;
}

// Function to normalize a Vector 2d
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

// Function to make scalar produkt from an Vector
export function dot2d(v1: Vector2d, v2: Vector2d): number {
    return (v1.x * v2.x + v1.y * v2.y);
}

// crossprodukt (only for 3 Dimensinal Vectors)

// Calculate the Distance between 2 Vectors
export function distance2d(v1: Vector2d, v2: Vector2d): number {
    let tmp: Vector2d = subtract2d(v1, v2);
    return length2d(tmp);
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
