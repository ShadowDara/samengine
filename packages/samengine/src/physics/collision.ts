import { add2d, dot2d, length2d, makeVector2d, normalize2d, scale2d, subtract2d, Vector2d } from "../types/vector2d.js";
import { clamp } from "../utils/math.js";
import { PhysicsObject } from "./physicsObject.js";

export type Collider =
    | { type: "circle"; radius: number }
    | { type: "box"; width: number; height: number };

export function aabbCollision(a: PhysicsObject, b: PhysicsObject) {
    const posA = a.body.position;
    const posB = b.body.position;

    const boxA = a.collider as any;
    const boxB = b.collider as any;

    const halfA = makeVector2d(boxA.width / 2, boxA.height / 2);
    const halfB = makeVector2d(boxB.width / 2, boxB.height / 2);

    const diff = subtract2d(posB, posA);

    const overlapX = halfA.x + halfB.x - Math.abs(diff.x);
    const overlapY = halfA.y + halfB.y - Math.abs(diff.y);

    if (overlapX > 0 && overlapY > 0) {
        // kleinste Achse bestimmen
        if (overlapX < overlapY) {
            return {
                normal: makeVector2d(Math.sign(diff.x), 0),
                penetration: overlapX,
            };
        } else {
            return {
                normal: makeVector2d(0, Math.sign(diff.y)),
                penetration: overlapY,
            };
        }
    }

    return null;
}

export function circleCollision(a: PhysicsObject, b: PhysicsObject) {
    const posA = a.body.position;
    const posB = b.body.position;

    const diff = subtract2d(posB, posA)
    const dist = length2d(diff);

    const rA = (a.collider as any).radius;
    const rB = (b.collider as any).radius;

    if (dist < rA + rB) {
        return {
            normal: normalize2d(diff),
            penetration: rA + rB - dist,
        };
    }

    return null;
}

export function circleBoxCollision(circleObj: PhysicsObject, boxObj: PhysicsObject) {
    const circle = circleObj.collider as any;
    const box = boxObj.collider as any;

    const circlePos = circleObj.body.position;
    const boxPos = boxObj.body.position;

    const half = makeVector2d(box.width / 2, box.height / 2);

    // nächster Punkt auf Box
    const closestX = clamp(
        circlePos.x,
        boxPos.x - half.x,
        boxPos.x + half.x
    );

    const closestY = clamp(
        circlePos.y,
        boxPos.y - half.y,
        boxPos.y + half.y
    );

    const closest = makeVector2d(closestX, closestY);

    const diff = subtract2d(circlePos, closest);
    const dist = length2d(diff);

    if (dist < circle.radius) {
        const normal = dist === 0
            ? makeVector2d(0, -1) // fallback
            : normalize2d(diff);

        return {
            normal,
            penetration: circle.radius - dist,
        };
    }

    return null;
}

export function resolveCollision(a: PhysicsObject, b: PhysicsObject, normal: Vector2d) {
    const rv = subtract2d(b.body.velocity, a.body.velocity);

    let velAlongNormal = dot2d(rv, normal);

    const invMassA = a.body.isStatic ? 0 : 1 / a.body.mass;
    const invMassB = b.body.isStatic ? 0 : 1 / b.body.mass;

    // 👉 WICHTIG: wenn leicht rein → trotzdem pushen
    if (velAlongNormal > -0.01) {
        velAlongNormal = -0.01;
    }

    const restitution = Math.min(a.body.restitution, b.body.restitution);

    const j =
        -(1 + restitution) * velAlongNormal /
        (invMassA + invMassB);

    const impulse = scale2d(normal, j);

    if (!a.body.isStatic)
        a.body.velocity = subtract2d(a.body.velocity, scale2d(impulse, invMassA));

    if (!b.body.isStatic)
        b.body.velocity = add2d(b.body.velocity, scale2d(impulse, invMassB));
}

export function positionalCorrection(
    a: PhysicsObject,
    b: PhysicsObject,
    normal: Vector2d,
    penetration: number
) {
    const percent = 1.0; // vorher 0.8
    const slop = 0.001;  // vorher 0.01

    const invMassA = a.body.isStatic ? 0 : 1 / a.body.mass;
    const invMassB = b.body.isStatic ? 0 : 1 / b.body.mass;

    const correction = scale2d(scale2d(normal, Math.max(penetration - slop, 0) / (invMassA + invMassB)), percent);

    if (!a.body.isStatic)
        a.body.position = subtract2d(a.body.position, scale2d(correction, invMassA));

    if (!b.body.isStatic)
        b.body.position = add2d(b.body.position, scale2d(correction, invMassB));
}
