#!/usr/bin/env node

// Shebang

import { build as esbuild } from "esbuild";

import { copyFolder, flog, getContentType } from "../buildhelper.js";
import { buildconfig } from "../buildconfig.js";
import { GetDefaultHTML } from "../exporthtml.js";

import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import { watch } from "fs";
import path from "path";
import { WebSocketServer } from "ws";

import { loadUserConfig } from "./config.js";


const config = await loadUserConfig();

let isBuilding = false;
const isRelease = process.argv.includes("--release");
const isDev = !isRelease;

// ================= BUILD =================
async function build(config: buildconfig) {
    if (isBuilding) return;
    isBuilding = true;

    flog("🔄 Baue neu...");

    await esbuild({
        entryPoints: ["./game/" + config.entryname],
        outdir: "./" + config.outdir,
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
        let url = req.url || "/";
        let filePath = url === "/" ? "/index.html" : url;

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

    server.listen(3000, () => {
        flog("🚀 Dev Server läuft auf http://localhost:3000");
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
        await build(config);
        reloadClients();

    } while (pendingRestart);

    restarting = false;
}

// ================= START =================
await build(config);

if (isDev) {
    startServer();

    ["tools", "resources", "game"].forEach((dir) => {
        watch(dir, { recursive: true }, async () => {
            flog(`📁 Änderung erkannt in ${dir}`);
            await restart();
        });
    });

    flog("👀 Watcher aktiv...");
}

flog(`Build fertig! Modus: ${isRelease ? "Release" : "Dev"}`);
