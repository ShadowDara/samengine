import fs from "fs";
import path from "path";
import { parseMarkdown, exportCompressedMarkdownCSS } from "../index.js";
import { readFileSync, readdirSync, writeFileSync } from "fs";

const TEMPLATE_HTML = `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MiniSite</title><style>/*__CSS__{}*/</style></head><body><main id="app" class="md-body"></main><script> const pages = __PAGES__; const app = document.getElementById("app"); function normalizeRoute(route) { route = route.trim(); route = route.replace(/^\/+/, ""); if ( route === "" || route === "/" || route === "index" ) { return "index"; } return route; } function render() { let route = location.hash.slice(1); route = normalizeRoute(route); const html = pages[route] ?? pages["404"] ?? \`<h1>404</h1><p>This Page was not found!</p><p><a href="#">Back Home</a></p><p><a href="javascript:location.hash = '#/' + lastValid">Back to the last Page</a></p>\`; app.innerHTML = html; } window.addEventListener("hashchange", render); window.addEventListener("DOMContentLoaded", render); </script></body></html>
`;

export function newProj() {
    fs.writeFileSync("index.html", TEMPLATE_HTML);

    console.log(`Create new Markdown files! Start with pages/index.md for the start page. Then run sam-cli minisite to compile it.!
Have fun!
`)
}

export function compile() {
    // Load the config
    const configPath = ".samengine/minisite.config.json";

    let config = { assets: [] };

    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    const pages = {};

    for (const asset of config.assets || []) {
        const data = fs.readFileSync(asset.file);
        const base64 = data.toString("base64");

        const url = `data:${asset.type};base64,${base64}`;

        const route = `___assets___/${asset.slug}`;

        // HTML direkt als Page speichern
        if (asset.type.startsWith("image/")) {
            pages[route] = `<img src="${url}" style="max-width:100%;">`;
        }

        // 🎬 Videos
        else if (asset.type.startsWith("video/")) {
            pages[route] = `
                <h2>${asset.slug}</h2>
                <video controls style="max-width:100%;height:auto;">
                    <source src="${url}" type="${asset.type}">
                    Dein Browser unterstützt das Video-Tag nicht.
                </video>
                <p><a href="${url}" download>Download Video</a></p>
            `;
        }

        // Raw Files
        else if (
            asset.type.startsWith("text/") ||
            asset.file.endsWith(".txt") ||
            asset.file.endsWith(".json") ||
            asset.file.endsWith(".md") ||
            asset.file.endsWith(".log")
        ) {
            const text = fs.readFileSync(asset.file, "utf8");

            const escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            pages[route] = `
        <h2>${asset.slug}</h2>
        <pre style="
            white-space: pre-wrap;
            word-wrap: break-word;
            background: #111;
            color: #eee;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
        ">${escaped}</pre>
    `;
        }

        else if (asset.type === "application/pdf") {
            pages[route] = `
                <h2>${asset.slug}</h2>
                <iframe src="${url}" style="width:100%;height:80vh;"></iframe>
                <p><a href="${url}" download>Download</a></p>
            `;
        }
        else {
            pages[route] = `
                <h2>${asset.slug}</h2>
                <a href="${url}" download>Download file</a>
            `;
        }
    }

    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(file);
                continue;
            }

            if (!entry.name.endsWith(".md")) continue;

            const route = path
                .relative("pages", file)
                .replace(/\\/g, "/")
                .replace(/\.md$/, "");

            const md = fs.readFileSync(file, "utf8");

            pages[route] = parseMarkdown(md);
        }
    }

    walk("pages");

    const template = fs.readFileSync("template.html", "utf8");

    const html = template
        .replace("__PAGES__", JSON.stringify(pages))
        .replace("/*__CSS__{}*/", exportCompressedMarkdownCSS());

    fs.writeFileSync("index.html", html);

    console.log("✔ compiled", Object.keys(pages).length, "pages");
}

export function main() {
    compile();
}
