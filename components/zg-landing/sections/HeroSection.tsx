"use client";

import { Play } from "lucide-react";
import { Badge, Container, GhostButton, GradientText, MegaTitle, PrimaryButton } from "../ui";
import { WorkflowLoopSection } from "./WorkflowLoopSection";

export function HeroSection() {
  return (
    <div className="zg-zone-hero">
      <section className="relative overflow-hidden">
        <div className="flex flex-col justify-center pt-28 pb-4 md:pt-32 md:pb-8">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <Badge>Relances clients automatiques</Badge>

              <MegaTitle as="h1" className="zg-title-hero mt-6">
                Votre travail est terminé.{" "}
                <GradientText>Le nôtre commence.</GradientText>
              </MegaTitle>

              <p className="zg-hero-sub mx-auto mt-6 max-w-2xl text-lg md:text-xl">
                Ajoutez vos clients une fois. ZenGrow les recontacte automatiquement au bon moment
                pour planifier leur prochain rendez-vous.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <PrimaryButton href="/signup" className="!min-h-14 !px-8 !text-base sm:!text-lg">
                  Essayer gratuitement
                </PrimaryButton>
                <GhostButton
                  href="#workflow"
                  className="zg-btn-play !min-h-14 !px-8 !text-base sm:!text-lg"
                >
                  <span className="zg-btn-play__icon">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                  Voir comment ça marche
                </GhostButton>
              </div>

              <p className="zg-hero-note">
                Aucun CRM. Aucun logiciel compliqué. Juste vos clients qui reviennent
                automatiquement.
              </p>
            </div>
          </Container>
        </div>
      </section>

      <WorkflowLoopSection />
    </div>
  );
}
