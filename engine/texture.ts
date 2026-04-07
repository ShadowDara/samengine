import { dlog } from "./logger.js";
import { Rect } from "./types/rectangle.js";

const textures: Record<string, HTMLImageElement> = {};

export type Texture = HTMLImageElement | undefined;

export type DrawOptions = {
    width?: number;
    height?: number;
    rotation?: number;
    flipX?: boolean;
    flipY?: boolean;
    scale?: number;
};

function getresourcepath(path: string): string {
    return "resources/" + path;
}

// Function to load a Texture Async
export function loadTextureAsync(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        // Wenn schon geladen
        const existing = getTexture(src);
        if (existing) return resolve(existing);

        const img = new Image();

        // 🔹 Hier Pfad modifizieren, z.B. Prefix hinzufügen
        let finalSrc = getresourcepath(src);
        const cacheKey = finalSrc;

        // Check if resources are embedded (single file build)
        const embeddedResources = (window as any).__resources;
        if (embeddedResources && embeddedResources[src]) {
            // Use embedded resource (data URI)
            finalSrc = embeddedResources[src];
        }

        img.onload = () => {
            // Cache speichern - always use the same cache key for consistency
            textures[cacheKey] = img;
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

// Function to get the Texture
export function getTexture(src: string): Texture {
    return textures[getresourcepath(src)];
}

// Function to draw a texture to the Screen
export function drawTexture(
    ctx: CanvasRenderingContext2D,
    texture: Texture,
    x: number,
    y: number,
    options: DrawOptions = {}
): void {
    const {
        width,
        height,
        rotation = 0,
        flipX = false,
        flipY = false,
        scale = 1
    } = options;

    if (!texture) {
        dlog("Texture not found");

        ctx.fillStyle = "magenta";
        ctx.fillRect(x, y, (width ?? 32) * scale, (height ?? 32) * scale);
        return;
    }

    const w = (width ?? texture.width) * scale;   // 🔹 scale anwenden
    const h = (height ?? texture.height) * scale; // 🔹 scale anwenden

    ctx.save();

    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.drawImage(texture, -w / 2, -h / 2, w, h);

    ctx.restore();
}

// Texture Atlas Type
export type TextureAtlas = {
    image: HTMLImageElement;
    frames: Record<string, Rect>;
};

// Funtion to load an Atlas
//
// JSON Format for the LoadAtlas Function
//
// {
//   "frames": {
//     "player_idle_0": { "x": 0, "y": 0, "w": 32, "h": 32 },
//     "player_idle_1": { "x": 32, "y": 0, "w": 32, "h": 32 }
//   }
// }
//
export async function loadAtlas(
    imageSrc: string,
    dataSrc: string
): Promise<TextureAtlas> {
    const [image, data] = await Promise.all([
        loadTextureAsync(imageSrc),
        fetch(getresourcepath(dataSrc)).then(r => r.json())
    ]);

    return {
        image,
        frames: data.frames
    };
}

export function drawAtlasFrame(
    ctx: CanvasRenderingContext2D,
    atlas: TextureAtlas,
    frameName: string,
    x: number,
    y: number,
    options: DrawOptions = {}
): void {
    const {
        width,
        height,
        rotation = 0,
        flipX = false,
        flipY = false,
        scale = 1
    } = options;

    const frame = atlas.frames[frameName];

    if (!frame) {
        dlog(`Frame not found: ${frameName}`);
        return;
    }

    const w = (width ?? frame.width) * scale;
    const h = (height ?? frame.height) * scale;

    ctx.save();

    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.drawImage(
        atlas.image,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        -w / 2,
        -h / 2,
        w,
        h
    );

    ctx.restore();
}

//
//
// Animation Player
//
//
//
// // Define Animation
// const walkAnimation: Animation = {
//     frames: ["walk_0", "walk_1", "walk_2", "walk_3"],
//     fps: 8,
//     loop: true
// };
//
// const player = new AnimationPlayer(walkAnimation);
//
// // Game Loop
// function update(dt: number) {
//     player.update(dt);
// }
//
// function render(ctx: CanvasRenderingContext2D) {
//     drawAnimation(ctx, atlas, player, 100, 100, 64, 64);
// }
//
//
// Animation Player Class
export class AnimationPlayer {
    private time = 0;
    private currentFrameIndex = 0;
    private finished = false;

    // Konstruktor Function
    constructor(public animation: Animation) { }

    update(deltaTime: number): void {
        if (this.finished) return;

        this.time += deltaTime;

        const frameDuration = 1 / this.animation.fps;

        while (this.time >= frameDuration) {
            this.time -= frameDuration;
            this.currentFrameIndex++;

            if (this.currentFrameIndex >= this.animation.frames.length) {
                if (this.animation.loop) {
                    this.currentFrameIndex = 0;
                } else {
                    this.currentFrameIndex = this.animation.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    getCurrentFrame(): string {
        return this.animation.frames[this.currentFrameIndex];
    }

    reset(): void {
        this.time = 0;
        this.currentFrameIndex = 0;
        this.finished = false;
    }

    isFinished(): boolean {
        return this.finished;
    }
}

// Animation Type
export type Animation = {
    frames: string[];
    fps: number;
    loop?: boolean;
};

export function drawAnimation(
    ctx: CanvasRenderingContext2D,
    atlas: TextureAtlas,
    player: AnimationPlayer,
    x: number,
    y: number,
    options: DrawOptions = {}
): void {
    const frame = player.getCurrentFrame();

    drawAtlasFrame(
        ctx,
        atlas,
        frame,
        x,
        y,
        options
    );
}

export function getFlipFromDirection(dir: number): boolean {
    return dir < 0; // links = true
}
