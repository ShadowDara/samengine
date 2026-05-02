import { makeVector2d, Vector2d } from "../types/vector2d.js";
import { Collider } from "./collision.js";

export class RigidBody {
    position: Vector2d;
    velocity: Vector2d;
    mass: number;
    restitution: number; // Bounciness (0–1)
    isStatic: boolean;

    constructor(pos: Vector2d, mass = 1, restitution = 0.8, isStatic = false) {
        this.position = pos;
        this.velocity = makeVector2d(0, 0);
        this.mass = isStatic ? Infinity : mass;
        this.restitution = restitution;
        this.isStatic = isStatic;
    }
}

export class PhysicsObject {
    body: RigidBody;
    collider: Collider;

    constructor(body: RigidBody, collider: Collider) {
        this.body = body;
        this.collider = collider;
    }
}
