import {
  BlockHeader,
  Container,
  PremiumCard,
  Section,
  SectionAmbient,
} from "../ui";
import {
  ScenarioClientNoFollowup,
  ScenarioQuietNight,
  ScenarioReviewMissed,
  ScenarioVisitorLost,
} from "../scenarios";
import { ScrollReveal } from "../ScrollReveal";

const SCENARIOS = [
  {
    title: "Visiteur intéressé",
    caption: "Il découvre votre restaurant, mais ne réserve pas.",
    visual: <ScenarioVisitorLost />,
    offset: "",
  },
  {
    title: "Client venu une fois",
    caption: "Il repart satisfait, puis vous oublie.",
    visual: <ScenarioClientNoFollowup />,
    offset: "md:translate-y-8",
  },
  {
    title: "Avis oublié",
    caption: "Un client content ne laisse pas toujours un avis tout seul.",
    visual: <ScenarioReviewMissed />,
    offset: "",
  },
  {
    title: "Soirée calme",
    caption: "Les périodes creuses restent difficiles à remplir.",
    visual: <ScenarioQuietNight />,
    offset: "md:translate-y-6",
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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {SCENARIOS.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.06} className={s.offset}>
              <PremiumCard danger depth hover className="flex h-full flex-col p-5 md:p-6">
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
