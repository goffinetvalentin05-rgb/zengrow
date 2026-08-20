import type { Metadata } from "next";
import { PRODUCT } from "@/components/fitme-landing/config";
import { FitmeShell } from "@/components/fitme-landing/FitmeShell";
import { Container } from "@/components/fitme-landing/ui";

export const metadata: Metadata = {
  title: { absolute: `Confidentialité — ${PRODUCT.name}` },
};

export default function PrivacyPage() {
  return (
    <FitmeShell>
      <Container>
        <article className="fitme-legal">
          <h1>Confidentialité</h1>
          <p>
            Cette page sera complétée avant le lancement public. En attendant, vos photos et vos
            informations ne sont pas utilisées comme contenu marketing.
          </p>
          <p>
            Si vous avez une question, écrivez-nous via le lien Contact en bas de page.
          </p>
        </article>
      </Container>
    </FitmeShell>
  );
}
