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

export {
    GetDefaultHTML,
    GetSingleFileHTML,
} from "./exporthtml.js";
