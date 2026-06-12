import type { buildconfig } from "./buildconfig.js";
import { new_buildconfig } from "./buildconfig.js";
import { parseMarkdown } from "samengine/utils";

type MaybePromise<T> = T | Promise<T>;
type Cleanup = void | (() => void);

export interface SamengineSvelteOptions {
    /** Samengine page configuration. If omitted, `new_buildconfig()` is used. */
    config?: buildconfig;

    /** Called after the player clicks the start button and temporary UI is removed. */
    start: () => MaybePromise<Cleanup>;

    /** Removes generated start UI after the game starts. Defaults to true. */
    removeOnStart?: boolean;
}

export interface SamengineSvelteMount {
    start: () => Promise<void>;
    destroy: () => void;
}

type SvelteActionReturn = {
    update?: (options: SamengineSvelteOptions) => void;
    destroy?: () => void;
};

declare global {
    interface Window {
        __GAMESETTINGS__?: Record<string, string>;
        __samengine__?: {
            version: string;
        };
        __audioCtx?: AudioContext;
        webkitAudioContext?: typeof AudioContext;
    }
}

function resolveConfig(config?: buildconfig): buildconfig {
    return config ?? new_buildconfig();
}

function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    return element;
}

function createStyle(config: buildconfig): HTMLStyleElement {
    const style = document.createElement("style");

    style.textContent = `
.samengine-svelte-root {
    margin: 0;
    min-height: 100vh;
    background: ${config.htmlMenu.style.bgcolor};
    color: ${config.htmlMenu.style.color};
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.samengine-svelte-startscreen {
    text-align: center;
    min-height: 50vh;
}

.samengine-svelte-startscreen h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.samengine-svelte-startscreen h2 {
    font-weight: normal;
    opacity: 0.7;
}

.samengine-svelte-startbutton {
    margin: 1.3rem 0;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: ${config.htmlMenu.style.startbutton_bgcolor};
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.samengine-svelte-startbutton:hover {
    background: ${config.htmlMenu.style.startbutton_bgc_hover};
}

.samengine-svelte-notes {
    position: absolute;
    bottom: 0;
    left: 10px;
    max-width: 400px;
    max-height: 40vh;
    overflow-y: auto;
    z-index: 900;
    font-size: 0.9rem;
    width: 60%;
}

.samengine-svelte-notes details {
    --note-bg: rgba(15,23,42,0.85);
    --note-color: #e2e8f0;
    background: var(--note-bg);
    color: var(--note-color);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 8px 10px;
    backdrop-filter: blur(6px);
}

.samengine-svelte-notes summary {
    cursor: pointer;
    font-weight: bold;
    color: inherit;
    list-style: none;
}

.samengine-svelte-notes summary::-webkit-details-marker {
    display: none;
}

.samengine-svelte-notes summary::before {
    content: ">";
    display: inline-block;
    margin-right: 6px;
    transition: transform 0.2s ease;
}

.samengine-svelte-notes details[open] summary::before {
    transform: rotate(90deg);
}

#fullscreenBtn {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 15px;
    font-size: 16px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    z-index: 1000;
}

#fullscreenBtn:hover {
    background: rgba(0, 0, 0, 0.8);
}

#settingsBtn {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 12px;
    font-size: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    cursor: pointer;
    z-index: 2000;
}

#settingsPopup {
    position: fixed;
    inset: 0;
    background: ${config.htmlMenu.style.settingsmenu_popup_bgcolor};
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1999;
}

.samengine-svelte-settings-window {
    width: 500px;
    max-width: 90%;
    background: ${config.htmlMenu.style.settingsmenu_bgcolor};
    padding: 30px;
    border-radius: 16px;
    color: white;
}

.samengine-svelte-setting-group {
    margin-top: 20px;
}

.samengine-svelte-setting-group p {
    margin-bottom: 10px;
    font-size: 18px;
}

.settingBtn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background: ${config.htmlMenu.style.settingsmenu_button};
    color: ${config.htmlMenu.style.settingsmenu_button_txt};
    cursor: pointer;
    margin-right: 10px;
    margin-top: 10px;
}

.settingBtn:hover {
    ${config.htmlMenu.style.settingsmenu_button_txt_hover.length !== 0 ? "color: " + config.htmlMenu.style.settingsmenu_button_txt_hover + ";" : ""}
    ${config.htmlMenu.style.settingsmenu_button_hover.length !== 0 ? "background: " + config.htmlMenu.style.settingsmenu_button_hover + ";" : ""}
}

.settingBtn.active {
    background: ${config.htmlMenu.style.settingsmenu_button_clicked};
    color: black;
}
`;

    return style;
}

function createStartScreen(config: buildconfig): HTMLElement {
    const startscreen = createElement("div", "samengine-svelte-startscreen");
    startscreen.id = "startscreen";

    const madeWith = createElement("h2");
    madeWith.textContent = "made with samengine";

    const title = createElement("h1");
    title.textContent = config.title;

    const version = createElement("p");
    version.textContent = config.version;

    const author = createElement("p");
    author.textContent = `by ${config.gameauthor}`;

    const button = createElement("button", "samengine-svelte-startbutton");
    button.id = "startBtn";
    button.textContent = config.htmlMenu.text.startbutton;

    const description = createElement("p");
    description.textContent = config.description;

    startscreen.append(madeWith, title, version, author, button, description);

    return startscreen;
}

function createNotes(config: buildconfig): HTMLElement | null {
    if (config.markdown_notes.length === 0) {
        return null;
    }

    const notes = createElement("div", "samengine-svelte-notes");
    notes.id = "mdnotes";

    for (const note of config.markdown_notes) {
        const detail = createElement("details");

        if (note.style?.bg) {
            detail.style.setProperty("--note-bg", note.style.bg);
        }

        if (note.style?.color) {
            detail.style.setProperty("--note-color", note.style.color);
        }

        const summary = createElement("summary");
        summary.textContent = note.title;

        const content = createElement("div");
        content.innerHTML = parseMarkdown(note.content);

        detail.append(summary, content);
        notes.append(detail);
    }

    return notes;
}

function createFullscreenButton(config: buildconfig): HTMLButtonElement | null {
    if (!config.show_fullscreen_button) {
        return null;
    }

    const button = createElement("button");
    button.id = "fullscreenBtn";
    button.textContent = "Fullscreen";

    return button;
}

function createSettings(config: buildconfig): HTMLElement[] {
    if (!config.htmlMenu.enable_menu) {
        return [];
    }

    const defaultSettings: Record<string, string> = {};

    for (const setting of config.htmlMenu.settings) {
        defaultSettings[setting.id] = setting.default_value;
    }

    window.__GAMESETTINGS__ = defaultSettings;

    const popup = createElement("div");
    popup.id = "settingsPopup";

    const windowElement = createElement("div", "samengine-svelte-settings-window");
    const title = createElement("h2");
    title.textContent = "Settings";
    windowElement.append(title);

    for (const setting of config.htmlMenu.settings) {
        const group = createElement("div", "samengine-svelte-setting-group");
        const label = createElement("p");
        label.textContent = setting.title;
        group.append(label);

        for (const option of setting.options) {
            const optionButton = createElement("button", `settingBtn${option.value === setting.default_value ? " active" : ""}`);
            optionButton.dataset.setting = setting.id;
            optionButton.dataset.value = option.value;
            optionButton.textContent = option.text;
            group.append(optionButton);
        }

        windowElement.append(group);
    }

    popup.append(windowElement);

    const settingsButton = createElement("button");
    settingsButton.id = "settingsBtn";
    settingsButton.textContent = "*";

    settingsButton.addEventListener("click", () => {
        popup.style.display = popup.style.display === "flex" ? "none" : "flex";
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });

    popup.querySelectorAll<HTMLButtonElement>(".settingBtn").forEach((button) => {
        button.addEventListener("click", () => {
            const setting = button.dataset.setting;
            const value = button.dataset.value;

            if (!setting || value === undefined) {
                return;
            }

            popup.querySelectorAll<HTMLButtonElement>(`.settingBtn[data-setting="${setting}"]`).forEach((element) => {
                element.classList.remove("active");
            });

            button.classList.add("active");
            window.__GAMESETTINGS__ = window.__GAMESETTINGS__ ?? {};
            window.__GAMESETTINGS__[setting] = value;
        });
    });

    return [popup, settingsButton];
}

async function unlockAudio(config: buildconfig): Promise<void> {
    if (!config.enable_audio) {
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    await ctx.resume();
    window.__audioCtx = ctx;
}

/**
 * Mounts the samengine start UI inside a Svelte component container.
 */
export function mountSamengineSvelte(node: HTMLElement, options: SamengineSvelteOptions): SamengineSvelteMount {
    let currentOptions = options;
    let cleanup: Cleanup;
    let started = false;

    const config = resolveConfig(currentOptions.config);
    const root = createElement("div", "samengine-svelte-root");
    const style = createStyle(config);
    const startscreen = createStartScreen(config);
    const notes = createNotes(config);
    const fullscreenButton = createFullscreenButton(config);
    const settingsElements = createSettings(config);

    window.__samengine__ = {
        version: config.version,
    };

    document.head.append(style);
    root.append(startscreen);

    if (notes) {
        root.append(notes);
    }

    for (const element of settingsElements) {
        root.append(element);
    }

    if (fullscreenButton) {
        root.append(fullscreenButton);
    }

    node.append(root);

    async function start(): Promise<void> {
        if (started) {
            return;
        }

        started = true;
        await unlockAudio(config);

        if (currentOptions.removeOnStart ?? true) {
            startscreen.remove();
            notes?.remove();

            for (const element of settingsElements) {
                element.remove();
            }
        }

        cleanup = await currentOptions.start();
    }

    startscreen.querySelector("#startBtn")?.addEventListener("click", () => {
        void start();
    });

    return {
        start,
        destroy() {
            if (typeof cleanup === "function") {
                cleanup();
            }

            root.remove();
            style.remove();
        },
    };
}

/**
 * Svelte action wrapper around `mountSamengineSvelte`.
 *
 * ```svelte
 * <script lang="ts">
 *   import { samengineSvelte } from "samengine-build/svelte";
 *   import { startEngine } from "samengine";
 * </script>
 *
 * <div use:samengineSvelte={{ start: () => startEngine(setup, loop) }} />
 * ```
 */
export function samengineSvelte(node: HTMLElement, options: SamengineSvelteOptions): SvelteActionReturn {
    let mounted = mountSamengineSvelte(node, options);

    return {
        update(nextOptions) {
            mounted.destroy();
            mounted = mountSamengineSvelte(node, nextOptions);
        },
        destroy() {
            mounted.destroy();
        },
    };
}
