"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/src/lib/utils";

const links = [
  { href: "/#hero", label: "Accueil" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={cn(
          "landing-navbar pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6",
          scrolled && "landing-navbar--scrolled",
        )}
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

        <motion.div
          className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0"
          animate={{ scale: scrolled ? 0.98 : 1 }}
          transition={{ duration: 0.25 }}
        >
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
