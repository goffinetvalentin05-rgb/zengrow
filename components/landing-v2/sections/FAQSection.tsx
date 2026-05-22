import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

const faqs = [
  {
    q: "ZenGrow est-il seulement un outil de réservation ?",
    a: "Non. ZenGrow combine page de réservation, relances IA, campagnes marketing et avis Google.",
  },
  {
    q: "Est-ce que ZenGrow peut remplacer mon site ?",
    a: "Oui. ZenGrow peut servir de page principale pour votre restaurant ou compléter votre site actuel avec une page pensée pour convertir.",
  },
  {
    q: "L'IA envoie-t-elle les messages automatiquement ?",
    a: "Non. ZenGrow prépare les messages, mais vous gardez toujours la validation avant l'envoi.",
  },
  {
    q: "Pourquoi les avis Google sont importants ?",
    a: "Parce qu'ils rassurent les futurs clients. Une meilleure réputation en ligne peut aider votre restaurant à inspirer plus de confiance avant la réservation.",
  },
  {
    q: "Est-ce adapté à un petit restaurant ?",
    a: "Oui. ZenGrow est pensé pour être simple, rapide à mettre en place et utile même pour un restaurant indépendant.",
  },
  {
    q: "Puis-je personnaliser ma page ?",
    a: "Oui. Vous pouvez modifier vos textes, photos, horaires, menu, couleurs et informations.",
  },
] as const;

export function FAQSection() {
  return (
    <Section id="faq">
      <Container>
        <SectionHeader title="Questions fréquentes" />

        <div className="zg-faq zg-card mx-auto mt-12 max-w-3xl px-5 sm:px-8">
          {faqs.map((item) => (
            <details key={item.q} className="group">
              <summary className="text-base font-medium text-[#EEF6FF]">{item.q}</summary>
              <p className="pb-5 text-sm leading-relaxed text-[#8BA3C7]">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
