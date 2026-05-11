"use client";

import { motion } from "framer-motion";
import { CalendarDays, LayoutDashboard, Send, Star, UserCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

type FeatureCard = {
  position: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const cards: FeatureCard[] = [
  {
    position: "col-start-1 row-start-1",
    icon: CalendarDays,
    title: "Toutes tes réservations au même endroit",
    description:
      "Vue calendrier, statut de chaque table, pilotage en un coup d'œil. Tu gères ton service depuis un seul écran.",
  },
  {
    position: "col-start-3 row-start-1",
    icon: UserCheck,
    title: "Une base clients qui se construit toute seule",
    description:
      "Chaque réservation enrichit ton fichier. Tu sais qui revient, qui dépense, qui fête son anniversaire.",
  },
  {
    position: "col-start-1 row-start-3",
    icon: Star,
    title: "Ta note Google grimpe sans rien faire",
    description:
      "Email post-visite envoyé tout seul. Plus d'avis, meilleure note, plus de visibilité, plus de réservations.",
  },
  {
    position: "col-start-3 row-start-3",
    icon: Send,
    title: "Des campagnes en 2 clics",
    description:
      "Relance tes inactifs, annonce un événement, fais revenir tes clients fidèles. Tu choisis le message, ZenGrow l'envoie.",
  },
];

function ConnectorLines() {
  const paths = [
    "M 50 50 L 22 24",
    "M 50 50 L 78 24",
    "M 50 50 L 22 76",
    "M 50 50 L 78 76",
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#FF6B2C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="url(#line-grad)"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </svg>
  );
}

export function Connected() {
  return (
    <section id="features" className="relative bg-landing-bg py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(255,107,44,0.1),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Et derrière, une <em className="italic text-landing-accent">vraie plateforme</em> business
          </h2>
          <p className="mt-4 text-landing-muted">
            ZenGrow, c&apos;est bien plus qu&apos;une page web. Une fois le client réservé, tout un système se met en
            marche pour faire grandir ton resto.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-5xl overflow-x-auto pb-2">
          <div className="relative mx-auto min-w-[640px]">
            <ConnectorLines />
            <div className="relative z-10 grid grid-cols-3 grid-rows-3 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12">
              {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.1, duration: 0.55 }}
                    className={`${c.position} rounded-2xl border border-landing-border bg-landing-card/90 p-6 shadow-[0_0_50px_-30px_rgba(255,107,44,0.35)] backdrop-blur-sm`}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-landing-accent/45 bg-landing-accent/10 text-landing-accent-soft">
                      <Icon className="size-5" strokeWidth={1.35} aria-hidden />
                    </div>
                    <h3 className="mt-4 font-landing-serif text-lg font-normal leading-snug text-landing-fg">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">{c.description}</p>
                  </motion.div>
                );
              })}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <motion.div
                  className="relative flex size-24 items-center justify-center rounded-full border border-landing-accent/50 bg-gradient-to-br from-landing-accent/25 to-landing-card text-landing-accent-soft shadow-[0_0_60px_12px_rgba(255,107,44,0.45)]"
                  initial={{ scale: 0.85, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{
                    boxShadow: [
                      "0 0 50px 8px rgba(255,107,44,0.35)",
                      "0 0 72px 18px rgba(255,107,44,0.55)",
                      "0 0 50px 8px rgba(255,107,44,0.35)",
                    ],
                  }}
                  transition={{
                    scale: { duration: 0.55, delay: 0.15 },
                    opacity: { duration: 0.55, delay: 0.15 },
                    boxShadow: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <LayoutDashboard className="size-9 text-landing-accent-soft" strokeWidth={1.25} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
