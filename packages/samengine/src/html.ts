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

/**
 * Creates a canvas, appends it to `document.body`, and returns its 2D context.
 *
 * When `scaling` is `"fit"`, call `applyScaling()` at the beginning of each
 * frame before drawing game objects. This sets the canvas transform so your game
 * can render in virtual coordinates independent of the real browser size.
 */
export function createCanvas(config: CanvasConfig = {}): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    applyScaling: () => void;
    virtualWidth: number;
    virtualHeight: number;
} {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    document.body.appendChild(canvas);

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
 * Adds a keyboard shortcut for fullscreen mode.
 *
 * Pressing the `f` key toggles fullscreen for the provided canvas.
 */
export function enableFullscreen(canvas: HTMLCanvasElement): void {
    window.addEventListener("keydown", (e) => {
        if (e.key === "f") {
            if (!document.fullscreenElement) {
                canvas.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });
}

/**
 * Connects an existing DOM element with id `fullscreenBtn` to fullscreen mode.
 *
 * If no element with that id exists, the function does nothing.
 */
export function setupFullscreenButton(canvas: HTMLCanvasElement): void {
    const btn = document.getElementById("fullscreenBtn");

    if (!btn) return;

    btn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}
