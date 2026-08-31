"use client";

import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { HeroField } from "../mockups/HeroField";
import { Container, CtaButton, ScrollReveal } from "../ui";

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="go-hero" id="top">
      <HeroField />

      <Container wide className="go-hero__inner">
        <ScrollReveal className="go-hero__copy">
          <p className="go-hero__badge">{t.hero.badge}</p>

          <h1 className="go-hero__title">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>

          <p className="go-hero__lead">{t.hero.subtitle}</p>

          <div className="go-hero__actions">
            <CtaButton href={ROUTES.categories}>{t.hero.ctaPrimary}</CtaButton>
            <CtaButton href={ROUTES.signup} variant="secondary">
              {t.hero.ctaSecondary}
            </CtaButton>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
