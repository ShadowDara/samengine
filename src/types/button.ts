// Button

import { Rect } from "./rectangle.js";
import { getMouse } from "../input.js";
import { isRectClicked } from "./rectangle.js";
import { drawRect } from "../renderer.js";
import { renderText } from "../renderer.js";

export type Button = {
    form: Rect;
    text: string;
}

// Function to create a new Button Type
export function makeButton(form: Rect, text: string): Button {
    return {
        form: form,
        text: text
    };
}

// Prüft, ob der Button geklickt wurde
export function clickedButton(btn: Button): boolean {
    const mouse = getMouse();
    return isRectClicked(mouse, btn.form);
}

// Zeichnet den Button (Rechteck + Text)
export function drawButton(
    btn: Button,
    ctx: CanvasRenderingContext2D,
    color: string = "#444",
    textColor: string = "white",
    font: string = "20px Arial"
): void {
    drawRect(ctx, btn.form, color);
    // Text mittig im Button platzieren
    const textX = btn.form.x + btn.form.width / 2;
    const textY = btn.form.y + btn.form.height / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    renderText(ctx, btn.text, textX, textY, textColor, font);
}