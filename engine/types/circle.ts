// Circle Type for Hitboxes

import { Mouse } from "../input.js";
import { type Vector2d } from "./vector2d.js";

export type Circle = {
    x: number;
    y: number;
    radius: number
};

// Function to get the Center of the Circle as Vector2d
export function centerCircle(circle: Circle): Vector2d {
    return { x: circle.x, y: circle.y };
}

// Check if a Point is in the Circle
export function isPointInCircle(x: number, y: number, circle: Circle): boolean {
    const distance = Math.sqrt(
        (x - circle.x) * (x - circle.x) + 
        (y - circle.y) * (y - circle.y)
    );
    return distance <= circle.radius;
}

// Check if Mouse is in the Circle
export function isMouseInCircle(mouse: Mouse, circle: Circle): boolean {
    return isPointInCircle(mouse.x, mouse.y, circle);
}

// Function to check if a Circle is clicked
export function isCircleClicked(mouse: Mouse, circle: Circle): boolean {
    return isMouseInCircle(mouse, circle) && mouse.justPressed;
}

// Check if two Circles collide
export function isCircleColliding(circle1: Circle, circle2: Circle): boolean {
    const distance = Math.sqrt(
        (circle1.x - circle2.x) * (circle1.x - circle2.x) + 
        (circle1.y - circle2.y) * (circle1.y - circle2.y)
    );
    return distance <= (circle1.radius + circle2.radius);
}

// Check if Circle collides with Rectangle (imported from rectangle.ts would cause circular dependency)
export function getCircleDistance(circle1: Circle, circle2: Circle): number {
    return Math.sqrt(
        (circle1.x - circle2.x) * (circle1.x - circle2.x) + 
        (circle1.y - circle2.y) * (circle1.y - circle2.y)
    );
}
