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
  ExternalLink,
  ImageIcon,
  MapPin,
  Menu as MenuIcon,
  ScrollText,
  Star,
  UtensilsCrossed,
  Users,
  Zap,
  Smartphone,
  Megaphone,
  PartyPopper,
  ChefHat,
  X,
  Monitor,
} from "lucide-react";
import { useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-landing",
});

const ease = [0.22, 1, 0.36, 1] as const;

const shell = {
  section: "px-4 sm:px-6 lg:px-10",
  max: "mx-auto max-w-7xl",
} as const;

const card = {
  base: "rounded-[1.75rem] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.03)_100%)] shadow-[0_32px_120px_-48px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
  hover:
    "transition-all duration-500 ease-out hover:border-white/[0.16] hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-[0_40px_100px_-40px_rgba(99,102,241,0.12)]",
} as const;

function fadeUp(d = 0, y = 24): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease, delay: d },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

function useInView() {
  const r = useReducedMotion();
  return {
    initial: r ? false : "hidden",
    whileInView: r ? undefined : "show",
    viewport: { once: true, amount: 0.12 },
  } as const;
}

function float(delay: number) {
  const r = useReducedMotion();
  if (r) return undefined;
  return {
    y: [0, -10, 0],
    transition: {
      duration: 7 + delay * 0.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

const nav = [
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
    <header className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#05060a]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#05060a]/72">
      <div className={`${shell.max} flex h-[4.25rem] items-center justify-between gap-4 ${shell.section}`}>
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          ZenGrow
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[0.8125rem] font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-b from-[#f4f4f5] to-[#e4e4e7] px-5 py-2.5 text-[0.8125rem] font-semibold text-[#09090b] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.25)] transition hover:brightness-105 lg:inline-flex"
          >
            Créer ma page
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
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
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#05060a]/98 lg:hidden"
          >
            <div className={`space-y-0.5 py-3 ${shell.section}`}>
              {nav.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.05]"
                >
                  {l.label}
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </a>
              ))}
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-2 flex w-full justify-center rounded-full bg-gradient-to-b from-[#f4f4f5] to-[#e4e4e7] py-3 text-sm font-semibold text-[#09090b]"
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
      className={`${card.base} ${card.hover} w-[min(100%,260px)] p-5 sm:w-[min(100%,280px)] sm:p-6 ${className}`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.07), 0 28px 80px -32px rgba(0,0,0,0.85), 0 0 60px -40px rgba(99,102,241,0.15)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-white/10">
          <Icon className="h-[1.125rem] w-[1.125rem] text-indigo-200/90" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
          <p className="mt-1.5 text-sm font-medium leading-snug text-slate-100">{body}</p>
        </div>
      </div>
    </div>
  );
}

function HeroCenterMockup() {
  return (
    <div
      className={`${card.base} relative w-full max-w-[440px] overflow-hidden p-6 sm:max-w-[480px] sm:p-8 lg:max-w-[520px]`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(165,180,252,0.12), 0 48px 120px -40px rgba(0,0,0,0.95), 0 0 80px -30px rgba(99,102,241,0.2)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-200/70">
            Page restaurant ZenGrow
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Restaurant Luna</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-semibold text-amber-100/95">
          <Star className="h-3.5 w-3.5" fill="currentColor" />
          4,9
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-12 gap-3">
        <div className="col-span-8 aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-700/90 via-zinc-900/70 to-indigo-950/50 ring-1 ring-white/12" />
        <div className="col-span-4 flex flex-col gap-3">
          <div className="aspect-square rounded-xl bg-zinc-800/60 ring-1 ring-white/10" />
          <div className="aspect-square rounded-xl bg-zinc-800/50 ring-1 ring-white/8" />
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {["Ouvert ce soir", "Cuisine moderne", "Centre-ville"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-300"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3.5 ring-1 ring-white/[0.04]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ce soir</p>
          <p className="mt-1 text-sm font-medium text-white">Dégustation vins du Léman</p>
          <p className="mt-0.5 text-xs text-slate-500">20h00 · places limitées</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3.5 ring-1 ring-white/[0.04]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          <p className="mt-1 text-sm font-medium text-white">Carte courte · saison</p>
          <p className="mt-0.5 text-xs text-slate-500">Entrée · plat · dessert</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-3.5">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300/80" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Adresse & carte</p>
          <p className="text-sm text-slate-200">Rue du Lac 14 · 1007 Lausanne</p>
          <p className="mt-1 text-xs text-slate-500">Carte interactive · itinéraire</p>
        </div>
      </div>

      <button
        type="button"
        className="relative mt-6 w-full rounded-full bg-gradient-to-b from-[#fafafa] to-[#e4e4e7] py-3.5 text-sm font-semibold text-[#09090b] shadow-[0_16px_48px_-20px_rgba(255,255,255,0.35)] transition hover:brightness-105"
      >
        Réserver une table
      </button>
    </div>
  );
}

function Hero() {
  const r = useReducedMotion();
  return (
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-30%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_10%,rgba(59,130,246,0.08),transparent_45%),linear-gradient(180deg,#05060a_0%,#0a0c14_35%,#05060a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[20%] h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 rounded-full bg-indigo-600/12 blur-[120px]"
      />

      <div className={`relative ${shell.max} ${shell.section}`}>
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={r ? false : { opacity: 0, y: 14 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/90 sm:text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_14px_rgba(165,180,252,0.8)]" />
            Nouvelle génération pour restaurants
          </motion.div>

          <motion.h1
            initial={r ? false : { opacity: 0, y: 32 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.05 }}
            className="mt-8 text-balance text-[clamp(1.875rem,5.5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:mt-10"
          >
            Les clients ne veulent plus chercher un restaurant.
          </motion.h1>
          <motion.p
            initial={r ? false : { opacity: 0, y: 28 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.1 }}
            className="mt-4 text-balance text-[clamp(1.875rem,5.5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-300 sm:mt-5"
          >
            Ils veulent le comprendre et réserver immédiatement.
          </motion.p>

          <motion.p
            initial={r ? false : { opacity: 0, y: 20 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.14 }}
            className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:mt-10 sm:text-lg"
          >
            ZenGrow transforme la manière dont les restaurants se présentent en ligne : une page
            rapide, moderne et pensée pour convertir un visiteur en réservation en quelques secondes.
          </motion.p>

          <motion.div
            initial={r ? false : { opacity: 0, y: 16 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#fafafa] to-[#e4e4e7] px-8 py-4 text-sm font-semibold text-[#09090b] shadow-[0_20px_50px_-24px_rgba(255,255,255,0.35)] transition hover:brightness-105"
            >
              Créer ma page restaurant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Voir la démo
            </a>
          </motion.div>
        </div>

        <div className="relative mx-auto mt-20 max-w-6xl lg:mt-28">
          <div className="relative min-h-[min(520px,70vh)] sm:min-h-[560px] lg:min-h-[600px]">
            <motion.div
              animate={float(0)}
              className="absolute left-0 top-[2%] z-20 hidden md:left-[-2%] md:block lg:left-0"
            >
              <FloatCard icon={Calendar} title="Nouvelle réservation" body="Table 2 · ce soir · 20h00" />
            </motion.div>
            <motion.div
              animate={float(0.8)}
              className="absolute right-0 top-[4%] z-20 hidden md:right-[-2%] md:block lg:right-0"
            >
              <FloatCard icon={Star} title="Avis Google programmé" body="Envoi après la visite" />
            </motion.div>
            <motion.div
              animate={float(1.6)}
              className="absolute bottom-[12%] left-0 z-20 hidden lg:bottom-[14%] lg:left-[-4%] lg:block"
            >
              <FloatCard icon={Users} title="Client ajouté" body="Camille D. · 2 visites" />
            </motion.div>
            <motion.div
              animate={float(2.2)}
              className="absolute bottom-[10%] right-0 z-20 hidden lg:bottom-[12%] lg:right-[-4%] lg:block"
            >
              <FloatCard icon={UtensilsCrossed} title="Menu spécial publié" body="Week-end" />
            </motion.div>
            <motion.div
              animate={float(1)}
              className="absolute left-1/2 top-0 z-10 w-[min(100%,280px)] -translate-x-1/2 md:top-[-2%]"
            >
              <FloatCard
                icon={Smartphone}
                title="Mobile-first"
                body="Pensé pour réserver vite"
                className="mx-auto"
              />
            </motion.div>

            <motion.div
              initial={r ? false : { opacity: 0, y: 40, scale: 0.97 }}
              animate={r ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.95, ease, delay: 0.25 }}
              className="relative z-30 flex justify-center px-2 pt-14 md:pt-10"
            >
              <HeroCenterMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
      {children}
    </p>
  );
}

function SectionProblem() {
  const v = useInView();
  const steps = [
    { label: "Lien", Icon: ExternalLink, desc: "Un clic" },
    { label: "Photos", Icon: ImageIcon, desc: "Premier regard" },
    { label: "Menu", Icon: ScrollText, desc: "L’offre" },
    { label: "Réservation", Icon: Calendar, desc: "L’action" },
  ] as const;

  return (
    <section id="probleme" className={`relative scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell.section}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(99,102,241,0.06),transparent_50%)]"
      />
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Contexte</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Aujourd’hui, tout va plus vite.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base leading-relaxed text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Quand quelqu’un découvre un restaurant, il prend une décision presque immédiatement.
          </motion.p>
          <motion.div variants={fadeUp(0.05)} className="space-y-2 text-slate-300">
            <p>Il ouvre un lien.</p>
            <p>Regarde quelques photos.</p>
            <p>Jette un œil au menu.</p>
            <p>Observe l’ambiance.</p>
          </motion.div>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.08)} className="relative mt-16">
          <div
            className={`${card.base} border-white/[0.1] p-8 md:p-12 lg:p-14`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 40px 100px -48px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(99,102,241,0.08),transparent_60%)]"
            />
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {steps.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={false}
                  variants={fadeUp(i * 0.05)}
                  className="group relative rounded-2xl border border-white/[0.08] bg-black/30 p-6 ring-1 ring-white/[0.04] transition hover:border-indigo-400/25 hover:bg-white/[0.03]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition group-hover:bg-indigo-500/15">
                    <s.Icon className="h-5 w-5 text-indigo-200/90" strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-semibold text-white">{s.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                  {i < steps.length - 1 ? (
                    <div
                      aria-hidden
                      className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-white/20 to-transparent lg:block"
                    />
                  ) : null}
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUp(0.12)}
              className="relative mt-12 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.07] px-6 py-8 text-center md:px-10"
            >
              <p className="text-lg font-medium text-slate-300 md:text-xl">
                Puis il réserve…{" "}
                <span className="font-semibold text-white">ou passe au suivant.</span>
              </p>
            </motion.div>

            <motion.p
              variants={fadeUp(0.15)}
              className="relative mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-500 md:text-base"
            >
              Le problème, c’est que beaucoup de restaurants utilisent encore des expériences pensées
              comme des vitrines classiques, alors que les comportements ont complètement changé.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MockPhone() {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border border-white/15 bg-gradient-to-b from-zinc-800/80 to-zinc-950/90 p-2.5 shadow-2xl ring-1 ring-white/10">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0b10]">
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-[10px] font-medium text-slate-500">9:41</span>
            <span className="h-4 w-16 rounded-full bg-black/50" />
          </div>
          <div className="mt-3 space-y-3 px-4 pb-5">
            <div className="aspect-[16/11] rounded-xl bg-gradient-to-br from-zinc-700/80 to-indigo-950/40 ring-1 ring-white/10" />
            <p className="text-lg font-semibold text-white">Restaurant Luna</p>
            <div className="flex flex-wrap gap-1.5">
              {["Ambiance", "Menu", "Carte"].map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400"
                >
                  {x}
                </span>
              ))}
            </div>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-xs text-slate-400">
              <Clock className="mb-1 inline h-3 w-3" /> Mar–Dim · 12h–14h30 · 19h–23h
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-white py-2.5 text-xs font-semibold text-black"
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
      <div className="rounded-t-xl border border-b-0 border-white/12 bg-zinc-900/90 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mx-auto flex-1 rounded-md border border-white/10 bg-black/40 py-1 text-center text-[10px] text-slate-500">
            luna.zengrow.app
          </div>
        </div>
      </div>
      <div className="rounded-b-2xl border border-white/12 bg-[#0a0b10] p-5 shadow-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-700/80 to-indigo-950/40 ring-1 ring-white/10" />
          <div className="flex flex-col justify-center gap-3">
            <p className="text-xl font-semibold text-white">Restaurant Luna</p>
            <p className="text-sm text-slate-500">Photos · ambiance · informations clés</p>
            <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-xs text-slate-400">
              <MapPin className="mb-1 inline h-3.5 w-3.5 text-indigo-300" /> Rue du Lac 14 · Lausanne
            </div>
            <button
              type="button"
              className="w-full max-w-[200px] rounded-full bg-white py-2.5 text-xs font-semibold text-black"
            >
              Réserver une table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionExperience() {
  const v = useInView();
  return (
    <section
      id="experience"
      className={`relative scroll-mt-24 border-y border-white/[0.06] bg-[#07080f]/80 py-24 md:py-32 lg:py-40 ${shell.section}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vw,480px)] w-[min(80vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/08 blur-[100px]"
      />
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Expérience</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Une page pensée pour décider vite.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-base leading-relaxed text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            ZenGrow a été conçu pour cette nouvelle manière de découvrir un restaurant.
          </motion.p>
          <motion.p variants={fadeUp(0.05)}>
            Chaque page va droit à l’essentiel. Le client arrive et comprend immédiatement :
          </motion.p>
          <motion.ul variants={fadeUp(0.08)} className="mx-auto max-w-md space-y-2 text-left text-slate-300">
            {["le style du restaurant", "l’ambiance", "les informations importantes", "comment réserver"].map(
              (x) => (
                <li key={x} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-400/80" strokeWidth={2.5} />
                  {x}
                </li>
              ),
            )}
          </motion.ul>
          <motion.p variants={fadeUp(0.1)} className="font-medium text-slate-200">
            Tout est fluide. Rapide. Pensé mobile dès le départ.
          </motion.p>
          <motion.p variants={fadeUp(0.12)}>
            Parce qu’aujourd’hui, chaque seconde d’hésitation compte.
          </motion.p>
        </motion.div>

        <motion.div
          id="demo"
          {...v}
          variants={fadeUp(0.14)}
          className="relative mt-16 scroll-mt-28 lg:mt-20"
        >
          <div
            className={`${card.base} border-white/[0.1] p-6 md:p-10 lg:p-12`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(165,180,252,0.1), 0 48px 120px -50px rgba(0,0,0,0.95)",
            }}
          >
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <Monitor className="h-3.5 w-3.5" /> Bureau
              </span>
            </div>
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
              <motion.div variants={fadeUp(0.02)} className="flex justify-center">
                <MockPhone />
              </motion.div>
              <motion.div variants={fadeUp(0.06)} className="min-w-0">
                <MockDesktop />
              </motion.div>
            </div>
            <p className="mt-10 text-center text-sm text-slate-500">
              Une mini-page restaurant moderne : photos, menu, ambiance, horaires, adresse et réservation
              rapide — le tout cohérent avec votre établissement.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const modules = [
  {
    title: "Réservations",
    text: "Chaque demande arrive dans votre espace, prête à être traitée.",
    Icon: Calendar,
  },
  {
    title: "Clients",
    text: "Profils enrichis automatiquement à chaque visite.",
    Icon: Users,
  },
  {
    title: "Campagnes",
    text: "Lancez une mise en avant en quelques secondes.",
    Icon: Megaphone,
  },
  {
    title: "Événements",
    text: "Publiez soirées, brunchs et dates clés instantanément.",
    Icon: PartyPopper,
  },
  {
    title: "Menus spéciaux",
    text: "Cartes limitées et offres saisonnières en ligne sans friction.",
    Icon: ChefHat,
  },
  {
    title: "Avis Google",
    text: "Automatisez les demandes d’avis après la visite.",
    Icon: Star,
  },
] as const;

function SectionPlatform() {
  const v = useInView();
  return (
    <section id="plateforme" className={`relative scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell.section}`}>
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Plateforme</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Derrière une page simple, une vraie plateforme.
          </h2>
        </motion.div>

        <motion.p
          {...v}
          variants={fadeUp(0.05)}
          className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-slate-400 md:text-lg"
        >
          ZenGrow ne sert pas uniquement à afficher un restaurant.
        </motion.p>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-8 max-w-3xl space-y-4 text-center text-base text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>Toute l’expérience est connectée derrière une seule interface :</motion.p>
          <motion.ul variants={fadeUp(0.05)} className="mx-auto max-w-xl space-y-3 text-left">
            {[
              "les réservations arrivent directement dans l’espace du restaurant",
              "les clients sont enregistrés automatiquement",
              "les campagnes peuvent être lancées en quelques secondes",
              "les événements, menus spéciaux et nouveautés peuvent être publiés instantanément",
              "les avis Google peuvent être automatisés après la visite",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-slate-300">
                <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-400/70" strokeWidth={2.5} />
                {line}
              </li>
            ))}
          </motion.ul>
          <motion.p variants={fadeUp(0.1)} className="font-medium text-slate-200">
            Le restaurant garde enfin le contrôle total de son expérience en ligne.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {modules.map((m, i) => (
            <motion.article
              key={m.title}
              variants={fadeUp(i * 0.04)}
              className={`${card.base} ${card.hover} group p-8`}
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px -40px rgba(0,0,0,0.85)",
              }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition group-hover:bg-indigo-500/15 group-hover:ring-indigo-400/20">
                <m.Icon className="h-5 w-5 text-indigo-100/90" strokeWidth={1.6} />
              </div>
              <h3 className="text-lg font-semibold text-white">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionLiving() {
  const v = useInView();
  const items = [
    "Nouvelle carte publiée",
    "Soirée spéciale ajoutée",
    "Offre du week-end en ligne",
    "Photos mises à jour",
    "Menu spécial activé",
  ] as const;

  return (
    <section
      className={`relative border-y border-white/[0.06] bg-[#06070c]/90 py-24 md:py-32 lg:py-40 ${shell.section}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-blue-600/06 blur-[100px]"
      />
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Présence vivante</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Un restaurant n’est jamais figé. Sa présence en ligne non plus.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base leading-relaxed text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Une nouvelle carte. Une soirée spéciale. Une offre du week-end. Une nouvelle ambiance.
          </motion.p>
          <motion.p variants={fadeUp(0.05)} className="font-medium text-slate-200">
            Avec ZenGrow, tout peut évoluer immédiatement.
          </motion.p>
          <motion.div variants={fadeUp(0.08)} className="space-y-2 text-slate-500">
            <p>Sans devoir contacter quelqu’un.</p>
            <p>Sans attendre plusieurs jours.</p>
            <p>Sans dépendre d’une agence pour modifier un simple détail.</p>
          </motion.div>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {items.map((t, i) => (
            <motion.div
              key={t}
              variants={fadeUp(i * 0.04)}
              className={`${card.base} ${card.hover} flex min-w-[200px] items-center gap-3 px-6 py-4 sm:min-w-[240px]`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/20">
                <Zap className="h-4 w-4 text-emerald-200/90" />
              </span>
              <span className="text-sm font-medium text-slate-200">{t}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.p {...v} variants={fadeUp(0.15)} className="mt-12 text-center text-sm text-slate-600">
          Votre page restaurant évolue en temps réel depuis l’espace ZenGrow.
        </motion.p>
      </div>
    </section>
  );
}

function SectionDuo() {
  const v = useInView();
  const client = [
    "Découvre le restaurant",
    "Comprend l’ambiance",
    "Réserve rapidement",
    "Reçoit une confirmation",
  ] as const;
  const resto = [
    "Reçoit la réservation",
    "Enregistre le client",
    "Lance une campagne",
    "Automatise les avis Google",
  ] as const;

  return (
    <section className={`relative py-24 md:py-32 lg:py-40 ${shell.section}`}>
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Deux mondes alignés</Kicker>
          <h2 className="mx-auto mt-5 max-w-4xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Une expérience moderne pour les clients. Une gestion simple pour le restaurant.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-base text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            D’un côté, les clients découvrent, comprennent et réservent plus rapidement.
          </motion.p>
          <motion.div variants={fadeUp(0.05)}>
            <p className="text-slate-300">De l’autre, le restaurant centralise :</p>
            <ul className="mx-auto mt-4 max-w-md space-y-2 text-left text-slate-400">
              {["ses réservations", "ses clients", "ses campagnes", "ses événements", "ses avis Google"].map(
                (x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-indigo-400/80">·</span> {x}
                  </li>
                ),
              )}
            </ul>
          </motion.div>
          <motion.p variants={fadeUp(0.08)} className="font-medium text-slate-200">
            Dans une seule plateforme claire, moderne et pensée pour le quotidien.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          <motion.div
            variants={fadeUp(0, 28)}
            className={`${card.base} relative overflow-hidden border-indigo-400/15 p-8 md:p-10`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(129,140,248,0.12), inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px_-48px rgba(99,102,241,0.15)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(99,102,241,0.12),transparent_55%)]"
            />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/70">
              Côté client
            </p>
            <ul className="relative mt-8 space-y-5">
              {client.map((line) => (
                <li key={line} className="flex gap-4 text-base text-slate-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp(0.06, 28)}
            className={`${card.base} p-8 md:p-10`}
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 100px_-48px rgba(0,0,0,0.9)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Côté restaurant
            </p>
            <ul className="mt-8 space-y-5">
              {resto.map((line) => (
                <li key={line} className="flex gap-4 text-base text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
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

function SectionForWho() {
  const v = useInView();
  return (
    <section
      id="pour-qui"
      className={`relative scroll-mt-24 border-y border-white/[0.06] bg-[#07080f]/75 py-24 md:py-32 lg:py-40 ${shell.section}`}
    >
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Pour qui</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Une page principale ou une expérience de réservation plus moderne.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-base leading-relaxed text-slate-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Certains restaurants utilisent ZenGrow comme présence principale en ligne.
          </motion.p>
          <motion.p variants={fadeUp(0.05)}>
            D’autres l’utilisent pour moderniser leur expérience de réservation actuelle, même s’ils
            ont déjà un site.
          </motion.p>
          <motion.p variants={fadeUp(0.08)} className="font-medium text-slate-200">
            Dans les deux cas, le résultat reste le même :
          </motion.p>
          <motion.div variants={fadeUp(0.1)} className="space-y-1 text-slate-300">
            <p>Une expérience plus rapide.</p>
            <p>Plus moderne.</p>
            <p>Plus connectée.</p>
          </motion.div>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.article
            variants={fadeUp(0, 24)}
            className={`${card.base} ${card.hover} p-8 md:p-10 lg:p-12`}
            style={{
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px_-40px rgba(0,0,0,0.88)",
            }}
          >
            <h3 className="text-xl font-semibold text-white md:text-2xl">Restaurants sans site moderne</h3>
            <p className="mt-5 text-base leading-relaxed text-slate-500">
              ZenGrow peut devenir leur page principale : claire, rapide, professionnelle et orientée
              réservation.
            </p>
          </motion.article>
          <motion.article
            variants={fadeUp(0.06, 24)}
            className={`${card.base} ${card.hover} border-indigo-400/15 p-8 md:p-10 lg:p-12`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(165,180,252,0.14), 0 32px 80px_-40px rgba(99,102,241,0.12)",
            }}
          >
            <h3 className="text-xl font-semibold text-white md:text-2xl">Restaurants avec un site existant</h3>
            <p className="mt-5 text-base leading-relaxed text-slate-500">
              ZenGrow peut devenir leur page de réservation moderne, connectée à une vraie plateforme
              de gestion.
            </p>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function SectionVision() {
  const v = useInView();
  return (
    <section className={`relative overflow-hidden py-28 md:py-36 lg:py-44 ${shell.section}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(99,102,241,0.11),transparent_65%)]"
      />
      <motion.div
        {...v}
        variants={fadeUp(0, 30)}
        className={`relative ${shell.max} text-center`}
      >
        <Kicker>Vision</Kicker>
        <h2 className="mx-auto mt-6 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.85rem] lg:leading-[1.15]">
          Le web restaurant évolue enfin.
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
          Pendant longtemps, les restaurants avaient simplement besoin « d’un site ».
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Aujourd’hui, ils ont surtout besoin d’une expérience rapide, mobile et connectée à leurs
          clients.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-white md:text-lg">
          C’est exactement ce que ZenGrow apporte.
        </p>
      </motion.div>
    </section>
  );
}

const pricingList = [
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

function SectionPricing() {
  const v = useInView();
  return (
    <section id="tarifs" className={`relative scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell.section}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100vw,560px)] w-[min(100vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]"
      />
      <div className={`relative ${shell.max}`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>Tarifs</Kicker>
          <h2 className="mx-auto mt-5 max-w-3xl text-center text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
            Une nouvelle génération d’expérience restaurant.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.08)}
          className="relative mx-auto mt-14 max-w-lg"
        >
          <div
            className={`${card.base} relative overflow-hidden border-white/[0.12] p-8 md:p-12`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(165,180,252,0.2), 0 0 100px -20px rgba(99,102,241,0.25), 0 48px 120px -40px rgba(0,0,0,0.95)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-20%,rgba(129,140,248,0.15),transparent_55%)]"
            />
            <div className="relative text-center">
              <p className="text-sm text-slate-400">
                Une page restaurant moderne, une réservation fluide et une plateforme complète pour
                gérer l’essentiel au quotidien.
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-center gap-2">
                <span className="text-5xl font-semibold tracking-tight text-white md:text-6xl">39 CHF</span>
                <span className="pb-2 text-lg font-medium text-slate-500">/ mois</span>
              </div>
              <p className="mt-8 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Inclus
              </p>
              <ul className="relative mt-4 space-y-3 text-left">
                {pricingList.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="relative mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#fafafa] to-[#e4e4e7] py-4 text-sm font-semibold text-[#09090b] shadow-[0_20px_50px_-24px_rgba(255,255,255,0.3)] transition hover:brightness-105"
              >
                Créer ma page restaurant
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-center text-xs text-slate-600">
                Simple à mettre en place. Simple à gérer.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionFinal() {
  const v = useInView();
  return (
    <section className={`relative pb-20 pt-4 md:pb-28 ${shell.section}`}>
      <motion.div
        {...v}
        variants={fadeUp(0, 24)}
        className={`relative ${shell.max} overflow-hidden rounded-[2rem] border border-white/[0.1] bg-gradient-to-br from-indigo-600/[0.15] via-[#0a0b12] to-blue-600/[0.1] px-6 py-16 text-center md:px-16 md:py-24`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
        />
        <h2 className="relative mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.65rem]">
          Les restaurants changent.
          <span className="mt-2 block text-slate-300">L’expérience en ligne aussi.</span>
        </h2>
        <p className="relative mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
          Offrez à vos clients une manière plus rapide, plus claire et plus moderne de découvrir
          votre restaurant et de réserver.
        </p>
        <Link
          href="/signup"
          className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#09090b] transition hover:bg-slate-100"
        >
          Créer ma page restaurant
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}

const faqs = [
  {
    q: "ZenGrow remplace-t-il mon site actuel ?",
    a: "Pas nécessairement. ZenGrow peut être votre page principale ou une page de réservation connectée à votre site existant.",
  },
  {
    q: "Combien de temps pour être en ligne ?",
    a: "Cela dépend de vos contenus ; en général, une mise en ligne soignée prend de quelques jours à quelques semaines.",
  },
  {
    q: "Mes clients doivent-ils créer un compte ?",
    a: "Non. Ils réservent depuis la page publique, sans friction inutile.",
  },
  {
    q: "Puis-je modifier ma page moi-même ?",
    a: "Oui. Cartes, photos, événements et offres évoluent depuis votre espace restaurateur.",
  },
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04] sm:px-6 sm:py-5"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition ${
            open ? "rotate-180" : ""
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
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 sm:px-6 sm:pb-6">{a}</p>
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
    <section id="faq" className={`relative scroll-mt-24 py-24 md:py-32 ${shell.section}`}>
      <div className={`${shell.max} grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16`}>
        <motion.div {...v} variants={fadeUp()}>
          <Kicker>FAQ</Kicker>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-5 text-slate-500">
            Une autre question ?{" "}
            <a href="#contact" className="text-white underline-offset-4 hover:underline">
              Contact
            </a>
          </p>
        </motion.div>
        <motion.div {...v} variants={stagger} className="space-y-3">
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
    <section id="contact" className={`scroll-mt-24 border-t border-white/[0.06] py-20 ${shell.section}`}>
      <div className={`${shell.max} text-center`}>
        <motion.div {...v} variants={fadeUp()}>
          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <p className="mt-4 text-slate-500">Écrivez-nous pour une démo ou un accompagnement.</p>
          <a
            href="mailto:support@zengrow.app"
            className="mt-6 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20"
          >
            support@zengrow.app
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const links = [
    { href: "#experience", label: "Expérience" },
    { href: "#plateforme", label: "Plateforme" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "#contact", label: "Contact" },
    { href: "/login", label: "Connexion" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#030305] py-16 md:py-20">
      <div className={`${shell.max} flex flex-col gap-12 md:flex-row md:items-start md:justify-between ${shell.section}`}>
        <div>
          <p className="text-lg font-semibold text-white">ZenGrow</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
            La nouvelle génération d’expérience en ligne pour restaurants.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-3">
          {links.map((l) => (
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
      <p className={`${shell.max} mt-12 text-center text-xs text-slate-700 md:text-left ${shell.section}`}>
        © {new Date().getFullYear()} ZenGrow
      </p>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className={`${font.variable} min-h-screen overflow-x-hidden bg-[#05060a] font-[family-name:var(--font-zg-landing),system-ui,sans-serif] text-slate-100 antialiased selection:bg-indigo-500/30`}
    >
      <Header />
      <main>
        <Hero />
        <SectionProblem />
        <SectionExperience />
        <SectionPlatform />
        <SectionLiving />
        <SectionDuo />
        <SectionForWho />
        <SectionVision />
        <SectionPricing />
        <SectionFinal />
        <SectionFaq />
        <SectionContact />
      </main>
      <Footer />
    </div>
  );
}
