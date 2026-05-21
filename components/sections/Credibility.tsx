"use client";

import { Calendar, Megaphone, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const automations: { label: string; icon: LucideIcon }[] = [
  { label: "Relances clients", icon: Sparkles },
  { label: "Campagnes IA", icon: Megaphone },
  { label: "Avis Google", icon: Star },
  { label: "Réservations", icon: Calendar },
];

export function Credibility() {
  return (
    <section className="relative overflow-x-hidden px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,122,61,0.1)] bg-[rgba(8,5,4,0.45)] px-5 py-8 backdrop-blur-xl sm:rounded-[1.75rem] sm:px-8 sm:py-9">
            <div
              className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.12),transparent_70%)] blur-2xl"
              aria-hidden
            />

            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div>
                <h2 className="font-landing-serif text-[clamp(1.35rem,3vw,1.85rem)] font-normal leading-snug text-[#FFF7EF]">
                  L&apos;IA n&apos;est plus réservée aux grandes entreprises.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#AFA39A] sm:text-[15px]">
                  De plus en plus d&apos;entreprises suisses utilisent l&apos;IA pour gagner du temps et
                  automatiser leurs tâches. ZenGrow applique cette logique aux restaurants : relances
                  clients, campagnes marketing, avis Google et réservations en ligne.
                </p>
              </div>

              <motion.div
                className="rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.05)] p-4 shadow-[0_0_40px_-16px_rgba(255,90,42,0.35)] sm:p-5"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#F6A85A]">
                  Ce que ZenGrow automatise
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-2.5">
                  {automations.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.label}
                        className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.35)] px-2.5 py-2"
                      >
                        <Icon className="size-3.5 shrink-0 text-[#FF7A3D]" strokeWidth={1.5} />
                        <span className="text-[11px] font-medium text-[#FFF7EF] sm:text-xs">
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
