"use client";

import Link from "next/link";
import { LandingWordmark } from "./BrandLogo";
import { ROUTES } from "./config";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale } from "./locale-provider";
import { Container } from "./ui";

export function Footer({ variant = "default" }: { variant?: "default" | "close" }) {
  const { t } = useLocale();

  if (variant === "close") {
    return (
      <footer className="go-footer go-footer--close">
        <Container wide>
          <div className="go-footer__row">
            <ul className="go-footer__links">
              <li>
                <Link href={ROUTES.home}>{t.brand.name}</Link>
              </li>
              <li>
                <Link href={ROUTES.privacy}>{t.footer.privacy}</Link>
              </li>
              <li>
                <Link href={ROUTES.terms}>{t.footer.terms}</Link>
              </li>
            </ul>
            <div className="go-footer__meta">
              <LanguageSwitch />
            </div>
          </div>
        </Container>
      </footer>
    );
  }

  const links = [
    { href: ROUTES.privacy, label: t.footer.privacy },
    { href: ROUTES.terms, label: t.footer.terms },
    { href: ROUTES.contact, label: t.footer.contact },
    { href: ROUTES.pricing, label: t.footer.pricing },
  ];

  return (
    <footer className="go-footer">
      <Container wide>
        <div className="go-footer__top">
          <div className="go-footer__brand">
            <Link href={ROUTES.home} className="go-wordmark" aria-label={t.nav.homeAria}>
              <LandingWordmark />
            </Link>
            <p className="go-footer__tagline">{t.footer.tagline}</p>
          </div>

          <ul className="go-footer__links">
            {links.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("#") || link.href.startsWith("mailto:") ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="go-footer__bottom">
          <p className="go-footer__copyright">{t.footer.copyright}</p>
          <LanguageSwitch />
        </div>
      </Container>
    </footer>
  );
}
