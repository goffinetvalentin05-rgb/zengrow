"use client";

import { useLocale } from "../locale-provider";
import { Container, Eyebrow, ScrollReveal, Section, SectionLead, SectionTitle } from "../ui";

export function FeaturesSection() {
  const { t } = useLocale();

  return (
    <Section id="features">
      <Container>
        <ScrollReveal className="go-section-head">
          <Eyebrow>{t.features.label}</Eyebrow>
          <SectionTitle>{t.features.title}</SectionTitle>
          <SectionLead>{t.features.subtitle}</SectionLead>
        </ScrollReveal>

        <div className="go-features">
          {t.features.items.map((item, index) => (
            <ScrollReveal key={item.index} delay={index * 0.03} className="go-feature">
              <p className="go-feature__index">{item.index}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="go-chip-row">
                  {item.chips.map((chip) => (
                    <span key={chip} className="go-chip">
                      {chip}
                    </span>
                  ))}
                </div>
                {item.phrase ? <p className="go-feature__phrase">{item.phrase}</p> : null}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="go-features__closing">
          <p>
            {t.features.closingLine1}
            <br />
            {t.features.closingLine2}
          </p>
          <p className="go-features__closing-sub">{t.features.closingLine3}</p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
