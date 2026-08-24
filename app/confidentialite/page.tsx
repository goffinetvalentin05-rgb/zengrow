import type { Metadata } from "next";
import { PRODUCT } from "@/components/landing/config";
import { LandingShell } from "@/components/landing/LandingShell";
import { Container } from "@/components/landing/ui";

export const metadata: Metadata = {
  title: { absolute: `Confidentialité — ${PRODUCT.name}` },
};

export default function PrivacyPage() {
  return (
    <LandingShell>
      <Container>
        <article className="go-legal">
          <h1>Confidentialité</h1>
          <p>
            Cette page sera complétée avant le lancement public. En attendant, les informations
            collectées ne sont pas utilisées comme contenu marketing.
          </p>
          <p>Si vous avez une question, utilisez les liens en bas de page.</p>
        </article>
      </Container>
    </LandingShell>
  );
}
