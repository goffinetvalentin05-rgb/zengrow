"use client";

import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { Container, CtaButton, Eyebrow } from "../ui";

export function FinalCtaSection() {
  const { t } = useLocale();

  return (
    <section id="start" className="go-final" aria-label={t.brand.name}>
      <Container wide>
        <div className="go-final__shell">
          <div className="go-final__panel">
            <Eyebrow>{t.finalCta.label}</Eyebrow>
            <h2 className="go-final__title">
              <span>{t.finalCta.titleLine1}</span>
              <span>{t.finalCta.titleLine2}</span>
            </h2>
            <p className="go-final__lead">{t.finalCta.subtitle}</p>
            <div className="go-final__actions">
              <CtaButton href={ROUTES.signup} variant="primary">
                {t.finalCta.ctaPrimary}
              </CtaButton>
              <CtaButton href={ROUTES.explore} variant="secondary" className="go-final__secondary">
                {t.finalCta.ctaSecondary}
              </CtaButton>
            </div>
            <p className="go-final__note">{t.finalCta.note}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
