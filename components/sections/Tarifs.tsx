"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { LANDING_PRICING_CARDS } from "@/src/lib/billing/landing-plans";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

export function Tarifs() {
  const catalogByKey = Object.fromEntries(ZENGROW_PLAN_CATALOG.map((p) => [p.key, p]));

  return (
    <section id="pricing" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[min(400px,60vw)] w-[min(700px,95vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(43,140,255,0.1),transparent_65%)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#EEF6FF]">
            Choisissez l&apos;offre adaptée à votre restaurant.
          </h2>
          <p className="mt-3 text-sm text-[#8BA3C7]">
            {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit sur les offres en ligne
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-5">
            {LANDING_PRICING_CARDS.map((card, i) => {
              const catalog = card.planKey ? catalogByKey[card.planKey] : null;
              const featured = card.featured;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className={cn(
                    "relative flex flex-col rounded-[1.75rem] border p-6 backdrop-blur-2xl sm:p-7",
                    featured
                      ? "z-10 border-[rgba(43,140,255,0.38)] bg-[rgba(43,140,255,0.1)] shadow-[0_0_72px_-16px_rgba(43,140,255,0.45)] lg:-mt-4 lg:mb-4 lg:scale-[1.03]"
                      : "border-[rgba(59,158,255,0.14)] bg-[rgba(6,16,36,0.55)] lg:mt-6",
                  )}
                >
                  {card.badge ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(59,158,255,0.4)] bg-[#2B8CFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(43,140,255,0.5)]">
                      {card.badge}
                    </span>
                  ) : null}

                  <p className="font-landing-serif text-xl text-[#EEF6FF]">{card.headline}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8BA3C7]">{card.description}</p>

                  {card.priceLabel ? (
                    <p className="mt-6 font-landing-serif text-3xl text-[#EEF6FF]">
                      {catalog?.priceAmount ?? ""}
                      <span className="ml-1 text-base font-normal text-[#8BA3C7]">CHF / mois</span>
                    </p>
                  ) : (
                    <p className="mt-6 text-sm text-[#8BA3C7]">Tarif sur mesure</p>
                  )}

                  {catalog ? (
                    <ul className="mt-5 space-y-2 border-t border-[rgba(255,255,255,0.06)] pt-5">
                      {catalog.features.slice(0, 4).map((line) => (
                        <li key={line} className="flex gap-2 text-xs text-[#EEF6FF]/85">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-[#5EB3FF]" strokeWidth={2.5} />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    href={card.cta.href}
                    className={cn(
                      "mt-8 flex min-h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                      featured
                        ? "bg-[#2B8CFF] text-white shadow-[0_0_40px_-8px_rgba(43,140,255,0.85)] hover:bg-[#5EB3FF]"
                        : "border border-[rgba(255,255,255,0.12)] text-[#EEF6FF] hover:border-[rgba(59,158,255,0.35)] hover:bg-[rgba(43,140,255,0.08)]",
                    )}
                  >
                    {card.cta.label}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
