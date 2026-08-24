"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { BRAND_NAME } from "./brand";
import { FOOTER_COMPANY_LINKS, FOOTER_PRODUCT_LINKS, LEGAL_LINKS, ROUTES } from "./config";
import { Container } from "./ui";

function FooterNavLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return <a href={href}>{label}</a>;
  }

  return <Link href={href}>{label}</Link>;
}

export function Footer() {
  const year = new Date().getFullYear();

  const onNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <footer className="go-footer">
      <Container>
        <div className="go-footer__grid">
          <div className="go-footer__brand">
            <Link href={ROUTES.home} className="go-footer__logo" aria-label={`${BRAND_NAME} — accueil`}>
              <BrandLogo className="go-footer__logo-img" sizes="180px" />
            </Link>
            <p>Le système simple pour vendre et gérer vos bons cadeaux.</p>
          </div>

          <div className="go-footer__links">
            <nav aria-label="Produit">
              <p className="go-footer__heading">Produit</p>
              {FOOTER_PRODUCT_LINKS.map((link) => (
                <FooterNavLink key={`${link.href}-${link.label}`} href={link.href} label={link.label} />
              ))}
            </nav>

            <nav aria-label="Entreprise">
              <p className="go-footer__heading">Entreprise</p>
              {FOOTER_COMPANY_LINKS.map((link) => (
                <FooterNavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </nav>
          </div>

          <form className="go-footer__news" onSubmit={onNewsletterSubmit} noValidate>
            <p className="go-footer__heading">Restez au courant.</p>
            <p>Recevez les nouveautés de ZifTip.</p>
            <div className="go-footer__news-row">
              <label className="go-sr" htmlFor="go-newsletter-email">
                Adresse e-mail
              </label>
              <input
                id="go-newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Votre e-mail"
              />
              <button type="submit">S’inscrire</button>
            </div>
          </form>
        </div>
      </Container>

      <Container>
        <div className="go-footer__legal">
          <p>
            © {year} {BRAND_NAME}. Tous droits réservés.
          </p>
          <nav aria-label="Mentions légales">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>

      <div className="go-footer__mega-wrap" aria-hidden>
        <p className="go-footer__mega-word">Zengrow</p>
      </div>
    </footer>
  );
}
