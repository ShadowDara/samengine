
// A mini Snake Clone with my Webframework

import { createCanvas, enableFullscreen, setupFullscreenButton, getMouse } from "samengine";
import { setupInput, isKeyJustPressed, resetInput } from "samengine";
import { startEngine } from "samengine";
import { renderText } from "samengine";
import { Vector2d } from "samengine/types";
import { dlog } from "samengine";
import { Key } from "samengine";

const { canvas, ctx, applyScaling, virtualWidth, virtualHeight } = createCanvas({fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight});
setupInput(canvas, virtualWidth, virtualHeight);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

let snake: Vector2d[] = [{ x: 10, y: 10 }];
let dir: Vector2d = { x: 1, y: 0 };
let food: Vector2d = { x: 15, y: 10 };
let gridSize = 20;
let lastMove = 0;
let speed = 0.2; // seconds per cell
let start = false;

async function gameStart() {
    dlog("Snake gestartet");
}

function gameLoop(dt: number) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = getMouse();

    applyScaling();

    if (isKeyJustPressed(Key.Escape)) {
        start = !start
    }

    if (!start) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderText(ctx, "Snake", 10, 10, "black", "24px Arial");
        renderText(ctx, "Press ESC to start or Pause the Game!", 10, 50, "black", "24px Arial");

        // return;
    } else {

        // Input
        if (isKeyJustPressed(Key.ArrowUp) && dir.y === 0) dir = { x: 0, y: -1 };
        if (isKeyJustPressed(Key.ArrowDown) && dir.y === 0) dir = { x: 0, y: 1 };
        if (isKeyJustPressed(Key.ArrowLeft) && dir.x === 0) dir = { x: -1, y: 0 };
        if (isKeyJustPressed(Key.ArrowRight) && dir.x === 0) dir = { x: 1, y: 0 };

        lastMove += dt;

        if (lastMove >= speed) {
            lastMove = 0;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            // Kollision mit Walls
            if (head.x < 0 || head.y < 0 || head.x >= canvas.width / gridSize || head.y >= canvas.height / gridSize) {
                snake = [{ x: 10, y: 10 }];
                dir = { x: 1, y: 0 };
                dlog("Game Over");
                return;
            }

            // Kollision mit sich selbst
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                snake = [{ x: 10, y: 10 }];
                dir = { x: 1, y: 0 };
                dlog(`Game Over! Highscore: ${snake.length - 1}`);
                return;
            }

            snake.unshift(head);

            // Food Check
            if (head.x === food.x && head.y === food.y) {
                food = { x: Math.floor(Math.random() * (canvas.width / gridSize)), y: Math.floor(Math.random() * (canvas.height / gridSize)) };
            } else {
                snake.pop();
            }
        }

        // Zeichnen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "green";
        snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize, gridSize));

        ctx.fillStyle = "red";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

        renderText(ctx, "Score: " + (snake.length - 1), 10, 10, "yellow", "24px Arial");
    }

    // Reset Input
    resetInput();
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */}) }, gameLoop);
