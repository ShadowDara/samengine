<script lang="ts">
    /**
     * Convenience wrapper combining `StartScreen` + `SettingsMenu` +
     * `FullscreenButton` - the complete UI `samengine-build` would have
     * generated around your canvas, as one component. Full usage example in
     * the package README under "Svelte Adapter".
     */
    import type { buildconfig } from "../../config/buildconfig.js";
    import StartScreen from "./StartScreen.svelte";
    import SettingsMenu from "./SettingsMenu.svelte";
    import FullscreenButton from "./FullscreenButton.svelte";

    type Props = {
        /** The same build config passed to `samengine-build`. */
        config: buildconfig;
        /** Canvas to fullscreen - typically `engine.canvas`. */
        canvas: HTMLCanvasElement;
        /**
         * Called once, when the player clicks the start button (after the
         * optional audio unlock, same as the generated HTML build). Create
         * and start your `SamEngine` instance here.
         */
        onstart?: () => void;
    };

    let { config, canvas, onstart }: Props = $props();
    let started = $state(false);

    async function handleStart(): Promise<void> {
        if (config.enable_audio) {
            // Unlock browser audio after the start click, same as the
            // generated HTML build - and expose it the same way, so a game's
            // sound code keeps working unchanged regardless of host.
            const AudioContextCtor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

            const ctx = new AudioContextCtor();
            await ctx.resume();

            (window as unknown as { __audioCtx: AudioContext }).__audioCtx = ctx;
        }

        started = true;
        onstart?.();
    }
</script>

{#if !started}
    <StartScreen {config} onstart={handleStart} />
{/if}

<SettingsMenu {config} />
<FullscreenButton {config} {canvas} />
