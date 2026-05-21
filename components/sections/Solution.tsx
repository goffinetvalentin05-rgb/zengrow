"use client";

import { Megaphone, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

export function Solution() {
  return (
    <section className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Une page qui réserve. Une IA qui relance.
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            ZenGrow réunit ce qu&apos;un restaurant a vraiment besoin : être trouvé, faire réserver, puis
            faire revenir les clients.
          </p>
        </Reveal>

        <div className="mt-16 space-y-8 lg:space-y-12">
          {/* Bloc 1 — Page */}
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="lg:order-1">
                <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">
                  Votre page donne envie de réserver.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#AFA39A] sm:text-base">
                  Photos, menu, horaires, adresse et bouton de réservation clair sur mobile.
                </p>
              </div>
              <motion.div
                className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.85)] p-4 shadow-2xl lg:order-2 lg:ml-auto"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-20 rounded-xl bg-gradient-to-br from-[rgba(255,90,42,0.35)] to-transparent" />
                <div className="mt-3 rounded-xl bg-[#FF5A2A] py-3 text-center text-sm font-semibold text-white shadow-[0_0_32px_-6px_rgba(255,90,42,0.85)]">
                  Réserver une table
                </div>
              </motion.div>
            </div>
          </Reveal>

          {/* Bloc 2 — Relances */}
          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <motion.div
                className="relative rounded-2xl border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.06)] p-5 sm:p-6"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="font-landing-serif text-2xl text-[#FF7A3D]">37 clients absents depuis 60 jours</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF5A2A] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <Sparkles className="size-4" />
                  Générer une relance
                </button>
              </motion.div>
              <div>
                <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">
                  Vos anciens clients ne sont plus oubliés.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#AFA39A] sm:text-base">
                  ZenGrow repère ceux qui ne sont pas revenus depuis 30, 60 ou 90 jours.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Bloc 3 — Avis */}
          <Reveal delay={0.12}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">
                  Vos clients satisfaits deviennent votre meilleure publicité.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#AFA39A] sm:text-base">
                  Après une visite, ZenGrow aide à récolter plus d&apos;avis Google.
                </p>
              </div>
              <motion.div
                className="relative mx-auto flex w-full max-w-sm items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,5,4,0.75)] p-5 lg:mr-0 lg:ml-auto"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-5 fill-[#F6A85A] text-[#F6A85A]" />
                  ))}
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-[#FF7A3D]" />
                  <span className="text-sm text-[#FFF7EF]">Avis demandé · validé</span>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
