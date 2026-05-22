"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  Megaphone,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const FLOAT_CARDS = [
  {
    label: "Clients à relancer",
    value: "12",
    sub: "inactifs 30+ jours",
    icon: Users,
    position: "left-[4%] top-[12%] md:left-[2%] md:top-[18%]",
    delay: 0,
  },
  {
    label: "Campagne IA prête",
    value: "Mardi soir",
    sub: "à remplir",
    icon: Megaphone,
    position: "right-[2%] top-[8%] md:right-[0%] md:top-[14%]",
    delay: 0.15,
  },
  {
    label: "Demandes d'avis",
    value: "8",
    sub: "cette semaine",
    icon: Star,
    position: "left-[6%] bottom-[14%] md:left-[4%] md:bottom-[18%]",
    delay: 0.3,
  },
  {
    label: "Réservations",
    value: "+24%",
    sub: "ce mois-ci",
    icon: CalendarCheck,
    position: "right-[4%] bottom-[12%] md:right-[2%] md:bottom-[16%]",
    delay: 0.45,
  },
] as const;

export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl md:mt-16">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,70vw)] w-[min(640px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, rgba(99,102,241,0.15) 50%, transparent 72%)",
        }}
        aria-hidden
      />

      {!reduce
        ? FLOAT_CARDS.map((card) => (
            <motion.div
              key={card.label}
              className={`absolute z-20 hidden w-[11.5rem] sm:block ${card.position}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + card.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5 + card.delay * 2, repeat: Infinity, ease: "easeInOut" }}
                className="zg-lp-glass zg-lp-glass--strong rounded-xl p-3.5 shadow-lg"
              >
                <div className="flex items-start gap-2.5">
                  <div className="zg-lp-icon-wrap size-9 shrink-0 rounded-lg">
                    <card.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--zg-muted)]">
                      {card.label}
                    </p>
                    <p className="zg-lp-display text-sm font-bold text-[var(--zg-fg)]">{card.value}</p>
                    <p className="text-xs text-[var(--zg-muted-soft)]">{card.sub}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))
        : null}

      <motion.div
        className="zg-lp-mockup relative z-10 mx-auto w-full overflow-hidden p-4 sm:p-5 md:p-6"
        initial={reduce ? undefined : { opacity: 0, y: 28 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--zg-border-soft)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-500/20">
              <Sparkles className="size-4 text-violet-300" />
            </div>
            <div>
              <p className="zg-lp-display text-sm font-bold text-[var(--zg-fg)]">ZenGrow</p>
              <p className="text-xs text-[var(--zg-muted)]">Tableau de bord restaurateur</p>
            </div>
          </div>
          <span className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-200">
            Mardi soir à remplir
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "Réservations", stat: "47", trend: "+12 cette semaine", color: "from-violet-500/25" },
            { title: "Relances IA", stat: "5", trend: "messages prêts", color: "from-indigo-500/25" },
            { title: "Avis Google", stat: "4.8", trend: "+6 nouveaux avis", color: "from-fuchsia-500/20" },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-xl border border-[var(--zg-border-soft)] bg-gradient-to-br ${item.color} to-transparent p-4`}
            >
              <p className="text-xs font-medium text-[var(--zg-muted)]">{item.title}</p>
              <p className="zg-lp-display mt-1 text-2xl font-bold">{item.stat}</p>
              <p className="mt-1 text-xs text-violet-300/90">{item.trend}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--zg-border-soft)] bg-black/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="size-4 text-violet-400" />
            <p className="text-sm font-semibold text-[var(--zg-fg)]">Suggestion IA</p>
          </div>
          <p className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2.5 text-sm leading-relaxed text-[var(--zg-muted)]">
            Relancer les clients venus il y a plus de 30 jours avec une offre mardi soir.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Valider", "Modifier", "Planifier"].map((action) => (
              <span
                key={action}
                className="rounded-md border border-[var(--zg-border-soft)] px-2.5 py-1 text-xs font-medium text-[var(--zg-fg)]"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
