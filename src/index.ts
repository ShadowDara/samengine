// Core Engine Exports
export { startEngine } from "./core.js";

// Rendering
export {
    renderText,
    renderBitmapText,
    drawRect,
    drawRectOutline,
    drawCircle,
    drawCircleOutline,
    drawTriangle,
    drawTriangleOutline,
} from "./renderer.js";

// Input System
export type { Mouse } from "./input.js";
export {
    setupInput,
    isKeyJustPressed,
    resetInput, getMouse
} from "./input.js";

// Logging
export { dlog } from "./logger.js";

// Save System
export type {
    SaveData
} from "./save.js";
export {
    SAVE_KEY,
    saveGame,
    loadGame,
    clearSave,
    exportSave
} from "./save.js";

// Texture Management
export type {
    Texture,
    DrawOptions,
    TextureAtlas,
    Animation,
} from "./texture.js";
export {
    loadTextureAsync,
    getTexture,
    drawTexture,
    loadAtlas,
    drawAtlasFrame,
    AnimationPlayer,
    drawAnimation,
    getFlipFromDirection,
} from "./texture.js";

// HTML Generation
export {
    createCanvas,
    enableFullscreen,
    setupFullscreenButton
} from "./html.js";

// Keys Reference
export { Key } from "./keys.js";
