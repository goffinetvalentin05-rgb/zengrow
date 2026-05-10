"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";
import { WaveBackground } from "@/components/sections/WaveBackground";

const stats = [
  {
    title: "10 minutes",
    body: "C'est tout ce qu'il te faut pour créer ta page restaurant et commencer à recevoir des réservations. Pas de développeur, pas de jargon technique.",
  },
  {
    title: "2'500 CHF économisés",
    body: "Pas besoin de payer un site web séparé, un outil de réservation et un système d'avis. ZenGrow regroupe tout pour 49 CHF/mois.",
  },
  {
    title: "+40% de réservations",
    body: "Une page optimisée conversion, c'est en moyenne 40% de réservations en plus par rapport à un site classique sans formulaire intégré.",
  },
];

const statTilt = [
  { rotateY: 11, baseScale: 1, translateZ: 0 },
  { rotateY: 0, baseScale: 1.065, translateZ: 32 },
  { rotateY: -11, baseScale: 1, translateZ: 0 },
] as const;

const statFloat = [
  { duration: 4.35, delay: 0 },
  { duration: 5.4, delay: 0.62 },
  { duration: 3.55, delay: 0.33 },
] as const;

/** Arc néon (utilisé par la section CTA uniquement). */
function NeonArc({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center"
      style={{
        bottom: flip ? undefined : "-18%",
        top: flip ? "-18%" : undefined,
        transform: flip ? "scaleY(-1)" : undefined,
      }}
      aria-hidden
    >
      <div className="relative h-[min(42vw,520px)] w-[min(125vw,1400px)]">
        <div
          className="absolute inset-0 rounded-[100%] border border-landing-accent/35"
          style={{
            boxShadow:
              "0 -40px 120px 40px rgba(255, 107, 44, 0.45), inset 0 0 80px rgba(255, 168, 107, 0.12)",
          }}
        />
        <div
          className="absolute inset-[2px] rounded-[100%] bg-gradient-to-t from-landing-accent/25 via-landing-accent-soft/10 to-transparent"
          style={{ filter: "blur(2px)" }}
        />
        <motion.div
          className="absolute left-1/2 top-0 h-[45%] w-[55%] -translate-x-1/2 rounded-[100%] bg-white/25 blur-[100px] opacity-70"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="accueil"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden"
    >
      <WaveBackground />

      <div className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-6 text-center">
        <Reveal>
          <h1 className="font-landing-serif text-5xl font-normal leading-[1.08] tracking-tight text-landing-fg sm:text-6xl lg:text-7xl">
            Transforme chaque visite en <em className="italic text-landing-accent">réservation</em>
          </h1>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto max-w-2xl text-lg leading-relaxed text-landing-muted">
          <p>
            La page web professionnelle qui transforme chaque visiteur en réservation. Pensée pour les restaurants qui
            veulent grandir.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#cta"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-landing-accent px-7 text-sm font-semibold text-white shadow-[0_0_48px_-10px_rgba(255,107,44,0.85)] transition hover:brightness-110"
          >
            Démarrer maintenant
          </Link>
          <Link
            href="#demo"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-landing-border bg-landing-card/40 px-7 text-sm font-semibold text-landing-fg backdrop-blur-sm transition hover:border-landing-accent/50 hover:bg-landing-card/70"
          >
            Voir une démo
          </Link>
        </Reveal>

        <Reveal delay={0.16} className="w-full max-w-5xl">
          <div
            className="grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3 sm:gap-5"
            style={{ perspective: "1200px" }}
          >
            {stats.map((s, i) => {
              const tilt = statTilt[i];
              const fl = statFloat[i];
              const hoverScale = i === 1 ? 1.09 : 1.045;

              return (
                <div key={s.title} className="min-h-0 [transform-style:preserve-3d]">
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 + i * 0.1, duration: 0.55 }}
                    className="h-full [transform-style:preserve-3d]"
                  >
                    <motion.div
                      className="h-full cursor-default rounded-2xl border border-landing-border bg-landing-card/80 p-6 shadow-[0_0_40px_-24px_rgba(255,107,44,0.45)] backdrop-blur-md will-change-transform"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{
                        y: [0, -11, 0],
                        rotateY: tilt.rotateY,
                        rotateX: 0,
                        scale: tilt.baseScale,
                        translateZ: tilt.translateZ,
                      }}
                      transition={{
                        y: {
                          duration: fl.duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: fl.delay,
                        },
                        rotateY: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                        rotateX: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                        translateZ: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                      }}
                      whileHover={{
                        rotateY: 0,
                        rotateX: 0,
                        scale: hoverScale,
                        translateZ: 52,
                        boxShadow:
                          "0 24px 56px -22px rgba(0,0,0,0.6), 0 0 48px -8px rgba(255,107,44,0.42)",
                        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                      }}
                    >
                      <p className="mb-3 font-landing-serif text-3xl leading-tight text-landing-fg sm:text-4xl">
                        {s.title}
                      </p>
                      <p className="text-sm leading-relaxed text-landing-muted">{s.body}</p>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { NeonArc };
