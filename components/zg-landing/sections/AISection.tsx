"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { AICampaignReadyCard } from "../scenarios";
import { BlockHeader, Container, PremiumCard, Section, SectionAmbient } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const PROMPTS = [
  {
    user: "Je veux remplir mardi soir.",
    ai: "Action proposée : campagne ciblée sur 18 clients du quartier avec créneau mardi 19h–21h et message court d'invitation.",
  },
  {
    user: "Quels clients relancer cette semaine ?",
    ai: "Action proposée : relancer les clients venus dans les 45 derniers jours avec un message personnalisé et lien de réservation.",
  },
  {
    user: "Prépare une campagne pour le nouveau menu.",
    ai: "Brouillon prêt pour votre base fidèle : objet, texte court et bouton « Réserver » — à valider avant envoi.",
  },
  {
    user: "Demande un avis aux clients récents.",
    ai: "12 visites éligibles depuis lundi. Séquence automatique post-repas proposée pour jeudi 10h.",
  },
];

export function AISection() {
  const [active, setActive] = useState(0);
  const current = PROMPTS[active];

  return (
    <Section id="ia" className="relative overflow-hidden">
      <SectionAmbient variant="violet" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Une IA qui propose des actions concrètes."
            subtitle="Pas besoin de savoir faire du marketing. ZenGrow vous aide à savoir quoi envoyer, à qui, et quand."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <ScrollReveal>
            <div className="space-y-2">
              {PROMPTS.map((p, i) => (
                <button
                  key={p.user}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`zg-ai-prompt w-full text-left text-sm ${active === i ? "zg-ai-prompt--active" : ""}`}
                >
                  {p.user}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <PremiumCard glow featured depth className="overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500">
                  <Bot className="h-5 w-5 text-white" />
                </span>
                <p className="font-semibold text-white">Réponse IA</p>
              </div>
              <div className="space-y-3 p-5">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[#9b8fb8]">
                  {current.user}
                </div>
                <div className="rounded-xl border border-cyan-400/25 bg-gradient-to-br from-violet-500/12 to-cyan-500/8 px-4 py-4 text-sm leading-relaxed text-white">
                  {current.ai}
                  <span className="zg-ai-cursor" aria-hidden />
                </div>
                <AICampaignReadyCard />
              </div>
            </PremiumCard>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
