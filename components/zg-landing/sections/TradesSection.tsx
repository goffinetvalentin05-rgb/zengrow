import { Container, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const TRADES = [
  { emoji: "🏊", title: "Piscinistes", text: "Hivernage, remise en route, entretien annuel." },
  { emoji: "🔥", title: "Chauffagistes", text: "Contrôle, entretien, maintenance." },
  { emoji: "♨️", title: "Pompes à chaleur", text: "Suivi annuel ou bisannuel." },
  { emoji: "🦷", title: "Dentistes", text: "Contrôles 6 ou 12 mois, rappels automatiques." },
  { emoji: "🔧", title: "Maintenance", text: "Alarmes, portails, ventilation, installations techniques." },
];

export function TradesSection() {
  return (
    <Section id="pour-qui" className="zg-zone-glass">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="zg-title-section">
              Fait pour les métiers où les clients doivent revenir.
            </h2>
          </div>
        </ScrollReveal>

        <div className="zg-scene-3d">
          <div className="zg-scene-3d__grid zg-scene-3d__grid--trades">
            {TRADES.map((trade, i) => (
              <ScrollReveal key={trade.title} delay={i * 0.06}>
                <article className="zg-glass-3d">
                  <div className="zg-glass-3d__inner">
                    <div className="zg-glass-3d__shine" aria-hidden />
                    <div className="zg-glass-3d__visual" style={{ height: "120px" }}>
                      <div className="zg-glass-3d__visual-glow" />
                      <span className="zg-glass-3d__emoji" aria-hidden>
                        {trade.emoji}
                      </span>
                    </div>
                    <div className="zg-glass-3d__body">
                      <h3 className="zg-glass-3d__title">{trade.title}</h3>
                      <p className="zg-glass-3d__text">{trade.text}</p>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
