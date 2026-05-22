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
    a: "Non. ZenGrow combine page de réservation, relances IA, campagnes marketing et avis Google.",
  },
  {
    id: "q2",
    q: "Est-ce que ZenGrow peut remplacer mon site ?",
    a: "Oui. ZenGrow peut servir de page principale pour votre restaurant ou compléter votre site actuel avec une page pensée pour convertir.",
  },
  {
    id: "q3",
    q: "L'IA envoie-t-elle les messages automatiquement ?",
    a: "Non. ZenGrow prépare les messages, mais vous gardez toujours la validation avant l'envoi.",
  },
  {
    id: "q4",
    q: "Pourquoi les avis Google sont importants ?",
    a: "Parce qu'ils rassurent les futurs clients. Une meilleure réputation en ligne peut aider votre restaurant à inspirer plus de confiance avant la réservation.",
  },
  {
    id: "q5",
    q: "Est-ce adapté à un petit restaurant ?",
    a: "Oui. ZenGrow est pensé pour être simple, rapide à mettre en place et utile même pour un restaurant indépendant.",
  },
  {
    id: "q6",
    q: "Puis-je personnaliser ma page ?",
    a: "Oui. Vous pouvez modifier vos textes, photos, horaires, menu, couleurs et informations.",
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
          isOpen ? "text-[#EEF6FF]" : "text-[#EEF6FF]/90 hover:text-[#EEF6FF]",
        )}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="mt-1 font-landing-serif text-2xl tabular-nums text-[rgba(59,158,255,0.35)] sm:text-3xl">
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
                className="block overflow-hidden text-sm leading-relaxed text-[#8BA3C7]"
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
              ? "border-[rgba(43,140,255,0.45)] bg-[rgba(43,140,255,0.15)] text-[#5EB3FF]"
              : "border-[rgba(255,255,255,0.1)] text-[#8BA3C7]",
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
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#EEF6FF]">
            Questions fréquentes
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-[rgba(59,158,255,0.14)] bg-[rgba(6,16,36,0.5)] p-1 shadow-[0_48px_120px_-60px_rgba(0,0,0,0.95),0_0_60px_-30px_rgba(43,140,255,0.15)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-1.5">
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
