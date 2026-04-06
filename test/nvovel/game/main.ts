// A empty Project with the Web Framework

import { createCanvas, enableFullscreen, setupFullscreenButton, Texture, setupInput, resetInput, getMouse, startEngine, loadTextureAsync, drawTexture, drawRect, renderText } from "@shadowdara/webgameengine";
import { Vector2d } from "@shadowdara/webgameengine/types"

const { canvas, ctx, applyScaling } = createCanvas({ fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight });
setupInput(canvas);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

let charactertexture: Texture;
let characterpositin: Vector2d = { x: 0, y: 0 }

async function gameStart() {
    // Code which runs at the Game Start

    // Loading the Textures
    charactertexture = await loadTextureAsync("char.png");

    characterpositin.x = (canvas.width / 2) - 640;
    characterpositin.y = (canvas.width/ 5);
}

function gameLoop(dt: number) {
    // Code which runs every Frame

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = getMouse();

    applyScaling();

    // Code comes here

    // Make a white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // drawTexture zeigt magenta, wenn texture fehlt, und loggt Fehler
    drawTexture(ctx, charactertexture, characterpositin.x, characterpositin.y, undefined, undefined, 0, false, false, 1);

    // Draw Dialogue Box
    let dialoguebox = {x: 400, y: 550, width: 700, height: 150 };
    drawRect(ctx, dialoguebox, "black");

    // Render Some Text
    renderText(ctx, "Hallo, ich bin Strichi", 450, 600, "white", "28px Arial");

    resetInput();
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */ }) }, gameLoop);
