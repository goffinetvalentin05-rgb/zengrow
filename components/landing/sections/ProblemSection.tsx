"use client";

import Image from "next/image";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, ScrollReveal, Section, SectionTitle } from "../ui";

export function ProblemSection() {
  const { t } = useLocale();

  return (
    <Section className="go-problem-v2">
      <Container>
        <ScrollReveal className="go-section-head go-section-head--center">
          <Eyebrow>{t.problem.label}</Eyebrow>
          <SectionTitle className="go-title--center">{t.problem.title}</SectionTitle>
          <p className="go-lead go-problem__body">{t.problem.body}</p>
          <div className="go-problem__know">
            <p className="go-problem__know-lead">{t.problem.pointsLead}</p>
            <ul>
              {t.problem.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal className="go-mind" y={22}>
          <figure className="go-mind__frame">
            <Image
              src="/landing/problem-mind-ref.png"
              alt={t.problem.visualAlt}
              fill
              sizes="(max-width: 880px) 100vw, 72rem"
              className="go-mind__img"
              priority
            />
            <span className="go-mind__glow" aria-hidden />
            <span className="go-mind__cavity" aria-hidden />
            <div className="go-mind__names" aria-hidden>
              <span className="go-mind__chip go-mind__chip--a">Kéo</span>
              <span className="go-mind__chip go-mind__chip--b">Yomi</span>
              <span className="go-mind__chip go-mind__chip--c">Iman Gadhzi</span>
            </div>
            <figcaption className="go-mind__kicker">{t.problem.visualKicker}</figcaption>
          </figure>
          <p className="go-algo__caption">{t.problem.visualCaption}</p>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
