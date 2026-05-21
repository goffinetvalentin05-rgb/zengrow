"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const faqs = [
  {
    id: "q1",
    q: "ZenGrow est-il seulement un outil de réservation ?",
    a: "Non. ZenGrow combine une page restaurant pensée pour convertir, les réservations en ligne, les relances clients par IA, les campagnes marketing et les avis Google automatisés.",
  },
  {
    id: "q2",
    q: "Ai-je besoin d'un site web existant ?",
    a: "Non. ZenGrow peut servir de page principale pour votre restaurant ou compléter votre présence actuelle.",
  },
  {
    id: "q3",
    q: "L'IA envoie-t-elle automatiquement les campagnes ?",
    a: "Non. ZenGrow prépare et génère les campagnes, mais vous gardez toujours la validation avant l'envoi.",
  },
  {
    id: "q4",
    q: "Est-ce adapté aux petits restaurants ?",
    a: "Oui. ZenGrow a été pensé pour être simple, rapide à mettre en place et utile dès les premières réservations.",
  },
  {
    id: "q5",
    q: "Puis-je personnaliser ma page restaurant ?",
    a: "Oui. Vous pouvez personnaliser vos textes, vos photos, vos horaires, votre menu et l'apparence générale de votre page.",
  },
  {
    id: "q6",
    q: "Puis-je annuler à tout moment ?",
    a: "Oui. Vous gardez la liberté d'arrêter ou de faire évoluer votre abonnement selon vos besoins.",
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
    <li
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        isOpen
          ? "border-[rgba(255,122,61,0.3)] bg-[rgba(255,90,42,0.07)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_36px_-10px_rgba(255,90,42,0.28)]"
          : "border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.45)] hover:border-[rgba(255,122,61,0.18)]",
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition",
            isOpen
              ? "border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]"
              : "border-[rgba(255,255,255,0.08)] text-[#AFA39A]",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1 pt-0.5 text-sm font-medium leading-snug text-[#FFF7EF] sm:text-base">
          {item.q}
        </span>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border transition",
            isOpen
              ? "border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.12)] text-[#FF7A3D]"
              : "border-[rgba(255,255,255,0.08)] text-[#AFA39A]",
          )}
        >
          {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="border-t border-[rgba(255,255,255,0.06)] px-5 pb-6 pl-[4.25rem] pr-6 text-sm leading-relaxed text-[#AFA39A] sm:px-6 sm:pl-[4.5rem]">
              {item.a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>("q1");
  const left = faqs.slice(0, 3);
  const right = faqs.slice(3, 6);

  return (
    <section id="faq" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Tout ce qu&apos;il faut savoir avant de lancer ZenGrow pour votre restaurant.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.14)] bg-[rgba(10,7,5,0.55)] p-5 shadow-[0_40px_100px_-48px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8 md:p-10">
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.12),transparent_70%)] blur-2xl"
              aria-hidden
            />

            <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
              <ul className="flex flex-col gap-4">
                {left.map((item, i) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    index={i}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </ul>
              <ul className="flex flex-col gap-4">
                {right.map((item, i) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    index={i + 3}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
