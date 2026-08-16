import { getGameSettings, setGameSettings, onGameSettingsChange } from "./settings.js";

/**
 * Legacy global written by generated single-file HTML builds.
 *
 * New game code should use `getGameSetting`/`getGameSettings` from the
 * Settings Runtime instead. This type only exists so `window.__GAMESETTINGS__`
 * remains fully typed for the games that still read it directly.
 */
declare global {
    interface Window {
        __GAMESETTINGS__?: Record<string, unknown>;
    }
}

/**
 * Bridges the legacy `window.__GAMESETTINGS__` global with the Core Settings
 * Runtime, for backwards compatibility with existing single-file HTML builds.
 *
 * This is HTML-adapter-only behavior: the Core Settings Runtime itself never
 * touches `window`. Call this once, after `window.__GAMESETTINGS__` has been
 * populated (for example right after the generated start-button handler runs),
 * to make its values available through `getGameSetting`. From then on, both
 * directions stay in sync until the returned unsubscribe function is called.
 *
 * The Svelte adapter does not call this - Svelte games should use
 * `setGameSettings`/`setGameSetting` exclusively.
 *
 * @returns A cleanup function that stops the sync.
 */
export function bridgeLegacyGameSettings(): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }

    if (window.__GAMESETTINGS__) {
        setGameSettings({ ...getGameSettings(), ...window.__GAMESETTINGS__ });
    }

    window.__GAMESETTINGS__ = getGameSettings();

    return onGameSettingsChange((current) => {
        window.__GAMESETTINGS__ = { ...current };
    });
}

export type CanvasConfig = {
    /** Fixed canvas width when `fullscreen` is false. Defaults to 800. */
    width?: number;
    /** Fixed canvas height when `fullscreen` is false. Defaults to 800. */
    height?: number;
    /** If true, the canvas is resized to the browser window. */
    fullscreen?: boolean;
    /**
     * Scaling mode. `"fit"` keeps a virtual resolution and letterboxes it into
     * the real canvas. `"none"` draws directly in canvas pixels.
     */
    scaling?: "none" | "fit";
    /** Logical game width used by `"fit"` scaling. Defaults to 800. */
    virtualWidth?: number;
    /** Logical game height used by `"fit"` scaling. Defaults to 800. */
    virtualHeight?: number;
};

/** Result of binding SamEngine's canvas/scaling behavior to a `<canvas>`. */
export type AttachedCanvas = {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /**
     * Applies the configured scaling transform. Call this once at the start
     * of every frame, before drawing game objects.
     */
    applyScaling: () => void;
    virtualWidth: number;
    virtualHeight: number;
    /** Removes the resize listener installed by `attachCanvas`. */
    destroy: () => void;
};

/** Options for `attachCanvas`. Same as `CanvasConfig`, plus the canvas to bind to. */
export type AttachCanvasConfig = CanvasConfig & {
    /** Existing canvas element to bind SamEngine to, e.g. from `bind:this`. */
    canvas: HTMLCanvasElement;
};

/**
 * Binds SamEngine's canvas sizing/scaling behavior to an *existing* canvas
 * element, instead of creating and appending a new one.
 *
 * This is the primitive the Svelte adapter uses: Svelte owns the DOM and
 * hands SamEngine a canvas via `bind:this`, so SamEngine must not create or
 * append its own element. `createCanvas` builds on top of this function for
 * the HTML-generator case, where SamEngine does own the canvas element.
 *
 * Unlike `createCanvas`, the returned object includes a `destroy()` function
 * that removes the resize listener again. Call it when the canvas should stop
 * being managed, for example from a Svelte component's `onMount` cleanup.
 */
export function attachCanvas(config: AttachCanvasConfig): AttachedCanvas {
    const { canvas } = config;
    const ctx = canvas.getContext("2d")!;

    const virtualWidth = config.virtualWidth ?? 800;
    const virtualHeight = config.virtualHeight ?? 800;

    function resize() {
        if (config.fullscreen) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            canvas.width = config.width ?? 800;
            canvas.height = config.height ?? 800;
        }
    }

    window.addEventListener("resize", resize);
    resize();

    function applyScaling(): void {
        if (config.scaling === "fit") {
            const scale = Math.min(
                canvas.width / virtualWidth,
                canvas.height / virtualHeight
            );

            const offsetX = (canvas.width - virtualWidth * scale) / 2;
            const offsetY = (canvas.height - virtualHeight * scale) / 2;

            ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    function destroy(): void {
        window.removeEventListener("resize", resize);
    }

    return {
        canvas,
        ctx,
        applyScaling,
        virtualWidth,
        virtualHeight,
        destroy,
    };
}

/**
 * Creates a canvas, appends it to `document.body`, and returns its 2D context.
 *
 * When `scaling` is `"fit"`, call `applyScaling()` at the beginning of each
 * frame before drawing game objects. This sets the canvas transform so your game
 * can render in virtual coordinates independent of the real browser size.
 *
 * This function owns the canvas element it creates. If you already have a
 * canvas element (for example from a Svelte `bind:this`), use `attachCanvas`
 * instead.
 */
export function createCanvas(config: CanvasConfig = {}): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    applyScaling: () => void;
    virtualWidth: number;
    virtualHeight: number;
} {
    const canvas = document.createElement("canvas");

    document.body.appendChild(canvas);

    const { ctx, applyScaling, virtualWidth, virtualHeight } = attachCanvas({
        ...config,
        canvas,
    });

    return {
        canvas,
        ctx,
        applyScaling,
        virtualWidth,
        virtualHeight,
    };
}

/**
 * Resizes an existing canvas to the browser window size.
 */
export function resizeCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Toggles fullscreen for the given canvas: requests it if the document is
 * not currently in fullscreen, exits it otherwise.
 *
 * This is the primitive both the generated HTML fullscreen button and the
 * Svelte adapter's `engine.requestFullscreen()` call into, so fullscreen
 * behavior stays a single Core-owned implementation.
 */
export function toggleFullscreen(canvas: HTMLCanvasElement): void {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

/**
 * Adds a keyboard shortcut for fullscreen mode.
 *
 * Pressing the `f` key toggles fullscreen for the provided canvas.
 *
 * @returns A cleanup function that removes the keyboard listener again.
 */
export function enableFullscreen(canvas: HTMLCanvasElement): () => void {
    const handler = (e: KeyboardEvent) => {
        if (e.key === "f") {
            toggleFullscreen(canvas);
        }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
}

/**
 * Connects an existing DOM element with id `fullscreenBtn` to fullscreen mode.
 *
 * If no element with that id exists, the function does nothing.
 */
export function setupFullscreenButton(canvas: HTMLCanvasElement): void {
    const btn = document.getElementById("fullscreenBtn");

    if (!btn) return;

    btn.addEventListener("click", () => toggleFullscreen(canvas));
}
