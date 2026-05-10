"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  { href: "#accueil", label: "Accueil" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <>
      <div className="border-b border-landing-border/60 bg-landing-bg/95 px-4 py-2 text-center text-[11px] text-landing-muted sm:text-xs">
        <span className="text-landing-fg/90">
          🔥 Offre de lancement : -30% les 3 premiers mois.{" "}
        </span>
        <Link href="#tarifs" className="font-medium text-landing-accent-soft hover:text-landing-accent">
          En savoir plus →
        </Link>
      </div>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/[0.06] bg-landing-bg/70 backdrop-blur-xl"
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <Link
            href="#accueil"
            className="font-landing-serif text-xl font-normal italic tracking-tight text-landing-fg sm:text-2xl"
          >
            ZenGrow
          </Link>
          <ul className="hidden items-center gap-8 text-sm text-landing-muted md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-landing-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="#cta"
            className="rounded-xl bg-landing-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110"
          >
            Commencer
          </Link>
        </nav>
      </motion.header>
    </>
  );
}
