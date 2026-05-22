import {
  BlockHeader,
  Container,
  PremiumCard,
  Section,
  SectionAmbient,
} from "../ui";
import {
  MiniCalendar,
  MiniCampaignEditor,
  MiniClientList,
  MiniReviewTimeline,
  MiniSuggestion,
} from "../visuals";
import { ScrollReveal } from "../ScrollReveal";

const ITEMS = [
  {
    title: "Réservations en ligne",
    text: "Recevez des demandes depuis une page claire et adaptée au mobile.",
    visual: <MiniCalendar />,
    className: "zg-pm-7 zg-pm-row2 zg-pm-overlap-a",
  },
  {
    title: "Base clients",
    text: "Gardez une trace des clients, visites et habitudes.",
    visual: <MiniClientList />,
    className: "zg-pm-5 zg-pm-overlap-b",
  },
  {
    title: "Relances IA",
    text: "Sachez qui relancer et avec quel message.",
    visual: <MiniClientList />,
    className: "zg-pm-4",
  },
  {
    title: "Campagnes marketing",
    text: "Annoncez un menu, un événement ou une soirée à remplir.",
    visual: <MiniCampaignEditor />,
    className: "zg-pm-4 zg-pm-overlap-c",
  },
  {
    title: "Avis Google",
    text: "Demandez automatiquement un avis après une visite.",
    visual: <MiniReviewTimeline />,
    className: "zg-pm-4",
  },
  {
    title: "Suggestions intelligentes",
    text: "Recevez des idées d'actions concrètes.",
    visual: <MiniSuggestion />,
    className: "zg-pm-8",
  },
];

export function PlatformSection() {
  return (
    <Section id="plateforme" className="relative overflow-hidden">
      <SectionAmbient variant="cyan" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Tout ce qu'il faut pour remplir plus régulièrement."
            subtitle="Une plateforme simple pour gérer les réservations, relancer les clients, lancer des campagnes et développer vos avis Google."
          />
        </ScrollReveal>

        <div className="zg-platform-mosaic relative mt-16">
          {ITEMS.map((item, i) => (
            <ScrollReveal key={item.title} delay={(i % 3) * 0.05} className={item.className}>
              <PremiumCard depth hover className="flex h-full min-h-[220px] flex-col p-5 md:p-6">
                <h3 className="zg-display text-base font-bold text-white md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[#9b8fb8] md:text-sm">{item.text}</p>
                <div className="mt-4 flex-1">{item.visual}</div>
              </PremiumCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
