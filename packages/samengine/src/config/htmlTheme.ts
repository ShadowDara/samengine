/**
 * Shared HTML/CSS theme generation.
 *
 * These functions are the single source of truth for how SamEngine's
 * generated start screen, settings menu, and fullscreen button look. Both the
 * HTML generator (`nonbrowser/internal/exporthtml.ts`) and the Svelte UI
 * components (`svelte/ui/*.svelte`) call the *same* functions, so a color or
 * spacing change in `config.htmlMenu.style` only has to happen in one place
 * and both hosts stay pixel-identical - by construction, not by convention.
 *
 * Every function here is a pure string generator with no `document`/`window`
 * access, so it is safe to import at build time (Node, inside the CLI) and at
 * runtime in the browser (bundled into a Svelte component) alike.
 */
import type { buildconfig } from "./buildconfig.js";

/**
 * CSS for the page backdrop, start screen, and start button.
 *
 * Styles the real `<body>` element - this is what the generated HTML build
 * uses `<body>` for, since it owns the whole page. The Svelte adapter cannot
 * safely do the same (a game route can live inside a larger SvelteKit app),
 * so it uses `getStageCSS` instead, which produces the same visual result
 * scoped to a wrapper element. See `getStageCSS` for details.
 */
export function getStandardCSS(config: buildconfig): string {
    return `* {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
body {
    margin: 0;
    background: ${config.htmlMenu.style.bgcolor};
    color: ${config.htmlMenu.style.color};
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden; /* Prevent scrollbars around fullscreen game content. */
}

#startscreen {
    text-align: center;
    height: 50vh;
}

h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

h2 {
    font-weight: normal;
    opacity: 0.7;
}

.startbutton {
    margin: 1.3rem 0;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: ${config.htmlMenu.style.startbutton_bgcolor};
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.startbutton:hover {
    background: ${config.htmlMenu.style.startbutton_bgc_hover};
}`;
}

/**
 * Same visual result as `getStandardCSS`, scoped to a `.samengine-stage`
 * wrapper instead of `<body>`.
 *
 * The wrapper is `position: fixed; inset: 0`, so it covers the full viewport
 * - and therefore looks the same as styling `<body>` directly - no matter
 * where in a Svelte component tree it is mounted, without reaching outside
 * the component to modify the real page `<body>`. Colors and spacing are
 * read from the exact same `config.htmlMenu.style` fields as
 * `getStandardCSS`, so the two never drift apart.
 *
 * This is the one place the Svelte adapter's UI intentionally differs in
 * *implementation* (not appearance) from the generated HTML build.
 */
export function getStageCSS(config: buildconfig): string {
    return `.samengine-stage {
    position: fixed;
    inset: 0;
    margin: 0;

    background: ${config.htmlMenu.style.bgcolor};
    color: ${config.htmlMenu.style.color};
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    z-index: 500;
}

.samengine-stage #startscreen {
    text-align: center;
    height: 50vh;
}

.samengine-stage h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.samengine-stage h2 {
    font-weight: normal;
    opacity: 0.7;
}

.samengine-stage .startbutton {
    margin: 1.3rem 0;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: ${config.htmlMenu.style.startbutton_bgcolor};
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.samengine-stage .startbutton:hover {
    background: ${config.htmlMenu.style.startbutton_bgc_hover};
}`;
}

/**
 * Creates CSS for the optional fullscreen button.
 *
 * Targets `#fullscreenBtn`, a fixed-position element, so this is reused
 * completely unchanged by both hosts.
 */
export function getFullscreenButtonCSS(config: buildconfig): string {
    if (!config.show_fullscreen_button) {
        return "";
    }

    return `#fullscreenBtn {
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
}`;
}

/**
 * Creates CSS for the settings button, modal popup, and option buttons.
 *
 * Targets `#settingsBtn`/`#settingsPopup`/etc., all fixed-position elements,
 * so this is reused completely unchanged by both hosts.
 */
export function getSettingsButtonCSS(config: buildconfig): string {
    if (!config.htmlMenu.enable_menu) {
        return "";
    }

    return `
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

#settingsWindow {
    width: 500px;
    max-width: 90%;

    background: ${config.htmlMenu.style.settingsmenu_bgcolor};

    padding: 30px;

    border-radius: 16px;

    color: white;
}

.settingGroup {
    margin-top: 20px;
}

.settingGroup p {
    margin-bottom: 10px;
    font-size: 18px;
}

.settingBtn {
    padding: 10px 16px;

    border: none;
    border-radius: 8px;

    background: ${config.htmlMenu.style.settingsmenu_button};
    color: ${config.htmlMenu.style.settingsmenu_button_txt};

    /* Button text color on hover */
    ${
        config.htmlMenu.style.settingsmenu_button_txt_hover.length != 0 ? "color: " + config.htmlMenu.style.settingsmenu_button_txt_hover + ";" : ""
    }

    /* Button hover color */
    ${
        config.htmlMenu.style.settingsmenu_button_hover.length != 0 ? "color: " + config.htmlMenu.style.settingsmenu_button_hover + ";" : ""
    }

    cursor: pointer;

    margin-right: 10px;
    margin-top: 10px;
}

.settingBtn.active {
    background: ${config.htmlMenu.style.settingsmenu_button_clicked};
    color: black;
}
`;
}

/**
 * Static CSS for the optional Markdown notes panel shown on the start
 * screen. Targets `#mdnotes`, a fixed/absolute-position element scoped by
 * id, so this is reused completely unchanged by both hosts.
 */
export function getMDNotesCSS(): string {
    return `#mdnotes {
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

#mdnotes details {
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

#mdnotes summary {
    cursor: pointer;
    font-weight: bold;
    color: inherit;
    list-style: none;
}

#mdnotes summary::-webkit-details-marker {
    display: none;
}

#mdnotes summary::before {
    content: "▶";
    display: inline-block;
    margin-right: 6px;
    transition: transform 0.2s ease;
}

#mdnotes details[open] summary::before {
    transform: rotate(90deg);
}

#mdnotes details p {
    margin: 8px 0;
    line-height: 1.4;
    color: #e2e8f0;
}

#mdnotes details h1,
#mdnotes details h2,
#mdnotes details h3 {
    margin-top: 10px;
    margin-bottom: 5px;
    color: #f8fafc;
}

#mdnotes details code {
    background: rgba(0,0,0,0.4);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
}

#mdnotes details pre {
    background: rgba(0,0,0,0.5);
    padding: 8px;
    border-radius: 6px;
    overflow-x: auto;
}

#mdnotes details a {
    color: #22c55e;
    text-decoration: none;
}

#mdnotes details a:hover {
    text-decoration: underline;
}`;
}
