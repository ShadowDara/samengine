// Color Type
export type Color = {
    r: number;
    g: number;
    b: number;
    a?: number
};

// Function to create an Object of Type Color
export function makeColor(r: number, g: number, b: number, a?: number): Color {
    return {
        r: r,
        g: g,
        b: b,
        a: a
    }
}

export function invertcolor(color: Color): Color {
    return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b,
        ...(color.a !== undefined ? { a: color.a } : {}) // optional alpha behalten
    };
}

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
