<script lang="ts">
    /**
     * Drop-in replacement for the fullscreen button `samengine-build`
     * generates, styled identically. Fullscreen behavior itself stays a
     * Core function (`toggleFullscreen`), this component just renders the
     * button.
     */
    import type { buildconfig } from "../../config/buildconfig.js";
    import { getFullscreenButtonCSS } from "../../config/htmlTheme.js";
    import { toggleFullscreen } from "../../html.js";

    type Props = {
        /** The same build config passed to `samengine-build`. */
        config: buildconfig;
        /** Canvas to fullscreen - typically `engine.canvas`. */
        canvas: HTMLCanvasElement;
    };

    let { config, canvas }: Props = $props();
</script>

{#if config.show_fullscreen_button}
    <button id="fullscreenBtn" onclick={() => toggleFullscreen(canvas)}>
        ⛶ Fullscreen
    </button>
{/if}

<svelte:head>
    {@html `<style>${getFullscreenButtonCSS(config)}</style>`}
</svelte:head>
