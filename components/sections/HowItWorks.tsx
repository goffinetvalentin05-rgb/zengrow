"use client";

import { Fragment, useId } from "react";
import { motion } from "framer-motion";
import { Palette, Rocket, UserPlus } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const NEON = "#FF6B2C";

const steps = [
  {
    n: "01",
    Icon: UserPlus,
    title: "Crée ton compte",
    description:
      "Remplis les infos de base de ton restaurant : nom, adresse, type de cuisine, horaires, menu. En 5 minutes c'est fait depuis ton téléphone.",
  },
  {
    n: "02",
    Icon: Palette,
    title: "Personnalise ta page",
    description:
      "Couleurs, photos, style, ambiance : tu fais ta page à ton image en quelques minutes. Besoin d'un visuel plus poussé ? Notre équipe t'accompagne.",
  },
  {
    n: "03",
    Icon: Rocket,
    title: "Mets en ligne et reçois tes réservations",
    description:
      "Ta page est publiée. Tu partages le lien, et les réservations commencent à tomber dans ton dashboard.",
  },
] as const;

function VerticalNeonConnector({ delay }: { delay: number }) {
  const id = useId().replace(/:/g, "");
  const filterId = `hiw-v-glow-${id}`;

  return (
    <div className="flex justify-center py-1 md:hidden">
      <motion.div
        className="relative h-14 w-10 overflow-visible"
        initial={{ opacity: 0, scaleY: 0.6 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "top center" }}
        aria-hidden
      >
        <svg className="absolute inset-x-0 top-1 bottom-1 w-full" viewBox="0 0 12 100" preserveAspectRatio="none">
          <defs>
            <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.line
            x1="6"
            y1="2"
            x2="6"
            y2="98"
            stroke={NEON}
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${filterId})`}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        <motion.div
          className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#FFA86B] shadow-[0_0_10px_4px_rgba(255,107,44,0.95),0_0_22px_8px_rgba(255,107,44,0.35)]"
          animate={{ top: ["6%", "88%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

function HorizontalNeonConnector({ delay }: { delay: number }) {
  const id = useId().replace(/:/g, "");
  const filterId = `hiw-h-glow-${id}`;

  return (
    <div className="relative hidden min-h-[1px] w-full min-w-0 items-center self-start pt-[6.75rem] md:flex">
      <motion.div
        className="flex w-full min-w-0 items-center gap-1.5 pr-0.5"
        initial={{ opacity: 0, scaleX: 0.25 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left center" }}
      >
        <div className="relative h-4 min-w-0 flex-1 overflow-visible">
          <svg
            className="absolute inset-y-0 left-0 w-[calc(100%-2px)]"
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <filter id={filterId} x="-20%" y="-200%" width="140%" height="500%">
                <feGaussianBlur stdDeviation="1.1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.line
              x1="0"
              y1="6"
              x2="100"
              y2="6"
              stroke={NEON}
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              filter={`url(#${filterId})`}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          <motion.div
            className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-[#FFA86B] shadow-[0_0_10px_4px_rgba(255,107,44,0.95),0_0_22px_8px_rgba(255,107,44,0.35)]"
            animate={{ left: ["0%", "92%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.span
          className="shrink-0 translate-y-px select-none text-base leading-none text-[#FF6B2C] drop-shadow-[0_0_8px_rgba(255,107,44,0.75)]"
          initial={{ opacity: 0, x: -4 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: delay + 0.22, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          →
        </motion.span>
      </motion.div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="relative bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_100%,rgba(255,107,44,0.1),transparent)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Ta page en ligne en <em className="italic text-landing-accent">10 minutes</em>, vraiment.
          </h2>
          <p className="mt-4 text-landing-muted">
            Pas d&apos;agence, pas de devis, pas de relance. Tu fais 3 trucs, on s&apos;occupe du reste.
          </p>
        </Reveal>

        <div className="mx-auto max-w-7xl pt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)_minmax(2.5rem,1fr)_minmax(0,1fr)] md:items-start md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.Icon;
              const lineDelay = 0.15 * i + 0.38;
              return (
                <Fragment key={step.n}>
                  <motion.div
                    className="flex w-full min-w-0 flex-col"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.15 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.article
                      className="flex flex-col p-8"
                      initial="rest"
                      whileHover="hover"
                      variants={{ rest: {}, hover: {} }}
                    >
                      <motion.span
                        variants={{
                          rest: { scale: 1 },
                          hover: {
                            scale: 1.05,
                            transition: { type: "spring", stiffness: 400, damping: 22 },
                          },
                        }}
                        className="inline-block origin-left font-landing-serif text-7xl font-normal italic leading-none text-landing-accent md:text-8xl"
                      >
                        {step.n}
                      </motion.span>
                      <Icon className="mt-4 size-8 shrink-0 text-landing-accent" strokeWidth={1.5} aria-hidden />
                      <h3 className="mt-6 font-landing-serif text-2xl font-normal text-landing-fg">{step.title}</h3>
                      <p className="mt-3 max-w-xs text-base leading-relaxed text-landing-muted">{step.description}</p>
                    </motion.article>
                  </motion.div>
                  {i < 2 ? (
                    <>
                      <VerticalNeonConnector delay={lineDelay} />
                      <HorizontalNeonConnector delay={lineDelay} />
                    </>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
