"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const stats = [
  {
    value: "73%",
    label:
      "des clients abandonnent une réservation qui prend plus de 30 secondes. Chaque seconde compte.",
  },
  {
    value: "2'500 CHF",
    label:
      "économisés en moyenne par rapport à un site web classique + outil de réservation séparé.",
  },
  {
    value: "48h",
    label: "et ta page restaurant est en ligne, optimisée et prête à recevoir tes premières réservations.",
  },
];

function HeroPerspectiveGrid() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60vh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundPosition: "0px 0px" }}
        animate={{ backgroundPosition: ["0px 0px", "0px 60px"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 44, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 44, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center top",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255, 107, 44, 0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />
      <motion.div
        className="absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background: "linear-gradient(to right, transparent 0%, rgba(255, 107, 44, 0.8) 50%, transparent 100%)",
          boxShadow: "0 0 40px rgba(255, 107, 44, 0.6)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,107,44,0.18),transparent)]" />
      <HeroPerspectiveGrid />

      <div className="container relative z-10 mx-auto flex flex-col items-center px-6 text-center">
        <Reveal>
          <h1 className="font-landing-serif text-5xl font-normal leading-[1.08] tracking-tight text-landing-fg sm:text-6xl lg:text-7xl">
            Transforme chaque visite en <em className="italic text-landing-accent">réservation</em>
          </h1>
        </Reveal>
        <Reveal delay={0.08} className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-landing-muted">
          <p>
            La page web professionnelle qui transforme chaque visiteur en réservation. Pensée pour les restaurants qui
            veulent grandir.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-10 flex flex-wrap items-center justify-center gap-4">
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

        <div className="relative z-20 mt-20 w-full max-w-4xl">
          <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {stats.map((s, i) => (
              <div key={s.value} className="min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12 + i * 0.1, duration: 0.55 }}
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-2xl border border-landing-border bg-gradient-to-br from-landing-card to-landing-card/50 p-6 shadow-[0_0_40px_-24px_rgba(255,107,44,0.5)] backdrop-blur-sm"
                  >
                    <p className="mb-3 font-landing-serif text-4xl text-landing-fg">{s.value}</p>
                    <p className="text-sm leading-relaxed text-landing-muted">{s.label}</p>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 mt-10 flex w-full max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-left text-sm text-landing-muted">
            Réservations sans interruption, à toute heure, partout dans le monde.
          </p>
          <Link
            href="#fonctionnalites"
            className="inline-flex items-center gap-2 rounded-full border border-landing-border/80 bg-landing-card/50 px-4 py-2 text-xs font-medium text-landing-fg backdrop-blur-sm transition hover:border-landing-accent/40"
          >
            Explorer
            <ChevronDown className="size-4 text-landing-accent" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export { NeonArc };
