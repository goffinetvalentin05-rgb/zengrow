import { Brain, Clock, Heart, TrendingUp, Zap } from "lucide-react";
import { Container, Section } from "../ui";

const BENEFITS = [
  { icon: Clock, label: "Gagnez du temps" },
  { icon: Brain, label: "Réduisez la charge mentale" },
  { icon: Zap, label: "Relancez au bon moment" },
  { icon: TrendingUp, label: "Récupérez du chiffre d'affaires" },
  { icon: Heart, label: "Gardez une relation client active" },
];

export function BenefitsSection() {
  const items = [...BENEFITS, ...BENEFITS];

  return (
    <Section id="benefices" className="zg-zone-glass !py-12">
      <Container>
        <div className="zg-benefits-marquee">
          <div className="zg-benefits-marquee__track">
            {items.map((benefit, i) => (
              <span key={`${benefit.label}-${i}`} className="zg-benefit-chip">
                <benefit.icon className="h-4 w-4" strokeWidth={2} />
                {benefit.label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
