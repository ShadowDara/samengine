// A empty Project with the Web Framework

import {
    createCanvas,
    enableFullscreen,
    setupFullscreenButton,
    Texture,
    setupInput,
    resetInput,
    getMouse,
    startEngine,
    loadTextureAsync,
    drawTexture,
    drawRect,
    renderText,
    isKeyPressed,
    Key,
    drawCircle
} from "samengine";

import { makeCircle, makeRect } from "samengine/types";

const { canvas, ctx, applyScaling, virtualWidth, virtualHeight } = createCanvas({
    fullscreen: true,
    scaling: "fit",
    virtualWidth: 1920,
    virtualHeight: 1080
});

setupInput(canvas, virtualWidth, virtualHeight);

enableFullscreen(canvas);
setupFullscreenButton(canvas);

// ======================
// 🏓 GAME STATE
// ======================

let ball = {
    x: 0,
    y: 0,
    vx: 600,
    vy: 300,
    r: 12
};

let paddleLeft = {
    x: 40,
    y: 0,
    w: 20,
    h: 140,
    speed: 800
};

let paddleRight = {
    x: 0,
    y: 0,
    w: 20,
    h: 140,
    speed: 800
};

let scoreLeft = 0;
let scoreRight = 0;

// ======================
// 🚀 INIT
// ======================

async function gameStart() {
    resetBall();

    paddleLeft.y = virtualHeight / 2 - paddleLeft.h / 2;

    paddleRight.x = virtualWidth - 60;
    paddleRight.y = virtualHeight / 2 - paddleRight.h / 2;
}

// ======================
// 🔁 RESET BALL
// ======================

function resetBall() {
    ball.x = virtualWidth / 2;
    ball.y = virtualHeight / 2;

    const dir = Math.random() > 0.5 ? 1 : -1;

    ball.vx = 600 * dir;
    ball.vy = (Math.random() * 2 - 1) * 400;
}

// ======================
// 🎮 GAME LOOP
// ======================

function gameLoop(dt: number) {
    ctx.clearRect(0, 0, virtualWidth, virtualHeight);
    applyScaling();

    // Background
    drawRect(ctx, makeRect(0, 0, virtualWidth, virtualHeight), "black");

    // ======================
    // 🎮 INPUT
    // ======================

    // Left paddle (W/S)
    if (isKeyPressed(Key.KeyW)) paddleLeft.y -= paddleLeft.speed * dt;
    if (isKeyPressed(Key.KeyS)) paddleLeft.y += paddleLeft.speed * dt;

    // Right paddle (Arrow Keys)
    if (isKeyPressed(Key.ArrowUp)) paddleRight.y -= paddleRight.speed * dt;
    if (isKeyPressed(Key.ArrowDown)) paddleRight.y += paddleRight.speed * dt;

    // Clamp paddles
    paddleLeft.y = Math.max(0, Math.min(virtualHeight - paddleLeft.h, paddleLeft.y));
    paddleRight.y = Math.max(0, Math.min(virtualHeight - paddleRight.h, paddleRight.y));

    // ======================
    // ⚡ BALL
    // ======================

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Top / Bottom
    if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy *= -1;
    }

    if (ball.y + ball.r > virtualHeight) {
        ball.y = virtualHeight - ball.r;
        ball.vy *= -1;
    }

    // ======================
    // 💥 COLLISION
    // ======================

    // Left paddle
    if (
        ball.x - ball.r < paddleLeft.x + paddleLeft.w &&
        ball.y > paddleLeft.y &&
        ball.y < paddleLeft.y + paddleLeft.h
    ) {
        ball.x = paddleLeft.x + paddleLeft.w + ball.r;
        ball.vx *= -1;

        const hit = (ball.y - paddleLeft.y) / paddleLeft.h;
        ball.vy = (hit - 0.5) * 800;
    }

    // Right paddle
    if (
        ball.x + ball.r > paddleRight.x &&
        ball.y > paddleRight.y &&
        ball.y < paddleRight.y + paddleRight.h
    ) {
        ball.x = paddleRight.x - ball.r;
        ball.vx *= -1;

        const hit = (ball.y - paddleRight.y) / paddleRight.h;
        ball.vy = (hit - 0.5) * 800;
    }

    // ======================
    // 🧮 SCORE
    // ======================

    if (ball.x < 0) {
        scoreRight++;
        resetBall();
    }

    if (ball.x > virtualWidth) {
        scoreLeft++;
        resetBall();
    }

    // ======================
    // 🎨 DRAW
    // ======================

    // Ball
    drawCircle(
        ctx,
        makeCircle(ball.x - ball.r, ball.y - ball.r, ball.r),
        "white"
    );

    // Paddles
    drawRect(ctx, makeRect(paddleLeft.x, paddleLeft.y, paddleLeft.w, paddleLeft.h), "white");
    drawRect(ctx, makeRect(paddleRight.x, paddleRight.y, paddleRight.w, paddleRight.h), "white");

    // Middle line
    for (let y = 0; y < virtualHeight; y += 40) {
        drawRect(ctx, makeRect(virtualWidth / 2 - 5, y, 10, 20), "white");
    }

    // Score
    renderText(ctx, scoreLeft.toString(), virtualWidth * 0.25, 80, "white", "60px Arial");
    renderText(ctx, scoreRight.toString(), virtualWidth * 0.75, 80, "white", "60px Arial");

    resetInput();
}

// ======================
// ▶️ START
// ======================

startEngine(() => { gameStart().then(() => {}) }, gameLoop);
