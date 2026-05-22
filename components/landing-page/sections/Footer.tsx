import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "/login", label: "Connexion" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--zg-border-soft)] py-12">
      <div className="zg-lp-container zg-lp-body">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo-zengrow.png"
                alt="ZenGrow"
                width={110}
                height={28}
                className="h-6 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[var(--zg-muted-soft)]">
              Plateforme IA pour restaurants — réservations, relances, campagnes et avis Google.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Pied de page">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--zg-muted)] transition-colors hover:text-[var(--zg-fg)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-center text-xs text-[var(--zg-muted-soft)] md:text-left">
          © {new Date().getFullYear()} ZenGrow. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
