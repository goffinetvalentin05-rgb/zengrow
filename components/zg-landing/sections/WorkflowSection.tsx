"use client";

import {
  Calendar,
  Database,
  Globe,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { BlockHeader, Container, PremiumCard, Section, SectionAmbient } from "../ui";
import { WorkflowStepUI } from "../scenarios";
import { ScrollReveal } from "../ScrollReveal";

const STEPS = [
  { icon: Globe, label: "Visiteur", detail: "Découverte", ui: null },
  { icon: Calendar, label: "Réservation", detail: "Réservation reçue", ui: (
    <WorkflowStepUI label="Réservation" detail="Table confirmée" />
  ) },
  { icon: Database, label: "Base client", detail: "Client ajouté", ui: (
    <WorkflowStepUI label="Fiche" detail="Historique enrichi" />
  ) },
  { icon: Sparkles, label: "Suggestion IA", detail: "Action IA proposée", ui: (
    <WorkflowStepUI label="IA" detail="Relance suggérée" variant="ai" />
  ), featured: true },
  { icon: MessageSquare, label: "Campagne / Avis", detail: "Message prêt", ui: (
    <div className="zg-mini-ui space-y-2 rounded-xl p-2 text-left">
      <WorkflowStepUI label="Message" detail="Prêt à valider" variant="ai" />
      <WorkflowStepUI label="Avis" detail="Avis demandé" />
    </div>
  ) },
  { icon: RefreshCw, label: "Retour", detail: "Client qui revient", ui: (
    <WorkflowStepUI label="Résultat" detail="Nouvelle réservation" variant="success" />
  ) },
];

export function WorkflowSection() {
  return (
    <Section id="workflow" className="relative overflow-hidden">
      <SectionAmbient />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="ZenGrow transforme chaque interaction en action."
            subtitle="La plateforme capte les réservations, construit votre base clients et utilise l'IA pour proposer les bonnes actions au bon moment."
          />
        </ScrollReveal>

        <div className="zg-workflow-track relative mt-16">
          <div className="zg-workflow-line hidden lg:block" aria-hidden />
          <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:pb-0">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.label} delay={i * 0.05} className="min-w-[200px] shrink-0 lg:min-w-0">
                <PremiumCard
                  glow={step.featured}
                  featured={step.featured}
                  depth
                  className="relative flex h-full flex-col items-center p-4 text-center lg:p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/25">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <p className="zg-display mt-3 text-sm font-bold text-white">{step.label}</p>
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
