import { dlog } from "./logger.js";
import { Rect } from "./types/rectangle.js";

const textures: Record<string, HTMLImageElement> = {};

/**
 * Loaded texture image.
 *
 * `undefined` means the texture was not loaded or the cache key does not exist.
 */
export type Texture = HTMLImageElement | undefined;

/**
 * Optional drawing settings used by texture, atlas, and animation rendering.
 */
export type DrawOptions = {
    /** Target width before `scale` is applied. Defaults to source width. */
    width?: number;
    /** Target height before `scale` is applied. Defaults to source height. */
    height?: number;
    /** Rotation in radians around the rendered image center. */
    rotation?: number;
    /** Mirrors the image horizontally around its center. */
    flipX?: boolean;
    /** Mirrors the image vertically around its center. */
    flipY?: boolean;
    /** Multiplies the final rendered width and height. */
    scale?: number;
};

function getresourcepath(path: string): string {
    return "/resources/" + path;
}

/**
 * Loads an image and stores it in the texture cache.
 *
 * Normal builds load from `/resources/${src}`. Single-file exports can provide
 * embedded resources through `window.__resources`; if a matching key exists,
 * that data URL is used instead. The cache key always remains the original
 * `src` string, so `getTexture(src)` works the same in both modes.
 *
 * @param src Resource path relative to the resources folder.
 * @returns Promise resolving to the loaded `HTMLImageElement`.
 */
export function loadTextureAsync(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        // Wenn schon geladen
        const existing = getTexture(src);
        if (existing) return resolve(existing);

        const img = new Image();

        // 🔹 Hier Pfad modifizieren, z.B. Prefix hinzufügen
        let finalSrc = getresourcepath(src);

        const embeddedResources = (window as any).__resources;
        if (embeddedResources && embeddedResources[src]) {
            finalSrc = embeddedResources[src];
        }

        const cacheKey = src; // 👈 WICHTIG: NICHT finalSrc

        img.onload = () => {
            // Cache speichern - always use the same cache key for consistency
            textures[cacheKey] = img;
            resolve(img);
        };

        img.onerror = () => {
            const msg = `Failed to load texture: ${finalSrc}`;
            console.error(msg);
            reject(new Error(msg));
        };

        // 🔹 Bild laden mit finalem Pfad
        img.src = finalSrc;
    });
}

/**
 * Reads a texture from the cache.
 *
 * This does not start loading by itself. Call `loadTextureAsync` first or handle
 * the `undefined` result.
 */
export function getTexture(src: string): Texture {
    return textures[src];
}

/**
 * Draws a texture to the canvas.
 *
 * The image is drawn around its center for rotation and flipping, but `x` and
 * `y` still describe the top-left target position. If the texture is missing,
 * a magenta fallback rectangle is drawn to make missing assets visible.
 */
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

/**
 * A spritesheet image plus named frame rectangles inside that image.
 */
export type TextureAtlas = {
    /** Spritesheet image. */
    image: HTMLImageElement;
    /** Named source rectangles inside `image`. */
    frames: Record<string, Rect>;
};

/**
 * Loads a texture atlas image and its JSON frame data.
 *
 * The JSON file is fetched from the resources folder and must contain a
 * `frames` object with frame names mapped to rectangles:
 *
 * ```json
 * {
 *   "frames": {
 *     "player_idle_0": { "x": 0, "y": 0, "width": 32, "height": 32 }
 *   }
 * }
 * ```
 */
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

/**
 * Draws one named frame from a texture atlas.
 *
 * Missing frame names are logged through `dlog` and skipped.
 */
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

/**
 * Keeps track of time and current frame for a named-frame animation.
 *
 * The player only stores animation state. It does not draw anything by itself;
 * call `drawAnimation` after `update(dt)` to render the current atlas frame.
 */
export class AnimationPlayer {
    private time = 0;
    private currentFrameIndex = 0;
    private finished = false;

    /**
     * Creates a player for the given animation definition.
     */
    constructor(public animation: Animation) { }

    /**
     * Advances the animation by `deltaTime` seconds.
     *
     * Looping animations wrap back to the first frame. Non-looping animations
     * stop on their final frame and then report `isFinished() === true`.
     */
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

    /**
     * Returns the frame name that should currently be rendered from the atlas.
     */
    getCurrentFrame(): string {
        return this.animation.frames[this.currentFrameIndex];
    }

    /**
     * Restarts the animation from the first frame.
     */
    reset(): void {
        this.time = 0;
        this.currentFrameIndex = 0;
        this.finished = false;
    }

    /**
     * Returns whether a non-looping animation reached its final frame.
     */
    isFinished(): boolean {
        return this.finished;
    }
}

/**
 * Animation definition based on named frames inside a `TextureAtlas`.
 */
export type Animation = {
    /** Frame names in playback order. */
    frames: string[];
    /** Playback speed in frames per second. */
    fps: number;
    /** Whether playback should wrap to the first frame. Defaults to false-like. */
    loop?: boolean;
};

/**
 * Draws the current frame of an `AnimationPlayer`.
 */
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

/**
 * Helper for side-view sprites.
 *
 * Returns `true` when a negative direction should flip a sprite horizontally.
 */
export function getFlipFromDirection(dir: number): boolean {
    return dir < 0; // links = true
}
