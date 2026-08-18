<script lang="ts">
    /**
     * Drop-in replacement for the settings popup `samengine-build` generates
     * from `config.htmlMenu.settings`, styled with the exact same
     * `config.htmlMenu.style` values.
     *
     * Unlike the generated HTML build, this writes through the Core Settings
     * Runtime (`setGameSetting`/`getGameSetting`) instead of
     * `window.__GAMESETTINGS__`, so game code stays framework-agnostic.
     */
    import { onMount } from "svelte";
    import type { buildconfig } from "../../config/buildconfig.js";
    import { getSettingsButtonCSS } from "../../config/htmlTheme.js";
    import { getGameSetting, setGameSetting, onGameSettingsChange } from "../../settings.js";

    type Props = {
        /** The same build config passed to `samengine-build`. */
        config: buildconfig;
    };

    let { config }: Props = $props();

    let open = $state(false);
    let selected = $state<Record<string, string>>({});

    function syncFromRuntime(): void {
        const next: Record<string, string> = {};

        for (const setting of config.htmlMenu.settings) {
            next[setting.id] = String(getGameSetting(setting.id, setting.default_value));
        }

        selected = next;
    }

    onMount(() => {
        // Seed the runtime with each setting's default value, but only if it
        // was not already set - e.g. via `new SamEngine({ settings })`. This
        // mirrors `window.__GAMESETTINGS__ = defaultSettings` in the
        // generated HTML build without overwriting an explicit initial value.
        for (const setting of config.htmlMenu.settings) {
            if (getGameSetting(setting.id) === undefined) {
                setGameSetting(setting.id, setting.default_value);
            }
        }

        syncFromRuntime();

        return onGameSettingsChange(syncFromRuntime);
    });

    function choose(id: string, value: string): void {
        setGameSetting(id, value);
    }

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key === "Escape") {
            open = false;
        }
    }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if config.htmlMenu.enable_menu}
    <!-- The backdrop's click-to-close is a mouse convenience; keyboard users
         close the popup with Escape (handled above), so this static element
         does not need its own key handler or interactive role. -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        id="settingsPopup"
        style:display={open ? "flex" : "none"}
        onclick={(e) => {
            if (e.target === e.currentTarget) open = false;
        }}
    >
        <div id="settingsWindow">
            <h2>Settings</h2>

            {#each config.htmlMenu.settings as setting (setting.id)}
                <div class="settingGroup">
                    <p>{setting.title}</p>

                    {#each setting.options as option (option.value)}
                        <button
                            class="settingBtn"
                            class:active={selected[setting.id] === option.value}
                            onclick={() => choose(setting.id, option.value)}
                        >
                            {option.text}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    </div>

    <button id="settingsBtn" onclick={() => (open = !open)}>⚙</button>
{/if}

<svelte:head>
    {@html `<style>${getSettingsButtonCSS(config)}</style>`}
</svelte:head>
