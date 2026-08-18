<script lang="ts">
    /**
     * Drop-in replacement for the start screen `samengine-build` generates
     * (title, version, author, description, start button, optional Markdown
     * notes), styled with the exact same `config.htmlMenu.style` values.
     *
     * Renders as a `position: fixed` full-viewport overlay, so it looks the
     * same regardless of where it is mounted in your component tree - see
     * `getStageCSS` in `samengine/config` for why it does not style
     * `<body>` directly the way the generated HTML build does.
     */
    import type { buildconfig } from "../../config/buildconfig.js";
    import { getStageCSS, getMDNotesCSS } from "../../config/htmlTheme.js";
    import { parseMarkdown } from "samengine-cli";

    type Props = {
        /** The same build config passed to `samengine-build`. */
        config: buildconfig;
        /** Called when the player clicks the start button. */
        onstart?: () => void;
    };

    let { config, onstart }: Props = $props();

    let css = $derived(
        getStageCSS(config) + (config.markdown_notes.length > 0 ? `\n${getMDNotesCSS()}` : "")
    );
</script>

<svelte:head>
    {@html `<style>${css}</style>`}
</svelte:head>

<div class="samengine-stage">
    <div id="startscreen">
        <h2>made with samengine</h2>
        <h1>{config.title}</h1>
        <p>{config.version}</p>
        <p>by {config.gameauthor}</p>

        <button class="startbutton" onclick={() => onstart?.()}>
            {config.htmlMenu.text.startbutton}
        </button>

        <p>{config.description}</p>
    </div>

    {#if config.markdown_notes.length > 0}
        <div id="mdnotes">
            {#each config.markdown_notes as note, i (i)}
                <details
                    style={`${note.style?.bg ? `--note-bg:${note.style.bg};` : ""}${note.style?.color ? `--note-color:${note.style.color};` : ""}`}
                >
                    <summary>{note.title}</summary>
                    {@html parseMarkdown(note.content)}
                </details>
            {/each}
        </div>
    {/if}
</div>
