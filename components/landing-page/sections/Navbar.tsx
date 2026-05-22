"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { Container, PrimaryButton, SecondaryButton } from "@/components/landing-page/ui";

const LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#ia", label: "IA" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-[rgba(27,79,255,0.2)] bg-[rgba(0,0,5,0.82)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo-zengrow.png"
            alt="ZenGrow"
            width={140}
            height={40}
            className="h-8 w-auto sm:h-9"
            priority
          />
        </Link>

        <nav
          className="zg-lp-nav-pill hidden items-center gap-1 px-2 py-1.5 md:flex"
          aria-label="Navigation principale"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-[#8BA3C7] transition hover:bg-[rgba(27,79,255,0.12)] hover:text-[#EEF6FF]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <SecondaryButton href="/login" className="min-h-9 px-4 text-sm">
            Connexion
          </SecondaryButton>
          <PrimaryButton href="/signup" className="min-h-9 px-4 text-sm">
            Commencer
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="rounded-lg border border-[rgba(27,79,255,0.25)] px-3 py-2 text-sm text-[#EEF6FF] md:hidden"
          aria-expanded={open}
          aria-controls="zg-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </Container>

      {open ? (
        <div id="zg-mobile-nav" className="border-t border-[rgba(27,79,255,0.15)] bg-[rgba(0,0,5,0.95)] md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-[#EEF6FF]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <SecondaryButton href="/login">Connexion</SecondaryButton>
              <PrimaryButton href="/signup">Commencer</PrimaryButton>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
