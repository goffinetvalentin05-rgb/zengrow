"use client";

import { RefreshCw, Sparkles, Star, UserPlus } from "lucide-react";
import { BlockHeader, Container, PremiumCard, Section, SectionAmbient } from "../ui";
import { WorkflowStepUI } from "../scenarios";
import { ScrollReveal } from "../ScrollReveal";

const STEPS = [
  {
    icon: UserPlus,
    label: "Ajoutez le client",
    detail: "Numéro enregistré",
    ui: <WorkflowStepUI label="Client" detail="+41 79 ••• •• 42" />,
  },
  {
    icon: Star,
    label: "Avis Google",
    detail: "Demande automatique après visite",
    ui: <WorkflowStepUI label="Avis" detail="SMS envoyé" />,
  },
  {
    icon: Sparkles,
    label: "Relance automatique",
    detail: "Client inactif détecté",
    ui: <WorkflowStepUI label="IA" detail="Relance suggérée" variant="ai" />,
    featured: true,
  },
  {
    icon: RefreshCw,
    label: "Le client revient",
    detail: "Client de retour",
    ui: <WorkflowStepUI label="Résultat" detail="Nouvelle visite" variant="success" />,
  },
];

export function WorkflowSection() {
  return (
    <Section id="workflow" className="relative overflow-hidden">
      <SectionAmbient />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Comment ça fonctionne"
            subtitle="Quatre étapes simples. ZenGrow s'occupe du reste — automatiquement."
          />
        </ScrollReveal>

        <div className="zg-workflow-track relative mt-16">
          <div className="zg-workflow-line hidden lg:block" aria-hidden />
          <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.label} delay={i * 0.05} className="min-w-[200px] shrink-0 lg:min-w-0">
                <PremiumCard
                  glow={step.featured}
                  featured={step.featured}
                  depth
                  className="relative flex h-full flex-col items-center p-4 text-center lg:p-5"
                >
                  <span className="zg-workflow-step-icon flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/25">
                    <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="zg-workflow-step-title zg-display mt-3 text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-1 text-[11px] text-[#9b8fb8]">{step.detail}</p>
                  {step.ui ? <div className="mt-3 w-full">{step.ui}</div> : null}
                </PremiumCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
