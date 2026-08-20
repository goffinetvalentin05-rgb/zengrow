import { HOW_IT_WORKS } from "../config";
import { HiwVisual } from "../components/HowItWorksVisuals";
import { Container, Section, ScrollReveal } from "../ui";

export function HowItWorksSection() {
  return (
    <Section id="comment-ca-marche" className="fitme-hiw">
      <Container>
        <ScrollReveal className="fitme-center">
          <h2 className="fitme-display fitme-h2 fitme-h2--wide">
            90 secondes pour découvrir votre style.
          </h2>
          <p className="fitme-lead">Trois étapes. Aucun quiz interminable.</p>
        </ScrollReveal>
        <div className="fitme-steps">
          {HOW_IT_WORKS.map((step, index) => (
            <ScrollReveal key={step.step} delay={0.08 + index * 0.14}>
              <article className="fitme-step">
                <p className="fitme-step__num" aria-hidden>
                  {step.step}
                </p>
                <HiwVisual step={step.visual} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
