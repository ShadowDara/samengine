import "esbuild-register";
import path from "path";
import { pathToFileURL } from "url";
import { buildconfig } from "../buildconfig.js";

export async function loadUserConfig(): Promise<buildconfig> {
    const configPath = path.resolve(process.cwd(), "webgameengine.config.ts");

    try {
        const configUrl = pathToFileURL(configPath).href;
        const mod = await import(configUrl);

        const config =
            typeof mod.default === "function"
                ? mod.default()
                : mod.default;

        return config;
    } catch (e) {
        console.error(e);
        throw new Error(
            "❌ Could not find 'webgameengine.config.ts - PATH: " + configPath
        );
    }
}
