// Check for Args

import { copyFolder, flog, getContentType } from "../engine/build/buildhelper";
import Bun from "bun";
import { watch, writeFile } from "fs";
import { buildconfig } from "../engine/build/buildconfig";
import { defineConfig } from "../project";
import { GetDefaultHTML } from "../engine/build/exporthtml";

let config = defineConfig();

let isBuilding = false;

// === Build-Funktion kapseln ===
async function build(config: buildconfig) {
    if (isBuilding) return;
    isBuilding = true;

    flog("🔄 Baue neu...");


    await Bun.build({
        entrypoints: ["./game/" + config.entryname], // <-- hier dynamisch
        outdir: "./" + config.outdir,
        target: "browser",
        minify: isRelease,
        sourcemap: isRelease ? false : "linked",
        define: {
            "import.meta.env.DEV": JSON.stringify(isDev),
        },
    });

    let inhalt = GetDefaultHTML(config);

    await writeFile('./dist/index.html', inhalt, (err) => {
        if (err) {
            console.error('Fehler beim Schreiben:', err);
        } else {
            console.log('Datei erfolgreich geschrieben!');
        }
    });

    // resources kopieren
    await copyFolder("./resources", "./dist/resources");

    flog("✅ Build fertig!");
    isBuilding = false;
}

// === Release-Flag aus CLI-Args prüfen ===
const isRelease = process.argv.includes("--release");
const isDev = !isRelease;

let server: ReturnType<typeof Bun.serve> | null = null;

// === Server starten ===
let sockets = new Set<WebSocket>();

function startServer() {
    server = Bun.serve({
        port: 3000,

        fetch(req, server) {
            const url = new URL(req.url);

            // WebSocket Upgrade
            if (url.pathname === "/ws") {
                if (server.upgrade(req)) return;
                return new Response("Upgrade failed", { status: 500 });
            }

            // Pfad auf dist umleiten
            let path = url.pathname === "/" ? "/index.html" : url.pathname;

            try {
                // Dateien aus ./dist laden
                const file = Bun.file(`./dist${path}`);
                return new Response(file, {
                    headers: { "Content-Type": getContentType(path) },
                });
            } catch {
                return new Response("Not Found", { status: 404 });
            }
        },

        websocket: {
            open(ws) { sockets.add(ws); },
            close(ws) { sockets.delete(ws); },
        },
    });

    flog("🚀 Dev Server läuft auf http://localhost:3000 (aus ./dist)");
}

// to relaod the client
function reloadClients() {
    flog("🔄 Browser reload...");

    for (const ws of sockets) {
        ws.send("reload");
    }
}

// === Server stoppen ===
async function stopServer() {
    if (server) {
        flog("🛑 Stoppe Server...");
        server.stop();
        server = null;

        // WICHTIG: kurze Pause, damit Port freigegeben wird
        await new Promise((r) => setTimeout(r, 100));
    }
}

// === Restart-Logik ===
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

        await stopServer();
        await build(config);
        startServer();
        reloadClients();

    } while (pendingRestart);

    restarting = false;
}

// === Initialer Start ===
await build(config);

if (isDev) {
    startServer();

    const watchDirs = ["tools", "resources", "engine", "game"];

    watchDirs.forEach((dir) => {
        watch(dir, { recursive: true }, async (eventType, filename) => {
            flog(`📁 Änderung erkannt: ${dir}/${filename}`);

            await restart();
        });
    });

    flog("👀 Watcher aktiv...");
}

flog(`Build fertig! Modus: ${isRelease ? "Release" : "Dev"}`);
