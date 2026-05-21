"use client";

import { Calendar, Megaphone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const pillars = [
  {
    title: "Page de réservation",
    body: "Mobile-first : photos, menu, horaires et bouton de réservation clair.",
    icon: Calendar,
  },
  {
    title: "Campagnes IA",
    body: "Relances et offres générées en quelques secondes — vous validez avant envoi.",
    icon: Megaphone,
  },
  {
    title: "Avis Google",
    body: "Transformez les clients satisfaits en avis visibles au bon moment.",
    icon: Star,
  },
];

export function Solution() {
  return (
    <section className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal leading-tight text-[#FFF7EF]">
            Une page qui réserve.
            <br />
            <span className="italic text-[#FF7A3D]">Une IA qui relance.</span>
          </h2>
          <ul className="mt-10 space-y-8">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.li
                  key={p.title}
                  className="flex gap-5 border-l border-[rgba(255,122,61,0.2)] pl-6"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Icon className="mt-1 size-5 shrink-0 text-[#FF7A3D]" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-landing-serif text-xl text-[#FFF7EF]">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#AFA39A]">{p.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="relative min-h-[360px] lg:min-h-[420px]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(255,90,42,0.12),transparent_65%)]"
            aria-hidden
          />

          <motion.div
            className="absolute left-0 top-0 z-20 w-[min(100%,300px)] rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.75)] p-4 shadow-2xl backdrop-blur-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ rotate: -2 }}
          >
            <div className="h-14 rounded-xl bg-gradient-to-br from-[rgba(255,90,42,0.35)] to-transparent" />
            <p className="mt-3 text-center text-xs font-semibold text-[#FFF7EF]">Réserver une table</p>
          </motion.div>

          <motion.div
            className="absolute right-0 top-[28%] z-30 w-[min(100%,260px)] rounded-2xl border border-[rgba(255,122,61,0.25)] bg-[rgba(255,90,42,0.08)] p-4 backdrop-blur-xl"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ rotate: 2.5 }}
          >
            <Megaphone className="size-4 text-[#FF7A3D]" />
            <p className="mt-2 text-[11px] leading-relaxed text-[#AFA39A]">
              « Bonjour, cela fait un moment que nous ne vous avons pas accueilli… »
            </p>
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-[18%] z-10 flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-md"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Star className="size-4 fill-[#F6A85A] text-[#F6A85A]" />
            <span className="text-xs text-[#FFF7EF]">Avis demandé · validé</span>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
