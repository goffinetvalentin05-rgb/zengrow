"use client";

import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const displaySerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-zg-display",
});

const photos = {
  heroMain:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=88",
  heroSideA:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=86",
  heroSideB:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=86",
  bentoTall:
    "https://images.unsplash.com/photo-1550966871-bfbe9278ea0a?auto=format&fit=crop&w=1600&q=88",
  bentoWide:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=86",
  bentoSmall:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=86",
  journey1:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=900&q=85",
  journey2:
    "https://images.unsplash.com/photo-1514933651103-005eec066c6b?auto=format&fit=crop&w=900&q=85",
  journey3:
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=85",
  immersion:
    "https://images.unsplash.com/photo-1424847658872-19fb9fa8b392?auto=format&fit=crop&w=2400&q=88",
  immersionDetail:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=86",
  closing:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=2400&q=86",
  avatar1:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  avatar2:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  avatar3:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  avatar4:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
} as const;

const easeLux = [0.22, 1, 0.36, 1] as const;

const colors = {
  canvas: "#f7f4ef",
  canvas2: "#f2ebe3",
  ink: "#141210",
  graphite: "#5c5854",
  mist: "#e8dfd4",
  champagne: "#c4a574",
  line: "rgba(20, 18, 16, 0.08)",
} as const;

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.85, delay, ease: easeLux },
  };
}

const plans = [
  {
    name: "Salle",
    tagline: "Quand la vitrine existe déjà, mais que l’accueil numérique doit être irréprochable.",
    price: "49 CHF",
    highlight: false,
    features: [
      "Parcours de réservation fluide, sans friction",
      "Disponibilités et confirmations sous contrôle",
      "Expérience mobile soignée, du premier clic à la table",
      "Relances discrètes, ton maison",
    ],
    cta: "Commencer",
  },
  {
    name: "Maison",
    tagline: "L’expérience complète : l’émotion d’abord, la réservation naturellement.",
    price: "69 CHF",
    highlight: true,
    features: [
      "Page restaurant éditoriale, photo et carte au même niveau",
      "Réservation intégrée, relation client et historique",
      "Événements, lancements, moments forts",
      "Réputation et présence — sans bruit superflu",
    ],
    cta: "Choisir Maison",
  },
];

const testimonials = [
  {
    quote:
      "On ne vend plus un logiciel aux invités. On leur donne envie, puis une date. Le reste est silencieux.",
    name: "Camille R.",
    role: "Maison 28 places, Genève",
    src: photos.avatar1,
  },
  {
    quote:
      "Nos équipes ne « vivent » pas dans un tableau. Elles voient l’essentiel, au bon moment.",
    name: "Thomas V.",
    role: "Service & réservations, Lausanne",
    src: photos.avatar2,
  },
  {
    quote:
      "La page respire enfin comme la salle. Les photos ont retrouvé leur place.",
    name: "Léa M.",
    role: "Fondatrice, bistro contemporain",
    src: photos.avatar3,
  },
  {
    quote:
      "Les réservations arrivent proprement, sans encombrer le service. C’est exactement le luxe discret qu’on cherchait.",
    name: "Julien K.",
    role: "Directeur, restaurant signature",
    src: photos.avatar4,
  },
];

const channels = [
  "Google Maps",
  "Instagram",
  "TikTok",
  "Presse locale",
  "Bouche-à-oreille",
  "Infolettres",
];

export function ZenGrowLanding() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;

  return (
    <div
      className={`${displaySerif.variable} min-h-screen overflow-x-hidden text-[#141210] antialiased selection:bg-[#c4a574]/25 selection:text-[#141210]`}
      style={{ backgroundColor: colors.canvas }}
    >
      {/* Fond atmosphère très léger */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -20%, rgba(196, 165, 116, 0.12), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 30%, rgba(232, 223, 212, 0.65), transparent 50%),
            radial-gradient(ellipse 60% 45% at 0% 70%, rgba(242, 235, 227, 0.9), transparent 55%),
            ${colors.canvas}
          `,
        }}
      />

      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,16,0.06)] bg-[rgba(247,244,239,0.72)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={128}
              height={36}
              className="h-5 w-auto object-contain opacity-90 sm:h-[1.35rem]"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 text-[0.8125rem] font-medium text-[#5c5854] md:flex">
            <a href="#experience" className="transition hover:text-[#141210]">
              Expérience
            </a>
            <a href="#parcours" className="transition hover:text-[#141210]">
              Parcours
            </a>
            <a href="#immersion" className="transition hover:text-[#141210]">
              Immersion
            </a>
            <a href="#gestion" className="transition hover:text-[#141210]">
              Plateforme
            </a>
            <a href="#presence" className="transition hover:text-[#141210]">
              Présence
            </a>
            <a href="#tarifs" className="transition hover:text-[#141210]">
              Tarifs
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-[0.8125rem] font-medium text-[#5c5854] transition hover:text-[#141210] sm:inline"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#141210] px-4 py-2 text-[0.75rem] font-semibold tracking-tight text-[#faf8f5] shadow-[0_12px_32px_-16px_rgba(20,18,16,0.45)] transition hover:bg-[#2a2623] sm:px-5 sm:text-[0.8125rem]"
            >
              Lancer ma page
              <ArrowUpRight className="h-3.5 w-3.5 opacity-90" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-5 overflow-x-auto border-t border-[rgba(20,18,16,0.05)] px-4 py-2.5 text-[0.7rem] font-medium text-[#7a7672] scrollbar-none md:hidden">
          <a href="#experience" className="shrink-0 whitespace-nowrap">
            Expérience
          </a>
          <a href="#parcours" className="shrink-0 whitespace-nowrap">
            Parcours
          </a>
          <a href="#immersion" className="shrink-0 whitespace-nowrap">
            Immersion
          </a>
          <a href="#gestion" className="shrink-0 whitespace-nowrap">
            Plateforme
          </a>
          <a href="#presence" className="shrink-0 whitespace-nowrap">
            Présence
          </a>
          <a href="#tarifs" className="shrink-0 whitespace-nowrap">
            Tarifs
          </a>
        </nav>
      </header>

      <main className="relative z-10 font-[family-name:var(--font-geist-sans),system-ui,sans-serif]">
        {/* 1 — Hero */}
        <section className="relative px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-[1100px] text-center">
            <motion.p
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeLux }}
            >
              Hospitality · présence · réservation
            </motion.p>

            <motion.h1
              className={`${display} mx-auto mt-7 max-w-[14ch] text-[2.75rem] font-medium leading-[1.02] tracking-[-0.03em] text-[#141210] sm:max-w-[20ch] sm:text-[3.75rem] md:max-w-none md:text-[4.5rem] md:leading-[1.01] lg:text-[5.25rem] lg:leading-[1]`}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeLux, delay: 0.04 }}
            >
              <span className="block text-balance">L’adresse se devine.</span>
              <span className="mt-1 block text-balance italic font-normal text-[#3d3a37] sm:mt-2">
                La table se confirme.
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-10 max-w-lg text-balance text-[1rem] leading-[1.65] text-[#5c5854] sm:mt-12 sm:max-w-xl sm:text-[1.0625rem] sm:leading-[1.62]"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easeLux, delay: 0.1 }}
            >
              ZenGrow rassemble ce que les invités attendent aujourd’hui : une ambiance lisible, quelques
              images justes, un menu clair — et une réservation qui arrive sans friction.
            </motion.p>

            <motion.div
              className="mt-11 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeLux, delay: 0.16 }}
            >
              <Link
                href="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#141210] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#faf8f5] shadow-[0_16px_40px_-24px_rgba(20,18,16,0.55)] transition hover:bg-[#2a2623] sm:w-auto"
              >
                Créer ma page ZenGrow
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <a
                href="#immersion"
                className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(20,18,16,0.12)] bg-white/50 px-8 py-3.5 text-[0.875rem] font-medium text-[#141210] backdrop-blur-sm transition hover:border-[rgba(20,18,16,0.2)] hover:bg-white/80 sm:w-auto"
              >
                Voir l’expérience
              </a>
            </motion.div>
          </div>

          {/* Composition visuelle hero — lifestyle, pas de mockup */}
          <motion.div
            className="mx-auto mt-16 grid max-w-[1240px] gap-3 sm:mt-20 sm:grid-cols-12 sm:gap-4 lg:mt-24"
            initial={reduce ? false : { opacity: 0, y: 36 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: easeLux, delay: 0.08 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[rgba(20,18,16,0.06)] bg-[#e8dfd4] shadow-[0_32px_64px_-48px_rgba(20,18,16,0.35)] sm:col-span-8 sm:aspect-[16/10] lg:col-span-8">
              <Image
                src={photos.heroMain}
                alt="Salle de restaurant baignée de lumière chaude"
                fill
                className="object-cover object-[center_42%]"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/25 via-transparent to-transparent" />
              {!reduce ? (
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_80%,rgba(247,244,239,0.2),transparent_55%)]"
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:col-span-4 sm:grid-cols-1 sm:gap-4 lg:col-span-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] border border-[rgba(20,18,16,0.06)] bg-[#efe8de] shadow-[0_24px_48px_-40px_rgba(20,18,16,0.3)] sm:aspect-[16/11] sm:flex-1">
                <Image
                  src={photos.heroSideA}
                  alt="Dressage et détails de table"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] border border-[rgba(20,18,16,0.06)] bg-[#efe8de] shadow-[0_24px_48px_-40px_rgba(20,18,16,0.3)] sm:aspect-[16/11] sm:flex-1">
                <motion.div
                  className="relative h-full w-full"
                  animate={reduce ? undefined : { scale: [1, 1.02, 1] }}
                  transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <Image
                    src={photos.heroSideB}
                    alt="Ambiance conviviale au comptoir"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2 — Expérience moderne restaurant (bento) */}
        <section id="experience" className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="mx-auto max-w-2xl text-center">
              <motion.p
                {...useFadeUp(0)}
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]"
              >
                Expérience
              </motion.p>
              <motion.h2
                {...useFadeUp(0.05)}
                className={`${display} mt-4 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#141210] sm:text-[2.75rem] md:text-[3.25rem]`}
              >
                Un restaurant moderne se lit comme une invitation.
              </motion.h2>
              <motion.p
                {...useFadeUp(0.1)}
                className="mt-6 text-[1rem] leading-[1.75] text-[#5c5854] sm:text-[1.0625rem]"
              >
                Pas de site « usine ». Une narration courte, des visuels qui respirent, une voix qui
                ressemble à la salle — le tout pensé pour le mobile, parce que c’est là que la décision
                se joue.
              </motion.p>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-12 lg:mt-20 lg:gap-5">
              <motion.article
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, ease: easeLux }}
                className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(20,18,16,0.07)] bg-white/60 shadow-[0_28px_56px_-44px_rgba(20,18,16,0.35)] sm:col-span-7 sm:row-span-2 sm:min-h-[420px]"
              >
                <div className="relative aspect-[16/11] sm:absolute sm:inset-0 sm:aspect-auto">
                  <Image
                    src={photos.bentoTall}
                    alt="Table et lumière douce"
                    fill
                    className="object-cover object-[center_48%]"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/45 via-[#141210]/5 to-transparent sm:from-[#141210]/35" />
                </div>
                <div className="relative p-7 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:bg-gradient-to-t sm:from-[#141210]/85 sm:via-[#141210]/35 sm:to-transparent sm:p-8">
                  <p className={`${display} text-[1.5rem] font-medium leading-tight text-white sm:text-[1.65rem]`}>
                    Ambiance d’abord.
                  </p>
                  <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-white/85">
                    Quelques photos, un rythme calme : assez pour comprendre l’esprit de la maison.
                  </p>
                </div>
              </motion.article>

              <motion.article
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, ease: easeLux, delay: 0.06 }}
                className="flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[rgba(20,18,16,0.07)] bg-[#faf8f5] p-7 shadow-[0_20px_48px_-40px_rgba(20,18,16,0.28)] sm:col-span-5"
              >
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#8a8580]">
                    Carte & menu
                  </p>
                  <p className={`${display} mt-4 text-[1.65rem] font-medium leading-[1.12] text-[#141210]`}>
                    Le menu comme un magazine, pas comme un PDF coincé.
                  </p>
                </div>
                <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-[rgba(20,18,16,0.06)]">
                  <Image
                    src={photos.bentoWide}
                    alt="Plats et présentation soignée"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </motion.article>

              <motion.article
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, ease: easeLux, delay: 0.1 }}
                className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,18,16,0.07)] bg-white/70 p-7 shadow-[0_20px_48px_-40px_rgba(20,18,16,0.26)] sm:col-span-5"
              >
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#8a8580]">
                  Une main, un geste
                </p>
                <p className={`${display} mt-4 text-[1.5rem] font-medium leading-[1.15] text-[#141210]`}>
                  Pensé pour être tenu — pas pour être zoomé jusqu’à la fatigue.
                </p>
                <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border border-[rgba(20,18,16,0.06)]">
                  <Image
                    src={photos.bentoSmall}
                    alt="Service en salle, gestuelle précise"
                    fill
                    className="object-cover object-[center_55%]"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* 3 — Découverte → réservation */}
        <section
          id="parcours"
          className="relative border-y border-[rgba(20,18,16,0.06)] bg-[#f2ebe3]/55 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <motion.div {...useFadeUp(0)} className="max-w-xl">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]">
                  De la découverte à la réservation
                </p>
                <h2
                  className={`${display} mt-4 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#141210] sm:text-[2.65rem] md:text-[3rem]`}
                >
                  Le fil est court. Le geste, immédiat.
                </h2>
                <p className="mt-6 text-[1rem] leading-[1.75] text-[#5c5854] sm:text-[1.0625rem]">
                  Les invités arrivent par mille chemins. Ce qui compte, c’est ce qui se passe quand ils
                  atterrissent chez vous : une impression nette, une preuve visuelle, une réservation qui
                  se fait sans se poser dix questions.
                </p>
              </motion.div>
              <motion.div
                {...useFadeUp(0.08)}
                className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end"
              >
                {channels.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-[rgba(20,18,16,0.1)] bg-white/70 px-4 py-2 text-[0.75rem] font-medium text-[#4a4744] backdrop-blur-sm"
                  >
                    {c}
                  </span>
                ))}
              </motion.div>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Découvrir",
                  body: "Une page qui donne le ton : lumière, matière, générosité — avant même le premier plat.",
                  src: photos.journey1,
                },
                {
                  step: "02",
                  title: "Projeter",
                  body: "Quelques images, les essentiels : horaires, quartier, esprit. Pas de labyrinthe.",
                  src: photos.journey2,
                },
                {
                  step: "03",
                  title: "Réserver",
                  body: "Un créneau clair, une confirmation douce. Comme un concierge, pas comme un formulaire.",
                  src: photos.journey3,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.08, duration: 0.85, ease: easeLux }}
                  className="group overflow-hidden rounded-[1.5rem] border border-[rgba(20,18,16,0.07)] bg-white/80 shadow-[0_20px_48px_-40px_rgba(20,18,16,0.22)]"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/40 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold tracking-wider text-[#141210] backdrop-blur-sm">
                      {item.step}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className={`${display} text-[1.35rem] font-medium text-[#141210]`}>{item.title}</p>
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-[#5c5854]">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Immersion produit */}
        <section id="immersion" className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <motion.div {...useFadeUp(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]">
                Immersion
              </p>
              <h2
                className={`${display} mt-4 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#141210] sm:text-[2.85rem] md:text-[3.35rem]`}
              >
                Ce que vos invités voient — avant d’être assis.
              </h2>
              <p className="mt-6 text-[1rem] leading-[1.75] text-[#5c5854] sm:text-[1.0625rem]">
                ZenGrow ne remplace pas votre maison : il la cadre. Une présence digitale aussi soignée
                que le dressage — avec la chaleur en plus.
              </p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 1, ease: easeLux }}
              className="relative mt-16 overflow-hidden rounded-[2rem] border border-[rgba(20,18,16,0.07)] bg-[#e8dfd4] shadow-[0_40px_80px_-52px_rgba(20,18,16,0.45)]"
            >
              <div className="relative aspect-[16/9] min-h-[280px] w-full sm:aspect-[2.2/1] sm:min-h-[360px]">
                <Image
                  src={photos.immersion}
                  alt="Grande salle de restaurant élégante"
                  fill
                  className="object-cover object-[center_40%]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ef]/90 via-transparent to-transparent sm:from-[#f7f4ef]/75" />
                <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center px-8 sm:px-12">
                  <p className={`${display} text-[1.75rem] font-medium leading-[1.1] text-[#141210] sm:text-[2.125rem]`}>
                    Une page qui respire la salle.
                  </p>
                  <p className="mt-4 text-[0.9375rem] leading-[1.65] text-[#4a4744]">
                    Typographie, blanc, images : tout sert le même récit — celui du service et du détail.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <motion.div
                {...useFadeUp(0)}
                className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(20,18,16,0.07)] bg-white/70"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={photos.immersionDetail}
                    alt="Détail culinaire, mise en valeur"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-7">
                  <p className={`${display} text-[1.4rem] font-medium text-[#141210]`}>Menu & moments</p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-[#5c5854]">
                    Carte, événements, lancements : ce qui bouge dans la maison se lit sans effort.
                  </p>
                </div>
              </motion.div>
              <motion.div
                {...useFadeUp(0.06)}
                className="flex flex-col justify-center rounded-[1.5rem] border border-[rgba(20,18,16,0.07)] bg-[linear-gradient(145deg,#faf8f5_0%,#efe8de_100%)] p-8 sm:p-10"
              >
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#8a8580]">
                  Mobile first
                </p>
                <p className={`${display} mt-4 text-[1.65rem] font-medium leading-[1.15] text-[#141210]`}>
                  Parce que la décision se prend entre deux messages — pas devant un écran 27 pouces.
                </p>
                <p className="mt-5 text-[0.9375rem] leading-[1.7] text-[#5c5854]">
                  Chaque section est pensée pour le pouce, le scroll, l’œil qui cherche une preuve
                  rapide. Rien d’autre.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5 — Gestion & plateforme (sans dashboard factice) */}
        <section
          id="gestion"
          className="relative border-t border-[rgba(20,18,16,0.06)] bg-[#faf8f5] px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1100px]">
            <motion.div {...useFadeUp(0)} className="mx-auto max-w-2xl text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]">
                Plateforme
              </p>
              <h2
                className={`${display} mt-4 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#141210] sm:text-[2.75rem] md:text-[3.15rem]`}
              >
                Derrière la scène : calme, clarté, contrôle.
              </h2>
              <p className="mt-6 text-[1rem] leading-[1.75] text-[#5c5854] sm:text-[1.0625rem]">
                Les outils existent pour soutenir le service — pas pour le remplacer. ZenGrow garde la
                complexité hors de la vue des invités, et la lisibilité du côté des équipes.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Réservations",
                  text: "Créneaux, confirmations, files d’attente — avec la douceur d’un bon accueil.",
                },
                {
                  title: "Clients & préférences",
                  text: "Mémoire utile, jamais intrusive. Pour reconnaître sans étiqueter.",
                },
                {
                  title: "Événements",
                  text: "Soirées, dégustations, cartes saisonnières : le calendrier vit au rythme de la maison.",
                },
                {
                  title: "Campagnes",
                  text: "Messages ciblés quand il le faut — sans encombrer la boîte de réception.",
                },
                {
                  title: "Réputation",
                  text: "Avis et réponses dans le ton de la salle, avec des rappels discrets.",
                },
                {
                  title: "Opérations",
                  text: "Une lecture simple pour les équipes : ce qui arrive, ce qui compte, maintenant.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ delay: i * 0.05, duration: 0.8, ease: easeLux }}
                  className="rounded-[1.35rem] border border-[rgba(20,18,16,0.08)] bg-white/85 p-7 shadow-[0_16px_40px_-36px_rgba(20,18,16,0.2)] transition hover:border-[rgba(196,165,116,0.35)] hover:shadow-[0_22px_48px_-36px_rgba(20,18,16,0.22)]"
                >
                  <p className={`${display} text-[1.25rem] font-medium text-[#141210]`}>{card.title}</p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-[#5c5854]">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Présence digitale + témoignages */}
        <section id="presence" className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
              <motion.div {...useFadeUp(0)} className="max-w-xl">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]">
                  Présence digitale
                </p>
                <h2
                  className={`${display} mt-4 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#141210] sm:text-[2.65rem]`}
                >
                  Branché là où votre monde circule.
                </h2>
                <p className="mt-6 text-[1rem] leading-[1.75] text-[#5c5854] sm:text-[1.0625rem]">
                  Les canaux changent ; l’exigence, non. ZenGrow vous donne une base unique — propre,
                  rapide à mettre à jour — pour capter l’attention et la transformer en rendez-vous.
                </p>
              </motion.div>
              <motion.div
                {...useFadeUp(0.06)}
                className="flex flex-1 flex-wrap gap-2 lg:justify-end"
              >
                {channels.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-[rgba(20,18,16,0.1)] bg-[#f2ebe3]/80 px-4 py-2.5 text-[0.8125rem] font-medium text-[#3d3a37]"
                  >
                    {c}
                  </span>
                ))}
              </motion.div>
            </div>

            <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={t.name}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: i * 0.06, duration: 0.8, ease: easeLux }}
                  className="flex h-full flex-col rounded-[1.35rem] border border-[rgba(20,18,16,0.07)] bg-white/75 p-6 shadow-[0_16px_40px_-36px_rgba(20,18,16,0.18)]"
                >
                  <p className="text-[0.9375rem] leading-[1.65] text-[#3d3a37]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[rgba(20,18,16,0.08)]">
                      <Image src={t.src} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-[#141210]">{t.name}</p>
                      <p className="text-[0.75rem] text-[#7a7672]">{t.role}</p>
                    </div>
                  </div>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* 7 — Tarifs */}
        <section id="tarifs" className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1000px]">
            <motion.div {...useFadeUp(0)} className="text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-[#8a8580]">
                Tarifs
              </p>
              <h2
                className={`${display} mt-4 text-[2.25rem] font-medium tracking-[-0.025em] text-[#141210] sm:text-[2.85rem]`}
              >
                Deux façons d’entrer — une même exigence.
              </h2>
              <p className="mt-4 text-[1rem] text-[#5c5854]">
                Facturation mensuelle, sans surprise. Vous choisissez la profondeur de l’expérience.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.8, ease: easeLux }}
                  className={`relative flex flex-col rounded-[1.75rem] border p-8 sm:p-9 ${
                    plan.highlight
                      ? "border-[rgba(196,165,116,0.45)] bg-[linear-gradient(165deg,#fffefb_0%,#f7f0e6_100%)] shadow-[0_28px_56px_-40px_rgba(196,165,116,0.35)]"
                      : "border-[rgba(20,18,16,0.1)] bg-white/80"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full border border-[rgba(196,165,116,0.4)] bg-[rgba(196,165,116,0.12)] px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#7a623f]">
                      Le plus demandé
                    </span>
                  ) : null}
                  <h3 className={`${display} text-[1.5rem] font-medium text-[#141210] sm:text-[1.6rem]`}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-[#5c5854]">{plan.tagline}</p>
                  <p className="mt-9 text-[2.5rem] font-semibold tracking-tight text-[#141210] sm:text-[2.65rem]">
                    {plan.price}
                    <span className="text-[1rem] font-normal text-[#7a7672]"> / mois</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3 text-[0.875rem] leading-relaxed text-[#4a4744]">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: colors.champagne }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full py-3.5 text-[0.875rem] font-semibold tracking-tight transition ${
                      plan.highlight
                        ? "bg-[#141210] text-[#faf8f5] hover:bg-[#2a2623]"
                        : "border border-[rgba(20,18,16,0.14)] text-[#141210] hover:bg-[#f2ebe3]/80"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* 8 — CTA final */}
        <section className="relative px-4 pb-28 pt-16 sm:px-6 sm:pb-32 lg:px-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.95, ease: easeLux }}
            className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[2rem] border border-[rgba(20,18,16,0.08)] bg-[#141210] shadow-[0_40px_80px_-48px_rgba(20,18,16,0.55)]"
          >
            <div className="relative aspect-[16/11] min-h-[320px] w-full sm:aspect-[2.25/1] sm:min-h-[380px]">
              <Image
                src={photos.closing}
                alt="Ambiance chaleureuse en salle"
                fill
                className="object-cover object-[center_38%] opacity-55"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/75 to-[#141210]/45" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_100%,rgba(196,165,116,0.15),transparent_55%)]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#c9c3bc]">
                  ZenGrow
                </p>
                <h2
                  className={`${display} mt-5 max-w-[16ch] text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-[#faf8f5] sm:max-w-3xl sm:text-[2.85rem] md:text-[3.35rem]`}
                >
                  Donnez à votre maison une présence à la hauteur du service.
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-[1rem] leading-[1.7] text-[#c9c3bc] sm:mt-8 sm:text-[1.0625rem]">
                  En quelques minutes, une page qui raconte l’essentiel — et des réservations qui
                  s’installent sans bruit.
                </p>
                <Link
                  href="/signup"
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#faf8f5] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#141210] transition hover:bg-white"
                >
                  Commencer avec ZenGrow
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-[rgba(20,18,16,0.08)] px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={104}
              height={30}
              className="h-4 w-auto object-contain opacity-80"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-[0.75rem] text-[#7a7672]">
              <Link href="/login" className="transition hover:text-[#141210]">
                Connexion
              </Link>
              <Link href="/signup" className="transition hover:text-[#141210]">
                Inscription
              </Link>
              <span>© {new Date().getFullYear()} ZenGrow</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
