"use client";

import Link from "next/link";
import { LandingWordmark } from "./BrandLogo";
import { ROUTES } from "./config";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale } from "./locale-provider";
import { Container } from "./ui";

export function Footer({ variant = "default" }: { variant?: "default" | "close" }) {
  const { t } = useLocale();

  const links =
    variant === "close"
      ? [
          { href: ROUTES.home, label: t.footer.product },
          { href: ROUTES.privacy, label: t.footer.privacy },
          { href: ROUTES.terms, label: t.footer.terms },
        ]
      : [
          { href: ROUTES.home, label: t.footer.product },
          { href: ROUTES.faq, label: t.footer.faq },
          { href: ROUTES.privacy, label: t.footer.privacy },
          { href: ROUTES.terms, label: t.footer.terms },
        ];

  return (
    <footer className={variant === "close" ? "go-footer go-footer--close" : "go-footer"}>
      <Container wide>
        <div className="go-footer__row">
          {variant === "default" ? (
            <Link href={ROUTES.home} className="go-wordmark" aria-label={t.nav.homeAria}>
              <LandingWordmark />
            </Link>
          ) : null}
          <ul className="go-footer__links">
            {links.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                {link.href.startsWith("#") ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
          <div className="go-footer__meta">
            {variant === "default" ? (
              <p className="go-footer__tagline">{t.footer.tagline}</p>
            ) : null}
            <LanguageSwitch />
          </div>
        </div>
      </Container>
    </footer>
  );
}
