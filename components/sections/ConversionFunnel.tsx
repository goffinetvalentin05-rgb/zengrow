"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useState, type ReactNode } from "react";

const CLASSIC_COUNT = 10;
const ZENGROW_COUNT = 10;
const STAGGER = 0.3;

type ClassicParticle = { id: string; index: number; abandon: boolean; driftRight: boolean };
type ZenGrowParticle = { id: string; index: number; drifter: boolean };

function Badge({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? "inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-landing-muted"
          : "inline-flex rounded-full border border-landing-accent/35 bg-landing-accent/10 px-3 py-1 text-xs font-medium text-landing-fg"
      }
    >
      {children}
    </div>
  );
}

function ClassicFunnelParticles({ particles }: { particles: ClassicParticle[] }) {
  const topY = 26;
  const bottomY = 218;
  const midY = 108;

  return (
    <>
      {particles.map((p) => {
        const sideX = p.driftRight ? 112 : 8;
        if (p.abandon) {
          return (
            <motion.circle
              key={p.id}
              r={3.2}
              fill="#6b6b6b"
              fillOpacity={0.85}
              initial={false}
              animate={{
                cx: [60, 60, sideX],
                cy: [topY, midY, midY + 18],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3.15,
                times: [0, 0.48, 1],
                repeat: Infinity,
                delay: p.index * STAGGER,
                ease: ["linear", "easeOut"],
              }}
            />
          );
        }
        return (
          <motion.circle
            key={p.id}
            r={3.2}
            fill="#8a8580"
            fillOpacity={0.9}
            initial={false}
            animate={{
              cx: 60,
              cy: [topY, bottomY],
              opacity: 0.75,
            }}
            transition={{
              duration: 3.35,
              repeat: Infinity,
              delay: p.index * STAGGER,
              ease: "linear",
            }}
          />
        );
      })}
    </>
  );
}

function ZenGrowFunnelParticles({ particles, glowFilterId }: { particles: ZenGrowParticle[]; glowFilterId: string }) {
  const topY = 26;
  const bottomY = 218;

  return (
    <>
      {particles.map((p) => {
        if (p.drifter) {
          return (
            <motion.circle
              key={p.id}
              r={3.6}
              fill="#FFA86B"
              filter={`url(#${glowFilterId})`}
              initial={false}
              animate={{
                cx: [60, 68, 62, 54, 58, 60],
                cy: [topY, 72, 118, 158, 198, bottomY],
                opacity: [1, 1, 1, 1, 1, 1],
              }}
              transition={{
                duration: 3.65,
                times: [0, 0.2, 0.4, 0.58, 0.78, 1],
                repeat: Infinity,
                delay: p.index * STAGGER,
                ease: "easeInOut",
              }}
            />
          );
        }
        return (
          <motion.circle
            key={p.id}
            r={3.6}
            fill="#FFA86B"
            filter={`url(#${glowFilterId})`}
            initial={false}
            animate={{
              cx: 60,
              cy: [topY, bottomY],
              opacity: 1,
            }}
            transition={{
              duration: 2.95,
              repeat: Infinity,
              delay: p.index * STAGGER,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          />
        );
      })}
    </>
  );
}

export function ConversionFunnel() {
  const uid = useId().replace(/:/g, "");
  const classicGradId = `${uid}-classic-funnel-grad`;
  const glowId = `${uid}-zg-dot-glow`;

  const [classicParticles, setClassicParticles] = useState<ClassicParticle[] | null>(null);
  const [zengrowParticles, setZengrowParticles] = useState<ZenGrowParticle[] | null>(null);

  useEffect(() => {
    setClassicParticles(
      Array.from({ length: CLASSIC_COUNT }, (_, i) => ({
        id: `classic-${i}`,
        index: i,
        abandon: i < 7,
        driftRight: i % 2 === 0,
      })),
    );
    setZengrowParticles(
      Array.from({ length: ZENGROW_COUNT }, (_, i) => ({
        id: `zg-${i}`,
        index: i,
        drifter: i === 9,
      })),
    );
  }, []);

  return (
    <div className="mx-auto mt-14 w-full max-w-5xl px-1">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-3 lg:gap-6">
        {/* Colonne gauche — site classique */}
        <div className="flex flex-col items-center">
          <p className="mb-3 text-center text-sm text-landing-muted">Site web classique</p>
          <div className="mb-2 flex justify-center">
            <Badge muted>100 visiteurs</Badge>
          </div>
          <div className="relative w-full max-w-[200px] opacity-60 sm:max-w-[220px]">
            <svg viewBox="0 0 120 240" className="h-auto w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id={classicGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3a3a3a" />
                  <stop offset="100%" stopColor="#2c2c2c" />
                </linearGradient>
              </defs>
              <path
                d="M 15 18 L 105 18 L 76 224 L 44 224 Z"
                fill={`url(#${classicGradId})`}
                fillOpacity={0.55}
                stroke="#4a4a4a"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              {classicParticles ? <ClassicFunnelParticles particles={classicParticles} /> : null}
            </svg>
          </div>
          <div className="mt-2 flex justify-center">
            <Badge muted>12 réservations</Badge>
          </div>
        </div>

        {/* Centre — uplift */}
        <div className="flex flex-col items-center justify-center gap-1 px-2 text-center md:min-w-[9rem] lg:min-w-[11rem]">
          <span className="text-landing-muted/80 select-none text-lg font-light md:text-xl" aria-hidden>
            →
          </span>
          <p className="font-landing-serif text-5xl font-normal italic leading-none text-[#FF6B2C] sm:text-6xl md:text-7xl">
            +292%
          </p>
          <p className="max-w-[12rem] text-sm leading-snug text-landing-muted">de réservations en plus</p>
        </div>

        {/* Colonne droite — ZenGrow */}
        <div className="relative flex flex-col items-center">
          <p className="mb-3 text-center text-sm font-medium text-landing-fg">Page ZenGrow</p>
          <div className="mb-2 flex justify-center">
            <Badge>100 visiteurs</Badge>
          </div>
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[52%] h-[min(280px,75vw)] w-[min(260px,78vw)] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(255,107,44,0.38)_0%,rgba(255,168,107,0.12)_45%,transparent_72%)] blur-2xl"
            animate={{ opacity: [0.45, 0.72, 0.45], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <div className="relative z-[1] w-full max-w-[220px] sm:max-w-[240px]">
            <svg viewBox="0 0 120 240" className="h-auto w-full overflow-visible drop-shadow-[0_0_28px_rgba(255,107,44,0.22)]" aria-hidden>
              <defs>
                <linearGradient id={`${uid}-orange-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B2C" />
                  <stop offset="100%" stopColor="#FFA86B" />
                </linearGradient>
                <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 10 18 L 110 18 L 94 224 L 26 224 Z"
                fill={`url(#${uid}-orange-grad)`}
                fillOpacity={0.42}
                stroke="#FF6B2C"
                strokeWidth={1.2}
                strokeOpacity={0.65}
              />
              {zengrowParticles ? <ZenGrowFunnelParticles particles={zengrowParticles} glowFilterId={glowId} /> : null}
            </svg>
          </div>
          <div className="relative z-[1] mt-2 flex justify-center">
            <Badge>47 réservations</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
