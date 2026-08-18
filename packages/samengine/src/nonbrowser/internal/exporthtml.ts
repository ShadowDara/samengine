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
import { parseMarkdown } from "samengine-cli";
import { getPackageVersion } from "../getversion.js";
import {
    getStandardCSS,
    getFullscreenButtonCSS,
    getSettingsButtonCSS,
    getMDNotesCSS,
} from "../../config/htmlTheme.js";

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
${getMDNotesCSS()}
</style>`;
    }

    return mdnotes_str;
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

${getFullscreenButtonCSS(config)}

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

${getFullscreenButtonCSS(config)}

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
