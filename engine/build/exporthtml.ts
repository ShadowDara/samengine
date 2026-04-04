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
${fullscreenbutton}
</style>
    </style>
  </head>
  <body>
    ${fullscreenBtn}
    <script type="module" src="${config.entryname}.js"></script>
  </body>
</html>
`;

    return defaulthtml;
}
