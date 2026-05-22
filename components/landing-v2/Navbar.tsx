"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/landing-v2/ui";

const NAV = [
  { href: "#solution", label: "Produit" },
  { href: "#ia", label: "IA" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(59,158,255,0.12)] bg-[rgba(2,6,16,0.92)] backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/logo-zengrow.png"
            alt="ZenGrow"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#8BA3C7] transition-colors hover:text-[#EEF6FF]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-[#EEF6FF] hover:text-[#5EB3FF]">
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#2B8CFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(43,140,255,0.35)] hover:bg-[#5EB3FF]"
          >
            Commencer
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-[#EEF6FF] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open ? (
        <nav
          className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(4,12,28,0.98)] px-4 py-4 md:hidden"
          aria-label="Navigation mobile"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-[#8BA3C7] hover:bg-[rgba(43,140,255,0.1)] hover:text-[#EEF6FF]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-[rgba(255,255,255,0.06)] pt-2">
              <Link href="/login" className="block px-3 py-2.5 text-sm text-[#EEF6FF]" onClick={() => setOpen(false)}>
                Connexion
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="mt-1 block rounded-full bg-[#2B8CFF] px-3 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Commencer
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
