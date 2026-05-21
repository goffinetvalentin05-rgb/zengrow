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
import { cn } from "@/src/lib/utils";

const features: { title: string; body: string; icon: LucideIcon; span?: string; offset?: string }[] = [
  {
    title: "Page restaurant mobile-first",
    body: "Une page rapide et élégante, pensée pour faire réserver.",
    icon: Globe,
    span: "md:col-span-2",
  },
  {
    title: "Réservations en ligne",
    body: "Vos clients réservent en quelques secondes depuis leur téléphone.",
    icon: Calendar,
    offset: "md:mt-8",
  },
  {
    title: "Base clients automatique",
    body: "Chaque réservation enrichit votre fichier client.",
    icon: Users,
  },
  {
    title: "Relances IA",
    body: "Repérez les clients inactifs et relancez-les facilement.",
    icon: Sparkles,
    span: "md:col-span-2",
    offset: "md:-mt-4",
  },
  {
    title: "Campagnes marketing",
    body: "Générez des messages prêts à envoyer en quelques clics.",
    icon: MessageSquare,
    offset: "md:mt-6",
  },
  {
    title: "Avis Google automatisés",
    body: "Demandez plus d'avis aux bons clients, au bon moment.",
    icon: Star,
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-landing-serif text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-[#FFF7EF]">
              Tout ce qu&apos;il faut, sans outil compliqué
            </h2>
          </div>
          <p className="max-w-xs text-sm text-[#AFA39A] sm:text-right">
            Six piliers pour convertir, relancer et faire grandir votre restaurant.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.04} className={cn(f.span, f.offset)}>
                <motion.div
                  className="group h-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.55)] p-5 backdrop-blur-xl transition duration-300 hover:border-[rgba(255,122,61,0.22)] hover:shadow-[0_0_36px_-10px_rgba(255,90,42,0.2)]"
                  whileHover={{ y: -3 }}
                >
                  <div className="flex size-9 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.08)] text-[#FF7A3D]">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[#FFF7EF]">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#AFA39A]">{f.body}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
