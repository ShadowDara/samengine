# Samengine Build Web

Use samengine inside website projects that are built by a web bundler. The
package includes a Vite-compatible plugin for React, Vue, Svelte, Solid, and
plain Vite projects, plus a Next.js config helper.

This package does not replace `samengine-build`. Use `samengine-build` when you
want a complete samengine game project with generated HTML, start screen, local
server, and release export. Use `samengine-build-web` when a website framework
already owns the page and build process.

The optional HTML export adapter comes from `samengine-build` itself. This
package adapts it for website projects instead of copying the start screen,
settings menu, fullscreen button, and single-file export logic. Projects that do
not import `samengine-build-web/html` do not need `samengine-build` at runtime.

## Installation

```bash
npm install samengine samengine-build-web
```

For Vite projects, Vite is provided by your framework template.

## Vite Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { samengineWeb } from "samengine-build-web/vite";

export default defineConfig({
  plugins: [
    samengineWeb(),
  ],
});
```

The plugin scans a `resources` folder in your website root and exposes it during
development and production builds.

```text
resources/
  player.png
src/
  game.ts
  App.tsx
```

## Next.js Setup

```js
// next.config.mjs
import { withSamengine } from "samengine-build-web/next";

export default withSamengine({
  // your normal Next.js config
});
```

The Next.js helper copies `resources` to `public/samengine/resources` and maps
`samengine-build-web/resources` to a generated manifest module.

A more complete Next.js App Router example:

```js
// next.config.mjs
import { withSamengine } from "samengine-build-web/next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default withSamengine(nextConfig, {
  resourcesDir: "resources",
  resourceBase: "samengine/resources",
  outResourcesDir: "samengine/resources",
});
```

```tsx
// app/game/page.tsx
import SamengineGame from "./SamengineGame";

export default function GamePage() {
  return <SamengineGame />;
}
```

```tsx
// app/game/SamengineGame.tsx
"use client";

import { useEffect, useRef } from "react";
import { drawRect, startEngine } from "samengine";
import { getResource } from "samengine-build-web/resources";

export default function SamengineGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 450;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const playerUrl = getResource("player.png");
    console.log("Samengine resource:", playerUrl);

    let x = 20;

    startEngine(
      () => {},
      (dt) => {
        x += 120 * dt;
        if (x > 800) x = -60;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRect(ctx, { x, y: 190, width: 60, height: 60 }, "#22c55e");
      },
    );
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        maxWidth: 800,
        aspectRatio: "16 / 9",
        background: "#111827",
      }}
    />
  );
}
```

```ts
// types/samengine-resources.d.ts
declare module "virtual:samengine/resources" {
  const resources: Record<string, string>;
  export default resources;
  export function getResource(path: string): string | null;
  export function loadResource(path: string): string | null;
}
```

For Next.js, declare the Next-friendly resource module instead:

```ts
// types/samengine-resources.d.ts
declare module "samengine-build-web/resources" {
  const resources: Record<string, string>;
  export default resources;
  export function getResource(path: string): string | null;
  export function loadResource(path: string): string | null;
}
```

Next.js does not have one universal plugin API like Vite. Many Next packages are
configuration wrappers around `next.config`, for example `withMDX(...)` or
bundle analyzer helpers. This package follows that same pattern with
`withSamengine(...)`. It currently integrates through Next's webpack config, so
projects that rely only on Turbopack may need a dedicated Turbopack adapter
later.

Static generation works with this setup. Next.js can pre-render the page and the
`<canvas>` element as normal HTML; samengine starts later in the browser inside
`useEffect`. Use `dynamic(..., { ssr: false })` only when your own game module
touches `window`, `document`, `requestAnimationFrame`, or canvas APIs at module
top level during import.

## Importing Resources

Import the virtual resource manifest from any framework component or game entry:

```ts
import resources, { getResource } from "virtual:samengine/resources";

console.log(resources["player.png"]);
console.log(getResource("player.png"));
```

## Export HTML Adapter

Use the HTML adapter when a website build still wants the same generated page as
`samengine-build`.

Install `samengine-build` only in projects that use this adapter:

```bash
npm install -D samengine-build
```

```ts
import { createSamengineExportHtml } from "samengine-build-web/html";

const html = createSamengineExportHtml({
  release: true,
  config: {
    title: "My Website Game",
    description: "A samengine game inside a website build",
    gameauthor: "Shadowdara",
    entryname: "assets/game.js",
  },
});
```

For single-file exports, pass the already bundled JavaScript and optional
embedded resources:

```ts
import { createSamengineExportHtml } from "samengine-build-web/html";

const html = createSamengineExportHtml({
  release: true,
  singlefile: true,
  bundledJsContent: bundledGameCode,
  resources: {
    "player.png": "data:image/png;base64,...",
  },
  config: {
    title: "Single File Game",
  },
});
```

Frameworks such as Next.js should usually keep their own document shell and use
samengine inside a client component. The export HTML adapter is best for static
game pages, custom build scripts, or Vite/Rollup pipelines where samengine owns
the whole page.

The values are browser URLs, so they can be passed to samengine loaders or used
with normal browser APIs.

```ts
import { loadTextureAsync } from "samengine";
import { getResource } from "virtual:samengine/resources";

const playerUrl = getResource("player.png");

if (playerUrl) {
  await loadTextureAsync("player", playerUrl);
}
```

## React, Vue, Svelte

Let your framework decide where the canvas lives. Samengine can still create its
own canvas, or your game code can receive a canvas element from the component.

```ts
import { createCanvas, startEngine } from "samengine";

const { ctx, applyScaling } = createCanvas({
  fullscreen: true,
  scaling: "fit",
  virtualWidth: 800,
  virtualHeight: 450,
});

startEngine(
  () => {},
  () => {
    applyScaling();
    ctx.clearRect(0, 0, 800, 450);
  },
);
```

## Options

```ts
samengineWeb({
  resourcesDir: "resources",
  resourceBase: "samengine/resources",
  outResourcesDir: "samengine/resources",
  resourceManifestModule: "virtual:samengine/resources",
  copyResources: true,
});
```

- `resourcesDir`: source folder relative to the website root.
- `resourceBase`: public URL prefix for resource URLs.
- `outResourcesDir`: output folder in the final website build.
- `resourceManifestModule`: virtual module id for resource imports.
- `copyResources`: set to `false` when another plugin already copies assets.

## TypeScript Virtual Module

If TypeScript does not know the virtual module yet, add a declaration file:

```ts
// src/vite-env.d.ts
declare module "virtual:samengine/resources" {
  const resources: Record<string, string>;
  export default resources;
  export function getResource(path: string): string | null;
  export function loadResource(path: string): string | null;
}
```
