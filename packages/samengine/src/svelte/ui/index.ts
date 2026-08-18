/**
 * Public entry point for `samengine/svelte/ui`.
 *
 * Drop-in Svelte components that reproduce the look of the generated HTML
 * build (start screen, settings menu, fullscreen button) using the exact
 * same CSS-generating functions from `samengine/config`. Purely optional -
 * SamEngine does not require any of these, see `samengine/svelte` for the
 * bare `SamEngine` class.
 */
export { default as SamEngineStartScreen } from "./StartScreen.svelte";
export { default as SamEngineSettingsMenu } from "./SettingsMenu.svelte";
export { default as SamEngineFullscreenButton } from "./FullscreenButton.svelte";
export { default as SamEngineGameUI } from "./GameUI.svelte";
