import {
  BlockHeader,
  Container,
  PremiumCard,
  Section,
  SectionAmbient,
} from "../ui";
import {
  ScenarioClientLost,
  ScenarioClientNoFollowup,
  ScenarioReviewMissed,
} from "../scenarios";
import { ScrollReveal } from "../ScrollReveal";

const SCENARIOS = [
  {
    title: "Client venu une fois",
    caption: "Il repart satisfait, puis vous oublie.",
    visual: <ScenarioClientNoFollowup />,
  },
  {
    title: "Client qui s'éloigne",
    caption: "Il n'est pas revenu depuis des semaines — et personne ne le relance.",
    visual: <ScenarioClientLost />,
  },
  {
    title: "Avis oublié",
    caption: "Un client content ne laisse pas toujours un avis tout seul.",
    visual: <ScenarioReviewMissed />,
  },
];

export function ProblemSection() {
  return (
    <Section id="probleme" className="relative overflow-hidden">
      <SectionAmbient variant="rose" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Trop de clients ne reviennent jamais."
            subtitle="Entre les clients oubliés, les relances manquées et les avis non collectés, un restaurant perd du chiffre d'affaires sans même s'en rendre compte."
          />
        </ScrollReveal>

        <div className="zg-pain-grid mt-14">
          {SCENARIOS.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.06}>
              <PremiumCard
                danger
                hover
                problem
                className="flex h-full flex-col p-5 md:p-6"
              >
                <h3 className="zg-display text-lg font-bold text-white md:text-xl">
                  {s.title}
                </h3>
                <div className="my-4 flex-1">{s.visual}</div>
                <p className="text-sm font-medium text-[#c4b5fd]/90">{s.caption}</p>
              </PremiumCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
