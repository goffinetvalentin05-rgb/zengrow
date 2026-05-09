"use client";

import type { CSSProperties } from "react";
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
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** Warm hospitality photography — Unsplash */
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
} as const;

const easeOut = [0.16, 1, 0.3, 1] as const;

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.75, delay, ease: easeOut },
  };
}

function SoftLight({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[100px] ${className ?? ""}`}
      style={style}
    />
  );
}

function PhoneMockup() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative mx-auto w-[min(100%,292px)] sm:w-[308px]"
      initial={reduce ? false : { opacity: 0, y: 36 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: easeOut, delay: 0.12 }}
      style={{ perspective: 1400 }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{
          duration: 16,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div
          className="absolute -inset-10 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(212,184,150,0.14), transparent 62%), radial-gradient(ellipse 50% 45% at 75% 75%, rgba(180,130,90,0.08), transparent 55%)",
            filter: "blur(40px)",
          }}
        />
        <div className="relative rounded-[2.4rem] border border-white/[0.09] bg-gradient-to-b from-[#1a1a1c] to-[#0a0a0b] p-[11px] shadow-[0_50px_100px_-45px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex justify-center pb-2 pt-0.5">
            <div className="h-1 w-[4.25rem] rounded-full bg-white/[0.12]" />
          </div>
          <div className="overflow-hidden rounded-[1.9rem] bg-[#0c0c0d] ring-1 ring-white/[0.05]">
            <div className="relative h-[148px] w-full overflow-hidden">
              <Image
                src={photos.phoneHero}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 280px, 308px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/25 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div>
                  <p
                    className={`text-[9px] font-medium uppercase tracking-[0.28em] text-white/55 ${displaySerif.className}`}
                  >
                    This evening
                  </p>
                  <p
                    className={`mt-0.5 text-lg font-medium tracking-tight text-white ${displaySerif.className}`}
                  >
                    Maison Nord
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">
                    Contemporary · Geneva
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-medium text-[#f5f0e8] backdrop-blur-md">
                  Open
                </span>
              </div>
            </div>
            <div className="space-y-2.5 px-3 pb-3.5 pt-3">
              <div className="flex gap-1.5">
                {[
                  { src: photos.phoneThumbA, label: "Chef" },
                  { src: photos.phoneThumbB, label: "Wine" },
                  { src: photos.phoneThumbC, label: "Room" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="relative h-12 flex-1 overflow-hidden rounded-lg ring-1 ring-white/[0.08]"
                  >
                    <Image
                      src={t.src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
                  Menu
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between gap-2 text-[11px]">
                    <span className="text-[#e8e4dc]/90">Seasonal tasting</span>
                    <span className="tabular-nums text-white/40">€98</span>
                  </div>
                  <div className="flex justify-between gap-2 text-[11px]">
                    <span className="text-[#e8e4dc]/65">Vegetarian journey</span>
                    <span className="tabular-nums text-white/30">€72</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8dfd0] py-2.5 text-[13px] font-semibold tracking-tight text-[#1a1816] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition hover:bg-[#f0ebe3] ${displaySerif.className}`}
              >
                Reserve a table
                <ChevronRight className="h-4 w-4 opacity-70" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const plans = [
  {
    name: "Reservation Experience",
    tagline: "You already have a website.",
    price: "49 CHF",
    highlight: false,
    features: [
      "Modern booking flow",
      "Mobile-perfect reservations",
      "Availability you control",
      "Guest confirmations",
    ],
    cta: "Start with booking",
  },
  {
    name: "Complete Restaurant Experience",
    tagline: "Full discovery + reservations.",
    price: "69 CHF",
    highlight: true,
    features: [
      "Premium restaurant page",
      "Photos, menu, ambiance",
      "Reservations + guest CRM",
      "Campaigns & automations",
    ],
    cta: "Get the full experience",
  },
];

export function ZenGrowLanding() {
  const reduce = useReducedMotion();
  const fade = useFadeUp(0);
  const display = displaySerif.className;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080809] text-[#e8e4dc] selection:bg-[#c4a574]/25 selection:text-[#faf8f5]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-25%,rgba(212,184,150,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_90%_30%,rgba(139,90,60,0.05),transparent_50%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080809]/80 backdrop-blur-2xl backdrop-saturate-150">
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
              Story
            </a>
            <a href="#experience" className="transition hover:text-[#f5f0e8]">
              Experience
            </a>
            <a href="#system" className="transition hover:text-[#f5f0e8]">
              Platform
            </a>
            <a href="#pricing" className="transition hover:text-[#f5f0e8]">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-[#a8a29a] transition hover:text-[#f5f0e8] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f0e8] px-4 py-2 text-xs font-semibold tracking-tight text-[#1a1816] transition hover:bg-white sm:px-5 sm:text-sm"
            >
              Create my restaurant page
            </Link>
          </div>
        </div>
        <div className="border-t border-white/[0.04] px-4 py-2.5 md:hidden">
          <nav className="mx-auto flex max-w-6xl items-center justify-center gap-4 overflow-x-auto text-xs font-medium text-[#78716c]">
            <a href="#story" className="shrink-0 hover:text-[#f5f0e8]">
              Story
            </a>
            <a href="#experience" className="shrink-0 hover:text-[#f5f0e8]">
              Experience
            </a>
            <a href="#system" className="shrink-0 hover:text-[#f5f0e8]">
              Platform
            </a>
            <a href="#pricing" className="shrink-0 hover:text-[#f5f0e8]">
              Pricing
            </a>
            <Link href="/login" className="shrink-0 hover:text-[#f5f0e8]">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
          <SoftLight className="left-1/2 top-0 h-[min(72vw,480px)] w-[min(92vw,680px)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(232,223,208,0.09),transparent_68%)]" />
          <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12">
            <motion.div {...fade} className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#111113]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4b5a0] sm:text-[11px]">
                <span className="h-1 w-1 rounded-full bg-[#c4a574]" />
                New generation for restaurants
              </span>
              <h1
                className={`${display} mt-8 text-balance text-[2.125rem] font-medium leading-[1.06] tracking-[-0.02em] text-[#faf8f5] sm:text-5xl sm:leading-[1.05] lg:text-[3.35rem]`}
              >
                Clients don&apos;t want to search anymore.
                <span className="mt-3 block font-medium text-[#d4b896]">
                  They want to reserve instantly.
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-base font-normal leading-relaxed text-[#a8a29a] sm:text-[1.05rem] sm:leading-relaxed">
                ZenGrow transforms the way restaurants are discovered online — a
                calmer, more modern path from first glance to confirmed table.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5f0e8] px-6 py-3.5 text-sm font-semibold tracking-tight text-[#1a1816] transition hover:bg-white"
                >
                  Create my restaurant page
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <a
                  href="#story"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-[#e8e4dc] transition hover:border-white/[0.16] hover:bg-white/[0.04]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                  Watch demo
                </a>
              </div>
            </motion.div>
            <div className="relative flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* SECTION 2 — MODERN BEHAVIOR */}
        <section
          id="story"
          className="relative border-t border-white/[0.05] bg-[#0c0c0e] px-4 py-24 sm:px-6 lg:px-8"
        >
          <SoftLight className="right-0 top-1/3 h-72 w-72 translate-x-1/4 bg-[rgba(196,165,116,0.07)]" />
          <div className="mx-auto max-w-6xl">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} mx-auto max-w-3xl text-center text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl lg:text-[2.65rem]`}
            >
              Today, people decide in seconds.
            </motion.h2>

            <div className="mt-20 space-y-12">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65 }}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
              >
                {[
                  { label: "Instagram" },
                  { label: "TikTok" },
                  { label: "Google Maps" },
                  { label: "Word of mouth" },
                ].map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-white/[0.07] bg-[#141416]/90 px-5 py-3.5 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.85)] backdrop-blur-md"
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
                      : { scaleY: [1, 1.08, 1], opacity: [0.35, 0.65, 0.35] }
                  }
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY }}
                  className="h-16 w-px bg-gradient-to-b from-transparent via-[#c4a574]/35 to-transparent"
                />
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7 }}
                className="relative mx-auto max-w-lg"
              >
                <div className="absolute -inset-px rounded-[1.6rem] bg-gradient-to-b from-white/[0.1] to-transparent opacity-40 blur-xl" />
                <div className="relative overflow-hidden rounded-[1.45rem] border border-white/[0.08] bg-[#111113]/95 p-5 shadow-[0_40px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78716c]">
                      ZenGrow page
                    </p>
                    <span className="rounded-full border border-[#c4a574]/25 bg-[#c4a574]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#d4b896]">
                      Live
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
                    {["Ambiance", "Menu", "Photos", "Reserve"].map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          t === "Reserve"
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
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3d3a36] text-[11px] font-semibold text-[#e8dfd0]">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-[#d6d3cd]">
                      Table booked — instant confirmation
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — EXPERIENCE (alternating editorial) */}
        <section
          id="experience"
          className="relative px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_min(380px,38vw)] lg:gap-16 lg:items-start">
            <motion.div {...useFadeUp(0)} className="max-w-xl lg:pt-4">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl lg:text-[2.65rem]`}
              >
                Built for modern restaurant discovery.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[#a8a29a]">
                ZenGrow removes friction between discovering a restaurant and
                booking it.
              </p>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.75 }}
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
                title: "Fast reservation flow",
                sub: "Seconds, not forms.",
                visual: "flow",
                img: photos.phoneThumbA,
              },
              {
                title: "Mobile experience",
                sub: "Designed for one hand.",
                visual: "mobile",
                img: photos.phoneHero,
              },
              {
                title: "Modern menu",
                sub: "Typography you’d expect in print.",
                visual: "menu",
                img: photos.tileMenu,
              },
              {
                title: "Clean restaurant pages",
                sub: "Mood first. Details second.",
                visual: "page",
                img: photos.sceneEditorial,
              },
              {
                title: "Smooth interactions",
                sub: "Quiet motion. No noise.",
                visual: "motion",
                img: photos.phoneThumbC,
              },
            ].map((card, i) => (
              <motion.article
                key={card.title}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.55, delay: i * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f11]/90 p-1 shadow-[0_28px_64px_-44px_rgba(0,0,0,0.9)] ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="relative mb-4 h-32 overflow-hidden rounded-xl ring-1 ring-white/[0.05]">
                  <Image
                    src={card.img}
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/90 via-transparent to-transparent" />
                  {card.visual === "flow" && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#c4a574]" />
                      <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-[#c4a574]/50 to-transparent" />
                      <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-medium text-[#e8e4dc] backdrop-blur-sm">
                        Confirm
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
                            : { y: [0, -3, 0], opacity: [0.85, 1, 0.85] }
                        }
                        transition={{
                          duration: 4,
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

        {/* SECTION 4 — BIG REVEAL */}
        <section
          id="system"
          className="relative overflow-hidden border-t border-white/[0.05] bg-[#0a0a0b] px-4 py-24 sm:px-6 lg:px-8"
        >
          <SoftLight className="left-0 bottom-0 h-[28rem] w-[28rem] -translate-x-1/3 translate-y-1/4 bg-[rgba(90,70,55,0.06)]" />
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="max-w-3xl">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl lg:text-[2.55rem]`}
              >
                Behind every page, a complete restaurant system.
              </h2>
              <p className="mt-4 max-w-xl text-[#a8a29a]">
                Operations, guests, and growth — unified in one quiet workspace.
              </p>
            </motion.div>

            <div className="relative mt-20 min-h-[440px] sm:min-h-[500px]">
              <motion.div
                className="absolute left-1/2 top-6 w-[min(100%,380px)] -translate-x-1/2 sm:left-[10%] sm:translate-x-0"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <CalendarDays className="h-4 w-4 text-[#a89078]" />
                    Reservations
                  </div>
                  <div className="mt-3 space-y-2">
                    {["19:30 · Party of 4", "20:00 · Party of 2", "20:45 · Party of 6"].map(
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
                animate={reduce ? undefined : { y: [0, 8, 0] }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Users className="h-4 w-4 text-[#c4a574]" />
                    Guest database
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-[#faf8f5]">
                    2.4k
                  </p>
                  <p className="text-[10px] text-[#57534e]">profiles enriched</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-6 left-0 w-[min(100%,260px)] sm:bottom-10 sm:left-[4%]"
                animate={reduce ? undefined : { y: [0, 5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.15,
                }}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Mail className="h-4 w-4 text-[#a89078]" />
                    Campaigns
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
                animate={reduce ? undefined : { y: [0, -5, 0] }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-[#121214]/95 p-4 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <Star className="h-4 w-4 text-[#c4a574]" />
                    Google reviews
                  </div>
                  <p className="mt-2 text-sm text-[#d6d3cd]">Automation on</p>
                  <div className="mt-2 flex gap-0.5 text-[#c4a574]/85">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>★</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-1/2 w-[min(100%,300px)] -translate-x-1/2 -translate-y-1/2"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
              >
                <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-[#141416] p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]">
                  <div className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-[#c4a574]/10 via-transparent to-transparent opacity-70" />
                  <div className="relative">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#57534e]">
                      Tonight&apos;s pulse
                    </p>
                    <p className="mt-1.5 text-lg font-medium tracking-tight text-[#faf8f5]">
                      Your service, orchestrated
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.06] bg-[#1a1918]/80 p-3">
                        <MapPin className="h-4 w-4 text-[#a89078]" />
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#57534e]">
                          Events
                        </p>
                        <p className="text-sm font-semibold text-[#e8e4dc]">
                          3 live
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-[#1a1918]/80 p-3">
                        <BarChart3 className="h-4 w-4 text-[#c4a574]" />
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-[#57534e]">
                          Analytics
                        </p>
                        <p className="text-sm font-semibold text-[#e8e4dc]">
                          +18%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — ALWAYS UP TO DATE */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-center">
            <motion.h2
              {...useFadeUp(0)}
              className={`${display} max-w-md text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl`}
            >
              Restaurants change constantly. Their online experience should too.
            </motion.h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-0">
              {[
                { label: "New brunch", src: photos.tileBrunch },
                { label: "Special event", src: photos.tileEvent },
                { label: "Summer menu", src: photos.tileMenu },
                { label: "Fresh photos", src: photos.tilePhotos },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.55 }}
                  whileHover={{ y: -2 }}
                  className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f11]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 50vw, 280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080809]/75 via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-[#f5f0e8]">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#78716c]">
                      Live
                    </span>
                  </div>
                  <p className="px-4 pb-3 text-xs text-[#57534e]">
                    Updated in one tap
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.p
            {...useFadeUp(0.08)}
            className="mx-auto mt-14 max-w-6xl text-center text-sm text-[#78716c] sm:text-base"
          >
            Speed. Flexibility. Full autonomy.
          </motion.p>
        </section>

        {/* SECTION 6 — USE CASES */}
        <section className="border-t border-white/[0.05] bg-[#0c0c0e] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {[
              {
                title: "For restaurants without a real online experience",
                points: ["Modern page", "Reservations", "Mobile-first", "Simple setup"],
                img: photos.useCaseA,
              },
              {
                title: "For restaurants with an existing website",
                points: [
                  "Modern booking flow",
                  "Better mobile journey",
                  "Connected guest experience",
                ],
                img: photos.useCaseB,
              },
            ].map((block, i) => (
              <motion.article
                key={block.title}
                initial={reduce ? false : { opacity: 0, y: 26 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.07] bg-[#111113]"
              >
                <div className="relative aspect-[21/9] w-full sm:aspect-[2/1]">
                  <Image
                    src={block.img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/40 to-transparent" />
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
            A faster, more modern restaurant experience — not a forced website
            replacement.
          </motion.p>
        </section>

        {/* SECTION 7 — VISION */}
        <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0">
            <Image
              src={photos.visionAtmosphere}
              alt=""
              fill
              className="object-cover opacity-40"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080809] via-[#080809]/92 to-[#080809]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,184,150,0.08),transparent_55%)]" />
          </div>
          <motion.div
            {...useFadeUp(0)}
            className="relative mx-auto max-w-3xl text-center"
          >
            <h2
              className={`${display} text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl lg:text-[2.75rem]`}
            >
              The best restaurants create desire instantly.
            </h2>
            <p className="mt-5 text-lg text-[#a8a29a] sm:text-xl">
              ZenGrow transforms that desire into reservations.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-8 py-4 text-sm font-semibold tracking-tight text-[#1a1816] transition hover:bg-white"
              >
                Create my restaurant page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="text-center">
              <h2
                className={`${display} text-[2rem] font-medium tracking-[-0.02em] text-[#faf8f5] sm:text-4xl`}
              >
                Simple pricing
              </h2>
              <p className="mt-3 text-[#78716c]">
                Two paths. Same premium standard.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  whileHover={{ y: -3 }}
                  className={`relative flex flex-col rounded-[1.65rem] border p-8 ${
                    plan.highlight
                      ? "border-[#c4a574]/25 bg-gradient-to-b from-[#1a1816]/90 to-[#0f0f11] shadow-[0_0_0_1px_rgba(196,165,116,0.12)_inset]"
                      : "border-white/[0.07] bg-[#111113]/80"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full border border-[#c4a574]/25 bg-[#c4a574]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d4b896]">
                      Full experience
                    </span>
                  ) : null}
                  <h3 className="text-xl font-semibold tracking-tight text-[#faf8f5]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#78716c]">{plan.tagline}</p>
                  <p className="mt-8 text-4xl font-semibold tracking-tight text-[#faf8f5]">
                    {plan.price}
                    <span className="text-lg font-normal text-[#57534e]">
                      {" "}
                      / mo
                    </span>
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

        {/* FOOTER */}
        <footer className="border-t border-white/[0.06] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/Zengrow-logo.png"
              alt=""
              width={120}
              height={32}
              className="h-6 w-auto brightness-0 invert opacity-45"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#57534e]">
              <Link href="/login" className="hover:text-[#a8a29a]">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-[#a8a29a]">
                Sign up
              </Link>
              <span>© {new Date().getFullYear()} ZenGrow</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
