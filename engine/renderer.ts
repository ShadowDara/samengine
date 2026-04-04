import { type Rect } from "./types/rectangle.js";

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
