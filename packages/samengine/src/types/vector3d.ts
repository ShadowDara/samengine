// 3d Vector

import { clamp, lerp, map } from "../utils/math.js";

/**
 * Three-dimensional vector for positions, directions, and velocities.
 */
export type Vector3d = {
    x: number;
    y: number;
    z: number;
};

/**
 * Creates a new 3D vector.
 */
export function makeVector3d(x: number, y: number, z: number): Vector3d {
    return {
        x: x,
        y: y,
        z: z
    }
}

/**
 * Adds two vectors and returns a new vector.
 */
export function add3d(vector1: Vector3d, vector2: Vector3d): Vector3d {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z,
    }
}

/**
 * Subtracts `vector2` from `vector1` and returns a new vector.
 */
export function subtract3d(vector1: Vector3d, vector2: Vector3d): Vector3d {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z,
    }
}

/**
 * Returns the Euclidean length/magnitude of a 3D vector.
 */
export function length3d(vector: Vector3d): number {
    let produkt = vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
    let root = Math.sqrt(produkt);

    return root;
}

/**
 * Normalizes a vector to length `1`.
 *
 * Important: this function mutates and returns the original vector object.
 */
export function normalize3d(vector: Vector3d): Vector3d {
    // Check if the Vector is zero because then you dont need to
    // calculate sth
    if (vector.x == 0 && vector.y == 0 && vector.z) {
        return vector;
    }

    let root = length3d(vector)
    
    vector.x = vector.x / root;
    vector.y = vector.y / root;
    vector.z = vector.z / root;

    return vector;
}

/**
 * Returns the dot product of two vectors.
 */
export function dot3d(v1: Vector3d, v2: Vector3d): number {
    return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
}

/**
 * Returns the cross product of two 3D vectors.
 */
export function crossprodukt3d(v1: Vector3d, v2: Vector3d): Vector3d {
    return {
        x: (v1.y * v2.z - v1.z * v2.y),
        y: (v1.z * v2.x - v1.x * v2.z),
        z: (v1.x * v2.y - v1.y * v2.x),
    }
}

/**
 * Returns the distance between two 3D vector positions.
 */
export function distance3d(v1: Vector3d, v2: Vector3d): number {
    let tmp: Vector3d = subtract3d(v1, v2);
    return length3d(tmp);
}


/**
 * Clamps vector components between the matching `min` and `max` components.
 */
export function clamp3d(vector: Vector3d, min: Vector3d, max: Vector3d): Vector3d {
    return {
        x: clamp(vector.x, min.x, max.x),
        y: clamp(vector.y, min.y, max.y),
        z: clamp(vector.y, min.y, max.y),
    };
}

/**
 * Linearly interpolates each component from `start` to `end`.
 */
export function lerp3d(start: Vector3d, end: Vector3d, t: Vector3d): Vector3d {
    return {
        x: lerp(start.x, end.x, t.x),
        y: lerp(start.y, end.y, t.y),
        z: lerp(start.y, end.y, t.y),
    };
}

/**
 * Maps each vector component from one numeric range into another range.
 */
export function map3d(
    value: Vector3d,
    inMin: Vector3d,
    inMax: Vector3d,
    outMin: Vector3d,
    outMax: Vector3d,
): Vector3d {
    return {
        x: map(value.x, inMin.x, inMax.x, outMin.x, outMax.x),
        y: map(value.y, inMin.y, inMax.y, outMin.y, outMax.y),
        z: map(value.z, inMin.z, inMax.z, outMin.z, outMax.z),
    }
}
