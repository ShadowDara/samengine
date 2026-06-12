# Samengine Build

Build, export, and development-server tooling for games built with
[samengine](https://github.com/ShadowDara/samengine).

The package provides the `samengine-build` CLI. It bundles the code from the
`game` folder, generates a playable `index.html`, copies or embeds assets from
`resources`, and starts a local development server with automatic rebuilds in
development mode.

## What This Package Does

- Creates new game projects with `--new` or `--new-empty`.
- Loads `samengine.config.ts` and uses it as the source of truth for build
  options.
- Bundles the game entry from `game/<entryname>` with esbuild.
- Generates the HTML start page with title, description, author, version,
  optional fullscreen button, optional settings menu, and Markdown notes.
- Copies resources from `resources` to `dist/resources` in normal multi-file
  builds.
- Can embed used resources directly into the generated HTML as Data URIs in
  single-file mode.
- Minifies release builds.
- Starts a local HTTP server in development mode and rebuilds when files in
  `game`, `resources`, or `samengine.config.ts` change.

## Installation

```bash
npm install samengine samengine-build
```

Add these scripts to the `package.json` of your game project:

```json
{
  "scripts": {
    "dev": "samengine-build",
    "build": "samengine-build --release"
  }
}
```

You can also run the CLI directly with `npx samengine-build`.

## Project Structure

```text
game/
  main.ts              Game entry point
resources/
  ...                  Images, audio, JSON, and other assets
samengine.config.ts    Build configuration
dist/
  index.html           Generated build output
  main.js              Bundled game, except in single-file mode
```

## CLI

```bash
samengine-build
```

Runs a development build, writes `dist/index.html`, starts the development
server, and watches project files.

```bash
samengine-build --release
```

Runs a release build. The output directory is recreated, JavaScript and HTML are
minified, and no development server is started.

```bash
samengine-build --new MyGame
```

Creates a new project with an example game.

```bash
samengine-build --new-empty MyGame
```

Creates a new project with an empty starter game.

## Configuration

A typical `samengine.config.ts` looks like this:

```ts
import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
  const config = new_buildconfig();
  config.title = "My Game";
  config.description = "Short game description";
  config.gameauthor = "Your Name";
  return config;
}
```

Important options:

- `title`: Browser title and start-screen title.
- `description`: Description shown on the start screen.
- `version`: Game version shown on the start screen.
- `entryname`: Entry file inside the `game` folder, defaults to `main`.
- `outdir`: Build output folder, defaults to `dist`.
- `show_fullscreen_button`: Adds a fullscreen button to the generated page.
- `enable_audio`: Unlocks the browser AudioContext after the start click.
- `markdown_notes`: Shows collapsible Markdown notes before the game starts.
- `htmlMenu`: Configures an optional settings menu.
- `devMode.singlefile`: Generates a single HTML file in development mode.
- `releaseMode.singlefile`: Generates a single HTML file in release mode.
- `dev_server_port`: Initial port for the local development server.

## Single-File Builds

When `devMode.singlefile` or `releaseMode.singlefile` is enabled, the tool reads
the bundled JavaScript and scans the `resources` folder. Assets whose filename or
relative path appears in the bundle are written into the HTML file as Base64
Data URIs. In the browser, they are available through `window.__getResource(path)`
and `window.__loadResource(path)`.

## Code Exports

The main package entry exports build types and factory functions:

```ts
import {
  new_buildconfig,
  newHTMLMenu,
  newMarkdownStyle,
  type buildconfig,
} from "samengine-build";
```

Additional utilities are available from `samengine-build/utils`:

```ts
import { compressHTML } from "samengine-build/utils";
```

## Vite Adapter

Vite projects can use the samengine start page directly through the Vite plugin:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { samengineVite } from "samengine-build/vite";

export default defineConfig({
  plugins: [samengineVite()],
});
```

Keep the normal Vite module script in `index.html`:

```html
<script type="module" src="/src/main.ts"></script>
```

The plugin replaces `index.html` with the samengine page, keeps Vite in charge
of dev mode and production bundling, and loads the game entry after the start
button is clicked. You can pass a config object if you want to reuse samengine
page settings:

```ts
import { defineConfig } from "vite";
import { new_buildconfig } from "samengine-build";
import { samengineVite } from "samengine-build/vite";

const samengine = new_buildconfig();
samengine.title = "My Vite Game";

export default defineConfig({
  plugins: [samengineVite({ config: samengine })],
});
```

Learn more about samengine on
[GitHub](https://github.com/ShadowDara/samengine) or
[NPM](https://www.npmjs.com/package/samengine).
