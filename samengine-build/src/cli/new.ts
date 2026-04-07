import path from "path";
import { writeFile, mkdir } from "fs/promises";
import chalk from 'chalk';

import { flog } from "../buildhelper.js";

// ================= NEW PROJECT =================
export async function createProject(name: string, empty: boolean) {
    flog(`📦 Erstelle neues Projekt: ${name}`);

    // Create Dirs
    await mkdir("game", { recursive: true });
    await mkdir("resources", { recursive: true });
    await mkdir("dist", { recursive: true });

    let content = `
// A empty Project with the Web Framework

import { createCanvas, enableFullscreen, setupFullscreenButton } from "@shadowdara/webgameengine";
import { setupInput, resetInput, getMouse } from "@shadowdara/webgameengine";
import { startEngine } from "@shadowdara/webgameengine";

const { canvas, ctx, applyScaling } = createCanvas({fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight});
setupInput(canvas);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

async function gameStart() {
    // Code which runs at the Game Start
}

function gameLoop(dt: number) {
    // Code which runs every Frame

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mouse = getMouse();

    applyScaling();

    resetInput();
}

// Because start Game is Async
startEngine(() => { gameStart().then(() => {/* ready */}) }, gameLoop);
`;

    if (empty) {
        content =`
// A mini Snake Clone with my Webframework

import { createCanvas } from "@shadowdara/webgameengine";
import { setupInput, isKeyJustPressed, resetInput } from "@shadowdara/webgameengine";
import { startEngine } from "@shadowdara/webgameengine";
import { renderText } from "@shadowdara/webgameengine";
import { Vector2d } from "@shadowdara/webgameengine/types";
import { dlog } from "@shadowdara/webgameengine";
import { Key } from "@shadowdara/webgameengine";

const { canvas, ctx } = createCanvas({fullscreen: true, scaling: "fit", virtualWidth: window.innerWidth, virtualHeight: window.innerHeight});
setupInput(canvas);

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
                dlog(\`Game Over! Highscore: \${snake.length - 1}\`);
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
`
    }

    // Basic game entry
    await writeFile(
        path.join("game", "main.ts"), content);

    // Config
    await writeFile(
        path.join("webgameengine.config.ts"),
`
// Project File for the Game

import type { buildconfig } from "@shadowdara/webgameengine/build";
import { new_buildconfig } from "@shadowdara/webgameengine/build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    return config;
}
`
    );

    // package.json
    // await writeFile(
    //     path.join(base, "package.json"),
    //     JSON.stringify(
    //         {
    //             name,
    //             version: "1.0.0",
    //             type: "module",
    //             scripts: {
    //                 dev: "mycli",
    //                 build: "mycli --release",
    //             },
    //         },
    //         null,
    //         2
    //     )
    // );

    flog("✅ Projekt created!");
    // flog(`👉 cd ${name}`);
    // flog(`👉 npm install`);
    // flog(`👉 npm run dev`);
    console.log(`Add to your package.json file:

  "scripts": {
    "dev": "npx webgameengine",
    "build": "npx webgameengine --release"
  },

Run "npm run dev" to start the Dev Server and play a little Snake Clone

Add ".webgameengine/config.mjs" to your gitignore file if you are using Git.

${chalk.red("Dont ignore the complete Folder!")}
${chalk.red("Some Tools by webgameengine are saving important configs in this Folder!")}
`);

    process.exit(0);
}
