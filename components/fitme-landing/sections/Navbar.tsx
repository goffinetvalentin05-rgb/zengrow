"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PRODUCT, NAV_LINKS, ROUTES, CTA } from "../config";
import { Container, CtaButton } from "../ui";
import { cn } from "@/src/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cn("fitme-nav", scrolled && "is-scrolled", open && "is-open")}>
      <Container className="relative fitme-nav__wrap">
        <div className="fitme-nav__inner">
          <button
            type="button"
            className="fitme-nav__burger"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" strokeWidth={1.75} /> : <Menu className="h-4 w-4" strokeWidth={1.75} />}
          </button>

          <Link href={ROUTES.home} className="fitme-wordmark" aria-label={`${PRODUCT.name} — accueil`}>
            {PRODUCT.name}
          </Link>

          <ul className="fitme-nav__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="fitme-nav__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="fitme-nav__actions">
            <Link href={ROUTES.login} className="fitme-nav__login">
              Se connecter
            </Link>
            <CtaButton className="fitme-cta--nav">
              <span className="fitme-cta__full">{CTA.primary}</span>
              <span className="fitme-cta__short">Découvrir</span>
            </CtaButton>
          </div>
        </div>

        {open ? (
          <div className="fitme-nav-drawer">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href={ROUTES.login} onClick={() => setOpen(false)}>
              Se connecter
            </Link>
            <div className="fitme-nav-drawer__cta">
              <CtaButton className="fitme-cta--block" href={ROUTES.discover}>
                {CTA.primary}
              </CtaButton>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
