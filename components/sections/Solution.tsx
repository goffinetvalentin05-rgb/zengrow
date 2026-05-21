"use client";

import { Calendar, Megaphone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

export function Solution() {
  return (
    <section className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.75rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Une page qui réserve. Une IA qui relance.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[auto_auto] md:gap-5">
          <Reveal className="md:col-span-7 md:row-span-2">
            <motion.div
              className="group relative h-full min-h-[320px] overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.16)] bg-[rgba(10,7,5,0.65)] p-6 backdrop-blur-2xl sm:p-8"
              whileHover={{ boxShadow: "0 0 60px -12px rgba(255, 90, 42, 0.25)" }}
            >
              <div className="flex size-11 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] text-[#FF7A3D]">
                <Calendar className="size-5" />
              </div>
              <h3 className="mt-5 font-landing-serif text-2xl text-[#FFF7EF]">Page de réservation</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#AFA39A]">
                Une page mobile-first avec vos photos, votre menu, vos horaires et un bouton de réservation
                clair.
              </p>
              <div className="absolute -bottom-6 -right-4 w-[min(100%,280px)] rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(0,0,0,0.5)] p-4 shadow-2xl sm:w-[72%]">
                <div className="h-20 rounded-xl bg-gradient-to-br from-[rgba(255,90,42,0.3)] to-transparent" />
                <div className="mt-3 rounded-xl bg-[#FF5A2A] py-2.5 text-center text-xs font-semibold text-white shadow-[0_0_30px_-6px_rgba(255,90,42,0.8)]">
                  Réserver une table
                </div>
              </div>
            </motion.div>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-5">
            <motion.div
              className="relative min-h-[200px] overflow-hidden rounded-[1.5rem] border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.06)] p-5 backdrop-blur-2xl"
              whileHover={{ y: -4 }}
            >
              <Megaphone className="size-5 text-[#FF7A3D]" />
              <h3 className="mt-3 font-landing-serif text-xl text-[#FFF7EF]">Campagnes IA</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#AFA39A]">
                Relances, offres et campagnes générées en quelques secondes.
              </p>
              <div className="mt-4 rounded-xl border border-[rgba(255,122,61,0.15)] bg-[rgba(0,0,0,0.35)] p-3 text-[11px] text-[#AFA39A]">
                « Bonjour, cela fait un moment… »
              </div>
            </motion.div>
          </Reveal>

          <Reveal delay={0.14} className="md:col-span-5">
            <motion.div
              className="relative min-h-[180px] overflow-hidden rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,7,5,0.6)] p-5 backdrop-blur-2xl md:-mt-2"
              whileHover={{ y: -4 }}
            >
              <Star className="size-5 fill-[#F6A85A] text-[#F6A85A]" />
              <h3 className="mt-3 font-landing-serif text-xl text-[#FFF7EF]">Avis Google</h3>
              <p className="mt-2 text-xs text-[#AFA39A]">
                Transformez les clients satisfaits en avis visibles, au bon moment.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] p-3">
                <div className="size-9 rounded-full bg-[rgba(255,90,42,0.2)]" />
                <div>
                  <p className="text-xs font-medium text-[#FFF7EF]">Client satisfait</p>
                  <p className="text-[10px] text-[#AFA39A]">Demande validée</p>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
