"use client";

import Link from "next/link";
import Image from "next/image";
import { Fraunces } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Play,
  Star,
  Users,
} from "lucide-react";

const displaySerif = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const photos = {
  phoneHero:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
  phoneThumbA:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  phoneThumbB:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
  phoneThumbC:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80",
  sceneEditorial:
    "https://images.unsplash.com/photo-1550966871-bfbe9278ea0a?auto=format&fit=crop&w=1400&q=85",
  experienceSide:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=85",
  tileBrunch:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
  tileEvent:
    "https://images.unsplash.com/photo-1424847658872-19fb9fa8b392?auto=format&fit=crop&w=600&q=80",
  tileMenu:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  tilePhotos:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=600&q=80",
  useCaseA:
    "https://images.unsplash.com/photo-1514933651103-005eec066c6b?auto=format&fit=crop&w=900&q=80",
  useCaseB:
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  visionAtmosphere:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
  heroFloatFood:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  /** Scène large pour le hero cinéma */
  heroCinematic:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=88",
} as const;

const easeLux = [0.22, 1, 0.36, 1] as const;

/** Grain cinéma très léger — même sur toute la page */
const FILM_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.035'/%3E%3C/svg%3E\")";

function UnifiedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[#080809]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_85%_at_50%_-15%,rgba(212,184,150,0.075),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_95%_35%,rgba(100,75,58,0.07),transparent_48%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_5%_75%,rgba(35,32,30,0.5),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: FILM_GRAIN,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080809]/40" />
    </div>
  );
}

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 32 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.85, delay, ease: easeLux },
  };
}

function floatProps(
  reduce: boolean | null,
  duration: number,
  yAmp: number,
  delay = 0,
) {
  if (reduce) return {};
  return {
    animate: { y: [0, -yAmp, 0] },
    transition: {
      duration,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

/** Un seul moment visuel : photographie cinéma + lumière + hint réservation */
function HeroCinematicMoment({ serif }: { serif: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-20 sm:px-6 lg:mt-24 lg:px-8"
      initial={reduce ? false : { opacity: 0, y: 36 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 1.05, ease: easeLux, delay: 0.12 }}
    >
      <div className="pointer-events-none absolute -inset-4 rounded-[2.25rem] bg-[radial-gradient(ellipse_70%_55%_at_50%_60%,rgba(196,165,116,0.09),transparent_72%)] blur-3xl sm:-inset-8" />
      <div className="relative overflow-hidden rounded-[1.5rem] ring-1 ring-white/[0.07] sm:rounded-[2rem]">
        <div className="relative aspect-[16/10] min-h-[220px] w-full max-h-[min(58vh,540px)] sm:aspect-[2.15/1]">
          <motion.div
            className="absolute inset-0"
            animate={reduce ? undefined : { scale: [1, 1.045] }}
            transition={{
              duration: 22,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "50% 40%" }}
          >
            <Image
              src={photos.heroCinematic}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1152px"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/25 to-[#080809]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080809]/35 via-transparent to-[#080809]/35" />
          {!reduce ? (
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(232,223,208,0.07),transparent_55%)]"
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 pt-20 sm:pb-8 sm:pt-24">
            <Link
              href="/signup"
              className={`group flex max-w-[95%] items-center gap-3 rounded-full border border-white/18 bg-black/40 px-5 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl transition hover:border-white/28 hover:bg-black/50 sm:gap-4 sm:px-7 sm:py-3 ${serif}`}
            >
              <span className="text-[13px] font-medium tracking-tight text-[#faf8f5] sm:text-sm">
                Réserver une table
              </span>
              <span className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden />
              <span className="text-[11px] text-white/50 sm:text-xs">Ce soir · dès 19h</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/55" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const plans = [
  {
    name: "Expérience Réservation",
    tagline: "Vous avez déjà un site web.",
    price: "49 CHF",
    highlight: false,
    features: [
      "Flux de réservation moderne",
      "Réservations parfaites sur mobile",
      "Disponibilités sous votre contrôle",
      "Confirmations invités",
    ],
    cta: "Commencer par la réservation",
  },
  {
    name: "Expérience Restaurant complète",
    tagline: "Découverte complète et réservations.",
    price: "69 CHF",
    highlight: true,
    features: [
      "Page restaurant premium",
      "Photos, carte, ambiance",
      "Réservations + CRM invités",
      "Campagnes et automatisations",
    ],
    cta: "Choisir l’expérience complète",
  },
];

export function ZenGrowLanding() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080809] text-[#e8e4dc] selection:bg-[#c4a574]/25 selection:text-[#faf8f5]">
      <UnifiedBackground />

      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#080809]/65 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={140}
              height={40}
              className="h-7 w-auto object-contain brightness-0 invert sm:h-8"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-9 text-sm font-medium text-[#a8a29a] md:flex">
            <a href="#story" className="transition hover:text-[#f5f0e8]">
              Parcours
            </a>
            <a href="#experience" className="transition hover:text-[#f5f0e8]">
              Expérience
            </a>
            <a href="#system" className="transition hover:text-[#f5f0e8]">
              Plateforme
            </a>
            <a href="#pricing" className="transition hover:text-[#f5f0e8]">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-[#a8a29a] transition hover:text-[#f5f0e8] sm:inline-flex"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f0e8] px-4 py-2 text-xs font-semibold tracking-tight text-[#1a1816] transition hover:bg-white sm:px-5 sm:text-sm"
            >
              Créer ma page restaurant
            </Link>
          </div>
        </div>
        <div className="border-t border-white/[0.04] px-4 py-2.5 md:hidden">
          <nav className="mx-auto flex max-w-6xl items-center justify-center gap-4 overflow-x-auto text-xs font-medium text-[#78716c]">
            <a href="#story" className="shrink-0 hover:text-[#f5f0e8]">
              Parcours
            </a>
            <a href="#experience" className="shrink-0 hover:text-[#f5f0e8]">
              Expérience
            </a>
            <a href="#system" className="shrink-0 hover:text-[#f5f0e8]">
              Plateforme
            </a>
            <a href="#pricing" className="shrink-0 hover:text-[#f5f0e8]">
              Tarifs
            </a>
            <Link href="/login" className="shrink-0 hover:text-[#f5f0e8]">
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.h1
              className={`${display} px-2 text-[2.125rem] font-medium leading-[1.08] tracking-[-0.034em] text-[#faf8f5] sm:text-5xl sm:leading-[1.06] md:text-[3.25rem] md:leading-[1.04] lg:text-6xl lg:leading-[1.02] xl:text-[4rem] xl:leading-[1.01]`}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeLux }}
            >
              <span className="block text-balance">
                Les clients ne veulent plus chercher.
              </span>
              <span className="mt-8 block text-balance text-[#d4b896] sm:mt-10 md:mt-12">
                <span className="block">Ils veulent réserver</span>
                <span className="mt-2 block md:mt-2.5">immédiatement.</span>
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-10 max-w-xl text-balance px-2 text-[0.97rem] font-normal leading-[1.72] text-[#a8a29a] sm:mt-12 sm:max-w-2xl sm:text-[1.0625rem] sm:leading-[1.75] md:mt-14"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeLux, delay: 0.1 }}
            >
              Aujourd&apos;hui, un restaurant se découvre en quelques secondes.
              <span className="mt-2 block sm:mt-2.5">
                ZenGrow transforme cette découverte en réservation.
              </span>
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-11 sm:flex-row sm:gap-4 md:mt-12"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easeLux, delay: 0.16 }}
            >
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f5f0e8] px-7 py-3 text-sm font-semibold tracking-tight text-[#1a1816] transition hover:bg-white sm:w-auto"
              >
                Créer ma page restaurant
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <a
                href="#story"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.02] px-7 py-3 text-sm font-medium text-[#e8e4dc] transition hover:border-white/[0.16] hover:bg-white/[0.04] sm:w-auto"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Voir la démo
              </a>
            </motion.div>
          </div>

          <HeroCinematicMoment serif={display} />
        </section>

        <section id="story" className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} mx-auto max-w-3xl text-center text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl lg:text-[2.75rem]`}
            >
              Aujourd&apos;hui, on décide en quelques secondes.
            </motion.h2>

            <div className="mt-16 space-y-12 sm:mt-20">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.75, ease: easeLux }}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
              >
                {[
                  { label: "Instagram" },
                  { label: "TikTok" },
                  { label: "Google Maps" },
                  { label: "Bouche à oreille" },
                ].map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.55, ease: easeLux }}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3.5 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.75)] backdrop-blur-md"
                  >
                    <span className="text-sm font-medium tracking-tight text-[#e8e4dc]">
                      {p.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex justify-center">
                <motion.div
                  animate={
                    reduce
                      ? undefined
                      : { scaleY: [1, 1.06, 1], opacity: [0.32, 0.55, 0.32] }
                  }
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="h-16 w-px bg-gradient-to-b from-transparent via-[#c4a574]/30 to-transparent"
                />
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: easeLux }}
                className="relative mx-auto max-w-lg"
              >
                <div className="absolute -inset-px rounded-[1.6rem] bg-gradient-to-b from-white/[0.08] to-transparent opacity-35 blur-xl" />
                <div className="relative overflow-hidden rounded-[1.45rem] border border-white/[0.08] bg-[#0c0c0d]/75 p-5 shadow-[0_40px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78716c]">
                      Page ZenGrow
                    </p>
                    <span className="rounded-full border border-[#c4a574]/25 bg-[#c4a574]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#d4b896]">
                      En direct
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="relative col-span-2 h-[5.5rem] overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                      <Image
                        src={photos.sceneEditorial}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="relative flex-1 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
                        <Image
                          src={photos.phoneThumbA}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                      <div className="relative flex-1 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
                        <Image
                          src={photos.phoneThumbB}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Ambiance", "Carte", "Photos", "Réserver"].map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          t === "Réserver"
                            ? "border border-[#c4a574]/30 bg-[#c4a574]/12 text-[#f5f0e8]"
                            : "border border-white/[0.06] bg-white/[0.03] text-[#a8a29a]"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <motion.div
                    className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#1a1918]/90 px-3 py-2.5"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6, ease: easeLux }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3d3a36] text-[11px] font-semibold text-[#e8dfd0]">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-[#d6d3cd]">
                      Table réservée — confirmation instantanée
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="experience" className="relative px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_min(380px,38vw)] lg:gap-16 lg:items-start">
            <motion.div {...useFadeUp(0)} className="max-w-xl lg:pt-4">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl lg:text-[2.75rem]`}
              >
                Pensée pour la découverte moderne des restaurants.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[#a8a29a]">
                ZenGrow supprime les frictions entre l&apos;envie d&apos;un restaurant et la
                réservation.
              </p>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, ease: easeLux }}
              className="relative hidden overflow-hidden rounded-2xl ring-1 ring-white/[0.08] lg:block"
            >
              <div className="relative aspect-[3/4] w-full max-h-[520px]">
                <Image
                  src={photos.experienceSide}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="380px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080809]/80 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Parcours de réservation fluide",
                sub: "Quelques secondes, pas des formulaires.",
                visual: "flow",
                img: photos.phoneThumbA,
              },
              {
                title: "Expérience mobile",
                sub: "Pensée pour une main.",
                visual: "mobile",
                img: photos.phoneHero,
              },
              {
                title: "Carte moderne",
                sub: "Une lecture digne d’un magazine.",
                visual: "menu",
                img: photos.tileMenu,
              },
              {
                title: "Pages restaurant épurées",
                sub: "L’émotion d’abord, le détail ensuite.",
                visual: "page",
                img: photos.sceneEditorial,
              },
              {
                title: "Interactions soyeuses",
                sub: "Des mouvements discrets, jamais bruyants.",
                visual: "motion",
                img: photos.phoneThumbC,
              },
            ].map((card, i) => (
              <motion.article
                key={card.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: easeLux }}
                whileHover={{ y: -3, transition: { duration: 0.35, ease: easeLux } }}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1 shadow-[0_28px_64px_-44px_rgba(0,0,0,0.88)] backdrop-blur-[2px] ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="relative mb-4 h-32 overflow-hidden rounded-xl ring-1 ring-white/[0.05]">
                  <Image
                    src={card.img}
                    alt=""
                    fill
                    className="object-cover transition duration-[1.1s] ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080809]/88 via-transparent to-transparent" />
                  {card.visual === "flow" && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#c4a574]" />
                      <div className="h-px max-w-[100px] flex-1 bg-gradient-to-r from-[#c4a574]/45 to-transparent" />
                      <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-medium text-[#e8e4dc] backdrop-blur-sm">
                        Confirmer
                      </span>
                    </div>
                  )}
                  {card.visual === "mobile" && (
                    <div className="absolute inset-0 flex items-end justify-center pb-3">
                      <div className="h-[4.5rem] w-[46px] rounded-lg border border-white/15 bg-black/50 shadow-lg backdrop-blur-sm" />
                    </div>
                  )}
                  {card.visual === "menu" && (
                    <div className="absolute bottom-2 left-3 right-3 space-y-1.5">
                      <div className="h-1 w-3/4 rounded bg-white/20" />
                      <div className="h-1 w-1/2 rounded bg-white/10" />
                    </div>
                  )}
                  {card.visual === "page" && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="h-16 w-[78%] rounded-lg border border-white/10 bg-black/25 backdrop-blur-[2px]" />
                    </div>
                  )}
                  {card.visual === "motion" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={
                          reduce
                            ? undefined
                            : { y: [0, -2.5, 0], opacity: [0.88, 1, 0.88] }
                        }
                        transition={{
                          duration: 5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="h-11 w-11 rounded-2xl border border-white/12 bg-black/35 backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-base font-semibold tracking-tight text-[#f5f0e8]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#78716c]">{card.sub}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeLux }}
            className="mx-auto mt-12 max-w-6xl lg:hidden"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-white/[0.08]">
              <Image
                src={photos.experienceSide}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080809]/70 to-transparent" />
            </div>
          </motion.div>
        </section>

        <section id="system" className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="max-w-3xl">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl lg:text-[2.65rem]`}
              >
                Derrière chaque page, un système restaurant complet.
              </h2>
              <p className="mt-4 max-w-xl text-[#a8a29a]">
                Exploitation, clients et croissance — réunis dans un espace calme.
              </p>
            </motion.div>

            <div className="relative mt-20 min-h-[440px] sm:min-h-[500px]">
              <motion.div
                className="absolute left-1/2 top-6 w-[min(100%,380px)] -translate-x-1/2 sm:left-[10%] sm:translate-x-0"
                {...floatProps(reduce, 11, 5, 0)}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <CalendarDays className="h-4 w-4 text-[#a89078]" />
                    Réservations
                  </div>
                  <div className="mt-3 space-y-2">
                    {["19h30 · 4 personnes", "20h00 · 2 personnes", "20h45 · 6 personnes"].map(
                      (r) => (
                        <div
                          key={r}
                          className="rounded-lg border border-white/[0.04] bg-white/[0.03] px-3 py-2 text-xs text-[#d6d3cd]"
                        >
                          {r}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute right-0 top-0 w-[min(100%,280px)] sm:right-[6%]"
                {...floatProps(reduce, 12, 6, 0.5)}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Users className="h-4 w-4 text-[#c4a574]" />
                    Base clients
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-[#faf8f5]">
                    2,4 k
                  </p>
                  <p className="text-[10px] text-[#57534e]">profils enrichis</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-6 left-0 w-[min(100%,260px)] sm:bottom-10 sm:left-[4%]"
                {...floatProps(reduce, 10, 4, 0.2)}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Mail className="h-4 w-4 text-[#a89078]" />
                    Campagnes
                  </div>
                  <div className="relative mt-2 h-16 overflow-hidden rounded-lg ring-1 ring-white/[0.05]">
                    <Image
                      src={photos.tileEvent}
                      alt=""
                      fill
                      className="object-cover opacity-80"
                      sizes="260px"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-2 right-[4%] w-[min(100%,270px)] sm:right-[12%]"
                {...floatProps(reduce, 13, 5, 0.7)}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Star className="h-4 w-4 text-[#c4a574]" />
                    Avis Google
                  </div>
                  <p className="mt-2 text-sm text-[#d6d3cd]">Automatisations actives</p>
                  <div className="mt-2 flex gap-0.5 text-[#c4a574]/85">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>★</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-1/2 w-[min(100%,300px)] -translate-x-1/2 -translate-y-1/2"
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, ease: easeLux }}
              >
                <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-[#141416] p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]">
                  <div className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-[#c4a574]/10 via-transparent to-transparent opacity-70" />
                  <div className="relative">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#57534e]">
                      Le rythme du soir
                    </p>
                    <p className="mt-1.5 text-lg font-medium tracking-tight text-[#faf8f5]">
                      Votre service, en cadence
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.06] bg-[#1a1918]/80 p-3">
                        <MapPin className="h-4 w-4 text-[#a89078]" />
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#57534e]">
                          Événements
                        </p>
                        <p className="text-sm font-semibold text-[#e8e4dc]">3 en cours</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-[#1a1918]/80 p-3">
                        <BarChart3 className="h-4 w-4 text-[#c4a574]" />
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#57534e]">
                          Statistiques
                        </p>
                        <p className="text-sm font-semibold text-[#e8e4dc]">+18 %</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-center">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} max-w-md text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl`}
            >
              Un restaurant change constamment. Son expérience en ligne aussi.
            </motion.h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-0">
              {[
                { label: "Nouveau brunch", src: photos.tileBrunch },
                { label: "Événement spécial", src: photos.tileEvent },
                { label: "Carte d’été", src: photos.tileMenu },
                { label: "Nouvelles photos", src: photos.tilePhotos },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease: easeLux }}
                  whileHover={{ y: -2 }}
                  className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-[2px]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover transition duration-[1s] ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 50vw, 280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080809]/75 via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-[#f5f0e8]">{item.label}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#78716c]">
                      En ligne
                    </span>
                  </div>
                  <p className="px-4 pb-3 text-xs text-[#57534e]">Mis à jour en un geste</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.p
            {...useFadeUp(0.08)}
            className="mx-auto mt-14 max-w-6xl text-center text-sm text-[#78716c] sm:text-base"
          >
            Rapidité. Souplesse. Autonomie totale.
          </motion.p>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {[
              {
                title: "Pour les restaurants sans vraie présence en ligne",
                points: ["Page moderne", "Réservations", "Mobile d’abord", "Mise en route simple"],
                img: photos.useCaseA,
              },
              {
                title: "Pour les restaurants qui ont déjà un site",
                points: [
                  "Flux de réservation moderne",
                  "Parcours mobile amélioré",
                  "Expérience client connectée",
                ],
                img: photos.useCaseB,
              },
            ].map((block, i) => (
              <motion.article
                key={block.title}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: easeLux }}
                className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.07] bg-white/[0.02]"
              >
                <div className="relative aspect-[21/9] w-full sm:aspect-[2/1]">
                  <Image
                    src={block.img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/35 to-transparent" />
                </div>
                <div className="relative p-8 pt-6">
                  <h3 className="max-w-sm text-xl font-medium leading-snug tracking-tight text-[#faf8f5] sm:text-2xl">
                    {block.title}
                  </h3>
                  <ul className="mt-6 space-y-2.5">
                    {block.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-center gap-3 text-sm text-[#a8a29a]"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#c4a574]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
          <motion.p
            {...useFadeUp(0)}
            className="mx-auto mt-12 max-w-2xl text-center text-sm text-[#78716c]"
          >
            Une expérience restaurant plus moderne et plus rapide — pas un remplacement de site
            imposé.
          </motion.p>
        </section>

        <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <div className="absolute inset-0">
            <Image
              src={photos.visionAtmosphere}
              alt=""
              fill
              className="object-cover opacity-[0.34]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080809] via-[#080809]/82 to-[#080809]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080809]/90 via-transparent to-[#080809]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(212,184,150,0.06),transparent_62%)]" />
          </div>
          <motion.div
            {...useFadeUp(0)}
            className="relative mx-auto max-w-3xl text-center"
          >
            <h2
              className={`${display} text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl lg:text-[2.85rem]`}
            >
              Les plus belles tables créent l&apos;envie en un instant.
            </h2>
            <p className="mt-5 text-lg text-[#a8a29a] sm:text-xl">
              ZenGrow transforme cette envie en réservation.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-8 py-4 text-sm font-semibold tracking-tight text-[#1a1816] transition hover:bg-white"
              >
                Créer ma page restaurant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        <section id="pricing" className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="text-center">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.03em] text-[#faf8f5] sm:text-4xl`}
              >
                Tarifs simples
              </h2>
              <p className="mt-3 text-[#78716c]">
                Deux formules. Même exigence premium.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: easeLux }}
                  whileHover={{ y: -2, transition: { duration: 0.35, ease: easeLux } }}
                  className={`relative flex flex-col rounded-[1.65rem] border p-8 backdrop-blur-sm ${
                    plan.highlight
                      ? "border-[#c4a574]/28 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_0_0_1px_rgba(196,165,116,0.1)_inset]"
                      : "border-white/[0.07] bg-white/[0.03]"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full border border-[#c4a574]/25 bg-[#c4a574]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d4b896]">
                      Expérience complète
                    </span>
                  ) : null}
                  <h3 className="text-xl font-semibold tracking-tight text-[#faf8f5]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#78716c]">{plan.tagline}</p>
                  <p className="mt-8 text-4xl font-semibold tracking-tight text-[#faf8f5]">
                    {plan.price}
                    <span className="text-lg font-normal text-[#57534e]"> / mois</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-[#a8a29a]"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c4a574]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold tracking-tight transition ${
                      plan.highlight
                        ? "bg-[#f5f0e8] text-[#1a1816] hover:bg-white"
                        : "border border-white/[0.1] bg-transparent text-[#e8e4dc] hover:bg-white/[0.04]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.04] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={120}
              height={32}
              className="h-6 w-auto brightness-0 invert opacity-45"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#57534e]">
              <Link href="/login" className="hover:text-[#a8a29a]">
                Connexion
              </Link>
              <Link href="/signup" className="hover:text-[#a8a29a]">
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
