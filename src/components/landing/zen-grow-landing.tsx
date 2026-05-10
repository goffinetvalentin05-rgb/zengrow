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
  ChevronDown,
  ChevronRight,
  Clock,
  LayoutGrid,
  MapPin,
  Menu as MenuIcon,
  ScrollText,
  Sparkles,
  Star,
  UtensilsCrossed,
  Users,
  Zap,
  Smartphone,
  Megaphone,
  PartyPopper,
  ChefHat,
  X,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Inter } from "next/font/google";

const landingSans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-landing",
});

const easeOut = [0.22, 1, 0.36, 1] as const;

const cx = {
  page: "min-h-screen overflow-x-hidden antialiased selection:bg-violet-500/25 selection:text-white",
  card: "rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]",
  cardHover:
    "transition-all duration-500 ease-out hover:border-white/[0.14] hover:bg-white/[0.045] hover:-translate-y-0.5",
  glow: "pointer-events-none absolute rounded-full blur-[100px] opacity-50",
} as const;

function fadeUp(delay = 0, y = 20): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: easeOut, delay },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

function useViewMotion() {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : "hidden",
    whileInView: reduce ? undefined : "show",
    viewport: { once: true, amount: 0.15 },
  } as const;
}

function useFloat(delay: number) {
  const reduce = useReducedMotion();
  if (reduce) return undefined;
  return {
    y: [0, -8, 0],
    transition: {
      duration: 6 + delay,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

const navLinks = [
  { href: "#experience", label: "Expérience" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#pour-qui", label: "Pour qui" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050508]/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:px-10">
        <Link href="/" className="text-[1.05rem] font-semibold tracking-tight text-white">
          ZenGrow
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-[0.8125rem] font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="group hidden items-center gap-1 rounded-full bg-white px-5 py-2.5 text-[0.8125rem] font-semibold text-[#0a0a0c] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.35)] transition hover:bg-slate-100 sm:inline-flex"
          >
            Créer ma page
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
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
            className="overflow-hidden border-t border-white/[0.06] bg-[#050508]/95 lg:hidden"
          >
            <div className="space-y-0.5 px-4 py-3">
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
                className="mt-2 flex w-full justify-center rounded-full bg-white py-3 text-sm font-semibold text-[#0a0a0c]"
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

function FeatureGraphic({ variant }: { variant: 0 | 1 | 2 | 3 }) {
  const gradients = [
    "from-violet-600/30 via-fuchsia-600/15 to-transparent",
    "from-sky-500/25 via-indigo-600/20 to-transparent",
    "from-emerald-500/20 via-teal-600/15 to-transparent",
    "from-amber-500/20 via-orange-600/15 to-transparent",
  ] as const;
  return (
    <div
      className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[variant]} ring-1 ring-white/10`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
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
      className={`${cx.card} max-w-[200px] p-3.5 shadow-xl sm:max-w-[218px]`}
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px -32px rgba(0,0,0,0.85)" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-white/90">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </div>
      <p className="text-[11px] font-medium leading-snug text-slate-200 sm:text-xs">{subtitle}</p>
    </div>
  );
}

function HeroMainPreview() {
  return (
    <div
      className={`${cx.card} relative w-full max-w-[360px] overflow-hidden p-5 sm:max-w-[400px]`}
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 40px 100px -40px rgba(0,0,0,0.95)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Page restaurant
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">Restaurant Luna</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300">
          <Star className="h-3 w-3 text-amber-200/90" fill="currentColor" />
          4,9
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="col-span-2 aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-700/90 via-zinc-900/70 to-violet-950/50 ring-1 ring-white/10" />
        <div className="flex flex-col gap-2">
          <div className="aspect-square rounded-xl bg-zinc-800/60 ring-1 ring-white/[0.07]" />
          <div className="aspect-square rounded-xl bg-zinc-800/50 ring-1 ring-white/[0.07]" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Ambiance feutrée · saison · cave soignée</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-400">
          <Clock className="h-3 w-3" />
          Mar–Dim · 12h–23h
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-400">
          <MapPin className="h-3 w-3" />
          Lausanne
        </span>
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0a0a0c]"
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
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(120,80,200,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(59,130,246,0.08),transparent_45%),linear-gradient(180deg,#050508_0%,#0c0c12_45%,#050508_100%)]"
      />
      <div className={`${cx.glow} -left-20 top-20 h-72 w-72 bg-violet-600/25`} aria-hidden />
      <div className={`${cx.glow} right-0 top-40 h-80 w-80 bg-blue-600/15`} aria-hidden />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 sm:text-xs"
        >
          Expérience en ligne pour restaurants
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: easeOut, delay: 0.05 }}
          className="mt-6 text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white"
        >
          ZenGrow
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-balance text-lg font-medium text-slate-400 sm:text-xl"
        >
          Une page restaurant moderne, une réservation fluide, une plateforme complète derrière.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.15 }}
          className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0a0a0c] shadow-lg transition hover:bg-slate-100"
          >
            Créer ma page restaurant
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Créer ma page restaurant
          </Link>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
          >
            Voir les services
          </a>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-6 opacity-60 grayscale"
        >
          {["Carte", "Réservation", "Clients", "Événements", "Avis"].map((label) => (
            <span
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-500"
            >
              {label}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="relative mx-auto mt-20 max-w-6xl lg:mt-28">
        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[460px]">
          <motion.div animate={float(0)} className="absolute left-0 top-[4%] z-20 hidden sm:block lg:left-[2%]">
            <HeroFloatingChip
              icon={Calendar}
              title="Nouvelle réservation"
              subtitle="Table 2 · ce soir · 20h00"
            />
          </motion.div>
          <motion.div animate={float(0.4)} className="absolute right-0 top-[6%] z-20 hidden sm:block lg:right-[2%]">
            <HeroFloatingChip
              icon={Star}
              title="Avis Google programmé"
              subtitle="Envoi après la visite"
            />
          </motion.div>
          <motion.div animate={float(0.8)} className="absolute bottom-[8%] left-[2%] z-20 hidden md:block">
            <HeroFloatingChip
              icon={UtensilsCrossed}
              title="Menu spécial publié"
              subtitle="Visible instantanément"
            />
          </motion.div>
          <motion.div animate={float(1.1)} className="absolute bottom-[6%] right-[3%] z-20 hidden md:block">
            <HeroFloatingChip icon={Users} title="Client ajouté" subtitle="Fiche enrichie" />
          </motion.div>
          <motion.div
            animate={float(0.55)}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
          >
            <div className={`${cx.card} flex items-center gap-2 px-3 py-2`}>
              <Smartphone className="h-4 w-4 text-slate-300" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Mobile-first
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: easeOut, delay: 0.2 }}
            className="relative z-30 flex justify-center px-2"
          >
            <HeroMainPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  const v = useViewMotion();
  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          {...v}
          variants={fadeUp()}
          className={`${cx.card} relative overflow-hidden p-8 sm:p-10`}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500/80 to-transparent" />
          <p className="text-lg font-medium leading-relaxed text-slate-200 sm:text-xl md:text-2xl">
            « Nous structurons votre présentation, clarifions l’offre, et faisons en sorte qu’un
            visiteur passe de la curiosité à la réservation sans friction. Le meilleur dans tout ça ?
            Vous gardez la main sur le quotidien. »
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-2 ring-white/10" />
            <div>
              <p className="text-sm font-semibold text-white">Équipe ZenGrow</p>
              <p className="text-xs text-slate-500">Produit & hospitality</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const v = useViewMotion();
  const bullets = [
    "Mise en ligne plus rapide",
    "Parcours client simplifié",
    "Contenus évolutifs",
    "Expériences personnalisées",
    "Pilotage centralisé",
    "Indicateurs lisibles",
    "Moins de friction à la réservation",
    "Décisions basées sur le réel",
  ] as const;

  return (
    <section id="avantages" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className={`${cx.glow} left-1/4 top-0 h-64 w-64 -translate-x-1/2 bg-violet-600/15`} aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Avantages</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
            Pourquoi nous choisir
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Associez une page publique premium à une plateforme de gestion pensée pour les équipes
            terrain.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <motion.div {...v} variants={stagger} className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { t: "Parcours express", d: "Le client comprend votre restaurant en quelques secondes." },
              { t: "Mise à jour vivante", d: "Carte, photos et offres publiées sans délai technique." },
            ].map((item, i) => (
              <motion.div key={item.t} variants={fadeUp(i * 0.05)} className={`${cx.card} ${cx.cardHover} p-6`}>
                <RefreshCw className="h-5 w-5 text-violet-300/80" />
                <p className="mt-4 text-base font-semibold text-white">{item.t}</p>
                <p className="mt-2 text-sm text-slate-500">{item.d}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...v} variants={fadeUp(0.08)} className={`${cx.card} overflow-hidden p-6 sm:p-8`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08]">
                <Layers className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tout synchronisé</p>
                <p className="text-xs text-slate-500">
                  Page publique et espace restaurateur restent alignés en permanence.
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Avant</p>
                <p className="mt-2 text-2xl font-semibold text-slate-500">Friction</p>
                <p className="mt-1 text-xs text-slate-600">Infos éclatées</p>
              </div>
              <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200/80">Après</p>
                <p className="mt-2 text-2xl font-semibold text-white">Clarté</p>
                <p className="mt-1 text-xs text-slate-400">Un seul fil direct</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...v}
          variants={fadeUp(0.1)}
          className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {bullets.map((b, i) => (
            <motion.div
              key={b}
              variants={fadeUp(i * 0.02)}
              className="flex items-start gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300/90" strokeWidth={2.5} />
              <span className="text-sm text-slate-400">{b}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const featureBlocks = [
  {
    title: "Présentation soignée",
    text: "Photos, ton et informations structurés pour que votre restaurant se comprenne tout de suite.",
  },
  {
    title: "Flux de réservation",
    text: "Un parcours court, clair et fiable — du premier clic à la confirmation.",
  },
  {
    title: "Pilotage & statistiques",
    text: "Suivez l’activité, les demandes et l’impact de vos mises en avant sans tableur.",
  },
  {
    title: "Relation client",
    text: "Confirmations, rappels et demandes d’avis orchestrés depuis un seul espace.",
  },
] as const;

function FeaturesSection() {
  const v = useViewMotion();
  return (
    <section
      id="fonctionnalites"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#08080f]/80 px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Fonctionnalités
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Tout l’essentiel, dans un seul outil
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Découvrez des blocs pensés pour simplifier le quotidien et accélérer la conversion.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureBlocks.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp(i * 0.04)}
              className={`${cx.card} ${cx.cardHover} overflow-hidden p-0`}
            >
              <div className="p-1">
                <FeatureGraphic variant={(i % 4) as 0 | 1 | 2 | 3} />
              </div>
              <div className="p-6 pt-4">
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.12)}
          className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0a0a0c]"
          >
            Créer ma page restaurant
          </Link>
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.06]"
          >
            Voir les services
          </a>
        </motion.div>
      </div>
    </section>
  );
}

const services = [
  {
    title: "Stratégie de présentation",
    text: "Arborescence, messages clés et hiérarchie visuelle pour une page qui convertit.",
    Icon: LayoutGrid,
  },
  {
    title: "Mise en page & contenus",
    text: "Blocs éditoriaux pour menus, événements et actualités — sans dépendre d’un développeur.",
    Icon: ScrollText,
  },
  {
    title: "Réservation intégrée",
    text: "Formulaire rapide, règles de capacité et confirmations cohérentes avec votre marque.",
    Icon: Calendar,
  },
  {
    title: "Campagnes & annonces",
    text: "Mettez en avant une offre ou une soirée et touchez vos clients au bon moment.",
    Icon: Megaphone,
  },
  {
    title: "Automatisations post-visite",
    text: "Demandes d’avis et relances structurées pour protéger votre réputation.",
    Icon: Star,
  },
  {
    title: "Workflows opérationnels",
    text: "Réservations, files d’attente et tâches équipe reliées à une seule interface.",
    Icon: Zap,
  },
] as const;

function ServicesSection() {
  const v = useViewMotion();
  return (
    <section id="services" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Services</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Des services pensés pour performer
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Des modules qui renforcent votre image et accélèrent vos opérations au quotidien.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp(i * 0.03)}
              className={`${cx.card} ${cx.cardHover} flex gap-4 p-6`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06]">
                <s.Icon className="h-5 w-5 text-white/85" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Audit & structure",
    text: "Nous cartographions votre offre, vos créneaux et vos objectifs pour cadrer la page.",
  },
  {
    n: "02",
    title: "Déploiement maîtrisé",
    text: "Mise en ligne de la page et connexion à votre espace : réservations, clients, campagnes.",
  },
  {
    n: "03",
    title: "Amélioration continue",
    text: "Ajustements, nouveautés et optimisations pour garder une présence toujours à jour.",
  },
] as const;

function ProcessSection() {
  const v = useViewMotion();
  return (
    <section
      id="processus"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#06060c]/90 px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Processus</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Simple & évolutif
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Un cadre transparent, des itérations courtes, des retours intégrés rapidement.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 lg:grid-cols-3"
        >
          {steps.map((s, i) => (
            <motion.article
              key={s.n}
              variants={fadeUp(i * 0.05)}
              className={`${cx.card} relative overflow-hidden p-8`}
            >
              <p className="text-5xl font-semibold tabular-nums text-white/[0.08]">{s.n}</p>
              <h3 className="relative mt-4 text-xl font-semibold text-white">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-500">{s.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const projects = [
  {
    tag: "01",
    title: "Luna Bistro — page & réservations unifiées",
    text: "Une vitrine épurée, menu événementiel et file de réservation synchronisée avec la salle.",
    a: "−35%",
    aLabel: "Temps de réponse aux demandes",
    b: "+28%",
    bLabel: "Réservations en ligne",
  },
  {
    tag: "02",
    title: "Quai 14 — saisonnalité & offres flash",
    text: "Mise en avant des menus courts et des soirées thématiques, mises à jour en direct.",
    a: "2×",
    aLabel: "Vitesse de publication",
    b: "−40%",
    bLabel: "Allers-retours avec l’agence",
  },
  {
    tag: "03",
    title: "Maison Nord — réputation & fidélité",
    text: "Parcours post-visite structuré pour capter les avis et sécuriser le retour client.",
    a: "+42%",
    aLabel: "Avis Google qualifiés",
    b: "Stable",
    bLabel: "Charge équipe salle",
  },
] as const;

function ProjectsSection() {
  const v = useViewMotion();
  const [active, setActive] = useState(0);

  return (
    <section id="projets" className="relative px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Projets</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Impact mesurable
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Quelques exemples de déploiements — chiffres indicatifs pour illustrer le potentiel.
          </p>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.06)} className="mt-8 flex justify-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.tag}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                active === i
                  ? "bg-white text-[#0a0a0c]"
                  : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
              }`}
            >
              Projet {p.tag}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className={`${cx.card} mx-auto mt-10 max-w-4xl p-8 sm:p-10`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">
            {projects[active].tag}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{projects[active].title}</h3>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">{projects[active].text}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-3xl font-semibold text-white">{projects[active].a}</p>
              <p className="mt-1 text-xs text-slate-500">{projects[active].aLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-3xl font-semibold text-white">{projects[active].b}</p>
              <p className="mt-1 text-xs text-slate-500">{projects[active].bLabel}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "Notre page raconte enfin ce qu’on est. Les clients réservent sans nous solliciter pour des détails basiques.",
    name: "Brendan",
    role: "Directeur marketing, StratIQ",
  },
  {
    quote:
      "On a gagné en clarté interne et en image externe. Les mises à jour ne nous bloquent plus des semaines.",
    name: "Lena M.",
    role: "Manager, NovaTech",
  },
  {
    quote:
      "Le lien entre la salle et la page est fluide. Moins de friction, plus de contrôle sur l’expérience.",
    name: "Eli R.",
    role: "COO, GridFrame",
  },
] as const;

function CustomersSection() {
  const v = useViewMotion();
  return (
    <section className="relative border-y border-white/[0.06] bg-[#08080f]/70 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Clients</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Ils nous font confiance
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Formulations indicatives — témoignages de démonstration.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              variants={fadeUp(i * 0.04)}
              className={`${cx.card} ${cx.cardHover} p-7`}
            >
              <p className="text-base font-medium leading-relaxed text-slate-200">« {t.quote} »</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800" />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.1)}
          className="mt-16 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-12"
        >
          {[
            { n: "10+", l: "Établissements accompagnés" },
            { n: "98%", l: "Satisfaction déclarée" },
            { n: "5+", l: "Années d’expérience produit" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-semibold text-white sm:text-4xl">{s.n}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
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
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="tarifs" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className={`${cx.glow} left-1/2 top-20 h-72 w-[28rem] -translate-x-1/2 bg-violet-600/12`} aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Tarifs</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Un prix simple pour tout le nécessaire
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Flexible, transparent, pensé pour démarrer vite sans sacrifier la qualité.
          </p>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.06)} className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                cycle === "monthly" ? "bg-white text-[#0a0a0c]" : "text-slate-400 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                cycle === "yearly" ? "bg-white text-[#0a0a0c]" : "text-slate-400 hover:text-white"
              }`}
            >
              Annuel
            </button>
            <span className="hidden items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 sm:inline-flex">
              −30% annuel
            </span>
          </div>
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.1)}
          className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-3 lg:gap-6"
        >
          <div className={`${cx.card} flex flex-col p-8 opacity-80`}>
            <p className="text-sm font-medium text-slate-500">Essentiel</p>
            <p className="mt-4 text-3xl font-semibold text-white">39 CHF</p>
            <p className="text-sm text-slate-500">/ mois</p>
            <p className="mt-4 text-sm text-slate-500">Même offre — libellé alternatif pour comparaison visuelle.</p>
            <Link
              href="/signup"
              className="mt-8 inline-flex justify-center rounded-full border border-white/15 py-3 text-sm font-semibold text-white hover:bg-white/[0.06]"
            >
              Choisir
            </Link>
          </div>

          <div
            className={`${cx.card} relative flex flex-col border-violet-400/25 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-8 shadow-[0_0_60px_-20px_rgba(139,92,246,0.35)] lg:scale-[1.02]`}
          >
            <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0c]">
              Populaire
            </span>
            <p className="text-sm font-medium text-violet-200/90">ZenGrow</p>
            <p className="mt-4 text-4xl font-semibold text-white sm:text-5xl">39 CHF</p>
            <p className="text-sm text-slate-400">/ mois</p>
            <p className="mt-4 text-sm text-slate-400">
              {cycle === "yearly"
                ? "Facturation annuelle indicative — ajustez selon votre offre commerciale."
                : "Facturation mensuelle simple. Sans surprise."}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {pricingIncluded.slice(0, 6).map((f) => (
                <li key={f} className="flex gap-2 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-flex justify-center rounded-full bg-white py-3.5 text-sm font-semibold text-[#0a0a0c] hover:bg-slate-100"
            >
              Créer ma page restaurant
            </Link>
          </div>

          <div className={`${cx.card} flex flex-col p-8 opacity-80`}>
            <p className="text-sm font-medium text-slate-500">Collectif</p>
            <p className="mt-4 text-3xl font-semibold text-white">Sur mesure</p>
            <p className="text-sm text-slate-500">multi-établissements</p>
            <p className="mt-4 text-sm text-slate-500">
              Pour les groupes : gouvernance, branding et déploiements coordonnés.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex justify-center rounded-full border border-white/15 py-3 text-sm font-semibold text-white hover:bg-white/[0.06]"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Simple à mettre en place. Simple à gérer.
        </p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const v = useViewMotion();
  const zg = [
    "Parcours de réservation fluide",
    "Stratégie éditoriale claire",
    "Indicateurs et suivi en direct",
    "Évolutif sans dépendre d’une agence",
    "Automatisations post-visite",
    "Contenus rapides à publier",
    "Analyse des comportements visiteurs",
  ] as const;
  const other = [
    "Formulaires rigides",
    "Pages figées",
    "Décisions à l’instinct",
    "Mises à jour lentes",
    "Relances manuelles",
    "Production de contenu lourde",
    "Peu de visibilité sur la conversion",
  ] as const;

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Comparaison
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Précision vs basique
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Pourquoi une expérience ZenGrow surpasse une simple page statique.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 lg:grid-cols-2"
        >
          <motion.div
            variants={fadeUp(0, 24)}
            className={`${cx.card} border-violet-400/20 bg-gradient-to-b from-violet-500/[0.07] to-transparent p-8 sm:p-10`}
          >
            <h3 className="text-lg font-semibold text-white">ZenGrow</h3>
            <ul className="mt-8 space-y-3">
              {zg.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" strokeWidth={2.5} />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0a0a0c]"
            >
              Créer ma page restaurant
            </Link>
          </motion.div>
          <motion.div variants={fadeUp(0.05, 24)} className={`${cx.card} p-8 sm:p-10`}>
            <h3 className="text-lg font-semibold text-slate-500">Autres approches</h3>
            <ul className="mt-8 space-y-3">
              {other.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-600">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
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

function NewExperienceDemoSection() {
  const v = useViewMotion();
  return (
    <section
      id="experience"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#0a0a12]/60 px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Expérience
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Une page pensée pour décider vite
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            ZenGrow a été conçu pour cette nouvelle manière de découvrir un restaurant — fluide,
            rapide, pensé mobile dès le départ.
          </p>
        </motion.div>

        <motion.div id="demo" {...v} variants={fadeUp(0.08)} className="relative mx-auto mt-14 max-w-4xl scroll-mt-28">
          <div className={`${cx.card} overflow-hidden p-6 sm:p-8`}>
            <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
              <div className="mx-auto w-full max-w-[280px]">
                <div className="rounded-[1.75rem] border border-white/10 bg-[#0c0c14] p-3 ring-1 ring-white/5">
                  <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-b from-[#14141f] to-[#0a0a10] p-4">
                    <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-zinc-700/80 to-violet-950/40 ring-1 ring-white/10" />
                    <p className="mt-3 text-lg font-semibold text-white">Restaurant Luna</p>
                    <p className="text-xs text-slate-500">Bistro · centre-ville</p>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-full bg-white py-2.5 text-xs font-semibold text-[#0a0a0c]"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4 text-left">
                <p className="text-sm text-slate-400">
                  Chaque page va droit à l’essentiel : style, ambiance, infos clés, réservation.
                  Parce qu’aujourd’hui, chaque seconde d’hésitation compte.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Photos", "Menu", "Ambiance", "Carte"].map((x) => (
                    <span
                      key={x}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400"
                    >
                      {x}
                    </span>
                  ))}
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
  { title: "Réservations", text: "Demandes centralisées, contexte clair, décisions rapides.", Icon: Calendar },
  { title: "Clients", text: "Historique utile pour accueillir et fidéliser.", Icon: Users },
  { title: "Campagnes", text: "Offres et nouveautés diffusées au bon moment.", Icon: Megaphone },
  { title: "Événements", text: "Soirées et brunchs publiés en un geste.", Icon: PartyPopper },
  { title: "Menus spéciaux", text: "Cartes limitées, dégustations, saisons.", Icon: ChefHat },
  { title: "Avis Google", text: "Relances structurées après la visite.", Icon: Star },
] as const;

function PlatformGridSection() {
  const v = useViewMotion();
  return (
    <section id="plateforme" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Plateforme
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Derrière une page simple, une vraie plateforme
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Réservations, clients, campagnes, événements, menus spéciaux et avis : un seul espace.
          </p>
        </motion.div>
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
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
                <m.Icon className="h-5 w-5 text-white/85" strokeWidth={1.6} />
              </div>
              <h3 className="text-lg font-semibold text-white">{m.title}</h3>
              <p className="mt-3 text-sm text-slate-500">{m.text}</p>
            </motion.article>
          ))}
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
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#06060c]/85 px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
    >
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Pour qui</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
            Page principale ou réservation moderne
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Dans les deux cas : plus rapide, plus moderne, plus connecté.
          </p>
        </motion.div>
        <motion.div {...v} variants={stagger} className="mt-14 grid gap-5 lg:grid-cols-2">
          <motion.article variants={fadeUp(0)} className={`${cx.card} ${cx.cardHover} p-8 sm:p-10`}>
            <h3 className="text-xl font-semibold text-white">Sans site moderne</h3>
            <p className="mt-4 text-slate-500">
              ZenGrow devient votre page principale : claire, rapide, professionnelle, orientée
              réservation.
            </p>
          </motion.article>
          <motion.article
            variants={fadeUp(0.05)}
            className={`${cx.card} ${cx.cardHover} border-violet-400/15 bg-violet-500/[0.05] p-8 sm:p-10`}
          >
            <h3 className="text-xl font-semibold text-white">Avec un site existant</h3>
            <p className="mt-4 text-slate-500">
              ZenGrow devient votre page de réservation moderne, reliée à une vraie plateforme de
              gestion.
            </p>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "ZenGrow remplace-t-il mon site actuel ?",
    a: "Pas nécessairement. ZenGrow peut être votre vitrine principale ou une page de réservation connectée à votre site existant.",
  },
  {
    q: "Combien de temps pour être en ligne ?",
    a: "Selon vos contenus, comptez en général quelques jours à quelques semaines pour une mise en ligne soignée.",
  },
  {
    q: "Mes clients doivent-ils créer un compte ?",
    a: "Non. Ils réservent depuis la page publique, sans friction inutile.",
  },
  {
    q: "Puis-je modifier ma page moi-même ?",
    a: "Oui. Menus, photos, événements et offres peuvent évoluer depuis votre espace restaurateur.",
  },
  {
    q: "Comment fonctionnent les avis Google ?",
    a: "Après une visite, un message peut être envoyé automatiquement pour inviter à laisser un avis, selon vos réglages.",
  },
] as const;

function FaqItem({
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
    <div className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04] sm:px-6 sm:py-5"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition ${
            open ? "rotate-180 bg-white/[0.08]" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 sm:px-6 sm:pb-6">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FaqSection() {
  const v = useViewMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <motion.div {...v} variants={fadeUp()}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Questions, réponses
            </h2>
            <p className="mt-5 text-slate-400">
              Des réponses courtes. Pour aller plus loin :{" "}
              <a href="mailto:support@zengrow.app" className="text-white underline-offset-4 hover:underline">
                support@zengrow.app
              </a>
            </p>
          </motion.div>
          <motion.div {...v} variants={stagger} className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div key={f.q} variants={fadeUp(i * 0.02)}>
                <FaqItem
                  q={f.q}
                  a={f.a}
                  open={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PreFooterCta() {
  const v = useViewMotion();
  return (
    <section className="relative px-4 pb-6 pt-4 sm:px-6 lg:px-10">
      <motion.div
        {...v}
        variants={fadeUp(0, 20)}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/20 via-[#0c0c14] to-blue-600/15 px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          ZenGrow
        </p>
        <h2 className="relative mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          La nouvelle génération d’expérience pour les restaurants qui veulent avancer.
        </h2>
        <Link
          href="/signup"
          className="relative mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#0a0a0c] hover:bg-slate-100"
        >
          Créer ma page restaurant
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="relative mt-10 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <a href="#fonctionnalites" className="hover:text-white">
            Fonctionnalités
          </a>
          <span className="text-slate-700">·</span>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
          <span className="text-slate-700">·</span>
          <a href="#projets" className="hover:text-white">
            Projets
          </a>
          <span className="text-slate-700">·</span>
          <Link href="/login" className="hover:text-white">
            Connexion
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function ContactSection() {
  const v = useViewMotion();
  return (
    <section id="contact" className="relative scroll-mt-24 px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div {...v} variants={fadeUp()}>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Contact</h2>
          <p className="mt-4 text-slate-400">Une question ? Écrivez-nous, nous répondons vite.</p>
          <a
            href="mailto:support@zengrow.app"
            className="mt-6 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-white/20"
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
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
    { label: "Connexion", href: "/login" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#030305] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold text-white">
            ZenGrow
          </Link>
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            La nouvelle génération d’expérience en ligne pour restaurants.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-3">
          {footLinks.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-medium text-slate-500 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-center text-xs text-slate-700 lg:text-left">
        © {new Date().getFullYear()} ZenGrow
      </p>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className={`${landingSans.variable} ${cx.page} font-[family-name:var(--font-zg-landing),system-ui,sans-serif] text-slate-100`}
      style={{ background: "linear-gradient(180deg,#050508 0%,#0c0c12 40%,#050508 100%)" }}
    >
      <Header />
      <main>
        <Hero />
        <QuoteSection />
        <BenefitsSection />
        <FeaturesSection />
        <ServicesSection />
        <ProcessSection />
        <NewExperienceDemoSection />
        <PlatformGridSection />
        <ProjectsSection />
        <CustomersSection />
        <PricingSection />
        <ComparisonSection />
        <ForWhoSection />
        <FaqSection />
        <PreFooterCta />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
