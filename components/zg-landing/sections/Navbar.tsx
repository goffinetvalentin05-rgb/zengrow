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
    <header className="fixed inset-x-0 top-0 z-50 pt-4 md:pt-5">
      <Container>
        <nav
          className={cn(
            "zg-nav-shell flex items-center justify-between gap-4 px-4 py-2.5 md:px-6",
            scrolled && "zg-nav-shell--scrolled",
          )}
        >
          <Link href="/" className="zg-nav-logo shrink-0" aria-label="ZenGrow — accueil">
            <Image
              src="/zengrow-logo-blanc.png"
              alt="ZenGrow"
              width={1680}
              height={482}
              className="zg-nav-logo__img"
              priority
            />
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-sky-200/80 transition hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <GhostButton href="/login" className="!min-h-10 !px-5 !text-sm">
              Connexion
            </GhostButton>
            <PrimaryButton href="/signup" className="!min-h-10 !px-5 !text-sm">
              Essayer gratuitement
            </PrimaryButton>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open ? (
          <div className="zg-glass mt-3 rounded-2xl p-4 md:hidden">
            <ul className="flex flex-col gap-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block py-2 text-sm font-medium text-white/90"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <GhostButton href="/login" className="w-full justify-center">
                  Connexion
                </GhostButton>
              </li>
              <li>
                <PrimaryButton href="/signup" className="w-full justify-center">
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
