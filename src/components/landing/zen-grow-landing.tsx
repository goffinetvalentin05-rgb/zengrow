"use client";

import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
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
// Photos
// ───────────────────────────────────────────────────────────────────────────

const photos = {
  heroRestaurant:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=88",
  storyA:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=88",
  storyB:
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1400&q=88",
  storyC:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1400&q=88",
  productPhone:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=88",
  ctaBackdrop:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=2000&q=86",
  founder:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=88",
  avatar1:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  avatar2:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  avatar3:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  avatar4:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
} as const;

// ───────────────────────────────────────────────────────────────────────────
// Design tokens — champagne, cream, ink
// ───────────────────────────────────────────────────────────────────────────

const palette = {
  canvas: "#fbf8f3",
  canvasWarm: "#f5efe5",
  ink: "#14110d",
  inkSoft: "#3a3530",
  graphite: "#7a756e",
  mute: "#a8a39c",
  mist: "#e8dfd2",
  champagne: "#b8956a",
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
// Header
// ───────────────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "#benefices", label: "Bénéfices" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#process", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
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
            Commencer
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
// HERO + composition flottante
// ───────────────────────────────────────────────────────────────────────────

function RestaurantPagePreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.08)] bg-white shadow-[0_40px_80px_-40px_rgba(20,17,13,0.45)]">
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
            <p className="font-[family-name:var(--font-zg-display),serif] text-[1.35rem] font-semibold leading-tight text-white">
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

function HeroComposition() {
  const reduce = useReducedMotion();

  const floatA: TargetAndTransition | undefined = reduce
    ? undefined
    : {
        y: [0, -10, 0],
        transition: { duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,149,106,0.18), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
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
                <p className="font-[family-name:var(--font-zg-display),serif] mt-0.5 text-[1rem] font-semibold leading-tight text-[#14110d]">
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

        {/* Center — restaurant page */}
        <motion.div animate={floatB} className="relative z-30 w-[280px] sm:w-[320px]">
          <RestaurantPagePreview />
        </motion.div>

        {/* Right — slot picker */}
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
      </div>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
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
          La présence digitale moderne pour restaurants
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
            href="#fonctionnalites"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,17,13,0.12)] bg-white px-7 py-3.5 text-[0.875rem] font-semibold text-[#14110d] transition hover:border-[rgba(20,17,13,0.2)] hover:bg-[#f5efe5]"
          >
            Voir la démo
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#b8956a]" />
          </a>
        </motion.div>

        <HeroComposition />

        {/* Founder quote */}
        <motion.figure
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: easeLux, delay: 0.1 }}
          className="mx-auto mt-16 max-w-2xl text-center sm:mt-20"
        >
          <Quote className="mx-auto h-5 w-5 text-[#b8956a]" strokeWidth={2} />
          <blockquote
            className={`${display} mt-4 text-[1.4rem] font-medium italic leading-snug text-[#3a3530] sm:text-[1.65rem]`}
          >
            &ldquo;Un restaurant ne se choisit plus dans un guide. Il se choisit en trois
            secondes, sur un téléphone, à 19h. ZenGrow donne à votre maison la place qu&apos;elle
            mérite dans ce moment-là.&rdquo;
          </blockquote>
          <figcaption className="mt-5 inline-flex items-center gap-3">
            <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-full border border-[rgba(20,17,13,0.08)]">
              <Image src={photos.founder} alt="" fill className="object-cover" sizes="36px" />
            </span>
            <span className="text-left">
              <span className="block text-[0.8125rem] font-semibold text-[#14110d]">
                Co-fondateur
              </span>
              <span className="block text-[0.6875rem] text-[#a8a39c]">ZenGrow</span>
            </span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Marquee tags — bandeau scroll défilant
// ───────────────────────────────────────────────────────────────────────────

const tagWords = [
  "Réservation directe",
  "0% de commission",
  "Mini-site éditorial",
  "Confirmations automatiques",
  "Mémoire client",
  "Avis maîtrisés",
  "Carte vivante",
  "Voix de la maison",
  "Synchro temps réel",
  "Analytics service",
];

function TagsMarquee() {
  const reduce = useReducedMotion();
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/60 py-5"
    >
      <div className="relative flex">
        <motion.div
          className="flex shrink-0 gap-3 whitespace-nowrap pr-3"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={
            reduce
              ? undefined
              : { duration: 38, ease: "linear", repeat: Number.POSITIVE_INFINITY }
          }
        >
          {[...tagWords, ...tagWords].map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,17,13,0.07)] bg-white px-4 py-1.5 text-[0.75rem] font-medium text-[#3a3530]"
            >
              <span className="h-1 w-1 rounded-full bg-[#b8956a]" />
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION KICKER + heading helpers
// ───────────────────────────────────────────────────────────────────────────

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#7a5e3d]">
      <span className="h-px w-6 bg-[#b8956a]/60" />
      {children}
    </span>
  );
}

function SectionHeading({
  kicker,
  title,
  emphasis,
  subtitle,
}: {
  kicker: string;
  title: string;
  emphasis?: string;
  subtitle?: string;
}) {
  const display = displaySerif.className;
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div variants={fadeUp(0)}>
        <SectionKicker>{kicker}</SectionKicker>
      </motion.div>
      <motion.h2
        variants={fadeUp(0.05)}
        className={`${display} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
      >
        {title}
        {emphasis ? (
          <>
            {" "}
            <span className="italic font-normal text-[#b8956a]">{emphasis}</span>
          </>
        ) : null}
      </motion.h2>
      {subtitle ? (
        <motion.p
          variants={fadeUp(0.1)}
          className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530] sm:text-[1.0625rem]"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Bénéfices (Why Choose ZenGrow) avec mini-visuels
// ───────────────────────────────────────────────────────────────────────────

function VisuRealtime() {
  const display = displaySerif.className;
  const data = [40, 55, 48, 70, 62, 88, 95];
  const max = Math.max(...data);
  return (
    <div className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
          7 derniers jours
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6ee] px-2 py-0.5 text-[0.625rem] font-semibold text-[#3f8c5b]">
          <TrendingUp className="h-3 w-3" strokeWidth={2.4} />
          +47%
        </span>
      </div>
      <p className={`${display} mt-1 text-[1.6rem] font-semibold text-[#14110d]`}>
        128 réservations
      </p>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${(v / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeLux, delay: i * 0.05 }}
            className={`flex-1 rounded-t ${
              i === data.length - 1 ? "bg-[#b8956a]" : "bg-[#e8dfd2]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function VisuBeforeAfter() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4">
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
          Avant
        </span>
        <p className="mt-2 text-[1.5rem] font-semibold text-[#3a3530]">32%</p>
        <p className="text-[0.6875rem] text-[#a8a39c]">de no-show</p>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(184,149,106,0.3)] bg-gradient-to-br from-white to-[#f3e8d4] p-4">
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#7a5e3d]">
          Après
        </span>
        <p className="mt-2 text-[1.5rem] font-semibold text-[#14110d]">8%</p>
        <p className="text-[0.6875rem] text-[#7a5e3d]">de no-show</p>
        <BadgeCheck
          className="absolute right-2 top-2 h-4 w-4 text-[#b8956a]"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

function VisuTeamSync() {
  const team = [photos.avatar1, photos.avatar2, photos.avatar3, photos.avatar4];
  return (
    <div className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#a8a39c]">
          Équipe en service
        </span>
        <span className="inline-flex items-center gap-1 text-[0.625rem] font-semibold text-[#3f8c5b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3f8c5b]" />
          En ligne
        </span>
      </div>
      <div className="mt-4 flex -space-x-2">
        {team.map((a, i) => (
          <span
            key={i}
            className="relative inline-flex h-9 w-9 overflow-hidden rounded-full border-2 border-white"
          >
            <Image src={a} alt="" fill className="object-cover" sizes="36px" />
          </span>
        ))}
        <span className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-3 text-[0.6875rem] font-semibold text-[#14110d]">
          +3
        </span>
      </div>
      <div className="mt-4 space-y-1.5">
        {(
          [
            { who: "Camille", what: "a confirmé 19:30" },
            { who: "Thomas", what: "a placé 4 pers." },
          ] as const
        ).map((l) => (
          <div
            key={l.what}
            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[0.6875rem] text-[#3a3530]"
          >
            <span className="h-1 w-1 rounded-full bg-[#b8956a]" />
            <span className="font-semibold text-[#14110d]">{l.who}</span>
            <span className="text-[#7a756e]">{l.what}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisuCustomer() {
  return (
    <div className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-10 w-10 overflow-hidden rounded-full border border-[rgba(20,17,13,0.08)]">
          <Image src={photos.avatar2} alt="" fill className="object-cover" sizes="40px" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-semibold text-[#14110d]">Sophie Lefèvre</p>
          <p className="text-[0.6875rem] text-[#a8a39c]">8 visites · cliente fidèle</p>
        </div>
        <Heart className="h-3.5 w-3.5 text-[#b8956a]" strokeWidth={2} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {(
          [
            { l: "Vins", v: "Rouge" },
            { l: "Allergie", v: "Noix" },
            { l: "Fêtée", v: "12 mai" },
          ] as const
        ).map((d) => (
          <div key={d.l} className="rounded-lg bg-white px-2 py-1.5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#a8a39c]">
              {d.l}
            </p>
            <p className="mt-0.5 truncate text-[0.6875rem] font-semibold text-[#14110d]">{d.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const benefits = [
  {
    title: "Réservations en temps réel",
    text: "Suivez les flux du soir comme on lit un instrument de bord — calme, précis, lisible.",
    Visu: VisuRealtime,
  },
  {
    title: "Croissance maîtrisée",
    text: "Moins de no-shows, plus de tables remplies. Une mécanique douce qui se ressent vite.",
    Visu: VisuBeforeAfter,
  },
  {
    title: "Synchro instantanée",
    text: "Toute l\u2019équipe voit la même chose, partout. Les passages d\u2019info disparaissent.",
    Visu: VisuTeamSync,
  },
  {
    title: "Mémoire client",
    text: "Préférences, allergies, anniversaires : reconnus au bon moment, sans étiquette.",
    Visu: VisuCustomer,
  },
];

function BenefitsSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="benefices"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Bénéfices"
            title="Pourquoi choisir"
            emphasis="ZenGrow."
            subtitle="Une plateforme pensée pour les restaurants qui veulent une présence digitale élégante et une mécanique de réservation sans friction."
          />
        </motion.div>

        <motion.div {...v} className="mt-14 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {benefits.map((b, i) => (
            <motion.article
              key={b.title}
              variants={fadeUp(i * 0.05)}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.07)] bg-white p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.18)] transition hover:-translate-y-0.5 hover:border-[rgba(184,149,106,0.3)] hover:shadow-[0_26px_60px_-40px_rgba(184,149,106,0.35)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgba(184,149,106,0.16), transparent 65%)",
                }}
              />
              <div className="relative">
                <p
                  className={`${display} text-[1.5rem] font-medium leading-tight text-[#14110d] sm:text-[1.65rem]`}
                >
                  {b.title}
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[#7a756e]">{b.text}</p>
                <div className="mt-6">
                  <b.Visu />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Fonctionnalités (Features grid avec mini graphiques)
// ───────────────────────────────────────────────────────────────────────────

function FeatureMiniSite() {
  return (
    <div className="relative h-[140px] overflow-hidden rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3]">
      <Image
        src={photos.heroRestaurant}
        alt=""
        fill
        className="object-cover object-[center_45%]"
        sizes="280px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#14110d]/65 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="font-[family-name:var(--font-zg-display),serif] text-[1rem] font-semibold leading-tight text-white">
          Maison Lumière
        </p>
        <p className="text-[0.625rem] text-white/85">Quartier des Arts · Genève</p>
      </div>
    </div>
  );
}

function FeatureBookingFlow() {
  return (
    <div className="space-y-2 rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-3">
      <div className="grid grid-cols-3 gap-1.5">
        {(
          [
            { t: "19:30", a: false },
            { t: "20:00", a: true },
            { t: "20:30", a: false },
          ] as const
        ).map((s) => (
          <div
            key={s.t}
            className={`rounded-lg px-2 py-2 text-center text-[0.6875rem] font-semibold ${
              s.a ? "bg-[#14110d] text-[#fbf8f3]" : "bg-white text-[#3a3530]"
            }`}
          >
            {s.t}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2">
        <span className="text-[0.6875rem] text-[#7a756e]">Sam. 08 · 2 pers.</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6ee] px-2 py-0.5 text-[0.6rem] font-semibold text-[#3f8c5b]">
          <Check className="h-2.5 w-2.5" strokeWidth={3} /> Confirmé
        </span>
      </div>
    </div>
  );
}

function FeatureReviews() {
  return (
    <div className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4">
      <div className="flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-zg-display),serif] text-[1.85rem] font-semibold text-[#14110d]">
          4.9
        </span>
        <span className="text-[0.6875rem] text-[#a8a39c]">/ 5 · 184 avis</span>
      </div>
      <div className="mt-2 flex">
        {[0, 1, 2, 3, 4].map((s) => (
          <Star
            key={s}
            className="h-3.5 w-3.5 fill-[#b8956a] text-[#b8956a]"
            strokeWidth={1.5}
          />
        ))}
      </div>
      <div className="mt-3 space-y-1">
        {([5, 4, 3, 2, 1] as const).map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <span className="w-2 text-[0.625rem] text-[#a8a39c]">{n}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-white">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${[88, 8, 3, 1, 0][i]}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: easeLux, delay: i * 0.06 }}
                className="h-1 rounded-full bg-[#b8956a]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVoice() {
  return (
    <div className="space-y-1.5 rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-3.5">
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#14110d] px-3 py-2 text-[0.6875rem] font-medium text-[#fbf8f3]">
          Bonjour, êtes-vous ouverts samedi ?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[0.6875rem] font-medium text-[#3a3530]">
          Oui — il nous reste deux tables à 20:30. Souhaitez-vous que je vous les réserve ?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="inline-flex items-center gap-1 rounded-full bg-[#f3e8d4] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-[#7a5e3d]">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2} /> Voix de la maison
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: ImageIcon,
    title: "Mini-site éditorial",
    text: "Une vitrine élégante : votre restaurant comme dans un magazine, pas comme un PDF.",
    Visu: FeatureMiniSite,
  },
  {
    icon: Zap,
    title: "Réservation directe",
    text: "Le client choisit son créneau en trois gestes. Vous gardez la main, sans intermédiaire.",
    Visu: FeatureBookingFlow,
  },
  {
    icon: Star,
    title: "Avis maîtrisés",
    text: "Collectez, analysez et mettez en avant — les bons mots, au bon endroit.",
    Visu: FeatureReviews,
  },
  {
    icon: MessageCircle,
    title: "Voix de la maison",
    text: "Confirmations, rappels, échanges : toujours dans votre ton, jamais générique.",
    Visu: FeatureVoice,
  },
];

function FeaturesSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="fonctionnalites"
      className="relative scroll-mt-20 border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/55 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Fonctionnalités"
            title="Tout ce qu'il vous faut."
            emphasis="Rien de plus."
            subtitle="Quatre modules, pensés pour fonctionner ensemble — et chacun assez simple pour être utilisé un soir de service."
          />
        </motion.div>

        <motion.div {...v} className="mt-14 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              variants={fadeUp(i * 0.05)}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(20,17,13,0.07)] bg-white p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.18)] transition hover:-translate-y-0.5 hover:border-[rgba(184,149,106,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3e8d4] text-[#7a5e3d] transition group-hover:bg-[#b8956a] group-hover:text-white">
                  <f.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
              </div>
              <p
                className={`${display} mt-5 text-[1.5rem] font-medium leading-tight text-[#14110d] sm:text-[1.65rem]`}
              >
                {f.title}
              </p>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[#7a756e]">{f.text}</p>
              <div className="mt-6">
                <f.Visu />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Process Simple & Scalable (01/02/03)
// ───────────────────────────────────────────────────────────────────────────

const processSteps = [
  {
    n: "01",
    title: "Configuration en 5 minutes",
    text: "Vous remplissez l'essentiel — nom, photos, créneaux, ton de la maison. ZenGrow fait le reste.",
    Icon: Sparkles,
  },
  {
    n: "02",
    title: "Lancement de votre page",
    text: "Votre mini-site éditorial part en ligne. Réservation directe activée, sans intermédiaire.",
    Icon: Zap,
  },
  {
    n: "03",
    title: "Croissance & relation",
    text: "Confirmations, rappels, mémoire client, avis : tout s'installe naturellement, dans votre voix.",
    Icon: TrendingUp,
  },
];

function ProcessSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section
      id="process"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Comment ça marche"
            title="Simple."
            emphasis="Évolutif."
            subtitle="Trois étapes claires, un accompagnement discret. Vous restez maître de votre maison, du début à la fin."
          />
        </motion.div>

        <motion.div {...v} className="mt-16 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {processSteps.map((s, i) => (
            <motion.article
              key={s.n}
              variants={fadeUp(i * 0.08)}
              className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(20,17,13,0.07)] bg-white p-8 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.18)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(184,149,106,0.14), transparent 65%)",
                }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  className={`${display} text-[3.2rem] font-medium leading-none text-[#b8956a]/80`}
                >
                  {s.n}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fbf8f3] text-[#7a5e3d]">
                  <s.Icon className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
              <p
                className={`${display} mt-6 text-[1.45rem] font-medium leading-tight text-[#14110d]`}
              >
                {s.title}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-[#7a756e]">{s.text}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* Connector line under steps for desktop */}
        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-[#14110d] px-6 py-3 text-[0.8125rem] font-semibold text-[#fbf8f3] shadow-[0_18px_44px_-22px_rgba(20,17,13,0.55)] transition hover:bg-[#252220]"
          >
            Démarrer en 5 minutes
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Stories / Cas client (Projects)
// ───────────────────────────────────────────────────────────────────────────

const stories = [
  {
    name: "Maison Lumière",
    place: "Genève",
    image: photos.storyA,
    quote:
      "Notre vitrine ressemble enfin à notre salle. Les invités sentent l'adresse, puis réservent — sans détour.",
    person: "Camille R., propriétaire",
    metrics: [
      { v: "+47%", l: "réservations directes" },
      { v: "8%", l: "no-show (vs 32%)" },
    ],
  },
  {
    name: "L'Atelier",
    place: "Lausanne",
    image: photos.storyB,
    quote:
      "Tout est plus calme. Le service ne court plus après les confirmations, et les invités reviennent.",
    person: "Thomas V., chef",
    metrics: [
      { v: "4.9 / 5", l: "satisfaction invités" },
      { v: "0%", l: "commission de plateforme" },
    ],
  },
  {
    name: "Café Verand'",
    place: "Vevey",
    image: photos.storyC,
    quote:
      "On a gagné une présence — et un carnet. Le tout en gardant notre voix, ce qui n'a pas de prix.",
    person: "Léa M., fondatrice",
    metrics: [
      { v: "5 min", l: "pour publier la page" },
      { v: "+62%", l: "nouveaux clients" },
    ],
  },
];

function StoriesSection() {
  const display = displaySerif.className;
  const v = useViewVariants();
  const [active, setActive] = useState(0);
  const story = stories[active];

  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Maisons clientes"
            title="Des résultats"
            emphasis="qui ressemblent à vous."
            subtitle="Trois maisons, trois ambitions. Une même mécanique : présence soignée, réservations directes, relation invité maîtrisée."
          />
        </motion.div>

        {/* Selector tabs */}
        <motion.div
          {...v}
          variants={fadeUp(0.05)}
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {stories.map((s, i) => (
            <button
              type="button"
              key={s.name}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-[0.75rem] font-semibold transition ${
                i === active
                  ? "border-[#14110d] bg-[#14110d] text-[#fbf8f3]"
                  : "border-[rgba(20,17,13,0.1)] bg-white text-[#3a3530] hover:border-[rgba(184,149,106,0.4)]"
              }`}
            >
              {s.name}
              <span className="ml-2 text-[#a8a39c]">· {s.place}</span>
            </button>
          ))}
        </motion.div>

        {/* Active story */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: easeLux }}
            className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8"
          >
            <div className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(20,17,13,0.07)] bg-white shadow-[0_24px_60px_-44px_rgba(20,17,13,0.3)]">
              <div className="relative h-[280px] sm:h-[380px]">
                <Image
                  src={story.image}
                  alt={story.name}
                  fill
                  className="object-cover object-[center_45%]"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14110d]/65 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {story.place}
                  </p>
                  <p
                    className={`${display} mt-1 text-[2rem] font-medium leading-tight text-white`}
                  >
                    {story.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[1.85rem] border border-[rgba(20,17,13,0.07)] bg-white p-8 shadow-[0_24px_60px_-44px_rgba(20,17,13,0.3)] sm:p-10">
              <div>
                <Quote className="h-5 w-5 text-[#b8956a]" strokeWidth={2} />
                <p
                  className={`${display} mt-4 text-[1.4rem] font-medium leading-snug text-[#14110d] sm:text-[1.55rem]`}
                >
                  &ldquo;{story.quote}&rdquo;
                </p>
                <p className="mt-4 text-[0.8125rem] font-medium text-[#7a756e]">{story.person}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {story.metrics.map((m) => (
                  <div
                    key={m.l}
                    className="rounded-2xl border border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] p-4"
                  >
                    <p
                      className={`${display} text-[1.85rem] font-semibold leading-none text-[#14110d]`}
                    >
                      {m.v}
                    </p>
                    <p className="mt-1.5 text-[0.6875rem] uppercase tracking-wide text-[#a8a39c]">
                      {m.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Stats globales
// ───────────────────────────────────────────────────────────────────────────

const stats = [
  { v: "200+", l: "Restaurants ZenGrow" },
  { v: "4.9 / 5", l: "Satisfaction invités" },
  { v: "0%", l: "Commission de plateforme" },
  { v: "5 min", l: "Pour démarrer" },
];

function StatsSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section className="relative px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <motion.div
        {...v}
        className="mx-auto grid max-w-[1280px] gap-3 rounded-[1.85rem] border border-[rgba(20,17,13,0.07)] bg-white p-8 shadow-[0_24px_60px_-44px_rgba(20,17,13,0.25)] sm:grid-cols-2 lg:grid-cols-4 lg:p-10"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            variants={fadeUp(i * 0.05)}
            className={`flex flex-col items-start sm:items-center sm:text-center lg:items-start lg:text-left ${
              i > 0
                ? "border-t border-[rgba(20,17,13,0.06)] pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"
                : ""
            } ${i === 2 ? "lg:border-l lg:pl-5" : ""}`}
          >
            <span
              className={`${display} text-[2.4rem] font-semibold leading-none tracking-tight text-[#14110d] sm:text-[2.85rem]`}
            >
              {s.v}
            </span>
            <span className="mt-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[#a8a39c]">
              {s.l}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Tarifs (3 plans + toggle)
// ───────────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Solo",
    tagline: "Pour le restaurant indépendant qui veut une vitrine impeccable.",
    monthly: 29,
    yearly: 23,
    highlight: false,
    badge: null,
    features: [
      "Mini-site premium ZenGrow",
      "Réservation instantanée",
      "Confirmations & rappels",
      "1 utilisateur",
    ],
    cta: "Commencer",
  },
  {
    name: "Maison",
    tagline: "L'expérience complète : présence, relation, événements, réputation.",
    monthly: 69,
    yearly: 55,
    highlight: true,
    badge: "Le plus choisi",
    features: [
      "Tout l'inclus de Solo",
      "Mémoire client & préférences",
      "Avis & campagnes maîtrisées",
      "Carte saisonnière & événements",
      "5 utilisateurs",
    ],
    cta: "Choisir Maison",
  },
  {
    name: "Collection",
    tagline: "Pour groupes et collections de maisons à orchestrer ensemble.",
    monthly: 149,
    yearly: 119,
    highlight: false,
    badge: null,
    features: [
      "Multi-établissements",
      "Vue consolidée & analytics",
      "Voix unifiée, identité par maison",
      "Utilisateurs illimités",
      "Accompagnement dédié",
    ],
    cta: "Parlons-en",
  },
] as const;

function TarifsSection() {
  const display = displaySerif.className;
  const v = useViewVariants();
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="tarifs"
      className="relative scroll-mt-20 border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/50 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Tarifs"
            title="Trois profondeurs."
            emphasis="Une même exigence."
            subtitle="Facturation transparente. Aucun frais caché. Sans engagement."
          />
        </motion.div>

        {/* Toggle */}
        <motion.div
          {...v}
          variants={fadeUp(0.15)}
          className="mt-8 flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(20,17,13,0.08)] bg-white p-1 shadow-[0_8px_22px_-16px_rgba(20,17,13,0.25)]">
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
          </div>
        </motion.div>

        <motion.div
          {...v}
          className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <motion.article
                key={plan.name}
                variants={fadeUp(i * 0.06, 24)}
                className={`relative flex flex-col overflow-hidden rounded-[1.85rem] border p-7 sm:p-8 ${
                  plan.highlight
                    ? "border-[rgba(184,149,106,0.4)] bg-gradient-to-br from-white via-[#fdf9f1] to-[#f3e8d4] shadow-[0_36px_80px_-44px_rgba(184,149,106,0.4)] lg:scale-[1.03]"
                    : "border-[rgba(20,17,13,0.08)] bg-white shadow-[0_18px_44px_-36px_rgba(20,17,13,0.2)]"
                }`}
              >
                {plan.highlight ? (
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#b8956a]/10 blur-2xl" />
                ) : null}

                <div className="relative flex items-center justify-between">
                  <h3
                    className={`${display} text-[1.55rem] font-medium text-[#14110d] sm:text-[1.7rem]`}
                  >
                    {plan.name}
                  </h3>
                  {plan.badge ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14110d] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#fbf8f3]">
                      <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <p className="relative mt-2 text-[0.8125rem] leading-relaxed text-[#7a756e]">
                  {plan.tagline}
                </p>

                <div className="relative mt-7 flex items-baseline gap-2">
                  <span className="text-[2.6rem] font-semibold tracking-tight text-[#14110d] sm:text-[3rem]">
                    {price}
                  </span>
                  <span className="text-[0.9375rem] font-medium text-[#7a756e]">CHF / mois</span>
                </div>
                {yearly ? (
                  <p className="mt-1 text-[0.7rem] font-medium text-[#7a5e3d]">
                    Facturé {price * 12} CHF par an
                  </p>
                ) : (
                  <p className="mt-1 text-[0.7rem] text-[#a8a39c]">Sans engagement</p>
                )}

                <ul className="relative mt-7 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-[#3a3530]"
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
                  className={`relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-[0.875rem] font-semibold transition ${
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
        </motion.div>

        <motion.p
          {...v}
          variants={fadeUp(0.2)}
          className="mt-10 text-center text-[0.75rem] text-[#a8a39c]"
        >
          Tous les plans incluent : 0% de commission sur les réservations · données hébergées en
          Europe · support en français
        </motion.p>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Comparison ZenGrow vs Autres
// ───────────────────────────────────────────────────────────────────────────

const comparisonRows = [
  {
    label: "Réservations sans commission",
    zg: "0% — votre carnet vous appartient",
    other: "8 à 15% par couvert",
  },
  {
    label: "Présence en ligne",
    zg: "Mini-site éditorial sur-mesure",
    other: "Profil dans un annuaire générique",
  },
  {
    label: "Voix de la maison",
    zg: "Confirmations, rappels et messages dans votre ton",
    other: "Templates standards impersonnels",
  },
  {
    label: "Mémoire client",
    zg: "Préférences et données chez vous",
    other: "Données détenues par la plateforme",
  },
  {
    label: "Configuration",
    zg: "Cinq minutes, sans technique",
    other: "Setup complexe, accompagnement payant",
  },
  {
    label: "Engagement",
    zg: "Sans engagement, résiliable à tout moment",
    other: "Contrats annuels avec pénalités",
  },
];

function ComparisonSection() {
  const display = displaySerif.className;
  const v = useViewVariants();

  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Comparaison"
            title="ZenGrow,"
            emphasis="ou les autres."
            subtitle="Une autre manière de penser la présence digitale d'un restaurant — moins extractive, plus respectueuse."
          />
        </motion.div>

        <motion.div
          {...v}
          variants={fadeUp(0.1)}
          className="mt-14 grid gap-5 lg:grid-cols-2"
        >
          {/* ZenGrow column */}
          <div className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(184,149,106,0.4)] bg-gradient-to-br from-white via-[#fdf9f1] to-[#f3e8d4] p-7 shadow-[0_24px_60px_-44px_rgba(184,149,106,0.4)] sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#b8956a]/12 blur-2xl"
            />
            <div className="relative flex items-center gap-3">
              <Image
                src="/Zengrow-logo.png"
                alt="ZenGrow"
                width={104}
                height={28}
                className="h-5 w-auto object-contain"
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14110d] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#fbf8f3]">
                <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                Recommandé
              </span>
            </div>
            <p className={`${display} relative mt-5 text-[1.5rem] font-medium text-[#14110d]`}>
              La voie ZenGrow
            </p>
            <ul className="relative mt-6 space-y-4">
              {comparisonRows.map((r) => (
                <li key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14110d] text-[#fbf8f3]">
                    <Check className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-[#7a5e3d]">
                      {r.label}
                    </p>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-[#14110d]">
                      {r.zg}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Others column */}
          <div className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(20,17,13,0.07)] bg-white p-7 shadow-[0_18px_44px_-36px_rgba(20,17,13,0.2)] sm:p-9">
            <div className="flex items-center gap-3">
              <span
                className={`${display} text-[1.25rem] font-medium text-[#a8a39c]`}
              >
                Plateformes classiques
              </span>
            </div>
            <p className={`${display} mt-5 text-[1.5rem] font-medium text-[#7a756e]`}>
              L&apos;ancienne approche
            </p>
            <ul className="mt-6 space-y-4">
              {comparisonRows.map((r) => (
                <li key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5efe5] text-[#a8a39c]">
                    <Minus className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-[#a8a39c]">
                      {r.label}
                    </p>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-[#7a756e]">
                      {r.other}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — Témoignages
// ───────────────────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote:
      "Nos invités ne lisent plus un site. Ils sentent l'adresse, puis réservent. C'est exactement le geste qu'on voulait.",
    name: "Camille R.",
    role: "Maison 28 places · Genève",
    avatar: photos.avatar1,
  },
  {
    quote:
      "Enfin une présence en ligne qui ressemble à notre salle : calme, chaleureuse, précise.",
    name: "Thomas V.",
    role: "Service & réservations · Lausanne",
    avatar: photos.avatar2,
  },
  {
    quote:
      "Le menu est devenu une vraie lecture. Les réservations suivent, sans friction.",
    name: "Léa M.",
    role: "Fondatrice · bistro contemporain",
    avatar: photos.avatar3,
  },
  {
    quote:
      "On gagne du temps côté équipe et de la clarté côté client. Rare, aujourd'hui.",
    name: "Julien K.",
    role: "Directeur · restaurant signature",
    avatar: photos.avatar4,
  },
];

function TestimonialsSection() {
  const v = useViewVariants();
  return (
    <section className="relative border-y border-[rgba(20,17,13,0.06)] bg-[#f5efe5]/55 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <motion.div {...v}>
          <SectionHeading
            kicker="Témoignages"
            title="Ce que disent"
            emphasis="les maisons."
            subtitle="Des restaurateurs qui ont retrouvé du temps, de la présence, et une mécanique de réservation qui leur ressemble."
          />
        </motion.div>

        <motion.div
          {...v}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        >
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              variants={fadeUp(i * 0.05)}
              className="flex h-full flex-col rounded-[1.5rem] border border-[rgba(20,17,13,0.07)] bg-white p-6 shadow-[0_16px_40px_-36px_rgba(20,17,13,0.18)]"
            >
              <div className="mb-4 flex">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5 fill-[#b8956a] text-[#b8956a]"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="flex-1 text-[0.9375rem] leading-[1.65] text-[#3a3530]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="relative inline-flex h-10 w-10 overflow-hidden rounded-full border border-[rgba(20,17,13,0.08)]">
                  <Image src={t.avatar} alt="" fill className="object-cover" sizes="40px" />
                </span>
                <div>
                  <p className="text-[0.8125rem] font-semibold text-[#14110d]">{t.name}</p>
                  <p className="text-[0.7rem] text-[#a8a39c]">{t.role}</p>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// SECTION — FAQ accordion
// ───────────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Combien de temps pour démarrer ?",
    a: "Cinq minutes suffisent. Vous renseignez l'essentiel — nom, photos, créneaux, ton de la maison — et votre page part en ligne, prête à recevoir des réservations.",
  },
  {
    q: "Y a-t-il une commission sur les réservations ?",
    a: "Aucune. Toutes les réservations passent par votre propre page ZenGrow. Vous payez un abonnement clair, et chaque couvert reste 100% vôtre.",
  },
  {
    q: "Mes données client m'appartiennent-elles ?",
    a: "Oui, intégralement. Vos préférences invités, historiques et listes ne sont jamais revendues. Vous pouvez les exporter à tout moment.",
  },
  {
    q: "Puis-je personnaliser ma page ?",
    a: "Photos, ton, mise en page, menu : tout est ajustable depuis un éditeur simple. Et nos équipes peuvent vous accompagner sur le ton si vous le souhaitez.",
  },
  {
    q: "Comment se passe la transition depuis mon outil actuel ?",
    a: "Nous reprenons vos créneaux, vos clients récurrents et votre identité visuelle. La bascule est faite en une journée, sans interruption de service.",
  },
  {
    q: "Que se passe-t-il si je veux arrêter ?",
    a: "Vous résiliez en un clic, sans frais ni pénalité. Vos données restent exportables pendant 90 jours.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const display = displaySerif.className;
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(20,17,13,0.07)] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-[#fbf8f3]"
      >
        <span
          className={`${display} text-[1.125rem] font-medium leading-tight text-[#14110d] sm:text-[1.2rem]`}
        >
          {q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5efe5] text-[#7a5e3d] transition ${
            open ? "rotate-180 bg-[#14110d] text-[#fbf8f3]" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeLux }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-[0.9375rem] leading-relaxed text-[#7a756e]">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FaqSection() {
  const v = useViewVariants();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <motion.div {...v}>
            <SectionKicker>FAQ</SectionKicker>
            <h2
              className={`${displaySerif.className} mt-5 text-[2.1rem] font-medium leading-[1.06] tracking-[-0.028em] text-[#14110d] sm:text-[2.85rem] md:text-[3.25rem]`}
            >
              Questions fréquentes,
              <span className="italic font-normal text-[#b8956a]"> réponses claires.</span>
            </h2>
            <p className="mt-5 text-[1rem] leading-[1.7] text-[#3a3530]">
              Vous ne trouvez pas votre question ? Écrivez-nous, on répond vite — et toujours
              comme un humain.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[rgba(20,17,13,0.08)] bg-white px-4 py-2 text-[0.8125rem] font-medium text-[#3a3530]">
              <MessageCircle className="h-4 w-4 text-[#b8956a]" strokeWidth={2} />
              support@zengrow.app
            </div>
          </motion.div>

          <motion.div {...v} className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div key={f.q} variants={fadeUp(i * 0.04)}>
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
            Sans carte bancaire · Configuration en 5 minutes · 0% de commission
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
  const display = displaySerif.className;
  return (
    <footer className="border-t border-[rgba(20,17,13,0.06)] bg-[#fbf8f3] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/Zengrow-logo.png"
                alt="ZenGrow"
                width={128}
                height={36}
                className="h-5 w-auto object-contain opacity-90"
              />
            </Link>
            <p
              className={`${display} mt-5 max-w-xs text-[1.05rem] italic leading-snug text-[#7a756e]`}
            >
              Une nouvelle façon pour les restaurants d&apos;exister en ligne.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(20,17,13,0.08)] bg-white px-3 py-1.5 text-[0.7rem] font-medium text-[#3a3530]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3f8c5b]" />
              Tous les systèmes opérationnels
            </div>
          </div>

          {[
            {
              title: "Produit",
              links: [
                { l: "Bénéfices", h: "#benefices" },
                { l: "Fonctionnalités", h: "#fonctionnalites" },
                { l: "Comment ça marche", h: "#process" },
                { l: "Tarifs", h: "#tarifs" },
                { l: "FAQ", h: "#faq" },
              ],
            },
            {
              title: "Compte",
              links: [
                { l: "Connexion", h: "/login" },
                { l: "Créer un compte", h: "/signup" },
                { l: "Mot de passe oublié", h: "/forgot-password" },
              ],
            },
            {
              title: "Maison",
              links: [
                { l: "support@zengrow.app", h: "mailto:support@zengrow.app" },
                { l: "Hébergement européen", h: "#" },
                { l: "Confidentialité", h: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[#a8a39c]">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.l}>
                    <Link
                      href={l.h}
                      className="text-[0.875rem] text-[#3a3530] transition hover:text-[#14110d]"
                    >
                      {l.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(20,17,13,0.06)] pt-6 sm:flex-row">
          <p className="text-[0.75rem] text-[#a8a39c]">
            © {new Date().getFullYear()} ZenGrow — Conçu en Suisse, pour des maisons exigeantes.
          </p>
          <p className="inline-flex items-center gap-2 text-[0.75rem] text-[#a8a39c]">
            <Bell className="h-3 w-3" strokeWidth={2} />
            Dernière mise à jour il y a 2 jours
          </p>
        </div>
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
        <TagsMarquee />
        <BenefitsSection />
        <FeaturesSection />
        <ProcessSection />
        <StoriesSection />
        <StatsSection />
        <TarifsSection />
        <ComparisonSection />
        <TestimonialsSection />
        <FaqSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
