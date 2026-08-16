/**
 * Core Settings Runtime.
 *
 * Framework-agnostic replacement for reading game settings directly off
 * `window.__GAMESETTINGS__`. Both the HTML adapter and the Svelte adapter
 * read and write settings through this module, so game code never needs to
 * know which host it is running in.
 *
 * This module has zero knowledge of Svelte or the HTML generator. It does
 * not touch `window` at import time, so it is safe to import during
 * server-side rendering (see `src/svelte/README.md`).
 */

/** A flat bag of game settings, keyed by setting id. */
export type GameSettings = Record<string, unknown>;

/** Called whenever the settings object changes, with a fresh snapshot. */
export type GameSettingsListener = (settings: GameSettings) => void;

let settings: GameSettings = {};
const listeners = new Set<GameSettingsListener>();

function notify(): void {
    const snapshot = getGameSettings();

    for (const listener of listeners) {
        listener(snapshot);
    }
}

/**
 * Replaces the complete settings object.
 *
 * Existing keys that are not part of `newSettings` are removed. Use
 * `setGameSetting` instead if you only want to change a single value.
 */
export function setGameSettings(newSettings: GameSettings): void {
    settings = { ...newSettings };
    notify();
}

/**
 * Returns a shallow copy of the current settings.
 *
 * A copy is returned so callers cannot accidentally mutate the internal
 * settings state without going through `setGameSetting`/`setGameSettings`.
 */
export function getGameSettings(): GameSettings {
    return { ...settings };
}

/**
 * Sets a single setting by id, leaving every other setting untouched.
 */
export function setGameSetting(id: string, value: unknown): void {
    settings = { ...settings, [id]: value };
    notify();
}

/**
 * Reads a single setting by id.
 *
 * @param id Technical key of the setting, e.g. `"cards"`.
 * @param fallback Value returned when the setting has not been set.
 */
export function getGameSetting<T>(id: string, fallback?: T): T {
    if (Object.prototype.hasOwnProperty.call(settings, id)) {
        return settings[id] as T;
    }

    return fallback as T;
}

/**
 * Removes every setting.
 *
 * Mainly useful for tests and for hosts that want to start from a clean
 * slate, e.g. before mounting a fresh engine instance.
 */
export function clearGameSettings(): void {
    settings = {};
    notify();
}

/**
 * Subscribes to settings changes.
 *
 * Returns an unsubscribe function. This is what lets UI layers such as the
 * Svelte adapter react to `setGameSetting` calls without polling.
 */
export function onGameSettingsChange(listener: GameSettingsListener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
