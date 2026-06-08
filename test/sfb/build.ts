import fs from "fs";
import esbuild from "esbuild";
import { render } from "./runtime";

async function build() {
  // 1. Browser bundle
  await esbuild.build({
    entryPoints: ["game/main.tsx"],
    bundle: true,
    outfile: "dist/app.js",
    format: "iife",
    platform: "browser",

    jsx: "automatic",
    jsxFactory: "jsx",
    jsxFragment: "Fragment",
  });

  // ❌ KEIN import mehr!
  const { default: App } = await import("./game/main.tsx");
  const app = App();

  const js = fs.readFileSync("dist/app.js", "utf-8");

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mini SSG</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
    .app { border: 1px solid #ddd; padding: 12px; }
    button { margin-top: 10px; padding: 8px 12px; }
  </style>
</head>
<body>
  ${render(app)}

  <script>
  ${js}
  </script>
</body>
</html>
`;

  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync("dist/index.html", html);

  console.log("✅ built dist/index.html");
}

build();
