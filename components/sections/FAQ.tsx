"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const faqs = [
  {
    id: "q1",
    q: "ZenGrow remplace-t-il mon site actuel ?",
    a: "ZenGrow peut remplacer une page trop compliquée ou compléter votre site existant avec une page pensée pour la réservation.",
  },
  {
    id: "q2",
    q: "Est-ce seulement un outil de réservation ?",
    a: "Non. ZenGrow combine page restaurant, réservations en ligne, relances IA, campagnes marketing et avis Google.",
  },
  {
    id: "q3",
    q: "L'IA envoie-t-elle les messages automatiquement ?",
    a: "Non. ZenGrow prépare les campagnes, mais vous validez toujours avant l'envoi.",
  },
  {
    id: "q4",
    q: "Est-ce adapté à un petit restaurant ?",
    a: "Oui. ZenGrow est pensé pour être simple, rapide à mettre en place et utile même pour un restaurant indépendant.",
  },
  {
    id: "q5",
    q: "Est-ce que je peux personnaliser ma page ?",
    a: "Oui. Vous pouvez adapter vos textes, photos, horaires, menu, couleurs et informations.",
  },
  {
    id: "q6",
    q: "Pourquoi utiliser l'IA dans un restaurant ?",
    a: "Parce qu'elle aide à faire ce que beaucoup de restaurants n'ont pas le temps de faire : relancer les clients, préparer des campagnes et demander des avis au bon moment.",
  },
] as const;

function FaqItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: (typeof faqs)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          "flex w-full items-start gap-5 py-6 text-left transition-colors sm:py-7",
          isOpen ? "text-[#FFF7EF]" : "text-[#FFF7EF]/90 hover:text-[#FFF7EF]",
        )}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="mt-1 font-landing-serif text-2xl tabular-nums text-[rgba(255,122,61,0.35)] sm:text-3xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium leading-snug sm:text-lg">{item.q}</span>
          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.span
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block overflow-hidden text-sm leading-relaxed text-[#AFA39A]"
              >
                {item.a}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
            isOpen
              ? "border-[rgba(255,122,61,0.4)] bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]"
              : "border-[rgba(255,255,255,0.1)] text-[#AFA39A]",
          )}
        >
          {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
    </li>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>("q1");

  return (
    <section id="faq" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            <span className="text-[#f06a32]">Questions</span> fréquentes
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Ce que les restaurants veulent savoir avant de lancer ZenGrow.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-[rgba(255,122,61,0.12)] bg-[rgba(8,5,4,0.5)] p-1 shadow-[0_48px_120px_-60px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-1.5">
            <ul className="relative divide-y divide-[rgba(255,255,255,0.06)] px-5 sm:px-8 md:px-10">
              {faqs.map((item, i) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  index={i}
                  isOpen={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
