"use client";

/**
 * Landing ZenGrow — style produit type Liner / Linear : fond clair, UI abstraite (CSS),
 * pas de photos ni mockups photo-réalistes. Accent configurable (ici bleu, pas vert).
 */

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  LayoutGrid,
  Menu as MenuIcon,
  MessageSquare,
  Sparkles,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay = 0, y = 20): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: EASE, delay },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

function useInView(amount = 0.12) {
  const r = useReducedMotion();
  return {
    initial: r ? false : "hidden",
    whileInView: r ? undefined : "show",
    viewport: { once: true, amount },
  } as const;
}

function floatY(delay: number, amp = 6) {
  return {
    y: [0, -amp, 0],
    transition: {
      duration: 5 + delay * 0.35,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

const shell = "px-5 sm:px-8 lg:px-12";
const maxW = "mx-auto max-w-[1120px]";

const nav = [
  { href: "#produit", label: "Produit" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

const tokens = {
  "--lp-accent": "#2563eb",
  "--lp-accent-hover": "#1d4ed8",
  "--lp-accent-mid": "#3b82f6",
  "--lp-accent-soft": "rgba(37, 99, 235, 0.1)",
  "--lp-accent-glow": "rgba(37, 99, 235, 0.22)",
  "--lp-fg": "#0a0a0b",
  "--lp-muted": "#71717a",
  "--lp-border": "#e4e4e7",
  "--lp-surface": "#fafafa",
} as const;

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[200] border-b border-[var(--lp-border)] bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className={`relative flex h-14 items-center sm:h-[3.25rem] ${maxW} ${shell}`}>
        <Link href="/" className="relative z-10 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[var(--lp-fg)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--lp-fg)] text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </span>
          ZenGrow
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-[var(--lp-muted)] transition hover:bg-[var(--lp-surface)] hover:text-[var(--lp-fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-[13px] font-medium text-[var(--lp-muted)] transition hover:text-[var(--lp-fg)] sm:inline"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden items-center gap-1 rounded-full bg-[var(--lp-accent)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_28px_-6px_var(--lp-accent-glow)] transition hover:bg-[var(--lp-accent-hover)] sm:inline-flex"
          >
            Créer ma page
            <ArrowUpRight className="h-3.5 w-3.5 opacity-90" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--lp-border)] bg-white text-[var(--lp-fg)] lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--lp-border)] bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-0.5">
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[var(--lp-fg)]"
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-[var(--lp-muted)]" />
              </a>
            ))}
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 flex justify-center rounded-full bg-[var(--lp-accent)] py-3 text-sm font-semibold text-white"
            >
              Créer ma page
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroDecor() {
  const r = useReducedMotion();
  const icons = [Sparkles, Calendar, Users, MessageSquare] as const;
  const positions = [
    "left-[8%] top-[18%] hidden md:flex",
    "right-[10%] top-[22%] hidden md:flex",
    "left-[12%] bottom-[26%] hidden lg:flex",
    "right-[14%] bottom-[22%] hidden lg:flex",
  ];
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[28%] h-[min(100vw,520px)] w-[min(100vw,520px)] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, var(--lp-accent-glow) 0%, transparent 68%)",
          filter: "blur(48px)",
        }}
        animate={r ? undefined : { opacity: [0.45, 0.75, 0.45], scale: [1, 1.03, 1] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`pointer-events-none absolute ${positions[i]} h-11 w-11 items-center justify-center rounded-2xl border border-[var(--lp-border)] bg-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]`}
          animate={r ? undefined : floatY(i * 0.6, 5 + i)}
        >
          <Icon className="h-5 w-5 text-[var(--lp-accent)]" strokeWidth={1.5} />
        </motion.div>
      ))}
    </>
  );
}

function Hero() {
  const r = useReducedMotion();
  return (
    <section className="relative overflow-hidden pt-14 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
      <HeroDecor />
      <div className={`relative ${maxW} ${shell}`}>
        <div className="mx-auto max-w-[820px] text-center">
          <motion.h1
            initial={r ? false : { opacity: 0, y: 28 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="text-balance text-[clamp(2.25rem,5.8vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--lp-fg)]"
          >
            De la découverte à la réservation en quelques secondes.
          </motion.h1>
          <motion.p
            initial={r ? false : { opacity: 0, y: 20 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.06 }}
            className="mx-auto mt-6 max-w-[560px] text-pretty text-[17px] leading-relaxed text-[var(--lp-muted)] sm:text-lg"
          >
            ZenGrow est une page restaurant et une plateforme légère : le client comprend tout de suite, réserve sans
            friction, et vous gardez la main sur le contenu.
          </motion.p>
          <motion.div
            initial={r ? false : { opacity: 0, y: 16 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.12 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-8 py-4 text-[14px] font-semibold text-white shadow-[0_14px_40px_-12px_var(--lp-accent-glow)] transition hover:bg-[var(--lp-accent-hover)] active:scale-[0.98]"
            >
              Créer ma page restaurant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#produit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lp-border)] bg-white px-8 py-4 text-[14px] font-semibold text-[var(--lp-fg)] shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] transition hover:border-zinc-300 hover:bg-[var(--lp-surface)]"
            >
              Voir le produit
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PlaygroundMock() {
  const r = useReducedMotion();
  const v = useInView(0.08);
  return (
    <section id="produit" className={`scroll-mt-20 pb-16 pt-2 sm:pb-20 lg:pb-24 ${shell}`}>
      <div className={maxW}>
        <motion.div
          {...v}
          variants={fadeUp(0, 16)}
          className="mx-auto max-w-[720px]"
        >
          <div className="flex flex-col gap-2 rounded-2xl border border-[var(--lp-border)] bg-white p-1.5 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:pr-1.5 sm:pl-5">
            <span className="hidden shrink-0 text-[13px] text-[var(--lp-muted)] sm:inline">Décrivez votre restaurant</span>
            <input
              type="text"
              readOnly
              placeholder="Ambiance contemporaine, menu saison, 40 couverts…"
              className="min-h-12 w-full rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface)] px-4 py-3 text-[14px] text-[var(--lp-fg)] outline-none placeholder:text-zinc-400 sm:border-0 sm:bg-transparent sm:py-3.5"
            />
            <button
              type="button"
              className="shrink-0 rounded-xl bg-[var(--lp-accent)] px-6 py-3.5 text-[13px] font-semibold text-white transition hover:bg-[var(--lp-accent-hover)] sm:rounded-full"
            >
              Générer l’aperçu
            </button>
          </div>
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.1, 24)}
          transition={{ duration: 0.85 }}
          className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-[var(--lp-border)] bg-white shadow-[0_32px_100px_-36px_rgba(0,0,0,0.14)]"
        >
          <div className="flex h-10 items-center gap-2 border-b border-[var(--lp-border)] bg-[var(--lp-surface)] px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
            <span className="ml-3 flex-1 truncate rounded-md border border-[var(--lp-border)] bg-white py-1 text-center text-[11px] text-[var(--lp-muted)]">
              studio.zengrow.app / aperçu
            </span>
          </div>

          <div className="grid min-h-[420px] lg:min-h-[460px] lg:grid-cols-[200px_1fr_220px]">
            <aside className="hidden border-r border-[var(--lp-border)] bg-[var(--lp-surface)] p-4 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lp-muted)]">Pages</p>
              <ul className="mt-4 space-y-1">
                {["Accueil", "Menu", "Réservation", "Événements"].map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
                      i === 0 ? "bg-white text-[var(--lp-fg)] shadow-sm ring-1 ring-[var(--lp-border)]" : "text-[var(--lp-muted)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--lp-accent)] opacity-0" style={{ opacity: i === 0 ? 1 : 0.35 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-[var(--lp-border)] bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lp-muted)]">Statut</p>
                <p className="mt-2 text-[13px] font-semibold text-[var(--lp-fg)]">Brouillon</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    className="h-full rounded-full bg-[var(--lp-accent)]"
                    initial={r ? false : { width: "0%" }}
                    whileInView={r ? undefined : { width: "72%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                  />
                </div>
              </div>
            </aside>

            <main className="relative flex flex-col border-b border-[var(--lp-border)] lg:border-b-0 lg:border-r">
              <div className="flex flex-1 flex-col gap-4 p-5 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                  <div className="flex aspect-[16/10] flex-col justify-end rounded-2xl bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/80 p-6 ring-1 ring-[var(--lp-border)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lp-muted)]">Bloc hero</p>
                    <p className="mt-3 max-w-[280px] text-[22px] font-semibold leading-tight tracking-tight text-[var(--lp-fg)]">
                      CRÉEZ VOTRE PLUS BELLE TABLE
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="h-24 rounded-2xl bg-zinc-100 ring-1 ring-[var(--lp-border)]" />
                    <div className="h-24 rounded-2xl bg-zinc-100 ring-1 ring-[var(--lp-border)]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[55, 72, 48, 88, 64, 76].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col justify-end rounded-xl bg-zinc-100 ring-1 ring-[var(--lp-border)]"
                      style={{ height: `${Math.max(48, h * 0.9)}px` }}
                      initial={r ? false : { opacity: 0, scaleY: 0.6 }}
                      whileInView={r ? undefined : { opacity: 1, scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.5, ease: EASE }}
                    />
                  ))}
                </div>
              </div>
            </main>

            <aside className="flex flex-col gap-4 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lp-muted)]">Propriétés</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-[var(--lp-muted)]">Titre</p>
                  <div className="mt-1.5 h-9 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)] px-3 text-[13px] leading-9 text-[var(--lp-fg)]">
                    Soirée dégustation
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[var(--lp-muted)]">CTA</p>
                  <div className="mt-1.5 flex h-9 items-center rounded-lg border border-[var(--lp-border)] bg-white px-3 text-[13px] font-medium text-[var(--lp-accent)]">
                    Réserver
                  </div>
                </div>
              </div>
              <div className="mt-auto rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4">
                <p className="text-[11px] font-semibold text-[var(--lp-fg)]">Aperçu mobile</p>
                <div className="mt-3 mx-auto w-[120px] space-y-2 rounded-2xl border border-[var(--lp-border)] bg-white p-3 shadow-sm">
                  <div className="h-16 rounded-lg bg-zinc-100" />
                  <div className="h-2 w-3/4 rounded bg-zinc-200" />
                  <div className="h-8 w-full rounded-full bg-[var(--lp-accent)]/90" />
                </div>
              </div>
            </aside>
          </div>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[12px] text-[var(--lp-muted)]"
        >
          <motion.span variants={fadeUp(0, 8)} className="inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--lp-accent)]" strokeWidth={1.5} />
            Commentaires invités
          </motion.span>
          <motion.span variants={fadeUp(0, 8)} className="inline-flex items-center gap-2">
            <Undo2 className="h-4 w-4 text-[var(--lp-accent)]" strokeWidth={1.5} />
            Historique d’édition raisonnable
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

function SectionFeatures() {
  const v = useInView();
  const cards: { title: string; desc: string; body: ReactNode }[] = [
    {
      title: "Page qui respire",
      desc: "Hiérarchie lisible, sections modulables, rendu propre sur tous les écrans.",
      body: (
        <div className="space-y-2">
          <div className="h-3 w-2/3 rounded bg-zinc-200" />
          <div className="h-3 w-full rounded bg-zinc-200/80" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-14 rounded-lg bg-white ring-1 ring-[var(--lp-border)]" />
            <div className="h-14 rounded-lg bg-white ring-1 ring-[var(--lp-border)]" />
          </div>
        </div>
      ),
    },
    {
      title: "Réservation fluide",
      desc: "Parcours court : date, couverts, confirmation — sans pages interminables.",
      body: (
        <div className="space-y-2">
          {["Ven 14 · 20h", "Sam 15 · 12h30"].map((t) => (
            <div
              key={t}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[11px] font-medium ring-1 ring-[var(--lp-border)]"
            >
              <span className="text-[var(--lp-fg)]">{t}</span>
              <span className="text-[var(--lp-accent)]">Libre</span>
            </div>
          ))}
          <div className="mt-2 h-9 w-full rounded-full bg-[var(--lp-accent)]/90" />
        </div>
      ),
    },
    {
      title: "Pilotage central",
      desc: "Réservations, clients et campagnes dans une interface unique et calme.",
      body: (
        <>
          <div className="flex gap-2">
            {[40, 65, 45, 80].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <div
                  className="rounded-t-md bg-[var(--lp-accent)]/25 ring-1 ring-[var(--lp-accent)]/15"
                  style={{ height: `${h}px` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-medium text-[var(--lp-muted)]">7 jours · réservations</p>
        </>
      ),
    },
  ];

  return (
    <section id="fonctionnalites" className={`scroll-mt-20 border-t border-[var(--lp-border)] bg-[var(--lp-surface)] py-20 md:py-28 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="mx-auto max-w-[640px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lp-muted)]">Fonctionnalités</p>
          <h2 className="mt-4 text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--lp-fg)]">
            Tout ce qu’il faut pour convertir, sans complexité.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--lp-muted)]">
            Des blocs clairs, une réservation directe, une base client qui se construit au fil des visites.
          </p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <motion.article
              key={c.title}
              variants={fadeUp(0, 18)}
              className="group flex flex-col rounded-[1.75rem] border border-[var(--lp-border)] bg-white p-7 shadow-[0_20px_70px_-32px_rgba(0,0,0,0.1)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-28px_rgba(0,0,0,0.12)] md:p-8"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lp-accent-soft)] text-[var(--lp-accent)] ring-1 ring-[var(--lp-accent)]/10">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-[var(--lp-fg)]">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--lp-muted)]">{c.desc}</p>
              <div className="mt-6 min-h-[140px] flex-1 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-4">{c.body}</div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const v = useInView();
  return (
    <section className={`py-12 ${shell}`}>
      <div className={maxW}>
        <motion.p {...v} variants={fadeUp(0, 12)} className="text-center text-[12px] font-medium text-[var(--lp-muted)]">
          Conçu pour les équipes qui veulent un rendu produit, pas un site figé.
        </motion.p>
        <motion.div
          {...v}
          variants={fadeUp(0.06, 12)}
          className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale"
        >
          {["Lausanne", "Genève", "Zürich", "Berne"].map((city) => (
            <span key={city} className="text-[15px] font-semibold tracking-tight text-zinc-400">
              {city}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionPricing() {
  const v = useInView();
  const plans = [
    {
      name: "Essentiel",
      price: "39",
      blurb: "Page, menu, réservations illimitées, mobile.",
      features: ["Page restaurant", "Réservations illimitées", "Menu & galerie", "Personnalisation", "Support"],
      highlight: false,
    },
    {
      name: "Growth",
      price: "69",
      blurb: "Marketing, automatisations et données pour accélérer.",
      features: ["Tout Essentiel", "Campagnes", "Récupération clients", "Automatisations", "Avis Google", "Analytics", "E-mail"],
      highlight: true,
    },
  ] as const;

  return (
    <section id="tarifs" className={`scroll-mt-20 border-t border-[var(--lp-border)] py-20 md:py-28 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--lp-muted)]">Tarifs</p>
          <h2 className="mt-4 text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--lp-fg)]">
            Simple et transparent
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-[var(--lp-muted)]">Deux offres en CHF / mois. Pas de surprise.</p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-12 grid gap-5 lg:grid-cols-2">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              variants={fadeUp(i * 0.05, 20)}
              className={`relative flex flex-col rounded-[1.75rem] border bg-white p-8 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.1)] md:p-10 ${
                p.highlight ? "border-[var(--lp-accent)]/35 ring-2 ring-[var(--lp-accent)]/15" : "border-[var(--lp-border)]"
              }`}
            >
              {p.highlight ? (
                <span className="absolute right-6 top-6 rounded-full bg-[var(--lp-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--lp-accent)]">
                  Populaire
                </span>
              ) : null}
              <p className="text-[15px] font-semibold text-[var(--lp-fg)]">{p.name}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[clamp(2.5rem,4vw,3.25rem)] font-semibold tracking-tight text-[var(--lp-fg)]">{p.price}</span>
                <span className="text-[15px] text-[var(--lp-muted)]">CHF / mois</span>
              </div>
              <p className="mt-3 text-[14px] text-[var(--lp-muted)]">{p.blurb}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[14px] text-[var(--lp-fg)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--lp-accent-soft)]">
                      <Check className="h-3 w-3 text-[var(--lp-accent)]" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-10 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition ${
                  p.highlight
                    ? "bg-[var(--lp-accent)] text-white shadow-[0_12px_36px_-12px_var(--lp-accent-glow)] hover:bg-[var(--lp-accent-hover)]"
                    : "border border-[var(--lp-border)] text-[var(--lp-fg)] hover:bg-[var(--lp-surface)]"
                }`}
              >
                Choisir {p.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta() {
  const v = useInView();
  return (
    <section className={`pb-20 pt-4 md:pb-28 ${shell}`}>
      <motion.div
        {...v}
        variants={fadeUp(0, 16)}
        className={`${maxW} relative overflow-hidden rounded-[1.75rem] border border-[var(--lp-border)] bg-gradient-to-br from-white via-[var(--lp-surface)] to-white px-6 py-16 text-center shadow-[0_32px_100px_-40px_rgba(0,0,0,0.12)] md:px-14 md:py-20`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--lp-accent-soft), transparent 55%)",
          }}
        />
        <h2 className="relative text-balance text-[clamp(1.65rem,3vw,2.35rem)] font-semibold tracking-[-0.03em] text-[var(--lp-fg)]">
          Prêt pour une expérience qui ressemble à un vrai produit ?
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-[var(--lp-muted)]">
          Publiez une page moderne, gardez le contrôle depuis un seul endroit.
        </p>
        <Link
          href="/signup"
          className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-8 py-4 text-[14px] font-semibold text-white shadow-[0_14px_40px_-12px_var(--lp-accent-glow)] transition hover:bg-[var(--lp-accent-hover)]"
        >
          Créer ma page restaurant
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--lp-border)] bg-white py-14 md:py-16">
      <div className={`${maxW} flex flex-col items-center justify-between gap-8 md:flex-row ${shell}`}>
        <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--lp-fg)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--lp-fg)] text-white">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </span>
          ZenGrow
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-[13px] font-medium text-[var(--lp-muted)]">
          {nav.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-[var(--lp-fg)]">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="transition hover:text-[var(--lp-fg)]">
            Connexion
          </Link>
        </nav>
        <p className="text-[12px] text-[var(--lp-muted)]">© {new Date().getFullYear()} ZenGrow</p>
      </div>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-[var(--lp-fg)] antialiased selection:bg-[var(--lp-accent-soft)]"
      style={tokens as unknown as CSSProperties}
    >
      <Navbar />
      <main>
        <Hero />
        <PlaygroundMock />
        <LogoStrip />
        <SectionFeatures />
        <SectionPricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
