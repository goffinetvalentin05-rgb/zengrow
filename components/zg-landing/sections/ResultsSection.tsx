"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, TrendingUp, Users } from "lucide-react";
import {
  BlockHeader,
  Container,
  PremiumCard,
  Section,
  SectionAmbient,
} from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const CHART_POINTS = "0,128 72,122 144,112 216,92 288,68 360,42";
const CHART_AREA = `M0,128 L72,122 L144,112 L216,92 L288,68 L360,42 L360,140 L0,140 Z`;

const FLOW_STEPS = ["Clients relancés", "Clients revenus", "Revenus supplémentaires"] as const;

const INDICATORS = [
  { label: "Clients revenus", hint: "En hausse", icon: Users },
  { label: "Revenus supplémentaires", hint: "Récupéré", icon: TrendingUp },
] as const;

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function ResultsSection() {
  const { ref, inView } = useInView();

  return (
    <Section id="resultats" className="relative overflow-hidden">
      <SectionAmbient variant="cyan" />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Plus de clients qui reviennent. Plus de revenus."
            subtitle="ZenGrow aide votre restaurant à récupérer les clients qui auraient peut-être disparu — et chaque retour peut générer du chiffre d'affaires supplémentaire."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div ref={ref} className="mx-auto mt-14 max-w-3xl">
            <PremiumCard glow featured depth className="overflow-hidden p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/90">Chiffre d&apos;affaires récupéré</p>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-emerald-200">
                  Progression
                </span>
              </div>

              <div className="zg-results-chart mt-8">
                <svg viewBox="0 0 360 140" className="h-auto w-full" aria-hidden>
                  <defs>
                    <linearGradient id="zg-results-line" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="zg-results-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.22)" />
                      <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d={CHART_AREA}
                    fill="url(#zg-results-fill)"
                    className={inView ? "zg-results-chart__area" : "opacity-0"}
                  />
                  <polyline
                    points={CHART_POINTS}
                    fill="none"
                    stroke="url(#zg-results-line)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={inView ? "zg-results-chart__line" : "opacity-0"}
                  />
                </svg>
              </div>

              <div
                className={`zg-results-flow mt-6 ${inView ? "zg-results-flow--active" : ""}`}
                aria-hidden
              >
                {FLOW_STEPS.map((step, i) => (
                  <span key={step} className="zg-results-flow__item">
                    <span className="zg-results-flow__label">{step}</span>
                    {i < FLOW_STEPS.length - 1 ? (
                      <ArrowRight className="zg-results-flow__arrow h-3.5 w-3.5 shrink-0" />
                    ) : null}
                  </span>
                ))}
              </div>

              <div className="zg-results-indicators mt-8 border-t border-white/[0.06] pt-6">
                {INDICATORS.map(({ label, hint, icon: Icon }) => (
                  <div key={label} className="zg-results-indicator">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200/90 ring-1 ring-violet-400/20">
                      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white/90">{label}</p>
                      <p className="text-xs text-[#9b8fb8]">{hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
