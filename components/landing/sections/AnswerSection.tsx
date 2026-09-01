"use client";

import { FeatureVideoCard } from "../FeatureVideoCard";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section, SectionTitle } from "../ui";

export function AnswerSection() {
  const { t } = useLocale();
  const cards = [
    {
      title: t.answer.discoverTitle,
      description: t.answer.discoverText,
      mediaSrc: "/landing/discover.mp4?v=2",
      poster: "/landing/discover.jpg",
      mediaClassName: "go-feature-card__media--screen",
    },
    {
      title: t.answer.followTitle,
      description: t.answer.followText,
      mediaSrc: "/landing/follow.mp4",
      poster: "/landing/follow.jpg",
      mediaClassName: "go-feature-card__media--screen",
      frame: "phone" as const,
    },
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
            <FeatureVideoCard
              key={card.title}
              title={card.title}
              description={card.description}
              mediaSrc={card.mediaSrc}
              poster={card.poster}
              mediaClassName={card.mediaClassName}
              frame={"frame" in card ? card.frame : undefined}
            />
          ))}
        </div>

        <p className="go-solution__example">{t.answer.example}</p>
      </Container>
    </Section>
  );
}
