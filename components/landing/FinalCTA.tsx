"use client";

import { ArrowUpRight } from "lucide-react";
import { CTA } from "./config";
import { Container, CtaButton, ScrollReveal } from "./ui";

export function FinalCTA() {
  return (
    <section id="commencer" className="go-final" aria-labelledby="go-final-title">
      <Container>
        <ScrollReveal>
          <p className="go-final__label">Prêt à commencer ?</p>
          <h2 id="go-final-title">
            Transformez les <em>intentions d’offrir</em> en nouvelles ventes.
          </h2>
          <p className="go-final__lead">
            Ajoutez ZifTip à votre établissement et commencez à vendre vos bons cadeaux sans construire votre propre
            système.
          </p>
          <div className="go-final__action">
            <CtaButton variant="accent">
              {CTA.primary}
              <ArrowUpRight strokeWidth={1.8} />
            </CtaButton>
            <p className="go-final__proof">{CTA.finePrint}</p>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
