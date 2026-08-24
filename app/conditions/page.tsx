import type { Metadata } from "next";
import { PRODUCT } from "@/components/landing/config";
import { LandingShell } from "@/components/landing/LandingShell";
import { Container } from "@/components/landing/ui";

export const metadata: Metadata = {
  title: { absolute: `Conditions d’utilisation — ${PRODUCT.name}` },
};

export default function TermsPage() {
  return (
    <LandingShell>
      <Container>
        <article className="go-legal">
          <h1>Conditions d’utilisation</h1>
          <p>
            Cette page sera complétée avant le lancement public. L’accès au produit peut être
            modifié jusqu’au lancement.
          </p>
          <p>Si vous avez une question, utilisez les liens en bas de page.</p>
        </article>
      </Container>
    </LandingShell>
  );
}
