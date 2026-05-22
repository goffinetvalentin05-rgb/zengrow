"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const FAQ_ITEMS = [
  {
    q: "Est-ce que ZenGrow est seulement un outil de réservation ?",
    a: "Non. La réservation fait partie de ZenGrow, mais le vrai objectif est plus large : vous aider à faire revenir vos clients, créer des campagnes, automatiser vos avis Google et remplir vos tables plus régulièrement.",
  },
  {
    q: "Comment l'IA aide concrètement mon restaurant ?",
    a: "L'IA vous aide à trouver des idées de campagnes, écrire des messages, identifier les clients à relancer et proposer des actions simples pour générer plus de réservations.",
  },
  {
    q: "Est-ce que je dois savoir utiliser l'IA ?",
    a: "Non. ZenGrow est pensé pour être simple. Vous n'avez pas besoin de savoir utiliser ChatGPT ou un autre outil. L'IA est directement intégrée dans la plateforme.",
  },
  {
    q: "Est-ce que ZenGrow peut m'aider à avoir plus d'avis Google ?",
    a: "Oui. Après une visite confirmée, ZenGrow peut envoyer automatiquement une demande d'avis à vos clients.",
  },
  {
    q: "Est-ce que je garde le contrôle sur les messages ?",
    a: "Oui. ZenGrow peut proposer ou générer des messages, mais vous pouvez toujours les modifier, les valider et décider quand les envoyer.",
  },
  {
    q: "Est-ce que ZenGrow peut faire revenir mes anciens clients ?",
    a: "Oui. C'est l'un des objectifs principaux. ZenGrow vous aide à identifier les clients à relancer et à créer des messages adaptés pour leur donner envie de revenir.",
  },
  {
    q: "Est-ce que mes clients doivent télécharger une application ?",
    a: "Non. Vos clients n'ont rien à télécharger. Ils peuvent réserver ou interagir depuis un simple lien.",
  },
  {
    q: "Est-ce que ZenGrow est compliqué à mettre en place ?",
    a: "Non. Vous configurez votre restaurant, vos informations, vos réservations et vos préférences. Ensuite, ZenGrow vous aide à exploiter vos clients plus intelligemment.",
  },
] as const;

export function FAQSection() {
  return (
    <Section id="faq" className="relative">
      <Container>
        <ScrollReveal>
          <SectionHeader badge="FAQ" title="Questions fréquentes" />
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="mx-auto mt-12 max-w-3xl">
          <Accordion.Root type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <Accordion.Item
                key={item.q}
                value={`item-${i}`}
                className="zg-lp-faq-item zg-lp-body"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-[var(--zg-fg)] transition-colors hover:text-violet-200">
                    {item.q}
                    <ChevronDown className="size-4 shrink-0 text-[var(--zg-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--zg-muted)]">{item.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
