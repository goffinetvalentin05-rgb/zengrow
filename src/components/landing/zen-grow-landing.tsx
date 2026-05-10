"use client";

/**
 * Landing ZenGrow — structure visuelle proche du template Nicepay (SaaS premium) :
 * hero centré + téléphone + cartes flottantes, preuve sociale, grilles workflow,
 * section split, diagramme circulaire, tarifs. UI entièrement en CSS (pas d’images).
 */

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  CreditCard,
  LayoutGrid,
  Link2,
  Menu as MenuIcon,
  Settings2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay = 0, y = 22): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE, delay },
    },
  };
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function useInView(amount = 0.12) {
  const r = useReducedMotion();
  return {
    initial: r ? false : "hidden",
    whileInView: r ? undefined : "show",
    viewport: { once: true, amount },
  } as const;
}

function floatSlow(delay: number, amp = 10) {
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
const maxW = "mx-auto max-w-[1180px]";

const nav = [
  { href: "#accueil", label: "Accueil" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
] as const;

const tokens = {
  "--np-accent": "#7c3aed",
  "--np-accent-hover": "#6d28d9",
  "--np-accent-light": "#a78bfa",
  "--np-accent-soft": "rgba(124, 58, 237, 0.12)",
  "--np-accent-softer": "rgba(124, 58, 237, 0.06)",
  "--np-glow": "rgba(124, 58, 237, 0.18)",
  "--np-glow-blue": "rgba(59, 130, 246, 0.12)",
  "--np-fg": "#18181b",
  "--np-muted": "#71717a",
  "--np-border": "#e4e4e7",
  "--np-surface": "#fafafa",
  "--np-card": "#ffffff",
} as const;

const cardClass =
  "rounded-[1.75rem] border border-[var(--np-border)] bg-[var(--np-card)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]";

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[200] border-b border-[var(--np-border)]/80 bg-white/90 backdrop-blur-xl">
      <div className={`relative flex h-14 items-center sm:h-[3.35rem] ${maxW} ${shell}`}>
        <Link href="/" className="relative z-10 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[var(--np-fg)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--np-accent)] text-white shadow-md shadow-[var(--np-glow)]">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </span>
          ZenGrow
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-[var(--np-muted)] transition hover:bg-[var(--np-surface)] hover:text-[var(--np-fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-[13px] font-medium text-[var(--np-muted)] transition hover:text-[var(--np-fg)] sm:inline"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden items-center gap-1 rounded-full bg-[var(--np-accent)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_30px_-8px_var(--np-glow)] transition hover:bg-[var(--np-accent-hover)] sm:inline-flex"
          >
            Essai gratuit
            <ArrowUpRight className="h-3.5 w-3.5 opacity-90" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--np-border)] bg-white lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--np-border)] bg-white px-5 py-4 lg:hidden">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[var(--np-fg)]"
            >
              {l.label}
              <ChevronRight className="h-4 w-4 text-[var(--np-muted)]" />
            </a>
          ))}
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="mt-2 flex justify-center rounded-full bg-[var(--np-accent)] py-3 text-sm font-semibold text-white"
          >
            Essai gratuit
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function FloatHistoryCard() {
  const rows = [
    { label: "Table 4 · ce soir", amt: "+2", pos: true },
    { label: "Menu dégustation", amt: "−120", pos: false },
    { label: "Résa. weekend", amt: "+8", pos: true },
  ];
  return (
    <div className={`${cardClass} w-[min(100%,260px)] p-4 sm:w-[270px] sm:p-5`}>
      <p className="text-[11px] font-semibold text-[var(--np-fg)]">Historique</p>
      <div className="mt-3 flex gap-1 rounded-lg bg-[var(--np-surface)] p-1">
        {["Jour", "Sem.", "Mois"].map((t, i) => (
          <span
            key={t}
            className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-semibold ${
              i === 0 ? "bg-white text-[var(--np-accent)] shadow-sm" : "text-[var(--np-muted)]"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between rounded-xl border border-[var(--np-border)]/80 bg-[var(--np-surface)]/50 px-3 py-2"
          >
            <span className="text-[11px] font-medium text-[var(--np-fg)]">{r.label}</span>
            <span className={`text-[11px] font-semibold tabular-nums ${r.pos ? "text-emerald-600" : "text-red-500"}`}>
              {r.amt} CHF
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatIncomeCard() {
  const bars = [40, 65, 45, 80, 55, 70, 90];
  return (
    <div className={`${cardClass} w-[min(100%,260px)] p-4 sm:w-[270px] sm:p-5`}>
      <p className="text-[11px] font-semibold text-[var(--np-fg)]">Revenus</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--np-fg)]">12’480 CHF</p>
      <p className="text-[10px] font-medium text-emerald-600">+18% vs. semaine dernière</p>
      <div className="mt-4 flex h-20 items-end gap-1">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-[var(--np-accent-soft)]" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[min(100%,280px)]">
      <div
        className="rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-900 p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
        style={{ boxShadow: "0 50px 100px -20px rgba(0,0,0,0.35), 0 0 80px -20px var(--np-glow)" }}
      >
        <div className="overflow-hidden rounded-[2rem] bg-white">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[11px] font-medium tabular-nums text-[var(--np-muted)]">9:41</span>
            <div className="h-6 w-24 rounded-full bg-zinc-100" />
          </div>
          <div className="space-y-4 px-4 pb-8 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--np-muted)]">Solde</p>
                <p className="text-2xl font-bold tracking-tight text-[var(--np-fg)]">8’240 CHF</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--np-accent-soft)]">
                <TrendingUp className="h-5 w-5 text-[var(--np-accent)]" strokeWidth={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-[var(--np-surface)] p-3 ring-1 ring-[var(--np-border)]">
                <p className="text-[9px] font-medium text-[var(--np-muted)]">Réservations</p>
                <p className="text-lg font-bold text-[var(--np-fg)]">142</p>
              </div>
              <div className="rounded-2xl bg-[var(--np-surface)] p-3 ring-1 ring-[var(--np-border)]">
                <p className="text-[9px] font-medium text-[var(--np-muted)]">Taux</p>
                <p className="text-lg font-bold text-[var(--np-fg)]">94%</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--np-border)] bg-white p-3">
              <p className="text-[10px] font-semibold text-[var(--np-fg)]">Activité récente</p>
              {[1, 2, 3].map((i) => (
                <div key={i} className="mt-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[var(--np-accent-soft)]" />
                  <div className="min-w-0 flex-1">
                    <div className="h-2 w-3/4 max-w-[120px] rounded bg-zinc-200" />
                    <div className="mt-1 h-1.5 w-1/2 rounded bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-[var(--np-accent)] py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-[var(--np-glow)]"
            >
              Voir le détail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const r = useReducedMotion();
  return (
    <section id="accueil" className="relative scroll-mt-20 overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[32%] h-[min(120vw,560px)] w-[min(120vw,560px)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--np-glow) 0%, var(--np-glow-blue) 35%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[30%] h-[min(100vw,480px)] w-[min(100vw,480px)] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-200/40 via-blue-100/30 to-transparent blur-3xl"
        animate={r ? undefined : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className={`relative ${maxW} ${shell}`}>
        <div className="mx-auto max-w-[900px] text-center">
          <motion.h1
            initial={r ? false : { opacity: 0, y: 28 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="text-balance text-[clamp(2rem,5.5vw,3.65rem)] font-bold leading-[1.08] tracking-[-0.038em] text-[var(--np-fg)]"
          >
            Renforcez votre contrôle digital avec{" "}
            <span className="relative inline-block align-middle">
              <span className="rounded-full bg-[var(--np-accent)] px-4 py-1.5 text-[0.92em] font-bold text-white shadow-lg shadow-[var(--np-glow)] sm:px-5 sm:py-2">
                ZenGrow
              </span>
            </span>
          </motion.h1>
          <motion.p
            initial={r ? false : { opacity: 0, y: 18 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
            className="mx-auto mt-6 max-w-[560px] text-pretty text-[17px] leading-relaxed text-[var(--np-muted)] sm:text-lg"
          >
            Une page restaurant moderne et une plateforme claire : vos clients réservent en un geste, vous pilotez
            réservations, clients et campagnes au même endroit.
          </motion.p>
        </div>

        <div className="relative mx-auto mt-14 min-h-[420px] max-w-[1000px] sm:mt-16 lg:mt-20 lg:min-h-[380px]">
          <motion.div
            animate={r ? undefined : floatSlow(0, 11)}
            className="absolute left-0 top-[8%] z-20 hidden xl:left-[2%] xl:block"
          >
            <FloatHistoryCard />
          </motion.div>
          <motion.div
            animate={r ? undefined : floatSlow(1.2, 10)}
            className="absolute right-0 top-[10%] z-20 hidden xl:right-[2%] xl:block"
          >
            <FloatIncomeCard />
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 px-2 xl:hidden">
            <FloatHistoryCard />
            <FloatIncomeCard />
          </div>

          <motion.div
            initial={r ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={r ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, ease: EASE, delay: 0.15 }}
            className="relative z-10 mx-auto flex justify-center pt-8 xl:pt-4"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const v = useInView();
  const logos = ["Logoipsum", "Brandmark", "Hexagon", "Nordic", "Vertex", "Pulse"];
  return (
    <section className={`border-t border-[var(--np-border)] bg-[var(--np-surface)]/50 py-14 md:py-16 ${shell}`}>
      <div className={maxW}>
        <motion.p {...v} variants={fadeUp(0, 14)} className="text-center text-[13px] font-semibold text-[var(--np-muted)]">
          Plus de 2 000 établissements nous font confiance
        </motion.p>
        <motion.div
          {...v}
          variants={fadeUp(0.08, 12)}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14"
        >
          {logos.map((name) => (
            <div
              key={name}
              className="flex h-8 items-center justify-center opacity-40 grayscale transition hover:opacity-60"
            >
              <span className="text-[15px] font-bold tracking-tight text-zinc-500">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowCards() {
  const v = useInView();
  return (
    <section id="workflow" className={`scroll-mt-20 py-20 md:py-28 lg:py-32 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="mx-auto max-w-[720px] text-center">
          <h2 className="text-balance text-[clamp(1.75rem,3.2vw,2.65rem)] font-bold tracking-[-0.035em] text-[var(--np-fg)]">
            Comment notre plateforme simplifie votre quotidien
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--np-muted)]">
            De l’inscription à la mise en ligne, tout est pensé pour gagner du temps et convertir.
          </p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-14 grid gap-6 lg:grid-cols-2">
          <motion.article
            variants={fadeUp(0, 20)}
            className={`${cardClass} flex flex-col p-8 md:p-10`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--np-accent-soft)] text-[var(--np-accent)]">
              <Sparkles className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-xl font-bold tracking-tight text-[var(--np-fg)]">Inscrivez-vous et personnalisez</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--np-muted)]">
              Choisissez votre style, vos sections et votre ton. La page reflète votre restaurant en quelques minutes.
            </p>
            <div className="mt-8 rounded-2xl border border-[var(--np-border)] bg-gradient-to-b from-[var(--np-surface)] to-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--np-muted)]">Clients totaux</span>
                <span className="rounded-full bg-[var(--np-accent)] px-3 py-1 text-[11px] font-bold text-white">20k+</span>
              </div>
              <div className="mt-4 flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-violet-200 to-violet-400"
                    style={{ zIndex: 6 - i }}
                  />
                ))}
              </div>
            </div>
          </motion.article>

          <motion.article
            variants={fadeUp(0.06, 20)}
            className={`${cardClass} flex flex-col p-8 md:p-10`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--np-accent-soft)] text-[var(--np-accent)]">
              <Link2 className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-xl font-bold tracking-tight text-[var(--np-fg)]">Reliez vos canaux</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--np-muted)]">
              Réservations, avis et campagnes communiquent entre eux — moins de copier-coller, plus de cohérence.
            </p>
            <div className="mt-8 flex min-h-[140px] items-center justify-center rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)]/80 p-6">
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--np-border)]" />
                <div className="absolute inset-3 rounded-full border border-[var(--np-accent)]/30 bg-[var(--np-accent-softer)]" />
                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--np-accent)] text-white shadow-lg">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <div className="absolute -right-1 top-2 h-8 w-8 rounded-full bg-white shadow-md ring-1 ring-[var(--np-border)]" />
                <div className="absolute -left-1 bottom-4 h-8 w-8 rounded-full bg-white shadow-md ring-1 ring-[var(--np-border)]" />
                <div className="absolute right-6 -bottom-1 h-8 w-8 rounded-full bg-white shadow-md ring-1 ring-[var(--np-border)]" />
              </div>
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function SplitFeatures() {
  const v = useInView();
  const mini = [
    { Icon: BarChart3, t: "Données lisibles", d: "Indicateurs clairs pour ajuster menu et créneaux." },
    { Icon: Shield, t: "Sécurité & confiance", d: "Flux de réservation fiable, conforme à votre image." },
    { Icon: Settings2, t: "Personnalisation", d: "Blocs et contenus modifiables à la volée." },
    { Icon: CreditCard, t: "Paiements & offres", d: "Mettez en avant menus et événements simplement." },
  ];
  return (
    <section
      id="fonctionnalites"
      className={`scroll-mt-20 border-t border-[var(--np-border)] bg-[var(--np-surface)]/40 py-20 md:py-28 lg:py-32 ${shell}`}
    >
      <div className={`${maxW} grid items-center gap-14 lg:grid-cols-2 lg:gap-16`}>
        <motion.div {...v} variants={fadeUp()}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--np-accent)]">Fonctionnalités clés</p>
          <h2 className="mt-4 text-balance text-[clamp(1.65rem,2.8vw,2.4rem)] font-bold tracking-[-0.035em] text-[var(--np-fg)]">
            Boostez votre restaurant avec ZenGrow
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--np-muted)]">
            Tout ce dont vous avez besoin pour être visible, bookable et pro — sans usine à gaz.
          </p>
          <motion.div {...v} variants={stagger} className="mt-10 grid gap-4 sm:grid-cols-2">
            {mini.map((item) => (
              <motion.div
                key={item.t}
                variants={fadeUp(0, 14)}
                className="rounded-2xl border border-[var(--np-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--np-accent-soft)] text-[var(--np-accent)]">
                  <item.Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <p className="mt-3 text-[14px] font-bold text-[var(--np-fg)]">{item.t}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--np-muted)]">{item.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.1, 24)} className="relative flex justify-center lg:justify-end">
          <div className={`relative w-full max-w-[320px] ${cardClass} overflow-hidden p-3`}>
            <div className="rounded-2xl bg-white ring-1 ring-[var(--np-border)]">
              <div className="border-b border-[var(--np-border)] bg-[var(--np-surface)] px-4 py-3">
                <div className="mx-auto h-1.5 w-20 rounded-full bg-zinc-200" />
              </div>
              <div className="space-y-4 p-4">
                <div className="flex gap-3">
                  <div className="h-16 flex-1 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-100" />
                  <div className="flex w-24 flex-col gap-2">
                    <div className="h-7 rounded-lg bg-zinc-100" />
                    <div className="h-7 rounded-lg bg-zinc-100" />
                  </div>
                </div>
                <div className="h-28 rounded-xl bg-[var(--np-surface)] ring-1 ring-[var(--np-border)]">
                  <div className="flex h-full items-end gap-1 p-3">
                    {[35, 55, 40, 70, 50, 80, 65].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-[var(--np-accent)]/30" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--np-surface)] px-3 py-2.5">
                      <div className="h-9 w-9 rounded-full bg-[var(--np-accent-soft)]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 w-2/3 rounded bg-zinc-200" />
                        <div className="h-1.5 w-1/2 rounded bg-zinc-100" />
                      </div>
                    </div>
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

function OrbitSection() {
  const v = useInView();
  const r = useReducedMotion();
  const pills = [
    { label: "Historique", sub: "réservations", angle: -25, Icon: BarChart3 },
    { label: "Revenus", sub: "semaine", angle: 45, Icon: TrendingUp },
    { label: "Essai gratuit", sub: "14 jours", angle: 115, Icon: Sparkles },
    { label: "Import OK", sub: "données", angle: 195, Icon: Check },
    { label: "Clients", sub: "actifs", angle: 275, Icon: Users },
  ];

  return (
    <section className={`py-20 md:py-28 lg:py-32 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="mx-auto max-w-[640px] text-center">
          <h2 className="text-balance text-[clamp(1.75rem,3.2vw,2.65rem)] font-bold tracking-[-0.035em] text-[var(--np-fg)]">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="mt-4 text-[16px] text-[var(--np-muted)]">
            Rejoignez les restaurateurs qui centralisent page, réservations et marketing.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--np-accent)] px-8 py-4 text-[14px] font-semibold text-white shadow-[0_14px_40px_-10px_var(--np-glow)] transition hover:bg-[var(--np-accent-hover)]"
          >
            Essai gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.12, 20)}
          className="relative mx-auto mt-16 h-[min(90vw,420px)] max-w-[420px]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--np-border)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--np-border)]/80" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--np-border)]" />

          {pills.map((p, i) => (
            <motion.div
              key={p.label}
              className="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2"
              style={{ rotate: p.angle }}
              animate={r ? undefined : { rotate: [p.angle, p.angle + 2, p.angle] }}
              transition={{ duration: 12 + i * 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute left-1/2 w-[150px] -translate-x-1/2"
                style={{ top: "-155px", rotate: -p.angle }}
                animate={r ? undefined : { y: [0, -4, 0] }}
                transition={{ duration: 4 + i * 0.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <div className={`${cardClass} px-3 py-2.5 shadow-lg`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--np-accent-soft)] text-[var(--np-accent)]">
                      <p.Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[12px] font-bold text-[var(--np-fg)]">{p.label}</p>
                      <p className="text-[10px] text-[var(--np-muted)]">{p.sub}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--np-accent)] text-lg font-bold text-white shadow-xl shadow-[var(--np-glow)]">
            ZG
          </div>
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
      blurb: "Page, menu, réservations illimitées.",
      features: ["Page restaurant", "Réservations illimitées", "Menu & galerie", "Personnalisation", "Support"],
      highlight: false,
    },
    {
      name: "Growth",
      price: "69",
      blurb: "Marketing et automatisations inclus.",
      features: ["Tout Essentiel", "Campagnes", "Clients", "Automatisations", "Avis Google", "Analytics", "E-mail"],
      highlight: true,
    },
  ] as const;

  return (
    <section id="tarifs" className={`scroll-mt-20 border-t border-[var(--np-border)] bg-[var(--np-surface)]/30 py-20 md:py-28 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--np-accent)]">Tarifs</p>
          <h2 className="mt-4 text-balance text-[clamp(1.75rem,3.2vw,2.65rem)] font-bold tracking-[-0.035em] text-[var(--np-fg)]">
            Simple et transparent
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-[var(--np-muted)]">Deux formules en CHF / mois.</p>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-14 grid gap-6 lg:grid-cols-2">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              variants={fadeUp(i * 0.06, 18)}
              className={`relative flex flex-col rounded-[1.75rem] border bg-white p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] md:p-10 ${
                p.highlight ? "border-[var(--np-accent)]/40 ring-2 ring-[var(--np-accent)]/15" : "border-[var(--np-border)]"
              }`}
            >
              {p.highlight ? (
                <span className="absolute right-6 top-6 rounded-full bg-[var(--np-accent-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--np-accent)]">
                  Populaire
                </span>
              ) : null}
              <p className="text-[16px] font-bold text-[var(--np-fg)]">{p.name}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-[clamp(2.5rem,4vw,3.25rem)] font-bold tracking-tight text-[var(--np-fg)]">{p.price}</span>
                <span className="text-[15px] text-[var(--np-muted)]">CHF / mois</span>
              </div>
              <p className="mt-3 text-[14px] text-[var(--np-muted)]">{p.blurb}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[14px] text-[var(--np-fg)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--np-accent-soft)]">
                      <Check className="h-3 w-3 text-[var(--np-accent)]" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-10 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition ${
                  p.highlight
                    ? "bg-[var(--np-accent)] text-white shadow-[0_12px_36px_-10px_var(--np-glow)] hover:bg-[var(--np-accent-hover)]"
                    : "border border-[var(--np-border)] text-[var(--np-fg)] hover:bg-[var(--np-surface)]"
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

function ContactStrip() {
  return (
    <section id="contact" className={`scroll-mt-20 border-t border-[var(--np-border)] py-16 ${shell}`}>
      <div className={`${maxW} text-center`}>
        <p className="text-[13px] font-medium text-[var(--np-muted)]">Une question ?</p>
        <a
          href="mailto:support@zengrow.app"
          className="mt-2 inline-block text-[16px] font-semibold text-[var(--np-accent)] underline-offset-4 hover:underline"
        >
          support@zengrow.app
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--np-border)] bg-white py-12 md:py-14">
      <div className={`${maxW} flex flex-col items-center justify-between gap-8 md:flex-row ${shell}`}>
        <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--np-fg)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--np-accent)] text-white">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </span>
          ZenGrow
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-[13px] font-medium text-[var(--np-muted)]">
          {nav.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-[var(--np-fg)]">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="transition hover:text-[var(--np-fg)]">
            Connexion
          </Link>
        </nav>
        <p className="text-[12px] text-[var(--np-muted)]">© {new Date().getFullYear()} ZenGrow</p>
      </div>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white font-sans text-[var(--np-fg)] antialiased selection:bg-[var(--np-accent-soft)]"
      style={tokens as unknown as CSSProperties}
    >
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <WorkflowCards />
        <SplitFeatures />
        <OrbitSection />
        <SectionPricing />
        <ContactStrip />
      </main>
      <Footer />
    </div>
  );
}
