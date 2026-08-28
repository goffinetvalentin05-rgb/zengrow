"use client";

import { useLocale } from "../locale-provider";
import { Container, Eyebrow, ScrollReveal, Section, SectionTitle } from "../ui";

export function FAQSection() {
  const { t } = useLocale();

  return (
    <Section id="faq">
      <Container>
        <ScrollReveal className="go-section-head">
          <Eyebrow>{t.faq.label}</Eyebrow>
          <SectionTitle>{t.faq.title}</SectionTitle>
        </ScrollReveal>

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
