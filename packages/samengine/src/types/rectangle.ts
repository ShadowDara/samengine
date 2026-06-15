// Rectangle Type for Hitboxes

import { type Mouse } from "../input.js";
import { type Vector2d } from "./vector2d.js";

/**
 * Axis-aligned rectangle used for drawing, UI, and simple hit tests.
 *
 * `x` and `y` describe the top-left corner. `width` and `height` extend to the
 * right and downward in normal canvas coordinates.
 */
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
};

/**
 * Creates a rectangle object.
 */
export function makeRect(x: number, y: number, width: number, height: number, borderRadius: number = 0): Rect {
    return {
        x: x,
        y: y,
        height: height,
        width: width,
        borderRadius: borderRadius
    }
}

/**
 * Returns the horizontal center coordinate of a rectangle.
 */
export function centerRectX(rect: Rect): number {
    return (rect.x + (rect.width / 2));
}

/**
 * Returns the vertical center coordinate of a rectangle.
 */
export function centerRectY(rect: Rect): number {
    return (rect.y + (rect.height / 2));
}

/**
 * Returns the rectangle center as a `Vector2d`.
 */
export function centerRect(rect: Rect): Vector2d {
    let vector: Vector2d = { x: centerRectX(rect), y: centerRectY(rect) };
    return vector;
}

/**
 * Checks whether a point is inside or on the border of a rectangle.
 */
export function isPointInRect(x: number, y: number, rect: Rect): boolean {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}

/**
 * Checks whether the current mouse position is inside a rectangle.
 */
export function isMouseInRect(mouse: Mouse, rect: Rect): boolean {
    return (
        mouse.x >= rect.x &&
        mouse.x <= rect.x + rect.width &&
        mouse.y >= rect.y &&
        mouse.y <= rect.y + rect.height
    );
}

/**
 * Checks whether a rectangle was clicked during the current frame.
 *
 * This depends on `mouse.justPressed`, so call it before `resetInput()`.
 */
export function isRectClicked(mouse: Mouse, rect: Rect): boolean {
    return isMouseInRect(mouse, rect) && mouse.justPressed;
}
