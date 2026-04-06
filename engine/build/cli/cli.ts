#!/usr/bin/env node

import { build as esbuild } from "esbuild";
import { createServer } from "http";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { watch } from "fs";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";

import { createProject } from "./new.js";
import { copyFolder, flog, getContentType, scanResourcesAsDataURIs } from "../buildhelper.js";
import { GetDefaultHTML, GetSingleFileHTML } from "../exporthtml.js";
import { loadUserConfig } from "./config.js";
import { compressHTML } from "../utils/utils.js";
import { type CLIArgs, parseArgs } from "./argparser.js";

// ================= BUILD =================
function createBuilder(config: any, isRelease: boolean, isSingleFile: boolean = false) {
    // Ensure that the Directories are created
    mkdir("resources", { recursive: true });
    mkdir("game", { recursive: true });

    async function build() {
        flog("🔄 Building project...");
        if (isRelease) await rm("./dist", { recursive: true, force: true });

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
            const resourcesMap = await scanResourcesAsDataURIs("./resources");
            
            let html = GetSingleFileHTML(config, bundledJsContent, resourcesMap);
            if (isRelease) html = await compressHTML(html);
            
            await writeFile("./dist/index.html", html);
            flog("✅ Single-file export created!");
        } else {
            // Multi-file export (original behavior)
            let html = GetDefaultHTML(config);
            if (isRelease) html = await compressHTML(html);
            await writeFile("./dist/index.html", html);
            await copyFolder("./resources", "./dist/resources");
            flog("✅ Build finished!");
        }
    }

    return { build };
}

// ================= SERVER & RELOAD =================
function createDevServer(port: number) {
    const sockets = new Set<WebSocket>(); // <-- ws WebSocket, nicht DOM
    const server = createServer(async (req, res) => {
        const url = req.url || "/";
        const filePath = path.join(process.cwd(), "dist", url === "/" ? "index.html" : url);

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

    server.listen(port, () => flog(`🚀 Dev Server running on http://localhost:${port}`));

    function reloadClients() {
        flog("🔄 Browser reload...");
        sockets.forEach((ws) => ws.send("reload"));
    }

    return { reloadClients };
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
    const builder = createBuilder(config, args.release, args.singlefile);

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
            await builder.build();
            devServer?.reloadClients();
        } while (pendingRestart);

        isBuilding = false;
    }

    await builder.build();

    let devServer: ReturnType<typeof createDevServer> | null = null;

    if (!args.release) {
        devServer = createDevServer(args.port);
        await startWatcher(restart);
    }

    flog(`Build finished! Mode: ${args.release ? "Release" : "Dev"}`);
}

main();
