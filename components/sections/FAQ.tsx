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

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>("q1");

  return (
    <section id="faq" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F6A85A]">FAQ</p>
          <h2 className="mt-4 font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Tout ce qu&apos;il faut savoir avant de lancer ZenGrow pour votre restaurant.
          </p>
        </Reveal>

        <ul className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openId === item.id;
            return (
              <Reveal key={item.id} delay={i * 0.05}>
                <li
                  className={cn(
                    "overflow-hidden rounded-2xl border transition duration-300",
                    isOpen
                      ? "border-[rgba(255,122,61,0.28)] bg-[rgba(255,90,42,0.06)] shadow-[0_0_40px_-12px_rgba(255,90,42,0.25)]"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.55)] hover:border-[rgba(255,122,61,0.15)]",
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    <span className="text-sm font-medium text-[#FFF7EF] sm:text-base">{item.q}</span>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition",
                        isOpen
                          ? "border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]"
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
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-[rgba(255,255,255,0.06)] px-5 pb-5 pt-3 text-sm leading-relaxed text-[#AFA39A] sm:px-6">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
