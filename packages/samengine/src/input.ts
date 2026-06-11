type KeyState = {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
};

/**
 * Snapshot of the current mouse state in virtual canvas coordinates.
 *
 * The left mouse button uses `pressed`, `justPressed`, and `justReleased`.
 * The right mouse button uses the matching `right...` fields. `wheelDelta`
 * stores the most recent wheel event delta and is reset by `resetInput`.
 */
export type Mouse = {
    x: number;
    y: number;

    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;

    rightPressed: boolean;
    rightjustPressed: boolean;
    rightjustReleased: boolean;

    wheelDelta: number;
};

const keys: Record<string, KeyState> = {};

const mouse: Mouse = {
    x: 0,
    y: 0,

    // for Left Buttons
    pressed: false,
    justPressed: false,
    justReleased: false,

    // TODO
    // do the same for the right Buttons
    rightPressed: false,
    rightjustPressed: false,
    rightjustReleased: false,
    
    wheelDelta: 0,
};

let canvasRef: HTMLCanvasElement;

// 👉 optional: für scaling (kannst du später aus deiner engine holen)
let virtualWidth = 800;
let virtualHeight = 800;

/**
 * Installs keyboard and mouse listeners for the engine.
 *
 * Mouse coordinates are converted into the virtual coordinate system used by
 * `createCanvas({ scaling: "fit" })`. Pass the same virtual width and height
 * here that you use for canvas scaling, otherwise mouse hit tests will not line
 * up with rendered objects.
 *
 * Call this once during game setup.
 *
 * @param canvas Canvas that should receive mouse events.
 * @param vWidth Width of the virtual game area. Defaults to 800.
 * @param vHeight Height of the virtual game area. Defaults to 800.
 */
export function setupInput(canvas: HTMLCanvasElement, vWidth = 800, vHeight = 800): void {
    canvasRef = canvas;
    virtualWidth = vWidth;
    virtualHeight = vHeight;

    // ===== KEYBOARD =====
    window.addEventListener("keydown", (e) => {
        if (!keys[e.code]) {
            keys[e.code] = { pressed: false, justPressed: false, justReleased: false };
        }

        const key = keys[e.code];
        if (!key.pressed) key.justPressed = true;
        key.pressed = true;
    });

    window.addEventListener("keyup", (e) => {
        if (!keys[e.code]) {
            keys[e.code] = { pressed: false, justPressed: false, justReleased: false };
        }

        const key = keys[e.code];
        key.pressed = false;
        key.justReleased = true;
    });

    // ===== MOUSE =====
    canvas.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
            if (!mouse.pressed) mouse.justPressed = true;
            mouse.pressed = true;
        }

        if (e.button === 2) {
            if (!mouse.rightPressed) mouse.rightjustPressed = true;
            mouse.rightPressed = true;
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        if (e.button === 0) {
            mouse.pressed = false;
            mouse.justReleased = true;
        }

        if (e.button === 2) {
            mouse.rightPressed = false;
            mouse.rightjustReleased = false;
        }
    });

    // 👉 wichtig: verhindert context menu bei right click
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // ===== MOUSE MOVE (mit scaling fix 🔥) =====
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();

        const scale = Math.min(
            canvas.width / virtualWidth,
            canvas.height / virtualHeight
        );

        const offsetX = (canvas.width - virtualWidth * scale) / 2;
        const offsetY = (canvas.height - virtualHeight * scale) / 2;

        mouse.x = (e.clientX - rect.left - offsetX) / scale;
        mouse.y = (e.clientY - rect.top - offsetY) / scale;
    });

    // ===== MOUSE WHEEL =====
    canvas.addEventListener("wheel", (e) => {
        mouse.wheelDelta = e.deltaY;
    });

    // 👉 Fix: wenn Maus Canvas verlässt
    canvas.addEventListener("mouseleave", () => {
        mouse.pressed = false;
        mouse.rightPressed = false;
    });
}

/**
 * Returns whether the given keyboard code is currently held down.
 *
 * Use values from the `Key` enum for autocomplete-friendly input names.
 */
export function isKeyPressed(code: string): boolean {
    return keys[code]?.pressed || false;
}

/**
 * Returns true only during the frame in which a key became pressed.
 *
 * Call `resetInput()` once at the end of each game loop frame so this one-frame
 * flag can be cleared.
 */
export function isKeyJustPressed(code: string): boolean {
    return keys[code]?.justPressed || false;
}

/**
 * Returns true only during the frame in which a key was released.
 *
 * Call `resetInput()` once at the end of each game loop frame so this one-frame
 * flag can be cleared.
 */
export function isKeyJustReleased(code: string): boolean {
    return keys[code]?.justReleased || false;
}

/**
 * Returns a read-only copy of the current mouse state.
 *
 * A copy is returned so game code cannot accidentally mutate the internal input
 * state. Use this object for hit tests such as `isMouseInRect` or
 * `isRectClicked`.
 */
export function getMouse(): Readonly<Mouse> {
    return { ...mouse };
}

/**
 * Clears all one-frame input flags.
 *
 * This should usually be called once at the end of each frame, after your game
 * logic has consumed `justPressed`, `justReleased`, and `wheelDelta`.
 */
export function resetInput(): void {
    for (const k in keys) {
        keys[k].justPressed = false;
        keys[k].justReleased = false;
    }

    mouse.justPressed = false;
    mouse.justReleased = false;

    mouse.rightjustPressed = false;
    mouse.rightjustReleased = false;

    mouse.wheelDelta = 0;
}
