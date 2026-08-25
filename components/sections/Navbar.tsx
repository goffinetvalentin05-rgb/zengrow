"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { LandingLogo } from "@/components/landing/landing-ui";

const links = [
  { href: "/#solution", label: "Solution" },
  { href: "/#ia", label: "IA" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 120], [1, 0.97]);
  const boxShadow = useTransform(
    scrollY,
    [0, 160],
    [
      "0 25px 50px -12px rgb(0 0 0 / 0.45), 0 0 48px rgba(43,140,255,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
      "0 28px 56px -12px rgb(0 0 0 / 0.55), 0 0 64px rgba(43,140,255,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
    ],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:top-6 sm:px-4">
      <div className="pointer-events-auto relative w-full max-w-5xl">
        <span className="landing-navbar-ambient" aria-hidden />
        <motion.nav
          style={{ scale, boxShadow }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full border border-[rgba(59,158,255,0.18)] bg-[rgba(6,16,32,0.78)] px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:gap-5 sm:px-6 sm:py-3"
        >
          <span className="landing-navbar-shine" aria-hidden />
          <Link
            href="/"
            className="relative z-[1] flex shrink-0 items-center rounded-lg px-0.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EB3FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={() => setOpen(false)}
            aria-label="ZenGrow — accueil"
          >
            <LandingLogo variant="navbar" priority />
          </Link>

          <ul className="absolute left-1/2 z-[1] hidden -translate-x-1/2 items-center gap-6 lg:flex xl:gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-[#8BA3C7] transition hover:text-[#EEF6FF]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative z-[1] ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/pro/login"
              className="hidden rounded-full px-3 py-2 text-sm text-[#EEF6FF] transition hover:text-[#5EB3FF] sm:inline-block"
            >
              Connexion
            </Link>
            <Link
              href="/pro/signup"
              className="hidden rounded-full bg-[#2B8CFF] px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(43,140,255,0.32)] transition hover:bg-[#5EB3FF] hover:shadow-[0_0_36px_rgba(43,140,255,0.45)] sm:inline-flex sm:px-5"
            >
              Commencer
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-[#EEF6FF] transition hover:border-[rgba(59,158,255,0.3)] lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-2xl border border-[rgba(59,158,255,0.18)] bg-[rgba(6,16,32,0.96)] p-4 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <ul className="flex flex-col gap-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="block rounded-xl px-3 py-2.5 text-sm text-[#8BA3C7] transition hover:bg-[rgba(43,140,255,0.1)] hover:text-[#EEF6FF]"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-col gap-2 border-t border-[rgba(255,255,255,0.06)] pt-3">
                <Link
                  href="/pro/login"
                  className="rounded-xl px-3 py-2.5 text-center text-sm text-[#EEF6FF]"
                  onClick={() => setOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/pro/signup"
                  className="rounded-full bg-[#2B8CFF] px-5 py-2.5 text-center text-sm font-medium text-white shadow-[0_0_24px_rgba(43,140,255,0.28)]"
                  onClick={() => setOpen(false)}
                >
                  Commencer
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
