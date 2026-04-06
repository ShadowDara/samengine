// A mini Snake Clone with my Webframework

import { createCanvas, enableFullscreen, setupFullscreenButton } from "@shadowdara/webgameengine";
import { setupInput, isKeyJustPressed, resetInput, getMouse } from "@shadowdara/webgameengine";
import { startEngine } from "@shadowdara/webgameengine";
import { renderText } from "@shadowdara/webgameengine";
import { Vector2d } from "@shadowdara/webgameengine/types";
import { dlog } from "@shadowdara/webgameengine";
import { Key } from "@shadowdara/webgameengine";
import { drawTexture, getTexture, Texture, loadTextureAsync } from "@shadowdara/webgameengine";
import { isRectClicked, Rect } from "@shadowdara/webgameengine/types";

// const { canvas, ctx } = createCanvas(800, 800);
const { canvas, ctx, applyScaling, virtualWidth, virtualHeight } = createCanvas({fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight});
setupInput(canvas, virtualWidth, virtualHeight);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

let texture: Texture;
let snake: Vector2d[] = [ { x: 10, y: 10 } ];
let dir: Vector2d = { x: 1, y: 0 };
let food: Vector2d = { x: 15, y: 10 };
let gridSize = 20;
let lastMove = 0;
let speed = 0.2; // seconds per cell
let start = false;

async function gameStart() {
    dlog("Snake gestartet");

    texture = await loadTextureAsync("init.png");

    dlog("Game Starting finished");
}

function gameLoop(dt: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = getMouse();

    applyScaling(); // 🔥 wichtig!

    if (!start) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ctx.fillStyle = "black";
        // ctx.fillRect(0, 0, 100, 100);

        let rect: Rect = {x: 0, y: 0, width: 100, height: 100};
        if (isRectClicked(mouse, rect)) {
            dlog("Click Works");
            // alert("Clicked");
        }

        renderText(ctx, "Snake", 10, 10, "black", "24px Arial");
        renderText(ctx, "Press ESC to start the Game!", 10, 50, "black", "24px Arial");

        if (isKeyJustPressed(Key.Escape)) {
            start = true;
        }

        // Versuche die Texture nochmal zu holen, falls sie jetzt geladen ist
        // texture = getTexture("init.png");
    } else {

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // drawTexture zeigt magenta, wenn texture fehlt, und loggt Fehler
        drawTexture(ctx, texture, 50, 50, 100, 100);

    }

    resetInput();
    // ... hier kommt später dein Snake-Movement-Logik
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */}) }, gameLoop);
