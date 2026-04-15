# Samengine 🎮

A lightweight, TypeScript-first web game engine framework for building
2D games *and maybe 3D Games in the Future*.


## Features

- 🎯 Simple game loop management
- 🎨 Rendering system with text and sprite support
- ⌨️ Input handling (keyboard & mouse)
- 📦 TypeScript support out of the box
- 🛠️ Build tools included
- 📝 Logging utilities
- 💾 Save/Load system


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


### Configuration

Edit `samengine.config.ts` to configure your game:

```typescript
import { defineConfig } from 'samengine-build';

export function defineConfig() {
  return {
    entryname: 'main',
    outdir: 'dist',
    // ... other config
  };
}
```

or

```typescript
// Project File for the Game

import { type buildconfig, new_buildconfig
} from "samengine-build";

export function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    return config;
}
```


## API Reference


### Core Engine
- `startEngine(init, gameLoop)` - Initialize game loop


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

<!--

IDEAS

- SVG Generator

-->
