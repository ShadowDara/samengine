/**
 * Public package API for configuration files.
 *
 * Game projects import these types and factory functions from
 * `samengine-build` when defining `samengine.config.ts`. The executable CLI is
 * separate from this entry point and lives under `src/cli`.
 */
export type {
    buildconfig,
    Paragraph,
    MarkdownStyle,
    SameGUI,
    HTMLMenuSettingOption,
    HTMLMenuSetting,
    HTMLMenu,
    HTMLMenuStyle,
    HTMLMenuText,
} from "./buildconfig.js";

export {
    newSameGUI,
    new_buildconfig,
    svgfile,
    newHTMLMenu,
    newDevProfile,
    newReleaseProfile,
    newMarkdownStyle
} from "./buildconfig.js";

/**
 * Shared theme CSS generators used by both the HTML generator and the
 * Svelte UI components (`samengine/svelte/ui/*`), so a custom host can reuse
 * the exact same start screen / settings menu / fullscreen button styling.
 */
export {
    getStandardCSS,
    getStageCSS,
    getFullscreenButtonCSS,
    getSettingsButtonCSS,
    getMDNotesCSS,
} from "./htmlTheme.js";
