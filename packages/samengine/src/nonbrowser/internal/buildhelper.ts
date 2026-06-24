import { readdirSync, statSync, mkdirSync, promises as fsPromises, existsSync } from "fs";
import { join } from "path";

/**
 * Logs CLI messages with a timestamp down to milliseconds.
 *
 * The build tool can receive several file-system events in quick succession
 * while watching a project. Timestamped logs make it easier to understand which
 * rebuild, copy operation, or server action happened first.
 */
export const flog = (...args: any[]) => {
    const now = new Date();
    const time =
        `[${now.getHours().toString().padStart(2, "0")}:` +
        `${now.getMinutes().toString().padStart(2, "0")}:` +
        `${now.getSeconds().toString().padStart(2, "0")}.` +
        `${now.getMilliseconds().toString().padStart(3, "0")}]`;

    console.log(time, ...args);
}

/**
 * Recursively copies a folder from `src` to `dest`.
 *
 * The multi-file build uses this to copy `resources` into the output directory.
 * Files are copied as raw buffers so binary assets such as images and audio are
 * preserved exactly.
 */
export async function copyFolder(src: string, dest: string): Promise<void> {
    // Create the target folder before copying nested entries into it.
    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyFolder(srcPath, destPath);
        } else if (entry.isFile()) {
            // Datei mit Node.js schreiben
            const data = await fsPromises.readFile(srcPath);
            await fsPromises.writeFile(destPath, data);
        }
    }
}

/**
 * Scans a resource folder and converts every file into a Base64 Data URI.
 *
 * The returned object uses paths relative to `resourceDir`, for example
 * `sprites/player.png`. Single-file builds embed this map into the generated
 * HTML so the game can load assets without separate files.
 */
export async function scanResourcesAsDataURIs(resourceDir: string): Promise<Record<string, string>> {
    const resourceMap: Record<string, string> = {};

    if (!existsSync(resourceDir)) {
        return resourceMap;
    }

    async function scanDir(dir: string, basePath: string = "") {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            const resourcePath = basePath ? `${basePath}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                await scanDir(fullPath, resourcePath);
            } else if (entry.isFile()) {
                const fileData = await fsPromises.readFile(fullPath);
                const base64Data = fileData.toString("base64");
                const mimeType = getMimeType(entry.name);
                resourceMap[resourcePath] = `data:${mimeType};base64,${base64Data}`;
            }
        }
    }

    await scanDir(resourceDir);
    return resourceMap;
}

// === Helper ===

/** Returns the Content-Type used by the local development server. */
export function getContentType(path: string): string {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".ts")) return "application/typescript";
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".svg")) return "image/svg+xml";
    return "text/plain";
}

/**
 * Returns the MIME type used when embedding a resource as a Data URI.
 *
 * Unknown file extensions fall back to `application/octet-stream`, which keeps
 * the resource loadable even when the type is not explicitly listed here.
 */
export function getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop() || "";
    const mimeTypes: Record<string, string> = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "svg": "image/svg+xml",
        "webp": "image/webp",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "ogg": "audio/ogg",
        "m4a": "audio/mp4",
        "json": "application/json",
        "txt": "text/plain",
        "css": "text/css",
    };
    return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Removes resources that do not appear to be referenced by the bundled code.
 *
 * The check intentionally stays simple: it looks for the full relative resource
 * path or just the filename inside the JavaScript bundle. This keeps
 * single-file exports smaller, but it can only detect assets whose names remain
 * visible as strings in the bundle.
 */
export function filterResourcesByUsage(bundledJsContent: string, resourcesMap: Record<string, string>): Record<string, string> {
    const filteredResources: Record<string, string> = {};
    const unusedResources: string[] = [];

    for (const resourcePath in resourcesMap) {
        // Extract just the filename (last part after /)
        const filename = resourcePath.split("/").pop() || resourcePath;

        // Check if the resource is referenced in the bundled code
        // Look for string literals containing the resource path or filename
        if (bundledJsContent.includes(filename) || bundledJsContent.includes(resourcePath)) {
            filteredResources[resourcePath] = resourcesMap[resourcePath];
        } else {
            unusedResources.push(resourcePath);
        }
    }

    // Log unused resources
    if (unusedResources.length > 0) {
        flog(`⚠️  ${unusedResources.length} unused resource(s) excluded from single-file build:`);
        unusedResources.forEach(res => flog(`   - ${res}`));
    }

    return filteredResources;
}
