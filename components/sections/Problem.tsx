"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Sparkles, Star, Users } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const lost = [
  { label: "Visiteurs sans réservation", icon: Users },
  { label: "Clients inactifs", icon: AlertCircle },
  { label: "Avis Google oubliés", icon: Star },
] as const;

const gained = [
  { label: "Réservations", icon: ArrowRight },
  { label: "Relances", icon: Sparkles },
  { label: "Avis collectés", icon: Star },
] as const;

function FlowColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "lost" | "gained";
  items: readonly { label: string; icon: typeof Users }[];
}) {
  const isLost = tone === "lost";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[1.5rem] border p-5 backdrop-blur-2xl sm:p-6",
        isLost
          ? "border-[rgba(255,255,255,0.08)] bg-[rgba(8,5,4,0.65)]"
          : "border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.06)] shadow-[0_0_48px_-16px_rgba(255,90,42,0.3)]",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          isLost ? "text-[#AFA39A]" : "text-[#F6A85A]",
        )}
      >
        {title}
      </p>
      <ul className="mt-5 flex flex-1 flex-col justify-center gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm",
                isLost
                  ? "border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.35)] text-[#AFA39A]"
                  : "border-[rgba(255,122,61,0.15)] bg-[rgba(255,90,42,0.08)] font-medium text-[#FFF7EF]",
              )}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  isLost ? "bg-white/5 text-[#AFA39A]" : "bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]",
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} />
              </span>
              {item.label}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function ZenGrowHub() {
  return (
    <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center px-4 py-8 lg:min-h-0">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-[rgba(255,122,61,0.2)]"
        aria-hidden
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="100" x2="70" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="130" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      <motion.div
        className="absolute size-40 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.2),transparent_70%)] blur-2xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-full border border-[rgba(255,122,61,0.4)] bg-[rgba(255,90,42,0.12)] shadow-[0_0_48px_rgba(255,90,42,0.35)] sm:size-20"
        animate={{ boxShadow: ["0 0 32px rgba(255,90,42,0.25)", "0 0 56px rgba(255,90,42,0.4)", "0 0 32px rgba(255,90,42,0.25)"] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="size-7 text-[#FF7A3D] sm:size-8" />
      </motion.div>

      <p className="relative z-10 mt-5 text-center font-landing-serif text-lg text-[#FFF7EF] sm:text-xl">
        Moteur IA ZenGrow
      </p>
      <p className="relative z-10 mt-2 max-w-[14rem] text-center text-xs leading-relaxed text-[#AFA39A]">
        Détecte, propose et automatise — vous gardez le contrôle.
      </p>
    </div>
  );
}

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.75rem,4vw,2.65rem)] font-normal leading-tight text-[#FFF7EF]">
            Votre restaurant reçoit des visites. Mais combien deviennent vraiment des réservations ?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
            ZenGrow transforme les opportunités perdues en actions concrètes pour votre établissement.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(200px,0.85fr)_1fr] lg:gap-5 lg:items-stretch">
            <FlowColumn title="Opportunités perdues" tone="lost" items={lost} />
            <ZenGrowHub />
            <FlowColumn title="Résultats" tone="gained" items={gained} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
