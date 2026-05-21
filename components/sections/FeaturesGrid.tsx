"use client";

import {
  Calendar,
  Globe,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const features: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "Page restaurant mobile-first", body: "Une page rapide et élégante, pensée pour faire réserver.", icon: Globe },
  { title: "Réservations en ligne", body: "Vos clients réservent en quelques secondes depuis leur téléphone.", icon: Calendar },
  { title: "Base clients automatique", body: "Chaque réservation enrichit votre fichier client.", icon: Users },
  { title: "Relances IA", body: "Repérez les clients inactifs et relancez-les facilement.", icon: Sparkles },
  { title: "Campagnes marketing", body: "Générez des messages prêts à envoyer en quelques clics.", icon: MessageSquare },
  { title: "Avis Google automatisés", body: "Demandez plus d'avis aux bons clients, au bon moment.", icon: Star },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.5rem)] font-normal text-[#FFF7EF]">
            Tout ce qu&apos;il faut, sans outil compliqué
          </h2>
          <p className="mt-4 text-sm text-[#AFA39A]">
            Six piliers pour convertir, relancer et faire grandir votre restaurant.
          </p>
        </Reveal>

        <ol className="relative mt-14 space-y-0">
          <div
            className="pointer-events-none absolute bottom-4 left-[1.15rem] top-4 w-px bg-gradient-to-b from-[rgba(255,122,61,0.4)] via-[rgba(255,122,61,0.15)] to-transparent sm:left-6"
            aria-hidden
          />

          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.05}>
                <motion.li
                  className="group relative flex gap-6 border-b border-[rgba(255,255,255,0.04)] py-8 last:border-0 sm:gap-8 sm:py-10"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.25)] bg-[#050403] font-landing-serif text-sm text-[#FF7A3D] sm:size-12 sm:text-base">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-[rgba(255,122,61,0.5)]" strokeWidth={1.5} />
                      <h3 className="text-base font-semibold text-[#FFF7EF] sm:text-lg">{f.title}</h3>
                    </div>
                    <p className="mt-2 pl-7 text-sm leading-relaxed text-[#AFA39A]">{f.body}</p>
                  </div>
                </motion.li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
