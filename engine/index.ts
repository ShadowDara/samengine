// Core Engine Exports
export { startEngine } from "./core";

// Rendering
export { renderText, renderBitmapText } from "./renderer";

// Input System
export { setupInput } from "./input";
export type { Mouse } from "./input";

// Logging
export { dlog } from "./logger";

// Save System
export * from "./save";

// Texture Management
export * from "./texture";

// HTML Generation
export * from "./html";

// Keys Reference
export * from "./keys";

// Types
export type { Vector2d } from "./types/vector2d";
export type { Vector3d } from "./types/vector3d";
export type { Color } from "./types/color";
export type { Rect } from "./types/rectangle";

// Math Utilities
export * from "./types/math-utils";
