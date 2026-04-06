export type CanvasConfig = {
    width?: number;
    height?: number;
    fullscreen?: boolean;
    scaling?: "none" | "fit";
    virtualWidth?: number;
    virtualHeight?: number;
};

export function createCanvas(config: CanvasConfig = {}) {
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

    function applyScaling() {
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

export function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function enableFullscreen(canvas: HTMLCanvasElement) {
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

export function setupFullscreenButton(canvas: HTMLCanvasElement) {
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
