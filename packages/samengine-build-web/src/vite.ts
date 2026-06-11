import { createReadStream } from "fs";
import { access, readdir, readFile, stat } from "fs/promises";
import path from "path";

export const DEFAULT_RESOURCE_MANIFEST_MODULE = "virtual:samengine/resources";

export interface SamengineWebOptions {
    /**
     * Folder containing images, audio, JSON, and other game assets.
     *
     * The path is resolved relative to the website project root.
     */
    resourcesDir?: string;

    /**
     * Public URL prefix used for generated resource URLs.
     *
     * In development the Vite middleware serves files from this path. In
     * production the plugin emits the files into the matching output folder.
     */
    resourceBase?: string;

    /** Output folder inside the final website build for emitted resources. */
    outResourcesDir?: string;

    /** Virtual module id that exports the generated resource manifest. */
    resourceManifestModule?: string;

    /** Disable when another tool already copies the resources folder. */
    copyResources?: boolean;
}

export interface SamengineResource {
    /** Path relative to the resources folder, always using forward slashes. */
    path: string;

    /** Public URL that can be passed to samengine texture or audio loaders. */
    url: string;

    /** Absolute source file path on disk. */
    file: string;
}

export type SamengineResourceMap = Record<string, string>;

type MinimalViteServer = {
    middlewares: {
        use: (handler: (req: any, res: any, next: () => void) => void) => void;
    };
    watcher?: {
        add: (file: string) => void;
    };
};

type MinimalConfig = {
    root?: string;
    base?: string;
};

type MinimalPluginContext = {
    addWatchFile?: (id: string) => void;
    emitFile?: (file: { type: "asset"; fileName: string; source: string | Uint8Array }) => void;
};

export interface ViteLikePlugin {
    name: string;
    enforce?: "pre" | "post";
    config?: () => Record<string, unknown>;
    configResolved?: (config: MinimalConfig) => void;
    configureServer?: (server: MinimalViteServer) => void;
    resolveId?: (id: string) => string | null;
    load?: (this: MinimalPluginContext, id: string) => Promise<string | null> | string | null;
    generateBundle?: (this: MinimalPluginContext) => Promise<void> | void;
}

type ResolvedOptions = Required<SamengineWebOptions> & {
    root: string;
};

function fileExists(file: string): Promise<boolean> {
    return access(file).then(() => true, () => false);
}

function stripSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, "");
}

function normalizeBase(base: string): string {
    if (!base || base === "/") return "/";
    return `/${stripSlashes(base)}/`;
}

function joinUrl(...parts: string[]): string {
    const joined = parts
        .filter(Boolean)
        .map((part, index) => index === 0 ? part.replace(/\/+$/g, "") : stripSlashes(part))
        .filter(Boolean)
        .join("/");

    return joined.startsWith("/") ? joined : `/${joined}`;
}

export function normalizeResourcePath(value: string): string {
    return value.split(path.sep).join("/");
}

async function walkFiles(dir: string): Promise<string[]> {
    if (!await fileExists(dir)) return [];

    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await walkFiles(fullPath));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
}

function resolveOptions(options: SamengineWebOptions, root: string, base: string): ResolvedOptions {
    return {
        resourcesDir: options.resourcesDir ?? "resources",
        resourceBase: joinUrl(normalizeBase(base), options.resourceBase ?? "samengine/resources"),
        outResourcesDir: stripSlashes(options.outResourcesDir ?? "samengine/resources"),
        resourceManifestModule: options.resourceManifestModule ?? DEFAULT_RESOURCE_MANIFEST_MODULE,
        copyResources: options.copyResources ?? true,
        root,
    };
}

export async function scanResources(options: Pick<ResolvedOptions, "root" | "resourcesDir" | "resourceBase">): Promise<SamengineResource[]> {
    const resourceRoot = path.resolve(options.root, options.resourcesDir);
    const files = await walkFiles(resourceRoot);

    return files.map((file) => {
        const relativePath = normalizeResourcePath(path.relative(resourceRoot, file));

        return {
            path: relativePath,
            url: joinUrl(options.resourceBase, relativePath),
            file,
        };
    });
}

export function createManifestModule(resources: SamengineResource[]): string {
    const resourceMap: SamengineResourceMap = {};

    for (const resource of resources) {
        resourceMap[resource.path] = resource.url;
    }

    return `const resources = ${JSON.stringify(resourceMap, null, 4)};

export default resources;

export function getResource(path) {
    return resources[path] ?? null;
}

export function loadResource(path) {
    return getResource(path);
}

if (typeof window !== "undefined") {
    window.__samengineResources = resources;
    window.__getSamengineResource = getResource;
}
`;
}

async function sendStaticFile(req: any, res: any, next: () => void, resourceBase: string, resourceRoot: string) {
    const url = req.url?.split("?")[0] ?? "";
    const cleanBase = resourceBase.endsWith("/") ? resourceBase : `${resourceBase}/`;

    if (!url.startsWith(cleanBase)) {
        next();
        return;
    }

    const requested = decodeURIComponent(url.slice(cleanBase.length));
    const filePath = path.resolve(resourceRoot, requested);

    if (!filePath.startsWith(resourceRoot)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
    }

    try {
        const info = await stat(filePath);

        if (!info.isFile()) {
            next();
            return;
        }

        createReadStream(filePath).pipe(res);
    } catch {
        next();
    }
}

export function samengineWeb(options: SamengineWebOptions = {}): ViteLikePlugin {
    let resolved = resolveOptions(options, process.cwd(), "/");

    return {
        name: "samengine-build-web",
        enforce: "pre",

        config() {
            return {
                define: {
                    "import.meta.env.SAMENGINE": JSON.stringify(true),
                },
            };
        },

        configResolved(config) {
            resolved = resolveOptions(options, path.resolve(config.root ?? process.cwd()), config.base ?? "/");
        },

        configureServer(server) {
            const resourceRoot = path.resolve(resolved.root, resolved.resourcesDir);
            server.watcher?.add(resourceRoot);
            server.middlewares.use((req, res, next) => {
                void sendStaticFile(req, res, next, resolved.resourceBase, resourceRoot);
            });
        },

        resolveId(id) {
            return id === resolved.resourceManifestModule ? id : null;
        },

        async load(id) {
            if (id !== resolved.resourceManifestModule) return null;

            const resources = await scanResources(resolved);

            for (const resource of resources) {
                this.addWatchFile?.(resource.file);
            }

            return createManifestModule(resources);
        },

        async generateBundle() {
            if (!resolved.copyResources) return;

            const resources = await scanResources(resolved);

            for (const resource of resources) {
                const source = await readFile(resource.file);
                this.emitFile?.({
                    type: "asset",
                    fileName: normalizeResourcePath(path.join(resolved.outResourcesDir, resource.path)),
                    source,
                });
            }
        },
    };
}
