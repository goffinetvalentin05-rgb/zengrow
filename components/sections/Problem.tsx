"use client";

import { ArrowRight, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const problems = ["Visiteurs sans réservation", "Clients inactifs", "Avis Google oubliés"];
const outcomes = ["Réservations", "Relances", "Avis collectés"];

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F6A85A]">Le constat</p>
          <h2 className="mt-4 font-landing-serif text-[clamp(1.75rem,4vw,2.65rem)] font-normal leading-tight text-[#FFF7EF]">
            Votre restaurant reçoit des visites. Mais combien deviennent vraiment des réservations ?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
            Entre les visiteurs qui consultent sans réserver, les clients qui ne reviennent plus et les avis
            jamais demandés, beaucoup d&apos;opportunités se perdent. ZenGrow les transforme en actions concrètes.
          </p>
          <div className="mt-8 hidden items-center gap-3 text-sm text-[#AFA39A] lg:flex">
            <TrendingDown className="size-4 text-[#FF7A3D]" />
            <span>Perte invisible → actions mesurables</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative min-h-[320px] sm:min-h-[380px]">
            <div
              className="pointer-events-none absolute inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_60%_40%,rgba(255,90,42,0.1),transparent_65%)]"
              aria-hidden
            />

            <ul className="absolute left-0 top-0 z-10 w-[min(100%,280px)] space-y-3 sm:w-[72%]">
              {problems.map((item, i) => (
                <motion.li
                  key={item}
                  className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(8,5,4,0.75)] px-4 py-3.5 text-sm text-[#AFA39A] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  style={{ marginLeft: i * 12 }}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="mr-2 inline-block size-1.5 rounded-full bg-white/25" />
                  {item}
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="absolute left-1/2 top-1/2 z-20 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.12)] text-[#FF7A3D] shadow-[0_0_40px_rgba(255,90,42,0.25)]"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <ArrowRight className="size-6" />
            </motion.div>

            <ul className="absolute bottom-0 right-0 z-30 w-[min(100%,280px)] space-y-3 sm:w-[72%]">
              {outcomes.map((item, i) => (
                <motion.li
                  key={item}
                  className="rounded-2xl border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.1)] px-4 py-3.5 text-sm font-medium text-[#FFF7EF] shadow-[0_0_32px_-12px_rgba(255,90,42,0.35)] backdrop-blur-xl"
                  style={{ marginRight: i * 12 }}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <span className="mr-2 inline-block size-1.5 rounded-full bg-[#FF7A3D] shadow-[0_0_8px_rgba(255,122,61,0.8)]" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
