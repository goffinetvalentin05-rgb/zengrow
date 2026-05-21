"use client";

import { motion } from "framer-motion";
import { CalendarCheck, RefreshCw, Star } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const benefits = [
  {
    icon: CalendarCheck,
    title: "Plus de réservations",
    accent: "from-[#FF5A2A]/25 to-transparent",
    offset: "lg:translate-y-0",
    size: "lg:col-span-5",
  },
  {
    icon: RefreshCw,
    title: "Plus de clients qui reviennent",
    accent: "from-[#F6A85A]/20 to-transparent",
    offset: "lg:translate-y-8",
    size: "lg:col-span-4",
  },
  {
    icon: Star,
    title: "Plus d'avis Google",
    accent: "from-[#FF7A3D]/22 to-transparent",
    offset: "lg:translate-y-4",
    size: "lg:col-span-3",
  },
] as const;

export function WhyZenGrow() {
  return (
    <section className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(480px,80vw)] w-[min(720px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,90,42,0.08),transparent_65%)] blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal leading-tight text-[#FFF7EF]">
            Pourquoi les restaurants utilisent ZenGrow
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#AFA39A] sm:text-lg">
            Parce qu&apos;une page seule ne suffit pas. Il faut aussi faire réserver, relancer et fidéliser.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-16 lg:mt-20">
            <div
              className="pointer-events-none absolute inset-x-8 top-[42%] hidden h-px bg-gradient-to-r from-transparent via-[rgba(255,122,61,0.35)] to-transparent lg:block"
              aria-hidden
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  className={`relative ${b.size} ${b.offset}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.55 }}
                >
                  <div className="group relative h-full min-h-[200px] overflow-hidden rounded-[1.5rem] border border-[rgba(255,122,61,0.14)] bg-[rgba(8,5,4,0.5)] p-6 backdrop-blur-xl sm:min-h-[220px] sm:p-8">
                    <div
                      className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${b.accent} blur-2xl transition-opacity group-hover:opacity-100`}
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] text-[#FF7A3D] shadow-[0_0_24px_-8px_rgba(255,90,42,0.5)]">
                        <b.icon className="size-5" strokeWidth={1.5} />
                      </div>
                      <p className="mt-auto font-landing-serif text-[clamp(1.35rem,2.5vw,1.75rem)] leading-snug text-[#FFF7EF]">
                        {b.title}
                      </p>
                    </div>
                    <motion.div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[rgba(255,122,61,0.5)] via-[rgba(255,122,61,0.15)] to-transparent"
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                      aria-hidden
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
