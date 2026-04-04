import { readdirSync, statSync, mkdirSync, promises as fsPromises } from "fs";
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

export async function copyFolder(src: string, dest: string) {
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

// === Helper ===
export function getContentType(path: string) {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".ts")) return "application/typescript";
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".png")) return "image/png";
    return "text/plain";
}
