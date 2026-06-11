type GameLoop = (dt: number) => void;

let lastTime = 0;
let loop: GameLoop;

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
 * @param start Function that runs once before the loop starts.
 * @param gameLoop Function that runs every frame. Receives delta time in seconds.
 */
export function startEngine(start: () => void, gameLoop: GameLoop): void {
    loop = gameLoop;
    start();

    requestAnimationFrame(run);
}

/**
 * Internal `requestAnimationFrame` callback.
 *
 * Converts the browser timestamp from milliseconds to a seconds-based delta and
 * schedules the next frame. This function is intentionally not exported because
 * consumers should control the engine through `startEngine`.
 */
function run(time: number): void {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    loop(dt);

    requestAnimationFrame(run);
}
