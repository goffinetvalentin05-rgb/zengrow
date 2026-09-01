"use client";

import { useLocale } from "../locale-provider";
import { Container, Section, SectionTitle } from "../ui";

export function HowItWorksSection() {
  const { t } = useLocale();

  return (
    <Section id="how" className="go-how">
      <Container>
        <div className="go-section-head go-section-head--center">
          <SectionTitle className="go-title--center">{t.how.title}</SectionTitle>
        </div>

        <div className="go-steps go-steps--four">
          {t.how.steps.map((step, index) => (
            <div key={step.title} className="go-step">
              <p className="go-step__index">{String(index + 1).padStart(2, "0")}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
