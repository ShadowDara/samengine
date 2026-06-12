import type { buildconfig } from "./buildconfig.js";
import { new_buildconfig } from "./buildconfig.js";
import { GetViteHTML } from "./exporthtml.js";

type MaybePromise<T> = T | Promise<T>;

type VitePlugin = {
    name: string;
    enforce?: "pre" | "post";
    transformIndexHtml?: {
        order?: "pre" | "post";
        handler: (html: string) => MaybePromise<string>;
    };
};

export interface SamengineViteOptions {
    /**
     * Samengine page configuration. If omitted, `new_buildconfig()` is used.
     */
    config?: buildconfig | (() => MaybePromise<buildconfig>);

    /**
     * Vite entry module or modules to load after the samengine start button.
     *
     * If omitted, the plugin reads existing `<script type="module" src="...">`
     * entries from `index.html`. If none are present, it falls back to
     * `/src/<entryname>.ts`.
     */
    entry?: string | string[];
}

async function resolveBuildConfig(options: SamengineViteOptions): Promise<buildconfig> {
    if (!options.config) {
        return new_buildconfig();
    }

    if (typeof options.config === "function") {
        return await options.config();
    }

    return options.config;
}

function getScriptEntries(html: string): string[] {
    const entries: string[] = [];
    const scriptRegex = /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']([^"']+)["'])[^>]*>\s*<\/script>/gi;

    let match: RegExpExecArray | null;
    while ((match = scriptRegex.exec(html)) !== null) {
        entries.push(match[1]);
    }

    return entries;
}

function toEntryList(entry: SamengineViteOptions["entry"], config: buildconfig, html: string): string[] {
    if (typeof entry === "string") {
        return [entry];
    }

    if (Array.isArray(entry) && entry.length > 0) {
        return entry;
    }

    const htmlEntries = getScriptEntries(html);

    if (htmlEntries.length > 0) {
        return htmlEntries;
    }

    return [`/src/${config.entryname}.ts`];
}

/**
 * Vite adapter for samengine projects.
 *
 * Add this plugin to `vite.config.ts` and keep your usual Vite game entry:
 *
 * ```ts
 * import { defineConfig } from "vite";
 * import { samengineVite } from "samengine-build/vite";
 *
 * export default defineConfig({
 *   plugins: [samengineVite()],
 * });
 * ```
 */
export function samengineVite(options: SamengineViteOptions = {}): VitePlugin {
    return {
        name: "samengine-vite",
        enforce: "pre",
        transformIndexHtml: {
            order: "pre",
            async handler(html) {
                const config = await resolveBuildConfig(options);
                const entries = toEntryList(options.entry, config, html);

                return GetViteHTML(config, entries);
            },
        },
    };
}

export { samengineVite as samengineVitePlugin };
