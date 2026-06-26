import fs from "fs";
import path from "path";
import { parseMarkdown, exportCompressedMarkdownCSS } from "../index.js";

const TEMPLATE_HTML = `<!doctype html><html lang="de"><head><meta charset="UTF-8"><title>MiniSite</title><style>__CSS__{}</style></head><body><main id="app" class="md-body"></main><script> const pages = __PAGES__; const app = document.getElementById("app"); function normalizeRoute(route) { route = route.trim(); route = route.replace(/^\/+/, ""); if ( route === "" || route === "/" || route === "index" ) { return "index"; } return route; } function render() { let route = location.hash.slice(1); route = normalizeRoute(route); const html = pages[route] ?? pages["404"] ?? \`<h1>404</h1><a href="#">Home</a>\`; app.innerHTML = html; } window.addEventListener("hashchange", render); window.addEventListener("DOMContentLoaded", render); </script></body></html>
`;

export function newProj() {
    fs.writeFileSync("index.html", TEMPLATE_HTML);

    console.log(`Create new Markdown files! Start with pages/index.md for the start page. Then run sam-cli minisite to compile it.!
Have fun!
`)
}

export function main() {
    const pages = {};

    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(file);
                continue;
            }

            if (!entry.name.endsWith(".md"))
                continue;

            const route = path
                .relative("pages", file)
                .replace(/\\/g, "/")
                .replace(/\.md$/, "");

            const md = fs.readFileSync(file, "utf8");

            // 👉 HIER passiert die Compilation
            const html = parseMarkdown(md);

            pages[route] = html;
        }
    }

    walk("pages");

    const template = fs.readFileSync("template.html", "utf8");

    const html = template.replace(
        "__PAGES__",
        JSON.stringify(pages)
    );

    const html2 = html.replace(
        "__CSS__{}",
        exportCompressedMarkdownCSS()
    )

    fs.writeFileSync("index.html", html2);

    console.log("compiled", Object.keys(pages).length, "pages");
}
