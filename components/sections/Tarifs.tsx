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
            Des tarifs pensés pour les restaurants
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            <strong className="font-medium text-[#FFF7EF]/90">{ZENGROW_TRIAL_DAYS} jours d&apos;essai gratuit</strong>
            {" "}— sans engagement long terme.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div
              className="pointer-events-none absolute inset-0 rounded-[3rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,90,42,0.14),transparent_70%)]"
              aria-hidden
            />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:justify-center lg:gap-0">
              {/* Starter — panneau latéral incliné */}
              <motion.div
                className={cn(
                  "relative z-10 w-full max-w-sm rounded-[1.75rem] border border-[rgba(255,255,255,0.08)]",
                  "bg-[rgba(10,7,5,0.65)] p-6 backdrop-blur-xl sm:p-7",
                  "lg:-mr-6 lg:mt-10 lg:w-[min(100%,340px)] lg:rotate-[-1.5deg]",
                )}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <h3 className="font-landing-serif text-2xl text-[#FFF7EF]">{starter.title}</h3>
                <p className="mt-1 text-sm text-[#AFA39A]">{starter.subtitle}</p>
                <p className="mt-5 font-landing-serif text-4xl tabular-nums text-[#FFF7EF]">
                  {starter.priceAmount}
                  <span className="ml-1 font-sans text-base font-normal text-[#AFA39A]">CHF/mois</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-[#AFA39A]">
                  {starter.features.slice(0, 4).map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="size-4 shrink-0 text-[#FF7A3D]/80" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 flex min-h-11 items-center justify-center rounded-full border border-white/12 text-sm font-semibold text-[#FFF7EF] transition hover:border-[rgba(255,122,61,0.35)]"
                >
                  {starter.cta}
                </Link>
              </motion.div>

              {/* Pro — carte dominante */}
              <motion.div
                className={cn(
                  "relative z-20 w-full max-w-md rounded-[2rem] border border-[rgba(255,122,61,0.35)]",
                  "bg-[rgba(255,90,42,0.08)] p-8 shadow-[0_0_80px_-20px_rgba(255,90,42,0.55)] backdrop-blur-2xl sm:p-9",
                  "lg:scale-[1.05]",
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 }}
              >
                {pro.badge ? (
                  <span className="mb-4 inline-block rounded-full bg-[#FF5A2A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,90,42,0.5)]">
                    {pro.badge}
                  </span>
                ) : null}
                <h3 className="font-landing-serif text-3xl text-[#FFF7EF]">{pro.title}</h3>
                <p className="mt-2 text-[#AFA39A]">{pro.subtitle}</p>
                <p className="mt-6 font-landing-serif text-5xl tabular-nums text-[#FFF7EF]">
                  {pro.priceAmount}
                  <span className="ml-2 font-sans text-lg font-normal text-[#AFA39A]">CHF/mois</span>
                </p>
                <ul className="mt-8 space-y-3">
                  {pro.features.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-[#FFF7EF]/95">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#FF7A3D]" strokeWidth={2.5} />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-10 flex min-h-12 items-center justify-center rounded-full bg-[#FF5A2A] text-sm font-semibold text-white shadow-[0_0_48px_-8px_rgba(255,90,42,0.9)] transition hover:bg-[#FF7A3D]"
                >
                  {pro.cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
