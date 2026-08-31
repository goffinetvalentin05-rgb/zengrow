"use client";

import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { Container, CtaButton, ScrollReveal } from "../ui";

export function FinalCtaSection() {
  const { t } = useLocale();

  return (
    <section id="start" className="go-final" aria-label={t.brand.name}>
      <Container>
        <ScrollReveal className="go-final__panel">
          <h2 className="go-final__title">
            {t.finalCta.titleLine1}
            <br />
            {t.finalCta.titleLine2}
          </h2>
          <p className="go-final__lead">{t.finalCta.subtitle}</p>
          <div className="go-final__actions">
            <CtaButton href={ROUTES.categories} variant="on-ink">
              {t.finalCta.ctaPrimary}
            </CtaButton>
            <CtaButton href={ROUTES.signup} variant="secondary" className="go-final__secondary">
              {t.finalCta.ctaSecondary}
            </CtaButton>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
