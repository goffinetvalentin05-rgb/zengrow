"use client";

import { Calendar, Megaphone, Sparkles, Star } from "lucide-react";
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

function SolutionProductScene() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,90,42,0.14),transparent_70%)] blur-2xl"
        aria-hidden
      />

      {/* Carte principale — mini page restaurant */}
      <motion.div
        className="relative z-20 overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.22)] bg-[rgba(8,5,4,0.85)] shadow-[0_40px_100px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
          <span className="ml-2 text-[9px] text-[#AFA39A]">votre-restaurant.zengrow.ch</span>
        </div>
        <div className="p-4">
          <div className="h-24 rounded-xl bg-gradient-to-br from-[rgba(255,90,42,0.35)] via-[rgba(255,90,42,0.08)] to-transparent" />
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-3/4 rounded-full bg-white/8" />
            <div className="h-2 w-1/2 rounded-full bg-white/5" />
          </div>
          <motion.div
            className="mt-4 rounded-xl bg-[#FF5A2A] py-3 text-center text-sm font-semibold text-white shadow-[0_0_32px_-6px_rgba(255,90,42,0.85)]"
            animate={{ boxShadow: ["0 0 24px -6px rgba(255,90,42,0.7)", "0 0 40px -4px rgba(255,90,42,0.9)", "0 0 24px -6px rgba(255,90,42,0.7)"] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            Réserver une table
          </motion.div>
        </div>
      </motion.div>

      {/* Carte relance IA — flottante, liée visuellement */}
      <motion.div
        className="absolute -right-2 top-[18%] z-30 w-[min(100%,220px)] rounded-2xl border border-[rgba(255,122,61,0.28)] bg-[rgba(12,8,6,0.95)] p-3.5 shadow-[0_20px_60px_-16px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:-right-4 sm:w-[240px]"
        animate={{ y: [0, 5, 0], x: [0, 2, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{ rotate: 2 }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-[#FF7A3D]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#F6A85A]">
            Relance IA
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#AFA39A]">
          « Bonjour, cela fait un moment que nous ne vous avons pas accueilli. Revenez découvrir notre
          carte… »
        </p>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-md border border-white/10 px-2 py-0.5 text-[9px] text-[#AFA39A]">
            Modifier
          </span>
          <span className="rounded-md bg-[rgba(255,90,42,0.2)] px-2 py-0.5 text-[9px] font-medium text-[#FF7A3D]">
            Valider
          </span>
        </div>
      </motion.div>

      {/* Badge avis — ancré en bas à gauche de la scène */}
      <motion.div
        className="absolute -bottom-2 left-0 z-40 flex items-center gap-2.5 rounded-full border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.92)] py-2 pl-2 pr-4 shadow-lg backdrop-blur-md sm:-bottom-3 sm:left-2"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-[rgba(255,90,42,0.15)]">
          <Star className="size-4 fill-[#F6A85A] text-[#F6A85A]" />
        </span>
        <div>
          <p className="text-[11px] font-medium text-[#FFF7EF]">Avis Google</p>
          <p className="text-[9px] text-[#AFA39A]">Demandé · validé par vous</p>
        </div>
      </motion.div>

      {/* Ligne de connexion décorative entre page et relance */}
      <svg
        className="pointer-events-none absolute right-[18%] top-[32%] z-[25] hidden h-16 w-20 text-[rgba(255,122,61,0.2)] sm:block"
        viewBox="0 0 80 64"
        aria-hidden
      >
        <path d="M 0 32 Q 40 8 80 32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
      </svg>
    </div>
  );
}

export function Solution() {
  return (
    <section className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
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

        <Reveal delay={0.1} className="flex justify-center lg:justify-end lg:pr-4">
          <div className="relative min-h-[380px] w-full max-w-[400px] pb-8 pt-4 sm:min-h-[420px]">
            <SolutionProductScene />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
