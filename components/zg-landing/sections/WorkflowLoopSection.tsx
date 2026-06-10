"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { Container } from "../ui";
import "@/components/zg-landing/workflow-loop.css";

const STEPS = [
  { id: 1, label: "Client ajouté", content: "client" as const },
  { id: 2, label: "Fréquence définie", content: "frequency" as const },
  { id: 3, label: "Relance envoyée", content: "sms" as const },
  { id: 4, label: "Créneau choisi", content: "slots" as const },
  { id: 5, label: "Rendez-vous confirmé", content: "confirm" as const },
  { id: 6, label: "Ajouté à l'agenda", content: "calendar" as const },
];

const STEP_MS = 2800;

function StepVisual({ type, active }: { type: (typeof STEPS)[number]["content"]; active: boolean }) {
  switch (type) {
    case "client":
      return (
        <div className="zg-loop-client">
          <div className="zg-loop-client__avatar">MD</div>
          <p className="zg-loop-client__name">Marc Dubois</p>
          <p className="zg-loop-client__service">Entretien piscine</p>
          {active && <span className="zg-loop-client__tag">Ajouté ✓</span>}
        </div>
      );
    case "frequency":
      return (
        <div className="zg-loop-frequency">
          <div className="zg-loop-odometer" aria-hidden>
            <span className="zg-loop-odometer__digit">1</span>
            <span className="zg-loop-odometer__digit zg-loop-odometer__digit--active">2</span>
          </div>
          <p className="zg-loop-frequency__unit">mois</p>
        </div>
      );
    case "sms":
      return (
        <div className="zg-loop-phone">
          <div className="zg-loop-phone__notch" />
          <div className="zg-loop-phone__screen">
            <div className={`zg-loop-sms${active ? " zg-loop-sms--in" : ""}`}>
              Bonjour Marc, il est temps de planifier votre entretien annuel.
            </div>
          </div>
        </div>
      );
    case "slots":
      return (
        <div className="zg-loop-phone">
          <div className="zg-loop-phone__notch" />
          <div className="zg-loop-phone__screen">
            <div className="zg-loop-slots">
              {["Lun", "Mar", "Mer", "Jeu"].map((d, i) => (
                <div key={d} className={`zg-loop-slot${i === 1 && active ? " zg-loop-slot--selected" : ""}`}>
                  {d}
                  <span>{i === 1 ? "10h" : "14h"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "confirm":
      return (
        <div className="zg-loop-phone">
          <div className="zg-loop-phone__notch" />
          <div className="zg-loop-phone__screen">
            <div className="zg-loop-confirm">
              <div className={`zg-loop-confirm__icon${active ? " zg-loop-confirm__icon--pop" : ""}`}>
                <Check className="h-5 w-5 text-white" strokeWidth={3} />
              </div>
              <p className="zg-loop-confirm__text">Confirmé !</p>
            </div>
          </div>
        </div>
      );
    case "calendar":
      return (
        <div className="zg-loop-calendar">
          <div className="zg-loop-calendar__head">
            <span>Juin</span>
            <span className="text-sky-400">+1</span>
          </div>
          <div className="zg-loop-calendar__grid">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`zg-loop-calendar__day${i === 7 && active ? " zg-loop-calendar__day--event" : ""}`}
              >
                {i + 10}
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export function WorkflowLoopSection() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setInterval(() => setActive((p) => (p + 1) % STEPS.length), STEP_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section id="workflow" className="zg-loop-section" aria-label="Le cycle ZenGrow">
      <Container>
        <div className="zg-loop-ribbon">
          <div className="zg-loop-ribbon__line" aria-hidden />
          {STEPS.map((step, i) => {
            const isActive = active === i;
            const isPast = active > i;
            return (
              <motion.div
                key={step.id}
                className={`zg-loop-node${isActive ? " zg-loop-node--active" : ""}${isPast ? " zg-loop-node--past" : ""}`}
                animate={
                  reduce
                    ? undefined
                    : {
                        y: isActive ? -8 : 0,
                        scale: isActive ? 1.04 : 1,
                      }
                }
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="zg-loop-node__badge">
                  <span className="zg-loop-node__num">{step.id}</span>
                  <span className="zg-loop-node__label">{step.label}</span>
                </div>
                <div className="zg-loop-node__card">
                  <StepVisual type={step.content} active={isActive} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="zg-loop-return">
          <svg className="zg-loop-return__arc" viewBox="0 0 400 56" fill="none" aria-hidden>
            <path d="M 16 44 Q 200 0 384 44" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="5 5" />
            <polygon points="8,40 16,44 8,48" fill="rgba(147,197,253,0.6)" />
          </svg>
          <p className="zg-loop-return__label">
            <RefreshCw className="h-4 w-4" aria-hidden />
            La boucle recommence
          </p>
        </div>
      </Container>
    </section>
  );
}
