import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import esbuild from "esbuild";
import { render } from "./runtime";

async function build() {
  // console.log("Run build");

  fs.mkdirSync("dist", { recursive: true });

  const ssrFile = path.resolve("dist/ssr.mjs");
  await esbuild.build({
    entryPoints: ["game/main.tsx"],
    bundle: true,
    outfile: ssrFile,
    format: "esm",
    platform: "browser",
    jsx: "transform",
    jsxFactory: "jsx",
    jsxFragment: "Fragment",
  });

  // console.log("After esbuild");

  const { default: App } = await import(pathToFileURL(ssrFile).href);
  console.log("App imported");

  const app = App();
  console.log("App rendered");

  const html = await minifyHtml(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mini SSG</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .app { border: 1px solid #ddd; padding: 12px; }
    textarea { box-sizing: border-box; min-height: 160px; width: 100%; }
    #markdown-preview { border-top: 1px solid #ddd; margin-top: 16px; padding-top: 16px; }
    button { margin-top: 10px; padding: 8px 12px; }
  </style>
</head>
<body>
  ${render(app)}
</body>
</html>
`);

  fs.writeFileSync("dist/index.html", html);
  fs.rmSync("dist/app.js", { force: true });
  // fs.rmSync(ssrFile, { force: true });

  console.log("built dist/index.html");
}

build();

async function minifyHtml(html: string) {
  const blocks: string[] = [];

  function keep(block: string) {
    const token = `__SAMENGINE_KEEP_${blocks.length}__`;
    blocks.push(block);
    return token;
  }

  html = await minifyBlocks(
    html,
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    async (attrs, code) => {
      const result = await esbuild.transform(code, {
        loader: "js",
        minify: true,
        target: "es2018",
      });

      return keep(`<script${attrs}>${result.code.trim()}</script>`);
    },
  );

  html = await minifyBlocks(
    html,
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    async (attrs, css) => {
      const result = await esbuild.transform(css, {
        loader: "css",
        minify: true,
      });

      return keep(`<style${attrs}>${result.code.trim()}</style>`);
    },
  );

  html = html.replace(
    /<(textarea|pre|code)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match) => keep(match),
  );

  html = html
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();

  blocks.forEach((block, index) => {
    html = html.replace(`__SAMENGINE_KEEP_${index}__`, block);
  });

  return html;
}

async function minifyBlocks(
  html: string,
  pattern: RegExp,
  minify: (attrs: string, content: string) => Promise<string>,
) {
  let output = "";
  let lastIndex = 0;

  for (const match of html.matchAll(pattern)) {
    output += html.slice(lastIndex, match.index);
    output += await minify(match[1], match[2]);
    lastIndex = match.index! + match[0].length;
  }

  return output + html.slice(lastIndex);
}
