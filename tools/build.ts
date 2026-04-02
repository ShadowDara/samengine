import Bun from "bun";
import { watch } from "fs";
import { readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";


export const flog = (...args: any[]) => {
        const now = new Date();
        const time =
            `[${now.getHours().toString().padStart(2, "0")}:` +
            `${now.getMinutes().toString().padStart(2, "0")}:` +
            `${now.getSeconds().toString().padStart(2, "0")}.` +
            `${now.getMilliseconds().toString().padStart(3, "0")}]`;

        console.log(time, ...args);
}

async function copyFolder(src: string, dest: string) {
    // Ordner erstellen (rekursiv)
    mkdirSync(dest, { recursive: true });

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyFolder(srcPath, destPath);
        } else if (entry.isFile()) {
            // Bun.file funktioniert weiterhin
            await Bun.write(destPath, await Bun.file(srcPath).arrayBuffer());
        }
    }
}

// === Release-Flag aus CLI-Args prüfen ===
const isRelease = process.argv.includes("--release");
const isDev = !isRelease;

let server: ReturnType<typeof Bun.serve> | null = null;
let isBuilding = false;

// === Build-Funktion kapseln ===
async function build() {
    if (isBuilding) return;
    isBuilding = true;

    flog("🔄 Baue neu...");

    await Bun.build({
        entrypoints: ["./game/main.ts"],
        outdir: "./dist",
        target: "browser",
        minify: isRelease,
        sourcemap: isRelease ? false : "linked",
        define: {
            "import.meta.env.DEV": JSON.stringify(isDev),
        },
    });

    // resources kopieren
    await copyFolder("./resources", "./dist/resources");

    flog("✅ Build fertig!");
    isBuilding = false;
}

// === Server starten ===
let sockets = new Set<WebSocket>();

function startServer() {
    server = Bun.serve({
        port: 3000,

        fetch(req, server) {
            const url = new URL(req.url);

            // WebSocket Upgrade
            if (url.pathname === "/ws") {
                if (server.upgrade(req)) {
                    return;
                }
                return new Response("Upgrade failed", { status: 500 });
            }

            let path = url.pathname === "/" ? "/index.html" : url.pathname;

            try {
                const file = Bun.file(`.${path}`);
                return new Response(file, {
                    headers: {
                        "Content-Type": getContentType(path),
                    },
                });
            } catch {
                return new Response("Not Found", { status: 404 });
            }
        },

        websocket: {
            open(ws) {
                sockets.add(ws);
            },
            close(ws) {
                sockets.delete(ws);
            },
        },
    });

    flog("🚀 Dev Server läuft auf http://localhost:3000");
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
        await build();
        startServer();
        reloadClients();

    } while (pendingRestart);

    restarting = false;
}

// === Initialer Start ===
await build();

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

// === Helper ===
function getContentType(path: string) {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".ts")) return "application/typescript";
    if (path.endsWith(".html")) return "text/html";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".png")) return "image/png";
    return "text/plain";
}
