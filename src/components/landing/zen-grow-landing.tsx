"use client";

import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, MapPin, Sparkles } from "lucide-react";
import { useRef } from "react";

const displaySerif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-zg-display",
});

const photos = {
  heroAtmosphere:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=88",
  heroDetail:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=88",
  mobileScene:
    "https://images.unsplash.com/photo-1550966871-bfbe9278ea0a?auto=format&fit=crop&w=1800&q=88",
  discovery:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=88",
  instant:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db1?auto=format&fit=crop&w=1600&q=88",
  presence:
    "https://images.unsplash.com/photo-1424847658872-19fb9fa8b392?auto=format&fit=crop&w=2200&q=88",
  editorial:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=88",
  closing:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=2200&q=86",
  phoneThumb:
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=86",
  avatar1:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  avatar2:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  avatar3:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  avatar4:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
} as const;

const easeLux = [0.22, 1, 0.36, 1] as const;

const palette = {
  ink: "#0f0e0d",
  inkSoft: "#2a2724",
  graphite: "#5e5a56",
  mist: "#e6ddd2",
  canvas: "#f4efe6",
  canvasDeep: "#ebe3d7",
  cream: "#faf7f1",
  champagne: "#b8956a",
  line: "rgba(15, 14, 13, 0.08)",
} as const;

function useFadeUp(delay = 0) {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.9, delay, ease: easeLux },
  };
}

const plans = [
  {
    name: "Salle",
    tagline: "Pour une vitrine numérique irréprochable, sans surcharge.",
    price: "49 CHF",
    highlight: false,
    features: [
      "Page restaurant épurée, lisible en quelques secondes",
      "Réservation fluide, confirmations maîtrisées",
      "Expérience mobile soignée, du premier regard à la table",
      "Relances discrètes, dans le ton de la maison",
    ],
    cta: "Commencer",
  },
  {
    name: "Maison",
    tagline: "L’expérience complète : émotion, menu, relation — au même niveau que la salle.",
    price: "69 CHF",
    highlight: true,
    features: [
      "Mise en page éditoriale, photos et carte harmonisées",
      "Réservation intégrée, historique et préférences utiles",
      "Événements et lancements, racontés comme il faut",
      "Réputation et campagnes — sans bruit inutile",
    ],
    cta: "Choisir Maison",
  },
];

const testimonials = [
  {
    quote:
      "Nos invités ne « lisent » plus un site. Ils sentent l’adresse, puis réservent. C’est exactement le geste qu’on voulait.",
    name: "Camille R.",
    role: "Maison 28 places, Genève",
    src: photos.avatar1,
  },
  {
    quote:
      "Enfin une présence en ligne qui ressemble à notre salle : calme, chaleureuse, précise.",
    name: "Thomas V.",
    role: "Service & réservations, Lausanne",
    src: photos.avatar2,
  },
  {
    quote:
      "Le menu est devenu une vraie lecture. Les réservations suivent, sans friction.",
    name: "Léa M.",
    role: "Fondatrice, bistro contemporain",
    src: photos.avatar3,
  },
  {
    quote:
      "On gagne du temps côté équipe et de la clarté côté client. Rare, aujourd’hui.",
    name: "Julien K.",
    role: "Directeur, restaurant signature",
    src: photos.avatar4,
  },
];

const navLinks = [
  { href: "#mobile", label: "Mobile" },
  { href: "#decouverte", label: "Découverte" },
  { href: "#reservation", label: "Réservation" },
  { href: "#presence", label: "Présence" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#campagnes", label: "Campagnes" },
  { href: "#gestion", label: "Gestion" },
  { href: "#tarifs", label: "Tarifs" },
];

/** Aperçu « page restaurant » clair, style produit — pas de placeholder noir */
function RestaurantPageMiniPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border border-[rgba(15,14,13,0.08)] bg-[#fffcf7] shadow-[0_24px_64px_-40px_rgba(15,14,13,0.35)] ${className}`}
    >
      <div className="relative h-[7.5rem] w-full overflow-hidden">
        <Image
          src={photos.phoneThumb}
          alt=""
          fill
          className="object-cover object-center"
          sizes="280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fffcf7] via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[0.625rem] text-[#5e5a56]">
          <span className="rounded-full bg-white/90 px-2 py-0.5 font-medium text-[#0f0e0d] backdrop-blur-sm">
            Ouvert · 18h30
          </span>
          <MapPin className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
        </div>
      </div>
      <div className="space-y-3 px-4 pb-4 pt-3">
        <div>
          <p className="font-[family-name:var(--font-zg-display),serif] text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-[#0f0e0d]">
            Maison Lumière
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-[#7a7670]">Quartier des Arts · Genève</p>
        </div>
        <div className="space-y-1.5 rounded-xl bg-[#f4efe6]/80 p-2.5">
          {[
            ["Entrées", "Saison & marché"],
            ["Plats", "Du feu & du soin"],
            ["Desserts", "Douceurs maison"],
          ].map(([t, s]) => (
            <div
              key={t}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.6875rem]"
            >
              <span className="font-medium text-[#2a2724]">{t}</span>
              <span className="text-[#8a8580]">{s}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0f0e0d] py-2.5 text-[0.6875rem] font-semibold text-[#faf7f1] shadow-[0_8px_24px_-12px_rgba(15,14,13,0.5)]"
        >
          <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
          Réserver une table
        </button>
      </div>
    </div>
  );
}

/** Panneau type « produit Stripe » : fond clair, données lisibles */
function OperationsPanelPreview() {
  const rows = [
    { label: "Ce soir", value: "24 couverts", tone: "default" as const },
    { label: "En attente", value: "3 demandes", tone: "muted" as const },
    { label: "Taux de confirmation", value: "94 %", tone: "accent" as const },
  ];
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(15,14,13,0.07)] bg-white shadow-[0_28px_70px_-48px_rgba(15,14,13,0.4)]">
      <div className="flex items-center justify-between border-b border-[rgba(15,14,13,0.06)] bg-[#faf7f1]/90 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#b8956a]/90" />
          <span className="text-[0.6875rem] font-semibold tracking-wide text-[#5e5a56]">
            Aujourd’hui
          </span>
        </div>
        <span className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#9c9893]">
          ZenGrow
        </span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-2xl border border-[rgba(15,14,13,0.06)] bg-[#f4efe6]/45 p-4"
          >
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#8a8580]">
              {r.label}
            </p>
            <p
              className={`mt-2 text-[1.25rem] font-semibold tracking-tight ${
                r.tone === "accent" ? "text-[#7a623f]" : "text-[#0f0e0d]"
              }`}
            >
              {r.value}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-[rgba(15,14,13,0.05)] bg-[#fffcf7] px-5 py-4">
        {[
          { t: "19:30 · 2 pers.", s: "Confirmé" },
          { t: "20:00 · 4 pers.", s: "En attente" },
          { t: "20:45 · 2 pers.", s: "Confirmé" },
        ].map((line) => (
          <div
            key={line.t}
            className="flex items-center justify-between rounded-xl border border-[rgba(15,14,13,0.05)] bg-white px-3 py-2.5 text-[0.75rem]"
          >
            <span className="font-medium text-[#2a2724]">{line.t}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${
                line.s === "Confirmé"
                  ? "bg-[#e8dfd4] text-[#4a433a]"
                  : "bg-[#f4efe6] text-[#7a7670]"
              }`}
            >
              {line.s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignStripPreview() {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-[rgba(15,14,13,0.07)] bg-gradient-to-br from-[#fffcf7] to-[#ebe3d7]/80 p-6 shadow-[0_24px_60px_-44px_rgba(15,14,13,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#8a8580]">
            Campagne
          </p>
          <p className="font-[family-name:var(--font-zg-display),serif] mt-1 text-[1.125rem] font-semibold text-[#0f0e0d]">
            Soirée vigneron · samedi
          </p>
        </div>
        <span className="rounded-full bg-[#0f0e0d] px-3 py-1.5 text-[0.625rem] font-semibold text-[#faf7f1]">
          Brouillon
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[rgba(15,14,13,0.06)] bg-white/90 p-4">
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#9c9893]">
            Audience
          </p>
          <p className="mt-1 text-[0.8125rem] font-medium text-[#2a2724]">
            Clients · 12 mois · Genève
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(15,14,13,0.06)] bg-white/90 p-4">
          <p className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-[#9c9893]">
            Message
          </p>
          <p className="mt-1 text-[0.8125rem] leading-snug text-[#5e5a56]">
            « Il reste quelques tables pour découvrir le millésime… »
          </p>
        </div>
      </div>
    </div>
  );
}

export function ZenGrowLanding() {
  const reduce = useReducedMotion();
  const display = displaySerif.className;
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.04]);
  const heroImageSpring = useSpring(heroScale, { stiffness: 120, damping: 28 });

  return (
    <div
      className={`${displaySerif.variable} min-h-screen overflow-x-hidden text-[#0f0e0d] antialiased selection:bg-[#b8956a]/22 selection:text-[#0f0e0d]`}
      style={{ backgroundColor: palette.canvas }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% -15%, rgba(184, 149, 106, 0.11), transparent 52%),
            radial-gradient(ellipse 55% 45% at 100% 25%, rgba(230, 221, 210, 0.55), transparent 48%),
            radial-gradient(ellipse 50% 40% at 0% 75%, rgba(235, 227, 215, 0.75), transparent 52%),
            ${palette.canvas}
          `,
        }}
      />

      <header className="sticky top-0 z-50 border-b border-[rgba(15,14,13,0.06)] bg-[rgba(244,238,230,0.78)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={128}
              height={36}
              className="h-5 w-auto object-contain opacity-90 sm:h-[1.35rem]"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-[0.75rem] font-medium text-[#6b6762] xl:flex">
            {navLinks.slice(0, 6).map((l) => (
              <a key={l.href} href={l.href} className="transition hover:text-[#0f0e0d]">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-[0.8125rem] font-medium text-[#5e5a56] transition hover:text-[#0f0e0d] sm:inline"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0f0e0d] px-4 py-2 text-[0.75rem] font-semibold tracking-tight text-[#faf7f1] shadow-[0_14px_36px_-18px_rgba(15,14,13,0.45)] transition hover:bg-[#252220] sm:px-5 sm:text-[0.8125rem]"
            >
              Lancer ma page
              <ArrowUpRight className="h-3.5 w-3.5 opacity-90" strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-4 overflow-x-auto border-t border-[rgba(15,14,13,0.05)] px-4 py-2.5 text-[0.65rem] font-medium text-[#8a8580] scrollbar-none xl:hidden">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="shrink-0 whitespace-nowrap">
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="relative z-10 font-[family-name:var(--font-geist-sans),system-ui,sans-serif]">
        {/* Hero — scène immersive + produit discret */}
        <section
          ref={heroRef}
          className="relative min-h-[min(100svh,920px)] px-4 pb-24 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-10 lg:pb-32"
        >
          <motion.div style={{ y: heroY }} className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div style={{ scale: heroImageSpring }} className="absolute inset-0">
              <Image
                src={photos.heroAtmosphere}
                alt=""
                fill
                className="object-cover object-[center_38%]"
                sizes="100vw"
                priority
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_20%,rgba(15,14,13,0.45),rgba(15,14,13,0.72))]"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#0f0e0d]/20 via-transparent to-[#f4efe6]"
                aria-hidden
              />
            </motion.div>
            {!reduce ? (
              <motion.div
                className="absolute -left-1/4 top-1/4 h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-[#b8956a]/12 blur-[100px]"
                animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.05, 1] }}
                transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                aria-hidden
              />
            ) : null}
          </motion.div>

          <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
            <motion.p
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.32em] text-[#d4cfc8]"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: easeLux }}
            >
              Une nouvelle façon d’exister en ligne
            </motion.p>

            <motion.h1
              className={`${display} mt-8 max-w-[18ch] text-[2.5rem] font-medium leading-[1.04] tracking-[-0.035em] text-[#fffcf7] sm:max-w-[22ch] sm:text-[3.5rem] md:max-w-[20ch] md:text-[4.25rem] lg:text-[4.75rem]`}
              initial={reduce ? false : { opacity: 0, y: 36 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1.05, ease: easeLux, delay: 0.05 }}
            >
              <span className="block text-balance">Les clients ne veulent plus chercher.</span>
              <span className="mt-2 block text-balance sm:mt-3">
                Ils veulent{" "}
                <span className="italic font-normal text-[#ebe3d7]">réserver immédiatement.</span>
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-10 max-w-xl text-balance text-[1rem] leading-[1.72] text-[#d8d3cc] sm:mt-12 sm:max-w-2xl sm:text-[1.0625rem]"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeLux, delay: 0.12 }}
            >
              Aujourd’hui, un restaurant se découvre en quelques secondes.
              <span className="mt-2 block text-[#ebe3d7]/95">
                ZenGrow transforme cette découverte en réservation.
              </span>
            </motion.p>

            <motion.div
              className="mt-11 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:gap-4"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easeLux, delay: 0.18 }}
            >
              <Link
                href="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fffcf7] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#0f0e0d] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.5)] transition hover:bg-white sm:w-auto"
              >
                Créer ma page ZenGrow
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
              <a
                href="#mobile"
                className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(255,252,247,0.35)] bg-[rgba(15,14,13,0.25)] px-8 py-3.5 text-[0.875rem] font-medium text-[#faf7f1] backdrop-blur-md transition hover:border-[rgba(255,252,247,0.5)] hover:bg-[rgba(15,14,13,0.35)] sm:w-auto"
              >
                Voir l’expérience
              </a>
            </motion.div>
          </div>

          {/* Produit flottant — UI remplie, animation douce */}
          <motion.div
            className="relative mx-auto mt-16 flex max-w-[1180px] justify-center sm:mt-20 lg:mt-24"
            initial={reduce ? false : { opacity: 0, y: 48 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: easeLux, delay: 0.15 }}
          >
            <div className="relative w-full max-w-[920px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-[rgba(255,252,247,0.12)] bg-[#ebe3d7] shadow-[0_40px_100px_-48px_rgba(0,0,0,0.65)] sm:rounded-[2.25rem]">
                <Image
                  src={photos.heroDetail}
                  alt="Ambiance restaurant, lumière chaude"
                  fill
                  className="object-cover object-[center_45%]"
                  sizes="(max-width: 1024px) 100vw, 920px"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0f0e0d]/25 via-transparent to-[#f4efe6]/15" />
                <motion.div
                  className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-auto sm:right-10 sm:top-1/2 sm:w-[min(100%,280px)] sm:-translate-y-1/2"
                  animate={
                    reduce
                      ? undefined
                      : { y: [0, -10, 0], rotate: [-0.8, 0.4, -0.8] }
                  }
                  transition={{
                    duration: 16,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <RestaurantPageMiniPreview />
                </motion.div>
                {!reduce ? (
                  <motion.div
                    className="pointer-events-none absolute right-[12%] top-[18%] hidden h-24 w-24 rounded-full bg-[#fffcf7]/20 blur-2xl sm:block"
                    animate={{ opacity: [0.25, 0.5, 0.25] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                ) : null}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Mobile moderne */}
        <section
          id="mobile"
          className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <motion.div {...useFadeUp(0)}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                Expérience mobile moderne
              </p>
              <h2
                className={`${display} mt-4 text-[2.25rem] font-medium leading-[1.06] tracking-[-0.03em] text-[#0f0e0d] sm:text-[2.85rem] md:text-[3.35rem]`}
              >
                Conçu pour le pouce, la lumière du soir, et la décision en trois secondes.
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                Grands blancs, typographie hiérarchisée, images qui respirent : votre restaurant se lit
                comme une invitation — pas comme un manuel.
              </p>
              <ul className="mt-8 space-y-3 text-[0.9375rem] text-[#3a3734]">
                {[
                  "Hiérarchie éditoriale, du hero au menu",
                  "Gestes naturels : scroll, tap, réserver",
                  "Ton maison, du premier écran à la confirmation",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#b8956a]" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.97, y: 32 }}
              whileInView={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: easeLux }}
              className="relative"
            >
              <div className="relative mx-auto aspect-[9/16] max-h-[560px] w-[min(100%,280px)] overflow-hidden rounded-[2.5rem] border border-[rgba(15,14,13,0.12)] bg-[#252220] p-2 shadow-[0_40px_90px_-40px_rgba(15,14,13,0.45)]">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#fffcf7]">
                  <Image
                    src={photos.mobileScene}
                    alt="Ambiance table dressée"
                    fill
                    className="object-cover object-[center_40%]"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f0e0d]/55 via-transparent to-[#fffcf7]" />
                  <div className="absolute inset-x-4 bottom-5">
                    <RestaurantPageMiniPreview className="scale-[0.92] origin-bottom shadow-2xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Découverte rapide — bento éditorial */}
        <section
          id="decouverte"
          className="relative scroll-mt-24 border-y border-[rgba(15,14,13,0.06)] bg-[#ebe3d7]/35 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto max-w-3xl text-center">
              <motion.p {...useFadeUp(0)} className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#7a7670]">
                Découverte rapide
              </motion.p>
              <motion.h2
                {...useFadeUp(0.05)}
                className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.95rem] md:text-[3.45rem]`}
              >
                L’essentiel visible tout de suite. Le reste, invisible.
              </motion.h2>
              <motion.p {...useFadeUp(0.1)} className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                Quartier, horaires, esprit de la maison : une lecture courte, nette, mémorable — comme la
                une d’un magazine gastronomique.
              </motion.p>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-12 lg:gap-5">
              <motion.article
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.95, ease: easeLux }}
                className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(15,14,13,0.07)] bg-white/70 shadow-[0_32px_70px_-50px_rgba(15,14,13,0.4)] sm:col-span-8 sm:min-h-[420px]"
              >
                <div className="relative aspect-[16/11] sm:absolute sm:inset-0 sm:aspect-auto">
                  <Image
                    src={photos.discovery}
                    alt="Dressage et lumière"
                    fill
                    className="object-cover object-[center_48%]"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d]/55 via-[#0f0e0d]/10 to-transparent sm:from-[#0f0e0d]/45" />
                </div>
                <div className="relative p-8 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:bg-gradient-to-t sm:from-[#0f0e0d]/88 sm:via-[#0f0e0d]/35 sm:to-transparent sm:p-10">
                  <p className={`${display} max-w-lg text-[1.65rem] font-medium leading-tight text-white sm:text-[1.85rem]`}>
                    Une preuve visuelle avant le premier plat.
                  </p>
                  <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/85">
                    Quelques images justes, un rythme calme : assez pour comprendre l’atmosphère.
                  </p>
                </div>
              </motion.article>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.95, ease: easeLux, delay: 0.06 }}
                className="flex flex-col justify-between gap-6 overflow-hidden rounded-[1.85rem] border border-[rgba(15,14,13,0.07)] bg-[#fffcf7] p-8 shadow-[0_24px_60px_-48px_rgba(15,14,13,0.3)] sm:col-span-4"
              >
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#8a8580]">
                    Lecture
                  </p>
                  <p className={`${display} mt-4 text-[1.5rem] font-medium leading-[1.12] text-[#0f0e0d]`}>
                    Titres larges, lignes fines, silence entre les blocs.
                  </p>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgba(15,14,13,0.06)]">
                  <Image
                    src={photos.editorial}
                    alt="Détail culinaire"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Réservation instantanée */}
        <section id="reservation" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
              <motion.div {...useFadeUp(0)} className="max-w-xl lg:max-w-[480px]">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                  Réservation instantanée
                </p>
                <h2
                  className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.85rem]`}
                >
                  Du désir à la date, sans friction ni formulaire interminable.
                </h2>
                <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                  Un créneau clair, une confirmation douce, un ton qui rappelle le service en salle — pas
                  un parcours « logiciel ».
                </p>
              </motion.div>
              <motion.div
                initial={reduce ? false : { opacity: 0, x: 40 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, ease: easeLux }}
                className="relative flex-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.85rem] border border-[rgba(15,14,13,0.07)] bg-[#ebe3d7] shadow-[0_36px_80px_-50px_rgba(15,14,13,0.45)]">
                  <Image
                    src={photos.instant}
                    alt="Service en salle"
                    fill
                    className="object-cover object-[center_52%]"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#fffcf7]/95 via-[#fffcf7]/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 max-w-sm rounded-2xl border border-[rgba(15,14,13,0.08)] bg-[#fffcf7]/95 p-5 shadow-[0_24px_60px_-40px_rgba(15,14,13,0.35)] backdrop-blur-md sm:left-auto sm:right-8 sm:top-1/2 sm:max-w-xs sm:-translate-y-1/2">
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#8a8580]">
                      Aperçu invité
                    </p>
                    <p className="font-[family-name:var(--font-zg-display),serif] mt-2 text-[1.125rem] font-semibold text-[#0f0e0d]">
                      Samedi · 20:30 · 2 personnes
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-[#5e5a56]">
                      Confirmation envoyée. Un rappel discret avant votre venue.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full bg-[#e8dfd4] px-3 py-1 text-[0.625rem] font-semibold text-[#4a433a]">
                        Confirmé
                      </span>
                      <span className="rounded-full border border-[rgba(15,14,13,0.1)] bg-white px-3 py-1 text-[0.625rem] font-medium text-[#5e5a56]">
                        Modifier
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Présence digitale restaurant */}
        <section
          id="presence"
          className="relative scroll-mt-24 border-t border-[rgba(15,14,13,0.06)] bg-[#faf7f1] px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto max-w-[1280px]">
            <motion.div {...useFadeUp(0)} className="mx-auto max-w-3xl text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                Présence digitale restaurant
              </p>
              <h2
                className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[3rem] md:text-[3.45rem]`}
              >
                Une adresse unique, aussi soignée que votre carte.
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                ZenGrow n’est pas « un site de plus » : c’est le cadre numérique de votre maison — rapide à
                mettre à jour, beau à parcourir, fidèle à votre voix.
              </p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 36 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 1.05, ease: easeLux }}
              className="relative mt-16 overflow-hidden rounded-[2rem] border border-[rgba(15,14,13,0.07)] bg-[#ebe3d7] shadow-[0_44px_90px_-52px_rgba(15,14,13,0.45)]"
            >
              <div className="relative aspect-[2.1/1] min-h-[300px] w-full sm:min-h-[380px]">
                <Image
                  src={photos.presence}
                  alt="Grande salle élégante"
                  fill
                  className="object-cover object-[center_42%]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f1]/92 via-[#faf7f1]/25 to-transparent" />
                <div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center px-8 sm:px-14">
                  <p className={`${display} text-[1.85rem] font-medium leading-[1.08] text-[#0f0e0d] sm:text-[2.2rem]`}>
                    Le digital au service de l’émotion — pas l’inverse.
                  </p>
                  <p className="mt-4 text-[0.975rem] leading-[1.7] text-[#4a4744]">
                    Typographie, blancs, matière : tout converge vers la même promesse — celle de l’accueil et
                    du détail.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Plateforme moderne — UI produit claire */}
        <section id="plateforme" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1100px]">
            <motion.div {...useFadeUp(0)} className="mx-auto max-w-2xl text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                Plateforme moderne
              </p>
              <h2
                className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.95rem]`}
              >
                Derrière la scène : clarté, calme, contrôle — dans une interface lumineuse.
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                Les opérations restent discrètes. Ce que vous voyez est lisible, hiérarchisé, actionnable —
                comme les meilleurs outils des équipes exigeantes.
              </p>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1, ease: easeLux }}
              className="mt-14"
            >
              <OperationsPanelPreview />
            </motion.div>
          </div>
        </section>

        {/* Campagnes & clients */}
        <section
          id="campagnes"
          className="relative scroll-mt-24 border-y border-[rgba(15,14,13,0.06)] bg-[#ebe3d7]/30 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32"
        >
          <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <motion.div {...useFadeUp(0)}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#7a7670]">
                Campagnes & clients
              </p>
              <h2
                className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.85rem]`}
              >
                Parler aux bonnes personnes, au bon moment — sans saturer.
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                Segments utiles, messages dans le ton de la maison, suivi simple : la relation client reste
                humaine, le reste est orchestré avec finesse.
              </p>
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.95, ease: easeLux }}
            >
              <CampaignStripPreview />
            </motion.div>
          </div>
        </section>

        {/* Gestion simplifiée + témoignages */}
        <section id="gestion" className="relative scroll-mt-24 px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1280px]">
            <motion.div {...useFadeUp(0)} className="mx-auto max-w-2xl text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                Gestion simplifiée
              </p>
              <h2
                className={`${display} mt-4 text-[2.2rem] font-medium leading-[1.07] tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.95rem]`}
              >
                Moins de bruit pour les équipes. Plus de présence pour les invités.
              </h2>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[#5e5a56]">
                Réservations, préférences, événements, réputation : l’essentiel regroupé, sans empiler les
                écrans inutiles.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "File du soir",
                  text: "Ce qui arrive, ce qui attend : une lecture immédiate pour le service.",
                },
                {
                  title: "Mémoire utile",
                  text: "Reconnaître sans étiqueter — les détails qui améliorent l’accueil.",
                },
                {
                  title: "Calendrier vivant",
                  text: "Soirées, dégustations, cartes saisonnières : le rythme de la maison, visible.",
                },
                {
                  title: "Réponses dans le ton",
                  text: "Avis et échanges alignés sur la voix de la salle.",
                },
                {
                  title: "Mises à jour rapides",
                  text: "Menu, photos, message : publié vite, rendu impeccable.",
                },
                {
                  title: "Vision d’ensemble",
                  text: "Une base unique pour ce qui compte — sans tableau vide ni zones mortes.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={reduce ? false : { opacity: 0, y: 22 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ delay: i * 0.05, duration: 0.85, ease: easeLux }}
                  className="rounded-[1.4rem] border border-[rgba(15,14,13,0.08)] bg-white/90 p-7 shadow-[0_18px_44px_-36px_rgba(15,14,13,0.22)] transition hover:border-[rgba(184,149,106,0.35)] hover:shadow-[0_26px_52px_-36px_rgba(15,14,13,0.26)]"
                >
                  <p className={`${display} text-[1.28rem] font-medium text-[#0f0e0d]`}>{card.title}</p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-[#5e5a56]">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={t.name}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: i * 0.06, duration: 0.85, ease: easeLux }}
                  className="flex h-full flex-col rounded-[1.35rem] border border-[rgba(15,14,13,0.07)] bg-[#fffcf7]/90 p-6 shadow-[0_16px_40px_-36px_rgba(15,14,13,0.18)]"
                >
                  <p className="text-[0.9375rem] leading-[1.65] text-[#3a3734]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[rgba(15,14,13,0.08)]">
                      <Image src={t.src} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="text-[0.8125rem] font-semibold text-[#0f0e0d]">{t.name}</p>
                      <p className="text-[0.75rem] text-[#8a8580]">{t.role}</p>
                    </div>
                  </div>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs premium */}
        <section id="tarifs" className="relative scroll-mt-24 px-4 pb-8 pt-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1000px]">
            <motion.div {...useFadeUp(0)} className="text-center">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-[#8a8580]">
                Tarifs premium
              </p>
              <h2
                className={`${display} mt-4 text-[2.35rem] font-medium tracking-[-0.028em] text-[#0f0e0d] sm:text-[2.95rem]`}
              >
                Deux profondeurs. Une même exigence.
              </h2>
              <p className="mt-4 text-[1.0625rem] text-[#5e5a56]">
                Facturation mensuelle, transparente. Vous choisissez jusqu’où va l’expérience.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
              {plans.map((plan, i) => (
                <motion.article
                  key={plan.name}
                  initial={reduce ? false : { opacity: 0, y: 26 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.85, ease: easeLux }}
                  className={`relative flex flex-col rounded-[1.85rem] border p-8 sm:p-9 ${
                    plan.highlight
                      ? "border-[rgba(184,149,106,0.42)] bg-[linear-gradient(165deg,#fffefb_0%,#f3ebe0_100%)] shadow-[0_32px_64px_-42px_rgba(184,149,106,0.32)]"
                      : "border-[rgba(15,14,13,0.1)] bg-white/85"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full border border-[rgba(184,149,106,0.38)] bg-[rgba(184,149,106,0.12)] px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#6e5a3f]">
                      Le plus demandé
                    </span>
                  ) : null}
                  <h3 className={`${display} text-[1.55rem] font-medium text-[#0f0e0d] sm:text-[1.65rem]`}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-[#5e5a56]">{plan.tagline}</p>
                  <p className="mt-9 text-[2.55rem] font-semibold tracking-tight text-[#0f0e0d] sm:text-[2.7rem]">
                    {plan.price}
                    <span className="text-[1rem] font-normal text-[#8a8580]"> / mois</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3 text-[0.875rem] leading-relaxed text-[#4a4744]">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: palette.champagne }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-10 inline-flex w-full items-center justify-center rounded-full py-3.5 text-[0.875rem] font-semibold tracking-tight transition ${
                      plan.highlight
                        ? "bg-[#0f0e0d] text-[#faf7f1] hover:bg-[#252220]"
                        : "border border-[rgba(15,14,13,0.14)] text-[#0f0e0d] hover:bg-[#ebe3d7]/75"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="relative px-4 pb-28 pt-16 sm:px-6 sm:pb-32 lg:px-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: easeLux }}
            className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-[rgba(15,14,13,0.1)] bg-[#0f0e0d] shadow-[0_44px_90px_-50px_rgba(15,14,13,0.55)]"
          >
            <div className="relative aspect-[16/11] min-h-[320px] w-full sm:aspect-[2.25/1] sm:min-h-[380px]">
              <Image
                src={photos.closing}
                alt="Ambiance chaleureuse"
                fill
                className="object-cover object-[center_38%] opacity-50"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/78 to-[#0f0e0d]/5" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_100%,rgba(184,149,106,0.14),transparent_55%)]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-[#c9c3bc]">
                  ZenGrow
                </p>
                <h2
                  className={`${display} mt-5 max-w-[18ch] text-[2.05rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#faf7f1] sm:max-w-3xl sm:text-[2.9rem] md:text-[3.35rem]`}
                >
                  La présence en ligne à la hauteur de votre table.
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-[1.0625rem] leading-[1.72] text-[#c9c3bc] sm:mt-8">
                  En quelques minutes : une page qui raconte l’essentiel, et des réservations qui
                  s’installent sans bruit.
                </p>
                <Link
                  href="/signup"
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#faf7f1] px-8 py-3.5 text-[0.875rem] font-semibold tracking-tight text-[#0f0e0d] transition hover:bg-white"
                >
                  Commencer avec ZenGrow
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-[rgba(15,14,13,0.08)] px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 sm:flex-row">
            <Image
              src="/Zengrow-logo.png"
              alt="ZenGrow"
              width={104}
              height={30}
              className="h-4 w-auto object-contain opacity-80"
            />
            <div className="flex flex-wrap items-center justify-center gap-6 text-[0.75rem] text-[#8a8580]">
              <Link href="/login" className="transition hover:text-[#0f0e0d]">
                Connexion
              </Link>
              <Link href="/signup" className="transition hover:text-[#0f0e0d]">
                Inscription
              </Link>
              <span>© {new Date().getFullYear()} ZenGrow</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
