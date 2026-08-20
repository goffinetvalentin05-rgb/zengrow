import { StyleProfileReport } from "../components/StyleProfileReport";
import { Container, Section, ScrollReveal } from "../ui";

export function StyleProfileSection() {
  return (
    <Section id="style-profile" className="fitme-profile-section">
      <Container>
        <ScrollReveal className="fitme-center">
          <h2 className="fitme-display fitme-h2">Votre style. Enfin clair.</h2>
          <p className="fitme-lead">
            Vos meilleurs univers, vos couleurs et vos looks réunis dans un profil personnel.
          </p>
        </ScrollReveal>
        <StyleProfileReport />
      </Container>
    </Section>
  );
}
