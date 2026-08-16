// Core Engine Exports
export { startEngine, stopEngine, isEngineRunning } from "./core.js";

// Settings Runtime
export type { GameSettings, GameSettingsListener } from "./settings.js";
export {
    setGameSettings,
    getGameSettings,
    setGameSetting,
    getGameSetting,
    clearGameSettings,
    onGameSettingsChange,
} from "./settings.js";

// Rendering
export type { CharMap, ParallaxLayer } from "./renderer.js";
export {
    renderText,
    renderBitmapText,
    drawRect,
    drawRectOutline,
    drawCircle,
    drawCircleOutline,
    drawTriangle,
    drawTriangleOutline,
    renderParallaxBackground,
    renderParallaxLayers,
} from "./renderer.js";

// Input System
export type { Mouse } from "./input.js";
export {
    setupInput,
    teardownInput,
    isKeyPressed,
    isKeyJustPressed,
    isKeyJustReleased,
    resetInput,
    getMouse
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
export type { CanvasConfig, AttachedCanvas, AttachCanvasConfig } from "./html.js";
export {
    createCanvas,
    attachCanvas,
    toggleFullscreen,
    enableFullscreen,
    setupFullscreenButton,
    bridgeLegacyGameSettings
} from "./html.js";

// Keys Reference
export { Key } from "./keys.js";
