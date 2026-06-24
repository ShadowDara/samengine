#!/usr/bin/env node

/**
 * CLI entry point for `samengine-build`.
 *
 * High-level flow:
 * 1. Parse CLI arguments.
 * 2. Optionally create a new project.
 * 3. Load `samengine.config.ts`.
 * 4. Bundle the game with esbuild.
 * 5. Generate HTML and handle resources.
 * 6. In development mode, start a local server and watch for changes.
 */

import { build as esbuild } from "esbuild";
import { createServer } from "http";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { watch, watchFile } from "fs";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";

import { copyFolder, flog, getContentType, scanResourcesAsDataURIs, filterResourcesByUsage } from "./../buildhelper.js";
import { GetDefaultHTML, GetSingleFileHTML, getVersion } from "../exporthtml.js";
import { loadUserConfig } from "./../config.js";
import { compressHTML } from "../../index.js";
import { parseArgs } from "../argparser.js";
import { buildconfig } from "../../../config/index.js";
import { run as runCreateProject } from "../projcreator/main.js"; 

// ================= HELP ============
/**
 * Function to print Help
 */

function showHelp() {
    console.log(
`CLI Tool for samengine

Usage:
  -r, --release
  n <project>
  --new-empty
  -single-file   to generate the Export into one file
`);
}


// ================= BUILD =================
/**
 * Creates a build runner for one config object and one build mode.
 *
 * The returned `build` function owns the esbuild call, generated HTML, resource
 * copying or embedding, release minification, and metadata comments. Dev builds
 * keep source maps; release builds clean the output directory first.
 */
function createBuilder(config: buildconfig, isRelease: boolean) {
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

            if (isRelease && config.releaseMode.singlefile || !isRelease && config.devMode.singlefile) {
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
                const htmlComment = `<!-- Game made with samengine v${getVersion()} - https://github.com/Shadowdara/samengine ${config.gameauthor} (Game Author) -->\n`;
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
                const htmlComment = `<!-- Game made with samengine v${getVersion()} - https://www.npmjs.com/samengine ${config.gameauthor} (Game Author) -->\n`;
                html = htmlComment + html;
                
                await writeFile(`./${config.outdir}/index.html`, html);
                
                // Add JS comment at the beginning of JS files
                const jsComment = `// Game made with samengine v${getVersion()} - https://www.npmjs.com/samengine by ${config.gameauthor} (Game Author)\n`;
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
/**
 * Starts the local development server for the configured output directory.
 *
 * Static files are served from `config.outdir`. A WebSocket server is attached
 * to the same HTTP server so future rebuilds can notify connected browsers.
 */
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
                flog(`⚠️ Port ${port} is already in use, trying ${port + 1}...`);
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
/**
 * Watches the `resources` and `game` folders recursively.
 *
 * The watcher delegates rebuild scheduling to `onChange`. The main function
 * serializes rebuilds so multiple file-system events do not run overlapping
 * builds.
 */
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
/**
 * Runs the CLI application.
 *
 * Development mode starts with one build, then creates a server and watchers.
 * Config changes trigger a full restart because output folder, port, menu, or
 * other generated HTML settings may have changed.
 */
async function main() {
    const args = parseArgs();

    if (args.newProject) {
        await runCreateProject();
        process.exit(0);
    }

    if (args.help) {
        showHelp()
        process.exit(0);
    }

    const config = await loadUserConfig();
    let builder = createBuilder(config, args.release);

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
                builder = createBuilder(newConfig, args.release);

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

        // Watch the config separately because changing it can require a server restart.
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
