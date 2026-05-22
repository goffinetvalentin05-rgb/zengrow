"use client";

import { useEffect, useRef } from "react";

const ZG_HERO_STYLES = `
  .zghero{
    --orange:#f06a32;--orange-soft:#f5894f;--orange-bright:#ff8347;--orange-pale:#ffb088;
    --orange-glow:rgba(240,106,50,.55);
    --text:#f7f1ec;--muted:#a89388;--muted-dim:rgba(140,125,115,.4);
    margin:0;padding:0;box-sizing:border-box;
    background:#070504;color:var(--text);font-family:'Manrope',sans-serif;min-height:100vh;overflow:hidden;position:relative;width:100%;
  }
  .zghero *{margin:0;padding:0;box-sizing:border-box}

  .zghero .bg{position:fixed;inset:0;z-index:0;pointer-events:none}
  .zghero .bg .grad{position:absolute;inset:0;background:radial-gradient(70% 60% at 36% 50%, rgba(240,106,50,.10) 0%, transparent 55%),radial-gradient(90% 70% at 50% -5%, #2a1810 0%, transparent 55%),radial-gradient(70% 50% at 50% 108%, #1c100a 0%, transparent 50%),#070504}
  .zghero .bg .grid{position:absolute;inset:0;opacity:.4;background-image:linear-gradient(rgba(240,106,50,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(240,106,50,.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(85% 75% at 50% 50%,#000 0%,transparent 84%);-webkit-mask-image:radial-gradient(85% 75% at 50% 50%,#000 0%,transparent 84%)}
  .zghero .bg .noise{position:absolute;inset:0;opacity:.045;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
  .zghero .bg .floor{position:absolute;left:0;right:0;bottom:0;height:40%;background:radial-gradient(60% 100% at 50% 100%, rgba(240,106,50,.12) 0%, transparent 70%);filter:blur(20px)}

  .zghero .scene{position:relative;width:100vw;height:100vh;z-index:2}

  .zghero .fx{position:absolute;inset:0;z-index:3;pointer-events:none}

  .zghero .halo{position:absolute;left:42%;top:50%;transform:translate(-50%,-50%);width:680px;height:680px;border-radius:50%;pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(255,131,71,.20) 0%,rgba(240,106,50,.06) 40%,transparent 68%);filter:blur(16px);animation:zg-haloPulse 5s ease-in-out infinite}
  .zghero .rays{position:absolute;left:42%;top:50%;transform:translate(-50%,-50%);width:760px;height:760px;z-index:1;pointer-events:none;opacity:.5;background:conic-gradient(from 0deg, transparent 0deg, rgba(240,106,50,.10) 12deg, transparent 24deg, transparent 60deg, rgba(240,106,50,.07) 72deg, transparent 84deg, transparent 130deg, rgba(240,106,50,.09) 142deg, transparent 154deg, transparent 220deg, rgba(240,106,50,.07) 232deg, transparent 244deg, transparent 310deg, rgba(240,106,50,.08) 322deg, transparent 334deg);mask-image:radial-gradient(circle, transparent 24%, #000 38%, transparent 70%);-webkit-mask-image:radial-gradient(circle, transparent 24%, #000 38%, transparent 70%);filter:blur(3px);animation:zg-spin 40s linear infinite}

  .zghero .core{position:absolute;left:42%;top:50%;transform:translate(-50%,-50%);z-index:8;width:180px;height:180px;display:flex;align-items:center;justify-content:center}
  .zghero .core .orbit{position:absolute;border-radius:50%;border:1px solid rgba(240,106,50,.16)}
  .zghero .core .orbit.o1{inset:0}
  .zghero .core .orbit.o2{inset:-34px;border-color:rgba(240,106,50,.09)}
  .zghero .core .ripple{position:absolute;inset:22px;border-radius:50%;border:1.5px solid rgba(245,137,79,.45)}
  .zghero .core .ripple.a{animation:zg-ripple 3.6s cubic-bezier(.2,.6,.2,1) infinite}
  .zghero .core .ripple.b{animation:zg-ripple 3.6s cubic-bezier(.2,.6,.2,1) infinite;animation-delay:1.8s}
  .zghero .core .disc{position:absolute;inset:42px;border-radius:50%;background:radial-gradient(circle at 40% 35%,var(--orange-pale) 0%,var(--orange-bright) 30%,var(--orange) 60%,#c5471d 100%);box-shadow:0 0 60px var(--orange-glow),0 0 120px rgba(240,106,50,.3),inset 0 -9px 20px rgba(120,40,10,.5),inset 0 6px 14px rgba(255,210,180,.45);animation:zg-discBreathe 3s ease-in-out infinite}
  .zghero .core .flash{position:absolute;inset:28px;border-radius:50%;background:radial-gradient(circle,rgba(255,225,200,.95) 0%,transparent 58%);opacity:0;z-index:9}
  .zghero .core .flash.active{animation:zg-flashPop .5s ease-out}
  .zghero .core .mark{position:relative;z-index:10;font-family:'Playfair Display',serif;font-style:italic;font-weight:600;font-size:50px;color:#fff;text-shadow:0 3px 22px rgba(90,25,5,.8)}

  .zghero .calendar{
    position:absolute;right:5vw;top:50%;
    transform:translateY(-50%) perspective(1500px) rotateY(-12deg) rotateX(2deg);
    width:420px;z-index:7;
    background:linear-gradient(160deg,rgba(46,32,25,.6),rgba(10,8,6,.82));
    border:1px solid rgba(255,255,255,.1);border-radius:30px;padding:30px 30px 26px;
    backdrop-filter:blur(28px);
    box-shadow:0 70px 120px -36px rgba(0,0,0,.94),0 0 110px -14px rgba(240,106,50,.3),inset 0 1px 0 rgba(255,255,255,.13),inset 0 -38px 70px -34px rgba(0,0,0,.6);
    animation:zg-floaty 7.5s ease-in-out infinite;
  }
  .zghero .cal-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px}
  .zghero .cal-head .month{font-family:'Playfair Display',serif;font-size:30px;line-height:1;color:var(--text)}
  .zghero .cal-head .month small{display:block;font-family:'Manrope',sans-serif;font-size:12px;font-weight:500;color:var(--muted);letter-spacing:.04em;margin-top:5px}
  .zghero .cal-head .live{display:flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--orange-soft);font-weight:600}
  .zghero .cal-head .live .d{width:7px;height:7px;border-radius:50%;background:var(--orange-bright);box-shadow:0 0 9px var(--orange-glow);animation:zg-pulse 1.6s infinite}

  .zghero .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:9px}
  .zghero .cal-grid .dow{text-align:center;font-size:11px;font-weight:700;color:var(--muted-dim);padding-bottom:4px;letter-spacing:.03em}
  .zghero .cal-grid .cell{aspect-ratio:1;border-radius:13px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;color:var(--muted);transition:transform .45s cubic-bezier(.34,1.56,.64,1),background .45s,box-shadow .45s,color .45s}
  .zghero .cal-grid .cell.empty{background:none;border:none}
  .zghero .cal-grid .cell.filled{background:linear-gradient(155deg,var(--orange-bright),var(--orange));color:#fff;font-weight:700;border-color:transparent;box-shadow:0 6px 20px var(--orange-glow)}
  .zghero .cal-grid .cell.justfilled{animation:zg-dayPop .65s cubic-bezier(.34,1.56,.64,1)}

  .zghero .cal-foot{margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between}
  .zghero .cal-foot .count{display:flex;align-items:baseline;gap:9px}
  .zghero .cal-foot .count b{color:#fff;font-size:32px;font-family:'Playfair Display',serif;line-height:1}
  .zghero .cal-foot .count span{font-size:13px;color:var(--muted)}
  .zghero .cal-foot .tag{font-size:11px;font-weight:600;color:var(--orange-pale);background:rgba(240,106,50,.13);border:1px solid rgba(240,106,50,.26);padding:7px 13px;border-radius:999px}

  .zghero .visitor{position:absolute;left:0;top:0;opacity:0;z-index:5;will-change:transform,opacity}
  .zghero .av{position:relative;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.18);box-shadow:0 4px 14px rgba(0,0,0,.4),0 0 16px rgba(240,106,50,.25),inset 0 2px 4px rgba(255,255,255,.25);overflow:hidden}
  .zghero .av::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 50%)}
  .zghero .av svg{width:62%;height:62%;position:relative;z-index:2}
  .zghero .av .head{fill:rgba(255,255,255,.92)}
  .zghero .av .body{fill:rgba(255,255,255,.82)}
  .zghero .av .ring-glow{position:absolute;inset:-5px;border-radius:50%;border:1.5px solid rgba(255,180,130,.5);opacity:0}

  .zghero .spark{position:absolute;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle,#fff 0%,var(--orange-bright) 45%,var(--orange) 100%);box-shadow:0 0 26px var(--orange-glow),0 0 50px rgba(240,106,50,.4);z-index:6;opacity:0;will-change:transform,opacity}

  .zghero .caption{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);text-align:center;font-size:18px;color:var(--muted);line-height:1.5;z-index:20;width:92%;font-weight:400}
  .zghero .caption b{color:var(--text);font-weight:600}
  .zghero .caption i{font-family:'Playfair Display',serif;font-style:italic;color:var(--orange-soft);font-weight:500}

  @keyframes zg-pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes zg-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
  @keyframes zg-discBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  @keyframes zg-haloPulse{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
  @keyframes zg-ripple{0%{transform:scale(.7);opacity:.55}100%{transform:scale(2.6);opacity:0}}
  @keyframes zg-flashPop{0%{opacity:0;transform:scale(.7)}40%{opacity:1;transform:scale(1.05)}100%{opacity:0;transform:scale(1.25)}}
  @keyframes zg-floaty{0%,100%{transform:translateY(-50%) perspective(1500px) rotateY(-12deg) rotateX(2deg)}50%{transform:translateY(-53%) perspective(1500px) rotateY(-12deg) rotateX(2deg)}}
  @keyframes zg-dayPop{0%{transform:scale(1)}45%{transform:scale(1.22)}100%{transform:scale(1.06)}}

  @media (max-width:900px){
    .zghero .core{left:36%;width:140px;height:140px}.zghero .core .disc{inset:32px}.zghero .core .ripple{inset:18px}.zghero .core .mark{font-size:40px}
    .zghero .calendar{width:300px;right:4vw;padding:22px 22px 20px}
    .zghero .cal-head .month{font-size:24px}.zghero .cal-grid{gap:6px}.zghero .cal-grid .cell{font-size:12px;border-radius:10px}
    .zghero .cal-foot .count b{font-size:26px}
    .zghero .caption{font-size:15px;bottom:30px}
  }
`;

export function ZenGrowHero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scene = root.querySelector<HTMLElement>("[data-zg-scene]");
    const flash = root.querySelector<HTMLElement>("[data-zg-flash]");
    const canvas = root.querySelector<HTMLCanvasElement>("[data-zg-fx]");
    const grid = root.querySelector<HTMLElement>("[data-zg-calgrid]");
    const counter = root.querySelector<HTMLElement>("[data-zg-count]");

    if (!scene || !flash || !canvas || !grid || !counter) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sceneEl = scene;
    const flashEl = flash;
    const canvasEl = canvas;
    const gridEl = grid;
    const counterEl = counter;
    const ctx2d = ctx;

    let destroyed = false;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const rafIds: number[] = [];

    const scheduleTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!destroyed) fn();
      }, ms);
      timeoutIds.push(id);
      return id;
    };

    const scheduleRaf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame((time) => {
        const idx = rafIds.indexOf(id);
        if (idx !== -1) rafIds.splice(idx, 1);
        if (!destroyed) fn(time);
      });
      rafIds.push(id);
      return id;
    };

    const personSVG = `<svg viewBox="0 0 24 24"><circle class="head" cx="12" cy="8.5" r="3.6"/><path class="body" d="M5.5 20c0-3.6 2.9-6.3 6.5-6.3s6.5 2.7 6.5 6.3z"/></svg>`;
    const rect = () => sceneEl.getBoundingClientRect();
    const palettes = [
      ["#ff8347", "#e0551f"],
      ["#f5894f", "#d9491a"],
      ["#ffb088", "#f06a32"],
      ["#ff9d5c", "#e85d22"],
      ["#f7a06b", "#e05a28"],
      ["#ffa873", "#d6531d"],
      ["#ffc4a0", "#f5894f"],
      ["#ff7d42", "#c5471d"],
    ];

    let W: number,
      H: number,
      DPR: number;
    function resize() {
      const r = rect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvasEl.width = W * DPR;
      canvasEl.height = H * DPR;
      canvasEl.style.width = W + "px";
      canvasEl.style.height = H + "px";
      ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const trails: { x: number; y: number; r: number; life: number }[] = [];
    const ambient: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];
    function seedAmbient() {
      ambient.length = 0;
      const n = Math.round(W / 22);
      for (let i = 0; i < n; i++)
        ambient.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          a: Math.random() * 0.4 + 0.1,
        });
    }
    seedAmbient();
    window.addEventListener("resize", seedAmbient);

    function fxLoop() {
      if (destroyed) return;
      ctx2d.clearRect(0, 0, W, H);
      for (const p of ambient) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, 7);
        ctx2d.fillStyle = `rgba(240,106,50,${p.a})`;
        ctx2d.fill();
      }
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.02;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        ctx2d.beginPath();
        ctx2d.arc(t.x, t.y, t.r * t.life, 0, 7);
        ctx2d.fillStyle = `rgba(255,150,90,${t.life * 0.4})`;
        ctx2d.shadowBlur = 12;
        ctx2d.shadowColor = "rgba(240,106,50,.6)";
        ctx2d.fill();
        ctx2d.shadowBlur = 0;
      }
      scheduleRaf(fxLoop);
    }
    fxLoop();

    ["L", "M", "M", "J", "V", "S", "D"].forEach((d) => {
      const e = document.createElement("div");
      e.className = "dow";
      e.textContent = d;
      gridEl.appendChild(e);
    });
    const dayCells: HTMLDivElement[] = [];
    for (let i = 0; i < 2; i++) {
      const e = document.createElement("div");
      e.className = "cell empty";
      gridEl.appendChild(e);
    }
    for (let day = 1; day <= 31; day++) {
      const e = document.createElement("div");
      e.className = "cell";
      e.textContent = String(day);
      gridEl.appendChild(e);
      dayCells.push(e);
    }
    let count = 0;
    const fillOrder = [
      2, 5, 8, 9, 12, 15, 16, 18, 19, 22, 23, 25, 1, 4, 6, 11, 14, 17, 20, 7, 10, 13, 3, 21, 24, 26, 28,
      29, 30,
    ];
    let fillIdx = 0;
    function fillDay() {
      if (fillIdx >= fillOrder.length) {
        fillIdx = 0;
        dayCells.forEach((c) => c.classList.remove("filled"));
        count = 0;
      }
      const cell = dayCells[fillOrder[fillIdx]];
      if (cell && !cell.classList.contains("filled")) {
        cell.classList.add("filled", "justfilled");
        scheduleTimeout(() => cell.classList.remove("justfilled"), 650);
        count++;
        counterEl.textContent = String(count);
      }
      fillIdx++;
    }

    function center() {
      const r = rect();
      return { x: r.width * 0.42, y: r.height / 2 };
    }
    function calTarget() {
      const cal = rootRef.current?.querySelector<HTMLElement>(".calendar");
      if (!cal) return { x: 0, y: 0 };
      const cr = cal.getBoundingClientRect();
      const sr = rect();
      return { x: cr.left - sr.left + cr.width / 2, y: cr.top - sr.top + cr.height / 2 };
    }

    function emitSpark() {
      const s = document.createElement("div");
      s.className = "spark";
      sceneEl.appendChild(s);
      const c = center();
      const tg = calTarget();
      const cpX = (c.x + tg.x) / 2,
        cpY = c.y - 100;
      const dur = 900,
        start = performance.now();
      function step(now: number) {
        if (destroyed) {
          s.remove();
          return;
        }
        let t = (now - start) / dur;
        if (t > 1) t = 1;
        const mt = 1 - t;
        const x = mt * mt * c.x + 2 * mt * t * cpX + t * t * tg.x;
        const y = mt * mt * c.y + 2 * mt * t * cpY + t * t * tg.y;
        s.style.left = x + "px";
        s.style.top = y + "px";
        s.style.opacity = String(t < 0.15 ? t / 0.15 : t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1);
        s.style.transform = `scale(${1 - t * 0.55})`;
        trails.push({ x, y, r: 5, life: 1 });
        if (t < 1) scheduleRaf(step);
        else s.remove();
      }
      scheduleRaf(step);
      scheduleTimeout(fillDay, 640);
    }

    function spawnVisitor() {
      const v = document.createElement("div");
      v.className = "visitor";
      const size = 34 + Math.random() * 16;
      const pal = palettes[Math.floor(Math.random() * palettes.length)];
      v.innerHTML = `<div class="av" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 38% 32%, ${pal[0]}, ${pal[1]})">${personSVG}<span class="ring-glow"></span></div>`;
      sceneEl.appendChild(v);
      const rg = v.querySelector<HTMLElement>(".ring-glow");
      const r = rect();
      const c = center();
      const edge = Math.random();
      let sx: number, sy: number;
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
      const tx = c.x - size / 2,
        ty = c.y - size / 2;
      const cpX = sx + (tx - sx) * 0.5 + (Math.random() * 160 - 80);
      const cpY = sy + (ty - sy) * 0.5 + (Math.random() * 180 - 90);
      const dur = 2400 + Math.random() * 1200,
        start = performance.now();
      function step(now: number) {
        if (destroyed) {
          v.remove();
          return;
        }
        let t = (now - start) / dur;
        if (t > 1) t = 1;
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const mt = 1 - e;
        const x = mt * mt * sx + 2 * mt * e * cpX + e * e * tx;
        const y = mt * mt * sy + 2 * mt * e * cpY + e * e * ty;
        v.style.left = x + "px";
        v.style.top = y + "px";
        v.style.opacity = String(t < 0.12 ? t / 0.12 : t > 0.86 ? 1 - (t - 0.86) / 0.14 : 1);
        const sc = t > 0.78 ? 1 - ((t - 0.78) / 0.22) * 0.55 : 1;
        v.style.transform = `scale(${sc})`;
        if (rg) {
          if (t > 0.6) rg.style.opacity = String(Math.min((t - 0.6) / 0.4, 1));
        }
        if (t > 0.1 && t < 0.92 && Math.random() > 0.5)
          trails.push({ x: x + size / 2, y: y + size / 2, r: 3, life: 0.7 });
        if (t < 1) scheduleRaf(step);
        else {
          flashEl.classList.remove("active");
          void flashEl.offsetWidth;
          flashEl.classList.add("active");
          emitSpark();
          v.remove();
        }
      }
      scheduleRaf(step);
    }

    for (let i = 0; i < 6; i++) scheduleTimeout(spawnVisitor, i * 180);
    function loop() {
      if (destroyed) return;
      spawnVisitor();
      scheduleTimeout(loop, 380 + Math.random() * 300);
    }
    scheduleTimeout(loop, 300);

    return () => {
      destroyed = true;
      timeoutIds.forEach(clearTimeout);
      rafIds.forEach(cancelAnimationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", seedAmbient);
      rootRef.current?.querySelectorAll(".visitor, .spark").forEach((el) => el.remove());
      gridEl.replaceChildren();
      trails.length = 0;
      ambient.length = 0;
    };
  }, []);

  return (
    <div ref={rootRef} className="zghero w-full">
      <style dangerouslySetInnerHTML={{ __html: ZG_HERO_STYLES }} />
      <div className="bg">
        <div className="grad" />
        <div className="grid" />
        <div className="noise" />
        <div className="floor" />
      </div>

      <div className="scene" data-zg-scene>
        <div className="rays" />
        <div className="halo" />
        <canvas className="fx" data-zg-fx />

        <div className="core">
          <span className="orbit o1" />
          <span className="orbit o2" />
          <span className="ripple a" />
          <span className="ripple b" />
          <span className="disc" />
          <span className="flash" data-zg-flash />
          <span className="mark">Z</span>
        </div>

        <div className="calendar">
          <div className="cal-head">
            <span className="month">
              Mai<small>2026</small>
            </span>
            <span className="live">
              <span className="d" />
              En direct
            </span>
          </div>
          <div className="cal-grid" data-zg-calgrid />
          <div className="cal-foot">
            <div className="count">
              <b data-zg-count>0</b>
              <span>réservations ce mois</span>
            </div>
            <span className="tag">Auto · IA</span>
          </div>
        </div>

        <p className="caption">
          L&apos;IA qui transforme vos <b>visiteurs</b> en <i>réservations</i>.
        </p>
      </div>
    </div>
  );
}
