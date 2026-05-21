"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

export function Tarifs() {
  return (
    <section id="pricing" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Des tarifs pensés pour les restaurants
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Choisissez l&apos;offre adaptée à votre établissement.{" "}
            <strong className="font-medium text-[#FFF7EF]/90">
              {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit
            </strong>{" "}
            pour tout tester.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {ZENGROW_PLAN_CATALOG.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-[1.5rem] border p-6 backdrop-blur-2xl sm:p-8",
                plan.featured
                  ? "border-[rgba(255,122,61,0.32)] bg-[rgba(255,90,42,0.08)] shadow-[0_0_64px_-16px_rgba(255,90,42,0.45)] md:scale-[1.03]"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(10,7,5,0.6)]",
              )}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(255,122,61,0.35)] bg-[#FF5A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,90,42,0.5)]">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">{plan.title}</h3>
              <p className="mt-1 text-sm text-[#AFA39A]">{plan.subtitle}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-landing-serif text-4xl tabular-nums text-[#FFF7EF]">
                  {plan.priceAmount}
                </span>
                <span className="pb-1 text-sm text-[#AFA39A]">CHF / mois</span>
              </div>

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
                {plan.cta}
              </Link>
              <p className="mt-3 text-center text-xs text-[#AFA39A]">Sans engagement long terme</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
