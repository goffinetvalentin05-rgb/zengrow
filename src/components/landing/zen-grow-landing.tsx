"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChefHat,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu as MenuIcon,
  Smartphone,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-serif",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-zg-sans",
});

const EASE = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay = 0, y = 24): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE, delay },
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
    viewport: { once: true, amount: 0.15 },
  } as const;
}

function floatSlow(delay: number, amp = 8) {
  return {
    y: [0, -amp, 0],
    transition: {
      duration: 6 + delay * 0.5,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
      delay,
    },
  };
}

const shell = "px-5 sm:px-8 lg:px-12";
const maxW = "mx-auto max-w-[1200px]";

const nav = [
  { href: "#decouverte", label: "Découverte" },
  { href: "#reservation", label: "Réservation" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#mobile", label: "Mobile" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

const cardBase =
  "rounded-[1.75rem] border border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-white/80 shadow-[0_28px_80px_-48px_rgba(28,27,25,0.35)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--zg-ink)_10%,transparent)] hover:shadow-[0_36px_90px_-44px_rgba(28,27,25,0.28)]";

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[200] border-b border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--zg-cream)_78%,white)]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--zg-cream)_65%,white)]/72">
      <div className={`relative flex h-14 items-center sm:h-[3.5rem] ${maxW} ${shell}`}>
        <Link
          href="/"
          className={`relative z-10 text-[1.05rem] font-semibold tracking-tight text-[var(--zg-ink)] ${serif.className}`}
        >
          ZenGrow
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex">
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-[var(--zg-muted)] transition hover:bg-[color-mix(in_srgb,var(--zg-champagne)_35%,white)] hover:text-[var(--zg-ink)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-[var(--zg-muted)] transition hover:text-[var(--zg-ink)] sm:inline"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden items-center gap-1 rounded-full bg-[var(--zg-ink)] px-4 py-2.5 text-[13px] font-semibold text-[var(--zg-cream)] shadow-[0_14px_40px_-18px_rgba(28,27,25,0.55)] transition hover:bg-[color-mix(in_srgb,var(--zg-ink)_92%,white)] sm:inline-flex"
          >
            Créer ma page
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-white/70 text-[var(--zg-ink)] lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-[var(--zg-cream)] px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--zg-ink)]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-2 flex justify-center rounded-full bg-[var(--zg-ink)] py-3 text-sm font-semibold text-[var(--zg-cream)]"
            >
              Créer ma page restaurant
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function FloatingUiCard({
  icon: Icon,
  title,
  body,
  className = "",
}: {
  icon: typeof Calendar;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={`${cardBase} w-[min(100%,270px)] p-5 sm:w-[280px] sm:p-6 ${className}`}>
      <div className="flex gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--zg-champagne)_42%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]">
          <Icon className="h-5 w-5 text-[var(--zg-ink)]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--zg-muted)]">
            {title}
          </p>
          <p className="mt-1.5 text-[14px] font-semibold leading-snug tracking-tight text-[var(--zg-ink)]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

const IMG_HERO_MAIN =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80";
const IMG_HERO_SIDE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
const IMG_SECTION =
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80";
const IMG_MOBILE =
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=700&q=80";

function HeroVisual() {
  const r = useReducedMotion();
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[720px] lg:mt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(88vw,440px)] w-[min(88vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--zg-champagne)_55%,transparent)_0%,transparent_68%)] blur-2xl"
      />

      <motion.div
        animate={r ? undefined : floatSlow(0, 9)}
        className="absolute -left-2 top-[6%] z-20 hidden md:block lg:-left-6 xl:-left-4"
      >
        <FloatingUiCard icon={Calendar} title="Réservation" body="Ce soir · 20h00 · 2 pers." />
      </motion.div>
      <motion.div
        animate={r ? undefined : floatSlow(1.1, 8)}
        className="absolute -right-2 top-[10%] z-20 hidden md:block lg:-right-6 xl:-right-2"
      >
        <FloatingUiCard icon={Star} title="Avis" body="Invitation après la visite" />
      </motion.div>
      <motion.div
        animate={r ? undefined : floatSlow(2, 7)}
        className="absolute -bottom-2 left-0 z-20 hidden lg:block xl:left-2"
      >
        <FloatingUiCard icon={Users} title="Clients" body="Camille · table habituelle" />
      </motion.div>
      <motion.div
        animate={r ? undefined : floatSlow(1.4, 8)}
        className="absolute -bottom-4 right-0 z-20 hidden lg:block xl:right-4"
      >
        <FloatingUiCard icon={UtensilsCrossed} title="Menu" body="Carte week-end publiée" />
      </motion.div>

      <motion.div
        initial={r ? false : { opacity: 0, y: 40, scale: 0.97 }}
        animate={r ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.05, ease: EASE, delay: 0.2 }}
        className="relative z-30 mx-auto flex justify-center px-2"
      >
        <div
          className={`relative w-full max-w-[320px] sm:max-w-[340px] ${cardBase} overflow-hidden p-2.5 sm:p-3`}
        >
          <div className="relative overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[var(--zg-warm)] shadow-inner">
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="text-[11px] font-medium tabular-nums text-[var(--zg-muted)]">9:41</span>
              <div className="h-5 w-[4.5rem] rounded-full bg-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)]" />
            </div>
            <div className="px-4 pb-5 pt-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]">
                <Image
                  src={IMG_HERO_MAIN}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, 340px"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--zg-ink)_45%,transparent)] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85">
                      Maison Lumière
                    </p>
                    <p className={`mt-1 text-xl font-semibold text-white ${serif.className}`}>
                      Réserver
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[var(--zg-ink)] shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-[color-mix(in_srgb,var(--zg-champagne)_80%,var(--zg-ink))] text-[color-mix(in_srgb,var(--zg-champagne)_80%,var(--zg-ink))]" />
                    4,9
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="relative aspect-[5/4] overflow-hidden rounded-xl ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]">
                  <Image
                    src={IMG_HERO_SIDE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)] bg-white/90 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--zg-muted)]">
                      Ce soir
                    </p>
                    <p className={`mt-1 text-base font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                      Table disponible
                    </p>
                  </div>
                  <p className="text-[11px] leading-snug text-[var(--zg-muted)]">
                    Confirmation instantanée · rappel SMS
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-[var(--zg-ink)] py-3.5 text-[14px] font-semibold text-[var(--zg-cream)] shadow-[0_18px_40px_-22px_rgba(28,27,25,0.55)] transition hover:bg-[color-mix(in_srgb,var(--zg-ink)_92%,white)]"
              >
                Réserver une table
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-wrap justify-center gap-3 md:hidden">
        <FloatingUiCard icon={Calendar} title="Réservation" body="Ce soir · 20h00" />
        <FloatingUiCard icon={Star} title="Avis" body="Après la visite" />
      </div>
    </div>
  );
}

function Hero() {
  const r = useReducedMotion();
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-28 lg:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--zg-cream)_0%,var(--zg-ivory)_42%,color-mix(in_srgb,var(--zg-warm)_88%,white)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--zg-champagne) 22%, transparent) 0%, transparent 42%),
            radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--zg-beige) 18%, transparent) 0%, transparent 38%),
            radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--zg-champagne) 12%, transparent) 0%, transparent 45%)`,
        }}
      />

      <div className={`relative ${maxW} ${shell}`}>
        <div className="mx-auto max-w-[880px] text-center">
          <motion.div
            initial={r ? false : { opacity: 0, y: 14 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-white/75 px-4 py-2 shadow-[0_12px_40px_-32px_rgba(28,27,25,0.35)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_70%,var(--zg-ink))]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--zg-muted)] sm:text-[12px]">
              Nouvelle génération restaurant
            </span>
          </motion.div>

          <motion.h1
            initial={r ? false : { opacity: 0, y: 32 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: EASE, delay: 0.05 }}
            className={`mt-8 text-balance text-[clamp(2.35rem,6.2vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-[var(--zg-ink)] sm:mt-10 ${serif.className}`}
          >
            Les clients ne veulent plus chercher.
            <span className="mt-3 block">
              Ils veulent{" "}
              <span className="relative inline-block px-3 py-1">
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_38%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-champagne)_55%,transparent)]"
                />
                réserver immédiatement
              </span>
              .
            </span>
          </motion.h1>

          <motion.p
            initial={r ? false : { opacity: 0, y: 22 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
            className="mx-auto mt-7 max-w-[34rem] text-balance text-[1.05rem] leading-relaxed text-[var(--zg-muted)] sm:text-[1.125rem] md:text-[1.2rem]"
          >
            Aujourd’hui, un restaurant se découvre en quelques secondes.
            <span className="mt-2 block text-[var(--zg-ink)]/90">
              ZenGrow transforme cette découverte en réservation.
            </span>
          </motion.p>

          <motion.div
            initial={r ? false : { opacity: 0, y: 16 }}
            animate={r ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.2 }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--zg-ink)] px-8 py-4 text-[14px] font-semibold text-[var(--zg-cream)] shadow-[0_20px_50px_-28px_rgba(28,27,25,0.55)] transition hover:bg-[color-mix(in_srgb,var(--zg-ink)_92%,white)]"
            >
              Créer ma page restaurant
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_12%,transparent)] bg-white/80 px-8 py-4 text-[14px] font-semibold text-[var(--zg-ink)] shadow-[0_14px_40px_-34px_rgba(28,27,25,0.25)] transition hover:border-[color-mix(in_srgb,var(--zg-ink)_18%,transparent)] hover:bg-white"
            >
              Voir la démo
            </a>
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function TrustStrip() {
  const v = useInView();
  return (
    <section className={`border-y border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--zg-warm)_55%,white)]/90 py-10 ${shell}`}>
      <div className={maxW}>
        <motion.p
          {...v}
          variants={fadeUp(0, 16)}
          className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--zg-muted)]"
        >
          Une expérience digne des meilleures marques hospitality
        </motion.p>
        <motion.div
          {...v}
          variants={fadeUp(0.06, 12)}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-80"
        >
          {["Lausanne", "Genève", "Zürich", "Berne", "Neuchâtel"].map((city) => (
            <span
              key={city}
              className={`text-[15px] font-semibold tracking-tight text-[var(--zg-ink)]/45 ${serif.className}`}
            >
              {city}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionNarrative({
  id,
  eyebrow,
  title,
  body,
  imageSrc,
  imageLeft,
  kickerClass = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  body: ReactNode;
  imageSrc: string;
  imageLeft?: boolean;
  kickerClass?: string;
}) {
  const v = useInView();
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-20 md:py-28 lg:py-32 ${shell}`}
    >
      <div className={`${maxW} grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${imageLeft ? "" : ""}`}>
        <motion.div
          {...v}
          variants={fadeUp()}
          className={`order-2 ${imageLeft ? "lg:order-1" : "lg:order-2"}`}
        >
          {eyebrow ? (
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--zg-muted)] ${kickerClass}`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`mt-4 text-balance text-[clamp(1.85rem,3.5vw,2.85rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.0625rem]">
            {body}
          </div>
        </motion.div>
        <motion.div
          {...v}
          variants={fadeUp(0.08, 28)}
          className={`order-1 ${imageLeft ? "lg:order-2" : "lg:order-1"}`}
        >
          <div className={`${cardBase} overflow-hidden p-2 sm:p-2.5`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)]">
              <Image src={imageSrc} alt="" fill className="object-cover" sizes="(max-width: 1024px) 90vw, 520px" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionCentered({
  id,
  title,
  body,
  className = "",
}: {
  id?: string;
  title: string;
  body: ReactNode;
  className?: string;
}) {
  const v = useInView();
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-20 md:py-28 lg:py-32 ${shell} ${className}`}
    >
      <div className={`${maxW} mx-auto max-w-[760px] text-center`}>
        <motion.div {...v} variants={fadeUp()}>
          <h2
            className={`text-balance text-[clamp(1.85rem,3.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.125rem]">
            {body}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TwoFeatureCards() {
  const v = useInView();
  const items = [
    {
      title: "Parcours clair",
      text: "Le visiteur comprend l’ambiance, le menu et le geste de réservation sans friction.",
      Icon: Sparkles,
      visual: (
        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-9 rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[color-mix(in_srgb,var(--zg-champagne)_22%,white)]"
              style={{ marginLeft: i > 1 ? -10 : 0 }}
            />
          ))}
          <span className="ml-3 text-[12px] font-medium text-[var(--zg-muted)]">+120 visites</span>
        </div>
      ),
    },
    {
      title: "Données utiles",
      text: "Chaque interaction nourrit une vision simple : qui réserve, quand, et comment revenir.",
      Icon: Zap,
      visual: (
        <div className="mt-6 flex h-14 items-end gap-1.5 px-1">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-[color-mix(in_srgb,var(--zg-champagne)_45%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ),
    },
  ] as const;

  return (
    <section className={`py-6 md:py-10 ${shell}`}>
      <div className={maxW}>
        <motion.div
          {...v}
          variants={stagger}
          className="grid gap-5 md:grid-cols-2 md:gap-6"
        >
          {items.map((it, i) => (
            <motion.article
              key={it.title}
              variants={fadeUp(i * 0.06, 20)}
              className={`${cardBase} flex flex-col p-8 md:p-10`}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--zg-champagne)_35%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)]">
                <it.Icon className="h-5 w-5 text-[var(--zg-ink)]" strokeWidth={1.5} />
              </div>
              <h3 className={`mt-6 text-xl font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                {it.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--zg-muted)] md:text-[15px]">
                {it.text}
              </p>
              {it.visual}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionPlatform() {
  const v = useInView();
  const feats = [
    {
      title: "Réservations",
      text: "Flux simple, confirmations et rappels sans surcharge.",
      Icon: Calendar,
    },
    {
      title: "Clients",
      text: "Historique et préférences pour accueillir mieux, plus vite.",
      Icon: Users,
    },
    {
      title: "Campagnes",
      text: "Offres ciblées quand vous avez quelque chose à dire.",
      Icon: Mail,
    },
    {
      title: "Données",
      text: "Lecture claire de ce qui fonctionne sur votre page.",
      Icon: LayoutDashboard,
    },
  ] as const;

  return (
    <section
      id="plateforme"
      className={`scroll-mt-24 border-y border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--zg-warm)_40%,white)] py-20 md:py-28 lg:py-32 ${shell}`}
    >
      <div className={`${maxW} grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16`}>
        <motion.div {...v} variants={fadeUp()}>
          <p className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--zg-muted)]">
            Plateforme
          </p>
          <h2
            className={`mt-5 text-balance text-[clamp(1.85rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            Une plateforme pensée pour les restaurateurs modernes.
          </h2>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.0625rem]">
            Derrière chaque page ZenGrow se trouve une vraie plateforme de gestion moderne.
            Réservations, clients, campagnes, données, communication — tout est centralisé dans une
            expérience simple et fluide.
          </p>
        </motion.div>
        <motion.div {...v} variants={stagger} className="grid gap-4 sm:grid-cols-2">
          {feats.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp(i * 0.05, 18)}
              className={`${cardBase} p-6 md:p-7`}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--zg-champagne)_32%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]">
                <f.Icon className="h-5 w-5 text-[var(--zg-ink)]" strokeWidth={1.5} />
              </div>
              <p className={`mt-4 text-lg font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                {f.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--zg-muted)]">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionCustomers() {
  const v = useInView();
  const bullets = [
    "retrouver vos clients",
    "lancer des campagnes",
    "envoyer des offres",
    "fidéliser votre audience",
    "développer votre restaurant",
  ];

  return (
    <section className={`scroll-mt-24 py-20 md:py-28 lg:py-32 ${shell}`}>
      <div className={`${maxW} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
        <motion.div {...v} variants={fadeUp()}>
          <h2
            className={`text-balance text-[clamp(1.85rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            Transformez vos visiteurs en clients réguliers.
          </h2>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.0625rem]">
            Chaque réservation enrichit votre base client. ZenGrow vous aide à :
          </p>
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-[1.02rem] text-[var(--zg-ink)]">
                <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_38%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)]">
                  <Check className="h-3 w-3 text-[var(--zg-ink)]" strokeWidth={3} />
                </span>
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...v} variants={fadeUp(0.1, 24)}>
          <div className={`${cardBase} overflow-hidden p-6 md:p-8`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--zg-muted)]">
                  Campagne
                </p>
                <p className={`mt-2 text-2xl font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                  Retour printemps
                </p>
              </div>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_35%,white)] px-3 py-1 text-[11px] font-semibold text-[var(--zg-ink)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)]">
                Brouillon
              </span>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl border border-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)] bg-[var(--zg-ivory)]/80 p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--zg-muted)]">Ouverture</span>
                <span className="font-medium text-[var(--zg-ink)]">68%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)]">
                <div className="h-full w-[68%] rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_55%,var(--zg-ink))]" />
              </div>
              <p className="text-[12px] leading-relaxed text-[var(--zg-muted)]">
                Message chaleureux · segment clients récents · envoi automatique
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)] bg-white/90 p-4">
                <p className="text-[11px] font-medium text-[var(--zg-muted)]">Réservations</p>
                <p className={`mt-1 text-xl font-semibold text-[var(--zg-ink)] ${serif.className}`}>+24</p>
              </div>
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)] bg-white/90 p-4">
                <p className="text-[11px] font-medium text-[var(--zg-muted)]">Retours</p>
                <p className={`mt-1 text-xl font-semibold text-[var(--zg-ink)] ${serif.className}`}>12</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionMobile() {
  const v = useInView();
  return (
    <section
      id="mobile"
      className={`scroll-mt-24 border-y border-[color-mix(in_srgb,var(--zg-ink)_6%,transparent)] bg-[color-mix(in_srgb,var(--zg-warm)_35%,white)] py-20 md:py-28 lg:py-32 ${shell}`}
    >
      <div className={`${maxW} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
        <motion.div {...v} variants={fadeUp()} className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-white/75 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--zg-muted)]">
            <Smartphone className="h-3.5 w-3.5" />
            Mobile-first
          </div>
          <h2
            className={`mt-5 text-balance text-[clamp(1.85rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            Une expérience parfaite sur mobile.
          </h2>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.0625rem]">
            La majorité des réservations se font désormais sur téléphone. ZenGrow est conçu mobile-first
            pour offrir une expérience rapide, fluide et moderne.
          </p>
        </motion.div>
        <motion.div {...v} variants={fadeUp(0.08, 28)} className="order-1 flex justify-center lg:order-2">
          <div className={`relative w-full max-w-[300px] ${cardBase} p-2.5`}>
            <div className="overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[var(--zg-warm)]">
              <div className="relative aspect-[9/16] max-h-[420px]">
                <Image src={IMG_MOBILE} alt="" fill className="object-cover" sizes="300px" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--zg-ink)]/25 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/25 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--zg-muted)]">
                    Réservation
                  </p>
                  <p className={`mt-1 text-[15px] font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                    Aujourd’hui · 20h15
                  </p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-full bg-[var(--zg-ink)] py-2.5 text-[12px] font-semibold text-[var(--zg-cream)]"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DemoShowcase() {
  const v = useInView();
  return (
    <section
      id="demo"
      className={`scroll-mt-24 py-16 md:py-24 ${shell}`}
    >
      <div className={maxW}>
        <motion.div
          {...v}
          variants={fadeUp()}
          className={`relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--zg-champagne)_22%,white)_0%,white_48%,var(--zg-ivory)_100%)] p-8 shadow-[0_40px_100px_-52px_rgba(28,27,25,0.35)] md:p-12 lg:p-14`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_28%,transparent)] blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--zg-muted)]">
                Aperçu
              </p>
              <h3
                className={`mt-4 text-balance text-[clamp(1.65rem,2.6vw,2.25rem)] font-semibold leading-[1.15] text-[var(--zg-ink)] ${serif.className}`}
              >
                Une scène vivante, pas un prototype.
              </h3>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-[var(--zg-muted)]">
                Photos, hiérarchie et geste de réservation — le tout pensé pour la découverte sur mobile.
              </p>
            </div>
            <div className={`${cardBase} bg-white/90 p-4`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)]">
                  <Image src={IMG_SECTION} alt="" fill className="object-cover" sizes="(max-width: 768px) 90vw, 400px" />
                </div>
                <div className="flex flex-col justify-between rounded-2xl border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[var(--zg-ivory)]/90 p-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--zg-muted)]">
                      Carte du soir
                    </p>
                    <p className={`mt-2 text-lg font-semibold text-[var(--zg-ink)] ${serif.className}`}>
                      Menu dégustation
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-[12px] text-[var(--zg-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      Quartier · accès facile
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--zg-ink)_7%,transparent)] bg-white/85 p-3">
                    <ChefHat className="h-8 w-8 shrink-0 text-[var(--zg-ink)]" strokeWidth={1.25} />
                    <div>
                      <p className="text-[11px] font-medium text-[var(--zg-muted)]">Chef</p>
                      <p className="text-[13px] font-semibold text-[var(--zg-ink)]">Saison &amp; produits locaux</p>
                    </div>
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

function OrbCta() {
  const v = useInView();
  const r = useReducedMotion();
  const orbit = [
    { label: "Historique", sub: "réservations", Icon: Calendar, angle: -18 },
    { label: "Campagnes", sub: "email", Icon: Mail, angle: 68 },
    { label: "Clients", sub: "fidelisés", Icon: Users, angle: 158 },
  ];

  return (
    <section className={`py-12 md:py-16 ${shell}`}>
      <div className={maxW}>
        <motion.div
          {...v}
          variants={fadeUp()}
          className="relative mx-auto max-w-[900px] overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-white/75 py-14 text-center shadow-[0_36px_100px_-48px_rgba(28,27,25,0.3)] backdrop-blur-sm md:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[58%] h-[min(90vw,420px)] w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--zg-champagne)_30%,transparent)_0%,transparent_62%)]"
          />
          <h3
            className={`relative mx-auto max-w-[20ch] text-balance text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-[1.15] text-[var(--zg-ink)] ${serif.className}`}
          >
            Le quotidien du restaurateur, en un regard.
          </h3>
          <p className="relative mx-auto mt-4 max-w-md text-[1.02rem] text-[var(--zg-muted)]">
            Une composition calme — comme les meilleures interfaces hospitality.
          </p>

          <div className="relative mx-auto mt-12 h-[280px] max-w-[340px] sm:h-[300px]">
            {orbit.map((item, i) => (
              <motion.div
                key={item.label}
                className="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2"
                style={{ rotate: item.angle }}
                animate={
                  r
                    ? undefined
                    : {
                        rotate: [item.angle, item.angle + 3, item.angle],
                      }
                }
                transition={{ duration: 10 + i * 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute -top-[118px] left-1/2 w-[min(200px,70vw)] -translate-x-1/2"
                  style={{ rotate: -item.angle }}
                  animate={r ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 5 + i * 0.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <div className={`${cardBase} px-4 py-3 text-left shadow-[0_24px_70px_-40px_rgba(28,27,25,0.35)]`}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--zg-champagne)_32%,white)]">
                        <item.Icon className="h-4 w-4 text-[var(--zg-ink)]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--zg-ink)]">{item.label}</p>
                        <p className="text-[11px] text-[var(--zg-muted)]">{item.sub}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--zg-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--zg-champagne)_25%,white)] shadow-[0_24px_60px_-36px_rgba(28,27,25,0.35)]">
              <span className={`text-xl font-semibold text-[var(--zg-ink)] ${serif.className}`}>ZG</span>
            </div>
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
      description: "Pour lancer une présence moderne et convertir dès le premier jour.",
      features: [
        "page restaurant",
        "réservations illimitées",
        "menu",
        "galerie photos",
        "personnalisation",
        "expérience mobile",
        "support",
      ],
      cta: "Choisir Essentiel",
      highlight: false,
    },
    {
      name: "Growth",
      price: "69",
      description: "Pour activer marketing, données et automatisation sans complexité.",
      features: [
        "tout Essentiel",
        "campagnes marketing",
        "récupération clients",
        "automatisations",
        "avis Google",
        "analytics",
        "campagnes email",
      ],
      cta: "Choisir Growth",
      highlight: true,
    },
  ] as const;

  return (
    <section
      id="tarifs"
      className={`scroll-mt-24 py-20 md:py-28 lg:py-32 ${shell}`}
    >
      <div className={maxW}>
        <motion.div {...v} variants={fadeUp()} className="mx-auto max-w-[640px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--zg-muted)]">
            Tarifs
          </p>
          <h2
            className={`mt-4 text-balance text-[clamp(1.85rem,3.2vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
          >
            Simple et transparent.
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--zg-muted)]">
            Deux offres claires — sans surprise. Facturation mensuelle en CHF.
          </p>
        </motion.div>

        <motion.div
          {...v}
          variants={stagger}
          className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp(i * 0.07, 22)}
              className={`relative flex flex-col rounded-[1.75rem] border bg-white/85 p-8 shadow-[0_32px_90px_-48px_rgba(28,27,25,0.32)] backdrop-blur-sm transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 md:p-10 ${
                plan.highlight
                  ? "border-[color-mix(in_srgb,var(--zg-champagne)_45%,var(--zg-ink))] ring-1 ring-[color-mix(in_srgb,var(--zg-champagne)_35%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)]"
              }`}
            >
              {plan.highlight ? (
                <span className="absolute right-6 top-6 rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_38%,white)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--zg-ink)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_10%,transparent)]">
                  Recommandé
                </span>
              ) : null}
              <p className={`text-lg font-semibold text-[var(--zg-ink)] ${serif.className}`}>{plan.name}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className={`text-[clamp(2.75rem,5vw,3.5rem)] font-semibold tracking-tight text-[var(--zg-ink)] ${serif.className}`}>
                  {plan.price}
                </span>
                <span className="text-[15px] font-medium text-[var(--zg-muted)]">CHF / mois</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--zg-muted)] md:text-[15px]">{plan.description}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[14px] text-[var(--zg-ink)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--zg-champagne)_32%,white)] ring-1 ring-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-10 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-semibold transition ${
                  plan.highlight
                    ? "bg-[var(--zg-ink)] text-[var(--zg-cream)] shadow-[0_18px_44px_-24px_rgba(28,27,25,0.5)] hover:bg-[color-mix(in_srgb,var(--zg-ink)_92%,white)]"
                    : "border border-[color-mix(in_srgb,var(--zg-ink)_12%,transparent)] bg-white text-[var(--zg-ink)] hover:border-[color-mix(in_srgb,var(--zg-ink)_18%,transparent)]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SectionFinalCta() {
  const v = useInView();
  return (
    <section className={`pb-20 pt-4 md:pb-28 ${shell}`}>
      <motion.div
        {...v}
        variants={fadeUp(0, 20)}
        className={`${maxW} relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--zg-ink)_9%,transparent)] bg-[linear-gradient(145deg,var(--zg-ivory)_0%,color-mix(in_srgb,var(--zg-champagne)_18%,white)_45%,white_100%)] px-6 py-16 text-center shadow-[0_40px_100px_-50px_rgba(28,27,25,0.35)] md:px-16 md:py-24`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--zg-champagne) 20%, transparent) 0%, transparent 45%), radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--zg-beige) 16%, transparent) 0%, transparent 40%)",
          }}
        />
        <h2
          className={`relative mx-auto max-w-[22ch] text-balance text-[clamp(1.75rem,3.4vw,2.65rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--zg-ink)] ${serif.className}`}
        >
          Votre restaurant mérite mieux qu’un vieux site figé.
        </h2>
        <p className="relative mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[var(--zg-muted)] md:text-[1.125rem]">
          Créez une expérience moderne pensée pour la découverte, le mobile et la réservation instantanée.
        </p>
        <div className="relative mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--zg-ink)] px-9 py-4 text-[14px] font-semibold text-[var(--zg-cream)] shadow-[0_22px_50px_-28px_rgba(28,27,25,0.55)] transition hover:bg-[color-mix(in_srgb,var(--zg-ink)_92%,white)]"
          >
            Créer ma page restaurant
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color-mix(in_srgb,var(--zg-ink)_8%,transparent)] bg-[var(--zg-ivory)] py-14 md:py-20">
      <div className={`${maxW} grid gap-10 md:grid-cols-[1.2fr_1fr_1fr] ${shell}`}>
        <div>
          <p className={`text-lg font-semibold text-[var(--zg-ink)] ${serif.className}`}>ZenGrow</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--zg-muted)]">
            Une nouvelle manière pour les restaurants d’exister en ligne — découverte rapide, page élégante,
            réservation instantanée.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--zg-muted)]">Produit</p>
          <nav className="mt-4 flex flex-col gap-2">
            {nav.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[var(--zg-ink)]/75 hover:text-[var(--zg-ink)]">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--zg-muted)]">Compte</p>
          <nav className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium text-[var(--zg-ink)]/75 hover:text-[var(--zg-ink)]">
              Connexion
            </Link>
            <Link href="/signup" className="text-sm font-medium text-[var(--zg-ink)]/75 hover:text-[var(--zg-ink)]">
              Créer ma page
            </Link>
          </nav>
        </div>
      </div>
      <p className={`${maxW} mt-12 text-center text-xs text-[var(--zg-muted)] md:text-left ${shell}`}>
        © {new Date().getFullYear()} ZenGrow
      </p>
    </footer>
  );
}

export function ZenGrowLanding() {
  return (
    <div
      className={`${serif.variable} ${sans.variable} min-h-screen overflow-x-hidden bg-[var(--zg-ivory)] font-[family-name:var(--font-zg-sans),system-ui,sans-serif] text-[var(--zg-ink)] antialiased selection:bg-[color-mix(in_srgb,var(--zg-champagne)_45%,transparent)]`}
      style={
        {
          "--zg-ivory": "#faf8f5",
          "--zg-cream": "#f3eee6",
          "--zg-warm": "#ebe3d6",
          "--zg-beige": "#e5d9c8",
          "--zg-champagne": "#d4c4a8",
          "--zg-ink": "#2c2a27",
          "--zg-muted": "#6b6560",
        } as CSSProperties
      }
    >
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <SectionNarrative
          id="decouverte"
          title="Une présence moderne pensée pour le mobile."
          body={
            <>
              <p>
                Aujourd’hui, les clients découvrent un restaurant depuis Instagram, TikTok, Google Maps ou une
                recommandation.
              </p>
              <p>
                En quelques secondes, ils veulent comprendre l’ambiance, voir les plats et réserver. ZenGrow crée une
                page moderne, rapide et élégante conçue pour cette nouvelle façon de découvrir les restaurants.
              </p>
            </>
          }
          imageSrc={IMG_HERO_SIDE}
          imageLeft={false}
        />
        <TwoFeatureCards />
        <SectionCentered
          id="reservation"
          title="Réserver devient instantané."
          body={
            <>
              <p>Plus de sites compliqués. Plus de parcours interminables.</p>
              <p>
                Avec ZenGrow, le client arrive directement sur une expérience claire, immersive et optimisée pour réserver
                rapidement.
              </p>
            </>
          }
          className="bg-[color-mix(in_srgb,var(--zg-warm)_42%,white)]"
        />
        <SectionNarrative
          title="Votre restaurant évolue chaque jour. Votre page aussi."
          body={
            <>
              <p>
                Ajoutez une nouvelle carte. Mettez en avant un événement. Affichez un menu spécial. Changez vos photos.
              </p>
              <p>Tout se modifie en quelques secondes depuis votre interface ZenGrow.</p>
            </>
          }
          imageSrc={IMG_SECTION}
          imageLeft
        />
        <SectionPlatform />
        <SectionCustomers />
        <DemoShowcase />
        <SectionMobile />
        <OrbCta />
        <SectionPricing />
        <SectionFinalCta />
      </main>
      <Footer />
    </div>
  );
}
