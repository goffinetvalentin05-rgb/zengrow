"use client";

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
  Calendar,
  Check,
  ChevronRight,
  Clock,
  ImageIcon,
  LayoutGrid,
  MapPin,
  Menu as MenuIcon,
  ScrollText,
  X,
  Sparkles,
  Star,
  UtensilsCrossed,
  Users,
  Zap,
  Smartphone,
  Megaphone,
  PartyPopper,
  ChefHat,
} from "lucide-react";
import { useState } from "react";
import { Outfit } from "next/font/google";

const landingSans = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-landing",
});

const easeOut = [0.22, 1, 0.36, 1] as const;

const cx = {
  page: "min-h-screen overflow-x-hidden antialiased selection:bg-indigo-400/20 selection:text-white",
  border: "border-white/[0.08]",
  card:
    "rounded-[1.25rem] border border-white/[0.09] bg-white/[0.035] shadow-[0_24px_80px_-52px_rgba(0,0,0,0.85)] backdrop-blur-xl",
  cardHover:
    "transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.05] hover:shadow-[0_32px_90px_-48px_rgba(99,102,241,0.12)]",
  glow: "pointer-events-none absolute rounded-full blur-3xl opacity-[0.55]",
} as const;

function fadeUp(delay = 0, y = 18): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut, delay },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

function useViewMotion() {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : "hidden",
    whileInView: reduce ? undefined : "show",
    viewport: { once: true, amount: 0.18 },
  } as const;
}

function SectionGlow({ tone = "indigo" }: { tone?: "indigo" | "blue" | "sage" }) {
  const a =
    tone === "indigo"
      ? "bg-indigo-500/18"
      : tone === "blue"
        ? "bg-sky-500/14"
        : "bg-emerald-500/10";
  const b =
    tone === "indigo"
      ? "bg-violet-500/12"
      : tone === "blue"
        ? "bg-blue-500/10"
        : "bg-teal-500/8";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className={`${cx.glow} -left-32 top-0 h-[380px] w-[380px] ${a}`} />
      <div className={`${cx.glow} -right-24 top-1/3 h-[320px] w-[320px] ${b}`} />
      <div
        className={`${cx.glow} left-1/4 bottom-0 h-[240px] w-[min(520px,90vw)] bg-slate-400/6`}
      />
    </div>
  );
}

const navLinks = [
  { href: "#experience", label: "Expérience" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#pour-qui", label: "Pour qui" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060814]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#060814]/65">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center text-lg font-semibold tracking-tight text-white"
        >
          ZenGrow
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe] px-5 py-2.5 text-sm font-semibold text-[#0b1020] shadow-[0_12px_40px_-18px_rgba(129,140,248,0.45)] transition hover:brightness-[1.03] sm:inline-flex"
          >
            Créer ma page
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#060814]/96 md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
                >
                  {l.label}
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </a>
              ))}
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#eef2ff] to-[#dbeafe] py-3 text-sm font-semibold text-[#0b1020]"
              >
                Créer ma page
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function useFloat(delay: number) {
  const reduce = useReducedMotion();
  if (reduce) return undefined;
  return {
    y: [0, -7, 0],
    transition: {
      duration: 5.5 + delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

function HeroFloatingChip({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Sparkles;
}) {
  return (
    <div
      className={`${cx.card} max-w-[200px] p-3.5 sm:max-w-[220px] sm:p-4`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(148,163,255,0.12), 0 24px 60px -40px rgba(0,0,0,0.9)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-200/90">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </span>
      </div>
      <p className="text-xs font-medium leading-snug text-slate-200 sm:text-[13px]">
        {subtitle}
      </p>
    </div>
  );
}

function HeroMainPreview() {
  return (
    <div
      className={`${cx.card} relative w-full max-w-[340px] overflow-hidden p-4 sm:max-w-[380px] sm:p-5`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(165,180,252,0.14), 0 40px 100px -50px rgba(0,0,0,0.95)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200/75">
            Page restaurant
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Restaurant Luna
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300">
          <Star className="h-3 w-3 text-amber-200/90" fill="currentColor" />
          4,9
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="col-span-2 aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-700/80 via-slate-800/60 to-indigo-950/40 ring-1 ring-white/10" />
        <div className="flex flex-col gap-2">
          <div className="aspect-square rounded-xl bg-slate-800/50 ring-1 ring-white/8" />
          <div className="aspect-square rounded-xl bg-slate-800/40 ring-1 ring-white/8" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        Ambiance feutrée · cuisine de saison · cave soignée
      </p>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <Clock className="h-3 w-3 text-indigo-200/80" />
          Mar–Dim · 12h–14h30 · 19h–23h
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <MapPin className="h-3 w-3 text-indigo-200/80" />
          Rue du Lac 12, Lausanne
        </span>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-full bg-gradient-to-r from-[#eef2ff] to-[#dbeafe] py-3 text-sm font-semibold text-[#0b1020] shadow-[0_16px_40px_-24px_rgba(129,140,248,0.5)]"
      >
        Réserver une table
      </button>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const float = useFloat;

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(99,102,241,0.11),transparent_58%),radial-gradient(ellipse_45%_35%_at_100%_15%,rgba(56,189,248,0.06),transparent_50%),linear-gradient(180deg,#060814_0%,#0a0f1c_42%,#060814_100%)]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.07] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-100/90 sm:text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_12px_rgba(165,180,252,0.7)]" />
          Nouvelle génération pour restaurants
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.06 }}
          className="mt-8 text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]"
        >
          Les clients ne veulent plus chercher un restaurant.
          <span className="mt-3 block text-balance font-medium text-slate-300 sm:mt-4 sm:text-[2.5rem] md:text-[2.75rem]">
            Ils veulent le comprendre et réserver immédiatement.
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut, delay: 0.12 }}
          className="mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          ZenGrow transforme la manière dont les restaurants se présentent en ligne : une page
          rapide, moderne et pensée pour convertir un visiteur en réservation en quelques secondes.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.18 }}
          className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe] px-8 py-3.5 text-sm font-semibold text-[#0b1020] shadow-[0_18px_50px_-22px_rgba(129,140,248,0.5)] transition hover:brightness-[1.03]"
          >
            Créer ma page restaurant
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white transition hover:border-indigo-400/25 hover:bg-white/[0.07]"
          >
            Voir la démo
          </a>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-20 max-w-6xl lg:mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(480px,72vw)] w-[min(480px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/12 blur-[100px]"
        />

        <div className="relative flex min-h-[440px] items-center justify-center sm:min-h-[480px]">
          <motion.div
            animate={float(0)}
            className="absolute left-0 top-[6%] z-20 hidden sm:block lg:left-[1%]"
          >
            <HeroFloatingChip
              icon={Calendar}
              title="Nouvelle réservation"
              subtitle="Table 2 · ce soir · 20h00 — confirmée"
            />
          </motion.div>

          <motion.div
            animate={float(0.35)}
            className="absolute right-0 top-[8%] z-20 hidden sm:block lg:right-[1%]"
          >
            <HeroFloatingChip
              icon={Star}
              title="Avis Google programmé"
              subtitle="Envoi automatique après la visite"
            />
          </motion.div>

          <motion.div
            animate={float(0.7)}
            className="absolute bottom-[10%] left-[2%] z-20 hidden md:block lg:left-[4%]"
          >
            <HeroFloatingChip
              icon={UtensilsCrossed}
              title="Menu spécial publié"
              subtitle="Dégustation · visible sur la page"
            />
          </motion.div>

          <motion.div
            animate={float(1)}
            className="absolute bottom-[8%] right-[2%] z-20 hidden md:block lg:right-[5%]"
          >
            <HeroFloatingChip
              icon={Users}
              title="Client ajouté"
              subtitle="Profil enrichi dans votre espace"
            />
          </motion.div>

          <motion.div
            animate={float(0.5)}
            className="absolute left-1/2 top-2 z-10 -translate-x-1/2 sm:top-0"
          >
            <div
              className={`${cx.card} flex items-center gap-2 px-3 py-2`}
              style={{ boxShadow: "0 18px 50px -36px rgba(99,102,241,0.35)" }}
            >
              <Smartphone className="h-4 w-4 text-indigo-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-200">
                Mobile-first
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: easeOut, delay: 0.22 }}
            className="relative z-30 w-full px-2 sm:px-0"
          >
            <div className="mx-auto flex justify-center">
              <HeroMainPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const a = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${a}`}>
      {kicker ? (
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/70">
          <span className="h-px w-8 bg-indigo-400/35" />
          {kicker}
        </span>
      ) : null}
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.65rem] md:leading-[1.08]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function ProblemSection() {
  const v = useViewMotion();
  const cards = [
    { label: "Photos", Icon: ImageIcon },
    { label: "Menu", Icon: ScrollText },
    { label: "Ambiance", Icon: Sparkles },
    { label: "Réservation", Icon: Calendar },
  ] as const;

  return (
    <section
      id="contexte"
      className="relative scroll-mt-24 px-4 py-28 sm:px-6 lg:px-8 lg:py-32"
    >
      <SectionGlow tone="blue" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Aujourd’hui, tout va plus vite."
            subtitle="Quand quelqu’un découvre un restaurant, il prend une décision presque immédiatement."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-12 max-w-3xl space-y-6 text-center text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Il ouvre un lien. Regarde quelques photos. Jette un œil au menu. Observe l’ambiance.
          </motion.p>
          <motion.p variants={fadeUp(0.04)} className="font-medium text-slate-200">
            Puis il réserve… ou passe au suivant.
          </motion.p>
          <motion.p variants={fadeUp(0.06)}>
            Le problème, c’est que beaucoup de restaurants utilisent encore des expériences pensées
            comme des vitrines classiques, alors que les comportements ont complètement changé.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
        >
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              variants={fadeUp(i * 0.03)}
              className={`${cx.card} ${cx.cardHover} flex flex-col items-center gap-4 p-8 text-center`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-indigo-200/90 ring-1 ring-white/10">
                <c.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm font-semibold text-white">{c.label}</p>
              <p className="text-xs text-slate-500">Parcours de décision en quelques secondes</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.08)} className="mt-14">
          <div
            className={`${cx.card} relative overflow-hidden px-6 py-10 text-center sm:px-12 sm:py-12`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_120%,rgba(99,102,241,0.12),transparent_55%)]"
            />
            <p className="relative text-lg font-medium text-slate-200 sm:text-xl">
              Dans ce rythme, chaque friction fait la différence entre{" "}
              <span className="text-white">« je réserve »</span> et{" "}
              <span className="text-slate-400">« suivant »</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NewExperienceSection() {
  const v = useViewMotion();

  return (
    <section
      id="experience"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#070a14]/90 px-4 py-28 sm:px-6 lg:px-8 lg:py-32"
    >
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Une page pensée pour décider vite."
            subtitle="ZenGrow a été conçu pour cette nouvelle manière de découvrir un restaurant."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-12 max-w-3xl space-y-5 text-center text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Chaque page va droit à l’essentiel. Le client arrive et comprend immédiatement le style
            du restaurant, l’ambiance, les informations importantes et comment réserver.
          </motion.p>
          <motion.p variants={fadeUp(0.05)} className="font-medium text-slate-200">
            Tout est fluide. Rapide. Pensé mobile dès le départ.
          </motion.p>
          <motion.p variants={fadeUp(0.08)}>
            Parce qu’aujourd’hui, chaque seconde d’hésitation compte.
          </motion.p>
        </motion.div>

        <motion.div
          id="demo"
          {...v}
          variants={fadeUp(0.1)}
          className="relative mx-auto mt-16 max-w-4xl scroll-mt-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-b from-indigo-500/10 via-transparent to-sky-500/5 blur-2xl"
          />
          <div
            className={`${cx.card} relative overflow-hidden border-indigo-400/15 p-4 sm:p-6 lg:p-8`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(129,140,248,0.12), 0 40px 100px -50px rgba(0,0,0,0.85)",
            }}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-10">
              <div className="mx-auto w-full max-w-[280px]">
                <div className="rounded-[1.75rem] border border-white/10 bg-[#0c101c] p-3 shadow-inner ring-1 ring-white/5">
                  <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-b from-[#121826] to-[#0a0e18]">
                    <div className="flex items-center justify-between px-4 pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Aperçu
                      </span>
                      <span className="h-2 w-10 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-3 space-y-3 px-4 pb-4">
                      <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-slate-700/70 to-indigo-950/50 ring-1 ring-white/10" />
                      <div>
                        <p className="text-lg font-semibold text-white">Restaurant Luna</p>
                        <p className="mt-1 text-xs text-slate-500">Bistro contemporain · centre-ville</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-slate-300 ring-1 ring-white/10">
                          Ambiance feutrée
                        </span>
                        <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-slate-300 ring-1 ring-white/10">
                          Carte courte
                        </span>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          Adresse
                        </p>
                        <p className="mt-1 text-xs text-slate-200">Quai de l’Ouche 4 · Genève</p>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-full bg-gradient-to-r from-[#eef2ff] to-[#dbeafe] py-2.5 text-xs font-semibold text-[#0b1020]"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`${cx.card} ${cx.cardHover} border-white/[0.07] p-4`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Menu & événements
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">Soirée accord mets & vins</p>
                    <p className="mt-1 text-xs text-slate-500">Publié · visible immédiatement</p>
                  </div>
                  <div className={`${cx.card} ${cx.cardHover} border-white/[0.07] p-4`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Nouveautés
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">Carte de printemps</p>
                    <p className="mt-1 text-xs text-slate-500">Mise en avant sur la page</p>
                  </div>
                </div>
                <div
                  className={`${cx.card} flex flex-wrap items-center gap-4 border-indigo-400/12 p-5`}
                >
                  <LayoutGrid className="h-8 w-8 text-indigo-200/80" strokeWidth={1.25} />
                  <div>
                    <p className="text-sm font-semibold text-white">Une lecture claire, sans détour</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Le visiteur comprend où il est, ce qu’il mange, et comment réserver — sans
                      chercher.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const platformModules = [
  {
    title: "Réservations",
    text: "Chaque demande arrive au bon endroit, avec le contexte nécessaire pour décider vite.",
    Icon: Calendar,
  },
  {
    title: "Clients",
    text: "Historique et préférences utiles pour accueillir et fidéliser sans friction.",
    Icon: Users,
  },
  {
    title: "Campagnes",
    text: "Annoncez une offre, une soirée ou une nouveauté — et touchez les bonnes personnes.",
    Icon: Megaphone,
  },
  {
    title: "Événements",
    text: "Soirées, brunchs, dégustations : créez l’événement et mettez-le en ligne en un geste.",
    Icon: PartyPopper,
  },
  {
    title: "Menus spéciaux",
    text: "Mettez en avant une carte limitée, un menu dégustation ou une séquence saisonnière.",
    Icon: ChefHat,
  },
  {
    title: "Avis Google",
    text: "Après la visite, le bon message part au bon moment — sans travail manuel supplémentaire.",
    Icon: Star,
  },
] as const;

function PlatformSection() {
  const v = useViewMotion();

  return (
    <section
      id="plateforme"
      className="relative scroll-mt-24 px-4 py-28 sm:px-6 lg:px-8 lg:py-32"
    >
      <SectionGlow tone="sage" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Derrière une page simple, une vraie plateforme."
            subtitle="ZenGrow ne sert pas uniquement à afficher un restaurant."
          />
        </motion.div>

        <motion.p
          {...v}
          variants={fadeUp(0.05)}
          className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          Toute l’expérience est connectée derrière une seule interface : réservations, clients,
          campagnes, événements, menus spéciaux, nouveautés et avis Google. Le restaurant garde enfin
          le contrôle total de son expérience en ligne.
        </motion.p>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {platformModules.map((m, i) => (
            <motion.article
              key={m.title}
              variants={fadeUp(i * 0.02)}
              className={`${cx.card} ${cx.cardHover} p-7`}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-100 ring-1 ring-indigo-400/15">
                <m.Icon className="h-5 w-5" strokeWidth={1.65} />
              </div>
              <h3 className="text-lg font-semibold text-white">{m.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{m.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LivingPresenceSection() {
  const v = useViewMotion();
  const items = [
    "Nouvelle carte publiée",
    "Soirée spéciale ajoutée",
    "Offre du week-end en ligne",
    "Photos mises à jour",
    "Menu spécial activé",
  ] as const;

  return (
    <section className="relative border-y border-white/[0.06] bg-[#060914]/75 px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Un restaurant n’est jamais figé. Sa présence en ligne non plus."
            subtitle="Une nouvelle carte. Une soirée spéciale. Une offre du week-end. Une nouvelle ambiance."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.06)}
          className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          <p>
            Avec ZenGrow, tout peut évoluer immédiatement — sans devoir contacter quelqu’un, sans
            attendre plusieurs jours, sans dépendre d’une agence pour modifier un simple détail.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 flex flex-wrap justify-center gap-3"
        >
          {items.map((t, i) => (
            <motion.div
              key={t}
              variants={fadeUp(i * 0.03)}
              className={`${cx.card} ${cx.cardHover} inline-flex items-center gap-2 px-5 py-3`}
            >
              <Zap className="h-4 w-4 text-amber-200/80" />
              <span className="text-sm font-medium text-slate-200">{t}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ClientRestaurantSection() {
  const v = useViewMotion();
  const client = [
    "Découvre le restaurant",
    "Comprend l’ambiance",
    "Réserve rapidement",
    "Reçoit une confirmation",
  ] as const;
  const restaurant = [
    "Reçoit la réservation",
    "Enregistre le client",
    "Lance une campagne",
    "Automatise les avis Google",
  ] as const;

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <SectionGlow tone="blue" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Une expérience moderne pour les clients. Une gestion simple pour le restaurant."
          />
        </motion.div>

        <motion.p
          {...v}
          variants={fadeUp(0.05)}
          className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          D’un côté, les clients découvrent, comprennent et réservent plus rapidement. De l’autre,
          le restaurant centralise réservations, clients, campagnes, événements et avis Google dans
          une seule plateforme claire, moderne et pensée pour le quotidien.
        </motion.p>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 lg:grid-cols-2 lg:gap-6"
        >
          <motion.div
            variants={fadeUp(0, 22)}
            className={`${cx.card} border-indigo-400/12 bg-gradient-to-b from-indigo-500/[0.07] to-transparent p-8 sm:p-9`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/75">
              Côté client
            </p>
            <ul className="mt-8 space-y-4">
              {client.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/15 text-indigo-100">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp(0.05, 22)}
            className={`${cx.card} p-8 sm:p-9`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Côté restaurant
            </p>
            <ul className="mt-8 space-y-4">
              {restaurant.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-100">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ForWhoSection() {
  const v = useViewMotion();

  return (
    <section
      id="pour-qui"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#070a14]/80 px-4 py-28 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Une page principale ou une expérience de réservation plus moderne."
            subtitle="Certains restaurants utilisent ZenGrow comme présence principale en ligne. D’autres pour moderniser leur expérience de réservation actuelle, même s’ils ont déjà un site."
          />
        </motion.div>

        <motion.p
          {...v}
          variants={fadeUp(0.05)}
          className="mx-auto mt-8 max-w-3xl text-center text-base font-medium text-slate-200 sm:text-lg"
        >
          Dans les deux cas, le résultat reste le même : une expérience plus rapide, plus moderne,
          plus connectée.
        </motion.p>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-5 lg:grid-cols-2"
        >
          <motion.article
            variants={fadeUp(0, 24)}
            className={`${cx.card} ${cx.cardHover} p-8 sm:p-10`}
          >
            <h3 className="text-xl font-semibold text-white">Restaurants sans site moderne</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              ZenGrow peut devenir leur page principale : claire, rapide, professionnelle et orientée
              réservation.
            </p>
          </motion.article>
          <motion.article
            variants={fadeUp(0.05, 24)}
            className={`${cx.card} ${cx.cardHover} border-indigo-400/12 bg-gradient-to-br from-indigo-500/[0.06] to-transparent p-8 sm:p-10`}
          >
            <h3 className="text-xl font-semibold text-white">Restaurants avec un site existant</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              ZenGrow peut devenir leur page de réservation moderne, connectée à une vraie plateforme
              de gestion.
            </p>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function VisionSection() {
  const v = useViewMotion();

  return (
    <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.14),transparent_65%),linear-gradient(180deg,#060814_0%,#0a0f1c_50%,#060814_100%)]"
      />
      <motion.div
        {...v}
        variants={fadeUp(0, 26)}
        className="relative mx-auto max-w-4xl text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-200/65">
          Vision
        </p>
        <h2 className="mt-6 text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-[2.85rem]">
          Le web restaurant évolue enfin.
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
          Pendant longtemps, les restaurants avaient simplement besoin « d’un site ». Aujourd’hui,
          ils ont surtout besoin d’une expérience rapide, mobile et connectée à leurs clients. C’est
          exactement ce que ZenGrow apporte.
        </p>
      </motion.div>
    </section>
  );
}

const pricingIncluded = [
  "Page restaurant personnalisée",
  "Photos, ambiance, informations et carte",
  "Formulaire de réservation rapide",
  "Espace restaurateur",
  "Gestion des réservations",
  "Base clients",
  "Campagnes et nouveautés",
  "Événements et menus spéciaux",
  "Automatisation des avis Google",
] as const;

function PricingSection() {
  const v = useViewMotion();

  return (
    <section id="tarifs" className="relative scroll-mt-24 px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
      <SectionGlow />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Une nouvelle génération d’expérience restaurant."
            subtitle="Une page restaurant moderne, une réservation fluide et une plateforme complète pour gérer l’essentiel au quotidien."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.08)}
          className={`${cx.card} relative mx-auto mt-14 overflow-hidden border-indigo-400/20 p-8 sm:p-11`}
          style={{
            boxShadow:
              "0 0 0 1px rgba(165,180,252,0.18), 0 0 80px -30px rgba(99,102,241,0.25)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(129,140,248,0.15),transparent_55%)]"
          />
          <div className="relative">
            <div className="flex flex-wrap items-end justify-center gap-2">
              <span className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                39 CHF
              </span>
              <span className="pb-2 text-base font-medium text-slate-400">/ mois</span>
            </div>
            <p className="mt-6 text-sm text-slate-400">Inclus :</p>
            <ul className="mx-auto mt-5 max-w-md space-y-3 text-left">
              {pricingIncluded.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/18 text-indigo-100">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe] py-3.5 text-sm font-semibold text-[#0b1020] shadow-[0_18px_55px_-26px_rgba(129,140,248,0.55)] transition hover:brightness-[1.03] sm:w-auto sm:px-14"
            >
              Créer ma page restaurant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              Simple à mettre en place. Simple à gérer.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const v = useViewMotion();

  return (
    <section className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <motion.div
        {...v}
        variants={fadeUp(0, 24)}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-400/18 bg-gradient-to-br from-indigo-500/[0.12] via-[#0b101f] to-sky-500/[0.08] px-6 py-16 text-center sm:px-14 sm:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-sky-400/12 blur-3xl"
        />
        <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.65rem]">
          Les restaurants changent. L’expérience en ligne aussi.
        </h2>
        <p className="relative mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Offrez à vos clients une manière plus rapide, plus claire et plus moderne de découvrir
          votre restaurant et de réserver.
        </p>
        <Link
          href="/signup"
          className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0b1020] shadow-[0_22px_60px_-28px_rgba(255,255,255,0.35)] transition hover:brightness-[0.98]"
        >
          Créer ma page restaurant
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}

function ContactSection() {
  const v = useViewMotion();

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div {...v} variants={fadeUp()}>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Contact</h2>
          <p className="mt-4 text-base text-slate-400">
            Une question sur ZenGrow ou sur la mise en place ? Écrivez-nous, nous répondons vite.
          </p>
          <a
            href="mailto:support@zengrow.app"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-indigo-400/25"
          >
            support@zengrow.app
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const footLinks = [
    { label: "Expérience", href: "#experience" },
    { label: "Plateforme", href: "#plateforme" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Contact", href: "#contact" },
    { label: "Connexion", href: "/login" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#050814] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            ZenGrow
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            La nouvelle génération d’expérience en ligne pour restaurants.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {footLinks.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-center text-xs text-slate-600 sm:text-left">
        © {new Date().getFullYear()} ZenGrow
      </p>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className={`${landingSans.variable} ${cx.page} font-[family-name:var(--font-zg-landing),system-ui,sans-serif] text-slate-100`}
      style={{
        background: "linear-gradient(180deg, #060814 0%, #0a0f1c 42%, #060814 100%)",
      }}
    >
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <NewExperienceSection />
        <PlatformSection />
        <LivingPresenceSection />
        <ClientRestaurantSection />
        <ForWhoSection />
        <VisionSection />
        <PricingSection />
        <FinalCtaSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
