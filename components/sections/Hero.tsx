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
      className="relative flex min-h-screen flex-col items-center overflow-hidden pt-32 pb-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,107,44,0.18),transparent)]" />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h1 className="font-landing-serif text-5xl font-normal leading-[1.08] tracking-tight text-landing-fg sm:text-6xl lg:text-7xl">
              Transforme chaque visite en{" "}
              <em className="italic text-landing-accent">réservation</em>
            </h1>
          </Reveal>
          <Reveal delay={0.08} className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-landing-muted">
            <p>
              La page web professionnelle qui transforme chaque visiteur en réservation. Pensée pour les restaurants
              qui veulent grandir.
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
        </div>
      </div>

      <div className="relative z-20 mt-16 w-full max-w-6xl shrink-0 px-4 sm:px-6">
        <div className="relative flex flex-col items-center">
          <div className="relative z-30 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
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
                    className="rounded-2xl border border-landing-border bg-gradient-to-br from-landing-card to-landing-card/50 p-6 text-left shadow-[0_0_40px_-24px_rgba(255,107,44,0.5)] backdrop-blur-sm"
                  >
                    <p className="mb-3 font-landing-serif text-4xl text-landing-fg">{s.value}</p>
                    <p className="text-sm leading-relaxed text-landing-muted">{s.label}</p>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="relative mt-[-2.5rem] h-[min(38vw,420px)] w-full sm:mt-[-3.5rem]">
            <NeonArc />
          </div>

          <div className="relative z-40 mt-4 flex w-full flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
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
      </div>
    </section>
  );
}

export { NeonArc };
