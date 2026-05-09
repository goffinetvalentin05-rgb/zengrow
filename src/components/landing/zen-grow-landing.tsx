"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Play,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, delay, ease: easeOut },
  };
}

function GlowOrb({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className ?? ""}`}
      style={style}
    />
  );
}

function PhoneMockup() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative mx-auto w-[min(100%,280px)] sm:w-[300px]"
      initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, ease: easeOut, delay: 0.15 }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={
          reduce
            ? undefined
            : { y: [0, -10, 0], rotateY: [0, 2, 0, -2, 0] }
        }
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div
          className="absolute -inset-8 rounded-[3rem] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.22), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(45,212,191,0.12), transparent 50%)",
            filter: "blur(32px)",
          }}
        />
        <div className="relative rounded-[2.35rem] border border-white/12 bg-gradient-to-b from-zinc-900/90 to-black p-[10px] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_0_80px_-20px_rgba(251,191,36,0.15)]">
          <div className="flex justify-center pb-2 pt-1">
            <div className="h-1 w-16 rounded-full bg-white/10" />
          </div>
          <div className="overflow-hidden rounded-[1.85rem] bg-[#0b0d11]">
            <div className="relative h-[132px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-zinc-900 to-teal-950/80" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.06\'/%3E%3C/svg%3E')]" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                    Tonight
                  </p>
                  <p className="text-lg font-semibold tracking-tight text-white">
                    Maison Nord
                  </p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
                  Open
                </span>
              </div>
            </div>
            <div className="space-y-2.5 px-3 pb-3 pt-3">
              <div className="flex gap-2">
                {["Chef", "Wine", "Garden"].map((t) => (
                  <div
                    key={t}
                    className="h-11 w-[30%] max-w-[72px] rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/[0.06]"
                  />
                ))}
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                <p className="text-[10px] font-medium text-white/40">Menu</p>
                <div className="mt-1.5 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-white/75">
                    <span>Seasonal tasting</span>
                    <span className="text-white/40">€98</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-white/55">
                    <span>Vegetarian journey</span>
                    <span className="text-white/35">€72</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_32px_-8px_rgba(45,212,191,0.55)]"
                animate={
                  reduce
                    ? undefined
                    : { boxShadow: [
                        "0 0 24px -8px rgba(45,212,191,0.35)",
                        "0 0 40px -6px rgba(251,191,36,0.25)",
                        "0 0 24px -8px rgba(45,212,191,0.35)",
                      ] }
                }
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                Reserve a table
                <ChevronRight className="h-4 w-4 opacity-80" />
              </motion.button>
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060708] text-zinc-100 selection:bg-amber-500/25 selection:text-amber-50">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(45,212,191,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_40%,rgba(251,191,36,0.06),transparent_50%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060708]/75 backdrop-blur-xl">
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
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#story" className="transition hover:text-white">
              Story
            </a>
            <a href="#experience" className="transition hover:text-white">
              Experience
            </a>
            <a href="#system" className="transition hover:text-white">
              Platform
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-white sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-[0_0_28px_-6px_rgba(45,212,191,0.5)] transition hover:brightness-110 sm:px-5 sm:text-sm"
            >
              Create my restaurant page
            </Link>
          </div>
        </div>
        <div className="border-t border-white/[0.05] px-4 py-2.5 md:hidden">
          <nav className="mx-auto flex max-w-6xl items-center justify-center gap-4 overflow-x-auto text-xs font-medium text-zinc-500">
            <a href="#story" className="shrink-0 hover:text-white">
              Story
            </a>
            <a href="#experience" className="shrink-0 hover:text-white">
              Experience
            </a>
            <a href="#system" className="shrink-0 hover:text-white">
              Platform
            </a>
            <a href="#pricing" className="shrink-0 hover:text-white">
              Pricing
            </a>
            <Link href="/login" className="shrink-0 hover:text-white">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
          <GlowOrb className="left-1/2 top-0 h-[min(80vw,520px)] w-[min(95vw,720px)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(45,212,191,0.14),transparent_68%)]" />
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
            <motion.div {...fade} className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300/90 sm:text-[11px]">
                <span className="h-1 w-1 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
                New generation for restaurants
              </span>
              <h1 className="mt-7 text-balance text-[2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem]">
                Clients don&apos;t want to search anymore.
                <span className="mt-2 block bg-gradient-to-r from-amber-200 via-white to-teal-200 bg-clip-text text-transparent">
                  They want to reserve instantly.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                ZenGrow transforms the way restaurants are discovered online. A
                faster, more modern experience designed to turn visitors into
                reservations in seconds.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.35)] transition hover:bg-zinc-100"
                >
                  Create my restaurant page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#story"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Play className="h-3.5 w-3.5 fill-current" />
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
          className="relative border-t border-white/[0.05] px-4 py-24 sm:px-6 lg:px-8"
        >
          <GlowOrb className="right-0 top-1/2 h-80 w-80 -translate-y-1/2 translate-x-1/4 bg-amber-500/10" />
          <div className="mx-auto max-w-6xl">
            <motion.h2
              {...useFadeUp(0)}
              className="mx-auto max-w-3xl text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
            >
              Today, people decide in seconds.
            </motion.h2>

            <div className="mt-16 space-y-10">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
              >
                {[
                  { label: "Instagram", icon: "◎" },
                  { label: "TikTok", icon: "△" },
                  { label: "Google Maps", icon: "◆" },
                  { label: "AI picks", icon: "✦" },
                ].map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                    whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.45 }}
                    whileHover={{ y: -3 }}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 shadow-[0_0_40px_-16px_rgba(45,212,191,0.2)] backdrop-blur-md"
                  >
                    <span className="text-sm text-teal-300/90">{p.icon}</span>
                    <span className="text-sm font-medium text-white/90">
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
                      : { scaleY: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }
                  }
                  transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY }}
                  className="h-14 w-px bg-gradient-to-b from-transparent via-teal-400/50 to-amber-400/40"
                />
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65 }}
                className="relative mx-auto max-w-lg"
              >
                <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-teal-500/20 via-amber-500/15 to-teal-500/20 opacity-60 blur-xl" />
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-900/50 p-5 shadow-[0_40px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      ZenGrow page
                    </p>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="col-span-2 h-20 rounded-xl bg-gradient-to-br from-amber-900/30 to-zinc-800 ring-1 ring-white/5" />
                    <div className="flex flex-col gap-2">
                      <div className="h-9 rounded-lg bg-white/5 ring-1 ring-white/5" />
                      <div className="h-9 rounded-lg bg-white/5 ring-1 ring-white/5" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Ambiance", "Menu", "Photos", "Reserve"].map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          t === "Reserve"
                            ? "bg-gradient-to-r from-teal-400/25 to-amber-400/20 text-white ring-1 ring-teal-400/30"
                            : "bg-white/[0.05] text-zinc-400 ring-1 ring-white/[0.06]"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <motion.div
                    className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-zinc-950">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-emerald-100/90">
                      Table booked — instant confirmation
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — EXPERIENCE */}
        <section
          id="experience"
          className="relative px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built for modern restaurant discovery.
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                ZenGrow removes friction between discovering a restaurant and
                booking it.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Fast reservation flow",
                  sub: "Seconds, not forms.",
                  visual: "flow",
                },
                {
                  title: "Mobile experience",
                  sub: "Thumb-friendly. Zero clutter.",
                  visual: "mobile",
                },
                {
                  title: "Modern menu",
                  sub: "Readable. Beautiful. On-brand.",
                  visual: "menu",
                },
                {
                  title: "Clean restaurant pages",
                  sub: "Desire, then action.",
                  visual: "page",
                },
                {
                  title: "Smooth interactions",
                  sub: "Motion that feels expensive.",
                  visual: "motion",
                },
              ].map((card, i) => (
                <motion.article
                  key={card.title}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.85)] backdrop-blur-sm ${
                    i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="mb-4 h-24 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-950 ring-1 ring-white/[0.06]">
                    {card.visual === "flow" && (
                      <div className="flex h-full items-center justify-center gap-2 p-3">
                        <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]" />
                        <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-teal-500/50 to-amber-400/40" />
                        <div className="rounded-md bg-white/10 px-2 py-1 text-[9px] text-white/80">
                          Confirm
                        </div>
                      </div>
                    )}
                    {card.visual === "mobile" && (
                      <div className="flex h-full items-end justify-center pb-2">
                        <div className="h-16 w-[52px] rounded-lg border border-white/10 bg-black/40" />
                      </div>
                    )}
                    {card.visual === "menu" && (
                      <div className="space-y-1.5 p-3">
                        <div className="h-2 w-3/4 rounded bg-white/10" />
                        <div className="h-2 w-1/2 rounded bg-white/5" />
                        <div className="h-2 w-2/3 rounded bg-white/5" />
                      </div>
                    )}
                    {card.visual === "page" && (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-14 w-[70%] rounded-lg bg-gradient-to-r from-amber-900/25 to-teal-900/20 ring-1 ring-white/10" />
                      </div>
                    )}
                    {card.visual === "motion" && (
                      <div className="flex h-full items-center justify-center">
                        <motion.div
                          animate={
                            reduce
                              ? undefined
                              : { rotate: [0, 4, -4, 0], scale: [1, 1.03, 1] }
                          }
                          transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          className="h-12 w-12 rounded-2xl border border-teal-400/30 bg-teal-500/10"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{card.sub}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — BIG REVEAL */}
        <section
          id="system"
          className="relative overflow-hidden border-t border-white/[0.05] px-4 py-24 sm:px-6 lg:px-8"
        >
          <GlowOrb className="left-0 bottom-0 h-96 w-96 -translate-x-1/3 translate-y-1/4 bg-teal-500/10" />
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
                Behind every page, a complete restaurant system.
              </h2>
              <p className="mt-4 text-zinc-400">
                Not just a pretty front door — operations, guests, and growth in
                one calm surface.
              </p>
            </motion.div>

            <div className="relative mt-16 min-h-[420px] sm:min-h-[480px]">
              <motion.div
                className="absolute left-1/2 top-8 w-[min(100%,380px)] -translate-x-1/2 sm:left-[12%] sm:translate-x-0"
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <CalendarDays className="h-4 w-4 text-teal-400" />
                    Reservations
                  </div>
                  <div className="mt-3 space-y-2">
                    {["19:30 · Party of 4", "20:00 · Party of 2", "20:45 · Party of 6"].map(
                      (r) => (
                        <div
                          key={r}
                          className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                        >
                          {r}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute right-0 top-0 w-[min(100%,280px)] sm:right-[8%]"
                animate={reduce ? undefined : { y: [0, 10, 0] }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Users className="h-4 w-4 text-amber-400" />
                    Guest database
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">2.4k</p>
                  <p className="text-[10px] text-zinc-500">profiles enriched</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-0 w-[min(100%,260px)] sm:bottom-8 sm:left-[6%]"
                animate={reduce ? undefined : { y: [0, 6, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              >
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Mail className="h-4 w-4 text-teal-400" />
                    Campaigns
                  </div>
                  <div className="mt-2 h-16 rounded-lg bg-gradient-to-br from-teal-500/10 to-amber-500/10 ring-1 ring-white/5" />
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-0 right-[5%] w-[min(100%,270px)] sm:right-[14%]"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{
                  duration: 6.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              >
                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="h-4 w-4 text-amber-400" />
                    Google reviews
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">Automation on</p>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-amber-400/80">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-1/2 w-[min(100%,300px)] -translate-x-1/2 -translate-y-1/2"
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative rounded-[1.75rem] border border-white/12 bg-gradient-to-b from-zinc-900/95 to-black/90 p-5 shadow-[0_0_80px_-20px_rgba(45,212,191,0.25)] backdrop-blur-2xl">
                  <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-teal-500/20 via-transparent to-amber-500/15 opacity-50 blur-sm" />
                  <div className="relative">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Command center
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Your evening, orchestrated
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/[0.06]">
                        <MapPin className="h-4 w-4 text-teal-400" />
                        <p className="mt-2 text-[10px] text-zinc-500">Events</p>
                        <p className="text-sm font-medium text-white">3 live</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/[0.06]">
                        <BarChart3 className="h-4 w-4 text-amber-400" />
                        <p className="mt-2 text-[10px] text-zinc-500">Analytics</p>
                        <p className="text-sm font-medium text-white">+18%</p>
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
          <div className="mx-auto max-w-6xl">
            <motion.h2
              {...useFadeUp(0)}
              className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Restaurants change constantly. Their online experience should too.
            </motion.h2>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "New brunch", hue: "from-amber-500/20" },
                { label: "Special event", hue: "from-teal-500/20" },
                { label: "Summer menu", hue: "from-emerald-500/15" },
                { label: "Fresh photos", hue: "from-orange-500/20" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <div
                    className={`mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br ${item.hue} to-zinc-900 ring-1 ring-white/[0.06] transition group-hover:ring-teal-400/20`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                    <Sparkles className="h-4 w-4 text-amber-400/70" />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Updated in one tap</p>
                </motion.div>
              ))}
            </div>
            <motion.p
              {...useFadeUp(0.1)}
              className="mt-10 text-center text-sm text-zinc-500 sm:text-base"
            >
              Speed. Flexibility. Full autonomy.
            </motion.p>
          </div>
        </section>

        {/* SECTION 6 — USE CASES */}
        <section className="border-t border-white/[0.05] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {[
              {
                title: "For restaurants without a real online experience",
                points: ["Modern page", "Reservations", "Mobile-first", "Simple setup"],
                accent: "from-teal-500/15 to-transparent",
              },
              {
                title: "For restaurants with an existing website",
                points: [
                  "Modern booking flow",
                  "Better mobile journey",
                  "Connected guest experience",
                ],
                accent: "from-amber-500/15 to-transparent",
              },
            ].map((block, i) => (
              <motion.article
                key={block.title}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_32px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-sm"
              >
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${block.accent} blur-3xl`}
                />
                <h3 className="relative max-w-sm text-xl font-semibold leading-snug text-white sm:text-2xl">
                  {block.title}
                </h3>
                <ul className="relative mt-8 space-y-3">
                  {block.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-center gap-3 text-sm text-zinc-400"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-400 to-amber-400" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8 h-32 rounded-2xl bg-zinc-950/80 ring-1 ring-white/[0.06]" />
              </motion.article>
            ))}
          </div>
          <motion.p
            {...useFadeUp(0)}
            className="mx-auto mt-12 max-w-2xl text-center text-sm text-zinc-500"
          >
            A faster, more modern restaurant experience — not a forced website
            replacement.
          </motion.p>
        </section>

        {/* SECTION 7 — VISION */}
        <section className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent" />
          <GlowOrb className="left-1/2 top-1/2 h-[min(90vw,560px)] w-[min(90vw,560px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(251,191,36,0.12),transparent_65%)]" />
          <motion.div
            {...useFadeUp(0)}
            className="relative mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              The best restaurants create desire instantly.
            </h2>
            <p className="mt-5 text-lg text-zinc-400 sm:text-xl">
              ZenGrow transforms that desire into reservations.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-white to-teal-200 px-8 py-4 text-sm font-semibold text-zinc-950 shadow-[0_0_48px_-12px_rgba(251,191,36,0.45)] transition hover:brightness-105"
              >
                Create my restaurant page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div {...useFadeUp(0)} className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Simple pricing
              </h2>
              <p className="mt-3 text-zinc-500">
                Two paths. Same premium standard.
              </p>
            </motion.div>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.55 }}
                  whileHover={{ y: -4 }}
                  className={`relative flex flex-col rounded-[1.75rem] border p-8 ${
                    plan.highlight
                      ? "border-teal-400/30 bg-gradient-to-b from-teal-950/40 to-zinc-950/80 shadow-[0_0_60px_-20px_rgba(45,212,191,0.35)]"
                      : "border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full bg-teal-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
                      Full stack
                    </span>
                  ) : null}
                  <h3 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">{plan.tagline}</p>
                  <p className="mt-8 text-4xl font-semibold tracking-tight text-white">
                    {plan.price}
                    <span className="text-lg font-normal text-zinc-500">
                      {" "}
                      / mo
                    </span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-zinc-400"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-zinc-950 hover:brightness-110"
                        : "border border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.08]"
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
              className="h-6 w-auto brightness-0 invert opacity-50"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
              <Link href="/login" className="hover:text-zinc-300">
                Log in
              </Link>
              <Link href="/signup" className="hover:text-zinc-300">
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
