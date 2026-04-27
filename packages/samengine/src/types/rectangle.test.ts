// rect.test.ts
import { describe, it, expect } from "bun:test";
import { centerRect, centerRectX, centerRectY, type Rect } from "./rectangle";
import { type Vector2d } from "./vector2d";

describe("Rectangle center functions", () => {
    const rect: Rect = { x: 10, y: 20, width: 30, height: 40 };

    it("calculates center X correctly", () => {
        const centerX = centerRectX(rect);
        expect(centerX).toBe(25); // 10 + 30/2
    });

    it("calculates center Y correctly", () => {
        const centerY = centerRectY(rect);
        expect(centerY).toBe(40); // 20 + 40/2
    });

    it("calculates center Vector correctly", () => {
        const center: Vector2d = centerRect(rect);
        expect(center.x).toBe(25);
        expect(center.y).toBe(40);
    });

    it("handles zero width/height", () => {
        const zeroRect: Rect = { x: 5, y: 5, width: 0, height: 0 };
        const center: Vector2d = centerRect(zeroRect);
        expect(center.x).toBe(5);
        expect(center.y).toBe(5);
    });
});
