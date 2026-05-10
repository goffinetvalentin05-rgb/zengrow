"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const logos = ["Logo 1", "Logo 2", "Logo 3", "Logo 4", "Logo 5", "Logo 6"];

function WireframeGlobe() {
  const longitudes = Array.from({ length: 14 }, (_, i) => (i * 180) / 14);
  const latitudes = [-60, -30, 0, 30, 60];

  return (
    <div className="relative mx-auto flex max-w-lg justify-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,420px)] w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,44,0.22)_0%,transparent_55%)] blur-[80px] opacity-80"
        aria-hidden
      />
      <motion.svg
        viewBox="-110 -110 220 220"
        className="relative z-10 h-[min(72vw,380px)] w-[min(72vw,380px)] text-landing-accent"
        aria-hidden
      >
        <defs>
          <filter id="zg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }}
        >
          <g transform="translate(0,0)">
            {longitudes.map((deg) => (
              <ellipse
                key={`lon-${deg}`}
                cx="0"
                cy="0"
                rx="92"
                ry="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeOpacity="0.45"
                transform={`rotate(${deg})`}
                filter="url(#zg-glow)"
              />
            ))}
            {latitudes.map((lat, i) => {
              const t = (lat / 90) * (Math.PI / 2);
              const ry = 92 * Math.cos(t);
              const y = 92 * Math.sin(t);
              return (
                <ellipse
                  key={`lat-${i}`}
                  cx="0"
                  cy={y}
                  rx={ry}
                  ry={Math.max(ry * 0.08, 1.2)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                  strokeOpacity="0.4"
                  filter="url(#zg-glow)"
                />
              );
            })}
            <circle cx="0" cy="0" r="92" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.55" />
          </g>
        </motion.g>
        {[
          [48, -30],
          [-55, 22],
          [40, 58],
          [-38, -52],
          [0, 88],
          [82, 10],
          [-72, -8],
        ].map(([x, y], i) => (
          <circle key={`n-${i}`} cx={x} cy={y} r="2.2" fill="#FFA86B" opacity="0.95" filter="url(#zg-glow)" />
        ))}
      </motion.svg>
    </div>
  );
}

export function Globe() {
  return (
    <section id="demo" className="relative overflow-hidden bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(255,107,44,0.12),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Conçu pour les restaurants qui veulent <em className="italic text-landing-accent">grandir</em>
          </h2>
          <p className="mt-4 text-landing-muted">
            Une vitrine en ligne digne d&apos;un grand établissement — sans l&apos;agence, sans la complexité.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-14">
          <WireframeGlobe />
        </Reveal>
        <Reveal delay={0.15} className="mt-16">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-landing-border/60 pt-10">
            {logos.map((name) => (
              <span
                key={name}
                className="text-sm font-medium tracking-wide text-landing-fg/25"
              >
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
