"use client";

import { ROUTES } from "../config";
import { useLocale } from "../locale-provider";
import { Container, CtaButton, Eyebrow, Section, SectionLead, SectionTitle } from "../ui";

function PricingCard({
  plan,
  featured = false,
}: {
  plan: {
    name: string;
    price: string;
    period: string;
    tagline: string;
    features: readonly string[];
    cta: string;
  };
  featured?: boolean;
}) {
  return (
    <article className={`go-pricing-card${featured ? " go-pricing-card--featured" : ""}`}>
      <div className="go-pricing-card__inner">
        <p className="go-pricing-card__name">{plan.name}</p>
        <div className="go-pricing-card__price">
          <strong>{plan.price}</strong>
          <span>{plan.period}</span>
        </div>
        <p className="go-pricing-card__tagline">{plan.tagline}</p>
        <ul className="go-pricing-card__features">
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <CtaButton
          href={ROUTES.signup}
          variant={featured ? "primary" : "secondary"}
          className="go-pricing-card__cta"
        >
          {plan.cta}
        </CtaButton>
      </div>
    </article>
  );
}

export function PricingSection() {
  const { t } = useLocale();

  return (
    <Section id="pricing" className="go-pricing-section">
      <Container>
        <div className="go-pricing-section__head go-section-head go-section-head--center">
          <Eyebrow>{t.pricing.label}</Eyebrow>
          <SectionTitle className="go-title--center">{t.pricing.title}</SectionTitle>
          <SectionLead className="go-pricing-section__lead">{t.pricing.subtitle}</SectionLead>
        </div>

        <div className="go-pricing-section__grid">
          <PricingCard plan={t.pricing.free} featured />
          <PricingCard plan={t.pricing.pro} />
        </div>
      </Container>
    </Section>
  );
}
