"use client";

import { useLocale } from "../locale-provider";
import { Container, ScrollReveal, Section, SectionLead, SectionTitle } from "../ui";

export function HowItWorksSection() {
  const { t } = useLocale();

  return (
    <Section id="how" className="go-how">
      <Container>
        <ScrollReveal className="go-section-head go-section-head--center">
          <SectionTitle className="go-title--center">{t.how.title}</SectionTitle>
          <SectionLead>{t.how.subtitle}</SectionLead>
        </ScrollReveal>

        <div className="go-steps">
          {t.how.steps.map((step, index) => (
            <ScrollReveal key={step.index} className="go-step" delay={index * 0.08}>
              <p className="go-step__index">{step.index}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
