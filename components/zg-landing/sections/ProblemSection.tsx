import { Container, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const CARDS = [
  {
    visual: "time" as const,
    title: "Le suivi prend du temps",
    text: "Chaque intervention crée une future relance à planifier.",
  },
  {
    visual: "repeat" as const,
    title: "Les relances sont répétitives",
    text: "Même message, mêmes étapes, encore et encore.",
  },
  {
    visual: "auto" as const,
    title: "ZenGrow l'automatise",
    text: "Le bon message, au bon moment, sans que vous ayez à y penser.",
    featured: true,
  },
];

function ProblemVisual({ type, index }: { type: (typeof CARDS)[number]["visual"]; index: number }) {
  const gradId = `zg-ring-grad-${index}`;
  if (type === "time") {
    return (
      <>
        <div className="zg-glass-3d__visual-glow" />
        <div className="zg-g3d-ring">
          <svg className="zg-g3d-ring__svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <circle className="zg-g3d-ring__track" cx="50" cy="50" r="40" />
            <circle className="zg-g3d-ring__fill" cx="50" cy="50" r="40" stroke={`url(#${gradId})`} />
          </svg>
          <div className="zg-g3d-ring__center">
            63%
            <span>Suivi</span>
          </div>
        </div>
      </>
    );
  }
  if (type === "repeat") {
    return (
      <>
        <div className="zg-glass-3d__visual-glow" />
        <div className="zg-g3d-bubbles">
          <div className="zg-g3d-bubble zg-g3d-bubble--1">Bonjour Marc…</div>
          <div className="zg-g3d-bubble zg-g3d-bubble--2">Bonjour Marc…</div>
          <div className="zg-g3d-bubble zg-g3d-bubble--3">Bonjour Marc…</div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="zg-glass-3d__visual-glow" />
      <div className="zg-g3d-bolt">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
      </div>
    </>
  );
}

export function ProblemSection() {
  return (
    <Section id="probleme" className="zg-zone-glass">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="zg-title-section">Pourquoi les relances prennent du temps ?</h2>
          </div>
        </ScrollReveal>

        <div className="zg-scene-3d">
          <div className="zg-scene-3d__grid zg-scene-3d__grid--3">
            {CARDS.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.08}>
                <article className={`zg-glass-3d${card.featured ? " zg-glass-3d--featured" : ""}`}>
                  <div className="zg-glass-3d__inner">
                    <div className="zg-glass-3d__shine" aria-hidden />
                    <div className="zg-glass-3d__visual">
                      <ProblemVisual type={card.visual} index={i} />
                    </div>
                    <div className="zg-glass-3d__body">
                      <h3 className="zg-glass-3d__title">{card.title}</h3>
                      <p className="zg-glass-3d__text">{card.text}</p>
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
