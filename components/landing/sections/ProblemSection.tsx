"use client";

import { useLocale } from "../locale-provider";
import { QuestionRoulette } from "../QuestionRoulette";
import { Container, Eyebrow, ScrollReveal, Section, SectionTitle } from "../ui";

export function ProblemSection() {
  const { locale, t } = useLocale();

  return (
    <Section>
      <Container>
        <ScrollReveal>
          <Eyebrow>{t.problem.label}</Eyebrow>
          <SectionTitle>
            {t.problem.titleLine1}
            <br />
            {t.problem.titleLine2}
          </SectionTitle>
        </ScrollReveal>
      </Container>

      <ScrollReveal delay={0.05}>
        <QuestionRoulette key={locale} questions={t.problem.questions} />
      </ScrollReveal>

      <Container>
        <ScrollReveal delay={0.08}>
          <div className="go-problem__close">
            <p className="go-problem__kicker">{t.problem.closeLabel}</p>
            <h3 className="go-problem__close-title">{t.problem.closeTitle}</h3>
            <p className="go-problem__close-lead">{t.problem.closeSubtitle}</p>

            <div className="go-problem__priorities">
              {t.problem.priorities.map((item) => (
                <div key={item.index} className="go-problem__priority">
                  <span className="go-problem__priority-index">{item.index}</span>
                  <span className={`go-problem__priority-impact go-problem__priority-impact--${item.tone}`}>
                    {item.impact}
                  </span>
                  <span className="go-problem__priority-title">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
