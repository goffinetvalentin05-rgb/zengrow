"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Globe,
  Megaphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const features = [
  { label: "Page de réservation", icon: Globe, size: "hero" as const },
  { label: "Réservations en ligne", icon: Calendar, size: "md" as const },
  { label: "Base clients", icon: Users, size: "md" as const },
  { label: "Relances IA", icon: Sparkles, size: "sm" as const },
  { label: "Campagnes marketing", icon: Megaphone, size: "sm" as const },
  { label: "Avis Google", icon: Star, size: "md" as const },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.5rem)] font-normal text-[#EEF6FF]">
            Tout ce qu&apos;il faut pour convertir et fidéliser.
          </h2>
          <p className="mt-4 text-sm text-[#8BA3C7] sm:text-base">
            ZenGrow centralise votre page, vos réservations, vos clients, vos campagnes et vos avis Google.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 lg:mt-16">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(59,158,255,0.22)] bg-[rgba(6,16,36,0.55)] p-6 backdrop-blur-2xl sm:p-8 lg:col-span-7 lg:row-span-2 lg:min-h-[300px]"
                whileHover={{ boxShadow: "0 0 48px -12px rgba(43, 140, 255, 0.22)" }}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(43,140,255,0.18),transparent_70%)] blur-2xl"
                  aria-hidden
                />
                <Globe className="size-6 text-[#5EB3FF]" strokeWidth={1.5} />
                <h3 className="mt-4 font-landing-serif text-2xl text-[#EEF6FF] sm:text-[1.65rem]">
                  {features[0].label}
                </h3>
                <motion.div
                  className="relative mx-auto mt-8 w-full max-w-[220px] overflow-hidden rounded-2xl border border-[rgba(59,158,255,0.28)] bg-[rgba(0,0,0,0.35)] p-3 lg:ml-0 lg:mr-auto"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="h-16 rounded-lg bg-gradient-to-br from-[rgba(43,140,255,0.4)] to-transparent" />
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" />
                  <div className="mt-2 rounded-lg bg-[#2B8CFF] py-2 text-center text-[10px] font-semibold text-white">
                    Réserver
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex flex-col gap-5 lg:col-span-5">
                {features.slice(1, 3).map((f, i) => (
                  <motion.div
                    key={f.label}
                    className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,36,0.45)] p-5 backdrop-blur-xl"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <f.icon className="size-5 text-[#5EB3FF]" strokeWidth={1.5} />
                    <h3 className="mt-3 text-base font-semibold text-[#EEF6FF]">{f.label}</h3>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
              {features.slice(3).map((f, i) => (
                <motion.div
                  key={f.label}
                  className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl ${
                    i === 0
                      ? "border-[rgba(43,140,255,0.28)] bg-[rgba(43,140,255,0.08)] shadow-[0_0_40px_-12px_rgba(43,140,255,0.35)]"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,36,0.45)]"
                  }`}
                  animate={i === 0 ? { y: [0, -4, 0] } : undefined}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <f.icon className="size-5 text-[#5EB3FF]" strokeWidth={1.5} />
                  <h3 className="mt-3 text-sm font-semibold text-[#EEF6FF]">{f.label}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
