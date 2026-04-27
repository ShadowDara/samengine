import { makeVector2d, Vector2d, scale2d, add2d, subtract2d, dot2d } from "../types/vector2d.js";
import { aabbCollision, circleBoxCollision, circleCollision, positionalCorrection, resolveCollision } from "./collision.js";
import { PhysicsObject } from "./physicsObject.js";


// Exapmle for a Use Case

// const world = new PhysicsWorld();

// const ball1 = new PhysicsObject(
//   new RigidBody(new Vec2(100, 100), 1, 0.9),
//   { type: "circle", radius: 20 }
// );

// const ball2 = new PhysicsObject(
//   new RigidBody(new Vec2(200, 100), 1, 0.9),
//   { type: "circle", radius: 20 }
// );

// world.objects.push(ball1, ball2);

// // Game Loop
// function update(dt: number) {
//   world.step(dt);
// }


export class PhysicsWorld {
    objects: PhysicsObject[] = [];
    gravity = makeVector2d(0, 500); // px/s²

    step(dt: number) {
        // Bewegung
        for (const obj of this.objects) {
            if (obj.body.isStatic) continue;

            obj.body.velocity = add2d(obj.body.velocity,
                scale2d(this.gravity, dt)
            );

            obj.body.position = add2d(obj.body.position,
                scale2d(obj.body.velocity, dt)
            );
        }

        // Kollisionen
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const a = this.objects[i];
                const b = this.objects[j];

                let collision = null;

                // Circle vs Circle
                if (a.collider.type === "circle" && b.collider.type === "circle") {
                    collision = circleCollision(a, b);
                }

                // Box vs Box
                else if (a.collider.type === "box" && b.collider.type === "box") {
                    collision = aabbCollision(a, b);
                }

                // Circle vs Box
                else if (a.collider.type === "circle" && b.collider.type === "box") {
                    collision = circleBoxCollision(a, b);
                }

                // Box vs Circle (umdrehen!)
                else if (a.collider.type === "box" && b.collider.type === "circle") {
                    collision = circleBoxCollision(b, a);

                    if (collision) {
                        collision.normal = scale2d(collision.normal, -1);
                    }
                }

                if (collision) {
                    resolveCollision(a, b, collision.normal);

                    // 👉 HIER REIN!
                    if (!a.body.isStatic && b.body.isStatic) {
                        const dot = dot2d(a.body.velocity, collision.normal);
                        if (dot < 0) {
                            a.body.velocity = subtract2d(a.body.velocity,
                                scale2d(collision.normal, dot * 2)
                            );
                        }
                    }

                    if (!b.body.isStatic && a.body.isStatic) {
                        const dot = dot2d(b.body.velocity, scale2d(collision.normal, -1));
                        if (dot < 0) {
                            b.body.velocity = subtract2d(b.body.velocity, 
                                scale2d(scale2d(collision.normal, -1), dot * 2)
                            );
                        }
                    }

                    positionalCorrection(
                        a,
                        b,
                        collision.normal,
                        collision.penetration
                    );
                }
            }
        }
    }
}


export function setGravityDirection(world: PhysicsWorld, x: number, y: number, strength: number) {
    const len = Math.sqrt(x * x + y * y);

    if (len === 0) return;

    world.gravity = makeVector2d(
        (x / len) * strength,
        (y / len) * strength
    );
}
