import { cp, mkdir, writeFile } from "fs/promises";
import path from "path";

import {
    SamengineWebOptions,
    createManifestModule,
    scanResources,
} from "./vite.js";

export const DEFAULT_NEXT_RESOURCE_MANIFEST_MODULE = "samengine-build-web/resources";

export interface SamengineNextOptions extends Omit<SamengineWebOptions, "copyResources"> {
    /** Folder used by Next.js for static files. Defaults to `public`. */
    publicDir?: string;

    /** Internal folder for the generated resource manifest module. */
    manifestDir?: string;
}

export interface NextConfigLike {
    webpack?: (config: any, context: any) => any;
    [key: string]: unknown;
}

type ResolvedNextOptions = Required<SamengineNextOptions> & {
    root: string;
};

function stripSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, "");
}

function resolveOptions(options: SamengineNextOptions, root: string): ResolvedNextOptions {
    return {
        resourcesDir: options.resourcesDir ?? "resources",
        resourceBase: `/${stripSlashes(options.resourceBase ?? "samengine/resources")}`,
        outResourcesDir: stripSlashes(options.outResourcesDir ?? "samengine/resources"),
        resourceManifestModule: options.resourceManifestModule ?? DEFAULT_NEXT_RESOURCE_MANIFEST_MODULE,
        publicDir: options.publicDir ?? "public",
        manifestDir: options.manifestDir ?? ".samengine-web",
        root,
    };
}

async function prepareNextResources(options: ResolvedNextOptions): Promise<string> {
    const resources = await scanResources(options);
    const manifestDir = path.resolve(options.root, options.manifestDir);
    const manifestPath = path.join(manifestDir, "resources.mjs");
    const publicTarget = path.resolve(options.root, options.publicDir, options.outResourcesDir);
    const resourceSource = path.resolve(options.root, options.resourcesDir);

    await mkdir(manifestDir, { recursive: true });
    await writeFile(manifestPath, createManifestModule(resources));

    if (resources.length > 0) {
        await mkdir(publicTarget, { recursive: true });
        await cp(resourceSource, publicTarget, { recursive: true });
    }

    return manifestPath;
}

class SamengineNextResourcesPlugin {
    readonly name = "SamengineNextResourcesPlugin";

    constructor(private readonly options: ResolvedNextOptions) {}

    apply(compiler: any) {
        const prepare = async () => {
            await prepareNextResources(this.options);
        };

        compiler.hooks.beforeRun?.tapPromise(this.name, prepare);
        compiler.hooks.watchRun?.tapPromise(this.name, prepare);
    }
}

export function withSamengine(nextConfig: NextConfigLike = {}, options: SamengineNextOptions = {}): NextConfigLike {
    return {
        ...nextConfig,

        webpack(config: any, context: any) {
            const root = context?.dir ? path.resolve(context.dir) : process.cwd();
            const resolved = resolveOptions(options, root);
            const manifestPath = path.resolve(root, resolved.manifestDir, "resources.mjs");
            const userWebpack = nextConfig.webpack;

            config.resolve ??= {};
            config.resolve.alias ??= {};
            config.resolve.alias[resolved.resourceManifestModule] = manifestPath;
            config.plugins ??= [];
            config.plugins.push(new SamengineNextResourcesPlugin(resolved));

            return typeof userWebpack === "function"
                ? userWebpack(config, context)
                : config;
        },
    };
}
