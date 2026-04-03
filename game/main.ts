// A mini Snake Clone with my Webframework

import { createCanvas, enableFullscreen, setupFullscreenButton } from "../engine/html";
import { setupInput, isKeyJustPressed, resetInput } from "../engine/input";
import { startEngine } from "../engine/core";
import { renderText } from "../engine/renderer";
import { Vector2d } from "../engine/types/vector2d";
import { dlog } from "../engine/logger";
import { Key } from "../engine/keys";
import { drawTexture, getTexture, Texture, loadTextureAsync } from "../engine/texture";
import { new_buildconfig } from "../engine/build/buildconfig";

// const { canvas, ctx } = createCanvas(800, 800);
const { canvas, ctx, applyScaling } = createCanvas({fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight});
setupInput(canvas);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

let texture: Texture;
let snake: Vector2d[] = [{ x: 10, y: 10 }];
let dir: Vector2d = { x: 1, y: 0 };
let food: Vector2d = { x: 15, y: 10 };
let gridSize = 20;
let lastMove = 0;
let speed = 0.2; // seconds per cell
let start = false;

export function buildconfig() {
    let config = new_buildconfig();
    return config;
}

async function gameStart() {
    dlog("Snake gestartet");

    // Direkt versuchen, Texture zu holen (kann noch undefined sein)
    texture = await loadTextureAsync("init.png");

    dlog("Game Starting finished");
}

function gameLoop(dt: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyScaling(); // 🔥 wichtig!

    if (!start) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderText(ctx, "Snake", 10, 10, "black", "24px Arial");
        renderText(ctx, "Press ESC to start the Game!", 10, 50, "black", "24px Arial");

        if (isKeyJustPressed(Key.Escape)) {
            start = true;
        }

        // Versuche die Texture nochmal zu holen, falls sie jetzt geladen ist
        // texture = getTexture("init.png");

        return;
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // drawTexture zeigt magenta, wenn texture fehlt, und loggt Fehler
    drawTexture(ctx, texture, 50, 50, 100, 100);

    resetInput();

    // ... hier kommt später dein Snake-Movement-Logik
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */}) }, gameLoop);
