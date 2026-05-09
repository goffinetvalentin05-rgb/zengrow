"use client";

import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Image as ImageIcon,
  MapPin,
  Menu as MenuIcon,
  Sparkles,
  Star,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";

// ───────────────────────────────────────────────────────────────────────────
// Typography
// ───────────────────────────────────────────────────────────────────────────

const displaySerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-zg-display",
});

// ───────────────────────────────────────────────────────────────────────────
// Photos (warm, premium hospitality)
// ───────────────────────────────────────────────────────────────────────────

const photos = {
  heroRestaurant:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=88",
  discoveryA:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=88",
  discoveryB:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=88",
  discoveryC:
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=88",
  productPhone:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=88",
  productDetail:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=1200&q=88",
  ctaBackdrop:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=2000&q=86",
} as const;

// ───────────────────────────────────────────────────────────────────────────
// Design tokens — champagne, cream, ink
// ───────────────────────────────────────────────────────────────────────────

const palette = {
  canvas: "#fbf8f3",
  canvasWarm: "#f5efe5",
  cream: "#ffffff",
  ink: "#14110d",
  inkSoft: "#3a3530",
  graphite: "#7a756e",
  mute: "#a8a39c",
  mist: "#e8dfd2",
  line: "rgba(20, 17, 13, 0.07)",
  lineStrong: "rgba(20, 17, 13, 0.1)",
  champagne: "#b8956a",
  champagneDark: "#8a6a42",
  champagneSoft: "#f3e8d4",
  champagneText: "#7a5e3d",
} as const;

const easeLux = [0.22, 1, 0.36, 1] as const;

// ───────────────────────────────────────────────────────────────────────────
// Motion helpers
// ───────────────────────────────────────────────────────────────────────────

function fadeUp(delay = 0, y = 22): Variants {
  return {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: easeLux, delay },
    },
  };
}

function useViewVariants() {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? undefined : "hidden",
    whileInView: reduce ? undefined : "show",
    viewport: { once: true, amount: 0.18 },
  } as const;
}

// ───────────────────────────────────────────────────────────────────────────
// Header — sticky, soft pill nav
// ───────────────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "#decouverte", label: "Découverte" },
  { href: "#reservation", label: "Réservation" },
  { href: "#produit", label: "Produit" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#tarifs", label: "Tarifs" },
];

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[#fbf8f3]/95 via-[#fbf8f3]/70 to-transparent backdrop-blur-md" />
      <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/Zengrow-logo.png"
            alt="ZenGrow"
            width={128}
            height={36}
            className="h-5 w-auto object-contain opacity-90 sm:h-[1.4rem]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(20,17,13,0.07)] bg-white/70 px-2 py-1.5 shadow-[0_8px_28px_-22px_rgba(20,17,13,0.25)] backdrop-blur-md md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium text-[#3a3530] transition hover:bg-[#f5efe5] hover:text-[#14110d]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-[0.8125rem] font-medium text-[#3a3530] transition hover:text-[#14110d] sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#14110d] px-4 py-2.5 text-[0.8125rem] font-semibold text-[#fbf8f3] shadow-[0_10px_30px_-12px_rgba(20,17,13,0.5)] transition hover:bg-[#252220] sm:px-5"
          >
            Créer ma page
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(20,17,13,0.08)] bg-white/80 text-[#14110d] md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="relative mx-4 mb-2 rounded-2xl border border-[rgba(20,17,13,0.08)] bg-white/95 p-2 shadow-[0_24px_60px_-30px_rgba(20,17,13,0.35)] backdrop-blur-md md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[0.875rem] font-medium text-[#3a3530] transition hover:bg-[#f5efe5]"
            >
              {l.label}
              <ChevronRight className="h-4 w-4 text-[#a8a39c]" />
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// HERO — centered, big serif, floating premium composition
// ───────────────────────────────────────────────────────────────────────────

function HeroComposition() {
  const reduce = useReducedMotion();

  const floatA: TargetAndTransition | undefined = reduce
    ? undefined
    : {
        y: [0, -10, 0],
        transition: {
          duration: 7.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      };

  const floatB: TargetAndTransition | undefined = reduce
    ? undefined
    : {
        y: [0, -14, 0],
        transition: {
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.6,
        },
      };

  const floatC: TargetAndTransition | undefined = reduce
    ? undefined
    : {
        y: [0, -8, 0],
        transition: {
          duration: 6.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.2,
        },
      };

  return (
    <div className="relative mx-auto mt-16 w-full max-w-[1080px] sm:mt-20 lg:mt-24">
      {/* Soft glow under the composition */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,149,106,0.18), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      {/* Floor shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20px] left-1/2 h-12 w-[80%] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(20,17,13,0.18), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex h-[420px] items-center justify-center sm:h-[480px] lg:h-[520px]">
        {/* Left floating card — confirmation */}
        <motion.div
          animate={floatA}
          className="absolute left-[2%] top-[18%] z-20 hidden w-[260px] sm:block lg:left-[4%]"
        >
          <div className="overflow-hidden rounded-2xl border border-[rgba(20,17,13,0.07)] bg-white p-4 shadow-[0_24px_60px_-32px_rgba(20,17,13,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf6ee]">
                <Check className="h-4 w-4 text-[#3f8c5b]" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
                  Confirmé
                </p>
                <p
                  className="font-[family-name:var(--font-zg-display),serif] mt-0.5 text-[1rem] font-semibold leading-tight text-[#14110d]"
                >
                  Samedi · 20:30
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[0.75rem] text-[#7a756e]">
              <Users className="h-3.5 w-3.5" strokeWidth={2} />
              <span>2 personnes — Maison Lumière</span>
            </div>
          </div>
        </motion.div>

        {/* Center floating card — restaurant page */}
        <motion.div animate={floatB} className="relative z-30 w-[280px] sm:w-[320px]">
          <RestaurantPagePreview />
        </motion.div>

        {/* Right floating card — quick reservation slot */}
        <motion.div
          animate={floatC}
          className="absolute right-[2%] top-[14%] z-20 hidden w-[240px] sm:block lg:right-[4%]"
        >
          <div className="overflow-hidden rounded-2xl border border-[rgba(20,17,13,0.07)] bg-white p-4 shadow-[0_24px_60px_-32px_rgba(20,17,13,0.35)]">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
              Choisissez un créneau
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t, i) => (
                <button
                  type="button"
                  key={t}
                  className={`rounded-lg px-2 py-2 text-[0.6875rem] font-semibold transition ${
                    i === 3
                      ? "bg-[#14110d] text-[#fbf8f3]"
                      : "bg-[#f5efe5] text-[#3a3530] hover:bg-[#ebe1ce]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[rgba(20,17,13,0.08)] bg-white py-2 text-[0.6875rem] font-semibold text-[#14110d] transition hover:bg-[#f5efe5]"
            >
              Continuer
              <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
            </button>
          </div>
        </motion.div>

        {/* Mobile floating cards — stacked below */}
        <div className="absolute inset-x-0 -bottom-4 flex justify-center gap-3 sm:hidden">
          <div className="rounded-xl border border-[rgba(20,17,13,0.07)] bg-white px-3 py-2 text-[0.625rem] font-semibold text-[#14110d] shadow-[0_12px_30px_-18px_rgba(20,17,13,0.3)]">
            <Check className="mr-1 inline h-3 w-3 text-[#3f8c5b]" strokeWidth={2.4} />
            Réservé · 20:30
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantPagePreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.08)] bg-white shadow-[0_40px_80px_-40px_rgba(20,17,13,0.45)]">
      {/* Hero image */}
      <div className="relative h-[180px] w-full sm:h-[200px]">
        <Image
          src={photos.heroRestaurant}
          alt="Maison Lumière"
          fill
          className="object-cover object-[center_42%]"
          sizes="320px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110d]/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.625rem] font-semibold text-[#14110d] backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3f8c5b]" />
          Ouvert · 18:30
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div>
            <p
              className="font-[family-name:var(--font-zg-display),serif] text-[1.35rem] font-semibold leading-tight text-white"
            >
              Maison Lumière
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] text-white/85">
              <MapPin className="h-3 w-3" strokeWidth={2.2} />
              Quartier des Arts · Genève
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.625rem] font-semibold text-[#14110d] backdrop-blur">
            <Star className="h-3 w-3 fill-[#b8956a] text-[#b8956a]" strokeWidth={2} />
            4.9
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          {(["Cuisine du marché", "Vins nature", "Saisonnier"] as const).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f5efe5] px-2.5 py-1 text-[0.625rem] font-medium text-[#7a5e3d]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1.5 rounded-xl bg-[#fbf8f3] p-2.5">
          {(
            [
              ["Entrée", "Burrata, figues rôties"],
              ["Plat", "Cabillaud, beurre noisette"],
              ["Dessert", "Tarte fine, crème glacée"],
            ] as const
          ).map(([label, name]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-[0.6875rem]"
            >
              <span className="font-semibold uppercase tracking-wide text-[#a8a39c]">{label}</span>
              <span className="truncate font-medium text-[#3a3530]">{name}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#14110d] py-2.5 text-[0.75rem] font-semibold text-[#fbf8f3] transition hover:bg-[#252220]"
        >
          <Calendar className="h-3.5 w-3.5" strokeWidth={2.2} />
          Réserver une table
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
      {/* Subtle decorative glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,149,106,0.10), transparent 60%),
            radial-gradient(ellipse 35% 25% at 0% 30%, rgba(232,223,210,0.55), transparent 55%),
            radial-gradient(ellipse 35% 25% at 100% 35%, rgba(232,223,210,0.45), transparent 55%)
          `,
        }}
      />

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeLux }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,149,106,0.3)] bg-white/70 px-3.5 py-1.5 text-[0.6875rem] font-semibold text-[#7a5e3d] shadow-[0_6px_18px_-12px_rgba(184,149,106,0.4)] backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b8956a] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#b8956a]" />
          </span>
          Nouvelle façon pour les restaurants d&apos;exister en ligne
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeLux, delay: 0.05 }}
          className={`${display} mt-7 max-w-[20ch] text-balance text-[2.4rem] font-medium leading-[1.04] tracking-[-0.035em] text-[#14110d] sm:max-w-[24ch] sm:text-[3.4rem] md:max-w-[22ch] md:text-[4.25rem] lg:text-[4.85rem]`}
        >
          Les clients ne veulent plus chercher.
          <span className="mt-2 block sm:mt-3">
            Ils veulent{" "}
            <span className="italic font-normal text-[#b8956a]">réserver immédiatement.</span>
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeLux, delay: 0.12 }}
          className="mx-auto mt-7 max-w-xl text-balance text-[1rem] leading-[1.7] text-[#3a3530] sm:mt-8 sm:max-w-2xl sm:text-[1.0625rem]"
        >
          Aujourd&apos;hui, un restaurant se découvre en quelques secondes.
          <span className="mt-1 block text-[#7a756e]">
            ZenGrow transforme cette découverte en réservation.
          </span>
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeLux, delay: 0.18 }}
          className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#14110d] px-7 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#fbf8f3] shadow-[0_18px_44px_-22px_rgba(20,17,13,0.55)] transition hover:bg-[#252220]"
          >
            Créer ma page restaurant
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
          <a
            href="#produit"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,17,13,0.12)] bg-white px-7 py-3.5 text-[0.875rem] font-semibold text-[#14110d] transition hover:border-[rgba(20,17,13,0.2)] hover:bg-[#f5efe5]"
          >
            Voir la démo
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#b8956a]" />
          </a>
        </motion.div>

        <HeroComposition />

        {/* Trust line */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 1, ease: easeLux, delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-4 sm:mt-20"
        >
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#a8a39c]">
            Choisi par des maisons exigeantes en Suisse
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[0.875rem] font-[family-name:var(--font-zg-display),serif] italic text-[#7a756e]">
            <span>Maison Lumière</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#a8a39c] sm:inline-block" />
            <span>L&apos;Atelier</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#a8a39c] sm:inline-block" />
            <span>Café Verand&apos;</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#a8a39c] sm:inline-block" />
            <span>Tableau Noir</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#a8a39c] sm:inline-block" />
            <span>Maison 28</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Découverte (nouvelle manière de découvrir un restaurant)
// ───────────────────────────────────────────────────────────────────────────

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#7a5e3d]">
      <span className="h-px w-6 bg-[#b8956a]/60" />
      {children}
    </span>
  );
}

function DecouverteSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="decouverte"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v} className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp(0)}>
            <SectionKicker>Découverte</SectionKicker>
          </motion.div>
          <motion.h2
            variants={fadeUp(0.05)}
            className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
          >
            Une nouvelle manière de découvrir un restaurant.
          </motion.h2>
          <motion.p
            variants={fadeUp(0.1)}
            className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
          >
            En quelques secondes, vos invités sentent l&apos;atmosphère, lisent l&apos;essentiel, et
            décident — comme on tourne la page d&apos;une revue.
          </motion.p>
        </motion.div>

        <motion.div {...v} className="mt-14 grid gap-4 sm:grid-cols-12 lg:gap-5">
          {/* Big card — atmosphere */}
          <motion.article
            variants={fadeUp(0)}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.07)] bg-white shadow-[0_24px_60px_-44px_rgba(20,17,13,0.3)] sm:col-span-7 sm:min-h-[420px]"
          >
            <div className="relative h-[260px] sm:absolute sm:inset-0 sm:h-auto">
              <Image
                src={photos.discoveryA}
                alt="Atmosphère restaurant"
                fill
                className="object-cover object-[center_42%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14110d]/70 via-[#14110d]/15 to-transparent" />
            </div>
            <div className="relative p-6 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:p-9">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.625rem] font-semibold text-[#14110d] backdrop-blur">
                <ImageIcon className="h-3 w-3" strokeWidth={2.2} />
                Une vraie ambiance
              </p>
              <p
                className={`${display} mt-4 max-w-md text-[1.65rem] font-medium leading-[1.1] text-white sm:text-[2rem]`}
              >
                Une preuve visuelle avant le premier plat.
              </p>
              <p className="mt-3 max-w-md text-[0.875rem] leading-relaxed text-white/85">
                Photos justes, lumière chaude, rythme calme — assez pour faire naître l&apos;envie.
              </p>
            </div>
          </motion.article>

          {/* Right column — two stacked cards */}
          <div className="grid gap-4 sm:col-span-5 lg:gap-5">
            <motion.article
              variants={fadeUp(0.05)}
              className="rounded-[1.5rem] border border-[rgba(20,17,13,0.07)] bg-white p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.22)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3e8d4] text-[#7a5e3d]">
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </div>
              <p
                className={`${display} mt-5 text-[1.4rem] font-medium leading-[1.15] text-[#14110d]`}
              >
                Une lecture courte, nette, mémorable.
              </p>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-[#7a756e]">
                L&apos;essentiel apparaît tout de suite : quartier, horaire, esprit. Pas de menu
                déroulant, pas de page d&apos;accueil chargée.
              </p>
            </motion.article>

            <motion.article
              variants={fadeUp(0.1)}
              className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(20,17,13,0.07)] bg-[#f5efe5] p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.22)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(184,149,106,0.28), transparent 65%)",
                }}
              />
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7a5e3d]">
                  <Heart className="h-4 w-4" strokeWidth={2} />
                </div>
                <p
                  className={`${display} mt-5 text-[1.4rem] font-medium leading-[1.15] text-[#14110d]`}
                >
                  Le ton de la maison, partout.
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-[#3a3530]">
                  Du premier mot à la confirmation : la voix de votre salle, jamais celle d&apos;un
                  formulaire générique.
                </p>
              </div>
            </motion.article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Réservation instantanée (split avec UI flow clair)
// ───────────────────────────────────────────────────────────────────────────

function ReservationFlowPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(184,149,106,0.18), transparent 65%)",
          filter: "blur(36px)",
        }}
      />
      <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.08)] bg-white shadow-[0_36px_80px_-48px_rgba(20,17,13,0.4)]">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[rgba(20,17,13,0.05)] bg-[#fbf8f3] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#b8956a]" />
            <span className="text-[0.75rem] font-semibold text-[#14110d]">
              Réserver chez Maison Lumière
            </span>
          </div>
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#a8a39c]">
            étape 1/2
          </span>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Date pills */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
              Date
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  { d: "Ven", n: "07" },
                  { d: "Sam", n: "08" },
                  { d: "Dim", n: "09" },
                  { d: "Lun", n: "10" },
                  { d: "Mar", n: "11" },
                ] as const
              ).map((p, i) => (
                <button
                  type="button"
                  key={p.n}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2 text-center transition ${
                    i === 1
                      ? "border-[#14110d] bg-[#14110d] text-[#fbf8f3]"
                      : "border-[rgba(20,17,13,0.08)] bg-white text-[#3a3530] hover:bg-[#f5efe5]"
                  }`}
                >
                  <span className="text-[0.625rem] font-medium uppercase tracking-wide opacity-80">
                    {p.d}
                  </span>
                  <span className="text-[0.95rem] font-semibold">{p.n}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guests */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
              Personnes
            </p>
            <div className="mt-3 flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-[0.8125rem] font-semibold transition ${
                    n === 2
                      ? "bg-[#14110d] text-[#fbf8f3]"
                      : "border border-[rgba(20,17,13,0.08)] bg-white text-[#3a3530] hover:bg-[#f5efe5]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[rgba(20,17,13,0.15)] text-[#7a756e]"
              >
                +
              </button>
            </div>
          </div>

          {/* Time slots */}
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
              Créneau · service du soir
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {(
                [
                  { t: "18:30", active: false },
                  { t: "19:00", active: false },
                  { t: "19:30", active: false },
                  { t: "20:00", active: true },
                  { t: "20:30", active: false },
                  { t: "21:00", active: false },
                ] as const
              ).map((s) => (
                <button
                  type="button"
                  key={s.t}
                  className={`rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition ${
                    s.active
                      ? "bg-[#b8956a] text-[#14110d] shadow-[0_8px_22px_-12px_rgba(184,149,106,0.6)]"
                      : "bg-[#fbf8f3] text-[#3a3530] hover:bg-[#f3e8d4]"
                  }`}
                >
                  {s.t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between gap-4 border-t border-[rgba(20,17,13,0.05)] bg-[#fbf8f3] px-6 py-4">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
              Récap
            </p>
            <p className="mt-0.5 text-[0.8125rem] font-semibold text-[#14110d]">
              Sam. 08 · 20:00 · 2 pers.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#14110d] px-4 py-2.5 text-[0.75rem] font-semibold text-[#fbf8f3] transition hover:bg-[#252220]"
          >
            Confirmer
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReservationSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="reservation"
      className="relative scroll-mt-20 border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/55 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <motion.div {...v}>
            <motion.div variants={fadeUp(0)}>
              <SectionKicker>Réservation instantanée</SectionKicker>
            </motion.div>
            <motion.h2
              variants={fadeUp(0.05)}
              className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.2rem]`}
            >
              Du désir à la table, en trois gestes.
            </motion.h2>
            <motion.p
              variants={fadeUp(0.1)}
              className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
            >
              Un créneau lisible. Une confirmation douce. Aucune friction. Vos invités
              réservent comme on glisse un mot à l&apos;hôtesse — naturellement.
            </motion.p>

            <motion.ul variants={fadeUp(0.15)} className="mt-8 space-y-4">
              {(
                [
                  {
                    icon: Clock,
                    label: "Disponibilité en temps réel",
                    text: "Synchro instantanée avec votre carnet, sans double saisie.",
                  },
                  {
                    icon: Check,
                    label: "Confirmation immédiate",
                    text: "L'invité reçoit sa table en moins de 5 secondes.",
                  },
                  {
                    icon: Heart,
                    label: "Rappel discret",
                    text: "Un message juste, dans le ton de la maison, avant la venue.",
                  },
                ] as const
              ).map((item) => (
                <li key={item.label} className="flex gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7a5e3d] shadow-[0_6px_16px_-10px_rgba(20,17,13,0.2)]">
                    <item.icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-[#14110d]">{item.label}</p>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-[#7a756e]">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div {...v} variants={fadeUp(0.1, 32)}>
            <ReservationFlowPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Présentation produit (mockup phone clean)
// ───────────────────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[340px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(184,149,106,0.18), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.75rem] border-[10px] border-[#14110d] bg-[#14110d] shadow-[0_44px_90px_-40px_rgba(20,17,13,0.55)]">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-5 py-2 text-[0.625rem] font-semibold text-[#14110d]">
            <span>9:41</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1 w-3 rounded-sm bg-[#14110d]/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#14110d]/70" />
              <span className="h-2 w-3.5 rounded-sm border border-[#14110d]/70" />
            </span>
          </div>

          {/* Hero image */}
          <div className="relative h-[180px] w-full">
            <Image
              src={photos.productPhone}
              alt="Maison Lumière"
              fill
              className="object-cover object-[center_42%]"
              sizes="340px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110d]/55 via-transparent to-transparent" />
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#14110d] backdrop-blur"
            >
              <Heart className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-[family-name:var(--font-zg-display),serif] text-[1.35rem] font-semibold leading-tight text-white">
                Maison Lumière
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[0.625rem] text-white/90">
                <MapPin className="h-3 w-3" strokeWidth={2.2} />
                Quartier des Arts · Genève
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 pt-3">
            {(["Présentation", "Menu", "Avis"] as const).map((t, i) => (
              <span
                key={t}
                className={`rounded-full px-3 py-1 text-[0.625rem] font-semibold ${
                  i === 0
                    ? "bg-[#14110d] text-[#fbf8f3]"
                    : "bg-[#f5efe5] text-[#3a3530]"
                }`}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Body */}
          <div className="space-y-3 px-4 pt-3">
            <p className="text-[0.6875rem] leading-relaxed text-[#7a756e]">
              Une cuisine du marché, autour du feu et du soin. Vins nature, salle de 28 couverts.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { icon: Utensils, label: "Marché" },
                  { icon: Star, label: "4.9 / 5" },
                  { icon: Clock, label: "18h-23h" },
                ] as const
              ).map((h) => (
                <div
                  key={h.label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-[#fbf8f3] px-2 py-2.5"
                >
                  <h.icon className="h-3 w-3 text-[#7a5e3d]" strokeWidth={2} />
                  <span className="text-[0.625rem] font-semibold text-[#14110d]">{h.label}</span>
                </div>
              ))}
            </div>

            {/* Reserve sticky */}
            <div className="rounded-2xl bg-[#14110d] p-3">
              <div className="flex items-center justify-between text-[#fbf8f3]">
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] opacity-70">
                    Ce soir
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-zg-display),serif] text-[1rem] font-semibold">
                    Tables disponibles
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-[#fbf8f3] px-3 py-1.5 text-[0.6875rem] font-semibold text-[#14110d]"
                >
                  Réserver
                  <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProduitSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="produit"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v} className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp(0)}>
            <SectionKicker>Le produit</SectionKicker>
          </motion.div>
          <motion.h2
            variants={fadeUp(0.05)}
            className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
          >
            Une page restaurant
            <span className="italic font-normal text-[#b8956a]"> pensée pour le pouce.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp(0.1)}
            className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
          >
            Hiérarchie éditoriale, respiration, gestes naturels : votre maison se lit comme une
            invitation, jamais comme un menu PDF.
          </motion.p>
        </motion.div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <motion.div {...v} variants={fadeUp(0, 28)}>
            <PhoneMockup />
          </motion.div>

          <motion.div {...v} className="space-y-8">
            {(
              [
                {
                  title: "Une vitrine éditoriale",
                  text:
                    "Photos, ton, hiérarchie : votre identité respectée, sans template SaaS générique.",
                },
                {
                  title: "Réservation intégrée",
                  text:
                    "Le bouton réserver est toujours à portée de pouce. Aucun saut vers une autre app.",
                },
                {
                  title: "Lecture instantanée",
                  text:
                    "L\u2019invité comprend votre maison en moins de cinq secondes — quartier, cuisine, ambiance.",
                },
                {
                  title: "Mise à jour en un instant",
                  text:
                    "Menu du jour, photos, message : publié vite, rendu impeccable, partout.",
                },
              ] as const
            ).map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp(i * 0.05)}
                className="border-l-2 border-[#f3e8d4] pl-5 transition hover:border-[#b8956a]"
              >
                <p
                  className={`${display} text-[1.35rem] font-medium leading-tight text-[#14110d]`}
                >
                  {item.title}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#7a756e]">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Plateforme restaurant (features cards)
// ───────────────────────────────────────────────────────────────────────────

const platformFeatures = [
  {
    icon: ImageIcon,
    title: "Mini-site premium",
    text: "Une page d\u2019accueil élégante, votre vitrine numérique haut de gamme.",
  },
  {
    icon: Calendar,
    title: "Réservations directes",
    text: "Sans intermédiaire, sans commission. Votre carnet vous appartient.",
  },
  {
    icon: Heart,
    title: "Relation invité soignée",
    text: "Confirmations, rappels, mots du chef — toujours dans votre voix.",
  },
  {
    icon: Star,
    title: "Avis maîtrisés",
    text: "Collectez, répondez et mettez en avant — sans bruit ni surcharge.",
  },
  {
    icon: Users,
    title: "Mémoire client",
    text: "Préférences, allergies, anniversaires : reconnus sans étiquette.",
  },
  {
    icon: Sparkles,
    title: "Mises en lumière",
    text: "Soirées, dégustations, lancements : racontés comme il faut.",
  },
] as const;

function PlateformeSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="plateforme"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v} className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp(0)}>
            <SectionKicker>Plateforme restaurant</SectionKicker>
          </motion.div>
          <motion.h2
            variants={fadeUp(0.05)}
            className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
          >
            Tout ce qu&apos;il vous faut.
            <span className="italic font-normal text-[#b8956a]"> Rien de plus.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp(0.1)}
            className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
          >
            Une plateforme pensée pour les restaurants qui veulent une présence digitale élégante
            et un carnet de réservation simple.
          </motion.p>
        </motion.div>

        <motion.div
          {...v}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {platformFeatures.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp(i * 0.04)}
              className="group relative overflow-hidden rounded-[1.5rem] border border-[rgba(20,17,13,0.07)] bg-white p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.18)] transition hover:-translate-y-0.5 hover:border-[rgba(184,149,106,0.35)] hover:shadow-[0_26px_56px_-36px_rgba(184,149,106,0.35)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgba(184,149,106,0.18), transparent 65%)",
                }}
              />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3e8d4] text-[#7a5e3d] transition group-hover:bg-[#b8956a] group-hover:text-white">
                  <f.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <p
                  className={`${display} mt-5 text-[1.35rem] font-medium leading-tight text-[#14110d]`}
                >
                  {f.title}
                </p>
                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-[#7a756e]">
                  {f.text}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Gestion simplifiée
// ───────────────────────────────────────────────────────────────────────────

function GestionSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="gestion"
      className="relative scroll-mt-20 border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/50 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
          <motion.div {...v} variants={fadeUp(0, 28)}>
            <OperationsPreview />
          </motion.div>

          <motion.div {...v}>
            <motion.div variants={fadeUp(0)}>
              <SectionKicker>Gestion simplifiée</SectionKicker>
            </motion.div>
            <motion.h2
              variants={fadeUp(0.05)}
              className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.2rem]`}
            >
              Moins de bruit, plus de salle.
            </motion.h2>
            <motion.p
              variants={fadeUp(0.1)}
              className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
            >
              Réservations, préférences, événements, réputation : l&apos;essentiel regroupé,
              dans une interface lumineuse — pour que vos équipes restent concentrées sur le service.
            </motion.p>

            <motion.div variants={fadeUp(0.15)} className="mt-8 grid gap-3 sm:grid-cols-2">
              {(
                [
                  "Une vue claire du service",
                  "Mises à jour en un clic",
                  "Préférences mémorisées",
                  "Notifications discrètes",
                ] as const
              ).map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[0.875rem] font-medium text-[#3a3530]"
                >
                  <Check className="h-4 w-4 shrink-0 text-[#b8956a]" strokeWidth={2.4} />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OperationsPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(184,149,106,0.15), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.07)] bg-white shadow-[0_36px_80px_-48px_rgba(20,17,13,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(20,17,13,0.05)] bg-[#fbf8f3] px-5 py-4">
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#a8a39c]">
              Aujourd&apos;hui
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-zg-display),serif] text-[1.05rem] font-semibold text-[#14110d]">
              Service du soir
            </p>
          </div>
          <span className="rounded-full bg-[#eaf6ee] px-3 py-1 text-[0.6875rem] font-semibold text-[#3f8c5b]">
            Tout fluide
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 border-b border-[rgba(20,17,13,0.05)] p-5">
          {(
            [
              { l: "Couverts", v: "24" },
              { l: "Confirmés", v: "94%" },
              { l: "En attente", v: "3" },
            ] as const
          ).map((k) => (
            <div
              key={k.l}
              className="rounded-xl border border-[rgba(20,17,13,0.05)] bg-[#fbf8f3] p-3"
            >
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
                {k.l}
              </p>
              <p className="mt-1 text-[1.35rem] font-semibold text-[#14110d]">{k.v}</p>
            </div>
          ))}
        </div>

        {/* Reservations list */}
        <div className="divide-y divide-[rgba(20,17,13,0.04)]">
          {(
            [
              { t: "19:00", n: "Lefèvre", g: 2, s: "Confirmé" },
              { t: "19:30", n: "Dubois", g: 4, s: "Confirmé" },
              { t: "20:00", n: "Moreau", g: 2, s: "En attente" },
              { t: "20:30", n: "Caron", g: 3, s: "Confirmé" },
            ] as const
          ).map((r) => (
            <div
              key={`${r.t}-${r.n}`}
              className="flex items-center justify-between px-5 py-3.5 text-[0.8125rem]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf8f3] text-[0.6875rem] font-semibold text-[#14110d]">
                  {r.t}
                </span>
                <div>
                  <p className="font-semibold text-[#14110d]">{r.n}</p>
                  <p className="text-[0.6875rem] text-[#a8a39c]">{r.g} personnes</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[0.625rem] font-semibold ${
                  r.s === "Confirmé"
                    ? "bg-[#eaf6ee] text-[#3f8c5b]"
                    : "bg-[#f3e8d4] text-[#7a5e3d]"
                }`}
              >
                {r.s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Tarifs (toggle mensuel/annuel + cards)
// ───────────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Salle",
    tagline: "Pour démarrer en beauté avec une vitrine impeccable.",
    monthly: 49,
    yearly: 39,
    highlight: false,
    features: [
      "Mini-site premium ZenGrow",
      "Réservation instantanée",
      "Confirmations & rappels",
      "Page mobile éditoriale",
    ],
    cta: "Commencer",
  },
  {
    name: "Maison",
    tagline: "L'expérience complète : présence, relation, événements.",
    monthly: 69,
    yearly: 55,
    highlight: true,
    features: [
      "Tout l'inclus de Salle",
      "Mémoire client & préférences",
      "Événements & cartes saisonnières",
      "Avis & campagnes maîtrisées",
    ],
    cta: "Choisir Maison",
  },
] as const;

function TarifsSection() {
  const display = displaySerif.className;
  const v = useViewVariants();
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="tarifs"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1100px]">
        <motion.div {...v} className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp(0)}>
            <SectionKicker>Tarifs</SectionKicker>
          </motion.div>
          <motion.h2
            variants={fadeUp(0.05)}
            className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
          >
            Deux profondeurs.
            <span className="italic font-normal text-[#b8956a]"> Une même exigence.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp(0.1)}
            className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
          >
            Facturation transparente. Aucun frais caché. Sans engagement.
          </motion.p>

          {/* Toggle */}
          <motion.div
            variants={fadeUp(0.15)}
            className="mx-auto mt-8 inline-flex items-center gap-1 rounded-full border border-[rgba(20,17,13,0.08)] bg-white p-1 shadow-[0_8px_22px_-16px_rgba(20,17,13,0.25)]"
          >
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-[0.75rem] font-semibold transition ${
                !yearly ? "bg-[#14110d] text-[#fbf8f3]" : "text-[#7a756e]"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`relative rounded-full px-4 py-1.5 text-[0.75rem] font-semibold transition ${
                yearly ? "bg-[#14110d] text-[#fbf8f3]" : "text-[#7a756e]"
              }`}
            >
              Annuel
              <span className="absolute -right-1 -top-2 rounded-full bg-[#b8956a] px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-[#14110d]">
                -20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <motion.article
                key={plan.name}
                {...v}
                variants={fadeUp(i * 0.06, 24)}
                className={`relative flex flex-col overflow-hidden rounded-[1.85rem] border p-8 sm:p-9 ${
                  plan.highlight
                    ? "border-[rgba(184,149,106,0.4)] bg-gradient-to-br from-white via-[#fdf9f1] to-[#f3e8d4] shadow-[0_36px_80px_-44px_rgba(184,149,106,0.4)]"
                    : "border-[rgba(20,17,13,0.08)] bg-white shadow-[0_18px_44px_-36px_rgba(20,17,13,0.2)]"
                }`}
              >
                {plan.highlight ? (
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#b8956a]/10 blur-2xl" />
                ) : null}

                <div className="relative flex items-center justify-between">
                  <h3
                    className={`${display} text-[1.65rem] font-medium text-[#14110d] sm:text-[1.85rem]`}
                  >
                    {plan.name}
                  </h3>
                  {plan.highlight ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14110d] px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#fbf8f3]">
                      <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                      Recommandé
                    </span>
                  ) : null}
                </div>
                <p className="relative mt-2.5 text-[0.875rem] leading-relaxed text-[#7a756e]">
                  {plan.tagline}
                </p>

                <div className="relative mt-8 flex items-baseline gap-2">
                  <span className="text-[3rem] font-semibold tracking-tight text-[#14110d] sm:text-[3.4rem]">
                    {price}
                  </span>
                  <span className="text-[1rem] font-medium text-[#7a756e]">CHF / mois</span>
                </div>
                {yearly ? (
                  <p className="mt-1 text-[0.75rem] font-medium text-[#7a5e3d]">
                    Facturé {price * 12} CHF par an
                  </p>
                ) : (
                  <p className="mt-1 text-[0.75rem] text-[#a8a39c]">
                    Sans engagement, résiliable à tout moment
                  </p>
                )}

                <ul className="relative mt-8 flex-1 space-y-3.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-[#3a3530]"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlight
                            ? "bg-[#14110d] text-[#fbf8f3]"
                            : "bg-[#f3e8d4] text-[#7a5e3d]"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.6} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`relative mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[0.875rem] font-semibold transition ${
                    plan.highlight
                      ? "bg-[#14110d] text-[#fbf8f3] shadow-[0_18px_44px_-22px_rgba(20,17,13,0.55)] hover:bg-[#252220]"
                      : "border border-[rgba(20,17,13,0.12)] text-[#14110d] hover:bg-[#f5efe5]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — CTA final
// ───────────────────────────────────────────────────────────────────────────

function CTASection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section className="relative px-4 pb-24 pt-12 sm:px-6 sm:pb-28 lg:px-8">
      <motion.div
        {...v}
        variants={fadeUp(0, 28)}
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-[rgba(20,17,13,0.08)] bg-gradient-to-br from-white via-[#fdf9f1] to-[#f3e8d4] shadow-[0_36px_80px_-48px_rgba(184,149,106,0.45)]"
      >
        {/* Decorative photo, very faint */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <Image
            src={photos.ctaBackdrop}
            alt=""
            fill
            className="object-cover object-[center_38%]"
            sizes="100vw"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 100%, rgba(184,149,106,0.22), transparent 60%)",
          }}
        />

        <div className="relative flex flex-col items-center px-6 py-20 text-center sm:px-12 sm:py-24 lg:py-28">
          <SectionKicker>Prêts à commencer</SectionKicker>
          <h2
            className={`${display} mt-6 max-w-3xl text-balance text-[2.2rem] font-medium leading-[1.05] tracking-[-0.03em] text-[#14110d] sm:text-[3rem] md:text-[3.6rem]`}
          >
            La présence en ligne
            <span className="italic font-normal text-[#b8956a]"> à la hauteur de votre table.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]">
            En quelques minutes : une page qui raconte l&apos;essentiel, et des réservations qui
            s&apos;installent sans bruit.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#14110d] px-7 py-3.5 text-[0.875rem] font-semibold text-[#fbf8f3] shadow-[0_18px_44px_-22px_rgba(20,17,13,0.55)] transition hover:bg-[#252220]"
            >
              Créer ma page restaurant
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,17,13,0.12)] bg-white/80 px-7 py-3.5 text-[0.875rem] font-semibold text-[#14110d] backdrop-blur transition hover:bg-white"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          <p className="mt-6 text-[0.75rem] text-[#a8a39c]">
            Sans carte bancaire · Configuration en 5 minutes
          </p>
        </div>
      </motion.div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// FOOTER
// ───────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[rgba(20,17,13,0.06)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/Zengrow-logo.png"
            alt="ZenGrow"
            width={104}
            height={30}
            className="h-4 w-auto object-contain opacity-80"
          />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[0.75rem] text-[#7a756e]">
          {navLinks.slice(0, 4).map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-[#14110d]">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="transition hover:text-[#14110d]">
            Connexion
          </Link>
          <Link href="/signup" className="transition hover:text-[#14110d]">
            Inscription
          </Link>
        </div>
        <p className="text-[0.75rem] text-[#a8a39c]">
          © {new Date().getFullYear()} ZenGrow
        </p>
      </div>
    </footer>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// EXPORT
// ───────────────────────────────────────────────────────────────────────────

export function ZenGrowLanding() {
  return (
    <div
      className={`${displaySerif.variable} min-h-screen overflow-x-hidden text-[#14110d] antialiased selection:bg-[#b8956a]/25 selection:text-[#14110d]`}
      style={{ backgroundColor: palette.canvas }}
    >
      <Header />
      <main className="relative font-[family-name:var(--font-geist-sans),system-ui,sans-serif]">
        <Hero />
        <DecouverteSection />
        <ReservationSection />
        <ProduitSection />
        <PlateformeSection />
        <GestionSection />
        <TarifsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
