"use client";

import Link from "next/link";
import { Reveal } from "@/components/sections/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Combien de temps pour mettre en place ma page ?",
    a: "48h en moyenne. On crée ta page, on l'optimise, et elle est en ligne. Tu peux commencer à recevoir des réservations dès la fin de semaine.",
  },
  {
    q: "Est-ce compatible avec mon site existant ?",
    a: "Oui. Tu peux soit utiliser ZenGrow comme ta page principale, soit l'utiliser uniquement comme page de réservation liée depuis ton site actuel.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Aucun. Mensuel, sans engagement, résiliable à tout moment depuis ton dashboard.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Deux formules : Starter à 49 CHF/mois et Pro à 69 CHF/mois TTC, prélevées chaque mois via Stripe après ton essai. Pas de frais cachés, pas de commission sur tes réservations.",
  },
  {
    q: "Puis-je personnaliser ma page ?",
    a: "Totalement. Photos, couleurs, textes, menu, horaires. Et on t'accompagne dans la mise en place.",
  },
  {
    q: "Le support est-il en français ?",
    a: "Oui, support 100% français par mail et téléphone, depuis la Suisse.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(255,107,44,0.08),transparent)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Tout ce que tu dois savoir{" "}
            <em className="italic text-landing-accent">avant de te lancer</em>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="pt-3 text-sm leading-relaxed text-landing-fg/90">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
        <Reveal delay={0.12} className="mt-10 flex justify-center">
          <Link
            href="mailto:contact@zengrow.ch"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-landing-border bg-landing-card px-6 text-sm font-semibold text-landing-fg transition hover:border-landing-accent/45"
          >
            Nous contacter
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
