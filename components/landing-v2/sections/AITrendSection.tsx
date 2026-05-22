import { Sparkles } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-v2/ui";

export function AITrendSection() {
  return (
    <Section id="tendance">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,158,255,0.28)] bg-[rgba(43,140,255,0.1)] px-3 py-1 text-xs font-medium text-[#5EB3FF]">
              <Sparkles className="size-3.5" aria-hidden />
              IA · Restaurants
            </span>
            <h2 className="zg-section-title mt-5">
              Les entreprises passent à l&apos;IA. Votre restaurant aussi peut prendre de l&apos;avance.
            </h2>
            <p className="zg-section-lead">
              ZenGrow rend l&apos;IA simple et utile pour les restaurants : relancer les anciens clients,
              préparer des campagnes, récolter plus d&apos;avis Google et transformer plus de visiteurs en
              réservations.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#8BA3C7] sm:text-base">
              Pas besoin d&apos;un outil compliqué. ZenGrow transforme l&apos;IA en actions concrètes pour
              remplir vos tables plus souvent.
            </p>
          </div>

          <div className="zg-card zg-card--glow p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EB3FF]">
              Prise d&apos;avance
            </p>
            <ol className="mt-6 space-y-3">
              {["Visiteur découvre", "Réservation", "Client qui revient"].map((step, i) => (
                <li
                  key={step}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                    i === 2
                      ? "border-[rgba(43,140,255,0.35)] bg-[rgba(43,140,255,0.1)] text-[#EEF6FF]"
                      : "border-[rgba(255,255,255,0.06)] text-[#8BA3C7]"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 2 ? "bg-[#2B8CFF] text-white" : "bg-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
