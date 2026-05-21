"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const plans = [
  {
    key: "starter",
    title: "Starter",
    price: "39",
    description:
      "Pour les restaurants qui veulent une page simple avec réservations en ligne.",
    features: [
      "Page restaurant mobile-first",
      "Réservations en ligne",
      "Informations essentielles",
      "Support standard",
    ],
    featured: false,
  },
  {
    key: "growth",
    title: "Growth",
    price: "79",
    badge: "Le plus choisi",
    description:
      "Pour les restaurants qui veulent convertir plus et faire revenir leurs clients.",
    features: [
      "Tout Starter",
      "Base clients automatique",
      "Avis Google automatisés",
      "Campagnes IA",
      "Relances clients",
    ],
    featured: true,
  },
  {
    key: "premium",
    title: "Premium",
    price: "149",
    description:
      "Pour les établissements qui veulent aller plus loin avec l'IA et l'automatisation.",
    features: [
      "Tout Growth",
      "Relances avancées",
      "Campagnes plus poussées",
      "Outils IA avancés",
      "Support prioritaire",
    ],
    featured: false,
  },
] as const;

export function Tarifs() {
  return (
    <section id="pricing" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F6A85A]">Tarifs</p>
          <h2 className="mt-4 font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Des tarifs pensés pour les restaurants
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Choisissez l&apos;offre adaptée à votre établissement et commencez à transformer vos visiteurs
            en réservations.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-5 lg:items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-[1.5rem] border p-6 backdrop-blur-2xl sm:p-7",
                plan.featured
                  ? "z-10 border-[rgba(255,122,61,0.32)] bg-[rgba(255,90,42,0.08)] shadow-[0_0_64px_-16px_rgba(255,90,42,0.45)] lg:scale-[1.04] lg:py-9"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(10,7,5,0.6)]",
              )}
            >
              {"badge" in plan && plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(255,122,61,0.35)] bg-[#FF5A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,90,42,0.5)]">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">{plan.title}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-landing-serif text-4xl tabular-nums text-[#FFF7EF]">{plan.price}</span>
                <span className="pb-1 text-sm text-[#AFA39A]">CHF/mois</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#AFA39A]">{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm text-[#FFF7EF]/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#FF7A3D]" strokeWidth={2.5} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={cn(
                  "mt-8 flex min-h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                  plan.featured
                    ? "bg-[#FF5A2A] text-white shadow-[0_0_40px_-8px_rgba(255,90,42,0.85)] hover:bg-[#FF7A3D]"
                    : "border border-[rgba(255,255,255,0.12)] text-[#FFF7EF] hover:border-[rgba(255,122,61,0.35)] hover:bg-[rgba(255,90,42,0.08)]",
                )}
              >
                Commencer
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
