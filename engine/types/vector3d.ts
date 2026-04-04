// 3d Vector

import { clamp, lerp } from "./math-utils";

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

// Function to clamp a Vector 2d
export function clamp3d(vector: Vector3d, min: Vector3d, max: Vector3d): Vector3d {
    return {
        x: clamp(vector.x, min.x, max.x),
        y: clamp(vector.y, min.y, max.y),
        z: clamp(vector.y, min.y, max.y),
    };
}

// Lerp for a 2d Vector
export function lerp3d(start: Vector3d, end: Vector3d, t: Vector3d): Vector3d {
    return {
        x: lerp(start.x, end.x, t.x),
        y: lerp(start.y, end.y, t.y),
        z: lerp(start.y, end.y, t.y),
    };
}
