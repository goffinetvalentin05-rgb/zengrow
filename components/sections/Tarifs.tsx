"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

export function Tarifs() {
  const starter = ZENGROW_PLAN_CATALOG.find((p) => p.key === "starter")!;
  const pro = ZENGROW_PLAN_CATALOG.find((p) => p.key === "pro")!;

  return (
    <section id="pricing" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#FFF7EF]">
            Des tarifs simples pour passer à l&apos;action.
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            Choisissez l&apos;offre adaptée à votre restaurant et commencez à transformer vos visiteurs en
            réservations.
          </p>
          <p className="mt-2 text-sm text-[#AFA39A]">
            {ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-14 flex max-w-4xl flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-0">
            {[starter, pro].map((plan, i) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={cn(
                  "relative flex w-full flex-col rounded-[1.75rem] border p-6 backdrop-blur-2xl sm:p-8",
                  plan.featured
                    ? "z-10 border-[rgba(255,122,61,0.32)] bg-[rgba(255,90,42,0.08)] shadow-[0_0_64px_-16px_rgba(255,90,42,0.45)] lg:scale-[1.05]"
                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(10,7,5,0.6)] lg:-mr-4 lg:mt-8 lg:rotate-[-1deg]",
                )}
              >
                {plan.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(255,122,61,0.35)] bg-[#FF5A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,90,42,0.5)]">
                    {plan.badge}
                  </span>
                ) : null}

                <p className="font-landing-serif text-xl text-[#FFF7EF]">{plan.landingHeadline}</p>
                <p className="mt-2 text-sm text-[#AFA39A]">{plan.landingDescription}</p>
                <p className="mt-1 text-xs text-[#AFA39A]/80">
                  {plan.title} · {plan.priceAmount} CHF / mois
                </p>

                <ul className="mt-6 flex-1 space-y-2">
                  {plan.features.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-[#FFF7EF]/90">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#FF7A3D]" strokeWidth={2.5} />
                      {line}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={cn(
                    "mt-8 flex min-h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                    plan.featured
                      ? "bg-[#FF5A2A] text-white shadow-[0_0_40px_-8px_rgba(255,90,42,0.85)] hover:bg-[#FF7A3D]"
                      : "border border-[rgba(255,255,255,0.12)] text-[#FFF7EF] hover:border-[rgba(255,122,61,0.35)]",
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
