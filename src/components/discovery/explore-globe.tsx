"use client";

import { useEffect, useRef } from "react";
import { geoMatchesFilter, type WorldPoint } from "@/src/lib/discovery/geo";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";

const IDLE_SPEED = 0.18;
const DRAG_GAIN = 0.0085;
const INERTIA = 0.94;
const STOP = 0.002;

type Vec = { x: number; y: number; z: number };

function project(lat: number, lng: number, rotY: number, rotX: number): Vec {
  const λ = ((lng * Math.PI) / 180) + rotY;
  const φ = (lat * Math.PI) / 180;
  const x = Math.cos(φ) * Math.sin(λ);
  let y = Math.sin(φ);
  let z = Math.cos(φ) * Math.cos(λ);
  const cy = Math.cos(rotX);
  const sy = Math.sin(rotX);
  const y2 = y * cy - z * sy;
  const z2 = y * sy + z * cy;
  return { x, y: y2, z: z2 };
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  size: number,
  rotY: number,
  rotX: number,
  points: WorldPoint[],
  active: string | null,
) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.2, 0, Math.PI * 2);
  const fill = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.32, r * 0.1, cx, cy, r);
  fill.addColorStop(0, "#1a2228");
  fill.addColorStop(0.45, "#0c1014");
  fill.addColorStop(1, "#07080a");
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.2, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = "rgba(140, 210, 205, 0.14)";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    let started = false;
    for (let lng = -180; lng <= 180; lng += 8) {
      const p = project(i * 22, lng, rotY, rotX);
      if (p.z <= 0.02) {
        started = false;
        continue;
      }
      const x = cx + p.x * (r - 2);
      const y = cy - p.y * (r - 2);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    let started = false;
    for (let lat = -80; lat <= 80; lat += 6) {
      const p = project(lat, i * 30, rotY, rotX);
      if (p.z <= 0.02) {
        started = false;
        continue;
      }
      const x = cx + p.x * (r - 2);
      const y = cy - p.y * (r - 2);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const ranked = [...points].sort((a, b) => a.count - b.count);
  for (const point of ranked) {
    const p = project(point.lat, point.lng, rotY, rotX);
    if (p.z < 0.12) continue;
    const x = cx + p.x * (r - 3.5);
    const y = cy - p.y * (r - 3.5);
    const on = geoMatchesFilter(point.filter, active);
    const radius = on ? 2.6 : Math.min(2.3, 1.35 + Math.log2(point.count + 1) * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, radius + 2.2, 0, Math.PI * 2);
    ctx.fillStyle = on ? "rgba(170, 245, 235, 0.28)" : "rgba(110, 210, 200, 0.16)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = on ? "#e8fffb" : "#9ee8de";
    ctx.fill();
  }

  const sheen = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.38, 0, cx - r * 0.1, cy - r * 0.1, r * 0.85);
  sheen.addColorStop(0, "rgba(255,255,255,0.16)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0.04)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.1, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(150, 225, 215, 0.32)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

export function ExploreGlobe({
  points,
  activeLocation = null,
  onSelect,
  size = 56,
  toggleOnReselect = true,
  className,
}: {
  points: WorldPoint[];
  activeLocation?: string | null;
  onSelect: (filter: string | null) => void;
  size?: number;
  toggleOnReselect?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLButtonElement>(null);
  const rot = useRef({ y: -0.35, x: -0.18, vy: IDLE_SPEED / 60, vx: 0 });
  const pointsRef = useRef(points);
  const activeRef = useRef(activeLocation);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0, moved: 0 });
  const loop = useRef(0);
  const idle = useRef(true);
  const kick = useRef<() => void>(() => {});
  const onSelectRef = useRef(onSelect);
  pointsRef.current = points;
  activeRef.current = activeLocation;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    idle.current = !reduced;

    const paint = () => {
      drawGlobe(ctx, size, rot.current.y, rot.current.x, pointsRef.current, activeRef.current);
    };

    const tick = () => {
      loop.current = 0;
      if (document.hidden) return;
      const state = rot.current;
      if (!dragging.current) {
        if (Math.abs(state.vy) > STOP || Math.abs(state.vx) > STOP) {
          state.y += state.vy;
          state.x = Math.max(-0.55, Math.min(0.45, state.x + state.vx));
          state.vy *= INERTIA;
          state.vx *= INERTIA;
          if (Math.abs(state.vy) < STOP) state.vy = idle.current && !reduced ? IDLE_SPEED / 60 : 0;
          if (Math.abs(state.vx) < STOP) state.vx = 0;
          paint();
          loop.current = window.requestAnimationFrame(tick);
          return;
        }
        if (idle.current && !reduced) {
          state.y += IDLE_SPEED / 60;
          paint();
          loop.current = window.requestAnimationFrame(tick);
          return;
        }
      } else {
        paint();
      }
    };

    const startLoop = () => {
      if (loop.current) return;
      loop.current = window.requestAnimationFrame(tick);
    };
    kick.current = startLoop;

    paint();
    if (!reduced) startLoop();

    const feed = document.getElementById("explore-feed-scroll");
    let resume = 0;
    const pauseIdle = () => {
      idle.current = false;
      window.clearTimeout(resume);
      resume = window.setTimeout(() => {
        idle.current = !reduced;
        startLoop();
      }, 1400);
    };
    feed?.addEventListener("scroll", pauseIdle, { passive: true });

    const onVis = () => {
      if (!document.hidden && idle.current) startLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.cancelAnimationFrame(loop.current);
      window.clearTimeout(resume);
      feed?.removeEventListener("scroll", pauseIdle);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawGlobe(ctx, size, rot.current.y, rot.current.x, points, activeLocation);
  }, [points, activeLocation, size]);

  function hit(clientX: number, clientY: number): WorldPoint | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * size;
    const py = ((clientY - rect.top) / rect.height) * size;
    const r = size / 2;
    let best: { point: WorldPoint; dist: number } | null = null;
    for (const point of pointsRef.current) {
      const p = project(point.lat, point.lng, rot.current.y, rot.current.x);
      if (p.z < 0.12) continue;
      const x = r + p.x * (r - 3.5);
      const y = r - p.y * (r - 3.5);
      const dist = Math.hypot(px - x, py - y);
      const reach = Math.max(22, size * 0.12);
      if (dist < reach && (!best || dist < best.dist)) best = { point, dist };
    }
    return best?.point ?? null;
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    dragging.current = true;
    idle.current = false;
    last.current = { x: event.clientX, y: event.clientY, moved: 0 };
    rot.current.vy = 0;
    rot.current.vx = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return;
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY, moved: last.current.moved + Math.abs(dx) + Math.abs(dy) };
    rot.current.y += dx * DRAG_GAIN;
    rot.current.x = Math.max(-0.55, Math.min(0.45, rot.current.x + dy * DRAG_GAIN * 0.65));
    rot.current.vy = dx * DRAG_GAIN;
    rot.current.vx = dy * DRAG_GAIN * 0.45;
    const canvas = canvasRef.current?.getContext("2d");
    if (canvas) drawGlobe(canvas, size, rot.current.y, rot.current.x, pointsRef.current, activeRef.current);
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    dragging.current = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (last.current.moved < 10) {
      const point = hit(event.clientX, event.clientY);
      if (point) {
        const same = geoMatchesFilter(point.filter, activeRef.current);
        onSelectRef.current(toggleOnReselect && same ? null : point.filter);
      }
      idle.current = !reduced;
    } else {
      idle.current = !reduced;
    }
    kick.current();
  }

  return (
    <button
      ref={wrapRef}
      type="button"
      aria-label={t.explore.globeAria}
      aria-pressed={Boolean(activeLocation)}
      title={t.explore.globeHint}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      className={cn("sz-globe shrink-0", activeLocation && "is-on", className)}
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} width={size} height={size} />
    </button>
  );
}
