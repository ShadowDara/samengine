// Generate the HTML File
// https://samengine.vercel.app/docs/config

// Infos here:
// https://samengine.vercel.app/docs/config
export interface buildconfig {
    htmlhead: string;

    title: string;

    // TODO
    description: string;
    version: string;

    show_fullscreen_button: boolean;

    entryname: string;
    outdir: string;

    markdown_notes: Paragraph[];
    gameauthor: string;

    dev_server_port: number;

    // TODO
    samegui: SameGUI;

    enable_audio: boolean;

    htmlMenu: HTMLMenu;

    // TODO
    enable_mobile_css: boolean;

    devMode: profile;
    releaseMode: profile;
}

// Samegui Settigs
export interface SameGUI {
    show_button: boolean;
}

export function newSameGUI(): SameGUI {
    return {
        show_button: false,
    }
}

export interface Paragraph {
    title: string;
    content: string;
    style: MarkdownStyle;
}

export interface MarkdownStyle {
    color: string;
    bg: string;
}

export function newMarkdownStyle(): MarkdownStyle {
    return {
        color: "#38bdf8",
        bg: "#0f172a",
    }
}

// Function to create a buildconfig with the default values
// Infos here:
// https://samengine.vercel.app/docs/config
export function new_buildconfig(): buildconfig {
    return {
        title: "My new Game",
        description: "Your Game Description",
        version: "Your Game Version",
        show_fullscreen_button: true,
        entryname: "main",
        outdir: "dist",
        markdown_notes: [],
        gameauthor: "DEV",
        htmlhead: `<link rel="icon" href="data:image/svg+xml;base64,${btoa(svgfile)}">`,
        dev_server_port: 3001,
        samegui: newSameGUI(),
        enable_audio: false,
        htmlMenu: newHTMLMenu(),
        enable_mobile_css: false,
        devMode: newDevProfile(),
        releaseMode: newReleaseProfile(),
    }
}

export const svgfile = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg {
      fill: #0f1115;
    }
    .shape {
      fill: none;
      stroke: #e6e6e6;
      stroke-width: 18;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .fill {
      fill: #e6e6e6;
    }
  </style>

  <!-- Background -->
  <rect width="512" height="512" class="bg"/>

  <!-- Outer hexagon (tech / engine frame) -->
  <path class="shape"
    d="M256 80 L390 160 L390 352 L256 432 L122 352 L122 160 Z" />

  <!-- Inner rotated square (system core) -->
  <rect x="176" y="176" width="160" height="160"
        class="shape" transform="rotate(45 256 256)" />

  <!-- Core node -->
  <circle cx="256" cy="256" r="18" class="fill"/>

  <!-- Connection points -->
  <circle cx="256" cy="110" r="10" class="fill"/>
  <circle cx="256" cy="402" r="10" class="fill"/>
  <circle cx="110" cy="256" r="10" class="fill"/>
  <circle cx="402" cy="256" r="10" class="fill"/>
</svg>`;


///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

// HTML MENU

export interface HTMLMenuSettingOption {
    text: string;
    value: string;
}

export interface HTMLMenuSetting {
    id: string;
    title: string;
    default_value: string;
    options: HTMLMenuSettingOption[];
}

export interface HTMLMenuStyle {
    bgcolor: string;
    color: string;

    settingsmenu_popup_bgcolor: string;
    settingsmenu_bgcolor: string;
    settingsmenu_button: string;
    settingsmenu_button_clicked: string;

    startbutton_bgcolor: string;
    startbutton_bgc_hover: string;
}

export interface HTMLMenuText {
    startbutton: string;
}

// Access Option via for example
// window.__GAMESETTINGS__.graphics
// window.__GAMESETTINGS__.sound
export interface HTMLMenu {
    enable_menu: boolean;

    settings: HTMLMenuSetting[];

    style: HTMLMenuStyle;
    text: HTMLMenuText;
}

export function newHTMLMenu(): HTMLMenu {
    return {
        enable_menu: false,

        settings: [],

        style: {
            bgcolor: "#0f172a",
            color: "white",

            settingsmenu_popup_bgcolor: "rgba(0,0,0,0.85)",
            settingsmenu_bgcolor: "#111827",
            settingsmenu_button: "#1f2937",
            settingsmenu_button_clicked: "#22c55e",

            startbutton_bgcolor: "#22c55e",
            startbutton_bgc_hover: "#16a34a",
        },
        text: {
            startbutton: "Start",
        }
    }
}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

// Dev Profiles

export interface profile {
    release: boolean;
    singlefile: boolean;
}

export function newDevProfile(): profile {
    return {
        release: false,
        singlefile: false,
    }
}

export function newReleaseProfile(): profile {
    return {
        release: true,
        singlefile: false,
    }
}
