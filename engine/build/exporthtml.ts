// Function to create the Export HTML for the Build

// Function to create the Export HTML for the Build
import type { buildconfig } from "./buildconfig.js";

export function GetDefaultHTML(config: buildconfig): string {
    let  fullscreenbutton = "";
    let fullscreenBtn = "";
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
        fullscreenBtn = `<!-- Button to make it fullscreen -->
<button id="fullscreenBtn">⛶ Fullscreen</button>`;
    }

    const defaulthtml: string = `<!-- HTML Web Game made with webgameengine by Shadowdara -->
<!-- DO NOT REMOVE THIS NOTE ! -->    
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <!-- Für Mobile Viewports -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        overflow: hidden; /* 🔥 verhindert Scrollbars */
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
}

#startscreen {
    text-align: center;
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
}
${fullscreenbutton}
</style>
    </style>
  </head>
  <body>
  <div id="startscreen">
        <h2>made with WebGameEngine</h2>
        <h1>${config.title}</h1>
        <p>${config.version}</p>

        <button class="startbutton" id="startBtn">Start</button>
    </div>

    <script type="module">
        const btn = document.getElementById("startBtn");

        btn.addEventListener("click", async () => {
            // 🔊 Audio freischalten
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            await ctx.resume();

            // Startscreen entfernen
            document.getElementById("startscreen").remove();

            // Game laden
            import("./${config.entryname}.js");
        });
    </script>
    ${fullscreenBtn}
  </body>
</html>
`;

    return defaulthtml;
}
