"use client";

import { useEffect, useRef } from "react";
import { drawCircle, drawRect, renderText, startEngine } from "samengine";
import { getResource } from "samengine-build-web/resources";

export default function SamengineGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 960;
    canvas.height = 540;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const badgeUrl = getResource("badge.svg");
    let playerX = 80;
    let velocity = 180;

    startEngine(
      () => {},
      (dt) => {
        playerX += velocity * dt;

        if (playerX > canvas.width - 58 || playerX < 58) {
          velocity *= -1;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRect(ctx, { x: 0, y: 0, width: canvas.width, height: canvas.height }, "#111827");
        drawRect(ctx, { x: 40, y: 390, width: 880, height: 18, borderRadius: 8 }, "#334155");
        drawCircle(ctx, { x: playerX, y: 330, radius: 42 }, "#22c55e");
        drawCircle(ctx, { x: playerX + 16, y: 318, radius: 8 }, "#052e16");
        renderText(ctx, "samengine running inside Next.js /game", 40, 42, "#e5e7eb", "26px Arial");
        renderText(ctx, `resource: ${badgeUrl ?? "not found"}`, 40, 82, "#93c5fd", "18px Arial");
      },
    );
  }, []);

  return (
    <section className="gameShell" aria-label="Samengine game canvas">
      <canvas ref={canvasRef} className="gameCanvas" />
    </section>
  );
}
