"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Bell } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const NOTIFICATION_LINES = [
  "Table 2 · 19h00 · 2 personnes",
  "Table 4 · 19h30 · 4 personnes",
  "Table 8 · 20h00 · 6 personnes",
  "Table 1 · 20h15 · 2 personnes",
  "Table 5 · 20h30 · 3 personnes",
  "Table 12 · 21h00 · 5 personnes",
  "Table 3 · 21h15 · 2 personnes",
  "Table 7 · 21h45 · 4 personnes",
] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop";

type SlotConfig = {
  className: string;
  initial: { x: number; y: number };
  exit: { x: number; y: number };
};

const SLOT_DESKTOP: SlotConfig[] = [
  { className: "top-[5%] left-0", initial: { x: -50, y: -12 }, exit: { x: -50, y: -12 } },
  { className: "top-[10%] right-0", initial: { x: 50, y: -12 }, exit: { x: 50, y: -12 } },
  { className: "top-[40%] left-[-5%]", initial: { x: -50, y: 0 }, exit: { x: -50, y: 0 } },
  { className: "top-[35%] right-[-5%]", initial: { x: 50, y: 0 }, exit: { x: 50, y: 0 } },
  { className: "bottom-[15%] left-[5%]", initial: { x: -50, y: 12 }, exit: { x: -50, y: 12 } },
  { className: "bottom-[10%] right-0", initial: { x: 50, y: 12 }, exit: { x: 50, y: 12 } },
];

/** Mobile : une notif au-dessus, une en dessous (centrées) */
const SLOT_COMPACT: SlotConfig[] = [
  { className: "top-0 left-1/2 -translate-x-1/2", initial: { x: 0, y: -44 }, exit: { x: 0, y: -44 } },
  { className: "bottom-0 left-1/2 -translate-x-1/2", initial: { x: 0, y: 44 }, exit: { x: 0, y: 44 } },
];

type ActiveNotif = {
  id: string;
  lineIndex: number;
  slot: number;
  createdAt: number;
};

const ENTER_MS = 400;
const STAY_MS = 3000;
/** Déclenche la disparition (exit ~0,4s) après entrée + 3s bien visibles */
const REMOVE_AFTER_MS = ENTER_MS + STAY_MS;
const SPAWN_INTERVAL_MS = 1200;

function useMediaMode() {
  const [mode, setMode] = useState<"compact" | "tablet" | "desktop" | null>(null);

  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      if (w < 768) setMode("compact");
      else if (w < 1024) setMode("tablet");
      else setMode("desktop");
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return mode;
}

function pickSlot(used: Set<number>, slotCount: number): number {
  for (let i = 0; i < slotCount; i++) {
    if (!used.has(i)) return i;
  }
  return 0;
}

function NotificationCard({
  line,
  createdAt,
  now,
}: {
  line: string;
  createdAt: number;
  now: number;
}) {
  const sec = Math.max(0, Math.floor((now - createdAt) / 1000));
  const label =
    sec === 0 ? "à l'instant" : sec === 1 ? "il y a 1 seconde" : `il y a ${sec} secondes`;

  return (
    <div
      className="w-[240px] max-w-[min(240px,calc(100vw-2rem))] rounded-xl border border-landing-accent/40 bg-landing-card p-4 shadow-[0_0_32px_-8px_rgba(255,107,44,0.45)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-landing-fg">
        <Bell className="size-4 shrink-0 text-landing-accent" aria-hidden />
        Nouvelle réservation
      </div>
      <p className="mt-2 text-base text-landing-fg">{line}</p>
      <p className="mt-1 text-xs text-landing-muted">{label}</p>
    </div>
  );
}

export function BrowserMockup() {
  const baseId = useId();
  const idRef = useRef(0);
  const lineRef = useRef(0);
  const [active, setActive] = useState<ActiveNotif[]>([]);
  const [nowTick, setNowTick] = useState(0);
  const mode = useMediaMode();

  const slotConfigs = useMemo(() => {
    if (!mode) return SLOT_DESKTOP;
    if (mode === "desktop") return SLOT_DESKTOP;
    if (mode === "tablet") return SLOT_DESKTOP.slice(0, 4);
    return SLOT_COMPACT;
  }, [mode]);

  const slotCount = slotConfigs.length;

  useEffect(() => {
    setNowTick(Date.now());
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (mode === null) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const addOne = () => {
      const id = `${baseId}-n-${idRef.current++}`;
      const idx = lineRef.current % NOTIFICATION_LINES.length;
      lineRef.current += 1;
      const createdAt = Date.now();

      setActive((prev) => {
        const used = new Set(prev.map((p) => p.slot));
        let slot = pickSlot(used, slotCount);
        let base = prev;
        if (used.size >= slotCount && prev.length > 0) {
          base = prev.slice(1);
          const used2 = new Set(base.map((p) => p.slot));
          slot = pickSlot(used2, slotCount);
        }
        return [...base, { id, lineIndex: idx, slot, createdAt }];
      });

      timeouts.push(
        setTimeout(() => {
          setActive((p) => p.filter((x) => x.id !== id));
        }, REMOVE_AFTER_MS),
      );
    };

    addOne();
    const interval = setInterval(addOne, SPAWN_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      setActive([]);
    };
  }, [baseId, mode, slotCount]);

  const t = nowTick;

  return (
    <div className="relative mx-auto max-w-6xl min-h-[600px] px-4 pb-28 pt-8 sm:px-8 sm:pb-24 sm:pt-10 md:min-h-[620px] md:px-10 md:pb-20 lg:min-h-[640px] lg:px-14 lg:pb-16 lg:pt-12">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,70vh)] w-[min(900px,95%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent/[0.22] blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[800px] justify-center">
        <div
          className="relative w-full [perspective:1500px]"
          style={{
            filter: "drop-shadow(0 28px 56px rgba(255, 107, 44, 0.38))",
          }}
        >
          <motion.div
            className="mx-auto w-full max-w-[800px] will-change-transform"
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="origin-center overflow-hidden rounded-2xl border border-landing-border bg-landing-card"
              style={{
                transform: "rotateX(5deg) rotateY(-3deg)",
              }}
            >
              <div className="flex h-10 items-center gap-3 border-b border-landing-border bg-[#0f0c0a] px-3 sm:h-[40px] sm:px-4">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-[#ff5f57] sm:size-[12px]" />
                  <span className="size-3 rounded-full bg-[#febc2e] sm:size-[12px]" />
                  <span className="size-3 rounded-full bg-[#28c840] sm:size-[12px]" />
                </div>
                <div className="flex min-w-0 flex-1 justify-center">
                  <div className="truncate rounded-full border border-landing-border/80 bg-landing-card/90 px-3 py-1 text-center text-[11px] text-landing-muted sm:text-xs">
                    lerestodupere.ch
                  </div>
                </div>
                <div className="w-14 shrink-0 sm:w-16" aria-hidden />
              </div>

              <div className="bg-landing-card">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={HERO_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-landing-accent/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="font-landing-serif text-3xl font-normal leading-tight text-white sm:text-4xl md:text-[2.75rem]">
                      Le Resto du Père
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
                      <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                        ★ 4.8 · 234 avis
                      </span>
                      <span className="text-xs text-white/80 sm:text-sm">Cuisine française · Bienne</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-landing-accent py-3 text-center text-sm font-semibold text-white shadow-[0_12px_36px_-12px_rgba(255,107,44,0.65)] transition hover:bg-landing-accent-soft hover:text-landing-bg sm:py-3.5 sm:text-base"
                  >
                    Réserver une table
                  </button>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-landing-muted sm:text-sm">
                    <span>Mar–Sam 11h30–14h · 18h30–22h</span>
                    <span className="text-landing-accent-soft underline-offset-2 hover:underline">
                      Voir le menu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {mode !== null ? (
        <div className="pointer-events-none absolute inset-0 z-20 max-lg:px-2 lg:pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {active.map((n) => {
              const cfg = slotConfigs[n.slot % slotConfigs.length];
              if (!cfg) return null;
              return (
                <motion.div
                  key={n.id}
                  layout
                  className={`pointer-events-auto absolute z-20 max-lg:max-w-[min(240px,calc(100%-1rem))] ${cfg.className}`}
                  initial={{ opacity: 0, x: cfg.initial.x, y: cfg.initial.y }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: cfg.exit.x, y: cfg.exit.y }}
                  transition={{
                    duration: ENTER_MS / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <NotificationCard line={NOTIFICATION_LINES[n.lineIndex]} createdAt={n.createdAt} now={t} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
