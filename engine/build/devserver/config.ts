import "esbuild-register";
import path from "path";
import { pathToFileURL } from "url";

export async function loadUserConfig() {
    const configPath = path.resolve(process.cwd(), "webgameengine.config.ts");

    try {
        const configUrl = pathToFileURL(configPath).href;
        const mod = await import(configUrl);
        return mod.default;
    } catch (e) {
        console.error(e);
        throw new Error("❌ Konnte webgameengine.config.ts nicht laden\nPATH: " + configPath);
    }
}
