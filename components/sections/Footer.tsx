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
    <footer className="landing-divider border-t bg-landing-section py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6">
        <div className="flex items-center gap-5 text-landing-muted">
          <Link href="#" className="transition hover:text-landing-accent-soft" aria-label="Twitter">
            <Twitter className="size-5" />
          </Link>
          <Link href="#" className="transition hover:text-landing-accent-soft" aria-label="Instagram">
            <Instagram className="size-5" />
          </Link>
          <Link href="#" className="transition hover:text-landing-accent-soft" aria-label="LinkedIn">
            <Linkedin className="size-5" />
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-landing-muted">
          {main.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-landing-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="landing-divider flex w-full flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-landing-muted sm:flex-row">
          <p>© 2026 ZenGrow. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-landing-fg">
              CGU
            </Link>
            <Link href="#" className="hover:text-landing-fg">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
