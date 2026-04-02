import { dlog } from "./logger";

const textures: Record<string, HTMLImageElement> = {};

export type Texture = HTMLImageElement | undefined;

// Function to load a Texture Async
export function loadTextureAsync(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        // Wenn schon geladen
        const existing = getTexture(src);
        if (existing) return resolve(existing);

        const img = new Image();

        // 🔹 Hier Pfad modifizieren, z.B. Prefix hinzufügen
        let finalSrc = `resources/${src}`;

        img.onload = () => {
            // Cache speichern
            textures[finalSrc] = img; // optional: Original-Pfad oder finalSrc?
            resolve(img);
        };

        img.onerror = () => {
            const msg = `❌ Failed to load texture: ${finalSrc}`;
            console.error(msg);
            reject(new Error(msg));
        };

        // 🔹 Bild laden mit finalem Pfad
        img.src = finalSrc;
    });
}

export function getTexture(src: string): Texture {
    return textures[src];
}

export function drawTexture(
    ctx: CanvasRenderingContext2D,
    texture: Texture,
    x: number,
    y: number,
    width?: number,
    height?: number
): void {
    if (!texture) {
        dlog("Texture not found");

        ctx.fillStyle = "magenta";
        ctx.fillRect(x, y, width ?? 32, height ?? 32);
        return;
    }

    if (width && height) {
        ctx.drawImage(texture, x, y, width, height);
    } else {
        ctx.drawImage(texture, x, y);
    }
}
