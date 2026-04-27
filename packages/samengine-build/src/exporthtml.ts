// Function to create the Export HTML for the Build

// Function to create the Export HTML for the Build
import type { buildconfig } from "./buildconfig.js";
import { parseMarkdown } from "samengine/utils";
import { getPackageVersion } from "./getversion.js";

const version = getPackageVersion("samengine");

// function to get the startscreen
function getStartScreen(config: buildconfig): string {
    return `<div id="startscreen">
        <h2>made with samengine</h2>
        <h1>${config.title}</h1>
        <p>${config.version}</p>
        <p>by ${config.gameauthor}</p>

        <button class="startbutton" id="startBtn">Start</button>
    </div>`;
}

// function to get the standard CSS
function getStandardCSS(config: buildconfig): string {
    return `* {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
body {
    margin: 0;
    background: #0f172a;
    color: white;
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden; /* 🔥 verhindert Scrollbars */
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
    margin-top: 2rem;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background: #22c55e;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.startbutton:hover {
    background: #16a34a;
}`;
}

// Function which formats the HTML for the Notes
function getMDNotes(config: buildconfig): string {
    let mdnotes_str: string = "";

    if (config.markdown_notes.length > 0) {
        mdnotes_str += '<div id="mdnotes">';

        for (let i = 0; i < config.markdown_notes.length; i++) {
            mdnotes_str += "<details>";
            mdnotes_str += "<summary>" + config.markdown_notes[i].title + "</summary>";
            mdnotes_str += parseMarkdown(config.markdown_notes[i].content);
            mdnotes_str += "</details>";
        }

        mdnotes_str += "</div>";
        mdnotes_str += `
<style>
/* Markdown Notes Container */
#mdnotes, #mdnotes div {
    position: absolute;
    bottom: 0px;
    left: 10px;
    max-width: 400px;
    max-height: 40vh;
    overflow-y: auto;
    z-index: 900;
    font-size: 0.9rem;
    width: 60%;
}

/* Einzelne Note */
#mdnotes details {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 8px 10px;
    backdrop-filter: blur(6px);
}

/* Titel (Summary) */
#mdnotes summary {
    cursor: pointer;
    font-weight: bold;
    color: #38bdf8;
    outline: none;
    list-style: none;
}

/* Pfeil entfernen (optional cleaner look) */
#mdnotes summary::-webkit-details-marker {
    display: none;
}

/* Custom Pfeil */
#mdnotes summary::before {
    content: "▶";
    display: inline-block;
    margin-right: 6px;
    transition: transform 0.2s ease;
}

/* Pfeil gedreht wenn offen */
#mdnotes details[open] summary::before {
    transform: rotate(90deg);
}

/* Markdown Content */
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


function getFullscreenButtonHTML(config: buildconfig): string {
    let fullscreenBtn = "";

    if (config.show_fullscreen_button) {
        fullscreenBtn = `<!-- Button to make it fullscreen -->
<button id="fullscreenBtn">⛶ Fullscreen</button>`;
    }

    return fullscreenBtn;
}


function getSettingsButton(config: buildconfig): string {
    let content = "";

    if (config.settings.show_button) {
        content = `
<!-- Menü -->
  <div id="menu">
    <p>Option 1</p>
    <p>Option 2</p>
    <p>Option 3</p>
  </div>

<!-- Button -->
<button id="fab">+</button>
`;
    }

    return content;
}


function getSettingsButtonCSS(config: buildconfig): string {
    let content = "";

    if (config.settings.show_button) {
        content = `/* Floating Button */
    #fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 15%;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 30px;
      border: none;
      cursor: pointer;
    }

    /* Menü */
    #menu {
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.6);
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      display: none;
    }

    #menu p {
      margin: 5px 0;
      cursor: pointer;
    }

    #menu p:hover {
      color: #0070f3;
    }`;
    }

    return content;
}


function getSettingsButtonJS(config: buildconfig): string {
    let content = "";

    if (config.settings.show_button) {
        content = `
<script>
        const fab = document.getElementById("fab");
    const menu = document.getElementById("menu");

    fab.addEventListener("click", () => {
      if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
      } else {
        menu.style.display = "none";
      }
    });

    // Optional: Klick außerhalb schließt Menü
    document.addEventListener("click", (e) => {
      if (!fab.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = "none";
      }
    });
</script>
`;
    }

    return content;
}


//
///////////////////////////////////////////////////////////////////////////////////
//
//
export function GetSingleFileHTML(config: buildconfig, bundledJsContent: string, resourcesMap: Record<string, string> = {}): string {
    let frameworkVersion = version;

    // Create a resource loader function that will be embedded in the HTML
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

    // Wrap bundled JS in a function to prevent auto-execution
    const wrappedGameCode = `function __initializeGame() {
${bundledJsContent.split('\n').map(line => '  ' + line).join('\n')}
}`;

    const defaulthtml: string = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <!-- Für Mobile Viewports -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    ${config.htmlhead}
    <style>
${getStandardCSS(config)}

${getFullscreenButton(config)}

</style>
    </head>
    <body>
    ${getStartScreen(config)}

    ${getMDNotes(config)}

    <script>
        ${resourceLoaderScript}
    </script>
    <script>
        ${wrappedGameCode}
    </script>
    <script type="module">
        const btn = document.getElementById("startBtn");

        btn.addEventListener("click", async () => {
            // 🔊 Audio freischalten
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            const ctx = new AudioContext();
            await ctx.resume();

            // 👉 HIER rein!
            window.__audioCtx = ctx;

            // Startscreen entfernen
            document.getElementById("startscreen").remove();

            // Only when there are Markdown Notes
            ${config.markdown_notes.length > 0 ? `
// Markdown Info entfernen
document.getElementById("mdnotes").remove();
` : ""}

            // Initialize the game
            window.__initializeGame();
        });
    </script>

    ${getFullscreenButtonHTML(config)}

  </body>
</html>
`;

    return defaulthtml;
}


//
//////////////////////////////////////////////////////////////////////////////////////////
//
//
export function GetDefaultHTML(config: buildconfig, releasemode: boolean): string {
    let frameworkVersion = version;

    const defaulthtml: string = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <!-- Für Mobile Viewports -->
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
            // 🔊 Audio freischalten
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            const ctx = new AudioContext();
            await ctx.resume();

            // 👉 HIER rein!
            window.__audioCtx = ctx;

            // Startscreen entfernen
            document.getElementById("startscreen").remove();
            
            // Only when there are Markdown Notes
            ${config.markdown_notes.length > 0 ? `
// Markdown Info entfernen
document.getElementById("mdnotes").remove();
` : ""}

            // Game laden
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
