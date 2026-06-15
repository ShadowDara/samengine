import { makeVector2d, Vector2d } from "../types/vector2d.js";
import { Collider } from "./collision.js";

/**
 * Physical body state used by the simple physics world.
 *
 * Positions and velocities use canvas-style 2D coordinates. Static bodies get
 * infinite mass and are not moved by gravity or collision impulses.
 */
export class RigidBody {
    position: Vector2d;
    velocity: Vector2d;
    mass: number;
    restitution: number; // Bounciness (0–1)
    isStatic: boolean;

    /**
     * Creates a rigid body.
     *
     * @param pos Initial center position.
     * @param mass Body mass. Ignored for static bodies.
     * @param restitution Bounciness factor used during collision resolution.
     * @param isStatic Whether the body should behave like an immovable object.
     */
    constructor(pos: Vector2d, mass = 1, restitution = 0.8, isStatic = false) {
        this.position = pos;
        this.velocity = makeVector2d(0, 0);
        this.mass = isStatic ? Infinity : mass;
        this.restitution = restitution;
        this.isStatic = isStatic;
    }
}

/**
 * Combines physical state with a collision shape.
 */
export class PhysicsObject {
    body: RigidBody;
    collider: Collider;

    /**
     * Creates a physics object from a body and collider.
     */
    constructor(body: RigidBody, collider: Collider) {
        this.body = body;
        this.collider = collider;
    }
}
