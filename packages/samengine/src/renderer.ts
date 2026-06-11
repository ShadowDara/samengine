import { type Rect } from "./types/rectangle.js";
import { type Circle } from "./types/circle.js";
import { type Triangle } from "./types/triangle.js";

/**
 * Draws normal browser/canvas text at the given position.
 *
 * The text baseline is set to `"top"`, so `x` and `y` describe the upper-left
 * corner of the text area rather than the alphabetic baseline.
 *
 * @param ctx Canvas 2D rendering context to draw into.
 * @param text Text that should be rendered.
 * @param x Horizontal canvas coordinate.
 * @param y Vertical canvas coordinate.
 * @param color Fill color used for the text. Defaults to white.
 * @param font Canvas font string, for example `"20px Arial"`.
 */
export function renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "white",
    font = "20px Arial"
): void {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
}

/**
 * Maps a character to the rectangle where that character is located inside a
 * bitmap font spritesheet.
 */
export type CharMap = Record<string, Rect>;

/**
 * Renders text from a bitmap font spritesheet.
 *
 * Every character in `text` is looked up in `charMap`. Characters that are not
 * present in the map are skipped. Each source rectangle is drawn next to the
 * previous one, so this is best suited for fixed-height bitmap fonts.
 *
 * @param ctx Canvas 2D rendering context to draw into.
 * @param text Text to render.
 * @param x Start x coordinate.
 * @param y Start y coordinate.
 * @param sprite Image containing all bitmap font glyphs.
 * @param charMap Mapping from character to source rectangle in `sprite`.
 * @param scale Size multiplier for rendered glyphs.
 */
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

/**
 * Draws a filled rectangle.
 *
 * If `rect.borderRadius` is greater than `0` and the browser supports
 * `CanvasRenderingContext2D.roundRect`, a rounded rectangle is drawn.
 * Otherwise the function falls back to `fillRect`.
 */
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

/**
 * Draws the outline of a rectangle.
 *
 * Supports `rect.borderRadius` in the same way as `drawRect`.
 *
 * @param lineWidth Stroke width in canvas pixels.
 */
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

/**
 * Draws a filled circle using the circle center and radius.
 */
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

/**
 * Draws the outline of a circle using the circle center and radius.
 *
 * @param lineWidth Stroke width in canvas pixels.
 */
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

/**
 * Draws a filled triangle from three points.
 */
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

/**
 * Draws the outline of a triangle from three points.
 *
 * @param lineWidth Stroke width in canvas pixels.
 */
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

/**
 * Renders one horizontally repeating parallax background layer.
 *
 * `cameraX` is multiplied by `speed` to create the parallax offset. Lower speed
 * values make the layer move more slowly and feel farther away. The image is
 * repeated horizontally until the full canvas width is covered.
 */
export function renderParallaxBackground(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    cameraX: number,
    speed = 0.5,
    canvasWidth = ctx.canvas.width,
    canvasHeight = ctx.canvas.height
): void {
    if (!image.complete) return;

    const offsetX = -(cameraX * speed) % image.width;

    // Draw enough copies to fill the screen
    for (
        let x = offsetX - image.width;
        x < canvasWidth;
        x += image.width
    ) {
        ctx.drawImage(
            image,
            x,
            0,
            image.width,
            canvasHeight
        );
    }
}

export interface ParallaxLayer {
    /** Image used for this layer. It must be loaded before it can be rendered. */
    image: HTMLImageElement;
    /** Movement multiplier relative to `cameraX`. */
    speed: number;
}

/**
 * Renders multiple parallax layers in array order.
 *
 * Place distant background layers first and foreground layers later so they draw
 * on top of earlier layers.
 */
export function renderParallaxLayers(
    ctx: CanvasRenderingContext2D,
    layers: ParallaxLayer[],
    cameraX: number
): void {
    for (const layer of layers) {
        renderParallaxBackground(
            ctx,
            layer.image,
            cameraX,
            layer.speed
        );
    }
}
