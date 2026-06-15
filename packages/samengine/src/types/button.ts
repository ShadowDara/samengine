// Button

import { Rect } from "./rectangle.js";
import { getMouse, Mouse } from "../input.js";
import { isRectClicked } from "./rectangle.js";
import { drawRect } from "../renderer.js";
import { renderText } from "../renderer.js";

/**
 * Simple canvas button model.
 *
 * The button is not a DOM element. It is drawn on the canvas and checked with
 * mouse hit testing.
 */
export type Button = {
    /** Rectangle that defines the button position and size. */
    form: Rect;
    /** Text label drawn in the button center. */
    text: string;
}

// Function to create a new Button Type
/**
 * Creates a canvas button description.
 */
export function makeButton(form: Rect, text: string): Button {
    return {
        form: form,
        text: text
    };
}

// Prüft, ob der Button geklickt wurde
/**
 * Returns true when the button rectangle was clicked during the current frame.
 */
export function clickedButton(btn: Button, mouse: Mouse): boolean {
    return isRectClicked(mouse, btn.form);
}

// Zeichnet den Button (Rechteck + Text)
/**
 * Draws a simple filled rectangle button with centered text.
 */
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
