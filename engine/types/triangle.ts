// Triangle Type for Hitboxes

import { Mouse } from "../input.js";
import { type Vector2d } from "./vector2d.js";

export type Triangle = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number
};

// Function to create an Object of Type triangle
export function makeTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): Triangle {
    return {
        x1: x1,
        x2: x2,
        x3: x3,
        y1: y1,
        y2: y2,
        y3: y3,
    }
}

// Helper function to calculate the area of a triangle (used for point-in-triangle)
function getTriangleArea(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
}

// Function to get the Center of the Triangle
export function centerTriangle(triangle: Triangle): Vector2d {
    return {
        x: (triangle.x1 + triangle.x2 + triangle.x3) / 3,
        y: (triangle.y1 + triangle.y2 + triangle.y3) / 3
    };
}

// Check if a Point is in the Triangle using barycentric coordinates
export function isPointInTriangle(x: number, y: number, triangle: Triangle): boolean {
    const areaTriangle = getTriangleArea(
        triangle.x1, triangle.y1,
        triangle.x2, triangle.y2,
        triangle.x3, triangle.y3
    );

    const area1 = getTriangleArea(x, y, triangle.x2, triangle.y2, triangle.x3, triangle.y3);
    const area2 = getTriangleArea(triangle.x1, triangle.y1, x, y, triangle.x3, triangle.y3);
    const area3 = getTriangleArea(triangle.x1, triangle.y1, triangle.x2, triangle.y2, x, y);

    return Math.abs(areaTriangle - (area1 + area2 + area3)) < 0.01;
}

// Check if Mouse is in the Triangle
export function isMouseInTriangle(mouse: Mouse, triangle: Triangle): boolean {
    return isPointInTriangle(mouse.x, mouse.y, triangle);
}

// Function to check if a Triangle is clicked
export function isTriangleClicked(mouse: Mouse, triangle: Triangle): boolean {
    return isMouseInTriangle(mouse, triangle) && mouse.justPressed;
}

// Get the Perimeter of the Triangle
export function getTrianglePerimeter(triangle: Triangle): number {
    const side1 = Math.sqrt(
        (triangle.x2 - triangle.x1) * (triangle.x2 - triangle.x1) +
        (triangle.y2 - triangle.y1) * (triangle.y2 - triangle.y1)
    );

    const side2 = Math.sqrt(
        (triangle.x3 - triangle.x2) * (triangle.x3 - triangle.x2) +
        (triangle.y3 - triangle.y2) * (triangle.y3 - triangle.y2)
    );

    const side3 = Math.sqrt(
        (triangle.x1 - triangle.x3) * (triangle.x1 - triangle.x3) +
        (triangle.y1 - triangle.y3) * (triangle.y1 - triangle.y3)
    );

    return side1 + side2 + side3;
}
