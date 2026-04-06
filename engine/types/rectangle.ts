// Rectangle Type for Hitboxes

import { Mouse } from "../input.js";
import { type Vector2d } from "./vector2d.js";

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
};

// Function to create an Object of Type rect
export function makeRect(x: number, y: number, width: number, height: number, borderRadius: number = 0): Rect {
    return {
        x: x,
        y: y,
        height: height,
        width: width,
        borderRadius: borderRadius
    }
}

// Function to get the Center of the Width of the Object
export function centerRectX(rect: Rect): number {
    return (rect.x + (rect.width / 2));
}

// Function to get the Center of the Height of the Object
export function centerRectY(rect: Rect): number {
    return (rect.y + (rect.height / 2));
}

// Get the Center of a Rectangle
export function centerRect(rect: Rect): Vector2d {
    let vector: Vector2d = { x: centerRectX(rect), y: centerRectY(rect) };
    return vector;
}

// Check if a Point in the Rectangle
export function isPointInRect(x: number, y: number, rect: Rect): boolean {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}

export function isMouseInRect(mouse: Mouse, rect: Rect): boolean {
    return (
        mouse.x >= rect.x &&
        mouse.x <= rect.x + rect.width &&
        mouse.y >= rect.y &&
        mouse.y <= rect.y + rect.height
    );
}

// Function to check if a Rectangle is clicked  
export function isRectClicked(mouse: Mouse, rect: Rect): boolean {
    return isMouseInRect(mouse, rect) && mouse.justPressed;
}
