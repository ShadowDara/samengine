/**
 * HTML generation for samengine-build.
 *
 * This module creates the complete `index.html` written into the output folder.
 * There are two build shapes:
 *
 * - `GetDefaultHTML` creates a normal multi-file page that imports the bundled
 *   game JavaScript after the player clicks the start button.
 * - `GetSingleFileHTML` embeds the bundled JavaScript and optional resource
 *   Data URIs directly into one HTML document.
 */
import type { buildconfig } from "../../config/buildconfig.js";
import { parseMarkdown } from "../../utils/index.js";
import { getPackageVersion } from "../getversion.js";

/**
 * Function to get the samengine Version
 * 
 * @deprecated WARN Function should not be used outside samengine. Use getPackageVersion instead!
 */
export function getVersion(): string {
    return getPackageVersion("samengine");
}

/** Builds the start screen shown before the game code runs. */
function getStartScreen(config: buildconfig): string {
    return `<div id="startscreen">
        <h2>made with samengine</h2>
        <h1>${config.title}</h1>
        <p>${config.version}</p>
        <p>by ${config.gameauthor}</p>

        <button class="startbutton" id="startBtn">${config.htmlMenu.text.startbutton}</button>

        <p>${config.description}</p>
    </div>`;
}

/**
 * Returns optional JavaScript that unlocks browser audio after a user click.
 *
 * Most browsers block audio playback until the page receives a user gesture.
 * Running this inside the start-button handler gives the game an AudioContext it
 * can reuse through `window.__audioCtx`.
 */
function getAudioCode(c: buildconfig): string {
    if (c.enable_audio == false) {
        return "";
    }

    return `// Unlock browser audio after the start click.
            const AudioContext = window.AudioContext || window.webkitAudioContext;

            const ctx = new AudioContext();
            await ctx.resume();

            // Expose the shared audio context for the game runtime.
            window.__audioCtx = ctx;`;
}

/** Creates the base CSS for the generated page, start screen, and start button. */
function getStandardCSS(config: buildconfig): string {
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
 * Converts configured Markdown notes into collapsible `<details>` sections.
 *
 * Each note can provide CSS variables for its own text and background color.
 * The Markdown itself is rendered through `samengine/utils`.
 */
function getMDNotes(config: buildconfig): string {
    let mdnotes_str = "";

    if (config.markdown_notes.length > 0) {

        mdnotes_str += '<div id="mdnotes">';

        for (let i = 0; i < config.markdown_notes.length; i++) {

            const note = config.markdown_notes[i];

            let vars = "";

            if (note.style?.bg) {
                vars += `--note-bg:${note.style.bg};`;
            }

            if (note.style?.color) {
                vars += `--note-color:${note.style.color};`;
            }

            mdnotes_str += `
<details style="${vars}">
    <summary>${note.title}</summary>
    ${parseMarkdown(note.content)}
</details>`;
        }

        mdnotes_str += "</div>";

        mdnotes_str += `
<style>
/* Markdown notes container */
#mdnotes {
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

/* Single note */
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

/* Note title */
#mdnotes summary {
    cursor: pointer;
    font-weight: bold;
    color: inherit;
    list-style: none;
}

/* Hide the browser default marker for a cleaner custom toggle. */
#mdnotes summary::-webkit-details-marker {
    display: none;
}

/* Custom toggle marker */
#mdnotes summary::before {
    content: "▶";
    display: inline-block;
    margin-right: 6px;
    transition: transform 0.2s ease;
}

/* Rotate the marker when the note is open. */
#mdnotes details[open] summary::before {
    transform: rotate(90deg);
}

/* Markdown content */
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
}
</style>`;
    }

    return mdnotes_str;
}

/** Creates CSS for the optional fullscreen button. */
function getFullscreenButton(config: buildconfig): string {
    let fullscreenbutton = "";

    if (config.show_fullscreen_button) {
        fullscreenbutton = `#fullscreenBtn {
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

    return fullscreenbutton;
}

/** Creates HTML for the optional fullscreen button. */
function getFullscreenButtonHTML(config: buildconfig): string {
    let fullscreenBtn = "";

    if (config.show_fullscreen_button) {
        fullscreenBtn = `<!-- Button to make it fullscreen -->
<button id="fullscreenBtn">⛶ Fullscreen</button>`;
    }

    return fullscreenBtn;
}

/** Builds the optional settings popup from `config.htmlMenu.settings`. */
function getSettingsButton(config: buildconfig): string {

    if (!config.htmlMenu.enable_menu) {
        return "";
    }

    let settingsHTML = "";

    for (const setting of config.htmlMenu.settings) {

        settingsHTML += `
<div class="settingGroup">

    <p>${setting.title}</p>
`;

        for (const option of setting.options) {

            settingsHTML += `
<button
    class="settingBtn ${option.value === setting.default_value ? "active" : ""}"
    data-setting="${setting.id}"
    data-value="${option.value}"
>
    ${option.text}
</button>
`;
        }

        settingsHTML += `
</div>
`;
    }

    return `
<div id="settingsPopup">

    <div id="settingsWindow">

        <h2>Settings</h2>

        ${settingsHTML}

    </div>

</div>

<button id="settingsBtn">⚙</button>
`;
}

/** Creates CSS for the settings button, modal popup, and option buttons. */
function getSettingsButtonCSS(config: buildconfig): string {

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
 * Creates runtime JavaScript for the optional settings menu.
 *
 * Default setting values are written to `window.__GAMESETTINGS__`. When the
 * player clicks an option, the active button state and the global settings
 * object are updated together.
 */
function getSettingsButtonJS(config: buildconfig): string {

    if (!config.htmlMenu.enable_menu) {
        return "";
    }

    const defaultSettings: Record<string, string> = {};

    for (const setting of config.htmlMenu.settings) {
        defaultSettings[setting.id] = setting.default_value;
    }

    return `
<script>

window.__GAMESETTINGS__ = ${JSON.stringify(defaultSettings, null, 4)};

const settingsBtn = document.getElementById("settingsBtn");
const settingsPopup = document.getElementById("settingsPopup");

settingsBtn.addEventListener("click", () => {

    if (settingsPopup.style.display === "flex") {
        settingsPopup.style.display = "none";
    } else {
        settingsPopup.style.display = "flex";
    }

});

settingsPopup.addEventListener("click", (e) => {

    if (e.target === settingsPopup) {
        settingsPopup.style.display = "none";
    }

});

document.querySelectorAll(".settingBtn").forEach(btn => {

    btn.addEventListener("click", () => {

        const setting = btn.dataset.setting;
        const value = btn.dataset.value;

        document.querySelectorAll(
            '.settingBtn[data-setting="' + setting + '"]'
        ).forEach(b => {
            b.classList.remove("active");
        });

        btn.classList.add("active");

        window.__GAMESETTINGS__[setting] = value;

        console.log(window.__GAMESETTINGS__);

    });

});

</script>
`;
}

/** Removes settings UI after the game starts so it does not overlap the canvas. */
function getSettingsButtonJSrem(config: buildconfig): string {
    if (!config.htmlMenu.enable_menu) {
        return "";
    }

    return `// Remove the settings button after the game starts.
            document.getElementById("settingsBtn").remove();

            // Remove the settings popup after the game starts.
            document.getElementById("settingsPopup").remove();
`;
}

/**
 * Creates a complete single-file HTML document.
 *
 * `bundledJsContent` is the already bundled game code from esbuild.
 * `resourcesMap` contains optional Data URIs that are exposed through
 * `window.__resources`, `window.__getResource`, and `window.__loadResource`.
 *
 * The bundled game is wrapped in `window.__initializeGame` so it does not run
 * until the player clicks the start button. This allows the generated page to
 * show the start screen, unlock audio, and remove temporary UI first.
 */
export function GetSingleFileHTML(config: buildconfig, bundledJsContent: string, resourcesMap: Record<string, string> = {}): string {
    let frameworkVersion = getVersion();

    // Embed resource lookup helpers for games that need assets in single-file builds.
    const resourceLoaderScript = `window.__resources = ${JSON.stringify(resourcesMap)};
window.__getResource = function(path) {
    return window.__resources[path] || null;
};
window.__loadResource = function(path) {
    const resource = window.__getResource(path);
    if (!resource) {
        console.warn('Resource not found:', path);
        return null;
    }
    return resource;
};
window.__samengine__ = {
    version: "${frameworkVersion}"
};`;

    // Wrap bundled JS in a function to prevent auto-execution before the start click.
    const wrappedGameCode = `function __initializeGame() {
${bundledJsContent.split('\n').map(line => '  ' + line).join('\n')}
}`;

    const defaulthtml: string = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <!-- Mobile viewport setup -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    ${config.htmlhead}
    <style>
${getStandardCSS(config)}

${getFullscreenButton(config)}

${getSettingsButtonCSS(config)}

</style>
    </head>
    <body>
    ${getStartScreen(config)}

    ${getMDNotes(config)}

    ${getSettingsButton(config)}

    <script>
        ${resourceLoaderScript}
    </script>
    <script>
        ${wrappedGameCode}
    </script>
    <script type="module">
        const btn = document.getElementById("startBtn");

        btn.addEventListener("click", async () => {
            ${getAudioCode(config)}

            // Remove the start screen.
            document.getElementById("startscreen").remove();

            ${getSettingsButtonJSrem(config)}

            // Only when there are Markdown notes.
            ${config.markdown_notes.length > 0 ? `
// Remove Markdown notes.
document.getElementById("mdnotes").remove();
` : ""}

            // Initialize the game.
            window.__initializeGame();
        });
    </script>

    ${getSettingsButtonJS(config)}

    ${getFullscreenButtonHTML(config)}

  </body>
</html>
`;

    return defaulthtml;
}

/**
 * Creates the normal multi-file HTML document.
 *
 * This page contains the generated start screen and optional menu UI. The game
 * bundle is loaded with a dynamic import only after the start button is clicked.
 */
export function GetDefaultHTML(config: buildconfig, releasemode: boolean): string {
    let frameworkVersion = getVersion();

    const defaulthtml: string = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <!-- Mobile viewport setup -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    ${config.htmlhead}
    <style>
${getStandardCSS(config)}

${getFullscreenButton(config)}

${getSettingsButtonCSS(config)}

</style>
    </head>
    <body>
    ${getStartScreen(config)}

    ${getMDNotes(config)}

    ${getSettingsButton(config)}

    <script type="module">
        const btn = document.getElementById("startBtn");

        btn.addEventListener("click", async () => {
            ${getAudioCode(config)}

            // Remove the start screen.
            document.getElementById("startscreen").remove();

            ${getSettingsButtonJSrem(config)}

            // Only when there are Markdown notes.
            ${config.markdown_notes.length > 0 ? `
// Remove Markdown notes.
document.getElementById("mdnotes").remove();
` : ""}

            // Load the game bundle.
            import("./${config.entryname}.js");
        });

        window.__samengine__ = {
            version: "${frameworkVersion}"
        };
    </script>

    ${getSettingsButtonJS(config)}

    ${getFullscreenButtonHTML(config)}

  </body>
</html>
`;

    return defaulthtml;
}
