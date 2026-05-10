"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
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
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  MailCheck,
  Menu as MenuIcon,
  MessageSquareWarning,
  Send,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-sans",
});

const easeOut = [0.22, 1, 0.36, 1] as const;

const cx = {
  page: "min-h-screen overflow-x-hidden antialiased selection:bg-teal-400/25 selection:text-white",
  ink: "text-slate-100",
  muted: "text-slate-400",
  subtle: "text-slate-500",
  border: "border-white/[0.08]",
  card: "rounded-3xl border border-white/[0.10] bg-white/[0.03] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] backdrop-blur-xl",
  cardHover:
    "transition duration-300 hover:-translate-y-1 hover:border-teal-400/25 hover:bg-white/[0.05] hover:shadow-[0_28px_90px_-40px_rgba(45,212,191,0.18)]",
  glow: "pointer-events-none absolute rounded-full blur-3xl opacity-60",
  gradientText: "bg-gradient-to-r from-teal-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent",
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
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
};

function useViewMotion() {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : "hidden",
    whileInView: reduce ? undefined : "show",
    viewport: { once: true, amount: 0.2 },
  } as const;
}

function SectionGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className={`${cx.glow} -left-32 top-0 h-[420px] w-[420px] bg-teal-500/20`}
      />
      <div
        className={`${cx.glow} -right-24 top-1/3 h-[360px] w-[360px] bg-cyan-500/15`}
      />
      <div
        className={`${cx.glow} left-1/3 bottom-0 h-[280px] w-[480px] bg-emerald-500/10`}
      />
    </div>
  );
}

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#avis-clients", label: "Avis clients" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
] as const;

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070b14]/75 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/Zengrow-logo.png"
            alt="ZenGrow"
            width={132}
            height={36}
            className="h-6 w-auto object-contain brightness-0 invert sm:h-7"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
            className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_-16px_rgba(45,212,191,0.55)] transition hover:brightness-110 sm:inline-flex"
          >
            Commencer
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
            className="overflow-hidden border-t border-white/[0.06] bg-[#070b14]/95 md:hidden"
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 py-3 text-sm font-semibold text-slate-950"
              >
                Commencer
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function HeroFloatingReservation() {
  return (
    <div
      className={`${cx.card} relative overflow-hidden p-4 sm:p-5`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(45,212,191,0.12), 0 32px 80px -48px rgba(0,0,0,0.9)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300/90">
            Réservation en direct
          </span>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-400">
          À l&apos;instant
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Table pour 4
          </p>
          <p className="mt-1 text-sm text-slate-400">Ven. · 20:30 · Salle</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/15 to-cyan-500/10 px-3 py-2 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-teal-200/80">
            Statut
          </p>
          <p className="text-sm font-semibold text-white">Nouvelle</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t, i) => (
          <div
            key={t}
            className={`rounded-xl py-2 text-center text-xs font-semibold ${
              i === 3
                ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950"
                : "bg-white/[0.04] text-slate-300"
            }`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSideChip({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "teal" | "emerald" | "cyan";
}) {
  const ring =
    tone === "teal"
      ? "from-teal-400/20 to-transparent"
      : tone === "emerald"
        ? "from-emerald-400/20 to-transparent"
        : "from-cyan-400/20 to-transparent";
  return (
    <div
      className={`${cx.card} max-w-[220px] p-3.5 sm:max-w-[240px] sm:p-4`}
      style={{
        boxShadow: "0 24px 60px -40px rgba(0,0,0,0.85)",
      }}
    >
      <div
        className={`mb-2 inline-flex rounded-full bg-gradient-to-r ${ring} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-200`}
      >
        {title}
      </div>
      <p className="text-sm font-medium leading-snug text-white">{subtitle}</p>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const float = (delay: number) =>
    reduce
      ? undefined
      : {
          y: [0, -8, 0],
          transition: {
            duration: 6 + delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
            delay,
          },
        };

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(34,211,238,0.08),transparent_50%),linear-gradient(180deg,#070b14_0%,#0a1020_45%,#070b14_100%)]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/5 px-3.5 py-1.5 text-xs font-semibold text-teal-200/90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          Réservations · Satisfaction · Avis Google
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: easeOut, delay: 0.05 }}
          className="mt-8 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]"
        >
          La satisfaction client ne se voit pas.
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut, delay: 0.1 }}
          className={`mx-auto mt-5 max-w-2xl text-balance text-xl font-medium sm:text-2xl ${cx.gradientText}`}
        >
          ZenGrow la transforme en valeur visible.
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut, delay: 0.14 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          Centralisez vos réservations, automatisez vos confirmations et récoltez plus d&apos;avis
          Google après chaque visite — sans perdre du temps au téléphone ou dans les messages.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.18 }}
          className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_50px_-20px_rgba(45,212,191,0.55)] transition hover:brightness-110"
          >
            Essayer ZenGrow
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#fonctionnalites"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white transition hover:border-teal-400/30 hover:bg-white/[0.07]"
          >
            Voir les fonctionnalités
          </a>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(520px,70vw)] w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/15 blur-[100px]"
        />

        <div className="relative flex min-h-[420px] items-center justify-center sm:min-h-[460px]">
          <motion.div
            animate={float(0)}
            className="absolute left-0 top-[8%] z-20 hidden sm:block lg:left-[2%]"
          >
            <HeroSideChip
              tone="teal"
              title="Google"
              subtitle="Avis Google envoyé automatiquement après la visite."
            />
          </motion.div>

          <motion.div
            animate={float(0.4)}
            className="absolute right-0 top-[10%] z-20 hidden sm:block lg:right-[2%]"
          >
            <HeroSideChip
              tone="emerald"
              title="Confirmé"
              subtitle="Table confirmée — message clair au client."
            />
          </motion.div>

          <motion.div
            animate={float(0.8)}
            className="absolute bottom-[6%] left-[4%] z-20 hidden md:block"
          >
            <div
              className={`${cx.card} flex items-center gap-3 px-4 py-3`}
              style={{
                boxShadow: "0 20px 60px -36px rgba(16,185,129,0.35)",
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-white">+32%</p>
                <p className="text-xs text-slate-400">d&apos;avis clients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={float(1.2)}
            className="absolute bottom-[8%] right-[6%] z-20 hidden md:block"
          >
            <div className={`${cx.card} px-4 py-3`}>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Star className="h-3.5 w-3.5 text-amber-300" fill="currentColor" />
                Satisfaction
              </div>
              <p className="mt-1 text-sm font-semibold text-white">Mesurable après chaque service</p>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: easeOut, delay: 0.2 }}
            className="relative z-30 w-full max-w-[340px] px-2 sm:max-w-[380px]"
          >
            <HeroFloatingReservation />
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
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
          <span className="h-px w-8 bg-teal-400/40" />
          {kicker}
        </span>
      ) : null}
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.08]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function WhySection() {
  const v = useViewMotion();
  const cards = [
    {
      title: "Réservations centralisées",
      text: "Toutes vos demandes arrivent au même endroit, avec un suivi clair des tables, horaires et statuts.",
      Icon: Layers,
    },
    {
      title: "Confirmations automatiques",
      text: "Vos clients reçoivent une confirmation claire, professionnelle et personnalisée après leur réservation.",
      Icon: Send,
    },
    {
      title: "Avis Google intelligents",
      text: "Après une visite confirmée, ZenGrow envoie automatiquement une demande d’avis au bon moment.",
      Icon: Star,
    },
  ] as const;

  return (
    <section
      id="pourquoi"
      className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Pourquoi ZenGrow"
            title="Vos réservations ne devraient pas finir dans un carnet."
            subtitle="Entre les appels, les messages Instagram, les confirmations oubliées et les clients qui ne laissent jamais d’avis, un restaurant peut vite perdre du temps et de la visibilité."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {cards.map((card, i) => {
            const CardIcon = card.Icon;
            return (
            <motion.article
              key={card.title}
              variants={fadeUp(i * 0.02)}
              className={`${cx.card} ${cx.cardHover} p-7`}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-400/10 text-teal-200">
                <CardIcon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.text}</p>
            </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  const v = useViewMotion();
  const before = [
    "Réservations par téléphone ou messages",
    "Confirmations manuelles",
    "Oublis possibles",
    "Peu d’avis Google",
    "Aucun suivi clair de la satisfaction",
  ] as const;
  const after = [
    "Réservations en ligne 24/7",
    "Confirmations automatiques",
    "Suivi clair des clients",
    "Avis Google déclenchés après la visite",
    "Feedback privé si l’expérience était négative",
  ] as const;

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Comparaison"
            title="Avant ZenGrow / Avec ZenGrow"
            subtitle="Le même service — une expérience plus fluide pour vos clients et votre équipe."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 lg:grid-cols-2 lg:gap-6"
        >
          <motion.div
            variants={fadeUp(0, 28)}
            className={`${cx.card} border-white/[0.06] bg-slate-950/40 p-7 sm:p-8`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                <X className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Avant
                </p>
                <p className="text-lg font-semibold text-white">Charge & friction</p>
              </div>
            </div>
            <ul className="mt-8 space-y-4">
              {before.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-400">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
                    <X className="h-3 w-3" />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={fadeUp(0.06, 28)}
            className={`${cx.card} relative overflow-hidden border-teal-400/20 bg-gradient-to-br from-teal-500/10 via-[#0a1020] to-cyan-500/10 p-7 sm:p-8`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/80">
                  Avec ZenGrow
                </p>
                <p className="text-lg font-semibold text-white">Clarté & réputation</p>
              </div>
            </div>
            <ul className="relative mt-8 space-y-4">
              {after.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const featureItems = [
  {
    icon: Calendar,
    title: "Réservations en ligne",
    text: "Permettez à vos clients de réserver une table à tout moment, depuis une page simple et professionnelle.",
  },
  {
    icon: CalendarClock,
    title: "Gestion des disponibilités",
    text: "Définissez vos horaires, capacités et règles de réservation directement depuis votre espace restaurateur.",
  },
  {
    icon: MailCheck,
    title: "Confirmation automatique",
    text: "Réduisez les oublis grâce à des emails de confirmation clairs et personnalisés.",
  },
  {
    icon: LayoutTemplate,
    title: "Page personnalisable",
    text: "Ajoutez votre logo, vos couleurs, votre description et vos liens sociaux pour une page à votre image.",
  },
  {
    icon: Star,
    title: "Avis Google automatisés",
    text: "Après une visite confirmée, ZenGrow peut envoyer automatiquement une demande d’avis Google.",
  },
  {
    icon: MessageSquareWarning,
    title: "Feedback privé",
    text: "Si un client est insatisfait, son retour peut vous être envoyé en privé avant qu’il ne devienne un mauvais avis public.",
  },
  {
    icon: Users,
    title: "Base clients",
    text: "Gardez une trace des réservations et des clients pour mieux comprendre votre activité.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    text: "Suivez vos réservations, vos avis et vos retours clients depuis une interface claire.",
  },
] as const;

function FeaturesSection() {
  const v = useViewMotion();

  return (
    <section
      id="fonctionnalites"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#060914]/80 px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Fonctionnalités"
            title="Tout ce qu’il faut pour mieux gérer vos réservations."
            subtitle="Une interface simple pour gagner du temps, améliorer l’expérience client et renforcer votre visibilité en ligne."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        >
          {featureItems.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp(i * 0.02)}
              className={`${cx.card} ${cx.cardHover} group p-6`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-teal-200 transition group-hover:bg-teal-400/15">
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Configurez votre restaurant",
    text: "Ajoutez vos horaires, vos disponibilités, votre logo, vos couleurs et les informations de votre établissement.",
  },
  {
    n: "02",
    title: "Recevez vos réservations",
    text: "Vos clients réservent depuis votre page en ligne, et vous gardez le contrôle depuis votre tableau de bord.",
  },
  {
    n: "03",
    title: "Transformez les visites en avis",
    text: "Après une visite confirmée, ZenGrow automatise la demande d’avis Google et vous aide à capter les retours clients.",
  },
] as const;

function HowSection() {
  const v = useViewMotion();

  return (
    <section
      id="comment-ca-marche"
      className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Comment ça marche"
            title="Simple à mettre en place. Puissant au quotidien."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5"
        >
          {steps.map((s, i) => (
            <motion.article
              key={s.n}
              variants={fadeUp(i * 0.03)}
              className={`${cx.card} relative overflow-hidden p-8`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl"
              />
              <p className="text-5xl font-semibold leading-none text-white/10">{s.n}</p>
              <h3 className="relative mt-6 text-xl font-semibold text-white">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function DifferentiationSection() {
  const v = useViewMotion();
  const zg = [
    "Réservation en ligne",
    "Confirmation automatique",
    "Suivi client",
    "Demande d’avis Google",
    "Feedback privé en cas d’expérience négative",
    "Image professionnelle",
  ] as const;
  const classic = [
    "Simple formulaire",
    "Peu ou pas d’automatisation",
    "Aucun suivi après la visite",
    "Avis laissés au hasard",
    "Mauvaise expérience difficile à rattraper",
  ] as const;

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Différenciation"
            title="ZenGrow ne s’arrête pas à la réservation."
            subtitle="La plupart des outils se contentent de prendre une réservation. ZenGrow va plus loin : il vous aide à améliorer votre réputation en ligne après chaque service."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 lg:grid-cols-2 lg:gap-6"
        >
          <motion.div
            variants={fadeUp(0)}
            className={`${cx.card} border-teal-400/25 bg-gradient-to-b from-teal-500/10 to-transparent p-7 sm:p-8`}
          >
            <h3 className="text-lg font-semibold text-white">ZenGrow</h3>
            <ul className="mt-6 space-y-3">
              {zg.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" strokeWidth={2.5} />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp(0.05)}
            className={`${cx.card} p-7 sm:p-8`}
          >
            <h3 className="text-lg font-semibold text-slate-300">Outils classiques</h3>
            <ul className="mt-6 space-y-3">
              {classic.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-slate-500">
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

function SocialSection() {
  const v = useViewMotion();
  const quotes = [
    "Moins d’appels, plus de réservations claires.",
    "Une image plus professionnelle dès la première interaction.",
    "Un meilleur suivi des clients après leur passage.",
  ] as const;

  return (
    <section
      id="avis-clients"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#060914]/60 px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            title="Ce que les restaurateurs recherchent avec ZenGrow"
            subtitle="Formulations indicatives — pas de témoignages clients réels pour le moment."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-4 md:grid-cols-3 lg:gap-5"
        >
          {quotes.map((q, i) => (
            <motion.blockquote
              key={q}
              variants={fadeUp(i * 0.02)}
              className={`${cx.card} ${cx.cardHover} p-7`}
            >
              <Star className="h-4 w-4 text-teal-300" fill="currentColor" />
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-200">&ldquo;{q}&rdquo;</p>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const pricingFeatures = [
  "Réservations en ligne",
  "Page publique personnalisable",
  "Tableau de bord restaurateur",
  "Confirmations automatiques",
  "Automatisation des avis Google",
  "Feedback privé",
  "Support inclus",
] as const;

function PricingSection() {
  const v = useViewMotion();

  return (
    <section id="tarifs" className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <SectionGlow />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div {...v} variants={fadeUp()}>
          <SectionHeading
            kicker="Tarifs"
            title="Un tarif simple pour un outil complet."
            subtitle="Pour les restaurants qui veulent professionnaliser leurs réservations, gagner du temps et améliorer leur réputation en ligne."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.08)}
          className={`${cx.card} relative mx-auto mt-12 overflow-hidden border-teal-400/25 bg-gradient-to-b from-white/[0.06] to-transparent p-8 sm:p-10`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(45,212,191,0.12),transparent_60%)]"
          />
          <div className="relative">
            <p className="text-sm font-medium text-teal-200/90">ZenGrow</p>
            <div className="mt-4 flex flex-wrap items-end justify-center gap-2">
              <span className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                69 CHF
              </span>
              <span className="pb-2 text-base font-medium text-slate-400">/ mois</span>
            </div>
            <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
              {pricingFeatures.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400/20 text-teal-200">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_50px_-24px_rgba(45,212,191,0.5)] transition hover:brightness-110 sm:w-auto sm:px-12"
            >
              Commencer avec ZenGrow
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-slate-500">Sans engagement. Mise en place simple.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Est-ce que ZenGrow remplace mon système actuel de réservation ?",
    a: "ZenGrow peut être utilisé comme système principal ou en complément de vos habitudes actuelles. L’objectif est de centraliser et simplifier vos réservations.",
  },
  {
    q: "Est-ce que les clients doivent créer un compte ?",
    a: "Non. Les clients peuvent réserver simplement depuis votre page publique.",
  },
  {
    q: "Est-ce que je peux personnaliser ma page de réservation ?",
    a: "Oui. Vous pouvez ajouter votre logo, vos couleurs, votre description et vos liens sociaux.",
  },
  {
    q: "Comment fonctionne l’automatisation des avis Google ?",
    a: "Après une visite confirmée, ZenGrow peut envoyer automatiquement un message au client pour l’inviter à laisser un avis Google.",
  },
  {
    q: "Que se passe-t-il si un client est mécontent ?",
    a: "ZenGrow peut orienter les retours négatifs vers un feedback privé, afin que le restaurant puisse comprendre le problème avant qu’il ne devienne public.",
  },
  {
    q: "Est-ce adapté aux petits restaurants ?",
    a: "Oui. ZenGrow est pensé pour rester simple, même pour les établissements qui n’ont pas d’équipe administrative.",
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
    <div className={`overflow-hidden rounded-2xl border ${cx.border} bg-white/[0.03]`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04] sm:px-6 sm:py-5"
      >
        <span className="text-sm font-semibold leading-snug text-white sm:text-base">{q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-teal-200 transition ${
            open ? "rotate-180 bg-teal-400/15" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
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
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400 sm:px-6 sm:pb-6">{a}</p>
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
    <section
      id="contact"
      className="relative scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <motion.div {...v} variants={fadeUp()}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
              <span className="h-px w-8 bg-teal-400/40" />
              FAQ & contact
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Des réponses courtes, sans jargon.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              Une question précise ? Écrivez-nous : nous répondons vite.
            </p>
            <a
              href="mailto:support@zengrow.app"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/30"
            >
              support@zengrow.app
            </a>
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

function FinalCta() {
  const v = useViewMotion();

  return (
    <section className="relative px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <motion.div
        {...v}
        variants={fadeUp(0, 24)}
        className={`relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-teal-400/20 bg-gradient-to-br from-teal-500/15 via-[#0a1020] to-cyan-500/10 px-6 py-16 text-center sm:px-12 sm:py-20`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"
        />
        <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          Transformez chaque réservation en opportunité.
        </h2>
        <p className="relative mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Avec ZenGrow, vos réservations deviennent plus simples, vos clients mieux suivis et votre
          réputation plus visible.
        </p>
        <Link
          href="/signup"
          className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_20px_60px_-30px_rgba(255,255,255,0.35)] transition hover:brightness-95"
        >
          Essayer ZenGrow
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  const footLinks = [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Contact", href: "#contact" },
    { label: "Connexion", href: "/login" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#050814] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={128}
              height={36}
              className="h-6 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Réservations, satisfaction client et avis Google pour les restaurants modernes.
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
      className={`${sans.variable} ${cx.page} font-[family-name:var(--font-zg-sans),system-ui,sans-serif] text-slate-100`}
      style={{
        background:
          "linear-gradient(180deg, #070b14 0%, #0a1020 40%, #070b14 100%)",
      }}
    >
      <Header />
      <main>
        <Hero />
        <WhySection />
        <BeforeAfterSection />
        <FeaturesSection />
        <HowSection />
        <DifferentiationSection />
        <SocialSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
