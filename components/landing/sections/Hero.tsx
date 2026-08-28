"use client";

import { Play, Sparkles } from "lucide-react";
import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { TodayMockup } from "../mockups/TodayMockup";
import { Container, ScrollReveal, UrlAnalyzeField } from "../ui";

export function Hero() {
  const { t } = useLocale();

  return (
    <section className="go-hero" id="top">
      <Container wide className="go-hero__inner">
        <ScrollReveal className="go-hero__copy">
          <p className="go-hero__badge">
            <Sparkles strokeWidth={1.75} aria-hidden />
            {t.hero.badge}
          </p>

          <h1 className="go-hero__title">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>

          <p className="go-hero__lead">{t.hero.subtitle}</p>

          <div className="go-hero__form">
            <UrlAnalyzeField
              hero
              placeholder={t.hero.urlPlaceholder}
              buttonLabel={t.hero.ctaPrimary}
            />
          </div>

          <a href={ROUTES.how} className="go-hero__secondary">
            <span className="go-hero__play" aria-hidden>
              <Play strokeWidth={0} />
            </span>
            {t.hero.ctaSecondary}
          </a>

          <p className="go-hero__fine">{t.hero.finePrint}</p>
        </ScrollReveal>

        <ScrollReveal className="go-hero__mock" delay={0.12} y={26}>
          <TodayMockup />
        </ScrollReveal>
      </Container>
    </section>
  );
}
