"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Megaphone,
  Smartphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.5rem)] font-normal text-[#FFF7EF]">
            Tout est au <span className="text-[#f06a32]">même endroit</span>.
          </h2>
          <p className="mt-4 text-sm text-[#AFA39A] sm:text-base">
            Plus besoin de jongler entre votre site, vos messages, vos réservations et vos avis.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 lg:mt-16">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
              {/* Carte principale — Page restaurant */}
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.55)] p-6 backdrop-blur-2xl sm:p-8 lg:col-span-7 lg:row-span-2 lg:min-h-[340px]"
                whileHover={{ boxShadow: "0 0 48px -12px rgba(255, 90, 42, 0.2)" }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.15),transparent_70%)] blur-2xl"
                  aria-hidden
                />
                <div className="relative flex h-full flex-col justify-between gap-8 lg:flex-row lg:items-end">
                  <div className="max-w-sm">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.08)] text-[#FF7A3D]">
                      <Smartphone className="size-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-4 font-landing-serif text-2xl text-[#FFF7EF] sm:text-[1.65rem]">
                      Page restaurant mobile-first
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#AFA39A]">
                      Une page rapide, élégante et pensée pour faire réserver.
                    </p>
                  </div>

                  <motion.div
                    className="relative mx-auto w-full max-w-[200px] shrink-0 overflow-hidden rounded-[1.5rem] border border-[rgba(255,122,61,0.25)] bg-[rgba(0,0,0,0.4)] p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] lg:mx-0"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="h-16 rounded-lg bg-gradient-to-br from-[rgba(255,90,42,0.4)] to-[rgba(8,5,4,0.2)]" />
                    <div className="mt-2 space-y-1.5">
                      <div className="h-1.5 w-full rounded-full bg-white/10" />
                      <div className="h-1.5 w-4/5 rounded-full bg-white/6" />
                    </div>
                    <div className="mt-3 rounded-lg bg-[#FF5A2A] py-2 text-center text-[10px] font-semibold text-white">
                      Réserver
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Colonne droite — 2 cartes empilées */}
              <div className="flex flex-col gap-5 lg:col-span-5">
                <motion.div
                  className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.5)] p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Calendar className="size-5 text-[#FF7A3D]" strokeWidth={1.5} />
                  <h3 className="mt-3 text-base font-semibold text-[#FFF7EF]">Réservations en ligne</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#AFA39A]">
                    Vos clients réservent en quelques secondes depuis leur téléphone.
                  </p>
                  <span className="mt-3 inline-block rounded-full border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.06)] px-2.5 py-1 text-[10px] text-[#F6A85A]">
                    Confirmée · 20:00
                  </span>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-[rgba(255,122,61,0.12)] bg-[rgba(255,90,42,0.04)] p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 }}
                >
                  <Users className="size-5 text-[#F6A85A]" strokeWidth={1.5} />
                  <h3 className="mt-3 text-base font-semibold text-[#FFF7EF]">Base clients automatique</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#AFA39A]">
                    Chaque réservation enrichit votre fichier client.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Rangée basse — 3 formats variés */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.05)] p-5 sm:col-span-1"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="size-5 text-[#FF7A3D]" />
                <h3 className="mt-3 text-sm font-semibold text-[#FFF7EF]">Relances IA</h3>
                <p className="mt-1.5 text-xs text-[#AFA39A]">
                  Repérez les clients inactifs et faites-les revenir.
                </p>
                <p className="mt-4 font-landing-serif text-lg text-[#FF7A3D]">30 · 60 · 90 j</p>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.45)] p-5 sm:col-span-1"
                whileHover={{ borderColor: "rgba(255, 122, 61, 0.22)" }}
              >
                <Megaphone className="size-5 text-[#F6A85A]" strokeWidth={1.5} />
                <h3 className="mt-3 text-sm font-semibold text-[#FFF7EF]">Campagnes marketing</h3>
                <p className="mt-1.5 text-xs text-[#AFA39A]">
                  Créez des messages prêts à envoyer en quelques clics.
                </p>
              </motion.div>

              <motion.div
                className="relative rounded-2xl border border-[rgba(255,122,61,0.14)] bg-[rgba(8,5,4,0.55)] p-5 sm:col-span-1"
              >
                <div className="flex items-center gap-1 text-[#F6A85A]">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-3.5 fill-[#FF7A3D] text-[#FF7A3D]" />
                  ))}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#FFF7EF]">Avis Google automatisés</h3>
                <p className="mt-1.5 text-xs text-[#AFA39A]">
                  Demandez plus d&apos;avis aux bons clients, au bon moment.
                </p>
                <span className="mt-3 inline-block text-[10px] text-[#F6A85A]">Avis demandé · validé</span>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
