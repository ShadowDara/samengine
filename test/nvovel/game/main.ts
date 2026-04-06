// A empty Project with the Web Framework

import { createCanvas, enableFullscreen, setupFullscreenButton, Texture, setupInput, resetInput, getMouse, startEngine, loadTextureAsync, drawTexture, drawRect, renderText } from "@shadowdara/webgameengine";
import { makeRect, makeVector2d, Vector2d } from "@shadowdara/webgameengine/types"

const { canvas, ctx, applyScaling, virtualWidth, virtualHeight } = createCanvas({ fullscreen: true, scaling: "fit", virtualWidth: 1920, virtualHeight: 1080 });
setupInput(canvas, virtualWidth, virtualHeight);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

let charactertexture: Texture;
let characterpositin: Vector2d = makeVector2d(0, 0);

async function gameStart() {
    // Code which runs at the Game Start

    // Loading the Textures
    charactertexture = await loadTextureAsync("char.png");

    characterpositin.x = 120;
    characterpositin.y = 400;
}

function gameLoop(dt: number) {
    // Code which runs every Frame

    // Clear the physical canvas FIRST before applying scaling
    ctx.clearRect(0, 0, virtualWidth, virtualHeight);

    applyScaling();

    const mouse = getMouse();

    // Code comes here

    // Make a white background
    drawRect(ctx, makeRect(0, 0, virtualWidth, virtualHeight), "white");

    // Debug Info
    renderText(ctx, `Width: ${virtualWidth} - Height: ${virtualHeight}`, 0, 0, "black", "20px Arial");

    // drawTexture zeigt magenta, wenn texture fehlt, und loggt Fehler
    drawTexture(ctx, charactertexture, characterpositin.x, characterpositin.y, undefined, undefined, 0, false, false, 1.5);

    // Draw Dialogue Box
    let dialoguebox = { x: 500, y: 850, width: 920, height: 150 };
    drawRect(ctx, dialoguebox, "black");

    // Render Some Text
    renderText(ctx, "Hallo, ich bin Strichi", 550, 900, "white", "28px Arial");

    resetInput();
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */ }) }, gameLoop);
