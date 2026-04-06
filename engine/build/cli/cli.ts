#!/usr/bin/env node

import { build as esbuild } from "esbuild";
import { createServer } from "http";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { watch } from "fs";
import path from "path";
import { WebSocketServer } from "ws";

import { createProject } from "./new.js";
import { copyFolder, flog, getContentType } from "../buildhelper.js";
import { GetDefaultHTML } from "../exporthtml.js";
import { loadUserConfig } from "./config.js";
import { compressHTML } from "../../utils/utils.js";


// ================= ARG PARSING =================
function parseArgs() {
    const args = process.argv.slice(2);

    const options = {
        release: false,
        port: 3000,
        newProject: null as string | null,
        empty: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case "--release":
            case "-r":
                options.release = true;
                break;

            case "--port":
            case "-p":
                options.port = Number(args[i + 1]);
                i++;
                break;

            case "--new":
            case "-n":
                options.newProject = args[i + 1];
                i++;
                break;

            case "--new-empty":
                options.empty = true;
                break;
            
            case "-h":
            case "--help":
                // TODO
                // make the help Message here
                console.log("Cli Tools for Webgameengine");

            default:
                console.warn(`⚠️ Unknown Argument: ${arg}`);
        }
    }

    return options;
}

// ================= APP FACTORY =================
function createCLIApp(args: ReturnType<typeof parseArgs>, config: any) {
    const isRelease = args.release;
    const isDev = !isRelease;

    // 👉 State kapseln statt global
    let isBuilding = false;
    let restarting = false;
    let pendingRestart = false;
    const sockets = new Set<any>();

    // ================= BUILD =================
    async function build() {
        if (isBuilding) return;
        isBuilding = true;

        flog("🔄 Building new ...");

        // To Remove the Source Maps from the Export
        if (isRelease) {
            await rm("./dist", { recursive: true, force: true });
        }

        await esbuild({
            entryPoints: [`./game/${config.entryname}`],
            outdir: `./${config.outdir}`,
            bundle: true,
            platform: "browser",
            minify: isRelease,
            sourcemap: isDev,
            define: {
                "import.meta.env.DEV": JSON.stringify(isDev),
            },
        });

        const html = GetDefaultHTML(config);

        // Compress the HTML in Release Mode
        const finalHTML = isRelease
            ? compressHTML(html)
            : html;

        await writeFile("./dist/index.html", html);

        await copyFolder("./resources", "./dist/resources");

        flog("✅ Build finished!");
        isBuilding = false;
    }

    // ================= SERVER =================
    function startServer() {
        const server = createServer(async (req, res) => {
            const url = req.url || "/";
            const filePath = url === "/" ? "/index.html" : url;

            try {
                const fullPath = path.join(process.cwd(), "dist", filePath);
                const file = await readFile(fullPath);

                res.writeHead(200, {
                    "Content-Type": getContentType(filePath),
                });
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

        server.listen(args.port, () => {
            flog(`🚀 Dev Server is running on http://localhost:${args.port}`);
        });

        return server;
    }

    // ================= RELOAD =================
    function reloadClients() {
        flog("🔄 Browser reload...");
        for (const ws of sockets) {
            ws.send("reload");
        }
    }

    // ================= RESTART =================
    async function restart() {
        if (restarting) {
            pendingRestart = true;
            return;
        }

        restarting = true;

        do {
            pendingRestart = false;

            flog("♻️ Restart...");
            await build();
            reloadClients();
        } while (pendingRestart);

        restarting = false;
    }

    // ================= WATCH =================
    function startWatcher() {
        mkdir("resources", { recursive: true });
        mkdir("game", { recursive: true });
        ["resources", "game"].forEach((dir) => {
            watch(dir, { recursive: true }, async () => {
                flog(`📁 Change noticed in ${dir}`);
                await restart();
            });
        });

        flog("👀 Watcher active ...");
    }

    // ================= RUN =================
    async function run() {
        await build();

        if (isDev) {
            startServer();
            startWatcher();
        }

        flog(`Build finished! Mode: ${isRelease ? "Release" : "Dev"}`);
    }

    return { run };
}

// ================= MAIN =================
const args = parseArgs();

// Create a bew Project
if (args.newProject) {
    await createProject(args.newProject, args.empty);
    process.exit(0);
}

const config = await loadUserConfig();

const app = createCLIApp(args, config);
await app.run();
