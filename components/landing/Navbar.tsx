"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { BRAND_NAME } from "./brand";
import { CTA, MOBILE_NAV_PRIMARY, MOBILE_NAV_SECONDARY, NAV_LINKS, ROUTES } from "./config";
import { CtaButton } from "./ui";
import { cn } from "@/src/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const footer = document.querySelector(".go-footer");
      setOverDark(Boolean(footer && footer.getBoundingClientRect().top < 92));
    };
    const onResize = () => {
      if (window.innerWidth >= 960) setOpen(false);
      onScroll();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
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

  const close = () => setOpen(false);

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
          {open ? <X className="h-4 w-4" strokeWidth={1.7} /> : <Menu className="h-4 w-4" strokeWidth={1.7} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.button
            key="overlay"
            type="button"
            className="go-nav__overlay"
            aria-label="Fermer le menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease }}
            onClick={close}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {open ? (
          <motion.nav
            key="drawer"
            id="go-nav-drawer"
            className="go-nav__drawer"
            aria-label="Menu mobile"
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.32, ease }}
          >
            <div className="go-nav__drawer-group">
              {MOBILE_NAV_PRIMARY.map((link) => (
                <a key={link.href} href={link.href} onClick={close}>
                  {link.label}
                </a>
              ))}
            </div>
            <div className="go-nav__drawer-sep" aria-hidden />
            <div className="go-nav__drawer-group go-nav__drawer-group--muted">
              {MOBILE_NAV_SECONDARY.map((link) =>
                link.href.startsWith("/") ? (
                  <Link key={link.href} href={link.href} onClick={close}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.href} href={link.href} onClick={close}>
                    {link.label}
                  </a>
                ),
              )}
            </div>
            <CtaButton className="go-nav__drawer-cta" onClick={close}>
              {CTA.primary}
            </CtaButton>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
