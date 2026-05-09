"use client";

import Link from "next/link";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Play } from "lucide-react";

const displaySerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-zg-display",
});

const photos = {
  hero:
    "https://images.unsplash.com/photo-1550966871-bfbe9278ea0a?auto=format&fit=crop&w=2400&q=88",
  storyA:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=800&q=82",
  storyB:
    "https://images.unsplash.com/photo-1514933651103-005eec066c6b?auto=format&fit=crop&w=800&q=82",
  storyC:
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=82",
  storyD:
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=82",
  expMenu:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=86",
  expReserve:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=86",
  expMobile:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=86",
  evolve1:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
  evolve2:
    "https://images.unsplash.com/photo-1424847658872-19fb9fa8b392?auto=format&fit=crop&w=900&q=85",
  evolve3:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85",
  evolve4:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85",
  previewThumb1:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=82",
  previewThumb2:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=600&q=82",
  previewThumb3:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=82",
  closing:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=86",
} as const;

const easeLux = [0.22, 1, 0.36, 1] as const;

const FILM_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.028'/%3E%3C/svg%3E\")";

function Canvas() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_90%_at_50%_-18%,rgba(212,184,150,0.055),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_92%_28%,rgba(120,90,72,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_38%_at_8%_72%,rgba(42,38,36,0.45),transparent_58%)]" />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: FILM_GRAIN,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0b]/35" />
    </div>
  );
}

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: 0.9, delay, ease: easeLux },
  };
}

const journeyLoop = {
  duration: 9.5,
  repeat: Number.POSITIVE_INFINITY,
  ease: "easeInOut" as const,
};

/** Parcours invité : découverte → page ZenGrow → réservation (animation hero, pas d’admin). */
function HeroReservationJourneyVisual({
  display,
  reduce,
}: {
  display: string;
  reduce: boolean;
}) {
  const thumbs = [photos.previewThumb1, photos.previewThumb2, photos.previewThumb3] as const;

  return (
    <>
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_78%_56%_at_50%_52%,rgba(196,165,116,0.09),transparent_72%)] blur-3xl sm:-inset-10" />

      <div className="relative rounded-[1.35rem] p-[1px] ring-1 ring-white/[0.08] sm:rounded-[1.85rem]">
        <div className="overflow-hidden rounded-[1.3rem] bg-[#0a0a0b]/85 backdrop-blur-sm sm:rounded-[1.8rem]">
          <p className="border-b border-white/[0.06] px-4 py-3 text-center text-[0.625rem] font-medium uppercase tracking-[0.26em] text-[#6b6560] sm:px-6 sm:text-[0.6875rem]">
            De la découverte à la réservation
          </p>

          <div className="flex flex-col gap-0 px-3 py-5 sm:px-5 sm:py-7 lg:flex-row lg:items-center lg:gap-0 lg:px-6 lg:py-8">
            {/* 1 — Découverte */}
            <motion.div
              className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10]/95 p-4 shadow-[0_28px_64px_-40px_rgba(0,0,0,0.9)] lg:w-[min(100%,240px)] lg:rounded-[1.25rem]"
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: [0.72, 1, 0.88, 0.72, 0.72],
                      boxShadow: [
                        "0 0 0 1px rgba(255,255,255,0.06) inset, 0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 0 0 1px rgba(196,165,116,0.22) inset, 0 36px 72px -42px rgba(0,0,0,0.88)",
                        "0 0 0 1px rgba(255,255,255,0.07) inset, 0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 0 0 1px rgba(255,255,255,0.06) inset, 0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 0 0 1px rgba(255,255,255,0.06) inset, 0 28px 64px -40px rgba(0,0,0,0.9)",
                      ],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : { ...journeyLoop, times: [0, 0.22, 0.42, 0.55, 1] }
              }
            >
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#78716c]">
                Découverte
              </p>
              <ul className="mt-3 space-y-2.5 text-left text-[0.8125rem] leading-snug text-[#c9c3bc]">
                <li>
                  <span className="text-[#9c9690]">Instagram</span>
                  <span className="mx-1.5 text-white/15">·</span>
                  <span className="text-[#a8a29a]">Fil & inspiration</span>
                </li>
                <li>
                  <span className="text-[#9c9690]">Google Maps</span>
                  <span className="mx-1.5 text-white/15">·</span>
                  <span className="text-[#a8a29a]">À deux pas</span>
                </li>
                <li>
                  <span className="text-[#9c9690]">Recommandation</span>
                  <span className="mx-1.5 text-white/15">·</span>
                  <span className="text-[#a8a29a]">Confiance</span>
                </li>
              </ul>
              <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-white/[0.07]">
                <Image
                  src={photos.storyA}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="240px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 to-transparent" />
              </div>
            </motion.div>

            {/* Connecteur 1 */}
            <div className="relative flex h-10 items-center justify-center lg:h-auto lg:w-8 lg:shrink-0 xl:w-11">
              <div className="h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent lg:hidden" />
              <motion.div
                className="hidden h-px w-full origin-left rounded-full bg-gradient-to-r from-[#c4a574]/15 via-[#c4a574]/55 to-[#c4a574]/15 lg:block"
                animate={reduce ? undefined : { scaleX: [0.2, 1, 1, 0.25, 0.2], opacity: [0.35, 1, 1, 0.4, 0.35] }}
                transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.18, 0.5, 0.62, 1] }}
              />
              {!reduce ? (
                <motion.div
                  className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-8 -translate-x-1/2 lg:block"
                  aria-hidden
                >
                  <motion.div
                    className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#d4c4a8] shadow-[0_0_14px_rgba(212,196,168,0.55)]"
                    animate={{ left: ["0%", "100%", "100%", "0%", "0%"], opacity: [0, 1, 1, 0, 0] }}
                    transition={{ ...journeyLoop, times: [0, 0.25, 0.48, 0.52, 1] }}
                  />
                </motion.div>
              ) : null}
            </div>

            {/* 2 — Page restaurant ZenGrow */}
            <motion.div
              className="relative w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c0c0d] shadow-[0_40px_90px_-48px_rgba(0,0,0,0.92)] lg:rounded-[1.35rem]"
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: [0.82, 0.92, 1, 1, 0.82],
                      boxShadow: [
                        "0 40px 90px -48px rgba(0,0,0,0.92)",
                        "0 40px 90px -48px rgba(0,0,0,0.92)",
                        "0 48px 100px -44px rgba(0,0,0,0.88), 0 0 0 1px rgba(196,165,116,0.18) inset",
                        "0 48px 100px -44px rgba(0,0,0,0.88), 0 0 0 1px rgba(196,165,116,0.14) inset",
                        "0 40px 90px -48px rgba(0,0,0,0.92)",
                      ],
                    }
              }
              transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.2, 0.38, 0.72, 1] }}
            >
              <div className="flex items-center justify-center gap-x-2 border-b border-white/[0.06] bg-[#0a0a0b]/95 px-3 py-2 sm:px-4">
                <span className="text-[0.6rem] font-medium tracking-[0.12em] text-[#5c5752] sm:text-[0.625rem]">
                  zengrow.app
                </span>
                <span className="text-[0.6rem] text-white/18">/</span>
                <span className="text-[0.6rem] font-medium tracking-tight text-white/42 sm:text-[0.625rem]">
                  maison-selene
                </span>
              </div>

              <div className="relative aspect-[16/10] min-h-[180px] w-full max-h-[min(52vh,420px)] sm:aspect-[2.05/1] sm:min-h-[200px]">
                <motion.div
                  className="absolute inset-0"
                  animate={reduce ? undefined : { scale: [1, 1.02, 1.02, 1, 1] }}
                  transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.35, 0.65, 0.85, 1] }}
                  style={{ transformOrigin: "50% 42%" }}
                >
                  <Image
                    src={photos.hero}
                    alt=""
                    fill
                    className="object-cover object-[center_42%]"
                    sizes="(max-width: 1024px) 100vw, 720px"
                    priority
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/28 to-[#0a0a0b]/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/45 via-transparent to-[#0a0a0b]/45" />

                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-7">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/38">
                    Genève
                  </p>
                  <p
                    className={`${display} mt-1 text-[1.35rem] leading-[1.06] tracking-[-0.02em] text-[#faf8f5] sm:text-[1.85rem] md:text-[2.15rem]`}
                  >
                    Maison Sélène
                  </p>

                  <motion.div
                    className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2"
                    initial={false}
                    animate={
                      reduce
                        ? undefined
                        : { opacity: [0.75, 0.75, 1, 1, 0.75], y: [4, 4, 0, 0, 4] }
                    }
                    transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.28, 0.4, 0.78, 1] }}
                  >
                    {thumbs.map((src) => (
                      <div
                        key={src}
                        className="relative h-10 w-[2.65rem] shrink-0 overflow-hidden rounded-md ring-1 ring-white/12 sm:h-11 sm:w-14 sm:rounded-lg"
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="mt-3 space-y-1.5 sm:mt-3.5"
                    animate={reduce ? undefined : { opacity: [0.55, 0.55, 1, 1, 0.55] }}
                    transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.32, 0.44, 0.8, 1] }}
                  >
                    <p className="text-[0.7rem] text-white/55 sm:text-[0.72rem]">
                      <span className="text-white/70">Entrée</span> · Velouté & herbes fines
                    </p>
                    <p className="text-[0.7rem] text-white/55 sm:text-[0.72rem]">
                      <span className="text-white/70">Plat</span> · Terre & mer
                    </p>
                    <p className="text-[0.7rem] text-white/55 sm:text-[0.72rem]">
                      <span className="text-white/70">Dessert</span> · Citron & meringue
                    </p>
                  </motion.div>

                  <div className="mt-4 sm:mt-5">
                    <motion.span
                      className="inline-flex rounded-full bg-[#f2ebe3] px-4 py-2 text-[0.75rem] font-semibold tracking-tight text-[#141210] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.75)] sm:px-5 sm:text-[0.8125rem]"
                      animate={
                        reduce
                          ? undefined
                          : {
                              scale: [1, 1, 1.04, 1, 1],
                              boxShadow: [
                                "0 12px 32px -16px rgba(0,0,0,0.75)",
                                "0 12px 32px -16px rgba(0,0,0,0.75)",
                                "0 18px 40px -14px rgba(212,196,168,0.35)",
                                "0 12px 32px -16px rgba(0,0,0,0.75)",
                                "0 12px 32px -16px rgba(0,0,0,0.75)",
                              ],
                            }
                      }
                      transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.34, 0.42, 0.5, 1] }}
                    >
                      Réserver une table
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Connecteur 2 */}
            <div className="relative flex h-10 items-center justify-center lg:h-auto lg:w-8 lg:shrink-0 xl:w-11">
              <div className="h-full w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent lg:hidden" />
              <motion.div
                className="hidden h-px w-full origin-left rounded-full bg-gradient-to-r from-[#c4a574]/15 via-[#c4a574]/55 to-[#c4a574]/15 lg:block"
                animate={reduce ? undefined : { scaleX: [0.2, 0.2, 1, 1, 0.2], opacity: [0.35, 0.35, 1, 0.45, 0.35] }}
                transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.4, 0.52, 0.78, 1] }}
              />
              {!reduce ? (
                <motion.div
                  className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-8 -translate-x-1/2 lg:block"
                  aria-hidden
                >
                  <motion.div
                    className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#d4c4a8] shadow-[0_0_14px_rgba(212,196,168,0.55)]"
                    animate={{ left: ["0%", "0%", "100%", "100%", "0%"], opacity: [0, 0, 1, 1, 0] }}
                    transition={{ ...journeyLoop, times: [0, 0.42, 0.52, 0.82, 1] }}
                  />
                </motion.div>
              ) : null}
            </div>

            {/* 3 — Confirmation */}
            <motion.div
              className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e10]/95 p-4 shadow-[0_28px_64px_-40px_rgba(0,0,0,0.9)] lg:w-[min(100%,248px)] lg:rounded-[1.25rem]"
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: [0.45, 0.5, 0.55, 1, 1, 0.45],
                      y: [6, 6, 4, 0, 0, 6],
                      boxShadow: [
                        "0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 28px 64px -40px rgba(0,0,0,0.9)",
                        "0 36px 72px -38px rgba(0,0,0,0.85), 0 0 0 1px rgba(196,165,116,0.2) inset",
                        "0 36px 72px -38px rgba(0,0,0,0.85), 0 0 0 1px rgba(196,165,116,0.16) inset",
                        "0 28px 64px -40px rgba(0,0,0,0.9)",
                      ],
                    }
              }
              transition={reduce ? undefined : { ...journeyLoop, times: [0, 0.38, 0.48, 0.56, 0.82, 1] }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c4a574]/25 bg-[#c4a574]/12">
                  <Check className="h-4 w-4 text-[#d4c4a8]" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 text-left">
                  <p className={`${display} text-[1.125rem] leading-tight text-[#faf8f5] sm:text-[1.2rem]`}>
                    Table confirmée
                  </p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-[#9c9690]">
                    Ce soir · 20h30 · 2 personnes
                  </p>
                  <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#5c5752]">
                    Confirmation instantanée
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

const plans = [
  {
    name: "Expérience réservation",
    tagline: "Pour les établissements qui ont déjà une vitrine.",
    price: "49 CHF",
    highlight: false,
    features: [
      "Parcours de réservation fluide",
      "Mobile impeccable, sans friction",
      "Disponibilités sous votre contrôle",
      "Confirmations invités instantanées",
    ],
    cta: "Commencer",
  },
  {
    name: "Expérience restaurant complète",
    tagline: "Découverte, émotion et réservation réunies.",
    price: "69 CHF",
    highlight: true,
    features: [
      "Page restaurant d’exception",
      "Carte, ambiance et photographie",
      "Réservations et relation client",
      "Campagnes, événements, avis Google",
    ],
    cta: "Choisir l’expérience complète",
  },
];

export function ZenGrowLanding() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;

  return (
    <div
      className={`${displaySerif.variable} relative min-h-screen overflow-x-hidden bg-[#0a0a0b] text-[#e8e4dc] selection:bg-[#c4a574]/22 selection:text-[#faf8f5]`}
    >
      <Canvas />

      <header className="sticky top-0 z-50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[3.25rem] items-center sm:h-14">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
              <Link href="/" className="justify-self-start">
                <Image
                  src="/Zengrow-logo.png"
                  alt="Zen Grow"
                  width={120}
                  height={34}
                  className="h-[1.15rem] w-auto object-contain opacity-[0.9] brightness-0 invert sm:h-5"
                  priority
                />
              </Link>

              <nav className="justify-self-center hidden items-center gap-7 text-[0.8125rem] font-medium text-[#9c9690] md:flex">
                <a href="#parcours" className="transition hover:text-[#f5f0e8]">
                  Parcours
                </a>
                <a href="#experience" className="transition hover:text-[#f5f0e8]">
                  Expérience
                </a>
                <a href="#plateforme" className="transition hover:text-[#f5f0e8]">
                  Plateforme
                </a>
                <a href="#tarifs" className="transition hover:text-[#f5f0e8]">
                  Tarifs
                </a>
              </nav>

              <div className="justify-self-end flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="hidden text-[0.8125rem] font-medium text-[#9c9690] transition hover:text-[#f5f0e8] sm:inline"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f2ebe3] px-3.5 py-2 text-[0.75rem] font-semibold tracking-tight text-[#141210] shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] transition hover:bg-white sm:px-5 sm:text-[0.8125rem]"
                >
                  Créer ma page restaurant
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.045] pb-2.5 pt-2 md:hidden">
            <nav className="flex items-center justify-center gap-5 overflow-x-auto text-[0.7rem] font-medium text-[#78716c] scrollbar-none">
              <a href="#parcours" className="shrink-0 whitespace-nowrap hover:text-[#e8e4dc]">
                Parcours
              </a>
              <a href="#experience" className="shrink-0 whitespace-nowrap hover:text-[#e8e4dc]">
                Expérience
              </a>
              <a href="#plateforme" className="shrink-0 whitespace-nowrap hover:text-[#e8e4dc]">
                Plateforme
              </a>
              <a href="#tarifs" className="shrink-0 whitespace-nowrap hover:text-[#e8e4dc]">
                Tarifs
              </a>
              <Link href="/login" className="shrink-0 whitespace-nowrap hover:text-[#e8e4dc]">
                Connexion
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 font-[family-name:var(--font-geist-sans),system-ui,sans-serif]">
        {/* Hero */}
        <section className="relative px-4 pb-20 sm:px-6 sm:pb-24 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-[1100px] pt-16 text-center sm:pt-24 md:pt-32 lg:pt-40 xl:pt-44 2xl:pt-48">
            <motion.h1
              className={`${display} mx-auto max-w-[18ch] text-[2.375rem] font-normal leading-[1.02] tracking-[-0.028em] text-[#faf8f5] sm:max-w-none sm:text-[3.25rem] sm:leading-[1.02] md:text-[4rem] md:leading-[1.01] lg:text-[4.75rem] lg:leading-[1.01] xl:text-[5.25rem] xl:leading-[1.01]`}
              initial={reduce ? false : { opacity: 0, y: 36 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1.05, ease: easeLux }}
            >
              <span className="block text-balance">Les clients ne veulent plus chercher.</span>
              <span className="mt-[0.06em] block whitespace-nowrap text-[#d4c4a8] text-[clamp(1.05rem,4.2vw+0.65rem,5.25rem)] leading-[1.02] tracking-[-0.028em] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.75rem] xl:text-[5.25rem]">
                Ils veulent réserver immédiatement.
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-12 flex max-w-md flex-col gap-1 text-balance text-[0.9375rem] font-normal leading-[1.62] text-[#9c9690] sm:mt-14 sm:max-w-lg sm:text-[1.0625rem] sm:leading-[1.6] md:mt-16"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease: easeLux, delay: 0.08 }}
            >
              <span>Aujourd&apos;hui, un restaurant se découvre en quelques secondes.</span>
              <span>ZenGrow transforme cette découverte en réservation.</span>
            </motion.p>

            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4 md:mt-16"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.88, ease: easeLux, delay: 0.14 }}
            >
              <Link
                href="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f2ebe3] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#141210] shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] transition duration-300 hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(242,235,227,0.35)] sm:w-auto"
              >
                Créer ma page restaurant
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <a
                href="#demo"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.11] bg-white/[0.02] px-8 py-3.5 text-[0.875rem] font-medium text-[#ebe6df] transition duration-300 hover:border-white/[0.18] hover:bg-white/[0.04] sm:w-auto"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] transition group-hover:border-white/[0.2]">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Voir la démo
              </a>
            </motion.div>
          </div>

          <motion.div
            id="demo"
            className="relative mx-auto mt-20 w-full max-w-[1200px] px-0 sm:mt-24 md:mt-28 lg:mt-32"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: easeLux, delay: 0.06 }}
            aria-label="Aperçu d'une page restaurant ZenGrow"
          >
            <HeroReservationJourneyVisual display={display} reduce={Boolean(reduce)} />
          </motion.div>
        </section>

        {/* Section 2 — Parcours découverte */}
        <section
          id="parcours"
          className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1100px]">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} mx-auto max-w-[22ch] text-center text-[2rem] font-normal leading-[1.08] tracking-[-0.022em] text-[#faf8f5] sm:max-w-4xl sm:text-[2.65rem] md:text-[3.15rem]`}
            >
              Aujourd&apos;hui, tout se décide en quelques secondes.
            </motion.h2>

            <motion.p
              {...useFadeUp(0.06)}
              className="mx-auto mt-8 max-w-xl text-center text-[0.9375rem] leading-[1.8] text-[#9c9690] sm:mt-10 sm:text-[1.03125rem]"
            >
              Une story qui commence sur un fil, une carte, une recommandation — puis se conclut
              dans la paume d’une main.
            </motion.p>

            <div className="mt-16 sm:mt-20">
              <div className="relative mx-auto max-w-4xl">
                <div
                  aria-hidden
                  className="absolute left-[8%] right-[8%] top-[42%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent md:block"
                />
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                  {[
                    {
                      kicker: "Fil & inspiration",
                      label: "Instagram",
                      img: photos.storyA,
                    },
                    {
                      kicker: "Repère du quartier",
                      label: "Google Maps",
                      img: photos.storyB,
                    },
                    {
                      kicker: "Découverte verticale",
                      label: "TikTok",
                      img: photos.storyC,
                    },
                    {
                      kicker: "Confiance humaine",
                      label: "Recommandations",
                      img: photos.storyD,
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={reduce ? false : { opacity: 0, y: 20 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ delay: i * 0.06, duration: 0.75, ease: easeLux }}
                      className="group text-center lg:text-left"
                    >
                      <div className="relative mx-auto mb-5 aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-2xl ring-1 ring-white/[0.07] sm:max-w-none lg:mx-0">
                        <Image
                          src={item.img}
                          alt=""
                          fill
                          className="object-cover transition duration-[1.4s] ease-out group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 45vw, 200px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 via-transparent to-transparent" />
                      </div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#6b6560]">
                        {item.kicker}
                      </p>
                      <p className={`${display} mt-2 text-[1.125rem] text-[#ebe6df]`}>
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Nouvelle expérience */}
        <section
          id="experience"
          className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end lg:gap-16">
              <motion.div {...useFadeUp(0)} className="max-w-xl lg:pb-4">
                <h2
                  className={`${display} text-[2rem] font-normal leading-[1.08] tracking-[-0.022em] text-[#faf8f5] sm:text-[2.65rem] md:text-[3.05rem]`}
                >
                  Une nouvelle expérience restaurant.
                </h2>
                <p className="mt-8 text-[0.9375rem] leading-[1.85] text-[#9c9690] sm:text-[1.03125rem]">
                  ZenGrow réunit la découverte, la réservation et le mobile dans un flux unique —
                  rapide, silencieux, mémorable. L’invité sent la maison avant d’avoir franchi le
                  seuil.
                </p>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.95, ease: easeLux }}
                className="relative mt-14 lg:mt-0"
              >
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] ring-1 ring-white/[0.07] sm:row-span-2 sm:aspect-auto sm:min-h-[420px]">
                    <Image
                      src={photos.expMenu}
                      alt="Carte et dressage, ambiance éditoriale"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/65 via-transparent to-transparent" />
                    <p
                      className={`${display} absolute bottom-5 left-5 right-5 text-[1.125rem] text-[#faf8f5] sm:bottom-6 sm:left-6`}
                    >
                      Carte comme un magazine
                    </p>
                  </div>
                  <div className="relative aspect-[16/11] overflow-hidden rounded-[1.35rem] ring-1 ring-white/[0.07]">
                    <Image
                      src={photos.expReserve}
                      alt="Table dressée, lumière douce"
                      fill
                      className="object-cover object-[center_55%]"
                      sizes="(max-width: 640px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/6 via-transparent to-[#0a0a0b]/25" />
                    <p
                      className={`${display} absolute bottom-4 left-4 right-4 text-[1.05rem] text-[#faf8f5]`}
                    >
                      Réservation en un souffle
                    </p>
                  </div>
                  <div className="relative aspect-[16/11] overflow-hidden rounded-[1.35rem] ring-1 ring-white/[0.07]">
                    <Image
                      src={photos.expMobile}
                      alt="Service en salle, gestuelle raffinée"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/55 via-transparent to-transparent" />
                    <p
                      className={`${display} absolute bottom-4 left-4 right-4 text-[1.05rem] text-[#faf8f5]`}
                    >
                      Mobile pensé pour une main
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 4 — Plateforme (révélée ici, sobre) */}
        <section
          id="plateforme"
          className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[900px]">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} text-center text-[2rem] font-normal leading-[1.1] tracking-[-0.022em] text-[#faf8f5] sm:text-[2.55rem] md:text-[3rem]`}
            >
              <span className="block">Derrière chaque expérience,</span>
              <span className="mt-2 block text-[#d4c4a8] sm:mt-2.5">
                une vraie plateforme restaurant.
              </span>
            </motion.h2>

            <motion.p
              {...useFadeUp(0.06)}
              className="mx-auto mt-8 max-w-lg text-center text-[0.9375rem] leading-[1.82] text-[#9c9690] sm:mt-10"
            >
              Tout ce qui fait tourner la maison — sans bruit, sans tableaux de bord oppressants.
              Une lecture calme, pour des équipes concentrées sur le service.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: easeLux }}
              className="relative mt-14 sm:mt-16"
            >
              <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(ellipse_85%_70%_at_50%_0%,rgba(196,165,116,0.06),transparent_62%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0e0e10]/75 shadow-[0_40px_80px_-48px_rgba(0,0,0,0.92)] backdrop-blur-xl">
                <div className="border-b border-white/[0.06] px-7 py-6 sm:px-9 sm:py-7">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[#6b6560]">
                    ZenGrow · espace restaurant
                  </p>
                  <p className={`${display} mt-3 text-[1.35rem] text-[#f5f0e8] sm:text-[1.5rem]`}>
                    Un rythme clair, une seule intention
                  </p>
                </div>
                <ul className="divide-y divide-white/[0.06]">
                  {[
                    {
                      title: "Réservations",
                      sub: "Créneaux, confirmations, file d’attente élégante.",
                    },
                    {
                      title: "Campagnes",
                      sub: "Moments forts, messages ciblés, sans surcharge.",
                    },
                    {
                      title: "Clients",
                      sub: "Historique, préférences, accueil personnalisé.",
                    },
                    {
                      title: "Événements",
                      sub: "Soirées, dégustations, lancement de carte.",
                    },
                    {
                      title: "Avis Google",
                      sub: "Réputation soignée, réponses dans le ton de la maison.",
                    },
                  ].map((row) => (
                    <li
                      key={row.title}
                      className="flex flex-col gap-1 px-7 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-9 sm:py-5"
                    >
                      <span className={`${display} text-[1.0625rem] text-[#ebe6df]`}>
                        {row.title}
                      </span>
                      <span className="max-w-md text-[0.8125rem] leading-relaxed text-[#7f7973] sm:text-right">
                        {row.sub}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 5 — Évolution */}
        <section className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1200px]">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} mx-auto max-w-[20ch] text-center text-[2rem] font-normal leading-[1.08] tracking-[-0.022em] text-[#faf8f5] sm:max-w-3xl sm:text-[2.65rem] md:text-[3.05rem]`}
            >
              Un restaurant évolue constamment.
            </motion.h2>
            <motion.p
              {...useFadeUp(0.05)}
              className="mx-auto mt-8 max-w-xl text-center text-[0.9375rem] leading-[1.82] text-[#9c9690] sm:mt-10"
            >
              Nouveaux plats, soirées spontanées, menus saisonniers : tout se met à jour en
              quelques gestes — votre page reste aussi vivante que la salle.
            </motion.p>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {[
                { label: "Nouveaux plats", src: photos.evolve1 },
                { label: "Soirées", src: photos.evolve2 },
                { label: "Événements", src: photos.evolve3 },
                { label: "Menus saisonniers", src: photos.evolve4 },
              ].map((item, i) => (
                <motion.article
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: i * 0.06, duration: 0.75, ease: easeLux }}
                  className="group overflow-hidden rounded-[1.25rem] ring-1 ring-white/[0.07]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/75 via-[#0a0a0b]/10 to-transparent" />
                    <p
                      className={`${display} absolute bottom-4 left-4 right-4 text-[1.0625rem] text-[#faf8f5]`}
                    >
                      {item.label}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="relative px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-32">
          <div className="mx-auto max-w-[1000px]">
            <motion.div {...useFadeUp(0)} className="text-center">
              <h2
                className={`${display} text-[2rem] font-normal tracking-[-0.022em] text-[#faf8f5] sm:text-[2.5rem]`}
              >
                Tarifs
              </h2>
              <p className="mt-4 text-[0.9375rem] text-[#7f7973]">
                Deux expériences. Une même exigence de détail.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.75, ease: easeLux }}
                  className={`relative flex flex-col rounded-[1.5rem] border p-8 sm:p-9 ${
                    plan.highlight
                      ? "border-[#c4a574]/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] shadow-[0_0_0_1px_rgba(196,165,116,0.08)_inset]"
                      : "border-white/[0.07] bg-white/[0.02]"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full border border-[#c4a574]/28 bg-[#c4a574]/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#d4c4a8]">
                      Complet
                    </span>
                  ) : null}
                  <h3 className={`${display} text-[1.35rem] text-[#faf8f5] sm:text-[1.45rem]`}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-[#7f7973]">
                    {plan.tagline}
                  </p>
                  <p className="mt-9 text-[2.35rem] font-medium tracking-tight text-[#faf8f5] sm:text-[2.5rem]">
                    {plan.price}
                    <span className="text-[1rem] font-normal text-[#5c5752]"> / mois</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-3 text-[0.875rem] leading-relaxed text-[#a8a29a]"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#c4a574]/85" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full py-3.5 text-[0.875rem] font-semibold tracking-tight transition ${
                      plan.highlight
                        ? "bg-[#f2ebe3] text-[#141210] hover:bg-white"
                        : "border border-white/[0.12] text-[#ebe6df] hover:bg-white/[0.04]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Clôture */}
        <section className="relative px-4 pb-28 pt-4 sm:px-6 sm:pb-32 lg:px-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.95, ease: easeLux }}
            className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[1.75rem] ring-1 ring-white/[0.07]"
          >
            <div className="relative aspect-[16/10] min-h-[280px] w-full sm:aspect-[2.2/1] sm:min-h-[320px]">
              <Image
                src={photos.closing}
                alt="Ambiance de restaurant moderne, conviviale"
                fill
                className="object-cover object-[center_40%]"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[#0a0a0b]/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/55 to-[#0a0a0b]/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/55 via-transparent to-[#0a0a0b]/55" />
              {!reduce ? (
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(212,196,168,0.09),transparent_60%)]"
                  animate={{ opacity: [0.45, 0.7, 0.45] }}
                  transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              ) : null}

              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <h2
                  className={`${display} max-w-[18ch] text-[1.85rem] font-normal leading-[1.1] tracking-[-0.02em] text-[#faf8f5] sm:max-w-3xl sm:text-[2.65rem] md:text-[3.15rem]`}
                >
                  Les meilleurs restaurants donnent envie immédiatement.
                </h2>
                <p className="mx-auto mt-6 max-w-md text-[0.9375rem] leading-[1.82] text-[#c9c3bc] sm:mt-8 sm:text-[1.03125rem]">
                  ZenGrow transforme cette envie en réservation.
                </p>
                <Link
                  href="/signup"
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f2ebe3] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#141210] transition hover:bg-white"
                >
                  Créer ma page restaurant
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-white/[0.045] px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/Zengrow-logo.png"
              alt="Zen Grow"
              width={96}
              height={28}
              className="h-4 w-auto opacity-40 brightness-0 invert"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-[0.75rem] text-[#5c5752]">
              <Link href="/login" className="transition hover:text-[#9c9690]">
                Connexion
              </Link>
              <Link href="/signup" className="transition hover:text-[#9c9690]">
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
