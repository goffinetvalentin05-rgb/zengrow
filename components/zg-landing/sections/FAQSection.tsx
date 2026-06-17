"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Container, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const FAQ = [
  {
    q: "ZenGrow, c'est quoi exactement ?",
    a: "Un outil simple qui automatise le retour de vos clients récurrents : vous ajoutez un client et une fréquence, ZenGrow le recontacte au bon moment pour planifier le prochain rendez-vous.",
  },
  {
    q: "Est-ce un CRM ou un logiciel de gestion ?",
    a: "Non. ZenGrow ne remplace pas votre CRM ni votre logiciel métier. Il fait une seule chose : automatiser les relances et la prise de rendez-vous pour vos clients récurrents.",
  },
  {
    q: "Comment le client prend-il rendez-vous ?",
    a: "Il reçoit un SMS au bon moment avec un lien pour choisir un créneau disponible. Une fois confirmé, le rendez-vous apparaît dans votre agenda.",
  },
  {
    q: "Mes clients doivent-ils télécharger une application ?",
    a: "Non. Tout se fait par SMS et navigateur web, sans installation.",
  },
  {
    q: "Est-ce compliqué à mettre en place ?",
    a: "Non. Ajoutez vos clients avec leur fréquence de retour, c'est tout. La configuration prend quelques minutes.",
  },
  {
    q: "Pour quels métiers ZenGrow est-il adapté ?",
    a: "Tout métier où les clients doivent revenir régulièrement : piscinistes, chauffagistes, installateurs, dentistes, techniciens de maintenance, etc.",
  },
];

export function FAQSection() {
  return (
    <Section id="faq" className="zg-zone-end zg-zone-end--light !pb-20">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="zg-title-section zg-zone-end__title">Questions fréquentes</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="zg-faq-card mx-auto mt-10 max-w-2xl">
            <Accordion.Root type="single" collapsible className="relative p-1">
              {FAQ.map((item) => (
                <Accordion.Item
                  key={item.q}
                  value={item.q}
                  className="border-b border-slate-200/80 px-4 last:border-0"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-slate-800">
                      {item.q}
                      <ChevronDown className="h-4 w-4 shrink-0 text-blue-500 transition group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
