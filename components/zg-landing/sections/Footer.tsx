import Image from "next/image";
import Link from "next/link";
import { Container, GhostButton, PrimaryButton } from "../ui";

const PRODUCT_LINKS = [
  { href: "#workflow", label: "Comment ça marche" },
  { href: "#plateforme", label: "Plateforme" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/signup", label: "Créer un compte" },
  { href: "/login", label: "Connexion" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#06040f]/80 pt-14 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
        aria-hidden
      />
      <Container className="pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex shrink-0" aria-label="ZenGrow — accueil">
              <Image
                src="/logo-zengrow.png"
                alt="ZenGrow"
                width={1680}
                height={482}
                className="h-9 w-auto sm:h-10"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9b8fb8]">
              La plateforme IA pour remplir votre restaurant : réservations, relances clients, marketing
              et avis Google — depuis un seul espace.
            </p>
            <p className="mt-3 text-xs font-medium tracking-wide text-violet-300/80">
              Conçu pour les restaurants en Suisse
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:col-start-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">Produit</p>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#9b8fb8] transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">Compte</p>
              <ul className="mt-4 space-y-2.5">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#9b8fb8] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">Contact</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href="mailto:contact@zengrow.ch"
                    className="text-sm text-[#9b8fb8] transition hover:text-white"
                  >
                    contact@zengrow.ch
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 lg:col-span-3 lg:items-end">
            <PrimaryButton href="/signup" className="!min-h-11 w-full justify-center lg:w-auto">
              Essayer ZenGrow
            </PrimaryButton>
            <GhostButton href="/login" className="!min-h-10 w-full justify-center lg:w-auto">
              Connexion
            </GhostButton>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-center text-xs text-[#9b8fb8]/80 md:text-left">
            © {year} ZenGrow. Tous droits réservés.
          </p>
          <p className="text-center text-xs text-[#9b8fb8]/60">
            14 jours d&apos;essai gratuit · Sans carte bancaire pour démarrer
          </p>
        </div>
      </Container>

      <div className="zg-footer-watermark" aria-hidden>
        <span className="zg-footer-watermark__text">ZENGROW</span>
      </div>
    </footer>
  );
}
