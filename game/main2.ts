// A mini Snake Clone with my Webframework

import { createCanvas } from "../engine/html";
import { setupInput, isKeyJustPressed, resetInput } from "../engine/input";
import { startEngine } from "../engine/core";
import { renderText } from "../engine/renderer";
import { Vector2 } from "../engine/types/vector2d";
import { dlog } from "../engine/logger";
import { Key } from "../engine/keys";

const { canvas, ctx } = createCanvas(400, 400);
setupInput(canvas);

let snake: Vector2[] = [{ x: 10, y: 10 }];
let dir: Vector2 = { x: 1, y: 0 };
let food: Vector2 = { x: 15, y: 10 };
let gridSize = 20;
let lastMove = 0;
let speed = 0.2; // seconds per cell
let start = false;

function gameStart() {
    dlog("Snake gestartet");
}

function gameLoop(dt: number) {
    if (!start) {
        renderText(ctx, "Snake", 10, 10, "black", "24px Arial");
        renderText(ctx, "Press ESC to start the Game!", 10, 50, "black", "24px Arial");

        if (isKeyJustPressed(Key.Escape)) {
            start = true;
        }

        return;
    }

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

    resetInput();
}

startEngine(gameStart, gameLoop);
