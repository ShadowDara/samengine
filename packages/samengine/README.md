# Samengine 🎮

[![Build Packages Test](https://github.com/ShadowDara/samengine/actions/workflows/package-build-test.yml/badge.svg)](https://github.com/ShadowDara/samengine/actions/workflows/package-build-test.yml)
[![Tauri Release (Webtools Desktop)](https://github.com/ShadowDara/samengine/actions/workflows/tauri-release.yml/badge.svg)](https://github.com/ShadowDara/samengine/actions/workflows/tauri-release.yml)
[![Release Samtool](https://github.com/ShadowDara/samengine/actions/workflows/release-samtool.yml/badge.svg)](https://github.com/ShadowDara/samengine/actions/workflows/release-samtool.yml)

A lightweight, TypeScript-first web game engine framework for building
2D games *and maybe 3D Games in the Future*.


<!--$$MD_INDEX_START$$-->
<!-- 
    Index by Automatic MD Index
    a simple Tool to Index your Markdown files like this

    More Infos:
    https://github.com/ShadowDara/automatic-md-index

    DO NOT REMOVE THIS CREDIT !!!

    Last Update Time of the Index: 
-->

## Index
  - [Features](#features)
  - [Info](#info)
  - [Quick Start](#quick-start)
    - [Basic Game Loop](#basic-game-loop)
  - [Development & Building](#development-building)
    - [Using Bun (local development)](#using-bun-local-development)
  - [Config](#config)
  - [API Reference](#api-reference)
    - [Core Engine](#core-engine)
    - [Rendering](#rendering)
    - [Input System](#input-system)
    - [Types](#types)
    - [Utilities](#utilities)
  - [License](#license)
  - [More Addons in the Game Library](#more-addons-in-the-game-library)
  - [More Tools for samengine and Game Making by me lol](#more-tools-for-samengine-and-game-making-by-me-lol)
  - [Commit Tags](#commit-tags)
<!-- Index by Automatic MD Index -->
<!--$$MD_INDEX_END$$-->


## Features

- 🎯 Simple game loop management
- 🎨 Rendering system with text and sprite support
- ⌨️ Input handling (keyboard & mouse)
- 📦 TypeScript support out of the box
- 🛠️ Build tools included
- 📝 Logging utilities
- 💾 Save/Load system


## Info

For better Infos read the [Docs](samengine.vercel.app/docs)


## Quick Start

```sh
# Make sure both of them have the same Version

npm init
npm install samengine
npm install samengine-build
npx samengine-build --new
npx samengine-build
```


### Basic Game Loop

```typescript
import { startEngine, setupInput, dlog, renderText
} from 'samengine';

const { canvas, ctx, applyScaling, virtualWidth, virtualHeight

} = createCanvas({ fullscreen: true, scaling: "fit",
virtualWidth: 1920, virtualHeight: 1080 });
setupInput(canvas, virtualWidth, virtualHeight);

function init() {
  dlog('🎮 Game initialized!');
}

function gameLoop(dt: number) {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Your game logic here
  renderText(ctx, `FPS: ${(1 / dt).toFixed(0)}`, 10, 20);
}

startEngine(init, gameLoop);
```


## Development & Building


### Using Bun (local development)

```sh
npx samengine-build                       # Start Dev Server
npx samengine-build --release             # Production build
npx samengine-build --new (newproject)    # Create a new project with a
                                          # simple Snake Clone as Template
npx samengine-build --new-empty (new)     # Create a new empty project
```

## Config

```typescript
// Project File for the Game

import { type buildconfig, new_buildconfig
} from "samengine-build";

export function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    return config;
}
```


## Svelte Adapter

SamEngine can be used directly inside Svelte/SvelteKit projects via the
`samengine/svelte` entry point, without depending on generated HTML or
`window.__GAMESETTINGS__`.

```svelte
<script lang="ts">
    import { onMount } from "svelte";
    import { SamEngine, getGameSetting, setGameSetting } from "samengine/svelte";

    let canvas: HTMLCanvasElement;
    let cards = "8";

    onMount(() => {
        const engine = new SamEngine({
            canvas,
            settings: { cards },
            update: (dt) => {
                const cardCount = Number(getGameSetting("cards", "8"));
                // ... draw the frame using engine.ctx ...
            },
        });

        engine.start();

        // Runs on unmount - stops the game loop and removes every
        // keyboard/mouse/wheel/resize listener the engine installed.
        return () => engine.destroy();
    });

    function changeCards(value: string) {
        cards = value;
        setGameSetting("cards", value);
    }
</script>

<select value={cards} onchange={(e) => changeCards(e.currentTarget.value)}>
    <option value="4">4</option>
    <option value="8">8</option>
    <option value="16">16</option>
    <option value="32">32</option>
</select>

<canvas bind:this={canvas}></canvas>
```

Notes:

- Always construct `SamEngine` inside `onMount()` (or after mount). It
  throws if created during server-side rendering, so SvelteKit stays safe.
- `svelte` is an optional peer dependency - projects that only use the HTML
  build do not need to install it.
- Settings read through `getGameSetting`/`getGameSettings` work the same way
  in the HTML build and in Svelte; only Svelte needs `SamEngine`, the
  Settings Runtime itself is framework-agnostic Core API.
- `engine.destroy()` is idempotent and safe to call from cleanup functions
  even if the component unmounts before `start()` was ever called.


## API Reference


### Core Engine
- `startEngine(init, gameLoop)` - Initialize game loop
- `stopEngine()` - Stop the currently running game loop
- `isEngineRunning()` - Whether a game loop is currently running


### Settings Runtime
- `setGameSettings(settings)` / `getGameSettings()` - Replace/read all settings
- `setGameSetting(id, value)` / `getGameSetting(id, fallback?)` - Read/write a single setting
- `onGameSettingsChange(listener)` - Subscribe to settings changes
- Replaces direct reads of `window.__GAMESETTINGS__` in game code; the HTML
  adapter's `bridgeLegacyGameSettings()` keeps the legacy global in sync for
  existing single-file builds


### Svelte Adapter (`samengine/svelte`)
- `new SamEngine({ canvas, update, setup?, settings?, ... })` - Binds an existing canvas and wires up input
- `engine.start()` / `engine.stop()` / `engine.destroy()` - Lifecycle, matching `onMount`/cleanup
- `engine.requestFullscreen()` - Toggle fullscreen for the bound canvas
- `engine.input` - `getMouse`, `isKeyPressed`, `isKeyJustPressed`, `isKeyJustReleased`
- Re-exports the Settings Runtime and `Key` enum for convenience


### Rendering
- `renderText(ctx, text, x, y, color?, font?)` - Render text
- `renderBitmapText()` - Render bitmap font text


### Input System
- `setupInput(canvas, width?, height?)` - Initialize input
- `getKeyState(key)` - Check key state
- Mouse state available via input module


### Types
- `Vector2D` / `Vector3D` - Vector mathematics
- `Color` - Color management
- `Rect` - Rectangle collision
- Math utilities for game logic


### Utilities
<!-- - `dlog()` - Development logging -->
- `startEngine()` - Manage game loop


## License

MIT


## More Addons in the Game Library

- a Full Markdown Parser *(maybe for notes or easy docs, feel free to use)*
- a JSON with Comments Parser

*(I dont now why i added this)*


## More Tools for samengine and Game Making by me lol

- [samengine-build](https://www.npmjs.com/package/samengine-build)
- [samengine-cli](https://www.npmjs.com/package/samengine-cli)
- [old deprecated npm package](https://www.npmjs.com/package/@shadowdara/webgameengine)
- [linksaver](https://github.com/shadowdara/linksaver)


## Commit Tags

The tags which are ending with `-build` are for the `samengine-build` Tool and the
which end with `-cli` are for the `samengine-cli` package.


# Samengine CLI Tools

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
npm install samengine
```

Add these scripts to the `package.json` of your game project:

```json
{
  "scripts": {
    "dev": "samengine",
    "build": "samengine --release"
  }
}
```

You can also run the CLI directly with `npx samengine`.

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
samengine
```

Runs a development build, writes `dist/index.html`, starts the development
server, and watches project files.

```bash
samengine --release
```

Runs a release build. The output directory is recreated, JavaScript and HTML are
minified, and no development server is started.

```bash
samengine --new MyGame
```

Creates a new project with an example game.

```bash
samengine --new-empty MyGame
```

Creates a new project with an empty starter game.

## Configuration

A typical `samengine.config.ts` looks like this:

```ts
import type { buildconfig } from "samengine/config";
import { new_buildconfig } from "samengine/config";

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
} from "samengine/config";
```

Additional utilities are available from `samengine/nonbrowser`:

```ts
import { compressHTML } from "samengine/nonbrowser";
```

Learn more about samengine on
[GitHub](https://github.com/ShadowDara/samengine) or
[NPM](https://www.npmjs.com/package/samengine).


## Project Templates

Project Templates can be found [here](https://github.com/ShadowDara/samengine-project-templates)

## Webtools

- releases are made on tags which are starting with `webtools-v*`

## IGN

Git ignore Adder Infos are [here](crates/easy-git-ignore/README.md)


<!--

IDEAS

- SVG Generator

-->
