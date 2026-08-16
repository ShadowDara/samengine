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

let canvasRef: HTMLCanvasElement | null = null;

// optional: für scaling (kannst du später aus deiner engine holen)
let virtualWidth = 800;
let virtualHeight = 800;

// References to the currently bound listeners, so `teardownInput` can remove
// exactly what `setupInput` added. Without this, listeners on `window`
// (keyboard) could never be removed, and calling `setupInput` again - e.g.
// after a Svelte component remounts - would silently stack a second set of
// listeners on top of the first.
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let keyupHandler: ((e: KeyboardEvent) => void) | null = null;
let mousedownHandler: ((e: MouseEvent) => void) | null = null;
let mouseupHandler: ((e: MouseEvent) => void) | null = null;
let contextmenuHandler: ((e: Event) => void) | null = null;
let mousemoveHandler: ((e: MouseEvent) => void) | null = null;
let wheelHandler: ((e: WheelEvent) => void) | null = null;
let mouseleaveHandler: (() => void) | null = null;

/**
 * Installs keyboard and mouse listeners for the engine.
 *
 * Mouse coordinates are converted into the virtual coordinate system used by
 * `createCanvas({ scaling: "fit" })` (or `attachCanvas`). Pass the same
 * virtual width and height here that you use for canvas scaling, otherwise
 * mouse hit tests will not line up with rendered objects.
 *
 * Call this once during game setup. If input was already set up, it is torn
 * down first, so calling `setupInput` again (for example when a Svelte
 * component remounts) never leaks duplicate listeners.
 *
 * @param canvas Canvas that should receive mouse events.
 * @param vWidth Width of the virtual game area. Defaults to 800.
 * @param vHeight Height of the virtual game area. Defaults to 800.
 */
export function setupInput(canvas: HTMLCanvasElement, vWidth = 800, vHeight = 800): void {
    teardownInput();

    canvasRef = canvas;
    virtualWidth = vWidth;
    virtualHeight = vHeight;

    // ===== KEYBOARD =====
    keydownHandler = (e) => {
        if (!keys[e.code]) {
            keys[e.code] = { pressed: false, justPressed: false, justReleased: false };
        }

        const key = keys[e.code];
        if (!key.pressed) key.justPressed = true;
        key.pressed = true;
    };
    window.addEventListener("keydown", keydownHandler);

    keyupHandler = (e) => {
        if (!keys[e.code]) {
            keys[e.code] = { pressed: false, justPressed: false, justReleased: false };
        }

        const key = keys[e.code];
        key.pressed = false;
        key.justReleased = true;
    };
    window.addEventListener("keyup", keyupHandler);

    // ===== MOUSE =====
    mousedownHandler = (e) => {
        if (e.button === 0) {
            if (!mouse.pressed) mouse.justPressed = true;
            mouse.pressed = true;
        }

        if (e.button === 2) {
            if (!mouse.rightPressed) mouse.rightjustPressed = true;
            mouse.rightPressed = true;
        }
    };
    canvas.addEventListener("mousedown", mousedownHandler);

    mouseupHandler = (e) => {
        if (e.button === 0) {
            mouse.pressed = false;
            mouse.justReleased = true;
        }

        if (e.button === 2) {
            mouse.rightPressed = false;
            mouse.rightjustReleased = false;
        }
    };
    canvas.addEventListener("mouseup", mouseupHandler);

    // verhindert context menu bei right click
    contextmenuHandler = (e) => e.preventDefault();
    canvas.addEventListener("contextmenu", contextmenuHandler);

    // ===== MOUSE MOVE (mit scaling fix) =====
    mousemoveHandler = (e) => {
        const rect = canvas.getBoundingClientRect();

        const scale = Math.min(
            canvas.width / virtualWidth,
            canvas.height / virtualHeight
        );

        const offsetX = (canvas.width - virtualWidth * scale) / 2;
        const offsetY = (canvas.height - virtualHeight * scale) / 2;

        mouse.x = (e.clientX - rect.left - offsetX) / scale;
        mouse.y = (e.clientY - rect.top - offsetY) / scale;
    };
    canvas.addEventListener("mousemove", mousemoveHandler);

    // ===== MOUSE WHEEL =====
    wheelHandler = (e) => {
        mouse.wheelDelta = e.deltaY;
    };
    canvas.addEventListener("wheel", wheelHandler);

    // Fix: wenn Maus Canvas verlässt
    mouseleaveHandler = () => {
        mouse.pressed = false;
        mouse.rightPressed = false;
    };
    canvas.addEventListener("mouseleave", mouseleaveHandler);
}

/**
 * Removes every listener installed by `setupInput` and resets input state.
 *
 * Safe to call even if `setupInput` was never called. This is what host
 * adapters (such as the Svelte adapter's `destroy()`) call to release
 * keyboard, mouse, and wheel listeners when a component unmounts.
 */
export function teardownInput(): void {
    if (keydownHandler) window.removeEventListener("keydown", keydownHandler);
    if (keyupHandler) window.removeEventListener("keyup", keyupHandler);

    if (canvasRef) {
        if (mousedownHandler) canvasRef.removeEventListener("mousedown", mousedownHandler);
        if (mouseupHandler) canvasRef.removeEventListener("mouseup", mouseupHandler);
        if (contextmenuHandler) canvasRef.removeEventListener("contextmenu", contextmenuHandler);
        if (mousemoveHandler) canvasRef.removeEventListener("mousemove", mousemoveHandler);
        if (wheelHandler) canvasRef.removeEventListener("wheel", wheelHandler);
        if (mouseleaveHandler) canvasRef.removeEventListener("mouseleave", mouseleaveHandler);
    }

    keydownHandler = null;
    keyupHandler = null;
    mousedownHandler = null;
    mouseupHandler = null;
    contextmenuHandler = null;
    mousemoveHandler = null;
    wheelHandler = null;
    mouseleaveHandler = null;
    canvasRef = null;

    for (const code in keys) {
        delete keys[code];
    }

    resetInput();
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
 * A copy is returned so game code cannot accidentally mutate the internal
 * input state. Use this object for hit tests such as `isMouseInRect` or
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
