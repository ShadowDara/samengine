import fs from "fs";
import path from "path";
import { parseMarkdown, exportCompressedMarkdownCSS } from "../index.js";

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
        "__CSS__ {}",
        exportCompressedMarkdownCSS()
    )

    fs.writeFileSync("index.html", html2);

    console.log("compiled", Object.keys(pages).length, "pages");
}
