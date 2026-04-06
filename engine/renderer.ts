import { type Rect } from "./types/rectangle.js";
import { type Circle } from "./types/circle.js";
import { type Triangle } from "./types/triangle.js";

// Function to render Text
export function renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "white",
    font = "20px Arial"
) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
}

type CharMap = Record<string, Rect>;

export function renderBitmapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    sprite: HTMLImageElement,
    charMap: CharMap,
    scale = 1
): void {
    let offsetX = 0;
    for (const c of text) {
        const rect = charMap[c];
        if (!rect) continue;
        ctx.drawImage(
            sprite,
            rect.x, rect.y, rect.width, rect.height,
            x + offsetX, y,
            rect.width * scale,
            rect.height * scale
        );
        offsetX += rect.width * scale;
    }
}

// ===== SHAPE DRAWING =====

// Function to draw a filled Rectangle
export function drawRect(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    color = "white"
): void {
    ctx.fillStyle = color;
    const radius = rect.borderRadius ?? 0;
    
    if (radius > 0 && (ctx as any).roundRect) {
        ctx.beginPath();
        (ctx as any).roundRect(rect.x, rect.y, rect.width, rect.height, radius);
        ctx.fill();
    } else {
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
}

// Function to draw a Rectangle outline
export function drawRectOutline(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    color = "white",
    lineWidth = 1
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const radius = rect.borderRadius ?? 0;
    
    if (radius > 0 && (ctx as any).roundRect) {
        ctx.beginPath();
        (ctx as any).roundRect(rect.x, rect.y, rect.width, rect.height, radius);
        ctx.stroke();
    } else {
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}

// Function to draw a filled Circle
export function drawCircle(
    ctx: CanvasRenderingContext2D,
    circle: Circle,
    color = "white"
): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Function to draw a Circle outline
export function drawCircleOutline(
    ctx: CanvasRenderingContext2D,
    circle: Circle,
    color = "white",
    lineWidth = 1
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.stroke();
}

// Function to draw a filled Triangle
export function drawTriangle(
    ctx: CanvasRenderingContext2D,
    triangle: Triangle,
    color = "white"
): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(triangle.x1, triangle.y1);
    ctx.lineTo(triangle.x2, triangle.y2);
    ctx.lineTo(triangle.x3, triangle.y3);
    ctx.closePath();
    ctx.fill();
}

// Function to draw a Triangle outline
export function drawTriangleOutline(
    ctx: CanvasRenderingContext2D,
    triangle: Triangle,
    color = "white",
    lineWidth = 1
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(triangle.x1, triangle.y1);
    ctx.lineTo(triangle.x2, triangle.y2);
    ctx.lineTo(triangle.x3, triangle.y3);
    ctx.closePath();
    ctx.stroke();
}
