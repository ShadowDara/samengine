type GameLoop = (dt: number) => void;

let lastTime = 0;
let loop: GameLoop | undefined;
let rafId: number | null = null;
let running = false;

/**
 * Starts the central game loop of samengine.
 *
 * The `start` callback is executed once before the first frame. Use it for
 * setup work such as creating objects, loading initial state, or configuring
 * input. After that, `gameLoop` is called every animation frame with `dt`, the
 * elapsed time in seconds since the previous frame.
 *
 * `dt` should be used for frame-rate independent movement:
 *
 * ```ts
 * player.x += player.speed * dt;
 * ```
 *
 * Only one game loop can run at a time. Calling `startEngine` again without
 * calling `stopEngine` first replaces the previous loop.
 *
 * @param start Function that runs once before the loop starts.
 * @param gameLoop Function that runs every frame. Receives delta time in seconds.
 */
export function startEngine(start: () => void, gameLoop: GameLoop): void {
    // Cancel a previous loop first, e.g. after a Svelte component remount,
    // so two `requestAnimationFrame` chains never run at the same time.
    stopEngine();

    loop = gameLoop;
    running = true;
    lastTime = 0;

    start();

    rafId = requestAnimationFrame(run);
}

/**
 * Internal `requestAnimationFrame` callback.
 *
 * Converts the browser timestamp from milliseconds to a seconds-based delta and
 * schedules the next frame. This function is intentionally not exported because
 * consumers should control the engine through `startEngine`/`stopEngine`.
 */
function run(time: number): void {
    if (!running || !loop) {
        return;
    }

    // Avoid a huge first-frame `dt` caused by comparing against `lastTime`'s
    // initial value of 0.
    const dt = lastTime === 0 ? 0 : (time - lastTime) / 1000;
    lastTime = time;

    loop(dt);

    rafId = requestAnimationFrame(run);
}

/**
 * Stops the currently running game loop, if any.
 *
 * Cancels the pending `requestAnimationFrame` and clears the stored loop
 * reference. Safe to call even when no loop is running. This is what host
 * adapters (such as the Svelte adapter's `destroy()`) call to make sure no
 * frames keep firing after a component unmounts.
 */
export function stopEngine(): void {
    running = false;
    loop = undefined;

    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

/**
 * Returns whether a game loop is currently running.
 */
export function isEngineRunning(): boolean {
    return running;
}
