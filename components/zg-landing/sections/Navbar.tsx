"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Container, GhostButton, PrimaryButton } from "../ui";

const LINKS = [
  { href: "#workflow", label: "Fonctionnalités" },
  { href: "#pour-qui", label: "Pour qui ?" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-4 md:pt-6">
      <Container>
        <nav
          className={cn(
            "zg-nav-capsule",
            scrolled && "zg-nav-capsule--scrolled",
          )}
        >
          <Link
            href="/"
            className="zg-nav-capsule__brand zg-nav-logo shrink-0"
            aria-label="ZenGrow — accueil"
          >
            <Image
              src="/zengrow-logo-blanc.png"
              alt="ZenGrow"
              width={1680}
              height={482}
              className="zg-nav-logo__img"
              priority
            />
          </Link>

          <ul className="zg-nav-capsule__links hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="zg-nav-capsule__link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="zg-nav-capsule__actions hidden md:flex">
            <GhostButton href="/login" className="!min-h-9 !px-3 !text-sm">
              Connexion
            </GhostButton>
            <PrimaryButton href="/signup" className="!min-h-9 !px-4 !text-sm">
              Essayer gratuitement
            </PrimaryButton>
          </div>

          <button
            type="button"
            className="zg-nav-capsule__menu flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>

        {open ? (
          <div className="zg-nav-mobile mt-3 rounded-2xl border border-white/10 bg-[#020617]/90 p-4 backdrop-blur-xl md:hidden">
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200/90 transition hover:bg-white/5 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 border-t border-white/8 pt-3">
                <GhostButton href="/login" className="w-full justify-center !min-h-10">
                  Connexion
                </GhostButton>
              </li>
              <li>
                <PrimaryButton href="/signup" className="w-full justify-center !min-h-10">
                  Essayer gratuitement
                </PrimaryButton>
              </li>
            </ul>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
