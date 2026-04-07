import { readdirSync, statSync, mkdirSync, promises as fsPromises, existsSync } from "fs";
import { join } from "path";

export const flog = (...args: any[]) => {
    const now = new Date();
    const time =
        `[${now.getHours().toString().padStart(2, "0")}:` +
        `${now.getMinutes().toString().padStart(2, "0")}:` +
        `${now.getSeconds().toString().padStart(2, "0")}.` +
        `${now.getMilliseconds().toString().padStart(3, "0")}]`;

    console.log(time, ...args);
}

export async function copyFolder(src: string, dest: string): Promise<void> {
    // Zielordner erstellen
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

// Scan resources folder and convert to data URIs (base64)
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
export function getContentType(path: string): string {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".ts")) return "application/typescript";
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".png")) return "image/png";
    return "text/plain";
}

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

// Filter resources by checking if they are actually used in the bundled code
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
