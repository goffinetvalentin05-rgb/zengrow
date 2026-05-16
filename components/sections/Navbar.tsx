"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const links = [
  { href: "/#hero", label: "Accueil" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
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
    <header className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <motion.nav
        style={{ scale, boxShadow }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pointer-events-auto relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/[0.06] bg-landing-card/60 px-6 py-3 shadow-2xl backdrop-blur-xl"
      >
        <Link
          href="/"
          className="font-landing-serif text-xl font-normal italic tracking-tight text-landing-fg"
        >
          ZenGrow
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-landing-muted transition hover:text-landing-fg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <motion.div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm text-landing-fg transition hover:text-landing-accent hover:underline hover:decoration-landing-accent/40 hover:underline-offset-4"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#FF6B2C] px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(255,107,44,0.25)] transition hover:shadow-[0_0_36px_rgba(255,107,44,0.45)]"
          >
            Commencer
          </Link>
        </motion.div>
      </motion.nav>
    </header>
  );
}
