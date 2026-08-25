"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/landing-page/ui";
import { cn } from "@/src/lib/utils";

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#faq", label: "FAQ" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={cn("zg-lp-nav zg-lp-body", scrolled && "zg-lp-nav--scrolled")}>
      <div className="zg-lp-container flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <Link href="/" className="relative z-10 flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/zengrow-logo.png"
            alt="ZenGrow"
            width={120}
            height={32}
            className="h-7 w-auto brightness-0 invert md:h-8"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--zg-muted)] transition-colors hover:text-[var(--zg-fg)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <PrimaryButton href="/signup" className="min-h-10 px-5 text-sm" showArrow>
            Commencer maintenant
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="relative z-10 flex size-10 items-center justify-center rounded-lg border border-[var(--zg-border-soft)] text-[var(--zg-fg)] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 top-16 z-40 border-t border-[var(--zg-border-soft)] bg-[rgba(3,0,5,0.96)] backdrop-blur-xl md:hidden">
          <nav className="zg-lp-container flex flex-col gap-1 py-6" aria-label="Navigation mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3.5 text-base font-medium text-[var(--zg-fg)] transition-colors hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 pt-4">
              <PrimaryButton href="/signup" className="w-full justify-center" showArrow onClick={() => setOpen(false)}>
                Commencer maintenant
              </PrimaryButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
