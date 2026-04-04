// Core Engine Exports
export { startEngine } from "./core.ts";

// Rendering
export { renderText, renderBitmapText } from "./renderer.ts";

// Input System
export { setupInput } from "./input.ts";
export type { Mouse } from "./input.ts";

// Logging
export { dlog } from "./logger.ts";

// Save System
export * from "./save.ts";

// Texture Management
export * from "./texture.ts";

// HTML Generation
export * from "./html.ts";

// Keys Reference
export * from "./keys.ts";

// Types
export type { Vector2d } from "./types/vector2d.ts";
export type { Vector3d } from "./types/vector3d.ts";
export type { Color } from "./types/color.ts";
export type { Rect } from "./types/rectangle.ts";

// Math Utilities
export * from "./types/math-utils.ts";
