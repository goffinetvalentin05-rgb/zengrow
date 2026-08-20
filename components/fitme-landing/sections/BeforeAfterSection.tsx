import { StyleScanner } from "../components/StyleScanner";
import { Container, Section, ScrollReveal } from "../ui";

export function BeforeAfterSection() {
  return (
    <Section id="avant-apres" className="fitme-ba-section">
      <Container>
        <ScrollReveal className="fitme-center">
          <h2 className="fitme-display fitme-h2">
            Voyez le style qui vous va vraiment.
          </h2>
          <p className="fitme-lead">
            La même personne. Plusieurs univers. Découvrez immédiatement ceux qui vous mettent le plus en valeur.
          </p>
        </ScrollReveal>
        <StyleScanner />
      </Container>
    </Section>
  );
}
