#!/usr/bin/env node

import { build as esbuild } from "esbuild";
import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import { watch } from "fs";
import path from "path";
import { WebSocketServer } from "ws";

import { createProject } from "./new.js";
import { copyFolder, flog, getContentType } from "../../buildhelper.js";
import { GetDefaultHTML } from "../../exporthtml.js";
import { loadUserConfig } from "./config.js";

// ================= ARG PARSING =================
function parseArgs() {
    const args = process.argv.slice(2);

    const options = {
        release: false,
        port: 3000,
        newProject: null as string | null,
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

            default:
                console.warn(`⚠️ Unbekanntes Argument: ${arg}`);
        }
    }

    return options;
}

const args = parseArgs();

// Falls --new → sofort ausführen und beenden
if (args.newProject) {
    await createProject(args.newProject);
    // and make exit afterwards
}

// ================= FLAGS =================
const isRelease = args.release;
const isDev = !isRelease;

// ================= CONFIG =================
const config = await loadUserConfig();

// ================= BUILD =================
let isBuilding = false;

async function build() {
    if (isBuilding) return;
    isBuilding = true;

    flog("🔄 Baue neu...");

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
    await writeFile("./dist/index.html", html);

    await copyFolder("./resources", "./dist/resources");

    flog("✅ Build fertig!");
    isBuilding = false;
}

// ================= SERVER =================
let sockets = new Set<any>();

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
        flog(`🚀 Dev Server läuft auf http://localhost:${args.port}`);
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

// ================= WATCH =================
let restarting = false;
let pendingRestart = false;

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

// ================= START =================
await build();

if (isDev) {
    startServer();

    ["resources", "game"].forEach((dir) => {
        watch(dir, { recursive: true }, async () => {
            flog(`📁 Änderung erkannt in ${dir}`);
            await restart();
        });
    });

    flog("👀 Watcher aktiv...");
}

flog(`Build fertig! Modus: ${isRelease ? "Release" : "Dev"}`);
