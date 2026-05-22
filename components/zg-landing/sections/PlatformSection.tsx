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
    <Section id="plateforme" className="relative overflow-hidden">
      <SectionAmbient variant="cyan" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Tout ce qu'il faut pour remplir plus régulièrement."
            subtitle="Une plateforme simple pour gérer les réservations, relancer les clients, lancer des campagnes et développer vos avis Google."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <PlatformInteractiveDemo />
        </ScrollReveal>
      </Container>
    </Section>
  );
}
