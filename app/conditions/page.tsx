import type { Metadata } from "next";
import { PRODUCT } from "@/components/fitme-landing/config";
import { FitmeShell } from "@/components/fitme-landing/FitmeShell";
import { Container } from "@/components/fitme-landing/ui";

export const metadata: Metadata = {
  title: { absolute: `Conditions d’utilisation — ${PRODUCT.name}` },
};

export default function TermsPage() {
  return (
    <FitmeShell>
      <Container>
        <article className="fitme-legal">
          <h1>Conditions d’utilisation</h1>
          <p>
            Cette page sera complétée avant le lancement public. Le Style Profile est un achat unique,
            sans abonnement.
          </p>
          <p>
            Si vous avez une question, écrivez-nous via le lien Contact en bas de page.
          </p>
        </article>
      </Container>
    </FitmeShell>
  );
}
