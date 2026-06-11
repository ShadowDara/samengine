// Circle Type for Hitboxes

import { Mouse } from "../input.js";
import { type Vector2d } from "./vector2d.js";

/**
 * Circle shape used for drawing, hit tests, and simple collision checks.
 *
 * `x` and `y` are the center of the circle.
 */
export type Circle = {
    x: number;
    y: number;
    radius: number
};

/**
 * Creates a circle object.
 */
export function makeCircle(x: number, y: number, radius: number): Circle {
    return {
        x: x,
        y: y,
        radius: radius,
    }
}

/**
 * Returns the center of the circle as a `Vector2d`.
 */
export function centerCircle(circle: Circle): Vector2d {
    return { x: circle.x, y: circle.y };
}

/**
 * Checks whether a point is inside or on the border of a circle.
 */
export function isPointInCircle(x: number, y: number, circle: Circle): boolean {
    const distance = Math.sqrt(
        (x - circle.x) * (x - circle.x) + 
        (y - circle.y) * (y - circle.y)
    );
    return distance <= circle.radius;
}

/**
 * Checks whether the current mouse position is inside a circle.
 */
export function isMouseInCircle(mouse: Mouse, circle: Circle): boolean {
    return isPointInCircle(mouse.x, mouse.y, circle);
}

/**
 * Checks whether a circle was clicked during the current frame.
 */
export function isCircleClicked(mouse: Mouse, circle: Circle): boolean {
    return isMouseInCircle(mouse, circle) && mouse.justPressed;
}

/**
 * Checks whether two circles overlap or touch.
 */
export function isCircleColliding(circle1: Circle, circle2: Circle): boolean {
    const distance = Math.sqrt(
        (circle1.x - circle2.x) * (circle1.x - circle2.x) + 
        (circle1.y - circle2.y) * (circle1.y - circle2.y)
    );
    return distance <= (circle1.radius + circle2.radius);
}

/**
 * Returns the center-to-center distance between two circles.
 */
export function getCircleDistance(circle1: Circle, circle2: Circle): number {
    return Math.sqrt(
        (circle1.x - circle2.x) * (circle1.x - circle2.x) + 
        (circle1.y - circle2.y) * (circle1.y - circle2.y)
    );
}
