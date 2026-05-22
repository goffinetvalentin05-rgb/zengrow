"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Sparkles, Star } from "lucide-react";
import { GlassCard } from "@/components/landing-page/ui";

/** Dashboard / réservation style Mufi — glow bleu, cartes superposées. */
export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(27,79,255,0.35) 0%, transparent 70%)",
        }}
      />

      <GlassCard strong className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-[rgba(27,79,255,0.2)] pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#8BA3C7]">
              Réservations
            </p>
            <p className="mt-1 zg-lp-display text-lg font-semibold text-[#EEF6FF]">
              Ce soir — 18 couverts
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(27,79,255,0.2)] text-[#3b7bff]">
            <Calendar className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {[
            { name: "Marie D.", time: "19:30", guests: 2, status: "Confirmée" },
            { name: "Thomas L.", time: "20:00", guests: 4, status: "Nouvelle" },
            { name: "Sophie M.", time: "20:30", guests: 2, status: "Confirmée" },
          ].map((row, i) => (
            <motion.li
              key={row.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(27,79,255,0.18)] bg-[rgba(27,79,255,0.06)] px-3 py-2.5"
              initial={{ opacity: 1, x: reduce ? 0 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.45 }}
            >
              <div>
                <p className="text-sm font-medium text-[#EEF6FF]">{row.name}</p>
                <p className="text-xs text-[#8BA3C7]">
                  {row.time} · {row.guests} pers.
                </p>
              </div>
              <span
                className={
                  row.status === "Nouvelle"
                    ? "rounded-full bg-[rgba(27,79,255,0.25)] px-2 py-0.5 text-[10px] font-semibold text-[#3b7bff]"
                    : "text-[10px] text-[#8BA3C7]"
                }
              >
                {row.status}
              </span>
            </motion.li>
          ))}
        </ul>
      </GlassCard>

      <motion.div
        className="relative -mt-6 ml-6 mr-2 sm:ml-10"
        initial={{ opacity: 1, y: reduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(27,79,255,0.22)] text-[#3b7bff]">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-[#8BA3C7]">Relance IA prête</p>
              <p className="mt-1 text-sm leading-snug text-[#EEF6FF]">
                Bonjour Marie, une table vous attend samedi…
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        className="absolute -right-2 top-8 sm:right-0"
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="zg-lp-glass flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#EEF6FF]">
          <Star className="h-3.5 w-3.5 fill-[#1b4fff] text-[#3b7bff]" aria-hidden />
          +12 avis Google
        </div>
      </motion.div>
    </div>
  );
}
