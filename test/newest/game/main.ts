import {
    createCanvas,
    setupInput,
    startEngine,
    getMouse
} from "samengine";

import {
    drawButton,
    makeButton,
    makeRect,
    isButtonpressed
} from "samengine/types";

import { CanvasInput } from "canvasinput-ts";

const {
    canvas,
    ctx,
    applyScaling,
    virtualWidth,
    virtualHeight
} = createCanvas({
    fullscreen: true,
    scaling: "fit",
    virtualWidth: window.innerWidth,
    virtualHeight: window.innerHeight
});

setupInput(canvas, virtualWidth, virtualHeight);

// ----------------------------
// Inputs
// ----------------------------

const nameInput = new CanvasInput({
    canvas,
    x: 100,
    y: 100,
    width: 300,
    height: 40,
    placeHolder: "Name",
    fontSize: 18,
    backgroundColor: "#ffffff"
});

const emailInput = new CanvasInput({
    canvas,
    x: 100,
    y: 160,
    width: 300,
    height: 40,
    placeHolder: "Email",
    fontSize: 18,
    backgroundColor: "#ffffff"
});

const messageInput = new CanvasInput({
    canvas,
    x: 100,
    y: 220,
    width: 300,
    height: 40,
    placeHolder: "Nachricht",
    fontSize: 18,
    backgroundColor: "#ffffff"
});

// ----------------------------
// Button
// ----------------------------

const submitButton = makeButton(
    makeRect(100, 300, 300, 60),
    "Absenden"
);

function gameLoop(dt: number) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyScaling();

    const mouse = getMouse();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Inputs zeichnen
    nameInput.render();
    emailInput.render();
    messageInput.render();

    // Button zeichnen
    drawButton(submitButton, ctx);

    // Button Klick
    if (isButtonpressed(submitButton, mouse)) {

        console.clear();

        console.log("=== FORMULAR ===");
        console.log("Name:", nameInput.value());
        console.log("Email:", emailInput.value());
        console.log("Nachricht:", messageInput.value());
        console.log("================");
    }
}

startEngine(
    () => {},
    gameLoop
);
