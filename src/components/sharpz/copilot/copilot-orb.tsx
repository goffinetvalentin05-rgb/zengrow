"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";

const COUNT = 160;

type Point = { x: number; y: number; z: number };

function fibonacciSphere(count: number): Point[] {
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    });
  }
  return points;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  points: Point[],
  angle: number,
) {
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, size * dpr, size * dpr);
  ctx.save();
  ctx.scale(dpr, dpr);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (const point of points) {
    const x = point.x * cos - point.z * sin;
    const z = point.x * sin + point.z * cos;
    const depth = (z + 1.15) / 2.15;
    const px = cx + x * radius;
    const py = cy + point.y * radius;
    const alpha = 0.12 + depth * 0.72;
    const dot = 0.7 + depth * 1.35;
    ctx.beginPath();
    ctx.fillStyle = `rgba(248, 250, 252, ${alpha.toFixed(3)})`;
    ctx.arc(px, py, dot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

type Props = {
  className?: string;
};

export function CopilotOrb({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = fibonacciSphere(COUNT);
    const size = 168;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      drawFrame(ctx, size, points, 0.4);
      return;
    }

    let frame = 0;
    let running = true;
    const tick = (time: number) => {
      if (!running) return;
      drawFrame(ctx, size, points, time / 9000);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={cn("relative flex h-[168px] w-[168px] items-center justify-center", className)} aria-hidden>
      <div
        className="absolute inset-10 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
      />
      <canvas ref={canvasRef} className="relative" />
    </div>
  );
}
