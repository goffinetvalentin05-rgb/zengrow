"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";

const main = [
  { href: "/#hero", label: "Accueil" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
  { href: "mailto:contact@zengrow.ch", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(59,158,255,0.1)] pb-10 pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6">
        <div className="flex items-center gap-5 text-[#8BA3C7]">
          <Link href="#" className="transition hover:text-[#5EB3FF]" aria-label="Twitter">
            <Twitter className="size-5" />
          </Link>
          <Link href="#" className="transition hover:text-[#5EB3FF]" aria-label="Instagram">
            <Instagram className="size-5" />
          </Link>
          <Link href="#" className="transition hover:text-[#5EB3FF]" aria-label="LinkedIn">
            <Linkedin className="size-5" />
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#8BA3C7]">
          {main.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-[#EEF6FF]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-8 text-xs text-[#8BA3C7] sm:flex-row">
          <p>© 2026 ZenGrow. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition hover:text-[#EEF6FF]">
              CGU
            </Link>
            <Link href="#" className="transition hover:text-[#EEF6FF]">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
