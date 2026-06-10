import { Container, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const STEPS = [
  {
    num: "01",
    title: "Ajoutez vos clients",
    text: "Nom, service, dernière intervention et fréquence de retour.",
    visual: "add" as const,
  },
  {
    num: "02",
    title: "ZenGrow attend",
    text: "Nous recontactons automatiquement vos clients au bon moment.",
    visual: "wait" as const,
  },
  {
    num: "03",
    title: "Le rendez-vous revient",
    text: "Le client choisit son créneau et le rendez-vous apparaît dans votre agenda.",
    visual: "wave" as const,
  },
];

function StepVisual({ type }: { type: (typeof STEPS)[number]["visual"] }) {
  if (type === "add") {
    return (
      <>
        <div className="zg-glass-3d__visual-glow" />
        <div className="zg-g3d-mini-card">
          <span className="zg-g3d-mini-card__dot" />
          Marc Dubois
        </div>
      </>
    );
  }
  if (type === "wait") {
    return (
      <>
        <div className="zg-glass-3d__visual-glow" />
        <div style={{ textAlign: "center" }}>
          <div className="zg-g3d-odometer">
            <span>1</span>
            <span className="zg-g3d-odometer__active">2</span>
            <span>3</span>
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "rgb(147 197 253 / 0.8)" }}>
            mois
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="zg-glass-3d__visual-glow" />
      <div className="zg-g3d-waveform" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </>
  );
}

export function HowItWorksSection() {
  return (
    <Section id="fonctionnement" className="zg-zone-glass">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="zg-title-section">Comment ça fonctionne ?</h2>
          </div>
        </ScrollReveal>

        <div className="zg-scene-3d">
          <div className="zg-scene-3d__grid zg-scene-3d__grid--3">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.1}>
                <article className="zg-glass-3d">
                  <div className="zg-glass-3d__inner">
                    <span className="zg-glass-3d__step-num" aria-hidden>
                      {step.num}
                    </span>
                    <div className="zg-glass-3d__shine" aria-hidden />
                    <div className="zg-glass-3d__visual">
                      <StepVisual type={step.visual} />
                    </div>
                    <div className="zg-glass-3d__body">
                      <h3 className="zg-glass-3d__title">{step.title}</h3>
                      <p className="zg-glass-3d__text">{step.text}</p>
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
