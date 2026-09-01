"use client";

import { FeatureVideoCard } from "../FeatureVideoCard";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section, SectionTitle } from "../ui";

export function AnswerSection() {
  const { t } = useLocale();
  const cards = [
    { title: t.answer.discoverTitle, description: t.answer.discoverText },
    { title: t.answer.followTitle, description: t.answer.followText },
    { title: t.answer.connectTitle, description: t.answer.connectText },
  ];

  return (
    <Section id="decouvrir" className="go-solution">
      <Container>
        <div className="go-section-head go-section-head--center">
          <Eyebrow>{t.answer.label}</Eyebrow>
          <SectionTitle className="go-title--center">{t.answer.title}</SectionTitle>
          <p className="go-lead go-solution__lead">{t.answer.text}</p>
        </div>

        <div className="go-solution__cards">
          {cards.map((card) => (
            <FeatureVideoCard key={card.title} title={card.title} description={card.description} />
          ))}
        </div>

        <p className="go-solution__example">{t.answer.example}</p>
      </Container>
    </Section>
  );
}
