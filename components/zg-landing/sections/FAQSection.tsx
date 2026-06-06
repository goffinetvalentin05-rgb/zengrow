"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { BlockHeader, Container, PremiumCard, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const FAQ = [
  {
    q: "ZenGrow, c'est quoi exactement ?",
    a: "Un outil simple qui fait revenir vos clients : vous ajoutez leurs numéros, ZenGrow demande des avis Google et relance automatiquement ceux qui ne reviennent plus.",
  },
  {
    q: "Comment l'IA aide concrètement ?",
    a: "Elle détecte les clients qui ne reviennent plus, rédige les messages de relance et programme les demandes d'avis Google — au bon moment, sans effort de votre part.",
  },
  {
    q: "Est-ce que je garde le contrôle ?",
    a: "Oui. L'IA propose, vous validez et modifiez les messages avant envoi.",
  },
  {
    q: "Mes clients doivent-ils télécharger une application ?",
    a: "Non. Ils reçoivent un simple SMS avec un lien.",
  },
  {
    q: "Est-ce compliqué à mettre en place ?",
    a: "Non. Ajoutez un numéro de client, c'est tout. ZenGrow s'occupe du reste.",
  },
];

export function FAQSection() {
  return (
    <Section id="faq" className="!pb-16">
      <Container>
        <ScrollReveal>
          <BlockHeader title="Questions fréquentes" />
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <PremiumCard className="mx-auto mt-10 max-w-xl p-1">
            <Accordion.Root type="single" collapsible>
              {FAQ.map((item) => (
                <Accordion.Item
                  key={item.q}
                  value={item.q}
                  className="zg-faq-item border-b border-white/6 px-4 last:border-0"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm font-semibold text-white">
                      {item.q}
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#9b8fb8] transition group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <p className="pb-3 text-sm text-[#9b8fb8]">{item.a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </PremiumCard>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
