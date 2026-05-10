"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const perks = [
  "Page restaurant pro + réservation intégrée",
  "Personnalisation (photos, couleurs, menu)",
  "Emails & relances marketing",
  "Support en français",
];

export function Tarifs() {
  return (
    <section id="tarifs" className="relative bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,107,44,0.1),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Un tarif <em className="italic text-landing-accent">simple</em>, tout inclus
          </h2>
          <p className="mt-4 text-landing-muted">
            49 CHF/mois TTC. Sans engagement. Offre de lancement : -30% les 3 premiers mois.
          </p>
        </Reveal>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-12 max-w-lg rounded-3xl border border-landing-border bg-landing-card/95 p-8 shadow-[0_0_60px_-24px_rgba(255,107,44,0.45)] backdrop-blur-sm sm:p-10"
        >
          <div className="flex items-end justify-center gap-2">
            <span className="font-landing-serif text-5xl text-landing-fg">49</span>
            <span className="pb-1 text-lg font-medium text-landing-muted">CHF / mois</span>
          </div>
          <p className="mt-2 text-center text-xs text-landing-accent-soft">Puis 34 CHF/mois les 3 premiers mois avec l&apos;offre 🔥</p>
          <ul className="mt-8 space-y-3 text-sm text-landing-fg/90">
            {perks.map((p) => (
              <li key={p} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-landing-accent" strokeWidth={2.5} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Link
            href="#cta"
            className="mt-8 flex min-h-12 w-full items-center justify-center rounded-xl bg-landing-accent text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110"
          >
            Commencer
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
