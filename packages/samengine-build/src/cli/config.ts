import { build } from "esbuild";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs/promises";

export async function loadUserConfig() {
    const root = process.cwd();

    const configPath = path.resolve(root, "samengine.config.ts");
    const outDir = path.resolve(root, ".samengine");
    const outfile = path.join(outDir, "config.mjs");

    try {
        // ensure folder exists
        await fs.mkdir(outDir, { recursive: true });

        // 🔥 bundle TS → JS
        await build({
            entryPoints: [configPath],
            outfile,
            bundle: true,
            platform: "node",
            format: "esm",
        });

        // 🔥 import compiled file
        const mod = await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);

        const config =
            typeof mod.default === "function"
                ? await mod.default()
                : mod.default;

        return config;
    } catch (e) {
        console.error(e);
        throw new Error(
            "❌ Could not load samengine.config.ts: " + configPath
        );
    }
}
