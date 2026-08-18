// Copies raw `.svelte` files from `src/` into `dist/`.
//
// `tsc` only understands `.ts`/`.d.ts`/`.js` and silently ignores `.svelte`
// files - it neither type-checks nor copies them. Svelte component libraries
// ship the raw `.svelte` source (not pre-compiled JS) so the *consumer's*
// Svelte/Vite toolchain compiles them against whatever Svelte version that
// project uses. This script is the second half of `npm run build`, run right
// after `tsc`, that makes sure those source files actually end up in `dist/`.
import { readdirSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(packageRoot, "src");
const distDir = join(packageRoot, "dist");

let copied = 0;

function copySvelteFiles(dir) {
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);

        if (statSync(fullPath).isDirectory()) {
            copySvelteFiles(fullPath);
            continue;
        }

        if (!entry.endsWith(".svelte")) {
            continue;
        }

        const relativePath = fullPath.slice(srcDir.length + 1);
        const destPath = join(distDir, relativePath);

        mkdirSync(dirname(destPath), { recursive: true });
        copyFileSync(fullPath, destPath);
        copied++;
    }
}

copySvelteFiles(srcDir);

console.log(`copy-svelte-assets: copied ${copied} .svelte file(s) into dist/`);
