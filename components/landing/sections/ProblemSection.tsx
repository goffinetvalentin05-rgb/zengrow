"use client";

import Image from "next/image";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, Section, SectionTitle } from "../ui";

export function ProblemSection() {
  const { t } = useLocale();

  return (
    <Section className="go-problem-v2">
      <Container>
        <div className="go-section-head go-section-head--center">
          <Eyebrow>{t.problem.label}</Eyebrow>
          <SectionTitle className="go-title--center">{t.problem.title}</SectionTitle>
          <p className="go-lead go-problem__body">{t.problem.text}</p>
        </div>

        <div className="go-mind">
          <figure className="go-mind__frame">
            <Image
              src="/landing/problem-crowd.jpg"
              alt=""
              fill
              sizes="(max-width: 880px) 100vw, 72rem"
              className="go-mind__img"
              priority
            />
          </figure>
        </div>
      </Container>
    </Section>
  );
}
