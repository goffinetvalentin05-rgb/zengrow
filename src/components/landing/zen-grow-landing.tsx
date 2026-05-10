"use client";

/**
 * Landing ZenGrow — reproduction structurelle du template OrbAI (Framer).
 * Textes provisoires ; priorité au rendu visuel (rythme, cartes, glow, animations).
 */

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  ImageIcon,
  MapPin,
  Menu as MenuIcon,
  Monitor,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Workflow,
  X,
  Zap,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-orb",
});

const EASE = [0.25, 0.1, 0.25, 1] as const;

function fadeUp(delay = 0, y = 28): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: EASE, delay },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

function useInView() {
  const r = useReducedMotion();
  return {
    initial: r ? false : "hidden",
    whileInView: r ? undefined : "show",
    viewport: { once: true, amount: 0.12 },
  } as const;
}

function floatAnimation(delay: number, amp = 10) {
  return {
    y: [0, -amp, 0],
    transition: {
      duration: 5.5 + delay * 0.4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

const shell = "px-5 sm:px-8 lg:px-12";
const maxW = "mx-auto max-w-[1280px]";
const kicker =
  "text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500";
const h2 =
  "text-center text-[clamp(1.875rem,4vw,3rem)] font-semibold tracking-[-0.02em] text-white";
const sub =
  "mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-zinc-400 md:text-lg";
const cardOrb =
  "rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(165deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.2)_100%)] shadow-[0_32px_120px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl";
const cardHover =
  "transition-all duration-500 ease-out hover:border-white/[0.14] hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_40px_100px_-40px_rgba(88,76,120,0.18)]";

const nav = [
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Processus" },
  { href: "#projects", label: "Projets" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

function Navbar() {
  const [m, setM] = useState(false);
  return (
    <header className="sticky top-0 z-[200] border-b border-white/[0.06] bg-[#030305]/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#030305]/72">
      <div className={`relative flex h-[3.25rem] items-center sm:h-14 ${maxW} ${shell}`}>
        <Link
          href="/"
          className="relative z-10 text-[15px] font-semibold tracking-tight text-white"
        >
          ZenGrow
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-zinc-400 transition hover:text-white sm:inline"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-white px-[1.125rem] py-2 text-[13px] font-semibold text-[#09090b] shadow-[0_4px_24px_-4px_rgba(255,255,255,0.35)] transition hover:bg-zinc-100 sm:inline-flex sm:items-center sm:gap-1"
          >
            Créer ma page
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
          <button
            type="button"
            onClick={() => setM((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white lg:hidden"
            aria-label="Menu"
          >
            {m ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {m ? (
        <div className="border-t border-white/[0.06] bg-[#030305] px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setM(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-zinc-200"
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </a>
            ))}
            <Link
              href="/signup"
              onClick={() => setM(false)}
              className="mt-2 flex justify-center rounded-full bg-white py-3 text-sm font-semibold text-[#09090b]"
            >
              Créer ma page
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function FloatCard({
  icon: Icon,
  title,
  body,
  className = "",
}: {
  icon: typeof Star;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={`${cardOrb} ${cardHover} w-[min(100%,288px)] p-5 sm:w-[300px] sm:p-6 ${className}`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.07), 0 28px 80px -28px rgba(0,0,0,0.92), 0 0 60px -35px rgba(99,102,241,0.2)",
      }}
    >
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] ring-1 ring-white/[0.1]">
          <Icon className="h-5 w-5 text-zinc-200" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {title}
          </p>
          <p className="mt-2 text-[15px] font-medium leading-snug tracking-tight text-zinc-100">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div
      className={`${cardOrb} relative w-full max-w-[min(100%,680px)] overflow-hidden p-1 sm:p-1.5`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(139,92,246,0.12), 0 50px 140px -40px rgba(0,0,0,0.95), 0 0 100px -40px rgba(99,102,241,0.25)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/12 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-[90px]"
      />

      <div className="relative rounded-[1.65rem] border border-white/[0.07] bg-[#0a0a0f] p-5 sm:p-7 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-300/70">
              Aperçu ZenGrow
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Restaurant Luna
            </h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-semibold text-amber-100/95">
            <Star className="h-4 w-4" fill="currentColor" />
            4,9
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-3 md:gap-4">
          <div className="col-span-12 aspect-[21/11] rounded-2xl bg-gradient-to-br from-zinc-700/95 via-zinc-900/80 to-violet-950/50 ring-1 ring-white/10 md:col-span-7 md:aspect-auto md:min-h-[220px]" />
          <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-1 md:gap-4">
            <div className="aspect-[4/3] rounded-2xl bg-zinc-800/70 ring-1 ring-white/10 md:aspect-[5/4]" />
            <div className="aspect-[4/3] rounded-2xl bg-zinc-800/55 ring-1 ring-white/8 md:aspect-[5/4]" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Ouvert ce soir", "Cuisine moderne", "Centre-ville"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-4 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Menu spécial
            </p>
            <p className="mt-1.5 text-[15px] font-medium text-white">Dégustation week-end</p>
            <p className="mt-1 text-xs text-zinc-500">Saison · places limitées</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-4 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Horaires
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-[14px] text-zinc-200">
              <Clock className="h-4 w-4 text-zinc-500" />
              Mar–Dim · 12h–14h30 · 19h–23h
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/30 p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-violet-300/80" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Adresse
            </p>
            <p className="mt-1 text-[15px] font-medium text-zinc-100">Rue du Lac 14 · 1007 Lausanne</p>
          </div>
        </div>

        <button
          type="button"
          className="relative mt-6 w-full rounded-full bg-white py-4 text-[15px] font-semibold text-[#09090b] shadow-[0_20px_50px_-24px_rgba(255,255,255,0.35)] transition hover:bg-zinc-100"
        >
          Réserver une table
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const r = useReducedMotion();
  return (
    <section className="relative min-h-0 overflow-hidden pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#030305]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(88,76,140,0.14),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_20%,rgba(37,99,235,0.07),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_60%,rgba(99,102,241,0.06),transparent_40%)]"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[20%] h-[min(80vw,420px)] w-[min(80vw,420px)] -translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[100px]"
        animate={
          r
            ? undefined
            : {
                opacity: [0.5, 0.85, 0.5],
                scale: [1, 1.05, 1],
              }
        }
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className={`relative ${maxW} ${shell}`}>
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={r ? false : { opacity: 0, y: 16 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-100/90 sm:text-[12px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
            Nouvelle génération pour restaurants
          </motion.div>

          <motion.h1
            initial={r ? false : { opacity: 0, y: 36 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.06 }}
            className="mt-8 text-balance text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:mt-10"
          >
            ZenGrow
          </motion.h1>
          <motion.p
            initial={r ? false : { opacity: 0, y: 28 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-zinc-400 sm:text-xl md:text-2xl"
          >
            Une page restaurant moderne, rapide et connectée.
          </motion.p>

          <motion.div
            initial={r ? false : { opacity: 0, y: 18 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.18 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-[#09090b] shadow-[0_16px_48px_-20px_rgba(255,255,255,0.4)] transition hover:bg-zinc-100"
            >
              Créer ma page
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-[14px] font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              Voir la démo
            </a>
          </motion.div>
        </div>

        <div className="relative mx-auto mt-14 min-h-[min(78vh,820px)] sm:mt-16 lg:mt-20 lg:min-h-[min(72vh,760px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]"
          />

          <motion.div
            animate={r ? undefined : floatAnimation(0, 12)}
            className="absolute left-0 top-[6%] z-20 hidden xl:left-[2%] xl:block"
          >
            <FloatCard icon={Calendar} title="Nouvelle réservation" body="Table 2 · ce soir · 20h00" />
          </motion.div>
          <motion.div
            animate={r ? undefined : floatAnimation(0.9, 11)}
            className="absolute right-0 top-[8%] z-20 hidden xl:right-[2%] xl:block"
          >
            <FloatCard icon={Star} title="Avis Google programmé" body="Envoi après la visite" />
          </motion.div>
          <motion.div
            animate={r ? undefined : floatAnimation(1.7, 10)}
            className="absolute bottom-[28%] left-0 z-20 hidden xl:bottom-[26%] xl:left-0 xl:block"
          >
            <FloatCard icon={Users} title="Client ajouté" body="Camille D. · 2 visites" />
          </motion.div>
          <motion.div
            animate={r ? undefined : floatAnimation(2.4, 11)}
            className="absolute bottom-[26%] right-0 z-20 hidden xl:bottom-[24%] xl:right-0 xl:block"
          >
            <FloatCard icon={UtensilsCrossed} title="Menu publié" body="Week-end" />
          </motion.div>
          <motion.div
            animate={r ? undefined : floatAnimation(1.2, 9)}
            className="absolute left-1/2 top-[2%] z-10 w-full max-w-[300px] -translate-x-1/2 xl:top-[0%]"
          >
            <FloatCard
              icon={Smartphone}
              title="Mobile-first"
              body="Pensé pour réserver vite"
              className="mx-auto"
            />
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 px-2 pt-4 xl:hidden">
            <FloatCard icon={Calendar} title="Nouvelle réservation" body="Table 2 · ce soir · 20h00" />
            <FloatCard icon={Star} title="Avis Google programmé" body="Envoi après la visite" />
          </div>

          <motion.div
            initial={r ? false : { opacity: 0, y: 48, scale: 0.96 }}
            animate={r ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.28 }}
            className="relative z-30 mx-auto flex justify-center px-2 pt-8 xl:pt-4"
          >
            <HeroMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionQuote() {
  const v = useInView();
  return (
    <section className={`scroll-mt-24 py-20 md:py-28 ${shell}`}>
      <div className={maxW}>
        <motion.div
          {...v}
          variants={fadeUp(0, 32)}
          className={`${cardOrb} relative mx-auto max-w-4xl overflow-hidden border-white/[0.1] px-8 py-12 text-center md:px-16 md:py-16`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(99,102,241,0.12),transparent_60%)]"
          />
          <p className="relative text-xl font-medium leading-relaxed text-zinc-200 md:text-2xl md:leading-snug">
            « Nous structurons votre présence, comprenons vos clients et livrons une expérience qui
            convertit — sans friction. »
          </p>
          <p className="relative mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Fondatrice · ZenGrow
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function SectionBenefits() {
  const v = useInView();
  const items = [
    {
      title: "Temps réel",
      body: "Suivez réservations et activité sans délai.",
      Icon: BarChart3,
    },
    {
      title: "Croissance fluide",
      body: "Une page pensée pour transformer les visites en réservations.",
      Icon: Zap,
    },
    {
      title: "Automatisation",
      body: "Relances et avis programmables selon vos règles.",
      Icon: Workflow,
    },
  ] as const;

  return (
    <section className={`scroll-mt-24 border-y border-white/[0.06] bg-[#060608] py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Avantages</p>
          <h2 className={`${h2} mt-4`}>Pourquoi nous choisir</h2>
          <p className={sub}>Une approche simple, premium et orientée résultats.</p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {items.map((it, i) => (
            <motion.article
              key={it.title}
              variants={fadeUp(i * 0.05, 24)}
              className={`${cardOrb} ${cardHover} p-8 md:p-10`}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                <it.Icon className="h-5 w-5 text-zinc-200" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{it.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.12, 20)}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 rounded-[1.5rem] border border-white/[0.08] bg-black/40 px-6 py-6 backdrop-blur-sm md:gap-10"
        >
          {[
            { a: "−20%", b: "Temps perdu", c: "Avant" },
            { a: "+60%", b: "Clarté page", c: "Après" },
            { a: "Sync", b: "Temps réel", c: "Équipe" },
          ].map((s) => (
            <div key={s.a} className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-white">{s.a}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{s.b}</p>
              <p className="text-[11px] text-zinc-600">{s.c}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureGraphic({ i }: { i: number }) {
  const grads = [
    "from-violet-950/80 via-zinc-900/60 to-blue-950/40",
    "from-blue-950/70 via-zinc-900/50 to-violet-950/40",
    "from-zinc-800/90 via-violet-950/50 to-zinc-900/60",
  ] as const;
  return (
    <div
      className={`relative h-44 overflow-hidden rounded-t-[1.35rem] bg-gradient-to-br ${grads[i % 3]} md:h-48`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%)]" />
      <div className="absolute -bottom-8 left-1/2 h-32 w-[80%] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
    </div>
  );
}

function MockPhone() {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="rounded-[2.25rem] border border-white/15 bg-gradient-to-b from-zinc-800/90 to-zinc-950 p-2 shadow-2xl ring-1 ring-white/10">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08080c]">
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-[11px] text-zinc-500">9:41</span>
            <span className="h-3.5 w-20 rounded-full bg-black/50" />
          </div>
          <div className="space-y-3 px-4 pb-6 pt-2">
            <div className="aspect-[16/11] rounded-xl bg-gradient-to-br from-zinc-700/90 to-violet-950/40 ring-1 ring-white/10" />
            <p className="text-xl font-semibold text-white">Restaurant Luna</p>
            <p className="text-xs text-zinc-500">Ambiance · menu · horaires</p>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-xs text-zinc-400">
              <Clock className="mb-1 inline h-3.5 w-3.5" /> Mar–Dim · 12h–23h
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-xs text-zinc-400">
              <MapPin className="mb-1 inline h-3.5 w-3.5 text-violet-300/80" /> Rue du Lac 14
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-white py-3 text-xs font-semibold text-black"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockDesktop() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-t-xl border border-b-0 border-white/12 bg-zinc-900/95 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="mx-auto flex-1 rounded-md border border-white/10 bg-black/50 py-1.5 text-center text-[11px] text-zinc-500">
          luna.zengrow.app
        </div>
      </div>
      <div className="rounded-b-2xl border border-white/12 border-t-0 bg-[#08080c] p-6 shadow-2xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-700/90 to-violet-950/40 ring-1 ring-white/10 lg:min-h-[200px]" />
          <div className="flex flex-col justify-center gap-4">
            <p className="text-2xl font-semibold text-white">Restaurant Luna</p>
            <p className="text-sm text-zinc-500">Visuel fort, infos claires, CTA visible.</p>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-400">
              <Clock className="mb-2 inline h-4 w-4" />
              <br />
              Horaires · jours fériés
            </div>
            <button
              type="button"
              className="w-full max-w-[220px] rounded-full bg-white py-3 text-sm font-semibold text-black"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionFeatures() {
  const v = useInView();
  const feats = [
    { title: "Mise en page premium", text: "Hiérarchie visuelle type template Framer.", Icon: Sparkles },
    { title: "Flux automatisés", text: "Réservations et relances sans friction.", Icon: Workflow },
    { title: "Analytique claire", text: "Indicateurs lisibles pour piloter la page.", Icon: BarChart3 },
    { title: "Support intelligent", text: "Parcours client guidé jusqu’à la réservation.", Icon: Bot },
  ] as const;

  return (
    <section id="features" className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Fonctionnalités</p>
          <h2 className={`${h2} mt-4`}>Tout l’essentiel, dans un seul outil</h2>
          <p className={sub}>Blocs, cartes et rythme calqués sur une landing SaaS premium.</p>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {feats.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp(i * 0.04)}
              className={`${cardOrb} ${cardHover} overflow-hidden p-0`}
            >
              <FeatureGraphic i={i} />
              <div className="p-7">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                  <f.Icon className="h-5 w-5 text-zinc-200" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.1)}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-[#09090b] transition hover:bg-zinc-100"
          >
            Commencer
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            Voir les services
          </a>
        </motion.div>

        <motion.div
          id="demo"
          {...v}
          variants={fadeUp(0.14)}
          className={`relative mt-20 scroll-mt-28 ${cardOrb} p-6 md:p-10 lg:p-12`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(99,102,241,0.08),transparent_55%)]"
          />
          <div className="relative mb-10 flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-zinc-400">
              <Smartphone className="h-4 w-4" /> Mobile
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-zinc-400">
              <Monitor className="h-4 w-4" /> Bureau
            </span>
          </div>
          <div className="relative grid items-center gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
            <MockPhone />
            <MockDesktop />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionServices() {
  const v = useInView();
  const svcs = [
    { title: "Conseil page", text: "Structure et hiérarchie pour maximiser les réservations.", Icon: Sparkles },
    { title: "Contenu", text: "Mise en forme rapide des blocs et visuels.", Icon: ImageIcon },
    { title: "Réservations", text: "Flux de prise de rendez-vous clair et rapide.", Icon: Calendar },
    { title: "Automatisations", text: "Scénarios simples pour relances et avis.", Icon: Workflow },
  ] as const;

  return (
    <section
      id="services"
      className={`scroll-mt-24 border-y border-white/[0.06] bg-[#050508] py-24 md:py-32 lg:py-40 ${shell}`}
    >
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Services</p>
          <h2 className={`${h2} mt-4`}>Des briques pensées pour performer</h2>
          <p className={sub}>Grille type OrbAI : cartes larges, glow discret, hover premium.</p>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-16 grid gap-5 sm:grid-cols-2"
        >
          {svcs.map((s, i) => (
            <motion.article
              key={s.title}
              variants={fadeUp(i * 0.05)}
              className={`${cardOrb} ${cardHover} flex flex-col gap-6 p-8 md:flex-row md:items-start md:p-10`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
                <s.Icon className="h-6 w-6 text-violet-200/90" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">{s.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionProcess() {
  const v = useInView();
  const steps = [
    {
      n: "01",
      title: "Audit express",
      text: "On identifie les blocs clés et le parcours réservation.",
    },
    {
      n: "02",
      title: "Mise en ligne",
      text: "Déploiement soigné, animations et responsive inclus.",
    },
    {
      n: "03",
      title: "Optimisation",
      text: "Ajustements continus pour garder un rendu premium.",
    },
  ] as const;

  return (
    <section id="process" className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Processus</p>
          <h2 className={`${h2} mt-4`}>Simple &amp; scalable</h2>
          <p className={sub}>Trois étapes numérotées, comme sur la référence.</p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={fadeUp(i * 0.06, 36)}
              className={`${cardOrb} relative overflow-hidden p-8 md:p-10`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 text-[7rem] font-semibold leading-none text-white/[0.04]"
              >
                {s.n}
              </div>
              <p className="text-sm font-semibold text-violet-300/80">{s.n}</p>
              <h3 className="relative mt-4 text-xl font-semibold text-white">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-zinc-500">{s.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionProjects() {
  const v = useInView();
  const projects = [
    { name: "Projet 01", title: "Luna — page flagship", desc: "Mockup hero + réservation intégrée." },
    { name: "Projet 02", title: "Bistro Nord — relances", desc: "Cartes flottantes et avis programmés." },
    { name: "Projet 03", title: "Sushi Line — mobile", desc: "Focus thumb-zone et CTA sticky." },
  ] as const;

  return (
    <section
      id="projects"
      className={`scroll-mt-24 border-y border-white/[0.06] bg-[#060608] py-24 md:py-32 lg:py-40 ${shell}`}
    >
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Projets</p>
          <h2 className={`${h2} mt-4`}>Impact &amp; résultats</h2>
          <p className={sub}>Cartes larges avec visuel produit et métriques placeholder.</p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-16 grid gap-6 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.article
              key={p.name}
              variants={fadeUp(i * 0.06)}
              className={`${cardOrb} ${cardHover} overflow-hidden p-0`}
            >
              <div className="relative h-48 bg-gradient-to-br from-violet-950/50 via-zinc-900 to-blue-950/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  {p.name}
                </span>
              </div>
              <div className="p-8">
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{p.desc}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-6">
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-white">0%</p>
                    <p className="text-xs text-zinc-600">Métrique A</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-white">0%</p>
                    <p className="text-xs text-zinc-600">Métrique B</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionTestimonials() {
  const v = useInView();
  const quotes = [
    {
      text: "« Design impeccable, même densité visuelle qu’un template Framer. »",
      who: "Alex · Directeur marketing",
    },
    {
      text: "« On a enfin une landing qui respire le premium, sans bruit. »",
      who: "Sam · Restaurateur",
    },
    {
      text: "« Les sections s’enchaînent comme sur les meilleures landings SaaS. »",
      who: "Mina · Ops",
    },
  ] as const;

  return (
    <section className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Clients</p>
          <h2 className={`${h2} mt-4`}>Ils nous font confiance</h2>
          <p className={sub}>Témoignages + bandeau chiffres façon OrbAI.</p>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {quotes.map((q, i) => (
            <motion.blockquote
              key={q.who}
              variants={fadeUp(i * 0.05)}
              className={`${cardOrb} ${cardHover} p-8`}
            >
              <p className="text-sm leading-relaxed text-zinc-300">{q.text}</p>
              <footer className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                {q.who}
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.12)}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { n: "10+", l: "Projets" },
            { n: "98%", l: "Satisfaction" },
            { n: "5+", l: "Années" },
            { n: "24h", l: "Mise à jour" },
          ].map((x) => (
            <div
              key={x.l}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-6 text-center"
            >
              <p className="text-2xl font-semibold text-white">{x.n}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600">{x.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionPricing() {
  const v = useInView();
  const [yearly, setYearly] = useState(false);
  const discount = 0.7;
  const plans = [
    {
      name: "Starter",
      monthly: 49,
      blurb: "Pour tester une page premium rapidement.",
      features: ["Page ZenGrow", "Bloc hero + sections", "Formulaire réservation", "Support e-mail"],
      cta: "Commencer",
      popular: false,
    },
    {
      name: "Pro",
      monthly: 99,
      blurb: "Le plus demandé — équilibre design & conversion.",
      features: [
        "Tout Starter",
        "Animations avancées",
        "Modules avis & relances",
        "Priorité support",
      ],
      cta: "Choisir Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      monthly: 249,
      blurb: "Volume, personnalisation et accompagnement.",
      features: [
        "Tout Pro",
        "Intégrations sur mesure",
        "SLA dédié",
        "Branding avancé",
      ],
      cta: "Nous contacter",
      popular: false,
    },
  ] as const;

  return (
    <section id="pricing" className={`scroll-mt-24 border-y border-white/[0.06] bg-[#050508] py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Tarifs</p>
          <h2 className={`${h2} mt-4`}>Un prix simple pour démarrer</h2>
          <p className={sub}>Bascule mensuel / annuel comme sur la référence.</p>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.06)} className="mt-10 flex flex-col items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${
                !yearly ? "bg-white text-[#09090b]" : "text-zinc-400 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${
                yearly ? "bg-white text-[#09090b]" : "text-zinc-400 hover:text-white"
              }`}
            >
              Annuel
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                −30%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const price = yearly ? Math.round(plan.monthly * discount) : plan.monthly;
            return (
              <motion.div
                key={plan.name}
                variants={fadeUp(i * 0.06, 28)}
                className={`${cardOrb} relative flex flex-col p-8 md:p-10 ${
                  plan.popular
                    ? "border-violet-400/25 shadow-[0_0_80px_-20px_rgba(139,92,246,0.35)]"
                    : ""
                }`}
              >
                {plan.popular ? (
                  <span className="absolute right-6 top-6 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-200">
                    Populaire
                  </span>
                ) : null}
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-white">{price} CHF</span>
                  <span className="pb-2 text-sm font-medium text-zinc-500">/ mois</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-500">{plan.blurb}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[14px] text-zinc-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Enterprise" ? "#contact" : "/signup"}
                  className={`mt-10 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition ${
                    plan.popular
                      ? "bg-white text-[#09090b] hover:bg-zinc-100"
                      : "border border-white/15 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p {...v} variants={fadeUp(0.14)} className="mt-10 text-center text-sm text-zinc-600">
          Nous reversons 2% à une cause locale — placeholder visuel.
        </motion.p>
      </div>
    </section>
  );
}

function SectionComparison() {
  const v = useInView();
  const us = [
    "Parcours réservation fluide",
    "Hiérarchie visuelle premium",
    "Données structurées en temps réel",
    "Composants évolutifs",
    "Relances configurables",
    "Contenu modulable",
  ] as const;
  const them = [
    "Formulaires rigides",
    "Mise en page générique",
    "Décisions à l’approximation",
    "Peu scalable",
    "Relances manuelles",
    "Mises à jour lentes",
  ] as const;

  return (
    <section className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Comparaison</p>
          <h2 className={`${h2} mt-4`}>ZenGrow vs l’ordinaire</h2>
          <p className={sub}>Deux colonnes contrastées, comme OrbAI vs Others.</p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div
            variants={fadeUp(0, 24)}
            className={`${cardOrb} border-violet-500/20 p-8 md:p-10`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.18), inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px -48px rgba(99,102,241,0.15)",
            }}
          >
            <h3 className="text-lg font-semibold text-white">ZenGrow</h3>
            <ul className="mt-8 space-y-4">
              {us.map((l) => (
                <li key={l} className="flex gap-3 text-[15px] text-zinc-200">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" strokeWidth={2} />
                  {l}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#09090b] transition hover:bg-zinc-100"
            >
              Commencer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div variants={fadeUp(0.06, 24)} className={`${cardOrb} p-8 opacity-90 md:p-10`}>
            <h3 className="text-lg font-semibold text-zinc-500">Autres</h3>
            <ul className="mt-8 space-y-4">
              {them.map((l) => (
                <li key={l} className="flex gap-3 text-[15px] text-zinc-500">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  {l}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionTeam() {
  const v = useInView();
  const people = [
    { name: "Ikta Sollork", role: "Fondateur / CEO" },
    { name: "Gwen Chase", role: "Marketing" },
    { name: "James Bond", role: "Design" },
    { name: "Emily Gwen", role: "Support" },
    { name: "Lena M.", role: "Produit" },
    { name: "Eli R.", role: "Ops" },
  ] as const;

  return (
    <section
      className={`scroll-mt-24 border-y border-white/[0.06] bg-[#060608] py-24 md:py-32 lg:py-40 ${shell}`}
    >
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Équipe</p>
          <h2 className={`${h2} mt-4`}>Derrière le produit</h2>
          <p className={sub}>Carrousel horizontal façon Framer.</p>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.08)} className="relative mt-14 -mx-5 sm:-mx-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#060608] to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#060608] to-transparent sm:w-24" />
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {people.map((p) => (
              <div
                key={p.name + p.role}
                className={`${cardOrb} ${cardHover} w-[min(85vw,280px)] shrink-0 snap-center p-6`}
              >
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-zinc-700/80 via-violet-950/40 to-zinc-900 ring-1 ring-white/10" />
                <p className="mt-5 font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-sm text-zinc-500">{p.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Qu’est-ce qui est inclus ?", a: "Structure complète type template premium, sections animées et responsive." },
  { q: "Délai de mise en ligne ?", a: "Variable selon les assets ; comptez de quelques jours à quelques semaines." },
  { q: "Besoin de compétences techniques ?", a: "Non — l’interface est pensée pour itérer sans friction." },
  { q: "Mes données sont-elles protégées ?", a: "Oui — bonnes pratiques et options conformes selon votre contexte." },
  { q: "Puis-je faire évoluer le contenu ?", a: "Oui, blocs et textes sont modulables après la première version." },
] as const;

function FaqRow({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`${cardOrb} overflow-hidden border-white/[0.07] p-0`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03] sm:px-6 sm:py-5"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-500 sm:px-6 sm:pb-6">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SectionFaq() {
  const v = useInView();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className={`scroll-mt-24 py-24 md:py-32 ${shell}`}>
      <div className={`${maxW} grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16`}>
        <motion.div {...v} variants={fadeUp()}>
          <p className="text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">FAQ</p>
          <h2 className="mt-5 text-left text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Questions &amp; réponses
          </h2>
          <p className="mt-5 text-left text-zinc-500">
            Un projet précis ?{" "}
            <a href="#contact" className="text-white underline-offset-4 hover:underline">
              Contact
            </a>
          </p>
        </motion.div>
        <motion.div {...v} variants={staggerFast} className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={f.q} variants={fadeUp(i * 0.03)}>
              <FaqRow q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionContact() {
  const v = useInView();
  return (
    <section id="contact" className={`scroll-mt-24 border-t border-white/[0.06] py-20 ${shell}`}>
      <div className={`${maxW} text-center`}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Contact</p>
          <p className="mt-4 text-zinc-500">support@zengrow.app</p>
          <a
            href="mailto:support@zengrow.app"
            className="mt-4 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-200 hover:border-white/20"
          >
            Écrire un e-mail
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SectionFinalCta() {
  const v = useInView();
  const r = useReducedMotion();
  return (
    <section className={`pb-12 pt-4 md:pb-20 ${shell}`}>
      <motion.div
        {...v}
        variants={fadeUp(0, 28)}
        className={`relative ${maxW} overflow-hidden rounded-[2rem] border border-white/[0.1] bg-gradient-to-br from-violet-950/40 via-[#0a0a0f] to-blue-950/30 px-6 py-16 text-center md:px-16 md:py-24`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.18),transparent_55%)]"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl"
          animate={r ? undefined : { opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <h2 className="relative mx-auto max-w-3xl text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.02em] text-white">
          Prêt pour une landing niveau Framer ?
        </h2>
        <p className="relative mx-auto mt-6 max-w-2xl text-base text-zinc-400 md:text-lg">
          Structure, glow et animations alignés sur OrbAI — texte à affiner ensuite.
        </p>
        <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-[#09090b] transition hover:bg-zinc-100"
          >
            Obtenir ZenGrow
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-[14px] font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            Parcourir les sections
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const col1 = [
    { href: "#features", label: "Fonctionnalités" },
    { href: "#pricing", label: "Tarifs" },
    { href: "#services", label: "Services" },
  ] as const;
  const col2 = [
    { href: "#projects", label: "Projets" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#020203] py-16 md:py-20">
      <div className={`${maxW} grid gap-12 md:grid-cols-[1.2fr_1fr_1fr] ${shell}`}>
        <div>
          <p className="text-lg font-semibold text-white">ZenGrow</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600">
            Landing publique — même grammaire visuelle qu’OrbAI, marque ZenGrow.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Navigation</p>
          <nav className="mt-4 flex flex-col gap-2">
            {col1.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-zinc-500 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Ressources</p>
          <nav className="mt-4 flex flex-col gap-2">
            {col2.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-zinc-500 hover:text-white">
                {l.label}
              </a>
            ))}
            <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-white">
              Connexion
            </Link>
          </nav>
        </div>
      </div>
      <p className={`${maxW} mt-12 text-center text-xs text-zinc-700 md:text-left ${shell}`}>
        © {new Date().getFullYear()} ZenGrow
      </p>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className={`${inter.variable} min-h-screen overflow-x-hidden bg-[#030305] font-[family-name:var(--font-zg-orb),system-ui,sans-serif] text-zinc-100 antialiased selection:bg-violet-500/30`}
    >
      <Navbar />
      <main>
        <Hero />
        <SectionQuote />
        <SectionBenefits />
        <SectionFeatures />
        <SectionServices />
        <SectionProcess />
        <SectionProjects />
        <SectionTestimonials />
        <SectionPricing />
        <SectionComparison />
        <SectionTeam />
        <SectionFaq />
        <SectionContact />
        <SectionFinalCta />
      </main>
      <Footer />
    </div>
  );
}
