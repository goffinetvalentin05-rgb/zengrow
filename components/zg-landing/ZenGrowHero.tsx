"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import "./zengrow-hero.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PERSON_SVG = `<svg viewBox="0 0 24 24"><circle class="head" cx="12" cy="8.5" r="3.6"/><path class="body" d="M5.5 20c0-3.6 2.9-6.3 6.5-6.3s6.5 2.7 6.5 6.3z"/></svg>`;

const AVATAR_PALETTES: [string, string][] = [
  ["#a78bfa", "#6d28d9"],
  ["#8b5cf6", "#5b21b6"],
  ["#c4b5fd", "#7c5cff"],
  ["#9d88ff", "#6366f1"],
  ["#b794f6", "#7c3aed"],
  ["#ddd6fe", "#8b5cf6"],
  ["#e9d5ff", "#a78bfa"],
  ["#7c5cff", "#4c1d95"],
];

const FILL_ORDER = [
  2, 5, 8, 9, 12, 15, 16, 18, 19, 22, 23, 25, 1, 4, 6, 11, 14, 17, 20, 7, 10, 13, 3, 21, 24,
  26, 28, 29, 30,
];

const MOBILE_BREAKPOINT = 768;

export function ZenGrowHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const coreWrapRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const scene = sceneRef.current;
    const flash = flashRef.current;
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    const counter = counterRef.current;
    const coreWrap = coreWrapRef.current;
    const calendar = calendarRef.current;

    if (!scene || !flash || !canvas || !grid || !counter || !coreWrap || !calendar) {
      return undefined;
    }

    const sceneEl = scene;
    const flashEl = flash;
    const gridEl = grid;
    const counterEl = counter;
    const coreWrapEl = coreWrap;
    const calendarEl = calendar;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let spawnLoopTimeout: ReturnType<typeof setTimeout> | null = null;
    let fillIntervalId: ReturnType<typeof setInterval> | null = null;
    let fxRaf = 0;
    let destroyed = false;
    let running = true;
    let loopsStarted = false;

    const dayCells: HTMLDivElement[] = [];
    let fillIdx = 0;
    let count = 0;

    const trails: { x: number; y: number; r: number; life: number }[] = [];
    const ambient: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] =
      [];

    let W = 0;
    let H = 0;
    let DPR = 1;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return undefined;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

    const sceneRect = () => sceneEl.getBoundingClientRect();

    const getCoreCenter = () => {
      const sr = sceneRect();
      const cr = coreWrapEl.getBoundingClientRect();
      return {
        x: cr.left - sr.left + cr.width / 2,
        y: cr.top - sr.top + cr.height / 2,
      };
    };

    const getCalTarget = () => {
      const sr = sceneRect();
      const cr = calendarEl.getBoundingClientRect();
      return {
        x: cr.left - sr.left + cr.width / 2,
        y: cr.top - sr.top + cr.height / 2,
      };
    };

    const scheduleTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (running && !destroyed) fn();
      }, ms);
      timeouts.push(id);
      return id;
    };

    const sceneHasLayout = () => {
      const r = sceneEl.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    function seedAmbient() {
      ambient.length = 0;
      const n = Math.max(12, Math.round(W / 22));
      for (let i = 0; i < n; i++) {
        ambient.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          a: Math.random() * 0.4 + 0.1,
        });
      }
    }

    function resize() {
      const r = sceneRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      const cvs = canvasRef.current;
      if (!cvs) return;
      cvs.width = W * DPR;
      cvs.height = H * DPR;
      cvs.style.width = `${W}px`;
      cvs.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seedAmbient();
    }

    function buildCalendar() {
      gridEl.innerHTML = "";
      dayCells.length = 0;
      ["L", "M", "M", "J", "V", "S", "D"].forEach((d) => {
        const el = document.createElement("div");
        el.className = "dow";
        el.textContent = d;
        gridEl.appendChild(el);
      });
      for (let i = 0; i < 2; i++) {
        const el = document.createElement("div");
        el.className = "cell empty";
        gridEl.appendChild(el);
      }
      for (let day = 1; day <= 31; day++) {
        const el = document.createElement("div");
        el.className = "cell";
        el.textContent = String(day);
        gridEl.appendChild(el);
        dayCells.push(el);
      }
      count = 0;
      counterEl.textContent = "0";
      fillIdx = 0;
    }

    function fillDay() {
      if (destroyed || dayCells.length === 0) return;

      if (fillIdx >= FILL_ORDER.length) {
        fillIdx = 0;
        dayCells.forEach((c) => c.classList.remove("filled"));
        count = 0;
        counterEl.textContent = "0";
      }

      const index = FILL_ORDER[fillIdx];
      const cell = dayCells[index];
      if (cell && !cell.classList.contains("filled")) {
        cell.classList.add("filled", "justfilled");
        scheduleTimeout(() => cell.classList.remove("justfilled"), 650);
        count++;
        counterEl.textContent = String(count);
      }
      fillIdx++;
    }

    function fxLoop() {
      if (!running || destroyed) return;
      if (W <= 0 || H <= 0) {
        fxRaf = requestAnimationFrame(fxLoop);
        return;
      }
      ctx.clearRect(0, 0, W, H);

      for (const p of ambient) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 92, 255, ${p.a})`;
        ctx.fill();
      }

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.02;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${t.life * 0.4})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(124, 92, 255, 0.6)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      fxRaf = requestAnimationFrame(fxLoop);
    }

    function emitSpark() {
      const spark = document.createElement("div");
      spark.className = "spark";
      sceneEl.appendChild(spark);

      const c = getCoreCenter();
      const tg = getCalTarget();
      const mobile = isMobile();
      const cpX = mobile ? c.x : (c.x + tg.x) / 2 + (Math.random() * 80 - 40);
      const cpY = mobile ? (c.y + tg.y) / 2 : c.y - 100;

      const dur = 900;
      const start = performance.now();
      let sparkRaf = 0;

      const step = (now: number) => {
        if (!running || destroyed) {
          spark.remove();
          return;
        }
        let t = (now - start) / dur;
        if (t > 1) t = 1;
        const mt = 1 - t;
        const x = mt * mt * c.x + 2 * mt * t * cpX + t * t * tg.x;
        const y = mt * mt * c.y + 2 * mt * t * cpY + t * t * tg.y;
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.opacity = String(
          t < 0.15 ? t / 0.15 : t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1,
        );
        spark.style.transform = `translate(-50%, -50%) scale(${1 - t * 0.55})`;
        trails.push({ x, y, r: 5, life: 1 });

        if (t < 1) {
          sparkRaf = requestAnimationFrame(step);
        } else {
          spark.remove();
        }
      };

      sparkRaf = requestAnimationFrame(step);
      scheduleTimeout(fillDay, 640);
    }

    function spawnVisitor() {
      if (!running || destroyed || reducedMotion || !sceneHasLayout()) return;

      const v = document.createElement("div");
      v.className = "visitor";
      const size = (isMobile() ? 28 : 34) + Math.random() * (isMobile() ? 12 : 16);
      const pal = AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];
      v.innerHTML = `<div class="av" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 38% 32%, ${pal[0]}, ${pal[1]})">${PERSON_SVG}<span class="ring-glow"></span></div>`;
      sceneEl.appendChild(v);

      const rg = v.querySelector(".ring-glow") as HTMLElement | null;
      const r = sceneRect();
      const c = getCoreCenter();
      const mobile = isMobile();

      let sx: number;
      let sy: number;

      if (mobile) {
        sx = 20 + Math.random() * Math.max(40, r.width - size - 40);
        sy = -60;
      } else {
        const edge = Math.random();
        if (edge < 0.55) {
          sx = -60;
          sy = 40 + Math.random() * (r.height - 120);
        } else if (edge < 0.78) {
          sx = Math.random() * r.width * 0.38;
          sy = -60;
        } else {
          sx = Math.random() * r.width * 0.38;
          sy = r.height + 60;
        }
      }

      const tx = c.x - size / 2;
      const ty = c.y - size / 2;
      const cpX = sx + (tx - sx) * 0.5 + (Math.random() * 160 - 80);
      const cpY = sy + (ty - sy) * 0.5 + (Math.random() * 180 - 90);
      const dur = 2400 + Math.random() * 1200;
      const start = performance.now();
      let visitorRaf = 0;

      const step = (now: number) => {
        if (!running || destroyed) {
          v.remove();
          return;
        }
        let t = (now - start) / dur;
        if (t > 1) t = 1;
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const mt = 1 - e;
        const x = mt * mt * sx + 2 * mt * e * cpX + e * e * tx;
        const y = mt * mt * sy + 2 * mt * e * cpY + e * e * ty;
        v.style.left = `${x}px`;
        v.style.top = `${y}px`;
        v.style.opacity = String(
          t < 0.12 ? t / 0.12 : t > 0.86 ? 1 - (t - 0.86) / 0.14 : 1,
        );
        const sc = t > 0.78 ? 1 - ((t - 0.78) / 0.22) * 0.55 : 1;
        v.style.transform = `scale(${sc})`;
        if (rg && t > 0.6) rg.style.opacity = String(Math.min((t - 0.6) / 0.4, 1));
        if (t > 0.1 && t < 0.92 && Math.random() > 0.5) {
          trails.push({ x: x + size / 2, y: y + size / 2, r: 3, life: 0.7 });
        }

        if (t < 1) {
          visitorRaf = requestAnimationFrame(step);
        } else {
          flashEl.classList.remove("active");
          void flashEl.offsetWidth;
          flashEl.classList.add("active");
          emitSpark();
          v.remove();
        }
      };

      visitorRaf = requestAnimationFrame(step);
    }

    function startSpawnLoop() {
      const loop = () => {
        if (!running || destroyed) return;
        spawnVisitor();
        spawnLoopTimeout = scheduleTimeout(loop, 380 + Math.random() * 300);
      };
      scheduleTimeout(loop, 300);
    }

    function startLoops() {
      if (destroyed || reducedMotion || !sceneHasLayout() || loopsStarted) return;
      loopsStarted = true;

      fxLoop();
      for (let i = 0; i < 6; i++) {
        scheduleTimeout(spawnVisitor, i * 180);
      }
      startSpawnLoop();

      fillIntervalId = setInterval(() => {
        if (running && !destroyed) fillDay();
      }, 2800);
    }

    const onResize = () => {
      if (!destroyed) resize();
    };

    buildCalendar();
    resize();
    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => {
      if (destroyed) return;
      resize();
      if (!loopsStarted && sceneHasLayout() && !reducedMotion) {
        startLoops();
      }
    });
    resizeObserver.observe(sceneEl);

    const boot = () => {
      if (destroyed) return;
      resize();
      if (!reducedMotion) startLoops();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(boot);
    });

    return () => {
      destroyed = true;
      running = false;
      cancelAnimationFrame(fxRaf);
      fxRaf = 0;
      if (spawnLoopTimeout) clearTimeout(spawnLoopTimeout);
      if (fillIntervalId) clearInterval(fillIntervalId);
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();

      sceneEl.querySelectorAll(".visitor, .spark").forEach((el) => el.remove());
      gridEl.innerHTML = "";
    };
  }, []);

  return (
    <div ref={rootRef} className="zghero" aria-hidden>
      <div ref={sceneRef} className="zghero-scene">
        <canvas ref={canvasRef} className="zghero-fx" />

        <div ref={coreWrapRef} className="zghero-core-wrap">
          <div className="zghero-rays" />
          <div className="zghero-halo" />
          <div className="zghero-core">
            <span className="orbit o1" />
            <span className="orbit o2" />
            <span className="ripple a" />
            <span className="ripple b" />
            <span className="disc" />
            <span ref={flashRef} className="flash" />
            <span className="mark">Z</span>
          </div>
        </div>

        <div ref={calendarRef} className="zghero-calendar">
          <div className="cal-head">
            <span className="month">
              Mai<small>2026</small>
            </span>
            <span className="live">
              <span className="d" />
              En direct
            </span>
          </div>
          <div ref={gridRef} className="cal-grid" />
          <div className="cal-foot">
            <div className="count">
              <span ref={counterRef} className="cal-count-num">
                0
              </span>
              <span>clients qui reviennent</span>
            </div>
            <span className="tag">Auto · IA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
