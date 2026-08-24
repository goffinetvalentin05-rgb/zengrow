"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { BRAND_NAME } from "./brand";
import { CTA, NAV_LINKS, ROUTES } from "./config";
import { CtaButton } from "./ui";
import { cn } from "@/src/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const footer = document.querySelector(".go-footer");
      setOverDark(Boolean(footer && footer.getBoundingClientRect().top < 92));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={cn("go-nav", scrolled && "is-scrolled", overDark && "is-over-dark", open && "is-open")}>
      <div className="go-nav__shell">
        <Link href={ROUTES.home} className="go-wordmark" aria-label={`${BRAND_NAME} — accueil`}>
          <BrandLogo className="go-wordmark__logo" priority sizes="150px" />
        </Link>

        <ul className="go-nav__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="go-nav__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="go-nav__actions">
          <Link href={ROUTES.login} className="go-nav__login">
            Connexion
          </Link>
          <CtaButton className="go-nav__cta">{CTA.primary}</CtaButton>
        </div>

        <CtaButton className="go-nav__cta go-nav__cta--mobile">{CTA.primary}</CtaButton>

        <button
          type="button"
          className="go-nav__burger"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="go-nav-drawer"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" strokeWidth={1.6} /> : <Menu className="h-4 w-4" strokeWidth={1.6} />}
        </button>
      </div>

      {open ? (
        <div className="go-nav__drawer" id="go-nav-drawer">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link href={ROUTES.login} onClick={() => setOpen(false)}>
            Connexion
          </Link>
          <CtaButton className="go-nav__cta">{CTA.primary}</CtaButton>
        </div>
      ) : null}
    </header>
  );
}
