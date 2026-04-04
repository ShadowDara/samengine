# WebGameEngine 🎮

A lightweight, TypeScript-first web game engine framework for building 2D games.

## Features

- 🎯 Simple game loop management
- 🎨 Rendering system with text and sprite support
- ⌨️ Input handling (keyboard & mouse)
- 📦 TypeScript support out of the box
- 🛠️ Build tools included
- 📝 Logging utilities
- 💾 Save/Load system

## Installation

```bash
npm install @shadowdara/webgameengine
```

## Quick Start

### Basic Game Loop

```typescript
import { startEngine, setupInput, dlog, renderText } from '@shadowdara/webgameengine';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

setupInput(canvas, 800, 600);

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

```bash
npx webgameengine                   # Build main game
npx webgameengine --release         # Production build
```

### Configuration

Edit `webgameengine.config.ts` to configure your game:

```typescript
import { defineConfig } from '@shadowdara/webgameengine/build';

export function defineConfig() {
  return {
    entryname: 'main.ts',
    outdir: 'dist',
    // ... other config
  };
}
```

or

```typescript
// Project File for the Game

import { type buildconfig, new_buildconfig } from "@shadowdara/webgameengine/build";

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
- `dlog()` - Development logging
- `startEngine()` - Manage game loop

## License

MIT
