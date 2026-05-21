"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LandingGlows, SectionShell, SectionTitle } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

const problems = ["Visiteurs sans réservation", "Clients inactifs", "Avis Google oubliés"];
const outcomes = ["Réservations", "Relances", "Avis collectés"];

export function Problem() {
  return (
    <SectionShell id="probleme" className="bg-[#0B0705]">
      <LandingGlows />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionTitle
          title="Votre restaurant reçoit des visites. Mais combien deviennent vraiment des réservations ?"
          subtitle="Entre les visiteurs qui consultent sans réserver, les clients qui ne reviennent plus et les avis jamais demandés, beaucoup d'opportunités se perdent. ZenGrow les transforme en actions concrètes."
        />

        <Reveal>
          <div className="landing-surface landing-surface--glow overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.14)] bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-6">
              <ul className="space-y-4">
                {problems.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] px-4 py-3.5 text-sm text-[#AFA39A]"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-[rgba(255,255,255,0.2)]" />
                    {item}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col items-center justify-center gap-2 py-2 md:py-0">
                <motion.div
                  className="flex size-12 items-center justify-center rounded-full border border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.12)] text-[#FF7A3D] shadow-[0_0_32px_rgba(255,90,42,0.25)]"
                  animate={{ boxShadow: ["0 0 24px rgba(255,90,42,0.2)", "0 0 40px rgba(255,90,42,0.35)", "0 0 24px rgba(255,90,42,0.2)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <ArrowRight className="size-5 md:rotate-0 rotate-90" />
                </motion.div>
                <div className="hidden h-24 w-px bg-gradient-to-b from-transparent via-[#FF7A3D] to-transparent md:block" />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF7A3D] to-transparent md:hidden" />
              </div>

              <ul className="space-y-4">
                {outcomes.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.08)] px-4 py-3.5 text-sm font-medium text-[#FFF7EF]"
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-[#FF7A3D] shadow-[0_0_8px_rgba(255,122,61,0.8)]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
