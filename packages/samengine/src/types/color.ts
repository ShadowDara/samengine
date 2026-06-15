/**
 * RGBA color object.
 *
 * `r`, `g`, and `b` are expected in the 0-255 range. `a` is optional and can be
 * used by callers as an alpha channel value.
 */
export type Color = {
    r: number;
    g: number;
    b: number;
    a?: number
};

/**
 * Creates a color object.
 */
export function makeColor(r: number, g: number, b: number, a?: number): Color {
    return {
        r: r,
        g: g,
        b: b,
        a: a
    }
}

/**
 * Returns the RGB inverse of a color while preserving alpha if it exists.
 */
export function invertcolor(color: Color): Color {
    return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b,
        ...(color.a !== undefined ? { a: color.a } : {}) // optional alpha behalten
    };
}

/**
 * Inverts a hex color in `#rrggbb` or `rrggbb` format.
 *
 * The returned value always starts with `#`.
 */
export function invertHexColor(hex: string): string {
    // Entferne das führende #
    const cleanHex = hex.replace('#','');

    // Wandeln in R, G, B
    const r = 255 - parseInt(cleanHex.slice(0, 2), 16);
    const g = 255 - parseInt(cleanHex.slice(2, 4), 16);
    const b = 255 - parseInt(cleanHex.slice(4, 6), 16);

    // Zurück in Hex-String
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
