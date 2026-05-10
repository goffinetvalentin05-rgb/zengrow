"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const items = [
  {
    title: "Stratégie de page",
    body: "Une page pensée pour la conversion, chaque pixel sert à transformer un visiteur en réservation.",
    graphic: (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sol-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFA86B" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx="52" cy="42" r="26" fill="url(#sol-a)" opacity="0.9" />
        <ellipse cx="70" cy="68" rx="36" ry="12" fill="#FF6B2C" opacity="0.25" />
      </svg>
    ),
  },
  {
    title: "Identité visuelle",
    body: "On adapte le design au branding de ton resto. Photos pro, ambiance, ton de voix.",
    graphic: (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sol-b" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA86B" />
            <stop offset="100%" stopColor="#FF6B2C" />
          </linearGradient>
        </defs>
        <path
          d="M10 78 C 35 20, 85 20, 110 78"
          fill="none"
          stroke="url(#sol-b)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="34" cy="38" r="8" fill="#FF6B2C" opacity="0.7" />
      </svg>
    ),
  },
  {
    title: "Marketing automatisé",
    body: "Campagnes emails, avis Google auto, relances. Tout tourne sans toi.",
    graphic: (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="sol-c" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFA86B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <rect x="18" y="22" width="84" height="56" rx="18" fill="url(#sol-c)" opacity="0.85" />
        <path d="M28 62 Q60 40 92 62" fill="none" stroke="#FF6B2C" strokeWidth="4" opacity="0.55" />
      </svg>
    ),
  },
  {
    title: "Analytics & Insights",
    body: "Comprends quels plats marchent, quels horaires cartonnent, quels clients reviennent.",
    graphic: (
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sol-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16110D" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M14 72 L38 48 L58 58 L78 32 L106 52" fill="none" stroke="url(#sol-d)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="38" cy="48" r="4" fill="#FFA86B" />
        <circle cx="78" cy="32" r="4" fill="#FF6B2C" />
      </svg>
    ),
  },
];

export function Solutions() {
  return (
    <section className="relative bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_100%,rgba(255,107,44,0.1),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Des solutions pensées pour <em className="italic text-landing-accent">ton restaurant</em>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.55 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-landing-border bg-landing-card/95 shadow-[0_0_45px_-28px_rgba(255,107,44,0.4)]"
            >
              <div className="relative h-36 bg-gradient-to-b from-landing-accent/15 to-transparent px-4 pt-4">
                <div className="mx-auto h-28 max-w-[9rem] opacity-95">{item.graphic}</div>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-6 pt-2">
                <h3 className="font-landing-serif text-lg text-landing-fg">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-landing-muted">{item.body}</p>
                <Link
                  href="#faq"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-landing-accent-soft hover:text-landing-accent"
                >
                  En savoir plus →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
