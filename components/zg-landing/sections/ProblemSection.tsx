import {
  BlockHeader,
  Container,
  PremiumCard,
  Section,
  SectionAmbient,
} from "../ui";
import {
  ScenarioClientNoFollowup,
  ScenarioReviewMissed,
  ScenarioVisitorLost,
} from "../scenarios";
import { ScrollReveal } from "../ScrollReveal";

const SCENARIOS = [
  {
    title: "Visiteur intéressé",
    caption: "Il découvre votre restaurant, mais ne réserve pas.",
    visual: <ScenarioVisitorLost />,
  },
  {
    title: "Client venu une fois",
    caption: "Il repart satisfait, puis vous oublie.",
    visual: <ScenarioClientNoFollowup />,
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
            title="Trop de clients passent entre les mailles."
            subtitle="Entre les visiteurs qui ne réservent pas, les clients non relancés et les avis oubliés, un restaurant perd souvent des opportunités sans s'en rendre compte."
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
