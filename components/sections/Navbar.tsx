"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const links = [
  { href: "#accueil", label: "Accueil" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 120], [1, 0.97]);
  const boxShadow = useTransform(
    scrollY,
    [0, 160],
    [
      "0 25px 50px -12px rgb(0 0 0 / 0.35), 0 0 40px rgba(255,107,44,0.08)",
      "0 28px 56px -12px rgb(0 0 0 / 0.5), 0 0 52px rgba(255,107,44,0.2)",
    ],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto border-b border-landing-accent/20 bg-landing-accent/10 px-4 py-2 text-center text-[11px] text-landing-muted sm:text-xs">
        <span className="text-landing-fg/90">
          🔥 Offre de lancement : -30% les 3 premiers mois.{" "}
        </span>
        <Link href="#tarifs" className="font-medium text-landing-accent-soft hover:text-landing-accent">
          En savoir plus →
        </Link>
      </div>

      <div className="pointer-events-auto flex justify-center px-4 pt-6">
        <motion.nav
          style={{ scale, boxShadow }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-landing-border/50 bg-landing-card/60 px-6 py-3 shadow-2xl backdrop-blur-xl"
        >
          <Link
            href="#accueil"
            className="font-landing-serif text-xl font-normal italic tracking-tight text-landing-fg"
          >
            ZenGrow
          </Link>

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-landing-muted transition hover:text-landing-fg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="#cta"
            className="ml-auto rounded-full bg-[#FF6B2C] px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(255,107,44,0.25)] transition hover:shadow-[0_0_36px_rgba(255,107,44,0.45)] md:ml-0"
          >
            Commencer
          </Link>
        </motion.nav>
      </div>
    </header>
  );
}
