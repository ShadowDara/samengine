#!/usr/bin/env node

// Build Cli Tools for samengine

import { build as esbuild } from "esbuild";
import { createServer } from "http";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { watch, watchFile } from "fs";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";

import { createProject } from "./new.js";
import { copyFolder, flog, getContentType, scanResourcesAsDataURIs, filterResourcesByUsage } from "../buildhelper.js";
import { GetDefaultHTML, GetSingleFileHTML } from "../exporthtml.js";
import { loadUserConfig } from "./config.js";
import { compressHTML } from "../utils/utils.js";
import { parseArgs } from "./argparser.js";
import { buildconfig } from "../buildconfig.js";
import { getPackageVersion } from "../getversion.js";

const version = getPackageVersion("samengine");

// ================= BUILD =================
function createBuilder(config: buildconfig, isRelease: boolean, isSingleFile: boolean = false) {
    // Ensure that the Directories are created
    mkdir("resources", { recursive: true });
    mkdir("game", { recursive: true });

    async function build() {
        try {
            flog("🔄 Building project...");
            if (isRelease) await rm(`./${config.outdir}`, { recursive: true, force: true });

            await esbuild({
                entryPoints: [`./game/${config.entryname}`],
                outdir: `./${config.outdir}`,
                bundle: true,
                platform: "browser",
                minify: isRelease,
                sourcemap: !isRelease,
                define: { "import.meta.env.DEV": JSON.stringify(!isRelease) },
            });

            if (isSingleFile) {
                // Single-file export
                const bundledJsPath = path.join(".", config.outdir, `${config.entryname.replace(/\.[^.]*$/, "")}.js`);
                const bundledJsContent = await readFile(bundledJsPath, "utf-8");
                
                // Scan resources and convert to data URIs
                let resourcesMap = await scanResourcesAsDataURIs("./resources");
                
                // Filter resources by usage in the bundled code
                resourcesMap = filterResourcesByUsage(bundledJsContent, resourcesMap);
                
                let html = GetSingleFileHTML(config, bundledJsContent, resourcesMap);
                if (isRelease) html = await compressHTML(html);
                
                // Add comment at the beginning after minification
                const htmlComment = `<!-- Game made with samengine v${version} - https://github.com/Shadowdara/samengine ${config.gameauthor} (Game Author) -->\n`;
                html = htmlComment + html;
                
                await writeFile(`./${config.outdir}/index.html`, html);

                // Delete the JS File
                await rm(`./${config.outdir}/main.js`, { recursive: true, force: true });

                flog("✅ Single-file export created!");
            } else {
                // Multi-file export (original behavior)
                let html = GetDefaultHTML(config, isRelease);
                if (isRelease) html = await compressHTML(html);
                
                // Add HTML comment at the beginning after minification
                const htmlComment = `<!-- Game made with samengine v${version} - https://www.npmjs.com/samengine ${config.gameauthor} (Game Author) -->\n`;
                html = htmlComment + html;
                
                await writeFile(`./${config.outdir}/index.html`, html);
                
                // Add JS comment at the beginning of JS files
                const jsComment = `// Game made with samengine v${version} - https://www.npmjs.com/samengine by ${config.gameauthor} (Game Author)\n`;
                const jsPath = path.join(".", config.outdir, `${config.entryname.replace(/\.[^.]*$/, "")}.js`);
                let jsContent = await readFile(jsPath, "utf-8");
                jsContent = jsComment + jsContent;
                await writeFile(jsPath, jsContent);
                
                await copyFolder("./resources", `./${config.outdir}/resources`);
                flog("✅ Build finished!");
            }
        } catch (error) {
            flog(`❌ Build failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return { build };
}

// ================= SERVER & RELOAD =================
function createDevServer(config: buildconfig) {
    const sockets = new Set<WebSocket>();
    const server = createServer(async (req, res) => {
        const url = req.url || "/";
        const filePath = path.join(process.cwd(), `${config.outdir}`, url === "/" ? "index.html" : url);

        try {
            const file = await readFile(filePath);
            res.writeHead(200, { "Content-Type": getContentType(filePath) });
            res.end(file);
        } catch {
            res.writeHead(404);
            res.end("Not Found");
        }
    });

    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
        sockets.add(ws);
        ws.on("close", () => sockets.delete(ws));
    });

    function startListening(port: number) {
        server.listen(port);

        server.on("listening", () => {
            flog(`🚀 Dev Server running on http://localhost:${port}`);
        });

        server.on("error", (err: any) => {
            if (err.code === "EADDRINUSE") {
                flog(`⚠️ Port ${port} belegt, versuche ${port + 1}...`);
                startListening(port + 1);
            } else {
                throw err;
            }
        });
    }

    startListening(config.dev_server_port);

    function reloadClients() {
        flog("🔄 Browser reload...");
        sockets.forEach((ws) => ws.send("reload"));
    }

    function stop() {
        flog("🛑 Stopping dev server...");

        sockets.forEach(ws => ws.close());
        wss.close();
        server.close();
    }

    return { reloadClients, stop };
}

// ================= WATCHER =================
async function startWatcher(onChange: () => Promise<void>) {
    await mkdir("resources", { recursive: true });
    await mkdir("game", { recursive: true });
    ["resources", "game"].forEach((dir) => {
        watch(dir, { recursive: true }, async () => {
            flog(`📁 Change noticed in ${dir}`);
            await onChange();
        });
    });
    flog("👀 Watcher active...");
}

// ================= CLI APP =================
async function main() {
    const args = parseArgs();

    if (args.newProject) {
        await createProject(args.newProject, args.empty);
        process.exit(0);
    }

    const config = await loadUserConfig();
    let builder = createBuilder(config, args.release, args.singlefile);

    let isBuilding = false;
    let pendingRestart = false;

    async function restart() {
        if (isBuilding) {
            pendingRestart = true;
            return;
        }
        isBuilding = true;

        do {
            pendingRestart = false;
            try {
                // Load the New Config
                const newConfig = await loadUserConfig();

                // Dev Server Stoppen
                devServer?.stop();

                // Create new Dev Server
                devServer = createDevServer(newConfig);

                // New Builder (use the new Config)
                builder = createBuilder(newConfig, args.release, args.singlefile);

                await builder.build();

                devServer?.reloadClients();
            } catch (error) {
                flog(`❌ Rebuild failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        } while (pendingRestart);

        isBuilding = false;
    }

    try {
        await builder.build();
    } catch (error) {
        flog(`❌ Initial build failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    let devServer: ReturnType<typeof createDevServer> | null = null;

    // Only start the Dev Server in Release Mode
    if (!args.release) {
        devServer = createDevServer(config);

        // 🔥 HIER EINBAUEN
        watchFile("samengine.config.ts", { interval: 300 }, async () => {
            flog("⚙️ Config file changed → full restart");

            await restart();
        });

        await startWatcher(restart);
    }

    // Dev or Release Mode
    flog(`Build finished! Mode: ${args.release ? "Release" : "Dev"}`);
}

main();
