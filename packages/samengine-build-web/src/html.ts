import {
    GetDefaultHTML,
    GetSingleFileHTML,
    new_buildconfig,
    type buildconfig,
} from "samengine-build";

export interface SamengineHtmlAdapterOptions {
    /** Partial config applied on top of `new_buildconfig()`. */
    config?: Partial<buildconfig>;

    /** Generate release HTML. Release mode enables the same HTML shape as samengine-build. */
    release?: boolean;

    /** Embed the bundled JavaScript into one HTML file. */
    singlefile?: boolean;

    /** Bundled JavaScript used when `singlefile` is enabled. */
    bundledJsContent?: string;

    /** Resource Data URIs used when `singlefile` is enabled. */
    resources?: Record<string, string>;
}

export function createSamengineBuildConfig(config: Partial<buildconfig> = {}): buildconfig {
    return {
        ...new_buildconfig(),
        ...config,
        samegui: {
            ...new_buildconfig().samegui,
            ...config.samegui,
        },
        htmlMenu: {
            ...new_buildconfig().htmlMenu,
            ...config.htmlMenu,
            style: {
                ...new_buildconfig().htmlMenu.style,
                ...config.htmlMenu?.style,
            },
            text: {
                ...new_buildconfig().htmlMenu.text,
                ...config.htmlMenu?.text,
            },
        },
        devMode: {
            ...new_buildconfig().devMode,
            ...config.devMode,
        },
        releaseMode: {
            ...new_buildconfig().releaseMode,
            ...config.releaseMode,
        },
    };
}

export function createSamengineExportHtml(options: SamengineHtmlAdapterOptions = {}): string {
    const config = createSamengineBuildConfig(options.config);
    const release = options.release ?? false;
    const singlefile = options.singlefile ?? false;

    if (singlefile) {
        return GetSingleFileHTML(
            config,
            options.bundledJsContent ?? "",
            options.resources ?? {},
        );
    }

    return GetDefaultHTML(config, release);
}
