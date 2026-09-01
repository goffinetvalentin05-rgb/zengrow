"use client";

import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section, SectionLead, SectionTitle } from "../ui";

export function FAQSection() {
  const { t } = useLocale();

  return (
    <Section id="faq" className="go-faq-section">
      <Container>
        <div className="go-section-head go-faq-section__head">
          <Eyebrow>{t.faq.label}</Eyebrow>
          <SectionTitle>{t.faq.title}</SectionTitle>
          <SectionLead className="go-faq-section__lead">{t.faq.subtitle}</SectionLead>
        </div>

        <div className="go-faq">
          {t.faq.items.map((item) => (
            <details key={item.q} className="go-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
