import { Eye, MessageCircleOff, StarOff } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

const items = [
  {
    icon: Eye,
    title: "Visiteurs qui hésitent",
    text: "Ils découvrent votre restaurant sans passer à la réservation.",
  },
  {
    icon: MessageCircleOff,
    title: "Anciens clients oubliés",
    text: "Des clients satisfaits ne reviennent pas sans relance.",
  },
  {
    icon: StarOff,
    title: "Avis jamais demandés",
    text: "La confiance en ligne reste faible avant la réservation.",
  },
] as const;

export function ProblemSection() {
  return (
    <Section id="probleme">
      <Container>
        <SectionHeader
          title="Des clients vous découvrent… mais ne réservent pas toujours."
          subtitle="Entre les visiteurs qui hésitent, les anciens clients qui vous oublient et les avis Google jamais demandés, votre restaurant laisse passer des opportunités chaque semaine."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={item.title}
              className={`zg-card p-6 ${i === 1 ? "sm:mt-6" : ""}`}
            >
              <div className="flex size-11 items-center justify-center rounded-xl border border-[rgba(59,158,255,0.22)] bg-[rgba(43,140,255,0.1)] text-[#5EB3FF]">
                <item.icon className="size-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-instrument-serif)] text-xl text-[#EEF6FF]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8BA3C7]">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
