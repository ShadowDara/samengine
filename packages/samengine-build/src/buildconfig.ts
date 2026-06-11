/**
 * Central build configuration types and defaults for samengine-build.
 *
 * Game projects usually import `new_buildconfig` in `samengine.config.ts`,
 * change the fields they need, and return the resulting object. The CLI loads
 * that object before every build and uses it to decide how HTML, assets,
 * development mode, and release mode should behave.
 *
 * Documentation:
 * https://samengine.vercel.app/docs/config
 */
export interface buildconfig {
    /** Custom HTML inserted into the generated document `<head>`. */
    htmlhead: string;

    /** Game title used in the browser tab and on the generated start screen. */
    title: string;

    /** Short description shown on the start screen. */
    description: string;

    /** Game version shown on the start screen. */
    version: string;

    /** Adds the generated fullscreen button when enabled. */
    show_fullscreen_button: boolean;

    /** Entry file name inside the `game` folder, usually `main`. */
    entryname: string;

    /** Output folder for the generated build, usually `dist`. */
    outdir: string;

    /** Optional collapsible Markdown notes shown before the game starts. */
    markdown_notes: Paragraph[];

    /** Author name written to the start screen and generated build comments. */
    gameauthor: string;

    /** First port tried by the local development server. */
    dev_server_port: number;

    /** Options for samengine UI helpers outside the game canvas. */
    samegui: SameGUI;

    /** Unlocks the browser AudioContext after the player clicks the start button. */
    enable_audio: boolean;

    /** Optional HTML settings menu and start-button styling. */
    htmlMenu: HTMLMenu;

    /** Reserved flag for mobile CSS behavior. It is not currently consumed. */
    enable_mobile_css: boolean;

    /** Build behavior used by the development command. */
    devMode: profile;

    /** Build behavior used by the release command. */
    releaseMode: profile;
}

/** Options for samengine GUI helpers that may be rendered outside the game. */
export interface SameGUI {
    /** Shows the samengine GUI button when the engine supports it. */
    show_button: boolean;
}

/** Creates default options for `samegui`. */
export function newSameGUI(): SameGUI {
    return {
        show_button: false,
    }
}

/** A single Markdown note shown on the generated start screen. */
export interface Paragraph {
    /** The visible summary/title of the collapsible note. */
    title: string;

    /** Markdown content rendered inside the note. */
    content: string;

    /** Per-note color styling. */
    style: MarkdownStyle;
}

/** Color values used by generated Markdown notes. */
export interface MarkdownStyle {
    /** Text color of the note. */
    color: string;

    /** Background color of the note. */
    bg: string;
}

/** Creates the default Markdown note colors. */
export function newMarkdownStyle(): MarkdownStyle {
    return {
        color: "#38bdf8",
        bg: "#0f172a",
    }
}

/**
 * Creates a complete build configuration with safe defaults.
 *
 * This is the recommended starting point for `samengine.config.ts`. Keeping
 * defaults centralized here makes new options easier to add without forcing
 * every game project to define every field manually.
 */
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

/** Default favicon as SVG text. `new_buildconfig` embeds it as a Data URI. */
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

/** One selectable value in an HTML menu setting. */
export interface HTMLMenuSettingOption {
    /** Button label shown to the player. */
    text: string;

    /** Value written into `window.__GAMESETTINGS__[setting.id]`. */
    value: string;
}

/** A group of related settings, such as graphics quality or sound mode. */
export interface HTMLMenuSetting {
    /** Technical key used in `window.__GAMESETTINGS__`. */
    id: string;

    /** Visible title displayed above the option buttons. */
    title: string;

    /** Initial value selected when the page loads. */
    default_value: string;

    /** All selectable values for this setting. */
    options: HTMLMenuSettingOption[];
}

/** Colors used by the generated start button and settings menu. */
export interface HTMLMenuStyle {
    bgcolor: string;
    color: string;

    settingsmenu_popup_bgcolor: string;
    settingsmenu_bgcolor: string;
    settingsmenu_button: string;
    settingsmenu_button_clicked: string;
    settingsmenu_button_txt: string;
    settingsmenu_button_txt_hover: string;
    settingsmenu_button_hover: string;

    startbutton_bgcolor: string;
    startbutton_bgc_hover: string;
}

/** Customizable text used by generated HTML menu controls. */
export interface HTMLMenuText {
    /** Label of the button that starts the game. */
    startbutton: string;
}

/**
 * Optional generated settings menu.
 *
 * Selected values are exposed globally, for example:
 * `window.__GAMESETTINGS__.graphics` or `window.__GAMESETTINGS__.sound`.
 */
export interface HTMLMenu {
    /** Enables the generated settings menu. */
    enable_menu: boolean;

    /** Settings groups rendered inside the popup. */
    settings: HTMLMenuSetting[];

    /** Visual styling for the menu. */
    style: HTMLMenuStyle;

    /** Customizable visible text. */
    text: HTMLMenuText;
}

/** Creates the default configuration for the optional HTML settings menu. */
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
            settingsmenu_button_txt: "#ffffff",
            settingsmenu_button_txt_hover: "",
            settingsmenu_button_hover: "",

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

/** Build profile used by development and release modes. */
export interface profile {
    /** Whether the profile represents a release build. */
    release: boolean;

    /** Embeds the bundle and used resources into one generated HTML file. */
    singlefile: boolean;
}

/** Default development profile: multi-file output, no release minification. */
export function newDevProfile(): profile {
    return {
        release: false,
        singlefile: false,
    }
}

/** Default release profile: release mode enabled, still multi-file by default. */
export function newReleaseProfile(): profile {
    return {
        release: true,
        singlefile: false,
    }
}
