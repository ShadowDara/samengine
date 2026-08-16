/**
 * Svelte Adapter.
 *
 * Wraps the framework-agnostic SamEngine Core (canvas/scaling, input, game
 * loop, settings) into a single class that fits Svelte's component
 * lifecycle. This module never generates HTML and never touches
 * `window.__GAMESETTINGS__` - it talks to the Core exclusively through the
 * public runtime API (`attachCanvas`, `setupInput`, `startEngine`, the
 * Settings Runtime, ...), the same API the HTML adapter uses.
 *
 * Usage (see the package README for the full example):
 *
 * ```svelte
 * <script lang="ts">
 *     import { onMount } from "svelte";
 *     import { SamEngine, getGameSetting } from "samengine/svelte";
 *
 *     let canvas: HTMLCanvasElement;
 *
 *     onMount(() => {
 *         const engine = new SamEngine({
 *             canvas,
 *             settings: { cards: "8" },
 *             update: (dt) => {
 *                 const cards = Number(getGameSetting("cards", "8"));
 *                 // ... draw the frame ...
 *             },
 *         });
 *
 *         engine.start();
 *
 *         return () => engine.destroy();
 *     });
 * </script>
 *
 * <canvas bind:this={canvas}></canvas>
 * ```
 */

import {
    attachCanvas,
    toggleFullscreen,
    type CanvasConfig,
} from "../html.js";
import {
    setupInput,
    teardownInput,
    getMouse,
    isKeyPressed,
    isKeyJustPressed,
    isKeyJustReleased,
    resetInput,
    type Mouse,
} from "../input.js";
import { startEngine, stopEngine, isEngineRunning } from "../core.js";
import {
    setGameSettings,
    getGameSettings,
    setGameSetting,
    getGameSetting,
    onGameSettingsChange,
    type GameSettings,
} from "../settings.js";

// Re-exported so game code and Svelte components can do:
//   import { setGameSetting, getGameSetting } from "samengine/svelte";
// without a second import from "samengine" itself.
export type { GameSettings, GameSettingsListener } from "../settings.js";
export {
    setGameSettings,
    getGameSettings,
    setGameSetting,
    getGameSetting,
    clearGameSettings,
    onGameSettingsChange,
} from "../settings.js";

// Re-exported input helpers, for games that prefer the free-function API
// (`getMouse()`, `isKeyPressed(...)`) over `engine.input`.
export type { Mouse } from "../input.js";
export { getMouse, isKeyPressed, isKeyJustPressed, isKeyJustReleased } from "../input.js";

// Re-exported Key enum for convenience, so `samengine/svelte` alone is
// enough to build a game.
export { Key } from "../keys.js";

/** Per-frame update callback, receiving delta time in seconds. */
export type SamEngineGameLoop = (dt: number) => void;

/** Options accepted by `new SamEngine(...)`. */
export type SamEngineOptions = CanvasConfig & {
    /** Canvas element to bind to, typically from a Svelte `bind:this`. */
    canvas: HTMLCanvasElement;

    /**
     * Initial game settings, merged into the Core Settings Runtime.
     * Equivalent to calling `setGameSettings` yourself before constructing
     * the engine.
     */
    settings?: GameSettings;

    /** Runs once, right before the first frame. Use it for game setup. */
    setup?: () => void;

    /**
     * Runs every animation frame. `resetInput()` is called automatically
     * after each `update`, so one-frame input flags behave as documented by
     * `isKeyJustPressed`/`isKeyJustReleased` without any extra wiring.
     */
    update: SamEngineGameLoop;
};

/**
 * Svelte-facing wrapper around SamEngine Core.
 *
 * Binds an existing `<canvas>` (owned by Svelte), wires up input, and
 * exposes `start()`/`stop()`/`destroy()` that map cleanly onto `onMount`'s
 * setup/cleanup pair. SamEngine Core still owns the canvas transform,
 * scaling, input handling, and the game loop - this class only coordinates
 * them for you.
 *
 * A `SamEngine` instance must be created in the browser, inside `onMount`
 * (or otherwise after the component has mounted), never at module scope or
 * during server-side rendering.
 */
export class SamEngine {
    /** The canvas passed into the constructor. */
    readonly canvas: HTMLCanvasElement;
    /** 2D rendering context for `canvas`. */
    readonly ctx: CanvasRenderingContext2D;
    /** Logical/virtual game width, used by `"fit"` scaling. */
    readonly virtualWidth: number;
    /** Logical/virtual game height, used by `"fit"` scaling. */
    readonly virtualHeight: number;

    /** Convenience bundle of the free-function input API. */
    readonly input: {
        getMouse: () => Readonly<Mouse>;
        isKeyPressed: (code: string) => boolean;
        isKeyJustPressed: (code: string) => boolean;
        isKeyJustReleased: (code: string) => boolean;
    };

    private readonly options: SamEngineOptions;
    private readonly applyScaling: () => void;
    private readonly detachCanvas: () => void;
    private destroyed = false;

    constructor(options: SamEngineOptions) {
        if (typeof window === "undefined" || typeof document === "undefined") {
            throw new Error(
                "SamEngine must be created in the browser. Create it inside " +
                "onMount() (or after the component has mounted), not at module " +
                "scope or during server-side rendering."
            );
        }

        this.options = options;
        this.canvas = options.canvas;

        if (options.settings) {
            setGameSettings({ ...getGameSettings(), ...options.settings });
        }

        const attached = attachCanvas({
            canvas: options.canvas,
            fullscreen: options.fullscreen,
            scaling: options.scaling,
            width: options.width,
            height: options.height,
            virtualWidth: options.virtualWidth,
            virtualHeight: options.virtualHeight,
        });

        this.ctx = attached.ctx;
        this.applyScaling = attached.applyScaling;
        this.virtualWidth = attached.virtualWidth;
        this.virtualHeight = attached.virtualHeight;
        this.detachCanvas = attached.destroy;

        setupInput(this.canvas, this.virtualWidth, this.virtualHeight);

        this.input = { getMouse, isKeyPressed, isKeyJustPressed, isKeyJustReleased };
    }

    /**
     * Starts the game loop.
     *
     * Runs `setup()` once, then calls `update(dt)` every animation frame.
     * `resetInput()` runs automatically after every `update` call.
     */
    start(): void {
        if (this.destroyed) {
            throw new Error("Cannot start a destroyed SamEngine instance.");
        }

        const { setup, update } = this.options;

        startEngine(
            () => setup?.(),
            (dt) => {
                update(dt);
                resetInput();
            }
        );
    }

    /**
     * Stops the game loop without releasing input listeners or the canvas.
     *
     * Calling `start()` again afterwards resumes the same instance. Use
     * `destroy()` instead when the component is unmounting.
     */
    stop(): void {
        stopEngine();
    }

    /**
     * Releases every resource this engine instance holds: the running game
     * loop, keyboard/mouse/wheel listeners, and the canvas resize listener.
     *
     * Safe to call multiple times. Intended to be returned (or called) from
     * a Svelte `onMount` cleanup function:
     *
     * ```ts
     * onMount(() => {
     *     const engine = new SamEngine({ canvas, update });
     *     engine.start();
     *     return () => engine.destroy();
     * });
     * ```
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.stop();
        teardownInput();
        this.detachCanvas();
        this.destroyed = true;
    }

    /** Whether the game loop is currently running. */
    get running(): boolean {
        return isEngineRunning();
    }

    /** Requests (or exits) fullscreen for this engine's canvas. */
    requestFullscreen(): void {
        toggleFullscreen(this.canvas);
    }

    /** Reactive-feeling alias for `setGameSetting`, scoped to this engine. */
    setSetting(id: string, value: unknown): void {
        setGameSetting(id, value);
    }

    /** Reactive-feeling alias for `getGameSetting`, scoped to this engine. */
    getSetting<T>(id: string, fallback?: T): T {
        return getGameSetting(id, fallback);
    }
}
