import {
  BlockHeader,
  Container,
  Section,
  SectionAmbient,
} from "../ui";
import { PlatformInteractiveDemo } from "../PlatformInteractiveDemo";
import { ScrollReveal } from "../ScrollReveal";

export function PlatformSection() {
  return (
    <Section id="workflow" className="relative overflow-hidden">
      <SectionAmbient variant="cyan" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Comment ZenGrow fait revenir vos clients"
            subtitle="Ajoutez vos clients. ZenGrow s'occupe automatiquement des avis Google et des relances."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <PlatformInteractiveDemo />
        </ScrollReveal>
      </Container>
    </Section>
  );
}
