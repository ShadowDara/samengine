// vector.test.ts
import { describe, it, expect } from "bun:test";
import { type Vector2d, normalize2d } from "./vector2d";

describe("normalize", () => {
    it("normalizes a vector to length 1", () => {
        const v: Vector2d = { x: 3, y: 4 };
        const normalized = normalize2d({ ...v }); // Kopie, um Original nicht zu verändern

        // Länge berechnen
        const length = Math.sqrt(normalized.x ** 2 + normalized.y ** 2);

        // the old Vector should be the same
        expect(v.x).toBe(3);

        expect(length).toBeCloseTo(1); // Bun akzeptiert toBeCloseTo für Floats
        expect(normalized.x).toBeCloseTo(0.6); // 3/5
        expect(normalized.y).toBeCloseTo(0.8); // 4/5
    });

    it("handles zero vector gracefully", () => {
        const v: Vector2d = { x: 0, y: 0 };
        const normalized = normalize2d({ ...v });

        // Nullvektor bleibt Nullvektor
        expect(normalized.x).toBe(0);
        expect(normalized.y).toBe(0);
    });
});
