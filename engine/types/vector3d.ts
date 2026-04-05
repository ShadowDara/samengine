// 3d Vector

import { clamp, lerp, map } from "./math-utils.js";

// Vector 3d
export type Vector3d = {
    x: number;
    y: number;
    z: number;
};

// Function to normalize a Vector 2d
export function normalize3d(vector: Vector3d): Vector3d {
    // Check if the Vector is zero because then you dont need to
    // calculate sth
    if (vector.x == 0 && vector.y == 0 && vector.z) {
        return vector;
    }

    let produkt = vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
    let root = Math.sqrt(produkt);
    
    vector.x = vector.x / root;
    vector.y = vector.y / root;
    vector.z = vector.z / root;

    return vector;
}

// TODO
// ADD CROSS PRODUKT

// Function to clamp a Vector 3d
export function clamp3d(vector: Vector3d, min: Vector3d, max: Vector3d): Vector3d {
    return {
        x: clamp(vector.x, min.x, max.x),
        y: clamp(vector.y, min.y, max.y),
        z: clamp(vector.y, min.y, max.y),
    };
}

// Lerp for a 3d Vector
export function lerp3d(start: Vector3d, end: Vector3d, t: Vector3d): Vector3d {
    return {
        x: lerp(start.x, end.x, t.x),
        y: lerp(start.y, end.y, t.y),
        z: lerp(start.y, end.y, t.y),
    };
}

// Map Function for a 3d Vector
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
