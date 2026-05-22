"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  HeroCardAvis,
  HeroCardCampaign,
  HeroCardRelances,
  HeroCardReservations,
  HeroCardTuesday,
} from "../scenarios";
import { Container, GhostButton, MegaTitle, PrimaryButton } from "../ui";

const FLOAT = [
  {
    content: <HeroCardReservations />,
    className: "left-0 top-[6%] w-[168px] md:left-[-2%] md:w-[180px]",
    delay: "0s",
    rotate: "-4deg",
  },
  {
    content: <HeroCardCampaign />,
    className: "right-0 top-[4%] w-[156px] md:right-[-1%] md:w-[170px]",
    delay: "0.5s",
    rotate: "5deg",
  },
  {
    content: <HeroCardRelances />,
    className: "left-[2%] bottom-[14%] w-[150px]",
    delay: "0.9s",
    rotate: "-3deg",
  },
  {
    content: <HeroCardAvis />,
    className: "right-[1%] bottom-[16%] w-[150px]",
    delay: "0.25s",
    rotate: "4deg",
  },
  {
    content: <HeroCardTuesday />,
    className: "left-[38%] top-0 w-[140px] hidden md:block",
    delay: "0.7s",
    rotate: "0deg",
  },
];

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pt-32 md:pb-20">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <MegaTitle as="h1" className="zg-title-hero">
            Remplissez votre restaurant grâce à l&apos;IA.
          </MegaTitle>
          <p className="zg-hero-sub mx-auto mt-6 max-w-2xl">
            Réservations, relances clients, campagnes marketing et avis Google
            automatisés dans une seule plateforme pensée pour les restaurants.
          </p>
          <p className="mt-5 text-sm font-semibold tracking-[0.12em] text-violet-200/95 uppercase">
            Attirer · Réserver · Relancer · Fidéliser
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton href="/signup">Essayer ZenGrow</PrimaryButton>
            <GhostButton href="#workflow">Voir comment ça marche</GhostButton>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl md:mt-16">
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {FLOAT.map((card, i) => (
              <div
                key={i}
                className={`zg-float-card absolute z-20 ${card.className}`}
                style={
                  {
                    "--zg-delay": card.delay,
                    "--zg-rotate": card.rotate,
                  } as React.CSSProperties
                }
              >
                <div className="zg-glass zg-glass--glow zg-glass--depth rounded-2xl p-2">
                  {card.content}
                </div>
              </div>
            ))}
          </div>

          <motion.div
            data-motion
            className="zg-glass zg-glass--glow zg-glass--depth relative z-10 overflow-hidden rounded-2xl md:rounded-3xl"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-b border-white/8 px-5 py-3">
              <div className="flex items-center justify-between text-xs text-[#9b8fb8]">
                <span className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                </span>
                ZenGrow
                <span className="rounded-full bg-violet-500/25 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                  Live
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 md:p-6">
              <div className="col-span-2 md:col-span-2">
                <HeroCardReservations />
              </div>
              <HeroCardCampaign />
              <HeroCardRelances />
              <HeroCardAvis />
              <div className="col-span-2 md:col-span-1">
                <HeroCardTuesday />
              </div>
            </div>
          </motion.div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <HeroCardReservations />
            <HeroCardCampaign />
          </div>
        </div>
      </Container>
    </section>
  );
}
