// Types Export

// Vector 2D
export {
    type Vector2d,
    makeVector2d,
    add2d,
    subtract2d,
    length2d,
    normalize2d,
    dot2d,
    distance2d,
    clamp2d,
    lerp2d,
    map2d,
    scale2d
} from "./vector2d.js";

// Vector 3D
export {
    type Vector3d,
    makeVector3d,
    add3d,
    subtract3d,
    length3d,
    normalize3d,
    dot3d,
    crossprodukt3d,
    distance3d,
    clamp3d,
    lerp3d,
    map3d
} from "./vector3d.js";

// Color Type
export {
    type Color,
    makeColor,
    invertcolor,
    invertHexColor
} from "./color.js";

// Retangle Type
export {
    type Rect,
    makeRect,
    centerRectX,
    centerRectY,
    centerRect,
    isPointInRect,
    isMouseInRect,
    isRectClicked
} from "./rectangle.js";

// Circle Type
export {
    type Circle,
    makeCircle,
    centerCircle,
    isPointInCircle,
    isMouseInCircle,
    isCircleClicked,
    isCircleColliding,
    getCircleDistance
} from "./circle.js";

// Triangle Type
export {
    type Triangle,
    makeTriangle,
    centerTriangle,
    isPointInTriangle,
    isMouseInTriangle,
    isTriangleClicked,
    getTrianglePerimeter,
} from "./triangle.js";

// Button Type
export {
    type Button,
    makeButton,
    clickedButton,
    drawButton
} from "./button.js";
