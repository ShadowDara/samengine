// Types Export

// Vector 2D
export { type Vector2d, normalize2d, clamp2d, lerp2d, map2d } from "./vector2d.js";

// Vector 3D
export { type Vector3d, normalize3d, clamp3d, lerp3d, map3d } from "./vector3d.js";

// Color Type
export { type Color, invertcolor, invertHexColor } from "./color.js";

// Retangle Type
export {
    type Rect,
    centerRectX,
    centerRectY,
    centerRect,
    isPointInRect,
    isMouseInRect,
    isRectClicked
} from "./rectangle.js";

// Math Utilities
export { clamp, lerp, map } from "./math-utils.js";
