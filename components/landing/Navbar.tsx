"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LandingWordmark } from "./BrandLogo";
import { ROUTES } from "./config";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale } from "./locale-provider";
import { CtaButton } from "./ui";
import { cn } from "@/src/lib/utils";

export function Navbar() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = Boolean(useReducedMotion());

  const links = [
    { href: ROUTES.explore, label: t.nav.explore },
    { href: ROUTES.categories, label: t.nav.categories },
    { href: ROUTES.how, label: t.nav.how },
    { href: ROUTES.faq, label: t.nav.faq },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onResize = () => {
      if (window.innerWidth >= 960) setOpen(false);
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
    <header className={cn("go-nav", scrolled && "is-scrolled", open && "is-open")}>
      <div className="go-nav__wrap">
        <div className="go-nav__shell">
          <Link href={ROUTES.home} className="go-wordmark" aria-label={t.nav.homeAria}>
            <LandingWordmark priority />
          </Link>

          <ul className="go-nav__links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="go-nav__link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="go-nav__actions">
            <LanguageSwitch />
            <Link href={ROUTES.login} className="go-nav__login">
              {t.nav.login}
            </Link>
            <CtaButton href={ROUTES.signup} className="go-nav__cta">
              {t.nav.cta}
            </CtaButton>
          </div>

          <button
            type="button"
            className="go-nav__burger"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            aria-controls="go-nav-drawer"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.85} />
            ) : (
              <Menu className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.85} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="overlay"
              type="button"
              className="go-nav__overlay"
              aria-label={t.nav.closeMenu}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />
            <motion.nav
              key="drawer"
              id="go-nav-drawer"
              className="go-nav__drawer"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <LanguageSwitch />
              <ul className="go-nav__drawer-links">
                {links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} onClick={close}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="go-nav__drawer-actions">
                <Link href={ROUTES.login} className="go-btn go-btn--secondary go-btn--full" onClick={close}>
                  {t.nav.login}
                </Link>
                <CtaButton href={ROUTES.signup} className="go-btn--full" onClick={close}>
                  {t.nav.cta}
                </CtaButton>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
