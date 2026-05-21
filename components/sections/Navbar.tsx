"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

const links = [
  { href: "/#hero", label: "Produit" },
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
      "0 25px 50px -12px rgb(0 0 0 / 0.35), 0 0 40px rgba(255,90,42,0.08)",
      "0 28px 56px -12px rgb(0 0 0 / 0.5), 0 0 52px rgba(255,90,42,0.18)",
    ],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:top-6 sm:px-4">
      <div className="pointer-events-auto relative w-full max-w-5xl">
      <motion.nav
        style={{ scale, boxShadow }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative flex w-full items-center justify-between gap-3 rounded-full border border-[rgba(255,122,61,0.12)] bg-[rgba(18,11,7,0.72)] px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:gap-4 sm:px-6 sm:py-3"
      >
        <Link
          href="/"
          className="shrink-0 font-landing-serif text-lg font-normal italic tracking-tight text-[#FFF7EF] sm:text-xl"
          onClick={() => setOpen(false)}
        >
          ZenGrow
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-[#AFA39A] transition hover:text-[#FFF7EF]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm text-[#FFF7EF] transition hover:text-[#FF7A3D] sm:inline-block"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-[#FF5A2A] px-4 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(255,90,42,0.28)] transition hover:bg-[#FF7A3D] hover:shadow-[0_0_36px_rgba(255,90,42,0.4)] sm:inline-flex sm:px-5"
          >
            Commencer
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-[#FFF7EF] transition hover:border-[rgba(255,122,61,0.3)] lg:hidden"
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
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-2xl border border-[rgba(255,122,61,0.15)] bg-[rgba(18,11,7,0.96)] p-4 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-xl px-3 py-2.5 text-sm text-[#AFA39A] transition hover:bg-[rgba(255,90,42,0.08)] hover:text-[#FFF7EF]"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2 border-t border-[rgba(255,255,255,0.06)] pt-3">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2.5 text-center text-sm text-[#FFF7EF]"
                onClick={() => setOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#FF5A2A] px-5 py-2.5 text-center text-sm font-medium text-white shadow-[0_0_24px_rgba(255,90,42,0.25)]"
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
