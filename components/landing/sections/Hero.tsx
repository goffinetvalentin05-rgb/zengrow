"use client";

import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { Container, CtaButton } from "../ui";
import { HeroTitle } from "./HeroTitle";

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="go-hero" id="top">
      <Container wide className="go-hero__inner">
        <div className="go-hero__copy">
          <HeroTitle lead={t.hero.titleLead} lines={t.hero.titleRotating} />
          <p className="go-hero__lead">{t.hero.subtitle}</p>
          <div className="go-hero__actions">
            <CtaButton href={ROUTES.explore}>{t.hero.ctaPrimary}</CtaButton>
            <CtaButton href={ROUTES.signup} variant="secondary">
              {t.hero.ctaSecondary}
            </CtaButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
