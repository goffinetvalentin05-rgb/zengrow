"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LandingBadge } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

export function AITrend() {
  return (
    <section id="tendance" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <LandingBadge>IA · Restaurants</LandingBadge>
            <h2 className="mt-6 font-landing-serif text-[clamp(1.85rem,4vw,2.65rem)] font-normal leading-tight text-[#EEF6FF]">
              Les entreprises passent à l&apos;IA. Votre restaurant aussi peut prendre de l&apos;avance.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#8BA3C7] sm:text-lg">
              ZenGrow rend l&apos;IA simple et utile pour les restaurants : relancer les anciens clients,
              préparer des campagnes, récolter plus d&apos;avis Google et transformer plus de visiteurs en
              réservations.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#8BA3C7]/95 sm:text-base">
              Pas besoin d&apos;un outil compliqué. ZenGrow transforme l&apos;IA en actions concrètes pour
              remplir vos tables plus souvent.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(43,140,255,0.22),transparent_65%)] blur-2xl"
                aria-hidden
              />

              <motion.div
                className="relative overflow-hidden rounded-[2rem] border border-[rgba(59,158,255,0.22)] bg-[rgba(6,16,36,0.6)] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9),0_0_80px_-24px_rgba(43,140,255,0.35)] backdrop-blur-2xl sm:p-8"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  aria-hidden
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(59, 158, 255, 0.14) 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B8CFF] to-[#1565C0] shadow-[0_0_24px_-4px_rgba(43,140,255,0.8)]">
                    <Sparkles className="size-4 text-white" />
                  </span>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#5EB3FF]">
                    Prise d&apos;avance
                  </p>
                </div>

                <div className="relative mt-8 space-y-3">
                  {["Visiteur", "Réservation", "Retour client"].map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          i === 2
                            ? "bg-[rgba(43,140,255,0.2)] text-[#5EB3FF] shadow-[0_0_20px_rgba(43,140,255,0.4)]"
                            : "bg-[rgba(255,255,255,0.06)] text-[#8BA3C7]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#EEF6FF]">{step}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="pointer-events-none absolute -right-4 top-1/2 hidden h-32 w-32 rounded-full border border-[rgba(56,212,255,0.15)] sm:block"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                  style={{
                    borderStyle: "dashed",
                    maskImage: "radial-gradient(circle, transparent 55%, black 56%)",
                  }}
                />
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -left-3 hidden rounded-full border border-[rgba(59,158,255,0.25)] bg-[rgba(4,12,28,0.92)] px-3 py-1.5 text-[10px] text-[#5EB3FF] backdrop-blur-md sm:block"
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                aria-hidden
              >
                Simple · Utile · Concret
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
