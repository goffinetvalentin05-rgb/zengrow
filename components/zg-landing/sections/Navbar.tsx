"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Container, PrimaryButton } from "../ui";

const LINKS = [
  { href: "#workflow", label: "Comment ça marche" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#tarifs", label: "Tarifs" },
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
          <Link href="/" className="flex shrink-0 items-center" aria-label="ZenGrow — accueil">
            <Image
              src="/logo-zengrow.png"
              alt="ZenGrow"
              width={1680}
              height={482}
              className="h-7 w-auto sm:h-8 md:h-9"
              priority
            />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-[#c4b5fd]/90 transition hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <PrimaryButton href="/signup" className="!min-h-10 !px-5 !text-sm">
              Essayer ZenGrow
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
                <PrimaryButton href="/signup" className="w-full justify-center">
                  Essayer ZenGrow
                </PrimaryButton>
              </li>
            </ul>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
