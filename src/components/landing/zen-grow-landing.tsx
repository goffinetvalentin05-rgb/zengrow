"use client";

/**
 * Landing ZenGrow — structure visuelle calquée sur le template OrbAI (Framer).
 * Contenu marketing ZenGrow uniquement. Palette : noir / bleu nuit, accents violet-bleu discrets.
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
  Calendar,
  Check,
  ChevronRight,
  ChevronDown,
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

function float(delay: number, amp = 10) {
  const r = useReducedMotion();
  if (r) return undefined;
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

/* ——— Design tokens (esprit OrbAI) ——— */
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
  { href: "#experience", label: "Expérience" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#pour-qui", label: "Pour qui" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

/* ——— Navbar OrbAI : logo | liens centrés | CTA ——— */
function Navbar() {
  const [m, setM] = useState(false);
  return (
    <header className="sticky top-0 z-[200] border-b border-white/[0.06] bg-[#030305]/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#030305]/72">
      <div className={`relative flex h-[3.25rem] items-center sm:h-14 ${maxW} ${shell}`}>
        <Link href="/" className="relative z-10 text-[15px] font-semibold tracking-tight text-white">
          ZenGrow
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2">
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

/* ——— Carte flottante hero (volume OrbAI) ——— */
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
          <p className="mt-2 text-[15px] font-medium leading-snug tracking-tight text-zinc-100">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ——— Mockup central premium (type Framer / OrbAI) ——— */
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
              Page restaurant ZenGrow
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Restaurant Luna</h3>
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Menu spécial</p>
            <p className="mt-1.5 text-[15px] font-medium text-white">Dégustation week-end</p>
            <p className="mt-1 text-xs text-zinc-500">Saison · places limitées</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-4 ring-1 ring-white/[0.04]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Horaires</p>
            <p className="mt-1.5 flex items-center gap-2 text-[14px] text-zinc-200">
              <Clock className="h-4 w-4 text-zinc-500" />
              Mar–Dim · 12h–14h30 · 19h–23h
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/30 p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-violet-300/80" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Adresse & carte</p>
            <p className="mt-1 text-[15px] font-medium text-zinc-100">Rue du Lac 14 · 1007 Lausanne</p>
            <p className="mt-1 text-xs text-zinc-500">Itinéraire · carte interactive</p>
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
      {/* Fond OrbAI : mailles + glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#030305]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(88,76,140,0.14),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_20%,rgba(37,99,235,0.07),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_60%,rgba(99,102,241,0.06),transparent_40%)]"
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
            className="mt-8 text-balance text-[clamp(2rem,6.5vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:mt-10"
          >
            Les clients ne veulent plus chercher un restaurant.
          </motion.h1>
          <motion.p
            initial={r ? false : { opacity: 0, y: 32 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-4 text-balance text-[clamp(2rem,6.5vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-zinc-300 sm:mt-5"
          >
            Ils veulent le comprendre et réserver immédiatement.
          </motion.p>

          <motion.p
            initial={r ? false : { opacity: 0, y: 22 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.14 }}
            className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:mt-10 sm:text-lg md:text-xl"
          >
            ZenGrow transforme la manière dont les restaurants se présentent en ligne : une page
            rapide, moderne et pensée pour convertir un visiteur en réservation en quelques secondes.
          </motion.p>

          <motion.div
            initial={r ? false : { opacity: 0, y: 18 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-[#09090b] shadow-[0_16px_48px_-20px_rgba(255,255,255,0.4)] transition hover:bg-zinc-100"
            >
              Créer ma page restaurant
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

        {/* Zone visuelle hero : hauteur généreuse, mockup remonté */}
        <div className="relative mx-auto mt-14 min-h-[min(78vh,820px)] sm:mt-16 lg:mt-20 lg:min-h-[min(72vh,760px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[38%] h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]"
          />

          {/* Flotteurs — positions type OrbAI (autour du centre, pas en bas de viewport) */}
          <motion.div
            animate={float(0, 12)}
            className="absolute left-0 top-[6%] z-20 hidden xl:left-[2%] xl:block"
          >
            <FloatCard icon={Calendar} title="Nouvelle réservation" body="Table 2 · ce soir · 20h00" />
          </motion.div>
          <motion.div
            animate={float(0.9, 11)}
            className="absolute right-0 top-[8%] z-20 hidden xl:right-[2%] xl:block"
          >
            <FloatCard icon={Star} title="Avis Google programmé" body="Envoi après la visite" />
          </motion.div>
          <motion.div
            animate={float(1.7, 10)}
            className="absolute bottom-[28%] left-0 z-20 hidden xl:bottom-[26%] xl:left-0 xl:block"
          >
            <FloatCard icon={Users} title="Client ajouté" body="Camille D. · 2 visites" />
          </motion.div>
          <motion.div
            animate={float(2.4, 11)}
            className="absolute bottom-[26%] right-0 z-20 hidden xl:bottom-[24%] xl:right-0 xl:block"
          >
            <FloatCard icon={UtensilsCrossed} title="Menu spécial publié" body="Week-end" />
          </motion.div>
          <motion.div
            animate={float(1.2, 9)}
            className="absolute left-1/2 top-[2%] z-10 w-full max-w-[300px] -translate-x-1/2 xl:top-[0%]"
          >
            <FloatCard
              icon={Smartphone}
              title="Mobile-first"
              body="Pensé pour réserver vite"
              className="mx-auto"
            />
          </motion.div>

          {/* Tablette / mobile : flotteurs compacts */}
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

/* ——— SECTION 2 : type “Benefits” OrbAI ——— */
function SectionProblem() {
  const v = useInView();
  const steps = [
    { n: "01", label: "Lien ouvert", Icon: ExternalLink },
    { n: "02", label: "Photos regardées", Icon: ImageIcon },
    { n: "03", label: "Menu consulté", Icon: ScrollText },
    { n: "04", label: "Réservation immédiate", Icon: Calendar },
  ] as const;

  return (
    <section id="probleme" className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Parcours client</p>
          <h2 className={`${h2} mt-4`}>Aujourd’hui, tout va plus vite.</h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base text-zinc-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Quand quelqu’un découvre un restaurant, il prend une décision presque immédiatement.
          </motion.p>
          <motion.div variants={fadeUp(0.05)} className="space-y-1.5 text-zinc-300">
            <p>Il ouvre un lien.</p>
            <p>Regarde quelques photos.</p>
            <p>Jette un œil au menu.</p>
            <p>Observe l’ambiance.</p>
          </motion.div>
        </motion.div>

        <motion.div {...v} variants={fadeUp(0.08)} className="relative mt-16">
          <div className={`${cardOrb} border-white/[0.09] p-6 md:p-10 lg:p-14`}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(99,102,241,0.07),transparent_55%)]"
            />
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2">
              {steps.map((s, i) => (
                <div key={s.label} className="relative px-2 py-4 lg:py-2">
                  {i < steps.length - 1 ? (
                    <div
                      aria-hidden
                      className="absolute right-0 top-1/2 hidden h-px w-full max-w-[calc(100%-2rem)] translate-x-1/2 bg-gradient-to-r from-white/15 to-transparent lg:block"
                      style={{ left: "calc(50% + 1.5rem)" }}
                    />
                  ) : null}
                  <div
                    className={`${cardHover} rounded-2xl border border-white/[0.07] bg-black/30 p-6 ring-1 ring-white/[0.04]`}
                  >
                    <p className="text-3xl font-semibold tabular-nums text-white/[0.12]">{s.n}</p>
                    <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                      <s.Icon className="h-5 w-5 text-zinc-200" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-12 rounded-2xl border border-violet-500/20 bg-violet-500/[0.08] px-6 py-8 text-center md:px-12">
              <p className="text-xl font-medium text-zinc-200 md:text-2xl">
                Puis il réserve…{" "}
                <span className="font-semibold text-white">ou passe au suivant.</span>
              </p>
            </div>

            <p className="relative mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-zinc-500 md:text-base">
              Le problème, c’est que beaucoup de restaurants utilisent encore des expériences pensées
              comme des vitrines classiques, alors que les comportements ont complètement changé.
            </p>
          </div>
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

/* ——— SECTION 3 : mockups (type “Features” OrbAI — grande démo) ——— */
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
              <MapPin className="mb-1 inline h-3.5 w-3.5 text-violet-300/80" /> Rue du Lac 14, Lausanne
            </div>
            <button
              type="button"
              className="w-full rounded-full bg-white py-3 text-xs font-semibold text-black"
            >
              Réserver une table
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
            <p className="text-sm text-zinc-500">Photos, menu, ambiance — tout visible sans chercher.</p>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-400">
              <Clock className="mb-2 inline h-4 w-4" />
              <br />
              Horaires complets · jours fériés
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-400">
              <MapPin className="mb-2 inline h-4 w-4 text-violet-300" />
              <br />
              Carte · itinéraire
            </div>
            <button
              type="button"
              className="w-full max-w-[220px] rounded-full bg-white py-3 text-sm font-semibold text-black"
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
      className={`scroll-mt-24 border-y border-white/[0.06] bg-[#060608] py-24 md:py-32 lg:py-40 ${shell}`}
    >
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Nouvelle expérience</p>
          <h2 className={`${h2} mt-4`}>Une page pensée pour décider vite.</h2>
          <p className={sub}>
            ZenGrow a été conçu pour cette nouvelle manière de découvrir un restaurant.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-12 max-w-3xl space-y-6 text-center text-base text-zinc-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Chaque page va droit à l’essentiel. Le client arrive et comprend immédiatement :
          </motion.p>
          <motion.ul variants={fadeUp(0.05)} className="mx-auto max-w-md space-y-2 text-left text-zinc-300">
            {["le style du restaurant", "l’ambiance", "les informations importantes", "comment réserver"].map(
              (x) => (
                <li key={x} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-violet-400/80" strokeWidth={2.5} />
                  {x}
                </li>
              ),
            )}
          </motion.ul>
          <motion.p variants={fadeUp(0.08)} className="font-medium text-zinc-200">
            Tout est fluide. Rapide. Pensé mobile dès le départ.
          </motion.p>
          <motion.p variants={fadeUp(0.1)}>Parce qu’aujourd’hui, chaque seconde d’hésitation compte.</motion.p>
        </motion.div>

        <motion.div
          id="demo"
          {...v}
          variants={fadeUp(0.12)}
          className={`relative mt-16 scroll-mt-28 ${cardOrb} p-6 md:p-10 lg:p-12`}
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

const modules = [
  { title: "Réservations", text: "Arrivent directement dans l’espace du restaurant.", Icon: Calendar },
  { title: "Clients", text: "Enregistrés automatiquement au fil des visites.", Icon: Users },
  { title: "Campagnes", text: "Lancées en quelques secondes depuis une interface unique.", Icon: Megaphone },
  { title: "Événements", text: "Publiés instantanément sur la page publique.", Icon: PartyPopper },
  { title: "Menus spéciaux", text: "Nouveautés et cartes limitées en ligne sans délai.", Icon: ChefHat },
  { title: "Avis Google", text: "Automatisés après la visite, selon vos règles.", Icon: Star },
] as const;

/* ——— SECTION 4 : grille type “Features / Services” OrbAI (carte + bandeau graphique) ——— */
function SectionPlatform() {
  const v = useInView();
  return (
    <section id="plateforme" className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Plateforme</p>
          <h2 className={`${h2} mt-4`}>Derrière une page simple, une vraie plateforme.</h2>
          <p className={sub}>ZenGrow ne sert pas uniquement à afficher un restaurant.</p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-4 text-center text-base text-zinc-400 md:text-lg"
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
              <li key={line} className="flex gap-3 text-zinc-300">
                <Check className="mt-1 h-4 w-4 shrink-0 text-violet-400/70" strokeWidth={2.5} />
                {line}
              </li>
            ))}
          </motion.ul>
          <motion.p variants={fadeUp(0.1)} className="font-medium text-zinc-200">
            Le restaurant garde enfin le contrôle total de son expérience en ligne.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((m, i) => (
            <motion.article
              key={m.title}
              variants={fadeUp(i * 0.04)}
              className={`${cardOrb} ${cardHover} overflow-hidden p-0`}
            >
              <FeatureGraphic i={i} />
              <div className="p-7">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                  <m.Icon className="h-5 w-5 text-zinc-200" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{m.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ——— SECTION 5 ——— */
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
    <section className={`border-y border-white/[0.06] bg-[#050508] py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Présence vivante</p>
          <h2 className={`${h2} mt-4`}>Un restaurant n’est jamais figé. Sa présence en ligne non plus.</h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base text-zinc-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Une nouvelle carte. Une soirée spéciale. Une offre du week-end. Une nouvelle ambiance.
          </motion.p>
          <motion.p variants={fadeUp(0.05)} className="font-medium text-zinc-200">
            Avec ZenGrow, tout peut évoluer immédiatement.
          </motion.p>
          <motion.div variants={fadeUp(0.08)} className="space-y-2 text-zinc-500">
            <p>Sans devoir contacter quelqu’un.</p>
            <p>Sans attendre plusieurs jours.</p>
            <p>Sans dépendre d’une agence pour modifier un simple détail.</p>
          </motion.div>
        </motion.div>

        <motion.div
          {...v}
          variants={staggerFast}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          {items.map((t, i) => (
            <motion.div
              key={t}
              variants={fadeUp(i * 0.04)}
              whileHover={{ scale: 1.02 }}
              className={`${cardOrb} ${cardHover} flex min-w-[240px] items-center gap-4 px-6 py-4 sm:min-w-[260px]`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/20">
                <Zap className="h-5 w-5 text-violet-200/90" />
              </span>
              <span className="text-[15px] font-medium text-zinc-100">{t}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ——— SECTION 6 : type “Comparison” OrbAI ——— */
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
    <section className={`py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Deux perspectives</p>
          <h2 className={`${h2} mt-4 max-w-4xl`}>
            Une expérience moderne pour les clients. Une gestion simple pour le restaurant.
          </h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-base text-zinc-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            D’un côté, les clients découvrent, comprennent et réservent plus rapidement.
          </motion.p>
          <motion.div variants={fadeUp(0.05)}>
            <p className="text-zinc-300">De l’autre, le restaurant centralise :</p>
            <ul className="mx-auto mt-4 max-w-md space-y-2 text-left text-zinc-400">
              {["ses réservations", "ses clients", "ses campagnes", "ses événements", "ses avis Google"].map(
                (x) => (
                  <li key={x} className="flex gap-2">
                    <span className="text-violet-400/80">·</span> {x}
                  </li>
                ),
              )}
            </ul>
          </motion.div>
          <motion.p variants={fadeUp(0.08)} className="font-medium text-zinc-200">
            Dans une seule plateforme claire, moderne et pensée pour le quotidien.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-16 grid gap-6 lg:grid-cols-2"
        >
          <motion.div
            variants={fadeUp(0, 32)}
            className={`${cardOrb} border-violet-500/15 p-8 md:p-10`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 100px -48px rgba(99,102,241,0.12)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">Client</p>
            <ul className="mt-8 space-y-5">
              {client.map((l) => (
                <li key={l} className="flex gap-4 text-[15px] text-zinc-200">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp(0.06, 32)}
            className={`${cardOrb} p-8 md:p-10`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Restaurant</p>
            <ul className="mt-8 space-y-5">
              {resto.map((l) => (
                <li key={l} className="flex gap-4 text-[15px] text-zinc-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
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

function SectionForWho() {
  const v = useInView();
  return (
    <section id="pour-qui" className={`scroll-mt-24 border-y border-white/[0.06] bg-[#060608] py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Pour qui</p>
          <h2 className={`${h2} mt-4`}>Une page principale ou une expérience de réservation plus moderne.</h2>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mx-auto mt-10 max-w-3xl space-y-6 text-center text-base text-zinc-400 md:text-lg"
        >
          <motion.p variants={fadeUp(0.02)}>
            Certains restaurants utilisent ZenGrow comme présence principale en ligne.
          </motion.p>
          <motion.p variants={fadeUp(0.05)}>
            D’autres l’utilisent pour moderniser leur expérience de réservation actuelle, même s’ils ont
            déjà un site.
          </motion.p>
          <motion.p variants={fadeUp(0.08)} className="font-medium text-zinc-200">
            Dans les deux cas, le résultat reste le même :
          </motion.p>
          <motion.div variants={fadeUp(0.1)} className="space-y-1 text-zinc-300">
            <p>Une expérience plus rapide.</p>
            <p>Plus moderne.</p>
            <p>Plus connectée.</p>
          </motion.div>
        </motion.div>

        <motion.div {...v} variants={stagger} className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.article
            variants={fadeUp(0, 28)}
            className={`${cardOrb} ${cardHover} p-8 md:p-10 lg:p-12`}
          >
            <h3 className="text-xl font-semibold text-white md:text-2xl">Restaurants sans site moderne</h3>
            <p className="mt-5 text-base leading-relaxed text-zinc-500">
              ZenGrow peut devenir leur page principale : claire, rapide, professionnelle et orientée
              réservation.
            </p>
          </motion.article>
          <motion.article
            variants={fadeUp(0.06, 28)}
            className={`${cardOrb} ${cardHover} border-violet-500/15 p-8 md:p-10 lg:p-12`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(139,92,246,0.12), 0 32px 80px -40px rgba(99,102,241,0.1)",
            }}
          >
            <h3 className="text-xl font-semibold text-white md:text-2xl">Restaurants avec un site existant</h3>
            <p className="mt-5 text-base leading-relaxed text-zinc-500">
              ZenGrow peut devenir leur page de réservation moderne, connectée à une vraie plateforme de
              gestion.
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
    <section className={`relative overflow-hidden py-28 md:py-36 lg:py-44 ${shell}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(99,102,241,0.1),transparent_65%)]"
      />
      <motion.div {...v} variants={fadeUp(0, 36)} className={`relative ${maxW} text-center`}>
        <p className={kicker}>Vision</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-[-0.02em] text-white">
          Le web restaurant évolue enfin.
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Pendant longtemps, les restaurants avaient simplement besoin « d’un site ».
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300 md:text-xl">
          Aujourd’hui, ils ont surtout besoin d’une expérience rapide, mobile et connectée à leurs clients.
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-lg font-medium text-white md:text-xl">
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
    <section id="tarifs" className={`scroll-mt-24 py-24 md:py-32 lg:py-40 ${shell}`}>
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()}>
          <p className={kicker}>Tarifs</p>
          <h2 className={`${h2} mt-4`}>Une nouvelle génération d’expérience restaurant.</h2>
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.08)}
          className="relative mx-auto mt-14 max-w-lg"
        >
          <div
            className={`${cardOrb} relative overflow-hidden border-white/[0.12] p-8 md:p-12`}
            style={{
              boxShadow:
                "0 0 0 1px rgba(167,139,250,0.2), 0 0 120px -30px rgba(99,102,241,0.3), 0 48px 120px -40px rgba(0,0,0,0.95)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-30%,rgba(139,92,246,0.12),transparent_55%)]"
            />
            <div className="relative text-center">
              <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
                Une page restaurant moderne, une réservation fluide et une plateforme complète pour gérer
                l’essentiel au quotidien.
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-center gap-2">
                <span className="text-5xl font-semibold tracking-tight text-white md:text-6xl">39 CHF</span>
                <span className="pb-2 text-lg font-medium text-zinc-500">/ mois</span>
              </div>
              <p className="mt-8 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Inclus
              </p>
              <ul className="mt-4 space-y-3 text-left">
                {pricingList.map((f) => (
                  <li key={f} className="flex gap-3 text-[14px] text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-[14px] font-semibold text-[#09090b] transition hover:bg-zinc-100"
              >
                Créer ma page restaurant
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-center text-xs text-zinc-600">
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
    <section className={`pb-20 pt-4 md:pb-28 ${shell}`}>
      <motion.div
        {...v}
        variants={fadeUp(0, 28)}
        className={`relative ${maxW} overflow-hidden rounded-[2rem] border border-white/[0.1] bg-gradient-to-br from-violet-950/40 via-[#0a0a0f] to-blue-950/30 px-6 py-16 text-center md:px-16 md:py-24`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent_55%)]"
        />
        <h2 className="relative mx-auto max-w-3xl text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.02em] text-white">
          Les restaurants changent.
          <span className="mt-3 block text-zinc-300">L’expérience en ligne aussi.</span>
        </h2>
        <p className="relative mx-auto mt-8 max-w-2xl text-base text-zinc-400 md:text-lg">
          Offrez à vos clients une manière plus rapide, plus claire et plus moderne de découvrir votre
          restaurant et de réserver.
        </p>
        <Link
          href="/signup"
          className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-[#09090b] transition hover:bg-zinc-100"
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
    a: "Pas nécessairement. ZenGrow peut être votre page principale ou une page de réservation reliée à votre site.",
  },
  {
    q: "Combien de temps pour être en ligne ?",
    a: "Selon vos contenus, comptez en général quelques jours à quelques semaines pour une mise en ligne soignée.",
  },
  {
    q: "Les clients doivent-ils créer un compte ?",
    a: "Non. Ils réservent depuis la page publique, sans friction inutile.",
  },
  {
    q: "Puis-je modifier ma page moi-même ?",
    a: "Oui : cartes, photos, événements et offres évoluent depuis votre espace restaurateur.",
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
            Questions fréquentes
          </h2>
          <p className="mt-5 text-left text-zinc-500">
            Besoin d’échanger ?{" "}
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

function Footer() {
  const links = [
    { href: "#experience", label: "Expérience" },
    { href: "#plateforme", label: "Plateforme" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "#contact", label: "Contact" },
    { href: "/login", label: "Connexion" },
  ] as const;

  return (
    <footer className="border-t border-white/[0.06] bg-[#020203] py-16 md:py-20">
      <div className={`${maxW} flex flex-col gap-12 md:flex-row md:items-start md:justify-between ${shell}`}>
        <div>
          <p className="text-lg font-semibold text-white">ZenGrow</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600">
            La nouvelle génération d’expérience en ligne pour restaurants.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-3">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-medium text-zinc-500 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
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
