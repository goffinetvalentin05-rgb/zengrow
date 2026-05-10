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

const hoverGlow =
  "0 24px 56px -22px rgba(0,0,0,0.58), 0 0 44px -6px rgba(255,107,44,0.38)";

type OrbitCardConfig = {
  stat: (typeof stats)[0];
  posClass: string;
  animate: {
    y: number[];
    rotateY: number | number[];
    rotateZ: number;
    scale: number;
    translateZ: number;
  };
  transition: {
    y: { duration: number; repeat: number; ease: "easeInOut"; delay: number };
    rotateY:
      | { duration: number; repeat: number; ease: "easeInOut"; delay: number }
      | { duration: number };
  };
  hoverScale: number;
};

const orbitCards: OrbitCardConfig[] = [
  {
    stat: stats[0],
    posClass:
      "relative z-10 mx-auto w-full max-w-sm md:absolute md:left-[1%] md:top-[58%] md:z-20 md:mx-0 md:w-[min(272px,31vw)] md:-translate-y-1/2 lg:left-[4%]",
    animate: {
      y: [40, 52, 34, 40],
      rotateY: [18, 22, 19, 21, 18],
      rotateZ: -4,
      scale: 0.8,
      translateZ: 40,
    },
    transition: {
      y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.2 },
      rotateY: { duration: 6.8, repeat: Infinity, ease: "easeInOut" as const, delay: 0 },
    },
    hoverScale: 0.85,
  },
  {
    stat: stats[1],
    posClass:
      "relative z-30 mx-auto w-full max-w-sm md:absolute md:left-1/2 md:top-1/2 md:w-[min(340px,34vw)] md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2",
    animate: {
      y: [0, -12, -4, 0],
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      translateZ: 64,
    },
    transition: {
      y: { duration: 4.9, repeat: Infinity, ease: "easeInOut" as const, delay: 0.45 },
      rotateY: { duration: 0 },
    },
    hoverScale: 1.05,
  },
  {
    stat: stats[2],
    posClass:
      "relative z-10 mx-auto w-full max-w-sm md:absolute md:right-[1%] md:top-[38%] md:z-20 md:mx-0 md:w-[min(272px,31vw)] md:-translate-y-1/2 lg:right-[4%]",
    animate: {
      y: [-42, -30, -48, -42],
      rotateY: [-22, -18, -20.5, -19, -22],
      rotateZ: 4,
      scale: 0.8,
      translateZ: 40,
    },
    transition: {
      y: { duration: 5.1, repeat: Infinity, ease: "easeInOut" as const, delay: 0.35 },
      rotateY: { duration: 7.4, repeat: Infinity, ease: "easeInOut" as const, delay: 0.12 },
    },
    hoverScale: 0.85,
  },
];

function HeroOrbitCards() {
  return (
    <div
      className="relative mx-auto w-full min-h-[400px] py-6 sm:min-h-[440px] sm:py-4 md:min-h-[460px]"
      style={{ perspective: "1500px" }}
    >
      <div
        className="relative flex min-h-[400px] flex-col gap-10 sm:min-h-[420px] md:block md:min-h-[440px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {orbitCards.map((cfg, i) => (
          <motion.div
            key={cfg.stat.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.55 }}
            className={cfg.posClass}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="h-full cursor-default rounded-2xl border border-landing-border bg-landing-card/80 p-5 shadow-[0_0_40px_-24px_rgba(255,107,44,0.45)] backdrop-blur-md will-change-transform sm:p-6"
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                y: cfg.animate.y,
                rotateY: cfg.animate.rotateY,
                rotateZ: cfg.animate.rotateZ,
                scale: cfg.animate.scale,
                translateZ: cfg.animate.translateZ,
              }}
              transition={{
                y: cfg.transition.y,
                rotateY:
                  "repeat" in cfg.transition.rotateY
                    ? cfg.transition.rotateY
                    : { duration: 0 },
                rotateZ: { duration: 0 },
                scale: { duration: 0 },
                translateZ: { duration: 0 },
              }}
              whileHover={{
                rotateY: 0,
                rotateZ: 0,
                scale: cfg.hoverScale,
                translateZ: 88,
                boxShadow: hoverGlow,
                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <p className="mb-3 font-landing-serif text-3xl leading-tight text-landing-fg sm:text-4xl">
                {cfg.stat.title}
              </p>
              <p className="text-sm leading-relaxed text-landing-muted">{cfg.stat.body}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
      className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-visible"
    >
      <WaveBackground />

      <div className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-6 pb-28 pt-64 text-center sm:pb-32 sm:pt-72 lg:pb-40 lg:pt-80">
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

        <Reveal delay={0.16} className="w-full max-w-6xl">
          <HeroOrbitCards />
        </Reveal>
      </div>
    </section>
  );
}

export { NeonArc };
